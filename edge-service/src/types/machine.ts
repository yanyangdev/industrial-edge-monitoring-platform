export type MachineData = {
  Temperature: number | null;
  Vibration: number | null;
  Status: number | null;
  Error: boolean | null;
  ts: string; // ISO
};

export type NodeIds = {
  Temperature: string;
  Vibration: string;
  Status: string;
  Error: string;
};
