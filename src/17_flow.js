/* ================= Flow ================= */
function regen(dt){for(const s of soldiers)if(s.alive&&s.hp<100&&G.time-s.lastHurt>4.5)s.hp=Math.min(100,s.hp+dt*22);}
function endMatch(){if(G.state==='over')return;G.state='over';G.started=false;try{document.exitPointerLock();}catch(e){}
  const win=G.score[0]===G.score[1]?-1:(G.score[0]>G.score[1]?0:1);$('resultText').textContent=win<0?'DRAW':(win===0?'ALPHA WINS':'BRAVO WINS');$('resultText').style.color=win<0?'var(--ink)':(win===0?'var(--alpha)':'var(--bravo)');
  $('finalScore').textContent='ALPHA '+G.score[0]+' : '+G.score[1]+' BRAVO';$('stK').textContent=player.kills;$('stD').textContent=player.deaths;$('stH').textContent=player.heads;$('stF').textContent=player.frags||0;
  const rows=soldiers.slice().sort((a,b)=>b.kills-a.kills||a.deaths-b.deaths);$('endTable').innerHTML='<tr><td></td><td>K</td><td>D</td></tr>'+rows.map(s=>`<tr class="${s.isPlayer?'me':''}"><td class="${s.team?'b':'a'}">${s.name}</td><td>${s.kills}</td><td>${s.deaths}</td></tr>`).join('');
  $('hud').hidden=true;$('touch').hidden=true;$('end').hidden=false;arcPts.visible=false;landRing.visible=false;G.menuT=0;}
function showMenu(){$('menu').hidden=false;$('setDrawer').hidden=true;$('ctlDrawer').hidden=true;$('tipText').textContent=rpick(TIPS);}
function pause(){if(G.state!=='playing')return;G.state='paused';showMenu();$('hud').hidden=true;$('touch').hidden=true;$('deploy').textContent='RESUME';$('restart').hidden=false;IN.mouse.l=IN.mouse.r=false;TC.fire=null;TC.gren=false;TC.look.clear();$('board').hidden=true;try{document.exitPointerLock();}catch(e){}try{speechSynthesis.cancel();}catch(e){}}
function play(restart){AU.init();if(restart||!G.started)resetMatch();G.state='playing';$('menu').hidden=true;$('end').hidden=true;$('hud').hidden=false;$('touch').hidden=!isTouch;
  for(const k in keys)keys[k]=false;IN.look.x=IN.look.y=0;setVM();if(!isTouch&&!padActive)requestLock();canvas.focus();}
$('deploy').onclick=()=>play(false);$('restart').onclick=()=>play(true);$('again').onclick=()=>play(true);
$('toMenu').onclick=()=>{$('end').hidden=true;G.state='menu';$('deploy').textContent='DEPLOY';$('restart').hidden=true;showMenu();};
$('openSettings').onclick=()=>{$('ctlDrawer').hidden=true;$('setDrawer').hidden=false;$('closeSettings').focus();};$('closeSettings').onclick=()=>{$('setDrawer').hidden=true;$('openSettings').focus();};
$('openControls').onclick=()=>{$('setDrawer').hidden=true;$('ctlDrawer').hidden=false;$('closeControls').focus();};$('closeControls').onclick=()=>{$('ctlDrawer').hidden=true;$('openControls').focus();};
addEventListener('keydown',e=>{if(e.code==='Escape'&&G.state!=='playing'){$('setDrawer').hidden=true;$('ctlDrawer').hidden=true;}});
function seg(id,attr,val,on){document.querySelectorAll('#'+id+' button').forEach(b=>{b.classList.toggle('on',b.dataset[attr]===String(val));b.onclick=()=>{document.querySelectorAll('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));on(b.dataset[attr]);};});}
function gfxSeg(){seg('gfx','q',settings.quality,v=>{settings.quality=v;store.set('quality3',v);applyQuality();PERF.done=true;});}gfxSeg();
seg('squad','n',settings.squad,v=>{settings.squad=parseInt(v);store.set('squad',v);$('chipLimit').textContent='FIRST TO '+(settings.squad>=8?80:50);if(G.started){$('restart').hidden=false;toast('Squad size applies when you restart');}});
$('chipLimit').textContent='FIRST TO '+(settings.squad>=8?80:50);
seg('spawnMode','s',settings.spawn,v=>{settings.spawn=v;store.set('spawn',v);});
seg('vox','v',settings.voice?'on':'off',v=>{settings.voice=v==='on';store.set('voice',v);if(!settings.voice)try{speechSynthesis.cancel();}catch(e){}});
$('sens').value=settings.sens;$('sens').oninput=e=>{settings.sens=parseFloat(e.target.value);store.set('sens',settings.sens);};
$('fov').value=settings.fov;$('fov').oninput=e=>{settings.fov=parseFloat(e.target.value);store.set('fov',settings.fov);};
$('vol').value=settings.vol;$('vol').oninput=e=>{settings.vol=parseFloat(e.target.value);store.set('vol',settings.vol);if(AU.master)AU.master.gain.value=.7*settings.vol;};
function applyQuality(){const lo=settings.quality==='low';renderer.shadowMap.enabled=!lo;sun.castShadow=!lo;renderer.shadowMap.type=settings.quality==='high'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
  scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);}});resize();setupPost();}
const TIPS=['Hold G to cook a grenade, release to throw. The arc shows where it lands.','The shotgun wins fights inside the bazaar lanes. Switch to the rifle on the ghats and the mall road.','Enemies get a red marker while you can see them, and show on the minimap for a moment after they fire.','Dropped ammo boxes refill both weapons and give you a grenade.','The terraces above each retaining wall overlook the level below. Jump at a ledge to climb onto it.','Bots duck behind cover and peek out to shoot. A grenade flushes them out.','When the red grenade icon flashes, move. It points to the grenade.','Wading through the river is slow and loud. The stone pier is faster.','Each match splits the town in half at random. You respawn anywhere on your half, away from enemy eyes.','Your squad calls out contacts on the radio. Listen for where they spot enemies.'];
$('ldTip').textContent=rpick(TIPS);
function controlsList(){const rows=isTouch?[['Left thumb','Move (push to edge to sprint)'],['Right thumb','Look'],['FIRE','Shoot, drag to keep aiming'],['AIM / DUCK','Toggle sights, toggle crouch'],['JUMP','Jump, or climb a ledge in front of you'],['FRAG','Hold to cook, release to throw'],['R / SWAP','Reload, switch weapon']]
  :[['W A S D','Move'],['Mouse','Look, left click to fire'],['Right click','Aim down sights'],['Shift','Sprint'],['C / Ctrl','Crouch'],['Space','Jump, or climb a ledge in front of you'],['G (hold)','Cook and throw a grenade'],['R','Reload'],['Q / 1 / 2','Switch weapon'],['Tab','Scoreboard'],['Esc','Pause'],['Gamepad','RT fire, LT aim, RB grenade, A jump, X reload, Y swap, B crouch, Start pause']];
  $('ctrlList').innerHTML=rows.map(r=>`<b>${r[0]}</b><span>${r[1]}</span>`).join('');}
controlsList();
function drawMapPreview(){const c=$('mapPrev');const g=c.getContext('2d');const W=c.width,H=c.height;g.fillStyle='#1a1712';g.fillRect(0,0,W,H);
  const sw=mbase.width,sh=mbase.height;const k=Math.min(W/sw,H/sh)*1.0;const dw=sw*k,dh=sh*k;g.drawImage(mbase,(W-dw)/2,(H-dh)/2,dw,dh);
  const X=x=>(W-dw)/2+(x-MX0)*MMS*k,Z=z=>(H-dh)/2+(z-MZ0)*MMS*k;g.font='600 15px Teko, Arial Narrow, sans-serif';g.textAlign='center';
  for(const [n,x,z] of [['GHATS',0,46],['BAZAAR',-32,22],['MALL ROAD',-32,-6],['VILLAGE',30,-31],['MONASTERY',0,-60],['WOODS',-80,40]]){g.fillStyle='rgba(10,12,16,.6)';const tw=g.measureText(n).width+10;g.fillRect(X(x)-tw/2,Z(z)-11,tw,16);g.fillStyle='#f4efe4';g.fillText(n,X(x),Z(z)+2);}}
const CINE=[[[-38,2.6,50],[-12,2.8,49],[0,3,30]],[[-12,2.2,33.5],[11,2.6,33],[0,9,20]],[[12,7.4,-5.4],[-4,7,-6],[-40,6.2,-6.5]],[[-20,18.5,-40],[16,18.8,-40],[0,19,-63]],[[-1,10.6,-19.5],[-1,11.2,-28],[-1,15,-60]],[[70,40,75],[-50,40,72],[0,4,-10]],[[-60,7,30],[-50,4,45],[0,0,50]]];
let cineI=0,cineT=.7;const cineFade=document.createElement('div');cineFade.style.cssText='position:fixed;inset:0;background:#0b0d10;opacity:0;pointer-events:none;transition:opacity .6s;z-index:0';document.body.insertBefore(cineFade,$('menu'));
const _ca=new V3(),_cb=new V3();
function cinematic(dt){cineT+=dt;const D=10;if(cineT>D){cineT=0;cineI=(cineI+1)%CINE.length;}const [a,b,l]=CINE[cineI];const t=smooth(0,1,cineT/D);
  camera.position.set(lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t));camera.lookAt(l[0],l[1],l[2]);cineFade.style.opacity=(cineT<.6||cineT>D-.6)?1:0;placeSun(camera.position.x,camera.position.z);}
/* ================= Loop ================= */
let last=performance.now();
const PERF={t:0,n:0,done:false};
let detT=0,shF=0;const _dc=new V3();
function detailCull(dt){detT-=dt;if(detT>0)return;detT=.25;const lim=settings.quality==='high'?85:settings.quality==='med'?60:40;for(const m of DETAIL){_dc.copy(m.geometry.boundingSphere.center);m.visible=_dc.distanceTo(camera.position)<lim+m.geometry.boundingSphere.radius;}}
function dynRes(dt){RES.t+=dt;RES.n++;if(RES.t<2)return;const fps=RES.n/RES.t;RES.t=0;RES.n=0;if(G.state!=='playing')return;let ns=RES.s;
  if(fps<48&&RES.s>.65)ns=Math.max(.65,RES.s-.1);else if(fps>58&&RES.s<1)ns=Math.min(1,RES.s+.05);if(ns!==RES.s){RES.s=ns;resize();}}
function perfCheck(dt){if(PERF.done)return;PERF.t+=dt;PERF.n++;if(PERF.t<6)return;const fps=PERF.n/PERF.t;PERF.t=0;PERF.n=0;
  if(fps<32&&settings.quality!=='low'){settings.quality=settings.quality==='high'?'med':'low';store.set('quality3',settings.quality);gfxSeg();applyQuality();toast('Graphics lowered to '+settings.quality.toUpperCase()+' for a smoother frame rate');}else PERF.done=true;}
function simStep(dt,pad){G.time+=dt;G.clock-=dt;if(G.clock<=0){G.clock=0;endMatch();}
  updatePlayer(dt,pad);for(const s of soldiers)if(!s.isPlayer)updateBot(s,dt);updateGrenades(dt);updateGas(dt);regen(dt);updateSpotting(dt);}
function frame(now){requestAnimationFrame(frame);const dt=clamp((now-last)/1000,0,.05);last=Math.max(last,now);WIND.value+=dt;
  const pad=readPad();
  if(pad&&pad.start&&(G.state==='menu'||G.state==='paused'))play(false);
  if(pad&&pad.jump&&G.state==='over')play(true);
  ringT=Math.max(0,ringT-dt);flashT=Math.max(0,flashT-dt*1.4);
  if(G.state==='playing'){if(!window.__noPerf){perfCheck(dt);dynRes(dt);}simStep(dt,pad);if(G.state==='playing'){updateVM(dt);updateHUD(dt);}placeSun(player.pos.x,player.pos.z);}
  else if(!G.started||G.state==='over'){cinematic(dt);if(camera.fov!==62){camera.fov=62;camera.updateProjectionMatrix();}G.time+=dt;
    for(const s of soldiers)if(!s.isPlayer&&s.alive&&s.model)s.model.root.visible=false;}
  if(renderer.shadowMap.enabled){const half=settings.quality==='med'||RES.s<1;renderer.shadowMap.autoUpdate=!half;if(half){shF^=1;if(shF)renderer.shadowMap.needsUpdate=true;}}
  updateFX(dt);detailCull(dt);AU.ambient(dt);T.waterN.offset.set(WIND.value*.012,WIND.value*.007);T.foam.offset.set(WIND.value*.01,Math.sin(WIND.value*.7)*.06);sky.position.copy(camera.position);
  renderFrame(G.state==="playing"&&!P.dead&&!window.__noVM);}

/* ================= Loading screen ================= */
function paintLoader(){const cv=$('loadArt');const dpr=Math.min(devicePixelRatio||1,2);const W=cv.width=Math.round(innerWidth*dpr),H=cv.height=Math.round(innerHeight*dpr);const g=cv.getContext('2d');const R=rand;
  let gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#3a74c2');gr.addColorStop(.5,'#9cc1e2');gr.addColorStop(.72,'#e2eae8');g.fillStyle=gr;g.fillRect(0,0,W,H);
  const sx=W*.72,sy=H*.15;gr=g.createRadialGradient(sx,sy,0,sx,sy,H*.5);gr.addColorStop(0,'rgba(255,248,225,.95)');gr.addColorStop(.1,'rgba(255,240,200,.35)');gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let i=0;i<16;i++){const cx=R(0,W),cy=R(H*.04,H*.3),r=R(W*.03,W*.07);for(let k=0;k<6;k++){const x=cx+k*r*.5,y=cy+R(-r*.2,r*.2);gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}}
  const ridge=(base,amp,col,snow,seedv)=>{const pts=[];g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=W/260){const t=x/W;const y=base-amp*(Math.sin(t*6.2+seedv)*.3+Math.sin(t*13.7+seedv*2)*.18+Math.sin(t*33+seedv*3)*.06+Math.pow(Math.abs(Math.sin(t*3.1+seedv*.7)),3)*.6);pts.push([x,y]);g.lineTo(x,y);}
    g.lineTo(W,H);g.closePath();g.fillStyle=col;g.fill();if(snow){g.save();g.clip();for(const [x,y] of pts){const sh=(base-y)-amp*.38;if(sh>0){g.fillStyle='rgba(250,252,255,.94)';g.fillRect(x-1,y,W/260+2,sh*.75);}}g.restore();}return pts;};
  ridge(H*.44,H*.32,'#7b92b4',true,1.3);ridge(H*.52,H*.2,'#95aac4',true,4.1);ridge(H*.62,H*.14,'#4e6a68',false,2.2);
  const hill=ridge(H*.72,H*.13,'#3d5946',false,7.7);
  for(let i=0;i<220;i++){const x=R(0,W);const y=R(H*.5,H*.8);const s=R(H*.012,H*.03);g.fillStyle=Math.random()<.5?'#2c4434':'#365240';g.beginPath();g.moveTo(x,y-s*2);g.lineTo(x+s*.6,y);g.lineTo(x-s*.6,y);g.fill();}
  const cols=['#e8b44c','#dc7c52','#ea978f','#92bbdc','#a0d4b2','#f6ecd4','#cbd76e','#d6aad3'];
  for(let row=0;row<5;row++){const yy=H*(.62+row*.052);for(let x=W*.14;x<W*.88;x+=R(W*.016,W*.03)){const w=R(W*.012,W*.026),h=R(H*.02,H*.045);g.fillStyle=cols[(Math.random()*cols.length)|0];g.fillRect(x,yy-h,w,h);
    if(row<3){g.fillStyle=Math.random()<.5?'#5a5f66':'#a83a2c';g.beginPath();g.moveTo(x-2,yy-h);g.lineTo(x+w/2,yy-h-h*.35);g.lineTo(x+w+2,yy-h);g.fill();}
    g.fillStyle='rgba(30,30,40,.55)';for(let k=0;k<2;k++)g.fillRect(x+w*(.2+k*.4),yy-h*.65,w*.18,h*.22);}}
  const mx=W*.5,my=H*.6;g.fillStyle='#f4f1ea';g.fillRect(mx-W*.05,my-H*.06,W*.1,H*.06);g.fillStyle='#7a2a22';g.fillRect(mx-W*.05,my-H*.06,W*.1,H*.01);g.fillStyle='#e0b040';g.beginPath();g.moveTo(mx-W*.022,my-H*.06);g.lineTo(mx,my-H*.085);g.lineTo(mx+W*.022,my-H*.06);g.fill();
  const tx=W*.47,ty=H*.86;g.fillStyle='#c9a27a';g.beginPath();g.moveTo(tx-W*.02,ty);g.quadraticCurveTo(tx-W*.018,ty-H*.09,tx,ty-H*.12);g.quadraticCurveTo(tx+W*.018,ty-H*.09,tx+W*.02,ty);g.fill();g.fillStyle='#f28c28';g.beginPath();g.moveTo(tx,ty-H*.12);g.lineTo(tx+W*.012,ty-H*.128);g.lineTo(tx,ty-H*.136);g.fill();
  for(let i=0;i<10;i++){const yy=H*(.86+i*.008);g.fillStyle=i%2?'#c7a07a':'#b48d6a';g.fillRect(0,yy,W,H*.008);}
  gr=g.createLinearGradient(0,H*.94,0,H);gr.addColorStop(0,'#3f8f86');gr.addColorStop(1,'#25615c');g.fillStyle=gr;g.fillRect(0,H*.94,W,H*.06);
  g.strokeStyle='rgba(255,255,255,.35)';for(let i=0;i<60;i++){const x=R(0,W),y=R(H*.945,H);g.lineWidth=R(1,2.5)*dpr;g.beginPath();g.moveTo(x,y);g.lineTo(x+R(10,40)*dpr,y);g.stroke();}
  const pc=['#2f5fb3','#f2f2ee','#c9302c','#2f8f4e','#f2c230'];for(const [x0,y0,x1,y1] of [[-.05,.1,.55,.2],[.4,.04,1.05,.15]]){const ax=x0*W,ay=y0*H,bx=x1*W,by=y1*H;const N=40;g.strokeStyle='rgba(20,20,20,.6)';g.lineWidth=1.2*dpr;g.beginPath();
    for(let k=0;k<=N;k++){const t=k/N;const x=ax+(bx-ax)*t,y=ay+(by-ay)*t+Math.sin(t*Math.PI)*H*.05;k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
    for(let k=1;k<N;k++){const t=k/N;const x=ax+(bx-ax)*t,y=ay+(by-ay)*t+Math.sin(t*Math.PI)*H*.05;g.fillStyle=pc[k%5];g.save();g.translate(x,y);g.rotate(R(-.15,.15));g.fillRect(-W*.006,0,W*.012,H*.03);g.restore();}}
  const n=Math.min(70000,W*H/60);for(let i=0;i<n;i++){g.fillStyle=Math.random()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)';g.fillRect(Math.random()*W,Math.random()*H,dpr*1.5,dpr*1.5);}}
const LD={real:0,t0:performance.now(),min:5000};
function ldTick(){const el=(performance.now()-LD.t0)/LD.min;const shown=Math.min(LD.real,el);$('ldFill').style.width=(shown*100).toFixed(1)+'%';$('ldPct').textContent=Math.floor(shown*100)+'%';return shown;}
const ldTimer=setInterval(ldTick,50);
async function stage(label,w,fn){$('ldStage').textContent=label;ldTick();await wait(30);const _t=performance.now();fn();LD.real=Math.min(1,LD.real+w);ldTick();}
async function boot(){paintLoader();resize();
  await stage('Raising the hills',.12,()=>{buildHG();buildTerrain();buildMountains();});
  await stage('Laying the ghats',.08,()=>{buildGhats();});
  await stage('Building the town',.18,()=>{buildTown();});
  await stage('Planting deodars',.1,()=>{camp(-1);camp(1);buildForest();decorate();const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wireArr,3));scene.add(new THREE.LineSegments(wg,M.wire));});
  await stage('Merging geometry',.08,()=>{mergeStatic();});
  await stage('Mapping paths',.12,()=>{buildColGrid();gasSpots();buildColGrid();initGas();buildNav();buildCover();buildMinimapBase();});
  await stage('Kitting out soldiers',.1,()=>{MAT_A=buildAtlas(0);MAT_B=buildAtlas(1);makeSoldiers();for(const s of soldiers)spawn(s);});
  await stage('Compiling shaders',.12,()=>{applyQuality();try{renderer.compile(scene,camera);renderer.compile(vmScene,vmCam);}catch(e){}});
  await stage('Warming up',.1,()=>{for(const s of soldiers)if(s.model)s.model.root.visible=true;for(const k in VMS)VMS[k].g.visible=true;VMG.visible=true;
    const views=[[0,30,70,0,0,0],[-80,8,0,0,5,0],[0,16,-40,0,10,-65],[40,6,-5,0,5,-5]];for(const [x,y,z,a,b,c] of views){camera.position.set(x,y,z);camera.lookAt(a,b,c);placeSun(x,z);renderFrame(true);}
    for(const s of soldiers)if(s.model)s.model.root.visible=false;for(const k in VMS)VMS[k].g.visible=false;VMG.visible=false;});
  LD.real=1;while(ldTick()<1)await wait(50);clearInterval(ldTimer);
  G.started=false;drawMapPreview();showMenu();$('loader').classList.add('out');setTimeout(()=>{$('loader').hidden=true;},900);
  last=performance.now();requestAnimationFrame(frame);
  window.__dustline={CYLS,hitGas,scene,M,CompMat,ShaftMat,cine:(i)=>{if(i!=null){cineI=i;cineT=3;}return [cineI,cineT,ShaftMat.uniforms.str.value,CompMat.uniforms.flash.value,camera.position.toArray()];},endMatch,findLedge,spawnPoint,inHalf,SPLIT,applyDamage,WEAP,G,P,soldiers:()=>soldiers,player:()=>player,colliders,cover:COV,nav:NAV,renderer,camera,play,keys,settings,IN,VMS,updateVM,setVM,POST,gList,spawnGrenade,explode,placeSun,Hx,
    step:(dt)=>{simStep(dt,null);updateFX(dt);for(const s of soldiers)if(s.model)s.model.root.updateMatrixWorld(true);}};}
boot();
