import type { QualityFlags, StaleFlags } from "../services/opcua/types.ts";
import type { MachineState } from "./machine.ts";

export type TelemetryPayload = {
  timestamp: string;
  machineId: string;
  messageType: "telemetry";
  sequence: number;
  data: {
    temperature: number | null;
    vibration: number | null;
    machineState: MachineState;
    statusCode: number | null;
    error: boolean | null;
    quality: QualityFlags;
    staleFlag: StaleFlags;
  };
};

export type StatePayload = {
  timestamp: string;
  machineId: string;
  messageType: "state";
  sequence: number;
  data: {
    machineState: MachineState;
    statusCode: number | null;
    error: boolean | null;
    isConnectedOpc: boolean;
    isConnectedMqtt: boolean;
  };
};
export type AlarmCode =
  | "HIGH_TEMP"
  | "MACHINE_ERROR"
  | "BAD_QUALITY"
  | "STALE_DATA";
export type AlarmSeverity = "HIGH" | "CRITICAL" | "MEDIUM";

export type AlarmPayload = {
  timestamp: string;
  machineId: string;
  messageType: "alarm";
  sequence: number;
  alarm: {
    code: AlarmCode;
    severity: AlarmSeverity;
    message: string;
    active: boolean;
    value?: number | boolean | string | null;
    threshold?: number;
    sourceTimestamp?: string;
  };
};
