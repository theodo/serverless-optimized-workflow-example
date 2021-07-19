import { getParametersPromiseResponse } from "@mocks/aws-sdk/clients/ssmMock";

type SSMValues = {
  [ssmPath: string]: string;
};

/*
 * Use this to easily mock SSM usage.
 * Ex:
 * mockSSMValues({
 *     SLACK_SIGNING_SECRET_SSM_PATH: "afd7d68634789d972b57b302a90b127f",
 * });
 * 1. will populate process.env.SLACK_SIGNING_SECRET_SSM_PATH (which is done by the config in reality)
 *    Don't forget to import the handler dynamically to access the environment variable
 * 2. will mock the value returned by the SSM sdk
 *    => "afd7d68634789d972b57b302a90b127f" will be added as process.env.SLACK_SIGNING_SECRET according to the SSM middleware configuration
 */
export const mockSSMValues = (ssmValues: SSMValues): void => {
  Object.keys(ssmValues).forEach((ssmPath) => {
    process.env[ssmPath] = ssmPath;
  });
  getParametersPromiseResponse.mockResolvedValueOnce({
    Parameters: Object.entries(ssmValues).map(([ssmPath, ssmValue]) => ({
      Name: ssmPath,
      Value: ssmValue,
    })),
  });
};
