import { SlackEvents } from "./enums";

export const urlVerificationSchema = {
  type: "object",
  properties: {
    type: { const: SlackEvents.UrlVerification },
    challenge: { type: "string" },
  },
  required: ["type", "challenge"],
} as const;
