import type { NormalizeSnapshot } from "../services/opcua/types.js";
import type { StatePayload } from "../types/mqttPayload.js";
import { nextSequence } from "../utils/index.js";

export const buildStatePayload = (
  snapshot: NormalizeSnapshot,
  isConnectedOpc: boolean,
  isConnectedMqtt: boolean,
): StatePayload => {
  return {
    timestamp: snapshot.edgeTimestamp,
    opcTimestamp: snapshot.opcTimestamp,
    machineId: snapshot.machineId,
    messageType: "state",
    source: "opcua",
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
