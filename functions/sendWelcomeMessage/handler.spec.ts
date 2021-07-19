import { callbackForAsyncHandler, handlerContext } from "@test/handlerHelpers";
import {
  openConversationMock, postChatMessageMock,
  SlackClientMock,
} from '@mocks/@slack/web-api/dist/WebClient';
import { getPromiseResponse } from "@mocks/aws-sdk/clients/dynamoDbMock";
import eventMock from "./mock.json";

describe("sendWelcomeMessage", () => {
  it("opens a slack conversation and send a welcome message", async () => {
    const accessToken = "accessToken";
    const channelId = "channelId";
    process.env.TABLE_NAME = "TABLE_NAME";
    getPromiseResponse.mockResolvedValueOnce({
      Item: {
        PK: "Team",
        SK: "TA5P1CKL7",
        accessToken,
      },
    });
    openConversationMock.mockResolvedValueOnce({
      ok: true,
      channel: {
        id: channelId,
      },
    });
    // the handler needs to be imported dynamically to have the environments variables correctly set
    const openConversationHandler = (await import("./handler")).main;

    await openConversationHandler(
      // @ts-expect-error middy expect the wrong input type because of mutations
      eventMock,
      handlerContext,
      callbackForAsyncHandler
    );

    expect(SlackClientMock).toHaveBeenCalledWith(accessToken);
    expect(openConversationMock).toHaveBeenCalledWith({
      users: "U01HRDMNP55",
    });

    expect(postChatMessageMock).toHaveBeenCalledTimes(1);
    const messageSend = postChatMessageMock.mock.calls[0][0];
    expect(messageSend?.channel).toBe(channelId);
  });
});
