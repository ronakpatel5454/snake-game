import React from "react";
import { getTokenCoordinates, TRACK_CELLS, SAFE_TRACK_INDICES, START_CELL_INDICES } from "../lib/ludoLogic";
import Premium3DDice from "./Premium3DDice";
import PlayerToken from "./PlayerTokens";
import PlayerCornerCard from "./PlayerCornerCard";
import { THEME_CONFIGS } from "../config/themeConfigs";

const BOARD_SIZE = 600; // logical coordinate space
const GRID_CELLS = 15;
const CELL_SIZE = BOARD_SIZE / GRID_CELLS; // 40 logical units

const PLAYER_COLORS = {
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#10b981",
  yellow: "#fbbf24"
};

const THEME_STYLES = {
  classic: {
    boardBorder: "var(--board-border)",
    gridBg: "rgba(255, 255, 255, 0.95)",
    cellBorder: "#cbd5e1",
    starColor: "#475569"
  },
  neon: {
    boardBorder: "#6366f1",
    gridBg: "#020617",
    cellBorder: "#1e1b4b",
    starColor: "#6366f1"
  },
  forest: {
    boardBorder: "#78350f",
    gridBg: "#14532d",
    cellBorder: "#052e16",
    starColor: "#ca8a04"
  },
  space: {
    boardBorder: "#a855f7",
    gridBg: "#03001e",
    cellBorder: "#2e1065",
    starColor: "#a855f7"
  },
  sakura: {
    boardBorder: "#f43f5e",
    gridBg: "#fff5f5",
    cellBorder: "#ffe4e6",
    starColor: "#f43f5e"
  },
  candy: {
    boardBorder: "#f472b6",
    gridBg: "#0f051d",
    cellBorder: "#2e1065",
    starColor: "#f472b6"
  }
};

// Base slot coordinates for each color (4 slots per color)
const BASE_SLOTS = {
  red: [
    { x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 },
    { x: 1.5, y: 3.5 }, { x: 3.5, y: 3.5 }
  ],
  green: [
    { x: 10.5, y: 1.5 }, { x: 12.5, y: 1.5 },
    { x: 10.5, y: 3.5 }, { x: 12.5, y: 3.5 }
  ],
  yellow: [
    { x: 10.5, y: 9.5 }, { x: 12.5, y: 9.5 },
    { x: 10.5, y: 11.5 }, { x: 12.5, y: 11.5 }
  ],
  blue: [
    { x: 1.5, y: 9.5 }, { x: 3.5, y: 9.5 },
    { x: 1.5, y: 11.5 }, { x: 3.5, y: 11.5 }
  ]
};

// Yard color/style helper
const getYardStyles = (theme, color) => {
  const isClassic = theme === "classic";
  const isNeon = theme === "neon";
  const isForest = theme === "forest";
  const isSpace = theme === "space";
  const isSakura = theme === "sakura";
  const isCandy = theme === "candy";

  let outerFill = PLAYER_COLORS[color];
  let innerFill = "#ffffff";
  let yardBorderColor = "none";
  let yardBorderWidth = "0";
  let yardBorderDash = "none";
  let rx = 12;

  if (isClassic) {
    // Cookie Dough / Bakery Theme
    outerFill = color === "red" ? "#fca5a5" : color === "green" ? "#86efac" : color === "blue" ? "#93c5fd" : "#fde047";
    innerFill = "#fffdf5"; // Cookie cream dough
    yardBorderColor = PLAYER_COLORS[color];
    yardBorderWidth = "3";
    yardBorderDash = "6 4";
  } else if (isNeon) {
    outerFill = "#020617";
    innerFill = "#090d16";
    yardBorderColor = PLAYER_COLORS[color];
    yardBorderWidth = "2.5";
  } else if (isForest) {
    outerFill = "#064e3b";
    innerFill = "#14532d";
    yardBorderColor = "#78350f";
    yardBorderWidth = "3";
  } else if (isSpace) {
    outerFill = "#0f172a";
    innerFill = "#03001e";
    yardBorderColor = "#a855f7";
    yardBorderWidth = "2.5";
  } else if (isSakura) {
    outerFill = "#ffe4e6";
    innerFill = "#fff5f5";
    yardBorderColor = "#f43f5e";
    yardBorderWidth = "2.5";
  } else if (isCandy) {
    outerFill = "#2e1065";
    innerFill = "#0f051d";
    yardBorderColor = "#f472b6";
    yardBorderWidth = "2.5";
  }

  return { outerFill, innerFill, yardBorderColor, yardBorderWidth, yardBorderDash, rx };
};

// Yard watermark vector illustrations
const renderYardWatermark = (theme, color, x, y) => {
  const isClassic = theme === "classic";
  const cx = x + CELL_SIZE * 2;
  const cy = y + CELL_SIZE * 2;
  
  if (isClassic) {
    // Cookies watermark
    return (
      <g opacity="0.16" style={{ pointerEvents: "none" }}>
        {/* Main Cookie Crust & Dough */}
        <circle cx={cx} cy={cy} r={CELL_SIZE * 1.38} fill="#855a29" />
        <circle cx={cx} cy={cy} r={CELL_SIZE * 1.32} fill="#ffd7ba" />
        {/* Chocolate Chips */}
        <circle cx={cx - 15} cy={cy - 16} r="6.5" fill="#3f2305" />
        <circle cx={cx + 18} cy={cy - 12} r="5.5" fill="#3f2305" />
        <circle cx={cx - 12} cy={cy + 18} r="6" fill="#3f2305" />
        <circle cx={cx + 14} cy={cy + 14} r="5" fill="#3f2305" />
        <circle cx={cx + 2} cy={cy - 2} r="5.5" fill="#3f2305" />
      </g>
    );
  }
  
  if (theme === "neon") {
    // Cyber circuit diagram
    return (
      <g opacity="0.18" stroke={PLAYER_COLORS[color]} strokeWidth="1.5" fill="none" style={{ pointerEvents: "none" }}>
        <circle cx={cx} cy={cy} r={CELL_SIZE * 1.25} />
        <line x1={cx - 40} y1={cy} x2={cx + 40} y2={cy} />
        <line x1={cx} y1={cy - 40} x2={cx} y2={cy + 40} />
        <rect x={cx - 18} y={cy - 18} width="36" height="36" rx="4" />
      </g>
    );
  }

  if (theme === "forest") {
    // Forest leaf outline
    return (
      <g opacity="0.18" fill="#ca8a04" style={{ pointerEvents: "none" }}>
        <path d={`M ${cx} ${cy - 28} C ${cx + 22} ${cy - 8}, ${cx + 22} ${cy + 18}, ${cx} ${cy + 28} C ${cx - 22} ${cy + 18}, ${cx - 22} ${cy - 8}, ${cx} ${cy - 28} Z`} />
        <line x1={cx} y1={cy - 28} x2={cx} y2={cy + 28} stroke="#78350f" strokeWidth="2.5" />
      </g>
    );
  }

  if (theme === "space") {
    // Astronaut Saturn / Planet
    return (
      <g opacity="0.18" fill="none" stroke="#a855f7" style={{ pointerEvents: "none" }}>
        <circle cx={cx} cy={cy} r="18" fill="#a855f7" />
        <ellipse cx={cx} cy={cy} rx="34" ry="9" strokeWidth="2.5" transform={`rotate(-25 ${cx} ${cy})`} />
      </g>
    );
  }

  if (theme === "sakura") {
    // Cherry Blossom
    return (
      <g opacity="0.18" fill="#f43f5e" style={{ pointerEvents: "none" }} transform={`translate(${cx}, ${cy}) scale(1.6)`}>
        <path d="M 0 0 C -5 -10, 5 -10, 0 0" />
        <path d="M 0 0 C 10 -5, 10 5, 0 0" />
        <path d="M 0 0 C 5 10, -5 10, 0 0" />
        <path d="M 0 0 C -10 5, -10 -5, 0 0" />
        <circle cx="0" cy="0" r="3.5" fill="#fef08a" />
      </g>
    );
  }

  if (theme === "candy") {
    // Lollipop spiral
    return (
      <g opacity="0.18" fill="none" stroke="#f472b6" strokeWidth="2" style={{ pointerEvents: "none" }}>
        <circle cx={cx} cy={cy} r="25" />
        <circle cx={cx} cy={cy} r="15" />
        <circle cx={cx} cy={cy} r="6" />
        <line x1={cx} y1={cy + 25} x2={cx} y2={cy + 45} strokeWidth="3.5" />
      </g>
    );
  }

  return null;
};

export default function LudoBoardComponent({
  players = [],
  activePlayerIdx = 0,
  diceValue,
  isRolling,
  isDiceRolling,
  onRoll,
  onSelectToken,
  legalMoves = [],
  logs = [],
  activeTheme = "classic",
  onThemeChange,
  onExitGame,
  ludoVariation = "ludo-classic",
  ludoWalkingToken = null
}) {
  const tConfig = THEME_CONFIGS[activeTheme] || THEME_CONFIGS.classic;
  const tStyle = THEME_STYLES[activeTheme] || THEME_STYLES.classic;

  const activePlayer = (players && players.length > 0)
    ? (players[activePlayerIdx] || players[0])
    : {
        name: "Player",
        colorCode: "#3b82f6",
        color: "blue",
        isBot: false,
        lastRoll: 1,
        tokens: []
      };

  // Helper to check if a specific grid cell (x, y) is part of a player's home path
  const getHomePathColor = (x, y) => {
    if (x === 7 && y >= 1 && y <= 5) return "green";
    if (x === 7 && y >= 9 && y <= 13) return "blue";
    if (y === 7 && x >= 1 && x <= 5) return "red";
    if (y === 7 && x >= 9 && x <= 13) return "yellow";
    return null;
  };

  // Group tokens by coordinate to compute clashing/stacking offsets
  const tokenClusters = {};
  (players || []).forEach((p, pIdx) => {
    const color = (p.color || "blue").toLowerCase();
    const tokens = p.tokens || [];
    tokens.forEach((stepIdx, tIdx) => {
      try {
        const coord = getTokenCoordinates(color, tIdx, stepIdx);
        if (!coord || coord.x === undefined || coord.y === undefined) return;
        const coordKey = `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`;
        if (!tokenClusters[coordKey]) {
          tokenClusters[coordKey] = [];
        }
        tokenClusters[coordKey].push({ pIdx, tIdx, color, stepIdx });
      } catch (e) {
        // Skip invalid token coordinates
      }
    });
  });

  // Calculate cluster offsets (if multiple tokens are in the same cell)
  const getTokenOffset = (cluster, idx) => {
    const total = cluster.length;
    if (total === 1) return { x: 0, y: 0 };
    const factor = CELL_SIZE * 0.22;
    if (total === 2) {
      return idx === 0 ? { x: -factor, y: -factor } : { x: factor, y: factor };
    }
    if (total === 3) {
      if (idx === 0) return { x: -factor, y: factor };
      if (idx === 1) return { x: factor, y: factor };
      return { x: 0, y: -factor };
    }
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    return {
      x: col === 0 ? -factor : factor,
      y: row === 0 ? -factor : factor
    };
  };

  // Render individual base slots starting circles
  const renderBaseSlot = (color, slot, sIdx) => {
    const isClassic = activeTheme === "classic";
    const isNeon = activeTheme === "neon";
    const isForest = activeTheme === "forest";
    const isSpace = activeTheme === "space";
    const isSakura = activeTheme === "sakura";
    const isCandy = activeTheme === "candy";

    const sx = slot.x * CELL_SIZE;
    const sy = slot.y * CELL_SIZE;
    const rOuter = CELL_SIZE * 0.55;
    const rInner = CELL_SIZE * 0.28;

    let outerFill = "#f1f5f9";
    let outerStroke = PLAYER_COLORS[color];
    let outerStrokeWidth = "2.5";
    let outerDash = undefined;
    let innerFill = PLAYER_COLORS[color];
    let innerOpacity = 0.45;

    if (isClassic) {
      outerFill = "#fffdf5";
      outerStroke = PLAYER_COLORS[color];
      outerStrokeWidth = "2";
      outerDash = "3 2";
      innerFill = PLAYER_COLORS[color];
      innerOpacity = 0.65;
    } else if (isNeon) {
      outerFill = "#090d16";
      outerStroke = PLAYER_COLORS[color];
      outerStrokeWidth = "2.5";
      innerFill = PLAYER_COLORS[color];
      innerOpacity = 0.8;
    } else if (isForest) {
      outerFill = "#1e3a2f";
      outerStroke = "#78350f";
      outerStrokeWidth = "2";
      innerFill = PLAYER_COLORS[color];
      innerOpacity = 0.5;
    } else if (isSpace) {
      outerFill = "#03001e";
      outerStroke = "#a855f7";
      outerStrokeWidth = "2";
      innerFill = PLAYER_COLORS[color];
      innerOpacity = 0.6;
    } else if (isSakura) {
      outerFill = "#fff5f5";
      outerStroke = "#f43f5e";
      outerStrokeWidth = "2";
      innerFill = PLAYER_COLORS[color];
      innerOpacity = 0.5;
    } else if (isCandy) {
      outerFill = "#0f051d";
      outerStroke = "#f472b6";
      outerStrokeWidth = "2";
      innerFill = PLAYER_COLORS[color];
      innerOpacity = 0.55;
    }

    return (
      <g key={`${color}-slot-${sIdx}`}>
        {/* Outer starting slot */}
        <circle 
          cx={sx} 
          cy={sy} 
          r={rOuter} 
          fill={outerFill} 
          stroke={outerStroke} 
          strokeWidth={outerStrokeWidth} 
          strokeDasharray={outerDash} 
        />
        {/* Inner starting slot colored center */}
        <circle 
          cx={sx} 
          cy={sy} 
          r={rInner} 
          fill={innerFill} 
          opacity={innerOpacity} 
        />
        {/* For classic cookies theme, draw a tiny chocolate chip in center */}
        {isClassic && (
          <circle cx={sx} cy={sy} r="2.5" fill="#3f2305" />
        )}
      </g>
    );
  };

  return (
    <div style={{ display: "flex", gap: "2rem", width: "100%", maxWidth: "1250px", flexWrap: "wrap", justifyContent: "center" }}>
      <style>{`
        @keyframes ludo-cookie-walk {
          0% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-10px) scaleY(0.92); }
          100% { transform: translateY(0) scaleY(1); }
        }
        .animate-ludo-walk {
          animation: ludo-cookie-walk 0.26s infinite ease-in-out;
        }
      `}</style>
      
      {/* 1. Ludo SVG Tabletop Board — scales to fit ANY screen */}
      <div style={{ flex: "1", minWidth: "280px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        <h1 className="title-glow" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Ludo Royale</h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
          <span style={{
            fontSize: "0.8rem",
            fontWeight: "bold",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "4px 12px",
            borderRadius: "16px",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            Variation: {ludoVariation === "ludo-classic" ? "Classic Ludo 🎲" : "Quick Ludo 🏃"}
          </span>
        </div>

        {/* Mobile player turn info strip */}
        <div className="mobile-only" style={{
          width: "100%",
          maxWidth: "520px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `${activePlayer.colorCode}22`,
          border: `1.5px solid ${activePlayer.colorCode}88`,
          borderRadius: "12px",
          padding: "10px 14px",
          marginBottom: "10px",
          boxShadow: `0 0 12px ${activePlayer.colorCode}33`
        }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Current Turn</div>
            <div style={{ fontSize: "1rem", fontWeight: "bold", color: activePlayer.colorCode }}>
              {activePlayer.name} {activePlayer.isBot && "🤖"}
            </div>
            {diceValue && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Rolled: {diceValue}</div>
            )}
          </div>
          <div
            onClick={() => {
              if (!isRolling && !activePlayer.isBot) {
                onRoll();
              }
            }}
            style={{
              cursor: (!isRolling && !activePlayer.isBot) ? "pointer" : "default",
              transform: "scale(0.8)",
              transformOrigin: "center right"
            }}
          >
            <Premium3DDice
              value={activePlayer.lastRoll || 1}
              color={activePlayer.colorCode}
              isRolling={isDiceRolling}
              theme={activeTheme}
            />
          </div>
        </div>

        {/* Mobile legal moves hint */}
        {legalMoves.length > 0 && !isRolling && (
          <div className="mobile-only" style={{
            width: "100%",
            maxWidth: "520px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            borderRadius: "8px",
            padding: "6px 12px",
            marginBottom: "8px",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#10b981",
            fontWeight: "bold"
          }}>
            👆 Tap a glowing token to move!
          </div>
        )}

        {/* Tabletop Layout with Board & Corner Cards */}
        <div className="tabletop-grid">

          {/* Left Column (P1/Red Top, P0/Blue Bottom) */}
          <div className="tabletop-column desktop-only">
            <PlayerCornerCard
              player={players[1]}
              isActive={activePlayerIdx === 1}
              isRolling={isRolling}
              isDiceRolling={activePlayerIdx === 1 && isDiceRolling}
              onRoll={onRoll}
              theme={activeTheme}
            />
            <PlayerCornerCard
              player={players[0]}
              isActive={activePlayerIdx === 0}
              isRolling={isRolling}
              isDiceRolling={activePlayerIdx === 0 && isDiceRolling}
              onRoll={onRoll}
              theme={activeTheme}
            />
          </div>

          {/* Center Column: The Board container */}
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: `${BOARD_SIZE}px`,
            aspectRatio: "1",
            border: `6px solid ${tStyle.boardBorder}`,
            borderRadius: "20px",
            background: tStyle.gridBg,
            boxShadow: activeTheme === "neon" || activeTheme === "space" || activeTheme === "candy"
              ? tConfig.glow || "0 10px 40px rgba(0,0,0,0.5)"
              : "0 10px 30px rgba(0,0,0,0.15)",
            overflow: "hidden",
            margin: "0 auto"
          }}>
            {/* Responsive SVG with viewBox so it scales to container */}
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
              style={{ display: "block" }}
            >
              {/* Draw Corner Base Yards with Custom Watermarks & Theme Colors */}
              {/* Red Base Top-Left */}
              {(() => {
                const yr = getYardStyles(activeTheme, "red");
                return (
                  <g key="red-yard">
                    <rect x="0" y="0" width={CELL_SIZE * 6} height={CELL_SIZE * 6} fill={yr.outerFill} opacity="0.9" />
                    <rect 
                      x={CELL_SIZE} 
                      y={CELL_SIZE} 
                      width={CELL_SIZE * 4} 
                      height={CELL_SIZE * 4} 
                      fill={yr.innerFill} 
                      rx={yr.rx} 
                      stroke={yr.yardBorderColor}
                      strokeWidth={yr.yardBorderWidth}
                      strokeDasharray={yr.yardBorderDash}
                    />
                    {renderYardWatermark(activeTheme, "red", CELL_SIZE, CELL_SIZE)}
                  </g>
                );
              })()}

              {/* Green Base Top-Right */}
              {(() => {
                const yg = getYardStyles(activeTheme, "green");
                return (
                  <g key="green-yard">
                    <rect x={CELL_SIZE * 9} y="0" width={CELL_SIZE * 6} height={CELL_SIZE * 6} fill={yg.outerFill} opacity="0.9" />
                    <rect 
                      x={CELL_SIZE * 10} 
                      y={CELL_SIZE} 
                      width={CELL_SIZE * 4} 
                      height={CELL_SIZE * 4} 
                      fill={yg.innerFill} 
                      rx={yg.rx} 
                      stroke={yg.yardBorderColor}
                      strokeWidth={yg.yardBorderWidth}
                      strokeDasharray={yg.yardBorderDash}
                    />
                    {renderYardWatermark(activeTheme, "green", CELL_SIZE * 10, CELL_SIZE)}
                  </g>
                );
              })()}

              {/* Blue Base Bottom-Left */}
              {(() => {
                const yb = getYardStyles(activeTheme, "blue");
                return (
                  <g key="blue-yard">
                    <rect x="0" y={CELL_SIZE * 9} width={CELL_SIZE * 6} height={CELL_SIZE * 6} fill={yb.outerFill} opacity="0.9" />
                    <rect 
                      x={CELL_SIZE} 
                      y={CELL_SIZE * 10} 
                      width={CELL_SIZE * 4} 
                      height={CELL_SIZE * 4} 
                      fill={yb.innerFill} 
                      rx={yb.rx} 
                      stroke={yb.yardBorderColor}
                      strokeWidth={yb.yardBorderWidth}
                      strokeDasharray={yb.yardBorderDash}
                    />
                    {renderYardWatermark(activeTheme, "blue", CELL_SIZE, CELL_SIZE * 10)}
                  </g>
                );
              })()}

              {/* Yellow Base Bottom-Right */}
              {(() => {
                const yy = getYardStyles(activeTheme, "yellow");
                return (
                  <g key="yellow-yard">
                    <rect x={CELL_SIZE * 9} y={CELL_SIZE * 9} width={CELL_SIZE * 6} height={CELL_SIZE * 6} fill={yy.outerFill} opacity="0.9" />
                    <rect 
                      x={CELL_SIZE * 10} 
                      y={CELL_SIZE * 10} 
                      width={CELL_SIZE * 4} 
                      height={CELL_SIZE * 4} 
                      fill={yy.innerFill} 
                      rx={yy.rx} 
                      stroke={yy.yardBorderColor}
                      strokeWidth={yy.yardBorderWidth}
                      strokeDasharray={yy.yardBorderDash}
                    />
                    {renderYardWatermark(activeTheme, "yellow", CELL_SIZE * 10, CELL_SIZE * 10)}
                  </g>
                );
              })()}

              {/* Inner Base Circle Slots - themed starting circles */}
              {Object.keys(BASE_SLOTS).map(color => {
                const slots = BASE_SLOTS[color];
                return slots.map((slot, sIdx) => renderBaseSlot(color, slot, sIdx));
              })}

              {/* Draw Grid Tracks Perimeter */}
              {TRACK_CELLS.map((cell, idx) => {
                const isSafe = SAFE_TRACK_INDICES.includes(idx);
                const cx = cell.x * CELL_SIZE + CELL_SIZE / 2;
                const cy = cell.y * CELL_SIZE + CELL_SIZE / 2;
                let fill = "transparent";
                if (idx === START_CELL_INDICES.blue) fill = PLAYER_COLORS.blue;
                else if (idx === START_CELL_INDICES.red) fill = PLAYER_COLORS.red;
                else if (idx === START_CELL_INDICES.green) fill = PLAYER_COLORS.green;
                else if (idx === START_CELL_INDICES.yellow) fill = PLAYER_COLORS.yellow;
                else if (isSafe) fill = "#e2e8f0";

                return (
                  <g key={`track-grid-${idx}`}>
                    <rect
                      x={cell.x * CELL_SIZE}
                      y={cell.y * CELL_SIZE}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={fill}
                      stroke={tStyle.cellBorder}
                      strokeWidth="1.2"
                    />
                    {isSafe && (
                      <text
                        x={cx}
                        y={cy + 5}
                        fontSize="1.15rem"
                        textAnchor="middle"
                        fill={tStyle.starColor}
                        opacity="0.8"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        ★
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draw Home Paths */}
              {Array(GRID_CELLS).fill(0).map((_, y) =>
                Array(GRID_CELLS).fill(0).map((_, x) => {
                  const pathColor = getHomePathColor(x, y);
                  if (!pathColor) return null;
                  return (
                    <rect
                      key={`home-path-${x}-${y}`}
                      x={x * CELL_SIZE}
                      y={y * CELL_SIZE}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={PLAYER_COLORS[pathColor]}
                      stroke={tStyle.cellBorder}
                      strokeWidth="1.2"
                    />
                  );
                })
              )}

              {/* Draw Center Home Triangles */}
              <polygon
                points={`${CELL_SIZE * 6},${CELL_SIZE * 9} ${CELL_SIZE * 7.5},${CELL_SIZE * 7.5} ${CELL_SIZE * 9},${CELL_SIZE * 9}`}
                fill={PLAYER_COLORS.blue}
                stroke={tStyle.cellBorder}
                strokeWidth="1.2"
              />
              <polygon
                points={`${CELL_SIZE * 6},${CELL_SIZE * 6} ${CELL_SIZE * 7.5},${CELL_SIZE * 7.5} ${CELL_SIZE * 6},${CELL_SIZE * 9}`}
                fill={PLAYER_COLORS.red}
                stroke={tStyle.cellBorder}
                strokeWidth="1.2"
              />
              <polygon
                points={`${CELL_SIZE * 6},${CELL_SIZE * 6} ${CELL_SIZE * 7.5},${CELL_SIZE * 7.5} ${CELL_SIZE * 9},${CELL_SIZE * 6}`}
                fill={PLAYER_COLORS.green}
                stroke={tStyle.cellBorder}
                strokeWidth="1.2"
              />
              <polygon
                points={`${CELL_SIZE * 9},${CELL_SIZE * 6} ${CELL_SIZE * 7.5},${CELL_SIZE * 7.5} ${CELL_SIZE * 9},${CELL_SIZE * 9}`}
                fill={PLAYER_COLORS.yellow}
                stroke={tStyle.cellBorder}
                strokeWidth="1.2"
              />

              {/* Draw Active Player Cute Watermark Tokens */}
              {Object.keys(tokenClusters).map(coordKey => {
                const cluster = tokenClusters[coordKey];
                return cluster.map((tokenInfo, idx) => {
                  const { pIdx, tIdx, color, stepIdx } = tokenInfo;
                  const coord = getTokenCoordinates(color, tIdx, stepIdx);
                  if (!coord) return null;
                  const offset = getTokenOffset(cluster, idx);

                  const isAtHomeBase = stepIdx === -1;
                  const cx = coord.x * CELL_SIZE + (isAtHomeBase ? 0 : CELL_SIZE / 2) + offset.x;
                  const cy = coord.y * CELL_SIZE + (isAtHomeBase ? 0 : CELL_SIZE / 2) + offset.y;
                  const radius = CELL_SIZE * 0.32;

                  const isMyTurn = pIdx === activePlayerIdx;
                  const canMove = isMyTurn && legalMoves.includes(tIdx) && !isRolling && !isDiceRolling;
                  const isWalking = ludoWalkingToken && ludoWalkingToken.playerIdx === pIdx && ludoWalkingToken.tokenIdx === tIdx;

                  return (
                    <g
                      key={`token-${pIdx}-${tIdx}`}
                      onClick={() => {
                        if (canMove) onSelectToken(tIdx);
                      }}
                      style={{ cursor: canMove ? "pointer" : "default" }}
                    >
                      {/* Token Drop Shadow */}
                      <circle cx={cx + 1.5} cy={cy + 1.5} r={radius * 1.05} fill="rgba(0,0,0,0.38)" />

                      {/* Character Token SVG integrated using nested `<svg>` element for auto scaling */}
                      <svg
                        x={cx - radius * 1.25}
                        y={cy - radius * 1.25}
                        width={radius * 2.5}
                        height={radius * 2.5}
                        viewBox="0 0 100 100"
                        className={isWalking ? "animate-ludo-walk" : canMove ? "animate-bounce" : ""}
                        style={{
                          overflow: "visible",
                          transition: isWalking ? "none" : "all 0.25s ease-out",
                          filter: canMove ? `drop-shadow(0 0 10px ${PLAYER_COLORS[color]})` : "none"
                        }}
                      >
                        <PlayerToken theme={activeTheme} color={PLAYER_COLORS[color]} size="100%" />
                      </svg>

                      {/* Token number small corner badge */}
                      <g style={{ pointerEvents: "none", userSelect: "none" }}>
                        <circle 
                          cx={cx + radius} 
                          cy={cy - radius} 
                          r={radius * 0.35} 
                          fill="#1e293b" 
                          stroke="#ffffff" 
                          strokeWidth="1.2" 
                        />
                        <text
                          x={cx + radius}
                          y={cy - radius + 2.5}
                          fontSize="0.55rem"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="#ffffff"
                        >
                          {tIdx + 1}
                        </text>
                      </g>
                    </g>
                  );
                });
              })}

            </svg>
          </div>

          {/* Right Column (P2/Green Top, P3/Yellow Bottom) */}
          <div className="tabletop-column desktop-only">
            <PlayerCornerCard
              player={players[2]}
              isActive={activePlayerIdx === 2}
              isRolling={isRolling}
              isDiceRolling={activePlayerIdx === 2 && isDiceRolling}
              onRoll={onRoll}
              theme={activeTheme}
            />
            <PlayerCornerCard
              player={players[3]}
              isActive={activePlayerIdx === 3}
              isRolling={isRolling}
              isDiceRolling={activePlayerIdx === 3 && isDiceRolling}
              onRoll={onRoll}
              theme={activeTheme}
            />
          </div>

        </div>

        {/* Mobile player status chips */}
        <div className="mobile-only" style={{
          width: "100%",
          maxWidth: "520px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginTop: "10px",
          justifyContent: "center"
        }}>
          {(players || []).map((p, pIdx) => {
            const isActive = pIdx === activePlayerIdx;
            const tokensActive = (p.tokens || []).filter(s => s >= 0 && s < 56).length;
            const tokensHome = (p.tokens || []).filter(s => s === 56).length;
            return (
              <div key={p.id || pIdx} style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 10px",
                borderRadius: "20px",
                background: isActive ? `${p.colorCode || "#888"}22` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${isActive ? (p.colorCode || "#888") : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.2s"
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.colorCode || "#888" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: isActive ? "bold" : "normal", color: isActive ? "white" : "var(--text-muted)" }}>
                  {p.name} {p.isBot && "🤖"}
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                  {tokensHome > 0 ? `🏠${tokensHome}` : `🏃${tokensActive}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile logs + exit */}
        <div className="mobile-only" style={{ width: "100%", maxWidth: "520px", marginTop: "10px" }}>
          <div className="glass" style={{ padding: "0.75rem 1rem", borderRadius: "12px", marginBottom: "8px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>📝 Game Log</div>
            {(logs || []).slice(0, 3).map((l, i) => (
              <div key={i} style={{ fontSize: "0.8rem", color: i === 0 ? "var(--text-main)" : "var(--text-muted)", opacity: 1 - i * 0.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {l}
              </div>
            ))}
          </div>
          <button
            className="btn btn-outline"
            onClick={() => {
              if (confirm("Are you sure you want to exit Ludo? Your progress will be lost.")) {
                onExitGame();
              }
            }}
            style={{ width: "100%", borderColor: "#ef4444", color: "#ef4444", padding: "10px" }}
          >
            Exit Game 🚪
          </button>
        </div>
      </div>

      {/* 2. Control Panel & Logs Side — desktop only */}
      <div className="glass desktop-only" style={{ flex: "0 0 320px", padding: "1.5rem", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Active Turn info */}
        <div style={{ textAlign: "center" }}>
          <h3 style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Current Turn</h3>
          <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: activePlayer.colorCode }}>
            {activePlayer.name} {activePlayer.isBot && "(Bot)"}
          </div>
        </div>

        {/* Token status table */}
        <div>
          <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem", borderBottom: "1px solid var(--surface-light)", paddingBottom: "0.5rem" }}>
            Player Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {(players || []).map((p, pIdx) => {
              const hasMoves = pIdx === activePlayerIdx && legalMoves.length > 0 && !isRolling && !isDiceRolling;
              const tokensOnTrack = (p.tokens || []).filter(s => s >= 0 && s < 56).length;
              const tokensHome = (p.tokens || []).filter(s => s === 56).length;
              return (
                <div key={p.id || pIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0.5rem", background: pIdx === activePlayerIdx ? "rgba(255,255,255,0.05)" : "transparent", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: p.colorCode || "#888" }} />
                    <span style={{ fontWeight: pIdx === activePlayerIdx ? "bold" : "normal" }}>{p.name} {p.isBot && "🤖"}</span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: hasMoves ? "var(--secondary)" : "var(--text-muted)", fontWeight: hasMoves ? "bold" : "normal" }}>
                    {hasMoves ? "Select Token!" : `Track: ${tokensOnTrack} 🏠${tokensHome}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme Picker */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 style={{ color: "var(--text-muted)", marginBottom: "0.25rem", borderBottom: "1px solid var(--surface-light)", paddingBottom: "0.5rem" }}>
            Board Theme 🎨
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.4rem" }}>
            {["classic", "neon", "forest", "space", "sakura", "candy"].map((themeKey) => {
              const isSelected = activeTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  onClick={() => onThemeChange(themeKey)}
                  style={{
                    padding: "6px 2px",
                    fontSize: "0.75rem",
                    borderRadius: "8px",
                    border: isSelected ? `1.5px solid ${PLAYER_COLORS.blue}` : "1.5px solid rgba(255,255,255,0.15)",
                    background: isSelected ? PLAYER_COLORS.blue : "transparent",
                    color: isSelected ? "white" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {themeKey === "classic" && "🎲 "}
                  {themeKey === "neon" && "✨ "}
                  {themeKey === "forest" && "🌿 "}
                  {themeKey === "space" && "🌌 "}
                  {themeKey === "sakura" && "🌸 "}
                  {themeKey === "candy" && "🍭 "}
                  {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Logs */}
        <div style={{ flex: 1, minHeight: "130px" }}>
          <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem", borderBottom: "1px solid var(--surface-light)", paddingBottom: "0.5rem" }}>Game Log</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
            {(logs || []).map((l, i) => (
              <div key={i} style={{ color: i === 0 ? "var(--text-main)" : "var(--text-muted)", opacity: 1 - (i * 0.25) }}>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Exit Button */}
        <button
          className="btn btn-outline"
          onClick={() => {
            if (confirm("Are you sure you want to exit Ludo? Your progress will be lost.")) {
              onExitGame();
            }
          }}
          style={{ width: "100%", borderColor: "#ef4444", color: "#ef4444" }}
        >
          Exit Game 🚪
        </button>

      </div>
    </div>
  );
}
