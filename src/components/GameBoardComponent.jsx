import { useEffect, useRef, useState } from "react";

export default function GameBoardComponent({ board, players }) {
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

  const getCoordinates = (cell) => {
    if (cell === 0) {
      // Home position, below the board
      return {
        x: -cellSize,
        y: 10 * cellSize,
        cx: cellSize * 0.5,
        cy: 10.5 * cellSize,
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
        aspectRatio: "1/1",
        position: "relative",
        background: "var(--surface)",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        border: "2px solid var(--board-border)"
      }}
    >
      {/* Draw Cells */}
      {cells.map((cell) => {
        const { x, y } = getCoordinates(cell);
        const isEven = (Math.floor((cell - 1) / 10) + ((cell - 1) % 10)) % 2 === 0;
        
        return (
          <div
            key={`cell-${cell}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: cellSize,
              height: cellSize,
              background: isEven ? "var(--board-light)" : "var(--board-dark)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              padding: "4px",
              fontSize: cellSize * 0.25 + "px",
              color: "rgba(0,0,0,0.5)",
              fontWeight: "bold",
            }}
          >
            {cell}
          </div>
        );
      })}

      {/* Highlight Owned Snake Heads */}
      {players.map(p => {
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
              border: `2px solid ${p.color}`,
              pointerEvents: "none",
              zIndex: 5
            }}
          />
        );
      })}

      {/* Draw Snakes and Ladders using SVG */}
      <svg 
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }}
      >
        {/* Ladders */}
        {board.ladders.map((ladder, idx) => {
          const start = getCoordinates(ladder.bottom);
          const end = getCoordinates(ladder.top);
          return (
            <line
              key={`ladder-${idx}`}
              x1={start.cx}
              y1={start.cy}
              x2={end.cx}
              y2={end.cy}
              stroke="#8b5cf6"
              strokeWidth={cellSize * 0.3}
              strokeDasharray="4 8"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        })}

        {/* Snakes */}
        {board.snakes.map((snake, idx) => {
          const start = getCoordinates(snake.head);
          const end = getCoordinates(snake.tail);
          
          // Deterministic curve offset logic based on cells to prevent wiggling/jittering
          const offsetSeed = ((snake.head * 7 + snake.tail * 13) % 40) - 20;
          const midX = (start.cx + end.cx) / 2 + offsetSeed;
          const midY = (start.cy + end.cy) / 2;

          // Find if this snake is owned by any player
          const ownerPlayer = players.find(p => p.ownSnakeNumber === snake.head);
          const strokeColor = ownerPlayer ? ownerPlayer.color : "#f97316";
          const headColor = ownerPlayer ? ownerPlayer.color : "#ea580c";

          return (
            <g key={`snake-${idx}`}>
              <path
                d={`M ${start.cx} ${start.cy} Q ${midX} ${midY} ${end.cx} ${end.cy}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={cellSize * 0.15}
                strokeLinecap="round"
                opacity="0.9"
              />
              {/* Snake Head */}
              <circle cx={start.cx} cy={start.cy} r={cellSize * 0.15} fill={headColor} />
              <circle cx={start.cx - 3} cy={start.cy - 3} r={cellSize * 0.03} fill="white" />
              <circle cx={start.cx + 3} cy={start.cy - 3} r={cellSize * 0.03} fill="white" />
              {/* Tiny crown label for owned snakes */}
              {ownerPlayer && (
                <text 
                  x={start.cx} 
                  y={start.cy - (cellSize * 0.18)} 
                  fontSize={cellSize * 0.3 + "px"} 
                  textAnchor="middle" 
                  style={{ userSelect: "none" }}
                >
                  👑
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Player Pieces */}
      {players.map((p, idx) => {
        const { cx, cy } = getCoordinates(p.position);
        // Offset slightly if multiple players on same cell
        const offsetX = (idx % 2 === 0 ? -1 : 1) * (cellSize * 0.15);
        const offsetY = (idx < 2 ? -1 : 1) * (cellSize * 0.15);
        
        return (
          <div
            key={`player-${p.id}`}
            style={{
              position: "absolute",
              left: cx + offsetX - (cellSize * 0.25),
              top: cy + offsetY - (cellSize * 0.25),
              width: cellSize * 0.5,
              height: cellSize * 0.5,
              borderRadius: "50%",
              background: p.color,
              border: "2px solid white",
              boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
              transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 20 + idx,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: cellSize * 0.2 + "px",
            }}
          >
            {p.isBot ? "🤖" : ""}
          </div>
        );
      })}
    </div>
  );
}
