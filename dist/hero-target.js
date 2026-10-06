import * as THREE from './vendor/three.module.js';

const host = document.getElementById('target-scene');
try {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.15, 8.4);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  host.append(renderer.domElement);
  host.classList.add('scene-ready');
  scene.add(new THREE.HemisphereLight(0xfff7e7, 0x66101a, 3));
  const key = new THREE.DirectionalLight(0xffffff, 4);
  key.position.set(-3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd4ae, 3);
  rim.position.set(4, 1, -3); scene.add(rim);
  const cream = new THREE.MeshStandardMaterial({ color: 0xfff3db, roughness: .33, metalness: .08 });
  const red = new THREE.MeshStandardMaterial({ color: 0xc41c2b, roughness: .3, metalness: .12 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xe2c69c, roughness: .4 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x45332b, roughness: .27, metalness: .65 });
  const model = new THREE.Group(); scene.add(model);
  const backing = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, .28, 96), edge);
  backing.rotation.x = Math.PI / 2; model.add(backing);
  [1.54, 1.23, .92, .61, .3].forEach((radius, i) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .022, 96), i % 2 === 0 ? cream : red);
    ring.rotation.x = Math.PI / 2; ring.position.z = .15 + i * .024; model.add(ring);
  });
  const arrow = new THREE.Group(); arrow.position.set(0, 0, .27);
  const length = 2.25;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, length, 16), metal);
  shaft.position.y = length / 2; arrow.add(shaft);
  const point = new THREE.Mesh(new THREE.ConeGeometry(.09, .23, 4), metal);
  point.rotation.z = Math.PI; point.position.y = .02; arrow.add(point);
  for (let i = 0; i < 3; i++) {
    const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(.28, -.16); shape.lineTo(.28, .29); shape.lineTo(0, .48); shape.closePath();
    const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .022, bevelEnabled: true, bevelSize: .012, bevelThickness: .01, bevelSegments: 2 }), red);
    fin.position.y = length - .48; fin.rotation.y = i * Math.PI * 2 / 3; arrow.add(fin);
  }
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(.52, .48, .7).normalize());
  model.add(arrow); model.rotation.set(-.13, -.38, -.15);
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host); resize();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    if (!motion.matches) {
      model.rotation.y = -.38 + t * .28;
      model.position.y = Math.sin(t * .8) * .07;
    }
    renderer.render(scene, camera);
  });
  new IntersectionObserver(([entry]) => {
    renderer.setAnimationLoop(entry.isIntersecting ? () => {
      const t = clock.getElapsedTime();
      if (!motion.matches) { model.rotation.y = -.38 + t * .28; model.position.y = Math.sin(t * .8) * .07; }
      renderer.render(scene, camera);
    } : null);
  }).observe(host);
} catch (error) {
  console.warn('Target preview unavailable', error);
}
