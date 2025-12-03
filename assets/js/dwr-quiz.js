(function () {
  "use strict";

  /**
   * Monster data: all hurt-resist details are specific for the nine special
   * "Don't Hurt Me" monsters; everyone else is treated as 1/16 for this quiz.
   */
  var DWR_MONSTERS = [
    {
      key: "MetalSlime",
      name: "Metal Slime",
      image: "/assets/images/dwr/MetalSlime.png",
      isDontHurtMe: true,
      hurtResistText: "15/16 Hurt resist (Don't Hurt Me)"
    },
    {
      key: "DemonKnight",
      name: "Demon Knight",
      image: "/assets/images/dwr/DemonKnight.png",
      isDontHurtMe: true,
      hurtResistText: "15/16 Hurt resist (Don't Hurt Me)"
    },
    {
      key: "Wizard",
      name: "Wizard",
      image: "/assets/images/dwr/Wizard.png",
      isDontHurtMe: true,
      hurtResistText: "15/16 Hurt resist (Don't Hurt Me)"
    },
    {
      key: "StoneMan",
      name: "Stoneman",
      image: "/assets/images/dwr/StoneMan.png",
      isDontHurtMe: true,
      hurtResistText: "7/16 Hurt resist (Don't Hurt Me)"
    },
    {
      key: "BlueDragon",
      name: "Blue Dragon",
      image: "/assets/images/dwr/BlueDragon.png",
      isDontHurtMe: true,
      hurtResistText: "7/16 Hurt resist (Don't Hurt Me)"
    },
    {
      key: "Golem",
      name: "Golem",
      image: "/assets/images/dwr/Golem.png",
      isDontHurtMe: true,
      hurtResistText: "15/16 Hurt resist (Don't Hurt Me)"
    },
    {
      key: "RedDragon",
      name: "Red Dragon",
      image: "/assets/images/dwr/RedDragon.png",
      isDontHurtMe: true,
      hurtResistText: "15/16 Hurt resist (Don't Hurt Me)"
    },
    {
      key: "Dragonlord1",
      name: "Dragonlord 1",
      image: "/assets/images/dwr/Dragonlord.png",
      isDontHurtMe: true,
      hurtResistText: "15/16 Hurt resist (Don't Hurt Me)"
    },
    {
      key: "Dragonlord2",
      name: "Dragonlord 2",
      image: "/assets/images/dwr/DragonlordsTrueSelf.png",
      isDontHurtMe: true,
      hurtResistText: "15/16 Hurt resist (Don't Hurt Me)"
    },
    // A sampling of other mobs; all treated as 0-1 resist in this quiz.
    { key: "Slime", name: "Slime", image: "/assets/images/dwr/Slime.png", isDontHurtMe: false },
    { key: "RedSlime", name: "Red Slime", image: "/assets/images/dwr/RedSlime.png", isDontHurtMe: false },
    { key: "Drakee", name: "Drakee", image: "/assets/images/dwr/Drakee.png", isDontHurtMe: false },
    { key: "Drakeema", name: "Drakeema", image: "/assets/images/dwr/Drakeema.png", isDontHurtMe: false },
    { key: "Magidrakee", name: "Magidrakee", image: "/assets/images/dwr/Magidrakee.png", isDontHurtMe: false },
    { key: "Ghost", name: "Ghost", image: "/assets/images/dwr/Ghost.png", isDontHurtMe: false },
    { key: "Magician", name: "Magician", image: "/assets/images/dwr/Magician.png", isDontHurtMe: false },
    { key: "Warlock", name: "Warlock", image: "/assets/images/dwr/Warlock.png", isDontHurtMe: false },
    { key: "Droll", name: "Droll", image: "/assets/images/dwr/Droll.png", isDontHurtMe: false },
    { key: "Drollmagi", name: "Drollmagi", image: "/assets/images/dwr/Drollmagi.png", isDontHurtMe: false },
    { key: "Druin", name: "Druin", image: "/assets/images/dwr/Druin.png", isDontHurtMe: false },
    { key: "Druinlord", name: "Druinlord", image: "/assets/images/dwr/Druinlord.png", isDontHurtMe: false },
    { key: "Scorpion", name: "Scorpion", image: "/assets/images/dwr/Scorpion.png", isDontHurtMe: false },
    { key: "RogueScorpion", name: "Rogue Scorpion", image: "/assets/images/dwr/RogueScorpion.png", isDontHurtMe: false },
    { key: "MetalScorpion", name: "Metal Scorpion", image: "/assets/images/dwr/MetalScorpion.png", isDontHurtMe: false },
    { key: "Knight", name: "Knight", image: "/assets/images/dwr/Knight.png", isDontHurtMe: false },
    { key: "ArmoredKnight", name: "Armored Knight", image: "/assets/images/dwr/ArmoredKnight.png", isDontHurtMe: false },
    { key: "AxeKnight", name: "Axe Knight", image: "/assets/images/dwr/AxeKnight.png", isDontHurtMe: false },
    { key: "Werewolf", name: "Werewolf", image: "/assets/images/dwr/Werewolf.png", isDontHurtMe: false },
    { key: "Wyvern", name: "Wyvern", image: "/assets/images/dwr/Wyvern.png", isDontHurtMe: false },
    { key: "Magiwyvern", name: "Magiwyvern", image: "/assets/images/dwr/Magiwyvern.png", isDontHurtMe: false },
    { key: "GreenDragon", name: "Green Dragon", image: "/assets/images/dwr/GreenDragon.png", isDontHurtMe: false },
    { key: "Starwyvern", name: "Starwyvern", image: "/assets/images/dwr/Starwyvern.png", isDontHurtMe: false },
    { key: "Wolf", name: "Wolf", image: "/assets/images/dwr/Wolf.png", isDontHurtMe: false },
    { key: "Wolflord", name: "Wolflord", image: "/assets/images/dwr/Wolflord.png", isDontHurtMe: false },
    { key: "Goldman", name: "Goldman", image: "/assets/images/dwr/Goldman.png", isDontHurtMe: false },
    { key: "Poltergeist", name: "Poltergeist", image: "/assets/images/dwr/Poltergeist.png", isDontHurtMe: false },
    { key: "Specter", name: "Specter", image: "/assets/images/dwr/Specter.png", isDontHurtMe: false },
    { key: "Skeleton", name: "Skeleton", image: "/assets/images/dwr/Skeleton.png", isDontHurtMe: false },
    { key: "Wraith", name: "Wraith", image: "/assets/images/dwr/Wraith.png", isDontHurtMe: false },
    { key: "WraithKnight", name: "Wraith Knight", image: "/assets/images/dwr/WraithKnight.png", isDontHurtMe: false }
  ];

  var QUIZ_20_LENGTH = 20;
  var REQUIRED_DONT_HURT_ME_COUNT = 9;
  var QUIZ_MODE_SHORT = "short";
  var QUIZ_MODE_FULL = "full";
  var NEXT_QUESTION_DELAY_MS = 2000;

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
    var dontHurtMe = [];
    var others = [];
    for (var i = 0; i < DWR_MONSTERS.length; i += 1) {      
      // Always include all 9 "Don't Hurt Me" mobs.
      if (DWR_MONSTERS[i].isDontHurtMe) {
        dontHurtMe.push(DWR_MONSTERS[i]);
      } else {
        others.push(DWR_MONSTERS[i]);
      }
    }

    if (mode === QUIZ_MODE_FULL) {
      // Full roster quiz: include every monster once.
      return shuffle(dontHurtMe.concat(others));
    }

    var questions = [];
    questions = questions.concat(dontHurtMe);

    var neededOthers = QUIZ_20_LENGTH - REQUIRED_DONT_HURT_ME_COUNT;
    var shuffledOthers = shuffle(others).slice(0, neededOthers);
    questions = questions.concat(shuffledOthers);

    return shuffle(questions);
  }

  function getExpectedChoice(monster) {
    // "never" = Never cast Hurt; "okay" = Okay to cast Hurt in at least some situations.
    return monster.isDontHurtMe ? "never" : "okay";
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
    var expectedChoice = getExpectedChoice(result.monster) === "never" ? "Never cast Hurt" : "Okay to cast Hurt";
    var chosenChoice = result.choice === "never" ? "Never cast Hurt" : "Okay to cast Hurt";
    var resist = result.monster.hurtResistText || "1/16 Hurt resist (approx.)";

    detail.innerHTML =
      "You answered: <strong>" + chosenChoice + "</strong>. " +
      "Correct classification: <strong>" + expectedChoice + "</strong>. " +
      "<br>Hurt resist: <span class=\"text-info\">" + resist + "</span>";

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
    var btnHurt = doc.getElementById("dwr-quiz-btn-hurt");
    var btnMelee = doc.getElementById("dwr-quiz-btn-melee");
    var feedbackEl = doc.getElementById("dwr-quiz-feedback");
    var cardEl = doc.getElementById("dwr-quiz-card");

    var progressCurrentEl = doc.getElementById("dwr-quiz-progress-current");
    var progressTotalEl = doc.getElementById("dwr-quiz-progress-total");

    var summaryCardEl = doc.getElementById("dwr-quiz-summary");
    var summaryScoreEl = doc.getElementById("dwr-quiz-summary-score");
    var summaryListEl = doc.getElementById("dwr-quiz-summary-list");
    var restartShortBtn = doc.getElementById("dwr-quiz-restart-short");
    var restartFullBtn = doc.getElementById("dwr-quiz-restart-full");

    // Simple audio setup: reuse Audio objects and reset currentTime before play
    var soundCorrect = new Audio("/assets/sounds/dwr/dwWonBattle.wav");
    var soundIncorrect = new Audio("/assets/sounds/dwr/dwMiss.wav");
    var soundComplete = new Audio("/assets/sounds/dwr/dwLevelUp.wav");

    if (!introEl || !startShortBtn || !startFullBtn || !questionEl || !imgEl || !nameEl || !btnHurt || !btnMelee || !feedbackEl || !restartShortBtn || !restartFullBtn) {
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
      feedbackEl.className = "small";

      isLocked = false;
    }

    function playSound(audio) {
      try {
        audio.currentTime = 0;
        audio.play();
      } catch (e) {
        // Ignore playback errors (e.g., browser autoplay restrictions)
      }
    }

    function handleChoice(choice) {
      if (isLocked) {
        return;
      }
      isLocked = true;

      var monster = questions[index];
      var expected = getExpectedChoice(monster);
      var isCorrect = choice === expected;

      results.push({
        monster: monster,
        choice: choice,
        correct: isCorrect
      });

      var resist = monster.hurtResistText || "1/16 Hurt resist (approx.)";

      if (isCorrect) {
        feedbackEl.innerHTML =
          "<span class=\"text-success fw-semibold\">Correct!</span> " +
          "Hurt resist: <span class=\"text-info\">" + resist + "</span>";
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
          "Hurt resist: <span class=\"text-info\">" + resist + "</span>";
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

      // Play completion sound when the quiz ends
      playSound(soundComplete);
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

    btnHurt.addEventListener("click", function () {
      handleChoice("okay");
    });

    btnMelee.addEventListener("click", function () {
      handleChoice("never");
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
})();
