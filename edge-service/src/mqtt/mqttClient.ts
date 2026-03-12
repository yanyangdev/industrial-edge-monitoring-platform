import mqtt from "mqtt";
import { mqttConfig } from "../config/mqtt.js";
import { logger } from "../logger/index.js";

export const mqttClient = mqtt.connect(mqttConfig.url, {
  reconnectPeriod: 3000,
  connectTimeout: 30 * 1000,
  clean: true,
});

mqttClient.on("connect", () => {
  logger.info({ url: mqttConfig.url }, "MQTT connected");
});

mqttClient.on("reconnect", () => {
  logger.info({ url: mqttConfig.url }, "MQTT reconnecting...");
});
mqttClient.on("offline", () => {
  logger.info("MQTT offline");
});
mqttClient.on("error", (err) => {
  logger.warn({ err: err }, "MQTT error");
});
