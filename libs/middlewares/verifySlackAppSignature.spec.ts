import middy from "@middy/core";
import type { APIGatewayProxyEvent } from "aws-lambda";
import createHttpError from "http-errors";
import { advanceTo } from "jest-date-mock";
import verifySlackAppSignature from "./verifySlackAppSignature";

import HandlerLambda = middy.HandlerLambda;
import MiddlewareFunction = middy.MiddlewareFunction;

// The real behaviour of the middleware is tested
jest.mock("@test/isTest", () => ({ IS_TEST: false }));

describe("verifySlackAppSignature", () => {
  const next = jest.fn();
  const verifySlackAppSignatureBefore = verifySlackAppSignature()
    .before as MiddlewareFunction<any, any>;
  const requestBody = "requestBody";
  const timestamp = "1610037000"; // 07/01/2020 17h30 GMT + 1
  const mockedNowTimeStamp = 1610037060000; // 07/01/2020 17h31 GMT + 1
  const signature =
    "v0=4e8fee8b74e1928969eef85fdaa599391b5190e8d883e870b5f204118c10c66b";
  let handler: HandlerLambda<APIGatewayProxyEvent>;

  process.env.SLACK_SIGNING_SECRET = "SLACK_SIGNING_SECRET";

  beforeEach(() => {
    advanceTo(mockedNowTimeStamp);
    handler = ({
      event: {
        body: requestBody,
        headers: {
          ["X-Slack-Request-Timestamp"]: timestamp,
          ["X-Slack-Signature"]: signature,
        },
      },
    } as unknown) as HandlerLambda<APIGatewayProxyEvent>;
  });

  it("throws if the body of the request is null", () => {
    handler.event.body = null;
    expect(() => verifySlackAppSignatureBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws if the header X-Slack-Signature of the request is undefined", () => {
    delete handler.event.headers["X-Slack-Signature"];
    expect(() => verifySlackAppSignatureBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws if the header X-Slack-Request-Timestamp of the request is undefined", () => {
    delete handler.event.headers["X-Slack-Request-Timestamp"];
    expect(() => verifySlackAppSignatureBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws if the header X-Slack-Request-Timestamp of the request is not a stringified number", () => {
    handler.event.headers["X-Slack-Request-Timestamp"] = "not a number";
    expect(() => verifySlackAppSignatureBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws if the header X-Slack-Request-Timestamp of the request is in the future", () => {
    handler.event.headers["X-Slack-Request-Timestamp"] = (
      mockedNowTimeStamp + 1
    ).toString();
    expect(() => verifySlackAppSignatureBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws if the header X-Slack-Request-Timestamp of the request is older than 5 minutes", () => {
    handler.event.headers["X-Slack-Request-Timestamp"] = "1610036759"; // 07/01/2020 17h25 59s GMT + 1
    expect(() => verifySlackAppSignatureBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws if the body is not the one which was used to compute the signature", () => {
    handler.event.body = "anotherBody";
    expect(() => verifySlackAppSignatureBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws if the timestamp is not the one which was used to compute the signature", () => {
    handler.event.headers["X-Slack-Request-Timestamp"] = "1610037001"; // 07/01/2020 17h30 01s GMT + 1
    expect(() => verifySlackAppSignatureBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next if the signature of the request match the expected signature", () => {
    expect(() => verifySlackAppSignatureBefore(handler, next)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });
});
