/* ================= Bot AI ================= */
const eyeOf=(s,v)=>v.set(s.pos.x,s.pos.y+s.h-.14,s.pos.z);
function threatPos(b){return b.visible&&b.target?b.target.pos:b.lastKnown;}
function pathTo(b,x,z,speed){b.path=astar(b.pos.x,b.pos.z,x,z,b.noise);b.pi=0;b.speed=speed;return !!b.path;}
function zoneName(x,z){for(const d of DIST)if(x>=d.x0&&x<=d.x1&&z>=d.z0&&z<=d.z1)return d.name;let best='',bd=1e9;for(const d of DIST){const dd=((d.x0+d.x1)/2-x)**2+((d.z0+d.z1)/2-z)**2;if(dd<bd){bd=dd;best=d.name;}}return best;}
function pickGoal(b){const es=b.team===0?1:-1;let tot=0;const pool=DIST.filter(d=>d.w>0||settings.spawn!=='camps').map(d=>{const cx=(d.x0+d.x1)/2,cz=(d.z0+d.z1)/2;const w=Math.max(d.w,.5)*(settings.spawn==='camps'?(cx*es>-20?1.4:.7):(inHalf(b.team,cx,cz)?.6:1.5));tot+=w;return [d,w];});
  let r=Math.random()*tot,d=pool[0][0];for(const [dd,w] of pool){r-=w;if(r<=0){d=dd;break;}}const p=randomFreeIn(d);if(!p){b.repathAt=G.time+1;return;}
  pathTo(b,p.x,p.z,4.4);b.repathAt=G.time+rand(16,28);}
function setState(b,s){b.state=s;if(s!=='cover'&&s!=='toCover'){if(b.cover){b.cover.claim=null;b.cover=null;}b.crouch=false;}}
const _eye=new V3();
function perceive(b){const eye=eyeOf(b,_eye);const fx=-Math.sin(b.yaw),fz=-Math.cos(b.yaw);let best=null,bd=1e9;const ex=eye.x,ey=eye.y,ez=eye.z;
  for(const s of soldiers){if(!s.alive||s.team===b.team)continue;const dx=s.pos.x-b.pos.x,dz=s.pos.z-b.pos.z;const d=Math.hypot(dx,dz);if(d>120)continue;
    const facing=(dx*fx+dz*fz)/d;const heard=G.time-s.lastFired<.6&&d<50;if(!(facing>.25||d<7||heard||b.target===s||G.time-b.suppressT<1))continue;
    if(!losClear(ex,ey,ez,s.pos.x,s.pos.y+s.h-.35,s.pos.z)&&!losClear(ex,ey,ez,s.pos.x,s.pos.y+s.h*.5,s.pos.z))continue;
    let score=d*(s.isPlayer?.95:1);if(s===b.target)score*=.6;if(score<bd){bd=score;best=s;}}
  if(best){const isNew=best!==b.target||!b.visible;if(isNew){b.reaction=(rand(.3,.65)+Math.hypot(best.pos.x-b.pos.x,best.pos.z-b.pos.z)*.005)/b.skill;b.aimT=0;
      let fresh=true;for(const a of soldiers)if(a!==b&&a.alive&&!a.isPlayer&&a.team===b.team){if(a.visible&&a.target===best)fresh=false;if(!a.visible&&a.pos.distanceTo(b.pos)<45){a.lastKnown=best.pos.clone();a.lastKnownT=G.time;}}
      if(fresh)callout(b,'contact',{z:zoneName(best.pos.x,best.pos.z)});}
    b.target=best;b.visible=true;b.lastKnown=best.pos.clone();b.lastKnownT=G.time;b.lastSeenT=G.time;}
  else{b.visible=false;if(b.target&&(!b.target.alive||G.time-b.lastSeenT>8))b.target=null;
    for(const s of soldiers){if(s.alive&&s.team!==b.team&&G.time-s.lastFired<.5){const d=s.pos.distanceTo(b.pos);if(d<50&&G.time-b.lastKnownT>2.5){b.lastKnown=s.pos.clone();b.lastKnownT=G.time;}}}}}
function seekCover(b,mode){const T_=threatPos(b);if(!T_)return false;const tx=T_.x,ty=T_.y+1.5,tz=T_.z;const dBT=Math.hypot(T_.x-b.pos.x,T_.z-b.pos.z);
  const cands=coverNear(b.pos.x,b.pos.z,mode==='hide'?22:mode==='advance'?20:15);let best=null,bs=1e9,checks=0,bestPk=null;
  for(const c of cands){if(checks>26)break;if(c.claim&&c.claim!==b&&c.claim.alive&&c.claim.cover===c)continue;if(Math.abs(c.y-b.pos.y)>5)continue;
    const dx=T_.x-c.x,dz=T_.z-c.z,dt=Math.hypot(dx,dz);if(dt<6)continue;if(mode==='hide'&&dt<dBT-1.5)continue;if(mode==='advance'&&(dt>dBT-4||c.d2<9))continue;
    if((c.nx*dx+c.nz*dz)/dt>-.3)continue;checks++;
    if(losClear(tx,ty,tz,c.x,c.y+(c.low?1.0:1.5),c.z))continue;
    let peek=true,pk=null;if(c.low)peek=losClear(c.x,c.y+1.62,c.z,tx,ty,tz);else{const ux=-c.nz,uz=c.nx;for(const s of [1,-1]){for(const off of [1.1,1.6]){const px=c.x+ux*s*off,pz=c.z+uz*s*off;if(freeAt(px,pz)&&losClear(px,c.y+1.55,pz,tx,ty,tz)){pk={x:px,z:pz};break;}}if(pk)break;}peek=!!pk;}
    const score=(mode==='advance'?dt:Math.sqrt(c.d2))+(mode!=='hide'&&!peek?9:0)+(mode==='hide'&&c.low?5:0)+(dt<10?4:0)+Math.random()*2;
    if(score<bs){bs=score;best=c;bestPk=pk;}}
  if(!best||!pathTo(b,best.x,best.z,5.6))return false;
  if(b.cover&&b.cover!==best)b.cover.claim=null;b.cover=best;best.claim=b;b.peek=bestPk;b.coverMode=mode==='hide'?'hide':'fight';b.state='toCover';b.crouch=false;b.coverSince=G.time;b.coverDur=rand(6,11);
  if(mode==='advance')callout(b,'moving');return true;}
function compromised(b){const c=b.cover,T_=threatPos(b);if(!T_)return false;const dx=T_.x-c.x,dz=T_.z-c.z,dt=Math.hypot(dx,dz);if(dt<3)return true;if((c.nx*dx+c.nz*dz)/dt>-.1)return true;return losClear(T_.x,T_.y+1.5,T_.z,c.x,c.y+(c.low?.95:1.45),c.z);}
function engageDecision(b){const t=b.target;const d=Math.hypot(t.pos.x-b.pos.x,t.pos.z-b.pos.z);
  if(b.hp<45&&seekCover(b,'hide'))return;
  if(b.wid==='shotgun'&&d>9&&Math.random()<.75){setState(b,'rush');pathTo(b,t.pos.x,t.pos.z,5.4);b.repathAt=G.time+1;return;}
  if(Math.random()<.68&&seekCover(b,'fight'))return;
  setState(b,'engage');b.decideT=G.time+rand(1.2,2.5);}
function threatGrenade(b){let best=null,bd=7.5;for(const g of gList){if(g.team===b.team||G.time-g.t0<.3)continue;const d=Math.hypot(g.pos.x-b.pos.x,g.pos.z-b.pos.z);if(d<bd&&Math.abs(g.pos.y-b.pos.y)<4){bd=d;best=g;}}
  for(const g of CYLS){if(g.state!==1&&g.state!==2)continue;const d=Math.hypot(g.x-b.pos.x,g.z-b.pos.z);if(d<bd&&Math.abs(g.y-b.pos.y)<4){bd=d;g.fuse=g.t;best=g;}}return best;}
function solveThrow(from,to){const g=16;const dx=to.x-from.x,dz=to.z-from.z,dy=to.y-from.y;const d=Math.hypot(dx,dz);
  for(const th of [.55,.8,1.05]){const c=Math.cos(th),s=Math.sin(th);const den=2*c*c*(d*Math.tan(th)-dy);if(den<=0)continue;const v=Math.sqrt(g*d*d/den);if(!(v<24))continue;
    const vel=new V3(dx/d*v*c,v*s,dz/d*v*c);const T_=d/(v*c);let ok=true;const a=from.clone(),bb=new V3();for(let k=1;k<=6&&ok;k++){const t=T_*.85*k/6;bb.set(from.x+vel.x*t,from.y+vel.y*t-8*t*t,from.z+vel.z*t);_d.copy(bb).sub(a);const L=_d.length();_d.divideScalar(L);if(rayWorld(a,_d,L))ok=false;a.copy(bb);}
    if(ok)return vel;}
  return null;}
function think(b){perceive(b);const now=G.time;const W=WEAP[b.wid];
  const tg=threatGrenade(b);if(tg&&b.state!=='evade'){if(!tg.gas)callout(b,'grenade');const dx=b.pos.x-tg.pos.x,dz=b.pos.z-tg.pos.z,d=Math.hypot(dx,dz)||1;let ok=false;
    for(const k of [0,.7,-.7,1.4,-1.4]){const a=Math.atan2(dz,dx)+k;const x=b.pos.x+Math.cos(a)*9,z=b.pos.z+Math.sin(a)*9;if(freeAt(x,z)&&pathTo(b,x,z,6.4)){ok=true;break;}}
    if(ok){setState(b,'evade');b.evadeUntil=now+tg.fuse+.4;b.crouch=false;return;}}
  if(b.reloadT<=0&&b.mag<W.mag*.35&&!b.visible){b.reloadT=b.reloadTotal=W.shell?2.6:W.reload+.4;if(b.state==='cover'||Math.random()<.3)callout(b,'reload');}
  if(b.gren>0&&now>b.grenCool&&b.throwT<=0&&b.lastKnown&&now-b.lastKnownT<4&&b.state!=='rush'&&b.state!=='evade'){const d=Math.hypot(b.lastKnown.x-b.pos.x,b.lastKnown.z-b.pos.z);
    if(d>9&&d<32&&(!b.visible||(b.state==='cover'&&now-b.coverSince>4))&&Math.random()<.25){b.throwT=.9;b.thrown=false;b.throwTarget=b.lastKnown.clone();b.throwTarget.x+=rand(-1.5,1.5);b.throwTarget.z+=rand(-1.5,1.5);b.grenCool=now+rand(14,24);callout(b,'frag');}}
  switch(b.state){
    case 'evade':if(now>b.evadeUntil){setState(b,b.lastKnown?'search':'patrol');}break;
    case 'patrol':if(b.visible){engageDecision(b);break;}if(b.lastKnown&&now-b.lastKnownT<8){setState(b,'search');pathTo(b,b.lastKnown.x,b.lastKnown.z,4.0);break;}if(!b.path||b.pi>=b.path.length||now>b.repathAt)pickGoal(b);break;
    case 'search':if(b.visible){engageDecision(b);break;}if(!b.path||b.pi>=b.path.length){if(b.lastKnown&&now-b.lastKnownT<10&&Math.hypot(b.lastKnown.x-b.pos.x,b.lastKnown.z-b.pos.z)>3)pathTo(b,b.lastKnown.x,b.lastKnown.z,4.0);else{b.lastKnown=null;setState(b,'patrol');}}break;
    case 'engage':if(!b.visible){if(now-b.lastSeenT>1.5){setState(b,'search');if(b.lastKnown)pathTo(b,b.lastKnown.x,b.lastKnown.z,3.8);}break;}
      if(now>b.decideT){b.decideT=now+rand(1.5,3);if(b.hp<45||now-b.suppressT<.8||Math.random()<.4)seekCover(b,b.hp<45?'hide':'fight');}break;
    case 'rush':if(b.visible&&b.target&&Math.hypot(b.target.pos.x-b.pos.x,b.target.pos.z-b.pos.z)<7){setState(b,'engage');b.decideT=now+3;break;}
      if(!b.visible&&now-b.lastSeenT>3){setState(b,'search');break;}if(now>b.repathAt&&b.lastKnown){pathTo(b,b.lastKnown.x,b.lastKnown.z,5.4);b.repathAt=now+1.2;}break;
    case 'toCover':if(!b.cover){setState(b,'engage');break;}if(!b.path||b.pi>=b.path.length){b.state='cover';b.phaseHide=true;b.phaseT=now+rand(.5,1.2);b.coverSince=now;}break;
    case 'cover':{const c=b.cover;if(!c){setState(b,'engage');break;}const T_=threatPos(b);if(!T_||now-b.lastKnownT>7){setState(b,'search');break;}
      if(compromised(b)){c.claim=null;b.cover=null;if(!seekCover(b,b.hp<45?'hide':'fight'))setState(b,'engage');break;}
      const mustHide=b.hp<45||b.reloadT>0||b.throwT>0;if(b.coverMode==='hide'&&b.hp>85)b.coverMode='fight';
      if(mustHide||b.coverMode==='hide')b.phaseHide=true;else if(now>b.phaseT){b.phaseHide=!b.phaseHide;b.phaseT=now+(b.phaseHide?rand(.8,1.8):rand(1.4,2.8));if(!b.phaseHide&&!c.low&&!b.peek)b.phaseHide=true;}
      b.crouch=c.low&&b.phaseHide;
      if(b.hp>70&&b.reloadT<=0&&now-b.coverSince>b.coverDur&&(!b.visible||now-b.coverSince>b.coverDur*1.6)){b.coverSince=now;if(Math.random()<.6&&seekCover(b,'advance'))break;if(!b.visible){setState(b,'search');if(b.lastKnown)pathTo(b,b.lastKnown.x+rand(-6,6),b.lastKnown.z+rand(-6,6),4.2);}}
      break;}}}
function botShoot(b){const t=b.target;const W=WEAP[b.wid];const eye=eyeOf(b,new V3());const dist=eye.distanceTo(t.pos);
  const aimY=Math.random()<.12*b.skill?t.h-.16:t.h*.68;const tgt=new V3(t.pos.x,t.pos.y+aimY,t.pos.z);
  if(G.time>(b.gasCool||0)){b.gasCool=G.time+rand(2.5,5);const gc=gasNear(t.pos,3.2);if(gc&&Math.random()<.6&&gc.tp.distanceTo(b.pos)>7&&losClear(eye.x,eye.y,eye.z,gc.x,gc.y+.35,gc.z)){tgt.set(gc.x,gc.y+.35,gc.z);b.aimT=Math.max(b.aimT,2.5);}}
  const tSpeed=Math.hypot(t.vel.x,t.vel.z);const moving=Math.hypot(b.vel.x,b.vel.z)>1.2;
  let err=(.012+dist*.0009+tSpeed*.0045)/b.skill*(moving?1.7:1)*(b.aimT<.5?1.5:b.aimT>2?.85:1)*(t.isPlayer?1.15:1);if(t.isPlayer&&P.crouch>.5)err*=1.1;
  b.model.root.updateMatrixWorld(true);b.model.muzzle.getWorldPosition(_mz);spawnFlash(_mz);b.lastFired=G.time;lastShotT=G.time;b.kick=1;
  for(let i=0;i<W.pellets;i++){_d.copy(tgt).sub(eye).normalize();_d.x+=rand(-1,1)*(err+W.spreadHip*.6);_d.y+=rand(-1,1)*(err*.7+W.spreadHip*.4);_d.z+=rand(-1,1)*(err+W.spreadHip*.6);_d.normalize();fireRay(b,eye,_d,W,_mz);}
  AU.shot(b.wid,b.pos.distanceTo(player.pos),false,AU.panFor(b.pos));b.mag--;if(b.mag<=0){b.reloadT=b.reloadTotal=W.shell?2.6:W.reload+.4;callout(b,'reload');}}
function updateBot(b,dt){const m=b.model;
  if(!b.alive){if(b.rag)ragPose(b,dt);m.marker.visible=false;if(m.label)m.label.visible=false;if(G.time-b.deadAt>5)m.root.visible=false;if(G.time>=b.respawnAt)spawn(b);return;}
  b.thinkT-=dt;if(b.thinkT<=0){b.thinkT=rand(.16,.26);think(b);}
  const W=WEAP[b.wid];let mvx=0,mvz=0,speed=b.speed||4.4;let desiredYaw=b.yaw;const now=G.time;
  if(b.reloadT>0){b.reloadT-=dt;if(b.reloadT<=0)b.mag=W.mag;}
  if(b.throwT>0){b.throwT-=dt;if(!b.thrown&&b.throwT<.5){b.thrown=true;b.gren--;m.root.updateMatrixWorld(true);const from=m.arms[1].el.localToWorld(new V3(0,-.31,0));const to=b.throwTarget;to.y=navH(to.x,to.z);
      const vel=solveThrow(from,to)||new V3(to.x-from.x,0,to.z-from.z).normalize().multiplyScalar(11).setY(6);spawnGrenade(b,from,vel,rand(2.0,2.6));}}
  if(b.state==='cover'&&b.cover){const c=b.cover;const tg=(!b.phaseHide&&!c.low&&b.peek)?b.peek:c;const dx=tg.x-b.pos.x,dz=tg.z-b.pos.z,d=Math.hypot(dx,dz);if(d>.2){mvx=dx/d;mvz=dz/d;speed=d>1?3.4:2.2;}}
  else if(b.state==='engage'&&b.visible&&b.target){const t=b.target;const dx=t.pos.x-b.pos.x,dz=t.pos.z-b.pos.z,d=Math.max(.01,Math.hypot(dx,dz));
    b.strafeT-=dt;if(b.strafeT<=0){b.strafeT=rand(.6,1.8);b.strafe=Math.random()<.5?-1:1;if(Math.random()<.25)b.strafe=0;b.crouch=Math.random()<.25&&b.wid!=='shotgun';}
    mvx=-dz/d*b.strafe;mvz=dx/d*b.strafe;speed=3.2;const want=b.wid==='shotgun'?5:30;if(d>want){mvx+=dx/d*.9;mvz+=dz/d*.9;}else if(d<4&&b.wid!=='shotgun'){mvx-=dx/d*.6;mvz-=dz/d*.6;}}
  else if(b.path&&b.pi<b.path.length){const n=b.path[b.pi];const dx=n.x-b.pos.x,dz=n.z-b.pos.z;const d=Math.hypot(dx,dz);if(d<.7)b.pi++;else{mvx=dx/d;mvz=dz/d;}}
  if(b.state!=='cover'&&b.state!=='engage')b.crouch=false;
  const T_=threatPos(b);
  if(b.throwT>0&&b.throwTarget)desiredYaw=Math.atan2(-(b.throwTarget.x-b.pos.x),-(b.throwTarget.z-b.pos.z));
  else if(b.visible&&b.target)desiredYaw=Math.atan2(-(b.target.pos.x-b.pos.x),-(b.target.pos.z-b.pos.z));
  else if(b.state==='cover'&&T_)desiredYaw=Math.atan2(-(T_.x-b.pos.x),-(T_.z-b.pos.z));
  else if(mvx||mvz)desiredYaw=Math.atan2(-mvx,-mvz);
  b.yaw+=clamp(angDiff(b.yaw,desiredYaw),-7*b.skill*dt,7*b.skill*dt);
  if(b.visible&&b.target&&b.target.alive&&b.throwT<=0&&b.state!=='evade'){b.aimT+=dt;b.reaction-=dt;b.cool-=dt;if(b.burstPause>0)b.burstPause-=dt;
    const aimErr=Math.abs(angDiff(b.yaw,desiredYaw));const canFire=b.reaction<=0&&aimErr<.2&&b.cool<=0&&b.reloadT<=0&&!(b.state==='cover'&&b.phaseHide&&b.crouchAmt>.5);
    const dist=Math.hypot(b.target.pos.x-b.pos.x,b.target.pos.z-b.pos.z);const inRange=b.wid==='shotgun'?dist<26:dist<130;
    if(canFire&&inRange){if(b.burst<=0&&b.burstPause<=0)b.burst=W.pellets>1?1:((rand(3,7))|0);if(b.burst>0){botShoot(b);b.burst--;b.cool=W.interval*(W.pellets>1?1.3:1.2);if(b.burst<=0)b.burstPause=rand(.25,.6);}}}
  else b.aimT=0;
  for(const o of soldiers){if(o===b||!o.alive)continue;const dx=b.pos.x-o.pos.x,dz=b.pos.z-o.pos.z;const d2=dx*dx+dz*dz;if(d2<.8&&d2>1e-4){const d=Math.sqrt(d2);mvx+=dx/d*.8;mvz+=dz/d*.8;}}
  const ml=Math.hypot(mvx,mvz);if(ml>1){mvx/=ml;mvz/=ml;}
  b.crouchAmt=clamp(b.crouchAmt+(b.crouch?dt*6:-dt*6),0,1);if(b.crouch)speed=Math.min(speed,2);b.h=lerp(b.H0,1.25,b.crouchAmt);if(b.pos.y<WATER-.15)speed*=.62;
  b.vel.x=lerp(b.vel.x,mvx*speed,Math.min(1,dt*9));b.vel.z=lerp(b.vel.z,mvz*speed,Math.min(1,dt*9));b.vel.y-=24*dt;moveEntity(b,dt);
  if(mvx||mvz){b.stuckT+=dt;if(b.stuckT>1.5){if(b.pos.distanceTo(b.lastPos)<.5){if(b.onGround){b.vel.y=6;b.wasGround=false;}b.path=null;b.repathAt=0;if(b.state==='toCover'||b.state==='rush'||b.state==='evade')setState(b,'engage');}b.stuckT=0;b.lastPos.copy(b.pos);}}
  b.flinch=Math.max(0,b.flinch-dt);animateSoldier(b,dt);
  if(b.team===0){m.marker.visible=true;m.label.visible=!!player&&b.pos.distanceTo(player.pos)<60;}
  else{const show=now-b.spotT<.35||now-b.lastFired<1.2;m.marker.visible=show&&!!player&&player.alive;}
  m.marker.position.y=b.h+.32;if(m.label)m.label.position.y=b.h+.32;}
let spotTimer=0;const _se=new V3();
function updateSpotting(dt){spotTimer-=dt;if(spotTimer>0)return;spotTimer=.12;if(!player.alive)return;const e=eyeOf(player,_se);
  camera.getWorldDirection(_d);for(const b of soldiers){if(b.isPlayer||b.team===0||!b.alive)continue;const dx=b.pos.x-e.x,dz=b.pos.z-e.z,dy=b.pos.y+b.h-.3-e.y;const d=Math.hypot(dx,dy,dz);if(d>130)continue;
    if((dx*_d.x+dy*_d.y+dz*_d.z)/d<.45)continue;if(losClear(e.x,e.y,e.z,b.pos.x,b.pos.y+b.h-.25,b.pos.z)||losClear(e.x,e.y,e.z,b.pos.x,b.pos.y+b.h*.5,b.pos.z))b.spotT=G.time;}}
