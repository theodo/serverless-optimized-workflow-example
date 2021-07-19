import type middy from "@middy/core";

const mockLogger: middy.Middleware<undefined> = () => ({
  before: (handler, next) => {
    console.log("IncomingEvent :");
    console.log(JSON.stringify(handler.event));
    next();
  },
});
/*
 * ## Mock an event for local development ##
 * 1. In the function handler, use this middleware before any other middleware to get an unmodified mock:
 *    export const main = middy(handler)
 *    .use(mockLogger())
 *    .use(firstMiddleware())
 * 2. Deploy the function
 * 3. Run the function in its real flow
 * 4. Copy the mock from CloudWatch logs
 * 5. Paste the mock in a `mock.json` file in the function folder
 * 6. You can now run locally your function with a real input event:
 *    FUNCTION_NAME=<functionName> npm run local
 */
export default mockLogger;
