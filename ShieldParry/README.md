# Shield Parry Tutorial

A simple 2D web-based game inspired by Doom: Dark Ages' parry mechanics. This tutorial level demonstrates the core parry and shield bash mechanics.

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (optional, but recommended)

## How to Run

1. Clone or download this repository
2. Open the `index.html` file in your web browser
   - For the best experience, use a local web server:
     - Using Python: `python -m http.server` in the project directory
     - Using Node.js: Install `http-server` globally (`npm install -g http-server`) and run `http-server` in the project directory

## How to Play

- The game runs in a 800x600 pixel window
- You control a white rectangle at the bottom of the screen (the player)
- A pink rectangle at the top represents the enemy
- The enemy will shoot projectiles:
  - Red projectiles: Cannot be parried, must be avoided
  - Green projectiles: Can be parried
- Controls:
  - WASD: Move the player
  - SPACE: Parry (has a generous timing window)
  - LEFT SHIFT: Shield bash (only works when enemy is stunned)
- Gameplay:
  - Time your parry to deflect green projectiles
  - Successful parries will stun the enemy (turns yellow)
  - When the enemy is stunned, use LEFT SHIFT to perform a shield bash
  - Shield bash will charge you into the enemy, defeating them
  - Failed parries or getting hit by red projectiles will reduce your health
  - Touching the enemy without it being stunned will kill you instantly
  - Game over when health reaches 0

## Features

- Health system with visual feedback
- Parry mechanics with generous timing window
- Visual and haptic feedback for successful parries
- Enemy stun system
- Shield bash attack with blood particle effects
- Player movement with WASD controls
- Sound effects for all actions
- Blood particle effects on enemy defeat
- Projectile waves that target the player
- Simple but effective tutorial level

## Technical Details

- Built with vanilla JavaScript and HTML5 Canvas
- No external dependencies required
- Responsive design that works on most modern browsers
- Includes haptic feedback support for compatible devices
- Sound effects for enhanced gameplay experience 