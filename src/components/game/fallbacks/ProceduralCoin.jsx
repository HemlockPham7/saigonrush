import React from 'react';
import * as THREE from 'three';

const coinMaterials = {
  goldFace: new THREE.MeshStandardMaterial({
    color: '#ffd166',
    metalness: 0.85,
    roughness: 0.2,
  }),
  goldRim: new THREE.MeshStandardMaterial({
    color: '#f4a261',
    metalness: 0.9,
    roughness: 0.25,
  }),
  starEmboss: new THREE.MeshBasicMaterial({
    color: '#ffffff',
  }),
};

export default function ProceduralCoin() {
  return (
    <group>
      {/* Outer Coin Disc */}
      <mesh rotation-x={Math.PI / 2} castShadow material={coinMaterials.goldFace}>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 16]} />
      </mesh>
      {/* Embossed Outer Rim */}
      <mesh rotation-x={Math.PI / 2} material={coinMaterials.goldRim}>
        <torusGeometry args={[0.24, 0.02, 8, 16]} />
      </mesh>
      {/* Center Star Emblem */}
      <mesh position={[0, 0, 0.027]} material={coinMaterials.starEmboss}>
        <planeGeometry args={[0.16, 0.16]} />
      </mesh>
      <mesh position={[0, 0, -0.027]} rotation-y={Math.PI} material={coinMaterials.starEmboss}>
        <planeGeometry args={[0.16, 0.16]} />
      </mesh>
    </group>
  );
}
