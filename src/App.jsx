import { useState, useEffect, useRef, Component } from "react";

// --- Error Boundary: catches React render crashes and shows error instead of blank page ---
class LudoErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("[Ludo] Render error caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="glass" style={{ maxWidth: "600px", width: "100%", padding: "2rem", borderRadius: "16px", textAlign: "center", marginTop: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>Game Error</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            className="btn"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
          >
            Back to Game Selection 🏠
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import GameBoardComponent from "./components/GameBoardComponent";
import LobbyComponent from "./components/LobbyComponent";
import { generateBoard, rollDice, calculateNewPosition, shuffleSnakes, shuffleBoardElements } from "./lib/gameLogic.js";
import { supabase } from "./lib/supabase";
import PlayerCornerCard from "./components/PlayerCornerCard";
import ModeSelectionComponent from "./components/ModeSelectionComponent";
import Premium3DDice from "./components/Premium3DDice";
import { THEME_CONFIGS } from "./config/themeConfigs";
import RulesModal from "./components/RulesModal";
import GameSelectionComponent from "./components/GameSelectionComponent";
import LudoLobbyComponent from "./components/LudoLobbyComponent";
import LudoBoardComponent from "./components/LudoBoardComponent";
import { getLegalMoves, executeLudoMove, getBotAIMove, START_CELL_INDICES, SAFE_TRACK_INDICES } from "./lib/ludoLogic";
import { 
  playDiceRollSound, 
  playMoveSound, 
  playSnakeBiteSound, 
  playLadderSound, 
  playSixSound, 
  playClashSound, 
  playVictorySound, 
  toggleMute, 
  getMutedState 
} from "./lib/soundEffects";

const getClientPlayerId = () => {
  let id = localStorage.getItem("snake_game_client_player_id");
  if (!id) {
    id = "player_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("snake_game_client_player_id", id);
  }
  return id;
};


export default function App() {
  const [isSoundMuted, setIsSoundMuted] = useState(() => getMutedState());
  const handleToggleMute = () => {
    const newState = toggleMute();
    setIsSoundMuted(newState);
  };

  const [inGame, setInGame] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_inGame");
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });

  // --- Game Selection Portal ---
  const [activeGame, setActiveGame] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_activeGame");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // --- Ludo Game States ---
  const [ludoPlayers, setLudoPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoPlayers");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [ludoCurrentTurnIndex, setLudoCurrentTurnIndex] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoCurrentTurnIndex");
      return saved ? JSON.parse(saved) : 0;
    } catch { return 0; }
  });
  const [ludoLogs, setLudoLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoLogs");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [ludoDiceValue, setLudoDiceValue] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoDiceValue");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [ludoIsRolling, setLudoIsRolling] = useState(false);
  const [ludoIsDiceRolling, setLudoIsDiceRolling] = useState(false);
  const [ludoWinner, setLudoWinner] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoWinner");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [ludoVariation, setLudoVariation] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoVariation");
      return saved ? JSON.parse(saved) : "ludo-classic";
    } catch { return "ludo-classic"; }
  });
  const [ludoLegalMoves, setLudoLegalMoves] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoLegalMoves");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [ludoConsecutiveSixes, setLudoConsecutiveSixes] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoConsecutiveSixes");
      return saved ? JSON.parse(saved) : 0;
    } catch { return 0; }
  });

  // --- Dedicated Ludo routing state (avoids sharing inGame with Snake & Ladders) ---
  // Values: "lobby" | "playing"
  const [ludoGamePhase, setLudoGamePhase] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoGamePhase");
      return saved ? JSON.parse(saved) : "lobby";
    } catch { return "lobby"; }
  });

  const [ludoWalkingToken, setLudoWalkingToken] = useState(null);

  // --- Ludo Online Multiplayer States ---
  const [ludoIsOnline, setLudoIsOnline] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoIsOnline");
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [ludoGameCode, setLudoGameCode] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoGameCode");
      return saved ? JSON.parse(saved) : "";
    } catch { return ""; }
  });
  const [ludoIsHost, setLudoIsHost] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_ludoIsHost");
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [ludoJoinedPlayers, setLudoJoinedPlayers] = useState([]);
  const [ludoIsConnecting, setLudoIsConnecting] = useState(false);

  // Keep refs up-to-date to completely prevent stale closures in async timeouts
  const ludoPlayersRef = useRef(ludoPlayers);
  const ludoActivePlayerIdxRef = useRef(ludoCurrentTurnIndex);
  const ludoIsRollingRef = useRef(ludoIsRolling);
  const ludoIsDiceRollingRef = useRef(ludoIsDiceRolling);
  const ludoDiceValueRef = useRef(ludoDiceValue);
  const ludoLegalMovesRef = useRef(ludoLegalMoves);
  const ludoConsecutiveSixesRef = useRef(ludoConsecutiveSixes);
  const ludoIsOnlineRef = useRef(ludoIsOnline);
  const ludoGameCodeRef = useRef(ludoGameCode);
  const ludoIsHostRef = useRef(ludoIsHost);
  const ludoJoinedPlayersRef = useRef(ludoJoinedPlayers);

  useEffect(() => {
    ludoPlayersRef.current = ludoPlayers;
  }, [ludoPlayers]);

  useEffect(() => {
    ludoActivePlayerIdxRef.current = ludoCurrentTurnIndex;
  }, [ludoCurrentTurnIndex]);

  useEffect(() => {
    ludoIsRollingRef.current = ludoIsRolling;
  }, [ludoIsRolling]);

  useEffect(() => {
    ludoIsDiceRollingRef.current = ludoIsDiceRolling;
  }, [ludoIsDiceRolling]);

  useEffect(() => {
    ludoDiceValueRef.current = ludoDiceValue;
  }, [ludoDiceValue]);

  useEffect(() => {
    ludoLegalMovesRef.current = ludoLegalMoves;
  }, [ludoLegalMoves]);

  useEffect(() => {
    ludoConsecutiveSixesRef.current = ludoConsecutiveSixes;
  }, [ludoConsecutiveSixes]);

  useEffect(() => {
    ludoIsOnlineRef.current = ludoIsOnline;
  }, [ludoIsOnline]);

  useEffect(() => {
    ludoGameCodeRef.current = ludoGameCode;
  }, [ludoGameCode]);

  useEffect(() => {
    ludoIsHostRef.current = ludoIsHost;
  }, [ludoIsHost]);

  useEffect(() => {
    ludoJoinedPlayersRef.current = ludoJoinedPlayers;
  }, [ludoJoinedPlayers]);

  // Sync Ludo states to localStorage to support page refresh/recovery
  useEffect(() => {
    // Skip persisting mid-animation/rolling states to prevent page refresh desyncs!
    if (ludoIsRolling || ludoIsDiceRolling) return;
    try {
      localStorage.setItem("snake_game_activeGame", JSON.stringify(activeGame));
      localStorage.setItem("snake_game_ludoPlayers", JSON.stringify(ludoPlayers));
      localStorage.setItem("snake_game_ludoCurrentTurnIndex", JSON.stringify(ludoCurrentTurnIndex));
      localStorage.setItem("snake_game_ludoLogs", JSON.stringify(ludoLogs));
      localStorage.setItem("snake_game_ludoDiceValue", JSON.stringify(ludoDiceValue));
      localStorage.setItem("snake_game_ludoWinner", JSON.stringify(ludoWinner));
      localStorage.setItem("snake_game_ludoVariation", JSON.stringify(ludoVariation));
      localStorage.setItem("snake_game_ludoLegalMoves", JSON.stringify(ludoLegalMoves));
      localStorage.setItem("snake_game_ludoConsecutiveSixes", JSON.stringify(ludoConsecutiveSixes));
      localStorage.setItem("snake_game_ludoGamePhase", JSON.stringify(ludoGamePhase));
      localStorage.setItem("snake_game_ludoIsOnline", JSON.stringify(ludoIsOnline));
      localStorage.setItem("snake_game_ludoGameCode", JSON.stringify(ludoGameCode));
      localStorage.setItem("snake_game_ludoIsHost", JSON.stringify(ludoIsHost));
    } catch (e) {
      console.error("Failed to save ludo state to localStorage", e);
    }
  }, [activeGame, ludoPlayers, ludoCurrentTurnIndex, ludoLogs, ludoDiceValue, ludoWinner, ludoVariation, ludoLegalMoves, ludoConsecutiveSixes, ludoGamePhase, ludoIsRolling, ludoIsDiceRolling, ludoIsOnline, ludoGameCode, ludoIsHost]);

  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_players");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [board, setBoard] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_board");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [currentTurnIndex, setCurrentTurnIndex] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_currentTurnIndex");
      return saved ? JSON.parse(saved) : 0;
    } catch { return 0; }
  });
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_logs");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [diceValue, setDiceValue] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_diceValue");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isRolling, setIsRolling] = useState(false);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [gameMode, setGameMode] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_gameMode");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [winner, setWinner] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_winner");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [setupSnakesCount, setSetupSnakesCount] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_setupSnakesCount");
      return saved ? JSON.parse(saved) : 3;
    } catch { return 3; }
  });
  const [shuffleInterval, setShuffleInterval] = useState(1);
  const [setupLaddersCount, setSetupLaddersCount] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_setupLaddersCount");
      return saved ? JSON.parse(saved) : 5;
    } catch { return 5; }
  });
  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_activeTheme");
      return saved ? JSON.parse(saved) : "classic";
    } catch { return "classic"; }
  });
  const [showRules, setShowRules] = useState(false);
  const [rulesMode, setRulesMode] = useState("classic");


  // --- Online Multiplayer States ---
  const [isOnline, setIsOnline] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_isOnline");
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [gameCode, setGameCode] = useState(() => {
    return localStorage.getItem("snake_game_gameCode") || "";
  });
  const [myPlayerId] = useState(getClientPlayerId);
  const [isHost, setIsHost] = useState(() => {
    try {
      const saved = localStorage.getItem("snake_game_isHost");
      return saved ? JSON.parse(saved) : false;
    } catch { return false; }
  });
  const [joinedPlayers, setJoinedPlayers] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Keep refs up-to-date to completely prevent stale closures in async timeouts
  const playersRef = useRef(players);
  const boardRef = useRef(board);
  const broadcastChannelRef = useRef(null);
  const isRollingRef = useRef(isRolling);
  const isDiceRollingRef = useRef(isDiceRolling);
  const rollingTimeoutRef = useRef(null);
  const pendingTurnIndexRef = useRef(null);
  const ludoPendingTurnIndexRef = useRef(null);
  const consecutiveTimeoutsRef = useRef({});

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    isRollingRef.current = isRolling;
  }, [isRolling]);

  useEffect(() => {
    isDiceRollingRef.current = isDiceRolling;
  }, [isDiceRolling]);

  // Sync online lobby states to localStorage to support page refresh/recovery
  useEffect(() => {
    try {
      localStorage.setItem("snake_game_isOnline", JSON.stringify(isOnline));
      localStorage.setItem("snake_game_gameCode", gameCode);
      localStorage.setItem("snake_game_isHost", JSON.stringify(isHost));
    } catch (e) {
      console.error("Failed to save online state to localStorage", e);
    }
  }, [isOnline, gameCode, isHost]);

  // Apply pending turn index once rolling / walking animations finish
  useEffect(() => {
    if (!isRolling && !isDiceRolling && pendingTurnIndexRef.current !== null) {
      setCurrentTurnIndex(pendingTurnIndexRef.current);
      pendingTurnIndexRef.current = null;
    }
  }, [isRolling, isDiceRolling]);

  // Apply pending Ludo turn index once Ludo rolling / walking animations finish
  useEffect(() => {
    if (!ludoIsRolling && !ludoIsDiceRolling && ludoPendingTurnIndexRef.current !== null) {
      setLudoCurrentTurnIndex(ludoPendingTurnIndexRef.current);
      ludoPendingTurnIndexRef.current = null;
    }
  }, [ludoIsRolling, ludoIsDiceRolling]);

  // Play victory chime when a winner is decided
  useEffect(() => {
    if (winner) {
      playVictorySound();
    }
  }, [winner]);

  // Universal shifting-ground collision sound triggers on shuffle position changes
  const prevPositionsRef = useRef({});
  useEffect(() => {
    if (!players || players.length === 0) return;
    players.forEach(p => {
      const prevPos = prevPositionsRef.current[p.id];
      if (prevPos !== undefined && prevPos !== p.position) {
        if (!isRollingRef.current && !isDiceRollingRef.current && prevPos > 0 && p.position > 0) {
          if (p.position < prevPos) {
            playSnakeBiteSound();
          } else if (p.position > prevPos) {
            playLadderSound();
          }
        }
      }
      prevPositionsRef.current[p.id] = p.position;
    });
  }, [players]);

  useEffect(() => {
    if (ludoWinner) {
      playVictorySound();
    }
  }, [ludoWinner]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (rollingTimeoutRef.current) {
        clearTimeout(rollingTimeoutRef.current);
      }
    };
  }, []);

  // Persist local games only
  useEffect(() => {
    if (isOnline) return;
    // Skip persisting mid-animation states to prevent page refresh desyncs!
    if (isRolling || isDiceRolling) return;
    try {
      localStorage.setItem("snake_game_inGame", JSON.stringify(inGame));
      localStorage.setItem("snake_game_players", JSON.stringify(players));
      localStorage.setItem("snake_game_board", JSON.stringify(board));
      localStorage.setItem("snake_game_currentTurnIndex", JSON.stringify(currentTurnIndex));
      localStorage.setItem("snake_game_logs", JSON.stringify(logs));
      localStorage.setItem("snake_game_diceValue", JSON.stringify(diceValue));
      localStorage.setItem("snake_game_winner", JSON.stringify(winner));
      localStorage.setItem("snake_game_gameMode", JSON.stringify(gameMode));
      localStorage.setItem("snake_game_setupSnakesCount", JSON.stringify(setupSnakesCount));
      localStorage.setItem("snake_game_setupLaddersCount", JSON.stringify(setupLaddersCount));
      localStorage.setItem("snake_game_activeTheme", JSON.stringify(activeTheme));
    } catch (e) {
      console.error("Failed to save game state to localStorage", e);
    }
  }, [inGame, players, board, currentTurnIndex, logs, diceValue, winner, gameMode, setupSnakesCount, setupLaddersCount, activeTheme, isOnline, isRolling, isDiceRolling]);

  const handleShowRules = (mode) => {
    setRulesMode(mode || gameMode || "classic");
    setShowRules(true);
  };

  const handleThemeChange = async (newTheme) => {
    if (isOnline && !isHost) return;
    if (ludoIsOnline && !ludoIsHost) return;

    setActiveTheme(newTheme);
    localStorage.setItem("snake_game_activeTheme", JSON.stringify(newTheme));

    const msg = `Theme changed to ${newTheme.toUpperCase()} 🎨`;

    if (isOnline && gameCode) {
      setLogs(prev => [msg, ...prev].slice(0, 5));
      try {
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.send({
            type: "broadcast",
            event: "theme-changed",
            payload: { theme: newTheme }
          });
        }

        const { data: game } = await supabase
          .from("games")
          .select("id, logs")
          .eq("code", gameCode)
          .single();

        if (game) {
          await supabase
            .from("games")
            .update({
              theme: newTheme,
              logs: [msg, ...(game.logs || [])].slice(0, 5)
            })
            .eq("id", game.id);
        }
      } catch (err) {
        console.error("Failed to sync theme change to database:", err);
      }
    } else if (ludoIsOnline && ludoGameCode) {
      setLudoLogs(prev => [msg, ...prev].slice(0, 5));
      try {
        if (ludoBroadcastChannelRef.current) {
          ludoBroadcastChannelRef.current.send({
            type: "broadcast",
            event: "ludo-theme-changed",
            payload: { theme: newTheme }
          });
        }

        const { data: game } = await supabase
          .from("ludo_games")
          .select("id, logs")
          .eq("code", ludoGameCode)
          .single();

        if (game) {
          await supabase
            .from("ludo_games")
            .update({
              theme: newTheme,
              logs: [msg, ...(game.logs || [])].slice(0, 5)
            })
            .eq("id", game.id);
        }
      } catch (err) {
        console.error("Failed to sync Ludo theme change to database:", err);
      }
    } else {
      if (activeGame === "ludo") {
        setLudoLogs(prev => [msg, ...prev].slice(0, 5));
      } else {
        setLogs(prev => [msg, ...prev].slice(0, 5));
      }
    }
  };

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };


  // --- Online Database Handlers ---
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateOnlineRoom = async ({ hostName, hostColor, hostSnake, theme, customElements, snakesCount, laddersCount, shuffleInterval = 1 }) => {
    setIsConnecting(true);
    try {
      const code = generateRoomCode();
      const { data: game, error: gameError } = await supabase
        .from("games")
        .insert({
          code,
          status: "waiting",
          theme,
          game_mode: gameMode || "classic",
          setup_snakes_count: snakesCount,
          setup_ladders_count: laddersCount
        })
        .select()
        .single();

      if (gameError) throw gameError;

      const { error: playerError } = await supabase
        .from("game_players")
        .insert({
          game_id: game.id,
          client_player_id: myPlayerId,
          name: hostName,
          color: hostColor,
          own_snake_number: hostSnake,
          is_host: true,
          is_bot: false
        });

      if (playerError) throw playerError;

      setGameCode(code);
      setIsHost(true);
      setIsOnline(true);
      
      const newUrl = `${window.location.origin}${window.location.pathname}?code=${code}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    } catch (error) {
      console.error("Error hosting game:", error);
      alert("Failed to host room. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinOnlineRoom = async ({ code, playerName, playerColor, playerSnake }) => {
    setIsConnecting(true);
    try {
      const cleanedCode = code.trim().toUpperCase();
      const { data: game, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("code", cleanedCode)
        .single();

      if (gameError || !game) {
        alert("Room not found. Check the code.");
        setIsConnecting(false);
        return;
      }

      if (game.status !== "waiting") {
        alert("This game has already started or finished.");
        setIsConnecting(false);
        return;
      }

      const { data: existingPlayers } = await supabase
        .from("game_players")
        .select("*")
        .eq("game_id", game.id);

      if (existingPlayers && existingPlayers.length >= 4) {
        alert("Room is full (max 4 players).");
        setIsConnecting(false);
        return;
      }

      const alreadyInRoom = existingPlayers.find(p => p.client_player_id === myPlayerId);
      if (alreadyInRoom) {
        await supabase
          .from("game_players")
          .update({
            name: playerName,
            color: playerColor,
            own_snake_number: playerSnake
          })
          .eq("id", alreadyInRoom.id);
      } else {
        const { error: playerError } = await supabase
          .from("game_players")
          .insert({
            game_id: game.id,
            client_player_id: myPlayerId,
            name: playerName,
            color: playerColor,
            own_snake_number: playerSnake,
            is_host: false,
            is_bot: false
          });
        if (playerError) throw playerError;
      }

      setGameCode(cleanedCode);
      setIsHost(false);
      setIsOnline(true);
      setGameMode(game.game_mode);
      setActiveTheme(game.theme);

      const newUrl = `${window.location.origin}${window.location.pathname}?code=${cleanedCode}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    } catch (error) {
      console.error("Error joining game:", error);
      alert("Failed to join room.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeaveOnlineRoom = async () => {
    try {
      if (gameCode) {
        const { data: game } = await supabase
          .from("games")
          .select("id, status")
          .eq("code", gameCode)
          .maybeSingle();

        if (game) {
          if (isHost || game.status === "finished") {
            await supabase
              .from("games")
              .delete()
              .eq("id", game.id);
          } else {
            await supabase
              .from("game_players")
              .delete()
              .eq("game_id", game.id)
              .eq("client_player_id", myPlayerId);
          }
        }
      }
    } catch (err) {
      console.error("Error leaving room:", err);
    } finally {
      setGameCode("");
      setIsHost(false);
      setIsOnline(false);
      setJoinedPlayers([]);
      setInGame(false);
      setBoard(null);
      setWinner(null);
      try {
        localStorage.removeItem("snake_game_isOnline");
        localStorage.removeItem("snake_game_gameCode");
        localStorage.removeItem("snake_game_isHost");
      } catch (e) {
        console.error("Failed to clean up online localStorage:", e);
      }
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.pushState({ path: cleanUrl }, "", cleanUrl);
    }
  };

  const LUDO_COLOR_MAP = {
    blue: "#3b82f6",
    red: "#ef4444",
    green: "#10b981",
    yellow: "#fbbf24"
  };

  const handleCreateLudoOnlineRoom = async ({ hostName, hostColor, theme, variation, maxPlayers }) => {
    setLudoIsConnecting(true);
    try {
      const code = generateRoomCode();
      const { data: game, error: gameError } = await supabase
        .from("ludo_games")
        .insert({
          code,
          status: "waiting",
          theme: theme || "classic",
          ludo_variation: variation || "ludo-classic",
          current_turn_index: 0,
          dice_value: null,
          consecutive_sixes: 0,
          logs: ["Lobby created! 👑"]
        })
        .select()
        .single();

      if (gameError) throw gameError;

      const numTokens = variation === "ludo-quick" ? 1 : 4;
      const { error: playerError } = await supabase
        .from("ludo_game_players")
        .insert({
          game_id: game.id,
          client_player_id: myPlayerId,
          name: hostName,
          color: hostColor,
          color_code: LUDO_COLOR_MAP[hostColor.toLowerCase()] || "#3b82f6",
          tokens: Array(numTokens).fill(-1),
          is_host: true,
          is_bot: false,
          last_roll: 1,
          has_eliminated_opponent: false
        });

      if (playerError) throw playerError;

      setLudoGameCode(code);
      setLudoIsHost(true);
      setLudoIsOnline(true);
      
      const newUrl = `${window.location.origin}${window.location.pathname}?code=${code}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    } catch (error) {
      console.error("Error hosting Ludo game:", error);
      alert("Failed to host room. Please try again.");
    } finally {
      setLudoIsConnecting(false);
    }
  };

  const handleJoinLudoOnlineRoom = async ({ code, playerName, playerColor }) => {
    setLudoIsConnecting(true);
    try {
      const cleanedCode = code.trim().toUpperCase();
      const { data: game, error: gameError } = await supabase
        .from("ludo_games")
        .select("*")
        .eq("code", cleanedCode)
        .single();

      if (gameError || !game) {
        alert("Room not found. Check the code.");
        setLudoIsConnecting(false);
        return;
      }

      if (game.status !== "waiting") {
        alert("This game has already started or finished.");
        setLudoIsConnecting(false);
        return;
      }

      const { data: existingPlayers } = await supabase
        .from("ludo_game_players")
        .select("*")
        .eq("game_id", game.id);

      if (existingPlayers && existingPlayers.length >= 4) {
        alert("Room is full (max 4 players).");
        setLudoIsConnecting(false);
        return;
      }

      const isColorTaken = existingPlayers.some(p => p.color.toLowerCase() === playerColor.toLowerCase());
      if (isColorTaken) {
        alert("Selected color is already taken. Please choose another color.");
        setLudoIsConnecting(false);
        return;
      }

      const numTokens = game.ludo_variation === "ludo-quick" ? 1 : 4;

      const alreadyInRoom = existingPlayers.find(p => p.client_player_id === myPlayerId);
      if (alreadyInRoom) {
        await supabase
          .from("ludo_game_players")
          .update({
            name: playerName,
            color: playerColor,
            color_code: LUDO_COLOR_MAP[playerColor.toLowerCase()] || "#3b82f6",
            tokens: Array(numTokens).fill(-1)
          })
          .eq("id", alreadyInRoom.id);
      } else {
        const { error: playerError } = await supabase
          .from("ludo_game_players")
          .insert({
            game_id: game.id,
            client_player_id: myPlayerId,
            name: playerName,
            color: playerColor,
            color_code: LUDO_COLOR_MAP[playerColor.toLowerCase()] || "#3b82f6",
            tokens: Array(numTokens).fill(-1),
            is_host: false,
            is_bot: false,
            last_roll: 1,
            has_eliminated_opponent: false
          });
        if (playerError) throw playerError;
      }

      setLudoGameCode(cleanedCode);
      setLudoIsHost(false);
      setLudoIsOnline(true);
      setLudoVariation(game.ludo_variation);
      setActiveTheme(game.theme);

      const newUrl = `${window.location.origin}${window.location.pathname}?code=${cleanedCode}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    } catch (error) {
      console.error("Error joining Ludo game:", error);
      alert("Failed to join room.");
    } finally {
      setLudoIsConnecting(false);
    }
  };

  const handleLeaveLudoOnlineRoom = async () => {
    try {
      if (ludoGameCode) {
        const { data: game } = await supabase
          .from("ludo_games")
          .select("id, status")
          .eq("code", ludoGameCode)
          .maybeSingle();

        if (game) {
          if (ludoIsHost || game.status === "finished") {
            await supabase
              .from("ludo_games")
              .delete()
              .eq("id", game.id);
          } else {
            await supabase
              .from("ludo_game_players")
              .delete()
              .eq("game_id", game.id)
              .eq("client_player_id", myPlayerId);
          }
        }
      }
    } catch (err) {
      console.error("Error leaving room:", err);
    } finally {
      setLudoGameCode("");
      setLudoIsHost(false);
      setLudoIsOnline(false);
      setLudoJoinedPlayers([]);
      setLudoPlayers([]);
      setLudoWinner(null);
      setLudoGamePhase("lobby");
      try {
        localStorage.removeItem("snake_game_ludoIsOnline");
        localStorage.removeItem("snake_game_ludoGameCode");
        localStorage.removeItem("snake_game_ludoIsHost");
      } catch (e) {
        console.error("Failed to clean up ludo online localStorage:", e);
      }
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.pushState({ path: cleanUrl }, "", cleanUrl);
    }
  };

  const handleStartLudoOnlineGame = async (selectedTheme) => {
    try {
      const { data: game } = await supabase
        .from("ludo_games")
        .select("id")
        .eq("code", ludoGameCode)
        .single();

      if (!game) return;

      const numTokens = ludoVariation === "ludo-quick" ? 1 : 4;

      const resetPromises = ludoJoinedPlayers.map(p => 
        supabase
          .from("ludo_game_players")
          .update({
            tokens: Array(numTokens).fill(-1),
            last_roll: 1,
            has_eliminated_opponent: false
          })
          .eq("game_id", game.id)
          .eq("client_player_id", p.id)
      );
      await Promise.all(resetPromises);

      await supabase
        .from("ludo_games")
        .update({
          status: "playing",
          theme: selectedTheme,
          ludo_variation: ludoVariation,
          current_turn_index: 0,
          dice_value: null,
          consecutive_sixes: 0,
          winner_id: null,
          logs: ["Game started! Let the race begin! 🚀"]
        })
        .eq("id", game.id);
        
    } catch (err) {
      console.error("Error starting online Ludo game:", err);
      alert("Failed to start online game.");
    }
  };

  const exitGame = () => {
    if (isOnline) {
      handleLeaveOnlineRoom();
    } else if (ludoIsOnline) {
      handleLeaveLudoOnlineRoom();
    } else {
      setInGame(false);
      setPlayers([]);
      setBoard(null);
      setWinner(null);
      setLogs([]);
      setDiceValue(null);
      setGameMode(null);

      // Reset Ludo states too
      setLudoPlayers([]);
      setLudoCurrentTurnIndex(0);
      setLudoDiceValue(null);
      setLudoWinner(null);
      setLudoLogs([]);
      setLudoLegalMoves([]);
      setLudoConsecutiveSixes(0);
      setLudoGamePhase("lobby"); // Reset Ludo routing phase

      // Go back to main Game Selection
      setActiveGame(null);
    }
  };

  // --- Realtime Lobby and State Sync Effects ---
  useEffect(() => {
    if (!isOnline || !gameCode) return;

    let gamesChannel;
    let playersChannel;

    const setupSync = async () => {
      const { data: game, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("code", gameCode)
        .single();

      if (gameError || !game) {
        handleLeaveOnlineRoom();
        return;
      }

      setGameMode(game.game_mode);
      setActiveTheme(game.theme);
      setSetupSnakesCount(game.setup_snakes_count);
      setSetupLaddersCount(game.setup_ladders_count);

      const fetchPlayers = async () => {
        const { data: playersList } = await supabase
          .from("game_players")
          .select("*")
          .eq("game_id", game.id)
          .order("joined_at", { ascending: true });
        
        if (playersList) {
          const mapped = playersList.map(p => ({
            id: p.client_player_id,
            name: p.name,
            position: p.position || 0,
            ownSnakeNumber: p.own_snake_number,
            color: p.color,
            isBot: p.is_bot,
            isHost: p.is_host,
            unlockAttempts: p.unlock_attempts || 0,
            lastRoll: p.last_roll || 1
          }));
          setJoinedPlayers(mapped);

          // If the player is in an online game and not in the players list, they have been removed!
          const stillInRoom = mapped.some(p => p.id === myPlayerId);
          if (!stillInRoom && isOnline) {
            handleLeaveOnlineRoom();
            alert("You have been removed from the game due to inactivity (2 consecutive timeouts).");
            return;
          }
          
          // Protect player positions during active animations to avoid visual snaps and jumps!
          setPlayers(prev => {
            return mapped.map(mItem => {
              const existing = prev ? prev.find(p => p.id === mItem.id) : null;
              const merged = {
                ...mItem,
                snakeBiteCount: existing ? (existing.snakeBiteCount || 0) : 0,
                consecutiveSixes: existing ? (existing.consecutiveSixes || 0) : 0,
                hasBeenBittenBySnake: existing ? (existing.hasBeenBittenBySnake || false) : false,
              };
              if (existing && (isRollingRef.current || isDiceRollingRef.current)) {
                merged.position = existing.position;
              }
              return merged;
            });
          });
        }
      };
      
      await fetchPlayers();

      if (game.status === "playing" || game.status === "finished") {
        if (game.board) setBoard(game.board);
        setCurrentTurnIndex(game.current_turn_index || 0);
        if (game.logs) setLogs(game.logs);
        if (game.dice_value) setDiceValue(game.dice_value);
        setInGame(true);

        if (game.status === "finished" && game.winner_id) {
          const winPlayer = playersRef.current.find(p => p.id === game.winner_id);
          if (winPlayer) setWinner(winPlayer);
        }
      }

      gamesChannel = supabase
        .channel(`room-metadata-${gameCode}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "games" },
          async (payload) => {
            if (payload.eventType === "DELETE") {
              if (payload.old && payload.old.id === game.id) {
                handleLeaveOnlineRoom();
                alert("The game session has been completed or closed by the host.");
              }
              return;
            }

            const newRoomState = payload.new;
            if (!newRoomState || newRoomState.code !== gameCode) return;

            setActiveTheme(newRoomState.theme);
            setSetupSnakesCount(newRoomState.setup_snakes_count);
            setSetupLaddersCount(newRoomState.setup_ladders_count);

            if (newRoomState.status === "playing" && newRoomState.board) {
              setBoard(newRoomState.board);
              
              // Protect active turn index from shifting during receiver animation
              if (isRollingRef.current || isDiceRollingRef.current) {
                pendingTurnIndexRef.current = newRoomState.current_turn_index || 0;
              } else {
                setCurrentTurnIndex(newRoomState.current_turn_index || 0);
              }

              if (newRoomState.logs) setLogs(newRoomState.logs);
              if (newRoomState.dice_value) setDiceValue(newRoomState.dice_value);
              setInGame(true);
            }

            if (newRoomState.status === "finished" && newRoomState.winner_id) {
              const winPlayer = playersRef.current.find(p => p.id === newRoomState.winner_id);
              if (winPlayer) setWinner(winPlayer);
            } else if (newRoomState.status === "playing") {
              setWinner(null);
            }

            if (newRoomState.status === "waiting" && inGame) {
              setInGame(false);
              setBoard(null);
              setWinner(null);
            }
          }
        )
        .subscribe();

      playersChannel = supabase
        .channel(`room-players-${gameCode}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "game_players" },
          (payload) => {
            const changedRow = payload.new || payload.old;
            if (changedRow && changedRow.game_id === game.id) {
              fetchPlayers();
            }
          }
        )
        .subscribe();
    };

    setupSync();

    return () => {
      if (gamesChannel) supabase.removeChannel(gamesChannel);
      if (playersChannel) supabase.removeChannel(playersChannel);
    };
  }, [isOnline, gameCode]);

  // --- Realtime Broadcast Channel Effect ---
  useEffect(() => {
    if (!isOnline || !gameCode) return;

    const channel = supabase.channel(`gameplay-broadcast-${gameCode}`);

    channel
      .on("broadcast", { event: "dice-rolling" }, ({ payload }) => {
        if (payload.playerId !== myPlayerId) {
          playDiceRollSound();
          setIsDiceRolling(true);
          setIsRolling(true);

          // Robust safety fallback: Clear existing timeout and set a new one
          if (rollingTimeoutRef.current) clearTimeout(rollingTimeoutRef.current);
          rollingTimeoutRef.current = setTimeout(() => {
            console.warn("Safety timeout triggered: Rolling took too long or animation event was lost.");
            setIsDiceRolling(false);
            setIsRolling(false);
          }, 8000); // 8 seconds fallback
        }
      })
      .on("broadcast", { event: "turn-animation" }, async ({ payload }) => {
        if (payload.playerId !== myPlayerId) {
          executeTurnAnimationOnly(payload);
        }
        if (isHost) {
          handleTimeoutTracking(payload.playerId, payload.isAutoRoll);
        }
      })
      .on("broadcast", { event: "theme-changed" }, ({ payload }) => {
        if (payload.theme) {
          setActiveTheme(payload.theme);
          setLogs(prev => [`Theme synced: ${payload.theme.toUpperCase()} 🎨`, ...prev.slice(0, 4)]);
        }
      })
      .subscribe();

    broadcastChannelRef.current = channel;

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isOnline, gameCode, myPlayerId, isHost]);

  // --- Ludo Realtime Lobby and State Sync Effects ---
  useEffect(() => {
    if (!ludoIsOnline || !ludoGameCode) return;

    let gamesChannel;
    let playersChannel;

    const setupLudoSync = async () => {
      const { data: game, error: gameError } = await supabase
        .from("ludo_games")
        .select("*")
        .eq("code", ludoGameCode)
        .single();

      if (gameError || !game) {
        handleLeaveLudoOnlineRoom();
        return;
      }

      setLudoVariation(game.ludo_variation);
      setActiveTheme(game.theme);

      const fetchLudoPlayers = async () => {
        const { data: playersList } = await supabase
          .from("ludo_game_players")
          .select("*")
          .eq("game_id", game.id)
          .order("created_at", { ascending: true });
        
        if (playersList) {
          const mapped = playersList.map(p => ({
            id: p.client_player_id,
            name: p.name,
            color: p.color,
            colorCode: p.color_code,
            tokens: p.tokens || [-1, -1, -1, -1],
            isBot: p.is_bot,
            isHost: p.is_host,
            lastRoll: p.last_roll || 1,
            hasEliminatedOpponent: p.has_eliminated_opponent || false
          }));
          setLudoJoinedPlayers(mapped);
          
          // Protect player token steps during active rolls or walks to avoid visual desync snaps!
          setLudoPlayers(prev => {
            return mapped.map(mItem => {
              const existing = prev ? prev.find(p => p.id === mItem.id) : null;
              if (existing && (ludoIsRollingRef.current || ludoIsDiceRollingRef.current)) {
                return {
                  ...mItem,
                  tokens: existing.tokens // Preserve ongoing animation steps!
                };
              }
              return mItem;
            });
          });
        }
      };
      
      await fetchLudoPlayers();

      if (game.status === "playing" || game.status === "finished") {
        setLudoCurrentTurnIndex(game.current_turn_index || 0);
        if (game.logs) setLudoLogs(game.logs);
        if (game.dice_value !== undefined) setLudoDiceValue(game.dice_value);
        setLudoConsecutiveSixes(game.consecutive_sixes || 0);
        setLudoGamePhase("playing");

        if (game.status === "finished" && game.winner_id) {
          const winPlayer = ludoPlayersRef.current.find(p => p.id === game.winner_id);
          if (winPlayer) setLudoWinner(winPlayer);
        }
      }

      gamesChannel = supabase
        .channel(`ludo-room-metadata-${ludoGameCode}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "ludo_games" },
          async (payload) => {
            if (payload.eventType === "DELETE") {
              if (payload.old && payload.old.id === game.id) {
                handleLeaveLudoOnlineRoom();
                alert("The Ludo match session has been completed or closed by the host.");
              }
              return;
            }

            const newRoomState = payload.new;
            if (!newRoomState || newRoomState.code !== ludoGameCode) return;

            setActiveTheme(newRoomState.theme);
            setLudoVariation(newRoomState.ludo_variation);

            if (newRoomState.status === "playing") {
              // Protect active turn index from shifting during receiver animation
              if (ludoIsRollingRef.current || ludoIsDiceRollingRef.current) {
                ludoPendingTurnIndexRef.current = newRoomState.current_turn_index || 0;
              } else {
                setLudoCurrentTurnIndex(newRoomState.current_turn_index || 0);
                ludoPendingTurnIndexRef.current = null;
              }
              if (newRoomState.logs) setLudoLogs(newRoomState.logs);
              if (newRoomState.dice_value !== undefined) setLudoDiceValue(newRoomState.dice_value);
              setLudoConsecutiveSixes(newRoomState.consecutive_sixes || 0);
              setLudoGamePhase("playing");
            }

            if (newRoomState.status === "finished" && newRoomState.winner_id) {
              const winPlayer = ludoPlayersRef.current.find(p => p.id === newRoomState.winner_id);
              if (winPlayer) setLudoWinner(winPlayer);
            } else if (newRoomState.status === "playing") {
              setLudoWinner(null);
            }

            if (newRoomState.status === "waiting" && ludoGamePhase === "playing") {
              setLudoGamePhase("lobby");
              setLudoPlayers([]);
              setLudoWinner(null);
            }
          }
        )
        .subscribe();

      playersChannel = supabase
        .channel(`ludo-room-players-${ludoGameCode}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "ludo_game_players" },
          (payload) => {
            const changedRow = payload.new || payload.old;
            if (changedRow && changedRow.game_id === game.id) {
              fetchLudoPlayers();
            }
          }
        )
        .subscribe();
    };

    setupLudoSync();

    return () => {
      if (gamesChannel) supabase.removeChannel(gamesChannel);
      if (playersChannel) supabase.removeChannel(playersChannel);
    };
  }, [ludoIsOnline, ludoGameCode]);

  // --- Ludo Realtime Broadcast Event Bus Channel Effect ---
  const ludoBroadcastChannelRef = useRef(null);

  useEffect(() => {
    if (!ludoIsOnline || !ludoGameCode) return;

    const channel = supabase.channel(`ludo-gameplay-broadcast-${ludoGameCode}`);

    channel
      .on("broadcast", { event: "ludo-dice-rolling" }, async ({ payload }) => {
        if (payload.playerId !== myPlayerId) {
          await executeLudoDiceRollAnimationOnly(payload);
        }
      })
      .on("broadcast", { event: "ludo-turn-animation" }, async ({ payload }) => {
        if (payload.playerId !== myPlayerId) {
          // Trigger the step-by-step walking animation exactly as executed on host, passing isIncomingBroadcast = true
          const latestPlayers = ludoPlayersRef.current;
          await handleSelectLudoToken(latestPlayers, payload.activeIdx, payload.tokenIdx, payload.rollVal, true);
        }
      })
      .on("broadcast", { event: "ludo-theme-changed" }, ({ payload }) => {
        if (payload.theme) {
          setActiveTheme(payload.theme);
          setLudoLogs(prev => [`Theme synced: ${payload.theme.toUpperCase()} 🎨`, ...prev.slice(0, 4)]);
        }
      })
      .subscribe();

    ludoBroadcastChannelRef.current = channel;

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [ludoIsOnline, ludoGameCode, myPlayerId]);

  // --- Synced Ludo Dice Roll Animation ---
  const executeLudoDiceRollAnimationOnly = async ({ playerId, roll }) => {
    playDiceRollSound();
    if (rollingTimeoutRef.current) {
      clearTimeout(rollingTimeoutRef.current);
      rollingTimeoutRef.current = null;
    }

    setLudoIsRolling(true);
    setLudoIsDiceRolling(true);

    // Update lastRoll for active player so the 3D dice shows the target value before spinning
    setLudoPlayers(prev => prev.map(p => p.id === playerId ? { ...p, lastRoll: roll } : p));

    // Simulate dice roll animation
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLudoIsDiceRolling(false);
    await new Promise((resolve) => setTimeout(resolve, 300));

    setLudoDiceValue(roll);
    if (roll === 6) {
      playSixSound();
    }
    
    // Clear lock
    setLudoIsRolling(false);

    // Compute legal moves locally so interactive elements highlight correctly on guest screens
    const latestPlayers = ludoPlayersRef.current;
    const activeIdx = ludoActivePlayerIdxRef.current;
    const legals = getLegalMoves(latestPlayers, activeIdx, roll, ludoVariation);
    setLudoLegalMoves(legals);
  };

  // --- Synced Walk / Slide Turn Animation ---
  const executeTurnAnimationOnly = async ({ playerId, roll, startPos, targetPos, boardElements }) => {
    if (rollingTimeoutRef.current) {
      clearTimeout(rollingTimeoutRef.current);
      rollingTimeoutRef.current = null;
    }

    // Engage locks immediately when animation payload is received
    setIsRolling(true);
    setIsDiceRolling(true);

    try {
      setDiceValue(roll);
      const latestPlayers = playersRef.current;
      const activePlayerObj = latestPlayers.find(p => p.id === playerId);
      const prevSixes = activePlayerObj ? (activePlayerObj.consecutiveSixes || 0) : 0;
      const nextSixes = roll === 6 ? prevSixes + 1 : 0;

      setPlayers(prev => prev.map(p => 
        p.id === playerId 
          ? { 
              ...p, 
              lastRoll: roll, 
              consecutiveSixes: nextSixes === 3 ? 0 : nextSixes 
            } 
          : p
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      setIsDiceRolling(false);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (roll === 6) {
        playSixSound();
      }

      let currentPos = startPos;
      if (currentPos === 0) {
        if (roll === 6) {
          playMoveSound();
          setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: 1, unlockAttempts: 0, lastRoll: roll } : p));
          await new Promise(resolve => setTimeout(resolve, 600));
          currentPos = 1;
        } else {
          setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, unlockAttempts: (p.unlockAttempts || 0) + 1, lastRoll: roll } : p));
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      } else if (startPos === targetPos) {
        // Did not move (e.g. Frozen in beast-snakes, skipped due to three sixes, or need exact roll)
        await new Promise(resolve => setTimeout(resolve, 600));
      } else if (targetPos < startPos) {
        // Walk backwards (either beast-snakes panic or forced backwards snake bite)
        for (let step = startPos - 1; step >= targetPos; step--) {
          playMoveSound();
          setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: step, isWalking: true, lastRoll: roll } : p));
          await new Promise(resolve => setTimeout(resolve, 350));
        }
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isWalking: false } : p));
        currentPos = targetPos;
        await new Promise(resolve => setTimeout(resolve, 400));
      } else {
        // Walk forward
        let walkDist = roll;
        if (gameMode === "beast-snakes") {
          const activePlayerObj = latestPlayers.find(p => p.id === playerId);
          const unlockAttempts = activePlayerObj ? (activePlayerObj.unlockAttempts || 0) : 0;
          if (unlockAttempts >= 200 && unlockAttempts <= 202) {
            walkDist = Math.max(1, Math.floor(roll / 2));
          }
        }

        if (startPos + walkDist <= 100) {
          for (let step = startPos + 1; step <= startPos + walkDist; step++) {
            playMoveSound();
            setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: step, isWalking: true, lastRoll: roll } : p));
            await new Promise(resolve => setTimeout(resolve, 350));
          }
          setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isWalking: false } : p));
          currentPos = startPos + walkDist;
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }

      if (boardElements && boardElements.type === "ladder") {
        playLadderSound();
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isClimbing: true } : p));
        await new Promise(resolve => setTimeout(resolve, 50));
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: boardElements.top } : p));
        await new Promise(resolve => setTimeout(resolve, 900));
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isClimbing: false } : p));
      } else if (boardElements && boardElements.type === "snake") {
        playSnakeBiteSound();
        setPlayers(prev => prev.map(p => 
          p.id === playerId 
            ? { 
                ...p, 
                isPanicking: true, 
                snakeBiteCount: (p.snakeBiteCount || 0) + 1,
                hasBeenBittenBySnake: true 
              } 
            : p
        ));
        await new Promise(resolve => setTimeout(resolve, 750));
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isPanicking: false, isSwallowed: true } : p));
        await new Promise(resolve => setTimeout(resolve, 50));
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, position: boardElements.tail } : p));
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isSwallowed: false } : p));
      }
    } catch (err) {
      console.error("Error in executeTurnAnimationOnly:", err);
    } finally {
      setIsRolling(false);
      setIsDiceRolling(false);
    }
  };

  // --- Ludo Game Control Actions ---
  const startLudoGame = (setupPlayers, selectedVariation, selectedTheme) => {
    if (!setupPlayers || setupPlayers.length === 0) {
      console.error("[Ludo] startLudoGame called with no players!");
      return;
    }
    setLudoPlayers(setupPlayers);
    setLudoVariation(selectedVariation);
    setActiveTheme(selectedTheme);
    setLudoCurrentTurnIndex(0);
    setLudoDiceValue(null);
    setLudoWinner(null);
    setLudoLogs(["Game started! Let the race begin! 🚀"]);
    setLudoLegalMoves([]);
    setLudoConsecutiveSixes(0);
    setLudoGamePhase("playing"); // ← dedicated Ludo routing, NOT shared inGame

    // Auto-roll if Player 1 is bot (unlikely but always safe to check)
    if (setupPlayers[0]?.isBot) {
      setTimeout(() => {
        handleLudoRoll();
      }, 1500);
    }
  };

  const restartLudoGame = () => {
    const numTokens = ludoVariation === "ludo-quick" ? 1 : 4;
    const resetPlayers = ludoPlayers.map((p) => ({
      ...p,
      tokens: Array(numTokens).fill(-1),
      hasEliminatedOpponent: false,
      lastRoll: 1
    }));

    setLudoPlayers(resetPlayers);
    setLudoCurrentTurnIndex(0);
    setLudoDiceValue(null);
    setLudoWinner(null);
    setLudoLogs(["Game restarted! Let the race begin! 🚀"]);
    setLudoLegalMoves([]);
    setLudoConsecutiveSixes(0);
    setLudoGamePhase("playing");

    if (resetPlayers[0]?.isBot) {
      setTimeout(() => {
        handleLudoRoll();
      }, 1500);
    }
  };

  const passLudoTurn = (freshPlayers, activeIdx) => {
    const nextIdx = (activeIdx + 1) % freshPlayers.length;
    setLudoCurrentTurnIndex(nextIdx);
    setLudoDiceValue(null);
    setLudoLegalMoves([]);
    setLudoConsecutiveSixes(0);

    const nextPlayer = freshPlayers[nextIdx];
    if (nextPlayer.isBot && !ludoWinner) {
      setTimeout(() => {
        handleLudoRoll();
      }, 1500);
    }
  };

  const handleLudoRoll = async () => {
    if (ludoIsRollingRef.current || ludoIsDiceRollingRef.current || ludoWinner || ludoDiceValue !== null) return;

    playDiceRollSound();
    const activeIdx = ludoActivePlayerIdxRef.current;
    const activePlayer = ludoPlayersRef.current[activeIdx];

    // In online play, you can only roll on your OWN turn!
    if (ludoIsOnline && activePlayer.id !== myPlayerId) {
      return;
    }

    setLudoIsRolling(true);
    setLudoIsDiceRolling(true);

    const roll = Math.floor(Math.random() * 6) + 1;

    // Update lastRoll immediately so the 3D dice has the target value before spinning!
    const freshPlayers = ludoPlayersRef.current.map((p, idx) => 
      idx === activeIdx ? { ...p, lastRoll: roll } : p
    );
    setLudoPlayers(freshPlayers);

    // Broadcast dice roll event so other screens start spinning
    if (ludoIsOnline && ludoBroadcastChannelRef.current) {
      ludoBroadcastChannelRef.current.send({
        type: "broadcast",
        event: "ludo-dice-rolling",
        payload: { playerId: activePlayer.id, roll }
      });
    }

    // Sync current roll value to supabase
    if (ludoIsOnline) {
      try {
        const { data: game } = await supabase
          .from("ludo_games")
          .select("id")
          .eq("code", ludoGameCode)
          .single();
        if (game) {
          await supabase
            .from("ludo_games")
            .update({
              dice_value: roll
            })
            .eq("id", game.id);
        }
      } catch (err) {
        console.error("Failed to sync roll to database:", err);
      }
    }

    // Simulate dice roll animation
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLudoIsDiceRolling(false);
    await new Promise((resolve) => setTimeout(resolve, 300));

    setLudoDiceValue(roll);
    if (roll === 6) {
      playSixSound();
    }

    const legals = getLegalMoves(freshPlayers, activeIdx, roll, ludoVariation);
    setLudoLegalMoves(legals);

    const updatedConsecutiveSixes = roll === 6 ? ludoConsecutiveSixesRef.current + 1 : 0;
    setLudoConsecutiveSixes(updatedConsecutiveSixes);

    const logMsg = `${activePlayer.name} rolled a ${roll}! 🎲`;
    setLudoLogs((prev) => [logMsg, ...prev].slice(0, 5));

    if (updatedConsecutiveSixes === 3) {
      const skipMsg = `⚠️ 3 consecutive sixes! ${activePlayer.name}'s turn is skipped.`;
      setLudoLogs((prev) => [skipMsg, logMsg, ...prev].slice(0, 5));
      setLudoConsecutiveSixes(0);
      setLudoLegalMoves([]);
      setLudoIsRolling(false);

      if (ludoIsOnline) {
        try {
          const { data: game } = await supabase
            .from("ludo_games")
            .select("id")
            .eq("code", ludoGameCode)
            .single();
          if (game) {
            const nextIdx = (activeIdx + 1) % freshPlayers.length;
            const finalLogs = [skipMsg, logMsg, ...ludoLogs].slice(0, 5);
            await supabase
              .from("ludo_games")
              .update({
                current_turn_index: nextIdx,
                dice_value: null,
                consecutive_sixes: 0,
                logs: finalLogs
              })
              .eq("id", game.id);
          }
        } catch (err) {
          console.error("Failed to sync skipped turn to database:", err);
        }
      }

      setTimeout(() => {
        passLudoTurn(freshPlayers, activeIdx);
      }, 1500);
      return;
    }

    if (legals.length === 0) {
      const noMoveMsg = `No legal moves for ${activePlayer.name}. Turn passes!`;
      setLudoLogs((prev) => [noMoveMsg, ...prev].slice(0, 5));
      setLudoIsRolling(false);

      if (ludoIsOnline) {
        try {
          const { data: game } = await supabase
            .from("ludo_games")
            .select("id")
            .eq("code", ludoGameCode)
            .single();
          if (game) {
            const nextIdx = (activeIdx + 1) % freshPlayers.length;
            const finalLogs = [noMoveMsg, logMsg, ...ludoLogs].slice(0, 5);
            await supabase
              .from("ludo_games")
              .update({
                current_turn_index: nextIdx,
                dice_value: null,
                consecutive_sixes: 0,
                logs: finalLogs
              })
              .eq("id", game.id);
          }
        } catch (err) {
          console.error("Failed to sync skipped turn to database:", err);
        }
      }

      setTimeout(() => {
        passLudoTurn(freshPlayers, activeIdx);
      }, 1500);
    } else {
      setLudoIsRolling(false);

      if (activePlayer.isBot) {
        setTimeout(() => {
          const botPlayers = freshPlayers;
          const bestTokenIdx = getBotAIMove(botPlayers, activeIdx, legals, roll, ludoVariation);
          handleSelectLudoToken(botPlayers, activeIdx, bestTokenIdx, roll);
        }, 1000);
      }
    }
  };

  const handleSelectLudoToken = async (playersList, activeIdx, tokenIdx, rollVal, isIncomingBroadcast = false) => {
    if (ludoIsRollingRef.current || ludoWinner) return;

    const activePlayer = playersList[activeIdx];
    if (ludoIsOnline && activePlayer.id !== myPlayerId && !isIncomingBroadcast) {
      return;
    }

    if (tokenIdx === undefined || tokenIdx === null) return;

    setLudoIsRolling(true);

    // Broadcast token select / walk animation event so other screens play the exact same steps
    if (ludoIsOnline && !isIncomingBroadcast && ludoBroadcastChannelRef.current) {
      ludoBroadcastChannelRef.current.send({
        type: "broadcast",
        event: "ludo-turn-animation",
        payload: {
          playerId: activePlayer.id,
          activeIdx,
          tokenIdx,
          rollVal
        }
      });
    }

    const currentStep = activePlayer.tokens[tokenIdx];
    const targetStep = currentStep === -1 ? 0 : currentStep + rollVal;

    // Set walking token state so the board can animate it
    setLudoWalkingToken({ playerIdx: activeIdx, tokenIdx: tokenIdx });

    // Incremental step-by-step walking animation
    if (currentStep === -1) {
      // 1. Release from base
      playMoveSound();
      setLudoPlayers((prev) => 
        prev.map((p, idx) => 
          idx === activeIdx 
            ? { 
                ...p, 
                tokens: p.tokens.map((tVal, tIdx) => tIdx === tokenIdx ? 0 : tVal) 
              } 
            : p
        )
      );
      setLudoLogs((prev) => [`${activePlayer.name} released a token to the track! 🚀`, ...prev].slice(0, 5));
      await new Promise((resolve) => setTimeout(resolve, 400));
    } else {
      // 2. Walk forward cell-by-cell
      for (let s = currentStep + 1; s <= targetStep; s++) {
        playMoveSound();
        setLudoPlayers((prev) => 
          prev.map((p, idx) => 
            idx === activeIdx 
              ? { 
                  ...p, 
                  tokens: p.tokens.map((tVal, tIdx) => tIdx === tokenIdx ? s : tVal) 
                } 
              : p
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 240)); // 240ms walking speed per cell for a smooth, visible hop feel
      }
    }

    // Clear walking token animation state
    setLudoWalkingToken(null);

    // Clash check and backward walking animation
    let hasClashed = false;
    if (targetStep >= 0 && targetStep <= 50) {
      const startTrackIdx = START_CELL_INDICES[activePlayer.color.toLowerCase()] || 0;
      const finalTrackIdx = (startTrackIdx + targetStep) % 52;
      const isSafeCell = SAFE_TRACK_INDICES.includes(finalTrackIdx);

      if (!isSafeCell) {
        // Find any opponent tokens on finalTrackIdx
        for (let oppIdx = 0; oppIdx < playersList.length; oppIdx++) {
          if (oppIdx === activeIdx) continue;
          const opp = playersList[oppIdx];
          const oppColor = opp.color.toLowerCase();
          const oppStartIdx = START_CELL_INDICES[oppColor] || 0;

          for (let oppTokenIdx = 0; oppTokenIdx < opp.tokens.length; oppTokenIdx++) {
            const oppStep = opp.tokens[oppTokenIdx];
            if (oppStep >= 0 && oppStep <= 50) {
              const oppTrackIdx = (oppStartIdx + oppStep) % 52;
              if (oppTrackIdx === finalTrackIdx) {
                // We found the clashed token! Let's animate it going backward step-by-step
                hasClashed = true;
                playClashSound();
                
                // Show clash/eliminate message immediately!
                setLudoLogs((prev) => [`⚔️ ${activePlayer.name} is hunting ${opp.name}'s token!`, ...prev].slice(0, 5));
                
                // Set walking token state for the clashed token so it bounces/hops during rewind
                setLudoWalkingToken({ playerIdx: oppIdx, tokenIdx: oppTokenIdx });

                // Walk backward cell-by-cell down to 0
                for (let s = oppStep; s >= 0; s--) {
                  playMoveSound();
                  setLudoPlayers((prev) => 
                    prev.map((p, pI) => 
                      pI === oppIdx 
                        ? { 
                            ...p, 
                            tokens: p.tokens.map((tVal, tI) => tI === oppTokenIdx ? s : tVal) 
                          } 
                        : p
                    )
                  );
                  await new Promise((resolve) => setTimeout(resolve, 80)); // Snappy backward walk rewind (80ms/step)
                }

                // Move finally to -1 (base)
                setLudoPlayers((prev) => 
                  prev.map((p, pI) => 
                    pI === oppIdx 
                      ? { 
                          ...p, 
                          tokens: p.tokens.map((tVal, tI) => tI === oppTokenIdx ? -1 : tVal) 
                        } 
                      : p
                  )
                );
                await new Promise((resolve) => setTimeout(resolve, 250)); // Settle in home slot
                
                setLudoWalkingToken(null);
              }
            }
          }
        }
      }
    }

    // Compute clashing and victory rules on the original state list
    const { players: updatedPlayers, logs: moveLogs, extraRoll } = executeLudoMove(
      playersList,
      activeIdx,
      tokenIdx,
      rollVal,
      ludoVariation
    );

    setLudoPlayers(updatedPlayers);
    setLudoLogs((prev) => [...moveLogs, ...prev].slice(0, 5));
    setLudoLegalMoves([]);

    const activePlayerFinal = updatedPlayers[activeIdx];
    const hasWon = ludoVariation === "ludo-quick"
      ? activePlayerFinal.tokens.some((step) => step === 56)
      : activePlayerFinal.tokens.every((step) => step === 56);

    if (hasWon) {
      setLudoWinner(activePlayerFinal);
      const winMsg = `🏆 ${activePlayerFinal.name} has won Ludo Royale! 🏆`;
      setLudoLogs((prev) => [winMsg, ...prev].slice(0, 5));

      // Persist final Ludo winning state to localStorage immediately!
      if (!isOnline && !ludoIsOnline) {
        try {
          const finalLogs = [`🏆 ${activePlayerFinal.name} has won Ludo Royale! 🏆`, ...moveLogs, ...ludoLogs].slice(0, 5);
          localStorage.setItem("snake_game_ludoPlayers", JSON.stringify(updatedPlayers));
          localStorage.setItem("snake_game_ludoCurrentTurnIndex", JSON.stringify(activeIdx));
          localStorage.setItem("snake_game_ludoLogs", JSON.stringify(finalLogs));
          localStorage.setItem("snake_game_ludoDiceValue", JSON.stringify(null));
          localStorage.setItem("snake_game_ludoWinner", JSON.stringify(activePlayerFinal));
          localStorage.setItem("snake_game_ludoVariation", JSON.stringify(ludoVariation));
          localStorage.setItem("snake_game_ludoLegalMoves", JSON.stringify([]));
          localStorage.setItem("snake_game_ludoConsecutiveSixes", JSON.stringify(0));
          localStorage.setItem("snake_game_ludoGamePhase", JSON.stringify("playing"));
        } catch (e) {
          console.error("Failed to persist Ludo winning state to localStorage:", e);
        }
      }

      // Sync final winning state to database
      if (ludoIsOnline && !isIncomingBroadcast) {
        try {
          const { data: game } = await supabase
            .from("ludo_games")
            .select("id")
            .eq("code", ludoGameCode)
            .single();

          if (game) {
            await supabase
              .from("ludo_game_players")
              .update({
                tokens: activePlayerFinal.tokens,
                last_roll: rollVal,
                has_eliminated_opponent: activePlayerFinal.hasEliminatedOpponent
              })
              .eq("game_id", game.id)
              .eq("client_player_id", activePlayerFinal.id);

            const finalLogs = [`🏆 ${activePlayerFinal.name} has won Ludo Royale! 🏆`, ...moveLogs, ...ludoLogs].slice(0, 5);
            await supabase
              .from("ludo_games")
              .update({
                winner_id: activePlayerFinal.id,
                status: "finished",
                dice_value: null,
                logs: finalLogs
              })
              .eq("id", game.id);
          }
        } catch (err) {
          console.error("Failed to sync final winning turn to database:", err);
        }
      }

      setLudoIsRolling(false);
      return;
    }

    const getsAnotherRoll = (rollVal === 6 || extraRoll) && ludoConsecutiveSixesRef.current < 3;

    // Persist final resolved Ludo state to localStorage immediately to survive mid-animation refreshes!
    if (!isOnline && !ludoIsOnline) {
      try {
        const nextTurnIndex = getsAnotherRoll ? activeIdx : (activeIdx + 1) % updatedPlayers.length;
        const finalWinner = hasWon ? activePlayerFinal : null;
        const finalConsecutiveSixes = getsAnotherRoll ? (rollVal === 6 ? ludoConsecutiveSixesRef.current : 0) : 0;
        
        let finalLogs = [...moveLogs, ...ludoLogs].slice(0, 5);
        if (hasWon) {
          finalLogs = [`🏆 ${activePlayerFinal.name} has won Ludo Royale! 🏆`, ...finalLogs].slice(0, 5);
        } else if (getsAnotherRoll) {
          finalLogs = [`${activePlayerFinal.name} gets another roll! 🔄`, ...finalLogs].slice(0, 5);
        }

        localStorage.setItem("snake_game_ludoPlayers", JSON.stringify(updatedPlayers));
        localStorage.setItem("snake_game_ludoCurrentTurnIndex", JSON.stringify(nextTurnIndex));
        localStorage.setItem("snake_game_ludoLogs", JSON.stringify(finalLogs));
        localStorage.setItem("snake_game_ludoDiceValue", JSON.stringify(null));
        localStorage.setItem("snake_game_ludoWinner", JSON.stringify(finalWinner));
        localStorage.setItem("snake_game_ludoVariation", JSON.stringify(ludoVariation));
        localStorage.setItem("snake_game_ludoLegalMoves", JSON.stringify([]));
        localStorage.setItem("snake_game_ludoConsecutiveSixes", JSON.stringify(finalConsecutiveSixes));
        localStorage.setItem("snake_game_ludoGamePhase", JSON.stringify("playing"));
      } catch (e) {
        console.error("Failed to persist Ludo mid-turn state to localStorage:", e);
      }
    }

    // Sync final turn state to database
    if (ludoIsOnline && !isIncomingBroadcast) {
      try {
        const { data: game } = await supabase
          .from("ludo_games")
          .select("id")
          .eq("code", ludoGameCode)
          .single();

        if (game) {
          // 1. Update the local player row
          await supabase
            .from("ludo_game_players")
            .update({
              tokens: activePlayerFinal.tokens,
              last_roll: rollVal,
              has_eliminated_opponent: activePlayerFinal.hasEliminatedOpponent
            })
            .eq("game_id", game.id)
            .eq("client_player_id", activePlayerFinal.id);

          // 2. If an opponent clashed/hunted, update that opponent's tokens too!
          const opponentUpdates = [];
          for (let i = 0; i < updatedPlayers.length; i++) {
            if (i === activeIdx) continue;
            const originalOpp = playersList[i];
            const updatedOpp = updatedPlayers[i];
            const originalTokensStr = JSON.stringify(originalOpp.tokens);
            const updatedTokensStr = JSON.stringify(updatedOpp.tokens);
            if (originalTokensStr !== updatedTokensStr) {
              opponentUpdates.push(
                supabase
                  .from("ludo_game_players")
                  .update({
                    tokens: updatedOpp.tokens
                  })
                  .eq("game_id", game.id)
                  .eq("client_player_id", updatedOpp.id)
              );
            }
          }
          if (opponentUpdates.length > 0) {
            await Promise.all(opponentUpdates);
          }

          // 3. Update global game row
          const nextTurnIndex = getsAnotherRoll ? activeIdx : (activeIdx + 1) % updatedPlayers.length;
          const finalConsecutiveSixes = getsAnotherRoll ? (rollVal === 6 ? ludoConsecutiveSixesRef.current : 0) : 0;
          
          let finalLogs = [...moveLogs, ...ludoLogs].slice(0, 5);
          if (getsAnotherRoll) {
            finalLogs = [`${activePlayerFinal.name} gets another roll! 🔄`, ...finalLogs].slice(0, 5);
          }

          await supabase
            .from("ludo_games")
            .update({
              current_turn_index: nextTurnIndex,
              dice_value: null,
              consecutive_sixes: finalConsecutiveSixes,
              logs: finalLogs
            })
            .eq("id", game.id);
        }
      } catch (err) {
        console.error("Failed to sync final turn to database:", err);
      }
    }

    setLudoIsRolling(false);

    if (getsAnotherRoll) {
      const extraMsg = `${activePlayerFinal.name} gets another roll! 🔄`;
      setLudoLogs((prev) => [extraMsg, ...prev].slice(0, 5));
      setLudoDiceValue(null); // Reset dice value to null so the extra turn roll is allowed!

      if (activePlayerFinal.isBot) {
        setTimeout(() => {
          handleLudoRoll();
        }, 1500);
      }
    } else {
      passLudoTurn(updatedPlayers, activeIdx);
    }
  };

  // --- Game Control Actions ---
  const startGame = (setupPlayers, numSnakes = 3, numLadders = 5, selectedTheme = "classic", shuffleInt = 1, shuffleLads = false) => {
    setSetupSnakesCount(numSnakes);
    setSetupLaddersCount(numLadders);
    setShuffleInterval(shuffleInt);
    const initialPlayers = setupPlayers.map(p => ({
      ...p,
      snakeBiteCount: 0,
      consecutiveSixes: 0,
      hasBeenBittenBySnake: false,
      position: p.position || 0,
      unlockAttempts: p.unlockAttempts || 0,
      lastRoll: p.lastRoll || 1
    }));
    setPlayers(initialPlayers);
    const playerSnakeHeads = gameMode === "own-snake" ? setupPlayers.map(p => p.ownSnakeNumber) : [];
    const generated = generateBoard(playerSnakeHeads, numSnakes, numLadders, gameMode);
    if (gameMode === "shuffle-snake") {
      generated.shuffleInterval = shuffleInt;
      generated.shuffleLadders = shuffleLads;
      generated.completedRounds = 0;
    }
    setBoard(generated);
    setInGame(true);
    setCurrentTurnIndex(0);
    setLogs(["Game started!"]);
    setWinner(null);
    setActiveTheme(selectedTheme);
  };

  const handleStartOnlineGame = async (finalSnakes, finalLadders, selectedTheme, shuffleInt = 1, shuffleLads = false) => {
    try {
      const { data: game } = await supabase
        .from("games")
        .select("id")
        .eq("code", gameCode)
        .single();

      if (!game) return;

      const playerSnakeHeads = gameMode === "own-snake" ? joinedPlayers.map(p => p.ownSnakeNumber) : [];
      const generated = generateBoard(playerSnakeHeads, finalSnakes, finalLadders, gameMode);
      if (gameMode === "shuffle-snake") {
        generated.shuffleInterval = shuffleInt;
        generated.shuffleLadders = shuffleLads;
        generated.completedRounds = 0;
      }

      const resetPromises = joinedPlayers.map(p => 
        supabase
          .from("game_players")
          .update({
            position: 0,
            unlock_attempts: 0,
            last_roll: 1
          })
          .eq("game_id", game.id)
          .eq("client_player_id", p.id)
      );
      await Promise.all(resetPromises);

      await supabase
        .from("games")
        .update({
          status: "playing",
          board: generated,
          theme: selectedTheme,
          setup_snakes_count: finalSnakes,
          setup_ladders_count: finalLadders,
          current_turn_index: 0,
          dice_value: null,
          winner_id: null,
          logs: ["Game started! Let the race begin! 🚀"]
        })
        .eq("id", game.id);
        
    } catch (err) {
      console.error("Error starting online game:", err);
      alert("Failed to start online game.");
    }
  };

  const restartSameGame = async () => {
    if (isOnline) {
      if (!isHost) return;
      try {
        const { data: game } = await supabase
          .from("games")
          .select("id")
          .eq("code", gameCode)
          .single();

        if (!game) return;

        const playerSnakeHeads = gameMode === "own-snake" ? players.map(p => p.ownSnakeNumber) : [];
        const generated = generateBoard(playerSnakeHeads, setupSnakesCount, setupLaddersCount, gameMode);
        if (gameMode === "shuffle-snake") {
          generated.shuffleInterval = board ? board.shuffleInterval : 1;
          generated.shuffleLadders = board ? board.shuffleLadders : false;
          generated.completedRounds = 0;
        }

        const resetPromises = players.map(p => 
          supabase
            .from("game_players")
            .update({
              position: 0,
              unlock_attempts: 0,
              last_roll: 1
            })
            .eq("game_id", game.id)
            .eq("client_player_id", p.id)
        );
        await Promise.all(resetPromises);

        await supabase
          .from("games")
          .update({
            status: "playing",
            board: generated,
            current_turn_index: 0,
            dice_value: null,
            winner_id: null,
            logs: ["Match restarted! Go, go, go! 🚀"]
          })
          .eq("id", game.id);
      } catch (err) {
        console.error("Error restarting online game:", err);
      }
      return;
    }

    const resetPlayers = players.map(p => ({
      ...p,
      position: 0,
      unlockAttempts: 0,
      lastRoll: 1,
      snakeBiteCount: 0,
      consecutiveSixes: 0,
      hasBeenBittenBySnake: false
    }));
    setPlayers(resetPlayers);
    const playerSnakeHeads = gameMode === "own-snake" ? resetPlayers.map(p => p.ownSnakeNumber) : [];
    const generated = generateBoard(playerSnakeHeads, setupSnakesCount, setupLaddersCount, gameMode);
    if (gameMode === "shuffle-snake") {
      generated.shuffleInterval = board ? board.shuffleInterval : 1;
      generated.shuffleLadders = board ? board.shuffleLadders : false;
      generated.completedRounds = 0;
    }
    setBoard(generated);
    setInGame(true);
    setCurrentTurnIndex(0);
    setLogs(["Match restarted! Go, go, go! 🚀"]);
    setWinner(null);
    setDiceValue(null);
  };

  const nextTurn = () => {
    setCurrentTurnIndex(prev => (prev + 1) % playersRef.current.length);
  };

  const removePlayerDueToTimeout = async (playerId) => {
    if (!isHost) return;

    try {
      const { data: game } = await supabase
        .from("games")
        .select("id, current_turn_index, logs")
        .eq("code", gameCode)
        .single();

      if (!game) return;

      const playerToRemove = playersRef.current.find(p => p.id === playerId);
      if (!playerToRemove) return;

      console.log(`Executing deletion for player ${playerToRemove.name} (${playerId}) from database...`);

      // 1. Delete player from game_players table
      await supabase
        .from("game_players")
        .delete()
        .eq("game_id", game.id)
        .eq("client_player_id", playerId);

      // 2. Determine new turn index and winner state
      const remainingPlayers = playersRef.current.filter(p => p.id !== playerId);
      const removedIndex = playersRef.current.findIndex(p => p.id === playerId);

      if (remainingPlayers.length <= 1) {
        // If only 1 player remains (usually the host), they win!
        const winnerPlayer = remainingPlayers[0] || playersRef.current.find(p => p.id === myPlayerId);
        
        const updatePayload = {
          status: "finished",
          winner_id: winnerPlayer ? winnerPlayer.id : myPlayerId,
          logs: [`${playerToRemove.name} was removed due to inactivity.`, `🎉 ${winnerPlayer ? winnerPlayer.name : "Host"} wins the game! 🎉`, ...(game.logs || [])].slice(0, 5)
        };

        await supabase
          .from("games")
          .update(updatePayload)
          .eq("id", game.id);
      } else {
        // Calculate the next turn index
        let nextTurnIndex = game.current_turn_index || 0;
        if (removedIndex === nextTurnIndex) {
          nextTurnIndex = removedIndex % remainingPlayers.length;
        } else if (removedIndex < nextTurnIndex) {
          nextTurnIndex = nextTurnIndex - 1;
        }

        const updatePayload = {
          current_turn_index: nextTurnIndex,
          logs: [`${playerToRemove.name} was removed due to inactivity.`, ...(game.logs || [])].slice(0, 5)
        };

        await supabase
          .from("games")
          .update(updatePayload)
          .eq("id", game.id);
      }
    } catch (err) {
      console.error("Error in removePlayerDueToTimeout:", err);
    }
  };

  const handleTimeoutTracking = async (playerId, isAutoRoll) => {
    if (!isHost) return;

    if (isAutoRoll) {
      const currentCount = (consecutiveTimeoutsRef.current[playerId] || 0) + 1;
      consecutiveTimeoutsRef.current[playerId] = currentCount;
      console.log(`Player ${playerId} has timed out ${currentCount} time(s) consecutively.`);

      if (currentCount >= 2) {
        console.log(`Player ${playerId} reached 2 consecutive timeouts. Removing player...`);
        await removePlayerDueToTimeout(playerId);
      }
    } else {
      // Reset counter on successful manual roll
      consecutiveTimeoutsRef.current[playerId] = 0;
      console.log(`Reset timeouts for player ${playerId} due to manual roll.`);
    }
  };

  const handleRoll = () => {
    if (isRolling || winner || !board) return;

    const currentPlayer = players[currentTurnIndex];
    if (currentPlayer.isBot) return;

    // Direct check: In online play, you can only roll on your OWN turn!
    if (isOnline && currentPlayer.id !== myPlayerId) {
      return;
    }

    executeTurn(currentPlayer, false);
  };

  const executeTurn = async (player, isAutoRoll = false) => {
    playDiceRollSound();
    setIsRolling(true);
    setIsDiceRolling(true);

    const isPlayerAtHome = player.position === 0;
    const currentAttempts = player.unlockAttempts || 0;
    const isGuaranteedSix = isPlayerAtHome && currentAttempts >= 5;

    let roll;
    if (activeGame === "snake-ladder" && player.consecutiveSixes >= 2) {
      // Force non-six roll (1 to 5) for Issue 2
      roll = Math.floor(Math.random() * 5) + 1;
    } else {
      roll = isGuaranteedSix ? 6 : rollDice();
    }

    /*
    // Secret rule: if player already has 5 or more snake bites, prevent landing on a penalty cell!
    if (activeGame === "snake-ladder" && (player.snakeBiteCount || 0) >= 5 && player.unlockAttempts !== 100) {
      const invalidRolls = new Set();
      const isNegative = gameMode === "negative-snake";

      if (isNegative) {
        // In negative snake mode, ladders slide you down (from l.top to l.bottom)
        const activeLadders = board ? board.ladders : [];
        activeLadders.forEach(l => {
          const neededRoll = l.top - player.position;
          if (neededRoll >= 1 && neededRoll <= 6) {
            invalidRolls.add(neededRoll);
          }
        });
      } else {
        // In standard modes, snakes slide you down (from s.head to s.tail)
        const activeSnakes = board ? board.snakes : [];
        activeSnakes.forEach(s => {
          if (s.type !== "rainbow") {
            const neededRoll = s.head - player.position;
            if (neededRoll >= 1 && neededRoll <= 6) {
              invalidRolls.add(neededRoll);
            }
          }
        });
      }

      if (invalidRolls.size > 0 && invalidRolls.size < 6) {
        let attempts = 0;
        while (invalidRolls.has(roll) && attempts < 100) {
          if (player.consecutiveSixes >= 2) {
            roll = Math.floor(Math.random() * 5) + 1;
          } else {
            roll = isGuaranteedSix ? 6 : rollDice();
          }
          attempts++;
        }
      }
    }
    */

    // Forced snake bite logic near the end of the board (Issue 1) - COMMENTED OUT PER USER REQUEST
    let isForcedBackwards = false;
    let nearestSnake = null;
    /*
    const CRITICAL_ZONE_START = 85;
    if (activeGame === "snake-ladder" && player.position >= CRITICAL_ZONE_START && !player.hasBeenBittenBySnake) {
      const boardSnakes = boardRef.current ? boardRef.current.snakes : [];
      if (boardSnakes.length > 0) {
        let minDistance = Infinity;
        for (const s of boardSnakes) {
          if (gameMode === "beast-snakes" && s.type === "rainbow") continue;
          const dist = Math.abs(s.head - player.position);
          if (dist < minDistance) {
            minDistance = dist;
            nearestSnake = s;
          }
        }
        if (nearestSnake) {
          const dist = nearestSnake.head - player.position;
          if (dist >= 1 && dist <= 6) {
            roll = dist;
          } else if (dist > 6) {
            if (player.position + roll >= nearestSnake.head) {
              roll = nearestSnake.head - player.position;
            }
          } else if (dist < 0) {
            isForcedBackwards = true;
            if (roll === 6) {
              roll = Math.floor(Math.random() * 5) + 1; // Prevent extra turn
            }
          }
        }
      }
    }

    /*
    // Custom Snake game win eligibility rules (not for Ludo) - COMMENTED OUT PER USER REQUEST
    if (activeGame === "snake-ladder") {
      const winningRoll = 100 - player.position;
      if (winningRoll >= 1 && winningRoll <= 6) {
        // const hasSnakeBite = player.hasBeenBittenBySnake === true; // COMMENTED OUT PER USER REQUEST
        const allPlayersInZone = playersRef.current.every(p => p.position >= 80);
        if (!allPlayersInZone) { // Changed from (!hasSnakeBite || !allPlayersInZone)
          while (roll === winningRoll) {
            if (player.consecutiveSixes >= 2) {
              roll = Math.floor(Math.random() * 5) + 1;
            } else {
              roll = rollDice();
            }
          }
        }
      }
    }
    */

    setDiceValue(roll);

    const prevSixes = player.consecutiveSixes || 0;
    const nextSixes = roll === 6 ? prevSixes + 1 : 0;

    setPlayers(prev => prev.map(p => 
      p.id === player.id 
        ? { ...p, lastRoll: roll, consecutiveSixes: nextSixes } 
        : p
    ));

    // Broadcast dice roll event so other screens start spinning
    if (isOnline && broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: "broadcast",
        event: "dice-rolling",
        payload: { playerId: player.id, roll }
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsDiceRolling(false);
    await new Promise(resolve => setTimeout(resolve, 300));

    if (roll === 6) {
      playSixSound();
    }

    const latestBoard = boardRef.current;
    const latestPlayers = playersRef.current;
    const currentPlayer = latestPlayers.find(p => p.id === player.id);

    if (!currentPlayer || !latestBoard) {
      setIsRolling(false);
      return;
    }

    if (nextSixes === 3) {
      addLog(`⚠️ 3 consecutive sixes! ${player.name}'s turn is skipped.`);
      
      if (isOnline && broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: "broadcast",
          event: "turn-animation",
          payload: { 
            playerId: player.id, 
            roll, 
            startPos: player.position, 
            targetPos: player.position, 
            boardElements: { type: "none" },
            isAutoRoll
          }
        });
      }

      if (isOnline) {
        try {
          const { data: game } = await supabase
            .from("games")
            .select("id")
            .eq("code", gameCode)
            .single();

          if (game) {
            await supabase
              .from("game_players")
              .update({
                position: player.position,
                unlock_attempts: player.unlockAttempts || 0,
                last_roll: roll
              })
              .eq("game_id", game.id)
              .eq("client_player_id", player.id);

            const nextTurnIndex = (currentTurnIndex + 1) % players.length;
            const updatedLogs = [`⚠️ 3 consecutive sixes! ${player.name}'s turn is skipped.`, ...logs].slice(0, 5);
            
            await supabase
              .from("games")
              .update({
                current_turn_index: nextTurnIndex,
                dice_value: roll,
                logs: updatedLogs
              })
              .eq("id", game.id);
          }
        } catch (err) {
          console.error("Failed to sync turn to database:", err);
        }
      }

      nextTurn();
      setIsRolling(false);

      if (isOnline && isHost) {
        handleTimeoutTracking(player.id, isAutoRoll);
      }
      return;
    }

    let currentPos = currentPlayer.position;
    let updatedAttempts = currentPlayer.unlockAttempts || 0;
    let grantsAnotherTurn = false;
    let logMsg = "";
    let boardElements = { type: "none" };

    let outcome;
    /*
    if (isForcedBackwards && nearestSnake) {
      outcome = {
        position: nearestSnake.tail,
        message: `Forced backwards to land on a snake! Slide down from ${nearestSnake.head} to ${nearestSnake.tail}.`,
        wasSafeSnake: false,
        grantsAnotherTurn: false,
        updatedAttempts: 0
      };
    } else {
      outcome = calculateNewPosition(currentPos, roll, latestBoard, currentPlayer, gameMode);
    }
    */
    outcome = calculateNewPosition(currentPos, roll, latestBoard, currentPlayer, gameMode);
    const finalPos = outcome.position;
    logMsg = outcome.message;
    grantsAnotherTurn = outcome.grantsAnotherTurn;
    updatedAttempts = outcome.updatedAttempts;

    // Persist final target state to localStorage immediately to survive mid-animation refreshes!
    if (!isOnline) {
      try {
        const nextTurnIndex = outcome.grantsAnotherTurn ? currentTurnIndex : (currentTurnIndex + 1) % players.length;
        const updatedPlayersForStorage = players.map(p => 
          p.id === player.id 
            ? { 
                ...p, 
                position: finalPos, 
                lastRoll: roll,
                consecutiveSixes: nextSixes,
                unlockAttempts: updatedAttempts
              } 
            : p
        );
        const updatedLogsForStorage = [`${player.name}: ${outcome.message}`, ...logs].slice(0, 5);

        localStorage.setItem("snake_game_players", JSON.stringify(updatedPlayersForStorage));
        localStorage.setItem("snake_game_currentTurnIndex", JSON.stringify(nextTurnIndex));
        localStorage.setItem("snake_game_diceValue", JSON.stringify(roll));
        localStorage.setItem("snake_game_logs", JSON.stringify(updatedLogsForStorage));
        if (finalPos === 100) {
          localStorage.setItem("snake_game_winner", JSON.stringify(currentPlayer));
        }
      } catch (e) {
        console.error("Failed to persist mid-turn state to localStorage:", e);
      }
    }

    if (currentPos === 0) {
      if (roll === 6) {
        playMoveSound();
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: 1, unlockAttempts: 0, lastRoll: roll } : p));
        await new Promise(resolve => setTimeout(resolve, 600));
        currentPos = 1;
      } else {
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, unlockAttempts: updatedAttempts, lastRoll: roll } : p));
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    } /* else if (isForcedBackwards && nearestSnake) {
      // Walk backwards to the snake head
      for (let step = currentPos - 1; step >= nearestSnake.head; step--) {
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: step, isWalking: true, lastRoll: roll } : p));
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isWalking: false } : p));
      currentPos = nearestSnake.head;
      await new Promise(resolve => setTimeout(resolve, 400));

      // Slide down the snake
      boardElements = { type: "snake", tail: finalPos };
      setPlayers(prev => prev.map(p => 
        p.id === player.id 
          ? { 
              ...p, 
              isPanicking: true, 
              snakeBiteCount: (p.snakeBiteCount || 0) + 1,
              hasBeenBittenBySnake: true 
            } 
          : p
      ));
      await new Promise(resolve => setTimeout(resolve, 750));
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isPanicking: false, isSwallowed: true } : p));
      await new Promise(resolve => setTimeout(resolve, 50));
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: finalPos } : p));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isSwallowed: false } : p));
      currentPos = finalPos;
    } */ else if (gameMode === "beast-snakes" && finalPos === currentPos) {
      // Frozen and did not roll a 6
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, unlockAttempts: updatedAttempts, lastRoll: roll } : p));
      await new Promise(resolve => setTimeout(resolve, 600));
    } else if (gameMode === "beast-snakes" && outcome.message.includes("Panicked!")) {
      // Walk backwards due to panic
      for (let step = currentPos - 1; step >= finalPos; step--) {
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: step, isWalking: true, lastRoll: roll } : p));
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isWalking: false, unlockAttempts: updatedAttempts } : p));
      currentPos = finalPos;
      await new Promise(resolve => setTimeout(resolve, 400));
    } else {
      // Normal walk forward (including poisoned halved rolls)
      let walkDist = roll;
      if (gameMode === "beast-snakes") {
        const unlockAttempts = currentPlayer.unlockAttempts || 0;
        if (unlockAttempts >= 200 && unlockAttempts <= 202) {
          walkDist = Math.max(1, Math.floor(roll / 2));
        }
      }

      const intermediatePos = currentPos + walkDist;

      if (intermediatePos <= 100) {
        for (let step = currentPos + 1; step <= intermediatePos; step++) {
          playMoveSound();
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: step, isWalking: true, lastRoll: roll } : p));
          await new Promise(resolve => setTimeout(resolve, 350));
        }
        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isWalking: false, unlockAttempts: updatedAttempts } : p));
        currentPos = intermediatePos;
        await new Promise(resolve => setTimeout(resolve, 400));

        // Check for slides / climbs
        if (finalPos > intermediatePos) {
          // Climbing ladder
          playLadderSound();
          boardElements = { type: "ladder", top: finalPos };
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isClimbing: true } : p));
          await new Promise(resolve => setTimeout(resolve, 50));
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: finalPos, unlockAttempts: updatedAttempts } : p));
          await new Promise(resolve => setTimeout(resolve, 900));
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isClimbing: false, unlockAttempts: updatedAttempts } : p));
          currentPos = finalPos;
        } else if (finalPos < intermediatePos) {
          // Sliding snake
          playSnakeBiteSound();
          boardElements = { type: "snake", tail: finalPos };
          setPlayers(prev => prev.map(p => 
            p.id === player.id 
              ? { 
                  ...p, 
                  isPanicking: true, 
                  snakeBiteCount: (p.snakeBiteCount || 0) + 1,
                  hasBeenBittenBySnake: true
                } 
              : p
          ));
          await new Promise(resolve => setTimeout(resolve, 750));
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isPanicking: false, isSwallowed: true } : p));
          await new Promise(resolve => setTimeout(resolve, 50));
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: finalPos, unlockAttempts: updatedAttempts } : p));
          await new Promise(resolve => setTimeout(resolve, 1000));
          setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isSwallowed: false, unlockAttempts: updatedAttempts } : p));
          currentPos = finalPos;
        }
      }
    }

    addLog(`${player.name}: ${logMsg}`);

    // Broadcast the action details to animate in perfect visual sync on other clients
    if (isOnline && broadcastChannelRef.current) {
      broadcastChannelRef.current.send({
        type: "broadcast",
        event: "turn-animation",
        payload: { 
          playerId: player.id, 
          roll, 
          startPos: player.position, 
          targetPos: currentPos, 
          boardElements,
          isAutoRoll
        }
      });
    }

    const nextTurnIndex = grantsAnotherTurn ? currentTurnIndex : (currentTurnIndex + 1) % players.length;
    const isRoundCompleted = !grantsAnotherTurn && nextTurnIndex === 0;

    let nextBoardLocal = board;
    let localPlayersUpdated = [...playersRef.current];
    
    if (gameMode === "shuffle-snake" && isRoundCompleted && board) {
      const newRounds = (board.completedRounds || 0) + 1;
      const shouldShuffle = (newRounds % (board.shuffleInterval || 1) === 0);
      if (shouldShuffle) {
        nextBoardLocal = shuffleBoardElements(board, setupSnakesCount || 3, setupLaddersCount || 5, gameMode, true, board.shuffleLadders);
        
        let shuffledText = board.shuffleLadders 
          ? "🌀 Shifting ground! Snakes and Ladders have rotated positions!" 
          : "🌀 Shifting ground! Snakes have shuffled positions!";
        logMsg = `${shuffledText}\n` + logMsg;

        // Perform immediate collision detection for all players on the board
        localPlayersUpdated = localPlayersUpdated.map(p => {
          let startCheckPos = p.position;
          // If p is the active player who just rolled, start checking from their NEW turn position!
          if (p.id === player.id) {
            startCheckPos = currentPos;
          }

          if (startCheckPos > 0 && startCheckPos < 100) {
            let finalPos = startCheckPos;
            let updatedBiteCount = p.snakeBiteCount || 0;
            let hasBeenBitten = p.hasBeenBittenBySnake || false;

            // 1. Check newly shuffled snakes
            const snake = nextBoardLocal.snakes.find(s => s.head === startCheckPos);
            if (snake) {
              const isOwnSnake = gameMode !== "classic" && startCheckPos === p.ownSnakeNumber;
              /*
              const isSecretlyImmune = updatedBiteCount >= 5;
              */

              if (isOwnSnake) {
                logMsg += `\n🛡️ ${p.name} landed on their own immune snake at ${snake.head}! Safe!`;
              /*
              } else if (isSecretlyImmune) {
                logMsg += `\n🛡️ ${p.name} has already been bitten 5 times! Secretly immune!`;
              */
              } else {
                finalPos = snake.tail;
                updatedBiteCount += 1;
                hasBeenBitten = true;
                logMsg += `\n💥 Shifting ground! ${p.name} was swallowed by a new snake head at ${snake.head} and slid down to ${snake.tail}!`;
              }
            }

            // 2. Check newly shuffled ladders
            const ladder = nextBoardLocal.ladders.find(l => l.bottom === startCheckPos);
            if (ladder) {
              finalPos = ladder.top;
              logMsg += `\n🚀 Shifting ground! A new ladder appeared under ${p.name} at ${ladder.bottom} and boosted them to ${ladder.top}!`;
            }

            return {
              ...p,
              position: finalPos,
              snakeBiteCount: updatedBiteCount,
              hasBeenBittenBySnake: hasBeenBitten,
              unlockAttempts: p.id === player.id ? updatedAttempts : p.unlockAttempts,
              lastRoll: p.id === player.id ? roll : p.lastRoll,
              isWalking: p.id === player.id ? false : (p.isWalking || false),
              isClimbing: p.id === player.id ? false : (p.isClimbing || false),
              isSwallowed: p.id === player.id ? false : (p.isSwallowed || false),
              isPanicking: p.id === player.id ? false : (p.isPanicking || false)
            };
          } else if (p.id === player.id) {
            return {
              ...p,
              position: currentPos,
              unlockAttempts: updatedAttempts,
              lastRoll: roll,
              isWalking: false,
              isClimbing: false,
              isSwallowed: false,
              isPanicking: false
            };
          }
          return p;
        });

      } else {
        nextBoardLocal = { ...board };
        localPlayersUpdated = localPlayersUpdated.map(p => 
          p.id === player.id 
            ? { 
                ...p, 
                position: currentPos, 
                unlockAttempts: updatedAttempts, 
                lastRoll: roll,
                isWalking: false,
                isClimbing: false,
                isSwallowed: false,
                isPanicking: false
              } 
            : p
        );
      }
      nextBoardLocal.shuffleInterval = board.shuffleInterval;
      nextBoardLocal.shuffleLadders = board.shuffleLadders;
      nextBoardLocal.completedRounds = newRounds;
      setBoard(nextBoardLocal);
      setPlayers(localPlayersUpdated);
    } else {
      localPlayersUpdated = localPlayersUpdated.map(p => 
        p.id === player.id 
          ? { 
              ...p, 
              position: currentPos, 
              unlockAttempts: updatedAttempts, 
              lastRoll: roll,
              isWalking: false,
              isClimbing: false,
              isSwallowed: false,
              isPanicking: false
            } 
          : p
      );
      setPlayers(localPlayersUpdated);
    }

    if (!isOnline && isRoundCompleted && gameMode === "shuffle-snake") {
      try {
        localStorage.setItem("snake_game_board", JSON.stringify(nextBoardLocal));
      } catch (e) {
        console.error("Failed to persist shuffled board state:", e);
      }
    }

    if (currentPos === 100) {
      setWinner(currentPlayer);
      addLog(`🎉 ${player.name} wins the game! 🎉`);
    } else {
      if (!grantsAnotherTurn) {
        nextTurn();
      }
    }

    // Sync final turn state to database source-of-truth
    if (isOnline) {
      try {
        const { data: game } = await supabase
          .from("games")
          .select("id")
          .eq("code", gameCode)
          .single();

        if (game) {
          let hasShuffledAndSyncedCurrentPlayer = false;
          let updatedLogs = [`${player.name}: ${logMsg}`, ...logs].slice(0, 5);
          
          const updatePayload = {
            current_turn_index: nextTurnIndex,
            dice_value: roll,
            logs: updatedLogs
          };

          if (isHost && isRoundCompleted && gameMode === "shuffle-snake" && board) {
            const newRounds = (board.completedRounds || 0) + 1;
            const shouldShuffle = (newRounds % (board.shuffleInterval || 1) === 0);
            let nextBoardOnline;
            
            if (shouldShuffle) {
              hasShuffledAndSyncedCurrentPlayer = true;
              nextBoardOnline = shuffleBoardElements(board, setupSnakesCount || 3, setupLaddersCount || 5, gameMode, true, board.shuffleLadders);
              
              let shuffledText = board.shuffleLadders 
                ? "🌀 Shifting ground! Snakes and Ladders have rotated positions!" 
                : "🌀 Shifting ground! Snakes have shuffled positions!";
              updatedLogs = [shuffledText, ...updatedLogs].slice(0, 5);

              const playerUpdates = playersRef.current.map(async (p) => {
                let startCheckPos = p.position;
                if (p.id === player.id) {
                  startCheckPos = currentPos;
                }

                if (startCheckPos > 0 && startCheckPos < 100) {
                  let finalPos = startCheckPos;
                  let updatedBiteCount = p.snakeBiteCount || 0;
                  let hasBeenBitten = p.hasBeenBittenBySnake || false;

                  // 1. Check newly shuffled snakes
                  const snake = nextBoardOnline.snakes.find(s => s.head === startCheckPos);
                  if (snake) {
                    const isOwnSnake = gameMode !== "classic" && startCheckPos === p.ownSnakeNumber;
                    /*
                    const isSecretlyImmune = updatedBiteCount >= 5;
                    */

                    if (!isOwnSnake) { // Removed: && !isSecretlyImmune
                      finalPos = snake.tail;
                      updatedBiteCount += 1;
                      hasBeenBitten = true;
                      updatedLogs = [`💥 Shifting ground! ${p.name} was swallowed by a new snake head at ${snake.head} and slid down to ${snake.tail}!`, ...updatedLogs].slice(0, 5);
                    }
                  }

                  // 2. Check newly shuffled ladders
                  const ladder = nextBoardOnline.ladders.find(l => l.bottom === startCheckPos);
                  if (ladder) {
                    finalPos = ladder.top;
                    updatedLogs = [`🚀 Shifting ground! A new ladder appeared under ${p.name} at ${ladder.bottom} and boosted them to ${ladder.top}!`, ...updatedLogs].slice(0, 5);
                  }

                  const isCurrentPlayer = p.id === player.id;
                  const upd = {
                    position: finalPos,
                    unlock_attempts: isCurrentPlayer ? updatedAttempts : p.unlockAttempts,
                    last_roll: isCurrentPlayer ? roll : p.lastRoll
                  };
                  return supabase
                    .from("game_players")
                    .update(upd)
                    .eq("game_id", game.id)
                    .eq("client_player_id", p.id);
                } else if (p.id === player.id) {
                  // Current player was at home (position 0), update their unlock attempts/roll
                  const upd = {
                    position: currentPos,
                    unlock_attempts: updatedAttempts,
                    last_roll: roll
                  };
                  return supabase
                    .from("game_players")
                    .update(upd)
                    .eq("game_id", game.id)
                    .eq("client_player_id", p.id);
                }
                return null;
              }).filter(Boolean);
              await Promise.all(playerUpdates);

            } else {
              nextBoardOnline = { ...board };
            }
            nextBoardOnline.shuffleInterval = board.shuffleInterval;
            nextBoardOnline.shuffleLadders = board.shuffleLadders;
            nextBoardOnline.completedRounds = newRounds;
            updatePayload.board = nextBoardOnline;
            updatePayload.logs = updatedLogs;
          }

          if (currentPos === 100) {
            updatePayload.winner_id = player.id;
            updatePayload.status = "finished";
          }

          if (!hasShuffledAndSyncedCurrentPlayer) {
            await supabase
              .from("game_players")
              .update({
                position: currentPos,
                unlock_attempts: updatedAttempts,
                last_roll: roll
              })
              .eq("game_id", game.id)
              .eq("client_player_id", player.id);
          }

          await supabase
            .from("games")
            .update(updatePayload)
            .eq("id", game.id);
        }
      } catch (err) {
        console.error("Failed to sync turn to database:", err);
      }
    }

    setIsRolling(false);

    if (isOnline && isHost) {
      handleTimeoutTracking(player.id, isAutoRoll);
    }
  };

  // Bot logic inside useEffect (players is NOT a dependency to prevent infinite loops)
  useEffect(() => {
    const latestPlayers = playersRef.current;
    const activePlayer = latestPlayers[currentTurnIndex];
    if (inGame && !winner && activePlayer?.isBot && !isRolling) {
      const timer = setTimeout(() => {
        executeTurn(activePlayer);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [inGame, winner, currentTurnIndex, isRolling]);

  // Automated Ludo Bot Roll and Move triggers (Robust sync loop completely solves bot stuck/AFK bugs)
  useEffect(() => {
    if (ludoGamePhase !== "playing" || ludoWinner) return;

    const latestPlayers = ludoPlayersRef.current;
    if (latestPlayers.length === 0) return;

    const activeIdx = ludoCurrentTurnIndex;
    const activePlayer = latestPlayers[activeIdx];
    if (!activePlayer || !activePlayer.isBot) return;

    // Bot needs to ROLL the dice
    if (ludoDiceValue === null && !ludoIsRolling && !ludoIsDiceRolling) {
      const timer = setTimeout(() => {
        handleLudoRoll();
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Bot needs to MOVE a token
    if (ludoDiceValue !== null && !ludoIsRolling && !ludoIsDiceRolling) {
      const legals = getLegalMoves(latestPlayers, activeIdx, ludoDiceValue, ludoVariation);
      if (legals.length > 0) {
        const timer = setTimeout(() => {
          const bestTokenIdx = getBotAIMove(latestPlayers, activeIdx, legals, ludoDiceValue, ludoVariation);
          handleSelectLudoToken(latestPlayers, activeIdx, bestTokenIdx, ludoDiceValue);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [ludoGamePhase, ludoWinner, ludoCurrentTurnIndex, ludoDiceValue, ludoIsRolling, ludoIsDiceRolling]);

  // Auto-play timer for online multi-device games
  useEffect(() => {
    if (!inGame || winner || isRolling || isDiceRolling || !isOnline) return;

    const latestPlayers = playersRef.current;
    const activePlayer = latestPlayers[currentTurnIndex];
    if (!activePlayer || activePlayer.isBot) return;

    // Check if the current client is the active player
    const isActivePlayerClient = activePlayer.id === myPlayerId;

    // Check if the current client is the host
    const isHostClient = isHost;

    let timeoutMs = 0;
    if (isActivePlayerClient) {
      timeoutMs = 10000; // 10 seconds for the active player
    } else if (isHostClient) {
      timeoutMs = 12000; // 12 seconds for the host (fallback in case of disconnect/AFK)
    }

    if (timeoutMs > 0) {
      const timer = setTimeout(() => {
        console.log(`Auto-rolling for ${activePlayer.name} after ${timeoutMs}ms of inactivity...`);
        executeTurn(activePlayer, true);
      }, timeoutMs);

      return () => clearTimeout(timer);
    }
  }, [inGame, winner, currentTurnIndex, isRolling, isDiceRolling, isOnline, isHost, myPlayerId]);


  const generateConfettiParticles = () => {
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"];
    return Array.from({ length: 45 }).map((_, i) => {
      const left = Math.random() * 100; // % from left
      const delay = Math.random() * 5; // seconds delay
      const duration = 3 + Math.random() * 3; // seconds fall duration
      const sizeWidth = 8 + Math.random() * 8; // px width
      const sizeHeight = 12 + Math.random() * 12; // px height
      const background = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * 360;
      
      return (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${left}%`,
            width: `${sizeWidth}px`,
            height: `${sizeHeight}px`,
            background: background,
            transform: `rotate(${rotation}deg)`,
            animationDelay: `${delay}s, ${delay}s`,
            animationDuration: `${duration}s, 3s`,
          }}
        />
      );
    });
  };

  return (
    <main className="app-main">
      <style>{`
        .app-main {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .app-main {
            padding: 0.5rem !important;
          }
        }

        .desktop-only {
          display: flex !important;
        }
        .mobile-only {
          display: none !important;
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }

        .tabletop-grid {
          display: grid;
          grid-template-columns: 130px 1fr 130px;
          gap: 1.5rem;
          align-items: center;
          width: 100%;
          justify-content: center;
          max-width: 850px;
        }
        .tabletop-column {
          display: flex;
          flex-direction: column;
          gap: 4rem;
          height: 100%;
          justify-content: space-between;
          padding: 2rem 0;
        }
        @media (max-width: 768px) {
          .tabletop-grid {
            grid-template-columns: 1fr !important;
            gap: 0.5rem !important;
          }
          .tabletop-column {
            flex-direction: row !important;
            justify-content: center !important;
            gap: 1rem !important;
            height: auto !important;
            padding: 0.5rem 0 !important;
          }
        }
        @media (max-width: 1150px) and (min-width: 769px) {
          .tabletop-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 1rem !important;
            max-width: 600px !important;
          }
          .tabletop-grid > :nth-child(1) {
            grid-column: 1 !important;
            grid-row: 1 !important;
            flex-direction: row !important;
            justify-content: flex-end !important;
            gap: 1rem !important;
            height: auto !important;
            padding: 0.5rem 0 !important;
          }
          .tabletop-grid > :nth-child(3) {
            grid-column: 2 !important;
            grid-row: 1 !important;
            flex-direction: row !important;
            justify-content: flex-start !important;
            gap: 1rem !important;
            height: auto !important;
            padding: 0.5rem 0 !important;
          }
          .tabletop-grid > :nth-child(2) {
            grid-column: 1 / span 2 !important;
            grid-row: 2 !important;
            width: 100% !important;
            max-width: 550px !important;
            margin: 0 auto !important;
          }
        }

        /* Victory Screen Keyframes & Styles */
        .victory-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          opacity: 0;
          animation: victory-fade-in 0.5s ease-out forwards;
          overflow: hidden;
        }
        
        .victory-card {
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          width: 90%;
          max-width: 540px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transform: scale(0.7) translateY(30px);
          opacity: 0;
          animation: victory-card-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
          position: relative;
          z-index: 10002;
          overflow: hidden;
        }

        .victory-crown-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 1.5rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .victory-rays {
          position: absolute;
          width: 160px;
          height: 160px;
          opacity: 0.4;
          animation: victory-ray-spin 12s linear infinite;
          border-radius: 50%;
        }

        .victory-crown {
          font-size: 5rem;
          filter: drop-shadow(0 0 15px rgba(253, 224, 71, 0.6));
          z-index: 2;
          animation: victory-crown-bounce 3s ease-in-out infinite;
        }

        .victory-title {
          font-size: 2.6rem;
          font-weight: 800;
          margin: 1rem 0;
          background: linear-gradient(135deg, #ffffff 30%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }

        .victory-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }

        /* Pure CSS Confetti Shower */
        .confetti-particle {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 20px;
          border-radius: 2px;
          opacity: 0.95;
          pointer-events: none;
          z-index: 10001;
          animation-name: confetti-fall, confetti-drift;
          animation-timing-function: linear, ease-in-out;
          animation-iteration-count: infinite, infinite;
          animation-direction: normal, alternate;
        }

        @keyframes victory-fade-in {
          to { opacity: 1; }
        }

        @keyframes victory-card-pop {
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes victory-ray-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes victory-crown-bounce {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          50% { transform: translateY(-12px) scale(1.08) rotate(5deg); }
        }

        @keyframes confetti-fall {
          0% { transform: translateY(-50px) rotate(0deg); }
          100% { transform: translateY(105vh) rotate(720deg); }
        }

        @keyframes confetti-drift {
          0% { margin-left: -20px; }
          100% { margin-left: 20px; }
        }
      `}</style>

      <button
        onClick={handleToggleMute}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          outline: "none"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
          e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.4)";
          e.currentTarget.style.boxShadow = "0 8px 32px 0 rgba(236, 72, 153, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.25)";
          e.currentTarget.style.boxShadow = "0 8px 32px 0 rgba(31, 38, 135, 0.37)";
        }}
        aria-label={isSoundMuted ? "Unmute sounds" : "Mute sounds"}
        title={isSoundMuted ? "Unmute sounds" : "Mute sounds"}
      >
        {isSoundMuted ? "🔇" : "🔊"}
      </button>

      {activeGame === null ? (
              <GameSelectionComponent
          onSelectGame={(game) => {
            setActiveGame(game);
            if (game === "ludo") {
              // Reset ALL Ludo state cleanly — prevents stale localStorage board renders
              setLudoPlayers([]);
              setLudoCurrentTurnIndex(0);
              setLudoDiceValue(null);
              setLudoWinner(null);
              setLudoLogs([]);
              setLudoLegalMoves([]);
              setLudoConsecutiveSixes(0);
              setLudoGamePhase("lobby"); // Always start at lobby

              // Clean Ludo Online states completely!
              setLudoIsOnline(false);
              setLudoGameCode("");
              setLudoIsHost(false);
              setLudoJoinedPlayers([]);
              setLudoIsConnecting(false);
              try {
                localStorage.removeItem("snake_game_ludoIsOnline");
                localStorage.removeItem("snake_game_ludoGameCode");
                localStorage.removeItem("snake_game_ludoIsHost");
              } catch (e) {
                console.error("Failed to clean Ludo online state on game selection", e);
              }
            } else {
              setGameMode(null);
              setInGame(false);
            }
          }}
          onShowGeneralRules={handleShowRules}
        />
      ) : activeGame === "snake-ladder" ? (
        !inGame ? (
          gameMode === null ? (
            <ModeSelectionComponent 
              onSelectMode={(mode) => setGameMode(mode)} 
              onShowRules={handleShowRules}
              onBack={() => setActiveGame(null)}
            />
          ) : (
            <LobbyComponent
              onStart={startGame}
              onBack={() => setGameMode(null)}
              gameMode={gameMode}
              initialTheme={activeTheme}
              onlineState={{
                isOnline,
                gameCode,
                joinedPlayers,
                isHost,
                myPlayerId,
                isConnecting
              }}
              onCreateOnlineRoom={handleCreateOnlineRoom}
              onJoinOnlineRoom={handleJoinOnlineRoom}
              onStartOnlineGame={handleStartOnlineGame}
              onLeaveOnlineRoom={handleLeaveOnlineRoom}
              onToggleOnlineMode={setIsOnline}
            />
          )
        ) : (
          <div style={{ display: "flex", gap: "2rem", width: "100%", maxWidth: "1250px", flexWrap: "wrap", justifyContent: "center" }}>

            {/* Game Board Tabletop Container */}
            <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h1 className="title-glow" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>Snake Ladder</h1>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "4px 12px",
                  borderRadius: "16px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}>
                  Mode: {gameMode === "classic" && "Classic Mode 🎲"}
                  {gameMode === "own-snake" && "Own-Snake Mode 👑"}
                  {gameMode === "negative-snake" && "Negative Snake Mode 🐍"}
                  {gameMode === "beast-snakes" && "Beast-Snakes Mode 🦖"}
                  {gameMode === "shuffle-snake" && "Shuffle Snake Mode 🌀"}
                </span>
                {board && (
                  <span style={{
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    color: "var(--text-light)",
                    letterSpacing: "0.5px"
                  }}>
                    Round: {(board.completedRounds || 0) + 1}
                  </span>
                )}
                {board && gameMode === "shuffle-snake" && (
                  <span style={{
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    background: "rgba(139, 92, 246, 0.15)",
                    border: "1px solid rgba(139, 92, 246, 0.4)",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    color: "#a78bfa",
                    letterSpacing: "0.5px"
                  }}>
                    🌀 Next Shuffle: Round {Math.ceil(((board.completedRounds || 0) + 1) / (board.shuffleInterval || 1)) * (board.shuffleInterval || 1)}
                  </span>
                )}
                <button
                  onClick={() => handleShowRules(gameMode)}
                  style={{
                    fontSize: "0.75rem",
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "var(--primary)",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99, 102, 241, 0.3)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Rules 📖
                </button>
              </div>

              {/* Tabletop Layout with Board & Corner Cards */}
              <div className="tabletop-grid">

                {/* Left Column (P1 Top, P3 Bottom) */}
                <div className="tabletop-column desktop-only">
                  <PlayerCornerCard
                    player={players[0]}
                    isActive={currentTurnIndex === 0}
                    isRolling={isRolling}
                    isDiceRolling={isDiceRolling}
                    onRoll={handleRoll}
                    theme={activeTheme}
                  />
                  <PlayerCornerCard
                    player={players[2]}
                    isActive={currentTurnIndex === 2}
                    isRolling={isRolling}
                    isDiceRolling={isDiceRolling}
                    onRoll={handleRoll}
                    theme={activeTheme}
                  />
                </div>

                {/* Center Column (GameBoard Component) */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", maxWidth: "550px", margin: "0 auto" }}>
                  
                  {/* Mobile Players Row (above board) */}
                  {board && (
                    <div className="mobile-only" style={{ width: "100%", justifyContent: "center", gap: "6px", marginBottom: "1rem", flexWrap: "wrap" }}>
                      {players.map((p, idx) => {
                        const isActive = idx === currentTurnIndex;
                        return (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                              border: isActive ? `1.5px solid ${p.color}` : "1.5px solid rgba(255,255,255,0.05)",
                              boxShadow: isActive ? `0 0 10px ${p.color}44` : "none",
                              transform: isActive ? "scale(1.05)" : "scale(1)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color }} />
                            <span style={{ 
                              fontSize: "0.75rem", 
                              fontWeight: isActive ? "bold" : "normal", 
                              color: isActive ? "white" : "var(--text-muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              {p.name}: {p.position}
                              <span style={{ fontSize: "0.68rem", opacity: 0.85, background: "rgba(0,0,0,0.2)", padding: "1px 5px", borderRadius: "6px" }}>🐍{p.snakeBiteCount || 0}</span>
                              {p.consecutiveSixes > 0 && (
                                <span style={{ color: "#ff8c00", fontWeight: "bold", fontSize: "0.68rem" }}>🔥{p.consecutiveSixes}x6</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {board && <GameBoardComponent board={board} players={players} gameMode={gameMode} theme={activeTheme} />}

                  {/* Mobile Active Player Panel & Controls (below board) */}
                  {board && (
                    <div className="mobile-only" style={{ width: "100%", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
                      
                      {/* Compact Roll Card & Dice */}
                      <div 
                        className="glass" 
                        style={{ 
                          width: "100%", 
                          maxWidth: "340px", 
                          padding: "0.75rem 1rem", 
                          borderRadius: "16px",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          border: `1.5px solid ${players[currentTurnIndex]?.color}88`,
                          boxShadow: `0 0 15px ${players[currentTurnIndex]?.color}22`
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Active Turn</div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: players[currentTurnIndex]?.color }}>
                              {players[currentTurnIndex]?.name} {players[currentTurnIndex]?.isBot && "🤖"}
                            </div>
                            <span style={{ 
                              fontSize: "0.75rem", 
                              fontWeight: "bold",
                              background: "rgba(0,0,0,0.2)", 
                              padding: "2px 6px", 
                              borderRadius: "8px", 
                              color: "var(--text-light)",
                              display: "flex",
                              alignItems: "center"
                            }}>
                              🐍 {players[currentTurnIndex]?.snakeBiteCount || 0}
                            </span>
                          </div>
                          {players[currentTurnIndex]?.isBot ? (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", animation: "pulse 1.5s infinite" }}>🤖 Thinking...</div>
                          ) : (
                            <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: players[currentTurnIndex]?.color, animation: "pulse 1.5s infinite" }}>🎯 Tap Die to Roll!</div>
                          )}
                        </div>

                        {/* Centered Rollable Dice */}
                        <div 
                          onClick={() => {
                            if (!isRolling && !players[currentTurnIndex]?.isBot) {
                              handleRoll();
                            }
                          }}
                          style={{
                            cursor: (!isRolling && !players[currentTurnIndex]?.isBot) ? "pointer" : "default",
                            transform: "scale(0.85)",
                            margin: "-10px 0"
                          }}
                        >
                          <Premium3DDice
                            value={players[currentTurnIndex]?.lastRoll || 1}
                            color={players[currentTurnIndex]?.color}
                            isRolling={isDiceRolling}
                            theme={activeTheme}
                          />
                        </div>
                      </div>

                      {/* Compact Logs & Quick Buttons */}
                      <div className="glass" style={{ width: "100%", maxWidth: "340px", padding: "0.5rem 1rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontWeight: "500" }}>
                          <span style={{ fontSize: "0.9rem" }}>📝</span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {logs[0] || "Waiting to start..."}
                          </span>
                        </div>
                      </div>

                      {/* Mobile In-Game Theme Selector */}
                      <div className="glass" style={{ width: "100%", maxWidth: "340px", padding: "0.75rem 1rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-main)" }}>Board Theme 🎨</span>
                          {isOnline && (
                            <span style={{ fontSize: "0.65rem", background: isHost ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: isHost ? "#10b981" : "#ef4444", padding: "1px 5px", borderRadius: "4px", fontWeight: "bold" }}>
                              {isHost ? "Host" : "Guest"}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.35rem", width: "100%" }}>
                          {Object.keys(THEME_CONFIGS).map((themeKey) => {
                            const isSelected = activeTheme === themeKey;
                            const isAllowed = !isOnline || isHost;
                            return (
                              <button
                                key={themeKey}
                                onClick={() => {
                                  if (isAllowed) {
                                    handleThemeChange(themeKey);
                                  }
                                }}
                                disabled={!isAllowed}
                                style={{
                                  flex: 1,
                                  padding: "6px 2px",
                                  fontSize: "0.75rem",
                                  borderRadius: "6px",
                                  border: isSelected ? "1.5px solid var(--p1-color)" : "1.5px solid rgba(255,255,255,0.1)",
                                  background: isSelected ? "var(--p1-color)" : "rgba(255,255,255,0.02)",
                                  color: isSelected ? "white" : "var(--text-muted)",
                                  cursor: isAllowed ? "pointer" : "not-allowed",
                                  opacity: isAllowed ? 1 : 0.45,
                                  transition: "all 0.2s ease"
                                }}
                              >
                                {themeKey === "classic" && "🎲"}
                                {themeKey === "neon" && "✨"}
                                {themeKey === "forest" && "🌿"}
                                {themeKey === "space" && "🌌"}
                                {themeKey === "sakura" && "🌸"}
                                {themeKey === "candy" && "🍭"}
                              </button>
                            );
                          })}
                        </div>
                        {isOnline && !isHost && (
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textAlign: "center" }}>
                            Only the host can change the theme.
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          if (confirm("Are you sure you want to exit the current match? All progress will be lost.")) {
                            exitGame();
                          }
                        }}
                        style={{ width: "100%", maxWidth: "340px", borderColor: "#ef4444", color: "#ef4444", padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px" }}
                      >
                        Exit Match 🚪
                      </button>

                    </div>
                  )}
                </div>

                {/* Right Column (P2 Top, P4 Bottom) */}
                <div className="tabletop-column desktop-only">
                  <PlayerCornerCard
                    player={players[1]}
                    isActive={currentTurnIndex === 1}
                    isRolling={isRolling}
                    isDiceRolling={isDiceRolling}
                    onRoll={handleRoll}
                    theme={activeTheme}
                  />
                  <PlayerCornerCard
                    player={players[3]}
                    isActive={currentTurnIndex === 3}
                    isRolling={isRolling}
                    isDiceRolling={isDiceRolling}
                    onRoll={handleRoll}
                    theme={activeTheme}
                  />
                </div>

              </div>
            </div>

            {/* Control Panel Side */}
            <div className="glass desktop-only" style={{ flex: "0 0 320px", padding: "1.5rem", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Winner State */}
              {winner ? (
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Match Status</h3>
                  <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: winner.color }}>
                    🏆 Victory! {winner.name} 🏆
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}>Current Turn</h3>
                  <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: players[currentTurnIndex]?.color }}>
                    {players[currentTurnIndex]?.name} {players[currentTurnIndex]?.isBot && "(Bot)"}
                  </div>
                </div>
              )}

              {/* Players Status */}
              <div>
                <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem", borderBottom: "1px solid var(--surface-light)", paddingBottom: "0.5rem" }}>Players</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {players.map((p, idx) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: idx === currentTurnIndex ? "rgba(255,255,255,0.05)" : "transparent", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: p.color }} />
                        <span>{p.name} {p.isBot && "🤖"}</span>
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        Pos: {p.position} {gameMode === "own-snake" && `| Own Snake: ${p.ownSnakeNumber}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In-Game Theme Selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <h3 style={{ color: "var(--text-muted)", marginBottom: "0.25rem", borderBottom: "1px solid var(--surface-light)", paddingBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Board Theme 🎨</span>
                  {isOnline && (
                    <span style={{ fontSize: "0.7rem", background: isHost ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: isHost ? "#10b981" : "#ef4444", padding: "2px 6px", borderRadius: "6px", border: isHost ? "1px solid #10b98144" : "1px solid #ef444444", fontWeight: "bold" }}>
                      {isHost ? "Host" : "Guest (Read-Only)"}
                    </span>
                  )}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
                  {Object.keys(THEME_CONFIGS).map((themeKey) => {
                    const isSelected = activeTheme === themeKey;
                    const themeLabel = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
                    const isAllowed = !isOnline || isHost;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => {
                          if (isAllowed) {
                            handleThemeChange(themeKey);
                          }
                        }}
                        disabled={!isAllowed}
                        style={{
                          padding: "8px 4px",
                          fontSize: "0.8rem",
                          borderRadius: "8px",
                          border: isSelected ? "1.5px solid var(--p1-color)" : "1.5px solid rgba(255,255,255,0.15)",
                          background: isSelected ? "var(--p1-color)" : "transparent",
                          color: isSelected ? "white" : "var(--text-muted)",
                          cursor: isAllowed ? "pointer" : "not-allowed",
                          opacity: isAllowed ? 1 : 0.5,
                          transition: "all 0.2s ease"
                        }}
                      >
                        {themeKey === "classic" && "🎲 "}
                        {themeKey === "neon" && "✨ "}
                        {themeKey === "forest" && "🌿 "}
                        {themeKey === "space" && "🌌 "}
                        {themeKey === "sakura" && "🌸 "}
                        {themeKey === "candy" && "🍭 "}
                        {themeLabel}
                      </button>
                    );
                  })}
                </div>
                {isOnline && !isHost && (
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: "2px" }}>
                    Only the room creator can change the theme.
                  </div>
                )}
              </div>

              {/* Action Logs */}
              <div style={{ flex: 1, minHeight: "150px" }}>
                <h3 style={{ color: "var(--text-muted)", marginBottom: "0.5rem", borderBottom: "1px solid var(--surface-light)", paddingBottom: "0.5rem" }}>Game Log</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem" }}>
                  {logs.map((l, i) => (
                    <div key={i} style={{ color: i === 0 ? "var(--text-main)" : "var(--text-muted)", opacity: 1 - (i * 0.2) }}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Exit/Reset Button */}
              {!winner && (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    if (confirm("Are you sure you want to exit the current match? All progress will be lost.")) {
                      exitGame();
                    }
                  }}
                  style={{ width: "100%", borderColor: "#ef4444", color: "#ef4444", marginTop: "1rem" }}
                >
                  Exit Match
                </button>
              )}

            </div>
          </div>
        )
      ) : (
        ludoGamePhase === "lobby" ? (
          <LudoLobbyComponent
            onStart={startLudoGame}
            onBack={() => setActiveGame(null)}
            initialTheme={activeTheme}
            onThemeChange={handleThemeChange}
            onlineState={{
              isOnline: ludoIsOnline,
              gameCode: ludoGameCode,
              joinedPlayers: ludoJoinedPlayers,
              isHost: ludoIsHost,
              myPlayerId: myPlayerId,
              isConnecting: ludoIsConnecting
            }}
            onCreateOnlineRoom={handleCreateLudoOnlineRoom}
            onJoinOnlineRoom={handleJoinLudoOnlineRoom}
            onStartOnlineGame={handleStartLudoOnlineGame}
            onLeaveOnlineRoom={handleLeaveLudoOnlineRoom}
            onToggleOnlineMode={setLudoIsOnline}
          />
        ) : (
          <LudoErrorBoundary onReset={() => { setLudoGamePhase("lobby"); setActiveGame(null); }}>
            <LudoBoardComponent
              players={ludoPlayers}
              activePlayerIdx={ludoCurrentTurnIndex}
              diceValue={ludoDiceValue}
              isRolling={ludoIsRolling}
              isDiceRolling={ludoIsDiceRolling}
              onRoll={handleLudoRoll}
              onSelectToken={(tIdx) => handleSelectLudoToken(ludoPlayers, ludoCurrentTurnIndex, tIdx, ludoDiceValue)}
              legalMoves={ludoLegalMoves}
              logs={ludoLogs}
              activeTheme={activeTheme}
              onThemeChange={handleThemeChange}
              onExitGame={exitGame}
              ludoVariation={ludoVariation}
              ludoWalkingToken={ludoWalkingToken}
              isOnline={ludoIsOnline}
              myPlayerId={myPlayerId}
            />
          </LudoErrorBoundary>
        )
      )}

      {/* Full-Screen Glassmorphic Victory Overlay for Snakes & Ladders */}
      {activeGame === "snake-ladder" && winner && (
        <div className="victory-overlay">
          {generateConfettiParticles()}
          <div 
            className="victory-card" 
            style={{ 
              border: `2.5px solid ${winner.color}`, 
              boxShadow: `0 0 45px ${winner.color}55, inset 0 0 20px rgba(255,255,255,0.05)` 
            }}
          >
            <div className="victory-crown-container">
              <div className="victory-rays" style={{ background: `radial-gradient(circle, ${winner.color} 0%, transparent 70%)` }} />
              <div className="victory-crown">👑</div>
            </div>
            <div style={{ color: winner.color, fontSize: "1.1rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "3px" }}>
              🎉 Congratulations! 🎉
            </div>
            <h2 className="victory-title">
              {winner.name} Wins!
            </h2>
            <p className="victory-subtitle">
              A spectacular victory! Reached cell 100 with incredible strategy, lucky rolls, and board mastery. 🏆
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              {(!isOnline || isHost) ? (
                <button className="btn" style={{ flex: 1, padding: "14px 28px" }} onClick={restartSameGame}>
                  Play Again 🔄
                </button>
              ) : (
                <button className="btn" style={{ flex: 1, padding: "14px 28px", opacity: 0.6, cursor: "not-allowed" }} disabled>
                  Waiting for Host... ⏳
                </button>
              )}
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: "14px 28px", borderColor: "rgba(255,255,255,0.2)", color: "white" }} 
                onClick={exitGame}
              >
                Main Menu 🚪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Glassmorphic Victory Overlay for Ludo */}
      {activeGame === "ludo" && ludoWinner && (
        <div className="victory-overlay">
          {generateConfettiParticles()}
          <div 
            className="victory-card" 
            style={{ 
              border: `2.5px solid ${ludoWinner.colorCode}`, 
              boxShadow: `0 0 45px ${ludoWinner.colorCode}55, inset 0 0 20px rgba(255,255,255,0.05)` 
            }}
          >
            <div className="victory-crown-container">
              <div className="victory-rays" style={{ background: `radial-gradient(circle, ${ludoWinner.colorCode} 0%, transparent 70%)` }} />
              <div className="victory-crown">👑</div>
            </div>
            <div style={{ color: ludoWinner.colorCode, fontSize: "1.1rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "3px" }}>
              🎉 Congratulations! 🎉
            </div>
            <h2 className="victory-title">
              {ludoWinner.name} Wins!
            </h2>
            <p className="victory-subtitle">
              A spectacular victory! Guiding their circular 3D tokens home with tactical precision and absolute board domination. 🏆
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button className="btn" style={{ flex: 1, padding: "14px 28px" }} onClick={restartLudoGame}>
                Play Again 🔄
              </button>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: "14px 28px", borderColor: "rgba(255,255,255,0.2)", color: "white" }} 
                onClick={exitGame}
              >
                Main Menu 🚪
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rules & Info Overlay Modal */}

      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        defaultMode={rulesMode}
      />
    </main>
  );
}

