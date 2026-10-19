# Saigon Rush - 3D Asset Pipeline & Model Specifications

This directory (`public/assets/models/`) holds the 3D model assets for **Saigon Rush**.

The game features a dual-mode asset architecture:
1. **GLTF/GLB Mode**: Custom web-optimized 3D binary models (`.glb`).
2. **Procedural Fallback Mode**: Pure Three.js parametric geometries rendered seamlessly if any external asset is absent or downloading.

---

## 1. Asset Registry & File Conventions

All models must be binary `.glb` files placed directly in this directory:

| Filename | In-Game Entity | Target Dimensions (X × Y × Z) | Bounding Box / Notes |
| :--- | :--- | :--- | :--- |
| `coin.glb` | Golden Dong Star Coin | 0.6m × 0.6m × 0.12m | Centered pivot, 5-point star emblem |
| `coffee.glb` | Cà Phê Sữa Đá Pickup | 0.5m × 1.1m × 0.5m | Glass cup + coffee/milk layers + metal phin |
| `shield.glb` | Nón Lá Protective Shield | 1.3m × 0.45m × 1.3m | Conical straw hat with red ribbon & star |
| `banhmi.glb` | Bánh Mì Coin Magnet | 0.9m × 0.35m × 0.35m | Crusty baguette with paper wrap & herbs |
| `icedtea.glb` | Ly Trà Đá Multiplier | 0.5m × 0.8m × 0.5m | Tall tumbler with tea, ice cubes, & straw |
| `motorbike.glb` | Saigon Scooter (Xe máy) | 0.7m × 1.1m × 1.5m | Wheels centered at ground level (Y=0) |
| `foodcart.glb` | Street Food Cart (Xe Bánh Mì)| 1.3m × 2.4m × 1.7m | Stainless steel cart with striped canopy |
| `player.glb` | Runner Character (Optional) | 0.7m × 1.7m × 0.5m | Forward facing +Z, rigged with run animation |
| `bus.glb` | Saigon Bus (Optional) | 2.2m × 2.6m × 8.0m | Blue/white paint, front ramp at Z > 0 |

---

## 2. Technical Requirements for 3D Artists & Sketchfab Models

When sourcing or creating 3D models from **Sketchfab**, **Blender**, or other 3D software:

1. **File Format**: Binary `.glb` (GL Transmission Format Binary).
2. **Coordinate Orientation**:
   - **Forward**: `+Z` axis (faces towards the player/camera along the street).
   - **Up**: `+Y` axis (height).
   - **Right**: `+X` axis.
3. **Scale**: Metric scale (1 unit = 1.0 meter).
4. **Pivot Point**:
   - For obstacles (`motorbike.glb`, `foodcart.glb`): Base of wheels resting at `Y = 0`.
   - For collectibles (`coin.glb`, `coffee.glb`, `shield.glb`, etc.): Geometric center at `(0, 0, 0)` for smooth tumbling & hover rotation.
5. **Polycount**: Low-poly budget:
   - Collectibles: < 2,500 triangles.
   - Obstacles: < 6,000 triangles.
   - Total file size: **< 1.0 MB** per asset (ideal: 20KB - 300KB).
6. **Materials & Shading**:
   - PBR Standard Metallic-Roughness workflow (`MeshStandardMaterial`).
   - Textures: Max 1024×1024 (or 512×512 for collectibles), JPG / PNG or WebP/KTX2.

---

## 3. Optimizing Models with `gltf-transform`

To optimize any Sketchfab download for fast web loading and smooth 60 FPS gameplay, use `gltf-transform`:

```bash
# Install gltf-transform CLI
npm install -g @gltf-transform/cli

# Deduplicate instances, weld vertices, and compress textures
gltf-transform optimize input_model.glb public/assets/models/motorbike.glb \
  --texture-compress webp \
  --texture-size 1024

# Optional: Apply Draco geometry compression
gltf-transform draco input_model.glb public/assets/models/motorbike.glb
```

---

## 4. Toggling External Models vs. Procedural Mode

Configure asset behavior in `src/components/game/modelRegistry.js`:

```javascript
export const USE_GLTF_MODELS = {
  player: false,   // Procedural rigged character
  motorbike: true, // Loads motorbike.glb with automatic procedural fallback
  foodcart: true,  // Loads foodcart.glb with automatic procedural fallback
  coin: true,      // Loads coin.glb with automatic procedural fallback
  coffee: true,    // Loads coffee.glb with automatic procedural fallback
  shield: true,    // Loads shield.glb with automatic procedural fallback
  banhmi: true,    // Loads banhmi.glb with automatic procedural fallback
  icedtea: true,   // Loads icedtea.glb with automatic procedural fallback
};
```
