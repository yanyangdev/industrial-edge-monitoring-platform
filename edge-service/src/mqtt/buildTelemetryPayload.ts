import type { NormalizeSnapshot } from "../services/opcua/types.ts";
import type { TelemetryPayload } from "../types/mqttPayload.ts";
import { nextSequence } from "../utils/index.ts";

export const buildTelemetryPayload = (
  snapshot: NormalizeSnapshot,
): TelemetryPayload => {
  return {
    timestamp: snapshot.edgeTimestamp,
    machineId: snapshot.machineId,
    messageType: "telemetry",
    sequence: nextSequence(),
    data: {
      temperature: snapshot.temperature,
      vibration: snapshot.vibration,
      machineState: snapshot.machineState,
      statusCode: snapshot.statusCode,
      error: snapshot.error,
      quality: snapshot.quality,
      staleFlag: snapshot.staleFlag,
    },
  };
};
