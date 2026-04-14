# Snake Game

A minimal, classic Snake game implemented with plain HTML, CSS, and JavaScript.

## Features

- Grid-based classic Snake gameplay
- Food spawning and snake growth
- Score tracking
- Game over on wall or self collision
- Pause/Resume and Restart support
- Keyboard and on-screen controls

## Run locally

1. From the project root, start a static server:
   ```bash
   python3 -m http.server 8000
   ```
2. Open your browser at:
   ```
   http://localhost:8000
   ```
3. The game is available at `/`.

## Controls

- Move: Arrow keys or `W/A/S/D`
- Pause/Resume: `Space` or `P`
- Restart: `R` or the Restart button

## Project structure

```text
.
├── index.html
├── styles.css
├── src
│   ├── gameLogic.js
│   └── main.js
└── README.md
```

## Core logic notes

- `src/gameLogic.js` contains deterministic, pure game-state functions.
- `src/main.js` handles rendering, input events, and the tick timer.
- Boundary behavior is classic: hitting walls causes game over.

## Manual verification checklist

- [ ] Snake moves one grid cell per tick.
- [ ] Direction changes work, and direct 180-degree reversals are blocked.
- [ ] Eating food increases score by 1 and increases snake length by 1.
- [ ] Food never appears on a snake segment.
- [ ] Hitting a wall ends the game.
- [ ] Hitting the snake body ends the game.
- [ ] Pause freezes movement; resume continues from the same state.
- [ ] Restart resets score and snake to initial state.


