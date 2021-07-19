import { StatusCodes } from "http-status-codes";
import { putEventsMock } from "@mocks/aws-sdk/clients/eventBridgeMock";
import { callbackForAsyncHandler, handlerContext } from "@test/handlerHelpers";
import { mockSSMValues } from "@test/mockSSMValues";
import teamJoinEventMock from "./mockTeamJoin.json";
import urlVerificationEventMock from "./mockUrlVerification.json";

describe("slackEventsEndpoint", () => {
  describe("url verification event", () => {
    it("returns the challenge in a 200", async () => {
      mockSSMValues({
        SLACK_SIGNING_SECRET_SSM_PATH: "1a2b",
      });
      // the handler needs to be imported dynamically to have the environments variables correctly set
      const slackInteractivityEndpointHandler = (await import("./handler"))
        .main;

      const result = await slackInteractivityEndpointHandler(
        // @ts-expect-error middy expect the wrong input type because of mutations
        urlVerificationEventMock,
        handlerContext,
        callbackForAsyncHandler
      );

      expect(putEventsMock).not.toHaveBeenCalledWith();
      expect(result).toEqual({
        statusCode: StatusCodes.OK,
        body:
          '{"challenge":"bjEQ84KEXWggkI5kmQa9jor9pumWcAX4mL8hDunlRA4dkVPYRV1B"}',
      });
    });
  });

  describe("team join event", () => {
    it("publishes a slackGetAvailabilityInteraction event and return a 200", async () => {
      mockSSMValues({
        SLACK_SIGNING_SECRET_SSM_PATH: "1a2b",
      });
      // the handler needs to be imported dynamically to have the environments variables correctly set
      const slackInteractivityEndpointHandler = (await import("./handler"))
        .main;

      const result = await slackInteractivityEndpointHandler(
        // @ts-expect-error middy expect the wrong input type because of mutations
        teamJoinEventMock,
        handlerContext,
        callbackForAsyncHandler
      );

      expect(putEventsMock).toHaveBeenCalledWith({
        Entries: [
          {
            Detail: '{"teamId":"TA5P1CKL7","userId":"U01JXFHQ59A"}',
            DetailType: "slackTeamJoin",
            EventBusName: "free",
            Source: "slack",
          },
        ],
      });
      expect(result).toEqual({ statusCode: StatusCodes.OK, body: "" });
    });
  });
});
