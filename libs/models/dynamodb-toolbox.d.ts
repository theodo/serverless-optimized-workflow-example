/* eslint-disable max-lines  */
/* eslint-disable @typescript-eslint/no-explicit-any, import/no-extraneous-dependencies  */
// DynamoDB Toolbox TypeScript Definition
// TODO:
// - Add scan method
// - Use hidden directive to hide attributes from result type
// - Support for parse/execute
// - Type Table
// - Check attribute type before adding $delete, $remove in inputs
// - Allow use of schemas
// - Export Item, CompositeKey, Attributes... utility types
// - Use capacity input to shape return values

declare module "Helpers" {
  import type { A, B, L } from "ts-toolbelt";

  // Type does not exist in ts-toolbelt yet, but will soon: See https://github.com/millsp/ts-toolbelt/issues/169
  export type If<C extends B.Boolean, T, E = never> = C extends B.True
    ? B.True extends C
      ? T
      : E
    : E;

  export type FirstDefined<List extends L.List> = {
    stopNone: undefined;
    stopOne: L.Head<List>;
    continue: FirstDefined<L.Tail<List>>;
  }[A.Cast<
    If<
      A.Equals<List, []>,
      "stopNone",
      If<A.Equals<L.Head<List>, undefined>, "continue", "stopOne">
    >,
    "stopNone" | "stopOne" | "continue"
  >];
}

declare module "DynamoData" {
  export type Str = "string";
  export type Bool = "boolean";
  export type Num = "number";
  export type List = "list";
  export type Map = "map";
  export type Binary = "binary";
  export type Set = "set";
  export type Any = Str | Bool | Num | List | Map | Binary | Set;
}

declare module "Table" {
  import type { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

  import type DynamoData from "DynamoData";

  export type BatchWriteOperation = Record<string, Record<string, any>>;
  export type BatchGetOperation = Record<string, Record<string, any>>;

  export class Table {
    name: string;

    constructor(options: {
      name: string;
      alias?: string;
      partitionKey: string;
      sortKey?: string;
      entityField?: boolean | string;
      attributes?: Record<string, DynamoData.Any>;
      indexes?: Record<string, { partitionKey?: string; sortKey?: string }>;
      autoExecute?: boolean;
      autoParse?: boolean;
      DocumentClient?: DocumentClient;
    });

    batchWrite(
      operations: BatchWriteOperation[],
      options?: Record<string, any>,
      parameters?: Record<string, any>
    ): Promise<DocumentClient.BatchWriteItemOutput>;

    batchGet(
      operations: BatchGetOperation[],
      options?: Record<string, any>,
      parameters?: Record<string, any>
    ): Promise<DocumentClient.BatchGetItemOutput>;

    scan(
      options?: Record<string, any>,
      parameters?: Record<string, any>
    ): Promise<
      DocumentClient.ScanOutput & {
        next?: () => Promise<DocumentClient.ScanOutput>;
      }
    >;

    query(
      partitionKey: string,
      options?: Record<string, any>,
      parameters?: Record<string, any>
    ): Promise<
      DocumentClient.QueryOutput & {
        next?: () => Promise<DocumentClient.QueryOutput>;
      }
    >;
  }
}

declare module "Entity" {
  import type { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
  import type { A, B, O } from "ts-toolbelt";

  import type { FirstDefined, If } from "Helpers";
  import type DynamoData from "DynamoData";
  import type { BatchWriteOperation, Table } from "Table";

  type ConditionOrFilter<Attr> = ({ attr: Attr } | { size: string }) &
    O.Partial<{
      contains: string;
      exists: boolean;
      type: "S" | "SS" | "N" | "NS" | "B" | "BS" | "BOOL" | "NULL" | "L" | "M";
      or: boolean;
      negate: boolean;
      entity: string;
      /**
       * @debt dynamodb-toolbox-typing "Probably typable"
       */
      eq: any;
      ne: any;
      lt: any;
      lte: any;
      gt: any;
      gte: any;
      between: [any, any];
      beginsWith: any;
      in: any[];
    }>;

  type ConditionsOrFilters<Attr extends A.Key> =
    | ConditionOrFilter<Attr>
    | ConditionsOrFilters<Attr>[];

  type Capacity = "none" | "total" | "indexes";

  type BaseOptions = {
    capacity: Capacity;
    execute: boolean;
    parse: boolean;
  };

  type ReadOptions<Attributes extends A.Key> = BaseOptions & {
    attributes: Attributes[];
    consistent: boolean;
  };

  type GetOptions<Attributes extends A.Key = A.Key> = O.Partial<
    ReadOptions<Attributes>
  >;

  type QueryOptions<
    Attributes extends A.Key = A.Key,
    FiltersAttributes extends A.Key = Attributes
  > = O.Partial<
    ReadOptions<Attributes> & {
      index: string;
      limit: number;
      reverse: boolean;
      entity: string;
      select: string;
      filters: ConditionsOrFilters<FiltersAttributes>;
      /**
       * @debt dynamodb-toolbox-typing "Probably typable (should be same as sort key)"
       */
      eq: any;
      lt: any;
      lte: any;
      gt: any;
      gte: any;
      between: [any, any];
      beginsWith: any;
      parse: boolean;
    }
  >;

  type WriteOptions<Attributes extends A.Key> = BaseOptions & {
    conditions: ConditionsOrFilters<Attributes>;
    metrics: "none" | "size";
  };

  type PutOptionsReturnValues = "none" | "all_old";

  type PutOptions<
    Attributes extends A.Key = A.Key,
    ReturnValues extends PutOptionsReturnValues = PutOptionsReturnValues
  > = O.Partial<WriteOptions<Attributes> & { returnValues: ReturnValues }>;

  type UpdateOptionsReturnValues =
    | "none"
    | "updated_old"
    | "updated_new"
    | "all_old"
    | "all_new";

  type UpdateOptions<
    Attributes extends A.Key = A.Key,
    ReturnValues extends UpdateOptionsReturnValues = UpdateOptionsReturnValues
  > = O.Partial<WriteOptions<Attributes> & { returnValues: ReturnValues }>;

  type DeleteOptionsReturnValues = "none" | "all_old";

  type DeleteOptions<
    Attributes extends A.Key = A.Key,
    ReturnValues extends DeleteOptionsReturnValues = DeleteOptionsReturnValues
  > = O.Partial<WriteOptions<Attributes> & { returnValues: ReturnValues }>;

  type PKDefinition = {
    partitionKey: true;
    sortKey?: false;
    hidden?: boolean;
    type?: DynamoData.Str | DynamoData.Num | DynamoData.Binary;
    map?: never;
    save?: never;
    default?: any;
    required?: never;
  };

  type SKDefinition = {
    sortKey: true;
    partitionKey?: false;
    hidden?: boolean;
    type?: DynamoData.Str | DynamoData.Num | DynamoData.Binary;
    map?: never;
    save?: never;
    default?: any;
    required?: never;
  };

  type PureAttributeDefinition = O.Partial<{
    partitionKey: false;
    sortKey: false;
    hidden: boolean;
    type: DynamoData.Any;
    map: string;
    save: boolean;
    default: any;
    required: boolean | "always";
  }>;

  type MappedAttributeDefinition = [string, number, PureAttributeDefinition?];

  type AttributeDefinition =
    | DynamoData.Any
    | PKDefinition
    | SKDefinition
    | PureAttributeDefinition
    | MappedAttributeDefinition;

  type AttributeDefinitions = Record<string, AttributeDefinition>;

  type NotAliasesOverride<Aliases extends A.Key> = O.Partial<
    Record<Aliases, never> | O.Readonly<Record<Aliases, never>>
  >;

  type PreventKeys<O extends Record<A.Key, any>, K extends A.Key> = O &
    O.Partial<Record<K, never> & O.Readonly<Record<K, never>>>;

  interface AttributesShape<Attributes extends A.Key = A.Key> {
    aliases: Attributes;
    all: Attributes;
    default: Attributes;
    key: {
      partitionKey: { pure: Attributes; mapped: Attributes; all: Attributes };
      sortKey: { pure: Attributes; mapped: Attributes; all: Attributes };
      all: Attributes;
    };
    always: { all: Attributes; default: Attributes; input: Attributes };
    required: { all: Attributes; default: Attributes; input: Attributes };
    optional: Attributes;
  }

  type InferKeyAttribute<
    Definitions extends AttributeDefinitions,
    KeyType extends "partitionKey" | "sortKey"
  > = O.SelectKeys<Definitions, Record<KeyType, true>>;

  type InferMappedAttributes<
    Definitions extends AttributeDefinitions,
    AttributeName extends A.Key
  > = O.SelectKeys<Definitions, [AttributeName, any, any?]>;

  type InferAttributes<
    Definitions extends AttributeDefinitions,
    CreatedAlias extends string,
    ModifiedAlias extends string,
    TypeAlias extends string,
    Aliases extends string = CreatedAlias | ModifiedAlias | TypeAlias,
    Attribute extends A.Key = keyof Definitions | Aliases,
    Default extends A.Key =
      | O.SelectKeys<
          Definitions,
          { default: any } | [any, any, { default: any }]
        >
      | Aliases,
    PK extends A.Key = InferKeyAttribute<Definitions, "partitionKey">,
    PKMappedAttribute extends A.Key = InferMappedAttributes<Definitions, PK>,
    SK extends A.Key = InferKeyAttribute<Definitions, "sortKey">,
    SKMappedAttribute extends A.Key = InferMappedAttributes<Definitions, SK>,
    KeyAttributes = PK | PKMappedAttribute | SK | SKMappedAttribute,
    AlwaysAttributes extends A.Key = Exclude<
      | O.SelectKeys<
          Definitions,
          { required: "always" } | [any, any, { required: "always" }]
        >
      | ModifiedAlias,
      KeyAttributes
    >,
    RequiredAttributes extends A.Key = Exclude<
      | O.SelectKeys<
          Definitions,
          { required: true } | [any, any, { required: true }]
        >
      | CreatedAlias
      | TypeAlias,
      KeyAttributes
    >
  > = {
    aliases: Aliases;
    all: Attribute;
    default: Default;
    key: {
      partitionKey: {
        pure: PK;
        mapped: PKMappedAttribute;
        all: PK | PKMappedAttribute;
      };
      sortKey: {
        pure: SK;
        mapped: SKMappedAttribute;
        all: SK | SKMappedAttribute;
      };
      all: KeyAttributes;
    };
    always: {
      all: AlwaysAttributes;
      default: Extract<AlwaysAttributes, Default>;
      input: Exclude<AlwaysAttributes, Default>;
    };
    required: {
      all: RequiredAttributes;
      default: Extract<RequiredAttributes, Default>;
      input: Exclude<RequiredAttributes, Default>;
    };
    optional: Exclude<
      Attribute,
      KeyAttributes | AlwaysAttributes | RequiredAttributes
    >;
  };

  type FromDynamoData<T extends DynamoData.Any> = {
    string: string;
    boolean: boolean;
    number: number;
    list: any[];
    map: Record<string, any>;
    binary: any;
    set: any[];
  }[T];

  type InferItemAttributeValue<
    Definitions extends AttributeDefinitions,
    AttributeName extends keyof Definitions,
    Definition = Definitions[AttributeName]
  > = {
    dynamoDbType: Definition extends DynamoData.Any
      ? FromDynamoData<Definition>
      : never;
    pure: Definition extends
      | PKDefinition
      | SKDefinition
      | PureAttributeDefinition
      ? Definition["type"] extends DynamoData.Any
        ? FromDynamoData<A.Cast<Definition["type"], DynamoData.Any>>
        : any
      : never;
    mapped: Definition extends MappedAttributeDefinition
      ? Definition[0] extends Exclude<keyof Definitions, AttributeName>
        ? InferItemAttributeValue<Definitions, Definition[0]>
        : any
      : never;
  }[Definition extends DynamoData.Any
    ? "dynamoDbType"
    : Definition extends PKDefinition | SKDefinition | PureAttributeDefinition
    ? "pure"
    : Definition extends MappedAttributeDefinition
    ? "mapped"
    : never];

  type InferItem<
    Definitions extends AttributeDefinitions,
    Attributes extends AttributesShape
  > = O.Optional<
    {
      [K in Attributes["all"]]: K extends keyof Definitions
        ? InferItemAttributeValue<Definitions, K>
        : K extends Attributes["aliases"]
        ? string
        : never;
    },
    Attributes["optional"]
  >;

  type CompositeKey<
    Item extends Record<A.Key, any>,
    Attributes extends AttributesShape<keyof Item>,
    KeyType extends "partitionKey" | "sortKey",
    KeyPureAttribute extends keyof Item = Attributes["key"][KeyType]["pure"],
    KeyMappedAttributes extends keyof Item = Attributes["key"][KeyType]["mapped"]
  > = If<
    A.Equals<KeyPureAttribute, never>,
    Record<never, unknown>,
    O.Optional<
      | O.Pick<Item, KeyPureAttribute>
      | If<
          A.Equals<KeyMappedAttributes, never>,
          never,
          O.Pick<Item, KeyMappedAttributes>
        >,
      Attributes["default"]
    >
  >;

  type InferCompositeKey<
    Item extends Record<A.Key, any>,
    Attributes extends AttributesShape<keyof Item>
  > = A.Compute<
    CompositeKey<Item, Attributes, "partitionKey"> &
      CompositeKey<Item, Attributes, "sortKey">
  >;

  type Overlay = undefined | Record<A.Key, any>;

  export class Entity<
    EntityItemOverlay extends Overlay = undefined,
    EntityCompositeKeyOverlay extends Overlay = EntityItemOverlay,
    Name extends string = string,
    CreatedAlias extends string = "created",
    ModifiedAlias extends string = "modified",
    TypeAlias extends string = "entity",
    ReadonlyAttributeDefinitions extends PreventKeys<
      AttributeDefinitions | O.Readonly<AttributeDefinitions, A.Key, "deep">,
      CreatedAlias | ModifiedAlias | TypeAlias
    > = PreventKeys<
      AttributeDefinitions,
      CreatedAlias | ModifiedAlias | TypeAlias
    >,
    WritableAttributeDefinitions extends AttributeDefinitions = O.Writable<
      ReadonlyAttributeDefinitions,
      A.Key,
      "deep"
    >,
    Attributes extends AttributesShape = If<
      A.Equals<EntityItemOverlay, undefined>,
      InferAttributes<
        WritableAttributeDefinitions,
        CreatedAlias,
        ModifiedAlias,
        TypeAlias
      >,
      AttributesShape<keyof EntityItemOverlay>
    >,
    Item extends Record<A.Key, any> = If<
      A.Equals<EntityItemOverlay, undefined>,
      InferItem<WritableAttributeDefinitions, Attributes>,
      A.Cast<EntityItemOverlay, Record<A.Key, any>>
    >,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    CompositeKey extends Record<A.Key, any> = If<
      A.Equals<EntityItemOverlay, undefined>,
      InferCompositeKey<Item, Attributes>,
      Record<A.Key, any>
    >
  > {
    constructor(
      options: {
        name: Name;
        createdAlias?: CreatedAlias;
        modifiedAlias?: ModifiedAlias;
        typeAlias?: TypeAlias;
        attributes: ReadonlyAttributeDefinitions;
      } & Record<string, any>
    );

    readonly name: Name;
    table: Table;
    readonly DocumentClient: DocumentClient;
    autoExecute: boolean;
    autoParse: boolean;
    readonly partitionKey: Attributes["key"]["partitionKey"]["pure"];
    readonly sortKey: Attributes["key"]["sortKey"]["pure"];
    /**
     * @debt dynamodb-toolbox-typing "not a real prop but maybe it should be ?"
     */
    attributeNames: Attributes["all"][];

    getParams<
      MethodItemOverlay extends Overlay = undefined,
      MethodCompositeKeyOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes
    >(
      primaryKey: FirstDefined<
        [MethodCompositeKeyOverlay, EntityCompositeKeyOverlay, CompositeKey]
      >,
      options?: GetOptions<ResponseAttributes>,
      parameters?: Record<string, any>
    ): DocumentClient.GetItemInput;
    get<
      MethodItemOverlay extends Overlay = undefined,
      MethodCompositeKeyOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes
    >(
      primaryKey: FirstDefined<
        [MethodCompositeKeyOverlay, EntityCompositeKeyOverlay, CompositeKey]
      >,
      options?: GetOptions<ResponseAttributes>,
      parameters?: Record<string, any>
    ): Promise<
      A.Compute<
        O.Update<
          DocumentClient.GetItemOutput,
          "Item",
          FirstDefined<[MethodItemOverlay, O.Pick<Item, ResponseAttributes>]>
        >
      >
    >;

    deleteParams<
      MethodItemOverlay extends Overlay = undefined,
      MethodCompositeKeyOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes
    >(
      primaryKey: FirstDefined<
        [MethodCompositeKeyOverlay, EntityCompositeKeyOverlay, CompositeKey]
      >,
      options?: DeleteOptions<ResponseAttributes>,
      parameters?: Record<string, any>
    ): DocumentClient.DeleteItemInput;
    delete<
      MethodItemOverlay extends Overlay = undefined,
      MethodCompositeKeyOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes,
      ReturnValues extends DeleteOptionsReturnValues = "none"
    >(
      primaryKey: FirstDefined<
        [MethodCompositeKeyOverlay, EntityCompositeKeyOverlay, CompositeKey]
      >,
      options?: DeleteOptions<ResponseAttributes, ReturnValues>,
      parameters?: Record<string, any>
    ): Promise<
      If<
        B.And<
          A.Equals<MethodItemOverlay, undefined>,
          A.Equals<ReturnValues, "none">
        >,
        O.Omit<DocumentClient.PutItemOutput, "Attributes">,
        O.Update<
          DocumentClient.PutItemOutput,
          "Attributes",
          FirstDefined<[MethodItemOverlay, EntityItemOverlay, Item]>
        >
      >
    >;

    putParams<
      MethodItemOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes
    >(
      item: FirstDefined<
        [
          MethodItemOverlay,
          EntityItemOverlay,
          A.Compute<
            CompositeKey &
              O.Pick<
                Item,
                Attributes["always"]["input"] | Attributes["required"]["input"]
              > &
              O.Partial<
                O.Pick<
                  Item,
                  | Attributes["always"]["default"]
                  | Attributes["required"]["default"]
                  | Attributes["optional"]
                >
              >
          >
        ]
      >,
      options?: PutOptions<ResponseAttributes>,
      parameters?: Record<string, any>
    ): DocumentClient.PutItemInput;
    put<
      MethodItemOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes,
      ReturnValues extends PutOptionsReturnValues = "none"
    >(
      item: FirstDefined<
        [
          MethodItemOverlay,
          EntityItemOverlay,
          A.Compute<
            CompositeKey &
              O.Pick<
                Item,
                Attributes["always"]["input"] | Attributes["required"]["input"]
              > &
              O.Partial<
                O.Pick<
                  Item,
                  | Attributes["always"]["default"]
                  | Attributes["required"]["default"]
                  | Attributes["optional"]
                >
              >
          >
        ]
      >,
      options?: PutOptions<ResponseAttributes, ReturnValues>,
      parameters?: Record<string, any>
    ): Promise<
      If<
        B.And<
          A.Equals<MethodItemOverlay, undefined>,
          A.Equals<ReturnValues, "none">
        >,
        O.Omit<DocumentClient.PutItemOutput, "Attributes">,
        O.Update<
          DocumentClient.PutItemOutput,
          "Attributes",
          FirstDefined<[MethodItemOverlay, EntityItemOverlay, Item]>
        >
      >
    >;

    updateParams<
      MethodItemOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes
    >(
      updatedValues: FirstDefined<
        [
          MethodItemOverlay,
          EntityItemOverlay,
          A.Compute<
            CompositeKey &
              {
                [askedAttr in Attributes["always"]["input"]]:
                  | Item[askedAttr]
                  | { $delete?: string[]; $add?: any };
              } &
              {
                [optAttr in
                  | Attributes["required"]["all"]
                  | Attributes["always"]["default"]]?:
                  | Item[optAttr]
                  | { $delete?: string[]; $add?: any };
              } &
              {
                [attr in Attributes["optional"]]?:
                  | null
                  | Item[attr]
                  | { $delete?: string[]; $add?: any };
              } & { $remove?: Attributes["optional"][] }
          >
        ]
      >,
      options?: UpdateOptions<ResponseAttributes>,
      parameters?: Record<string, any>
    ): DocumentClient.UpdateItemInput;
    update<
      MethodItemOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes,
      ReturnValues extends UpdateOptionsReturnValues = "none"
    >(
      updatedValues: FirstDefined<
        [
          MethodItemOverlay,
          EntityItemOverlay,
          A.Compute<
            CompositeKey &
              {
                [askedAttr in Attributes["always"]["input"]]:
                  | Item[askedAttr]
                  | { $delete?: string[]; $add?: any };
              } &
              {
                [optAttr in
                  | Attributes["required"]["all"]
                  | Attributes["always"]["default"]]?:
                  | Item[optAttr]
                  | { $delete?: string[]; $add?: any };
              } &
              {
                [attr in Attributes["optional"]]?:
                  | null
                  | Item[attr]
                  | { $delete?: string[]; $add?: any };
              } & { $remove?: Attributes["optional"][] }
          >
        ]
      >,
      options?: UpdateOptions<ResponseAttributes, ReturnValues>,
      parameters?: Record<string, any>
    ): Promise<
      A.Compute<
        If<
          B.And<
            A.Equals<MethodItemOverlay, undefined>,
            A.Equals<ReturnValues, "none">
          >,
          O.Omit<DocumentClient.UpdateItemOutput, "Attributes">,
          O.Update<
            DocumentClient.UpdateItemOutput,
            "Attributes",
            FirstDefined<
              [
                MethodItemOverlay,
                EntityItemOverlay,
                O.Pick<Item, ResponseAttributes>
              ]
            >
          >
        >
      >
    >;

    queryParams<
      MethodItemOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes,
      FiltersAttributes extends ItemAttributes = ResponseAttributes
    >(
      partitionKey: string | number,
      options?: QueryOptions<ResponseAttributes, FiltersAttributes>,
      parameters?: Record<string, any>
    ): DocumentClient.QueryInput;
    query<
      MethodItemOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes,
      FiltersAttributes extends ItemAttributes = ResponseAttributes
    >(
      partitionKey: unknown,
      options?: QueryOptions<ResponseAttributes, FiltersAttributes>,
      parameters?: Record<string, any>
    ): Promise<
      A.Compute<
        O.Update<
          DocumentClient.QueryOutput,
          "Items",
          FirstDefined<[MethodItemOverlay, O.Pick<Item, ResponseAttributes>]>[]
        >
      > & {
        next?: () => Promise<
          A.Compute<
            O.Update<
              DocumentClient.QueryOutput,
              "Items",
              FirstDefined<
                [MethodItemOverlay, O.Pick<Item, ResponseAttributes>]
              >[]
            >
          >
        >;
      }
    >;

    putBatch(
      item: Record<string, any>,
      options?: Record<string, any>,
      parameters?: Record<string, any>
    ): BatchWriteOperation;
    deleteBatch(
      primaryKey: Record<string, any>,
      options?: Record<string, any>,
      parameters?: Record<string, any>
    ): BatchWriteOperation;

    parse<
      MethodItemOverlay extends Overlay = undefined,
      ItemAttributes extends A.Key = If<
        A.Equals<MethodItemOverlay, undefined>,
        Attributes["all"],
        keyof MethodItemOverlay
      >,
      ResponseAttributes extends ItemAttributes = ItemAttributes
    >(
      item: any
    ): FirstDefined<[MethodItemOverlay, O.Pick<Item, ResponseAttributes>]>;
  }

  export type GenericEntity = Entity<
    undefined | Record<string, any>,
    undefined | Record<string, any>,
    string,
    string,
    string,
    string,
    Record<A.Key, never>,
    Record<A.Key, any>,
    AttributesShape,
    Record<A.Key, any>,
    Record<A.Key, any>
  >;

  /**
   * @debt dynamodb-toolbox-typings "Rename EntityConditionsOrFilters"
   */
  export type EntityConditions<
    E extends GenericEntity = GenericEntity
  > = ConditionsOrFilters<E["attributeNames"][number]>;
}

declare module "dynamodb-toolbox" {
  export { Table } from "Table";
  export { Entity, EntityConditions, GenericEntity } from "Entity";
}
