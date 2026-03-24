import path from "node:path";
import fs from "node:fs";

type SequenceState = {
  lastSequence: number;
};
const DATA_DIR = path.resolve("data");
const FILE_PATH = path.join(DATA_DIR, "sequence-state.json");

const ensureDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};
export const loadLastSequence = (): number => {
  try {
    ensureDir();
    if (!fs.existsSync(FILE_PATH)) {
      return 0;
    }

    const raw = fs.readFileSync(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as SequenceState;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.lastSequence === "number" &&
      Number.isFinite(parsed.lastSequence) &&
      parsed.lastSequence >= 0
    )
      return parsed.lastSequence;

    return 0;
  } catch {
    return 0;
  }
};

export const saveLastSequence = (lastSequence: number) => {
  ensureDir();

  const payload: SequenceState = { lastSequence };
  fs.writeFileSync(FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
};
