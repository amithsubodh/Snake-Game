import { createInitialState, step } from './gameLogic.js';

const TICK_MS = 120;
const GRID_SIZE = { cols: 20, rows: 20 };

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const dirButtons = document.querySelectorAll('[data-dir]');

/** @type {import('./gameLogic.js').Direction | null} */
let queuedDirection = null;
let state = createInitialState({ gridSize: GRID_SIZE });

const cells = [];

function createBoard() {
  boardEl.style.gridTemplateColumns = `repeat(${GRID_SIZE.cols}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${GRID_SIZE.rows}, 1fr)`;

  for (let y = 0; y < GRID_SIZE.rows; y += 1) {
    for (let x = 0; x < GRID_SIZE.cols; x += 1) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      boardEl.appendChild(cell);
      cells.push(cell);
    }
  }
}

function getCellIndex(x, y) {
  return y * GRID_SIZE.cols + x;
}

function getStatusLabel() {
  switch (state.status) {
    case 'paused':
      return 'Paused';
    case 'gameover':
      return 'Game Over';
    case 'running':
    default:
      return 'Running';
  }
}

function updatePauseButtonText() {
  pauseBtn.textContent = state.status === 'paused' ? 'Resume' : 'Pause';
  pauseBtn.disabled = state.status === 'gameover';
}

function clearBoardClasses() {
  for (const cell of cells) {
    cell.classList.remove('snake', 'head', 'food');
  }
}

function render() {
  clearBoardClasses();

  for (let i = 0; i < state.snake.length; i += 1) {
    const segment = state.snake[i];
    const index = getCellIndex(segment.x, segment.y);
    const cell = cells[index];
    if (!cell) continue;
    cell.classList.add('snake');
    if (i === 0) {
      cell.classList.add('head');
    }
  }

  if (state.food.x >= 0 && state.food.y >= 0) {
    const foodCell = cells[getCellIndex(state.food.x, state.food.y)];
    if (foodCell) {
      foodCell.classList.add('food');
    }
  }

  scoreEl.textContent = String(state.score);
  statusEl.textContent = getStatusLabel();
  updatePauseButtonText();
}

function onTick() {
  if (state.status !== 'running') {
    return;
  }
  state = step(state, queuedDirection);
  queuedDirection = null;
  render();
}

function requestDirection(direction) {
  queuedDirection = direction;
}

function restartGame() {
  queuedDirection = null;
  state = createInitialState({ gridSize: GRID_SIZE });
  render();
}

function togglePause() {
  if (state.status === 'gameover') {
    return;
  }

  state = {
    ...state,
    status: state.status === 'paused' ? 'running' : 'paused',
  };
  render();
}

function onKeydown(event) {
  const key = event.key.toLowerCase();
  const keyToDirection = {
    arrowup: 'up',
    w: 'up',
    arrowdown: 'down',
    s: 'down',
    arrowleft: 'left',
    a: 'left',
    arrowright: 'right',
    d: 'right',
  };

  if (keyToDirection[key]) {
    event.preventDefault();
    requestDirection(keyToDirection[key]);
    return;
  }

  if (key === ' ' || key === 'p') {
    event.preventDefault();
    togglePause();
    return;
  }

  if (key === 'r') {
    restartGame();
  }
}

function setupControls() {
  document.addEventListener('keydown', onKeydown);

  for (const button of dirButtons) {
    button.addEventListener('click', () => {
      requestDirection(button.dataset.dir);
    });
  }

  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', restartGame);
}

function init() {
  createBoard();
  setupControls();
  render();
  setInterval(onTick, TICK_MS);
}

init();
