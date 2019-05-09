# using-statement

Function call that acts like a [using statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-statement).

```
npm install --save using-statement
```

* Supports synchronous and asynchronous actions.
* Handles exceptions to ensure the resource is properly disposed.

## Example

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
})();
```

### Inspiration

* C#'s [using statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-statement).
* My old gist [here](https://gist.github.com/dsherret/cf5d6bec3d0f791cef00).
* [ECMAScript using statement proposal](https://github.com/tc39/proposal-using-statement)
