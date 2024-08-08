# Stephen's Spell Checker

Since I understand that there is some transition work required, I thought I would write the code in both Node and Kotlin. See instructions below:

## Node.js
1. In the terminal, go to the `node-js-implementation` folder and run `npm install`.
2. To run tests `npm run test`.
3. To execute the program run `node spell-checker.js ../dictionary.txt ../file-to-check.txt`

## Kotlin
1. Install Gradle if not present on your system. On MacOS use homebrew `brew install gradle`.
2. Go to the `kotlin-implementation` folder.
3. To test:
    a. Run `./gradlew test --tests "io.github.srolfe26.vozeexercise.SpellCheckerTest"`.
    b. View the results file in the `app/build/reports/test-results/test/` folder.
4. To execute the program:
    a. First build the JAR file with `./gradlew jar`
    b. Run `java -jar app/build/libs/app-1.0-SNAPSHOT.jar ../dictionary.txt ../file-to-check.txt`.

## Original Requirements

Write a program that checks spelling. The input to the program is a dictionary file containing a list of valid words and a file containing the text to be checked.

The program should run on the command line like so:

```text
<path to your program> dictionary.txt file-to-check.txt
# output here
```

Your program should support the following features (time permitting):

- The program outputs a list of incorrectly spelled words.
- For each misspelled word, the program outputs a list of suggested words.
- The program includes the line and column number of the misspelled word.
- The program prints the misspelled word along with some surrounding context.
- The program handles proper nouns (person or place names, for example) correctly.


### Additional information

- The formatting of the output is up to you, but make it easy to understand.
- The dictionary file (`dictionary.txt` in the example above) is always a plain text file with one word per line.
- You can use the `dictionary.txt` file included in this directory as your dictionary.
- The input file (`file-to-check.txt` in the example above) is a plain text file that may contain full sentences and paragraphs.
- You should come up with your own content to run through the spell checker.
- Use any programming language, but extra credit for using Java or Kotlin.
- Feel free to fork the repo and put your code in there or create a new blank repo and put your code in there instead.
- Send us a link to your code and include instructions for how to build and run it.
- Someone from Voze will review the code with you, so be prepared to discuss your code.



