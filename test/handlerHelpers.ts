import type { Context } from "aws-lambda";

/*
 * If the callback is null, the middified handler is async
 * If the callback is truthy, the middified is sync
 */
export const callbackForAsyncHandler = (null as unknown) as () => void;

export const handlerContext = ({} as unknown) as Context;
