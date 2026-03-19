import { logger } from "#logger";
import type { StatePayload } from "#types";

export const stateHandler = (message: StatePayload, topic: string): void => {
  logger.info({
    event: "state_received",
    topic,
    machineId: message.machineId,
    source: message.source,
    sequence: message.sequence,
    timestamp: message.timestamp,
    opcTimestamp: message.opcTimestamp,
    machineState: message.data.machineState,
    statuesCode: message.data.statusCode,
    error: message.data.error,
    isConnectedOpc: message.data.isConnectedOpc,
    isConnectedMqtt: message.data.isConnectedMqtt,
  });
};
