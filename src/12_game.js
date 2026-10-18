/* ================= Weapons, state, soldiers ================= */
const WEAP={
  rifle:{id:'rifle',name:'VK-30',interval:.092,mag:30,reserve:150,dmg:24,head:58,pellets:1,range:230,spreadHip:.022,spreadAds:.0022,recoil:.011,reload:2.0,adsFov:48,falloff:0},
  shotgun:{id:'shotgun',name:'M12 BREACHER',interval:.82,mag:7,reserve:35,dmg:15,head:24,pellets:9,range:50,spreadHip:.065,spreadAds:.048,recoil:.055,reload:.5,shell:true,adsFov:62,falloff:1},
  frag:{id:'frag',name:'FRAG'}};
const G={state:'menu',time:0,clock:720,score:[0,0],limit:50,started:false,menuT:0};
const P={weap:[],cur:0,cool:0,reloading:0,switching:0,ads:0,recoil:0,kick:0,bob:0,swayX:0,swayY:0,crouch:0,dead:false,killer:null,deathT:0,shots:0,sprint:false,landed:0,lastStepPh:0,gren:2,gHold:false,gCook:0,gThrowT:0,shake:0,slide:0,slideDir:new V3(),crouchPrev:false,mantle:null,mantleTilt:0};
let soldiers=[];let player=null;
const NAMES=[['Rao','Mercer','Okafor','Lindqvist','Brandt','Sato','Ibarra'],['Kessler','Duran','Petrov','Vance','Hale','Ortega','Novak','Reyes']];
class Soldier{constructor(team,name,isPlayer,wid,skill){this.team=team;this.name=name;this.isPlayer=isPlayer;this.wid=wid;this.skill=skill||1;
  this.pos=new V3();this.vel=new V3();this.yaw=0;this.pitch=0;this.hp=100;this.alive=false;this.r=.36;this.h=isPlayer?1.75:1.85;this.H0=this.h;this.onGround=true;this.wasGround=true;
  this.kills=0;this.deaths=0;this.heads=0;this.lastFired=-99;this.lastHurt=-99;this.protect=0;this.respawnAt=0;this.deadAt=0;this.spotT=-99;
  if(!isPlayer){this.model=buildSoldierModel(team,wid,name);this.mag=WEAP[wid].mag;this.phase=0;this.path=null;this.pi=0;this.target=null;this.visible=false;this.thinkT=Math.random()*.2;
    this.state='patrol';this.reaction=0;this.burst=0;this.burstPause=0;this.cool=0;this.strafe=1;this.strafeT=0;this.repathAt=0;this.stuckT=0;this.lastPos=new V3();this.lastKnown=null;this.lastKnownT=-99;this.lastSeenT=-99;
    this.reloadT=0;this.reloadTotal=1;this.cover=null;this.peek=null;this.phaseHide=true;this.phaseT=0;this.crouch=false;this.crouchAmt=0;this.suppressT=-99;this.aimT=0;this.decideT=0;this.coverSince=0;this.coverDur=8;
    this.noise=Math.random()*100;this.flinch=0;this.speed=4.4;this.gren=1;this.grenCool=0;this.throwT=0;this.thrown=false;this.rag=null;this.vIdx=(Math.random()*8)|0;this.vPitch=rand(.75,1.1);this.vRate=rand(1.05,1.25);}}}
function makeSoldiers(){for(const s of soldiers)if(s.model)scene.remove(s.model.root);soldiers=[];const n=settings.squad;
  player=new Soldier(0,'You',true);soldiers.push(player);
  for(let i=0;i<n-1;i++)soldiers.push(new Soldier(0,NAMES[0][i],false,i%3===1?'shotgun':'rifle',rand(.8,1.05)));
  for(let i=0;i<n;i++)soldiers.push(new Soldier(1,NAMES[1][i],false,i%3===1?'shotgun':'rifle',rand(.8,1.05)));
  G.limit=n>=8?80:50;$('limit').textContent='FIRST TO '+G.limit;}
const SPLIT={axis:'x',side:[-1,1]};
function newSplit(){SPLIT.axis=Math.random()<.5?'x':'z';const r=Math.random()<.5?1:-1;SPLIT.side=[r,-r];}
function inHalf(team,x,z){const sd=SPLIT.side[team];return SPLIT.axis==='x'?x*sd>6:(z+6)*sd>8;}
function campPoint(team){const sx=team===0?-1:1;let best=null,bestD=-1;
  for(let k=0;k<18;k++){const x=sx*rand(77,92),z=rand(-17,17);if(!freeAt(x,z))continue;let md=999,near=0;for(const s of soldiers){if(!s.alive)continue;const d=Math.hypot(s.pos.x-x,s.pos.z-z);if(s.team!==team)md=Math.min(md,d);if(d<1.5)near++;}
    if(near)continue;if(md>bestD){bestD=md;best={x,z};}}
  return best||{x:sx*86,z:rand(-3,3)};}
function spawnPoint(team){if(settings.spawn==='camps')return campPoint(team);let best=null,bs=-1e9;
  for(let k=0;k<70&&!(best&&k>40);k++){const x=rand(BOUND.x0+2,BOUND.x1-2),z=rand(BOUND.z0+2,BOUND.z1-2);if(!inHalf(team,x,z)||!freeAt(x,z))continue;const y=navH(x,z);if(y<WATER+.1)continue;
    let md=200,mate=999,seen=false;for(const s of soldiers){if(!s.alive||s.isPlayer&&s.team===team)continue;const d=Math.hypot(s.pos.x-x,s.pos.z-z);if(d<1.6){md=-1;break;}
      if(s.team!==team){md=Math.min(md,d);if(d<90&&!seen&&losClear(s.pos.x,s.pos.y+1.6,s.pos.z,x,y+1.4,z))seen=true;}else mate=Math.min(mate,d);}
    if(md<0)continue;let sc=Math.min(md,70)-(seen?120:0)+(mate<30?12:0)+rand(0,18);if(md<28)sc-=60;if(sc>bs){bs=sc;best={x,z};}}
  return best||campPoint(team);}
function spawn(s){const p=spawnPoint(s.team);s.pos.set(p.x,Math.max(Hx(p.x,p.z),navH(p.x,p.z)),p.z);s.vel.set(0,0,0);s.hp=100;s.alive=true;s.protect=G.time+2;s.wasGround=true;
  {let ex=0,ez=0,n=0;for(const o of soldiers)if(o.alive&&o.team!==s.team){ex+=o.pos.x;ez+=o.pos.z;n++;}if(!n){ex=-s.pos.x;ez=0;}else{ex/=n;ez/=n;}s.yaw=Math.atan2(-(ex-s.pos.x),-(ez-s.pos.z));}s.pitch=0;s.onGround=true;s.h=s.H0;
  if(s.model){const m=s.model;if(s.rag){endRagdoll(m);s.rag=null;}m.root.visible=true;m.root.rotation.set(0,s.yaw,0);m.root.position.copy(s.pos);
    Object.assign(s,{path:null,target:null,visible:false,mag:WEAP[s.wid].mag,reloadT:0,lastKnown:null,repathAt:0,state:'patrol',cover:null,peek:null,crouch:false,crouchAmt:0,gren:1,grenCool:G.time+rand(5,12),throwT:0});}
  else{P.weap=[{id:'rifle',mag:WEAP.rifle.mag,res:WEAP.rifle.reserve},{id:'shotgun',mag:WEAP.shotgun.mag,res:WEAP.shotgun.reserve}];P.reloading=0;P.switching=0;P.dead=false;P.ads=0;P.crouch=0;P.gren=2;P.gHold=false;P.gThrowT=0;P.mantle=null;P.slide=0;
    P.recoil=0;$('death').hidden=true;$('deathTint').hidden=true;buildPips();}}
function resetMatch(){newSplit();resetGas();G.score=[0,0];G.clock=720;G.started=true;for(const c of COV.list)c.claim=null;for(const g of gList){g.m.visible=false;gPool.push(g.m);}gList.length=0;if(soldiers.length!==settings.squad*2)makeSoldiers();else for(const s of soldiers){s.kills=s.deaths=s.heads=s.frags=0;s.alive=false;if(s.rag){endRagdoll(s.model);s.rag=null;}}for(const s of soldiers)spawn(s);P.cur=0;setVM();
  $('feed').innerHTML='';$('radio').innerHTML='';for(const p of fx.pickups)scene.remove(p.m);fx.pickups.length=0;}

/* ================= Movement ================= */
function resolveAxis(e,ax,vel){const r=e.r;const cand=gather(e.pos.x-r-.5,e.pos.z-r-.5,e.pos.x+r+.5,e.pos.z+r+.5);
  for(let i=0;i<cand.length;i++){const c=cand[i];if(!(e.pos.x+r>c.minX&&e.pos.x-r<c.maxX&&e.pos.z+r>c.minZ&&e.pos.z-r<c.maxZ))continue;if(!(c.maxY>e.pos.y+.02&&c.minY<e.pos.y+e.h))continue;
    const step=c.maxY-e.pos.y;if(step<=.46&&e.onGround){e.pos.y=c.maxY;continue;}
    if(ax===0){if(vel>0)e.pos.x=c.minX-r-.001;else if(vel<0)e.pos.x=c.maxX+r+.001;else e.pos.x=(e.pos.x<(c.minX+c.maxX)/2)?c.minX-r-.001:c.maxX+r+.001;}
    else{if(vel>0)e.pos.z=c.minZ-r-.001;else if(vel<0)e.pos.z=c.maxZ+r+.001;else e.pos.z=(e.pos.z<(c.minZ+c.maxZ)/2)?c.minZ-r-.001:c.maxZ+r+.001;}}}
function moveEntity(e,dt){e.pos.x+=e.vel.x*dt;resolveAxis(e,0,e.vel.x);e.pos.z+=e.vel.z*dt;resolveAxis(e,2,e.vel.z);
  e.pos.x=clamp(e.pos.x,BOUND.x0,BOUND.x1);e.pos.z=clamp(e.pos.z,BOUND.z0,BOUND.z1);
  const prevY=e.pos.y;e.pos.y+=e.vel.y*dt;e.onGround=false;let sup=Hx(e.pos.x,e.pos.z);
  const r=e.r-.04;const cand=gather(e.pos.x-r,e.pos.z-r,e.pos.x+r,e.pos.z+r);
  for(let i=0;i<cand.length;i++){const c=cand[i];if(!(e.pos.x+r>c.minX&&e.pos.x-r<c.maxX&&e.pos.z+r>c.minZ&&e.pos.z-r<c.maxZ))continue;
    if(c.maxY<=prevY+.07&&c.maxY>sup)sup=c.maxY;else if(e.vel.y>0&&c.minY<e.pos.y+e.h&&c.minY>prevY+.3){e.pos.y=c.minY-e.h;e.vel.y=0;}}
  const reach=(e.wasGround&&e.vel.y<=0)?.45:.04;
  if(e.pos.y<=sup||(e.vel.y<=0&&e.pos.y-sup<reach)){e.pos.y=sup;if(e.vel.y<0)e.vel.y=0;e.onGround=true;}
  e.wasGround=e.onGround;}

/* ================= Combat ================= */
const _o=new V3(),_d=new V3(),_end=new V3(),_mz=new V3(),_c=new V3();
function fireRay(shooter,origin,dir,W,visStart){const wh=rayWorld(origin,dir,W.range);let tw=wh?wh.t:W.range;let victim=null,vh=null;
  for(const s of soldiers){if(!s.alive||s.team===shooter.team)continue;const h=raySoldier(origin,dir,s,tw);if(h&&(!vh||h.t<vh.t)){vh=h;victim=s;}
    if(!s.isPlayer){_c.set(s.pos.x-origin.x,s.pos.y+1.2-origin.y,s.pos.z-origin.z);const tp=clamp(_c.dot(dir),0,tw);_c.addScaledVector(dir,-tp);if(_c.lengthSq()<3.2){s.suppressT=G.time;if(!s.visible){s.lastKnown=shooter.pos.clone();s.lastKnownT=G.time;}}}}
  if(victim){tw=vh.t;_end.copy(origin).addScaledVector(dir,tw);let dmg=vh.head?W.head:W.dmg;if(W.falloff)dmg*=clamp(1-(tw-7)/26,.3,1);
    if(!shooter.isPlayer&&victim.isPlayer)dmg*=.7;applyDamage(victim,dmg,shooter,W,vh.head,{dx:dir.x,dy:dir.y,dz:dir.z,mag:W.pellets>1?3.5:2.6,head:vh.head});spawnPuff(_end,0x7a1a10,.25,.35,.2);}
  else{_end.copy(origin).addScaledVector(dir,tw);if(wh&&wh.c&&wh.c.gas){hitGas(wh.c.gas,shooter,_end.clone());}else if(wh){const wet=_end.y<WATER+.05;spawnPuff(_end,wet?0xe8f2f4:wh.ny>.5?0xb8a080:0xd8cbb0,.22,.6,wet?1.5:.6);if(!wet&&(wh.ny<.5||_end.y>.05))spawnHole(_end,wh);}}
  if(visStart&&Math.random()<(W.pellets>1?.35:.7))spawnTracer(visStart,_end);}
function applyDamage(v,dmg,att,W,head,imp){if(!v.alive||G.time<v.protect)return;v.hp-=dmg;v.lastHurt=G.time;
  if(v.isPlayer){addArc(att.pos);AU.hurt();}else{v.flinch=.15;v.suppressT=G.time;if(att!==v&&(!v.visible||!v.target)){v.lastKnown=att.pos.clone();v.lastKnownT=G.time;v.target=att;}if(v.hp<45&&v.hp+dmg>=45)callout(v,'hurt');}
  if(att.isPlayer&&att!==v){hitMarker(v.hp<=0);AU.blip(v.hp<=0?520:1500,.06,.12);if(head)AU.blip(2200,.04,.08);}
  if(v.hp<=0)kill(v,att,W,head,imp);}
function kill(v,att,W,head,imp){v.alive=false;v.hp=0;v.deaths++;v.deadAt=G.time;v.respawnAt=G.time+5.5;const self=att===v;
  if(!self){att.kills++;if(head&&att.isPlayer)att.heads++;if(W.id==='frag')att.frags=(att.frags||0)+1;G.score[att.team]++;}
  if(v.cover){v.cover.claim=null;v.cover=null;}
  addFeed(att,W,v,head);dropAmmo(v.pos);
  if(v.model&&imp)startRagdoll(v,imp);else if(v.model)startRagdoll(v,{dx:0,dy:0,dz:0,mag:0});
  if(att.isPlayer&&!self)popup(head?'+150':'+100',head?'HEADSHOT':W.id==='frag'?'FRAG KILL':'KILL');
  if(!self&&!att.isPlayer)callout(att,'kill');
  if(v.team===0&&!v.isPlayer){for(const s of soldiers)if(s!==v&&s.alive&&!s.isPlayer&&s.team===0&&s.pos.distanceTo(v.pos)<45){callout(s,'down',{n:v.name});break;}}
  if(v.isPlayer){P.dead=true;P.killer=att;P.deathT=0;P.gHold=false;$('killer').textContent=self?'Yourself':att.name;$('killInfo').textContent=W.name+(self?'':', '+Math.round(att.pos.distanceTo(v.pos))+' m');$('death').hidden=false;$('deathTint').hidden=false;
    for(const k in VMS)VMS[k].g.visible=false;VMG.visible=false;arcPts.visible=false;landRing.visible=false;$('cook').hidden=true;}
  if(G.score[0]>=G.limit||G.score[1]>=G.limit)endMatch();}
function giveAmmo(){const w=P.weap[P.cur];const W=WEAP[w.id];const add=W.id==='rifle'?30:8;w.res=Math.min(w.res+add,W.reserve*1.5);const o=P.weap[1-P.cur];o.res=Math.min(o.res+(o.id==='rifle'?15:4),WEAP[o.id].reserve*1.5);
  let msg='+'+add+' ammo';if(P.gren<3){P.gren++;msg+=', +1 frag';}toast(msg);AU.blip(880,.05,.08,'triangle');}

/* ================= Input ================= */
const keys={};const IN={look:{x:0,y:0},mouse:{l:false,r:false},q:{jump:0,reload:0,swap:0,respawn:0}};
let locked=false,lockFailed=false,everLocked=false;
addEventListener('keydown',e=>{if(e.code==='Tab'){e.preventDefault();if(G.state==='playing'){$('board').hidden=false;renderBoard();}return;}if(e.repeat)return;keys[e.code]=true;if(G.state!=='playing')return;
  if(e.code==='Space'){IN.q.jump=1;IN.q.respawn=1;e.preventDefault();}
  if(e.code==='KeyR')IN.q.reload=1;if(e.code==='KeyQ')IN.q.swap=1;if(e.code==='Digit1'&&P.cur!==0)IN.q.swap=1;if(e.code==='Digit2'&&P.cur!==1)IN.q.swap=1;
  if(e.code==='Escape'&&(lockFailed||isTouch))pause();});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Tab')$('board').hidden=true;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;IN.mouse.l=IN.mouse.r=false;$('board').hidden=true;});
canvas.addEventListener('mousedown',e=>{if(G.state!=='playing'||isTouch)return;if(!locked&&!lockFailed){requestLock();return;}if(e.button===0){IN.mouse.l=true;IN.q.respawn=1;}if(e.button===2)IN.mouse.r=true;});
addEventListener('mouseup',e=>{if(e.button===0)IN.mouse.l=false;if(e.button===2)IN.mouse.r=false;});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(G.state!=='playing'||isTouch)return;if(!locked&&!lockFailed)return;const k=.0022*settings.sens;IN.look.x+=e.movementX*k;IN.look.y+=e.movementY*k;});
addEventListener('wheel',e=>{if(G.state==='playing'&&Math.abs(e.deltaY)>10)IN.q.swap=1;},{passive:true});
function requestLock(){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{if(!everLocked)lockFailed=true;});}catch(e){if(!everLocked)lockFailed=true;}}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;if(locked){everLocked=true;lockFailed=false;}if(!locked&&G.state==='playing'&&!isTouch&&!padActive)pause();});
document.addEventListener('pointerlockerror',()=>{if(!everLocked)lockFailed=true;});
const TC={joy:null,joyO:{x:0,y:0},joyV:{x:0,y:0},look:new Map(),fire:null,aim:false,crouch:false,gren:false};
if(isTouch)document.body.classList.add('touchmode');
function tbOf(el){return el&&el.closest?el.closest('.tb'):null;}
addEventListener('touchstart',e=>{if(G.state!=='playing')return;for(const t of e.changedTouches){const b=tbOf(t.target);
    if(b){b.classList.add('on');AU.init();
      if(b.id==='tFire'){TC.fire=t.identifier;TC.look.set(t.identifier,{x:t.clientX,y:t.clientY});IN.q.respawn=1;}
      else if(b.id==='tAim')TC.aim=!TC.aim;else if(b.id==='tCrouch')TC.crouch=!TC.crouch;else if(b.id==='tGren'){TC.gren=t.identifier;TC.look.set(t.identifier,{x:t.clientX,y:t.clientY});}
      else if(b.id==='tJump'){IN.q.jump=1;IN.q.respawn=1;}else if(b.id==='tReload')IN.q.reload=1;else if(b.id==='tSwap')IN.q.swap=1;else if(b.id==='tPause')pause();continue;}
    if(t.clientX<innerWidth*.42&&TC.joy===null){TC.joy=t.identifier;TC.joyO={x:t.clientX,y:t.clientY};const jb=$('joyBase');jb.style.left=(t.clientX-60)+'px';jb.style.top=(t.clientY-60)+'px';jb.style.bottom='auto';jb.style.opacity=1;}
    else{TC.look.set(t.identifier,{x:t.clientX,y:t.clientY});IN.q.respawn=1;}}
  if(e.cancelable)e.preventDefault();},{passive:false});
addEventListener('touchmove',e=>{if(G.state!=='playing')return;for(const t of e.changedTouches){
    if(t.identifier===TC.joy){let dx=t.clientX-TC.joyO.x,dy=t.clientY-TC.joyO.y;const l=Math.hypot(dx,dy),m=55;if(l>m){dx*=m/l;dy*=m/l;}TC.joyV={x:dx/m,y:dy/m};$('joyKnob').style.transform=`translate(${dx}px,${dy}px)`;}
    const lk=TC.look.get(t.identifier);if(lk){const k=.0052*settings.sens;IN.look.x+=(t.clientX-lk.x)*k;IN.look.y+=(t.clientY-lk.y)*k;lk.x=t.clientX;lk.y=t.clientY;}}
  if(e.cancelable)e.preventDefault();},{passive:false});
function touchEnd(e){for(const t of e.changedTouches){if(t.identifier===TC.joy){TC.joy=null;TC.joyV={x:0,y:0};$('joyKnob').style.transform='';$('joyBase').style.opacity=.6;}
    if(t.identifier===TC.fire)TC.fire=null;if(t.identifier===TC.gren)TC.gren=false;TC.look.delete(t.identifier);const b=tbOf(t.target);if(b&&b.id!=='tAim'&&b.id!=='tCrouch')b.classList.remove('on');}
  $('tAim').classList.toggle('on',TC.aim);$('tCrouch').classList.toggle('on',TC.crouch);}
addEventListener('touchend',touchEnd);addEventListener('touchcancel',touchEnd);
let padActive=false;const padPrev=[];
function readPad(){const pads=navigator.getGamepads?navigator.getGamepads():[];let p=null;for(const q of pads)if(q&&q.connected){p=q;break;}if(!p)return null;
  const b=i=>p.buttons[i]&&(p.buttons[i].pressed||p.buttons[i].value>.4);const edge=i=>{const v=b(i);const e=v&&!padPrev[i];padPrev[i]=v;return e;};
  const dz=v=>Math.abs(v)<.15?0:(v-Math.sign(v)*.15)/.85;
  const s={lx:dz(p.axes[0]||0),ly:dz(p.axes[1]||0),rx:dz(p.axes[2]||0),ry:dz(p.axes[3]||0),fire:b(7),ads:b(6),sprint:b(10),crouch:b(11)||b(1),gren:b(5),jump:edge(0),jumpHeld:b(0),reload:edge(2),swap:edge(3),start:edge(9),board:b(8)};
  if(s.lx||s.ly||s.rx||s.ry||s.fire||s.ads||s.jump||s.reload||s.swap||s.start||s.gren)padActive=true;return s;}

/* ================= HUD helpers ================= */
function addFeed(a,W,v,head){const d=document.createElement('div');d.className='kf';const cls=s=>s.isPlayer?'y':(s.team===0?'a':'b');
  d.innerHTML=`<span class="${cls(a)}">${a.name}</span><span class="w">${W.name}${head?' ◎':''}</span><span class="${cls(v)}">${v.name}</span>`;const f=$('feed');f.prepend(d);while(f.children.length>5)f.lastChild.remove();
  setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),700);},5500);}
let hmT=0,popT=0,toastT=0;
function hitMarker(k){$('hm').classList.toggle('kill',k);hmT=k?.35:.15;}
function popup(a,b){$('popup').innerHTML=a+'<small>'+b+'</small>';popT=1.4;}
function toast(t){$('toast').textContent=t;toastT=1.8;}
function addArc(from){const d=document.createElement('div');d.className='arc';d.dataset.x=from.x;d.dataset.z=from.z;$('arcs').appendChild(d);setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),900);},700);}
function buildPips(){const w=P.weap[P.cur];if(!w)return;const W=WEAP[w.id];const p=$('pips');p.innerHTML='';for(let i=0;i<W.mag;i++){const e=document.createElement('i');if(W.shell)e.style.width='7px';p.appendChild(e);}}
const hudCache={};function setText(id,v){if(hudCache[id]!==v){hudCache[id]=v;$(id).textContent=v;}}
function renderBoard(){for(const tm of [0,1]){const rows=soldiers.filter(s=>s.team===tm).sort((a,b)=>b.kills-a.kills||a.deaths-b.deaths);
  $(tm?'boardB':'boardA').innerHTML='<tr><td></td><td>K</td><td>D</td></tr>'+rows.map(s=>`<tr class="${s.isPlayer?'me':''} ${s.alive?'':'dead'}"><td>${s.name}</td><td>${s.kills}</td><td>${s.deaths}</td></tr>`).join('');}}
