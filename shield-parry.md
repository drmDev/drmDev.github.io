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
<script type="module">
  import { Game } from '/assets/js/shield-parry/game.js';
  
  document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
  });
</script>
