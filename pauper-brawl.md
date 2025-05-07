---
layout: default
title: Pauper Brawl Commander Generator
permalink: /pauper-brawl/
---

<h1 class="mb-4 text-center"><i class="fas fa-magic"></i> Pauper Brawl Commander Generator</h1>

<p class="text-center mb-4">
  This tool gives you <strong>random Uncommon Legendary Creatures</strong> available in MTG Arena and legal in the Brawl format! It's gonna be jank!
</p>

<!-- Divider -->
<hr class="my-4 border-light border-2">

<!-- Interaction Section -->
<div class="text-center mb-4">
  <label for="commander-count" class="form-label h5 fw-bold text-light d-block mb-2">
    <i class="fas fa-dice"></i> How many commanders?
  </label>
  <div class="d-flex justify-content-center align-items-end gap-2 flex-wrap">
    <select id="commander-count" class="form-select w-auto">
      {% for i in (2..9) %}
        <option value="{{ i }}">{{ i }}</option>
      {% endfor %}
    </select>
    <button class="btn btn-primary" onclick="generateCommanders()">
      <i class="fas fa-random"></i> Generate Random Commanders
    </button>
  </div>
</div>


<div id="commander-results" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>

<script src="/assets/js/pauper-brawl.js"></script>
