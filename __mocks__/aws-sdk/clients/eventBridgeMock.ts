import { awsSdkPromiseResponseFactory } from "@mocks/aws-sdk/helpers";
import type { PutEventsResponse } from "aws-sdk/clients/eventbridge";
import Mock = jest.Mock;

export const putEventsPromiseResponse: Mock<
  Promise<PutEventsResponse>
> = awsSdkPromiseResponseFactory();

export const putEventsMock = jest.fn(() => ({
  promise: putEventsPromiseResponse,
}));

export class EventBridge {
  putEvents = putEventsMock;
}
