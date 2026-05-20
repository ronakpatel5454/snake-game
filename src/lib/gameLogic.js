export function generateBoard(playerSnakeHeads = [], numSnakes = 3, numLadders = 5) {
  const snakes = [];
  const ladders = [];
  const usedCells = new Set([1, 100]); // 1 and 100 cannot be start/end points

  const getRandomCell = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // 1. Generate Player Owned Snakes first
  playerSnakeHeads.forEach(head => {
    let tail = 0;
    let attempts = 0;
    while (attempts < 100) {
      tail = getRandomCell(2, head - 10);
      if (!usedCells.has(tail)) {
        usedCells.add(head);
        usedCells.add(tail);
        snakes.push({ head, tail });
        break;
      }
      attempts++;
    }
  });

  // 2. Generate random snakes based on custom count
  // We guarantee at least 1 or 2 snakes starting between 91 and 99
  const topRowSnakesNeeded = Math.min(numSnakes, Math.floor(Math.random() * 2) + 1);

  for (let i = 0; i < numSnakes; i++) {
    let head = 0, tail = 0;
    let attempts = 0;
    const mustBeTopRow = i < topRowSnakesNeeded;

    while (attempts < 100) {
      head = mustBeTopRow ? getRandomCell(91, 99) : getRandomCell(15, 99);
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

  // 3. Generate ladders based on custom count
  for (let i = 0; i < numLadders; i++) {
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

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function calculateNewPosition(currentPos, diceValue, board, player) {
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
      if (newPos === player.ownSnakeNumber) {
        wasSafeSnake = true;
        message += ` Landed on your OWN snake at ${snake.head}! Immune!`;
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
