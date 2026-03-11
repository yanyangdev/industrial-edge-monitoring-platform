import { mqttConfig } from "../config/mqtt.ts";
import type {
  AlarmPayload,
  StatePayload,
  TelemetryPayload,
} from "../types/mqttPayload.ts";
import { mqttClient } from "./mqttClient.ts";
import { buildTopic } from "./topicBuilder.ts";

export const publishTelemetry = (payload: TelemetryPayload) => {
  const topic = buildTopic("telemetry");

  mqttClient.publish(topic, JSON.stringify(payload), {
    qos: mqttConfig.qos.telemetry as 0 | 1 | 2,
  });
};

export const publishState = (payload: StatePayload) => {
  const topic = buildTopic("state");
  mqttClient.publish(topic, JSON.stringify(payload), {
    qos: mqttConfig.qos.state as 0 | 1 | 2,
  });
};

export const publishAlarm = (payload: AlarmPayload) => {
  const topic = buildTopic("alarm");
  mqttClient.publish(topic, JSON.stringify(payload), {
    qos: mqttConfig.qos.alarm as 0 | 1 | 2,
  });
};
