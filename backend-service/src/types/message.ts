// export type MachineState =
//   | "Idle"
//   | "Starting"
//   | "Running"
//   | "Error"
//   | "Unknown";
// // 0=Idle, 1 = Starting, 2 = Running, 3=Error

// export type QualityFlags = {
//   temperature: string;
//   vibration: string;
//   status: string;
//   error: string;
// };
// export type StaleFlags = {
//   temperature: boolean;
//   vibration: boolean;
//   status: boolean;
//   error: boolean;
// };
// export type TelemetryPayload = {
//   timestamp: string;
//   opcTimestamp: string;
//   machineId: string;
//   messageType: "telemetry";
//   source: string;
//   sequence: number;
//   data: {
//     temperature: number | null;
//     vibration: number | null;
//     machineState: MachineState;
//     statusCode: number | null;
//     error: boolean | null;
//     quality: QualityFlags;
//     staleFlag: StaleFlags;
//   };
// };

// export type StatePayload = {
//   timestamp: string;
//   opcTimestamp: string;
//   machineId: string;
//   messageType: "state";
//   source: string;
//   sequence: number;
//   data: {
//     machineState: MachineState;
//     statusCode: number | null;
//     error: boolean | null;
//     isConnectedOpc: boolean;
//     isConnectedMqtt: boolean;
//   };
// };
// export type AlarmCode =
//   | "HIGH_TEMP"
//   | "MACHINE_ERROR"
//   | "BAD_QUALITY"
//   | "STALE_DATA";
// export type AlarmSeverity = "HIGH" | "CRITICAL" | "MEDIUM";

// export type AlarmPayload = {
//   timestamp: string;
//   opcTimestamp: string;
//   machineId: string;
//   messageType: "alarm";
//   source: string;
//   sequence: number;
//   alarm: {
//     code: AlarmCode;
//     severity: AlarmSeverity;
//     message: string;
//     active: boolean;
//     value?: number | boolean | string | null | Record<string, unknown>;
//     threshold?: number;
//     sourceTimestamp?: string;
//   };
// };

// export type MessageType = "telemetry" | "state" | "alarm";
// export type PublishedMessage = TelemetryPayload | StatePayload | AlarmPayload;
