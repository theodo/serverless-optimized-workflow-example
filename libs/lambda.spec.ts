import { getHandlerPath } from "./lambda";

describe("backend/libs/lambda.ts", () => {
  describe("#getHandlerPath", () => {
    it("should return handler path", () => {
      expect(
        getHandlerPath(
          "/myCustomDirectory/myProjectDirectory/backend/functions/myFunction"
        )
      ).toEqual("functions/myFunction/handler.main");
    });
  });
});
