export const ref = <R extends Record<string, unknown>>(
  resource: R
): Record<"Ref", keyof R> => {
  if (Object.keys(resource).length !== 1) {
    throw new Error("Ref can only be used on one resource.");
  }
  const [resourceName] = Object.keys(resource) as (keyof R)[];

  return { Ref: resourceName };
};

export const getAttribute = <
  R extends Record<string, unknown>,
  A extends "Arn" | "RootResourceId" | "StreamArn"
>(
  resource: R,
  attribute: A
): Record<"Fn::GetAtt", [keyof R, A]> => {
  if (Object.keys(resource).length !== 1) {
    throw new Error("Fn:GetAtt can only be used on one resource");
  }
  const [resourceName] = Object.keys(resource) as (keyof R)[];

  return { "Fn::GetAtt": [resourceName, attribute] };
};

export const CORS_CONFIG = {
  origin: "${env:FRONTEND_DOMAIN}",
  headers: ["Content-Type", "Authorization", "Origin"],
};

export const CORS_ENV = {
  CORS_ALLOWED_ORIGIN: "${env:FRONTEND_DOMAIN}",
};

export const logicalId = <R extends Record<string, unknown>>(
  resource: R
): keyof R => {
  if (Object.keys(resource).length !== 1) {
    throw new Error("logicalId can only be used on one resource");
  }
  const [resourceName] = Object.keys(resource) as (keyof R)[];

  return resourceName;
};
