import { requiredEnv, toInt } from "#utils";
import type { NodeIds } from "#types";
import "dotenv/config";
export type SecurityModeString = "None" | "Sign" | "SignAndEncrypt";

export type SecurityPolicyString =
  | "None"
  | "Basic256Sha256"
  | "Aes128_Sha256_RsaOaep"
  | "Aes256_Sha256_RsaPss";

export const config = {
  opcua: {
    endpoint: requiredEnv("OPCUA_ENDPOINT", "opc.tcp://DESKTOP-RSBT72P:4840"),
    security: {
      mode: (process.env.OPCUA_SECURITY_MODE ??
        "SignAndEncrypt") as SecurityModeString,
      policy: (process.env.OPCUA_SECURITY_POLICY ??
        "Basic256Sha256") as SecurityPolicyString,
    },
    credentials: {
      username: requiredEnv("OPCUA_USERNAME"),
      password: requiredEnv("OPCUA_PASSWORD"),
    },
    nodeIds: {
      Temperature: requiredEnv("NODEID_TEMPERATURE"),
      Status: requiredEnv("NODEID_STATUS"),
      Vibration: requiredEnv("NODEID_VIBRATION"),
      Error: requiredEnv("NODEID_ERROR"),
    } satisfies NodeIds,
  },
  reconnect: {
    baseDelayMs: toInt("RECONNECT_BASE_MS", 2000),
    maxDelayMs: toInt("RECONNECT_MAX_MS", 30000),
    maxRetry: toInt("RECONNECT_MAX_RETRY", 1_000_000),
  },

  subscription: {
    publishingIntervalMs: toInt("PUBLISH_INTERVAL_MS", 500),
    samplingIntervalMs: toInt("SAMPLING_INTERVAL_MS", 200),
    queueSize: toInt("SUB_QUEUE_SIZE", 10),
    requestedLifetimeCount: toInt("SUB_LIFETIME_COUNT", 600),
    requestMaxKeepAliveCount: toInt("SUB_KEEPALIVE_COUNT", 20),
  },

  output: {
    emitIntervalMs: toInt("EMIT_INTERVAL_MS", 500),
  },
} as const;

export type Key = keyof typeof config.opcua.nodeIds;
