import type { AWS } from "@serverless/typescript";

import { getAttribute } from "./libs/configHelpers";

import { Table } from "./resources/dynamodb";
import { Bus } from "./resources/event-bridge";
import {
  SlackSigningSecret,
} from "./resources/ssm";
import { functions } from "./functions/config";

const serverlessConfiguration: AWS = {
  service: "workflow-example",
  frameworkVersion: "2",
  useDotenv: true,
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: {
        forceExclude: ["aws-sdk", "@types/aws-lambda"],
      },
      excludeFiles: "**/*.spec.ts",
    },
    eventBusArn:
      "arn:aws:events:#{AWS::Region}:#{AWS::AccountId}:event-bus/free",
    s3Sync: [
      {
        bucketNameKey: "FrontBucketName",
        localDir: "../frontend/build",
      },
    ],
    prune: {
      automatic: true,
      number: 5,
    },
  },
  plugins: [
    "serverless-webpack",
    "serverless-pseudo-parameters",
    "serverless-s3-sync",
    "serverless-plugin-bind-deployment-id",
    "serverless-prune-plugin",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    profile: "${env:PROFILE}",
    region: "eu-west-1",
    cfnRole: "${env:CFN_ROLE}",
    stage: "${opt:stage, 'dev'}",
    lambdaHashingVersion: "20201221", // Avoid deprecation warning. This would be the default behaviour in the next major version
    tracing: {
      lambda: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "events:PutEvents",
        Resource: getAttribute({ Bus }, "Arn"),
      },
      {
        Effect: "Allow",
        Resource: "arn:aws:ssm:#{AWS::Region}:#{AWS::AccountId}:parameter/*",
        Action: ["ssm:GetParameters"],
      },
      {
        Effect: "Allow",
        Resource:
          "arn:aws:dynamodb:#{AWS::Region}:#{AWS::AccountId}:table/#{Table}",
        Action: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
        ],
      },
    ],
  },
  functions,
  resources: {
    Conditions: {
      SkipInDev: {
        "Fn::Not": [{ "Fn::Equals": ["${self:provider.stage}", "dev"] }],
      },
      OnlyInDev: {
        "Fn::Equals": ["${self:provider.stage}", "dev"],
      },
    },
    Resources: {
      Bus,
      Table,
      SlackSigningSecret,
    },
  },
};

module.exports = serverlessConfiguration;
