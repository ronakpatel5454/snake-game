import { GAME_MODES } from "../config/gameModes";

export default function ModeSelectionComponent({ onSelectMode, onShowRules, onBack }) {
  return (
    <div className="glass" style={{ maxWidth: "600px", width: "100%", padding: "2.5rem", borderRadius: "24px", marginTop: "2rem", textAlign: "center" }}>
      <h1 className="title-glow" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Select Game Mode</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Choose a game variation to start your tabletop adventure!</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {GAME_MODES.map((m) => (
          <div
            key={m.id}
            onClick={() => {
              if (m.active) {
                onSelectMode(m.id);
              }
            }}
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              background: m.active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
              border: m.active ? "1.5px solid var(--p1-color)" : "1.5px solid rgba(255,255,255,0.05)",
              boxShadow: m.active ? "0 4px 20px rgba(244, 63, 94, 0.15)" : "none",
              cursor: m.active ? "pointer" : "not-allowed",
              textAlign: "left",
              position: "relative",
              transition: "all 0.3s ease",
              opacity: m.active ? 1 : 0.6
            }}
            className={m.active ? "hover-scale" : ""}
          >
            {/* Status & Rules Badges */}
            <div style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center"
            }}>
              {m.active && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid selecting the mode
                    onShowRules(m.id);
                  }}
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "var(--primary)",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(el) => {
                    el.currentTarget.style.background = "rgba(99, 102, 241, 0.3)";
                    el.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(el) => {
                    el.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
                    el.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Rules 📖
                </button>
              )}
              <span style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                background: m.active ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.08)",
                color: m.active ? "#10b981" : "var(--text-muted)",
                padding: "4px 10px",
                borderRadius: "12px",
                border: m.active ? "1px solid #10b98166" : "1px solid rgba(255,255,255,0.1)"
              }}>
                {m.badge}
              </span>
            </div>

            <h3 style={{ fontSize: "1.25rem", color: m.active ? "white" : "var(--text-muted)", marginBottom: "0.5rem" }}>
              {m.title}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", paddingRight: "7.5rem", lineHeight: "1.4" }}>
              {m.description}
            </p>
          </div>
        ))}
      </div>

      {onBack && (
        <button 
          className="btn btn-outline" 
          style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", marginTop: "1.25rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", background: "transparent", cursor: "pointer" }} 
          onClick={onBack}
        >
          ← Back to Game Selection
        </button>
      )}
    </div>
  );
}

