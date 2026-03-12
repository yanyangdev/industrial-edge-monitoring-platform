import { logger } from "../logger/index.js";
import {
  buildTelemetryPayload,
  publishAlarm,
  publishState,
  publishTelemetry,
  buildAlarmTransition,
  buildStatePayload,
} from "../mqtt/index.js";
import type { NormalizeSnapshot } from "./opcua/types.js";

type PublishMachineDataType = {
  snapshot: NormalizeSnapshot;
  isConnectedOpc: boolean;
  isConnectedMqtt: boolean;
};

export const publishMachineData = ({
  snapshot,
  isConnectedOpc,
  isConnectedMqtt,
}: PublishMachineDataType): void => {
  logger.info(
    { snapshot, isConnectedOpc, isConnectedMqtt },
    "publishMachineData invoked",
  );

  // 1. telemetry
  const telemetryPayload = buildTelemetryPayload(snapshot);
  publishTelemetry(telemetryPayload);

  // 2. state
  const statePayload = buildStatePayload(
    snapshot,
    isConnectedOpc,
    isConnectedMqtt,
  );
  publishState(statePayload);

  // 3. alarms
  const alarmPayloads = buildAlarmTransition(snapshot);
  for (const alarm of alarmPayloads) {
    publishAlarm(alarm);
  }
  logger.info(
    {
      machineId: snapshot.machineId,
      telemetrySequence: telemetryPayload.sequence,
      stateSequence: statePayload.sequence,
      alarmCount: alarmPayloads.length,
    },
    "Machine data published",
  );
};
