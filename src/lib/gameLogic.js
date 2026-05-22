export function generateBoard(playerSnakeHeads = [], numSnakes = 3, numLadders = 5, gameMode = "own-snake") {
  const snakes = [];
  const ladders = [];
  const usedCells = new Set([1, 100]); // 1 and 100 cannot be start/end points
  const snakeHeads = new Set(); // Track all snake heads to prevent sequences of three consecutive heads

  const getRandomCell = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper to ensure we never have three consecutive snake heads (e.g. 75, 76, 77)
  const causesSequenceOfThree = (h, existingHeads) => {
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
  // We guarantee at least 1 or 2 snakes starting between 91 and 99 (standard mode only)
  const topRowSnakesNeeded = isNegativeSnake ? 0 : Math.min(numSnakes, Math.floor(Math.random() * 2) + 1);

  for (let i = 0; i < numSnakes; i++) {
    let head = 0, tail = 0;
    let attempts = 0;
    const mustBeTopRow = i < topRowSnakesNeeded;

    while (attempts < 100) {
      if (isNegativeSnake) {
        // Negative snake: head (mouth) is LOWER than tail. head is between 2 and 85. tail is between head+10 and 99.
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
  // For negative snake mode, guarantee some ladders end in the top row (91-99) as traps right before 100!
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

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function calculateNewPosition(currentPos, diceValue, board, player, gameMode = "own-snake") {
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
        if (gameMode !== "classic" && newPos === player.ownSnakeNumber) {
          wasSafeSnake = true;
          message += ` Landed on your OWN snake at ${snake.head}! Immune!`;
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
