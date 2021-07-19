import "source-map-support/register";

import type { MetricsLogger } from "aws-embedded-metrics";
import type { Context } from "aws-lambda";
import type { PublishedEvent } from "typebridge";

import middy from "@middy/core";

import embeddedMetrics from "@libs/middlewares/embeddedMetrics";
import type {
  SlackTeamJoin,
} from "@libs/events/slack";
import type { ChatPostMessageArguments } from "@slack/web-api/dist/methods";


import { getSlackClientForTeam } from "@libs/slackClient";
import { MetricKey } from "@libs/metrics";
import { Message } from "slack-block-builder";

const buildSlackMessage = (channel: string): ChatPostMessageArguments =>
    (Message().text("Hi :wave:",)
        .channel(channel)
        .buildToObject() as unknown) as ChatPostMessageArguments;

const sendWelcomeMessage = async (
  event: PublishedEvent<
    typeof SlackTeamJoin
  >,
  { metrics }: Context & { metrics: MetricsLogger }
) => {
  const { teamId, userId } = event.detail;
  metrics.setProperty(MetricKey.SlackTeamId, teamId);

  const slackClient = await getSlackClientForTeam(teamId);

  const res = await slackClient.conversations.open({
    users: userId,
  });

  if (!res.ok) {
    throw new Error(`Fail to open conversion with user "${userId}"`);
  }

  const channel = (res.channel as { id: string }).id;

  return slackClient.chat.postMessage(buildSlackMessage(channel));

};

export const main = middy(sendWelcomeMessage).use(embeddedMetrics());
