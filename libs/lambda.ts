export const getHandlerPath = (
  dirName: string,
  handlerRelativePath = "/handler.main"
): string => dirName.split("backend/")[1] + handlerRelativePath;
