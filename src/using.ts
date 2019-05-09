import { Disposable } from "./Disposable";

export function using<T extends Disposable>(resource: T, func: (resource: T) => void) {
    try {
        func(resource);
    } finally {
        resource.dispose();
    }
}
