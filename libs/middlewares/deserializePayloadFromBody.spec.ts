import middy from "@middy/core";
import createHttpError from "http-errors";
import type { ToDeserializePayloadEvent } from "@libs/middlewares/deserializePayloadFromBody";
import deserializePayloadFromBody from "@libs/middlewares/deserializePayloadFromBody";

import HandlerLambda = middy.HandlerLambda;
import MiddlewareFunction = middy.MiddlewareFunction;

describe("deserializePayloadFromBody", () => {
  const next = jest.fn();
  const deserializePayloadFromBodyBefore = deserializePayloadFromBody()
    .before as MiddlewareFunction<any, any>;
  const serializedPayload = '{"attribute":"value"}';
  let handler: HandlerLambda<ToDeserializePayloadEvent>;

  process.env.SLACK_SIGNING_SECRET = "SLACK_SIGNING_SECRET";

  beforeEach(() => {
    handler = ({
      event: {
        body: {
          payload: serializedPayload,
        },
      },
    } as unknown) as HandlerLambda<ToDeserializePayloadEvent>;
  });

  it("throws if the body of does not contain any payload", () => {
    delete handler.event.body.payload;
    expect(() => deserializePayloadFromBodyBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("throws if the payload is not a valid JSON", () => {
    handler.event.body.payload = "notAJSON";
    expect(() => deserializePayloadFromBodyBefore(handler, next)).toThrow(
      new createHttpError.BadRequest()
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next if there is a payload to deserialize", () => {
    expect(() => deserializePayloadFromBodyBefore(handler, next)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });

  it("mutates the body with deserialized payload if there is a payload to deserialize", async () => {
    await deserializePayloadFromBodyBefore(handler, next);
    expect(handler.event.body).toEqual({
      attribute: "value",
    });
  });
});
