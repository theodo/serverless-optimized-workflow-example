import Bus from "@libs/event-bridge";
import { ref } from "@libs/configHelpers";
import { getHandlerPath } from "@libs/lambda";
import {
  SlackTeamJoin,
} from "@libs/events/slack";
import { Table } from "../../resources/dynamodb";

export default {
  handler: getHandlerPath(__dirname),
  environment: {
    TABLE_NAME: ref({ Table }),
  },
  events: [
    {
      eventBridge: {
        eventBus: "${self:custom.eventBusArn}",
        pattern: Bus.computePattern([
          SlackTeamJoin,
        ]),
      },
    },
  ],
};
