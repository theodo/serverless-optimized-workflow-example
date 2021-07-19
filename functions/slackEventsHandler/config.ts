import { ref } from "@libs/configHelpers";
import { getHandlerPath } from "@libs/lambda";
import { SlackSigningSecret } from "../../resources/ssm";

export default {
  handler: getHandlerPath(__dirname),
  environment: {
    SLACK_SIGNING_SECRET_SSM_PATH: ref({ SlackSigningSecret }),
  },
  events: [
    {
      http: {
        method: "post",
        path: "/slack/events",
      },
    },
  ],
};
