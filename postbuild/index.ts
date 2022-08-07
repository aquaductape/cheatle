import fs from "fs";
import path from "path";

const jsCodeStr = fs
  .readFileSync(path.join(process.cwd(), "dir", "index.js"))
  .toString();
let htmlStr = fs
  .readFileSync(path.join(process.cwd(), "src", "index.html"))
  .toString();

const hrefValue = `javascript:(function(){${encodeURIComponent(jsCodeStr)}})()`;
htmlStr = htmlStr.replace("{BOOKMARKLET_LINK}", hrefValue);

fs.writeFileSync(path.join(process.cwd(), "dir", "index.html"), htmlStr);
fs.rmSync(path.join(process.cwd(), "lib", "index.js"));
fs.rmdirSync(path.join(process.cwd(), "lib"));
