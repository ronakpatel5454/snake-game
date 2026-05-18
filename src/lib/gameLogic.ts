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

export function generateBoard(): GameBoard {
  const snakes: Snake[] = [];
  const ladders: Ladder[] = [];
  const usedCells = new Set<number>([1, 100]); // 1 and 100 cannot be start/end points

  const getRandomCell = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Generate 7 snakes
  for (let i = 0; i < 7; i++) {
    let head = 0, tail = 0;
    let attempts = 0;
    while (attempts < 100) {
      head = getRandomCell(15, 99);
      tail = getRandomCell(2, head - 10);
      if (!usedCells.has(head) && !usedCells.has(tail)) {
        usedCells.add(head);
        usedCells.add(tail);
        snakes.push({ head, tail });
        break;
      }
      attempts++;
    }
  }

  // Generate 7 ladders
  for (let i = 0; i < 7; i++) {
    let bottom = 0, top = 0;
    let attempts = 0;
    while (attempts < 100) {
      bottom = getRandomCell(2, 85);
      top = getRandomCell(bottom + 10, 99);
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
  player: Player
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

  // Check ladders
  const ladder = board.ladders.find(l => l.bottom === newPos);
  if (ladder) {
    newPos = ladder.top;
    message += ` Climbed a ladder from ${ladder.bottom} to ${ladder.top}!`;
  } else {
    // Check snakes
    const snake = board.snakes.find(s => s.head === newPos);
    if (snake) {
      if (newPos === player.safeSnakeNumber) {
        wasSafeSnake = true;
        message += ` Landed on snake at ${snake.head}, but it's your SAFE SNAKE! Immune!`;
      } else {
        newPos = snake.tail;
        message += ` Bitten by a snake! Slide down from ${snake.head} to ${snake.tail}.`;
      }
    }
  }

  if (diceValue === 6 && newPos !== currentPos) {
    grantsAnotherTurn = true;
    message += " Rolled a 6, so you get another turn!";
  }

  return { position: newPos, message, wasSafeSnake, grantsAnotherTurn };
}
