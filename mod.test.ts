import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.121.0/testing/asserts.ts";
import {
  assert,
  IsExact,
} from "https://deno.land/x/conditional_type_checks@1.0.5/mod.ts";
import { using } from "./mod.ts";

class Disposable {
  isDisposed = false;

  dispose() {
    this.isDisposed = true;
  }
}

class AsyncDisposable {
  isDisposed = false;

  dispose() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.isDisposed = true;
        resolve();
      }, 0);
    });
  }
}

Deno.test("using - sync - should dispose the resource", () => {
  const disposable = new Disposable();
  using(disposable, () => {
    assertEquals(disposable.isDisposed, false);
  });

  assertEquals(disposable.isDisposed, true);
});

Deno.test("using - sync - should dispose the resource when an exception occurs inside the function", () => {
  const disposable = new Disposable();
  try {
    using(disposable, () => {
      throw new Error();
    });
  } catch {
    // do nothing
  }

  assertEquals(disposable.isDisposed, true);
});

Deno.test("using - sync - should return the returned value", () => {
  const disposable = new Disposable();
  const result = using(disposable, () => {
    return 5;
  });

  assertEquals(result, 5);
});

Deno.test("using - sync - should dispose the resource asynchronously", async () => {
  const disposable = new AsyncDisposable();
  const result = using(disposable, () => {
    assertEquals(disposable.isDisposed, false);
  });

  assertEquals(disposable.isDisposed, false);
  await result;
  assertEquals(disposable.isDisposed, true);
});

Deno.test("using - sync - should dispose the resource asynchronously and return the result in the promise", async () => {
  const disposable = new AsyncDisposable();
  const promise = using(disposable, () => {
    return 5;
  });

  assert<IsExact<typeof promise, Promise<number>>>(true);
  const result = await promise;
  assertEquals(result, 5);
});

const methodNames = ["dispose", "close", "unsubscribe"];
for (const methodName of methodNames) {
  Deno.test(`should dispose using #${methodName}()`, () => {
    let isDisposed = false;
    const obj = {
      [methodName]() {
        isDisposed = true;
      },
    };
    // deno-lint-ignore no-explicit-any
    using(obj as any, () => {
      assertEquals(isDisposed, false);
    });

    assertEquals(isDisposed, true);
  });
}

Deno.test("using - sync - should throw when providing an object that's not supported", () => {
  // deno-lint-ignore no-explicit-any
  assertThrows(() => using({} as any, () => {}));
});

Deno.test("using - sync - should not error if providing undefined", () => {
  let entered = false;

  // deno-lint-ignore no-explicit-any
  using(undefined as any, () => {
    entered = true;
  });

  assertEquals(entered, true);
});

Deno.test("using - sync - should not error if providing null", () => {
  let entered = false;

  // deno-lint-ignore no-explicit-any
  using(undefined as any, () => {
    entered = true;
  });

  assertEquals(entered, true);
});

Deno.test("using - async - should dispose the resource", async () => {
  const disposable = new Disposable();
  const result = using(disposable, () => {
    assertEquals(disposable.isDisposed, false);
    return new Promise<void>((resolve) => {
      assertEquals(disposable.isDisposed, false);
      resolve();
    });
  });

  assertEquals(disposable.isDisposed, false);
  await result;
  assertEquals(disposable.isDisposed, true);
});

Deno.test("using - async - should handle disposing when the promise is rejected", async () => {
  const disposable = new Disposable();
  try {
    await using(disposable, () => {
      return Promise.reject(new Error());
    });
  } catch {
    // do nothing;
  }

  assertEquals(disposable.isDisposed, true);
});

Deno.test("using - async - should get the returned value", async () => {
  const disposable = new Disposable();
  const promise = using(disposable, () => {
    return new Promise<number>((resolve) => {
      assertEquals(disposable.isDisposed, false);
      resolve(5);
    });
  });

  assert<IsExact<typeof promise, Promise<number>>>(true);
  const result = await promise;
  assertEquals(result, 5);
});

Deno.test("using - async - should dispose the resource asynchronously", async () => {
  const disposable = new AsyncDisposable();
  const result = using(disposable, () => {
    return new Promise<void>((resolve) => resolve());
  });

  assertEquals(disposable.isDisposed, false);
  await result;
  assertEquals(disposable.isDisposed, true);
});

Deno.test("using - async - should get the returned value when disposing asynchronously", async () => {
  const disposable = new AsyncDisposable();
  const promise = using(disposable, () => {
    return new Promise<number>((resolve) => {
      assertEquals(disposable.isDisposed, false);
      resolve(5);
    });
  });

  assert<IsExact<typeof promise, Promise<number>>>(true);
  const result = await promise;
  assertEquals(result, 5);
});

Deno.test("iterator - should handle disposing after done with an iterator", () => {
  const disposable = new Disposable();
  const result = using(disposable, function* () {
    yield 0;
    assertEquals(disposable.isDisposed, false);
    yield 1;
    assertEquals(disposable.isDisposed, false);
  });

  let value = 0;
  for (const item of result) {
    assertEquals(disposable.isDisposed, false);
    assertEquals(item, value);
    value++;
  }

  assertEquals(disposable.isDisposed, true);
  assertEquals(value, 2);
});

Deno.test("iterator - should handle disposing when an exception is thrown", () => {
  const disposable = new Disposable();
  const result = using(disposable, function* () {
    yield 0;
    throw new Error();
  });

  let value = 0;
  try {
    for (const item of result) {
      assertEquals(item, value);
      value++;
    }
  } catch {
    // ignore
  }

  assertEquals(disposable.isDisposed, true);
  assertEquals(value, 1);
});
