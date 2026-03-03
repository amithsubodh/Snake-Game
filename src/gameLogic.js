/**
 * @typedef {{ x: number, y: number }} Position
 * @typedef {{ cols: number, rows: number }} GridSize
 * @typedef {'up' | 'down' | 'left' | 'right'} Direction
 * @typedef {'running' | 'paused' | 'gameover'} GameStatus
 *
 * @typedef {Object} GameState
 * @property {Position[]} snake
 * @property {Direction} direction
 * @property {Direction} pendingDirection
 * @property {Position} food
 * @property {number} score
 * @property {GameStatus} status
 * @property {GridSize} gridSize
 */

const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

/**
 * @param {Direction} current
 * @param {Direction} next
 * @returns {boolean}
 */
function isOppositeDirection(current, next) {
  return OPPOSITE[current] === next;
}

/**
 * @param {Position} position
 * @returns {string}
 */
function toKey(position) {
  return `${position.x},${position.y}`;
}

/**
 * @param {GridSize} gridSize
 * @returns {Position}
 */
function getDefaultStartHead(gridSize) {
  return {
    x: Math.floor(gridSize.cols / 2),
    y: Math.floor(gridSize.rows / 2),
  };
}

/**
 * @param {{ gridSize?: GridSize, startDirection?: Direction, initialSnake?: Position[] }} [config]
 * @param {() => number} [rngFn]
 * @returns {GameState}
 */
export function createInitialState(config = {}, rngFn = Math.random) {
  const gridSize = config.gridSize ?? { cols: 20, rows: 20 };
  const startDirection = config.startDirection ?? 'right';
  const initialSnake =
    config.initialSnake ??
    [
      getDefaultStartHead(gridSize),
      { x: getDefaultStartHead(gridSize).x - 1, y: getDefaultStartHead(gridSize).y },
    ];

  const snakeSet = new Set(initialSnake.map(toKey));
  const food = spawnFood(snakeSet, gridSize, rngFn);

  return {
    snake: initialSnake,
    direction: startDirection,
    pendingDirection: startDirection,
    food,
    score: 0,
    status: 'running',
    gridSize,
  };
}

/**
 * @param {Position} head
 * @param {Direction} direction
 * @returns {Position}
 */
export function getNextHead(head, direction) {
  switch (direction) {
    case 'up':
      return { x: head.x, y: head.y - 1 };
    case 'down':
      return { x: head.x, y: head.y + 1 };
    case 'left':
      return { x: head.x - 1, y: head.y };
    case 'right':
      return { x: head.x + 1, y: head.y };
    default:
      return head;
  }
}

/**
 * @param {Position} position
 * @param {Position[]} snake
 * @param {GridSize} gridSize
 * @returns {{ wall: boolean, self: boolean }}
 */
export function isCollision(position, snake, gridSize) {
  const wall =
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize.cols ||
    position.y >= gridSize.rows;

  const self = snake.some((segment) => segment.x === position.x && segment.y === position.y);

  return { wall, self };
}

/**
 * @param {Set<string>} snakeSet
 * @param {GridSize} gridSize
 * @param {() => number} [rngFn]
 * @returns {Position}
 */
export function spawnFood(snakeSet, gridSize, rngFn = Math.random) {
  const freeCells = [];

  for (let y = 0; y < gridSize.rows; y += 1) {
    for (let x = 0; x < gridSize.cols; x += 1) {
      const key = `${x},${y}`;
      if (!snakeSet.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return { x: -1, y: -1 };
  }

  const index = Math.floor(rngFn() * freeCells.length);
  return freeCells[index];
}

/**
 * @param {GameState} state
 * @param {Direction | null | undefined} inputDirection
 * @param {() => number} [rngFn]
 * @returns {GameState}
 */
export function step(state, inputDirection, rngFn = Math.random) {
  if (state.status !== 'running') {
    return state;
  }

  let nextDirection = state.pendingDirection;
  if (
    inputDirection &&
    !isOppositeDirection(state.direction, inputDirection)
  ) {
    nextDirection = inputDirection;
  }

  const head = state.snake[0];
  const nextHead = getNextHead(head, nextDirection);

  const eatsFood = nextHead.x === state.food.x && nextHead.y === state.food.y;

  const bodyToCheck = eatsFood ? state.snake : state.snake.slice(0, -1);
  const collision = isCollision(nextHead, bodyToCheck, state.gridSize);

  if (collision.wall || collision.self) {
    return {
      ...state,
      direction: nextDirection,
      pendingDirection: nextDirection,
      status: 'gameover',
    };
  }

  const movedSnake = [nextHead, ...state.snake];
  if (!eatsFood) {
    movedSnake.pop();
  }

  const nextSnakeSet = new Set(movedSnake.map(toKey));
  const nextFood = eatsFood ? spawnFood(nextSnakeSet, state.gridSize, rngFn) : state.food;

  return {
    ...state,
    snake: movedSnake,
    direction: nextDirection,
    pendingDirection: nextDirection,
    food: nextFood,
    score: state.score + (eatsFood ? 1 : 0),
  };
}
