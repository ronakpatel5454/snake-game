// Extremely premium, highly stylized SVG cute boy cookie token
export function CuteBoyCookie({ color, size = "100%", style }) {
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

// Retro Arcade Cyberpunk Robot Token
export function CyberRobotToken({ color, size = "100%", style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: "drop-shadow(0px 3px 6px rgba(0, 242, 254, 0.45))",
        overflow: "visible",
        ...style
      }}
    >
      {/* Outer Glow / Silhouette */}
      <g stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95">
        <rect x="25" y="30" width="50" height="40" rx="10" />
        <circle cx="50" cy="18" r="4" />
        <line x1="50" y1="30" x2="50" y2="18" />
        <rect x="34" y="70" width="10" height="14" rx="3" />
        <rect x="56" y="70" width="10" height="14" rx="3" />
        <path d="M 25 50 Q 15 50 15 55 T 25 60" />
        <path d="M 75 50 Q 85 50 85 55 T 75 60" />
      </g>

      {/* Antenna */}
      <line x1="50" y1="30" x2="50" y2="18" stroke="#cbd5e1" strokeWidth="3" />
      <circle cx="50" cy="18" r="5" fill={color} stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="50" cy="18" r="2" fill="white" />

      {/* Ears / Side Bolts */}
      <rect x="20" y="42" width="6" height="16" rx="2" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="74" y="42" width="6" height="16" rx="2" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />

      {/* Main Screen Head / Body */}
      <rect x="25" y="30" width="50" height="40" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
      
      {/* Inner Screen */}
      <rect x="30" y="35" width="40" height="30" rx="6" fill="#0f172a" stroke={color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 5px ${color})` }} />

      {/* LED Eyes */}
      <circle cx="42" cy="46" r="4.5" fill={color} />
      <circle cx="42" cy="46" r="1.5" fill="white" />
      <circle cx="58" cy="46" r="4.5" fill={color} />
      <circle cx="58" cy="46" r="1.5" fill="white" />

      {/* Digital Smile */}
      <path d="M 40 56 Q 50 62 60 56" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Circuit lines on body/cheeks */}
      <line x1="33" y1="60" x2="37" y2="60" stroke="#475569" strokeWidth="1" />
      <line x1="63" y1="60" x2="67" y2="60" stroke="#475569" strokeWidth="1" />

      {/* Robot Legs / Treads */}
      <rect x="34" y="70" width="10" height="14" rx="3" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="56" y="70" width="10" height="14" rx="3" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />

      {/* Moving Gears or Stripes on legs */}
      <line x1="34" y1="74" x2="44" y2="74" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="34" y1="78" x2="44" y2="78" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="56" y1="74" x2="66" y2="74" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="56" y1="78" x2="66" y2="78" stroke="#0f172a" strokeWidth="1.5" />

      {/* Claw Hands */}
      <path d="M 25 50 Q 15 50 15 55 T 25 60" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      <path d="M 75 50 Q 85 50 85 55 T 75 60" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="15" cy="55" r="2.5" fill={color} />
      <circle cx="85" cy="55" r="2.5" fill={color} />
    </svg>
  );
}

// Woodland Fox Token
export function WoodlandFoxToken({ color, size = "100%", style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: "drop-shadow(0px 3px 5px rgba(120, 53, 15, 0.45))",
        overflow: "visible",
        ...style
      }}
    >
      {/* Outer Outline */}
      <g stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95">
        <path d="M 26 34 L 14 10 L 34 20 Z" />
        <path d="M 74 34 L 86 10 L 66 20 Z" />
        <circle cx="50" cy="46" r="28" />
        <path d="M 32 72 L 50 88 L 68 72 Z" />
      </g>

      {/* Left Ear */}
      <path d="M 26 34 L 14 10 L 34 20 Z" fill="#ea580c" stroke="#451a03" strokeWidth="1.5" />
      <path d="M 24 30 L 18 16 L 29 22 Z" fill="#ffedd5" />

      {/* Right Ear */}
      <path d="M 74 34 L 86 10 L 66 20 Z" fill="#ea580c" stroke="#451a03" strokeWidth="1.5" />
      <path d="M 76 30 L 82 16 L 71 22 Z" fill="#ffedd5" />

      {/* Fluffy Tail peeking out from behind */}
      <path d="M 68 64 Q 88 64 84 80 Q 72 88 62 76 Z" fill="#ea580c" stroke="#451a03" strokeWidth="1.5" />
      <path d="M 78 70 Q 86 70 82 80 L 72 74 Z" fill="white" />

      {/* Fox Face Main Circle */}
      <circle cx="50" cy="46" r="28" fill="#ea580c" stroke="#451a03" strokeWidth="1.5" />

      {/* White Cheek Fluff Overlay */}
      <path d="M 23 48 C 23 60, 36 72, 50 72 C 64 72, 77 60, 77 48 C 77 40, 70 42, 64 46 C 58 50, 50 50, 50 50 C 50 50, 42 50, 36 46 C 30 42, 23 40, 23 48 Z" fill="white" stroke="#451a03" strokeWidth="1" />

      {/* Rosy Blush */}
      <circle cx="34" cy="54" r="3.5" fill="#f43f5e" opacity="0.35" />
      <circle cx="66" cy="54" r="3.5" fill="#f43f5e" opacity="0.35" />

      {/* Innocent Big Eyes */}
      <circle cx="39" cy="46" r="4" fill="#271804" />
      <circle cx="37.5" cy="44.5" r="1.2" fill="white" />
      <circle cx="61" cy="46" r="4" fill="#271804" />
      <circle cx="59.5" cy="44.5" r="1.2" fill="white" />

      {/* Whiskers */}
      <line x1="26" y1="56" x2="16" y2="54" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="27" y1="60" x2="18" y2="60" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="74" y1="56" x2="84" y2="54" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="73" y1="60" x2="82" y2="60" stroke="#451a03" strokeWidth="1.2" strokeLinecap="round" />

      {/* Sweet Nose */}
      <polygon points="46,51 54,51 50,56" fill="#271804" stroke="#271804" strokeWidth="0.5" />
      
      {/* Tiny Smile lines */}
      <path d="M 48 57 Q 50 59 52 57" fill="none" stroke="#271804" strokeWidth="1.2" strokeLinecap="round" />

      {/* Fox Body Triangle */}
      <path d="M 32 72 L 50 88 L 68 72 Z" fill="#ea580c" stroke="#451a03" strokeWidth="1.5" strokeLinejoin="round" />
      {/* White Chest Patch */}
      <path d="M 42 72 L 50 84 L 58 72 Z" fill="white" />

      {/* Tiny Leaf Bow-tie / Collar matching Player color */}
      <g transform="translate(50, 72) scale(0.8)">
        <path d="M -8 -4 Q -15 -10 -5 -15 Q 0 -10 -8 -4" fill={color} stroke="#1e293b" strokeWidth="1.2" />
        <path d="M 8 -4 Q 15 -10 5 -15 Q 0 -10 8 -4" fill={color} stroke="#1e293b" strokeWidth="1.2" />
        <circle cx="0" cy="-8" r="3.5" fill="#fef08a" stroke="#1e293b" strokeWidth="1" />
      </g>
    </svg>
  );
}

// Cosmic NASA Astronaut Token
export function CosmicAstronautToken({ color, size = "100%", style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: "drop-shadow(0px 3px 6px rgba(168, 85, 247, 0.5))",
        overflow: "visible",
        ...style
      }}
    >
      {/* Outer Glow / Silhouette */}
      <g stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9">
        <circle cx="50" cy="36" r="22" />
        <rect x="26" y="58" width="48" height="26" rx="8" />
        <rect x="18" y="60" width="10" height="20" rx="3" />
        <rect x="72" y="60" width="10" height="20" rx="3" />
      </g>

      {/* Backpack behind astronaut */}
      <rect x="22" y="24" width="56" height="42" rx="10" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" />
      <rect x="26" y="28" width="8" height="34" rx="2" fill={color} />

      {/* Main spacesuit body */}
      <rect x="26" y="58" width="48" height="26" rx="8" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
      
      {/* Space Suit arm details */}
      <rect x="16" y="60" width="11" height="18" rx="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="73" y="60" width="11" height="18" rx="4" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="21.5" cy="78" r="4.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="78.5" cy="78" r="4.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />

      {/* NASA Badge / Stars on chest */}
      <circle cx="40" cy="68" r="3.5" fill="#3b82f6" />
      <polygon points="40,65 41,67 43,67 41.5,68 42,70 40,69 38,70 38.5,68 37,67 39,67" fill="#fef08a" />
      
      {/* Player Color Rank Stripes */}
      <rect x="52" y="66" width="12" height="2" fill={color} />
      <rect x="52" y="70" width="12" height="2" fill={color} />

      {/* Oxygen Hose / Cables */}
      <path d="M 32 76 Q 40 85 48 76" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

      {/* Helmet Round */}
      <circle cx="50" cy="36" r="22" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2" />

      {/* Visor Outer Frame */}
      <ellipse cx="50" cy="35" rx="17" ry="12" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

      {/* High-Gloss Golden Visor Coating with player color accents */}
      <ellipse cx="50" cy="35" rx="15" ry="10" fill="url(#gold-visor-gradient)" />
      
      {/* Visor Glare Reflex Lines */}
      <path d="M 39 31 Q 50 27 61 31" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <path d="M 42 34 Q 50 31 58 34" fill="none" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      
      {/* Visor star shine */}
      <g transform="translate(56, 36) scale(0.6)">
        <polygon points="10,0 12,7 19,7 13,11 15,18 10,13 5,18 7,11 1,7 8,7" fill="#ffffff" opacity="0.9" />
      </g>

      <defs>
        <radialGradient id="gold-visor-gradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="85%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Combined PlayerToken router component
export default function PlayerToken({ theme, color, size = "100%", style }) {
  if (theme === "neon") {
    return <CyberRobotToken color={color} size={size} style={style} />;
  } else if (theme === "forest") {
    return <WoodlandFoxToken color={color} size={size} style={style} />;
  } else if (theme === "space") {
    return <CosmicAstronautToken color={color} size={size} style={style} />;
  }
  return <CuteBoyCookie color={color} size={size} style={style} />;
}
