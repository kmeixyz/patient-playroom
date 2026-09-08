import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { advanceSky, makeSky, newOrbit, orbitBonusSlot, popOrbit, skyJump, skyLane, type SkyState, type OrbitState } from '../logic'
import { useGame } from '../useGame'
import { Icon } from '../Icons'
import { playCue } from '../sound'

type View={score:number;gems:number;bumps:number;combo:number;lane:number;air:number;cooldown:number;distance:number;popped:number;bonus:number;slots:number[]}
const planetColors=[0xf5a34e,0x77d2cf,0xc4a0ea,0xeb86ac,0xadd484,0x8dacf5]
const planetPositions=[[-3,1.8,-1],[0,2.6,-2],[3,1.7,-.5],[-3,-1.5,0],[0,-2.5,-2],[3,-1.6,-1]]

/** Real geometry and lighting, loaded only when a 3D adventure is selected. */
export function ThreeGame({kind}:{kind:'sky'|'orbit'}) {
  const runtime=useGame(),runtimeRef=useRef(runtime);runtimeRef.current=runtime
  const mount=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLCanvasElement|null>(null),targetRefs=useRef<(HTMLButtonElement|null)[]>([])
  const sky=useRef<SkyState>(makeSky()),orbit=useRef<OrbitState>(newOrbit()),ended=useRef(false)
  const [fallback,setFallback]=useState(false),[view,setView]=useState<View>({score:0,gems:0,bumps:0,combo:0,lane:0,air:0,cooldown:0,distance:0,popped:0,bonus:0,slots:[0,1,2,3,4,5]})
  const move=(delta:number)=>{if(!runtimeRef.current.paused&&!ended.current)sky.current=skyLane(sky.current,delta)}
  const jump=()=>{if(!runtimeRef.current.paused&&!ended.current)sky.current=skyJump(sky.current)}
  const pop=(slot:number)=>{if(runtimeRef.current.paused||ended.current)return;const before=orbit.current;const next=popOrbit(before,before.slots[slot]!,performance.now());if(next===before)return;orbit.current=next;runtimeRef.current.report(`${next.popped} planets · ${next.bonus} bonus catches`);playCue(next.popped===18?'finish':'found');if(next.popped===18){ended.current=true;runtimeRef.current.finish('Orbit powered. All 18 planets collected.')}}
  const actions=useRef({move,jump,pop});actions.current={move,jump,pop}
  useEffect(()=>{
    const key=(event:KeyboardEvent)=>{if(runtimeRef.current.paused||event.altKey||event.ctrlKey||event.metaKey)return;if(kind==='sky'){if(['ArrowLeft','a','A'].includes(event.key)){event.preventDefault();actions.current.move(-1)}else if(['ArrowRight','d','D'].includes(event.key)){event.preventDefault();actions.current.move(1)}else if(['ArrowUp','w','W',' '].includes(event.key)&&!(event.target instanceof HTMLButtonElement&&event.key===' ')){event.preventDefault();if(!event.repeat)actions.current.jump()}}else if(/^[1-6]$/.test(event.key)&&!event.repeat){event.preventDefault();actions.current.pop(Number(event.key)-1)}}
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)
  },[kind])
  useEffect(()=>{
    const host=mount.current;if(!host)return
    let renderer:THREE.WebGLRenderer|null=null,graphicsLost=false,frame=0,last=performance.now(),lastUI=last,alive=true
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(kind==='sky'?54:45,1,.1,180)
    const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>()
    const mat=(color:number,extra:THREE.MeshStandardMaterialParameters={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.08,...extra});materials.add(m);return m}
    const mesh=(geometry:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Object3D=scene)=>{geometries.add(geometry);const m=new THREE.Mesh(geometry,material);parent.add(m);return m}
    const sphere=(radius:number,color:number,parent:THREE.Object3D)=>mesh(new THREE.SphereGeometry(radius,20,14),mat(color),parent)
    const box=(w:number,h:number,d:number,color:number,parent:THREE.Object3D)=>mesh(new THREE.BoxGeometry(w,h,d),mat(color),parent)
    const robot=(scale:number)=>{const group=new THREE.Group();const body=sphere(.55,0xf5f3e5,group);body.scale.set(1,1,.9);const visor=sphere(.45,0x253751,group);visor.position.set(0,.02,.29);visor.scale.set(1,.67,.5);for(const side of[-1,1]){const eye=sphere(.07,0x82eddf,group);eye.position.set(side*.15,.08,.51);eye.scale.y=1.4;const ear=sphere(.17,0xf3ac54,group);ear.position.set(side*.57,.08,0);ear.scale.set(.55,1,1);const arm=sphere(.13,0xb3dad8,group);arm.position.set(side*.47,-.46,0);arm.scale.y=1.4}const smile=mesh(new THREE.TorusGeometry(.11,.02,6,12,Math.PI),mat(0x82eddf),group);smile.rotation.z=Math.PI;smile.position.set(0,-.12,.53);const headphone=mesh(new THREE.TorusGeometry(.61,.055,6,24,Math.PI),mat(0x3d5277),group);headphone.position.y=.04;group.scale.setScalar(scale);return group}
    scene.add(new THREE.HemisphereLight(kind==='sky'?0xe6f9ff:0xa5c9ff,kind==='sky'?0x759591:0x3d2557,2.8))
    const sun=new THREE.DirectionalLight(0xffefdc,3);sun.position.set(-8,15,10);scene.add(sun)
    let ship:THREE.Group|null=null,orbitRobot:THREE.Group|null=null
    const decor: {group:THREE.Group;baseZ:number}[]=[],gates:THREE.Mesh[]=[],skyMeshes=new Map<number,THREE.Mesh>(),planets:THREE.Group[]=[],rings:THREE.Mesh[]=[]
    const planetObjects:THREE.Object3D[]=[]
    if(kind==='sky'){
      scene.background=new THREE.Color(0xb9e0ee);scene.fog=new THREE.Fog(0xb9e0ee,42,112)
      camera.position.set(0,5.3,10.5);camera.lookAt(0,.7,-14)
      const track=box(7,.45,145,0x8bd3bd,scene);track.position.set(0,-.4,-53)
      for(const x of[-3.55,3.55]){const rail=box(.19,.32,145,0xb4a2de,scene);rail.position.set(x,-.02,-53)}
      for(const x of[-1.15,1.15]){const line=box(.055,.01,145,0xd3f3df,scene);line.position.set(x,-.165,-53)}
      for(let i=0;i<9;i++){const gate=mesh(new THREE.TorusGeometry(4.1,.27,6,24),mat(0xb3a0d8));gate.position.set(0,1.2,-i*22-20);gates.push(gate)}
      for(let i=0;i<24;i++){const group=new THREE.Group();const side=i%2===0?-1:1;const x=side*(8+(i*7%11)),z=-i*6+8;group.position.set(x,-2-(i%3),z);const island=mesh(new THREE.ConeGeometry(2.7,4.2,6),mat(0xe6b398),group);island.rotation.x=Math.PI;const top=mesh(new THREE.CylinderGeometry(2.8,2.6,.7,6),mat(0x98c883),group);top.position.y=2.2;const trunk=box(.3,1.6,.3,0x957c71,group);trunk.position.y=3.2;const crown=mesh(new THREE.IcosahedronGeometry(1.6,0),mat(i%3?0xb2d877:0x91d6b3),group);crown.position.set(0,4.5,0);scene.add(group);decor.push({group,baseZ:z})}
      for(let i=0;i<12;i++){const group=new THREE.Group();for(let n=0;n<3;n++){const puff=sphere(1.2+n*.3,0xedfaff,group);puff.scale.set(1.8,.6,1);puff.position.x=n*1.3}group.position.set((i%2?-1:1)*(12+i%6),2+i%4,-i*11);scene.add(group)}
      const deck=new THREE.Group();const base=mesh(new THREE.CapsuleGeometry(.55,1.6,5,12),mat(0x55c8b5),deck);base.rotation.x=Math.PI/2;base.scale.set(1.4,.85,.24);base.position.y=.02;const pad=box(.7,.09,1.35,0x28555d,deck);pad.position.y=.17;for(const side of[-1,1]){const engine=mesh(new THREE.CylinderGeometry(.17,.22,.8,8),mat(0x4d7381),deck);engine.rotation.x=Math.PI/2;engine.position.set(side*.5,-.06,.5);const glow=sphere(.13,0x9effdb,deck);glow.position.set(side*.5,-.04,.95)}const pilot=robot(.62);pilot.position.set(0,.65,0);deck.add(pilot);deck.position.set(0,.45,2);scene.add(deck);ship=deck
      const gemMaterial=mat(0xffdf70,{emissive:0xc38f25,emissiveIntensity:.25});const blockMaterial=mat(0xe58c77)
      const gemGeometry=new THREE.OctahedronGeometry(.38),blockGeometry=new THREE.BoxGeometry(1.25,.85,1.15)
      for(const item of sky.current.items){const m=mesh(item.kind==='gem'?gemGeometry:blockGeometry,item.kind==='gem'?gemMaterial:blockMaterial);m.position.set(item.lane*2.25,item.kind==='gem'?1:.23,2-item.distance);m.visible=false;skyMeshes.set(item.id,m)}
    }else{
      scene.background=new THREE.Color(0x202b60);scene.fog=new THREE.Fog(0x202b60,20,80);camera.position.set(0,0,12)
      const light=new THREE.PointLight(0x8ac7ff,25,25);light.position.set(3,4,4);scene.add(light)
      orbitRobot=robot(1.45);orbitRobot.position.set(0,.05,0);scene.add(orbitRobot)
      const halo=mesh(new THREE.TorusGeometry(1.8,.025,6,64),mat(0x8099d2));halo.rotation.set(.8,.2,.1);rings.push(halo)
      const halo2=mesh(new THREE.TorusGeometry(2.15,.02,6,64),mat(0xb893bb));halo2.rotation.set(-.7,-.3,.4);rings.push(halo2)
      const starGeometry=new THREE.IcosahedronGeometry(.035,0),starMaterial=mat(0xcbdcfd,{emissive:0xcbdcfd,emissiveIntensity:.6});for(let i=0;i<100;i++){const star=mesh(starGeometry,starMaterial);star.position.set(Math.sin(i*19.3)*20,Math.cos(i*13.7)*14,-8-(i%20))}
      for(let i=0;i<6;i++){const group=new THREE.Group();const planet=sphere(.58,planetColors[i]!,group);planet.userData.slot=i;planetObjects.push(planet);const band=mesh(new THREE.TorusGeometry(.79,.075,8,36),mat(planetColors[(i+2)%6]!),group);band.rotation.x=Math.PI/2.6;band.rotation.y=.2;band.userData.slot=i;planetObjects.push(band);const spot=sphere(.1,0xfff3dd,group);spot.position.set(-.16,.18,.54);group.position.fromArray(planetPositions[i]!);scene.add(group);planets.push(group)}
    }
    const resize=()=>{const width=host.clientWidth,height=host.clientHeight;camera.aspect=width/Math.max(1,height);if(kind==='orbit'){camera.position.z=Math.max(8.6,8.8/camera.aspect);camera.lookAt(0,0,0)}else if(!runtimeRef.current.quiet){camera.position.set(0,5.3,camera.aspect<1?14.5:10.5);camera.lookAt(0,.7,-14)}camera.updateProjectionMatrix();renderer?.setSize(width,height,false)}
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;canvasRef.current=renderer.domElement;renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);resize()}catch{setFallback(true)}
    const lost=(e:Event)=>{e.preventDefault();setFallback(true);graphicsLost=true}
    const canvas=canvasRef.current;canvas?.addEventListener('webglcontextlost',lost)
    const observer=new ResizeObserver(resize);observer.observe(host)
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2()
    const click=(event:MouseEvent)=>{if(kind!=='orbit'||!renderer)return;const rect=host.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(planetObjects)[0];if(hit)actions.current.pop(hit.object.userData.slot as number)}
    canvas?.addEventListener('click',click)
    let previousQuiet=runtimeRef.current.quiet
    const update=(now:number)=>{
      if(!alive)return;const dt=Math.min((now-last)/1000,.1);last=now;const{paused,quiet}=runtimeRef.current
      if(!paused&&!ended.current){
        if(kind==='sky'){
          const before=sky.current;sky.current=advanceSky(before,dt,10);const s=sky.current
          if(s.gems>before.gems)playCue('tap')
          if(ship){ship.position.x=s.lane*2.25;ship.position.y=.45+(s.air>0?Math.sin((.8-s.air)/.8*Math.PI)*1.65:quiet?0:Math.sin(s.distance*1.6)*.035);ship.rotation.z=quiet?0:Math.sin(s.distance*.2)*.015}
          if(quiet){camera.position.set(0,21,12);camera.lookAt(0,0,-6)}else if(previousQuiet!==quiet)resize()
          previousQuiet=quiet
          for(const item of s.items){const m=skyMeshes.get(item.id)!;const z=2+s.distance-item.distance;m.position.z=z;m.visible=!item.hit&&z>-85&&z<8;if(item.kind==='gem'&&!quiet)m.rotation.y=s.distance*.08}
          gates.forEach((gate,i)=>{gate.position.z=quiet?-i*22-20:10-((i*22+210-s.distance%198)%198)})
          decor.forEach(({group,baseZ})=>{group.position.z=quiet?baseZ:15-((Math.abs(baseZ)+160-s.distance%160)%160)})
        }else{
          const time=now/1000;if(orbitRobot){orbitRobot.position.y=quiet?.05:Math.sin(time*1.7)*.1;orbitRobot.rotation.y=quiet?0:Math.sin(time*.6)*.09}rings.forEach((ring,i)=>{if(!quiet)ring.rotation.z+=dt*(i?-.15:.12)})
          planets.forEach((planet,i)=>{const coords=planetPositions[i]!;planet.position.set(coords[0]!*(camera.aspect>1.4?1.4:1),coords[1]!+(quiet?0:Math.sin(time*.7+i)*.11),coords[2]!);planet.rotation.y=quiet?0:time*.18+i;const variant=orbit.current.slots[i]!;planet.scale.setScalar(.9+(variant%3)*.08); const body=planet.children[0] as THREE.Mesh<THREE.SphereGeometry,THREE.MeshStandardMaterial>;body.material.color.setHex(planetColors[variant%6]!);const band=planet.children[1] as THREE.Mesh<THREE.TorusGeometry,THREE.MeshStandardMaterial>;band.material.color.setHex(planetColors[(variant+2)%6]!)})
        }
      }
      if(renderer&&!graphicsLost){renderer.render(scene,camera);if(kind==='orbit')planets.forEach((planet,i)=>{const target=targetRefs.current[i];if(!target)return;const p=planet.position.clone().project(camera);target.style.left=`${(p.x+1)*50}%`;target.style.top=`${(1-p.y)*50}%`})}
      if(now-lastUI>80){lastUI=now;const s=sky.current,o=orbit.current;if(kind==='sky')runtimeRef.current.report(`${s.gems} gems · ${s.score} points`);setView({score:s.score,gems:s.gems,bumps:s.bumps,combo:s.combo,lane:s.lane,air:s.air,cooldown:s.cooldown,distance:s.distance,popped:o.popped,bonus:o.bonus,slots:o.slots})}
      frame=requestAnimationFrame(update)
    }
    frame=requestAnimationFrame(update)
    return()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();canvas?.removeEventListener('click',click);canvas?.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer?.dispose();canvas?.remove();canvasRef.current=null;scene.clear()}
  },[kind])

  return <div className={`three-game ${kind}-game ${fallback?'flat-mode':''}`}>
    <div className="three-hud">{kind==='sky'?<><span><Icon name="gem" weight="fill"/> <strong>{view.gems}</strong> gems</span><span className="sky-location">{view.distance<250?'Cloud gardens':view.distance<500?'Island crossing':'Home stretch'}</span><span><strong>{view.score}</strong> points{view.combo>=4?` · ×${Math.min(3,Math.floor((view.combo-1)/4)+1)}`:''}</span></>:<><span><Icon name="planet"/><strong>{view.popped}</strong> / 18 planets</span><span><Icon name="star" size={18} weight="fill"/> Bonus: planet {orbitBonusSlot(view.popped)+1}</span></>}</div>
    <div className="three-stage" ref={mount} role="group" aria-label={kind==='sky'?'Sky track. Use left and right to steer, up or Space to jump.':'Orbit field. Tap planets or press keys 1 to 6.'} tabIndex={0}>
      {kind==='orbit'&&<div className="planet-targets">{view.slots.map((id,i)=><button key={i} ref={el=>{targetRefs.current[i]=el}} className={`planet-target planet-${i} ${i===orbitBonusSlot(view.popped)?'bonus-target':''}`} onClick={()=>pop(i)} aria-label={`Pop planet ${i+1}`} data-planet-id={id} disabled={runtime.paused}><span>{i+1}</span></button>)}</div>}
      {kind==='sky'&&fallback&&<div className="flat-track" aria-hidden="true"><div className="flat-lanes"/>{sky.current.items.filter(item=>!item.hit&&item.distance-view.distance>0&&item.distance-view.distance<65).map(item=><span className={`flat-object ${item.kind}`} key={item.id} style={{left:`${(item.lane+1)*30+20}%`,top:`${85-(item.distance-view.distance)/65*85}%`}}><Icon name={item.kind==='gem'?'gem':'squares'} weight="fill" size={27}/></span>)}<span className={`flat-ship ${view.air>0?'jumping':''}`} style={{left:`${(view.lane+1)*30+20}%`}}><Icon name="game" size={42} weight="fill"/></span></div>}
      {kind==='sky'&&<div className="lane-labels" aria-hidden="true">{['Left','Center','Right'].map((label,i)=><span className={view.lane===i-1?'current':''} key={label}>{label}</span>)}</div>}
    </div>
    {fallback&&<p className="graphics-note">3D isn’t available on this device. You’re playing the same game in flat view.</p>}
    {kind==='sky'?<div className="sky-controls"><button className="steer-button" aria-label="Steer left" onClick={()=>move(-1)}><Icon name="back" size={25}/><span>Left</span></button><button className="jump-button" disabled={view.cooldown>0} onClick={jump}><Icon name="up"/>{view.air>0?'Airtime':view.cooldown>0?'Landing…':'Jump'}<span>Space / ↑</span></button><button className="steer-button" aria-label="Steer right" onClick={()=>move(1)}><span>Right</span><Icon name="right" size={25}/></button></div>:<div className="orbit-controls"><p>Tap a planet. Or use these buttons / keys 1–6.</p><div>{view.slots.map((id,i)=><button key={i} onClick={()=>pop(i)} aria-label={`Collect planet ${i+1}`} className={i===orbitBonusSlot(view.popped)?'bonus-control':''} data-planet-id={id}>{i+1}</button>)}</div></div>}
    <p className="three-note">{kind==='sky'?`${view.bumps} bumps · Bumps never end your ride.${runtime.quiet?' Scenery stays still with Less motion.':''}`:'Every planet counts. Follow the gold ring for bonus catches.'}</p>
  </div>
}
