export const mqttConfig = {
  url: "mqtt://localhost:1883",

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
