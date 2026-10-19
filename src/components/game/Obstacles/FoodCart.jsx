import React from 'react';
import ModelLoader from '../ModelLoader.jsx';
import { MODEL_PATHS, USE_GLTF_MODELS } from '../modelRegistry.js';
import ProceduralFoodCart from '../fallbacks/ProceduralFoodCart.jsx';

/**
 * Street Food Cart Obstacle (Xe Hủ Tiếu / Xe Bánh Mì)
 * Large street food cart blocking a single lane. Must switch lanes to avoid.
 * Renders external GLB model when available or falls back to procedural meshes.
 */
function FoodCart({ position = [0, 0, 0], type = 'banhmi' }) {
  return (
    <group position={position} name="obstacle-foodcart">
      <ModelLoader
        url={MODEL_PATHS.foodcart}
        enabled={USE_GLTF_MODELS.foodcart}
        scale={1}
        fallback={<ProceduralFoodCart type={type} />}
      />
    </group>
  );
}

export default React.memo(FoodCart);
