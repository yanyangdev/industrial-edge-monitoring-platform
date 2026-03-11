import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  UserTokenType,
  AttributeIds,
  ClientSubscription,
  TimestampsToReturn,
  DataValue,
  StatusCodes,
  ClientMonitoredItemGroup,
  type ReadValueIdOptions,
  type MonitoringParametersOptions,
  type ClientMonitoredItemBase,
} from "node-opcua-client";
import "dotenv/config";
import { config } from "../../config/index.ts";
import type {
  SecurityModeString,
  SecurityPolicyString,
  Key,
} from "../../config/index.ts";
import type { OpcSnapshot, OpcUaValue } from "./types.ts";
import { logger } from "../../logger/index.ts";
import { AppError } from "../../errors/AppError.ts";
import { HealthReport } from "../health/HealthReporter.ts";
import { publishMachineData } from "../publishMachineData.ts";
import { normalizeOpcSnapshot } from "./normalizer.ts";
import { mqttConfig } from "../../config/mqtt.ts";

const securityModeMap: Record<SecurityModeString, MessageSecurityMode> = {
  None: MessageSecurityMode.None,
  Sign: MessageSecurityMode.Sign,
  SignAndEncrypt: MessageSecurityMode.SignAndEncrypt,
};

const securityPolicyMap: Record<SecurityPolicyString, SecurityPolicy> = {
  None: SecurityPolicy.None,
  Basic256Sha256: SecurityPolicy.Basic256Sha256,
  Aes128_Sha256_RsaOaep: SecurityPolicy.Aes128_Sha256_RsaOaep,
  Aes256_Sha256_RsaPss: SecurityPolicy.Aes256_Sha256_RsaPss,
};

export class OpcuaEdgeService {
  private client = OPCUAClient.create({
    endpointMustExist: true,
    securityMode: securityModeMap[config.opcua.security.mode],
    securityPolicy: securityPolicyMap[config.opcua.security.policy],
    // 工业常用环境, SDK自己尝试重连
    keepSessionAlive: true,
    connectionStrategy: {
      initialDelay: config.reconnect.baseDelayMs,
      maxDelay: config.reconnect.maxDelayMs,
      maxRetry: config.reconnect.maxRetry,
    },
  });

  private state: {
    session: any | null;
    subscription: ClientSubscription | null;
    emitTimer: NodeJS.Timeout | null;
    monitoredGroup: ClientMonitoredItemGroup | null;
  } = {
    session: null,
    subscription: null,
    emitTimer: null,
    monitoredGroup: null,
  };

  private latest: OpcSnapshot = {
    Temperature: {
      value: null,
      quality: "Unknown",
      statusCode: "Unknown",
      stale: false,
    },
    Vibration: {
      value: null,
      quality: "Unknown",
      statusCode: "Unknown",
      stale: false,
    },
    Status: {
      value: null,
      quality: "Unknown",
      statusCode: "Unknown",
      stale: false,
    },
    Error: {
      value: null,
      quality: "Unknown",
      statusCode: "Unknown",
      stale: false,
    },
  };

  private dirty = false;
  private latestDataTs: string | null = null;
  private badCount = 0;

  private healthReport: HealthReport | null = null;
  private connected = false;

  private stopping = false;
  private rebuilding = false;
  private rebuildAttempt = 0;
  private rebuildTimer: NodeJS.Timeout | null = null;

  async start() {
    this.attachClientEvents();
    // health report
    this.healthReport = new HealthReport("edge-opcua", 5000, () => ({
      opcua: {
        connected: this.connected,
        hasSession: !!this.state.session,
        hasSubscription: !!this.state.subscription,
        badCount: this.badCount,
        ...(this.state.subscription?.subscriptionId !== undefined
          ? { subscriptionId: this.state.subscription.subscriptionId }
          : {}),
        ...(this.latestDataTs ? { lastDataTs: this.latestDataTs } : {}),
      },
    }));
    this.healthReport.start();

    this.state.emitTimer = setInterval(() => {
      if (!this.dirty) return;

      const now = Date.now();
      const enrich = <T>(p: OpcUaValue<T>): OpcUaValue<T> => {
        const ageMs = p.sourceTimestamp
          ? now - p.sourceTimestamp.getTime()
          : null;
        const stale = ageMs !== null ? ageMs > 3000 : true;
        return { ...p, ageMs, stale };
      };

      const dataWithAge: OpcSnapshot = {
        Temperature: enrich(this.latest.Temperature),
        Vibration: enrich(this.latest.Vibration),
        Status: enrich(this.latest.Status),
        Error: enrich(this.latest.Error),
      };
      const ts = new Date().toISOString();
      logger.info(
        { ts, data: normalizeOpcSnapshot(ts, dataWithAge, mqttConfig.machine) },
        "machine snapshot",
      );
      this.dirty = false;
    }, config.output.emitIntervalMs);

    await this.buildPipeline("start");

    logger.info("OPCUA edge service started");
  }
  async stop() {
    logger.info("OPCUA edge service stopping...");

    if (this.rebuildTimer) {
      clearTimeout(this.rebuildTimer);
      this.rebuildTimer = null;
    }

    if (this.state.emitTimer) {
      clearInterval(this.state.emitTimer);
      this.state.emitTimer = null;
    }

    this.healthReport?.stop();
    this.healthReport = null;
    await this.teardown("stop");

    try {
      await this.client.disconnect();
    } catch (error) {
      logger.warn({ err: error }, "client disconnect ignored");
    }
    this.connected = false;
    logger.info("OPCUA edge service stopped.");
  }
  getLatestSnapshot() {
    return this.latest;
  }

  private attachClientEvents() {
    this.client.on("connection_lost", () => {
      this.connected = false;
      logger.warn("OPCUA connection lost");
      this.state.subscription = null;
      this.state.session = null;
    });
    this.client.on("connection_reestablished", () => {
      this.connected = true;
      logger.warn("OPCUA connection reestablished");
      this.scheduleRebuild("connection_reestablished");
    });
    this.client.on("backoff", (retry: number, delay: number) => {
      logger.warn({ retry, delay }, "OPCUA backoff");
    });
  }

  private scheduleRebuild(reason: string) {
    if (this.stopping) return;
    if (this.rebuildTimer) return;

    const delayMs = Math.min(
      config.reconnect.maxDelayMs,
      config.reconnect.baseDelayMs *
        Math.pow(2, Math.max(0, this.rebuildAttempt)),
    );
    const jitter = Math.floor(Math.random() * 200); // 防止多实例同频共振
    const wait = this.rebuildAttempt === 0 ? 0 : delayMs + jitter;

    logger.warn(
      { reason, waitMs: wait, attempt: this.rebuildAttempt },
      "Schedule OPCUA rebuild",
    );

    this.rebuildTimer = setTimeout(() => {
      this.rebuildTimer = null;
      void this.rebuild(reason);
    }, wait);
  }

  // rebuild : 清理旧资源, 确保连接, 重建
  private async rebuild(reason: string) {
    if (this.stopping) return;
    if (this.rebuilding) return;

    this.rebuilding = true;
    logger.warn({ reason }, "OPCUA rebuild started");

    try {
      await this.teardown(`rebuild:${reason}`);
      await this.buildPipeline(`rebuild:${reason}`);
      this.rebuildAttempt = 0;
      logger.warn("OPCUA rebuild success");
    } catch (error) {
      this.rebuildAttempt += 1;
      this.connected = false;

      logger.error(
        { e: String(error), attempt: this.rebuildAttempt },
        "OPCUA rebuild failed",
      );
      this.scheduleRebuild("rebuild_failed");
    } finally {
      this.rebuilding = false;
    }
  }

  // pipeline: connect + session + subscription + monitored
  private async buildPipeline(reason: string) {
    logger.info({ endpoint: config.opcua.endpoint }, "OPCUA build pipeline...");
    // 1. connect
    try {
      await this.client.connect(config.opcua.endpoint);
      this.connected = true;
    } catch (error) {
      logger.warn(
        { e: String(error) },
        " Connect attempt (may already be connected)",
      );
    }
    // 2. session
    logger.info("OPCUA creating session...");
    this.state.session = await this.client.createSession({
      type: UserTokenType.UserName,
      userName: config.opcua.credentials.username,
      password: config.opcua.credentials.password,
    });
    // 3. subscription
    logger.info("OPCUA creating subscription...");
    const sub = ClientSubscription.create(this.state.session, {
      requestedPublishingInterval: config.subscription.publishingIntervalMs,
      requestedLifetimeCount: 600, // 多久没发通信就销毁
      requestedMaxKeepAliveCount: 20, // 没变化时多久发Keepalive
      maxNotificationsPerPublish: 100, // 一次最多多少通知
      publishingEnabled: true,
      priority: 10,
    });
    this.state.subscription = sub;

    // 监听subscription事件
    sub
      .on("started", () => {
        logger.info({ id: sub.subscriptionId }, "Subscription started");
      })
      .on("keepalive", () => {
        logger.debug("OPCUA keepalive");
      })
      .on("terminated", () => {
        logger.warn("OPCUA Subscription terminated");
        this.state.subscription = null;
        this.scheduleRebuild("subscription_terminated");
      });

    await this.createMonitoredItemGroup(sub);

    this.dirty = false;
    logger.info("OPCUA pipeline ready");
  }
  private async createMonitoredItemGroup(sub: ClientSubscription) {
    // throw new Error("Method not implemented.");
    // 固定顺序非常重要: index -> key
    const keys = Object.keys(config.opcua.nodeIds) as Key[];

    const itemsToMonitor: ReadValueIdOptions[] = keys.map((key) => ({
      nodeId: config.opcua.nodeIds[key],
      attributeId: AttributeIds.Value,
    }));

    const parameters: MonitoringParametersOptions = {
      samplingInterval: config.subscription.samplingIntervalMs,
      discardOldest: true,
      queueSize: config.subscription.queueSize,
    };

    // 一次性创建一组
    const group: ClientMonitoredItemGroup = await sub.monitorItems(
      itemsToMonitor,
      parameters,
      TimestampsToReturn.Both,
    );

    this.state.monitoredGroup = group;

    group
      .on("initialized", () => {
        logger.info({ count: keys.length }, "MonitoredItemGroup initialized");
      })
      .on("terminated", () => {
        logger.warn("MonitoredItemGroup terminated");
        this.state.monitoredGroup = null;
      })
      .on("err", (message: string) => {
        logger.error({ message }, "MonitoredItemGroup error");
      })
      .on(
        "changed",
        (
          monitoredItem: ClientMonitoredItemBase,
          dv: DataValue,
          index: number,
        ) => {
          const key = keys[index];
          if (!key) {
            logger.warn({ index }, "Changed event with unknown index");
            return;
          }
          const nodeId = config.opcua.nodeIds[key];

          const isGood = dv.statusCode === StatusCodes.Good;
          if (!isGood) this.badCount += 1;

          this.latest[key] = {
            ...this.latest[key],
            value: dv.value?.value,
            sourceTimestamp: dv.sourceTimestamp ?? null,
            serverTimestamp: dv.serverTimestamp ?? null,
            quality: isGood ? "Good" : "Bad",
            statusCode: dv.statusCode?.toString(),
          };
          this.latestDataTs = new Date().toISOString();
          this.dirty = true;

          if (!isGood) {
            logger.warn(
              { key, nodeId, code: dv.statusCode?.toString() },
              "bad status code",
            );
          } else {
            logger.debug({ key, nodeId }, "value changed");
          }
        },
      );
    logger.info(
      { items: keys.map((k) => ({ k, nodeId: config.opcua.nodeIds[k] })) },
      "Monitoring Items in group",
    );
    // publishMachineData(this.latest);
  }

  private async teardown(reason: string) {
    logger.warn({ reason }, "OPCUA teardown");

    try {
      const g: any = this.state.monitoredGroup as any;
      if (g?.terminate) await g.terminate();
      else if (g?.dispose) await g.dispose();
    } catch (error) {
      logger.warn({ e: String(error) }, "Terminate Monitored group ignored");
    } finally {
      this.state.monitoredGroup = null;
    }

    try {
      await this.state.subscription?.terminate();
    } catch (error) {
      logger.warn({ e: String(error) }, "Terminate subscription ignored");
    } finally {
      this.state.subscription = null;
    }

    try {
      await this.state.session?.close();
    } catch (error) {
      logger.warn({ e: String(error) }, "Close session ignored");
    } finally {
      this.state.session = null;
    }
  }
}
