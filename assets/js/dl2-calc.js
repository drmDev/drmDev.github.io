// Dragonlord 2 win chance calculator logic

(function () {
  const BASELINE_DEFENSE = 75;
  const SIMULATIONS = 10000;

  let lastOcrStats = null;

  function getNumberValue(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const n = Number(el.value);
    if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
    return Math.floor(n);
  }

  function setNumberValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (value == null || Number.isNaN(Number(value))) return;
    el.value = String(Math.floor(Number(value)));
  }

  function getDeathNecklaceFlag() {
    const yes = document.getElementById('dl2-dn-yes');
    const no = document.getElementById('dl2-dn-no');
    if (yes && yes.checked) return true;
    if (no && no.checked) return false;
    return false;
  }

  function estimateDl2WinChance(params) {
    let {
      attackPower,
      maxHp,
      maxMp,
      fairyWaters,
      hasDeathNecklace,
      defensePower,
      simulations,
    } = params;

    simulations = simulations || SIMULATIONS;

    function toSafeInt(value) {
      const n = Number(value);
      if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
      if (n <= 0) return 0;
      return Math.floor(n);
    }

    attackPower = toSafeInt(attackPower);
    maxHp = toSafeInt(maxHp);
    maxMp = toSafeInt(maxMp);
    fairyWaters = toSafeInt(fairyWaters);
    defensePower = toSafeInt(defensePower || BASELINE_DEFENSE);

    let wins = 0;
    let totalDoubles = 0;
    let totalAttacks = 0;

    for (let i = 0; i < simulations; i += 1) {
      const result = fightDragonlord(
        attackPower,
        maxHp, // playerHp (will be capped to max inside)
        maxHp, // playerMaxHp
        maxMp,
        fairyWaters,
        hasDeathNecklace,
        defensePower,
        'Cautiously',
        'Player',
      );

      if (result.hasWon) {
        wins += 1;
      }
      totalDoubles += result.currentDoubles;
      totalAttacks += result.totalAttacks;
    }

    const winPercent = simulations > 0 ? (wins / simulations) * 100 : 0;
    const doublePercent = totalAttacks > 0 ? (wins / totalAttacks) * 100 : 0;

    return {
      simulations,
      wins,
      winPercent,
      doublePercent,
    };
  }

  // --- DL2 fight logic (adapted from oldDWR.js) ---

  function fightDragonlord(
    attackPower,
    playerHp,
    playerMaxHp,
    playerMp,
    fairyWaters,
    hasDeathNecklace,
    playerDefense,
    swingOption,
    forceBackAttack,
  ) {
    attackPower = checkForNumber(attackPower);
    playerHp = checkForNumber(playerHp);
    playerMp = checkForNumber(playerMp);
    playerMaxHp = checkForNumber(playerMaxHp);
    fairyWaters = checkForNumber(fairyWaters);

    const dlMinAttack = dragonlordMinAttack(playerDefense);
    const dlMaxAttack = dragonlordMaxAttack(playerDefense);
    const playerMinPower = playerMinAttack(attackPower, hasDeathNecklace);
    const playerMaxPower = playerMaxAttack(attackPower, hasDeathNecklace);

    let canDouble = false;
    let currentDoubles = 0;
    let totalAttacks = 0;
    let hasWon = false;
    let dlHp = randomNumber(150, 165);
    let turnCounter = 1;

    if (hasDeathNecklace) {
      playerMaxHp -= playerMaxHp * 0.25;
    }
    if (playerHp > playerMaxHp) {
      playerHp = playerMaxHp;
    }

    while (playerHp > 0 && dlHp > 0) {
      if (turnCounter === 1) {
        if (forceBackAttack !== 'Player') {
          if (randomNumber(1, 3) === 1 || forceBackAttack === 'Dragonlord') {
            playerHp -= dragonlordTurn(dlMinAttack, dlMaxAttack);
          }
        }
      }

      if (playerDecision(playerHp, dlMaxAttack, swingOption) === true && playerMp >= 8) {
        playerMp -= 8;
        playerHp += castHealmore(playerMaxHp);
        if (playerHp > playerMaxHp) {
          playerHp = playerMaxHp;
        }
        canDouble = false;
      } else {
        totalAttacks += 1;
        if (fairyWaters > 0 && playerMaxPower <= 16) {
          fairyWaters -= 1;
          dlHp -= randomNumber(9, 16);
        } else {
          dlHp -= playerAttack(playerMinPower, playerMaxPower);
        }
        if (canDouble === true) {
          currentDoubles += 1;
        } else {
          canDouble = true;
        }
      }

      playerHp -= dragonlordTurn(dlMinAttack, dlMaxAttack);
      turnCounter += 1;
    }

    if (playerHp <= 0) {
      hasWon = false;
    } else {
      hasWon = true;
    }

    return { hasWon, currentDoubles, totalAttacks };
  }

  function dragonlordTurn(minAttack, maxAttack) {
    let damage = 0;
    if (randomNumber(1, 2) === 1) {
      const breathAttackRange = randomNumber(1, 8);
      switch (breathAttackRange) {
        case 1:
          damage = 42;
          break;
        case 2:
        case 3:
        case 4:
          damage = 44;
          break;
        case 5:
        case 6:
        case 7:
          damage = 46;
          break;
        case 8:
          damage = 48;
          break;
        default:
          damage = 46;
      }
    } else {
      damage = randomNumber(minAttack, maxAttack);
    }
    return damage;
  }

  function playerDecision(playerHp, dragonlordMaxAttack, swingOption) {
    switch (swingOption) {
      case 'Cautiously':
        if (playerHp < dragonlordMaxAttack || playerHp < 48) {
          return true;
        }
        return false;
      case '48':
        if (playerHp < 47) {
          return true;
        }
        return false;
      case '47':
        if (playerHp < 46) {
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  function castHealmore(playerMaxHp) {
    const minHeal = Math.min(85, playerMaxHp);
    const maxHeal = Math.min(100, playerMaxHp);
    return randomNumber(minHeal, maxHeal);
  }

  function playerAttack(playerMinAttack, playerMaxAttack) {
    return randomNumber(playerMinAttack, playerMaxAttack);
  }

  function playerMinAttack(attackPower, hasDeathNecklace) {
    if (hasDeathNecklace) {
      attackPower += 10;
    }
    return Math.max(0, Math.floor((attackPower - 100) / 4));
  }

  function playerMaxAttack(attackPower, hasDeathNecklace) {
    if (hasDeathNecklace) {
      attackPower += 10;
    }
    return Math.max(1, Math.floor((attackPower - 100) / 2));
  }

  function dragonlordMinAttack(playerDefense) {
    if (playerDefense === null || playerDefense === 0) {
      playerDefense = BASELINE_DEFENSE;
    }
    return Math.floor((140 - playerDefense / 2) / 4);
  }

  function dragonlordMaxAttack(playerDefense) {
    if (playerDefense === null || playerDefense === 0) {
      playerDefense = BASELINE_DEFENSE;
    }
    return Math.floor((140 - playerDefense / 2) / 2);
  }

  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function checkForNumber(number) {
    const n = Number(number);
    if (Number.isNaN(n) || !Number.isFinite(n)) {
      return 0;
    }
    if (n <= 0) {
      return 0;
    }
    return Math.floor(n);
  }

  // --- DOM wiring ---

  function handleCalculate() {
    const attackPower = getNumberValue('dl2-attack');
    const maxHp = getNumberValue('dl2-max-hp');
    const maxMp = getNumberValue('dl2-max-mp');
    const fairyWaters = getNumberValue('dl2-fairy-waters');
    const hasDeathNecklace = getDeathNecklaceFlag();

    const defensePower = lastOcrStats && lastOcrStats.defensePower != null
      ? lastOcrStats.defensePower
      : BASELINE_DEFENSE;

    const result = estimateDl2WinChance({
      attackPower,
      maxHp,
      maxMp,
      fairyWaters,
      hasDeathNecklace,
      defensePower,
      simulations: SIMULATIONS,
    });

    updateResultCard(result);
  }

  function updateResultCard(result) {
    const card = document.getElementById('dl2-result');
    const textEl = document.getElementById('dl2-result-text');
    const detailEl = document.getElementById('dl2-result-detail');
    if (!card || !textEl || !detailEl) return;

    const pct = result.winPercent || 0;
    const rounded = pct.toFixed(2);

    // Reset any previous emphasis classes
    textEl.classList.remove('text-success', 'text-warning', 'text-danger', 'fw-bold');

    if (pct >= 75) {
      textEl.classList.add('text-success', 'fw-bold');
    } else if (pct >= 50) {
      textEl.classList.add('text-warning', 'fw-bold');
    } else {
      textEl.classList.add('text-danger', 'fw-bold');
    }

    textEl.textContent = `Estimated win chance ${rounded}%`;
    detailEl.textContent = `(Simulated ${result.simulations} fights; ${result.wins} wins. `
      + `Approx. double-attack rate: ${result.doublePercent.toFixed(2)}%.)`;
  }

  function applyOcrStats(stats) {
    lastOcrStats = stats;
    if (!stats) return;

    if (stats.attackPower != null) {
      setNumberValue('dl2-attack', stats.attackPower);
    }
    if (stats.maxHp != null) {
      setNumberValue('dl2-max-hp', stats.maxHp);
    }
    if (stats.maxMp != null) {
      setNumberValue('dl2-max-mp', stats.maxMp);
    }
    // defensePower is kept in memory only; we do not show it as a field

    // Automatically run a calculation once OCR has populated stats
    handleCalculate();
  }

  function init() {
    const btn = document.getElementById('dl2-calc-btn');
    if (btn) {
      btn.addEventListener('click', handleCalculate);
    }

    window.addEventListener('dwr-ocr-stats', (e) => {
      const stats = e.detail;
      applyOcrStats(stats);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
