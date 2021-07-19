import type middy from "@middy/core";
import { createMetricsLogger } from "aws-embedded-metrics";

const embeddedMetrics: middy.Middleware<undefined> = () => {
  const metrics = createMetricsLogger();

  return {
    before: (handler, next) => {
      Object.assign(handler.context, { metrics });
      next();
    },
    after: async () => {
      await metrics.flush();
    },
  };
};

export default embeddedMetrics;
