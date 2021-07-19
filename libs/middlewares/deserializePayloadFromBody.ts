import type middy from "@middy/core";
import createHttpError from "http-errors";

export type ToDeserializePayloadEvent = {
  body: {
    payload?: string;
  };
};

const deserializePayloadFromBody: middy.Middleware<
  undefined,
  ToDeserializePayloadEvent
> = () => ({
  before: (handler, next) => {
    const payload = handler.event.body.payload;
    if (payload === undefined) {
      throw new createHttpError.BadRequest();
    }
    try {
      /**
       * @debt bug-risk:mutability This middleware mutate the event. This should be avoided
       */
      handler.event.body = JSON.parse(payload) as Record<string, unknown>;
    } catch (e) {
      throw new createHttpError.BadRequest();
    }
    next();
  },
});

export default deserializePayloadFromBody;
