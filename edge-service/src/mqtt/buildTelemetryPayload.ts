import { nextSequence } from "#mqtt";
import type { NormalizeSnapshot } from "#services/opcua";
import type { TelemetryPayload } from "#types";

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
