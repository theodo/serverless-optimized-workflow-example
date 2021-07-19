import type { APIGatewayProxyEvent, Handler } from "aws-lambda";
import middy from "@middy/core";
import httpUrlencodeBodyParser from "@middy/http-urlencode-body-parser";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import jsonValidator from "@middy/validator";
import ssmMiddleware from "@middy/ssm";
import httpErrorHandler from "@middy/http-error-handler";
import corsMiddleware from "@middy/http-cors";
import verifySlackAppSignature from "@libs/middlewares/verifySlackAppSignature";
import type { ToDeserializePayloadEvent } from "@libs/middlewares/deserializePayloadFromBody";
import deserializePayloadFromBody from "@libs/middlewares/deserializePayloadFromBody";
import mockLogger from "@libs/middlewares/mockLogger";
import embeddedMetrics from "@libs/middlewares/embeddedMetrics";
export enum BodyFormat {
  UrlEncoded,
  SlackPayload,
  Json,
}
type ApplyMiddlewaresOptions = {
  inputSchema: unknown;
  bodyFormat?: BodyFormat;
  ssmParams?: Record<string, string>;
  verifySlackSignature?: boolean;
  logEvent?: boolean;
  cors?: boolean;
};

// There are lots of cases but they are simple
// eslint-disable-next-line complexity
const applyMiddlewares = <T, R>(
  handler: Handler<T, R>,
  options: ApplyMiddlewaresOptions
): middy.Middy<T, R> => {
  const {
    inputSchema,
    bodyFormat,
    ssmParams,
    logEvent = false,
    verifySlackSignature = false,
    cors = false,
  } = options;
  const middyfiedHandler = middy(handler);

  if (logEvent) {
    middyfiedHandler.use(mockLogger());
  }

  middyfiedHandler.use(httpErrorHandler());

  middyfiedHandler.use(embeddedMetrics());

  if (cors) {
    middyfiedHandler.use(
      corsMiddleware({ origin: process.env.CORS_ALLOWED_ORIGIN })
    );
  }

  if (ssmParams) {
    middyfiedHandler.use(
      ssmMiddleware({
        cache: true,
        cacheExpiryInMillis: 3600000,
        names: ssmParams,
      })
    );
  }

  if (verifySlackSignature) {
    middyfiedHandler.use<
      middy.MiddlewareObject<Extract<T, APIGatewayProxyEvent>, R>
    >(verifySlackAppSignature());
  }

  switch (bodyFormat) {
    case BodyFormat.UrlEncoded:
      middyfiedHandler.use(httpUrlencodeBodyParser());
      break;
    case BodyFormat.SlackPayload:
      middyfiedHandler.use(httpUrlencodeBodyParser());
      middyfiedHandler.use<
        middy.MiddlewareObject<Extract<T, ToDeserializePayloadEvent>, R>
      >(deserializePayloadFromBody());
      break;
    case BodyFormat.Json:
      middyfiedHandler.use(httpJsonBodyParser());
      break;
    case undefined:
      break;
  }

  middyfiedHandler.use(jsonValidator({ inputSchema }));

  return middyfiedHandler;
};

export default applyMiddlewares;
