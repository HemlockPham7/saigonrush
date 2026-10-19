// Golden-hour Saigon haze: warm peach horizon that also serves as the sky color
const SKY_COLOR = '#f6c79a';
const FOG_NEAR = 40;
const FOG_FAR = 140;

/**
 * Warm tropical lighting rig:
 * - hemisphere light for sky/ground bounce (warm sky, asphalt-tinted ground)
 * - low-angle golden sun casting soft shadows over the 3-lane track
 * - linear fog that fades distant chunks (also hides chunk spawning at z ≈ -120)
 */
export default function Lighting() {
  return (
    <>
      <color attach="background" args={[SKY_COLOR]} />
      <fog attach="fog" args={[SKY_COLOR, FOG_NEAR, FOG_FAR]} />

      <hemisphereLight args={['#ffe2b8', '#5a4a3a', 0.9]} />
      <ambientLight intensity={0.25} color="#fff1dc" />

      <directionalLight
        position={[-8, 14, 6]}
        intensity={2.4}
        color="#ffd29a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={20}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
    </>
  );
}
