/* ================= Player ================= */
const _fw=new V3(),_rt=new V3(),_up3=new V3(),_gf=new V3(),_gv=new V3();
function setVM(){for(const k in VMS)VMS[k].g.visible=false;if(P.weap[P.cur]&&!P.dead)VMS[P.weap[P.cur].id].g.visible=true;buildPips();}
function grenThrowParams(out,vel){camera.updateMatrixWorld();_fw.set(0,0,-1).applyQuaternion(camera.quaternion);_rt.set(1,0,0).applyQuaternion(camera.quaternion);
  out.copy(camera.position).addScaledVector(_fw,.35).addScaledVector(_rt,.18);out.y-=.12;vel.copy(_fw).multiplyScalar(15.5);vel.y+=3.4;vel.x+=player.vel.x*.6;vel.z+=player.vel.z*.6;}
const _lp=new V3();
function surfAt(x,z,maxY){let top=Hx(x,z);const cand=gather(x-.05,z-.05,x+.05,z+.05);for(const c of cand){if(x>c.minX&&x<c.maxX&&z>c.minZ&&z<c.maxZ&&c.maxY<=maxY&&c.maxY>top)top=c.maxY;}return top;}
function clearAt(x,z,y0,y1,r){const cand=gather(x-r,z-r,x+r,z+r);for(const c of cand){if(x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ&&c.minY<y1&&c.maxY>y0+.02)return false;}return y0>=Hx(x,z)-.02;}
function findLedge(e,fw){const y=e.pos.y;for(const d of [.55,.85]){const x=e.pos.x+fw.x*(e.r+d),z=e.pos.z+fw.z*(e.r+d);const top=surfAt(x,z,y+1.85);const dh=top-y;
    if(dh>.55&&dh<=1.85&&clearAt(x,z,top,top+1.75,e.r*.9)&&clearAt(e.pos.x,e.pos.z,y+.3,top+1.75,e.r*.8))return _lp.set(x,top,z).clone();}return null;}
function updatePlayer(dt,pad){const pl=player;
  let mx=0,mz=0;if(keys.KeyW||keys.ArrowUp)mz+=1;if(keys.KeyS||keys.ArrowDown)mz-=1;if(keys.KeyD||keys.ArrowRight)mx+=1;if(keys.KeyA||keys.ArrowLeft)mx-=1;
  let fire=IN.mouse.l,ads=IN.mouse.r,sprint=keys.ShiftLeft||keys.ShiftRight,crouch=keys.KeyC||keys.ControlLeft,gKey=!!keys.KeyG;
  if(isTouch){mx+=TC.joyV.x;mz-=TC.joyV.y;fire=fire||TC.fire!==null;ads=ads||TC.aim;crouch=crouch||TC.crouch;gKey=gKey||TC.gren!==false;if(Math.hypot(TC.joyV.x,TC.joyV.y)>.95&&TC.joyV.y<-.7)sprint=true;}
  if(pad){mx+=pad.lx;mz-=pad.ly;fire=fire||pad.fire;ads=ads||pad.ads;sprint=sprint||pad.sprint;crouch=crouch||pad.crouch;gKey=gKey||pad.gren;if(pad.board){$('board').hidden=false;renderBoard();}else if(!keys.Tab)$('board').hidden=true;
    if(pad.jump){IN.q.jump=1;IN.q.respawn=1;}if(pad.reload)IN.q.reload=1;if(pad.swap)IN.q.swap=1;if(pad.start){pause();return;}
    const assist=nearAimTarget()?.55:1;const sp=2.9*settings.sens*assist;IN.look.x+=Math.sign(pad.rx)*pad.rx*pad.rx*sp*dt*(P.ads>.5?.55:1);IN.look.y+=Math.sign(pad.ry)*pad.ry*pad.ry*sp*.75*dt*(P.ads>.5?.55:1);}
  const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml;}
  if(P.dead){P.deathT+=dt;IN.look.x=IN.look.y=0;
    if(P.killer&&P.killer!==pl){const k=P.killer.pos;const ty=Math.atan2(-(k.x-pl.pos.x),-(k.z-pl.pos.z));pl.yaw+=angDiff(pl.yaw,ty)*Math.min(1,dt*3);}
    camera.position.lerp(_o.set(pl.pos.x,pl.pos.y+.45,pl.pos.z),Math.min(1,dt*3));camera.rotation.set(-.12,pl.yaw,.3);
    const can=P.deathT>1.6;$('respawnHint').innerHTML=can?(isTouch?'Tap to respawn':padActive?'Press <kbd>A</kbd> to respawn':'<kbd>Space</kbd> or <kbd>Click</kbd> to respawn'):'Respawning';
    if(NET.client){if(can&&IN.q.respawn&&G.time-(P.rspT||-9)>1){P.rspT=G.time;netSend({t:'rsp'});}}else if((can&&IN.q.respawn)||G.time>=pl.respawnAt){spawn(pl);setVM();}IN.q.respawn=0;IN.q.jump=0;return;}
  IN.q.respawn=0;
  const fovRatio=camera.fov/settings.fov;
  pl.yaw-=IN.look.x*(P.ads>.5?fovRatio:1);pl.pitch=clamp(pl.pitch-IN.look.y*(P.ads>.5?fovRatio:1),-1.5,1.5);P.swayX=lerp(P.swayX,-IN.look.x*2,.2);P.swayY=lerp(P.swayY,-IN.look.y*2,.2);IN.look.x=IN.look.y=0;
  const w=P.weap[P.cur],W=WEAP[w.id];
  // grenade
  if(gKey&&!P.gHold&&P.gren>0&&P.switching<=0&&P.gThrowT<=0){P.gHold=true;P.gCook=G.time;P.reloading=0;AU.pin();}
  if(P.gHold){const cooked=G.time-P.gCook;$('cook').hidden=false;$('cook').style.setProperty('--p',(cooked/GFUSE*100).toFixed(1)+'%');
    grenThrowParams(_gf,_gv);updateArc(_gf,_gv);
    if(cooked>=GFUSE){P.gHold=false;P.gren--;$('cook').hidden=true;arcPts.visible=false;landRing.visible=false;spawnGrenade(pl,pl.pos.clone().add(_o.set(0,1,0)),new V3(),.001);}
    else if(!gKey){P.gHold=false;P.gren--;P.gThrowT=.4;$('cook').hidden=true;arcPts.visible=false;landRing.visible=false;spawnGrenade(pl,_gf.clone(),_gv.clone(),GFUSE-cooked);AU.whoosh();}}
  if(P.gThrowT>0)P.gThrowT-=dt;
  const busy=P.gHold||P.gThrowT>0;
  if(IN.q.swap&&P.switching<=0&&!busy){P.switching=.5;P.swapDone=false;P.reloading=0;AU.mech();}IN.q.swap=0;
  if(P.switching>0){P.switching-=dt;if(!P.swapDone&&P.switching<.25){P.swapDone=true;P.cur=1-P.cur;setVM();}}
  if(IN.q.reload&&P.reloading<=0&&w.mag<W.mag&&w.res>0&&P.switching<=0&&!busy)startReload(W);IN.q.reload=0;
  if(P.reloading>0){const before=P.reloading;P.reloading-=dt;
    if(!W.shell){const t0=1-before/P.reloadTotal,t1=1-P.reloading/P.reloadTotal;if(t0<.15&&t1>=.15)AU.click(.3);if(t0<.65&&t1>=.65)AU.mech();if(t0<.88&&t1>=.88)AU.click(.35);}
    if(P.reloading<=0){if(W.shell){if(w.mag<W.mag&&w.res>0){w.mag++;w.res--;AU.click(.3);if(w.mag<W.mag&&w.res>0){P.reloading=W.reload;P.reloadTotal=W.reload;}else{P.pumpT=.45;AU.mech();}}}
      else{const take=Math.min(W.mag-w.mag,w.res);w.mag+=take;w.res-=take;P.shots=0;}}}
  const wantAds=ads&&P.switching<=0&&(P.reloading<=0||W.shell)&&!busy;
  if(wantAds&&P.ads<.05&&(isTouch||padActive))aimSnap();
  P.ads=clamp(P.ads+(wantAds?dt*7:-dt*7),0,1);
  P.sprint=sprint&&mz>.4&&!fire&&P.ads<.2&&pl.onGround&&(P.reloading<=0||W.shell)&&!P.gHold;
  if(P.sprint&&crouch&&!P.crouchPrev&&pl.onGround&&P.slide<=0&&Math.hypot(pl.vel.x,pl.vel.z)>6){P.slide=.75;P.slideDir.set(pl.vel.x,0,pl.vel.z).normalize();AU.step(0,0,true,false);}
  P.crouchPrev=crouch;
  if(P.slide>0){P.slide-=dt;P.sprint=false;crouch=true;if(!pl.onGround&&P.slide<.5)P.slide=0;}
  if(P.sprint)crouch=false;
  P.crouch=clamp(P.crouch+(crouch?dt*8:-dt*8),0,1);pl.h=lerp(1.75,1.2,P.crouch);
  const wet=pl.pos.y<WATER-.15;
  const sp=(P.ads>.5?3.2:P.sprint?7.6:(P.crouch>.5?2.8:5.3))*(wet?.62:1);
  _fw.set(-Math.sin(pl.yaw),0,-Math.cos(pl.yaw));_rt.set(-_fw.z,0,_fw.x);
  const wx=_fw.x*mz+_rt.x*mx,wz=_fw.z*mz+_rt.z*mx;const acc=pl.onGround?14:3;
  if(P.slide>0){const v=lerp(2.5,10.5,clamp(P.slide/.75,0,1));pl.vel.x=P.slideDir.x*v;pl.vel.z=P.slideDir.z*v;}
  else{pl.vel.x=lerp(pl.vel.x,wx*sp,Math.min(1,acc*dt));pl.vel.z=lerp(pl.vel.z,wz*sp,Math.min(1,acc*dt));}
  if(P.mantle){const m=P.mantle;m.t+=dt/m.dur;const t=clamp(m.t,0,1);const up=smooth(0,.65,t),fw=smooth(.35,1,t);
    pl.pos.set(lerp(m.a.x,m.b.x,fw),lerp(m.a.y,m.b.y,up),lerp(m.a.z,m.b.z,fw));pl.vel.set(0,0,0);P.mantleTilt=Math.sin(t*Math.PI);
    if(t>=1){P.mantle=null;pl.onGround=pl.wasGround=true;P.landed=.12;AU.step(0,0,true,false);}IN.q.jump=0;}
  else{
  const wantJump=IN.q.jump||((keys.Space||(pad&&pad.jumpHeld))&&!pl.onGround&&mz>.3);
  if(wantJump&&P.crouch<.5&&!P.gHold){const L=findLedge(pl,_fw);if(L){P.mantle={a:pl.pos.clone(),b:L,t:0,dur:clamp(.22+(L.y-pl.pos.y)*.16,.25,.5)};P.slide=0;IN.q.jump=0;AU.step(0,0,true,false);}}
  pl.vel.y-=24*dt;if(IN.q.jump&&pl.onGround&&P.crouch<.5&&!P.mantle){pl.vel.y=7.4;pl.wasGround=false;P.slide=0;}IN.q.jump=0;}
  P.mantleTilt=P.mantle?P.mantleTilt:Math.max(0,(P.mantleTilt||0)-dt*4);
  const wasAir=!pl.onGround;if(!P.mantle)moveEntity(pl,dt);if(wasAir&&pl.onGround){P.landed=.18;AU.step(0,0,true,wet);}
  P.cool-=dt;
  if(fire&&P.cool<=0&&P.switching<=0&&!busy){
    if(w.mag>0&&(P.reloading<=0||W.shell)){P.reloading=0;P.cool=W.interval;w.mag--;fireWeapon(W);}
    else if(w.mag<=0){P.cool=.25;AU.click();if(w.res>0&&P.reloading<=0)startReload(W);}}
  P.recoil=lerp(P.recoil,0,Math.min(1,dt*10));P.kick=lerp(P.kick,0,Math.min(1,dt*14));P.shake=Math.max(0,P.shake-dt*1.6);
  const hs=Math.hypot(pl.vel.x,pl.vel.z);if(pl.onGround){P.bob+=hs*dt*1.9;const ph=Math.floor(P.bob/Math.PI);if(ph!==P.lastStepPh){P.lastStepPh=ph;if(hs>2&&P.crouch<.5)AU.step(0,0,true,wet);}}P.landed=Math.max(0,P.landed-dt);
  const eye=pl.h-.13;const breathe=P.ads>.5&&W.id==='rifle'?Math.sin(G.time*1.3)*.0012:0;const sk=P.shake*P.shake*.06;
  camera.position.set(pl.pos.x,pl.pos.y+eye+Math.sin(P.bob*2)*.025*(hs/6)*(1-P.ads)-P.landed*.3,pl.pos.z);
  P.roll=lerp(P.roll||0,P.slide>0?.07:0,Math.min(1,dt*8));camera.rotation.set(pl.pitch+P.recoil+breathe+rand(-sk,sk)-P.mantleTilt*.07,pl.yaw+Math.cos(G.time*.9)*breathe+rand(-sk,sk),rand(-sk,sk)*.5+P.roll);
  const tf=lerp(settings.fov,W.adsFov*settings.fov/75,P.ads)+(P.sprint?5:0);if(Math.abs(camera.fov-tf)>.05){camera.fov=lerp(camera.fov,tf,Math.min(1,dt*12));camera.updateProjectionMatrix();}}
function startReload(W){P.reloading=W.shell?.35:W.reload;P.reloadTotal=P.reloading;if(W.shell)AU.click(.2);}
function nearAimTarget(){camera.getWorldDirection(_d);for(const s of soldiers){if(!s.alive||s.team===0)continue;_o.set(s.pos.x,s.pos.y+s.h*.7,s.pos.z).sub(camera.position);const dist=_o.length();if(dist>70)continue;_o.divideScalar(dist);if(_o.dot(_d)>.995&&!rayWorld(camera.position,_o,dist))return s;}return null;}
function aimSnap(){camera.getWorldDirection(_d);let best=null,bd=.985;for(const s of soldiers){if(!s.alive||s.team===0)continue;_o.set(s.pos.x,s.pos.y+s.h*.72,s.pos.z).sub(camera.position);const dist=_o.length();if(dist>60)continue;_o.divideScalar(dist);const dt=_o.dot(_d);if(dt>bd&&!rayWorld(camera.position,_o,dist)){bd=dt;best=_o.clone();}}
  if(best){const ty=Math.atan2(-best.x,-best.z),tp=Math.asin(clamp(best.y,-1,1));player.yaw+=angDiff(player.yaw,ty)*.7;player.pitch+=(tp-player.pitch)*.7;}}
function fireWeapon(W){const pl=player;pl.lastFired=G.time;lastShotT=G.time;camera.updateMatrixWorld();
  _fw.set(0,0,-1).applyQuaternion(camera.quaternion);_rt.set(1,0,0).applyQuaternion(camera.quaternion);_up3.set(0,1,0).applyQuaternion(camera.quaternion);
  const moving=Math.hypot(pl.vel.x,pl.vel.z)/5.3;let spread=lerp(W.spreadHip,W.spreadAds,P.ads)*(P.crouch>.5?.8:1)+(W.pellets===1?moving*.018*(1-P.ads*.7)+(pl.onGround?0:.04):0);
  if(W.pellets===1)spread+=Math.min(P.shots*.0009,.012)*(1-P.ads*.6);
  const vm=VMS[W.id];vmRoot.updateMatrixWorld();vm.muzzle.getWorldPosition(_mz);
  const vis=new V3(_mz.x,_mz.y,_mz.z*.6).applyMatrix4(camera.matrixWorld);
  for(let i=0;i<W.pellets;i++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*spread;_d.copy(_fw).addScaledVector(_rt,Math.cos(a)*r).addScaledVector(_up3,Math.sin(a)*r).normalize();fireRay(pl,camera.position,_d,W,vis);}
  if(NET.started){const e=pk3(_end);if(NET.client)netSend({t:'sh',e,w:W.id});else netBc({t:'sh',i:pl.idx,e,w:W.id});}
  const rk=W.recoil*(P.crouch>.5?.8:1);P.recoil+=rk*(1-P.ads*.35);pl.pitch+=rk*.35*(1-P.ads*.4);pl.yaw+=rand(-1,1)*rk*.25;P.kick=1;P.shots++;
  vm.flash.visible=true;vm.flash.material.rotation=Math.random()*TAU;vm.flashT=.045;flashLight.position.copy(camera.position).addScaledVector(_fw,1);flashLight.intensity=3;vmFlashLight.intensity=4;
  AU.shot(W.id,0,true);scareBirds(pl.pos);
  if(W.shell){P.pumpT=.62;setTimeout(()=>{if(P.weap[P.cur]&&P.weap[P.cur].id==='shotgun'&&!P.dead){AU.mech();ejectShell(VMS.shotgun,true);}},260);}else ejectShell(vm,false);}
function updateVM(dt){const w=P.weap[P.cur];if(!w||P.dead){vmFlashLight.intensity=0;VMG.visible=false;return;}const vm=VMS[w.id];const W=WEAP[w.id];
  if(vm.flashT>0){vm.flashT-=dt;if(vm.flashT<=0)vm.flash.visible=false;}vmFlashLight.intensity=Math.max(0,vmFlashLight.intensity-dt*80);vmFlashLight.position.set(.1,-.05,-.6);
  const pl=player;const hs=Math.hypot(pl.vel.x,pl.vel.z);const a=P.ads;
  const p=_o.copy(vm.hip).lerp(vm.ads,a);
  p.x+=Math.sin(P.bob)*.012*(hs/5)*(1-a*.9);p.y+=-Math.abs(Math.cos(P.bob))*.012*(hs/5)*(1-a*.9);
  p.x+=clamp(P.swayX,-.6,.6)*.04*(1-a*.7);p.y-=clamp(P.swayY,-.6,.6)*.04*(1-a*.7);
  p.z+=P.kick*(W.shell?.07:.025);p.y+=P.landed*.15-(P.mantleTilt||0)*.14+Math.sin(G.time*1.6)*.002*(1-a);p.y-=P.crouch*.01*(1-a);
  let rx=P.kick*(W.shell?.12:.035),ry=(1-a)*.035,rz=P.crouch*.06*(1-a);
  if(P.sprint){p.x+=.04;p.y-=.05;rx-=.35;ry+=.6;rz+=.2;}
  if(P.reloading>0&&!W.shell){const t=1-P.reloading/P.reloadTotal;const k=Math.sin(Math.min(1,t)*Math.PI);rx-=.5*k;rz+=.55*k;p.y-=.07*k;}
  if(P.reloading>0&&W.shell){rz+=.35;rx-=.15;p.y-=.03;}
  if(P.switching>0){const k=Math.sin((1-P.switching/.5)*Math.PI);p.y-=.35*k;rx-=.6*k;}
  const gk=P.gHold?1:P.gThrowT>0?P.gThrowT/.4:0;p.y-=.3*gk;rx-=.5*gk;
  vm.g.position.lerp(p,Math.min(1,dt*20));vm.g.rotation.set(lerp(vm.g.rotation.x,rx,Math.min(1,dt*18)),lerp(vm.g.rotation.y,ry,Math.min(1,dt*14)),lerp(vm.g.rotation.z,rz,Math.min(1,dt*12)));
  if(vm.pump){P.pumpT=Math.max(0,(P.pumpT||0)-dt);const k=P.pumpT>0&&P.pumpT<.42?Math.sin((P.pumpT/.42)*Math.PI):0;vm.pump.position.z=k*.085;}
  VMG.visible=P.gHold||P.gThrowT>.2;if(P.gHold){VMG.position.set(.2,-.2+Math.sin(G.time*2)*.004,-.44);VMG.rotation.set(.3,0,-.2);}else if(P.gThrowT>0){const t=1-P.gThrowT/.4;VMG.position.set(.2-t*.1,-.2+t*.14,-.44-t*.4);VMG.rotation.set(.3-t*1.2,0,-.2);}
  vmSun.position.copy(sunDir).applyQuaternion(_q.copy(camera.quaternion).invert()).multiplyScalar(5);}
