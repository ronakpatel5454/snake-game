import { useState, useEffect, useRef } from "react";
import GameBoardComponent from "./components/GameBoardComponent";
import LobbyComponent from "./components/LobbyComponent";
import { generateBoard, rollDice, calculateNewPosition } from "./lib/gameLogic";

export default function App() {
  const [inGame, setInGame] = useState(false);
  const [players, setPlayers] = useState([]);
  const [board, setBoard] = useState(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [logs, setLogs] = useState([]);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState(null);

  // Keep refs up-to-date to completely prevent stale closures in async timeouts
  const playersRef = useRef(players);
  const boardRef = useRef(board);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const startGame = (setupPlayers) => {
    setPlayers(setupPlayers);
    setBoard(generateBoard());
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

  const executeTurn = (player) => {
    setIsRolling(true);
    const roll = rollDice();
    setDiceValue(roll);

    setTimeout(() => {
      const latestBoard = boardRef.current;
      const latestPlayers = playersRef.current;
      const currentPlayer = latestPlayers.find(p => p.id === player.id);

      if (!currentPlayer || !latestBoard) {
        setIsRolling(false);
        return;
      }

      const { position, message, wasSafeSnake, grantsAnotherTurn } = calculateNewPosition(
        currentPlayer.position, 
        roll, 
        latestBoard, 
        currentPlayer
      );
      
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position } : p));
      addLog(`${player.name}: ${message}`);

      if (position === 100) {
        setWinner(currentPlayer);
        addLog(`🎉 ${player.name} wins the game! 🎉`);
      } else {
        if (!grantsAnotherTurn) {
          nextTurn();
        }
      }
      setIsRolling(false);
    }, 1000);
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
      {!inGame ? (
        <LobbyComponent onStart={startGame} />
      ) : (
        <div style={{ display: "flex", gap: "2rem", width: "100%", maxWidth: "1200px", flexWrap: "wrap", justifyContent: "center" }}>
          
          {/* Game Board Side */}
          <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1 className="title-glow" style={{ fontSize: "2rem", marginBottom: "1rem" }}>Snake Leader</h1>
            {board && <GameBoardComponent board={board} players={players} />}
          </div>

          {/* Control Panel Side */}
          <div className="glass" style={{ flex: "0 0 350px", padding: "1.5rem", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Winner State */}
            {winner ? (
              <div style={{ textAlign: "center", padding: "1rem", background: "rgba(16, 185, 129, 0.2)", borderRadius: "8px", border: "1px solid var(--p3-color)" }}>
                <h2>🎉 {winner.name} Wins! 🎉</h2>
                <button className="btn" style={{ marginTop: "1rem" }} onClick={() => setInGame(false)}>Play Again</button>
              </div>
            ) : (
              <>
                {/* Current Turn */}
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Current Turn</h3>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: players[currentTurnIndex]?.color }}>
                    {players[currentTurnIndex]?.name} {players[currentTurnIndex]?.isBot && "(Bot)"}
                  </div>
                </div>

                {/* Dice Section */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div style={{ 
                    width: "80px", height: "80px", 
                    background: "var(--surface-light)", 
                    borderRadius: "16px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2.5rem", fontWeight: "bold",
                    boxShadow: "inset 0 4px 6px rgba(0,0,0,0.3)",
                    border: "2px solid var(--board-border)",
                    animation: isRolling ? "bounce 0.5s infinite" : "none"
                  }}>
                    {diceValue || "-"}
                  </div>
                  <button 
                    className="btn" 
                    onClick={handleRoll} 
                    disabled={isRolling || players[currentTurnIndex]?.isBot}
                    style={{ width: "100%" }}
                  >
                    {isRolling ? "Rolling..." : "Roll Dice"}
                  </button>
                </div>
              </>
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
                      Pos: {p.position} | Safe: {p.safeSnakeNumber}
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

          </div>
        </div>
      )}
    </main>
  );
}
