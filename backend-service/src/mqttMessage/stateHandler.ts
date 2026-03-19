import { logger } from "#logger";
import type { StatePayload } from "#mqttMessage";

export const stateHandler = (message: StatePayload, topic: string): void => {
  logger.info(
    {
      topic,
      machineId: message.machineId,
      source: message.source,
      sequence: message.sequence,
      timestamp: message.timestamp,
      opcTimestamp: message.opcTimestamp,
      machineState: message.data.machineState,
      statusCode: message.data.statusCode,
      error: message.data.error,
      isConnectedOpc: message.data.isConnectedOpc,
      isConnectedMqtt: message.data.isConnectedMqtt,
    },
    "state_received",
  );
};
