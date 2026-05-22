export interface Player {
  id: string;
  name: string;
  position: number;
  safeSnakeNumber: number;
  color: string;
  isBot: boolean;
}

export interface Snake {
  head: number;
  tail: number;
}

export interface Ladder {
  bottom: number;
  top: number;
}

export interface GameBoard {
  snakes: Snake[];
  ladders: Ladder[];
}

export function generateBoard(
  playerSnakeHeads: number[] = [],
  numSnakes: number = 3,
  numLadders: number = 5,
  gameMode: string = "own-snake"
): GameBoard {
  const snakes: Snake[] = [];
  const ladders: Ladder[] = [];
  const usedCells = new Set<number>([1, 100]); // 1 and 100 cannot be start/end points
  const snakeHeads = new Set<number>();

  const getRandomCell = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const causesSequenceOfThree = (h: number, existingHeads: Set<number>): boolean => {
    if (existingHeads.has(h - 1) && existingHeads.has(h - 2)) return true;
    if (existingHeads.has(h - 1) && existingHeads.has(h + 1)) return true;
    if (existingHeads.has(h + 1) && existingHeads.has(h + 2)) return true;
    return false;
  };

  const isNegativeSnake = gameMode === "negative-snake";

  // 1. Generate Player Owned Snakes first (only if not classic/negative-snake)
  if (gameMode === "own-snake") {
    playerSnakeHeads.forEach(head => {
      let tail = 0;
      let attempts = 0;
      while (attempts < 100) {
        tail = getRandomCell(2, head - 10);
        if (!usedCells.has(tail)) {
          usedCells.add(head);
          usedCells.add(tail);
          snakes.push({ head, tail });
          snakeHeads.add(head);
          break;
        }
        attempts++;
      }
    });
  }

  // 2. Generate random snakes based on custom count
  const topRowSnakesNeeded = isNegativeSnake ? 0 : Math.min(numSnakes, Math.floor(Math.random() * 2) + 1);

  for (let i = 0; i < numSnakes; i++) {
    let head = 0, tail = 0;
    let attempts = 0;
    const mustBeTopRow = i < topRowSnakesNeeded;

    while (attempts < 100) {
      if (isNegativeSnake) {
        head = getRandomCell(2, 85);
        tail = getRandomCell(head + 10, 99);
      } else {
        head = mustBeTopRow ? getRandomCell(91, 99) : getRandomCell(15, 99);
        tail = getRandomCell(2, head - 10);
      }
      if (!usedCells.has(head) && !usedCells.has(tail) && !causesSequenceOfThree(head, snakeHeads)) {
        usedCells.add(head);
        usedCells.add(tail);
        snakes.push({ head, tail });
        snakeHeads.add(head);
        break;
      }
      attempts++;
    }
  }

  // 3. Generate ladders based on custom count
  const topRowLaddersNeeded = isNegativeSnake ? Math.min(numLadders, Math.floor(Math.random() * 2) + 1) : 0;

  for (let i = 0; i < numLadders; i++) {
    let bottom = 0, top = 0;
    let attempts = 0;
    const mustBeTopRow = i < topRowLaddersNeeded;

    while (attempts < 100) {
      if (mustBeTopRow) {
        top = getRandomCell(91, 99);
        bottom = getRandomCell(2, top - 10);
      } else {
        bottom = getRandomCell(2, 85);
        top = getRandomCell(bottom + 10, 99);
      }
      if (!usedCells.has(bottom) && !usedCells.has(top)) {
        usedCells.add(bottom);
        usedCells.add(top);
        ladders.push({ bottom, top });
        break;
      }
      attempts++;
    }
  }

  return { snakes, ladders };
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function calculateNewPosition(
  currentPos: number,
  diceValue: number,
  board: GameBoard,
  player: Player,
  gameMode: string = "own-snake"
): { position: number; message: string; wasSafeSnake: boolean; grantsAnotherTurn: boolean } {
  let newPos = currentPos;
  let message = `Rolled a ${diceValue}.`;
  let wasSafeSnake = false;
  let grantsAnotherTurn = false;

  // Handle Home position
  if (currentPos === 0) {
    if (diceValue === 6) {
      newPos = 1;
      message += " Unlocked from home! You get another turn.";
      grantsAnotherTurn = true;
    } else {
      message += " Need a 6 to unlock from home.";
    }
    return { position: newPos, message, wasSafeSnake, grantsAnotherTurn };
  }

  // Normal movement
  newPos = currentPos + diceValue;

  if (newPos > 100) {
    // Need exact roll to win
    newPos = currentPos;
    message += " Need exact roll to reach 100. Cannot move.";
    // Even if they rolled a 6, they didn't move, so they don't get another turn
    grantsAnotherTurn = false;
    return { position: newPos, message, wasSafeSnake, grantsAnotherTurn };
  }

  if (gameMode === "negative-snake") {
    // Check ladders (they slide you DOWN from the top in negative-snake mode)
    const ladder = board.ladders.find(l => l.top === newPos);
    if (ladder) {
      newPos = ladder.bottom;
      message += ` Slid down a ladder from ${ladder.top} to ${ladder.bottom}!`;
    } else {
      // Check snakes (they slide you UP from the head in negative-snake mode)
      const snake = board.snakes.find(s => s.head === newPos);
      if (snake) {
        newPos = snake.tail;
        message += ` Boosted UP by a snake from ${snake.head} to ${snake.tail}!`;
      }
    }
  } else {
    // Check ladders
    const ladder = board.ladders.find(l => l.bottom === newPos);
    if (ladder) {
      newPos = ladder.top;
      message += ` Climbed a ladder from ${ladder.bottom} to ${ladder.top}!`;
    } else {
      // Check snakes
      const snake = board.snakes.find(s => s.head === newPos);
      if (snake) {
        if (gameMode !== "classic" && newPos === player.safeSnakeNumber) {
          wasSafeSnake = true;
          message += ` Landed on snake at ${snake.head}, but it's your SAFE SNAKE! Immune!`;
        } else {
          newPos = snake.tail;
          message += ` Bitten by a snake! Slide down from ${snake.head} to ${snake.tail}.`;
        }
      }
    }
  }

  if (diceValue === 6 && newPos !== currentPos) {
    grantsAnotherTurn = true;
    message += " Rolled a 6, so you get another turn!";
  }

  return { position: newPos, message, wasSafeSnake, grantsAnotherTurn };
}
