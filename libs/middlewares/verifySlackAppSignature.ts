import type middy from "@middy/core";
import type { APIGatewayProxyEvent } from "aws-lambda";
import createHttpError from "http-errors";
import crypto from "crypto";
import { IS_TEST } from "@test/isTest";

const SECONDS_IN_A_MINUTE = 60;
const REQUEST_EXPIRATION_IN_MINUTES = 5;

const verifyTimestampValidity = (timestamp: string): void => {
  if (Number.isNaN(Number(timestamp))) {
    throw new createHttpError.BadRequest();
  }
  const nowTimeStamp = Math.floor(new Date().getTime() / 1000);
  const isRequestIssuedInTheFuture = nowTimeStamp - Number(timestamp) < 0;
  const isRequestTooOld =
    nowTimeStamp - Number(timestamp) >
    REQUEST_EXPIRATION_IN_MINUTES * SECONDS_IN_A_MINUTE;
  const isToleratedOld = Boolean(process.env.IS_LOCAL) || IS_TEST;

  if (isRequestIssuedInTheFuture || (isRequestTooOld && !isToleratedOld)) {
    throw new createHttpError.BadRequest();
  }
};

const SLACK_SIGNATURE_VERSION = "v0";
const computeSlackSignature = (body: string, timestamp: string): string => {
  const requestSignature = [SLACK_SIGNATURE_VERSION, timestamp, body].join(":");

  const hashedSignature = crypto
    /**
     * @debt bug-risk:environment-variables The definition of the variable is never checked
     */
    .createHmac("sha256", process.env.SLACK_SIGNING_SECRET as string)
    .update(requestSignature)
    .digest("hex");

  return `v0=${hashedSignature}`;
};

const areSignaturesDifferent = (
  signature1: string,
  signature2: string
): boolean =>
  signature1.length !== signature2.length ||
  !crypto.timingSafeEqual(Buffer.from(signature1), Buffer.from(signature2)); // this prevents timing-based attack

const verifySlackAppSignature: middy.Middleware<
  undefined,
  APIGatewayProxyEvent
> = () => ({
  before: (handler, next) => {
    const body = handler.event.body;
    const timestamp = handler.event.headers["X-Slack-Request-Timestamp"];
    const signature = handler.event.headers["X-Slack-Signature"];
    if (signature === undefined || body === null || timestamp === undefined) {
      throw new createHttpError.BadRequest();
    }
    verifyTimestampValidity(timestamp);
    const requestSignature = computeSlackSignature(body, timestamp);

    if (!IS_TEST && areSignaturesDifferent(requestSignature, signature)) {
      throw new createHttpError.BadRequest();
    }
    next();
  },
});

export default verifySlackAppSignature;
