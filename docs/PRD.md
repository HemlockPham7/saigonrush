# Product Requirements Document (PRD)
## Project: Saigon Rush (3D Endless Runner)

---

## 1. Executive Summary
**Saigon Rush** is a high-octane 3D desktop endless runner web game inspired by *Subway Surfers*, set against the vibrant, culturally rich backdrop of Ho Chi Minh City (Saigon), Vietnam. 

Players guide a nimble street runner through three traffic-dense lanes, dodging iconic Saigon hazards—swarming motorbikes, green city buses, street food carts, plastic cafe chairs, and tangled overhead electrical wires—while collecting coins and iconic Vietnamese power-ups.

---

## 2. Product Goals & Vision
- **Authentic Vietnamese Theme**: Infuse classic arcade runner mechanics with genuine Saigon street culture, colors, landmarks, and street food humor.
- **Fluid Desktop-First Web Experience**: Deliver smooth 60 FPS gameplay in modern web browsers (Chrome, Edge, Firefox, Brave) in a widescreen landscape format using responsive keyboard controls.
- **Intuitive Power-Up Mechanics**: Offer instantly recognizable power-ups rooted in Vietnamese daily life:
  - **Cà phê** (Vietnamese Coffee): Speed rush boost with temporary invulnerability.
  - **Nón lá** (Conical Hat): Protective shield that absorbs one collision.
  - **Bánh mì** (Vietnamese Baguette): Magnet attracting coins across all three lanes.
  - **Trà đá** (Iced Tea): Score multiplier (2x score for duration).
- **Zero-Friction Accessibility**: Client-side only web game requiring no login, no downloads, and instant loading with procedural 3D fallbacks and local storage persistence.

---

## 3. Target Audience & Platform
- **Audience**: Casual web gamers, fans of *Subway Surfers* and *Temple Run*, and players interested in Vietnamese culture and vibrant urban aesthetics.
- **Platform**: Desktop web browsers (Windows, macOS, Linux).
- **Display Orientation**: Desktop landscape (16:9 widescreen canvas aspect ratio).
- **Primary Controls**: Keyboard:
  - `A` / `←` (Left Arrow): Switch to left lane
  - `D` / `→` (Right Arrow): Switch to right lane
  - `W` / `↑` (Up Arrow) / `Space`: Jump over low obstacles
  - `S` / `↓` (Down Arrow): Slide / Roll under overhead hazards (also acts as fast-fall from a jump)
  - `P` / `Escape`: Pause / Resume game

---

## 4. Core Gameplay Mechanics

### 4.1. Three-Lane Runner System
- The track consists of 3 parallel lanes: **Left (-1)**, **Center (0)**, and **Right (+1)**.
- Lane width: fixed at `2.5 meters` per lane.
- Switching lanes triggers a snappy, smooth horizontal transition with slight character banking/tilting.

### 4.2. Vertical Movement & Physics
- **Jump**:
  - Upward impulse launching the character to a peak height of ~`2.8 meters`.
  - Enables clearing low barriers, plastic stools, and street vendor baskets, or jumping onto bus roofs.
- **Slide / Roll**:
  - Lowers character collision bounding box height by ~60% for `0.8 seconds`.
  - Enables ducking under tangled overhead wires and low cafe awnings.
  - Pressing Slide while airborne triggers an immediate **fast-fall** to the ground.

### 4.3. Track Progression & Speed Scaling
- Base running speed: `18 m/s`.
- Progressive difficulty: Game speed gradually increases by `0.5 m/s` every 100 meters up to a maximum cap of `38 m/s`.
- World generation: Dynamic procedural chunk recycling (segment pooling), ensuring infinite seamless track streaming without memory leaks.

---

## 5. Items & Power-Ups

| Item | Vietnamese Name | Visual Representation | Gameplay Effect | Base Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Coin** | Tiền vàng | Golden spinning disc with embossed star/dong symbol | Adds +1 coin to run total; contributes +10 bonus points | Instant |
| **Coffee** | Cà phê sữa đá | Traditional Vietnamese drip filter / glass of iced coffee | **Speed Rush**: Increases run speed by 40%, grants temporary invulnerability, and clears obstacles in path | 6 seconds |
| **Conical Hat** | Nón lá | Traditional palm-leaf conical hat hovering or worn | **Shield**: Protects against 1 collision crash. Absorbs hit, breaks with particle flash, and grants 1.5s invincibility frames | Until hit |
| **Baguette** | Bánh mì | Crispy golden Vietnamese baguette with green chili garnish | **Coin Magnet**: Automatically pulls all nearby coins from all 3 lanes toward the player | 8 seconds |
| **Iced Tea** | Trà đá | Tall cup of iced tea with straw and condensation | **Score Multiplier**: Doubles all points accumulated while active (2x score rate) | 10 seconds |

*Note: Power-up timers stack or refresh upon collecting another instance of the same item.*

---

## 6. Obstacles & Environment (Saigon Street Theme)

### 6.1. Obstacle Types
1. **Low Obstacles (Must Jump)**:
   - Red and blue plastic street cafe stools (*ghế nhựa*).
   - Street vendor fruit/vegetable bamboo baskets (*gánh hàng rong*).
   - Yellow and black road construction barriers (*rào chắn công trình*).
2. **Overhead Hazards (Must Slide)**:
   - Iconic tangled bundles of black electrical wires (*mạng nhện dây điện*).
   - Low-hanging roadside canvas awnings (*mái hiên di động*).
   - Bamboo scaffolding poles.
3. **Full-Lane Obstacles (Must Dodge / Change Lane)**:
   - Moving motorbikes (*xe máy Honda Wave/Cub*) moving slowly in the lane or parked.
   - Street food carts (*xe bánh mì, xe nước mía, xe hủ tiếu gõ*).
   - Saigon Green City Buses (*xe buýt Sài Gòn*):
     - Block an entire lane.
     - Some buses have a sloped road ramp in front, allowing the player to jump onto the bus roof to collect elevated coin arcs!

### 6.2. Scenery & Atmosphere
- **Architectural Backdrop**: Classic French-colonial pastel shophouses with shuttered windows, modern Saigon skyscrapers in the far distance, glowing neon signs in Vietnamese (*Cà Phê*, *Phở 24*, *Tiệm May*, *Bánh Mì Sài Gòn*).
- **Street Dressing**: Roadside tamarind trees (*cây me tây*), street lamps, sidewalk curbs with striped curb paint.
- **Lighting**: Warm golden-hour tropical sunlight with soft shadows and subtle atmospheric depth fog.

---

## 7. User Interface & Experience (UI/UX)

### 7.1. Start Screen
- Game logo: **SAIGON RUSH** with vibrant street graffiti typography.
- "Press SPACE or Click to Start" call-to-action button.
- Controls cheatsheet preview (WASD / Arrows).
- Current All-Time High Score display.
- Audio Mute toggle.

### 7.2. In-Game HUD (Heads-Up Display)
- Top-left: Current Run Score (live counter based on distance + coins) and High Score.
- Top-center: Active Power-up status indicators with animated countdown progress rings/bars (Cà phê, Nón lá, Bánh mì, Trà đá).
- Top-right: Collected Coins counter (golden coin icon + number) and Audio/Pause buttons.
- Center-screen floating cues: "+10", "MAGNET!", "2X MULTIPLIER!", "SHIELD UP!".

### 7.3. Game Over Screen
- Dramatic slow-motion crash effect.
- Result card displaying:
  - Final Score.
  - "NEW HIGH SCORE!" celebratory badge (if beaten).
  - Distance Traveled (meters).
  - Coins Collected this run.
- Action Buttons:
  - **Play Again** (`Space` / Click).
  - **Back to Menu**.

---

## 8. Audio System Requirements
- **Sound Effects (SFX)**:
  - Lane change swish.
  - Jump spring / slide whoosh.
  - Coin pickup chime with pitch shifting on streaks.
  - Power-up activation sound stings:
    - Cà phê: Coffee slurp / engine boost roar.
    - Nón lá: Protective mystical chime.
    - Bánh mì: Magnetic suction hum.
    - Trà đá: Refreshing ice clinking / gulp.
  - Shield shatter glass/spark effect.
  - Crash / thud sound on game over.
- **Background Music (BGM)**:
  - Upbeat, energetic electronic/traditional fusion track capturing Saigon's bustling street pulse.
- **Resilience**:
  - Web Audio API procedural sound synthesizer fallbacks ensuring sounds play even if external audio files fail to load or are blocked by browser autoplay policies.
  - Audio toggle with persistent mute state in `localStorage`.

---

## 9. Non-Functional Requirements
- **Performance**: Consistent 60 FPS on standard modern desktop browsers using WebGL 2.0 via Three.js / React Three Fiber.
- **Bundle & Load Speed**: Initial page load under 3 seconds; lazy loading or instant procedural geometry for 3D assets.
- **Persistence**: High scores, total lifetime coins, and audio settings saved in `localStorage`.
- **Zero Backend**: Standalone client-side application. No servers, databases, or third-party tracking required.

---

## 10. Out of Scope (For Initial Release)
- In-game purchase / microtransactions.
- Character cosmetic skin shops and power-up stat level upgrades (pure classic arcade high score loop).
- Online multiplayer or global server-based leaderboards.
- Complex soft-body ragdoll physics (using performant 3D bounding boxes).
