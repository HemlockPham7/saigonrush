import { useMemo } from 'react';
import * as THREE from 'three';

// Shared materials for optimal performance & batching
const materials = {
  // Shophouse facade colors (Saigon colonial palette)
  yellowWall: new THREE.MeshStandardMaterial({ color: '#f4d58d', roughness: 0.8 }),
  mintWall: new THREE.MeshStandardMaterial({ color: '#8fd3c1', roughness: 0.8 }),
  blueWall: new THREE.MeshStandardMaterial({ color: '#7eb8da', roughness: 0.8 }),
  roseWall: new THREE.MeshStandardMaterial({ color: '#e08d79', roughness: 0.8 }),
  creamWall: new THREE.MeshStandardMaterial({ color: '#f7ede2', roughness: 0.85 }),

  // Architectural trim
  roofTile: new THREE.MeshStandardMaterial({ color: '#b85a3a', roughness: 0.7 }),
  shutterGreen: new THREE.MeshStandardMaterial({ color: '#265344', roughness: 0.6 }),
  ironBalcony: new THREE.MeshStandardMaterial({ color: '#222226', roughness: 0.4 }),
  awningRed: new THREE.MeshStandardMaterial({ color: '#da291c', roughness: 0.6 }),
  awningGreen: new THREE.MeshStandardMaterial({ color: '#2d9a5b', roughness: 0.6 }),
  glassWindow: new THREE.MeshStandardMaterial({ color: '#1a2936', roughness: 0.2, metalness: 0.6 }),

  // Nature
  treeTrunk: new THREE.MeshStandardMaterial({ color: '#4a3728', roughness: 0.9 }),
  treeFoliage: new THREE.MeshStandardMaterial({ color: '#387346', roughness: 0.7 }),

  // Street furniture
  lampPost: new THREE.MeshStandardMaterial({ color: '#30343a', roughness: 0.5, metalness: 0.8 }),
  lampGlow: new THREE.MeshBasicMaterial({ color: '#ffeaad' }),
  wireBlack: new THREE.MeshBasicMaterial({ color: '#151518' }),
};

// Signboard themes with vibrant Saigon neon colors
const SIGNS = [
  { text: 'CÀ PHÊ SỮA ĐÁ', color: '#ffd166', bg: '#2b1406' },
  { text: 'BÁNH MÌ SÀI GÒN', color: '#ff4f9a', bg: '#1c0f24' },
  { text: 'PHỞ GIA TRUYỀN', color: '#3be8ff', bg: '#081c24' },
  { text: 'TIỆM MAY ÁO DÀI', color: '#ffbb33', bg: '#211029' },
  { text: 'NƯỚC MÍA TƯƠI', color: '#70e000', bg: '#0a210d' },
];

/**
 * Creates a canvas texture for a storefront signboard
 */
function createSignTexture(text, textColor, bgColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border glow
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  // Text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Individual French-Colonial Shophouse
 */
export function Shophouse({
  width = 6,
  height = 9,
  depth = 5,
  wallColor = 'yellow',
  signIndex = 0,
  hasAwning = true,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const wallMat =
    wallColor === 'mint'
      ? materials.mintWall
      : wallColor === 'blue'
      ? materials.blueWall
      : wallColor === 'rose'
      ? materials.roseWall
      : wallColor === 'cream'
      ? materials.creamWall
      : materials.yellowWall;

  const sign = SIGNS[signIndex % SIGNS.length];
  const signTexture = useMemo(
    () => createSignTexture(sign.text, sign.color, sign.bg),
    [sign.text, sign.color, sign.bg]
  );

  return (
    <group position={position} rotation={rotation}>
      {/* Main Building Facade */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow material={wallMat}>
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* Decorative Roof Parapet / Cornice */}
      <mesh position={[0, height + 0.35, 0]} castShadow material={materials.roofTile}>
        <boxGeometry args={[width + 0.4, 0.7, depth + 0.4]} />
      </mesh>

      {/* Ground Floor Storefront Entrance */}
      <mesh position={[0, 1.4, depth / 2 + 0.05]} material={materials.glassWindow}>
        <planeGeometry args={[width * 0.75, 2.4]} />
      </mesh>

      {/* Storefront Signboard */}
      <mesh position={[0, 3.2, depth / 2 + 0.12]}>
        <planeGeometry args={[width * 0.8, 0.9]} />
        <meshBasicMaterial map={signTexture} />
      </mesh>

      {/* Canvas Street Awning */}
      {hasAwning && (
        <group position={[0, 2.65, depth / 2 + 0.8]} rotation={[0.3, 0, 0]}>
          <mesh castShadow receiveShadow material={materials.awningRed}>
            <boxGeometry args={[width * 0.85, 0.08, 1.6]} />
          </mesh>
        </group>
      )}

      {/* 2nd Floor French Windows with Shutters */}
      <group position={[-width * 0.25, 5.5, depth / 2 + 0.05]}>
        <mesh material={materials.glassWindow}>
          <planeGeometry args={[1.1, 1.8]} />
        </mesh>
        {/* Shutters */}
        <mesh position={[-0.7, 0, 0.02]} material={materials.shutterGreen}>
          <planeGeometry args={[0.4, 1.8]} />
        </mesh>
        <mesh position={[0.7, 0, 0.02]} material={materials.shutterGreen}>
          <planeGeometry args={[0.4, 1.8]} />
        </mesh>
        {/* Wrought Iron Balcony */}
        <mesh position={[0, -0.6, 0.3]} material={materials.ironBalcony}>
          <boxGeometry args={[1.5, 0.6, 0.5]} />
        </mesh>
      </group>

      <group position={[width * 0.25, 5.5, depth / 2 + 0.05]}>
        <mesh material={materials.glassWindow}>
          <planeGeometry args={[1.1, 1.8]} />
        </mesh>
        <mesh position={[-0.7, 0, 0.02]} material={materials.shutterGreen}>
          <planeGeometry args={[0.4, 1.8]} />
        </mesh>
        <mesh position={[0.7, 0, 0.02]} material={materials.shutterGreen}>
          <planeGeometry args={[0.4, 1.8]} />
        </mesh>
        <mesh position={[0, -0.6, 0.3]} material={materials.ironBalcony}>
          <boxGeometry args={[1.5, 0.6, 0.5]} />
        </mesh>
      </group>

      {/* 3rd Floor Windows (for tall buildings) */}
      {height > 8 && (
        <group position={[0, 7.6, depth / 2 + 0.05]}>
          <mesh material={materials.glassWindow}>
            <planeGeometry args={[1.0, 1.3]} />
          </mesh>
          <mesh position={[-0.65, 0, 0.02]} material={materials.shutterGreen}>
            <planeGeometry args={[0.35, 1.3]} />
          </mesh>
          <mesh position={[0.65, 0, 0.02]} material={materials.shutterGreen}>
            <planeGeometry args={[0.35, 1.3]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Tropical Tamarind Street Tree (Cây Me Tây)
 */
export function StreetTree({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.6, 0]} castShadow material={materials.treeTrunk}>
        <cylinderGeometry args={[0.18, 0.25, 3.2, 8]} />
      </mesh>
      {/* Clustered Foliage Spheres */}
      <mesh position={[0, 3.6, 0]} castShadow material={materials.treeFoliage}>
        <sphereGeometry args={[1.3, 10, 8]} />
      </mesh>
      <mesh position={[0.5, 4.2, 0.3]} castShadow material={materials.treeFoliage}>
        <sphereGeometry args={[1.0, 8, 8]} />
      </mesh>
      <mesh position={[-0.4, 4.0, -0.3]} castShadow material={materials.treeFoliage}>
        <sphereGeometry args={[0.9, 8, 8]} />
      </mesh>
    </group>
  );
}

/**
 * Classic Saigon Street Lamp Post
 */
export function StreetLamp({ position = [0, 0, 0], pointsTowardsRoad = 1 }) {
  return (
    <group position={position}>
      {/* Base & Pole */}
      <mesh position={[0, 2.2, 0]} castShadow material={materials.lampPost}>
        <cylinderGeometry args={[0.07, 0.12, 4.4, 8]} />
      </mesh>
      {/* Curved Arm reaching toward roadway */}
      <mesh
        position={[pointsTowardsRoad * 0.35, 4.3, 0]}
        rotation-z={pointsTowardsRoad * -0.5}
        material={materials.lampPost}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
      </mesh>
      {/* Glowing Lamp Head */}
      <mesh position={[pointsTowardsRoad * 0.7, 4.15, 0]} material={materials.lampGlow}>
        <sphereGeometry args={[0.2, 8, 8]} />
      </mesh>
    </group>
  );
}
