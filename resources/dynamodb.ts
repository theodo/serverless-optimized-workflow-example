enum KeyType {
  HASH = "HASH",
  RANGE = "RANGE",
}
const { HASH, RANGE } = KeyType;

const PRIMARY_KEY = "PK";
const SORT_KEY = "SK";

const Table = {
  Type: "AWS::DynamoDB::Table",
  Properties: {
    AttributeDefinitions: [
      { AttributeName: PRIMARY_KEY, AttributeType: "S" },
      { AttributeName: SORT_KEY, AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: PRIMARY_KEY, KeyType: HASH },
      { AttributeName: SORT_KEY, KeyType: RANGE },
    ],
    TimeToLiveSpecification: {
      AttributeName: "_ttl",
      Enabled: true,
    },
    BillingMode: "PAY_PER_REQUEST",
    StreamSpecification: {
      StreamViewType: "NEW_IMAGE",
    },
  },
};

export { KeyType, PRIMARY_KEY, SORT_KEY, Table };
