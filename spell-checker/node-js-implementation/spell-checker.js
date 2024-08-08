const fs = require("fs").promises;

const loadDictionary = async (filePath) => {
  const content = await fs.readFile(filePath, "utf-8");
  return new Set(content.split("\n").map((word) => word.trim().toLowerCase()));
};

const isSingleLetterWord = (word) =>
  word.length === 1 && (word === "a" || word === "i");

const isWordValid = (dictionary) => (word) => {
  if (typeof word !== "string" || word.length === 0) {
    return false;
  }

  const lowercaseWord = word.toLowerCase();

  if (isSingleLetterWord(lowercaseWord)) {
    return true;
  }

  if (lowercaseWord.includes("'")) {
    const firstPart = lowercaseWord.split("'")[0];
    return isSingleLetterWord(firstPart) || dictionary.has(firstPart);
  }
  return dictionary.has(lowercaseWord);
};

const getSuggestions =
  (dictionary) =>
  (word, maxSuggestions = 5, maxDistance = 2) => {
    if (typeof word !== "string" || word.length === 0) {
      return [];
    }
    const lowercaseWord = word.toLowerCase();

    // Return an empty array if the word is already in the dictionary
    if (dictionary.has(lowercaseWord)) {
      return [];
    }

    return Array.from(dictionary)
      .filter(
        (dictWord) =>
          Math.abs(dictWord.length - lowercaseWord.length) <= maxDistance
      )
      .map((dictWord) => ({
        word: dictWord,
        distance: damerauLevenshteinDistance(lowercaseWord, dictWord),
      }))
      .filter(({ distance }) => distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxSuggestions)
      .map((suggestion) => suggestion.word);
  };

const isPotentialProperNoun = (dictionary, getSuggestionsFunc) => (word) => {
  if (typeof word !== "string" || word.length === 0) {
    return false;
  }
  if (word[0] !== word[0].toUpperCase()) {
    return false;
  }
  const lowercaseWord = word.toLowerCase();
  if (dictionary.has(lowercaseWord)) {
    return true; // Consider it a proper noun if its lowercase version is in the dictionary
  }
  const suggestions = getSuggestionsFunc(word, 1, 1);
  return suggestions.length === 0;
};

const damerauLevenshteinDistance = (a, b) => {
  const m = a.length;
  const n = b.length;
  const d = Array(m + 1)
    .fill()
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    d[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // transposition
      }
    }
  }

  return d[m][n];
};

const checkText =
  (isWordValidFunc, isPotentialProperNounFunc, getSuggestionsFunc) =>
  async (filePath) => {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");

    return lines.flatMap((line, lineNum) => {
      const words = line.match(/\b\w+(?:'\w+)?\b/g) || [];
      let columnNum = 0;

      return words.flatMap((word) => {
        columnNum = line.indexOf(word, columnNum);
        const isValid =
          isWordValidFunc(word) || isPotentialProperNounFunc(word);
        const result = !isValid
          ? [
              {
                word,
                line: lineNum + 1,
                column: columnNum + 1,
                context: line.substring(
                  Math.max(0, columnNum - 20),
                  Math.min(line.length, columnNum + word.length + 20)
                ),
                suggestions: getSuggestionsFunc(word),
              },
            ]
          : [];
        columnNum += word.length;
        return result;
      });
    });
  };

const main = async () => {
  if (process.argv.length !== 4) {
    console.error("Usage: node spell_checker.js <dictionary_file> <text_file>");
    process.exit(1);
  }

  const [, , dictionaryPath, textPath] = process.argv;

  try {
    const dictionary = await loadDictionary(dictionaryPath);
    const isWordValidWithDict = isWordValid(dictionary);
    const getSuggestionsWithDict = getSuggestions(dictionary);
    const isPotentialProperNounWithDict = isPotentialProperNoun(
      dictionary,
      getSuggestionsWithDict
    );
    const checkTextWithFunctions = checkText(
      isWordValidWithDict,
      isPotentialProperNounWithDict,
      getSuggestionsWithDict
    );

    const misspelledWords = await checkTextWithFunctions(textPath);

    if (misspelledWords.length > 0) {
      console.log("Misspelled words:");
      misspelledWords.forEach(
        ({ word, line, column, context, suggestions }) => {
          console.log(`\n"${word}" at line ${line}, column ${column}`);
          console.log(`Context: ...${context}...`);
          console.log(`Suggestions: ${suggestions.join(", ") || "None"}`);
        }
      );
    } else {
      console.log("No misspelled words found.");
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
} else {
  module.exports = {
    loadDictionary,
    isWordValid,
    isPotentialProperNoun,
    getSuggestions,
    damerauLevenshteinDistance,
    checkText,
  };
}
