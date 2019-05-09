import { Disposable } from "./Disposable";

export function using<T extends Disposable>(resource: T, func: (resource: T) => Promise<void>): Promise<void>;
export function using<T extends Disposable>(resource: T, func: (resource: T) => void): void;
export function using<T extends Disposable>(resource: T, func: (resource: T) => void | Promise<void>): void | Promise<void> {
    let shouldDisposeSynchronously = true;
    try {
        const result = func(resource);

        // dispose it asynchronously if it returns a promise
        if (isPromise(result)) {
            shouldDisposeSynchronously = false;
            return result.finally(() => resource.dispose());
        }
    } finally {
        if (shouldDisposeSynchronously)
            resource.dispose();
    }
}

function isPromise(obj: unknown): obj is Promise<void> {
    return obj != null
        && typeof (obj as any).then === "function"
        && typeof (obj as any).finally === "function";
}