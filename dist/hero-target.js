import * as THREE from './vendor/three.module.js';

const host = document.getElementById('target-scene');
try {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(-3.8, 3.0, 11.4);
  camera.lookAt(0, .25, 0);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.append(renderer.domElement);
  host.classList.add('scene-ready');
  scene.add(new THREE.HemisphereLight(0xfff7e7, 0x7b2832, 1.5));
  const key = new THREE.DirectionalLight(0xffead2, 3);
  key.position.set(-3, 7, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  key.shadow.bias = -.001; key.shadow.radius = 5; scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd4ae, 1.8);
  rim.position.set(4, 1, -3); scene.add(rim);
  const grainData = new Uint8Array(128 * 256 * 4);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 128; x++) {
    const grain = Math.sin(x * .65 + Math.sin(y * .035) * 2.5) * 8 + Math.sin(x * 2.9 + y * .04) * 3;
    const i = (y * 128 + x) * 4;
    grainData[i] = 214 + grain; grainData[i+1] = 159 + grain; grainData[i+2] = 95 + grain; grainData[i+3] = 255;
  }
  const grainMap = new THREE.DataTexture(grainData, 128, 256);
  grainMap.colorSpace = THREE.SRGBColorSpace; grainMap.wrapS = grainMap.wrapT = THREE.RepeatWrapping;
  grainMap.needsUpdate = true;
  function roundedDisc(radius, depth, material) {
    const bevel = Math.min(.045, depth / 3);
    const profile = [new THREE.Vector2(0,-depth/2), new THREE.Vector2(radius-bevel,-depth/2)];
    for(let i=0;i<=8;i++) { const a=-Math.PI/2+i*Math.PI/16; profile.push(new THREE.Vector2(radius-bevel+Math.cos(a)*bevel,-depth/2+bevel+Math.sin(a)*bevel)); }
    for(let i=0;i<=8;i++) { const a=i*Math.PI/16; profile.push(new THREE.Vector2(radius-bevel+Math.cos(a)*bevel,depth/2-bevel+Math.sin(a)*bevel)); }
    profile.push(new THREE.Vector2(0,depth/2));
    return new THREE.Mesh(new THREE.LatheGeometry(profile,96),material);
  }
  const cream = new THREE.MeshStandardMaterial({ color: 0xfff3db, roughness: .55, metalness: 0 });
  const red = new THREE.MeshStandardMaterial({ color: 0xe3313b, roughness: .46, metalness: 0 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xffffff, map: grainMap, roughness: .65 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x966032, map: grainMap, roughness: .55, metalness: .05 });
  const model = new THREE.Group(); scene.add(model);
  const backing = roundedDisc(1.55, .32, edge);
  backing.rotation.x = Math.PI / 2; model.add(backing);
  [1.54, 1.23, .92, .61, .3].forEach((radius, i) => {
    const ring = roundedDisc(radius, .065, i % 2 === 0 ? cream : red);
    ring.rotation.x = Math.PI / 2; ring.position.z = .17 + i * .045; model.add(ring);
  });
  const arrow = new THREE.Group(); arrow.position.set(0, 0, .39);
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
  const wood = new THREE.MeshStandardMaterial({ color: 0xd2a071, map: grainMap, roughness: .7 });
  const woodLight = new THREE.MeshStandardMaterial({ color: 0xffdeb3, map: grainMap, roughness: .65 });
  function beam(from, to, width, material = wood) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const length = a.distanceTo(b), r = width * .18;
    const shape = new THREE.Shape();
    shape.moveTo(-width/2+r,-length/2); shape.lineTo(width/2-r,-length/2);
    shape.quadraticCurveTo(width/2,-length/2,width/2,-length/2+r); shape.lineTo(width/2,length/2-r);
    shape.quadraticCurveTo(width/2,length/2,width/2-r,length/2); shape.lineTo(-width/2+r,length/2);
    shape.quadraticCurveTo(-width/2,length/2,-width/2,length/2-r); shape.lineTo(-width/2,-length/2+r);
    shape.quadraticCurveTo(-width/2,-length/2,-width/2+r,-length/2);
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:width*.7,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3,steps:1});
    geometry.translate(0,0,-width*.35);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), b.sub(a).normalize());
    mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  }
  beam([-.95,-1.7,.12],[-.52,1.85,-.22],.18);
  beam([.95,-1.7,.12],[.52,1.85,-.22],.18);
  beam([0,-1.7,-1.45],[0,1.8,-.32],.20);
  beam([-1.02,-.65,.16],[1.02,-.65,.16],.2,woodLight);
  beam([-.85,-1.3,.1],[.85,-1.3,.1],.12);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(3.05, 96), new THREE.MeshStandardMaterial({color:0x65862e,roughness:1}));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.72; ground.receiveShadow = true; scene.add(ground);
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 2.98, .18, 96), new THREE.MeshStandardMaterial({color:0x91613b,roughness:1}));
  soil.position.y = -1.83; soil.receiveShadow = true; scene.add(soil);
  const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(.028,.19,3), new THREE.MeshStandardMaterial({color:0x82a943,roughness:1}), 2200);
  const dummy = new THREE.Object3D();
  for(let i=0;i<2200;i++) {
    const angle = i*2.39996, radius = Math.sqrt((i+.5)/2200)*3.02;
    dummy.position.set(Math.cos(angle)*radius,-1.66,Math.sin(angle)*radius);
    dummy.rotation.set(Math.sin(i*1.7)*.28,angle,Math.cos(i*2.3)*.22);
    dummy.scale.set(1,.7+(i%7)*.12,1); dummy.updateMatrix(); grass.setMatrixAt(i,dummy.matrix);
    grass.setColorAt(i,new THREE.Color().setHSL(.22+(i%5)*.009,.42,.27+(i%7)*.028));
  }
  grass.receiveShadow = true; scene.add(grass);
  const petals = new THREE.InstancedMesh(new THREE.SphereGeometry(.04,6,4),cream,100);
  const centers = new THREE.InstancedMesh(new THREE.SphereGeometry(.028,6,4),new THREE.MeshStandardMaterial({color:0xf5bd48,roughness:1}),20);
  for(let i=0;i<20;i++) {
    const angle=i*2.39996, radius=1.35+(i%5)*.3, x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
    dummy.rotation.set(0,0,0); dummy.scale.set(1,.45,1); dummy.position.set(x,-1.53,z);dummy.updateMatrix();centers.setMatrixAt(i,dummy.matrix);
    for(let j=0;j<5;j++){ const a=j*Math.PI*2/5;dummy.position.set(x+Math.cos(a)*.055,-1.55,z+Math.sin(a)*.055);dummy.updateMatrix();petals.setMatrixAt(i*5+j,dummy.matrix); }
  }
  scene.add(petals,centers);
  for (let i = 0; i < 24; i++) {
    const missed = arrow.clone();
    const angle = i * 2.39996;
    const radius = 1.05 + (i % 6) * .29;
    missed.position.set(Math.cos(angle) * radius, -1.72, Math.sin(angle) * radius + .15);
    missed.scale.setScalar(.38 + (i % 4) * .065);
    missed.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(Math.cos(angle) * .32, 1, Math.sin(angle) * .3).normalize());
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
