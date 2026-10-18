/* ================= FX ================= */
const fx={tracers:[],puffs:[],holes:[],flashes:[],pickups:[],debris:[],scorch:[],fire:[]};
const tracerGeo=new THREE.BoxGeometry(.02,.02,1);tracerGeo.translate(0,0,.5);
const tracerMat=new THREE.MeshBasicMaterial({color:0xffd890,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
for(let i=0;i<50;i++){const m=new THREE.Mesh(tracerGeo,tracerMat);m.visible=false;scene.add(m);fx.tracers.push({m,t:0});}
for(let i=0;i<110;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:T.puff,transparent:true,depthWrite:false,color:0xd8c2a0}));s.visible=false;scene.add(s);fx.puffs.push({s,t:0,life:1,v:new V3(),grow:1,a:.8});}
const holeMat=new THREE.MeshBasicMaterial({map:T.hole,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
const holeGeo=new THREE.PlaneGeometry(.13,.13);
for(let i=0;i<160;i++){const m=new THREE.Mesh(holeGeo,holeMat);m.visible=false;scene.add(m);fx.holes.push(m);}let holeI=0;
const scorchMat=new THREE.MeshBasicMaterial({map:T.scorch,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6});
for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(3.4,3.4),scorchMat);m.visible=false;scene.add(m);fx.scorch.push(m);}let scorchI=0;
for(let i=0;i<16;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:T.flash,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));s.visible=false;scene.add(s);fx.flashes.push({s,t:0});}
for(let i=0;i<4;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:T.fire,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,color:0xffc890}));s.visible=false;scene.add(s);fx.fire.push({s,t:0});}
const debrisMesh=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.06,0),std({color:0x3a342c}),80);debrisMesh.count=0;debrisMesh.castShadow=true;scene.add(debrisMesh);
const ammoGeo=new THREE.BoxGeometry(.45,.25,.3);const ammoMat=std({color:0x4a5530,roughness:.75,emissive:0x0a0c04});
function spawnTracer(a,b){const f=fx.tracers.find(t=>t.t<=0);if(!f)return;f.m.position.copy(a);f.m.lookAt(b);f.m.scale.z=a.distanceTo(b);f.m.visible=true;f.t=.06;}
function spawnPuff(p,col,size,life,up,alpha=.8){const f=fx.puffs.find(t=>t.t<=0)||fx.puffs[(Math.random()*fx.puffs.length)|0];f.s.position.copy(p);f.s.material.color.set(col);f.a=alpha;f.s.material.opacity=alpha;f.s.scale.setScalar(size);f.grow=size*2.2;f.t=f.life=life;f.v.set(rand(-.3,.3),up,rand(-.3,.3));f.s.visible=true;return f;}
function spawnHole(p,n){const m=fx.holes[holeI++%fx.holes.length];m.position.set(p.x+n.nx*.01,p.y+n.ny*.01,p.z+n.nz*.01);m.lookAt(p.x+n.nx,p.y+n.ny,p.z+n.nz);m.rotateZ(Math.random()*TAU);m.visible=true;}
function spawnFlash(p){const f=fx.flashes.find(t=>t.t<=0)||fx.flashes[0];f.s.position.copy(p);f.s.scale.setScalar(rand(.5,.8));f.s.material.rotation=Math.random()*TAU;f.t=.05;f.s.visible=true;}
function dropAmmo(p){if(fx.pickups.length>16){const o=fx.pickups.shift();scene.remove(o.m);}const m=new THREE.Mesh(ammoGeo,ammoMat);m.position.set(p.x,p.y+.2,p.z);m.castShadow=true;scene.add(m);fx.pickups.push({m,t:30,y:Math.max(p.y,Hx(p.x,p.z))});}
const debris=[];const _dm=new THREE.Matrix4();
function updateFX(dt){
  for(const t of fx.tracers)if(t.t>0){t.t-=dt;if(t.t<=0)t.m.visible=false;}
  for(const f of fx.puffs)if(f.t>0){f.t-=dt;const k=1-f.t/f.life;f.s.position.addScaledVector(f.v,dt);f.s.scale.setScalar(lerp(f.s.scale.x,f.grow,dt*2));f.s.material.opacity=f.a*(1-k);if(f.t<=0)f.s.visible=false;}
  for(const f of fx.flashes)if(f.t>0){f.t-=dt;if(f.t<=0)f.s.visible=false;}
  for(const f of fx.fire)if(f.t>0){f.t-=dt;const k=1-f.t/.32;f.s.scale.setScalar(lerp(1.2,5.2,Math.sqrt(k)));f.s.material.opacity=1-k;if(f.t<=0)f.s.visible=false;}
  for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.t-=dt;d.v.y-=14*dt;d.p.addScaledVector(d.v,dt);const g=Hx(d.p.x,d.p.z);if(d.p.y<g+.04){d.p.y=g+.04;d.v.multiplyScalar(.4);d.v.y=Math.abs(d.v.y)*.3;}if(d.t<=0)debris.splice(i,1);}
  debrisMesh.count=debris.length;for(let i=0;i<debris.length;i++){const d=debris[i];_dm.makeRotationY(d.r+d.t*3).setPosition(d.p);debrisMesh.setMatrixAt(i,_dm);}debrisMesh.instanceMatrix.needsUpdate=true;
  for(let i=fx.pickups.length-1;i>=0;i--){const p=fx.pickups[i];p.t-=dt;p.m.rotation.y+=dt*1.5;p.m.position.y=p.y+.25+Math.sin(G.time*3+i)*.05;
    if(player&&player.alive&&p.m.position.distanceToSquared(player.pos)<2.6){giveAmmo();scene.remove(p.m);fx.pickups.splice(i,1);continue;}
    if(p.t<=0){scene.remove(p.m);fx.pickups.splice(i,1);}}
  flashLight.intensity=Math.max(0,flashLight.intensity-dt*60);boomLight.intensity=Math.max(0,boomLight.intensity-dt*260);
  for(const f of flags){const p=f.geometry.attributes.position,b=f.userData.base;for(let i=0;i<p.count;i++){const x=b[i*3];p.array[i*3+2]=Math.sin(x*2.2-G.time*5)*.15*x/2+Math.sin(b[i*3+1]*3+G.time*3)*.03*x;}p.needsUpdate=true;f.geometry.computeVertexNormals();}
  updateShells(dt);updateBirds(dt);}

/* ================= Grenades ================= */
const GFUSE=3.4;const gList=[];const gPool=[];
function spawnGrenade(owner,from,vel,fuse){if(NET.client){if(owner===player)netSend({t:'gr',f:pk3(from),v:pk3(vel),u:Math.round(fuse*1000)/1000});return;}const m=gPool.pop()||makeGrenadeMesh();if(!m.parent)scene.add(m);m.visible=true;m.position.copy(from);
  gList.push({pos:from.clone(),vel:vel.clone(),fuse,owner,team:owner.team,m,t0:G.time,lastClink:-9,spin:new V3(rand(-12,12),rand(-12,12),rand(-12,12))});}
function gBounce(g,nx,ny,nz){const vn=g.vel.x*nx+g.vel.y*ny+g.vel.z*nz;if(vn>=0)return;g.vel.x-=1.35*vn*nx;g.vel.y-=1.35*vn*ny;g.vel.z-=1.35*vn*nz;g.vel.multiplyScalar(ny>.5?.68:.82);g.spin.multiplyScalar(.7);
  if(-vn>2.2&&G.time-g.lastClink>.08){g.lastClink=G.time;if(player)AU.clink(g.pos.distanceTo(player.pos),AU.panFor(g.pos));}}
function updateGrenades(dt){for(let i=gList.length-1;i>=0;i--){const g=gList[i];g.fuse-=dt;
    if(g.fuse<=0){explode(g.pos,g.owner);g.m.visible=false;gPool.push(g.m);gList.splice(i,1);continue;}
    const sub=3,h=dt/sub,r=.07;for(let s=0;s<sub;s++){g.vel.y-=16*h;if(g.pos.y<WATER){g.vel.multiplyScalar(.9);g.vel.y=Math.max(g.vel.y,-1.2);}
      g.pos.addScaledVector(g.vel,h);
      const cand=gather(g.pos.x-r,g.pos.z-r,g.pos.x+r,g.pos.z+r);
      for(const c of cand){const p=g.pos;if(p.x+r<c.minX||p.x-r>c.maxX||p.y+r<c.minY||p.y-r>c.maxY||p.z+r<c.minZ||p.z-r>c.maxZ)continue;
        const px=Math.min(p.x+r-c.minX,c.maxX-(p.x-r)),py=Math.min(p.y+r-c.minY,c.maxY-(p.y-r)),pz=Math.min(p.z+r-c.minZ,c.maxZ-(p.z-r));
        if(py<=px&&py<=pz){if(p.y>(c.minY+c.maxY)/2){p.y=c.maxY+r;gBounce(g,0,1,0);}else{p.y=c.minY-r;gBounce(g,0,-1,0);}}
        else if(px<=pz){if(p.x>(c.minX+c.maxX)/2){p.x=c.maxX+r;gBounce(g,1,0,0);}else{p.x=c.minX-r;gBounce(g,-1,0,0);}}
        else{if(p.z>(c.minZ+c.maxZ)/2){p.z=c.maxZ+r;gBounce(g,0,0,1);}else{p.z=c.minZ-r;gBounce(g,0,0,-1);}}}
      const gh=Hx(g.pos.x,g.pos.z);if(g.pos.y<gh+r){g.pos.y=gh+r;const n=tNorm(g.pos.x,g.pos.z);gBounce(g,n.x,n.y,n.z);}
      g.pos.x=clamp(g.pos.x,BOUND.x0,BOUND.x1);g.pos.z=clamp(g.pos.z,BOUND.z0,BOUND.z1);}
    g.m.position.copy(g.pos);const sp=Math.min(1,g.vel.length()/3);g.m.rotation.x+=g.spin.x*dt*sp;g.m.rotation.z+=g.spin.z*dt*sp;}}
function explode(p,owner,EW,R=7.5,DMG=145,big=false){EW=EW||WEAP.frag;const c=new V3(p.x,p.y+.25,p.z);const wet=p.y<WATER+.05;if(NET.host&&NET.started)netBc({t:'bm',p:pk3(p),b:big?1:0});
  if(!NET.client){for(const g of CYLS){if(g.state===3||g.state===2)continue;const dd=Math.hypot(g.x-c.x,g.y+.3-c.y,g.z-c.z);if(dd<(big?5.5:4))igniteGas(g,owner,rand(.12,.38));}
  for(const s of soldiers){if(!s.alive)continue;if(owner&&s.team===owner.team&&s!==owner)continue;
    const tx=s.pos.x,ty=s.pos.y+s.h*.55,tz=s.pos.z;const d=Math.hypot(tx-c.x,ty-c.y,tz-c.z);if(d>R)continue;
    if(!losClear(c.x,c.y,c.z,tx,ty,tz)&&!losClear(c.x,c.y,c.z,tx,s.pos.y+s.h-.1,tz))continue;
    applyDamage(s,DMG*Math.pow(1-d/R,1.25),owner||s,EW,false,{blast:true,cx:c.x,cy:c.y,cz:c.z,mag:7});}
  for(const s of soldiers)if(s.alive&&!s.isPlayer&&s.pos.distanceTo(c)<15)s.suppressT=G.time;}
  const pd=player?player.pos.distanceTo(c):99;
  if(wet){for(let i=0;i<10;i++)spawnPuff(new V3(c.x+rand(-.8,.8),WATER+rand(0,1.5),c.z+rand(-.8,.8)),0xe8f2f4,rand(.8,1.4),rand(.8,1.4),rand(3,6),.75);}
  else{const f=fx.fire.find(t=>t.t<=0)||fx.fire[0];f.s.position.copy(c);f.s.position.y+=.5;f.s.material.rotation=rand(0,TAU);f.t=.32;f.s.visible=true;
    boomLight.position.copy(c);boomLight.position.y+=1;boomLight.intensity=60;
    if(big){for(let i=0;i<10;i++)spawnPuff(new V3(c.x+rand(-1.5,1.5),c.y+rand(.5,3),c.z+rand(-1.5,1.5)),0xff9a40,rand(1.4,2.4),rand(.35,.6),rand(1,3),.9);boomLight.intensity=110;}
    for(let i=0;i<9;i++)spawnPuff(new V3(c.x+rand(-1,1),c.y+rand(.2,1.5),c.z+rand(-1,1)),i<4?0x6a625a:0x9a8f80,rand(1.2,2.2),rand(2.4,4),rand(.4,1.2),.7);
    for(let i=0;i<14;i++)spawnPuff(new V3(c.x+rand(-2.5,2.5),c.y,c.z+rand(-2.5,2.5)),0xc8b494,rand(.6,1.1),rand(.9,1.6),rand(.1,.6),.55);
    for(let i=0;i<22&&debris.length<80;i++)debris.push({p:c.clone(),v:new V3(rand(-6,6),rand(3,9),rand(-6,6)),t:rand(1.2,2.4),r:rand(0,6)});
    const gh=Hx(c.x,c.z);if(Math.abs(p.y-gh)<.6){const m=fx.scorch[scorchI++%fx.scorch.length];const n=tNorm(c.x,c.z);m.position.set(c.x,gh+.04,c.z);m.lookAt(c.x+n.x,gh+.04+n.y,c.z+n.z);m.rotateZ(rand(0,TAU));m.visible=true;}}
  if(player){P.shake=Math.max(P.shake,clamp(1-pd/24,0,1));if(pd<9)ringT=Math.max(ringT,clamp(1.6-pd/7,0,1.6));AU.boom(pd,AU.panFor(c),wet);if(pd<6)AU.ring(clamp(1-pd/6,0,1));if(pd<10&&losClear(camera.position.x,camera.position.y,camera.position.z,c.x,c.y+.4,c.z))flashT=Math.max(flashT,clamp(1-pd/10,0,1)*.5);}
  scareBirds(c);}
let ringT=0,flashT=0;
const arcGeo=new THREE.BufferGeometry();arcGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(80*3),3));
const arcPts=new THREE.Points(arcGeo,new THREE.PointsMaterial({color:0xffe2a0,size:.07,transparent:true,opacity:.9,depthWrite:false}));arcPts.visible=false;arcPts.frustumCulled=false;scene.add(arcPts);
const landRing=new THREE.Mesh(new THREE.RingGeometry(.3,.42,28),new THREE.MeshBasicMaterial({color:0xffb44a,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide}));landRing.visible=false;scene.add(landRing);
const _ap=new V3(),_av=new V3(),_aq=new V3(),_ad=new V3();
function updateArc(from,vel){_ap.copy(from);_av.copy(vel);const pos=arcGeo.attributes.position.array;let n=0;let hit=null;
  for(let i=0;i<80;i++){pos[n*3]=_ap.x;pos[n*3+1]=_ap.y;pos[n*3+2]=_ap.z;n++;_aq.copy(_ap);_av.y-=16*.035;_ap.addScaledVector(_av,.035);
    _ad.copy(_ap).sub(_aq);const L=_ad.length();_ad.divideScalar(L);const h=rayWorld(_aq,_ad,L);if(h){hit={p:_aq.clone().addScaledVector(_ad,h.t),n:new V3(h.nx,h.ny,h.nz)};break;}}
  arcGeo.setDrawRange(0,n);arcGeo.attributes.position.needsUpdate=true;arcPts.visible=true;
  if(hit){landRing.visible=true;landRing.position.copy(hit.p).addScaledVector(hit.n,.03);landRing.lookAt(hit.p.x+hit.n.x,hit.p.y+hit.n.y,hit.p.z+hit.n.z);}else landRing.visible=false;}

/* ================= Birds ================= */
const birdGeo=(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.12,0,0,.1,-.32,.12,0, 0,0,.1,0,0,-.12,.32,.12,0],3));g.computeVertexNormals();return g;})();
const birdMesh=new THREE.InstancedMesh(birdGeo,new THREE.MeshBasicMaterial({color:0x2a2622,side:THREE.DoubleSide}),46);birdMesh.frustumCulled=false;scene.add(birdMesh);
const FLOCKS=[{x:0,y:12,z:22,r:12},{x:-28,y:7,z:44,r:16},{x:0,y:28,z:-60,r:15},{x:30,y:16,z:-30,r:18}].map(f=>Object.assign(f,{scare:-99}));
const BIRDS=[];for(let i=0;i<46;i++){const kite=i>=40;const f=kite?{x:rand(-60,60),y:55,z:rand(-40,30),r:rand(25,45),scare:-99}:FLOCKS[i%4];BIRDS.push({f,a:rand(0,TAU),sp:kite?rand(.08,.12):rand(.5,.9)*(Math.random()<.5?1:-1),dr:rand(-3,3),dy:rand(-2,2),kite,ph:rand(0,TAU)});}
function scareBirds(p){for(const f of FLOCKS)if(Math.hypot(f.x-p.x,f.z-p.z)<55)f.scare=G.time;}
const _bm=new THREE.Matrix4(),_bq=new THREE.Quaternion(),_bs=new V3(),_bp=new V3(),_be=new THREE.Euler();
function updateBirds(dt){const t=G.time;for(let i=0;i<BIRDS.length;i++){const b=BIRDS[i],f=b.f;const sc=clamp(1-(t-f.scare)/8,0,1);
    b.a+=b.sp*dt*(1+sc*1.5);const r=f.r+b.dr+sc*14;const y=f.y+b.dy+sc*18+Math.sin(t*.7+b.ph)*1.2;
    _bp.set(f.x+Math.cos(b.a)*r,y,f.z+Math.sin(b.a)*r);const head=-b.a+(b.sp>0?0:Math.PI);_be.set(0,head,b.kite?Math.sin(t*.5+b.ph)*.2:0);_bq.setFromEuler(_be);
    const flap=b.kite?.9+Math.sin(t*1.5+b.ph)*.1:Math.sin(t*(14+sc*8)+b.ph);const s=b.kite?3.2:1;_bs.set(s,flap*s*1.2,s);_bm.compose(_bp,_bq,_bs);birdMesh.setMatrixAt(i,_bm);}
  birdMesh.instanceMatrix.needsUpdate=true;}
