# using-statement

Function call that acts like a [using statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-statement).

```
npm install --save using-statement
```

## Example

```ts
// Camera.ts
export class Camera {
    takePicture() {
        // ...etc...
        return pictureData;
    }

    dispose() {
        // clean up the resource this class is holding
    }
}

// main.ts
import { using } from "using-statement";
import { Camera } from "./Camera";

using(new Camera(), camera => {
    const picture = camera.takePicture()
    outputPicture(picture);
});
```

### Inspiration

* C#'s [using statement](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-statement).
* My old gist [here](https://gist.github.com/dsherret/cf5d6bec3d0f791cef00).
* [ECMAScript using statement proposal](https://github.com/tc39/proposal-using-statement)

## Todo

* Handle an async or generator function.
