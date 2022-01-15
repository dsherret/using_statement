import { build } from "https://deno.land/x/dnt@0.16.0/mod.ts";

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
