package io.github.srolfe26.vozeexercise

import java.io.File

class SpellChecker(private val dictionaryPath: String) {
    private val dictionary: Set<String> = loadDictionary()

    private fun loadDictionary(): Set<String> {
        return File(dictionaryPath).useLines { lines ->
            lines.map { it.trim().lowercase() }.toSet()
        }
    }

    fun isWordValid(word: String): Boolean {
        if (word.isEmpty()) return false
        val lowercaseWord = word.lowercase()

        return when {
            isSingleLetterWord(lowercaseWord) -> true
            lowercaseWord.contains("'") -> {
                val firstPart = lowercaseWord.split("'")[0]
                isSingleLetterWord(firstPart) || dictionary.contains(firstPart)
            }
            else -> dictionary.contains(lowercaseWord)
        }
    }

    private fun isSingleLetterWord(word: String): Boolean =
        word.length == 1 && (word == "a" || word == "i")

    fun getSuggestions(word: String, maxSuggestions: Int = 5, maxDistance: Int = 2): List<String> {
        if (word.isEmpty() || dictionary.contains(word.lowercase())) return emptyList()

        return dictionary
            .filter { Math.abs(it.length - word.length) <= maxDistance }
            .map { it to damerauLevenshteinDistance(word.lowercase(), it) }
            .filter { (_, distance) -> distance <= maxDistance }
            .sortedBy { (_, distance) -> distance }
            .take(maxSuggestions)
            .map { (suggestion, _) -> suggestion }
    }

    fun isPotentialProperNoun(word: String): Boolean {
        if (word.isEmpty() || !word[0].isUpperCase()) return false
        val lowercaseWord = word.lowercase()
        if (dictionary.contains(lowercaseWord)) return true
        return getSuggestions(word, 1, 1).isEmpty()
    }

    fun checkText(filePath: String): List<MisspelledWord> {
        val content = File(filePath).readText()
        val lines = content.split("\n")

        return lines.flatMapIndexed { lineNum, line ->
            val words = Regex("\\b\\w+(?:'\\w+)?\\b").findAll(line)
            words.flatMap { matchResult ->
                val word = matchResult.value
                val columnNum = matchResult.range.first
                if (!isWordValid(word) && !isPotentialProperNoun(word)) {
                    listOf(
                        MisspelledWord(
                            word,
                            lineNum + 1,
                            columnNum + 1,
                            line.substring(
                                (columnNum - 20).coerceAtLeast(0),
                                (columnNum + word.length + 20).coerceAtMost(line.length)
                            ),
                            getSuggestions(word)
                        )
                    )
                } else {
                    emptyList()
                }
            }
        }
    }

    private fun damerauLevenshteinDistance(a: String, b: String): Int {
        val m = a.length
        val n = b.length
        val d = Array(m + 1) { IntArray(n + 1) }

        for (i in 0..m) d[i][0] = i
        for (j in 0..n) d[0][j] = j

        for (i in 1..m) {
            for (j in 1..n) {
                val cost = if (a[i - 1] == b[j - 1]) 0 else 1
                d[i][j] = minOf(
                    d[i - 1][j] + 1,  // deletion
                    d[i][j - 1] + 1,  // insertion
                    d[i - 1][j - 1] + cost  // substitution
                )
                if (i > 1 && j > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1]) {
                    d[i][j] = minOf(d[i][j], d[i - 2][j - 2] + cost)  // transposition
                }
            }
        }

        return d[m][n]
    }
}

data class MisspelledWord(
    val word: String,
    val line: Int,
    val column: Int,
    val context: String,
    val suggestions: List<String>
)

fun main(args: Array<String>) {
    if (args.size != 2) {
        println("Usage: kotlin SpellChecker.kt <dictionary_file> <text_file>")
        return
    }

    val (dictionaryPath, textPath) = args
    val spellChecker = SpellChecker(dictionaryPath)

    val misspelledWords = spellChecker.checkText(textPath)

    if (misspelledWords.isNotEmpty()) {
        println("Misspelled words:")
        misspelledWords.forEach { (word, line, column, context, suggestions) ->
            println("\n\"$word\" at line $line, column $column")
            println("Context: ...${context}...")
            println("Suggestions: ${suggestions.joinToString(", ")}")
        }
    } else {
        println("No misspelled words found.")
    }
}