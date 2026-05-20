import { useState, useEffect, useRef } from "react";
import GameBoardComponent from "./components/GameBoardComponent";
import LobbyComponent from "./components/LobbyComponent";
import { generateBoard, rollDice, calculateNewPosition } from "./lib/gameLogic";

function Premium3DDice({ value, color, isRolling }) {
  const val = value || 1;

  // 3D rotations to face each rolled side
  const getRotation = (num) => {
    switch (num) {
      case 1: return "rotateX(0deg) rotateY(0deg)";
      case 6: return "rotateX(180deg) rotateY(0deg)";
      case 4: return "rotateX(0deg) rotateY(-90deg)";
      case 3: return "rotateX(0deg) rotateY(90deg)";
      case 2: return "rotateX(-90deg) rotateY(0deg)";
      case 5: return "rotateX(90deg) rotateY(0deg)";
      default: return "rotateX(0deg) rotateY(0deg)";
    }
  };

  // Standard dice layout generator using perfectly centered CSS grid points
  const renderFaceDots = (num) => {
    let dots = [];
    if (num === 1) {
      dots = [{ row: 2, col: 2 }];
    } else if (num === 2) {
      dots = [{ row: 1, col: 1 }, { row: 3, col: 3 }];
    } else if (num === 3) {
      dots = [{ row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }];
    } else if (num === 4) {
      dots = [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }];
    } else if (num === 5) {
      dots = [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 3 }];
    } else if (num === 6) {
      dots = [
        { row: 1, col: 1 }, { row: 1, col: 3 },
        { row: 2, col: 1 }, { row: 2, col: 3 },
        { row: 3, col: 1 }, { row: 3, col: 3 }
      ];
    }

    return (
      <div style={{
        display: "grid",
        gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
        width: "100%",
        height: "100%",
        padding: "6px",
        boxSizing: "border-box"
      }}>
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              gridRow: d.row,
              gridColumn: d.col,
              width: "8px",
              height: "8px",
              background: "white",
              borderRadius: "50%",
              boxShadow: "0 1px 2px rgba(0,0,0,0.4), inset 0 -1px 1px rgba(0,0,0,0.2)",
              alignSelf: "center",
              justifySelf: "center"
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{
      width: "100px",
      height: "100px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      perspective: "600px",
      margin: "0.5rem 0"
    }}>
      <style>{`
        @keyframes dice-3d-spin {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(720deg) rotateY(1080deg) rotateZ(360deg); }
        }
        .dice-3d-cube {
          width: 50px;
          height: 50px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .dice-3d-cube.spinning {
          animation: dice-3d-spin 1.2s infinite linear;
        }
        .dice-3d-face {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 8px;
          border: 1.5px solid rgba(15, 23, 42, 0.85);
          box-shadow: inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.35), 0 3px 5px rgba(0,0,0,0.25);
          backface-visibility: hidden;
        }
      `}</style>

      <div
        className={`dice-3d-cube ${isRolling ? "spinning" : ""}`}
        style={{
          transform: isRolling ? undefined : getRotation(val)
        }}
      >
        {/* Face 1 (Front) */}
        <div className="dice-3d-face" style={{ background: color, transform: "rotateY(0deg) translateZ(25px)" }}>
          {renderFaceDots(1)}
        </div>
        {/* Face 6 (Back) */}
        <div className="dice-3d-face" style={{ background: color, transform: "rotateY(180deg) translateZ(25px)" }}>
          {renderFaceDots(6)}
        </div>
        {/* Face 4 (Left) */}
        <div className="dice-3d-face" style={{ background: color, transform: "rotateY(-90deg) translateZ(25px)" }}>
          {renderFaceDots(4)}
        </div>
        {/* Face 3 (Right) */}
        <div className="dice-3d-face" style={{ background: color, transform: "rotateY(90deg) translateZ(25px)" }}>
          {renderFaceDots(3)}
        </div>
        {/* Face 2 (Top) */}
        <div className="dice-3d-face" style={{ background: color, transform: "rotateX(90deg) translateZ(25px)" }}>
          {renderFaceDots(2)}
        </div>
        {/* Face 5 (Bottom) */}
        <div className="dice-3d-face" style={{ background: color, transform: "rotateX(-90deg) translateZ(25px)" }}>
          {renderFaceDots(5)}
        </div>
      </div>
    </div>
  );
}

function PlayerCornerCard({ player, isActive, isRolling, isDiceRolling, onRoll }) {
  if (!player) return null;

  return (
    <div
      className="glass"
      style={{
        padding: "0.75rem",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: isActive ? `2px solid ${player.color}` : "1.5px solid var(--surface-light)",
        boxShadow: isActive ? `0 0 15px ${player.color}44` : "none",
        transition: "all 0.3s ease",
        width: "120px",
        textAlign: "center",
        margin: "auto"
      }}
    >
      <div style={{
        fontWeight: "bold",
        fontSize: "0.85rem",
        color: player.color,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100px",
        marginBottom: "0.25rem"
      }}>
        {player.name} {player.isBot && "🤖"}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
        Pos: {player.position}
      </div>

      <div
        onClick={() => {
          if (isActive && !isRolling && !player.isBot) {
            onRoll();
          }
        }}
        style={{
          cursor: (isActive && !player.isBot) ? "pointer" : "default",
          transform: isActive ? "scale(1.05)" : "scale(0.95)",
          transition: "transform 0.2s"
        }}
      >
        <Premium3DDice
          value={player.lastRoll || 1}
          color={player.color}
          isRolling={isActive && isDiceRolling}
        />
      </div>

      {isActive && !player.isBot ? (
        <div style={{
          fontSize: "0.75rem",
          fontWeight: "bold",
          color: player.color,
          animation: "pulse 1.5s infinite",
          marginTop: "0.25rem",
          background: "rgba(255,255,255,0.08)",
          padding: "2px 8px",
          borderRadius: "12px",
          border: `1px solid ${player.color}66`
        }}>
          🎯 Click Die to Roll!
        </div>
      ) : (
        <div style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: "0.25rem",
          padding: "2px 8px"
        }}>
          {isActive ? "Thinking..." : "Waiting"}
        </div>
      )}
    </div>
  );
}

function ModeSelectionComponent({ onSelectMode }) {
  const modes = [
    {
      id: "classic",
      title: "Classic Mode 🎲",
      description: "Play standard traditional Snake Ladder with classic rules and default board configurations.",
      active: true,
      badge: "Active"
    },
    {
      id: "own-snake",
      title: "Own-Snake Mode 👑",
      description: "Each player custom-configures their own private immune snake. Land on your own snake for safety, or trap others!",
      active: true,
      badge: "Active"
    },
    {
      id: "championship",
      title: "Championship Mode 🏆",
      description: "Ranked multiplayer with timed turns, hazard cells, and competitive match lobbies.",
      active: false,
      badge: "Coming Soon"
    }
  ];

  return (
    <div className="glass" style={{ maxWidth: "600px", width: "100%", padding: "2.5rem", borderRadius: "24px", marginTop: "2rem", textAlign: "center" }}>
      <h1 className="title-glow" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Select Game Mode</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Choose a game variation to start your tabletop adventure!</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {modes.map((m) => (
          <div
            key={m.id}
            onClick={() => {
              if (m.active) {
                onSelectMode(m.id);
              }
            }}
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              background: m.active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
              border: m.active ? "1.5px solid var(--p1-color)" : "1.5px solid rgba(255,255,255,0.05)",
              boxShadow: m.active ? "0 4px 20px rgba(244, 63, 94, 0.15)" : "none",
              cursor: m.active ? "pointer" : "not-allowed",
              textAlign: "left",
              position: "relative",
              transition: "all 0.3s ease",
              opacity: m.active ? 1 : 0.6
            }}
            className={m.active ? "hover-scale" : ""}
          >
            {/* Status Badge */}
            <span style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              fontSize: "0.75rem",
              fontWeight: "bold",
              background: m.active ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.08)",
              color: m.active ? "#10b981" : "var(--text-muted)",
              padding: "4px 10px",
              borderRadius: "12px",
              border: m.active ? "1px solid #10b98166" : "1px solid rgba(255,255,255,0.1)"
            }}>
              {m.badge}
            </span>

            <h3 style={{ fontSize: "1.25rem", color: m.active ? "white" : "var(--text-muted)", marginBottom: "0.5rem" }}>
              {m.title}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", paddingRight: "6rem", lineHeight: "1.4" }}>
              {m.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [inGame, setInGame] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_inGame");
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_players");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [board, setBoard] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_board");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [currentTurnIndex, setCurrentTurnIndex] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_currentTurnIndex");
      return saved ? JSON.parse(saved) : 0;
    } catch { return 0; }
  });
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_logs");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [diceValue, setDiceValue] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_diceValue");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isRolling, setIsRolling] = useState(false);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [gameMode, setGameMode] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_gameMode");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [winner, setWinner] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_winner");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Keep refs up-to-date to completely prevent stale closures in async timeouts
  const playersRef = useRef(players);
  const boardRef = useRef(board);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    try {
      localStorage.setItem("snake_game_inGame", JSON.stringify(inGame));
      localStorage.setItem("snake_game_players", JSON.stringify(players));
      localStorage.setItem("snake_game_board", JSON.stringify(board));
      localStorage.setItem("snake_game_currentTurnIndex", JSON.stringify(currentTurnIndex));
      localStorage.setItem("snake_game_logs", JSON.stringify(logs));
      localStorage.setItem("snake_game_diceValue", JSON.stringify(diceValue));
      localStorage.setItem("snake_game_winner", JSON.stringify(winner));
      localStorage.setItem("snake_game_gameMode", JSON.stringify(gameMode));
    } catch (e) {
      console.error("Failed to save game state to localStorage", e);
    }
  }, [inGame, players, board, currentTurnIndex, logs, diceValue, winner, gameMode]);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const startGame = (setupPlayers, numSnakes = 3, numLadders = 5) => {
    setPlayers(setupPlayers);
    const playerSnakeHeads = gameMode === "classic" ? [] : setupPlayers.map(p => p.ownSnakeNumber);
    setBoard(generateBoard(playerSnakeHeads, numSnakes, numLadders));
    setInGame(true);
    setCurrentTurnIndex(0);
    setLogs(["Game started!"]);
    setWinner(null);
  };

  const nextTurn = () => {
    setCurrentTurnIndex(prev => (prev + 1) % playersRef.current.length);
  };

  const handleRoll = () => {
    if (isRolling || winner || !board) return;

    const currentPlayer = players[currentTurnIndex];
    if (currentPlayer.isBot) return; // Bot handles its own roll

    executeTurn(currentPlayer);
  };

  const executeTurn = async (player) => {
    setIsRolling(true); // turn is busy, blocks double rolls
    setIsDiceRolling(true); // start spinning the 3D dice!

    // Roll 6 automatically on 6th attempt if player has failed to unlock 5 times
    const isPlayerAtHome = player.position === 0;
    const currentAttempts = player.unlockAttempts || 0;
    const isGuaranteedSix = isPlayerAtHome && currentAttempts >= 5;

    const roll = isGuaranteedSix ? 6 : rollDice();
    setDiceValue(roll);

    // Set the player's lastRoll immediately so it will be ready when the spin finishes
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, lastRoll: roll } : p));

    // 1. Wait 1200ms for dice rolling animation to complete
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 2. Stop dice spinning! (Dice shows the settled face value)
    setIsDiceRolling(false);

    // 3. Pause 300ms so they see the landed number and dice has fully settled
    await new Promise(resolve => setTimeout(resolve, 300));

    const latestBoard = boardRef.current;
    const latestPlayers = playersRef.current;
    const currentPlayer = latestPlayers.find(p => p.id === player.id);

    if (!currentPlayer || !latestBoard) {
      setIsRolling(false);
      return;
    }

    let currentPos = currentPlayer.position;
    let updatedAttempts = currentPlayer.unlockAttempts || 0;
    let grantsAnotherTurn = false;
    let logMsg = "";

    if (currentPos === 0) {
      // Home state unlocking logic
      if (roll === 6) {
        updatedAttempts = 0; // successfully unlocked
        currentPos = 1;
        logMsg = `Unlocked from home! You get another turn.`;
        grantsAnotherTurn = true;

        // Slide token from bottom starting tray to cell 1
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: 1, unlockAttempts: 0, lastRoll: roll } : p));
        await new Promise(resolve => setTimeout(resolve, 600)); // wait for single slide animation
      } else {
        updatedAttempts += 1; // failed unlock attempt
        logMsg = `Rolled a ${roll}. Need a 6 to unlock from home.`;
        
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, unlockAttempts: updatedAttempts, lastRoll: roll } : p));
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    } else {
      // Normal grid-based walking
      const targetRollPos = currentPos + roll;
      
      if (targetRollPos > 100) {
        logMsg = `Rolled a ${roll}. Need exact roll to reach 100. Cannot move.`;
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, lastRoll: roll } : p));
        await new Promise(resolve => setTimeout(resolve, 600));
      } else {
        // Move one by one cell! (Snappy, continuous walking)
        for (let step = currentPos + 1; step <= targetRollPos; step++) {
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: step, isWalking: true, lastRoll: roll } : p));
          await new Promise(resolve => setTimeout(resolve, 350));
        }

        // Stop walking animation
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isWalking: false } : p));

        currentPos = targetRollPos;
        await new Promise(resolve => setTimeout(resolve, 400)); // Pause briefly at landing cell

        // Check for board elements (snakes & ladders)
        const ladder = latestBoard.ladders.find(l => l.bottom === currentPos);
        const snake = latestBoard.snakes.find(s => s.head === currentPos);

        if (ladder) {
          logMsg = `Rolled a ${roll}. Climbed a ladder from ${ladder.bottom} to ${ladder.top}!`;
          
          // Toggle climbing leans/pulses
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isClimbing: true } : p));
          await new Promise(resolve => setTimeout(resolve, 50));

          // Climb/slide up the ladder
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: ladder.top } : p));
          await new Promise(resolve => setTimeout(resolve, 900));

          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isClimbing: false } : p));
          currentPos = ladder.top;
        } else if (snake) {
          if (gameMode !== "classic" && currentPos === currentPlayer.ownSnakeNumber) {
            logMsg = `Rolled a ${roll}. Landed on your OWN snake at ${snake.head}! Immune!`;
          } else {
            logMsg = `Rolled a ${roll}. Bitten by a snake! Slide down from ${snake.head} to ${snake.tail}.`;

            // 1. Shaking panic at snake head
            setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isPanicking: true } : p));
            await new Promise(resolve => setTimeout(resolve, 750));

            // 2. Swallow slide down to snake tail
            setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isPanicking: false, isSwallowed: true } : p));
            await new Promise(resolve => setTimeout(resolve, 50));

            setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: snake.tail } : p));
            await new Promise(resolve => setTimeout(resolve, 1000));

            setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isSwallowed: false } : p));
            currentPos = snake.tail;
          }
        } else {
          logMsg = `Rolled a ${roll}.`;
        }

        if (roll === 6) {
          grantsAnotherTurn = true;
          logMsg += " Rolled a 6, so you get another turn!";
        }
      }
    }

    addLog(`${player.name}: ${logMsg}`);

    if (currentPos === 100) {
      setWinner(currentPlayer);
      addLog(`🎉 ${player.name} wins the game! 🎉`);
    } else {
      if (!grantsAnotherTurn) {
        nextTurn();
      }
    }
    setIsRolling(false);
  };

  // Bot logic inside useEffect (players is NOT a dependency to prevent infinite loops)
  useEffect(() => {
    const latestPlayers = playersRef.current;
    const activePlayer = latestPlayers[currentTurnIndex];
    if (inGame && !winner && activePlayer?.isBot && !isRolling) {
      const timer = setTimeout(() => {
        executeTurn(activePlayer);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [inGame, winner, currentTurnIndex, isRolling]);

  return (
    <main style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <style>{`
        .tabletop-grid {
          display: grid;
          grid-template-columns: 130px 1fr 130px;
          gap: 1.5rem;
          align-items: center;
          width: 100%;
          justify-content: center;
          max-width: 850px;
        }
        .tabletop-column {
          display: flex;
          flex-direction: column;
          gap: 4rem;
          height: 100%;
          justify-content: space-between;
          padding: 2rem 0;
        }
        @media (max-width: 768px) {
          .tabletop-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .tabletop-column {
            flex-direction: row !important;
            justify-content: center !important;
            gap: 1rem !important;
            height: auto !important;
            padding: 0.5rem 0 !important;
          }
        }
      `}</style>

      {!inGame ? (
        gameMode === null ? (
          <ModeSelectionComponent onSelectMode={(mode) => setGameMode(mode)} />
        ) : (
          <LobbyComponent onStart={startGame} onBack={() => setGameMode(null)} gameMode={gameMode} />
        )
      ) : (
        <div style={{ display: "flex", gap: "2rem", width: "100%", maxWidth: "1250px", flexWrap: "wrap", justifyContent: "center" }}>

          {/* Game Board Tabletop Container */}
          <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1 className="title-glow" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Snake Ladder</h1>

            {/* Tabletop Layout with Board & Corner Cards */}
            <div className="tabletop-grid">

              {/* Left Column (P1 Top, P3 Bottom) */}
              <div className="tabletop-column">
                <PlayerCornerCard
                  player={players[0]}
                  isActive={currentTurnIndex === 0}
                  isRolling={isRolling}
                  isDiceRolling={isDiceRolling}
                  onRoll={handleRoll}
                />
                <PlayerCornerCard
                  player={players[2]}
                  isActive={currentTurnIndex === 2}
                  isRolling={isRolling}
                  isDiceRolling={isDiceRolling}
                  onRoll={handleRoll}
                />
              </div>

              {/* Center Column (GameBoard Component) */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", maxWidth: "550px", margin: "0 auto" }}>
                {board && <GameBoardComponent board={board} players={players} gameMode={gameMode} />}
              </div>

              {/* Right Column (P2 Top, P4 Bottom) */}
              <div className="tabletop-column">
                <PlayerCornerCard
                  player={players[1]}
                  isActive={currentTurnIndex === 1}
                  isRolling={isRolling}
                  isDiceRolling={isDiceRolling}
                  onRoll={handleRoll}
                />
                <PlayerCornerCard
                  player={players[3]}
                  isActive={currentTurnIndex === 3}
                  isRolling={isRolling}
                  isDiceRolling={isDiceRolling}
                  onRoll={handleRoll}
                />
              </div>

            </div>
          </div>

          {/* Control Panel Side */}
          <div className="glass" style={{ flex: "0 0 320px", padding: "1.5rem", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Winner State */}
            {winner ? (
              <div style={{ textAlign: "center", padding: "1rem", background: "rgba(16, 185, 129, 0.2)", borderRadius: "8px", border: "1px solid var(--p3-color)" }}>
                <h2>🎉 {winner.name} Wins! 🎉</h2>
                <button className="btn" style={{ marginTop: "1rem" }} onClick={() => setInGame(false)}>Play Again</button>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <h3 style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Current Turn</h3>
                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: players[currentTurnIndex]?.color }}>
                  {players[currentTurnIndex]?.name} {players[currentTurnIndex]?.isBot && "(Bot)"}
                </div>
              </div>
            )}

            {/* Players Status */}
            <div>
              <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem", borderBottom: "1px solid var(--surface-light)", paddingBottom: "0.5rem" }}>Players</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {players.map((p, idx) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: idx === currentTurnIndex ? "rgba(255,255,255,0.05)" : "transparent", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: p.color }} />
                      <span>{p.name} {p.isBot && "🤖"}</span>
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                      Pos: {p.position} {gameMode !== "classic" && `| Own Snake: ${p.ownSnakeNumber}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Logs */}
            <div style={{ flex: 1, minHeight: "150px" }}>
              <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem", borderBottom: "1px solid var(--surface-light)", paddingBottom: "0.5rem" }}>Game Log</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                {logs.map((l, i) => (
                  <div key={i} style={{ color: i === 0 ? "var(--text-main)" : "var(--text-muted)", opacity: 1 - (i * 0.2) }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Exit/Reset Button */}
            {!winner && (
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (confirm("Are you sure you want to exit the current match? All progress will be lost.")) {
                    setInGame(false);
                    setPlayers([]);
                    setBoard(null);
                    setWinner(null);
                    setLogs([]);
                    setDiceValue(null);
                    setGameMode(null);
                  }
                }}
                style={{ width: "100%", borderColor: "#ef4444", color: "#ef4444", marginTop: "1rem" }}
              >
                Exit Match
              </button>
            )}

          </div>
        </div>
      )}
    </main>
  );
}
