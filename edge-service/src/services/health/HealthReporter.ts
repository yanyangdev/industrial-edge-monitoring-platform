import { logger } from "../../logger/index.js";

export type HealthSnapshot = {
  ts: string;
  opcua: {
    connected: boolean;
    hasSession: boolean;
    hasSubscription: boolean;
    subscriptionId?: number;
    lastDataTs?: string;
    badCount: number;
  };
};

export class HealthReport {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly serviceName: string,
    private readonly intervalMs: number,
    private readonly getHealth: () => Omit<HealthSnapshot, "ts">,
  ) {}

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const base = this.getHealth();
      const snap: HealthSnapshot = {
        ts: new Date().toISOString(),
        ...base,
      };
      logger.info(snap, "health reporter");
    }, this.intervalMs);
  }

  stop() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
