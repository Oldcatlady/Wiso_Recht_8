/* =========================================================
   QUIZ-DATEN
   ========================================================= */

let questions = [];

let current = 0;
let correct = 0;
let wrong = 0;

let selectedAnswer = null;
let answered = false;


/* =========================================================
   THEMES
   ========================================================= */

const themes = [
    {
        className: "theme-pastell",
        name: "Pastell"
    },
    {
        className: "theme-ocean",
        name: "Deep Ocean"
    },
    {
        className: "theme-warm",
        name: "Warm Night"
    }
];

let currentTheme = 0;


/* =========================================================
   HTML-ELEMENTE
   ========================================================= */

const startScreen =
    document.getElementById("startScreen");

const quizScreen =
    document.getElementById("quizScreen");

const resultScreen =
    document.getElementById("resultScreen");


const themeName =
    document.getElementById("themeName");

const themeDots =
    document.querySelectorAll(".theme-dot");


const previousThemeBtn =
    document.getElementById("previousThemeBtn");

const nextThemeBtn =
    document.getElementById("nextThemeBtn");

const startBtn =
    document.getElementById("startBtn");

const actionBtn =
    document.getElementById("actionBtn");

const restartBtn =
    document.getElementById("restartBtn");

const themeAgainBtn =
    document.getElementById("themeAgainBtn");


/* =========================================================
   JSON LADEN
   ========================================================= */

fetch("questions.json")
    .then(response => {

        if (!response.ok) {
            throw new Error(
                "questions.json konnte nicht geladen werden."
            );
        }

        return response.json();
    })

    .then(data => {

        questions = data;

        if (!Array.isArray(questions) ||
            questions.length === 0) {

            throw new Error(
                "Die JSON-Datei enthält keine Fragen."
            );
        }
    })

    .catch(error => {

        console.error(error);

        startScreen.innerHTML = `
            <div class="start-card">

                <h2>Fragen konnten nicht geladen werden</h2>

                <p>
                    Prüfe bitte, ob sich die Datei
                    <strong>questions.json</strong>
                    im selben Ordner wie die anderen
                    Quiz-Dateien befindet.
                </p>

            </div>
        `;
    });


/* =========================================================
   THEME WECHSELN
   ========================================================= */

function applyTheme() {

    document.body.classList.remove(
        "theme-pastell",
        "theme-ocean",
        "theme-warm"
    );

    document.body.classList.add(
        themes[currentTheme].className
    );

    themeName.textContent =
        themes[currentTheme].name;


    themeDots.forEach((dot, index) => {

        if (index === currentTheme) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }

    });
}


function nextTheme() {

    currentTheme++;

    if (currentTheme >= themes.length) {
        currentTheme = 0;
    }

    applyTheme();
}


function previousTheme() {

    currentTheme--;

    if (currentTheme < 0) {
        currentTheme = themes.length - 1;
    }

    applyTheme();
}


nextThemeBtn.addEventListener(
    "click",
    nextTheme
);


previousThemeBtn.addEventListener(
    "click",
    previousTheme
);


/* =========================================================
   FRAGEN MISCHEN

   WICHTIG:
   Nur die FRAGEN werden gemischt.
   Die Antworten A–D innerhalb einer Frage bleiben
   immer exakt in ihrer ursprünglichen Reihenfolge.
   ========================================================= */

function shuffleQuestions() {

    for (
        let i = questions.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            questions[i],
            questions[j]
        ] = [
            questions[j],
            questions[i]
        ];
    }
}


/* =========================================================
   QUIZ STARTEN
   ========================================================= */

function startQuiz() {

    if (questions.length === 0) {
        return;
    }

    current = 0;
    correct = 0;
    wrong = 0;

    selectedAnswer = null;
    answered = false;

    shuffleQuestions();

    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");

    quizScreen.classList.remove("hidden");

    loadQuestion();
}


startBtn.addEventListener(
    "click",
    startQuiz
);


/* =========================================================
   FRAGE LADEN
   ========================================================= */

function loadQuestion() {

    const q = questions[current];

    selectedAnswer = null;
    answered = false;


    document.getElementById(
        "question"
    ).textContent = q.question;


    document.getElementById(
        "questionNumber"
    ).textContent =
        `Frage ${current + 1}`;


    const answersDiv =
        document.getElementById("answers");


    answersDiv.innerHTML = "";


    Object.entries(q.options).forEach(([letter, answerText]) => {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-btn";

    // Buchstabe + Antworttext anzeigen
    button.textContent = `${letter}) ${answerText}`;

    // Antwortbuchstaben speichern
    button.dataset.answer = letter;

    button.addEventListener("click", () => {
        selectAnswer(letter, button);
    });

    answersDiv.appendChild(button);
});


    const feedback =
        document.getElementById("feedback");

    feedback.innerHTML = "";
    feedback.classList.add("hidden");


    actionBtn.textContent =
        "Auswerten";

    actionBtn.disabled =
        true;


    document.getElementById(
        "selectionHint"
    ).textContent =
        "Wähle eine Antwort aus und klicke anschließend auf „Auswerten“.";


    updateProgress();
}


/* =========================================================
   ANTWORT AUSWÄHLEN

   Hier erfolgt NOCH KEINE AUSWERTUNG.
   Der Nutzer kann seine Auswahl jederzeit ändern.
   ========================================================= */

function selectAnswer(letter, button) {

    if (answered) {
        return;
    }


    selectedAnswer =
        letter;


    document
        .querySelectorAll(".answer-btn")
        .forEach(btn => {

            btn.classList.remove(
                "selected"
            );

        });


    button.classList.add(
        "selected"
    );


    actionBtn.disabled =
        false;
}


/* =========================================================
   AUSWERTEN
   ========================================================= */

function evaluateAnswer() {

    if (!selectedAnswer ||
        answered) {

        return;
    }


    answered = true;


    const q =
        questions[current];


    const correctAnswer =
    q.correct
        .trim()
        .toUpperCase();


    const isCorrect =
        selectedAnswer ===
        correctAnswer;


    if (isCorrect) {

        correct++;

    } else {

        wrong++;
    }


    document
        .querySelectorAll(".answer-btn")
        .forEach(button => {

            const letter =
                button.dataset.answer;


            button.disabled =
                true;


            button.classList.remove(
                "selected"
            );


            /*
             * Richtige Antwort immer grün
             */
            if (
                letter ===
                correctAnswer
            ) {

                button.classList.add(
                    "correct-answer"
                );
            }


            /*
             * Nur die vom Nutzer ausgewählte
             * falsche Antwort wird rot.
             */
            if (
                letter === selectedAnswer &&
                letter !== correctAnswer
            ) {

                button.classList.add(
                    "wrong-answer"
                );
            }

        });


    showExplanation(
        q,
        isCorrect
    );


    actionBtn.textContent =
        "Weiter";


    actionBtn.disabled =
        false;


    document.getElementById(
        "selectionHint"
    ).textContent =
        isCorrect
            ? "Richtig beantwortet."
            : "Die richtige Antwort ist grün markiert.";


    updateProgress();
}


/* =========================================================
   ERKLÄRUNG ANZEIGEN
   ========================================================= */

function showExplanation(
    question,
    isCorrect
) {

    const feedback =
        document.getElementById(
            "feedback"
        );


    const heading =
        isCorrect
            ? "Richtig!"
            : "Noch nicht richtig.";


    feedback.innerHTML = `

        <span class="feedback-title">
            ${heading}
        </span>

        ${question.explanation}

    `;


    feedback.classList.remove(
        "hidden"
    );
}


/* =========================================================
   BUTTON:
   AUSWERTEN ODER WEITER
   ========================================================= */

actionBtn.addEventListener(
    "click",
    () => {

        /*
         * Antwort wurde noch nicht ausgewertet:
         * -> jetzt auswerten
         */
        if (!answered) {

            evaluateAnswer();

            return;
        }


        /*
         * Antwort wurde bereits ausgewertet:
         * -> nächste Frage
         */

        current++;


        if (
            current <
            questions.length
        ) {

            loadQuestion();

        } else {

            showResult();
        }

    }
);


/* =========================================================
   FORTSCHRITT

   Der Fortschrittsbalken zählt nur vollständig
   bearbeitete / ausgewertete Fragen.

   Vor der ersten Antwort = 0 %
   ========================================================= */

function updateProgress() {

    const total =
        questions.length;


    const completed =
        correct + wrong;


    const percent =
        total > 0
            ? Math.round(
                (completed / total) * 100
            )
            : 0;


    document.getElementById(
        "questionCounter"
    ).textContent =
        `${current + 1} / ${total}`;


    document.getElementById(
        "answeredCounter"
    ).textContent =
        completed;


    document.getElementById(
        "correctCounter"
    ).textContent =
        correct;


    document.getElementById(
        "wrongCounter"
    ).textContent =
        wrong;


    document.getElementById(
        "progressPercent"
    ).textContent =
        `${percent} %`;


    document.getElementById(
        "progressFill"
    ).style.width =
        `${percent}%`;
}


/* =========================================================
   IHK-ORIENTIERTER NOTENSCHLÜSSEL

   Grundlage ist der PROZENTUALE Anteil
   richtig beantworteter Fragen.

   92–100 % = Note 1
   81–91 %  = Note 2
   67–80 %  = Note 3
   50–66 %  = Note 4
   30–49 %  = Note 5
    0–29 %  = Note 6
   ========================================================= */

function getGrade(percent) {

    if (percent >= 92) {
        return 1;
    }

    if (percent >= 81) {
        return 2;
    }

    if (percent >= 67) {
        return 3;
    }

    if (percent >= 50) {
        return 4;
    }

    if (percent >= 30) {
        return 5;
    }

    return 6;
}


/* =========================================================
   TEXT ZUR NOTE
   ========================================================= */

function getGradeMessage(grade) {

    switch (grade) {

        case 1:
            return "Sehr gut";

        case 2:
            return "Gut";

        case 3:
            return "Befriedigend";

        case 4:
            return "Ausreichend";

        case 5:
            return "Mangelhaft";

        default:
            return "Ungenügend";
    }
}


/* =========================================================
   ENDERGEBNIS
   ========================================================= */

function showResult() {

    quizScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.remove(
        "hidden"
    );


    const total =
        questions.length;


    const exactPercent =
        (correct / total) * 100;


    const displayPercent =
        Math.round(exactPercent);


    const grade =
        getGrade(exactPercent);


    document.getElementById(
        "resultPercentage"
    ).textContent =
        `${displayPercent} %`;


    document.getElementById(
        "resultScore"
    ).textContent =
        `${correct} von ${total} Fragen richtig beantwortet`;


    document.getElementById(
        "resultCorrect"
    ).textContent =
        correct;


    document.getElementById(
        "resultWrong"
    ).textContent =
        wrong;


    document.getElementById(
        "resultGrade"
    ).textContent =
        grade;


    document.getElementById(
        "gradeMessage"
    ).innerHTML = `

        <strong>
            Note ${grade} –
            ${getGradeMessage(grade)}
        </strong>

        <br>

        Bewertung auf Grundlage von
        ${displayPercent} % richtig
        beantworteten Fragen.

    `;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   NOCHMAL SPIELEN

   Fragen werden neu gemischt.
   Theme bleibt erhalten.
   ========================================================= */

restartBtn.addEventListener(
    "click",
    () => {

        startQuiz();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   ZURÜCK ZUR THEME-AUSWAHL
   ========================================================= */

themeAgainBtn.addEventListener(
    "click",
    () => {

        resultScreen.classList.add(
            "hidden"
        );

        quizScreen.classList.add(
            "hidden"
        );

        startScreen.classList.remove(
            "hidden"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   START-THEME SETZEN
   ========================================================= */

applyTheme();