export const GAME_MODES = [
  {
    id: "classic",
    title: "Classic Mode 🎲",
    description: "Play standard traditional Snake Ladder with classic rules and default board configurations.",
    active: true,
    badge: "Active"
  },
  {
    id: "own-snake",
    title: "Own-Snake Mode 👑",
    description: "Each player custom-configures their own private immune snake. Land on your own snake for safety, or trap others!",
    active: true,
    badge: "Active"
  },
  {
    id: "negative-snake",
    title: "Negative Snake Mode 🐍",
    description: "Snakes swallow you UP to higher cells, while ladders pull you DOWN! A complete inversion of the classic race.",
    active: true,
    badge: "Active"
  },
  {
    id: "beast-snakes",
    title: "Beast-Snakes Mode 🦖",
    description: "Battle Anaconda, Python, Cobra, and Viper! Landing on them triggers unique status effects like Freezing, Poison, or Panic!",
    active: true,
    badge: "Active"
  },
  {
    id: "shuffle-snake",
    title: "Shuffle Snake Mode 🌀",
    description: "Traditional race rules, but all snakes' coordinates shuffle periodically! Customize the shuffle interval in rounds.",
    active: true,
    badge: "Active"
  },
  {
    id: "championship",
    title: "Championship Mode 🏆",
    description: "Ranked multiplayer with timed turns, hazard cells, and competitive match lobbies.",
    active: false,
    badge: "Coming Soon"
  }
];
