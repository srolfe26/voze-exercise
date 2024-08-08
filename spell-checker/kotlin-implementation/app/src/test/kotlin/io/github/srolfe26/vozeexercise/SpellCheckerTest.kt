package io.github.srolfe26.vozeexercise

import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.nio.file.Path
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SpellCheckerTest {

    private lateinit var spellChecker: SpellChecker
    private lateinit var dictionaryFile: File

    @BeforeAll
    fun setup(@TempDir tempDir: Path) {
        dictionaryFile = File(tempDir.toFile(), "dictionary.txt")
        dictionaryFile.writeText("apple\nbanana\ncherry\ndate\negg\nfox\njumps\nover\nthe\nlazy\ndog\nquick\nbrown")
        spellChecker = SpellChecker(dictionaryFile.absolutePath)
    }

    @Test
    fun `test isWordValid`() {
        assertTrue(spellChecker.isWordValid("apple"))
        assertTrue(spellChecker.isWordValid("banana"))
        assertFalse(spellChecker.isWordValid("appl"))
        assertFalse(spellChecker.isWordValid("bananaa"))
    }

    @Test
    fun `test isWordValid with single-letter words`() {
        assertTrue(spellChecker.isWordValid("a"))
        assertTrue(spellChecker.isWordValid("i"))
        assertFalse(spellChecker.isWordValid("b"))
    }

    @Test
    fun `test isWordValid with apostrophes`() {
        assertTrue(spellChecker.isWordValid("apple's"))
        assertTrue(spellChecker.isWordValid("banana's"))
        assertTrue(spellChecker.isWordValid("cherry's"))
    }

    @Test
    fun `test getSuggestions`() {
        val suggestions = spellChecker.getSuggestions("appel")
        assertTrue("apple" in suggestions)
    }

    @Test
    fun `test getSuggestions for correct words`() {
        val suggestions = spellChecker.getSuggestions("apple")
        assertTrue(suggestions.isEmpty())
    }

    @Test
    fun `test getSuggestions respects maxSuggestions`() {
        val suggestions = spellChecker.getSuggestions("aple", maxSuggestions = 2)
        assertTrue(suggestions.size <= 2)
    }

    @Test
    fun `test isPotentialProperNoun`() {
        assertTrue(spellChecker.isPotentialProperNoun("Zxcvbn"))
        assertTrue(spellChecker.isPotentialProperNoun("Apple"))
        assertFalse(spellChecker.isPotentialProperNoun("apple"))
    }

    @Test
    fun `test checkText identifies misspelled words`(@TempDir tempDir: Path) {
        val textFile = File(tempDir.toFile(), "text.txt")
        textFile.writeText("The quik brown Fox jumps over the lazy dog.")

        val result = spellChecker.checkText(textFile.absolutePath)
        assertEquals(1, result.size)
        assertEquals("quik", result[0].word)
        assertTrue("quick" in result[0].suggestions)
    }

    @Test
    fun `test checkText handles capitalized words correctly`(@TempDir tempDir: Path) {
        val textFile = File(tempDir.toFile(), "text.txt")
        textFile.writeText("The Quick Brown Fox jumps over the lazy Dog.")

        val result = spellChecker.checkText(textFile.absolutePath)
        assertTrue(result.isEmpty())
    }
}