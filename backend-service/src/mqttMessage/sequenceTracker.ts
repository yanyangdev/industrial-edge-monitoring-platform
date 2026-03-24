import { logger } from "#logger";

type SequenceCheckInput = {
  machineId: string;
  sequence: number;
  topic: string;
  source: string;
};

type SequenceState = {
  lastSequence: number;
  lastTopic: string;
  lastSource: string;
};
const SequenceMap = new Map<string, SequenceState>();

export const checkSequence = (input: SequenceCheckInput) => {
  const { machineId, sequence, topic, source } = input;
  const prev = SequenceMap.get(machineId);
  if (!prev) {
    SequenceMap.set(machineId, {
      lastSequence: sequence,
      lastTopic: topic,
      lastSource: source,
    });
    logger.info(
      {
        machineId,
        sequence,
        topic,
        source,
      },
      "sequence_initialized",
    );
    return;
  }
  const expected = prev.lastSequence + 1;
  if (sequence === expected) {
    SequenceMap.set(machineId, {
      lastSequence: sequence,
      lastTopic: topic,
      lastSource: source,
    });
    return;
  }
  if (sequence <= expected) {
    logger.warn(
      {
        machineId,
        currentSequence: sequence,
        lastSequence: prev.lastSequence,
        expectedSequence: expected,
        topic,
        prevTopic: prev.lastTopic,
        source,
        prevSource: prev.lastSource,
      },
      "sequence_out_of_order",
    );
    return;
  }

  const missedCount = sequence - expected;

  const missedSequences =
    missedCount <= 20
      ? Array.from({ length: missedCount }, (_, i) => expected + i)
      : undefined;

  logger.warn(
    {
      machineId,
      currentSequence: sequence,
      lastSequence: prev.lastSequence,
      expectedSequence: expected,
      missedCount,
      missedSequences,
      topic,
      prevTopic: prev.lastTopic,
      source,
      prevSource: prev.lastSource,
    },
    "sequence_gap_detected",
  );

  SequenceMap.set(machineId, {
    lastSequence: sequence,
    lastTopic: topic,
    lastSource: source,
  });
};
