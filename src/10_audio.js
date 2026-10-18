/* ================= Audio ================= */
const AU={ctx:null,
  init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}try{const C=window.AudioContext||window.webkitAudioContext;const c=this.ctx=new C();
    this.duck=c.createBiquadFilter();this.duck.type='lowpass';this.duck.frequency.value=20000;this.master=c.createGain();this.master.gain.value=.7*settings.vol;
    const comp=c.createDynamicsCompressor();this.master.connect(this.duck);this.duck.connect(comp);comp.connect(c.destination);
    const len=c.sampleRate*2;const b=c.createBuffer(1,len,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.noise=b;
    const irL=c.sampleRate*1.8|0;const ir=c.createBuffer(2,irL,c.sampleRate);for(let ch=0;ch<2;ch++){const x=ir.getChannelData(ch);for(let i=0;i<irL;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/irL,3)*(i<c.sampleRate*.04?0:1);}
    this.verb=c.createConvolver();this.verb.buffer=ir;const vg=c.createGain();vg.gain.value=.4;this.verb.connect(vg);vg.connect(this.master);
    this.startAmbient();}catch(e){this.ctx=null;}},
  out(pan,wet){const c=this.ctx;const g=c.createGain();let node=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);node=p;}node.connect(this.master);if(wet>0){const w=c.createGain();w.gain.value=wet;g.connect(w);w.connect(this.verb);}return g;},
  panFor(pos){if(!player)return 0;const dx=pos.x-player.pos.x,dz=pos.z-player.pos.z;const a=angDiff(player.yaw,Math.atan2(-dx,-dz));return -Math.sin(a)*.85;},
  src(type,freq,q){const c=this.ctx;const s=c.createBufferSource();s.buffer=this.noise;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;s.connect(f);return [s,f];},
  shot(kind,dist,mine,pan=0){const c=this.ctx;if(!c)return;const t=c.currentTime;const far=clamp(dist/80,0,1);const vol=clamp(1/(1+dist/14),.03,1)*(kind==='shotgun'?1:.75)*(mine?1:.85);
    const o=this.out(pan,.25+far*.6);const [s,f]=this.src('lowpass',(kind==='shotgun'?3200:5200)*(1-far*.8));s.playbackRate.value=rand(.85,1.1);const dur=kind==='shotgun'?.42:.18;f.frequency.exponentialRampToValueAtTime(200,t+dur);
    const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur+.05);f.connect(g);g.connect(o);s.start(t,Math.random()*1.5);s.stop(t+dur+.1);
    const os=c.createOscillator();os.type='sine';os.frequency.setValueAtTime(kind==='shotgun'?110:170,t);os.frequency.exponentialRampToValueAtTime(38,t+.14);const og=c.createGain();og.gain.setValueAtTime(vol*.9,t);og.gain.exponentialRampToValueAtTime(.001,t+.18);os.connect(og);og.connect(o);os.start(t);os.stop(t+.2);},
  burst(vol,freq,dur,pan=0,type='bandpass',q=1,wet=0){const c=this.ctx;if(!c)return;const t=c.currentTime;const o=this.out(pan,wet);const [s,f]=this.src(type,freq,q);const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);f.connect(g);g.connect(o);s.start(t,Math.random()*1.5);s.stop(t+dur+.02);},
  step(dist,pan,mine,wet){const v=mine?.06:clamp(.15/(1+dist/4),0,.12);if(v<.006)return;if(wet)this.burst(v*1.6,1400,.16,pan,'bandpass',.8);else this.burst(v,mine?700:550,.07,pan,'bandpass',1.2);},
  blip(freq,dur,vol,type='square'){const c=this.ctx;if(!c)return;const t=c.currentTime;const o=c.createOscillator();o.type=type;o.frequency.value=freq;const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.02);},
  click(v=.25){this.burst(v,3500,.05,0,'highpass',.7);},
  mech(){this.burst(.22,1800,.08,0,'bandpass',2);setTimeout(()=>this.burst(.18,2600,.05,0,'bandpass',2),70);},
  pin(){this.burst(.25,4200,.06,0,'bandpass',3);setTimeout(()=>this.blip(2600,.12,.05,'triangle'),60);},
  whoosh(){this.burst(.18,900,.25,0,'bandpass',.6);},
  clink(dist,pan){const v=clamp(.3/(1+dist/5),0,.25);if(v<.01)return;this.burst(v,3000,.06,pan,'bandpass',6);this.blip(1900+rand(-200,200),.08,v*.5,'triangle');},
  hurt(){const c=this.ctx;if(!c)return;const t=c.currentTime;const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(40,t+.2);const g=c.createGain();g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.3);},
  boom(dist,pan,wet){const c=this.ctx;if(!c)return;const t=c.currentTime;const vol=clamp(1.6/(1+dist/10),.05,1.4);const o=this.out(pan,.5+clamp(dist/60,0,1)*.6);
    const [s,f]=this.src('lowpass',wet?900:2400*(1-clamp(dist/90,0,.85)));f.frequency.exponentialRampToValueAtTime(90,t+1.2);const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+1.4);f.connect(g);g.connect(o);s.start(t,Math.random());s.stop(t+1.5);
    const os=c.createOscillator();os.type='sine';os.frequency.setValueAtTime(70,t);os.frequency.exponentialRampToValueAtTime(28,t+.6);const og=c.createGain();og.gain.setValueAtTime(vol,t);og.gain.exponentialRampToValueAtTime(.001,t+.7);os.connect(og);og.connect(o);os.start(t);os.stop(t+.75);
    if(wet)this.burst(vol*.5,1500,1.0,pan,'bandpass',.5);},
  ring(k){const c=this.ctx;if(!c)return;const t=c.currentTime;this.duck.frequency.cancelScheduledValues(t);this.duck.frequency.setValueAtTime(900,t);this.duck.frequency.exponentialRampToValueAtTime(20000,t+1+k*2);
    const o=c.createOscillator();o.frequency.value=3600;const g=c.createGain();g.gain.setValueAtTime(.05*k,t);g.gain.exponentialRampToValueAtTime(.0005,t+2.5);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+2.6);},
  squelch(){this.burst(.07,1900,.07,0,'bandpass',3);},
  bell(dist,pan){const c=this.ctx;if(!c)return;const t=c.currentTime;const v=clamp(.35/(1+dist/18),.01,.3);const o=this.out(pan,.6);for(const [f,a] of [[620,1],[1240,.5],[1660,.35],[2480,.2]]){const os=c.createOscillator();os.frequency.value=f;const g=c.createGain();g.gain.setValueAtTime(v*a,t);g.gain.exponentialRampToValueAtTime(.0005,t+3.2);os.connect(g);g.connect(o);os.start(t);os.stop(t+3.3);}},
  chirp(pan,v){const c=this.ctx;if(!c)return;const t=c.currentTime;const o=this.out(pan,.2);for(let k=0;k<3;k++){const os=c.createOscillator();os.type='sine';const t0=t+k*.09;os.frequency.setValueAtTime(rand(3000,4200),t0);os.frequency.exponentialRampToValueAtTime(rand(1800,2600),t0+.06);const g=c.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.01);g.gain.exponentialRampToValueAtTime(.0005,t0+.07);os.connect(g);g.connect(o);os.start(t0);os.stop(t0+.08);}},
  startAmbient(){const c=this.ctx;const mk=(type,freq,q)=>{const s=c.createBufferSource();s.buffer=this.noise;s.loop=true;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(this.master);s.start();return g;};
    this.windG=mk('lowpass',380,.7);this.riverG=mk('bandpass',900,.5);this.nextBell=8;this.nextChirp=3;},
  ambient(dt){const c=this.ctx;if(!c||!this.windG)return;const t=c.currentTime;const p=player&&player.alive?player.pos:camera.position;
    this.windG.gain.setTargetAtTime(.045+Math.max(0,(p.y-6)/20)*.04,t,.5);this.riverG.gain.setTargetAtTime(.11*smooth(18,0,GHAT_END-p.z),t,.4);
    this.nextBell-=dt;if(this.nextBell<0){this.nextBell=rand(25,45);const tp=new V3(0,8,20.5);this.bell(tp.distanceTo(p),this.panFor(tp));}
    this.nextChirp-=dt;if(this.nextChirp<0){this.nextChirp=rand(2,6);if(G.time-lastShotT>6)this.chirp(rand(-.8,.8),rand(.01,.03));}}};
let lastShotT=-99;

/* ================= Voice callouts ================= */
const VOX={q:0,voices:[]};
function loadVoices(){try{VOX.voices=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));}catch(e){}}
try{loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}
function say(text,b){if(!settings.voice||!window.speechSynthesis||G.state!=='playing')return;try{if(VOX.q>1)return;const u=new SpeechSynthesisUtterance(text);u.pitch=b.vPitch;u.rate=b.vRate;u.volume=.8;
    if(VOX.voices.length)u.voice=VOX.voices[b.vIdx%VOX.voices.length];VOX.q++;u.onend=u.onerror=()=>{VOX.q=Math.max(0,VOX.q-1);};speechSynthesis.speak(u);}catch(e){}}
const CALL={contact:['Contact, {z}!','Enemy spotted, {z}!','Tango at {z}!'],reload:['Reloading!','Changing mags!','Cover me, reloading!'],frag:['Frag out!','Throwing frag!'],grenade:['Grenade!','Grenade, move!'],
  down:['Man down!','We lost {n}!'],kill:['Enemy down.','Got him.','Tango down.'],moving:['Moving up.','Pushing forward.','Flanking.'],hurt:['Taking fire!','I am hit, need help!']};
let lastCallT=-9;
function callout(b,type,ctx={}){if(b.isPlayer||!b.alive||b.team!==0)return;const now=G.time;if(now-(b.lastCall||-9)<5||now-lastCallT<1.6)return;
  if(type!=='grenade'&&type!=='frag'&&player&&b.pos.distanceTo(player.pos)>70&&Math.random()<.6)return;
  b.lastCall=now;lastCallT=now;const txt=rpick(CALL[type]).replace('{z}',ctx.z||'ahead').replace('{n}',ctx.n||'one');
  const box=$('radio');const d=document.createElement('div');d.className='rl';d.innerHTML=`<span>${b.name.toUpperCase()}</span>`;d.appendChild(document.createTextNode(txt));box.appendChild(d);while(box.children.length>3)box.firstChild.remove();
  setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),700);},4200);AU.squelch();say(txt,b);}
