import { SlackEvents, SlackEventTypes } from "./enums";

export const teamJoinSchema = {
  type: "object",
  properties: {
    type: { const: SlackEvents.EventCallBack },
    team_id: { type: "string" },
    event: {
      type: "object",
      properties: {
        type: { const: SlackEventTypes.TeamJoin },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            team_id: { type: "string" },
          },
          required: ["id", "team_id"],
        },
      },
      required: ["type", "user"],
    },
  },
  required: ["type", "team_id", "event"],
} as const;
