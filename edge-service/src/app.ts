import "dotenv/config";
import { OpcuaEdgeService } from "#services/opcua";
import { logger } from "#logger";

async function main() {
  const opcua = new OpcuaEdgeService();
  await opcua.start();

  const shutdown = async (reason: string) => {
    logger.info({ reason }, "shutdown requested");
    try {
      await opcua.stop();
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
main().catch((err) => {
  logger.error({ err }, "startup failed");
  process.exit(1);
});
