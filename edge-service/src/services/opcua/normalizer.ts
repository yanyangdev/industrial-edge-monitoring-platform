import type { MachineState } from "../../types/machine.ts";
import type { NormalizeSnapshot, OpcSnapshot } from "./types.ts";

const mapStatusCodeToMachineState = (
  statusCode: number | null,
): MachineState => {
  switch (statusCode) {
    case 0:
      return "Idle";
    case 1:
      return "Starting";
    case 2:
      return "Running";
    case 3:
      return "Error";
    default:
      return "Unknown";
  }
};

export const normalizeOpcSnapshot = (
  ts: string,
  raw: OpcSnapshot,
  machineId: string,
): NormalizeSnapshot => {
  const statusCode = raw.Status.value;
  const derivedState = mapStatusCodeToMachineState(statusCode);

  return {
    machineId,
    opcTimestamp: raw.Temperature.sourceTimestamp?.toISOString() || ts,
    edgeTimestamp: ts,
    temperature: raw.Temperature.value,
    vibration: raw.Vibration.value,
    machineState: raw.Error.value ? "Error" : derivedState,
    statusCode,
    error: raw.Error.value,
    quality: {
      temperature: raw.Temperature.quality,
      vibration: raw.Vibration.quality,
      status: raw.Status.quality,
      error: raw.Error.quality,
    },
    staleFlag: {
      temperature: raw.Temperature.stale,
      vibration: raw.Vibration.stale,
      status: raw.Status.stale,
      error: raw.Error.stale,
    },
  };
};
