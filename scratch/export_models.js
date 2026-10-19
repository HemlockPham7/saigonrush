import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// Polyfill FileReader for Node.js GLTFExporter
class MockFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = MockFileReader;

const outputDir = path.resolve('public/assets/models');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function exportSceneToGLB(scene, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (glb) => {
        const dest = path.join(outputDir, filename);
        fs.writeFileSync(dest, Buffer.from(glb));
        console.log(`Saved ${filename} (${(glb.byteLength / 1024).toFixed(1)} KB)`);
        resolve(dest);
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

// 1. COIN (Golden Vietnamese Dong Star Coin)
function createCoinModel() {
  const group = new THREE.Group();
  group.name = 'coin';

  const goldFaceMat = new THREE.MeshStandardMaterial({
    color: '#ffd166',
    metalness: 0.85,
    roughness: 0.2,
  });
  const goldRimMat = new THREE.MeshStandardMaterial({
    color: '#f4a261',
    metalness: 0.9,
    roughness: 0.25,
  });
  const starMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    metalness: 0.1,
    roughness: 0.2,
  });

  // Main coin disc
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 24), goldFaceMat);
  disc.rotation.x = Math.PI / 2;
  group.add(disc);

  // Outer rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 24), goldRimMat);
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  // Star shape helper
  function createStarMesh() {
    const starShape = new THREE.Shape();
    const points = 5;
    const outerR = 0.14;
    const innerR = 0.06;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();
    return new THREE.Mesh(new THREE.ShapeGeometry(starShape), starMat);
  }

  const starFront = createStarMesh();
  starFront.position.z = 0.032;
  group.add(starFront);

  const starBack = createStarMesh();
  starBack.position.z = -0.032;
  starBack.rotation.y = Math.PI;
  group.add(starBack);

  return group;
}

// 2. COFFEE (Cà phê sữa đá with Phin filter)
function createCoffeeModel() {
  const group = new THREE.Group();
  group.name = 'coffee';

  const glassMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
  });
  const milkMat = new THREE.MeshStandardMaterial({ color: '#fff8e7', roughness: 0.5 });
  const coffeeLiquidMat = new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.4 });
  const phinMat = new THREE.MeshStandardMaterial({ color: '#cfd8dc', metalness: 0.9, roughness: 0.25 });
  const iceMat = new THREE.MeshStandardMaterial({ color: '#e0f7fa', transparent: true, opacity: 0.6, roughness: 0.1 });

  // Glass tumbler
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.7, 16, 1, true), glassMat);
  glass.position.y = 0.35;
  group.add(glass);

  // Glass bottom
  const glassBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), glassMat);
  glassBase.position.y = 0.02;
  group.add(glassBase);

  // Condensed milk layer (bottom)
  const milk = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.22, 0.16, 16), milkMat);
  milk.position.y = 0.1;
  group.add(milk);

  // Coffee liquid layer (middle)
  const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.23, 0.4, 16), coffeeLiquidMat);
  coffee.position.y = 0.38;
  group.add(coffee);

  // Floating Ice Cubes
  for (let i = 0; i < 3; i++) {
    const ice = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), iceMat);
    ice.position.set((i - 1) * 0.1, 0.52, (i % 2 === 0 ? 0.05 : -0.05));
    ice.rotation.set(0.2 * i, 0.5 * i, 0.3);
    group.add(ice);
  }

  // Metal Phin Filter
  // Saucer plate
  const phinPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 16), phinMat);
  phinPlate.position.y = 0.72;
  group.add(phinPlate);

  // Chamber
  const phinChamber = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.3, 16), phinMat);
  phinChamber.position.y = 0.88;
  group.add(phinChamber);

  // Lid with knob
  const phinLid = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.03, 16), phinMat);
  phinLid.position.y = 1.04;
  group.add(phinLid);

  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), phinMat);
  knob.position.y = 1.08;
  group.add(knob);

  return group;
}

// 3. SHIELD (Vietnamese Nón Lá Shield)
function createShieldModel() {
  const group = new THREE.Group();
  group.name = 'shield';

  const strawMat = new THREE.MeshStandardMaterial({
    color: '#f4d58d',
    roughness: 0.7,
    side: THREE.DoubleSide,
  });
  const ribbonMat = new THREE.MeshStandardMaterial({ color: '#da291c', roughness: 0.5 });
  const starMat = new THREE.MeshStandardMaterial({
    color: '#ffd166',
    metalness: 0.85,
    roughness: 0.2,
  });

  // Conical hat
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.42, 24, 1, true), strawMat);
  cone.position.y = 0.21;
  group.add(cone);

  // Hat brim ring
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 8, 24), strawMat);
  brim.rotation.x = Math.PI / 2;
  group.add(brim);

  // Chin ribbon band
  const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.015, 8, 16, Math.PI), ribbonMat);
  ribbon.position.y = 0.1;
  ribbon.rotation.x = Math.PI / 2;
  group.add(ribbon);

  // Decorative Golden Star on front slope
  const starGeom = new THREE.OctahedronGeometry(0.08, 0);
  starGeom.scale(1, 1, 0.3);
  const star = new THREE.Mesh(starGeom, starMat);
  star.position.set(0, 0.22, 0.32);
  star.rotation.x = -0.55;
  group.add(star);

  return group;
}

// 4. BANH MI (Crispy Baguette with Garnish)
function createBanhMiModel() {
  const group = new THREE.Group();
  group.name = 'banhmi';

  const crustMat = new THREE.MeshStandardMaterial({ color: '#d48b38', roughness: 0.65 });
  const paperMat = new THREE.MeshStandardMaterial({ color: '#ede0d4', roughness: 0.9 });
  const fillingPate = new THREE.MeshStandardMaterial({ color: '#5d4037', roughness: 0.8 });
  const fillingHam = new THREE.MeshStandardMaterial({ color: '#e57373', roughness: 0.6 });
  const herbGreen = new THREE.MeshStandardMaterial({ color: '#2e7d32', roughness: 0.6 });
  const chiliRed = new THREE.MeshStandardMaterial({ color: '#d32f2f', roughness: 0.4 });

  // Main Baguette Body (tapered capsule-like loaf)
  const loaf = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.85, 12), crustMat);
  loaf.rotation.z = Math.PI / 2;
  group.add(loaf);

  // Loaf ends
  const endLeft = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), crustMat);
  endLeft.position.x = -0.42;
  group.add(endLeft);

  const endRight = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), crustMat);
  endRight.position.x = 0.42;
  group.add(endRight);

  // Side cut slit with visible savory fillings
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.12), fillingPate);
  slit.position.set(0, 0.02, 0.12);
  group.add(slit);

  const ham = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.06), fillingHam);
  ham.position.set(0, 0.04, 0.15);
  group.add(ham);

  // Herbs & chili
  for (let i = -2; i <= 2; i++) {
    const herb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.05), herbGreen);
    herb.position.set(i * 0.12, 0.06, 0.15);
    herb.rotation.z = 0.3 * i;
    group.add(herb);
  }

  const chili = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.06), chiliRed);
  chili.position.set(0.05, 0.08, 0.16);
  group.add(chili);

  // Paper Wrapper Sleeve around the center
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.28, 14), paperMat);
  sleeve.rotation.z = Math.PI / 2;
  group.add(sleeve);

  return group;
}

// 5. ICED TEA (Ly Trà Đá Sài Gòn)
function createIcedTeaModel() {
  const group = new THREE.Group();
  group.name = 'icedtea';

  const teaMat = new THREE.MeshStandardMaterial({
    color: '#e6a122',
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
  });
  const iceMat = new THREE.MeshStandardMaterial({
    color: '#e0f7fa',
    transparent: true,
    opacity: 0.65,
    roughness: 0.1,
  });
  const strawMat = new THREE.MeshStandardMaterial({ color: '#ff3366', roughness: 0.4 });
  const mintMat = new THREE.MeshStandardMaterial({ color: '#388e3c', roughness: 0.5 });

  // Fluted tall glass
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.75, 16, 1, true), glassMat);
  glass.position.y = 0.38;
  group.add(glass);

  // Tea liquid
  const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.18, 0.65, 16), teaMat);
  tea.position.y = 0.34;
  group.add(tea);

  // Ice cubes
  for (let i = 0; i < 4; i++) {
    const ice = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), iceMat);
    ice.position.set(
      (Math.random() - 0.5) * 0.18,
      0.45 + (i * 0.06),
      (Math.random() - 0.5) * 0.18
    );
    ice.rotation.set(0.3 * i, 0.7 * i, 0.2 * i);
    group.add(ice);
  }

  // Drinking Straw
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.9, 8), strawMat);
  straw.position.set(0.08, 0.52, 0.04);
  straw.rotation.z = -0.22;
  group.add(straw);

  // Mint garnish leaf
  const mint = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.06), mintMat);
  mint.position.set(-0.12, 0.72, 0.08);
  mint.rotation.set(0.3, 0.5, 0.4);
  group.add(mint);

  return group;
}

// 6. MOTORBIKE (Iconic Saigon Honda Scooter / Wave)
function createMotorbikeModel() {
  const group = new THREE.Group();
  group.name = 'motorbike';

  const bodyRed = new THREE.MeshStandardMaterial({ color: '#c62828', roughness: 0.35, metalness: 0.2 });
  const tireRubber = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 });
  const wheelRim = new THREE.MeshStandardMaterial({ color: '#e0e0e0', roughness: 0.2, metalness: 0.85 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.15, metalness: 0.9 });
  const seatBlack = new THREE.MeshStandardMaterial({ color: '#212121', roughness: 0.8 });
  const headlightMat = new THREE.MeshStandardMaterial({ color: '#fff9c4', emissive: '#fff9c4', emissiveIntensity: 0.6 });
  const taillightMat = new THREE.MeshStandardMaterial({ color: '#ff1744', emissive: '#ff1744', emissiveIntensity: 0.8 });
  const cargoMat = new THREE.MeshStandardMaterial({ color: '#ffb300', roughness: 0.6 });

  // Front wheel
  const fWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 16), tireRubber);
  fWheel.rotation.z = Math.PI / 2;
  fWheel.position.set(0, 0.32, -0.65);
  group.add(fWheel);

  const fRim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.11, 12), wheelRim);
  fRim.rotation.z = Math.PI / 2;
  fRim.position.set(0, 0.32, -0.65);
  group.add(fRim);

  // Rear wheel
  const rWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 16), tireRubber);
  rWheel.rotation.z = Math.PI / 2;
  rWheel.position.set(0, 0.32, 0.65);
  group.add(rWheel);

  const rRim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.11, 12), wheelRim);
  rRim.rotation.z = Math.PI / 2;
  rRim.position.set(0, 0.32, 0.65);
  group.add(rRim);

  // Main step-through chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 1.1), bodyRed);
  chassis.position.set(0, 0.55, 0);
  group.add(chassis);

  // Front leg shield
  const legShield = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.12), bodyRed);
  legShield.position.set(0, 0.72, -0.45);
  legShield.rotation.x = 0.4;
  group.add(legShield);

  // Handlebars
  const bars = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 8), chrome);
  bars.rotation.z = Math.PI / 2;
  bars.position.set(0, 1.05, -0.42);
  group.add(bars);

  // Headlight
  const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12), headlightMat);
  headlight.rotation.x = Math.PI / 2;
  headlight.position.set(0, 1.02, -0.56);
  group.add(headlight);

  // Padded leather seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.65), seatBlack);
  seat.position.set(0, 0.78, 0.15);
  group.add(seat);

  // Chrome exhaust pipe
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.7, 8), chrome);
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.set(0.22, 0.3, 0.35);
  group.add(exhaust);

  // Rear cargo delivery box / delivery basket
  const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.35), cargoMat);
  cargoBox.position.set(0, 0.98, 0.62);
  group.add(cargoBox);

  // Rear taillight
  const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.04), taillightMat);
  taillight.position.set(0, 0.68, 0.82);
  group.add(taillight);

  return group;
}

// 7. FOOD CART (Xe Bánh Mì / Xe Hủ Tiếu)
function createFoodCartModel() {
  const group = new THREE.Group();
  group.name = 'foodcart';

  const steelMat = new THREE.MeshStandardMaterial({ color: '#e0e0e0', metalness: 0.85, roughness: 0.25 });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#b0bec5', transparent: true, opacity: 0.45, roughness: 0.1 });
  const canopyRedMat = new THREE.MeshStandardMaterial({ color: '#da291c', roughness: 0.5 });
  const canopyYellowMat = new THREE.MeshStandardMaterial({ color: '#ffd166', roughness: 0.5 });
  const wheelRubberMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 });
  const wheelHubMat = new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.5, roughness: 0.3 });
  const poleMat = new THREE.MeshStandardMaterial({ color: '#bdbdbd', metalness: 0.7, roughness: 0.3 });

  // Lower steel cabinet
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 1.4), steelMat);
  cabinet.position.set(0, 0.72, 0);
  group.add(cabinet);

  // Wheels
  [-0.58, 0.58].forEach((x) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16), wheelRubberMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.35, 0.2);
    group.add(wheel);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.09, 12), wheelHubMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, 0.35, 0.2);
    group.add(hub);
  });

  // Front small caster wheels
  [-0.45, 0.45].forEach((x) => {
    const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), wheelRubberMat);
    caster.rotation.z = Math.PI / 2;
    caster.position.set(x, 0.12, -0.55);
    group.add(caster);
  });

  // Glass display showcase
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.75, 1.15), glassMat);
  glass.position.set(0, 1.52, -0.05);
  group.add(glass);

  // Corner poles for canopy
  [
    [-0.52, -0.65],
    [0.52, -0.65],
    [-0.52, 0.65],
    [0.52, 0.65],
  ].forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.35, 8), poleMat);
    pole.position.set(px, 1.82, pz);
    group.add(pole);
  });

  // Striped Awning Canopy Roof
  const canopyBase = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 1.65), canopyRedMat);
  canopyBase.position.set(0, 2.38, 0);
  group.add(canopyBase);

  // Alternating Yellow awning stripes
  for (let s = -2; s <= 2; s += 2) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.07, 1.66), canopyYellowMat);
    stripe.position.set(s * 0.24, 2.38, 0);
    group.add(stripe);
  }

  // Push handlebar
  const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), poleMat);
  handleBar.rotation.z = Math.PI / 2;
  handleBar.position.set(0, 1.05, 0.82);
  group.add(handleBar);

  return group;
}

async function run() {
  console.log('Generating Saigon Rush 3D Low-Poly GLB Models...');
  await exportSceneToGLB(createCoinModel(), 'coin.glb');
  await exportSceneToGLB(createCoffeeModel(), 'coffee.glb');
  await exportSceneToGLB(createShieldModel(), 'shield.glb');
  await exportSceneToGLB(createBanhMiModel(), 'banhmi.glb');
  await exportSceneToGLB(createIcedTeaModel(), 'icedtea.glb');
  await exportSceneToGLB(createMotorbikeModel(), 'motorbike.glb');
  await exportSceneToGLB(createFoodCartModel(), 'foodcart.glb');
  console.log('All 7 GLB models successfully generated in public/assets/models/!');
}

run().catch((err) => {
  console.error('Error generating models:', err);
  process.exit(1);
});
