import type { NormalizeSnapshot } from "../services/opcua/types.ts";
import type { StatePayload } from "../types/mqttPayload.ts";
import { nextSequence } from "../utils/index.ts";

export const buildStatePayload = (
  snapshot: NormalizeSnapshot,
  isConnectedOpc: boolean,
  isConnectedMqtt: boolean,
): StatePayload => {
  return {
    timestamp: snapshot.edgeTimestamp,
    machineId: snapshot.machineId,
    messageType: "state",
    sequence: nextSequence(),
    data: {
      machineState: snapshot.machineState,
      statusCode: snapshot.statusCode,
      error: snapshot.error,
      isConnectedOpc,
      isConnectedMqtt,
    },
  };
};
