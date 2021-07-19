import { Event } from "typebridge";

import Bus from "../event-bridge";

const slackTeamJoinSchema = {
  type: "object",
  properties: {
    teamId: { type: "string" },
    userId: { type: "string" },
  },
  additionalProperties: false,
  required: ["teamId", "userId"],
} as const;

export const SlackTeamJoin = new Event({
  name: "slackTeamJoin",
  source: "slack",
  bus: Bus,
  schema: slackTeamJoinSchema,
});
