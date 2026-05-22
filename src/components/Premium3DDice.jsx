export default function Premium3DDice({ value, color, isRolling, theme }) {
  const val = value || 1;

  // 3D rotations to face each rolled side
  const getRotation = (num) => {
    switch (num) {
      case 1: return "rotateX(0deg) rotateY(0deg)";
      case 6: return "rotateX(180deg) rotateY(0deg)";
      case 4: return "rotateX(0deg) rotateY(90deg)";
      case 3: return "rotateX(0deg) rotateY(-90deg)";
      case 2: return "rotateX(-90deg) rotateY(0deg)";
      case 5: return "rotateX(90deg) rotateY(0deg)";
      default: return "rotateX(0deg) rotateY(0deg)";
    }
  };
  // Standard dice layout generator using perfectly centered CSS grid points
  const renderFaceDots = (num) => {
    let dots = [];
    if (num === 1) {
      dots = [{ row: 2, col: 2 }];
    } else if (num === 2) {
      dots = [{ row: 1, col: 1 }, { row: 3, col: 3 }];
    } else if (num === 3) {
      dots = [{ row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }];
    } else if (num === 4) {
      dots = [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }];
    } else if (num === 5) {
      dots = [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 3 }];
    } else if (num === 6) {
      dots = [
        { row: 1, col: 1 }, { row: 1, col: 3 },
        { row: 2, col: 1 }, { row: 2, col: 3 },
        { row: 3, col: 1 }, { row: 3, col: 3 }
      ];
    }

    const isNeon = theme === "neon";
    const isForest = theme === "forest";
    const isSpace = theme === "space";
    const isSakura = theme === "sakura";
    const isCandy = theme === "candy";

    let dotBg = "white";
    let dotShadow = "0 1px 2px rgba(0,0,0,0.4), inset 0 -1px 1px rgba(0,0,0,0.2)";
    let clipPath = undefined;
    let dotSize = "8px";
    let borderRadius = "50%";

    if (isNeon) {
      dotBg = color;
      dotShadow = `0 0 8px ${color}`;
    } else if (isForest) {
      dotBg = "#451a03";
      dotShadow = "inset 0 1px 1px rgba(0,0,0,0.6)";
    } else if (isSpace) {
      dotBg = "#fef08a"; // gold stardust
      dotShadow = "0 0 6px #fef08a";
      clipPath = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
      dotSize = "10px";
    } else if (isSakura) {
      dotBg = "linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)";
      dotShadow = "0 0 6px rgba(244, 63, 94, 0.6)";
      clipPath = "polygon(50% 0%, 80% 30%, 100% 60%, 80% 90%, 50% 100%, 20% 90%, 0% 60%, 20% 30%)"; // Cherry blossom petal shape
      dotSize = "11px";
    } else if (isCandy) {
      dotShadow = "0 0 6px rgba(56, 189, 248, 0.65)";
      borderRadius = "4px"; // Sprinkle capsule shape
      dotSize = "10px";
    }

    return (
      <div style={{
        display: "grid",
        gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
        width: "100%",
        height: "100%",
        padding: "6px",
        boxSizing: "border-box"
      }}>
        {dots.map((d, i) => {
          let customDotBg = dotBg;
          if (isCandy) {
            const candyColors = [
              "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)", // Blue
              "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)", // Orange/Yellow
              "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)", // Purple
              "linear-gradient(135deg, #f472b6 0%, #db2777 100%)", // Pink
              "linear-gradient(135deg, #34d399 0%, #059669 100%)", // Green
              "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)"  // Red
            ];
            customDotBg = candyColors[i % candyColors.length];
          }
          return (
            <div
              key={i}
              style={{
                gridRow: d.row,
                gridColumn: d.col,
                width: dotSize,
                height: dotSize,
                background: customDotBg,
                borderRadius: isSpace ? undefined : borderRadius,
                boxShadow: dotShadow,
                clipPath: clipPath,
                alignSelf: "center",
                justifySelf: "center"
              }}
            />
          );
        })}
      </div>
    );
  };

  let faceBg = color;
  let faceBorder = "1.5px solid rgba(15, 23, 42, 0.85)";
  let faceShadow = "inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.35), 0 3px 5px rgba(0,0,0,0.25)";

  if (theme === "neon") {
    faceBg = "#090d16";
    faceBorder = `2.5px solid ${color}`;
    faceShadow = `0 0 10px ${color}, inset 0 0 8px ${color}88`;
  } else if (theme === "forest") {
    faceBg = "linear-gradient(135deg, #d97706 0%, #b45309 100%)";
    faceBorder = "1.5px solid #78350f";
    faceShadow = "inset 0 2px 4px rgba(251, 191, 36, 0.2), inset 0 -2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)";
  } else if (theme === "space") {
    faceBg = `radial-gradient(circle, ${color}cc 0%, #1e1b4b ee 100%)`;
    faceBorder = "1.5px solid rgba(255, 255, 255, 0.6)";
    faceShadow = "0 0 12px rgba(255, 255, 255, 0.2), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.4)";
  } else if (theme === "sakura") {
    faceBg = "linear-gradient(135deg, #ffe4e6 0%, #fff1f2 100%)";
    faceBorder = "2px solid #fb7185";
    faceShadow = "0 0 10px rgba(244, 63, 94, 0.25), inset 0 2px 4px white, inset 0 -2px 4px rgba(244, 63, 94, 0.2)";
  } else if (theme === "candy") {
    faceBg = "linear-gradient(135deg, #db2777 0%, #701a75 100%)";
    faceBorder = "2.5px solid #f472b6";
    faceShadow = "0 0 12px rgba(244, 114, 182, 0.35), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.4)";
  }

  return (
    <div style={{
      width: "100px",
      height: "100px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      perspective: "600px",
      margin: "0.5rem 0"
    }}>
      <style>{`
        @keyframes dice-3d-spin {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(720deg) rotateY(1080deg) rotateZ(360deg); }
        }
        .dice-3d-cube {
          width: 50px;
          height: 50px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .dice-3d-cube.spinning {
          animation: dice-3d-spin 1.2s infinite linear;
        }
        .dice-3d-face {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 8px;
          backface-visibility: hidden;
        }
      `}</style>

      <div
        className={`dice-3d-cube ${isRolling ? "spinning" : ""}`}
        style={{
          transform: isRolling ? undefined : getRotation(val)
        }}
      >
        {/* Face 1 (Front) */}
        <div className="dice-3d-face" style={{ background: faceBg, border: faceBorder, boxShadow: faceShadow, transform: "rotateY(0deg) translateZ(25px)" }}>
          {renderFaceDots(1)}
        </div>
        {/* Face 6 (Back) */}
        <div className="dice-3d-face" style={{ background: faceBg, border: faceBorder, boxShadow: faceShadow, transform: "rotateY(180deg) translateZ(25px)" }}>
          {renderFaceDots(6)}
        </div>
        {/* Face 4 (Left) */}
        <div className="dice-3d-face" style={{ background: faceBg, border: faceBorder, boxShadow: faceShadow, transform: "rotateY(-90deg) translateZ(25px)" }}>
          {renderFaceDots(4)}
        </div>
        {/* Face 3 (Right) */}
        <div className="dice-3d-face" style={{ background: faceBg, border: faceBorder, boxShadow: faceShadow, transform: "rotateY(90deg) translateZ(25px)" }}>
          {renderFaceDots(3)}
        </div>
        {/* Face 2 (Top) */}
        <div className="dice-3d-face" style={{ background: faceBg, border: faceBorder, boxShadow: faceShadow, transform: "rotateX(90deg) translateZ(25px)" }}>
          {renderFaceDots(2)}
        </div>
        {/* Face 5 (Bottom) */}
        <div className="dice-3d-face" style={{ background: faceBg, border: faceBorder, boxShadow: faceShadow, transform: "rotateX(-90deg) translateZ(25px)" }}>
          {renderFaceDots(5)}
        </div>
      </div>
    </div>
  );
}
