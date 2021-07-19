import { urlVerificationSchema } from "./urlVerification";
import { teamJoinSchema } from "./teamJoin";

export * from "./enums";

export const slackEventSchema = {
  type: "object",
  properties: {
    body: {
      anyOf: [urlVerificationSchema, teamJoinSchema],
    },
  },
  required: ["body"],
} as const;
