// 52 perimeter track cells in clockwise order
export const TRACK_CELLS = [
  // Bottom Arm - Left Column going up (Blue track segment start)
  { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
  // Left Arm - Bottom Row going left
  { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
  // Left end middle cell
  { x: 0, y: 7 },
  // Left Arm - Top Row going right (Red track segment start)
  { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
  // Top Arm - Left Column going up
  { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },
  // Top end middle cell
  { x: 7, y: 0 },
  // Top Arm - Right Column going down (Green track segment start)
  { x: 8, y: 0 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
  // Right Arm - Top Row going right
  { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
  // Right end middle cell
  { x: 14, y: 7 },
  // Right Arm - Bottom Row going left (Yellow track segment start)
  { x: 14, y: 8 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
  // Bottom Arm - Right Column going down
  { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
  // Bottom end middle cell
  { x: 7, y: 14 },
  // Bottom Arm - Left Column bottom-most (Return to start)
  { x: 6, y: 14 }
];

// Safe zones where clashing is disabled (8 in total)
export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Player start cell indices on the perimeter track (Blue=0, Red=13, Green=26, Yellow=39)
export const START_CELL_INDICES = {
  blue: 0,
  red: 13,
  green: 26,
  yellow: 39
};

// Base slots coordinates
export const BASE_SLOTS = {
  red: [
    { x: 2, y: 2 }, { x: 4, y: 2 },
    { x: 2, y: 4 }, { x: 4, y: 4 }
  ],
  green: [
    { x: 11, y: 2 }, { x: 13, y: 2 },
    { x: 11, y: 4 }, { x: 13, y: 4 }
  ],
  yellow: [
    { x: 11, y: 11 }, { x: 13, y: 11 },
    { x: 11, y: 13 }, { x: 13, y: 13 }
  ],
  blue: [
    { x: 2, y: 11 }, { x: 4, y: 11 },
    { x: 2, y: 13 }, { x: 4, y: 13 }
  ]
};


// Convert player token index (-1 to 56) to absolute grid (x, y) coordinates
export function getTokenCoordinates(color, tokenIdx, stepIdx) {
  const normColor = color.toLowerCase();
  
  // 1. Base yard slot
  if (stepIdx === -1) {
    const slots = BASE_SLOTS[normColor] || BASE_SLOTS.blue;
    return slots[tokenIdx];
  }

  // 2. Home triangle finish (stepIdx = 56)
  if (stepIdx === 56) {
    if (normColor === "blue") return { x: 7, y: 8 };
    if (normColor === "red") return { x: 6, y: 7 };
    if (normColor === "green") return { x: 7, y: 6 };
    if (normColor === "yellow") return { x: 8, y: 7 };
  }

  // 3. Home path segment (stepIdx 51 to 55)
  if (stepIdx >= 51 && stepIdx <= 55) {
    const offset = stepIdx - 51;
    if (normColor === "blue") return { x: 7, y: 13 - offset };
    if (normColor === "red") return { x: 1 + offset, y: 7 };
    if (normColor === "green") return { x: 7, y: 1 + offset };
    if (normColor === "yellow") return { x: 13 - offset, y: 7 };
  }

  // 4. Perimeter path segment (stepIdx 0 to 50)
  const startIndex = START_CELL_INDICES[normColor] || 0;
  const trackIdx = (startIndex + stepIdx) % 52;
  return TRACK_CELLS[trackIdx];
}

// Check which tokens can legally move for a dice roll
export function getLegalMoves(players, activePlayerIdx, diceValue, mode = "ludo-classic") {
  const activePlayer = players[activePlayerIdx];
  const color = activePlayer.color.toLowerCase();
  const tokens = activePlayer.tokens || [-1, -1, -1, -1];
  const moves = [];

  const hasEliminatedOpponent = activePlayer.hasEliminatedOpponent || false;

  tokens.forEach((stepIdx, tIdx) => {
    // Cannot move finished tokens
    if (stepIdx === 56) return;

    if (stepIdx === -1) {
      // Must roll 6 to release from base
      if (diceValue === 6) {
        moves.push(tIdx);
      }
    } else {
      // Normal path movement
      const nextSteps = stepIdx + diceValue;
      
      // Cannot overshoot 56
      if (nextSteps <= 56) {
        // Master variation rule: Cannot enter home path (index > 50) unless they have hit/eliminated at least 1 rival token!
        if (mode === "ludo-master" && nextSteps > 50 && !hasEliminatedOpponent) {
          // If already inside home path, they can move, but they can't cross step 50
          if (stepIdx <= 50) {
            return; // Blocked from entering home path
          }
        }
        moves.push(tIdx);
      }
    }
  });

  return moves;
}

// Execute turn move, returning updated player arrays and logs
export function executeLudoMove(players, activePlayerIdx, tokenIdx, diceValue, mode = "ludo-classic") {
  const updatedPlayers = JSON.parse(JSON.stringify(players));
  const activePlayer = updatedPlayers[activePlayerIdx];
  const color = activePlayer.color.toLowerCase();
  const tokens = activePlayer.tokens;
  const currentStep = tokens[tokenIdx];
  
  let newStep = currentStep;
  let logs = [];
  let extraRoll = false;

  if (currentStep === -1) {
    // Release from base
    newStep = 0;
    logs.push(`${activePlayer.name} released a token to the track! 🚀`);
  } else {
    // Standard move forward
    newStep = currentStep + diceValue;
    logs.push(`${activePlayer.name} moved token ${tokenIdx + 1} forward by ${diceValue}.`);
  }

  tokens[tokenIdx] = newStep;

  // Check if reached home finish
  if (newStep === 56) {
    logs.push(`🎉 Token ${tokenIdx + 1} of ${activePlayer.name} reached HOME!`);
    extraRoll = true; // Finished token grants another turn!
  }

  // Clashing check: only occurs if landed on perimeter track (newStep <= 50)
  if (newStep >= 0 && newStep <= 50) {
    const startTrackIdx = START_CELL_INDICES[color] || 0;
    const finalTrackIdx = (startTrackIdx + newStep) % 52;
    
    // Check if this cell is safe
    const isSafeCell = SAFE_TRACK_INDICES.includes(finalTrackIdx);

    if (!isSafeCell) {
      // Check clashing with any opponent's tokens
      updatedPlayers.forEach((opp, oppIdx) => {
        if (oppIdx === activePlayerIdx) return; // Ignore own tokens
        
        const oppColor = opp.color.toLowerCase();
        const oppStartIdx = START_CELL_INDICES[oppColor] || 0;
        
        opp.tokens.forEach((oppStep, oppTokenIdx) => {
          if (oppStep >= 0 && oppStep <= 50) {
            const oppTrackIdx = (oppStartIdx + oppStep) % 52;
            if (oppTrackIdx === finalTrackIdx) {
              // CLASH TRIGGERED! Kick back to base (-1)
              opp.tokens[oppTokenIdx] = -1;
              logs.push(`⚔️ ${activePlayer.name} kicked ${opp.name}'s token back to base!`);
              
              // Mark elimination for Ludo Master mode
              activePlayer.hasEliminatedOpponent = true;
              extraRoll = true; // Clashing grants another roll!
            }
          }
        });
      });
    }
  }

  return { players: updatedPlayers, logs, extraRoll };
}

// Generate the best move selection for Ludo Bot AI players
export function getBotAIMove(players, activePlayerIdx, legalMoves, diceValue, mode = "ludo-classic") {
  if (legalMoves.length === 0) return null;

  const activePlayer = players[activePlayerIdx];
  const color = activePlayer.color.toLowerCase();
  const tokens = activePlayer.tokens;
  const startIndex = START_CELL_INDICES[color] || 0;

  let bestMove = legalMoves[0];
  let highestScore = -1000;

  legalMoves.forEach(tIdx => {
    const currentStep = tokens[tIdx];
    let score = 0;

    // 1. Prioritize escaping base yard
    if (currentStep === -1 && diceValue === 6) {
      score += 500;
    } else {
      const nextStep = currentStep + diceValue;
      const finalTrackIdx = (startIndex + nextStep) % 52;
      const isSafeCell = SAFE_TRACK_INDICES.includes(finalTrackIdx);

      // 2. Prioritize hitting/clashing an opponent token
      if (nextStep <= 50 && !isSafeCell) {
        let wouldHitOpponent = false;
        players.forEach((opp, oppIdx) => {
          if (oppIdx === activePlayerIdx) return;
          const oppColor = opp.color.toLowerCase();
          const oppStartIdx = START_CELL_INDICES[oppColor] || 0;

          opp.tokens.forEach(oppStep => {
            if (oppStep >= 0 && oppStep <= 50) {
              const oppTrackIdx = (oppStartIdx + oppStep) % 52;
              if (oppTrackIdx === finalTrackIdx) {
                wouldHitOpponent = true;
              }
            }
          });
        });
        if (wouldHitOpponent) {
          score += 600;
        }
      }

      // 3. Prioritize reaching home triangle
      if (nextStep === 56) {
        score += 400;
      }

      // 4. Prioritize entering home path safely
      if (nextStep > 50 && currentStep <= 50) {
        score += 250;
      }

      // 5. Prioritize landing on safe zones
      if (isSafeCell) {
        score += 150;
      }

      // 6. Prefer moving tokens that are furthest along the board
      score += currentStep * 2;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMove = tIdx;
    }
  });

  return bestMove;
}
