import type { Key } from "../../config/index.ts";
export type LatestPoint = {
  value: unknown;
  sourceTimestamp?: Date | null;
  serverTimestemp?: Date | null;
  statusCode?: string;
};

export type LatestSnapshot = Record<Key, LatestPoint>;
