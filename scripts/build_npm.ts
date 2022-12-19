import { build, emptyDir } from "https://deno.land/x/dnt@0.32.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: "dev",
  },
  package: {
    name: "using-statement",
    version: Deno.args[0],
    description: `"using statement" in JavaScript and TypeScript.`,
    repository: {
      "type": "git",
      "url": "git+https://github.com/dsherret/using-statement.git",
    },
    keywords: [
      "using",
      "statement",
    ],
    author: "David Sherret",
    license: "MIT",
    bugs: {
      url: "https://github.com/dsherret/using-statement/issues",
    },
    homepage: "https://github.com/dsherret/using-statement#readme",
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
