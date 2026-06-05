# Tabletop Arcade: System Architecture & Specification Blueprint

This specification blueprint serves as a comprehensive reference guide for porting, rebuilding, or expanding the **Tabletop Arcade** suite (comprising **Snakes & Ladders Premium** and **Ludo Royale**) in another technology stack (such as Flutter, Unity, Swift, Kotlin, React Native, or C++).

---

## 1. Global System Specifications

### 1.1 Sizing & Responsiveness
* **Desktop Sizing**: Boards (both Snakes & Ladders and Ludo) scale up to a maximum width of `500px`.
* **Mobile Sizing**: Sized down dynamically to center aligned layouts with a consistent maximum width of `340px`. All player status chips, game log cards, exit buttons, and theme selectors stack below the boards.
* **Aspect Ratio**: The game board container remains a perfect square (`1:1` aspect ratio).

### 1.2 Dynamic Theme Engine
The board styling utilizes 6 harmonious, premium visual themes. Each theme provides CSS variables for board tiles, neon accents, and gradients:
* **Classic**: Vibrant primary colors with white board lines.
* **Neon (Dark Mode)**: Dark slate gray tile backgrounds with neon glowing cyan/indigo borders.
* **Forest**: Earthy green and sage backgrounds with brown wooden ladder styling.
* **Space**: Deep cosmic purple tiles with galaxy nebulas and stars.
* **Sakura**: Soft blush pinks and cherry blossom petals decoration.
* **Candy**: Playful pastel blues, cotton candy pinks, and yellow candy grids.

### 1.3 Native Audio Synthesizer Engine (Web Audio API)
To maintain zero network assets, zero latency, and 100% offline functionality, all sound effects are synthesized using the native Web Audio API (`AudioContext`, `OscillatorNode`, and `GainNode` waves):

| Event | Waveform | Frequency Logic | Envelope & Modulations |
| :--- | :--- | :--- | :--- |
| **Roll Dice** | `triangle` | Dynamic click sweep: $120\text{Hz} + \text{rand}(180\text{Hz}) + (\text{tapIdx} \times 20\text{Hz})$ | 5 clicky taps spaced 80ms apart, decaying exponentially over 50ms per tap. |
| **Cookie Step** | `sine` | Upward pitch sweep: $200\text{Hz} \to 450\text{Hz}$ | Linear volume ramp to $0.35$ in 10ms, exponential decay over 120ms. |
| **Snake Bite**| `sawtooth` | Falling slide: $650\text{Hz} \to 100\text{Hz}$ | 10-step amplitude tremolo spaced 60ms apart, decaying over 650ms. |
| **Ladder Climb**| `sine` | Ascending C-Major arpeggio: C4 ($261.6\text{Hz}$), E4 ($329.6\text{Hz}$), G4 ($392.0\text{Hz}$), C5 ($523.3\text{Hz}$) | 4 notes spaced 90ms apart, decaying in 160ms per note. |
| **Roll Six** | `triangle` | Dual chime: C5 ($523.3\text{Hz}$), E5 ($659.3\text{Hz}$) chimes | 2 notes spaced 80ms apart, decaying over 350ms. |
| **Ludo Clash** | `sawtooth` + `sine` | Sawtooth slide: $450\text{Hz} \to 80\text{Hz}$ (impact) + Sine chime: $950\text{Hz}$ (eliminate) | Sawtooth decays in 200ms, Sine chimes at 30ms offset and decays in 350ms. |
| **Victory** | `sine` | Ascending major scale: C4, E4, G4, C5, E5, G5, C6 | 7 notes spaced 90ms apart, final note sustained for 1.5 seconds. |
| **Teleport / Warp** | `sine` | Double pitch warp: $150\text{Hz} \to 1200\text{Hz} \to 300\text{Hz}$ | Quick exponential pitch sweep over 250ms, then falling over 300ms, decaying volume. |

---

## 2. Snakes & Ladders: Game Blueprint

### 2.1 Grid Layout Mathematics
The board consists of a $10 \times 10$ grid representing cells 1 to 100. Because cells wind back and forth in a serpentine layout:
1. Determine the row index ($y$) from the bottom up: $row = \lfloor\frac{cell - 1}{10}\rfloor$ (where $0$ is the bottom row).
2. Determine the column index ($x$) from left to right:
   * If $row$ is even: $col = (cell - 1) \pmod{10}$ (left to right).
   * If $row$ is odd: $col = 9 - ((cell - 1) \pmod{10})$ (right to left).
3. Coordinate Formula:
   * $X\% = (col \times 10) + 5\%$ (for cell center)
   * $Y\% = 95\% - (row \times 10)$ (for cell center)

### 2.2 Gameplay Modes & Rules Flow
* **Classic Mode**: Race to cell 100. Exact roll required to finish. Players must roll a `6` to release their token from home (cell 0) to cell 1. Getting a `6` awards an extra turn.
* **Own-Snake Mode**:
  * *Setup Phase*: At the start, each player clicks on any cell (1-99) to deploy their custom private immune snake head.
  * *Rules*: If you land on your own snake head, you are **immune** and stay in place. If an opponent lands on it, they are swallowed and slide down to its tail.
* **Negative Snake Mode (Inverted)**:
  * *Rules*: Snakes act as helper tiles. Landing on a negative snake head (located on a lower cell) slides the player **up** to its tail on a higher cell. Ladders act as hazard tiles; landing on a negative ladder top slides the player **down** to its bottom.
* **Beast-Snakes Mode**: Landing on specific beast snakes inflicts status effects:
  * *Anaconda*: Massive vertical slide down the board.
  * *Python (Freeze)*: Freezes the player. They skip future turns unless they roll an exact `6` to thaw.
  * *Cobra (Poison)*: Poisoned for 2 turns. All rolled dice values are **halved** (rounded down, minimum 1).
  * *Viper (Panic)*: Panicked for 1 turn. The player walks **backward** by their roll value.
  * *Rainbow Boa*: Helper snake that boosts the player **up** the board and awards an extra roll.
* **Shuffle Snake Mode**: Every N rounds, the positions of all snakes (and optionally ladders) are randomly regenerated. If a new snake head lands directly on a player's tile, they are immediately bitten.
* **Tornado Mode**:
  * Every N rounds, a "Tornado Strike" shuffles the coordinates of all **unlocked players** (position > 0) using a Fisher-Yates algorithm.
  * Locked players (position 0) are excluded and stay at home safely.
  * Unlock attempts are **not** reset to 0 during swaps, allowing players to retain their rolling history.
* **King's Crown Mode**:
  * Spawns a custom quantity of crowns (1-10, default 1) on random board cells.
  * First player to land on a crown becomes King. King receives a **+2 movement speed** on all turns.
  * Another player landing on the King steals the crown and claims the throne.
  * If the King is near the finish line (positions 90-99), they trigger the **Victory Bonus**: they gain a **+4 movement speed** instead of +2 and become **completely immune to snake bites**.
* **Black Hole Mode**:
  * Spawns a custom quantity of black holes (1-10, default 4) on random board cells.
  * Landing on a black hole absorbs the player and teleports them to another random black hole cell on the board.
  * Triggering the black hole absorption has a **10% chance of a Rare Event**, warping the player directly to the final stretch (random cell between 95 and 99).

### 2.3 Step-by-Step Hop Animations
Instead of teleports, tokens move sequentially cell-by-cell. During player movement:
1. Walk cell-by-cell at $240\text{ms}$ intervals with a bouncy hop scaling animation.
2. If the destination contains a ladder, trigger an ascending climbing animation.
3. If the destination contains a snake, trigger a trembling panic animation before sliding down.
4. Update local player ref states (`isWalking`, `isClimbing`, `isSwallowed`, `isPanicking`) dynamically.

---

## 3. Ludo Royale: Game Blueprint

### 3.1 15x15 Symmetrical Layout Grid
Ludo coordinates map onto a $15 \times 15$ grid. The board is divided into four quadrants (corners) containing home base yards and a central cross pathway:
* **Home Base Yards**: Rounded platforms with beveled linear styling (`rx="24"`) representing players' base camps:
  * *Player 1 (Red)*: Top-Left quadrant. Slots located at perfect centers: `(2,2)`, `(3,2)`, `(2,3)`, `(3,3)`.
  * *Player 2 (Green)*: Top-Right quadrant. Slots located at: `(11,2)`, `(12,2)`, `(11,3)`, `(12,3)`.
  * *Player 3 (Yellow)*: Bottom-Right quadrant. Slots located at: `(11,11)`, `(12,11)`, `(11,12)`, `(12,12)`.
  * *Player 4 (Blue)*: Bottom-Left quadrant. Slots located at: `(2,11)`, `(3,11)`, `(2,12)`, `(3,12)`.
* **Safe Cells (★)**: Eight cells are designated safe zones where clashing is disabled:
  * Red Start: `(1, 6)`, Red Star: `(2, 8)`
  * Green Start: `(8, 1)`, Green Star: `(6, 2)`
  * Yellow Start: `(13, 8)`, Yellow Star: `(12, 6)`
  * Blue Start: `(6, 13)`, Blue Star: `(8, 12)`
* **Home Pathways**: 5 cells matching the player's color leading directly into the center home triangle.

### 3.2 Gameplay Modes
* **Classic Ludo**: A standard race where players control 4 tokens. Rolling a `6` unlocks a token from the yard to the start cell. The first player to get all 4 tokens into the home triangle wins.
* **Quick Ludo**: An accelerated game where players win as soon as **1 token** reaches home.
* **Master Ludo**: Competitive variation where a player **must eliminate/kick** at least one opponent token to unlock the entry path to the home triangle. If they reach the home path entrance without a kick count, they bypass the home entrance and continue circumnavigating the board.

### 3.3 Walk, Clash, & Rewind Mechanics
* **Squash-and-Stretch Hops**: Moving tokens animate sequentially box-by-box along the track path at $240\text{ms}$ intervals, scaling down and up to simulate a physical bounce.
* **Backward Clash Rewind**: If a token lands on a cell occupied by a rival token (outside safe zones), it clashes them. The clashed token is set into a panic state and moves **backwards cell-by-cell** to its base yard at a rapid tape-rewind speed ($80\text{ms}$ per cell) before settling back in base ($250\text{ms}$ delay).

---

## 4. Supabase Online Multiplayer Synchronization

To synchronize multiplayer game states across devices in real-time, the host client acts as the authority engine, writing moves to the database, while guests listen to changes:

### 4.1 Database Schemas
* **`games` / `ludo_games`**: Manages match rules, active player turns, board seed states, active theme, completed rounds, and winner status.
* **`game_players` / `ludo_game_players`**: Maps connected client IDs, slot indices (0-3), colors, active positions (positions 0-100 for S&L, token arrays `[-1, -1, -1, -1]` for Ludo), and statistics.

### 4.2 Postgres Realtime & Broadcast Channels
* **State Listeners**: Listeners subscribe to database changes on `game_players` and `games` to update local client rendering states instantly.
* **Gameplay Broadcast Channels**: Websocket broadcast channels (`ludo-gameplay-broadcast-${code}`) synchronize fast visual feedback events:
  * **Dice Rolling Animation**: Broadcasts dice value rolling spin animations to prevent latency gaps (guests render rolling instantly).
  * **Turn Walk Animation**: Broadcasts target token index, roll value, and active player index, triggering step hops and rewinds in unison on guest screens.
* **Transaction Lock Rule**: To prevent state overwrite collisions, when an animation completes, **only** the active player whose turn it is writes the final resolved coordinates, logs, and next player turn to the database.

---

## 5. Victory Screen & Congratulations Layouts

Both victory screens render a dark full-screen overlay backdrop (`rgba(15, 23, 42, 0.9)`) with a blur filter and custom CSS variables mapping:

### 5.1 Snakes & Ladders Victory Overlay
* **Visual Theme**: An interactive golden ladder (`#fbbf24`) with an animated green snake (`#10b981`) wiggling around it. The snake's head bobs and features a red flickering tongue.
* **Animations**:
  * *Card pop-in*: The victory card scales from $0.65$ and drops with an elastic bounce (`victory-card-pop`).
  * *Float*: The card floats continuously up and down (`victory-card-float`).
  * *Congrats text*: Shifting gradient chome animation (`victory-congrats-flow`).
  * *Aura rays*: A rotating blurred aura radial gradient behind the crown (`victory-ray-spin-pulse`).

### 5.2 Ludo Royale Victory Overlay
* **Visual Theme**: Four colorful 3D Ludo tokens (Red, Green, Yellow, Blue) orbiting the main crown with staggered bobbing animation cycles (`orbit-token-1` to `orbit-token-4`).
* **Animations**: Card pop-in, chrome flowing text, and a rotating blurred radial glow matching the winner's color.
