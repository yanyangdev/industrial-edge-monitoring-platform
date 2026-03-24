import { nextSequence } from "#mqtt";
import type { NormalizeSnapshot } from "#services/opcua";
import type { StatePayload } from "#types";

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
