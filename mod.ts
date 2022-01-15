export interface Disposable {
  dispose(): void;
}

export interface AsyncDisposable {
  dispose(): Promise<void>;
}

type UsingObject = Disposable | { close(): void } | { unsubscribe(): void };
type AsyncUsingObject = AsyncDisposable | { close(): Promise<void> } | {
  unsubscribe(): Promise<void>;
};

export function using<
  TDisposable extends UsingObject | AsyncUsingObject,
  TResult = void,
>(
  resource: TDisposable,
  func: (resource: TDisposable) => Promise<TResult>,
): Promise<TResult>;
export function using<TDisposable extends UsingObject, UIteratorItem>(
  resource: TDisposable,
  func: (resource: TDisposable) => IterableIterator<UIteratorItem>,
): IterableIterator<UIteratorItem>;
export function using<TDisposable extends AsyncUsingObject, TResult = void>(
  resource: TDisposable,
  func: (resource: TDisposable) => TResult,
): Promise<TResult>;
export function using<TDisposable extends UsingObject, TResult = void>(
  resource: TDisposable,
  func: (resource: TDisposable) => TResult,
): TResult;
export function using<
  TDisposable extends UsingObject | AsyncUsingObject,
  TIteratorItem,
  TResult,
>(
  resource: TDisposable,
  func: (
    resource: TDisposable,
  ) => TResult | Promise<TResult> | IterableIterator<TIteratorItem>,
): TResult | Promise<TResult> | IterableIterator<TIteratorItem> {
  let shouldDispose = true;
  let result:
    | TResult
    | Promise<TResult>
    | IterableIterator<TIteratorItem>
    | undefined = undefined;
  try {
    result = func(resource);

    // dispose it asynchronously if it returns a promise
    if (isPromise<TResult>(result)) {
      const capturedResult = result;
      shouldDispose = false;
      return result.finally(() => dispose(resource)).then(() => capturedResult);
    } else if (isIterator(result)) {
      shouldDispose = false;
      const originalNext = result.next!;
      result.next = function () {
        let shouldDispose = false;
        try {
          const args = Array.from(arguments);
          // deno-lint-ignore no-explicit-any
          const iterationResult = originalNext.apply(this, args as any);
          if (iterationResult.done) {
            shouldDispose = true;
          }
          return iterationResult;
        } catch (err) {
          shouldDispose = true;
          throw err;
        } finally {
          if (shouldDispose) {
            dispose(resource);
          }
        }
      };
    }
  } finally {
    if (shouldDispose) {
      const disposeResult = dispose(resource);
      if (isPromise<TResult>(disposeResult)) {
        const finalPromise = result == null
          ? undefined
          : Promise.resolve(result as TResult);
        if (finalPromise == null) {
          result = disposeResult;
        } else {
          result = disposeResult.then(() => finalPromise!);
        }
      }
    }
  }

  return result!;
}

const funcNames = ["dispose", "close", "unsubscribe"];
function dispose(obj: UsingObject | undefined): void | Promise<void> {
  if (obj == null) {
    return;
  }

  for (const funcName of funcNames) {
    // deno-lint-ignore no-explicit-any
    if (typeof (obj as any)[funcName] === "function") {
      // deno-lint-ignore no-explicit-any
      return (obj as any)[funcName]();
    }
  }

  throw new Error("Object provided to using did not have a dispose method.");
}

function isPromise<TResult>(obj: unknown): obj is Promise<TResult> {
  return obj != null &&
    // deno-lint-ignore no-explicit-any
    typeof (obj as any).then === "function" &&
    // deno-lint-ignore no-explicit-any
    typeof (obj as any).finally === "function";
}

function isIterator(obj: unknown): obj is Iterator<unknown> {
  return obj != null &&
    // deno-lint-ignore no-explicit-any
    typeof (obj as any).next === "function";
}
