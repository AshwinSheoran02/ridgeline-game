/* ================= Online play: peer to peer, host runs the match ================= */
// Transport: PeerJS (WebRTC data channels) in normal use; a BroadcastChannel stand-in when the page URL has ?netlocal=1 (same-browser testing).
const NET={on:false,host:false,client:false,started:false,code:'',peer:null,conns:new Map(),hostConn:null,lobby:[],mode:'tdm',roster:null,myIdx:0,flip:0,
  sendT:0,boardT:0,pingT:0,ping:0,delay:.1,name:'',local:/[?&]netlocal=1/.test(location.search),gm:[]};
const NET_VER=1,NET_MAX=8,NET_PREFIX='rdgln-';
const CODE_CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const BOT_EXTRA=['Moreau','Haas','Silva','Kovac','Lund','Adeyemi'];
const pk=v=>Math.round(v*100),pk3=v=>[pk(v.x),pk(v.y),pk(v.z)],up3=a=>new V3(a[0]/100,a[1]/100,a[2]/100);
function netCodeGen(){let s='';for(let i=0;i<5;i++)s+=CODE_CH[(Math.random()*CODE_CH.length)|0];return s;}
function netStatus(t){$('netStatus').textContent=t||'';}
function netCleanName(n){n=String(n||'').replace(/[^\w .\-]/g,'').trim().slice(0,14);return n||('Player'+((Math.random()*90+10)|0));}

/* ---- transports ---- */
class LocalPeer{constructor(id){this.id=id||('p'+Math.random().toString(36).slice(2,9));this.bc=new BroadcastChannel('ridgeline-net');this.h={};this.conns={};
    this.bc.onmessage=e=>{const m=e.data;if(m.to!==this.id)return;
      if(m.k==='conn'){const c=new LocalConn(this,m.from);this.conns[m.from]=c;this.bc.postMessage({k:'ack',to:m.from,from:this.id});if(this.h.connection)this.h.connection(c);setTimeout(()=>c._open(),0);}
      else if(m.k==='ack'){const c=this.conns[m.from];if(c)c._open();}
      else if(m.k==='d'){const c=this.conns[m.from];if(c)c._data(m.d);}
      else if(m.k==='x'){const c=this.conns[m.from];if(c){delete this.conns[m.from];c._close();}}};
    setTimeout(()=>{if(this.h.open)this.h.open(this.id);},0);}
  on(e,f){this.h[e]=f;}
  connect(id){const c=new LocalConn(this,id);this.conns[id]=c;this.bc.postMessage({k:'conn',to:id,from:this.id});return c;}
  destroy(){for(const k in this.conns)this.bc.postMessage({k:'x',to:k,from:this.id});this.conns={};try{this.bc.close();}catch(e){}}}
class LocalConn{constructor(p,peer){this.p=p;this.peer=peer;this.h={};this.open=false;}
  on(e,f){this.h[e]=f;}_open(){if(this.open)return;this.open=true;if(this.h.open)this.h.open();}_data(d){if(this.h.data)this.h.data(d);}_close(){if(!this.open&&this.closed)return;this.open=false;this.closed=true;if(this.h.close)this.h.close();}
  send(d){if(this.open)this.p.bc.postMessage({k:'d',to:this.peer,from:this.p.id,d});}close(){this.p.bc.postMessage({k:'x',to:this.peer,from:this.p.id});this._close();}}
function loadPeerJS(){return new Promise((res,rej)=>{if(window.Peer)return res();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
  s.onload=()=>window.Peer?res():rej(new Error('lib'));s.onerror=()=>rej(new Error('lib'));document.head.appendChild(s);});}
async function makePeer(id){if(NET.local)return new LocalPeer(id);await loadPeerJS();
  return new Peer(id||undefined,{debug:0,config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}]}});}
function peerOpen(p,ms=12000){return new Promise((res,rej)=>{const t=setTimeout(()=>rej({type:'timeout'}),ms);p.on('open',id=>{clearTimeout(t);res(id);});p.on('error',e=>{clearTimeout(t);rej(e);});});}

/* ---- sending ---- */
function netSend(m){const c=NET.hostConn;if(c&&c.open)try{c.send(m);}catch(e){}}
function netBc(m,except){for(const [id,e] of NET.conns)if(id!==except&&e.c.open)try{e.c.send(m);}catch(err){}}
function netTo(peer,m){const e=NET.conns.get(peer);if(e&&e.c.open)try{e.c.send(m);}catch(err){}}

/* ---- lobby UI ---- */
function netOpenDrawer(){$('setDrawer').hidden=true;$('ctlDrawer').hidden=true;$('netDrawer').hidden=false;$('netName').value=store.get('netname','');netRenderLobby();}
function netRenderLobby(){const inRoom=NET.on;$('netIntro').hidden=inRoom;$('netRoom').hidden=!inRoom;if(!inRoom)return;
  $('netCodeShow').textContent=NET.code;const coop=NET.mode==='coop';
  document.querySelectorAll('#netMode button').forEach(b=>{b.classList.toggle('on',b.dataset.m===NET.mode);b.disabled=!NET.host;});
  const li=p=>`<li data-id="${p.id}" class="${NET.host&&!coop&&!NET.started?'can':''}">${p.name.replace(/[<>&]/g,'')}${p.id==='host'?'<small>HOST</small>':''}${p.me?'<small>YOU</small>':''}</li>`;
  const A=NET.lobby.filter(p=>coop||p.team===0),B=coop?[]:NET.lobby.filter(p=>p.team===1);
  $('netTeamA').innerHTML=A.map(li).join('');$('netTeamB').innerHTML=coop?'<li><small>Bots</small></li>':B.map(li).join('');
  $('netHint').textContent=NET.host?(coop?'Everyone plays together against a bot squad.':'Tap a player to move them to the other team. Bots fill empty slots.'):(NET.started?'Match in progress.':'Waiting for the host to start the match.');
  $('netGo').hidden=!NET.host;$('netGo').textContent=NET.started||G.state==='over'?'RESTART MATCH':'START MATCH';
  if(NET.host)document.querySelectorAll('#netRoom li.can').forEach(el=>el.onclick=()=>{const p=NET.lobby.find(q=>q.id===el.dataset.id);if(!p)return;p.team=1-p.team;netLobbyBc();});}
function netLobbyBc(){netBc({t:'lob',l:NET.lobby.map(p=>({id:p.id,n:p.name,tm:p.team})),m:NET.mode,st:NET.started});netRenderLobby();}
$('openNet').onclick=netOpenDrawer;$('closeNet').onclick=()=>{$('netDrawer').hidden=true;$('openNet').focus();};
$('netName').oninput=e=>store.set('netname',e.target.value);
$('netHost').onclick=()=>netHost();$('netJoin').onclick=()=>netJoin($('netCode').value);
$('netCode').addEventListener('keydown',e=>{if(e.key==='Enter')netJoin($('netCode').value);});
$('netLeave').onclick=()=>netLeave('You left the room.');
$('netGo').onclick=()=>{if(NET.host)netStartMatch();};
document.querySelectorAll('#netMode button').forEach(b=>b.onclick=()=>{if(!NET.host||NET.started)return;NET.mode=b.dataset.m;netLobbyBc();});
$('netCopy').onclick=async()=>{const url=location.origin+location.pathname+'?room='+NET.code;
  try{if(navigator.share&&isTouch){await navigator.share({title:'Ridgeline',text:'Join my Ridgeline match. Room '+NET.code,url});return;}await navigator.clipboard.writeText(url);netStatus('Invite link copied.');}catch(e){netStatus('Share this link: '+url);}};

/* ---- host ---- */
async function netHost(){if(NET.on)return;NET.name=netCleanName($('netName').value);store.set('netname',NET.name);$('netHost').disabled=true;netStatus('Creating a room...');
  let p=null;for(let i=0;i<4;i++){NET.code=netCodeGen();try{p=await makePeer(NET_PREFIX+NET.code);await peerOpen(p);break;}catch(e){try{p&&p.destroy();}catch(_){}p=null;if(!(e&&e.type==='unavailable-id'))break;}}
  $('netHost').disabled=false;if(!p){netStatus(location.protocol==='file:'?'Online play needs the page served over https.':'Could not create a room. Check your internet connection and try again.');return;}
  Object.assign(NET,{peer:p,on:true,host:true,client:false,started:false,lobby:[{id:'host',name:NET.name,team:0,me:true}]});
  p.on('connection',c=>netHostConn(c));p.on('disconnected',()=>{try{p.reconnect();}catch(e){}});
  p.on('error',e=>{if(e&&e.type==='network')netStatus('Lost contact with the matchmaking server. Players already in the room stay connected.');});
  netStatus('Room ready. Share the code or the invite link.');netRenderLobby();netPingHud();}
function netHostConn(c){const ent={c,name:'',idx:-1,hello:false};NET.conns.set(c.peer,ent);
  c.on('data',m=>netHostMsg(ent,m));c.on('close',()=>netHostDrop(c.peer));c.on('error',()=>{});}
function netHostDrop(peer){const ent=NET.conns.get(peer);if(!ent)return;NET.conns.delete(peer);NET.lobby=NET.lobby.filter(p=>p.id!==peer);
  if(NET.started&&ent.idx>=0){const s=soldiers[ent.idx];if(s&&s.net){s.net=false;s.human=false;s.peer=null;s.name=ent.name+' (bot)';s.state='patrol';s.path=null;s.thinkT=0;if(NET.roster[ent.idx]){NET.roster[ent.idx].h=null;NET.roster[ent.idx].n=s.name;}netRelabel(s);}
    netBc({t:'drop',i:ent.idx,n:soldiers[ent.idx]?soldiers[ent.idx].name:''});toast(ent.name+' left. A bot took their place.');}
  netLobbyBc();netPingHud();}
function netHostMsg(ent,m){if(!m||typeof m!=='object')return;const s=ent.idx>=0?soldiers[ent.idx]:null;
  switch(m.t){
    case 'hello':{if(ent.hello)return;if(m.v!==NET_VER){ent.c.send({t:'err',m:'Your game is a different version from the host. Refresh the page and try again.'});return;}
      if(NET.lobby.length>=NET_MAX){ent.c.send({t:'err',m:'That room is full.'});return;}
      ent.hello=true;ent.name=netCleanName(m.n);let nm=ent.name,k=2;while(NET.lobby.some(p=>p.name===nm))nm=ent.name+k++;ent.name=nm;
      const c0=NET.lobby.filter(p=>p.team===0).length,c1=NET.lobby.length-c0;NET.lobby.push({id:ent.c.peer,name:nm,team:c1<c0?1:0});
      ent.c.send({t:'wel',code:NET.code,id:ent.c.peer});netLobbyBc();toast(nm+' joined the room.');
      if(NET.started&&G.state==='playing')netLateJoin(ent);netPingHud();break;}
    case 'st':if(s&&s.net&&s.alive&&Array.isArray(m.p))netPushSample(s,m.p);break;
    case 'sh':if(s&&s.alive){const e=Array.isArray(m.e)?m.e:null;netShotFX(s,e,m.w==='shotgun'?'shotgun':'rifle');netBc({t:'sh',i:ent.idx,e,w:m.w},ent.c.peer);}break;
    case 'hit':{const v=soldiers[m.v|0];if(!s||!v||!s.alive||!v.alive||v.team===s.team)return;const W=WEAP[m.w]||WEAP.rifle;
      const dmg=clamp(+m.d||0,0,W.id==='shotgun'?W.head:Math.max(W.head,60));const im=m.im&&typeof m.im==='object'?m.im:null;applyDamage(v,dmg,s,W,!!m.h,im);break;}
    case 'gr':if(s&&s.alive&&Array.isArray(m.f)&&Array.isArray(m.v)){spawnGrenade(s,up3(m.f),up3(m.v),clamp(+m.u||2,.001,GFUSE));}break;
    case 'gas':{const g=CYLS[m.i|0];if(g&&s)hitGas(g,s,null);break;}
    case 'rsp':if(s&&!s.alive&&G.time-s.deadAt>1.6)spawn(s);break;
    case 'pi':ent.c.send({t:'po',k:m.k});break;}}
function netLateJoin(ent){const tm=NET.mode==='coop'?0:(NET.lobby.find(p=>p.id===ent.c.peer)||{team:0}).team;
  let i=soldiers.findIndex(s=>!s.human&&!s.isPlayer&&!s.net&&s.team===tm);if(i<0)i=soldiers.findIndex(s=>!s.human&&!s.isPlayer&&!s.net);if(i<0){ent.c.send({t:'err',m:'The match is full. Wait for the next one.'});return;}
  const s=soldiers[i];Object.assign(s,{human:true,net:true,peer:ent.c.peer,name:ent.name,kills:0,deaths:0,heads:0,nb:[]});ent.idx=i;NET.roster[i].h=ent.c.peer;NET.roster[i].n=ent.name;netRelabel(s);
  ent.c.send(netGoMsg());netBc({t:'take',i,n:ent.name},ent.c.peer);}
function netBuildRoster(){const sq=settings.squad,coop=NET.mode==='coop';const humans=NET.lobby.slice(0,NET_MAX);const R=[];
  const byTeam=[humans.filter(h=>coop||h.team===0),coop?[]:humans.filter(h=>h.team===1)];
  const host=humans.find(h=>h.id==='host');const order=[host,...humans.filter(h=>h!==host)];for(const h of order)R.push({n:h.name,tm:coop?0:h.team,w:'rifle',h:h.id,sk:1});
  const N=Math.max(sq,byTeam[0].length,byTeam[1].length);const sizes=coop?[N,Math.min(12,N+Math.max(0,humans.length-1))]:[N,N];
  const used=new Set(humans.map(h=>h.name));const pool=[[...NAMES[0],...BOT_EXTRA],[...NAMES[1],...BOT_EXTRA]];
  for(const tm of [0,1]){let have=R.filter(e=>e.tm===tm).length,k=0;while(have<sizes[tm]){let n=pool[tm][k++%pool[tm].length];if(used.has(n))continue;used.add(n);R.push({n,tm,w:have%3===1?'shotgun':'rifle',h:null,sk:+rand(.8,1.05).toFixed(2)});have++;}}
  return R;}
function netMakeSoldiers(R){for(const s of soldiers)if(s.model)scene.remove(s.model.root);soldiers=[];
  R.forEach((e,i)=>{const me=i===NET.myIdx;const tm=e.tm^NET.flip;const s=me?new Soldier(tm,'You',true):new Soldier(tm,e.n,false,e.w,e.sk||.95);
    s.idx=i;s.human=!!e.h;s.peer=e.h;s.net=!me&&(NET.client||(!!e.h&&e.h!=='host'));s.nb=[];soldiers.push(s);if(me)player=s;});}
function netRelabel(s){const m=s.model;if(m&&m.label){try{m.label.material.map=nameTex(s.name);m.label.material.needsUpdate=true;}catch(e){}}}
function netGoMsg(){return {t:'go',R:NET.roster,lim:G.limit,ck:G.clock,sc:G.score,mode:NET.mode,
  sp:soldiers.map(s=>s.alive?[pk(s.pos.x),pk(s.pos.y),pk(s.pos.z),Math.round(s.yaw*1000)]:0),gas:CYLS.map(g=>g.state),k:soldiers.map(s=>[s.kills,s.deaths,s.heads||0])};}
function netStartMatch(){if(!NET.host)return;if(NET.lobby.length<1)return;NET.roster=netBuildRoster();NET.myIdx=0;NET.flip=0;NET.started=false;
  netMakeSoldiers(NET.roster);G.limit=settings.squad>=8?80:50;$('limit').textContent='FIRST TO '+G.limit;
  newSplit();resetGas();G.score=[0,0];G.clock=720;G.started=true;for(const c of COV.list)c.claim=null;for(const g of gList){g.m.visible=false;gPool.push(g.m);}gList.length=0;
  for(const p of fx.pickups)scene.remove(p.m);fx.pickups.length=0;$('feed').innerHTML='';$('radio').innerHTML='';
  for(const s of soldiers)spawn(s);P.cur=0;
  for(const [id,ent] of NET.conns)ent.idx=NET.roster.findIndex(e=>e.h===id);
  NET.started=true;NET.gsLast=CYLS.map(g=>g.state);netBc(netGoMsg());$('netDrawer').hidden=true;$('end').hidden=true;play(false);netRenderLobby();}

/* ---- client ---- */
async function netJoin(raw){if(NET.on)return;const code=String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){netStatus('Enter the room code from the host.');return;}
  NET.name=netCleanName($('netName').value);store.set('netname',NET.name);$('netJoin').disabled=true;netStatus('Connecting to room '+code+'...');
  let p;try{p=await makePeer();await peerOpen(p);}catch(e){$('netJoin').disabled=false;netStatus('Could not reach the matchmaking server. Check your internet connection.');try{p&&p.destroy();}catch(_){}return;}
  NET.peer=p;NET.code=code;let opened=false;
  const c=p.connect(NET_PREFIX+code,{reliable:true,serialization:'json'});
  const to=setTimeout(()=>{if(!opened){netStatus("Couldn't connect. Check the code. If it's right, one of your networks may be blocking direct connections; try mobile data or another Wi-Fi.");try{p.destroy();}catch(e){}NET.peer=null;$('netJoin').disabled=false;}},15000);
  p.on('error',e=>{if(e&&e.type==='peer-unavailable'){clearTimeout(to);netStatus('No room with that code. Check it with the host.');try{p.destroy();}catch(_){}NET.peer=null;$('netJoin').disabled=false;}});
  c.on('open',()=>{opened=true;clearTimeout(to);NET.hostConn=c;Object.assign(NET,{on:true,client:true,host:false});$('netJoin').disabled=false;c.send({t:'hello',n:NET.name,v:NET_VER});netStatus('Connected. Waiting for the host.');});
  c.on('data',netClientMsg);c.on('close',()=>{if(NET.client)netLeave('The host closed the room.');});c.on('error',()=>{});}
function netClientMsg(m){if(!m||typeof m!=='object')return;
  switch(m.t){
    case 'wel':NET.myId=m.id;netRenderLobby();netPingHud();break;
    case 'err':netLeave(m.m);break;
    case 'lob':NET.lobby=(m.l||[]).map(p=>({id:p.id,name:String(p.n),team:p.tm,me:p.id===NET.myId}));NET.mode=m.m;netRenderLobby();break;
    case 'go':netClientGo(m);break;
    case 's':if(NET.started)netApplySnap(m);break;
    case 'sp':{const s=soldiers[m.i];if(s&&NET.started)netSpawnAt(s,m.p);break;}
    case 'k':{const v=soldiers[m.v],a=soldiers[m.a];if(v&&a&&v.alive){kill(v,a,WEAP[m.w]||WEAP.rifle,!!m.h,m.im||null);if(a===player&&v!==player)hitMarker(true);}break;}
    case 'sh':{const s=soldiers[m.i];if(s&&s!==player)netShotFX(s,m.e,m.w);break;}
    case 'bm':explode(up3(m.p),null,null,m.b?8.5:7.5,0,!!m.b);break;
    case 'gs':netGasState(m.i,m.s,m.u);break;
    case 'hu':player.lastHurt=G.time;addArc({x:m.x/100,z:m.z/100});AU.hurt();break;
    case 'bd':(m.k||[]).forEach((r,i)=>{const s=soldiers[i];if(s&&r){s.kills=r[0];s.deaths=r[1];s.heads=r[2];}});break;
    case 'end':G.score=netFlipSc(m.sc);G.clock=0;endMatch();netRenderLobby();break;
    case 'drop':case 'take':{const s=soldiers[m.i];if(s){s.name=m.n;s.human=m.t==='take';netRelabel(s);}if(m.t==='drop')toast(m.n.replace(' (bot)','')+' left. A bot took their place.');break;}
    case 'po':NET.ping=performance.now()-m.k;netPingHud();break;}}
function netFlipSc(sc){sc=Array.isArray(sc)?sc:[0,0];return NET.flip?[sc[1],sc[0]]:[sc[0],sc[1]];}
function netClientGo(m){const R=m.R;if(!Array.isArray(R))return;NET.roster=R;NET.myIdx=R.findIndex(e=>e.h===NET.myId);if(NET.myIdx<0)return;NET.flip=R[NET.myIdx].tm;NET.mode=m.mode;
  netMakeSoldiers(R);G.limit=m.lim;$('limit').textContent='FIRST TO '+G.limit;G.clock=m.ck;G.score=netFlipSc(m.sc);
  resetGas();(m.gas||[]).forEach((st,i)=>netGasState(i,st,0));for(const g of gList)if(g.m){g.m.visible=false;}gList.length=0;
  for(const p of fx.pickups)scene.remove(p.m);fx.pickups.length=0;$('feed').innerHTML='';$('radio').innerHTML='';
  soldiers.forEach((s,i)=>{const k=(m.k||[])[i];if(k){s.kills=k[0];s.deaths=k[1];s.heads=k[2];}const p=m.sp[i];if(p)netSpawnAt(s,p);else{s.alive=false;s.deadAt=G.time-9;if(s.model)s.model.root.visible=false;if(s===player){spawn(player);player.alive=false;P.dead=true;P.deathT=0;P.killer=null;}}});
  G.started=true;NET.started=true;P.cur=0;$('netDrawer').hidden=true;$('end').hidden=true;$('menu').hidden=true;play(false);netRenderLobby();}
function netSpawnAt(s,p){spawn(s);s.pos.set(p[0]/100,p[1]/100,p[2]/100);s.yaw=p[3]/1000;s.vel.set(0,0,0);s.nb=[];if(s.model){s.model.root.position.copy(s.pos);s.model.root.rotation.set(0,s.yaw,0);}if(s===player)setVM();}
function netGasState(i,st,u){const g=CYLS[i];if(!g||!gasBody)return;if(st===g.state)return;g.state=st;g.t=u||0;
  if(st===3){g.c.minY=g.c.maxY=-1e3;g.smokeT=7;if(g.jet){g.jet.visible=false;g.jet=null;}}else if(st===0){g.c.minY=g.y0;g.c.maxY=g.y0+.68;g.owner=null;}setGasM(g,i);}

/* ---- shared per-frame work ---- */
function netPushSample(s,a){const nb=s.nb||(s.nb=[]);nb.push({t:performance.now()/1000,x:a[0]/100,y:a[1]/100,z:a[2]/100,yaw:a[3]/1000,p:a[4]/1000,vx:a[5]/10,vz:a[6]/10,fl:a[7]|0});if(nb.length>12)nb.shift();
  if(!s.isPlayer&&NET.host){s.wid=(a[7]&8)?'shotgun':'rifle';}}
function netReplica(s,dt){const m=s.model;if(!m)return;
  if(!s.alive){if(s.rag)ragPose(s,dt);m.marker.visible=false;if(m.label)m.label.visible=false;if(G.time-s.deadAt>5)m.root.visible=false;return;}
  const nb=s.nb;let fl=0;if(nb&&nb.length){const rt=performance.now()/1000-(NET.host?.08:NET.delay);let a=nb[0],b=null;
      for(let k=nb.length-1;k>=0;k--){if(nb[k].t<=rt){a=nb[k];b=nb[k+1]||null;break;}}
      if(b){const u=clamp((rt-a.t)/Math.max(1e-3,b.t-a.t),0,1);s.pos.set(lerp(a.x,b.x,u),lerp(a.y,b.y,u),lerp(a.z,b.z,u));s.yaw=a.yaw+angDiff(a.yaw,b.yaw)*u;s.aimPitchT=lerp(a.p,b.p,u);s.vel.set(lerp(a.vx,b.vx,u),0,lerp(a.vz,b.vz,u));fl=b.fl;}
      else{const e=clamp(rt-a.t,0,.12);s.pos.set(a.x+a.vx*e,a.y,a.z+a.vz*e);s.yaw=a.yaw;s.aimPitchT=a.p;s.vel.set(a.vx,0,a.vz);fl=a.fl;}
      while(nb.length>3&&nb[1].t<rt-.5)nb.shift();}
  s.crouch=!!(fl&1);s.crouchAmt=clamp(s.crouchAmt+(s.crouch?dt*6:-dt*6),0,1);s.h=lerp(s.H0,1.25,s.crouchAmt);
  if(fl&2){if(!(s.reloadT>0)){s.reloadTotal=2;s.reloadT=2;}s.reloadT=Math.max(.05,s.reloadT-dt);}else s.reloadT=0;
  if(fl&4){if(!(s.throwT>0))s.throwT=.9;s.throwT=Math.max(.02,s.throwT-dt);}else s.throwT=0;
  s.flinch=Math.max(0,s.flinch-dt);animateSoldier(s,dt);botMarkers(s,G.time);}
function netShotFX(s,e,w){if(!s||!s.model||!s.alive)return;s.lastFired=G.time;s.kick=1;s.model.root.updateMatrixWorld(true);s.model.muzzle.getWorldPosition(_mz);spawnFlash(_mz);
  if(Array.isArray(e)){const end=up3(e);spawnTracer(_mz.clone(),end);spawnPuff(end,end.y<WATER+.05?0xe8f2f4:0xd8cbb0,.2,.5,.5);}
  lastShotT=G.time;if(player)AU.shot(w==='shotgun'?'shotgun':'rifle',s.pos.distanceTo(player.pos),false,AU.panFor(s.pos));}
function netFlags(s){if(s.isPlayer){const w=P.weap[P.cur];return (P.crouch>.5?1:0)|(P.reloading>0?2:0)|(P.gThrowT>0||P.gHold?4:0)|(w&&w.id==='shotgun'?8:0);}
  return (s.crouchAmt>.5?1:0)|(s.reloadT>0?2:0)|(s.throwT>0?4:0)|(s.wid==='shotgun'?8:0);}
function netStateArr(s){return [pk(s.pos.x),pk(s.pos.y),pk(s.pos.z),Math.round(s.yaw*1000),Math.round((s.isPlayer?s.pitch:(s.net?s.aimPitchT||0:s.aimPitch||0))*1000),Math.round(s.vel.x*10),Math.round(s.vel.z*10),netFlags(s),Math.ceil(s.hp)];}
function netHostTick(dt){for(const s of soldiers)if(s.net&&!s.alive&&G.time>=s.respawnAt)spawn(s);
  const gl=NET.gsLast||(NET.gsLast=[]);CYLS.forEach((g,i)=>{if(gl[i]!==g.state){if(gl[i]!==undefined)netBc({t:'gs',i,s:g.state,u:Math.round(g.t*100)/100});gl[i]=g.state;}});
  NET.sendT-=dt;if(NET.sendT<=0&&NET.conns.size){NET.sendT=.05;netBc({t:'s',ck:Math.round(G.clock*10),sc:G.score,s:soldiers.map(s=>s.alive?netStateArr(s):0),g:gList.map(g=>[...pk3(g.pos),g.team])});}
  NET.boardT-=dt;if(NET.boardT<=0){NET.boardT=1;netBc({t:'bd',k:soldiers.map(s=>[s.kills,s.deaths,s.heads||0])});}}
function netApplySnap(m){G.clock=(m.ck||0)/10;G.score=netFlipSc(m.sc);(m.s||[]).forEach((a,i)=>{const s=soldiers[i];if(!s||!a)return;if(s===player){if(player.alive)player.hp=a[8];return;}netPushSample(s,a);});
  const gs=m.g||[];while(NET.gm.length<gs.length){const mm=makeGrenadeMesh();scene.add(mm);NET.gm.push({m:mm,pos:new V3(),owner:null,t0:-9,team:0});}
  gList.length=0;NET.gm.forEach((g,i)=>{const a=gs[i];g.m.visible=!!a;if(a){g.pos.set(a[0]/100,a[1]/100,a[2]/100);g.m.position.copy(g.pos);g.m.rotation.x+=.3;g.m.rotation.z+=.2;g.team=(a[3]|0)^NET.flip;gList.push(g);}});}
function netClientTick(dt){NET.sendT-=dt;if(NET.sendT<=0){NET.sendT=1/30;if(player.alive){const a=netStateArr(player);a.length=8;netSend({t:'st',p:a});}}
  NET.pingT-=dt;if(NET.pingT<=0){NET.pingT=2;netSend({t:'pi',k:performance.now()});}}
function netStep(dt,pad,idle){G.time+=dt;
  if(NET.host){G.clock-=dt;if(G.clock<=0){G.clock=0;endMatch();return;}}
  if(idle)netIdlePlayer(dt);else updatePlayer(dt,pad);
  for(const s of soldiers){if(s.isPlayer)continue;if(s.net)netReplica(s,dt);else updateBot(s,dt);}
  if(NET.host){updateGrenades(dt);regen(dt);netHostTick(dt);}else netClientTick(dt);
  updateGas(dt);updateSpotting(dt);}
function netIdlePlayer(dt){const pl=player;if(!pl.alive)return;pl.vel.x=pl.vel.z=0;pl.vel.y-=24*dt;moveEntity(pl,dt);}
function netPingHud(){const el=$('netPing');el.hidden=!NET.on;if(!NET.on)return;el.textContent=NET.host?('HOSTING '+NET.code+' · '+(NET.conns.size+1)+' PLAYERS'):('ROOM '+NET.code+(NET.ping?' · PING '+Math.round(NET.ping)+' MS':''));}
function netLeave(msg){const wasStarted=NET.started;try{if(NET.hostConn)NET.hostConn.close();}catch(e){}for(const [,e] of NET.conns)try{e.c.close();}catch(err){}
  try{if(NET.peer)NET.peer.destroy();}catch(e){}
  Object.assign(NET,{on:false,host:false,client:false,started:false,peer:null,hostConn:null,lobby:[],roster:null,myIdx:0,flip:0,ping:0});NET.conns.clear();
  for(const g of NET.gm){g.m.visible=false;}gList.length=0;
  if(wasStarted||G.started){for(const s of soldiers)if(s.model)scene.remove(s.model.root);soldiers=[];G.started=false;
    if(G.state==='playing'||G.state==='paused'||G.state==='over'){G.state='menu';$('hud').hidden=true;$('touch').hidden=true;$('end').hidden=true;document.body.classList.remove('ingame');try{document.exitPointerLock();}catch(e){}
      $('deploy').textContent='DEPLOY';$('restart').hidden=true;showMenu();}}
  netRenderLobby();netPingHud();netStatus(msg||'');if(msg)toast(msg);}
(function(){const m=location.search.match(/[?&]room=([A-Za-z0-9]{4,6})/);if(m){NET.pendingRoom=m[1].toUpperCase();}})();
function netAfterBoot(){if(NET.pendingRoom){netOpenDrawer();$('netCode').value=NET.pendingRoom;netStatus('Enter your name and press JOIN to enter room '+NET.pendingRoom+'.');$('netName').focus();}}
