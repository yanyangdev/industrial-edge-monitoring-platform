import { logger } from "#logger";
import type { TelemetryPayload } from "#mqttMessage";

export const telemetryHandler = (
  message: TelemetryPayload,
  topic: string,
): void => {
  logger.info({
    event: "telemetry_received",
    topic,
    machineId: message.machineId,
    source: message.source,
    sequence: message.sequence,
    timestamp: message.timestamp,
    opcTimestamp: message.opcTimestamp,
    temperature: message.data.temperature,
    vibration: message.data.vibration,
    statuesCode: message.data.statusCode,
    error: message.data.error,
    quality: message.data.quality,
    staleFlag: message.data.staleFlag,
  });
};
