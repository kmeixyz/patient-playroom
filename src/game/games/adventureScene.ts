import * as THREE from 'three'
import type { OrbitState, SkyState } from '../logic'

const colors = [0xff9d32, 0x34ced8, 0xd985f2, 0xf66ba4, 0x9cda63, 0x578cff]
const positions = [[-2.85, 1.6, 0], [0, 2.75, -1], [2.85, 1.6, 0], [-2.85, -1.65, 0], [0, -2.8, -1], [2.85, -1.65, 0]]
const curve = (z: number) => Math.sin(Math.max(0, 2 - z) * .032) * Math.min(Math.max(0, 2 - z) * .075, 4)

/** Shared geometry, bounded particles and instanced track keep the worlds light on phones. */
export function createAdventureScene(kind: 'sky' | 'orbit', initialSky: SkyState) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(kind === 'sky' ? 58 : 46, 1, .1, 180)
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
  const torus = (r: number, tube: number, color: number, parent: THREE.Object3D, glow = false, arc = Math.PI * 2) => add(new THREE.TorusGeometry(r, tube, 6, 36, arc), material(color, glow), parent)

  // A small procedural sky texture provides depth without a post-processing pass.
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, kind === 'sky' ? '#248bd1' : '#070d2d')
  gradient.addColorStop(.6, kind === 'sky' ? '#8bdff2' : '#171149')
  gradient.addColorStop(1, kind === 'sky' ? '#e7fcff' : '#07385d')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256)
  if (kind === 'orbit') for (let i = 0; i < 5; i++) {
    const x = 30 + i * 48, y = 240 - i * 50, glow = ctx.createRadialGradient(x, y, 0, x, y, 75)
    glow.addColorStop(0, i % 2 ? '#972dda35' : '#05bbdf35'); glow.addColorStop(1, '#00000000')
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 256, 256)
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture); scene.background = texture
  scene.fog = new THREE.Fog(kind === 'sky' ? 0xcaf4ff : 0x11153b, kind === 'sky' ? 48 : 25, 135)
  scene.add(new THREE.HemisphereLight(kind === 'sky' ? 0xe9fbff : 0x8fb9ff, kind === 'sky' ? 0x879b7b : 0x42265c, 2.2))
  const sun = new THREE.DirectionalLight(0xffe7c3, 3.2); sun.position.set(-8, 12, 8); scene.add(sun)
  const rim = new THREE.DirectionalLight(0x43dfff, kind === 'sky' ? .8 : 2.5); rim.position.set(4, 3, -5); scene.add(rim)

  function robot() {
    const group = new THREE.Group()
    ball(.68, 0xf7e9d3, group)
    const face = (width: number, height: number, color: number, z: number) => {
      const s = new THREE.Shape(), x = -width / 2, y = -height / 2, r = .2
      s.moveTo(x + r, y); s.lineTo(x + width - r, y); s.quadraticCurveTo(x + width, y, x + width, y + r)
      s.lineTo(x + width, y + height - r); s.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
      s.lineTo(x + r, y + height); s.quadraticCurveTo(x, y + height, x, y + height - r)
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
      const m = add(new THREE.ExtrudeGeometry(s, { depth: .025, bevelEnabled: true, bevelSize: .025, bevelThickness: .02, bevelSegments: 2, steps: 1, curveSegments: 8 }), material(color), group)
      m.position.set(0, .04, z)
    }
    face(1.1, .85, 0x829bac, .68)
    face(1.01, .76, 0x071729, .728)
    for (const side of [-1, 1]) {
      const eye = torus(.09, .028, 0x5bffff, group, true, Math.PI); eye.position.set(side * .19, .035, .792)
      const ear = ball(.27, 0xfda139, group); ear.position.set(side * .66, .07, 0); ear.scale.x *= .48
      const pad = ball(.19, 0x214978, group); pad.position.set(side * .735, .07, .01); pad.scale.x *= .3
      const light = torus(.18, .023, 0x5bffff, group, true); light.rotation.y = Math.PI / 2; light.position.set(side * .785, .07, .01)
      const bolt = ball(.032, 0x6e8194, group); bolt.position.set(side * .36, -.38, .47)
    }
    const headphones = torus(.77, .066, 0x283b59, group, false, Math.PI); headphones.position.y = .07
    const stripe = torus(.8, .016, 0x73e9f3, group, true, Math.PI); stripe.position.set(0, .07, .035)
    const mouth = torus(.085, .025, 0x67ffed, group, true, Math.PI); mouth.rotation.z = Math.PI; mouth.position.set(0, -.19, .792)
    const chin = ball(.18, 0x65bcc8, group); chin.position.set(0, -.52, .27); chin.scale.multiply(new THREE.Vector3(1.2, .55, .6))
    return group
  }

  const planets: THREE.Group[] = [], planetBodies: THREE.Mesh[] = [], planetBands: THREE.Mesh[] = []
  const islands: { group: THREE.Group; offset: number }[] = [], clouds: THREE.Group[] = [], arches: THREE.Group[] = []
  const items = new Map<number, THREE.Object3D>(), waterfalls: THREE.Mesh[] = [], rings: THREE.Object3D[] = []
  let ship: THREE.Group | null = null, buddy: THREE.Group | null = null
  const engines: THREE.Mesh[] = []

  if (kind === 'sky') {
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
    ship = new THREE.Group()
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
  } else {
    buddy = robot(); buddy.scale.setScalar(1.65); scene.add(buddy)
    for (let i = 0; i < 3; i++) {
      const ring = torus(2.1 + i * .38, .018, i % 2 ? 0xffad42 : 0x35d9ff, scene, true); ring.rotation.set(.65 + i * .45, .18, i * .7); rings.push(ring)
    }
    const starPositions = new Float32Array(240 * 3)
    for (let i = 0; i < 240; i++) { starPositions[i * 3] = Math.sin(i * 19.3) * 25; starPositions[i * 3 + 1] = Math.cos(i * 13.7) * 19; starPositions[i * 3 + 2] = -7 - i % 27 }
    const starsGeo = new THREE.BufferGeometry(); starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3)); geometries.add(starsGeo)
    const starsMat = new THREE.PointsMaterial({ color: 0xaedfff, size: .055, sizeAttenuation: true }); materials.add(starsMat); scene.add(new THREE.Points(starsGeo, starsMat))
    for (let i = 0; i < 6; i++) {
      const group = new THREE.Group(), body = add(ballGeo, new THREE.MeshStandardMaterial({ color: colors[i], roughness: .45, metalness: .18 }), group)
      materials.add(body.material); body.scale.setScalar(.67); planetBodies.push(body)
      const band = add(new THREE.TorusGeometry(.89, .045, 6, 40), new THREE.MeshStandardMaterial({ color: colors[(i + 2) % 6], emissive: colors[(i + 2) % 6], emissiveIntensity: .4 }), group)
      materials.add(band.material); band.rotation.set(1.2, .1, .15); planetBands.push(band)
      for (let c = 0; c < 3; c++) {
        const crater = ball(.105 + c * .017, 0x213e65, group); crater.position.set(Math.sin(c * 2.4 + i) * .33, Math.cos(c * 2.4 + i) * .35, .55); crater.scale.z *= .35
        const lip = torus(.105 + c * .017, .015, 0xffd4a6, group); lip.position.copy(crater.position); lip.position.z += .035
      }
      group.position.fromArray(positions[i]!); scene.add(group); planets.push(group)
    }
    const crystalGeo = new THREE.OctahedronGeometry(1), rockGeo = new THREE.IcosahedronGeometry(.16, 0)
    for (let i = 0; i < 18; i++) {
      const crystal = add(i % 3 ? crystalGeo : rockGeo, material(i % 2 ? 0xa447d4 : 0x36bddd, i % 3 !== 0))
      const side = i % 2 ? -1 : 1; crystal.position.set(side * (4.6 + i % 3 * .4), -3.2 + i % 4 * .22, -2 - i % 5)
      crystal.scale.set(.15 + i % 3 * .06, .5 + i % 4 * .15, .18); crystal.rotation.z = side * -.2
    }
  }

  // A fixed pool, reused for each catch. No accumulating meshes or timers.
  const particleGeo = new THREE.OctahedronGeometry(.09), particleMat = material(kind === 'sky' ? 0xffef9e : 0x93faff, true)
  const particles = Array.from({ length: 24 }, () => { const m = add(particleGeo, particleMat); m.visible = false; return { mesh: m, life: 0, velocity: new THREE.Vector3() } })
  let previousGems = 0, previousPopped = 0, lastSlots = [0, 1, 2, 3, 4, 5], burst = 0
  const bounce = [0, 0, 0, 0, 0, 0]
  const emit = (point: THREE.Vector3) => {
    for (let i = 0; i < 12; i++) { const p = particles[(burst++ % particles.length)]!; p.life = .6; p.mesh.visible = true; p.mesh.position.copy(point); p.velocity.set(Math.sin(i * 2.4) * 2.3, Math.cos(i * 2.4) * 2 + .7, Math.sin(i * 1.1)); p.mesh.scale.setScalar(1) }
  }
  let quietView = false
  const resize = (width: number, height: number, quiet: boolean) => {
    camera.aspect = width / Math.max(height, 1); quietView = quiet
    if (kind === 'sky') { camera.position.set(0, quiet ? 17 : 4.9, quiet ? 11 : camera.aspect < 1 ? 10 : 8.5); camera.lookAt(0, quiet ? 0 : .3, quiet ? -6 : -13) }
    else { camera.position.set(0, 0, Math.max(9.6, 9.3 / camera.aspect)); camera.lookAt(0, 0, 0) }
    camera.updateProjectionMatrix()
  }
  const update = (sky: SkyState, orbit: OrbitState, time: number, dt: number, quiet: boolean) => {
    if (quietView !== quiet) resize(camera.aspect * 100, 100, quiet)
    if (ship) {
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
    }
    if (buddy) {
      if (orbit.popped > previousPopped) { const index = orbit.slots.findIndex((v, i) => v !== lastSlots[i]); if (index >= 0) { bounce[index] = .32; if (!quiet) emit(planets[index]!.position) } }
      previousPopped = orbit.popped; lastSlots = [...orbit.slots]
      buddy.position.y = quiet ? 0 : Math.sin(time * 1.5) * .12; buddy.rotation.y = quiet ? 0 : Math.sin(time * .65) * .13
      rings.forEach((ring, i) => { if (!quiet) ring.rotation.z += dt * (i % 2 ? -.14 : .12) })
      planets.forEach((planet, i) => {
        const p = positions[i]!, wide = Math.min(1.65, Math.max(1, camera.aspect / 1.15))
        planet.position.set(p[0]! * wide, p[1]!, p[2]!)
        // Centers remain stationary: motion belongs to the artwork, never to the tap target.
        bounce[i] = Math.max(0, bounce[i]! - dt)
        planet.scale.setScalar(quiet ? 1 : 1 + Math.sin((.32 - bounce[i]!) / .32 * Math.PI) * .13)
        const body = planetBodies[i]!; (body.material as THREE.MeshStandardMaterial).color.setHex(colors[orbit.slots[i]! % 6]!)
        const band = planetBands[i]!; band.rotation.z = quiet ? .15 : time * .25 + i
        ;(band.material as THREE.MeshStandardMaterial).color.setHex(colors[(orbit.slots[i]! + 2) % 6]!)
      })
    }
    for (const p of particles) { if (quiet) p.life = 0; if (p.life <= 0) { p.mesh.visible = false; continue }; p.life -= dt; p.mesh.position.addScaledVector(p.velocity, dt); p.mesh.scale.setScalar(Math.max(0, p.life / .6)); p.mesh.rotation.y += dt * 2 }
  }
  const dispose = () => { geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); scene.clear() }
  return { scene, camera, planets, resize, update, dispose }
}
