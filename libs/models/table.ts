import { DynamoDB } from "aws-sdk";
import { Table } from "dynamodb-toolbox";

import { PRIMARY_KEY, SORT_KEY } from "../../resources/dynamodb";

const DocumentClient = new DynamoDB.DocumentClient();

// DynamoDbToolboxEntity.parse could be used without interacting with the db => TABLE_NAME could be not needed
process.env.TABLE_NAME =
  process.env.TABLE_NAME ?? "Provide TABLE_NAME to interact with dynamoDb";

export const DBTable = new Table({
  name: process.env.TABLE_NAME,
  partitionKey: PRIMARY_KEY,
  sortKey: SORT_KEY,
  autoExecute: true,
  autoParse: true,
  DocumentClient,
  attributes: {
    [PRIMARY_KEY]: "string",
    [SORT_KEY]: "string",
  },
});
