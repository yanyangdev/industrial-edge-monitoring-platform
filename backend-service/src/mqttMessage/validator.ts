import z from "zod/v4";
const qualityValueSchema = z.string();
const qualitySchema = z.object({
  temperature: qualityValueSchema,
  vibration: qualityValueSchema,
  status: qualityValueSchema,
  error: qualityValueSchema,
});

const staleFlagSchema = z.object({
  temperature: z.boolean(),
  vibration: z.boolean(),
  status: z.boolean(),
  error: z.boolean(),
});

const baseMessageSchema = z.object({
  timestamp: z.string(),
  opcTimestamp: z.string(),
  machineId: z.string(),
  source: z.string(),
  sequence: z.number(),
});
export const telemetrySchema = baseMessageSchema.extend({
  messageType: z.literal("telemetry"),
  data: z.object({
    temperature: z.number().nullable(),
    vibration: z.number().nullable(),
    machineState: z.string(),
    statusCode: z.number().nullable(),
    error: z.number().nullable(),
    quality: qualitySchema,
    staleFlag: staleFlagSchema,
  }),
});

export const stateSchema = baseMessageSchema.extend({
  messageType: z.literal("state"),
  data: z.object({
    machineState: z.string(),
    statusCode: z.number().nullable(),
    error: z.number().nullable(),
    isConnectedOpc: z.boolean(),
    isConnectedMqtt: z.boolean(),
  }),
});
export const alarmSchema = baseMessageSchema.extend({
  messageType: z.literal("alarm"),
  data: z.object({
    code: z.enum(["HIGH_TEMP", "MACHINE_ERROR", "BAD_QUALITY", "STALE_DATA"]),
    severity: z.enum(["HIGH", "CRITICAL", "MEDIUM"]),
    message: z.string(),
    active: z.boolean(),
    value: z.union([
      z.number(),
      z.boolean(),
      z.string(),
      z.null(),
      z.record(z.string(), z.unknown()),
    ]),
    threshold: z.number().optional(),
    sourceTimestamp: z.string().optional(),
  }),
});
export type TelemetryPayload = z.infer<typeof telemetrySchema>;
export type StatePayload = z.infer<typeof stateSchema>;
export type AlarmPayload = z.infer<typeof alarmSchema>;
