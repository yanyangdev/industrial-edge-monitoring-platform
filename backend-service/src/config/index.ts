import "dotenv/config";

function requiredEnv(name: string, fallback?: string): string {
  const v = process.env[name] || fallback;
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function toInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : fallback;
  if (!Number.isFinite(n)) throw new Error(`Invalid number env:${name}=${raw}`);
  return n;
}

export const config = {
  mqtt: {
    brokerUrl: requiredEnv("MQTT_BROKER_URL", "MQTT://localhost://1883"),
    clientId: requiredEnv("MQTT_CLIENT_ID"),
    qos: toInt("MQTT_QOS", 1),
    topics: {
      telemetry: requiredEnv("TOPIC_TELEMETRY"),
      state: requiredEnv("TOPIC_STATE"),
      alarm: requiredEnv("TOPIC_ALARM"),
    },
  },
} as const;
