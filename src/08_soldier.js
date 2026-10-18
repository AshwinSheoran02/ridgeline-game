/* ================= Soldier atlas ================= */
function camoCanvas(base,cols,n=46,sz=[8,24]){return canv(256,256,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<n;i++){const x=Math.random()*w,y=Math.random()*h;const c=cols[i%cols.length];
    for(const ox of [-w,0,w])for(const oy of [-h,0,h]){g.fillStyle=c;g.beginPath();g.moveTo(x+ox,y+oy);for(let k=0;k<7;k++){const a=k/7*TAU,r=rand(sz[0],sz[1]);g.lineTo(x+ox+Math.cos(a)*r,y+oy+Math.sin(a)*r*.7);}g.closePath();g.fill();}}
  weave(g,w,h,.07);speck(g,w,h,1500,['rgba(0,0,0,.5)','rgba(255,255,255,.4)'],.1,.25,1,2);});}
const CAMO_A=camoCanvas('#6a7244',['#3f4a2a','#8a7650','#2c3020','#8c9460']),CAMO_B=camoCanvas('#4f5257',['#2a2c30','#76797f','#383b40','#1d1e22']);
T.camoA={c:toTex(CAMO_A,true),n:toTex(nmap(CAMO_A,2.2),false),cv:CAMO_A};
M.tentA.map=T.camoA.c;M.tentA.color.set(0xd8d8c8);
const ATL=1024;
const REG={camo:[0,0,512,512],vest:[512,0,256,256],web:[768,0,256,256],boot:[512,256,128,128],sole:[640,256,128,128],glove:[768,256,128,128],skin:[896,256,128,128],knit:[512,384,128,128],helm:[640,384,128,128],scarf:[768,384,128,128],lens:[896,384,128,128],
  metal:[0,512,256,256],poly:[256,512,256,256],wood:[512,512,256,256],band:[768,512,128,128],hair:[896,512,128,128],buckle:[768,640,128,128],radio:[896,640,128,128],pants:[0,768,256,256],olive:[256,768,128,128]};
const RMV={camo:[.92,0],vest:[.85,0],web:[.9,0],boot:[.55,0],sole:[.95,0],glove:[.72,0],skin:[.5,0],knit:[.97,0],helm:[.75,0],scarf:[.95,0],lens:[.05,.7],metal:[.32,.85],poly:[.55,.05],wood:[.45,0],band:[.7,0],hair:[.9,0],buckle:[.3,.9],radio:[.6,.1],pants:[.92,0],olive:[.5,.2]};
function buildAtlas(team){const A=team===0;
  const c=canv(ATL,ATL,(g)=>{g.fillStyle='#777';g.fillRect(0,0,ATL,ATL);
    const put=(k,draw)=>{const [x,y,w,h]=REG[k];g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.translate(x,y);draw(g,w,h);g.restore();};
    const camo=A?CAMO_A:CAMO_B;
    put('camo',(g,w,h)=>{g.drawImage(camo,0,0,w,h);});
    put('pants',(g,w,h)=>{g.drawImage(camo,0,0,w,h);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,0,w,h);});
    const molle=(base,band)=>(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);weave(g,w,h,.09);for(let y=12;y<h;y+=26){g.fillStyle=band;g.fillRect(0,y,w,8);g.fillStyle='rgba(0,0,0,.4)';for(let x=6;x<w;x+=20)g.fillRect(x,y,3,8);}
      g.strokeStyle='rgba(0,0,0,.35)';g.setLineDash([4,3]);g.strokeRect(6,6,w-12,h-12);g.setLineDash([]);speck(g,w,h,900,['rgba(0,0,0,.4)','rgba(255,255,255,.25)'],.1,.3,1,2);};
    put('vest',molle(A?'#5f6741':'#2a2c2f',A?'#4c5333':'#1e1f21'));put('web',molle(A?'#545b39':'#232426',A?'#454b2e':'#18191a'));
    put('boot',(g,w,h)=>{g.fillStyle=A?'#6e5438':'#1f1d1b';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.4)';for(let i=0;i<8;i++){g.beginPath();g.moveTo(0,rand(0,h));g.lineTo(w,rand(0,h));g.stroke();}g.fillStyle='#2a2420';for(let y=10;y<h;y+=14)g.fillRect(w*.42,y,w*.16,4);});
    put('sole',(g,w,h)=>{g.fillStyle='#1a1918';g.fillRect(0,0,w,h);g.fillStyle='#2c2a28';for(let y=4;y<h;y+=12)for(let x=(y/12%2)*8;x<w;x+=16)g.fillRect(x,y,8,6);});
    put('glove',(g,w,h)=>{g.fillStyle=A?'#8a7350':'#232323';g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.3)';for(let x=10;x<w;x+=22)g.fillRect(x,0,2,h);speck(g,w,h,400,['rgba(0,0,0,.3)','rgba(255,255,255,.2)'],.2,.4,1,2);});
    put('skin',(g,w,h)=>{g.fillStyle='#a8775a';g.fillRect(0,0,w,h);for(let i=0;i<10;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(10,30),'#986a4f',.3);});
    put('knit',(g,w,h)=>{g.fillStyle='#1e1f22';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=4){g.fillStyle=x%8?'#26272b':'#17181a';g.fillRect(x,0,2,h);}});
    put('helm',(g,w,h)=>{if(A)g.drawImage(camo,0,0,w*2,h*2);else{g.fillStyle='#3a3c40';g.fillRect(0,0,w,h);}weave(g,w,h,.1);});
    put('scarf',(g,w,h)=>{g.fillStyle=A?'#cbbd9c':'#2c2d30';g.fillRect(0,0,w,h);g.strokeStyle=A?'#6e5a3c':'#46484e';g.lineWidth=2;for(let i=0;i<w;i+=9){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}weave(g,w,h,.1);});
    put('lens',(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3a4a5c');gr.addColorStop(.5,'#0c0f14');gr.addColorStop(1,'#1c2430');g.fillStyle=gr;g.fillRect(0,0,w,h);});
    put('metal',(g,w,h)=>{g.drawImage(T.gunMetalCv,0,0,w,h);});
    put('poly',(g,w,h)=>{g.fillStyle='#232426';g.fillRect(0,0,w,h);speck(g,w,h,4000,['#2e3033','#18191b','#3a3c40'],.4,.8,1,2);});
    put('wood',(g,w,h)=>{g.fillStyle='#6b4024';g.fillRect(0,0,w,h);g.strokeStyle='rgba(30,15,5,.45)';for(let i=0;i<22;i++){g.beginPath();g.moveTo(0,rand(0,h));g.bezierCurveTo(w*.3,rand(0,h),w*.6,rand(0,h),w,rand(0,h));g.stroke();}});
    put('band',(g,w,h)=>{g.fillStyle=A?'#7fd84a':'#ea3b2a';g.fillRect(0,0,w,h);});
    put('hair',(g,w,h)=>{g.fillStyle='#1b1612';g.fillRect(0,0,w,h);g.strokeStyle='#2c241c';for(let i=0;i<300;i++){const x=rand(0,w),y=rand(0,h);g.beginPath();g.moveTo(x,y);g.lineTo(x+rand(-2,2),y+rand(3,7));g.stroke();}});
    put('buckle',(g,w,h)=>{g.fillStyle='#7a7a78';g.fillRect(0,0,w,h);});
    put('radio',(g,w,h)=>{g.fillStyle=A?'#3c4232':'#222';g.fillRect(0,0,w,h);g.fillStyle='#111';g.fillRect(20,20,w-40,40);g.fillStyle='#4a4';g.fillRect(28,28,20,10);});
    put('olive',(g,w,h)=>{g.fillStyle='#4f5a34';g.fillRect(0,0,w,h);speck(g,w,h,600,['#3a4426','#69744a'],.3,.6,1,2);});
  });
  const rmC=canv(ATL,ATL,g=>{for(const k in REG){const [x,y,w,h]=REG[k];const [r,m]=RMV[k];g.fillStyle=`rgb(0,${r*255|0},${m*255|0})`;g.fillRect(x,y,w,h);}});
  const hC=canv(ATL,ATL,g=>{g.drawImage(c,0,0);g.fillStyle='#808080';for(const k of ['skin','lens','buckle','band']){const [x,y,w,h]=REG[k];g.fillRect(x,y,w,h);}});
  const m=new THREE.MeshStandardMaterial({map:toTex(c,true),normalMap:toTex(nmap(hC,2.5),false),roughnessMap:toTex(rmC,false),metalnessMap:toTex(rmC,false),roughness:1,metalness:1});
  m.normalScale=new THREE.Vector2(.8,.8);return m;}
T.gunMetalCv=canv(256,256,(g,w,h)=>{g.fillStyle='#1e1f21';g.fillRect(0,0,w,h);speck(g,w,h,6000,['#2a2b2e','#141516','#333538'],.4,.8,1,1.5);
  g.strokeStyle='rgba(150,150,150,.25)';for(let i=0;i<30;i++){const x=rand(0,w),y=rand(0,h);g.beginPath();g.moveTo(x,y);g.lineTo(x+rand(-20,20),y+rand(-4,4));g.stroke();}});
let MAT_A=null,MAT_B=null;

/* ================= Soldier geometry kit ================= */
const GC=new Map();
function gcache(key,fn){let g=GC.get(key);if(!g){g=fn();if(g.index)g=g.toNonIndexed();if(!g.attributes.normal)g.computeVertexNormals();GC.set(key,g);}return g;}
function latheG(key,pts,seg=12){return gcache('L'+key,()=>new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg));}
function rboxG(w,h,d,r){return gcache(`rb${w}|${h}|${d}|${r}`,()=>{r=Math.min(r,w/2-.002,h/2-.002,d/2-.002);const s=new THREE.Shape();const hw=w/2-r,hh=h/2-r;s.moveTo(-hw,-hh);s.lineTo(hw,-hh);s.lineTo(hw,hh);s.lineTo(-hw,hh);s.lineTo(-hw,-hh);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,curveSegments:2});g.translate(0,0,-(d-2*r)/2);
  const uv=g.attributes.uv;let a=1e9,b=-1e9,c=1e9,e=-1e9;for(let i=0;i<uv.count;i++){a=Math.min(a,uv.getX(i));b=Math.max(b,uv.getX(i));c=Math.min(c,uv.getY(i));e=Math.max(e,uv.getY(i));}
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)-a)/(b-a||1),(uv.getY(i)-c)/(e-c||1));return g;});}
const _km=new THREE.Matrix4(),_ke=new THREE.Euler(),_kq=new THREE.Quaternion(),_kp=new V3(),_ks=new V3();
function kAdd(K,bone,geo,reg,p=[0,0,0],r=[0,0,0],s=[1,1,1]){(K[bone]||(K[bone]=[])).push({geo,reg,m:new THREE.Matrix4().compose(_kp.set(p[0],p[1],p[2]),_kq.setFromEuler(_ke.set(r[0],r[1],r[2],'XYZ')),_ks.set(s[0],s[1],s[2]))});}
function kMerge(list){let n=0;for(const it of list)n+=it.geo.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;const nm=new THREE.Matrix3(),v=new V3();
  for(const it of list){const g=it.geo,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;nm.getNormalMatrix(it.m);const [rx,ry,rw,rh]=REG[it.reg];const ux=(rx+5)/ATL,uw=(rw-10)/ATL,vy=(ry+5)/ATL,vh=(rh-10)/ATL;
    for(let k=0;k<P.count;k++){const j=o+k;v.fromBufferAttribute(P,k).applyMatrix4(it.m);pos[j*3]=v.x;pos[j*3+1]=v.y;pos[j*3+2]=v.z;v.fromBufferAttribute(N,k).applyMatrix3(nm).normalize();nor[j*3]=v.x;nor[j*3+1]=v.y;nor[j*3+2]=v.z;
      const u=U?clamp(U.getX(k),0,1):.5,w=U?clamp(U.getY(k),0,1):.5;uv[j*2]=ux+u*uw;uv[j*2+1]=1-(vy+(1-w)*vh);}o+=P.count;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.computeBoundingSphere();return g;}
const SPH=(k,r,a,b,c,d)=>gcache(k,()=>new THREE.SphereGeometry(r,a,b,0,TAU,c||0,d||Math.PI));
const CYL=(k,r1,r2,h,s)=>gcache(k,()=>new THREE.CylinderGeometry(r1,r2,h,s));
const GRIPS={rifle:{R:new V3(0,-.075,.06),L:new V3(0,-.045,-.27),muz:new V3(0,0,-.66)},shotgun:{R:new V3(0,-.07,.08),L:new V3(0,-.04,-.3),muz:new V3(0,.015,-.72)}};
function gunKit(A,wid){if(wid==='rifle'){A('gun',rboxG(.05,.07,.3,.01),'metal');A('gun',rboxG(.058,.06,.3,.015),'poly',[0,.003,-.3]);A('gun',CYL('gb',.011,.011,.16,8),'metal',[0,0,-.53],[Math.PI/2,0,0]);
    A('gun',CYL('gm',.016,.016,.05,8),'metal',[0,0,-.63],[Math.PI/2,0,0]);A('gun',rboxG(.03,.075,.07,.008),'poly',[0,-.075,-.08],[.12,0,0]);A('gun',rboxG(.03,.07,.068,.008),'poly',[0,-.14,-.065],[.32,0,0]);
    A('gun',rboxG(.032,.1,.045,.008),'poly',[0,-.075,.06],[-.35,0,0]);A('gun',rboxG(.045,.075,.2,.012),'poly',[0,-.015,.26]);A('gun',rboxG(.047,.09,.025,.008),'sole',[0,-.02,.37]);
    A('gun',CYL('go',.022,.022,.09,12),'metal',[0,.07,-.05],[Math.PI/2,0,0]);A('gun',rboxG(.024,.012,.5,.004),'metal',[0,.041,-.15]);A('gun',rboxG(.025,.03,.04,.006),'metal',[0,.05,-.05]);}
  else{A('gun',rboxG(.054,.075,.28,.01),'metal');A('gun',CYL('sb',.014,.014,.55,10),'metal',[0,.015,-.42],[Math.PI/2,0,0]);A('gun',CYL('st',.012,.012,.42,8),'metal',[0,-.022,-.37],[Math.PI/2,0,0]);
    A('gun',rboxG(.058,.055,.17,.015),'wood',[0,-.024,-.34]);A('gun',rboxG(.046,.09,.27,.015),'wood',[0,-.035,.25],[-.08,0,0]);A('gun',rboxG(.036,.1,.045,.01),'wood',[0,-.07,.075],[-.4,0,0]);}}
function buildSoldierModel(team,wid,name){const K={};const A=(bone,geo,reg,p,r,s)=>kAdd(K,bone,geo,reg,p,r,s);const alpha=team===0;
  const v={hg:alpha?(Math.random()<.6?'helm':Math.random()<.6?'cap':'boonie'):(Math.random()<.8?'helm':'beanie'),scarf:alpha?Math.random()<.5:true,beard:alpha&&Math.random()<.45,pack:Math.random()<.45,rolled:alpha&&Math.random()<.3,rig:Math.random()<.6};
  A('hips',latheG('pelvis',[[0,-.13],[.12,-.12],[.15,-.07],[.16,0],[.155,.07],[.145,.13]],14),'pants',[0,0,0],[0,0,0],[1,1,.72]);
  A('hips',latheG('belt',[[.158,.06],[.166,.07],[.166,.11],[.158,.12]],16),'web',[0,0,0],[0,0,0],[1,1,.76]);A('hips',rboxG(.05,.04,.03,.01),'buckle',[0,.09,-.122]);
  A('hips',rboxG(.08,.09,.05,.015),'web',[.13,.06,-.07],[0,-.6,0]);A('hips',rboxG(.08,.09,.05,.015),'web',[-.13,.06,-.07],[0,.6,0]);A('hips',rboxG(.12,.08,.06,.02),'web',[0,.05,.12]);
  A('chest',latheG('torso',[[0,-.01],[.135,0],[.145,.06],[.15,.14],[.163,.24],[.178,.33],[.183,.40],[.168,.455],[.12,.49],[.06,.51],[0,.515]],16),'camo',[0,0,0],[0,0,0],[1,1,.64]);
  A('chest',rboxG(.31,.3,.06,.02),'vest',[0,.3,-.108]);A('chest',rboxG(.31,.3,.06,.02),'vest',[0,.3,.108]);A('chest',rboxG(.06,.17,.19,.015),'vest',[.165,.25,0]);A('chest',rboxG(.06,.17,.19,.015),'vest',[-.165,.25,0]);
  A('chest',rboxG(.055,.025,.23,.01),'web',[.1,.455,0],[0,0,-.25]);A('chest',rboxG(.055,.025,.23,.01),'web',[-.1,.455,0],[0,0,.25]);
  for(const px of [-.085,0,.085]){A('chest',rboxG(.075,.12,.05,.015),'web',[px,.23,-.155]);A('chest',rboxG(.05,.03,.035,.008),'poly',[px,.3,-.15]);}
  A('chest',rboxG(.15,.07,.035,.012),'web',[0,.37,-.152]);A('chest',rboxG(.06,.13,.05,.012),'radio',[-.19,.33,.05]);A('chest',CYL('ant',.005,.006,.5,5),'poly',[-.2,.62,.07],[.06,0,-.08]);
  if(v.pack){A('chest',rboxG(.3,.38,.15,.04),alpha?'olive':'web',[0,.27,.2]);A('chest',CYL('roll',.06,.06,.3,10),'vest',[0,.5,.2],[0,0,Math.PI/2]);}else A('chest',rboxG(.22,.3,.06,.025),'web',[0,.3,.165]);
  A('chest',latheG('collar',[[.07,.47],[.1,.48],[.095,.52],[.07,.53]],12),alpha?'scarf':'knit');
  const hr=alpha?'skin':'knit';
  A('head',CYL('neck',.052,.058,.12,12),alpha?(v.scarf?'scarf':'skin'):'knit',[0,.05,0]);A('head',SPH('skull',.1,16,12),hr,[0,.16,0],[0,0,0],[.98,1.17,1.08]);A('head',SPH('jaw',.072,12,10),hr,[0,.095,-.035],[0,0,0],[1,.85,1]);
  if(alpha){A('head',gcache('nose',()=>new THREE.ConeGeometry(.018,.05,8)),'skin',[0,.15,-.112],[-Math.PI/2+.25,0,0]);for(const ex of [-1,1])A('head',SPH('ear',.026,8,6),'skin',[ex*.098,.155,.005],[0,0,0],[.45,1,.75]);
    if(v.beard&&!v.scarf)A('head',SPH('beard',.078,12,8,Math.PI*.45,Math.PI*.55),'hair',[0,.12,-.02],[0,0,0],[1.04,1.05,1.14]);
    if(v.scarf)A('head',latheG('mask',[[.085,.055],[.103,.075],[.108,.11],[.104,.14],[.09,.15]],16),'scarf',[0,0,-.012],[0,0,0],[1,1,1.12]);}
  A('head',rboxG(.17,.045,.035,.012),'lens',[0,.182,-.098]);A('head',latheG('strap',[[.106,.17],[.109,.175],[.109,.19],[.106,.195]],16),'web',[0,0,0],[0,0,0],[1,1,1.08]);
  if(v.hg==='helm'){A('head',SPH('helm',.132,18,12,0,Math.PI*.55),'helm',[0,.205,.004],[0,0,0],[1,.92,1.1]);A('head',latheG('hrim',[[.128,0],[.137,.005],[.138,.02],[.128,.03]],18),'helm',[0,.19,.004],[0,0,0],[1,1,1.1]);
    A('head',rboxG(.055,.035,.03,.008),'metal',[0,.27,-.135]);for(const ex of [-1,1])A('head',rboxG(.018,.03,.13,.006),'metal',[ex*.13,.23,0]);A('head',gcache('chin',()=>new THREE.TorusGeometry(.105,.006,6,20,Math.PI)),'web',[0,.17,-.01],[0,Math.PI/2,Math.PI]);}
  else if(v.hg==='cap'){A('head',CYL('cap',.104,.112,.08,16),'helm',[0,.245,0],[0,0,0],[1,1,1.08]);A('head',rboxG(.15,.012,.09,.005),'helm',[0,.21,-.14],[-.12,0,0]);}
  else if(v.hg==='boonie'){A('head',CYL('bcr',.1,.112,.1,16),'helm',[0,.25,0],[0,0,0],[1,1,1.08]);A('head',CYL('bbr',.19,.19,.012,20),'helm',[0,.205,0],[.05,0,0]);}
  else A('head',SPH('bean',.112,16,10,0,Math.PI*.55),'knit',[0,.18,0],[0,0,0],[1,1.05,1.08]);
  for(const [i,sx] of [[0,-1],[1,1]]){const sh='sh'+i,el='el'+i;
    A(sh,latheG('uarm',[[0,-.31],[.045,-.3],[.05,-.25],[.057,-.17],[.061,-.09],[.064,-.03],[.058,.02],[.035,.05],[0,.06]],12),'camo');A(sh,rboxG(.11,.06,.13,.02),'vest',[0,.005,0]);
    if(i===0)A(sh,latheG('band',[[.064,-.12],[.068,-.115],[.068,-.075],[.064,-.07]],12),'band');
    A(el,latheG('farm',[[0,-.27],[.036,-.26],[.04,-.2],[.049,-.11],[.052,-.04],[.048,.01],[.03,.03],[0,.035]],12),v.rolled?'skin':'camo');if(v.rolled)A(el,latheG('cuff',[[.05,-.03],[.058,-.025],[.058,.02],[.05,.03]],12),'camo');
    A(el,rboxG(.075,.085,.04,.016),'glove',[0,-.305,0]);for(let f=0;f<4;f++)A(el,gcache('fing',()=>new THREE.CapsuleGeometry(.0105,.04,3,6)),'glove',[-.027+f*.018,-.355,-.016],[.9,0,0]);
    A(el,gcache('thumb',()=>new THREE.CapsuleGeometry(.012,.035,3,6)),'glove',[sx*-.035,-.3,-.022],[.5,0,sx*.5]);}
  for(const [i,sx] of [[0,-1],[1,1]]){const hp='hp'+i,kn='kn'+i;
    A(hp,latheG('thigh',[[0,-.45],[.062,-.44],[.068,-.39],[.08,-.27],[.09,-.14],[.094,-.05],[.088,.02],[.05,.055],[0,.06]],12),'pants');A(hp,rboxG(.035,.13,.11,.012),'pants',[sx*.088,-.24,0]);
    if(i===1&&v.rig){A(hp,rboxG(.05,.16,.07,.015),'web',[.09,-.13,0]);A(hp,rboxG(.035,.11,.05,.01),'poly',[.1,-.12,-.01]);}
    A(kn,latheG('shin',[[0,-.43],[.046,-.42],[.05,-.36],[.06,-.26],[.066,-.17],[.061,-.07],[.058,0],[.03,.03],[0,.035]],12),'pants');A(kn,rboxG(.1,.11,.045,.02),'web',[0,-.04,-.062]);
    A(kn,rboxG(.11,.14,.13,.03),'boot',[0,-.385,0]);A(kn,rboxG(.105,.085,.2,.035),'boot',[0,-.43,-.07]);A(kn,rboxG(.115,.03,.285,.012),'sole',[0,-.475,-.045]);}
  gunKit(A,wid);
  const mat=team?MAT_B:MAT_A;const root=new THREE.Group();root.rotation.order='YXZ';
  const hips=new THREE.Group();hips.position.set(0,.99,0);root.add(hips);const chest=new THREE.Group();chest.position.set(0,.1,0);hips.add(chest);const head=new THREE.Group();head.position.set(0,.52,0);chest.add(head);
  const arms=[],legs=[];for(const [i,sx] of [[0,-1],[1,1]]){const sh=new THREE.Group();sh.position.set(sx*.2,.42,0);chest.add(sh);const el=new THREE.Group();el.position.set(0,-.3,0);sh.add(el);arms.push({sh,el});}
  for(const [i,sx] of [[0,-1],[1,1]]){const hp=new THREE.Group();hp.position.set(sx*.1,-.05,0);hips.add(hp);const kn=new THREE.Group();kn.position.set(0,-.45,0);hp.add(kn);legs.push({hp,kn});}
  const gun=new THREE.Group();gun.position.set(.1,.31,-.15);chest.add(gun);
  const B={hips,chest,head,sh0:arms[0].sh,el0:arms[0].el,sh1:arms[1].sh,el1:arms[1].el,hp0:legs[0].hp,kn0:legs[0].kn,hp1:legs[1].hp,kn1:legs[1].kn,gun};
  for(const k in K){const mesh=new THREE.Mesh(kMerge(K[k]),mat);mesh.castShadow=true;mesh.receiveShadow=true;B[k].add(mesh);}
  const muzzle=new THREE.Object3D();muzzle.position.copy(GRIPS[wid].muz);gun.add(muzzle);
  const gren=makeGrenadeMesh();gren.position.set(0,-.33,-.03);gren.visible=false;arms[1].el.add(gren);
  const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:team===0?markTexA:markTexB,depthTest:false,transparent:true,fog:false,sizeAttenuation:false}));marker.scale.set(.022,.0165,1);marker.position.y=2.15;marker.renderOrder=10;marker.visible=false;root.add(marker);
  let label=null;if(team===0){label=new THREE.Sprite(new THREE.SpriteMaterial({map:nameTex(name),depthTest:false,transparent:true,fog:false,sizeAttenuation:false,opacity:.9}));label.scale.set(.085,.016,1);label.position.y=2.15;label.center.set(.5,-.7);label.renderOrder=10;root.add(label);}
  const bind=[];for(const k of ['sh0','el0','sh1','el1','hp0','kn0','hp1','kn1','gun']){const o=B[k];bind.push([o,o.parent,o.position.clone(),o.quaternion.clone()]);}
  root.visible=false;scene.add(root);return {root,hips,chest,head,arms,legs,gun,muzzle,marker,label,bind,grips:GRIPS[wid],gren};}
function markerTex(col,edge){return tex(64,48,(g)=>{g.fillStyle=col;g.strokeStyle=edge;g.lineWidth=5;g.beginPath();g.moveTo(8,6);g.lineTo(56,6);g.lineTo(32,42);g.closePath();g.stroke();g.fill();},{nomip:true});}
const markTexA=markerTex('#9bd36f','#14200c'),markTexB=markerTex('#ff4a36','#2a0804');
function nameTex(name){return tex(256,48,(g,w,h)=>{g.font='600 30px "Barlow Semi Condensed", Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=5;g.strokeStyle='rgba(10,14,8,.85)';g.strokeText(name.toUpperCase(),w/2,h/2);g.fillStyle='#bfe59a';g.fillText(name.toUpperCase(),w/2,h/2);},{nomip:true});}
const GSPH=new THREE.SphereGeometry(.045,10,8),GTOP=new THREE.CylinderGeometry(.016,.018,.035,8),GLEV=new THREE.BoxGeometry(.012,.07,.02);
const grenMat=std({color:0x4f5a34,roughness:.55,metalness:.2}),grenMetal=std({color:0x777,roughness:.35,metalness:.8});
function makeGrenadeMesh(){const g=new THREE.Group();const b=new THREE.Mesh(GSPH,grenMat);b.scale.set(1,1.3,1);g.add(b);const t=new THREE.Mesh(GTOP,grenMetal);t.position.y=.068;g.add(t);const l=new THREE.Mesh(GLEV,grenMetal);l.position.set(.035,.04,0);l.rotation.z=-.25;g.add(l);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}

/* ================= IK & animation ================= */
const _ikV=new V3(),_ikP=new V3(),_ikE=new V3(),_ikT=new V3(),_ikD=new V3(),_ikQ=new THREE.Quaternion(),_ikQi=new THREE.Quaternion(),_down=new V3(0,-1,0),_S=new V3();
function ikArm(sh,el,S,Tt,side){const L1=.3,L2=.31;_ikV.copy(Tt).sub(S);const d=clamp(_ikV.length(),.1,L1+L2-.005);_ikV.normalize();
  const a=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));_ikP.set(side*.9,-1,.15).normalize();_ikP.addScaledVector(_ikV,-_ikP.dot(_ikV)).normalize();
  _ikE.copy(S).addScaledVector(_ikV,Math.cos(a)*L1).addScaledVector(_ikP,Math.sin(a)*L1);
  _ikD.copy(_ikE).sub(S).normalize();sh.quaternion.setFromUnitVectors(_down,_ikD);
  _ikD.copy(Tt).sub(_ikE).normalize().applyQuaternion(_ikQi.copy(sh.quaternion).invert());el.quaternion.setFromUnitVectors(_down,_ikD);}
const _gR=new V3(),_gL=new V3();
function animateSoldier(b,dt){const m=b.model;const now=G.time;
  const cy=Math.cos(b.yaw),sy=Math.sin(b.yaw);const vx=b.vel.x,vz=b.vel.z;const spd=Math.hypot(vx,vz);
  const fwd=(vx*-sy+vz*-cy),side=(vx*cy-vz*sy);const dF=spd>.2?fwd/spd:1,dS=spd>.2?side/spd:0;
  const run=clamp((spd-3.4)/1.8,0,1);const ca=b.crouchAmt;const amt=clamp(spd/2.2,0,1);
  const pPrev=b.phase;b.phase+=spd*dt*TAU/(1.55+run*.45-ca*.45);
  if(player&&Math.floor(b.phase/Math.PI)!==Math.floor(pPrev/Math.PI)&&spd>2.2&&ca<.5){const d=b.pos.distanceTo(player.pos);if(d<28)AU.step(d,AU.panFor(b.pos),false,b.pos.y<WATER-.1);}
  const A=(.46+run*.32)*(1-ca*.4)*amt,Bk=(1.0+run*.75)*amt;
  for(let i=0;i<2;i++){const ph=b.phase+i*Math.PI;const s=Math.sin(ph),c=Math.cos(ph);const L=m.legs[i];
    L.hp.rotation.set(A*s*dF+ca*1.28,0,A*.7*s*dS+(i?.05:-.05)*ca);L.kn.rotation.set(-(Bk*Math.pow(Math.max(0,c),1.5)+.06*amt)-ca*2.15,0,0);}
  m.hips.position.y=lerp(.99,.52,ca)-Math.abs(Math.sin(b.phase))*.04*amt*(1-ca);m.hips.rotation.set(0,Math.sin(b.phase)*.1*amt*dF,0);
  let pitch=0;if(b.visible&&b.target){const t=b.target;pitch=Math.atan2((t.pos.y+t.h*.7)-(b.pos.y+b.h-.3),Math.hypot(t.pos.x-b.pos.x,t.pos.z-b.pos.z));}
  b.aimPitch=lerp(b.aimPitch||0,clamp(pitch,-.7,.7),Math.min(1,dt*8));b.kick=Math.max(0,(b.kick||0)-dt*8);
  const lean=-(run*.22+ca*.12);m.chest.rotation.set(b.aimPitch+lean+b.kick*.04,-m.hips.rotation.y,b.flinch>0?Math.sin(b.flinch*60)*.12:0);
  m.head.rotation.set(-b.aimPitch*.2-lean*.5,(b.visible?0:Math.sin(now*.6+b.noise)*.35),0);
  const g=m.gun;const sprint=run>.5&&!b.visible;const rl=b.reloadT>0?1-b.reloadT/b.reloadTotal:-1;const th=b.throwT>0?1-b.throwT/.9:-1;
  g.position.set(.1,.31,-.15+b.kick*.04);g.rotation.set(0,0,0);
  if(sprint){g.position.set(.06,.2,-.17);g.rotation.set(-.55,.55,.55);}
  if(rl>=0){const k=Math.sin(Math.min(1,rl)*Math.PI);g.rotation.z+=.45*k;g.position.y-=.05*k;g.rotation.x-=.15*k;}
  if(th>=0){const k=Math.sin(Math.min(1,th)*Math.PI);g.rotation.x-=.6*k;g.position.y-=.06*k;g.position.x-=.04*k;}
  g.updateMatrix();_gR.copy(m.grips.R).applyMatrix4(g.matrix);_gL.copy(m.grips.L).applyMatrix4(g.matrix);
  if(rl>=0){const P1=_ikT.set(.0,.18,-.2);const P2=_ikV.set(-.09,.22,-.17);let tgt;if(rl<.2)tgt=_gL.clone().lerp(P1,rl/.2);else if(rl<.45)tgt=P1.clone().lerp(P2,(rl-.2)/.25);else if(rl<.7)tgt=P2.clone().lerp(P1,(rl-.45)/.25);else tgt=P1.clone().lerp(_gL,(rl-.7)/.3);_gL.copy(tgt);}
  m.gren.visible=th>=0&&th<.5;
  if(th>=0){const P0=_gR.clone(),P1=new V3(.24,.72,.18),P2=new V3(.14,.62,-.42);let tgt;if(th<.45)tgt=P0.lerp(P1,th/.45);else if(th<.6)tgt=P1.clone().lerp(P2,(th-.45)/.15);else tgt=P2.clone().lerp(_gR,(th-.6)/.4);_gR.copy(tgt);}
  ikArm(m.arms[1].sh,m.arms[1].el,_S.set(.2,.42,0),_gR,1);ikArm(m.arms[0].sh,m.arms[0].el,_S.set(-.2,.42,0),_gL,-1);
  m.root.position.copy(b.pos);m.root.rotation.set(0,b.yaw,0);}

/* ================= Ragdoll ================= */
const RJ=['pelvis','neck','head','shL','elL','haL','shR','elR','haR','hiL','knL','ftL','hiR','knR','ftR','gA','gB'];const RI={};RJ.forEach((n,i)=>RI[n]=i);
const RST=[['pelvis','neck'],['neck','head'],['shL','shR'],['shL','neck'],['shR','neck'],['shL','pelvis'],['shR','pelvis'],['hiL','hiR'],['hiL','pelvis'],['hiR','pelvis'],['hiL','shL'],['hiR','shR'],['hiL','neck'],['hiR','neck'],['head','shL'],['head','shR'],['hiL','shR'],['hiR','shL'],
  ['shL','elL'],['elL','haL'],['shR','elR'],['elR','haR'],['hiL','knL'],['knL','ftL'],['hiR','knR'],['knR','ftR'],['gA','gB']].map(([a,b])=>[RI[a],RI[b]]);
const RMIN=[['shL','haL',.22],['shR','haR',.22],['hiL','ftL',.42],['hiR','ftR',.42],['ftL','ftR',.12],['knL','knR',.1],['head','pelvis',.45],['haL','pelvis',.15],['haR','pelvis',.15],['knL','shL',.35],['knR','shR',.35]].map(([a,b,d])=>[RI[a],RI[b],d]);
const RRAD=[.12,.1,.12,.07,.06,.06,.07,.06,.06,.08,.07,.07,.08,.07,.07,.04,.04];
function startRagdoll(b,imp){const m=b.model;m.root.updateMatrixWorld(true);const P=new Float32Array(51),O=new Float32Array(51);const w=new V3();
  const put=(i,v)=>{P[i*3]=v.x;P[i*3+1]=v.y;P[i*3+2]=v.z;};
  put(0,m.hips.getWorldPosition(w));put(1,m.chest.localToWorld(w.set(0,.5,0)));put(2,m.head.localToWorld(w.set(0,.16,0)));
  for(const [i,a] of [[0,'L'],[1,'R']]){const A=m.arms[i];put(RI['sh'+a],A.sh.getWorldPosition(w));put(RI['el'+a],A.el.getWorldPosition(w));put(RI['ha'+a],A.el.localToWorld(w.set(0,-.31,0)));
    const Lg=m.legs[i];put(RI['hi'+a],Lg.hp.getWorldPosition(w));put(RI['kn'+a],Lg.kn.getWorldPosition(w));put(RI['ft'+a],Lg.kn.localToWorld(w.set(0,-.43,0)));}
  put(15,m.gun.localToWorld(w.set(0,0,.25)));put(16,m.gun.localToWorld(w.set(0,0,-.5)));
  const dt=1/60;for(let i=0;i<17;i++){let vx=b.vel.x*.8,vy=0,vz=b.vel.z*.8;const px=P[i*3],py=P[i*3+1],pz=P[i*3+2];
    if(imp.blast){const dx=px-imp.cx,dy=py-imp.cy+.5,dz=pz-imp.cz;const d=Math.max(.5,Math.hypot(dx,dy,dz));const k=imp.mag*clamp(1.6-d/6,.2,1.4)/d;vx+=dx*k;vy+=dy*k+2.5;vz+=dz*k;}
    else{const wgt=imp.head?(i===2?1.6:i===1?1:.35):((i===1||i===3||i===6)?1:i===0?.7:.4);vx+=imp.dx*imp.mag*wgt;vy+=imp.dy*imp.mag*wgt+.4;vz+=imp.dz*imp.mag*wgt;}
    if(i>14){vx+=rand(-1,1);vy+=rand(0,1.5);vz+=rand(-1,1);}
    O[i*3]=px-vx*dt;O[i*3+1]=py-vy*dt;O[i*3+2]=pz-vz*dt;}
  const rest=new Float32Array(RST.length);RST.forEach(([a,c],k)=>{rest[k]=Math.hypot(P[a*3]-P[c*3],P[a*3+1]-P[c*3+1],P[a*3+2]-P[c*3+2]);});
  for(const [o] of m.bind)m.root.attach(o);m.root.position.set(0,0,0);m.root.rotation.set(0,0,0);m.root.updateMatrixWorld(true);
  m.chest.rotation.set(0,0,0);m.head.rotation.set(0,0,0);m.chest.position.set(0,.1,0);m.gren.visible=false;
  b.rag={P,O,rest,acc:0,sleep:0};}
function endRagdoll(m){for(const [o,par,pos,q] of m.bind){par.add(o);o.position.copy(pos);o.quaternion.copy(q);}m.hips.position.set(0,.99,0);m.hips.quaternion.identity();}
function ragStep(r){const P=r.P,O=r.O;const g=-15/3600;
  for(let i=0;i<17;i++){const k=i*3;for(let a=0;a<3;a++){const v=(P[k+a]-O[k+a])*.985;O[k+a]=P[k+a];P[k+a]+=v;}P[k+1]+=g;}
  for(let it=0;it<8;it++){
    for(let s=0;s<RST.length;s++){const [a,c]=RST[s];const ka=a*3,kc=c*3;const dx=P[kc]-P[ka],dy=P[kc+1]-P[ka+1],dz=P[kc+2]-P[ka+2];const d=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-4;const f=(d-r.rest[s])/d*.5;
      P[ka]+=dx*f;P[ka+1]+=dy*f;P[ka+2]+=dz*f;P[kc]-=dx*f;P[kc+1]-=dy*f;P[kc+2]-=dz*f;}
    for(const [a,c,mn] of RMIN){const ka=a*3,kc=c*3;const dx=P[kc]-P[ka],dy=P[kc+1]-P[ka+1],dz=P[kc+2]-P[ka+2];const d=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-4;if(d>=mn)continue;const f=(d-mn)/d*.5;
      P[ka]+=dx*f;P[ka+1]+=dy*f;P[ka+2]+=dz*f;P[kc]-=dx*f;P[kc+1]-=dy*f;P[kc+2]-=dz*f;}
    if(it%3===2||it===7)for(let i=0;i<17;i++){const k=i*3,rr=RRAD[i];let x=P[k],y=P[k+1],z=P[k+2];
      const gh=Hx(x,z)+rr;if(y<gh){P[k+1]=gh;O[k]=lerp(O[k],x,.4);O[k+2]=lerp(O[k+2],z,.4);if(O[k+1]<gh)O[k+1]=gh+(gh-O[k+1])*.2;}
      const cand=gather(x-rr,z-rr,x+rr,z+rr);for(const c of cand){x=P[k];y=P[k+1];z=P[k+2];if(x+rr<c.minX||x-rr>c.maxX||y+rr<c.minY||y-rr>c.maxY||z+rr<c.minZ||z-rr>c.maxZ)continue;
        const px=Math.min(x+rr-c.minX,c.maxX-(x-rr)),py=Math.min(y+rr-c.minY,c.maxY-(y-rr)),pz=Math.min(z+rr-c.minZ,c.maxZ-(z-rr));
        if(py<=px&&py<=pz){P[k+1]=y>(c.minY+c.maxY)/2?c.maxY+rr:c.minY-rr;O[k]=lerp(O[k],P[k],.4);O[k+2]=lerp(O[k+2],P[k+2],.4);}else if(px<=pz)P[k]=x>(c.minX+c.maxX)/2?c.maxX+rr:c.minX-rr;else P[k+2]=z>(c.minZ+c.maxZ)/2?c.maxZ+rr:c.minZ-rr;}}}}
const _ra=new V3(),_rb=new V3(),_rx=new V3(),_ry=new V3(),_rz=new V3(),_rm=new THREE.Matrix4(),_up=new V3(),_right=new V3();
function rP(r,i,v){return v.set(r.P[i*3],r.P[i*3+1],r.P[i*3+2]);}
function setLimb(o,r,a,c,ref){rP(r,a,_ra);rP(r,c,_rb);_ry.copy(_ra).sub(_rb).normalize();_rx.copy(ref).addScaledVector(_ry,-ref.dot(_ry));if(_rx.lengthSq()<1e-5)_rx.set(1,0,0);_rx.normalize();_rz.crossVectors(_rx,_ry);
  _rm.makeBasis(_rx,_ry,_rz);o.quaternion.setFromRotationMatrix(_rm);o.position.copy(_ra);}
function ragPose(b,dt){const r=b.rag,m=b.model;r.acc+=dt;let n=0;while(r.acc>1/60&&n<3){ragStep(r);r.acc-=1/60;n++;}if(n===3)r.acc=0;
  const pel=rP(r,0,new V3()),nk=rP(r,1,new V3());_up.copy(nk).sub(pel).normalize();
  _right.set(r.P[18]-r.P[9]+r.P[36]-r.P[27],r.P[19]-r.P[10]+r.P[37]-r.P[28],r.P[20]-r.P[11]+r.P[38]-r.P[29]);_right.addScaledVector(_up,-_right.dot(_up));if(_right.lengthSq()<1e-5)_right.set(1,0,0);_right.normalize();
  _rz.crossVectors(_right,_up);_rm.makeBasis(_right,_up,_rz);m.hips.quaternion.setFromRotationMatrix(_rm);m.hips.position.copy(pel);
  setLimb(m.arms[0].sh,r,RI.shL,RI.elL,_right);setLimb(m.arms[0].el,r,RI.elL,RI.haL,_right);setLimb(m.arms[1].sh,r,RI.shR,RI.elR,_right);setLimb(m.arms[1].el,r,RI.elR,RI.haR,_right);
  setLimb(m.legs[0].hp,r,RI.hiL,RI.knL,_right);setLimb(m.legs[0].kn,r,RI.knL,RI.ftL,_right);setLimb(m.legs[1].hp,r,RI.hiR,RI.knR,_right);setLimb(m.legs[1].kn,r,RI.knR,RI.ftR,_right);
  rP(r,15,_ra);rP(r,16,_rb);_rz.copy(_ra).sub(_rb).normalize();_ry.set(0,1,0).addScaledVector(_rz,-_rz.y);if(_ry.lengthSq()<1e-5)_ry.set(1,0,0);_ry.normalize();_rx.crossVectors(_ry,_rz);_rm.makeBasis(_rx,_ry,_rz);
  m.gun.quaternion.setFromRotationMatrix(_rm);m.gun.position.copy(_ra).addScaledVector(_rz,-.25);}
