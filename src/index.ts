import { wordleWords } from "./wordleWords";

type TPreviusWord = {
  character: string;
  evaluation: "present" | "absent" | "correct";
};

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
  await areWordsReady();

  const guessedWords = getWordsFromApp();
  const potentialWords = getPotentialWords({ previusWords: guessedWords });

  console.log(potentialWords);
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

addEvents();

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

const getPotentialWords = ({
  previusWords,
}: {
  previusWords: TPreviusWord[][];
}) => {
  const absentCharsArr = getAbsentChars();
  const correctCharsArrData = getCorrectCharsData();
  const presentCharsArrData = getPresentCharsData();
  const correctCharsArrRegex = formatCharsRegexArr(
    correctCharsArrData,
    ({ character }) => character
  );
  const presentCharsArrRegex = formatCharsRegexArr(
    presentCharsArrData,
    ({ character, selfItem }) => {
      if (selfItem) {
        return `[^${selfItem.replace(/\[|\]|\^/g, "")}${character}]`;
      }
      return `[^${character}]`;
    }
  );
  const combinedCorrectAndPresentChars = combinePresentAndCorrect({
    correctChars: correctCharsArrRegex,
    presentChars: presentCharsArrRegex,
  });

  function getAbsentChars() {
    const result = previusWords
      .filter((word) => word.find(({ evaluation }) => evaluation === "absent"))
      .map((word) => {
        return word
          .filter(
            ({ character, evaluation }) =>
              evaluation === "absent" &&
              !word.find(
                (item) =>
                  item.evaluation !== "absent" && item.character === character
              )
          )
          .map(({ character }) => character)
          .join("");
      })
      .join("")
      .split("");

    return [...new Set(result)];
  }

  function getMustIncludePresentCharsRegex(inputWords: TPreviusWord[][]) {
    const result = inputWords.flatMap((words) =>
      words.map(({ character }) => `(?=.*${character})`)
    );

    return [...new Set(result)];
  }

  function getCorrectCharsData() {
    return previusWords
      .filter((word) => word.find(({ evaluation }) => evaluation === "correct"))
      .map((word) => {
        return word
          .map((item, idx) => ({ ...item, index: idx }))
          .filter(({ evaluation }) => evaluation === "correct");
      });
  }

  function formatCharsRegexArr(
    inputWords: (TPreviusWord & { index?: number })[][],
    cb: (
      word: TPreviusWord & { characterIndex?: number; selfItem: string }
    ) => string
  ) {
    const result = new Array(5).fill("") as string[];

    inputWords.forEach((words) =>
      words.forEach(({ character, evaluation, index }) => {
        result[index!] = cb({
          character,
          evaluation,
          characterIndex: index,
          selfItem: result[index!],
        });
      })
    );

    return result;
  }

  function getPresentChars(presentChars: TPreviusWord[][]) {
    return presentChars.flatMap((words) =>
      words.flatMap(({ character }) => character)
    );
  }

  function getPresentCharsData() {
    const resultWords = previusWords
      .filter((word) => word.find(({ evaluation }) => evaluation === "present"))
      .map((word) => {
        return word
          .map((item, idx) => ({ ...item, index: idx }))
          .filter(({ evaluation }) => evaluation === "present");
      });

    return resultWords;
  }

  function combinePresentAndCorrect({
    presentChars,
    correctChars,
  }: {
    presentChars: string[];
    correctChars: string[];
  }) {
    const result = [...presentChars];

    // overrides present chars slots
    correctChars.forEach((char, idx) => {
      if (!result[idx]) result[idx] = ".";
      if (!char) return;
      result[idx] = char;
    });

    return result;
  }

  const absentCharacters = absentCharsArr.length
    ? `(?!.*(${absentCharsArr.join("|")}))`
    : "";
  const presentCharacters =
    getMustIncludePresentCharsRegex(presentCharsArrData).join("");
  const knownPositionalCharacters = `(?=.*${combinedCorrectAndPresentChars.join(
    ""
  )}).*`;

  const regex = new RegExp(
    `^${absentCharacters}${presentCharacters}${knownPositionalCharacters}$`
  );

  return wordleWords.filter((word) => {
    return word.match(regex);
  });
};
