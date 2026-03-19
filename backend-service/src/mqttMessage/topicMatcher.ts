export type MessageType = "telemetry" | "state" | "alarm";
export const getMessageTypeFromTopic = (topic: string): MessageType | null => {
  const last = topic.split("/").at(-1);
  if (last === "telemetry" || last === "state" || last === "alarm") {
    return last;
  }

  return null;
};
