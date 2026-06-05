export function generateBoard(playerSnakeHeads = [], numSnakes = 3, numLadders = 5, gameMode = "own-snake", numCrowns = 1, numBlackHoles = 4) {
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

  // 1. Generate Player Owned Snakes first (only if not classic/negative-snake/beast-snakes)
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
  if (gameMode === "beast-snakes") {
    // Generate the 4 special beast snakes
    const beasts = [
      { name: "Anaconda 🦖", type: "anaconda", headMin: 91, headMax: 99, tailMin: 5, tailMax: 15 },
      { name: "Python ❄️", type: "python", headMin: 71, headMax: 85, tailMin: 30, tailMax: 45 },
      { name: "Cobra 🧪", type: "cobra", headMin: 51, headMax: 69, tailMin: 20, tailMax: 35 },
      { name: "Viper 🌀", type: "viper", headMin: 25, headMax: 49, tailMin: 6, tailMax: 15 },
      { name: "Rainbow Boa 🌈", type: "rainbow", headMin: 15, headMax: 35, tailMin: 60, tailMax: 80 }
    ];

    beasts.forEach(beast => {
      let attempts = 0;
      while (attempts < 100) {
        const head = getRandomCell(beast.headMin, beast.headMax);
        const tail = getRandomCell(beast.tailMin, beast.tailMax);
        if (!usedCells.has(head) && !usedCells.has(tail) && !causesSequenceOfThree(head, snakeHeads)) {
          usedCells.add(head);
          usedCells.add(tail);
          snakes.push({ head, tail, type: beast.type, name: beast.name });
          snakeHeads.add(head);
          break;
        }
        attempts++;
      }
    });

    // Also add standard grass snakes based on numSnakes
    for (let i = 0; i < numSnakes; i++) {
      let attempts = 0;
      const isTopRowSnake = (i === 0); // First grass snake must be in top row (90-99)
      while (attempts < 100) {
        const head = isTopRowSnake ? getRandomCell(90, 99) : getRandomCell(16, 89);
        const tail = getRandomCell(2, head - 10);
        if (!usedCells.has(head) && !usedCells.has(tail) && !causesSequenceOfThree(head, snakeHeads)) {
          usedCells.add(head);
          usedCells.add(tail);
          snakes.push({ head, tail, type: "standard", name: "Grass Snake 🐍" });
          snakeHeads.add(head);
          break;
        }
        attempts++;
      }
    }
  } else {
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

  // 4. Generate crowns (only in kings-crown mode)
  const crowns = [];
  if (gameMode === "kings-crown") {
    for (let i = 0; i < numCrowns; i++) {
      let attempts = 0;
      while (attempts < 100) {
        const cell = getRandomCell(2, 99);
        if (!usedCells.has(cell)) {
          usedCells.add(cell);
          crowns.push(cell);
          break;
        }
        attempts++;
      }
    }
  }

  // 5. Generate black holes (only in black-hole mode)
  const blackHoles = [];
  if (gameMode === "black-hole") {
    for (let i = 0; i < numBlackHoles; i++) {
      let attempts = 0;
      while (attempts < 100) {
        const cell = getRandomCell(2, 99);
        if (!usedCells.has(cell)) {
          usedCells.add(cell);
          blackHoles.push(cell);
          break;
        }
        attempts++;
      }
    }
  }

  return { snakes, ladders, crowns, blackHoles };
}

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function calculateNewPosition(currentPos, diceValue, board, player, gameMode = "own-snake") {
  let newPos = currentPos;
  let message = `Rolled a ${diceValue}.`;
  let wasSafeSnake = false;
  let grantsAnotherTurn = false;

  // Retrieve player status from player.unlockAttempts
  const unlockAttempts = player ? (player.unlockAttempts || 0) : 0;
  let updatedAttempts = unlockAttempts;

  // Check if player is a King (holding crown)
  let isKing = false;
  let hasVictoryBonus = false;
  if (gameMode === "kings-crown" && board && board.crownOwners && player) {
    isKing = !!board.crownOwners[player.id];
    hasVictoryBonus = isKing && currentPos >= 90;
  }

  // 1. Process Status Effects if gameMode is beast-snakes and player is out of home (position > 0)
  if (gameMode === "beast-snakes" && currentPos > 0) {
    if (unlockAttempts === 100) {
      // Frozen Status Effect
      if (diceValue === 6) {
        newPos = currentPos + 6;
        message = `Rolled a 6! Unfrozen! Walked 6 steps.`;
        updatedAttempts = 0; // Clear status
        grantsAnotherTurn = true;
      } else {
        newPos = currentPos;
        message = `Frozen! Need a 6 to move. Rolled a ${diceValue}.`;
        // Stay frozen
        updatedAttempts = 100;
        grantsAnotherTurn = false;
      }
      return { position: newPos, message, wasSafeSnake, grantsAnotherTurn, updatedAttempts, walkDist: diceValue };
    }

    if (unlockAttempts >= 200 && unlockAttempts <= 202) {
      // Poisoned Status Effect (Roll is halved, rounded down, min 1)
      const remainingTurns = unlockAttempts - 200;
      const halvedRoll = Math.max(1, Math.floor(diceValue / 2));
      newPos = currentPos + halvedRoll;
      message = `Poisoned! Roll halved from ${diceValue} to ${halvedRoll}.`;
      updatedAttempts = remainingTurns > 1 ? 200 + (remainingTurns - 1) : 0; // Decrement or clear
      grantsAnotherTurn = false; // Halved rolls don't grant extra turn even if rolled 6
      return { position: newPos, message, wasSafeSnake, grantsAnotherTurn, updatedAttempts, walkDist: halvedRoll };
    } else if (unlockAttempts >= 300 && unlockAttempts <= 302) {
      // Panicked Status Effect (Walk backwards)
      newPos = currentPos - diceValue;
      if (newPos < 1) newPos = 1;
      message = `Panicked! Walked backwards ${diceValue} steps to ${newPos}.`;
      updatedAttempts = 0; // Clear status
      grantsAnotherTurn = false;
      return { position: newPos, message, wasSafeSnake, grantsAnotherTurn, updatedAttempts, walkDist: diceValue };
    } else {
      // Normal movement
      newPos = currentPos + diceValue;
      updatedAttempts = 0;
      if (diceValue === 6) grantsAnotherTurn = true;
    }
  } else {
    // Handle Home position (standard)
    if (currentPos === 0) {
      if (diceValue === 6) {
        newPos = 1;
        message += " Unlocked from home! You get another turn.";
        grantsAnotherTurn = true;
        updatedAttempts = 0;
      } else {
        message += " Need a 6 to unlock from home.";
        updatedAttempts = unlockAttempts + 1;
      }
      return { position: newPos, message, wasSafeSnake, grantsAnotherTurn, updatedAttempts, walkDist: diceValue };
    }

    // Normal movement (standard)
    let effectiveRoll = diceValue;
    if (isKing) {
      const bonus = hasVictoryBonus ? 4 : 2;
      effectiveRoll = diceValue + bonus;
      message += ` (Royal Bonus: +${bonus} steps!)`;
    }
    newPos = currentPos + effectiveRoll;
    if (diceValue === 6) grantsAnotherTurn = true;
  }

  // Handle exceeding 100
  let effectiveRoll = diceValue;
  if (isKing) {
    effectiveRoll = diceValue + (hasVictoryBonus ? 4 : 2);
  }
  if (newPos > 100) {
    newPos = currentPos;
    message += " Need exact roll to reach 100. Cannot move.";
    grantsAnotherTurn = false;
    return { position: newPos, message, wasSafeSnake, grantsAnotherTurn, updatedAttempts, walkDist: effectiveRoll };
  }

  if (gameMode === "negative-snake") {
    // Check ladders (they slide you DOWN in negative-snake mode)
    const ladder = board.ladders.find(l => l.top === newPos);
    if (ladder) {
      /*
      const biteCount = player ? (player.snakeBiteCount || 0) : 0;
      if (biteCount >= 5) {
        // Secretly immune! Treat as a normal land on the tile, so no slide occurs.
      } else {
      */
        newPos = ladder.bottom;
        message += ` Slid down a ladder from ${ladder.top} to ${ladder.bottom}!`;
      /*
      }
      */
    } else {
      // Check snakes (they slide you UP in negative-snake mode)
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
        /*
        const biteCount = player ? (player.snakeBiteCount || 0) : 0;
        if (biteCount >= 5 && snake.type !== "rainbow") {
          // Secretly immune! Treat as a normal land on the tile, so no slide occurs.
        } else {
        */
          if (gameMode === "kings-crown" && isKing && currentPos >= 90) {
            message += ` Landed on a snake at ${snake.head}, but your Crown's Victory Bonus makes you immune!`;
          } else if (gameMode === "beast-snakes") {
            newPos = snake.tail;
            // Apply custom status effects based on snake type
            if (snake.type === "anaconda") {
              message += ` Landed on Anaconda 🦖! Huge drop from ${snake.head} to ${snake.tail}!`;
            } else if (snake.type === "python") {
              message += ` Bitten by Python ❄️! Slide down to ${snake.tail} and got FROZEN!`;
              updatedAttempts = 100;
            } else if (snake.type === "cobra") {
              message += ` Bitten by Cobra 🧪! Slide down to ${snake.tail} and got POISONED for 2 turns!`;
              updatedAttempts = 202;
            } else if (snake.type === "viper") {
              message += ` Bitten by Viper 🌀! Slide down to ${snake.tail} and got PANICKED!`;
              updatedAttempts = 301;
            } else if (snake.type === "rainbow") {
              message += ` Blessed by Rainbow Boa 🌈! Swept UP the board from ${snake.head} to ${snake.tail}! Plus, you get an extra roll!`;
              grantsAnotherTurn = true;
            } else {
              message += ` Landed on Grass Snake 🐍! Slid down from ${snake.head} to ${snake.tail}.`;
            }
          } else {
            if (gameMode !== "classic" && newPos === (player ? player.ownSnakeNumber : -1)) {
              wasSafeSnake = true;
              message += ` Landed on your OWN snake at ${snake.head}! Immune!`;
            } else {
              newPos = snake.tail;
              message += ` Bitten by a snake! Slide down from ${snake.head} to ${snake.tail}.`;
            }
          }
        /*
        }
        */
      }
    }
  }

  // Check black holes (only in black-hole mode)
  if (gameMode === "black-hole" && board.blackHoles && board.blackHoles.includes(newPos)) {
    const otherHoles = board.blackHoles.filter(h => h !== newPos);
    const isRare = Math.random() < 0.10;
    let destination = newPos;
    if (isRare) {
      destination = Math.floor(Math.random() * (99 - 95 + 1)) + 95;
      message += ` Absorbed by a Black Hole! Rare Event: Space-time collapse warped you near the finish line at cell ${destination}!`;
    } else if (otherHoles.length > 0) {
      destination = otherHoles[Math.floor(Math.random() * otherHoles.length)];
      message += ` Absorbed by a Black Hole! Teleported to another black hole at cell ${destination}!`;
    } else {
      message += ` Absorbed by a Black Hole, but there are no other black holes to teleport to!`;
    }
    newPos = destination;
  }

  // Adjust grantsAnotherTurn if they hit a snake/ladder or just rolled 6
  if (diceValue === 6 && newPos !== currentPos && gameMode !== "beast-snakes") {
    grantsAnotherTurn = true;
    message += " Rolled a 6, so you get another turn!";
  }

  return { position: newPos, message, wasSafeSnake, grantsAnotherTurn, updatedAttempts, walkDist: effectiveRoll };
}

export function shuffleBoardElements(currentBoard, numSnakes = 3, numLadders = 5, gameMode = "shuffle-snake", shuffleSnakes = true, shuffleLadders = false) {
  const snakes = [];
  let ladders = currentBoard.ladders || [];
  const usedCells = new Set([1, 100]); // 1 and 100 cannot be start/end points
  const snakeHeads = new Set();

  const getRandomCell = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const causesSequenceOfThree = (h, existingHeads) => {
    if (existingHeads.has(h - 1) && existingHeads.has(h - 2)) return true;
    if (existingHeads.has(h - 1) && existingHeads.has(h + 1)) return true;
    if (existingHeads.has(h + 1) && existingHeads.has(h + 2)) return true;
    return false;
  };

  // If we need to shuffle ladders too, regenerate them!
  if (shuffleLadders) {
    ladders = [];
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
  } else {
    // Keep existing ladders and add them to usedCells
    ladders.forEach(l => {
      usedCells.add(l.bottom);
      usedCells.add(l.top);
    });
  }

  // Generate new snakes
  if (shuffleSnakes) {
    // Guarantee at least 1 or 2 snakes starting between 91 and 99 (like in standard mode)
    const topRowSnakesNeeded = Math.min(numSnakes, Math.floor(Math.random() * 2) + 1);

    for (let i = 0; i < numSnakes; i++) {
      let head = 0, tail = 0;
      let attempts = 0;
      const mustBeTopRow = i < topRowSnakesNeeded;

      while (attempts < 100) {
        head = mustBeTopRow ? getRandomCell(91, 99) : getRandomCell(15, 99);
        tail = getRandomCell(2, head - 10);
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
  } else {
    // Keep existing snakes (won't happen in shuffle-snake mode, but safe fallback)
    snakes.push(...(currentBoard.snakes || []));
  }

  return { snakes, ladders };
}

export function shuffleSnakes(currentBoard, numSnakes = 3, gameMode = "shuffle-snake") {
  return shuffleBoardElements(currentBoard, numSnakes, currentBoard.ladders?.length || 5, gameMode, true, false);
}

