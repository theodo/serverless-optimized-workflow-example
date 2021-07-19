import { Entity } from "dynamodb-toolbox";

import { ModelName } from "@libs/models/index";
import { DBTable } from "./table";

export const Team = new Entity({
  name: ModelName.Team,
  attributes: {
    modelName: {
      partitionKey: true,
      hidden: true,
      type: "string",
      default: ModelName.Team,
    },
    id: { type: "string", sortKey: true },
    name: { type: "string", required: true },
    accessToken: { type: "string", required: true },
  },
  table: DBTable,
} as const);
