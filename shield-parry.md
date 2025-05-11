---
layout: default
title: Shield Parry
permalink: /shield-parry
custom_css: shield-parry.css
---

# <i class="fas fa-shield-alt"></i> Shield Parry

A fast-paced first-person perspective game inspired by Doom: Dark Ages, focusing on parry mechanics. Test your reflexes and timing as you face waves of projectiles!

<div class="game-container">
    <canvas id="gameCanvas"></canvas>
    <div id="health-bar">
        <div id="health-fill"></div>
    </div>
</div>

<div class="game-controls mt-4">
    <h3><i class="fas fa-gamepad"></i> Controls</h3>
    <ul>
        <li><strong>WASD</strong> - Move</li>
        <li><strong>SPACE</strong> - Parry</li>
        <li><strong>LEFT SHIFT</strong> - Shield Bash (when enemy is stunned)</li>
    </ul>
</div>

<div class="game-instructions mt-4">
    <h3><i class="fas fa-info-circle"></i> How to Play</h3>
    <ul>
        <li>Parry the green projectiles to stun the enemy</li>
        <li>Use shield bash to defeat stunned enemies</li>
        <li>Avoid red projectiles and unstunned enemies</li>
        <li>Watch for the parry window indicator</li>
    </ul>
</div>

<div class="audio-controls mt-4">
    <h3><i class="fas fa-volume-up"></i> Audio Settings</h3>
    <div class="volume-controls">
        <div class="volume-control">
            <label for="sfx-volume">Sound Effects</label>
            <input type="range" id="sfx-volume" min="0" max="100" value="70" class="volume-slider">
            <span class="volume-value">70%</span>
        </div>
        <div class="volume-control">
            <label for="music-volume">Music</label>
            <input type="range" id="music-volume" min="0" max="100" value="50" class="volume-slider" disabled>
            <span class="volume-value">50%</span>
        </div>
        <button id="mute-toggle" class="btn btn-outline-light">
            <i class="fas fa-volume-up"></i> Mute
        </button>
    </div>
</div>

<!-- Game Scripts -->
<script src="/assets/js/shield-parry.js"></script>
<script>
    // Initialize volume controls
    document.addEventListener('DOMContentLoaded', () => {
        const game = new Game();
        
        // Sound Effects Volume Control
        const sfxSlider = document.getElementById('sfx-volume');
        const sfxValue = sfxSlider.nextElementSibling;
        sfxSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            sfxValue.textContent = `${value}%`;
            game.updateVolume('sfx', value / 100);
        });
        
        // Music Volume Control (disabled for now)
        const musicSlider = document.getElementById('music-volume');
        const musicValue = musicSlider.nextElementSibling;
        musicSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            musicValue.textContent = `${value}%`;
            game.updateVolume('music', value / 100);
        });
        
        // Mute Toggle
        const muteButton = document.getElementById('mute-toggle');
        muteButton.addEventListener('click', () => {
            const isMuted = game.toggleMute();
            muteButton.innerHTML = isMuted ? 
                '<i class="fas fa-volume-mute"></i> Unmute' : 
                '<i class="fas fa-volume-up"></i> Mute';
        });
    });
</script> 