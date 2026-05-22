export const THEME_CONFIGS = {
  classic: {
    boardBg: "var(--surface)",
    border: "3.5px solid var(--board-border)",
    cellBorder: "1.5px solid #1e293b",
    gridBands: [
      { isDark: "#c084fc", isLight: "#d8b4fe" }, // Purple band
      { isDark: "#f43f5e", isLight: "#fda4af" }, // Pink band
      { isDark: "#f97316", isLight: "#fed7aa" }, // Orange band
      { isDark: "#84cc16", isLight: "#bef264" }, // Lime Green band
      { isDark: "#06b6d4", isLight: "#67e8f9" }  // Cyan Blue band
    ],
    cellTextColor: "#1e293b",
    homeTrayBg: "linear-gradient(180deg, rgba(23, 37, 84, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)",
    homeTrayBorder: "3.5px solid var(--board-border)"
  },
  neon: {
    boardBg: "#020617",
    border: "3.5px solid #6366f1",
    cellBorder: "1.5px solid #1e1b4b",
    gridBands: [
      { isDark: "#090514", isLight: "#130b28" },
      { isDark: "#15050f", isLight: "#27081a" },
      { isDark: "#100803", isLight: "#251206" },
      { isDark: "#051003", isLight: "#0c2406" },
      { isDark: "#030e15", isLight: "#08212e" }
    ],
    cellTextColor: "#cbd5e1",
    homeTrayBg: "linear-gradient(180deg, #020617 0%, #030712 100%)",
    homeTrayBorder: "3.5px solid #6366f1",
    glow: "0 0 25px rgba(99, 102, 241, 0.35)"
  },
  forest: {
    boardBg: "#0f172a",
    border: "3.5px solid #78350f",
    cellBorder: "1.5px solid #3f2305",
    gridBands: [
      { isDark: "#14532d", isLight: "#22c55e" },
      { isDark: "#164e63", isLight: "#06b6d4" },
      { isDark: "#7c2d12", isLight: "#ea580c" },
      { isDark: "#713f12", isLight: "#ca8a04" },
      { isDark: "#3f2305", isLight: "#854d0e" }
    ],
    cellTextColor: "#fef3c7",
    homeTrayBg: "linear-gradient(180deg, #1e3a2f 0%, #0c1a14 100%)",
    homeTrayBorder: "3.5px solid #78350f"
  },
  space: {
    boardBg: "#03001e",
    border: "3.5px solid #a855f7",
    cellBorder: "1.5px solid #2e1065",
    gridBands: [
      { isDark: "#0a0015", isLight: "#1a0833" },
      { isDark: "#180018", isLight: "#350835" },
      { isDark: "#001018", isLight: "#082838" },
      { isDark: "#180800", isLight: "#351508" },
      { isDark: "#00150a", isLight: "#08331a" }
    ],
    cellTextColor: "#f3e8ff",
    homeTrayBg: "radial-gradient(circle at center, #1e1b4b 0%, #03001e 100%)",
    homeTrayBorder: "3.5px solid #a855f7",
    glow: "0 0 25px rgba(168, 85, 247, 0.35)"
  }
};
