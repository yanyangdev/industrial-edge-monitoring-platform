import type { NormalizeSnapshot } from "../services/opcua/types.js";
import type { AlarmCode, AlarmPayload } from "../types/mqttPayload.js";
import { nextSequence } from "../utils/index.js";

const alarmState: Record<string, boolean> = {};
const HIGH_TEMP_THRESHOLD = 80;

export const buildAlarmTransition = (
  snapshot: NormalizeSnapshot,
): AlarmPayload[] => {
  const alarms: AlarmPayload[] = [];

  const conditions: Array<{
    code: AlarmCode;
    active: boolean;
    severity: AlarmPayload["alarm"]["severity"];
    message: string;
    value: number | boolean | string | null | Record<string, unknown>;
    threshold?: number;
  }> = [
    {
      code: "HIGH_TEMP",
      active:
        snapshot.temperature !== null &&
        snapshot.temperature > HIGH_TEMP_THRESHOLD,
      severity: "HIGH",
      message: `Temperature above threshold ${HIGH_TEMP_THRESHOLD}`,
      value: snapshot.temperature,
      threshold: HIGH_TEMP_THRESHOLD,
    },
    {
      code: "MACHINE_ERROR",
      active: snapshot.machineState === "Error" || snapshot.error === true,
      severity: "CRITICAL",
      message: `Machine entered error state`,
      value: { machineState: snapshot.machineState, error: snapshot.error },
    },
    {
      code: "BAD_QUALITY",
      active: Object.values(snapshot.quality).some((q) => q !== "Good"),
      severity: "MEDIUM",
      message: `One or more OPC UA values have bad/unknown quality`,
      value: snapshot.quality,
    },
    {
      code: "STALE_DATA",
      active: Object.values(snapshot.staleFlag).some(Boolean),
      severity: "MEDIUM",
      message: `One or more OPC UA values are stale`,
      value: snapshot.staleFlag,
    },
  ];

  for (const condition of conditions) {
    const stateKey = `${snapshot.machineId}:${condition.code}`;
    const prev = alarmState[stateKey] ?? false;
    if (prev === condition.active) {
      continue;
    }
    alarmState[stateKey] = condition.active;
    const alarm: AlarmPayload["alarm"] = {
      code: condition.code,
      severity: condition.severity,
      message: condition.message,
      active: condition.active,
      value: condition.value,
      // threshold: condition.threshold,
      sourceTimestamp: snapshot.opcTimestamp,
    };
    if (condition.threshold !== undefined) {
      alarm.threshold = condition.threshold;
    }
    alarms.push({
      timestamp: snapshot.edgeTimestamp,
      opcTimestamp: snapshot.opcTimestamp,
      machineId: snapshot.machineId,
      messageType: "alarm",
      source: "opcua",
      sequence: nextSequence(),
      alarm,
    });
  }
  return alarms;
};
