"use client";

import { useState } from "react";
import { Player } from "../../lib/gameLogic";

interface LobbyComponentProps {
  onStart: (players: Player[]) => void;
}

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function LobbyComponent({ onStart }: LobbyComponentProps) {
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [playerConfigs, setPlayerConfigs] = useState<{name: string, safeSnake: number}[]>([
    { name: "Player 1", safeSnake: 50 },
    { name: "Player 2", safeSnake: 60 },
  ]);

  const handleModeChange = (single: boolean) => {
    setIsSinglePlayer(single);
    if (single) {
      setNumPlayers(2);
      setPlayerConfigs([
        { name: "Player", safeSnake: 50 },
        { name: "Bot", safeSnake: 60 }
      ]);
    } else {
      setPlayerConfigs(Array(numPlayers).fill(0).map((_, i) => ({ name: `Player ${i+1}`, safeSnake: 50 + (i * 10) })));
    }
  };

  const handleNumPlayersChange = (num: number) => {
    if (isSinglePlayer) return;
    setNumPlayers(num);
    const newConfigs = [...playerConfigs];
    while (newConfigs.length < num) {
      newConfigs.push({ name: `Player ${newConfigs.length + 1}`, safeSnake: 50 + (newConfigs.length * 10) });
    }
    setPlayerConfigs(newConfigs.slice(0, num));
  };

  const handleConfigChange = (index: number, field: 'name' | 'safeSnake', value: string) => {
    const newConfigs = [...playerConfigs];
    if (field === 'name') {
      newConfigs[index].name = value;
    } else {
      newConfigs[index].safeSnake = parseInt(value) || 2;
    }
    setPlayerConfigs(newConfigs);
  };

  const validateAndStart = () => {
    // Validation
    const usedCells = new Set<number>();
    for (let config of playerConfigs) {
      if (config.safeSnake < 2 || config.safeSnake > 99) {
        alert(`Safe snake for ${config.name} must be between 2 and 99.`);
        return;
      }
      if (usedCells.has(config.safeSnake)) {
        alert(`Two players cannot have the same safe snake number (${config.safeSnake}).`);
        return;
      }
      usedCells.add(config.safeSnake);
    }

    const finalPlayers: Player[] = playerConfigs.map((c, i) => ({
      id: `p${i}`,
      name: c.name,
      position: 0,
      safeSnakeNumber: c.safeSnake,
      color: COLORS[i % COLORS.length],
      isBot: isSinglePlayer && i === 1
    }));

    onStart(finalPlayers);
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
              <div style={{ flex: "1 1 150px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Safe Snake (2-99)</label>
                <input 
                  type="number" 
                  min="2" max="99"
                  value={config.safeSnake}
                  onChange={(e) => handleConfigChange(idx, 'safeSnake', e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              If you land on {config.safeSnake} and it has a snake head, you will NOT be bitten.
            </p>
          </div>
        ))}
      </div>

      <button className="btn" style={{ width: "100%", padding: "1rem", fontSize: "1.2rem" }} onClick={validateAndStart}>
        Start Game
      </button>

      <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--surface-light)", textAlign: "center" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Multi-device mode coming soon using Supabase!
        </p>
      </div>
    </div>
  );
}
