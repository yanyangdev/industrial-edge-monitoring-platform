import { logger } from "#logger";
import type { AlarmPayload } from "#types";

export const alarmHandler = (message: AlarmPayload, topic: string): void => {
  logger.warn({
    event: "alarm_received",
    topic,
    machineId: message.machineId,
    source: message.source,
    sequence: message.sequence,
    timestamp: message.timestamp,
    opvTimestamp: message.opcTimestamp,
    code: message.alarm.code,
    severity: message.alarm.severity,
    message: message.alarm.message,
    active: message.alarm.active,
    value: message.alarm.value,
    threshold: message.alarm.threshold,
    sourceTimestamp: message.alarm.sourceTimestamp,
  });
};
