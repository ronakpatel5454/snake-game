import Premium3DDice from "./Premium3DDice";

export default function PlayerCornerCard({ player, isActive, isRolling, isDiceRolling, onRoll, theme }) {
  if (!player) return null;

  const playerColor = player.colorCode || player.color;
  const isLudo = player.position === undefined;
  const tokensHome = isLudo && player.tokens 
    ? player.tokens.filter(s => s === 56).length 
    : 0;

  return (
    <div
      className="glass"
      style={{
        padding: "0.75rem",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: isActive ? `2px solid ${playerColor}` : "1.5px solid var(--surface-light)",
        boxShadow: isActive ? `0 0 15px ${playerColor}44` : "none",
        transition: "all 0.3s ease",
        width: "120px",
        textAlign: "center",
        margin: "auto"
      }}
    >
      <div style={{
        fontWeight: "bold",
        fontSize: "0.85rem",
        color: playerColor,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100px",
        marginBottom: "0.25rem"
      }}>
        {player.name} {player.isBot && "🤖"}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
        {!isLudo ? `Pos: ${player.position}` : `Home: ${tokensHome} / ${player.tokens ? player.tokens.length : 4}`}
      </div>

      <div
        onClick={() => {
          if (isActive && !isRolling && !player.isBot) {
            onRoll();
          }
        }}
        style={{
          cursor: (isActive && !player.isBot) ? "pointer" : "default",
          transform: isActive ? "scale(1.05)" : "scale(0.95)",
          transition: "transform 0.2s"
        }}
      >
        <Premium3DDice
          value={player.lastRoll || 1}
          color={playerColor}
          isRolling={isActive && isDiceRolling}
          theme={theme}
        />
      </div>

      {isActive && !player.isBot ? (
        <div style={{
          fontSize: "0.75rem",
          fontWeight: "bold",
          color: playerColor,
          animation: "pulse 1.5s infinite",
          marginTop: "0.25rem",
          background: "rgba(255,255,255,0.08)",
          padding: "2px 8px",
          borderRadius: "12px",
          border: `1px solid ${playerColor}66`
        }}>
          🎯 Click Die to Roll!
        </div>
      ) : (
        <div style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: "0.25rem",
          padding: "2px 8px"
        }}>
          {isActive ? "Thinking..." : "Waiting"}
        </div>
      )}
    </div>
  );
}
