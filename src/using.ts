import { Disposable } from "./Disposable";

export function using<TDisposable extends Disposable>(resource: TDisposable, func: (resource: TDisposable) => Promise<void>): Promise<void>;
export function using<TDisposable extends Disposable, UIteratorItem>(resource: TDisposable, func: (resource: TDisposable) => IterableIterator<UIteratorItem>): IterableIterator<UIteratorItem>;
export function using<TDisposable extends Disposable>(resource: TDisposable, func: (resource: TDisposable) => void): void;
export function using<TDisposable extends Disposable, UIteratorItem>(resource: TDisposable, func: (resource: TDisposable) => void | Promise<void> | IterableIterator<UIteratorItem>): void | Promise<void> | IterableIterator<UIteratorItem> {
    let shouldDispose = true;
    try {
        const result = func(resource);

        // dispose it asynchronously if it returns a promise
        if (isPromise(result)) {
            shouldDispose = false;
            return result.finally(() => resource.dispose());
        }
        else if (isIterator(result)) {
            shouldDispose = false;
            const originalNext = result.next!;
            result.next = function() {
                let shouldDispose = false;
                try {
                    const args = Array.from(arguments);
                    const iterationResult = originalNext.apply(this, args as any);
                    if (iterationResult.done)
                        shouldDispose = true;
                    return iterationResult;
                } catch (err) {
                    shouldDispose = true;
                    throw err;
                } finally {
                    if (shouldDispose)
                        resource.dispose();
                }
            };

            return result;
        }
    } finally {
        if (shouldDispose)
            resource.dispose();
    }
}

function isPromise(obj: unknown): obj is Promise<void> {
    return obj != null
        && typeof (obj as any).then === "function"
        && typeof (obj as any).finally === "function";
}

function isIterator(obj: unknown): obj is Iterator<unknown> {
    return obj != null
        && typeof (obj as any).next === "function";
}
