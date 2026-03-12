const mqttHost = process.env.MQTT_HOST || "localhost";
const mqttPort = Number(process.env.MQTT_PORT || 1883);
export const mqttConfig = {
  url: `mqtt://${mqttHost}:${mqttPort}`,
  factory: "factory",
  site: "demo",
  line: "line1",
  cell: "cell1",
  machine: "mixer01",

  qos: {
    telemetry: 0,
    state: 1,
    alarm: 1,
  },
};
