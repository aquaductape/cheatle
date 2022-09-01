import { getEliminationWords, getPotentialWords, TPreviusWord } from "./core";
import {
  clearMain,
  createRoot,
  renderEliminationWord,
  renderPotentialAnswerItems,
} from "./ui";

// Query DOM
const queryGameApp = () => document.getElementById("wordle-app-game")!;
const queryWordRows = () => {
  const gameApp = queryGameApp();
  return [
    ...gameApp.firstElementChild?.firstElementChild!.children!,
  ] as HTMLElement[];
};
const queryLetterTiles = (wordRowEl: HTMLElement) => {
  return [...wordRowEl.children].map(
    (el) => el.firstElementChild
  ) as HTMLElement[];
};

// Await Answer
const areWordsReady = () => {
  console.log("getting potential words after animation is done ...");
  console.log("animation may take 0 - 2 seconds ...");

  const wordRowsEl = queryWordRows();

  return new Promise<boolean>((resolve, reject) => {
    const hasEvaluation = (el: HTMLElement) => {
      const evaluation = el.getAttribute(
        "data-state"
      ) as TPreviusWord["evaluation"];
      const evaluations = ["absent", "present", "correct"] as unknown as [
        TPreviusWord["evaluation"]
      ];

      return evaluations.includes(evaluation);
    };

    const isWordRowReady = (wordRowEl: HTMLElement) => {
      const letterTiles = queryLetterTiles(wordRowEl);

      return letterTiles.every((el) => hasEvaluation(el));
    };

    const run = () => {
      const filteredRows = wordRowsEl.filter((el) => {
        const letterTiles = queryLetterTiles(el);

        const textContent = letterTiles[0].textContent;

        if (!textContent) return false;

        return !!textContent.match(/^\w$/i);
      });
      const result = filteredRows.every((el) => isWordRowReady(el));

      if (result) {
        resolve(true);
      }
      setTimeout(run, 250);
    };

    run();
  });
};

// API

const listPotentialWords = async () => {
  clearMain();
  await areWordsReady();

  const guessedWords = getWordsFromApp();
  const potentialWords = getPotentialWords({ previusWords: guessedWords });

  console.log(potentialWords);
  renderPotentialAnswerItems(potentialWords);

  if (potentialWords.length > 2) {
    if (potentialWords.length < 1000) {
      console.log("Getting elimination words ...");
    }
    const eliminationWords = getEliminationWords(potentialWords);

    if (eliminationWords) {
      console.log(`Elimination Word: ${eliminationWords.word}`);
      console.log(eliminationWords.message);
      renderEliminationWord(eliminationWords);
    } else {
      console.log("No elimination words found");
    }
  }
};

const runApp = () => {
  addEvents();
  createRoot();
};

// Add Events

const addEvents = () => {
  const gameApp = queryGameApp();

  const enterBtn = gameApp.querySelector('[type="button"][data-key="↵"]')!;

  const onSubmitWord = () => {
    setTimeout(() => {
      listPotentialWords();
    }, 200);
  };

  enterBtn.addEventListener("click", onSubmitWord);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    onSubmitWord();
  });

  console.log("Cheat Wordle Initiated! 👀");
};

// Core Logic

const getWordsFromApp = () => {
  const wordRows = queryWordRows();
  const guessedWords: TPreviusWord[][] = [];

  wordRows.forEach((wordRow) => {
    const letterTiles = queryLetterTiles(wordRow);
    const word: TPreviusWord[] = [];

    letterTiles.forEach((gameTile) => {
      if (!gameTile.textContent) return;

      const character = gameTile.textContent!;
      const evaluation = gameTile.getAttribute(
        "data-state"
      ) as TPreviusWord["evaluation"];
      word.push({ character, evaluation });
    });

    guessedWords.push(word);
  });

  return guessedWords;
};

// run App
runApp();
