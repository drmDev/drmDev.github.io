---
layout: default
title: Shield Parry
permalink: /shield-parry
custom_css: shield-parry.css
---

<div class="container py-4">
  <div class="card shadow-lg border-0 mb-4">
    <div class="card-body">
      <h1 class="card-title h3">
        <i class="fas fa-shield-alt"></i> DDA Shield Parry Mini-Game
      </h1>
      <p class="card-text mb-2">
        A quick browser mini-game inspired by <strong>Doom: Dark Ages</strong>, focused on the parrying mechanic.
      </p>
      <p class="card-text">
        Parry incoming green projectiles to deflect them back at the enemy. A successful parry stuns the enemy (they turn <strong>yellow</strong>), allowing you to destroy them with a shield slam.
      </p>
      <ul class="mb-0">
        <li><kbd>WASD</kbd> to move</li>
        <li><kbd>SPACE</kbd> to parry green projectiles</li>
        <li><kbd>LEFT SHIFT</kbd> to shield slam a stunned (yellow) enemy</li>
      </ul>
    </div>
  </div>


  <div class="game-container text-center">
    <canvas id="gameCanvas"></canvas>
    <div id="health-bar">
      <div id="health-fill"></div>
    </div>
  </div>
</div>

<!-- Game Scripts -->
<script src="/assets/js/shield-parry.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    new Game();
  });
</script>
