import type { NormalizeSnapshot } from "../services/opcua/types.js";
import type { TelemetryPayload } from "../types/mqttPayload.js";
import { nextSequence } from "../utils/index.js";

export const buildTelemetryPayload = (
  snapshot: NormalizeSnapshot,
): TelemetryPayload => {
  return {
    timestamp: snapshot.edgeTimestamp,
    opcTimestamp: snapshot.opcTimestamp,
    machineId: snapshot.machineId,
    messageType: "telemetry",
    source: "opcua",
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
