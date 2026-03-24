import z from "zod";
import mqtt from "mqtt";
import { config } from "#config";
import { logger } from "#logger";
import { safeJsonParse } from "#utils";
import {
  alarmSchema,
  stateSchema,
  telemetrySchema,
  stateHandler,
  alarmHandler,
  telemetryHandler,
  getMessageTypeFromTopic,
  checkSequence,
} from "#mqttMessage";

export const startMqttSubscriber = () => {
  const client = mqtt.connect(config.mqtt.brokerUrl, {
    clientId: config.mqtt.clientId,
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
    clean: false,
  });
  client.on("connect", () => {
    logger.info({ url: config.mqtt.brokerUrl }, "MQTT connected");

    client.subscribe(
      Object.values(config.mqtt.topics),
      {
        qos: config.mqtt.qos as 0 | 1 | 2,
      },
      (error) => {
        if (error) {
          logger.warn({ err: error.message }, "MQTT Subscribe failed");
          return;
        }
        logger.info(
          { topics: Object.values(config.mqtt.topics) },
          "MQTT subscribed.",
        );
      },
    );
  });
  client.on("message", (topic, payloadBuffer) => {
    const payloadText = payloadBuffer.toString("utf-8");
    const topicType = getMessageTypeFromTopic(topic);
    if (!topicType) {
      logger.warn({ topic }, "Unknown topic types");
      return;
    }
    const raw = safeJsonParse(payloadText);
    if (!raw) {
      logger.error({ topic, payload: payloadText }, "Invalid JSON payload");
      return;
    }
    const payloadType =
      typeof raw === "object" &&
      raw !== null &&
      "messageType" in raw &&
      typeof (raw as Record<string, unknown>).messageType === "string"
        ? (raw as Record<string, unknown>).messageType
        : null;

    if (payloadType != topicType) {
      logger.warn({ topicType }, "Topic and payload messageType mismatched");
    }
    switch (topicType) {
      case "telemetry": {
        const result = telemetrySchema.safeParse(raw);
        if (!result.success) {
          logger.error(
            {
              topic,
              error: z.prettifyError(result.error),
            },
            "Invalid telemetry payload",
          );
          return;
        }
        const { machineId, sequence, source } = result.data;

        checkSequence({ machineId, sequence, source, topic });
        telemetryHandler(result.data, topic);
        break;
      }
      case "state": {
        const result = stateSchema.safeParse(raw);
        if (!result.success) {
          logger.error(
            {
              topic,
              error: z.prettifyError(result.error),
            },
            "Invalid state payload",
          );
          return;
        }
        const { machineId, sequence, source } = result.data;

        checkSequence({ machineId, sequence, source, topic });
        stateHandler(result.data, topic);
        break;
      }
      case "alarm": {
        const result = alarmSchema.safeParse(raw);
        if (!result.success) {
          logger.error(
            {
              topic,
              error: z.prettifyError(result.error),
            },
            "Invalid alarm payload",
          );
          return;
        }
        const { machineId, sequence, source } = result.data;
        checkSequence({ machineId, sequence, source, topic });
        alarmHandler(result.data, topic);
        break;
      }
    }
  });

  client.on("reconnect", () => {
    logger.warn("MQTT reconnecting...");
  });
  client.on("close", () => {
    logger.warn("MQTT connection closed.");
  });
  client.on("offline", () => {
    logger.warn("MQTT offline.");
  });
  client.on("error", (error) => {
    logger.warn("MQTT error:");

    return client;
  });
};
