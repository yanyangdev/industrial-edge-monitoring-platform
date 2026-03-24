import { loadLastSequence, saveLastSequence } from "#mqtt";

let currentSequence = loadLastSequence();

export const nextSequence = (): number => {
  currentSequence += 1;
  saveLastSequence(currentSequence);
  return currentSequence;
};

export const getCurrentSequence = (): number => {
  return currentSequence;
};
