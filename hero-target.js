import * as THREE from './vendor/three.module.js';

const host = document.getElementById('target-scene');
try {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(3.3, 2.5, 10.8);
  camera.lookAt(0, .25, 0);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.append(renderer.domElement);
  host.classList.add('scene-ready');
  scene.add(new THREE.HemisphereLight(0xfff7e7, 0x66101a, 3));
  const key = new THREE.DirectionalLight(0xffffff, 4);
  key.position.set(-3, 7, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  key.shadow.bias = -.001; scene.add(key);
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
    const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(.28, .19); shape.lineTo(.28, .64); shape.lineTo(0, .48); shape.closePath();
    const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .022, bevelEnabled: true, bevelSize: .012, bevelThickness: .01, bevelSegments: 2 }), red);
    fin.position.y = length - .48; fin.rotation.y = i * Math.PI * 2 / 3; arrow.add(fin);
  }
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
  model.add(arrow); model.position.y = .9;
  const wood = new THREE.MeshStandardMaterial({ color: 0x9a6034, roughness: .85 });
  const woodLight = new THREE.MeshStandardMaterial({ color: 0xbe844c, roughness: .8 });
  function beam(from, to, width, material = wood) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, a.distanceTo(b), width), material);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), b.sub(a).normalize());
    mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  }
  beam([-.95,-1.7,.12],[-.52,1.85,-.22],.18);
  beam([.95,-1.7,.12],[.52,1.85,-.22],.18);
  beam([0,-1.7,-1.45],[0,1.8,-.32],.20);
  beam([-1.02,-.65,.16],[1.02,-.65,.16],.2,woodLight);
  beam([-.85,-1.3,.1],[.85,-1.3,.1],.12);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(3.15, 96), new THREE.MeshStandardMaterial({ color: 0xb91f29, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.72; ground.receiveShadow = true; scene.add(ground);
  for (let i = 0; i < 24; i++) {
    const missed = arrow.clone();
    const angle = i * 2.39996;
    const radius = 1.05 + (i % 6) * .29;
    missed.position.set(Math.cos(angle) * radius, -1.64 + (i % 3) * .025, Math.sin(angle) * radius + .15);
    missed.scale.setScalar(.62 + (i % 4) * .055);
    missed.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(Math.cos(angle + .8), .015, Math.sin(angle + .8)).normalize());
    scene.add(missed);
  }
  scene.traverse(object => { if (object.isMesh && object !== ground) { object.castShadow = true; object.receiveShadow = true; } });
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(host); resize();
} catch (error) {
  console.warn('Target preview unavailable', error);
}
