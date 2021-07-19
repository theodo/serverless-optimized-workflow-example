import type {
  ChatPostMessageArguments,
  ConversationsOpenArguments,
} from "@slack/web-api/dist/methods";
import type { WebAPICallResult } from "@slack/web-api/dist/WebClient";
import Mock = jest.Mock;

export const openConversationMock: Mock<
  Promise<WebAPICallResult>,
  [ConversationsOpenArguments] | []
> = jest.fn(() => Promise.resolve({ ok: true }));

export const postChatMessageMock: Mock<
  Promise<WebAPICallResult>,
  [ChatPostMessageArguments] | []
> = jest.fn(() => Promise.resolve({ ok: true }));

export const SlackClientMock = jest.fn(() => ({
  conversations: {
    open: openConversationMock,
  },
  chat: {
    postMessage: postChatMessageMock,
  },
}));

export const WebClient = SlackClientMock;
