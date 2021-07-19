import { StatusCodes } from "http-status-codes";
import "source-map-support/register";

import applyMiddlewares, {
  BodyFormat,
} from "@libs/middlewares/applyMiddlewares";

import type { CustomAPIGatewayProxyHandler } from "@libs/api-gateway";
import { SlackTeamJoin } from "@libs/events/slack";
import type { Context } from "aws-lambda";
import type { MetricsLogger } from "aws-embedded-metrics";
import { MetricKey } from "@libs/metrics";
import { SlackEvents, slackEventSchema } from "./slackEvents";

const slackEventsEndpoint: CustomAPIGatewayProxyHandler<
  typeof slackEventSchema
> = async (event, { metrics }: Context & { metrics: MetricsLogger }) => {
  const { body } = event;
  if (body.type === SlackEvents.UrlVerification) {
    const { challenge } = body;

    return { statusCode: StatusCodes.OK, body: JSON.stringify({ challenge }) };
  }

  const {
    team_id: teamId,
    event: {
      user: { id: userId },
    },
  } = body;
  metrics.setProperty(MetricKey.SlackTeamId, teamId);
  await SlackTeamJoin.publish({
    teamId,
    userId,
  });

  return { statusCode: StatusCodes.OK, body: "" };
};

export const main = applyMiddlewares(slackEventsEndpoint, {
  ssmParams: {
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET_SSM_PATH as string,
  },
  inputSchema: slackEventSchema,
  bodyFormat: BodyFormat.Json,
  verifySlackSignature: true,
});
