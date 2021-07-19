import type { MetricsLogger } from "aws-embedded-metrics";

export const setPropertyMock = jest.fn();
export const flushMock = jest.fn();

export const createMetricsLogger = (): Partial<MetricsLogger> => ({
  setProperty: setPropertyMock,
  flush: flushMock,
});
