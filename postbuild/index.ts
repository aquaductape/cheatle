import fs from "fs";
import path from "path";

const postBuildOutDir = "tempdir";
const buildOutDist = "dist";

const bookmarkletFetchCdnStr = `
const script = document.createElement('script')
script.src = 'https://cdn.jsdelivr.net/gh/aquaductape/cheatle@master/dist/index.js'
document.head.appendChild(script)
`;

const scriptSrcStr = `
const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement('textarea');
  let successful = false;
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.opacity = '0';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    if (!successful) console.log('Copying text command was ' + msg);
  } catch (err) {
    console.error('Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
  return successful;
};

const copyTextToClipboard = async (text) => {
  if (!navigator.clipboard) {
    return fallbackCopyTextToClipboard(text);
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return fallbackCopyTextToClipboard(text);
  }
};

const btn = document.querySelector('.btn')
btn.addEventListener('click', () => {copyTextToClipboard(\`javascript:(function(){${encodeURIComponent(
  bookmarkletFetchCdnStr
)}})()\`)})
`;

const jsCodeStr = fs
  .readFileSync(path.join(process.cwd(), buildOutDist, "index.js"))
  .toString();
let htmlStr = fs
  .readFileSync(path.join(process.cwd(), "src", "index.html"))
  .toString();

const hrefValue = `javascript:(function(){${encodeURIComponent(jsCodeStr)}})()`;
htmlStr = htmlStr.replace("{BOOKMARKLET_LINK}", hrefValue);
htmlStr = htmlStr.replace('"{SCRIPT}"', scriptSrcStr);

fs.writeFileSync(path.join(process.cwd(), buildOutDist, "index.html"), htmlStr);

// just for gh pages
try {
  fs.mkdirSync(path.join(process.cwd(), "docs"));
  fs.writeFileSync(path.join(process.cwd(), "docs", "index.html"), htmlStr);
} catch (err) {}

fs.rmSync(path.join(process.cwd(), postBuildOutDir, "index.js"));
fs.rmdirSync(path.join(process.cwd(), postBuildOutDir));
