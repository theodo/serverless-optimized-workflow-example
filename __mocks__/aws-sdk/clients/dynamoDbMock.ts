import { awsSdkPromiseResponseFactory } from "@mocks/aws-sdk/helpers";
import type { DocumentClient as DocumentClientType } from "aws-sdk/lib/dynamodb/document_client";
import type { AttributeMap } from "aws-sdk/clients/dynamodb";
import type { Converter } from "aws-sdk/lib/dynamodb/converter";
import Mock = jest.Mock;

export const getPromiseResponse: Mock<
  Promise<DocumentClientType.GetItemOutput>
> = awsSdkPromiseResponseFactory();

export const getMock = jest.fn(() => ({
  promise: getPromiseResponse,
}));

export const putPromiseResponse: Mock<
  Promise<DocumentClientType.PutItemOutput>
> = awsSdkPromiseResponseFactory();

export const putMock: Mock<
  { promise: () => Promise<DocumentClientType.PutItemOutput> },
  [DocumentClientType.PutItemInput] | []
> = jest.fn(() => ({
  promise: putPromiseResponse,
}));

export const deletePromiseResponse: Mock<
  Promise<DocumentClientType.DeleteItemOutput>
> = awsSdkPromiseResponseFactory();

export const deleteMock = jest.fn(() => ({
  promise: deletePromiseResponse,
}));

export const updatePromiseResponse: Mock<
  Promise<DocumentClientType.UpdateItemOutput>
> = awsSdkPromiseResponseFactory();

export const updateMock: Mock<
  { promise: () => Promise<DocumentClientType.UpdateItemOutput> },
  [DocumentClientType.UpdateItemInput] | []
> = jest.fn(() => ({
  promise: updatePromiseResponse,
}));

export const queryPromiseResponse: Mock<
  Promise<DocumentClientType.QueryOutput>
> = awsSdkPromiseResponseFactory();

export const queryMock: Mock<
  { promise: () => Promise<DocumentClientType.QueryOutput> },
  [DocumentClientType.QueryInput] | []
> = jest.fn(() => ({
  promise: queryPromiseResponse,
}));

class DocumentClient {
  get = getMock;
  put = putMock;
  delete = deleteMock;
  update = updateMock;
  query = queryMock;
  options = { convertEmptyValues: true };
}

class ConverterMock {
  public static unmarshall(
    ...args: [
      data: { [key: string]: any },
      options?: Converter.ConverterOptions
    ]
  ): AttributeMap {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return jest
      .requireActual("aws-sdk/clients/dynamodb")
      .Converter.unmarshall(...args);
  }
}

export const DynamoDB = {
  DocumentClient,
  Converter: ConverterMock,
};
