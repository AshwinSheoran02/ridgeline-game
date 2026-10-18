/* ================= Viewmodel ================= */
T.gunMetal={c:toTex(T.gunMetalCv,true),n:toTex(nmap(T.gunMetalCv,1.2),false)};
T.fde=pbr(256,256,(g,w,h)=>{g.fillStyle='#8f7a5a';g.fillRect(0,0,w,h);speck(g,w,h,12000,['#806b4d','#a18c6a','#725f43'],.5,.9,1,2);for(let i=0;i<14;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(10,30),'#6e5d43',.25);},5);
T.mlok=pbr(256,256,(g,w,h)=>{g.drawImage(T.fde.cv,0,0);g.fillStyle='#1c1a17';for(let r=0;r<4;r++)for(let i=0;i<5;i++)g.fillRect(12+i*48,14+r*64,32,12);},6,(g,w,h)=>{g.fillStyle='#bbb';g.fillRect(0,0,w,h);g.fillStyle='#000';for(let r=0;r<4;r++)for(let i=0;i<5;i++)g.fillRect(12+i*48,14+r*64,32,12);});
T.rail=pbr(64,32,(g,w,h)=>{g.fillStyle='#17181a';g.fillRect(0,0,w,h);g.fillStyle='#3a3c3e';for(let x=0;x<w;x+=8)g.fillRect(x,0,5,h);},8);
T.gunwood=pbr(256,128,(g,w,h)=>{g.fillStyle='#6b4024';g.fillRect(0,0,w,h);g.strokeStyle='rgba(30,15,5,.45)';for(let i=0;i<22;i++){g.beginPath();g.moveTo(0,rand(0,h));g.bezierCurveTo(w*.3,rand(0,h),w*.6,rand(0,h),w,rand(0,h));g.stroke();}speck(g,w,h,1500,['#4a2a15','#8a5a35'],.3,.5,1,2);},3);
T.rubber=pbr(64,64,(g,w,h)=>{g.fillStyle='#151515';g.fillRect(0,0,w,h);g.fillStyle='#262626';for(let y=0;y<h;y+=6)g.fillRect(0,y,w,3);},4);
T.leather=pbr(64,64,(g,w,h)=>{g.fillStyle='#8a7350';g.fillRect(0,0,w,h);speck(g,w,h,700,['#5e4c34','#a08a64'],.3,.6,1,2);},2);
T.dot=tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(110,160,220,.10)';g.beginPath();g.arc(64,64,64,0,TAU);g.fill();const gr=g.createRadialGradient(64,64,0,64,64,6);gr.addColorStop(0,'rgba(255,60,40,1)');gr.addColorStop(.5,'rgba(255,40,30,.9)');gr.addColorStop(1,'rgba(255,40,30,0)');g.fillStyle=gr;g.fillRect(52,52,24,24);},{nomip:true});
const VM={metal:mat(T.gunMetal,{roughness:.38,metalness:.75}),fde:mat(T.fde,{roughness:.75,ns:.8}),mlok:mat(T.mlok,{roughness:.75}),rail:mat(T.rail,{roughness:.45,metalness:.7}),
  wood:mat(T.gunwood,{roughness:.45}),rubber:mat(T.rubber,{roughness:.95}),sleeve:mat(T.camoA,{ns:1.5}),glove:mat(T.leather,{roughness:.8}),brass:std({color:0xc89a48,roughness:.3,metalness:.9}),
  shellR:std({color:0xa82a1e,roughness:.5}),bead:new THREE.MeshBasicMaterial({color:0xfff0b0}),lensRing:std({color:0x111111,roughness:.3,metalness:.8,side:THREE.DoubleSide})};
function vb(p,w,h,d,m,x,y,z,rx=0,ry=0,rz=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);p.add(o);return o;}
function vc(p,r,len,m,x,y,z,seg=14,open=false){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,seg,1,open),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);p.add(o);return o;}
const _Y=new V3(0,1,0);
function armSeg(p,from,dir,len,r,m){const d=new V3(...dir).normalize();const o=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,4,12),m);o.quaternion.setFromUnitVectors(_Y,d);o.position.set(from[0]+d.x*len/2,from[1]+d.y*len/2,from[2]+d.z*len/2);p.add(o);return o;}
function fist(p,x,y,z,sx,sy,sz){const o=new THREE.Mesh(new THREE.SphereGeometry(.036,14,10),VM.glove);o.scale.set(sx,sy,sz);o.position.set(x,y,z);p.add(o);return o;}
function vArms(g,grip,fore){const rg=new THREE.Group();rg.position.set(...grip);g.add(rg);fist(rg,0,-.005,0,1,1.25,1.35);fist(rg,-.004,.025,-.035,.9,.6,.9);
  armSeg(rg,[.008,-.03,.04],[.35,-.55,1],.07,.034,VM.glove);armSeg(rg,[.03,-.065,.1],[.35,-.55,1],.42,.044,VM.sleeve);
  const lg=new THREE.Group();lg.position.set(...fore);fist(lg,-.012,-.018,0,1.15,.75,1.7);fist(lg,.022,0,-.01,.5,.8,1.3);
  armSeg(lg,[-.02,-.035,.03],[-.75,-.5,.55],.07,.034,VM.glove);armSeg(lg,[-.06,-.06,.06],[-.75,-.5,.55],.5,.046,VM.sleeve);return {rg,lg};}
function buildRifleVM(){const g=new THREE.Group();
  vb(g,.05,.055,.3,VM.metal,0,.012,-.03);vb(g,.046,.045,.2,VM.metal,0,-.035,0);vb(g,.05,.05,.07,VM.metal,0,-.06,-.1);
  vb(g,.002,.022,.06,VM.rail,.0255,.016,-.02);vb(g,.012,.016,.026,VM.metal,.03,.016,.02);vb(g,.04,.01,.022,VM.metal,0,.037,.115);
  vb(g,.032,.06,.066,VM.fde,0,-.1,-.1,.08);vb(g,.032,.06,.064,VM.fde,0,-.155,-.094,.22);vb(g,.032,.06,.062,VM.fde,0,-.205,-.08,.38);vb(g,.036,.012,.07,VM.rubber,0,-.235,-.07,.4);
  vb(g,.032,.1,.045,VM.fde,0,-.085,.075,-.35);vb(g,.006,.006,.06,VM.metal,0,-.07,.02);vb(g,.004,.025,.008,VM.metal,0,-.06,.012,.2);
  vc(g,.014,.15,VM.metal,0,0,.17,10);vb(g,.044,.07,.15,VM.fde,0,-.012,.26);vb(g,.046,.088,.024,VM.rubber,0,-.015,.34);vb(g,.03,.022,.1,VM.fde,0,.03,.24);
  vb(g,.022,.012,.32,VM.rail,0,.045,-.06);const hg=vc(g,.031,.3,VM.mlok,0,.004,-.34,8);hg.rotation.y=Math.PI/8;vb(g,.022,.012,.29,VM.rail,0,.038,-.34);
  vc(g,.009,.15,VM.metal,0,.004,-.56,10);vb(g,.024,.03,.03,VM.metal,0,.004,-.52);vc(g,.014,.055,VM.metal,0,.004,-.655,8);vc(g,.013,.07,VM.metal,.036,0,-.42,10);vb(g,.012,.022,.03,VM.metal,.026,0,-.42);
  vb(g,.022,.022,.05,VM.metal,0,.06,-.06);vc(g,.022,.075,VM.lensRing,0,.088,-.06,20,true);
  const rr=new THREE.Mesh(new THREE.TorusGeometry(.022,.004,8,24),VM.metal);rr.position.set(0,.088,-.022);g.add(rr);const rf=rr.clone();rf.position.z=-.098;g.add(rf);
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.021,24),new THREE.MeshBasicMaterial({map:T.dot,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));lens.position.set(0,.088,-.06);g.add(lens);
  vb(g,.014,.02,.012,VM.metal,0,.06,.1);const a=vArms(g,[0,-.075,.07],[-.005,-.045,-.38]);g.add(a.lg);
  const muzzle=new THREE.Object3D();muzzle.position.set(0,.004,-.69);g.add(muzzle);const port=new THREE.Object3D();port.position.set(.03,.016,-.02);g.add(port);
  return {g,muzzle,port,hip:new THREE.Vector3(.18,-.19,-.34),ads:new THREE.Vector3(0,-.088,-.19)};}
function buildShotgunVM(){const g=new THREE.Group();
  vb(g,.054,.07,.3,VM.metal,0,0,-.02);vb(g,.002,.026,.07,VM.rail,.0275,.012,-.03);vc(g,.0145,.56,VM.metal,0,.017,-.43,12);vc(g,.012,.44,VM.metal,0,-.019,-.38,10);
  const pump=new THREE.Group();g.add(pump);vb(pump,.058,.052,.17,VM.wood,0,-.022,-.36);for(let i=0;i<6;i++)vb(pump,.06,.004,.006,VM.rubber,0,-.022,-.31-i*.022);
  vb(g,.046,.085,.27,VM.wood,0,-.03,.25,-.08);vb(g,.048,.095,.02,VM.rubber,0,-.045,.385,-.08);vb(g,.036,.1,.045,VM.wood,0,-.07,.075,-.4);vb(g,.006,.006,.06,VM.metal,0,-.05,.02);
  for(let i=0;i<4;i++)vc(g,.009,.05,VM.shellR,.033,-.02,-.04-i*.022,8);vb(g,.008,.04,.1,VM.metal,.03,-.01,-.07);
  vb(g,.012,.016,.5,VM.metal,0,.042,-.44);const bead=new THREE.Mesh(new THREE.SphereGeometry(.005,8,6),VM.bead);bead.position.set(0,.056,-.69);g.add(bead);
  vb(g,.009,.03,.012,VM.metal,-.01,.05,-.15);vb(g,.009,.03,.012,VM.metal,.01,.05,-.15);
  const a=vArms(g,[0,-.07,.08],[0,-.042,-.36]);pump.add(a.lg);
  const muzzle=new THREE.Object3D();muzzle.position.set(0,.017,-.72);g.add(muzzle);const port=new THREE.Object3D();port.position.set(.03,.012,-.03);g.add(port);
  return {g,muzzle,port,pump,hip:new THREE.Vector3(.18,-.18,-.34),ads:new THREE.Vector3(0,-.058,-.3)};}
const vmRoot=new THREE.Group();vmScene.add(vmRoot);
const VMS={rifle:buildRifleVM(),shotgun:buildShotgunVM()};
for(const k in VMS){vmRoot.add(VMS[k].g);VMS[k].g.visible=false;VMS[k].flash=new THREE.Sprite(new THREE.SpriteMaterial({map:T.flash,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));VMS[k].flash.scale.setScalar(k==='shotgun'?.2:.14);VMS[k].flash.visible=false;VMS[k].muzzle.add(VMS[k].flash);}
const VMG=new THREE.Group();(()=>{fist(VMG,0,0,0,1.15,1.2,1.4);armSeg(VMG,[.01,-.03,.03],[.35,-.6,1],.07,.034,VM.glove);armSeg(VMG,[.03,-.065,.09],[.35,-.6,1],.42,.044,VM.sleeve);const gm=makeGrenadeMesh();gm.position.set(0,.045,-.01);VMG.add(gm);})();
VMG.scale.setScalar(.85);VMG.visible=false;vmRoot.add(VMG);
const shells=[];const shellGeoR=new THREE.CylinderGeometry(.004,.004,.022,6).rotateZ(Math.PI/2),shellGeoS=new THREE.CylinderGeometry(.009,.009,.05,8).rotateZ(Math.PI/2);
for(let i=0;i<14;i++){const m=new THREE.Mesh(shellGeoR,VM.brass);m.visible=false;vmScene.add(m);shells.push({m,t:0,v:new V3(),sp:new V3()});}
function ejectShell(vm,shotgun){vmRoot.updateMatrixWorld();const s=shells.find(x=>x.t<=0)||shells[0];vm.port.getWorldPosition(s.m.position);s.m.geometry=shotgun?shellGeoS:shellGeoR;s.m.material=shotgun?VM.shellR:VM.brass;
  s.v.set(rand(.8,1.2),rand(.7,1.1),rand(-.1,.2));s.sp.set(rand(-20,20),rand(-20,20),rand(-20,20));s.t=.55;s.m.visible=true;}
function updateShells(dt){for(const s of shells)if(s.t>0){s.t-=dt;s.v.y-=5*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=s.sp.x*dt;s.m.rotation.y+=s.sp.y*dt;if(s.t<=0)s.m.visible=false;}}
