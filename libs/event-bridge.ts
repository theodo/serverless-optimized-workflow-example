import { Bus } from "typebridge";
import { EventBridge } from "aws-sdk";

export default new Bus({
  name: "free",
  EventBridge: new EventBridge(),
});
