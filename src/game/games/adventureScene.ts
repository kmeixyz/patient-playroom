import * as THREE from 'three'
import type { SkyState } from '../logic'

const curve = (z: number) => Math.sin(Math.max(0, 2 - z) * .032) * Math.min(Math.max(0, 2 - z) * .075, 4)

/** Shared geometry, bounded particles and instanced track keep the world light on phones. */
export function createAdventureScene(initialSky: SkyState) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(58, 1, .1, 180)
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>()
  const cache = new Map<string, THREE.MeshStandardMaterial>()
  const material = (color: number, glow = false) => {
    const key = `${color}-${glow}`
    if (cache.has(key)) return cache.get(key)!
    const value = new THREE.MeshStandardMaterial({ color, roughness: glow ? .3 : .55, metalness: .12, emissive: glow ? color : 0, emissiveIntensity: glow ? .7 : 0 })
    materials.add(value); cache.set(key, value); return value
  }
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D = scene) => {
    geometries.add(geo); const mesh = new THREE.Mesh(geo, mat); parent.add(mesh); return mesh
  }
  const ballGeo = new THREE.SphereGeometry(1, 20, 14), cubeGeo = new THREE.BoxGeometry(1, 1, 1)
  const ball = (r: number, color: number, parent: THREE.Object3D, glow = false) => { const m = add(ballGeo, material(color, glow), parent); m.scale.setScalar(r); return m }
  const block = (w: number, h: number, d: number, color: number, parent: THREE.Object3D) => { const m = add(cubeGeo, material(color), parent); m.scale.set(w, h, d); return m }
  const torus = (r: number, tube: number, color: number, parent: THREE.Object3D) => add(new THREE.TorusGeometry(r, tube, 6, 36), material(color), parent)

  // A small procedural sky texture provides depth without a post-processing pass.
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, '#248bd1')
  gradient.addColorStop(.6, '#8bdff2')
  gradient.addColorStop(1, '#e7fcff')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture); scene.background = texture
  scene.fog = new THREE.Fog(0xcaf4ff, 48, 135)
  scene.add(new THREE.HemisphereLight(0xe9fbff, 0x879b7b, 2.2))
  const sun = new THREE.DirectionalLight(0xffe7c3, 3.2); sun.position.set(-8, 12, 8); scene.add(sun)
  const rim = new THREE.DirectionalLight(0x43dfff, .8); rim.position.set(4, 3, -5); scene.add(rim)

  const islands: { group: THREE.Group; offset: number }[] = [], clouds: THREE.Group[] = [], arches: THREE.Group[] = []
  const items = new Map<number, THREE.Object3D>(), waterfalls: THREE.Mesh[] = [], engines: THREE.Mesh[] = []

  const roadGeo = new THREE.BoxGeometry(7, .35, 2.55), edgeGeo = new THREE.BoxGeometry(.28, .4, 2.3)
  geometries.add(roadGeo); geometries.add(edgeGeo)
  const road = new THREE.InstancedMesh(roadGeo, material(0x8bedcb), 55), edge = new THREE.InstancedMesh(edgeGeo, material(0xb5a0e8), 110)
  const markers = new THREE.InstancedMesh(cubeGeo, material(0xd6ffde), 110), dummy = new THREE.Object3D()
  geometries.add(cubeGeo)
  for (let i = 0; i < 55; i++) {
    const z = 8 - i * 2.5, x = curve(z), angle = Math.atan2(curve(z - .2) - curve(z + .2), .4)
    dummy.position.set(x, -.4, z); dummy.rotation.set(0, -angle, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); road.setMatrixAt(i, dummy.matrix)
    for (let j = 0; j < 2; j++) {
      dummy.position.set(x + (j ? 3.52 : -3.52), -.12, z); dummy.updateMatrix(); edge.setMatrixAt(i * 2 + j, dummy.matrix)
      dummy.position.set(x + (j ? 1.14 : -1.14), -.21, z); dummy.scale.set(.06, .015, 1.2); dummy.updateMatrix(); markers.setMatrixAt(i * 2 + j, dummy.matrix); dummy.scale.set(1, 1, 1)
    }
  }
  scene.add(road, edge, markers)
  for (let i = 0; i < 5; i++) {
    const group = new THREE.Group()
    const arch = torus(4.1, .4, 0xaa8bda, group); arch.rotation.z = .07
    for (let j = 0; j < 12; j++) {
      const angle = j / 12 * Math.PI * 2
      const stone = block(.16, .79, .82, 0xc1a7eb, group); stone.position.set(Math.cos(angle) * 4.1, Math.sin(angle) * 4.1, 0); stone.rotation.z = angle
      if (j % 3 === 0) { const gem = add(new THREE.OctahedronGeometry(.2), material(0x82ffe0, true), group); gem.position.set(Math.cos(angle) * 4.1, Math.sin(angle) * 4.1, .47) }
    }
    scene.add(group); arches.push(group)
  }
  const cliffGeo = new THREE.IcosahedronGeometry(1, 0)
  for (let i = 0; i < 16; i++) {
    const group = new THREE.Group(), side = i % 2 ? 1 : -1
    group.position.set(side * (8 + i % 4 * 2.5), -3.4 - i % 3, 8 - i * 9)
    const cliff = add(cliffGeo, material(i % 2 ? 0xda9a7c : 0xe8b393), group); cliff.scale.set(3.5, 4.2, 2.8)
    const grass = add(new THREE.CylinderGeometry(3.2, 2.9, .55, 7), material(0xb8d66c), group); grass.position.y = 3
    for (let j = 0; j < 2; j++) {
      const tree = new THREE.Group(); tree.position.set(j ? 1.2 : -.8, 3.6, j ? -.5 : .6)
      const trunk = block(.3, 1.5, .3, 0x8f7562, tree); trunk.position.y = .5
      const leaves = add(cliffGeo, material(j ? 0xa5d34d : 0xc9e25a), tree); leaves.position.y = 1.75; leaves.scale.set(1.5, 1.2, 1.25); group.add(tree)
    }
    if (i % 3 === 0) {
      const water = block(.8, 6, .12, 0x84edff, group); water.position.set(side * -1.5, .1, 2.45); waterfalls.push(water)
      const shine = block(.13, 5.5, .14, 0xd8ffff, group); shine.position.set(side * -1.5 - .15, .2, 2.5)
    }
    scene.add(group); islands.push({ group, offset: i * 9 })
  }
  for (let i = 0; i < 10; i++) {
    const cloud = new THREE.Group()
    for (let j = 0; j < 3; j++) { const puff = ball(1.7 + j * .3, 0xf0fcff, cloud); puff.position.x = j * 1.7; puff.scale.multiply(new THREE.Vector3(1.6, .6, 1)) }
    cloud.position.set((i % 2 ? 1 : -1) * (13 + i % 4 * 3), 2 + i % 3, -i * 13); scene.add(cloud); clouds.push(cloud)
  }
  const ship = new THREE.Group()
  const hull = add(new THREE.CapsuleGeometry(.53, 1.6, 4, 12), material(0x5ff0c8), ship); hull.rotation.x = Math.PI / 2; hull.scale.set(1.3, 1, .28)
  const deck = block(.74, .12, 1.7, 0x234e54, ship); deck.position.y = .17
  for (const z of [-.52, .5]) { const strip = block(.61, .035, .1, 0x75ffe7, ship); strip.position.set(0, .245, z) }
  const nose = add(new THREE.OctahedronGeometry(.2), material(0x8bffe5, true), ship); nose.position.set(0, .17, -.96); nose.scale.set(1, .4, 1.6)
  for (const side of [-1, 1]) {
    const engine = ball(.19, 0x82fff0, ship, true); engine.scale.set(.16, .1, .45); engine.position.set(side * .44, -.17, .65); engines.push(engine)
    const rail = block(.055, .06, 1.15, 0xf3fff0, ship); rail.position.set(side * .51, .07, 0)
  }
  ship.position.set(0, .5, 2); scene.add(ship)
  const gemGeo = new THREE.OctahedronGeometry(.42), obstacleGeo = new THREE.BoxGeometry(1.25, .85, 1.15)
  for (const item of initialSky.items) {
    const group = new THREE.Group()
    if (item.kind === 'gem') { const gem = add(gemGeo, material(0xf4b516), group); gem.scale.y = 1.5 }
    else { add(obstacleGeo, material(0xd85a4d), group); const mark = block(.8, .11, 1.17, 0xffebd1, group); mark.rotation.z = -.55 }
    group.visible = false; scene.add(group); items.set(item.id, group)
  }

  // A fixed pool, reused for each catch. No accumulating meshes or timers.
  const particleGeo = new THREE.OctahedronGeometry(.09), particleMat = material(0xffef9e, true)
  const particles = Array.from({ length: 24 }, () => { const m = add(particleGeo, particleMat); m.visible = false; return { mesh: m, life: 0, velocity: new THREE.Vector3() } })
  let previousGems = 0, burst = 0
  const emit = (point: THREE.Vector3) => {
    for (let i = 0; i < 12; i++) { const p = particles[(burst++ % particles.length)]!; p.life = .6; p.mesh.visible = true; p.mesh.position.copy(point); p.velocity.set(Math.sin(i * 2.4) * 2.3, Math.cos(i * 2.4) * 2 + .7, Math.sin(i * 1.1)); p.mesh.scale.setScalar(1) }
  }
  let quietView = false
  const resize = (width: number, height: number, quiet: boolean) => {
    camera.aspect = width / Math.max(height, 1); quietView = quiet
    camera.position.set(0, quiet ? 17 : 4.9, quiet ? 11 : camera.aspect < 1 ? 10 : 8.5); camera.lookAt(0, quiet ? 0 : .3, quiet ? -6 : -13)
    camera.updateProjectionMatrix()
  }
  const update = (sky: SkyState, time: number, dt: number, quiet: boolean) => {
    if (quietView !== quiet) resize(camera.aspect * 100, 100, quiet)
    const target = sky.lane * 2.25; ship.position.x = quiet ? target : THREE.MathUtils.damp(ship.position.x, target, 20, dt)
    ship.position.y = .5 + (sky.air > 0 ? Math.sin((.8 - sky.air) / .8 * Math.PI) * 1.65 : quiet ? 0 : Math.sin(time * 5) * .045)
    ship.rotation.z = quiet ? 0 : THREE.MathUtils.clamp((target - ship.position.x) * -.14, -.2, .2)
    engines.forEach((engine, i) => { engine.scale.z = quiet ? .4 : .48 + Math.sin(time * 9 + i) * .08 })
    for (const item of sky.items) { const m = items.get(item.id)!; const z = 2 + sky.distance - item.distance; m.position.set(item.lane * 2.25 + curve(z), item.kind === 'gem' ? 1.1 : .22, z); m.visible = !item.hit && z > -90 && z < 8; if (item.kind === 'gem') m.rotation.y = quiet ? 0 : time * 1.5 }
    arches.forEach((arch, i) => { const z = quiet ? -i * 29 - 20 : 6 - ((i * 29 + 145 - sky.distance % 145) % 145); arch.position.set(curve(z), 1.25, z) })
    islands.forEach(({ group, offset }) => { group.position.z = quiet ? 8 - offset : 16 - ((offset + 160 - sky.distance % 160) % 160) })
    clouds.forEach((cloud, i) => { cloud.position.y = 2 + i % 3 + (quiet ? 0 : Math.sin(time * .3 + i) * .22) })
    waterfalls.forEach((water, i) => { water.scale.y = quiet ? 6 : 6 + Math.sin(time * 2 + i) * .18 })
    if (sky.gems > previousGems && !quiet) emit(ship.position.clone().add(new THREE.Vector3(0, .55, -.5)))
    previousGems = sky.gems
    for (const p of particles) { if (quiet) p.life = 0; if (p.life <= 0) { p.mesh.visible = false; continue }; p.life -= dt; p.mesh.position.addScaledVector(p.velocity, dt); p.mesh.scale.setScalar(Math.max(0, p.life / .6)); p.mesh.rotation.y += dt * 2 }
  }
  const dispose = () => { geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); scene.clear() }
  return { scene, camera, resize, update, dispose }
}
