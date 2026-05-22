import React, { useState, useEffect } from "react";

export default function RulesModal({ isOpen, onClose, defaultMode = "classic" }) {
  const [activeTab, setActiveTab] = useState(defaultMode);

  useEffect(() => {
    if (isOpen && defaultMode) {
      setActiveTab(defaultMode);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const tabs = [
    {
      id: "classic",
      title: "Classic Mode 🎲",
      color: "var(--p2-color)",
      glow: "rgba(59, 130, 246, 0.3)"
    },
    {
      id: "own-snake",
      title: "Own-Snake 👑",
      color: "var(--p4-color)",
      glow: "rgba(245, 158, 11, 0.3)"
    },
    {
      id: "negative-snake",
      title: "Negative Snake 🐍",
      color: "var(--p3-color)",
      glow: "rgba(16, 185, 129, 0.3)"
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "classic":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", borderLeft: "4px solid var(--p2-color)", padding: "1rem", borderRadius: "8px" }}>
              <strong style={{ color: "white", fontSize: "1.05rem" }}>The Traditional Race to the Top</strong>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                Roll the dice, race your opponents, and climb your way to victory in the ultimate board game classic.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", color: "var(--text-main)", fontSize: "0.95rem" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--p2-color)" }}>🎯</span>
                <div>
                  <strong>Goal:</strong> Be the first player to land exactly on cell <strong>100</strong>. If your roll exceeds 100, you stay in place.
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--p1-color)" }}>🐍</span>
                <div>
                  <strong>Snakes (Hazard):</strong> If you land on a snake's head (red/colored circles with fangs), you slide down to its tail (a lower cell).
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--p3-color)" }}>🪜</span>
                <div>
                  <strong>Ladders (Shortcut):</strong> If you land on the bottom of a ladder, you automatically climb to the top (a higher cell).
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--accent)" }}>🎲</span>
                <div>
                  <strong>Roll Rules:</strong> Roll a <strong>6</strong> to unlock your token and move onto cell 1 from the starting zone! Rolling a 6 also awards an extra roll!
                </div>
              </div>
            </div>
          </div>
        );

      case "own-snake":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "rgba(245, 158, 11, 0.1)", borderLeft: "4px solid var(--p4-color)", padding: "1rem", borderRadius: "8px" }}>
              <strong style={{ color: "white", fontSize: "1.05rem" }}>Strategic Private Immunity</strong>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                Each player custom-deploys a private immune snake head onto the board. Land on yours for safety, or trap rivals!
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", color: "var(--text-main)", fontSize: "0.95rem" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--p4-color)" }}>👑</span>
                <div>
                  <strong>Setup Phase:</strong> At the start of the game, every player selects a cell to place their personal immune snake mouth (represented by their color and initial).
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "#10b981" }}>🛡️</span>
                <div>
                  <strong>Snake Immunity:</strong> If you land on your <strong>own</strong> snake mouth cell, you are completely safe! You do NOT slide down!
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "#ef4444" }}>☠️</span>
                <div>
                  <strong>Rival Penalty:</strong> If any opponent lands on your immune snake cell, they are swallowed and slide down to the tail!
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--accent)" }}>🧠</span>
                <div>
                  <strong>Tactic:</strong> Place your snake mouth strategically near high-traffic cells or right after standard ladders to block others!
                </div>
              </div>
            </div>
          </div>
        );

      case "negative-snake":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", borderLeft: "4px solid var(--p3-color)", padding: "1rem", borderRadius: "8px" }}>
              <strong style={{ color: "white", fontSize: "1.05rem" }}>Gravity Inverted Inversion</strong>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                A completely inverted tabletop logic! Snakes swallow you UP, and ladders pull you DOWN!
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", color: "var(--text-main)", fontSize: "0.95rem" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--p3-color)" }}>🐍⬆️</span>
                <div>
                  <strong>Negative Snakes (Helper):</strong> Snakes now start at a <strong>lower cell</strong> and end at a <strong>higher cell</strong>. Land on the mouth to be swallowed and pushed UP (e.g., land on 20, go UP to 87)!
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--p1-color)" }}>🪜⬇️</span>
                <div>
                  <strong>Negative Ladders (Hazard):</strong> Ladders now start at a <strong>higher cell</strong> and end at a <strong>lower cell</strong>. Land on the ladder base (at the top/higher number, e.g. 74) to slide DOWN to the bottom (25)!
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem", color: "var(--accent)" }}>🔄</span>
                <div>
                  <strong>Inverted Strategy:</strong> Avoid ladders at all costs and aim specifically for the snakes to blast past your opponents!
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(2, 6, 23, 0.8)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "1.5rem",
      animation: "fadeIn 0.25s ease-out"
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div 
        className="glass" 
        style={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: "24px",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px ${tabs.find(t => t.id === activeTab)?.glow || "rgba(255,255,255,0.05)"}`,
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transition: "box-shadow 0.3s ease",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            color: "var(--text-main)",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
            e.currentTarget.style.transform = "rotate(90deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.transform = "none";
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: "left" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "white", marginBottom: "0.25rem", background: "linear-gradient(to right, white, var(--text-muted))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Game Rules & Modes
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Learn about dynamic game rules, custom features, and inversions.</p>
        </div>

        {/* Tab Headers */}
        <div style={{
          display: "flex",
          gap: "6px",
          background: "rgba(255,255,255,0.03)",
          padding: "4px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "10px 6px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? "bold" : "500",
                  cursor: "pointer",
                  border: "none",
                  background: isSelected ? tab.color : "transparent",
                  color: isSelected ? "white" : "var(--text-muted)",
                  boxShadow: isSelected ? `0 4px 12px ${tab.glow}` : "none",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
              >
                {tab.title}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content Area */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "16px",
          padding: "1.25rem",
          textAlign: "left",
          minHeight: "200px"
        }}>
          {renderContent()}
        </div>

        {/* Footer Close Button */}
        <button
          className="btn"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${tabs.find(t => t.id === activeTab)?.color || "var(--primary)"}, var(--secondary))`,
            boxShadow: `0 4px 15px ${tabs.find(t => t.id === activeTab)?.glow || "rgba(0,0,0,0.15)"}`
          }}
        >
          Let's Play! 🚀
        </button>
      </div>
    </div>
  );
}
