// import { testWordleWords } from "./testWords";
import { wordleAdditionalWords } from "./wordleAdditionalWords";
import { wordleAnswerWords } from "./wordleAnswerWords";

export type TWordEvaluation = {
  character: string;
  evaluation: "present" | "absent" | "correct" | "unknown";
};

export const state = {
  currentWordEvaluation: [
    { character: [""], evaluation: "unknown" },
    { character: [""], evaluation: "unknown" },
    { character: [""], evaluation: "unknown" },
    { character: [""], evaluation: "unknown" },
    { character: [""], evaluation: "unknown" },
  ],
  characterEvaluationBank: [],
  colors: {
    correct: "var(--color-correct, #538d4e)",
    present: "var(--color-present, #b59f3b)",
    absent: "var(--color-absent, #3a3a3c)",
    unknown: "var(--key-bg, #818384)",
  },
} as {
  currentWordEvaluation: (Pick<TWordEvaluation, "evaluation"> & {
    character: string[];
  })[];
  characterEvaluationBank: (TWordEvaluation & { index: number })[];
  colors: { [key: string]: string };
};

export const getPotentialWords = ({
  previusWords,
}: {
  previusWords: TWordEvaluation[][];
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

  function getMustIncludePresentCharsRegex(inputWords: TWordEvaluation[][]) {
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
    inputWords: (TWordEvaluation & { index?: number })[][],
    cb: (
      word: TWordEvaluation & { characterIndex?: number; selfItem: string }
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

  function getPresentChars(presentChars: TWordEvaluation[][]) {
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

  return wordleAnswerWords.filter((word) => {
    return word.match(regex);
  });
};

function createPartialPermutations(
  input: string,
  {
    startAmount = 1,
    replaceWith = "*",
  }: {
    startAmount?: number;
    replaceWith?: string;
  }
) {
  const map: string[] = [];
  let amount = startAmount;
  let start = 0;
  let pointer = startAmount - 1;

  while (amount < 4) {
    let chars = input.split("");
    chars = chars.fill(replaceWith, start, start + amount - 1);
    const charsOrig = [...chars];
    while (pointer < input.length) {
      chars[pointer] = replaceWith;
      map.push(chars.join(""));
      chars = [...charsOrig];

      // flip
      if (amount > 2 && pointer >= start + amount) {
        chars = input
          .split("")
          .fill(
            replaceWith,
            pointer - (start + amount - (start + 2)),
            pointer + 1
          );
        chars[start] = replaceWith;
        map.push(chars.join(""));
        chars = [...charsOrig];
      }
      pointer++;
    }

    if (amount === 1) {
      amount++;
    } else {
      start++;
    }

    if (start + amount === input.length + 1) {
      amount++;
      start = 0;
    }
    pointer = start + amount - 1;
  }

  return map;
}

// const foo = getEliminationWords([
//   "greet",
//   "sleet",
//   "sweet",
//   "fleet",
//   "tweet",
//   // "batty",
//   // "patty",
//   // "tatty",
//   // "jetty",
//   // "fatty",
//   // "ratty",
//   // "petty",
//   // "catty",
//   // "hunty",
//   // "cunty",
//   // "fluny",
//   // "super",
//   // "sleet",
//   // "sleep",
//   // "greet",
//   // "fleet",
//   // "sleek",
//   // "creek",
// ]);
// console.log(foo);
// const foo = getEliminationWords({
//   potentialWords: testWordleWords,
//   currentWordEvaluation: [
//     { character: ["s"], evaluation: "absent" },
//     { character: ["u"], evaluation: "absent" },
//     { character: ["p"], evaluation: "absent" },
//     { character: ["e"], evaluation: "correct" },
//     { character: ["r"], evaluation: "correct" },
//   ],
// });
// console.log(foo);

export function getEliminationWords({
  potentialWords,
  currentWordEvaluation,
}: {
  potentialWords: string[];
  currentWordEvaluation: (Pick<TWordEvaluation, "evaluation"> & {
    character: string[];
  })[];
}): null | { word: string; message: string } {
  if (potentialWords.length >= 1000) return null;
  // potential words: ['batty', 'patty', 'tatty', 'jetty', 'fatty', 'ratty', 'petty', 'catty']
  // elimation word: probe
  // potential words: ['smear', 'swear', 'shear', 'clear', 'spear']
  // elimation word: NaN
  // potential words: ['trait', 'tryst', 'treat', 'trout', 'tract', 'trust']
  // elimation word: NaN
  // potential words: ['super', 'tuner', 'fumer', 'luger', 'queer']
  // elimation word: smelt

  const similarWordsInPotentialList = []; // get highest occurance of similar word

  function findSimilarWordsInPotentialList(
    input: string[],
    similarCharacters: number = 4
  ) {
    const map: { [key: string]: { accurance: number; letters: number } } = {};
    // [null, 'a', 't', 't', 'y']
    // [null, null, 't', 't', 'y']
    // [null, null, null, 't', 'y']
    // [null, 'a', null, 't', null]
    // up to three nulls
    // make permutations
    const mostOccuring = {
      word: "",
      count: 0,
    };
    input.forEach((word) => {
      const permutations = createPartialPermutations(word, { startAmount: 2 });
      permutations.forEach((permutation) => {
        const item = map[permutation];
        if (!item) {
          map[permutation] = {
            accurance: 1,
            letters: permutation.replace(/\*/g, "").length,
          };
        } else {
          const newCount = item.accurance + 1;
          item.accurance = newCount;

          if (mostOccuring.count < newCount) {
            mostOccuring.word = permutation;
            mostOccuring.count = newCount;
          }
        }
      });
    });
    const list = [];
    for (const key in map) {
      const item = map[key];
      if (item.accurance === 1) continue;
      list.push({
        word: key,
        accurance: item.accurance,
        letters: item.letters,
      });
    }
    list.sort((a, b) => b.accurance - a.accurance);

    if (mostOccuring.count < input.length / 3) {
      return null;
    }
    const uniqueCharsSet = new Set<string>();
    const emptySlots =
      mostOccuring.word.length - mostOccuring.word.replace(/\*/g, "").length;
    const regex = new RegExp(`^${mostOccuring.word.replace(/\*/g, "(.)")}$`);
    const matches = input.filter((word) => {
      const matched = word.match(regex);
      if (matched) {
        matched
          .slice(1, emptySlots + 1)
          .forEach((item) => uniqueCharsSet.add(item));
      }
      return matched;
    });

    const createUniqueCharsRegexArr = (input: string) => {
      const arr: string[] = Array.from({ length: 5 }, () => `[${input}]`);

      currentWordEvaluation.forEach((item, idx) => {
        if (item.evaluation !== "correct") return;

        arr[idx] = arr[idx].replace(item.character[0], "");
      });

      return arr;
    };
    const uniqueCharsStr = [...uniqueCharsSet].join("");
    const uniqueCharsRegexArr = createUniqueCharsRegexArr(uniqueCharsStr);
    const uniqueCharsRegexStr = uniqueCharsRegexArr.join("");

    const uniqueCharsRegex = new RegExp(`^${uniqueCharsRegexStr}$`);

    const filtered = wordleAnswerWords
      .filter((word) => !matches.includes(word))
      .concat(wordleAdditionalWords);

    let found = filtered.find((word) => {
      const matched = word.match(uniqueCharsRegex);
      if (!matched) return false;

      return matched[0].length === new Set(matched[0].split("")).size;
    });

    const sortPermutationByCorrectPosition = (input: string[]) => {
      const indexesOfCorrectPositions = currentWordEvaluation
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item.evaluation === "correct")
        .map(({ item, idx }) => idx);

      const foundItems: string[] = [];
      const newList = input.filter((item) => {
        const itemIndexes = item
          .split("")
          .map((item2, idx) => (item2 === "." ? idx : -1));
        if (
          indexesOfCorrectPositions.find((item) => itemIndexes.includes(item))
        ) {
          foundItems.push(item);
          return false;
        }
        return true;
      });
      return newList.concat(foundItems);
    };

    if (!found) {
      let permutationsStr = createPartialPermutations("*".repeat(5), {
        replaceWith: ".",
      });
      permutationsStr = sortPermutationByCorrectPosition(permutationsStr);

      const permutations = permutationsStr.map((item) => {
        let indexes: number[] = [];
        item.split("").forEach((item1, idx) => {
          if (item1 === ".") {
            indexes.push(idx);
          }
        });
        return {
          indexes,
          regex: new RegExp(
            `^${item
              .replace(/\*/g, (_, idx) => `${uniqueCharsRegexArr[idx]}`)
              .replace(/\./g, `[^${uniqueCharsStr}]`)}$`
          ),
        };
      });

      permutations.find((permutation) => {
        const foundWord = filtered.find((word) => {
          const matched = word.match(permutation.regex);
          if (!matched) return false;

          const matchedUniqueChars = new Set(matched[0].split(""));
          if (matched[0].length !== matchedUniqueChars.size) return false;

          const matchedArr = matched[0]
            .split("")
            .filter((_, idx) => !permutation.indexes.includes(idx));

          return matchedArr.length === new Set(matchedArr).size;
        });

        found = foundWord;

        return !!foundWord;
      });
    }

    return (
      {
        foundWord: found!,
        pattern: mostOccuring.word.replace(/\*/g, "."),
        matches,
      } || null
    );
  }
  const result = findSimilarWordsInPotentialList(potentialWords);

  if (!result) return null;
  // if less than 100 words   findSimilarWords(input, 4)

  const matchedSentence =
    result.matches.length > 1
      ? `${result.matches.join(", ")}`
      : result.matches[0];

  return {
    word: result.foundWord,
    message: `Choose "${result.foundWord}", in order to get rid of at least ${
      result.matches.length - 1
    } words that contain "${
      result.pattern
    }" character pattern (such as ${matchedSentence})`,
  };
}
