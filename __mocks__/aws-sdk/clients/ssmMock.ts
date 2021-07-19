import { awsSdkPromiseResponseFactory } from "@mocks/aws-sdk/helpers";
import type { GetParametersResult } from "aws-sdk/clients/ssm";
import Mock = jest.Mock;

export const getParametersPromiseResponse: Mock<
  Promise<GetParametersResult>
> = awsSdkPromiseResponseFactory();

export const getParametersMock = jest.fn(() => ({
  promise: getParametersPromiseResponse,
}));

export class SSM {
  getParameters = getParametersMock;
}
