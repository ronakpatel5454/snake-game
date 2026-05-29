import React, { useState, useEffect } from "react";
import { LUDO_MODES } from "../config/ludoModes";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#fbbf24"]; // Blue, Red, Green, Yellow
const COLOR_NAMES = ["Blue 💙", "Red ❤️", "Green 💚", "Yellow 💛"];
const COLOR_KEYS = ["blue", "red", "green", "yellow"];

export default function LudoLobbyComponent({ 
  onStart, 
  onBack, 
  initialTheme,
  onThemeChange,
  // Online Multiplayer Props
  onlineState = { isOnline: false, gameCode: "", joinedPlayers: [], isHost: false, myPlayerId: "", isConnecting: false },
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartOnlineGame,
  onLeaveOnlineRoom,
  onToggleOnlineMode
}) {
  const { isOnline, gameCode, joinedPlayers, isHost, myPlayerId, isConnecting } = onlineState;

  const [numPlayers, setNumPlayers] = useState(4);
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState("ludo-classic");
  const [selectedTheme, setSelectedTheme] = useState(initialTheme || "classic");

  // --- Local Mode States ---
  const [playerConfigs, setPlayerConfigs] = useState([
    { name: "Player 1" },
    { name: "Bot 1" },
    { name: "Bot 2" },
    { name: "Bot 3" }
  ]);

  // --- Online Mode States ---
  const [onlineTab, setOnlineTab] = useState("host"); // 'host' or 'join'
  const [onlineName, setOnlineName] = useState(() => localStorage.getItem("snake_game_online_name") || "Player");
  const [onlineColor, setOnlineColor] = useState("blue"); // Selected color to join
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Synchronize active theme changes
  useEffect(() => {
    if (initialTheme) {
      setSelectedTheme(initialTheme);
    }
  }, [initialTheme]);

  // Watch URL params for auto-filling and switching tabs (ONLY on initial mount)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setJoinCodeInput(code.toUpperCase());
      setOnlineTab("join");
      if (onToggleOnlineMode && !onlineState.isOnline) {
        onToggleOnlineMode(true);
      }
    }
  }, []);

  // Persist name choice
  useEffect(() => {
    localStorage.setItem("snake_game_online_name", onlineName);
  }, [onlineName]);

  // Handle number of players changes (Local Mode)
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

  // --- Online Multiplayer Action Triggers ---
  const handleHostOnline = () => {
    if (!onlineName.trim()) {
      alert("Please enter a name first.");
      return;
    }
    onCreateOnlineRoom({
      hostName: onlineName,
      hostColor: "blue", // Host defaults to blue (starts first)
      theme: selectedTheme,
      variation: selectedVariation,
      maxPlayers: numPlayers
    });
  };

  const handleJoinOnline = () => {
    if (!joinCodeInput.trim()) {
      alert("Please enter a 6-character game code.");
      return;
    }
    if (!onlineName.trim()) {
      alert("Please enter a name first.");
      return;
    }
    onJoinOnlineRoom({
      code: joinCodeInput.trim().toUpperCase(),
      playerName: onlineName,
      playerColor: onlineColor
    });
  };

  const copyToClipboard = () => {
    if (!gameCode) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?code=${gameCode}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  // Determine which colors are already taken by players inside the online room
  const takenColors = (joinedPlayers || []).map(p => (p.color || "").toLowerCase());

  return (
    <div className="glass" style={{ maxWidth: "680px", width: "100%", padding: "2rem", borderRadius: "16px", marginTop: "2rem" }}>
      <h1 className="title-glow" style={{ textAlign: "center", marginBottom: "1.5rem" }}>Ludo Setup</h1>

      {!gameCode && (
        <div style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "30px",
          padding: "4px",
          marginBottom: "2rem",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          flexWrap: "wrap"
        }}>
          <button
            onClick={() => {
              if (window.location.search) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
              if (onToggleOnlineMode) onToggleOnlineMode(false);
            }}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "10px 14px",
              borderRadius: "24px",
              border: "none",
              background: !isOnline ? "var(--primary)" : "transparent",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            🎲 Local Play
          </button>
          <button
            onClick={() => {
              if (onToggleOnlineMode) onToggleOnlineMode(true);
            }}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "10px 14px",
              borderRadius: "24px",
              border: "none",
              background: isOnline ? "var(--primary)" : "transparent",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            🌐 Online Play
          </button>
        </div>
      )}

      {/* --- ONLINE MULTIPLAYER PANEL --- */}
      {isOnline ? (
        gameCode ? (
          /* ONLINE WAITING ROOM LOBBY */
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "left" }}>
            
            {/* Room Code Display with Copy button */}
            <div className="glass" style={{ padding: "1rem 1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Room Code</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", letterSpacing: "2px", color: "var(--secondary)" }}>{gameCode}</div>
              </div>
              <button
                className="btn"
                onClick={copyToClipboard}
                style={{ padding: "8px 16px", fontSize: "0.85rem", background: copyFeedback ? "#10b981" : "var(--primary)" }}
              >
                {copyFeedback ? "Copied! ✔️" : "Share Link 🔗"}
              </button>
            </div>

            {/* Joined Players status list */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                Connected Players ({joinedPlayers.length} / {numPlayers})
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(joinedPlayers || []).map((p, idx) => {
                  const pColorIdx = COLOR_KEYS.indexOf(p.color?.toLowerCase());
                  const colHex = COLORS[pColorIdx >= 0 ? pColorIdx : 0];
                  return (
                    <div 
                      key={p.id || idx} 
                      style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        padding: "0.75rem 1rem", 
                        background: "rgba(255,255,255,0.02)", 
                        border: "1.5px solid rgba(255,255,255,0.05)",
                        borderRadius: "8px" 
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: colHex }} />
                        <span style={{ fontWeight: "bold" }}>{p.name} {p.id === myPlayerId && "(You)"}</span>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {p.isHost && <span style={{ fontSize: "0.65rem", background: "rgba(253, 224, 71, 0.15)", color: "#fde047", border: "1px solid #fde04755", padding: "2px 6px", borderRadius: "6px", fontWeight: "bold" }}>Host 👑</span>}
                        <span style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "6px", textTransform: "capitalize" }}>{p.color}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Waiting notification */}
            {!isHost && (
              <div className="glass" style={{ padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid rgba(99, 102, 241, 0.2)", textAlign: "center", color: "var(--primary)", fontWeight: "500", animation: "pulse 2s infinite" }}>
                ⏳ Waiting for the Host to start the match...
              </div>
            )}

            {/* Host Control Settings & Actions */}
            {isHost && (
              <div style={{ borderTop: "1.5px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* Host Variations Selection */}
                <div style={{ textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", fontSize: "0.95rem" }}>
                    Select Ludo Variation ⚙️
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {LUDO_MODES.map((m) => {
                      const isSelected = selectedVariation === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedVariation(m.id)}
                          style={{
                            padding: "0.75rem 1rem",
                            borderRadius: "8px",
                            background: isSelected ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                            border: isSelected ? "1.5px solid var(--secondary)" : "1.5px solid rgba(255,255,255,0.06)",
                            cursor: "pointer"
                          }}
                        >
                          <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{m.title}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>- {m.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Host Theme Selection */}
                <div style={{ textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", fontSize: "0.95rem" }}>
                    Select Board Theme 🎨
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                    {[
                      { id: "classic", name: "Classic Toys 🎲", color: "#ef4444" },
                      { id: "neon", name: "Retro Arcade 👾", color: "#6366f1" },
                      { id: "forest", name: "Jungle Expedition 🌿", color: "#10b981" },
                      { id: "space", name: "Cosmic Odyssey 🚀", color: "#a855f7" },
                      { id: "sakura", name: "Sakura Blossom 🌸", color: "#f43f5e" },
                      { id: "candy", name: "Sweet Candy 🍭", color: "#f472b6" }
                    ].map(t => {
                      const isSelected = selectedTheme === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedTheme(t.id);
                            if (onThemeChange) onThemeChange(t.id);
                          }}
                          style={{
                            padding: "0.75rem",
                            borderRadius: "8px",
                            background: isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                            border: isSelected ? `2px solid ${t.color}` : "1.5px solid rgba(255,255,255,0.06)",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: isSelected ? "white" : "var(--text-main)" }}>
                            {t.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
              </div>
            )}

            {/* Host Control Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1rem" }}>
              {isHost && (
                <button
                  className="btn"
                  onClick={() => onStartOnlineGame(selectedTheme)}
                  disabled={joinedPlayers.length < 2}
                  style={{ width: "100%", padding: "12px", fontSize: "1.1rem" }}
                >
                  Start Online Ludo 🚀
                </button>
              )}

              <button
                className="btn btn-outline"
                onClick={onLeaveOnlineRoom}
                style={{ width: "100%", borderColor: "#ef4444", color: "#ef4444" }}
              >
                Leave Waiting Room 🚪
              </button>
            </div>

          </div>
        ) : (
          /* ONLINE HOST / JOIN SELECTOR */
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Online tab selection (Host vs Join) */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setOnlineTab("host")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: onlineTab === "host" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Create Match 👑
              </button>
              <button
                onClick={() => setOnlineTab("join")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: onlineTab === "join" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Join Match 🚪
              </button>
            </div>

            {/* Player Name input */}
            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                Your Display Name
              </label>
              <input
                type="text"
                value={onlineName}
                onChange={(e) => setOnlineName(e.target.value)}
                style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
                placeholder="Enter name..."
              />
            </div>

            {onlineTab === "host" ? (
              /* HOST PANEL VIEW */
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Number of slots selection */}
                <div style={{ textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                    Max Players (Slots)
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {[2, 3, 4].map(num => {
                      const isSelected = numPlayers === num;
                      return (
                        <button
                          key={num}
                          onClick={() => setNumPlayers(num)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "8px",
                            border: isSelected ? "2px solid var(--primary)" : "1px solid rgba(255,255,255,0.08)",
                            background: isSelected ? "rgba(99, 102, 241, 0.15)" : "transparent",
                            color: "white",
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          {num} Players
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variation */}
                <div style={{ textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                    Ludo Variation
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {LUDO_MODES.map(m => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedVariation(m.id)}
                        style={{
                          padding: "0.75rem 1rem",
                          borderRadius: "8px",
                          background: selectedVariation === m.id ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                          border: selectedVariation === m.id ? "1.5px solid var(--secondary)" : "1.5px solid rgba(255,255,255,0.06)",
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{m.title}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>- {m.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="btn"
                  onClick={handleHostOnline}
                  disabled={isConnecting}
                  style={{ width: "100%", padding: "12px", fontSize: "1.1rem" }}
                >
                  {isConnecting ? "Creating Session... ⏳" : "Create Room Code 👑"}
                </button>
              </div>
            ) : (
              /* JOIN PANEL VIEW */
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                    6-Character Room Code
                  </label>
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    style={{ width: "100%", padding: "12px", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center", letterSpacing: "4px" }}
                    placeholder="ENTER CODE"
                  />
                </div>

                {/* Choose Color grid with Taken Blocking */}
                <div style={{ textAlign: "left" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontWeight: "bold" }}>
                    Choose Available Color
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                    {COLOR_KEYS.map((colorKey, idx) => {
                      const isTaken = takenColors.includes(colorKey);
                      const isSelected = onlineColor === colorKey;
                      return (
                        <button
                          key={colorKey}
                          onClick={() => {
                            if (!isTaken) setOnlineColor(colorKey);
                          }}
                          disabled={isTaken}
                          style={{
                            padding: "12px",
                            borderRadius: "8px",
                            border: isSelected ? `2.5px solid ${COLORS[idx]}` : "1.5px solid rgba(255,255,255,0.06)",
                            background: isTaken 
                              ? "rgba(255,255,255,0.01)" 
                              : isSelected 
                                ? `${COLORS[idx]}22` 
                                : "rgba(255,255,255,0.03)",
                            color: isTaken ? "rgba(255,255,255,0.15)" : "white",
                            cursor: isTaken ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}
                        >
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: isTaken ? "rgba(255,255,255,0.15)" : COLORS[idx] }} />
                          {COLOR_NAMES[idx].split(" ")[0]} {isTaken && "(Taken)"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  className="btn"
                  onClick={handleJoinOnline}
                  disabled={isConnecting}
                  style={{ width: "100%", padding: "12px", fontSize: "1.1rem", background: "var(--secondary)" }}
                >
                  {isConnecting ? "Connecting... ⏳" : "Join Match 🚪"}
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        /* --- LOCAL PLAY LOBBY VIEW --- */
        <>
          {/* Sub-mode selection: 1 Player vs Bot or Local Multiplayer */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <button 
              className={`btn ${isSinglePlayer ? '' : 'btn-outline'}`} 
              style={{ flex: 1 }}
              onClick={() => setIsSinglePlayer(true)}
            >
              1 Player vs Bot
            </button>
            <button 
              className={`btn ${!isSinglePlayer ? '' : 'btn-outline'}`} 
              style={{ flex: 1 }}
              onClick={() => setIsSinglePlayer(false)}
            >
              Multiplayer (Local)
            </button>
          </div>
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

          {/* 3. Local: Player Names Setup */}
          <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
            <label style={{ display: "block", color: "var(--text-muted)", fontWeight: "bold", marginBottom: "0.25rem" }}>
              Configure Players & Colors
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
              {playerConfigs.map((config, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(255, 255, 255, 0.06)",
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
                { id: "neon", name: "Retro Arcade ⚙️", desc: "Deep space coordinate grids, glowing neon grid paths.", color: "#6366f1" },
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

          <button 
            className="btn" 
            style={{ width: "100%", padding: "1rem", fontSize: "1.2rem" }} 
            onClick={handleStartGame}
          >
            Start Local Ludo Game 🚀
          </button>
        </>
      )}

      {onBack && (!isOnline || !isHost) && (
        <button 
          className="btn btn-outline" 
          style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginTop: "0.75rem", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "8px", background: "transparent", cursor: "pointer" }} 
          onClick={() => {
            if (isOnline) {
              onLeaveOnlineRoom();
            } else {
              onBack();
            }
          }}
        >
          ← Back to Main Menu
        </button>
      )}
    </div>
  );
}
