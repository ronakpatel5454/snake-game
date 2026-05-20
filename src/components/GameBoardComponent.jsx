import { useEffect, useRef, useState } from "react";

// Extremely premium, highly stylized SVG cute boy cookie token
function CuteBoyCookie({ color, size = "100%", style }) {
  const clipId = `tshirt-clip-${color.replace('#', '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: "drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.45))",
        overflow: "visible",
        ...style
      }}
    >
      <defs>
        {/* T-shirt clip path to ensure horizontal stripes align perfectly within the shirt boundaries */}
        <clipPath id={clipId}>
          <path d="M 32 44 L 68 44 L 68 68 L 32 68 Z" />
        </clipPath>
      </defs>

      {/* Outer Glow / Silhouette Outline to make the cookie piece pop like a physical board game token */}
      <g stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95">
        <circle cx="50" cy="30" r="14" />
        <path d="M 32 28 C 30 18, 38 10, 50 11 C 62 10, 70 18, 68 28 C 72 23, 71 16, 64 12 C 58 8, 42 8, 36 12 C 29 16, 28 23, 32 28 Z" />
        <path d="M 32 44 L 68 44 L 68 68 L 32 68 Z" />
        <path d="M 32 44 L 20 54 L 27 59 L 32 52" />
        <path d="M 68 44 L 80 54 L 73 59 L 68 52" />
        <path d="M 32 68 L 68 68 L 68 80 L 51 80 L 51 73 L 49 73 L 49 80 L 32 80 Z" />
        <ellipse cx="38" cy="90" rx="8" ry="4.5" />
        <ellipse cx="62" cy="90" rx="8" ry="4.5" />
      </g>

      {/* Left and Right Ears */}
      <circle cx="34" cy="31" r="3.5" fill="#ffd7ba" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="66" cy="31" r="3.5" fill="#ffd7ba" stroke="#1e293b" strokeWidth="1.5" />

      {/* Face Base */}
      <circle cx="50" cy="31" r="14" fill="#ffe3e0" stroke="#1e293b" strokeWidth="1.5" />

      {/* Rosy blush on cheeks */}
      <circle cx="41" cy="34" r="2.5" fill="#f43f5e" opacity="0.4" />
      <circle cx="59" cy="34" r="2.5" fill="#f43f5e" opacity="0.4" />

      {/* Expressive big brown eyes */}
      <ellipse cx="44" cy="29" rx="3.2" ry="4.8" fill="#3f2305" />
      <ellipse cx="56" cy="29" rx="3.2" ry="4.8" fill="#3f2305" />
      {/* High-glossy pupil reflection dots */}
      <circle cx="42.5" cy="27" r="1" fill="white" />
      <circle cx="54.5" cy="27" r="1" fill="white" />
      <circle cx="45" cy="31" r="0.5" fill="white" />
      <circle cx="57.5" cy="31" r="0.5" fill="white" />

      {/* Sweet smile */}
      <path d="M 46 36 Q 50 39.5 54 36" fill="none" stroke="#3f2305" strokeWidth="1.6" strokeLinecap="round" />

      {/* Cute Eyebrows */}
      <path d="M 38 23.5 Q 43 21 46 23.5" fill="none" stroke="#5c3f15" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 62 23.5 Q 57 21 54 23.5" fill="none" stroke="#5c3f15" strokeWidth="1.5" strokeLinecap="round" />

      {/* Premium Brown Swooping Hair */}
      <path
        d="M 32 28 C 30 18, 38 10, 50 11 C 62 10, 70 18, 68 28 C 72 23, 71 16, 64 12 C 58 8, 42 8, 36 12 C 29 16, 28 23, 32 28 Z"
        fill="#5c3f15"
        stroke="#271804"
        strokeWidth="1.5"
      />
      {/* Styled Hair Fringe overlapping the forehead */}
      <path
        d="M 35 24 Q 44 22 47 27 Q 52 18 57 26 Q 64 22 65 25 Q 68 18 55 13 Q 32 16 35 24 Z"
        fill="#855a29"
        stroke="#271804"
        strokeWidth="1.2"
      />

      {/* T-Shirt Body */}
      <path d="M 32 44 L 68 44 L 68 68 L 32 68 Z" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      
      {/* Striped Pattern overlay inside the shirt */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="30" y="44" width="40" height="4.5" fill={color} />
        <rect x="30" y="53.5" width="40" height="4.5" fill={color} />
        <rect x="30" y="63" width="40" height="4.5" fill={color} />
      </g>

      {/* T-Shirt Sleeves */}
      <path d="M 32 44 L 20 54 L 27 59 L 32 52 Z" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M 32 44 L 20 54 L 24 57 Z" fill={color} />

      <path d="M 68 44 L 80 54 L 73 59 L 68 52 Z" fill="white" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M 68 44 L 80 54 L 76 57 Z" fill={color} />

      {/* Cute Brown Pocket with golden stitch details */}
      <path
        d="M 55 50 L 62 50 L 62 56 Q 58.5 59 55 56 Z"
        fill="#a16207"
        stroke="#451a03"
        strokeWidth="1.2"
      />
      <path
        d="M 56 51 L 61 51 L 61 55 Q 58.5 57 56 55 Z"
        fill="none"
        stroke="#fef08a"
        strokeWidth="0.8"
        strokeDasharray="1 0.8"
      />

      {/* Cute small hands */}
      <circle cx="21" cy="58" r="3.2" fill="#ffe3e0" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="79" cy="58" r="3.2" fill="#ffe3e0" stroke="#1e293b" strokeWidth="1.5" />

      {/* Blue Denim Shorts */}
      <path
        d="M 32 68 L 68 68 L 68 80 L 51 80 L 51 73 L 49 73 L 49 80 L 32 80 Z"
        fill="#1e40af"
        stroke="#1e293b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Stitching and rips detail on denim shorts */}
      <line x1="32" y1="71" x2="68" y2="71" stroke="#172554" strokeWidth="1" strokeDasharray="1.5 1.5" />
      <line x1="36" y1="75" x2="43" y2="75" stroke="#93c5fd" strokeWidth="1.2" />
      <line x1="57" y1="76" x2="64" y2="76" stroke="#93c5fd" strokeWidth="1.2" />

      {/* Legs */}
      <rect x="37" y="80" width="6" height="8.5" fill="#ffe3e0" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="57" y="80" width="6" height="8.5" fill="#ffe3e0" stroke="#1e293b" strokeWidth="1.5" />

      {/* Colorful Sneakers matching the player color */}
      <g>
        {/* Left Shoe */}
        <path
          d="M 30 92.5 C 30 87, 44 87, 44 92.5 Q 44 94, 37 94 C 33 94, 30 94, 30 92.5 Z"
          fill={color}
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        <path d="M 30 92.5 L 44 92.5 Q 44 94, 37 94 C 33 94, 30 94, 30 92.5 Z" fill="white" stroke="#1e293b" strokeWidth="1" />
        
        {/* Right Shoe */}
        <path
          d="M 56 92.5 C 56 87, 70 87, 70 92.5 Q 70 94, 63 94 C 59 94, 56 94, 56 92.5 Z"
          fill={color}
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        <path d="M 56 92.5 L 70 92.5 Q 70 94, 63 94 C 59 94, 56 94, 56 92.5 Z" fill="white" stroke="#1e293b" strokeWidth="1" />
      </g>
    </svg>
  );
}

export default function GameBoardComponent({ board, players, gameMode }) {
  const containerRef = useRef(null);
  const [boardSize, setBoardSize] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setBoardSize(Math.min(width, 600)); // max 600px
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: "100%", 
        maxWidth: "600px", 
        height: boardSize + cellSize * 1.3, // Allocates precise vertical space for Grid (10 rows) + Home Tray (1.3 rows)
        position: "relative",
        background: "var(--surface)",
        borderRadius: "16px",
        overflow: "visible", // Allows white token outlines and home pods to render cleanly without clipping
        boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
        border: "3.5px solid var(--board-border)",
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

        let cellBg = "";
        if (band === 0) {
          cellBg = isDark ? "#c084fc" : "#d8b4fe"; // Purple band
        } else if (band === 1) {
          cellBg = isDark ? "#f43f5e" : "#fda4af"; // Pink band
        } else if (band === 2) {
          cellBg = isDark ? "#f97316" : "#fed7aa"; // Orange band
        } else if (band === 3) {
          cellBg = isDark ? "#84cc16" : "#bef264"; // Lime Green band
        } else {
          cellBg = isDark ? "#06b6d4" : "#67e8f9"; // Cyan Blue band
        }
        
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
              border: "1.5px solid #1e293b", // Clean solid borders
              boxSizing: "border-box",
              zIndex: 1
            }}
          />
        );
      })}

      {/* Highlight Owned Snake Heads */}
      {gameMode !== "classic" && players.map(p => {
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
        {/* Ladders (Thin, toy blue rails with red rungs) */}
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
              y2: cy - ny * railOffset
            });
          }

          const railWidth = cellSize * 0.05; // Thin rails
          const rungWidth = cellSize * 0.03; // Thin rungs

          return (
            <g key={`ladder-${idx}`} opacity="0.85">
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

          // Generate a beautifully curved serpentine path using smooth waves and a taper envelope.
          // This keeps the frequency low (1.2 to 1.8) and ensures the wave ends exactly at 0 at both head and tail.
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
          const ownerPlayer = gameMode !== "classic" ? players.find(p => p.ownSnakeNumber === snake.head) : null;

          // Curated colors matching owner colors or a vibrant classic green
          const baseColor = ownerPlayer ? ownerPlayer.color : "#22c55e"; 
          const patternColor = ownerPlayer ? "white" : "#15803d"; 

          // Base dimensions for the 3D-cylindrical, tapered body
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

          return (
            <g key={`snake-${idx}`} opacity="0.98">
              {/* 1. 3D Drop Shadow offset using translated circles */}
              {points.map((p, pIdx) => {
                const t = pIdx / numSteps;
                // Taper shadow radius smoothly from head to tail
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

              {/* 2. Snake Body Outline for crisp separation */}
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

              {/* 3. Snake Body Base */}
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

              {/* 4. Pattern Overlay (Premium rounded spots winding along body, matching the taper) */}
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

              {/* 5. Glossy Spine Highlight for 3D rounded glassy effect */}
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

              {/* Cute Red Forked Tongue */}
              <g>
                <line x1={start.cx} y1={start.cy} x2={start.cx + tx} y2={start.cy + ty} stroke="#ef4444" strokeWidth="2.8" strokeLinecap="round" />
                <line x1={start.cx + tx} y1={start.cy + ty} x2={start.cx + tx - headUy * 4.5 - headUx * 2.5} y2={start.cy + ty + headUx * 4.5 - headUy * 2.5} stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
                <line x1={start.cx + tx} y1={start.cy + ty} x2={start.cx + tx + headUy * 4.5 - headUx * 2.5} y2={start.cy + ty - headUx * 4.5 - headUy * 2.5} stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
              </g>

              {/* Snake Head Outline */}
              <circle cx={start.cx} cy={start.cy} r={bodyWidth * 0.8 + 1.5} fill="#1e293b" />
              {/* Snake Head Base */}
              <circle cx={start.cx} cy={start.cy} r={bodyWidth * 0.8} fill={baseColor} />

              {/* High-quality Cartoon Eyes */}
              <circle cx={start.cx - headUy * 5.5 - headUx * 1.5} cy={start.cy + headUx * 5.5 - headUy * 1.5} r={cellSize * 0.08} fill="white" stroke="#1e293b" strokeWidth="1.2" />
              <circle cx={start.cx + headUy * 5.5 - headUx * 1.5} cy={start.cy - headUx * 5.5 - headUy * 1.5} r={cellSize * 0.08} fill="white" stroke="#1e293b" strokeWidth="1.2" />
              <circle cx={start.cx - headUy * 4.5 - headUx * 2} cy={start.cy + headUx * 4.5 - headUy * 2} r={cellSize * 0.03} fill="black" />
              <circle cx={start.cx + headUy * 4.5 - headUx * 2} cy={start.cy - headUx * 4.5 - headUy * 2} r={cellSize * 0.03} fill="black" />

              {/* Tiny crown label for owned snakes */}
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
              color: "#1e293b", // Clean slate black text
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
          background: "linear-gradient(180deg, rgba(23, 37, 84, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)",
          borderTop: "3.5px solid var(--board-border)",
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

      {/* Player Pieces (Cute cartoon boy cookies) */}
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
            {/* Extremely detailed and cute boy cookie character token matching player color */}
            <CuteBoyCookie color={p.color} />

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
