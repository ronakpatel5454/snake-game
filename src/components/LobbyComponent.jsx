import { useState } from "react";

const COLORS = ["#ef4444", "#3b82f6", "#a855f7", "#ec4899", "#f97316", "#06b6d4"];

export default function LobbyComponent({ onStart, onBack, gameMode, initialTheme }) {
  const [numPlayers, setNumPlayers] = useState(2);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [playerConfigs, setPlayerConfigs] = useState([
    { name: "Player 1", ownSnake: 54 },
    { name: "Player 2", ownSnake: 60 },
  ]);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || "classic");

  // Default parameters as currently used
  const [numSnakes, setNumSnakes] = useState(3);
  const [numLadders, setNumLadders] = useState(5);
  const [customBoardElements, setCustomBoardElements] = useState(false);

  const handleSnakesChange = (val) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 3;
    if (num > 10) num = 10; // Max limit validation
    if (num < 3) num = 3; // Min limit validation
    setNumSnakes(num);
  };

  const handleLaddersChange = (val) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 0;
    if (num > 10) num = 10; // Max limit validation
    if (num < 0) num = 0; // Min limit validation
    setNumLadders(num);
  };

  const handleModeChange = (single) => {
    setIsSinglePlayer(single);
    if (single) {
      setNumPlayers(2);
      setPlayerConfigs([
        { name: "Player", ownSnake: 54 },
        { name: "Bot", ownSnake: 60 }
      ]);
    } else {
      setPlayerConfigs(Array(numPlayers).fill(0).map((_, i) => ({ name: `Player ${i+1}`, ownSnake: 50 + (i * 10) })));
    }
  };

  const handleNumPlayersChange = (num) => {
    if (isSinglePlayer) return;
    setNumPlayers(num);
    const newConfigs = [...playerConfigs];
    while (newConfigs.length < num) {
      newConfigs.push({ name: `Player ${newConfigs.length + 1}`, ownSnake: 50 + (newConfigs.length * 10) });
    }
    setPlayerConfigs(newConfigs.slice(0, num));
  };

  const handleConfigChange = (index, field, value) => {
    const newConfigs = [...playerConfigs];
    if (field === 'name') {
      newConfigs[index].name = value;
    } else {
      newConfigs[index].ownSnake = parseInt(value) || 15;
    }
    setPlayerConfigs(newConfigs);
  };

  const validateAndStart = () => {
    // Validation
    const usedCells = new Set();
    if (gameMode !== "classic") {
      for (let config of playerConfigs) {
        if (config.ownSnake < 15 || config.ownSnake > 99) {
          alert(`Own snake head for ${config.name} must be between 15 and 99.`);
          return;
        }
        if (usedCells.has(config.ownSnake)) {
          alert(`Two players cannot have the same own snake number (${config.ownSnake}).`);
          return;
        }
        usedCells.add(config.ownSnake);
      }
    }

    if (customBoardElements) {
      if (numSnakes < 3 || numSnakes > 10) {
        alert("Number of snakes must be between 3 and 10.");
        return;
      }

      if (numLadders < 0 || numLadders > 10) {
        alert("Number of ladders must be between 0 and 10.");
        return;
      }
    }

    // Determine final snakes & ladders based on custom checkbox and mode
    let finalSnakes = numSnakes;
    let finalLadders = numLadders;

    if (!customBoardElements) {
      if (gameMode === "classic") {
        finalSnakes = Math.floor(Math.random() * 3) + 5; // 5 to 7
        finalLadders = Math.floor(Math.random() * 4) + 3; // 3 to 6
      } else {
        finalSnakes = 3;
        finalLadders = 5;
      }
    }

    const finalPlayers = playerConfigs.map((c, i) => ({
      id: `p${i}`,
      name: c.name,
      position: 0,
      ownSnakeNumber: c.ownSnake,
      color: COLORS[i % COLORS.length],
      isBot: isSinglePlayer && i === 1,
      unlockAttempts: 0,
      lastRoll: 1
    }));

    onStart(finalPlayers, finalSnakes, finalLadders, selectedTheme);
  };

  return (
    <div className="glass" style={{ maxWidth: "600px", width: "100%", padding: "2rem", borderRadius: "16px", marginTop: "2rem" }}>
      <h1 className="title-glow">Setup Game</h1>
      
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button 
          className={`btn ${isSinglePlayer ? '' : 'btn-outline'}`} 
          style={{ flex: 1 }}
          onClick={() => handleModeChange(true)}
        >
          1 Player vs Bot
        </button>
        <button 
          className={`btn ${!isSinglePlayer ? '' : 'btn-outline'}`} 
          style={{ flex: 1 }}
          onClick={() => handleModeChange(false)}
        >
          Multiplayer (Local)
        </button>
      </div>

      {!isSinglePlayer && (
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Number of Players</label>
          <select 
            value={numPlayers} 
            onChange={(e) => handleNumPlayersChange(parseInt(e.target.value))}
            style={{ width: "100%" }}
          >
            {[2,3,4].map(n => <option key={n} value={n}>{n} Players</option>)}
          </select>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
        {playerConfigs.map((config, idx) => (
          <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", borderLeft: `4px solid ${COLORS[idx]}` }}>
            <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: COLORS[idx], display: "inline-block" }}></span>
              {isSinglePlayer && idx === 1 ? "Bot Settings" : `Player ${idx + 1}`}
            </h3>
            
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Name</label>
                <input 
                  type="text" 
                  value={config.name}
                  onChange={(e) => handleConfigChange(idx, 'name', e.target.value)}
                  style={{ width: "100%" }}
                  disabled={isSinglePlayer && idx === 1}
                />
              </div>
              {gameMode !== "classic" && (
                <div style={{ flex: "1 1 150px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Own Snake (15-99)</label>
                  <input 
                    type="number" 
                    min="15" max="99"
                    value={config.ownSnake}
                    onChange={(e) => handleConfigChange(idx, 'ownSnake', e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              )}
            </div>
            {gameMode !== "classic" && (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                A snake will start at {config.ownSnake}. It will NOT bite you, but it WILL bite other players!
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Optional Board Elements Customization Toggle (Both Modes) */}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px", 
          marginBottom: "1.5rem", 
          background: "rgba(255,255,255,0.04)", 
          padding: "0.75rem 1rem", 
          borderRadius: "12px", 
          border: "1.5px solid rgba(255,255,255,0.06)",
          userSelect: "none"
        }}
      >
        <input 
          type="checkbox" 
          id="custom-elements-toggle"
          checked={customBoardElements}
          onChange={(e) => setCustomBoardElements(e.target.checked)}
          style={{ 
            width: "18px", 
            height: "18px", 
            cursor: "pointer", 
            accentColor: "var(--p1-color)" 
          }}
        />
        <label 
          htmlFor="custom-elements-toggle" 
          style={{ 
            fontSize: "0.9rem", 
            fontWeight: "bold", 
            color: "white", 
            cursor: "pointer",
            flex: 1
          }}
        >
          ⚙️ Customize Snake & Ladder quantities?
        </label>
      </div>

      {/* Conditionally Render Customization Input Fields */}
      {customBoardElements && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Number of Snakes (3 - 10)
            </label>
            <input 
              type="number" 
              min="3" max="10"
              value={numSnakes}
              onChange={(e) => handleSnakesChange(e.target.value)}
              style={{ width: "100%" }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Random snakes on the board (Min 3, Max 10).
            </p>
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Number of Ladders (0 - 10)
            </label>
            <input 
              type="number" 
              min="0" max="10"
              value={numLadders}
              onChange={(e) => handleLaddersChange(e.target.value)}
              style={{ width: "100%" }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Ladders on the board (Min 0, Max 10).
            </p>
          </div>
        </div>
      )}

      {/* Board Theme Selection Grid */}
      <div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", fontSize: "0.95rem" }}>
          🌍 Select Board Theme
        </label>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem"
        }}>
          {[
            {
              id: "classic",
              name: "Classic Toys 🎲",
              desc: "Nostalgic colorful checkers, plastic blue/red ladders, and cartoon green snakes.",
              color: "#ef4444"
            },
            {
              id: "neon",
              name: "Retro Arcade 👾",
              desc: "Deep grid space, neon cyan/magenta laser paths, matrix wireframe worms.",
              color: "#6366f1"
            },
            {
              id: "forest",
              name: "Jungle Expedition 🌿",
              desc: "Woodland green and brown terrain, natural log ladders, leafy vine snakes.",
              color: "#10b981"
            },
            {
              id: "space",
              name: "Cosmic Odyssey 🚀",
              desc: "Starry starry nebula, gravity wormhole channels, space plasma alien worms.",
              color: "#a855f7"
            }
          ].map(t => {
            const isSelected = selectedTheme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                style={{
                  padding: "1rem",
                  borderRadius: "12px",
                  background: isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: isSelected ? `2px solid ${t.color}` : "1.5px solid rgba(255,255,255,0.06)",
                  boxShadow: isSelected ? `0 0 15px ${t.color}33` : "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  transform: isSelected ? "scale(1.02)" : "scale(1)"
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "1rem", color: isSelected ? "white" : "var(--text-main)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{t.name}</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.3" }}>
                  {t.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn" style={{ width: "100%", padding: "1rem", fontSize: "1.2rem" }} onClick={validateAndStart}>
        Start Game
      </button>

      {onBack && (
        <button 
          className="btn btn-outline" 
          style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginTop: "0.75rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", background: "transparent", cursor: "pointer" }} 
          onClick={onBack}
        >
          ← Back to Game Modes
        </button>
      )}

      <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--surface-light)", textAlign: "center" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Multi-device mode coming soon using Supabase!
        </p>
      </div>
    </div>
  );
}
