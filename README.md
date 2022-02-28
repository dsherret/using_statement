# using_statement

[![npm version](https://badge.fury.io/js/using-statement.svg)](https://badge.fury.io/js/using-statement)
[![CI](https://github.com/dsherret/using-statement/workflows/CI/badge.svg)](https://github.com/dsherret/using_statement/actions?query=workflow%3ACI)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/using_statement/mod.ts)

Function call that acts like a
[using statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-statement).

With Deno:

```ts
import { using } from "https://deno.land/x/using_statement/mod.ts";
```

Or with Node:

```
npm install --save using-statement
```

## Example

Before:

```ts
const camera = new Camera();
try {
  outputPicture(camera.takePictureSync());
} finally {
  camera.dispose();
}
```

After:

```ts
import { using } from "https://deno.land/x/using_statement/mod.ts";

using(new Camera(), (camera) => {
  outputPicture(camera.takePictureSync());
});
```

## Features

- Supports synchronous, asynchronous, and generator functions.
- Handles exceptions to ensure the resource is properly disposed.
- Accepts objects with a `dispose()`, `close()`, or `unsubscribe()` method.
- Allows asynchronously disposing when using a synchronous or asynchronous
  function.

## Examples

Setup:

```ts
// Camera.ts
export class Camera {
  takePictureSync() {
    // ...etc...
    return pictureData;
  }

  async takePicture() {
    // ...etc...
    return pictureData;
  }

  dispose() {
    // clean up the resource this class is holding
  }
}
```

Synchronous example:

```ts
import { using } from "https://deno.land/x/using_statement/mod.ts";
import { Camera } from "./Camera.ts";

using(new Camera(), (camera) => {
  const picture = camera.takePictureSync();
  outputPicture(picture); // some function that outputs the picture
});

// camera is disposed here
```

Asynchronous example:

```ts
import { using } from "https://deno.land/x/using_statement/mod.ts";
import { Camera } from "./Camera.ts";

await using(new Camera(), async (camera) => {
  const picture = await camera.takePicture();
  outputPicture(picture);
});

// camera is disposed here
```

Generator function example:

```ts
import { using } from "https://deno.land/x/using_statement/mod.ts";
import { Camera } from "./Camera.ts";

const picturesIterator = using(new Camera(), function* (camera) {
  for (let i = 0; i < 10; i++) {
    yield camera.takePictureSync();
  }
});

// camera is not disposed yet...

for (const picture of picturesIterator) {
  outputPicture(picture);
}

// camera is now disposed
```

### Inspiration

- C#'s
  [using statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-statement).
- My old gist [here](https://gist.github.com/dsherret/cf5d6bec3d0f791cef00).
- [ECMAScript using statement proposal](https://github.com/tc39/proposal-using-statement).
