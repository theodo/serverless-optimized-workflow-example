import Mock = jest.Mock;

export const awsSdkPromiseResponseFactory = (): Mock<
  Promise<Record<string, never>>
> =>
  jest
    .fn<Promise<Record<string, never>>, []>()
    .mockReturnValue(Promise.resolve({}));
