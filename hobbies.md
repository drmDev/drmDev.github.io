---
layout: default
title: Hobbies
permalink: /hobbies/
---

# My Hobbies

## Chess
<p>TODO: Add links to useful resources</p>
<p>TODO: Add useful beginner tips</p>
<p>
    <i class="fas fa-chess-king"></i> 
    <i class="fas fa-chess-queen"></i>   
    <i class="fas fa-chess-rook"></i>  
    <i class="fas fa-chess-bishop"></i>  
    <i class="fas fa-chess-knight"></i>  
    <i class="fas fa-chess-pawn"></i>  
</p>

## Magic: The Gathering
<p>
    <img src="/assets/images/mtg/plains.svg" alt="Plains" width="32">
    <img src="/assets/images/mtg/island.svg" alt="Island" width="32">
    <img src="/assets/images/mtg/swamp.svg" alt="Swamp" width="32">
    <img src="/assets/images/mtg/mountain.svg" alt="Mountain" width="32">
    <img src="/assets/images/mtg/forest.svg" alt="Forest" width="32">
</p>

## Board Games
Use the filters below to find board games by number of players and type.

<div>
    <label for="min-players">Min Players:</label>
    <input type="number" id="min-players" min="1" value="1">
    <label for="max-players">Max Players:</label>
    <input type="number" id="max-players" min="1" value="8">
    <label for="type">Type:</label>
    <select id="type">
        <option value="">All</option>
        <option value="strategy">Strategy</option>
        <option value="party">Party</option>
        <option value="deckbuilder">Deckbuilder</option>
    </select>
    <button onclick="filterGames()">Filter</button>
</div>

<div id="game-list"></div>

<script src="/assets/js/boardgames.js"></script>