export const SlackSigningSecret = {
  Type: "AWS::SSM::Parameter",
  Properties: {
    Description: "Slack signing secret",
    Type: "String",
    Value: "replace me",
  },
};
