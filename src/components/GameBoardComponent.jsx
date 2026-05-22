import { useEffect, useRef, useState } from "react";
import PlayerToken from "./PlayerTokens";
import { THEME_CONFIGS } from "../config/themeConfigs";


export default function GameBoardComponent({ board, players, gameMode, theme = "classic" }) {
  const containerRef = useRef(null);
  const [boardSize, setBoardSize] = useState(500);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleSize = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        const width = parent ? parent.clientWidth : containerRef.current.clientWidth;
        if (width > 0) {
          setBoardSize(Math.min(width, 600)); // max 600px
        }
      }
    };

    // Initial size check
    handleSize();

    const observer = new ResizeObserver(() => {
      handleSize();
    });

    const parent = containerRef.current.parentElement;
    if (parent) {
      observer.observe(parent);
    } else {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const cellSize = boardSize / 10;

  // Updated coordinates getter: supports rendering tokens in bottom pods if position === 0
  const getCoordinates = (cell, playerIdx = 0) => {
    if (cell === 0) {
      // Home positions inside bottom Home Base Tray
      const spacing = boardSize / 4;
      const cx = (playerIdx * spacing) + (spacing / 2);
      const cy = (10 * cellSize) + (cellSize * 0.65);
      return {
        x: cx - cellSize * 0.4,
        y: cy - cellSize * 0.45,
        cx: cx,
        cy: cy,
      };
    }
    if (cell < 1) cell = 1;
    if (cell > 100) cell = 100;
    const row = Math.floor((cell - 1) / 10);
    let col = (cell - 1) % 10;
    if (row % 2 === 1) {
      col = 9 - col;
    }
    return {
      x: col * cellSize,
      y: (9 - row) * cellSize,
      cx: col * cellSize + cellSize / 2,
      cy: (9 - row) * cellSize + cellSize / 2,
    };
  };

  const cells = Array.from({ length: 100 }, (_, i) => i + 1);

  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.classic;

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: "100%", 
        maxWidth: "600px", 
        height: boardSize + cellSize * 1.3, // Allocates precise vertical space for Grid (10 rows) + Home Tray (1.3 rows)
        position: "relative",
        background: config.boardBg,
        borderRadius: "16px",
        overflow: "visible", // Allows white token outlines and home pods to render cleanly without clipping
        boxShadow: theme === "neon" || theme === "space" ? `${config.glow}, 0 15px 35px rgba(0,0,0,0.6)` : "0 15px 35px rgba(0,0,0,0.6)",
        border: config.border,
        boxSizing: "border-box"
      }}
    >
      <style>{`
        /* Quick high-frequency panic shaking animation for snake bites */
        @keyframes cookie-panic-shake {
          0% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-3px, -1.5px) rotate(-4deg); }
          20% { transform: translate(-4px, 0px) rotate(4deg); }
          30% { transform: translate(0px, 2.5px) rotate(0deg); }
          40% { transform: translate(3px, -1.5px) rotate(4deg); }
          50% { transform: translate(-1.5px, 3px) rotate(-4deg); }
          60% { transform: translate(-4px, 1.5px) rotate(0deg); }
          70% { transform: translate(3px, 1.5px) rotate(-4deg); }
          80% { transform: translate(-1.5px, -1.5px) rotate(4deg); }
          90% { transform: translate(1.5px, 3px) rotate(2deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        /* Swallowing/sliding animation down the snake */
        @keyframes cookie-snake-slide {
          0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
          20% { transform: scale(0.6) rotate(45deg) translateY(-2px); filter: brightness(0.8); }
          50% { transform: scale(0.45) rotate(180deg) translateY(0); filter: brightness(0.65); }
          80% { transform: scale(0.6) rotate(315deg) translateY(2px); filter: brightness(0.85); }
          100% { transform: scale(1) rotate(360deg); filter: brightness(1); }
        }

        /* Ladder climbing tilt & vertical bounce animation */
        @keyframes cookie-ladder-climb {
          0% { transform: scale(1.02) translateY(0) rotate(-4deg); }
          50% { transform: scale(1.08) translateY(-4px) rotate(4deg); }
          100% { transform: scale(1.02) translateY(0) rotate(-4deg); }
        }

        /* Continuous cartoon bobbing/stepping walk animation */
        @keyframes cookie-walk {
          0% { transform: translateY(0) rotate(-6deg) scaleY(1); }
          25% { transform: translateY(-7px) rotate(0deg) scaleY(0.95); }
          50% { transform: translateY(0) rotate(6deg) scaleY(1); }
          75% { transform: translateY(-7px) rotate(0deg) scaleY(0.95); }
          100% { transform: translateY(0) rotate(-6deg) scaleY(1); }
        }
      `}</style>

      {/* Draw Cell Backgrounds */}
      {cells.map((cell) => {
        const { x, y } = getCoordinates(cell);
        
        // 10 columns checkerboard in 5 vertical bands (each band is 2 columns wide)
        const row = Math.floor((cell - 1) / 10);
        let col = (cell - 1) % 10;
        if (row % 2 === 1) {
          col = 9 - col;
        }

        const band = Math.floor(col / 2);
        const isDark = (row + col) % 2 === 0;

        const bandConfig = config.gridBands[band] || config.gridBands[0];
        const cellBg = isDark ? bandConfig.isDark : bandConfig.isLight;
        
        return (
          <div
            key={`cell-bg-${cell}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: cellSize,
              height: cellSize,
              background: cellBg,
              border: config.cellBorder, // Themed borders
              boxSizing: "border-box",
              zIndex: 1
            }}
          />
        );
      })}

      {/* Highlight Owned Snake Heads */}
      {gameMode === "own-snake" && players.map(p => {
        const { x, y } = getCoordinates(p.ownSnakeNumber);
        return (
          <div
            key={`owned-${p.id}`}
            className="animate-pulse-glow"
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: cellSize,
              height: cellSize,
              boxShadow: `inset 0 0 15px ${p.color}`,
              border: `3px solid ${p.color}`,
              boxSizing: "border-box",
              pointerEvents: "none",
              zIndex: 2
            }}
          />
        );
      })}

      {/* Draw Snakes and Ladders using SVG */}
      <svg 
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: boardSize, pointerEvents: "none", zIndex: 5 }}
      >
        {/* Ladders */}
        {board.ladders.map((ladder, idx) => {
          const start = getCoordinates(ladder.bottom);
          const end = getCoordinates(ladder.top);

          const dx = end.cx - start.cx;
          const dy = end.cy - start.cy;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const nx = -uy;
          const ny = ux;

          const ladderWidth = cellSize * 0.24; // Thinner ladders
          const railOffset = ladderWidth / 2;

          // Parallel rails coordinates
          const lx1 = start.cx + nx * railOffset;
          const ly1 = start.cy + ny * railOffset;
          const lx2 = end.cx + nx * railOffset;
          const ly2 = end.cy + ny * railOffset;

          const rx1 = start.cx - nx * railOffset;
          const ry1 = start.cy - ny * railOffset;
          const rx2 = end.cx - nx * railOffset;
          const ry2 = end.cy - ny * railOffset;

          // Rungs coordinates
          const numRungs = Math.max(4, Math.floor(len / (cellSize * 0.38)));
          const rungs = [];
          for (let i = 0; i <= numRungs; i++) {
            const t = i / numRungs;
            const cx = start.cx + dx * t;
            const cy = start.cy + dy * t;
            rungs.push({
              x1: cx + nx * railOffset,
              y1: cy + ny * railOffset,
              x2: cx - nx * railOffset,
              y2: cy - ny * railOffset,
              cx: cx,
              cy: cy
            });
          }

          const railWidth = cellSize * 0.05; // Thin rails
          const rungWidth = cellSize * 0.03; // Thin rungs

          if (theme === "neon") {
            return (
              <g key={`ladder-${idx}`}>
                {/* Neon Rails Glow */}
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#06b6d4" strokeWidth={railWidth * 3.5} strokeLinecap="round" opacity="0.45" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#06b6d4" strokeWidth={railWidth * 3.5} strokeLinecap="round" opacity="0.45" />
                
                {/* Neon Rails Core */}
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#22d3ee" strokeWidth={railWidth} strokeLinecap="round" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#22d3ee" strokeWidth={railWidth} strokeLinecap="round" />
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#ffffff" strokeWidth={railWidth * 0.3} strokeLinecap="round" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#ffffff" strokeWidth={railWidth * 0.3} strokeLinecap="round" />

                {/* Neon Rungs Glow & Core */}
                {rungs.map((r, rIdx) => (
                  <g key={`rung-${rIdx}`}>
                    <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#d946ef" strokeWidth={rungWidth * 4.5} strokeLinecap="round" opacity="0.4" />
                    <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#fdf4ff" strokeWidth={rungWidth} strokeLinecap="round" />
                  </g>
                ))}
              </g>
            );
          } else if (theme === "forest") {
            return (
              <g key={`ladder-${idx}`}>
                {/* 3D Shadows */}
                <line x1={lx1 + 2.5} y1={ly1 + 2.5} x2={lx2 + 2.5} y2={ly2 + 2.5} stroke="rgba(0,0,0,0.3)" strokeWidth={railWidth * 1.5} strokeLinecap="round" />
                <line x1={rx1 + 2.5} y1={ry1 + 2.5} x2={rx2 + 2.5} y2={ry2 + 2.5} stroke="rgba(0,0,0,0.3)" strokeWidth={railWidth * 1.5} strokeLinecap="round" />
                
                {/* Wooden Log Rails */}
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#78350f" strokeWidth={railWidth * 1.6} strokeLinecap="round" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#78350f" strokeWidth={railWidth * 1.6} strokeLinecap="round" />
                
                {/* Wood Highlight */}
                <line x1={lx1 - 1} y1={ly1 - 1} x2={lx2 - 1} y2={ly2 - 1} stroke="#92400e" strokeWidth={railWidth * 0.6} strokeLinecap="round" />
                <line x1={rx1 - 1} y1={ry1 - 1} x2={rx2 - 1} y2={ry2 - 1} stroke="#92400e" strokeWidth={railWidth * 0.6} strokeLinecap="round" />

                {/* Wooden Rungs with tiny vine ties */}
                {rungs.map((r, rIdx) => (
                  <g key={`rung-${rIdx}`}>
                    {/* Shadow & Rung Log */}
                    <line x1={r.x1 + 1} y1={r.y1 + 1} x2={r.x2 + 1} y2={r.y2 + 1} stroke="rgba(0,0,0,0.25)" strokeWidth={rungWidth * 1.5} strokeLinecap="round" />
                    <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#b45309" strokeWidth={rungWidth * 1.5} strokeLinecap="round" />
                    
                    {/* Green vine leaf knots at joint corners! */}
                    <circle cx={r.x1} cy={r.y1} r={cellSize * 0.038} fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
                    <circle cx={r.x2} cy={r.y2} r={cellSize * 0.038} fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
                  </g>
                ))}
              </g>
            );
          } else if (theme === "space") {
            return (
              <g key={`ladder-${idx}`}>
                {/* Translucent Gravity Fields Background */}
                <line x1={start.cx} y1={start.cy} x2={end.cx} y2={end.cy} stroke="#a855f7" strokeWidth={ladderWidth} strokeLinecap="round" opacity="0.1" />
                
                {/* Glowing electric laser/stardust rails */}
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#c084fc" strokeWidth={railWidth * 2.5} strokeLinecap="round" opacity="0.3" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#c084fc" strokeWidth={railWidth * 2.5} strokeLinecap="round" opacity="0.3" />
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#c084fc" strokeWidth={railWidth * 0.8} strokeLinecap="round" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#c084fc" strokeWidth={railWidth * 0.8} strokeLinecap="round" />
                
                {/* Cosmic stardust rungs rendering starlight beams */}
                {rungs.map((r, rIdx) => (
                  <g key={`rung-${rIdx}`}>
                    <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#6366f1" strokeWidth={rungWidth * 3.5} strokeLinecap="round" opacity="0.45" />
                    <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#818cf8" strokeWidth={rungWidth * 0.9} strokeLinecap="round" />
                    
                    {/* Centered glowing star sparkler */}
                    <polygon 
                      points={`${r.cx},${r.cy - 4} ${r.cx + 1},${r.cy - 1} ${r.cx + 4},${r.cy} ${r.cx + 1},${r.cy + 1} ${r.cx},${r.cy + 4} ${r.cx - 1},${r.cy + 1} ${r.cx - 4},${r.cy} ${r.cx - 1},${r.cy - 1}`} 
                      fill="#fef08a" 
                      opacity="0.9"
                    />
                  </g>
                ))}
              </g>
            );
          } else {
            // Classic toys mode
            return (
              <g key={`ladder-${idx}`} opacity="0.9">
                {/* Outer Shadow for 3D effect */}
                <line x1={lx1 + 2} y1={ly1 + 2} x2={lx2 + 2} y2={ly2 + 2} stroke="rgba(0,0,0,0.15)" strokeWidth={railWidth} strokeLinecap="round" />
                <line x1={rx1 + 2} y1={ry1 + 2} x2={rx2 + 2} y2={ry2 + 2} stroke="rgba(0,0,0,0.15)" strokeWidth={railWidth} strokeLinecap="round" />
                {rungs.map((r, rIdx) => (
                  <line key={`rung-sh-${rIdx}`} x1={r.x1 + 2} y1={r.y1 + 2} x2={r.x2 + 2} y2={r.y2 + 2} stroke="rgba(0,0,0,0.15)" strokeWidth={rungWidth} strokeLinecap="round" />
                ))}

                {/* Black Outlines */}
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#1e293b" strokeWidth={railWidth + 2} strokeLinecap="round" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#1e293b" strokeWidth={railWidth + 2} strokeLinecap="round" />
                {rungs.map((r, rIdx) => (
                  <line key={`rung-ol-${rIdx}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#1e293b" strokeWidth={rungWidth + 2} strokeLinecap="round" />
                ))}

                {/* Blue Rails & Red Rungs (Toy Colors) */}
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#3b82f6" strokeWidth={railWidth} strokeLinecap="round" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#3b82f6" strokeWidth={railWidth} strokeLinecap="round" />
                {rungs.map((r, rIdx) => (
                  <line key={`rung-il-${rIdx}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#f43f5e" strokeWidth={rungWidth} strokeLinecap="round" />
                ))}
              </g>
            );
          }
        })}

        {/* Snakes (Gorgeous round curved tapered serpentine snakes) */}
        {board.snakes.map((snake, idx) => {
          const start = getCoordinates(snake.head);
          const end = getCoordinates(snake.tail);
          
          const dx = end.cx - start.cx;
          const dy = end.cy - start.cy;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const normalX = -uy;
          const normalY = ux;

          const points = [];
          const numSteps = 35; // Highly optimized for DOM rendering while remaining perfectly smooth
          
          // Lower frequency = lazy, elegant, curved serpentine coils instead of hyper zigzags
          const frequency = len > cellSize * 4 ? 1.8 : 1.2;
          const amplitude = Math.min(cellSize * 0.48, len * 0.22); 
          
          for (let i = 0; i <= numSteps; i++) {
            const t = i / numSteps;
            const baseX = start.cx + dx * t;
            const baseY = start.cy + dy * t;
            
            // Sine envelope makes sure offset starts exactly at 0 (head) and ends exactly at 0 (tail)
            const direction = snake.head % 2 === 0 ? 1 : -1;
            const envelope = Math.sin(t * Math.PI);
            const waveOffset = Math.sin(t * Math.PI * frequency) * envelope * amplitude * direction;
            
            points.push({
              x: baseX + normalX * waveOffset,
              y: baseY + normalY * waveOffset
            });
          }

          // Find if this snake is owned by any player
          const ownerPlayer = gameMode === "own-snake" ? players.find(p => p.ownSnakeNumber === snake.head) : null;

          const isNeon = theme === "neon";
          const isForest = theme === "forest";
          const isSpace = theme === "space";

          // Curated colors matching owner colors or a vibrant classic green
          let baseColor = ownerPlayer ? ownerPlayer.color : "#22c55e"; 
          let patternColor = ownerPlayer ? "white" : "#15803d"; 

          if (isNeon) {
            baseColor = "#22c55e";
            patternColor = "#86efac";
          } else if (isForest) {
            baseColor = "#16a34a";
            patternColor = "#15803d";
          } else if (isSpace) {
            baseColor = "#a855f7";
            patternColor = "#ec4899";
          }

          // Base dimensions for the tapered body
          const bodyWidth = cellSize * 0.22; 

          // Calculate precise local tangent vector at the head for tongue and eyes alignment
          const headDx = points[1].x - points[0].x;
          const headDy = points[1].y - points[0].y;
          const headLen = Math.sqrt(headDx*headDx + headDy*headDy) || 1;
          const headUx = headDx / headLen;
          const headUy = headDy / headLen;

          // Tongue vector (pointing forward along the local tangent)
          const tx = -headUx * (cellSize * 0.24);
          const ty = -headUy * (cellSize * 0.24);

          let tongueElement = null;
          if (isNeon) {
            tongueElement = <line x1={start.cx} y1={start.cy} x2={start.cx + tx} y2={start.cy + ty} stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />;
          } else if (isForest) {
            tongueElement = <circle cx={start.cx + tx * 0.7} cy={start.cy + ty * 0.7} r={cellSize * 0.025} fill="#4ade80" />;
          } else if (isSpace) {
            tongueElement = <line x1={start.cx} y1={start.cy} x2={start.cx + tx * 0.8} y2={start.cy + ty * 0.8} stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />;
          } else {
            tongueElement = (
              <g>
                <line x1={start.cx} y1={start.cy} x2={start.cx + tx} y2={start.cy + ty} stroke="#ef4444" strokeWidth="2.8" strokeLinecap="round" />
                <line x1={start.cx + tx} y1={start.cy + ty} x2={start.cx + tx - headUy * 4.5 - headUx * 2.5} y2={start.cy + ty + headUx * 4.5 - headUy * 2.5} stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
                <line x1={start.cx + tx} y1={start.cy + ty} x2={start.cx + tx + headUy * 4.5 - headUx * 2.5} y2={start.cy + ty - headUx * 4.5 - headUy * 2.5} stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
              </g>
            );
          }

          let headElement = null;
          if (isNeon) {
            headElement = (
              <g>
                <rect x={start.cx - bodyWidth * 0.8} y={start.cy - bodyWidth * 0.8} width={bodyWidth * 1.6} height={bodyWidth * 1.6} rx="2" fill="#0f172a" stroke="#22c55e" strokeWidth="1.8" />
                <circle cx={start.cx - headUy * 4.5 - headUx * 1.5} cy={start.cy + headUx * 4.5 - headUy * 1.5} r={cellSize * 0.045} fill="#4ade80" />
                <circle cx={start.cx + headUy * 4.5 - headUx * 1.5} cy={start.cy - headUx * 4.5 - headUy * 1.5} r={cellSize * 0.045} fill="#4ade80" />
              </g>
            );
          } else if (isForest) {
            headElement = (
              <g>
                <circle cx={start.cx} cy={start.cy} r={bodyWidth * 0.9} fill="#166534" stroke="#14532d" strokeWidth="1" />
                <circle cx={start.cx - headUy * 5.5 - headUx * 1.5} cy={start.cy + headUx * 5.5 - headUy * 1.5} r={cellSize * 0.05} fill="#ec4899" />
                <circle cx={start.cx - headUy * 5.5 - headUx * 1.5} cy={start.cy + headUx * 5.5 - headUy * 1.5} r={cellSize * 0.02} fill="#ffffff" />
                <circle cx={start.cx + headUy * 5.5 - headUx * 1.5} cy={start.cy - headUx * 5.5 - headUy * 1.5} r={cellSize * 0.05} fill="#ec4899" />
                <circle cx={start.cx + headUy * 5.5 - headUx * 1.5} cy={start.cy - headUx * 5.5 - headUy * 1.5} r={cellSize * 0.02} fill="#ffffff" />
              </g>
            );
          } else if (isSpace) {
            headElement = (
              <g>
                <circle cx={start.cx} cy={start.cy} r={bodyWidth * 0.85} fill="#a855f7" stroke="#ffffff" strokeWidth="1" opacity="0.85" />
                <circle cx={start.cx} cy={start.cy} r={bodyWidth * 0.5} fill="#ffffff" opacity="0.25" />
                <circle cx={start.cx - headUy * 5 - headUx * 1.5} cy={start.cy + headUx * 5 - headUy * 1.5} r={cellSize * 0.055} fill="#fef08a" />
                <circle cx={start.cx - headUy * 5 - headUx * 1.5} cy={start.cy + headUx * 5 - headUy * 1.5} r={cellSize * 0.02} fill="white" />
                <circle cx={start.cx + headUy * 5 - headUx * 1.5} cy={start.cy - headUx * 5 - headUy * 1.5} r={cellSize * 0.055} fill="#fef08a" />
                <circle cx={start.cx + headUy * 5 - headUx * 1.5} cy={start.cy - headUx * 5 - headUy * 1.5} r={cellSize * 0.02} fill="white" />
              </g>
            );
          } else {
            headElement = (
              <g>
                <circle cx={start.cx} cy={start.cy} r={bodyWidth * 0.8 + 1.5} fill="#1e293b" />
                <circle cx={start.cx} cy={start.cy} r={bodyWidth * 0.8} fill={baseColor} />
                <circle cx={start.cx - headUy * 5.5 - headUx * 1.5} cy={start.cy + headUx * 5.5 - headUy * 1.5} r={cellSize * 0.08} fill="white" stroke="#1e293b" strokeWidth="1.2" />
                <circle cx={start.cx + headUy * 5.5 - headUx * 1.5} cy={start.cy - headUx * 5.5 - headUy * 1.5} r={cellSize * 0.08} fill="white" stroke="#1e293b" strokeWidth="1.2" />
                <circle cx={start.cx - headUy * 4.5 - headUx * 2} cy={start.cy + headUx * 4.5 - headUy * 2} r={cellSize * 0.03} fill="black" />
                <circle cx={start.cx + headUy * 4.5 - headUx * 2} cy={start.cy - headUx * 4.5 - headUy * 2} r={cellSize * 0.03} fill="black" />
              </g>
            );
          }

          return (
            <g key={`snake-${idx}`} opacity="0.98">
              {/* Wireframe Matrix digital worm */}
              {isNeon && (
                <g>
                  {/* Outer scanline neon path */}
                  {points.map((p, pIdx) => {
                    if (pIdx >= numSteps) return null;
                    const nextP = points[pIdx + 1];
                    return (
                      <line
                        key={`neon-seg-${pIdx}`}
                        x1={p.x}
                        y1={p.y}
                        x2={nextP.x}
                        y2={nextP.y}
                        stroke="#22c55e"
                        strokeWidth={bodyWidth * 0.8}
                        strokeLinecap="round"
                        opacity="0.35"
                      />
                    );
                  })}
                  {/* Connect lines */}
                  {points.map((p, pIdx) => {
                    if (pIdx >= numSteps) return null;
                    const nextP = points[pIdx + 1];
                    return (
                      <line
                        key={`neon-seg-core-${pIdx}`}
                        x1={p.x}
                        y1={p.y}
                        x2={nextP.x}
                        y2={nextP.y}
                        stroke="#86efac"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  {/* Square Nodes */}
                  {points.map((p, pIdx) => {
                    if (pIdx % 3 !== 0) return null;
                    const t = pIdx / numSteps;
                    const width = cellSize * (0.12 - t * 0.08) + 1;
                    return (
                      <rect
                        key={`node-${pIdx}`}
                        x={p.x - width/2}
                        y={p.y - width/2}
                        width={width}
                        height={width}
                        fill="#0f172a"
                        stroke="#4ade80"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </g>
              )}

              {/* Jungle Ivy foliage leaf-snake */}
              {isForest && (
                <g>
                  {/* Underlay shadow */}
                  {points.map((p, pIdx) => {
                    if (pIdx % 3 !== 0) return null;
                    const t = pIdx / numSteps;
                    const radius = cellSize * (0.15 - t * 0.09) + 1;
                    const angle = (pIdx * 35) % 360;
                    return (
                      <path
                        key={`leaf-sh-${pIdx}`}
                        d={`M ${p.x + 2} ${p.y + 2 - radius} Q ${p.x + 2 + radius*1.4} ${p.y + 2} ${p.x + 2} ${p.y + 2 + radius} Q ${p.x + 2 - radius*1.4} ${p.y + 2} ${p.x + 2} ${p.y + 2 - radius}`}
                        fill="rgba(0,0,0,0.18)"
                      />
                    );
                  })}
                  {/* Leaf nodes */}
                  {points.map((p, pIdx) => {
                    if (pIdx % 3 !== 0) return null;
                    const t = pIdx / numSteps;
                    const radius = cellSize * (0.15 - t * 0.09);
                    const angle = (pIdx * 35) % 360;
                    return (
                      <path
                        key={`leaf-${pIdx}`}
                        d={`M ${p.x} ${p.y - radius} Q ${p.x + radius*1.4} ${p.y} ${p.x} ${p.y + radius} Q ${p.x - radius*1.4} ${p.y} ${p.x} ${p.y - radius}`}
                        fill="#15803d"
                        stroke="#166534"
                        strokeWidth="0.8"
                        transform={`rotate(${angle}, ${p.x}, ${p.y})`}
                      />
                    );
                  })}
                  {/* Leaf veins */}
                  {points.map((p, pIdx) => {
                    if (pIdx % 6 !== 0 || pIdx < 3 || pIdx > numSteps - 3) return null;
                    const t = pIdx / numSteps;
                    const radius = cellSize * (0.13 - t * 0.08);
                    const angle = (pIdx * 35) % 360;
                    return (
                      <line
                        key={`vein-${pIdx}`}
                        x1={p.x} y1={p.y - radius * 0.8}
                        x2={p.x} y2={p.y + radius * 0.8}
                        stroke="#4ade80"
                        strokeWidth="1.2"
                        transform={`rotate(${angle}, ${p.x}, ${p.y})`}
                      />
                    );
                  })}
                </g>
              )}

              {/* Cosmic Space Nebula gas worm */}
              {isSpace && (
                <g>
                  {/* Gas clouds */}
                  {points.map((p, pIdx) => {
                    const t = pIdx / numSteps;
                    const radius = cellSize * (0.18 - t * 0.11);
                    return (
                      <circle
                        key={`plasma-${pIdx}`}
                        cx={p.x}
                        cy={p.y}
                        r={radius}
                        fill={pIdx % 2 === 0 ? "#d946ef" : "#6366f1"}
                        opacity={0.35 + (1 - t) * 0.3}
                      />
                    );
                  })}
                  {/* Spine stardust sparks */}
                  {points.map((p, pIdx) => {
                    if (pIdx % 5 !== 0 || pIdx < 3 || pIdx > numSteps - 3) return null;
                    return (
                      <polygon
                        key={`star-${pIdx}`}
                        points={`${p.x},${p.y - 3} ${p.x + 1},${p.y - 1} ${p.x + 3},${p.y} ${p.x + 1},${p.y + 1} ${p.x},${p.y + 3} ${p.x - 1},${p.y + 1} ${p.x - 3},${p.y} ${p.x - 1},${p.y - 1}`}
                        fill="#ffffff"
                        opacity="0.9"
                      />
                    );
                  })}
                </g>
              )}

              {/* Classic / Default Tapered Green cartoon snake */}
              {!isNeon && !isForest && !isSpace && (
                <g>
                  {/* 1. 3D Drop Shadow */}
                  {points.map((p, pIdx) => {
                    const t = pIdx / numSteps;
                    const radius = cellSize * (0.13 - t * 0.08);
                    return (
                      <circle
                        key={`shadow-${pIdx}`}
                        cx={p.x + 2.5}
                        cy={p.y + 2.5}
                        r={radius}
                        fill="rgba(15, 23, 42, 0.18)"
                      />
                    );
                  })}
                  {/* 2. Body Outline */}
                  {points.map((p, pIdx) => {
                    const t = pIdx / numSteps;
                    const radius = cellSize * (0.13 - t * 0.08) + 1.5;
                    return (
                      <circle
                        key={`outline-${pIdx}`}
                        cx={p.x}
                        cy={p.y}
                        r={radius}
                        fill="#1e293b"
                      />
                    );
                  })}
                  {/* 3. Body Base */}
                  {points.map((p, pIdx) => {
                    const t = pIdx / numSteps;
                    const radius = cellSize * (0.13 - t * 0.08);
                    return (
                      <circle
                        key={`body-${pIdx}`}
                        cx={p.x}
                        cy={p.y}
                        r={radius}
                        fill={baseColor}
                      />
                    );
                  })}
                  {/* 4. Spots Pattern */}
                  {points.map((p, pIdx) => {
                    if (pIdx % 5 !== 0 || pIdx < 3 || pIdx > numSteps - 3) return null;
                    const t = pIdx / numSteps;
                    const bodyRadius = cellSize * (0.13 - t * 0.08);
                    const radius = bodyRadius * 0.45;
                    return (
                      <circle
                        key={`spot-${pIdx}`}
                        cx={p.x}
                        cy={p.y}
                        r={radius}
                        fill={patternColor}
                      />
                    );
                  })}
                  {/* 5. Spine Highlights */}
                  {points.map((p, pIdx) => {
                    const t = pIdx / numSteps;
                    const bodyRadius = cellSize * (0.13 - t * 0.08);
                    const radius = bodyRadius * 0.32;
                    return (
                      <circle
                        key={`highlight-${pIdx}`}
                        cx={p.x - bodyRadius * 0.15}
                        cy={p.y - bodyRadius * 0.15}
                        r={radius}
                        fill="rgba(255, 255, 255, 0.38)"
                      />
                    );
                  })}
                </g>
              )}

              {/* Head & Tongue Elements */}
              {tongueElement}
              {headElement}

              {/* Crown for owned snakes */}
              {ownerPlayer && (
                <text 
                  x={start.cx} 
                  y={start.cy - (cellSize * 0.42)} 
                  fontSize={cellSize * 0.45 + "px"} 
                  textAnchor="middle" 
                  style={{ userSelect: "none", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }}
                >
                  👑
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Draw Cell Numbers (Small top-right align, completely clean) */}
      {cells.map((cell) => {
        const { x, y } = getCoordinates(cell);
        const is100 = cell === 100;
        
        return (
          <div
            key={`cell-num-${cell}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: cellSize,
              height: cellSize,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end", // Align to top-right
              padding: "4px 6px 0 0", // Small padding from top and right
              boxSizing: "border-box",
              fontSize: cellSize * (is100 ? 0.22 : 0.25) + "px", // Small size
              color: config.cellTextColor, // Themed text color
              fontWeight: "900",
              fontFamily: "'Outfit', sans-serif",
              userSelect: "none",
              pointerEvents: "none",
              zIndex: 15
            }}
          >
            {is100 ? "🎉 100" : cell}
          </div>
        );
      })}

      {/* Dedicated Home Base Tray at the bottom */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 10 * cellSize,
          width: boardSize,
          height: cellSize * 1.3,
          background: config.homeTrayBg,
          borderTop: config.homeTrayBorder,
          borderRadius: "0 0 12px 12px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 8px",
          zIndex: 4
        }}
      >
        {/* Draw 4 gorgeous glowing player Home Pods */}
        {Array.from({ length: 4 }).map((_, idx) => {
          const player = players[idx];
          const hasPlayerAtHome = player && player.position === 0;

          return (
            <div
              key={`home-pod-${idx}`}
              style={{
                position: "relative",
                width: cellSize * 1.05,
                height: cellSize * 1.05,
                borderRadius: "50%",
                background: player ? `${player.color}18` : "rgba(255,255,255,0.02)",
                border: player ? `2px dashed ${player.color}bb` : "2.5px dashed rgba(255,255,255,0.06)",
                boxShadow: (player && hasPlayerAtHome) ? `0 0 15px ${player.color}44, inset 0 0 10px ${player.color}22` : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
              }}
            >
              {player && (
                <>
                  {/* Small lock icon if locked at home */}
                  {hasPlayerAtHome && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: player.color,
                        color: "white",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                        fontWeight: "bold",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.45)",
                        border: "1.5px solid white",
                        zIndex: 10
                      }}
                      title={`Locked! Rolls: ${player.unlockAttempts || 0}/5. Need a 6 to start!`}
                    >
                      🔒
                    </div>
                  )}

                  {/* Player Pod label */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-18px",
                      fontSize: "9.5px",
                      fontWeight: "bold",
                      color: player.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                      opacity: 0.9,
                      textShadow: "0 1px 3px rgba(0,0,0,0.8)"
                    }}
                  >
                    {player.name}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Player Pieces (Themed dynamic character tokens) */}
      {players.map((p, idx) => {
        const { cx, cy } = getCoordinates(p.position, idx);
        // Offset slightly if multiple players are on the same cell on the active board
        const offsetX = p.position > 0 ? (idx % 2 === 0 ? -1 : 1) * (cellSize * 0.15) : 0;
        const offsetY = p.position > 0 ? (idx < 2 ? -1 : 1) * (cellSize * 0.15) : 0;
        
        // Dynamic transition speed depending on the activity type
        let transitionStyle = "all 0.35s cubic-bezier(0.25, 1, 0.5, 1)"; // Continuous cell walking
        if (p.isClimbing) {
          transitionStyle = "all 0.9s cubic-bezier(0.45, 0, 0.55, 1)"; // Smooth slide up ladders
        } else if (p.isSwallowed) {
          transitionStyle = "all 1.0s cubic-bezier(0.36, 0.07, 0.19, 0.97)"; // Viscous swallow slide down snakes
        }

        // Dynamic keyframe animations for panic, swallow, climb, and walk
        let animationStyle = "none";
        if (p.isPanicking) {
          animationStyle = "cookie-panic-shake 0.15s infinite linear";
        } else if (p.isSwallowed) {
          animationStyle = "cookie-snake-slide 1.0s ease-in-out forwards";
        } else if (p.isClimbing) {
          animationStyle = "cookie-ladder-climb 0.4s infinite ease-in-out";
        } else if (p.isWalking) {
          animationStyle = "cookie-walk 0.35s infinite ease-in-out";
        }

        return (
          <div
            key={`player-${p.id}`}
            style={{
              position: "absolute",
              left: cx + offsetX - (cellSize * 0.4),
              top: cy + offsetY - (cellSize * 0.48),
              width: cellSize * 0.8,
              height: cellSize * 0.9,
              transition: transitionStyle,
              animation: animationStyle,
              zIndex: 20 + idx,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none"
            }}
          >
            {/* Dynamic theme-based player token matching player color */}
            <PlayerToken theme={theme} color={p.color} />

            {/* Small bot identifier indicator overlay */}
            {p.isBot && (
              <div
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  background: "#2563eb",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  border: "1px solid white",
                  zIndex: 30
                }}
              >
                🤖
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
