/**
 * Saigon Rush - 3D Model Asset Registry
 * Defines paths to external GLTF/GLB models in public/assets/models/
 * and configuration flags for external asset loading vs procedural fallbacks.
 */

export const MODEL_PATHS = {
  player: '/assets/models/player.glb',
  motorbike: '/assets/models/motorbike.glb',
  bus: '/assets/models/bus.glb',
  foodcart: '/assets/models/foodcart.glb',
  coin: '/assets/models/coin.glb',
  coffee: '/assets/models/coffee.glb',
  shield: '/assets/models/shield.glb',
  banhmi: '/assets/models/banhmi.glb',
  icedtea: '/assets/models/icedtea.glb',
};

// Global toggle for external GLTF/GLB models (false uses pure procedural Three.js)
export const USE_GLTF_MODELS = {
  player: false, // procedural rigged runner with non la
  motorbike: true, // loads motorbike.glb when present, falls back gracefully
  bus: false, // procedural bus with custom walkable roof and sloped chevron ramp
  foodcart: true, // loads foodcart.glb when present, falls back gracefully
  coin: true, // loads coin.glb when present, falls back gracefully
  coffee: true, // loads coffee.glb when present, falls back gracefully
  shield: true, // loads shield.glb when present, falls back gracefully
  banhmi: true, // loads banhmi.glb when present, falls back gracefully
  icedtea: true, // loads icedtea.glb when present, falls back gracefully
};
