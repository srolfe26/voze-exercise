const {
  loadDictionary,
  isWordValid,
  isPotentialProperNoun,
  getSuggestions,
  damerauLevenshteinDistance,
  checkText,
} = require("./spell-checker");

const fs = require("fs").promises;

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

describe("Spell Checker", () => {
  let dictionary;
  let isWordValidWithDict;
  let getSuggestionsWithDict;
  let isPotentialProperNounWithDict;

  beforeAll(async () => {
    const dictionaryContent =
      "apple\nbanana\ncherry\ndate\negg\nfox\njumps\nover\nthe\nlazy\ndog\nquick\nbrown";
    fs.readFile.mockResolvedValue(dictionaryContent);
    dictionary = await loadDictionary("mock_dictionary.txt");
    isWordValidWithDict = isWordValid(dictionary);
    getSuggestionsWithDict = getSuggestions(dictionary);
    isPotentialProperNounWithDict = isPotentialProperNoun(
      dictionary,
      getSuggestionsWithDict
    );
  });

  describe("loadDictionary", () => {
    it("should load dictionary from file", async () => {
      const result = await loadDictionary("mock_dictionary.txt");
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(13);
      expect(result.has("apple")).toBe(true);
      expect(result.has("banana")).toBe(true);
    });
  });

  describe("isWordValid", () => {
    it("should return true for valid words", () => {
      expect(isWordValidWithDict("apple")).toBe(true);
      expect(isWordValidWithDict("banana")).toBe(true);
    });

    it("should return false for invalid words", () => {
      expect(isWordValidWithDict("appl")).toBe(false);
      expect(isWordValidWithDict("bananaa")).toBe(false);
    });

    it("should handle single-letter words", () => {
      expect(isWordValidWithDict("a")).toBe(true);
      expect(isWordValidWithDict("i")).toBe(true);
      expect(isWordValidWithDict("b")).toBe(false);
    });

    it("should handle words with apostrophes", () => {
      expect(isWordValidWithDict("apple's")).toBe(true);
      expect(isWordValidWithDict("banana's")).toBe(true);
      expect(isWordValidWithDict("cherry's")).toBe(true);
    });
  });

  describe("getSuggestions", () => {
    it("should return suggestions for misspelled words", () => {
      const suggestions = getSuggestionsWithDict("appel");
      expect(suggestions).toContain("apple");
    });

    it("should return an empty array for correct words", () => {
      const suggestions = getSuggestionsWithDict("apple");
      expect(suggestions).toHaveLength(0);
    });

    it("should respect maxSuggestions parameter", () => {
      const suggestions = getSuggestionsWithDict("aple", 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('isPotentialProperNoun', () => {
    it('should return true for potential proper nouns', () => {
      expect(isPotentialProperNounWithDict('Zxcvbn')).toBe(true);
    });

    it('should return true for capitalized known words', () => {
      expect(isPotentialProperNounWithDict('Apple')).toBe(true);
    });

    it('should return false for non-capitalized words', () => {
      expect(isPotentialProperNounWithDict('apple')).toBe(false);
    });
  });

  describe('checkText', () => {
    it('should identify misspelled words in text', async () => {
      const mockText = 'The quik brown Fox jumps over the lazy dog.';
      fs.readFile.mockResolvedValue(mockText);

      const checkTextWithFunctions = checkText(
        isWordValidWithDict,
        isPotentialProperNounWithDict,
        getSuggestionsWithDict
      );

      const result = await checkTextWithFunctions('mock_text.txt');
      expect(result).toHaveLength(1);
      expect(result[0].word).toBe('quik');
      expect(result[0].suggestions).toContain('quick');
    });

    it('should handle capitalized words correctly', async () => {
      const mockText = 'The Quick Brown Fox jumps over the lazy Dog.';
      fs.readFile.mockResolvedValue(mockText);

      const checkTextWithFunctions = checkText(
        isWordValidWithDict,
        isPotentialProperNounWithDict,
        getSuggestionsWithDict
      );

      const result = await checkTextWithFunctions('mock_text.txt');
      expect(result).toHaveLength(0);
    });
  });

  describe("damerauLevenshteinDistance", () => {
    it("should calculate the correct distance", () => {
      expect(damerauLevenshteinDistance("kitten", "sitting")).toBe(3);
      expect(damerauLevenshteinDistance("saturday", "sunday")).toBe(3);
    });

    it("should handle transpositions", () => {
      expect(damerauLevenshteinDistance("ab", "ba")).toBe(1);
    });
  });
});
