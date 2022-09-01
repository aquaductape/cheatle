// state
let showMain = false;

let root = document.createElement("div");
const cheatleId = "cheatle-root";
root.id = cheatleId;
root.style.cssText = "position: fixed; top: 0; left: 0; right: 0;";
root.innerHTML = `
<div>
  <button class="toggle-btn" style="height: 45px; width: 45px; display: flex; justify-content: center; align-items: center; border-radius: 8px; color: #e3e3e3; border: 2px solid #7f7f7f; background: black; margin: 6px;">️≡</button>
  <div class="main" style="display: none; flex-direction: column; width: 100%; color: #e3e3e3; background: #000; box-sizing: border-box; box-shadow: black 0px 0px 20px 0px; padding: 6px;">
  
    <div class="potential-answers-container" style="padding: 4px 0px;">
    </div>
    <div class="elimination-word-container" style="padding: 4px 0px;"></div>
  </div>
</div>
`;
const buttonStyle =
  "border: none; border-radius: 4px; background: #393a3c; color: white; text-transform: uppercase; padding: 5px 4px; letter-spacing: 2px; font-weight: bold;";

export const createRoot = () => {
  document.body.appendChild(root);
  root.querySelector(".toggle-btn")?.addEventListener("click", () => {
    const main = root.querySelector(".main") as HTMLElement;
    const button = root.querySelector(".toggle-btn") as HTMLButtonElement;
    main.style.display = showMain ? "none" : "flex";
    button.innerText = showMain ? "≡" : "✖";
    showMain = !showMain;
  });
};

export const clearMain = () => {
  const el1 = root.querySelector(".potential-answers-container")!;
  const el2 = root.querySelector(".elimination-word-container")!;
  el1.innerHTML = "";
  el2.innerHTML = "";
};

export const renderPotentialAnswerItems = (words: string[]) => {
  let els = `
      <div class="potential-answers-count" style="padding: 4px">Potential Words: ${words.length}</div>
      <div class="potential-answers-list" style="display: grid; width: 100%; overflow: auto; grid-auto-flow: column dense; grid-template-rows: 1fr 1fr 1fr; grid-auto-columns: 1fr; gap: 2px;">
  `;
  words.forEach((word) => {
    const el = `
  <button style="${buttonStyle}">${word}</button>
  `;
    els += el;
  });
  els += "</di>";
  root.querySelector(".potential-answers-container")!.innerHTML = els;
};

export const renderEliminationWord = ({
  message,
  word,
}: {
  word: string;
  message: string;
}) => {
  const el = `
  <div style="padding: 4px">Elimination word</div>
  <button style="${buttonStyle} margin-botton: 10px;">${word}</button>
  <div style="max-height: 75px; overflow: auto; color: #bababa; line-height: 22px; border-top: 1px solid #313131; padding-top: 10px; font-size: 14px;">${message}</div>
 `;
  root.querySelector(".elimination-word-container")!.innerHTML = el;
};
