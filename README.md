# using-statement

Function call that acts like a [using statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-statement).

```
npm install --save using-statement
```

* Supports synchronous, asynchronous, and generator functions.
* Handles exceptions to ensure the resource is properly disposed.

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
import { using } from "using-statement";

using(new Camera(), camera => {
    outputPicture(camera.takePictureSync())
});
```


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
import { using } from "using-statement";
import { Camera } from "./Camera";

using(new Camera(), camera => {
    const picture = camera.takePictureSync();
    outputPicture(picture); // some function that outputs the picture
});

// camera is disposed here
```

Asynchronous example:

```ts
import { using } from "using-statement";
import { Camera } from "./Camera";

(async () => {
    await using(new Camera(), async camera => {
        const picture = await camera.takePicture();
        outputPicture(picture);
    });

    // camera is disposed here
})();
```

Generator function example:

```ts
import { using } from "using-statement";
import { Camera } from "./Camera";

const picturesIterator = using(new Camera(), function*(camera) {
    for (let i = 0; i < 10; i++)
        yield camera.takePictureSync();
});

// camera is not disposed yet...

for (const picture of picturesIterator) {
    outputPicture(picture);
}

// camera is now disposed
```

### Inspiration

* C#'s [using statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-statement).
* My old gist [here](https://gist.github.com/dsherret/cf5d6bec3d0f791cef00).
* [ECMAScript using statement proposal](https://github.com/tc39/proposal-using-statement)

### Todo

* Support async dispose.
* Support falling back to methods other than dispose (ex. `#close()`).
