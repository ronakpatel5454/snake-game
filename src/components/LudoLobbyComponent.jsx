import React, { useState, useEffect } from "react";
import { LUDO_MODES } from "../config/ludoModes";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#fbbf24"]; // Blue, Red, Green, Yellow
const COLOR_NAMES = ["Blue 💙", "Red ❤️", "Green 💚", "Yellow 💛"];

export default function LudoLobbyComponent({ 
  onStart, 
  onBack, 
  initialTheme,
  onThemeChange
}) {
  const [numPlayers, setNumPlayers] = useState(4);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState("ludo-classic");
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || "classic");

  // Synchronize active theme changes
  useEffect(() => {
    if (initialTheme) {
      setSelectedTheme(initialTheme);
    }
  }, [initialTheme]);

  // Keep player configurations
  const [playerConfigs, setPlayerConfigs] = useState([
    { name: "Player 1" },
    { name: "Bot 1" },
    { name: "Bot 2" },
    { name: "Bot 3" }
  ]);

  // Handle number of players changes
  useEffect(() => {
    const newConfigs = [...playerConfigs];
    
    // Ensure config length matches numPlayers
    if (newConfigs.length < numPlayers) {
      while (newConfigs.length < numPlayers) {
        const isBot = isSinglePlayer && newConfigs.length > 0;
        newConfigs.push({
          name: isBot ? `Bot ${newConfigs.length}` : `Player ${newConfigs.length + 1}`
        });
      }
    } else if (newConfigs.length > numPlayers) {
      newConfigs.splice(numPlayers);
    }

    // Auto-rename bots/players based on single player toggle
    newConfigs.forEach((c, idx) => {
      if (idx === 0) {
        if (c.name.startsWith("Bot") || c.name.startsWith("Player")) {
          c.name = "Player 1";
        }
      } else {
        const isBot = isSinglePlayer;
        if (isBot && !c.name.startsWith("Bot")) {
          c.name = `Bot ${idx}`;
        } else if (!isBot && c.name.startsWith("Bot")) {
          c.name = `Player ${idx + 1}`;
        }
      }
    });

    setPlayerConfigs(newConfigs);
  }, [numPlayers, isSinglePlayer]);

  const handleConfigChange = (index, value) => {
    const newConfigs = [...playerConfigs];
    newConfigs[index].name = value;
    setPlayerConfigs(newConfigs);
  };

  const handleNumPlayersChange = (num) => {
    setNumPlayers(num);
  };

  const handleStartGame = () => {
    // Validate player names
    for (let i = 0; i < playerConfigs.length; i++) {
      if (!playerConfigs[i].name.trim()) {
        alert(`Please enter a valid name for Player ${i + 1}.`);
        return;
      }
    }

    const finalPlayers = playerConfigs.map((c, i) => {
      const colorKey = i === 0 ? "blue" : i === 1 ? "red" : i === 2 ? "green" : "yellow";
      
      // Tokens inside base: all 4 are initialized to -1 (in base yard)
      // Quick Mode starts with only 1 active token per player in base
      const numTokens = selectedVariation === "ludo-quick" ? 1 : 4;
      const tokens = Array(numTokens).fill(-1);

      return {
        id: `p${i}`,
        name: c.name,
        color: colorKey, // blue, red, green, yellow
        colorCode: COLORS[i],
        tokens, // Array tracking steps of their tokens
        isBot: isSinglePlayer && i > 0,
        hasEliminatedOpponent: false, // For Ludo Master
        lastRoll: 1
      };
    });

    onStart(finalPlayers, selectedVariation, selectedTheme);
  };

  return (
    <div className="glass" style={{ maxWidth: "680px", width: "100%", padding: "2rem", borderRadius: "16px", marginTop: "2rem" }}>
      <h1 className="title-glow" style={{ textAlign: "center", marginBottom: "1.5rem" }}>Ludo Setup</h1>

      {/* 1. Mode Pill Selection: Single Player vs Pass & Play */}
      <div style={{
        display: "flex",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "30px",
        padding: "4px",
        marginBottom: "2rem",
        border: "1px solid rgba(255, 255, 255, 0.08)"
      }}>
        <button
          onClick={() => setIsSinglePlayer(true)}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "24px",
            border: "none",
            background: isSinglePlayer ? "var(--primary)" : "transparent",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🤖 vs Bots (Single Player)
        </button>
        <button
          onClick={() => setIsSinglePlayer(false)}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "24px",
            border: "none",
            background: !isSinglePlayer ? "var(--primary)" : "transparent",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          👥 Pass & Play (Local Multi)
        </button>
      </div>

      {/* 2. Number of Players */}
      <div style={{ marginBottom: "2rem", textAlign: "left" }}>
        <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--text-muted)", fontWeight: "bold" }}>
          Number of Players
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          {[2, 3, 4].map(num => {
            const isSelected = numPlayers === num;
            return (
              <button
                key={num}
                onClick={() => handleNumPlayersChange(num)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid var(--primary)" : "1.5px solid rgba(255,255,255,0.08)",
                  background: isSelected ? "rgba(99, 102, 241, 0.12)" : "rgba(255,255,255,0.02)",
                  color: isSelected ? "white" : "var(--text-muted)",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {num} Players
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Player Names Setup */}
      <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
        <label style={{ display: "block", color: "var(--text-muted)", fontWeight: "bold", marginBottom: "0.25rem" }}>
          Configure Players & Colors
        </label>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          {playerConfigs.map((config, idx) => (
            <div 
              key={idx}
              style={{
                background: "rgba(255,255,255,0.02)",
                padding: "1rem",
                borderRadius: "12px",
                border: "1.5px solid rgba(255,255,255,0.06)",
                position: "relative"
              }}
            >
              <h3 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem", fontWeight: "bold" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: COLORS[idx], display: "inline-block" }}></span>
                {COLOR_NAMES[idx]} - {isSinglePlayer && idx > 0 ? "Bot" : "Player"}
              </h3>
              
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Name</label>
                <input 
                  type="text" 
                  value={config.name}
                  onChange={(e) => handleConfigChange(idx, e.target.value)}
                  style={{ width: "100%", padding: "10px", fontSize: "0.9rem" }}
                  disabled={isSinglePlayer && idx > 0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Ludo Variations Selector */}
      <div style={{ marginBottom: "2rem", textAlign: "left" }}>
        <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", fontSize: "0.95rem" }}>
          Select Ludo Variation ⚙️
        </label>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {LUDO_MODES.map((m) => {
            const isSelected = selectedVariation === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedVariation(m.id)}
                style={{
                  padding: "1.25rem",
                  borderRadius: "12px",
                  background: isSelected ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: isSelected ? "2px solid var(--secondary)" : "1.5px solid rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  transform: isSelected ? "scale(1.01)" : "scale(1)"
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "1rem", color: isSelected ? "white" : "var(--text-main)", marginBottom: "0.25rem" }}>
                  {m.title}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                  {m.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Board Themes Selection */}
      <div style={{ marginBottom: "2rem", textAlign: "left" }}>
        <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", fontSize: "0.95rem" }}>
          Select Board Theme 🎨
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {[
            { id: "classic", name: "Classic Toys 🎲", desc: "Nostalgic colorful checkers, primary solid plastic bases.", color: "#ef4444" },
            { id: "neon", name: "Retro Arcade 👾", desc: "Deep space coordinate grids, glowing neon grid paths.", color: "#6366f1" },
            { id: "forest", name: "Jungle Expedition 🌿", desc: "Woodland organic greens, ancient moss bases.", color: "#10b981" },
            { id: "space", name: "Cosmic Odyssey 🚀", desc: "Gravity wormholes, planetary bases & starry nebulas.", color: "#a855f7" },
            { id: "sakura", name: "Sakura Blossom 🌸", desc: "Soft pastel rosy cherry blossom field.", color: "#f43f5e" },
            { id: "candy", name: "Sweet Candy 🍭", desc: "Grape sweet neon bases, sweet bubblegum tracks.", color: "#f472b6" }
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
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  transform: isSelected ? "scale(1.02)" : "scale(1)"
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "1rem", color: isSelected ? "white" : "var(--text-main)", marginBottom: "0.25rem" }}>
                  {t.name}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.3" }}>
                  {t.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <button className="btn" style={{ width: "100%", padding: "1rem", fontSize: "1.2rem" }} onClick={handleStartGame}>
        Start Ludo Game 🚀
      </button>

      {onBack && (
        <button 
          className="btn btn-outline" 
          style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginTop: "0.75rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", background: "transparent", cursor: "pointer" }} 
          onClick={onBack}
        >
          ← Back to Game Selection
        </button>
      )}
    </div>
  );
}
