import type { MetricsLogger } from "aws-embedded-metrics";

export enum MetricKey {
  Error = "Error",
  Warning = "Warning",
  SlackTeamId = "SlackTeamId",
  ThingName = "ThingName",
  SessionQuantity = "SessionQuantity",
  TeamThingsQuantity = "TeamThingsQuantity",
  ThingsQuantity = "ThingsQuantity",
}

export enum ErrorCode {
  AwsSdk = "AWS_SDK",
  SlackClient = "SLACK_CLIENT",
  NotFound = "NOT_FOUND",
  Format = "FORMAT",
}

export enum WarningCode {
  InconsistentEvent = "INCONSISTENT_EVENT",
}

type MetricLog = (
  ...args:
    | [key: MetricKey.Error, code: ErrorCode, message: string]
    | [key: MetricKey.Warning, code: WarningCode, message: string]
) => void;

export const metricLog = (metrics: MetricsLogger): MetricLog => (
  key,
  code,
  message
): void => {
  metrics.setProperty(key, code);
  switch (key) {
    case MetricKey.Error:
      console.error(message);
      break;
    case MetricKey.Warning:
      console.warn(message);
  }
};
