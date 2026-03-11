import type { MachineState } from "../../types/machine.ts";
export type QualityFlags = {
  temperature: string;
  vibration: string;
  status: string;
  error: string;
};
export type StaleFlags = {
  temperature: boolean;
  vibration: boolean;
  status: boolean;
  error: boolean;
};
export type OpcUaValue<T> = {
  value: T | null;
  sourceTimestamp?: Date | null | undefined;
  serverTimestamp?: Date | null | undefined;
  statusCode: string;
  ageMs?: number | null | undefined;
  stale: boolean;
  quality: "Good" | "Bad" | "Unknown";
};

export type OpcSnapshot = {
  Temperature: OpcUaValue<number>;
  Vibration: OpcUaValue<number>;
  Status: OpcUaValue<number>;
  Error: OpcUaValue<boolean>;
};
// NormalizedSnapshot
export type NormalizeSnapshot = {
  machineId: string;
  opcTimestamp: string;
  edgeTimestamp: string;
  temperature: number | null;
  vibration: number | null;
  machineState: MachineState;
  statusCode: number | null;
  error: boolean | null;
  quality: QualityFlags;
  staleFlag: StaleFlags;
};
