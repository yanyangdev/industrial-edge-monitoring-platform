import { mqttConfig } from "../config/mqtt.js";

export const buildTopic = (type: "telemetry" | "state" | "alarm") => {
  const { factory, site, line, cell, machine } = mqttConfig;

  return `${factory}/${site}/${line}/${cell}/${machine}/${type}`;
};
