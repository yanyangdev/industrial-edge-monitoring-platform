import { config } from "#config";
import { logger } from "#logger";
import mqtt from "mqtt";

export const startMqttSubscriber = () => {
  const client = mqtt.connect(config.mqtt.brokerUrl, {
    clientId: config.mqtt.clientId,
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
    clean: false,
  });
  client.on("connect", () => {
    logger.info({ url: config.mqtt.brokerUrl }, "MQTT connected");

    client.subscribe(
      [
        config.mqtt.topics.telemetry,
        config.mqtt.topics.state,
        config.mqtt.topics.alarm,
      ],
      {
        qos: config.mqtt.qos as 0 | 1 | 2,
      },
      (error) => {
        if (error) {
          logger.warn({ err: error.message }, "Subscribe failed");
          return;
        }
        logger.info("MQTT subscribed.");
      },
    );
  });
  client.on("message", (topic, payloadBuffer) => {
    const payloadText = payloadBuffer.toString("utf-8");

    logger.info({ topic: topic, payload: payloadText }, "Message received");
  });

  client.on("reconnect", () => {
    logger.warn("MQTT reconnecting...");
  });
  client.on("close", () => {
    logger.warn("MQTT connection closed.");
  });
  client.on("offline", () => {
    logger.warn("MQTT offline.");
  });
  client.on("error", (error) => {
    logger.warn("MQTT error:");

    return client;
  });
};
