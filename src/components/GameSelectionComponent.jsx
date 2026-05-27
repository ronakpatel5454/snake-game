import React from "react";

export default function GameSelectionComponent({ onSelectGame, onShowGeneralRules }) {
  const games = [
    {
      id: "snake-ladder",
      title: "Snakes & Ladders 🎲",
      badge: "Snakes & Ladders",
      color: "var(--primary)",
      glow: "rgba(99, 102, 241, 0.35)",
      description: "Race to cell 100! Climb ladders to speed ahead, or slide down snakes. Features Classic, Own-Snake, Inverted, and Beast-Snakes with magical status effects!",
      icon: "🎲",
      rulesId: "classic"
    },
    {
      id: "ludo",
      title: "Ludo Classic 👑",
      badge: "Ludo Game",
      color: "var(--secondary)",
      glow: "rgba(236, 72, 153, 0.35)",
      description: "The classic strategy race! Unlock your tokens with a 6, kick rivals back to base, navigate safe zones, and race into the home triangle. Features Classic, Quick ⚡, and Master 👑 modes!",
      icon: "👑",
      rulesId: "ludo"
    }
  ];

  return (
    <div className="glass" style={{ maxWidth: "680px", width: "100%", padding: "2.5rem", borderRadius: "24px", marginTop: "2rem", textAlign: "center" }}>
      <h1 className="title-glow" style={{ fontSize: "2.8rem", marginBottom: "0.5rem" }}>Tabletop Arcade</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>Choose a tabletop board game to start your multiplayer or bot adventure!</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        {games.map((g) => (
          <div
            key={g.id}
            onClick={() => onSelectGame(g.id)}
            style={{
              padding: "1.75rem",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.03)",
              border: `1.5px solid rgba(255,255,255,0.05)`,
              cursor: "pointer",
              textAlign: "left",
              position: "relative",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = g.color;
              e.currentTarget.style.boxShadow = `0 10px 30px ${g.glow}`;
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Badges / Rules */}
            <div style={{
              position: "absolute",
              top: "1.75rem",
              right: "1.75rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center"
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowGeneralRules(g.rulesId);
                }}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-muted)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(el) => {
                  el.currentTarget.style.background = g.color;
                  el.currentTarget.style.color = "white";
                  el.currentTarget.style.borderColor = g.color;
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  el.currentTarget.style.color = "var(--text-muted)";
                  el.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                Rules 📖
              </button>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-muted)",
                padding: "4px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                {g.badge}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
              <div style={{
                fontSize: "2.2rem",
                width: "60px",
                height: "60px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {g.icon}
              </div>
              <div style={{ flex: 1, paddingRight: "6rem" }}>
                <h3 style={{ fontSize: "1.4rem", color: "white", marginBottom: "0.5rem", fontWeight: "bold" }}>
                  {g.title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  {g.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
