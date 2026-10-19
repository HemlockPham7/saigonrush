import React, { Component, Suspense, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * Error boundary that catches any GLTF loading/parsing or WebGL shader errors
 * and gracefully falls back to procedural geometry without crashing the React tree.
 */
export class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn(
      `[ModelLoader] Model failed to load from "${this.props.url}". Falling back to procedural 3D model.`,
      error?.message || error
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/**
 * Internal GLTF renderer component that clones the loaded scene
 * to allow safe reuse across multiple instances in the chunk pool.
 */
function GLTFInner({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
}) {
  const { scene } = useGLTF(url);

  // Deep clone the scene hierarchy so multiple pooled instances do not conflict
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
      }
    });
    return cloned;
  }, [scene, castShadow, receiveShadow]);

  if (!clonedScene) return null;

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

/**
 * Universal ModelLoader with Suspense & Graceful Procedural Fallback.
 *
 * @param {string} url - Relative or absolute path to .glb / .gltf file
 * @param {React.ReactNode} fallback - Procedural Three.js component rendered during loading or error
 * @param {boolean} enabled - Toggle switch; if false, immediately renders fallback
 * @param {Array<number>|number} scale - Transform scale
 * @param {Array<number>} position - Transform position [x, y, z]
 * @param {Array<number>} rotation - Transform rotation [x, y, z]
 * @param {boolean} castShadow - Whether child meshes cast shadows
 * @param {boolean} receiveShadow - Whether child meshes receive shadows
 */
export default function ModelLoader({
  url,
  fallback = null,
  enabled = true,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow = true,
  receiveShadow = true,
}) {
  // If disabled or no URL provided, render procedural fallback immediately
  if (!enabled || !url) {
    return fallback;
  }

  return (
    <ModelErrorBoundary url={url} fallback={fallback}>
      <Suspense fallback={fallback}>
        <GLTFInner
          url={url}
          position={position}
          rotation={rotation}
          scale={scale}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Attach preload helper to warm up HTTP & Draco cache
ModelLoader.preload = (url) => {
  if (url) useGLTF.preload(url);
};

// Clear cache helper
ModelLoader.clear = (url) => {
  if (url) useGLTF.clear(url);
};
