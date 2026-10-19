# Technical Architecture Document (TECH_ARCHITECTURE.md)
## Project: Saigon Rush (3D Endless Runner)

---

## 1. System Overview & Architectural Principles

**Saigon Rush** is an arcade 3D endless runner web application built on **React 19**, **React Three Fiber (R3F)**, **`@react-three/drei`**, and **Three.js**, bundled with **Vite**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          React Root (<App />)                          │
├───────────────────────────────────┬────────────────────────────────────┤
│   DOM Layer (UI / 2D Overlay)     │      3D Canvas Layer (WebGL)       │
│  - Start Menu                     │  - R3F <Canvas>                    │
│  - Real-time HUD (Score, Coins)   │  - Third-Person Chase Camera       │
│  - Power-Up Timer Rings           │  - Lighting & Environment          │
│  - Game Over Modal                │  - Track & Scenery Chunks (Pooled) │
│  - Audio & Pause Controls         │  - Player Controller (Runner)      │
│                                   │  - Obstacles & Collectibles        │
│                                   │  - Collision Detection Loop        │
├───────────────────────────────────┴────────────────────────────────────┤
│                   State Management (useGameStore)                      │
│     - Decoupled high-frequency game loop data (Zustand store)          │
│     - Reactive low-frequency UI bindings (Score, Game State, Sound)    │
│     - LocalStorage persistence (High scores, Lifetime stats, Settings) │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Architectural Principles
1. **Decoupled Game Loop & UI**:
   - The 3D render loop (`useFrame` at 60 FPS) must **never** trigger React component re-renders (`setState`) directly.
   - High-frequency mutations (player position, track translation, collision checks, coin rotation) manipulate Three.js `Object3D` matrix refs directly.
   - UI HUD values (score, coin tally, active power-up seconds) are updated via throttled listeners or lightweight selective subscriptions through a dedicated state store.
2. **Infinite World via Object Pooling**:
   - Rather than creating and destroying Three.js geometries dynamically (which causes Garbage Collection frame spikes), track segments, obstacles, and coins are pre-instantiated in memory and recycled ahead of the player camera.
3. **Fail-Safe Hybrid 3D Asset Pipeline**:
   - Every 3D game entity (character, bus, motorbike, power-up) has two rendering modes:
     1. Curated external GLTF/GLB models (sourced from Sketchfab, loaded via `useGLTF`).
     2. Stylized procedural Three.js low-poly geometry fallbacks (primitives with Vietnamese color palettes).
   - If an asset fails to load or is not present, the procedural fallback immediately renders with zero crashes or blank screens.
4. **Lightweight Axis-Aligned Bounding Box (AABB) Collision**:
   - Avoid heavy physics engines (like Ammo.js or Rapier) which introduce physics simulation overhead.
   - Fast mathematical 3D bounding boxes (`THREE.Box3`) perform collision testing against active lane segments every frame.

---

## 2. Technology Stack & Key Dependencies

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime / UI** | React | `^19.0.0` | Declarative UI structure and component lifecycle |
| **3D Rendering** | Three.js | `^0.186.0` | WebGL 3D graphics rendering engine |
| **R3F Bridge** | `@react-three/fiber` | `^9.8.0` | React renderer for Three.js scene graph |
| **R3F Utilities** | `@react-three/drei` | `^10.7.0` | Helpers (`useGLTF`, `useKeyboardControls`, `Preload`, `Environment`) |
| **State Store** | Zustand | `^5.0.0` | High-performance decoupled game state management |
| **Build Tool** | Vite | `^6.0.0` | Lightning-fast HMR and optimized static production bundle |
| **Styling** | Vanilla CSS / CSS Modules | Standard | Zero runtime CSS overhead, responsive widescreen framing |
| **Audio** | HTML5 Audio + Web Audio API | Built-in | Low-latency SFX and synthesized fallback audio engine |

---

## 3. Project Directory Structure

```
saigonrush/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── assets/
│   │   ├── models/            # Curated Sketchfab GLTF/GLB models
│   │   │   ├── player.glb
│   │   │   ├── bus.glb
│   │   │   ├── motorbike.glb
│   │   │   └── powerups.glb
│   │   ├── audio/             # Sound effects & background music
│   │   └── textures/          # Road, sidewalk, and signage textures
├── docs/
│   ├── PRD.md
│   ├── TECH_ARCHITECTURE.md
│   └── PLAN.md
└── src/
    ├── main.jsx               # Application entry point
    ├── App.jsx                # Layout wrapper (<Canvas> + DOM UI Overlay)
    ├── index.css              # Global styles, fonts, layout resets
    ├── store/
    │   └── useGameStore.js    # Zustand store (game state, score, power-ups, audio)
    ├── systems/
    │   ├── constants.js       # Game constants (lane width, speeds, durations, physics)
    │   ├── CollisionSystem.js # AABB Box3 intersection calculations
    │   ├── SpawnerSystem.js   # Procedural track chunk & pattern generation
    │   └── SoundSystem.js     # Audio controller with Web Audio synthetic fallbacks
    ├── hooks/
    │   ├── useKeyboard.js     # Keyboard input listener (WASD, Arrows, Space, Pause)
    │   └── useAudio.js        # Audio playback hook
    ├── components/
    │   ├── canvas/
    │   │   ├── GameCanvas.jsx # Top-level R3F Canvas and WebGL settings
    │   │   ├── GameScene.jsx  # Main 3D scene holding game subsystems
    │   │   ├── Camera.jsx     # Smooth third-person chase camera controller
    │   │   └── Lighting.jsx   # Sunlight, ambient light, fog, and shadows
    │   ├── game/
    │   │   ├── Player.jsx     # Runner mesh, animations, lane transitions, jump/slide
    │   │   ├── TrackChunk.jsx # Reusable road segment (street, sidewalks, shophouses)
    │   │   ├── TrackPool.jsx  # Recycled chunk spawner and streamer
    │   │   ├── Obstacles/
    │   │   │   ├── Motorbike.jsx
    │   │   │   ├── SaigonBus.jsx
    │   │   │   ├── FoodCart.jsx
    │   │   │   ├── LowBarrier.jsx
    │   │   │   └── OverheadWires.jsx
    │   │   ├── Collectibles/
    │   │   │   ├── Coin.jsx
    │   │   │   ├── CoinCluster.jsx
    │   │   │   └── PowerUpItem.jsx (Coffee, Non La, Banh Mi, Tra Da)
    │   │   └── fallbacks/     # Stylized procedural Three.js geometry fallbacks
    │   └── ui/
    │       ├── StartMenu.jsx  # Title screen, how-to-play, high scores
    │       ├── HUD.jsx        # Real-time score, distance, coin counter, power-up bars
    │       ├── GameOver.jsx   # Results card, new record badge, restart
    │       └── AudioControls.jsx # Sound toggle & volume buttons
```

---

## 4. Coordinate System, Camera & World Motion

### 4.1. Coordinate System
- **X-Axis (Horizontal / Lanes)**:
  - 3 Lanes:
    - **Left Lane**: `x = -2.5`
    - **Center Lane**: `x = 0.0`
    - **Right Lane**: `x = +2.5`
  - Lane width `LANE_WIDTH = 2.5 meters`.
- **Y-Axis (Vertical / Height)**:
  - Ground level: `y = 0.0`
  - Player standing height: `1.8m`
  - Jump apex height: `y ≈ 2.8m`
  - Bus roof level: `y ≈ 2.5m`
  - Slide height: `y ≈ 0.6m`
  - Low obstacles (must jump): height `0.4m` to `0.8m`
  - Overhead wires (must slide): bottom clearing `1.1m` to `1.5m`
- **Z-Axis (Depth / Forward Running)**:
  - Player is fixed along the Z-axis at `z = 0.0`.
  - The world (road chunks, obstacles, coins, scenery) moves in the **positive Z direction** (`z += speed * delta`), creating the illusion of forward sprinting while preventing floating-point precision degradation.
  - Active render zone: `z = -120` (spawn distance ahead) to `z = +25` (despawn / recycle distance behind player camera).

### 4.2. Camera System
- **Type**: `THREE.PerspectiveCamera`
- **Default Position**: `[0, 3.8, 6.5]`
- **LookAt Target**: `[0, 1.4, -4.0]`
- **Field of View (FOV)**: `60°` (landscape desktop presentation)
- **Dynamic Camera Effects**:
  - Horizontal sway / slight camera lerp following player lane changes.
  - FOV dilation during **Cà phê** speed rush (`60° -> 72°`) for visceral sense of acceleration.
  - Subtle screen shake on shield impact or near-miss.

---

## 5. Subsystems Architecture

### 5.1. Player Controller (`Player.jsx`)
- **State Machine**:
  - `RUNNING`: Standard running stride.
  - `JUMPING`: Parabolic vertical curve (`y = y0 + vy*t - 0.5*g*t^2`). Pressing slide cancels upward velocity and applies fast-fall (`vy = -18 m/s`).
  - `SLIDING`: Character tilts and scales down vertically to `0.6m`. Automatic timer restores standing after `0.8s`.
  - `INVINCIBLE`: Flashing material transparency during Cà phê rush or post-shield hit.
  - `CRASHED`: Ragdoll tumble / backward knockback animation upon fatal collision.
- **Lane Transitions**:
  - Smooth interpolation using critical damping (`THREE.MathUtils.damp(currentX, targetX, 18, delta)`), achieving snappy yet fluid lane changes in `~180ms`.
  - Character banks (`rotation.z = -0.15 * direction`) during lane switch.

### 5.2. Procedural Track & Environment Pooling (`TrackPool.jsx`)
- Chunks have fixed length: `CHUNK_LENGTH = 30 meters`.
- 5 chunks are kept active at any time covering `150 meters` ahead.
- When a chunk passes `z > 25`, it is unmounted from the rear, reconfigured with fresh obstacle and coin patterns, and repositioned at the front (`z = lastChunkZ - CHUNK_LENGTH`).
- Each chunk contains:
  - Asphalt roadway with dashed lane dividers.
  - Raised sidewalks with yellow-black painted curbs.
  - Procedural French-colonial shophouse facades with colorful balconies and Vietnamese signboards.
  - Street trees (*cây me tây*) and streetlights placed along sidewalk margins.

### 5.3. Obstacle & Hazard Architecture
Each obstacle exposes an active 3D bounding box (`THREE.Box3`):
1. **Low Barricade / Plastic Stool**:
   - Bounds: `[laneX ± 0.6, 0 to 0.7, z ± 0.3]`
   - Avoidance: Jump over or switch lane.
2. **Overhead Cables / Shop Awning**:
   - Bounds: `[laneX ± 1.2, 0.9 to 2.2, z ± 0.3]`
   - Avoidance: Slide under or switch lane.
3. **Motorbike (Moving / Parked)**:
   - Bounds: `[laneX ± 0.5, 0 to 1.4, z ± 1.0]`
   - Avoidance: Switch lane. Moving motorbikes travel at `speed * 0.3` in the player's direction.
4. **Saigon Green Bus (with Roof Ramp)**:
   - Bus Bounds: `[laneX ± 1.1, 0 to 2.5, z ± 4.5]`
   - Front Ramp Bounds: Sloped wedge from `y = 0` to `y = 2.5` over `4.0 meters`.
   - Interaction: Players can jump or run up the ramp onto the roof. A collision with the blunt front kills the run; landing on top allows running along the roof.

### 5.4. Collectibles & Vietnamese Power-Up Mechanics
- **Coins**:
  - Golden rotating discs placed in arches (over low obstacles or bus ramps) or straight lane lines.
  - Bounding sphere for pickup detection: `radius = 0.6m`.
- **Power-Up State Machine**:
  - **Cà phê (Speed Rush)**:
    - Sets `gameSpeedMultiplier = 1.4`.
    - Player becomes invulnerable: collisions with obstacles disintegrate the obstacle instead of damaging player.
    - Motion-blur / speed particle lines emit from edges of the screen.
  - **Nón lá (Shield)**:
    - Spawns a translucent holographic conical hat or golden energy dome above the runner.
    - If player hits an obstacle:
      - Shield absorbs the blow and breaks with particle burst.
      - Player receives `1.5s` of blinking invulnerability frames.
      - Runner does NOT die.
  - **Bánh mì (Coin Magnet)**:
    - Magnifies coin pickup radius to `12 meters`.
    - Any coin within radius interpolates rapidly toward player's position (`lerp` to player XYZ).
  - **Trà đá (Score Multiplier)**:
    - Multiplies score accumulation rate by `2x` for 10 seconds.
    - Golden glow aura around player.

### 5.5. Collision Detection System (`CollisionSystem.js`)
- Executed on every frame inside `useFrame`.
- Bounding Box optimization:
  - Player Box: Updated every frame based on lane X, current Y (jump height), and current height (normal vs sliding).
  - Broad-phase filter: Only test obstacles and items whose Z position is within `|z_obstacle - z_player| < 3.0 meters`.
  - Narrow-phase: `playerBox.intersectsBox(obstacleBox)`.
- Outcomes:
  - If coin: Collect coin, emit ding sound, increment store coin counter, hide coin mesh.
  - If power-up: Activate power-up effect, play power-up sting, set active timer in store.
  - If obstacle:
    - If Cà phê active: Destroy obstacle with explosion particles.
    - If Nón lá active: Consume shield, trigger flash, grant temporary invulnerability.
    - Else: Trigger Game Over sequence.

---

## 6. State Management (`useGameStore.js`)

Zustand provides a centralized reactive store:

```javascript
const useGameStore = create((set, get) => ({
  // Game Flow State
  gameState: 'MENU', // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
  
  // Real-time Metrics
  score: 0,
  highScore: parseInt(localStorage.getItem('saigonrush_highscore') || '0', 10),
  coins: 0,
  distance: 0,
  speed: 18,
  
  // Active Power-Ups ({ remaining: seconds })
  activePowerUps: {
    coffee: 0,
    shield: false,
    magnet: 0,
    multiplier: 0,
  },
  
  // Settings
  isMuted: localStorage.getItem('saigonrush_muted') === 'true',
  
  // Actions
  startGame: () => set({ gameState: 'PLAYING', score: 0, coins: 0, distance: 0, speed: 18 }),
  pauseGame: () => set((s) => ({ gameState: s.gameState === 'PLAYING' ? 'PAUSED' : 'PLAYING' })),
  gameOver: () => {
    const { score, highScore } = get();
    const newHigh = Math.max(score, highScore);
    localStorage.setItem('saigonrush_highscore', newHigh.toString());
    set({ gameState: 'GAME_OVER', highScore: newHigh });
  },
  addCoin: () => set((s) => ({ coins: s.coins + 1, score: s.score + 10 * (s.activePowerUps.multiplier > 0 ? 2 : 1) })),
  activatePowerUp: (type, duration) => { /* update powerup timers */ },
  toggleMute: () => set((s) => {
    const next = !s.isMuted;
    localStorage.setItem('saigonrush_muted', next.toString());
    return { isMuted: next };
  }),
}));
```

---

## 7. Audio Architecture (`SoundSystem.js`)

1. **Audio Sources**:
   - Primary: Audio files in `public/assets/audio/` (coin, jump, slide, crash, powerups, bgm).
   - Fallback: Synthesized Web Audio API oscillators:
     - Coin: High sine chirp (`987Hz -> 1318Hz`).
     - Jump: Frequency glide upward (`220Hz -> 440Hz`).
     - Slide: Filtered white noise burst.
     - Power-Up: Arpeggiated major triad.
     - Crash: Low frequency square wave distortion with noise thud.
2. **Audio Lifecycle**:
   - Audio Context initializes on the first user interaction (click/keypress) to adhere to browser autoplay policies.
   - Background music loops seamlessly with fade-in/fade-out on game over.

---

## 8. Performance & Optimization Strategies

1. **Draw Call Optimization**:
   - Coins within a cluster share a single `InstancedMesh`.
   - Repeated street furniture (curb segments, lane stripes, streetlights) use instancing.
2. **Garbage Collection (GC) Defense**:
   - Zero object allocation inside `useFrame`.
   - Reusable `THREE.Vector3`, `THREE.Box3`, and `THREE.Matrix4` instances are declared at module scope.
3. **Renderer Settings**:
   - `dpr={[1, 1.5]}`: Clamped pixel ratio to prevent GPU thermal throttling on high-DPI displays.
   - `shadows="percentage"`: Efficient soft shadows without PCFSoft deprecation warnings.
   - `powerPreference="high-performance"` passed to WebGLRenderer.
4. **Frustum Culling**:
   - Objects behind the camera or beyond `z < -130` are automatically excluded from render passes.
