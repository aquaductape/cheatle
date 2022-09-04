const { build } = require("esbuild");
const glob = require("glob");
const entryPoints = glob.sync("./postbuild/index.ts");

build({
  entryPoints,
  outbase: "./src",
  platform: "node",
  bundle: true,
  outfile: "./tempdir/index.js",
  splitting: false,
  target: "es2016",
  minify: true,
  external: [],
  watch: false,
});
