"use strict";

var QUIZ_20_LENGTH = 20;
var REQUIRED_CORE_COUNT = 9;
var QUIZ_MODE_SHORT = "short";
var QUIZ_MODE_FULL = "full";
var NEXT_QUESTION_DELAY_MS = 2000;

// The original "Don't Hurt Me"-style core mobs we always include in the
// 20-question quiz, identified by key rather than a boolean flag.
var CORE_MONSTER_KEYS = [
  "MetalSlime",
  "DemonKnight",
  "Wizard",
  "StoneMan",
  "BlueDragon",
  "Golem",
  "RedDragon",
  "Dragonlord1",
  "Dragonlord2"
];

function shuffle(array) {
  var a = array.slice();
  for (var i = a.length - 1; i > 0; i -= 1) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }
  return a;
}

function buildQuizQuestions(mode) {
  var core = [];
  var others = [];
  var i;

  for (i = 0; i < DWR_MONSTERS.length; i += 1) {
    if (CORE_MONSTER_KEYS.indexOf(DWR_MONSTERS[i].key) !== -1) {
      core.push(DWR_MONSTERS[i]);
    } else {
      others.push(DWR_MONSTERS[i]);
    }
  }

  if (mode === QUIZ_MODE_FULL) {
    // Full roster quiz: include every monster once.
    return shuffle(core.concat(others));
  }

  var questions = [];
  questions = questions.concat(core);

  var neededOthers = QUIZ_20_LENGTH - REQUIRED_CORE_COUNT;
  var shuffledOthers = shuffle(others).slice(0, neededOthers);
  questions = questions.concat(shuffledOthers);

  return shuffle(questions);
}

function getHurtResistLevel(monster) {
  var r = typeof monster.hurtResist === "number" ? monster.hurtResist : 0;
  if (r > 0.50) {
    return "high";
  }
  if (r > 0.20) {
    return "medium";
  }
  return "low";
}

function formatHurtResist(monster) {
  var r = typeof monster.hurtResist === "number" ? monster.hurtResist : 0;
  if (r <= 0) {
    return "0% Hurt resist";
  }

  var fractionText;
  var epsilon = 1e-6;
  if (Math.abs(r - 15 / 16) < epsilon) {
    fractionText = "15/16";
  } else if (Math.abs(r - 7 / 16) < epsilon) {
    fractionText = "7/16";
  } else if (Math.abs(r - 3 / 16) < epsilon) {
    fractionText = "3/16";
  } else if (Math.abs(r - 1 / 8) < epsilon) {
    fractionText = "1/8";
  } else if (Math.abs(r - 1 / 16) < epsilon) {
    fractionText = "1/16";
  } else {
    fractionText = r.toFixed(2);
  }

  var percent = Math.round(r * 100);
  return fractionText + " Hurt resist (~" + percent + "%)";
}

function createSummaryItem(doc, result) {
  var item = doc.createElement("div");
  item.className = "list-group-item bg-dark text-light d-flex align-items-center";

  var img = doc.createElement("img");
  img.src = result.monster.image;
  img.alt = result.monster.name;
  img.className = "me-2";

  var textWrap = doc.createElement("div");

  var title = doc.createElement("div");
  title.className = "fw-semibold";
  title.textContent = result.monster.name;

  var detail = doc.createElement("div");
  var expectedLevel = getHurtResistLevel(result.monster);
  var chosenLevel = result.choice;
  var resist = formatHurtResist(result.monster);

  detail.innerHTML =
    "You answered: <strong>" + chosenLevel.toUpperCase() + "</strong>. " +
    "Correct level: <strong>" + expectedLevel.toUpperCase() + "</strong>. " +
    "<br><span class=\"text-info\">" + resist + "</span>";

  textWrap.appendChild(title);
  textWrap.appendChild(detail);

  item.appendChild(img);
  item.appendChild(textWrap);

  return item;
}

function initQuiz() {
  var doc = window.document;

  var introEl = doc.getElementById("dwr-quiz-intro");
  var startShortBtn = doc.getElementById("dwr-quiz-start-short");
  var startFullBtn = doc.getElementById("dwr-quiz-start-full");
  var questionEl = doc.getElementById("dwr-quiz-question");
  var imgEl = doc.getElementById("dwr-quiz-monster-img");
  var nameEl = doc.getElementById("dwr-quiz-monster-name");
  var btnHigh = doc.getElementById("dwr-quiz-btn-high");
  var btnMedium = doc.getElementById("dwr-quiz-btn-medium");
  var btnLow = doc.getElementById("dwr-quiz-btn-low");
  var feedbackEl = doc.getElementById("dwr-quiz-feedback");
  var cardEl = doc.getElementById("dwr-quiz-card");

  var progressCurrentEl = doc.getElementById("dwr-quiz-progress-current");
  var progressTotalEl = doc.getElementById("dwr-quiz-progress-total");

  var summaryCardEl = doc.getElementById("dwr-quiz-summary");
  var summaryScoreEl = doc.getElementById("dwr-quiz-summary-score");
  var summaryListEl = doc.getElementById("dwr-quiz-summary-list");
  var restartShortBtn = doc.getElementById("dwr-quiz-restart-short");
  var restartFullBtn = doc.getElementById("dwr-quiz-restart-full");

  var soundCorrect = new Audio("/assets/sounds/dwr/dwWonBattle.wav");
  var soundIncorrect = new Audio("/assets/sounds/dwr/dwMiss.wav");
  var soundComplete = new Audio("/assets/sounds/dwr/dwLevelUp.wav");

  if (!introEl || !startShortBtn || !startFullBtn || !questionEl || !imgEl || !nameEl || !btnHigh || !btnMedium || !btnLow || !feedbackEl || !restartShortBtn || !restartFullBtn) {
    return;
  }

  var questions = [];
  var index = 0;
  var results = [];
  var isLocked = false;
  var currentMode = QUIZ_MODE_SHORT;

  function showQuestion() {
    if (index >= questions.length) {
      showSummary();
      return;
    }

    var monster = questions[index];
    progressCurrentEl.textContent = String(index + 1);
    progressTotalEl.textContent = String(questions.length);

    imgEl.src = monster.image;
    imgEl.alt = monster.name;
    nameEl.textContent = monster.name;
    feedbackEl.textContent = "";

    isLocked = false;
  }

  function playSound(audio) {
    try {
      audio.currentTime = 0;
      audio.play();
    } catch (e) {
      // Ignore playback errors
    }
  }

  function handleChoice(choice) {
    if (isLocked) {
      return;
    }
    isLocked = true;

    var monster = questions[index];
    var expected = getHurtResistLevel(monster);
    var isCorrect = choice === expected;

    results.push({
      monster: monster,
      choice: choice,
      correct: isCorrect
    });

    var resist = formatHurtResist(monster);

    if (isCorrect) {
      feedbackEl.innerHTML =
        "<span class=\"text-success fw-semibold\">Correct!</span> " +
        "<span class=\"text-info\">" + resist + "</span>";
      cardEl.classList.remove("dwr-quiz-result-incorrect");
      cardEl.classList.add("dwr-quiz-result-correct");

      playSound(soundCorrect);

      window.setTimeout(function () {
        cardEl.classList.remove("dwr-quiz-result-correct");
        index += 1;
        showQuestion();
      }, NEXT_QUESTION_DELAY_MS);
    } else {
      feedbackEl.innerHTML =
        "<span class=\"text-danger fw-semibold\">Incorrect.</span> " +
        "<span class=\"text-info\">" + resist + "</span>";
      cardEl.classList.remove("dwr-quiz-result-correct");
      cardEl.classList.add("dwr-quiz-result-incorrect");

      playSound(soundIncorrect);

      window.setTimeout(function () {
        cardEl.classList.remove("dwr-quiz-result-incorrect");
        index += 1;
        showQuestion();
      }, NEXT_QUESTION_DELAY_MS);
    }
  }

  function showSummary() {
    // Play completion sound as soon as we reach the summary screen.
    playSound(soundComplete);

    introEl.classList.add("d-none");
    questionEl.classList.add("d-none");
    cardEl.classList.add("d-none");

    var total = results.length;
    var correctCount = 0;
    var incorrect = [];

    for (var i = 0; i < results.length; i += 1) {
      if (results[i].correct) {
        correctCount += 1;
      } else {
        incorrect.push(results[i]);
      }
    }

    summaryScoreEl.textContent =
      "You scored " + correctCount + " out of " + total + " (" +
      Math.round((correctCount / Math.max(1, total)) * 100) + "%).";

    while (summaryListEl.firstChild) {
      summaryListEl.removeChild(summaryListEl.firstChild);
    }

    if (incorrect.length === 0) {
      var perfect = doc.createElement("div");
      perfect.className = "text-success fw-semibold";
      perfect.textContent = "Perfect! You got every monster correct.";
      summaryListEl.appendChild(perfect);
    } else {
      var intro = doc.createElement("div");
      intro.className = "mb-2";
      intro.textContent = "Monsters you missed:";
      summaryListEl.appendChild(intro);

      for (var j = 0; j < incorrect.length; j += 1) {
        summaryListEl.appendChild(createSummaryItem(doc, incorrect[j]));
      }
    }

    summaryCardEl.classList.remove("d-none");
  }

  function startQuiz(mode) {
    currentMode = mode || QUIZ_MODE_SHORT;
    cardEl.classList.remove("d-none");
    summaryCardEl.classList.add("d-none");
    while (summaryListEl.firstChild) {
      summaryListEl.removeChild(summaryListEl.firstChild);
    }

    questions = buildQuizQuestions(currentMode);
    index = 0;
    results = [];
    isLocked = false;

    introEl.classList.add("d-none");
    questionEl.classList.remove("d-none");

    showQuestion();
  }

  startShortBtn.addEventListener("click", function () {
    startQuiz(QUIZ_MODE_SHORT);
  });

  startFullBtn.addEventListener("click", function () {
    startQuiz(QUIZ_MODE_FULL);
  });

  btnHigh.addEventListener("click", function () {
    handleChoice("high");
  });

  btnMedium.addEventListener("click", function () {
    handleChoice("medium");
  });

  btnLow.addEventListener("click", function () {
    handleChoice("low");
  });

  restartShortBtn.addEventListener("click", function () {
    startQuiz(QUIZ_MODE_SHORT);
  });

  restartFullBtn.addEventListener("click", function () {
    startQuiz(QUIZ_MODE_FULL);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initQuiz);
} else {
  initQuiz();
}
