import { useState, useEffect } from "react";

const COLORS = ["#ef4444", "#3b82f6", "#a855f7", "#ec4899", "#f97316", "#06b6d4"];

export default function LobbyComponent({ 
  onStart, 
  onBack, 
  gameMode, 
  initialTheme,
  // Online Multiplayer Props
  onlineState = { isOnline: false, gameCode: "", joinedPlayers: [], isHost: false, myPlayerId: "", isConnecting: false },
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartOnlineGame,
  onLeaveOnlineRoom,
  onToggleOnlineMode
}) {
  // --- Local Mode States ---
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

  // --- Online Mode States ---
  const [onlineTab, setOnlineTab] = useState("host"); // 'host' or 'join'
  const [onlineName, setOnlineName] = useState(() => localStorage.getItem("snake_game_online_name") || "Player");
  const [onlineColor, setOnlineColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [onlineOwnSnake, setOnlineOwnSnake] = useState(54);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

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

  const handleSnakesChange = (val) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 3;
    if (num > 10) num = 10;
    if (num < 3) num = 3;
    setNumSnakes(num);
  };

  const handleLaddersChange = (val) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 0;
    if (num > 10) num = 10;
    if (num < 0) num = 0;
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

  // Local Play starter
  const validateAndStart = () => {
    const usedCells = new Set();
    if (gameMode === "own-snake") {
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

    let finalSnakes = numSnakes;
    let finalLadders = numLadders;

    if (!customBoardElements) {
      if (gameMode !== "own-snake") {
        finalSnakes = Math.floor(Math.random() * 3) + 5;
        finalLadders = Math.floor(Math.random() * 4) + 3;
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

  // Online Action triggers
  const handleHostOnline = () => {
    if (!onlineName.trim()) {
      alert("Please enter a name first.");
      return;
    }
    if (gameMode === "own-snake" && (onlineOwnSnake < 15 || onlineOwnSnake > 99)) {
      alert("Safe Snake head must be between 15 and 99.");
      return;
    }
    onCreateOnlineRoom({
      hostName: onlineName,
      hostColor: onlineColor,
      hostSnake: onlineOwnSnake,
      theme: selectedTheme,
      customElements: customBoardElements,
      snakesCount: numSnakes,
      laddersCount: numLadders
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
    if (gameMode === "own-snake" && (onlineOwnSnake < 15 || onlineOwnSnake > 99)) {
      alert("Safe Snake head must be between 15 and 99.");
      return;
    }
    onJoinOnlineRoom({
      code: joinCodeInput.trim().toUpperCase(),
      playerName: onlineName,
      playerColor: onlineColor,
      playerSnake: onlineOwnSnake
    });
  };

  const handleStartOnline = () => {
    let finalSnakes = numSnakes;
    let finalLadders = numLadders;

    if (!customBoardElements) {
      if (gameMode !== "own-snake") {
        finalSnakes = Math.floor(Math.random() * 3) + 5;
        finalLadders = Math.floor(Math.random() * 4) + 3;
      } else {
        finalSnakes = 3;
        finalLadders = 5;
      }
    }

    onStartOnlineGame(finalSnakes, finalLadders, selectedTheme);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?code=${onlineState.gameCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const { isOnline, gameCode, joinedPlayers, isHost, isConnecting } = onlineState;

  return (
    <div className="glass" style={{ maxWidth: "600px", width: "100%", padding: "2rem", borderRadius: "16px", marginTop: "2rem" }}>
      <h1 className="title-glow" style={{ textAlign: "center", marginBottom: "1.5rem" }}>Setup Game</h1>
      
      {/* 1. Pill Navigation: Local Play vs Online Multi-Device */}
      {!gameCode && (
        <div style={{
          display: "flex",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "30px",
          padding: "4px",
          marginBottom: "2rem",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <button
            onClick={() => {
              // Clear game code URL parameter when explicitly choosing local play
              if (window.location.search) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
              onToggleOnlineMode(false);
            }}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "24px",
              border: "none",
              background: !isOnline ? "var(--p1-color)" : "transparent",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            🎲 Local Play
          </button>
          <button
            onClick={() => onToggleOnlineMode(true)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "24px",
              border: "none",
              background: isOnline ? "var(--p1-color)" : "transparent",
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

      {/* --- RENDER ONLINE PLAY --- */}
      {isOnline ? (
        gameCode ? (
          /* --- ONLINE LOBBY ROOM --- */
          <div>
            <div style={{
              background: "rgba(244, 63, 94, 0.1)",
              border: "1.5px solid var(--p1-color)",
              padding: "1.25rem",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "2rem"
            }}>
              <h2 style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Lobby Room Code</h2>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                <span style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "2px", color: "white" }}>{gameCode}</span>
                <button 
                  className="btn btn-outline" 
                  onClick={handleCopyLink}
                  style={{ padding: "4px 10px", fontSize: "0.8rem", height: "fit-content" }}
                >
                  {copyFeedback ? "Copied! ✓" : "Copy Link 🔗"}
                </button>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                Share this link or code with your friends to join on their own screens!
              </p>
            </div>

            {/* List of Joined Players */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ fontWeight: "bold", color: "var(--text-muted)", fontSize: "0.95rem", display: "block", marginBottom: "0.75rem" }}>
                👥 Players In Lobby ({joinedPlayers.length}/4)
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {joinedPlayers.map((player) => (
                  <div 
                    key={player.id} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "space-between", 
                      padding: "0.75rem 1rem", 
                      background: "rgba(255,255,255,0.04)", 
                      borderRadius: "8px", 
                      borderLeft: `4px solid ${player.color}` 
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontWeight: "bold", color: "white" }}>
                        {player.name} {player.id === onlineState.myPlayerId && " (You)"}
                      </span>
                      {player.isHost && (
                        <span style={{ fontSize: "0.7rem", background: "rgba(253, 224, 71, 0.15)", color: "#fde047", padding: "2px 6px", borderRadius: "10px", border: "1px solid #fde04755" }}>
                          Host 👑
                        </span>
                      )}
                    </div>
                    {gameMode === "own-snake" && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Safe Snake: <strong style={{ color: player.color }}>{player.ownSnakeNumber}</strong>
                      </div>
                    )}
                  </div>
                ))}
                {joinedPlayers.length < 2 && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", fontStyle: "italic", marginTop: "0.5rem" }}>
                    Waiting for at least one more player...
                  </p>
                )}
              </div>
            </div>

            {/* If Host, allow parameters modification */}
            {isHost ? (
              <div style={{ borderTop: "1px solid var(--surface-light)", paddingTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Host Game Settings</h3>

                {/* Optional Board Elements Customization */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  marginBottom: "1.5rem", 
                  background: "rgba(255,255,255,0.04)", 
                  padding: "0.75rem 1rem", 
                  borderRadius: "12px", 
                  border: "1.5px solid rgba(255,255,255,0.06)"
                }}>
                  <input 
                    type="checkbox" 
                    id="custom-elements-toggle"
                    checked={customBoardElements}
                    onChange={(e) => setCustomBoardElements(e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--p1-color)" }}
                  />
                  <label htmlFor="custom-elements-toggle" style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white", cursor: "pointer", flex: 1 }}>
                    ⚙️ Customize Snake & Ladder quantities?
                  </label>
                </div>

                {customBoardElements && (
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 200px" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        Number of Snakes (3 - 10)
                      </label>
                      <input type="number" min="3" max="10" value={numSnakes} onChange={(e) => handleSnakesChange(e.target.value)} style={{ width: "100%" }} />
                    </div>
                    <div style={{ flex: "1 1 200px" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        Number of Ladders (0 - 10)
                      </label>
                      <input type="number" min="0" max="10" value={numLadders} onChange={(e) => handleLaddersChange(e.target.value)} style={{ width: "100%" }} />
                    </div>
                  </div>
                )}

                {/* Theme Selector */}
                <div style={{ marginBottom: "2rem" }}>
                  <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", fontSize: "0.9rem" }}>
                    🌍 Select Board Theme
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    {[
                      { id: "classic", name: "Classic Toys 🎲", color: "#ef4444" },
                      { id: "neon", name: "Retro Arcade 👾", color: "#6366f1" },
                      { id: "forest", name: "Jungle Expedition 🌿", color: "#10b981" },
                      { id: "space", name: "Cosmic Odyssey 🚀", color: "#a855f7" }
                    ].map(t => {
                      const isSelected = selectedTheme === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTheme(t.id)}
                          style={{
                            padding: "0.75rem 1rem",
                            borderRadius: "10px",
                            background: isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                            border: isSelected ? `2px solid ${t.color}` : "1.5px solid rgba(255,255,255,0.06)",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: isSelected ? "white" : "var(--text-main)" }}>
                            {t.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  className="btn" 
                  style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} 
                  onClick={handleStartOnline}
                  disabled={joinedPlayers.length < 2}
                >
                  Start Game 🚀
                </button>
              </div>
            ) : (
              /* If Guest, show what they are waiting for */
              <div style={{ 
                borderTop: "1px solid var(--surface-light)", 
                paddingTop: "1.5rem", 
                textAlign: "center", 
                background: "rgba(255,255,255,0.02)", 
                borderRadius: "12px", 
                padding: "1.5rem" 
              }}>
                <div className="animate-pulse" style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--p1-color)", marginBottom: "0.5rem" }}>
                  🎮 Waiting for host to start...
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Only the room owner (the host) can configure settings and launch the match. Hang tight!
                </p>
              </div>
            )}

            <button 
              className="btn btn-outline" 
              style={{ width: "100%", padding: "0.75rem", marginTop: "1rem" }} 
              onClick={onLeaveOnlineRoom}
            >
              Leave Room
            </button>
          </div>
        ) : (
          /* --- ONLINE HOST / JOIN SELECTOR --- */
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", borderBottom: "1.5px solid var(--surface-light)", paddingBottom: "10px" }}>
              <button 
                onClick={() => setOnlineTab("host")} 
                style={{
                  background: "transparent",
                  border: "none",
                  color: onlineTab === "host" ? "white" : "var(--text-muted)",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderBottom: onlineTab === "host" ? "3px solid var(--p1-color)" : "none"
                }}
              >
                Host A Game
              </button>
              <button 
                onClick={() => setOnlineTab("join")} 
                style={{
                  background: "transparent",
                  border: "none",
                  color: onlineTab === "join" ? "white" : "var(--text-muted)",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderBottom: onlineTab === "join" ? "3px solid var(--p1-color)" : "none"
                }}
              >
                Join A Game
              </button>
            </div>

            {/* Input Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Your Screen Name</label>
                <input 
                  type="text" 
                  value={onlineName} 
                  maxLength={15}
                  onChange={(e) => setOnlineName(e.target.value)} 
                  placeholder="Enter your name"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Select Character Color</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setOnlineColor(color)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: color,
                        border: onlineColor === color ? "3px solid white" : "2px solid rgba(0,0,0,0.3)",
                        boxShadow: onlineColor === color ? `0 0 10px ${color}` : "none",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    />
                  ))}
                </div>
              </div>

              {gameMode === "own-snake" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    Your Immune Snake Head (15 - 99)
                  </label>
                  <input 
                    type="number" 
                    min="15" max="99" 
                    value={onlineOwnSnake} 
                    onChange={(e) => setOnlineOwnSnake(parseInt(e.target.value) || 15)} 
                    style={{ width: "100%" }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    A snake will start here. If you land on it, you are immune, but other players slide down!
                  </p>
                </div>
              )}

              {onlineTab === "join" && (
                <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", color: "white", marginBottom: "0.5rem" }}>
                    🔑 Enter 6-Character Game Code
                  </label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={joinCodeInput} 
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())} 
                    placeholder="E.g. SNAKE9"
                    style={{ width: "100%", letterSpacing: "4px", fontSize: "1.2rem", fontWeight: "bold", textTransform: "uppercase", textAlign: "center" }}
                  />
                </div>
              )}
            </div>

            {/* Launch Buttons */}
            {onlineTab === "host" ? (
              <button 
                className="btn" 
                style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} 
                onClick={handleHostOnline}
                disabled={isConnecting}
              >
                {isConnecting ? "Hosting Room..." : "Host Room 🌐"}
              </button>
            ) : (
              <button 
                className="btn" 
                style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} 
                onClick={handleJoinOnline}
                disabled={isConnecting}
              >
                {isConnecting ? "Joining Room..." : "Join Room ⚡"}
              </button>
            )}
          </div>
        )
      ) : (
        /* --- RENDER LOCAL PLAY --- */
        <div>
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
                  {gameMode === "own-snake" && (
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
                {gameMode === "own-snake" && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    A snake will start at {config.ownSnake}. It will NOT bite you, but it WILL bite other players!
                  </p>
                )}
              </div>
            ))}
          </div>

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
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--p1-color)" }}
            />
            <label htmlFor="custom-elements-toggle" style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white", cursor: "pointer", flex: 1 }}>
              ⚙️ Customize Snake & Ladder quantities?
            </label>
          </div>

          {customBoardElements && (
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Number of Snakes (3 - 10)
                </label>
                <input type="number" min="3" max="10" value={numSnakes} onChange={(e) => handleSnakesChange(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Number of Ladders (0 - 10)
                </label>
                <input type="number" min="0" max="10" value={numLadders} onChange={(e) => handleLaddersChange(e.target.value)} style={{ width: "100%" }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.75rem", color: "var(--text-muted)", fontWeight: "bold", fontSize: "0.95rem" }}>
              🌍 Select Board Theme
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              {[
                { id: "classic", name: "Classic Toys 🎲", desc: "Nostalgic colorful checkers, plastic blue/red ladders.", color: "#ef4444" },
                { id: "neon", name: "Retro Arcade 👾", desc: "Deep grid space, neon cyan/magenta laser paths.", color: "#6366f1" },
                { id: "forest", name: "Jungle Expedition 🌿", desc: "Woodland green and brown terrain, log ladders.", color: "#10b981" },
                { id: "space", name: "Cosmic Odyssey 🚀", desc: "Starry starry nebula, gravity wormhole channels.", color: "#a855f7" }
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

          <button className="btn" style={{ width: "100%", padding: "1rem", fontSize: "1.2rem" }} onClick={validateAndStart}>
            Start Game
          </button>
        </div>
      )}

      {onBack && (
        <button 
          className="btn btn-outline" 
          style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginTop: "0.75rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", background: "transparent", cursor: "pointer" }} 
          onClick={onBack}
        >
          ← Back to Game Modes
        </button>
      )}
    </div>
  );
}
