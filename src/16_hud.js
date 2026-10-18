/* ================= Minimap ================= */
const mm=$('minimap'),mg=mm.getContext('2d');const MMS=2;const mbase=document.createElement('canvas');const MMR=48;const MX0=-100,MZ0=-76;
function buildMinimapBase(){mbase.width=200*MMS;mbase.height=146*MMS;const g=mbase.getContext('2d');const id=g.createImageData(mbase.width,mbase.height);const D=id.data;
  for(let j=0;j<mbase.height;j++)for(let i=0;i<mbase.width;i++){const x=MX0+i/MMS,z=MZ0+j/MMS;const h=Hx(x,z);const hx=Hx(x+.6,z),hz=Hx(x,z+.6);let sh=clamp(.75+(h-hx)*.9+(h-hz)*.6,.35,1.25);
    let r=70,gg=78,b=52;const ax=Math.abs(x);if(h<WATER){r=40;gg=92;b=104;sh=1;}else if(ax<60&&z>34&&z<GHAT_END){r=150;gg=124;b=96;}else if(ax<60&&z>-47&&z<34){r=118;gg=106;b=88;}else if(ax>56&&Math.abs(z+6.5)<3){r=110;gg=96;b=80;}
    const k=(j*mbase.width+i)*4;D[k]=r*sh;D[k+1]=gg*sh;D[k+2]=b*sh;D[k+3]=255;}
  g.putImageData(id,0,0);const X=x=>(x-MX0)*MMS,Z=z=>(z-MZ0)*MMS;
  for(const c of colliders){const cx=(c.minX+c.maxX)/2,cz=(c.minZ+c.maxZ)/2;const gr=Hx(cx,cz);const h=c.maxY-Math.max(gr,c.minY);if(c.kind==='fill'){g.fillStyle='rgba(60,52,44,.55)';}else if(h<.8||c.minY>gr+1)continue;else g.fillStyle=h>3?'#dcd2bf':h>2?'#b3a78f':'#8a7f6b';
    g.fillRect(X(c.minX),Z(c.minZ),Math.max(1.2,(c.maxX-c.minX)*MMS),Math.max(1.2,(c.maxZ-c.minZ)*MMS));}
  }
function drawMinimap(){const W=mm.width,H=mm.height,pl=player;mg.save();mg.fillStyle='#1e1a14';mg.fillRect(0,0,W,H);
  const k=W/(2*MMR);mg.translate(W/2,H/2);mg.rotate(pl.yaw);mg.scale(k/MMS,k/MMS);mg.drawImage(mbase,-(pl.pos.x-MX0)*MMS,-(pl.pos.z-MZ0)*MMS);mg.restore();
  mg.save();mg.translate(W/2,H/2);const c=Math.cos(pl.yaw),sn=Math.sin(pl.yaw);
  const dot=(x,z)=>{const dx=x-pl.pos.x,dz=z-pl.pos.z;return [(dx*c-dz*sn)*k,(dx*sn+dz*c)*k];};
  for(const g of gList){const [x,y]=dot(g.pos.x,g.pos.z);if(Math.abs(x)>W/2||Math.abs(y)>H/2)continue;mg.fillStyle='#ffb44a';mg.beginPath();mg.arc(x,y,3,0,TAU);mg.fill();}
  for(const s of soldiers){if(!s.alive||s.isPlayer)continue;const show=s.team===0||G.time-s.lastFired<1.6||G.time-s.spotT<.4;if(!show)continue;const [x,y]=dot(s.pos.x,s.pos.z);if(Math.abs(x)>W/2-4||Math.abs(y)>H/2-4)continue;
    if(s.team===0){mg.save();mg.translate(x,y);mg.rotate(pl.yaw-s.yaw);mg.fillStyle='#9bd36f';mg.beginPath();mg.moveTo(0,-5);mg.lineTo(4,4);mg.lineTo(-4,4);mg.fill();mg.restore();}
    else{mg.fillStyle='#ff5d4a';mg.beginPath();mg.arc(x,y,4,0,TAU);mg.fill();}}
  mg.fillStyle='#f2a541';mg.beginPath();mg.moveTo(0,-7);mg.lineTo(5,5);mg.lineTo(0,2.5);mg.lineTo(-5,5);mg.fill();
  mg.strokeStyle='rgba(242,165,65,.25)';mg.beginPath();mg.moveTo(0,0);mg.lineTo(-W*.35,-H*.5);mg.moveTo(0,0);mg.lineTo(W*.35,-H*.5);mg.stroke();mg.restore();}

/* ================= HUD per frame ================= */
function updateHUD(dt){const pl=player;if(!pl)return;
  const cs=Math.max(0,Math.ceil(G.clock));setText('clock',Math.floor(cs/60)+':'+String(cs%60).padStart(2,'0'));
  setText('sA',String(G.score[0]));setText('sB',String(G.score[1]));$('barA').style.width=(G.score[0]/G.limit*100)+'%';$('barB').style.width=(G.score[1]/G.limit*100)+'%';
  setText('hpNum',String(Math.max(0,Math.ceil(pl.hp))));$('hpFill').style.width=Math.max(0,pl.hp)+'%';$('hpFill').style.background=pl.hp<35?'var(--bravo)':'var(--ink)';
  setText('kd',pl.kills+' K / '+pl.deaths+' D');setText('grenN',String(P.gren));
  const w=P.weap[P.cur];if(w){const W=WEAP[w.id];setText('wName',W.name);setText('mag',String(w.mag));setText('res','/ '+w.res);$('mag').classList.toggle('low',w.mag<=W.mag*.25);
    const pips=$('pips').children;for(let i=0;i<pips.length;i++)pips[i].classList.toggle('e',i>=w.mag);
    $('reloadHint').style.opacity=(P.reloading>0?1:(w.mag<=W.mag*.25&&w.res>0?.6+Math.sin(G.time*8)*.4:0));setText('reloadHint',P.reloading>0?'RELOADING':'RELOAD');
    const moving=Math.hypot(pl.vel.x,pl.vel.z)/5.3;const spread=lerp(W.spreadHip,W.spreadAds,P.ads)*(P.crouch>.5?.8:1)+(W.pellets===1?moving*.018:0)+(pl.onGround?0:.04);
    const px=4+spread*innerHeight/(2*Math.tan(camera.fov*Math.PI/360))+P.kick*6;
    $('cL').style.left=(-px-9)+'px';$('cR').style.left=px+'px';$('cU').style.top=(-px-9)+'px';$('cD').style.top=px+'px';
    $('cross').style.opacity=P.dead||P.gHold?0:(W.id==='rifle'?1-P.ads:1-P.ads*.85)*(P.sprint?.3:1);}
  setText('zone',zoneName(pl.pos.x,pl.pos.z));
  hmT-=dt;$('hm').style.opacity=hmT>0?1:0;popT-=dt;$('popup').style.opacity=popT>0?1:0;toastT-=dt;$('toast').style.opacity=toastT>0?1:0;
  const hurt=clamp(1-(G.time-pl.lastHurt)/.6,0,1)*.6+clamp((50-pl.hp)/50,0,1)*.5;$('vignette').style.opacity=P.dead?0:hurt;
  for(const a of $('arcs').children){const dx=+a.dataset.x-pl.pos.x,dz=+a.dataset.z-pl.pos.z;const ang=angDiff(pl.yaw,Math.atan2(-dx,-dz));a.style.transform=`rotate(${-ang}rad)`;}
  let gw=null,gd=9;for(const g of gList){if(G.time-g.t0<.2&&g.owner===pl)continue;const d=g.pos.distanceTo(pl.pos);if(d<gd){gd=d;gw=g;}}
  const ge=$('gwarn');if(gw&&pl.alive){ge.hidden=false;const ang=angDiff(pl.yaw,Math.atan2(-(gw.pos.x-pl.pos.x),-(gw.pos.z-pl.pos.z)));ge.style.transform=`rotate(${-ang}rad)`;ge.style.opacity=.6+.4*Math.sin(G.time*16);}else ge.hidden=true;
  if(!POST.on)$('flashOv').style.opacity=flashT;
  if(!$('board').hidden)renderBoard();drawMinimap();}
