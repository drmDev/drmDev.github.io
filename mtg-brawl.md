---
layout: default
title: MTG Brawl Commander Generator
permalink: /mtg-brawl/
---

<!-- Pauper Section -->
<h2 class="text-center text-primary"><i class="fas fa-hat-wizard"></i> Pauper Brawl Commander Generator</h2>
<p class="text-center mb-4">
  Get a <strong>random Uncommon Legendary Creature</strong> (Arena legal, Brawl format). For when you want maximum jank!
</p>
<hr class="my-4 border-light border-2">
<div class="text-center mb-4">
  <label for="commander-count" class="form-label h5 fw-bold text-light d-block mb-2">
    <i class="fas fa-dice"></i> How many commanders?
  </label>
  <div class="d-flex justify-content-center align-items-end gap-2 flex-wrap">
    <select id="commander-count" class="form-select w-auto">
      {% for i in (1..6) %}
        <option value="{{ i }}">{{ i }}</option>
      {% endfor %}
    </select>
    <button class="btn btn-primary" onclick="generateCommanders()">
      <i class="fas fa-random"></i> Generate Random Commanders
    </button>
  </div>
</div>
<div id="commander-results" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>
<hr class="my-5 border-light border-2">

<!-- Rare/Mythic Section -->
<h2 class="text-center rare-heading"><span class="text-warning"><i class="fas fa-crown"></i></span> Rare/Mythic Brawl Commander Generator</h2>
<p class="text-center mb-4">
  Get a <strong>random Rare or Mythic Legendary Creature</strong> (Arena legal, Brawl format). For when you want maximum power!
</p>
<div class="text-center mb-4">
  <label for="commander-count-rare" class="form-label h5 fw-bold text-light d-block mb-2">
    <i class="fas fa-dice-d20"></i> How many commanders?
  </label>
  <div class="d-flex justify-content-center align-items-end gap-2 flex-wrap">
    <select id="commander-count-rare" class="form-select w-auto">
      {% for i in (1..6) %}
        <option value="{{ i }}">{{ i }}</option>
      {% endfor %}
    </select>
    <button class="btn btn-warning" onclick="generateCommanders('rare')">
      <i class="fas fa-random"></i> Generate Rare/Mythic Commanders
    </button>
  </div>
</div>
<div id="commander-results-rare" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>

<script src="/assets/js/mtg-brawl.js"></script>
