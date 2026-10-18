/* ================= Destructible gas cylinders ================= */
const CYLS=[];
function gasCyl(x,z,y){const c={minX:x-.17,maxX:x+.17,minY:y,maxY:y+.68,minZ:z-.17,maxZ:z+.17,st:0,cover:false,kind:''};colliders.push(c);
  const g={x,y,z,c,y0:y,state:0,t:0,owner:null,ry:Math.random()*TAU,tp:new V3(x,y+.3,z),fuse:0,gas:true,jet:null,smokeT:0};g.pos=g.tp;c.gas=g;CYLS.push(g);return g;}
function mergeGeo(list){let total=0;const gs=list.map(([g,m])=>{const n=g.index?g.toNonIndexed():g;total+=n.attributes.position.count;return [n,m];});
  const pos=new Float32Array(total*3),nor=new Float32Array(total*3),uv=new Float32Array(total*2);let o=0;const v=new V3(),nm=new THREE.Matrix3();
  for(const [g,m] of gs){nm.getNormalMatrix(m);const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;
    for(let k=0;k<P.count;k++){const j=o+k;v.fromBufferAttribute(P,k).applyMatrix4(m);pos[j*3]=v.x;pos[j*3+1]=v.y;pos[j*3+2]=v.z;v.fromBufferAttribute(N,k).applyMatrix3(nm).normalize();nor[j*3]=v.x;nor[j*3+1]=v.y;nor[j*3+2]=v.z;uv[j*2]=U.getX(k);uv[j*2+1]=U.getY(k);}o+=P.count;}
  const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.BufferAttribute(pos,3));r.setAttribute('normal',new THREE.BufferAttribute(nor,3));r.setAttribute('uv',new THREE.BufferAttribute(uv,2));r.computeBoundingSphere();return r;}
const T4=(x,y,z,sx=1,sy=1,sz=1)=>new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion(),new V3(sx,sy,sz));
T.gasLbl=tex(128,64,(g,w,h)=>{g.fillStyle='#b3241a';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){g.fillStyle=`rgba(${rand(0,1)<.5?'60,10,6':'230,120,100'},${rand(.03,.09)})`;g.fillRect(rand(0,w),rand(0,h),rand(1,6),rand(1,3));}
  g.fillStyle='#efe9df';g.fillRect(0,h*.36,w,h*.2);g.fillStyle='#b3241a';g.font='bold 10px Arial';g.fillText('LPG  14.2 KG',8,h*.51);g.fillText('LPG  14.2 KG',72,h*.51);
  g.fillStyle='rgba(40,20,10,.35)';for(let i=0;i<10;i++)g.fillRect(rand(0,w),h*.85,rand(4,16),h*.15);});
let gasBody=null,gasTop=null;const gasJets=[];const _gm=new THREE.Matrix4(),_gq=new THREE.Quaternion(),_ge=new THREE.Euler(),_gp=new V3(),_gs=new V3();
function initGas(){WEAP.gas={id:'gas',name:'GAS CYLINDER'};if(!CYLS.length)return;
  const body=mergeGeo([[new THREE.CylinderGeometry(.16,.16,.48,16,1,true),T4(0,.32,0)],[new THREE.SphereGeometry(.16,16,6,0,TAU,0,Math.PI/2),T4(0,.56,0,1,.5,1)],[new THREE.SphereGeometry(.16,16,6,0,TAU,Math.PI/2,Math.PI/2),T4(0,.08,0,1,.35,1)],[new THREE.CylinderGeometry(.15,.15,.05,16),T4(0,.025,0)]]);
  const top=mergeGeo([[new THREE.CylinderGeometry(.095,.11,.1,12,1,true),T4(0,.66,0)],[new THREE.CylinderGeometry(.028,.028,.07,8),T4(0,.65,0)],[new THREE.TorusGeometry(.05,.012,6,12),new THREE.Matrix4().makeRotationX(Math.PI/2).setPosition(0,.69,0)]]);
  const mb=std({map:T.gasLbl.c||T.gasLbl,roughness:.42,metalness:.25});const mt=std({color:0x8a7a48,roughness:.35,metalness:.75});
  gasBody=new THREE.InstancedMesh(body,mb,CYLS.length);gasTop=new THREE.InstancedMesh(top,mt,CYLS.length);
  for(const m of [gasBody,gasTop]){m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;scene.add(m);}
  for(let i=0;i<3;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:T.fire,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,color:0xffb060}));s.visible=false;s.scale.set(.5,.9,1);scene.add(s);gasJets.push(s);}
  CYLS.forEach((g,i)=>setGasM(g,i));}
function setGasM(g,i){const wob=g.state===1?Math.sin(G.time*60+i)*.02:0;_ge.set(wob,g.ry,wob*.7);_gq.setFromEuler(_ge);_gp.set(g.x,g.y,g.z);_gs.setScalar(g.state===3?0:1);_gm.compose(_gp,_gq,_gs);
  gasBody.setMatrixAt(i,_gm);gasTop.setMatrixAt(i,_gm);gasBody.instanceMatrix.needsUpdate=true;gasTop.instanceMatrix.needsUpdate=true;}
function hitGas(g,att,pt){if(g.state===3)return;if(NET.client){if(att===player){netSend({t:'gas',i:CYLS.indexOf(g)});spawnPuff(pt||g.tp,0xffd090,.12,.15,.2,.9);}return;}spawnPuff(pt||g.tp,0xffd090,.12,.15,.2,.9);
  if(g.state===0){g.state=1;g.t=g.fuse=rand(1.5,2.1);g.owner=att;const d=player?player.pos.distanceTo(g.tp):30;if(AU.ctx)AU.burst(clamp(.5/(1+d/8),.02,.5),4200,g.t,AU.panFor(g.tp),'highpass',.4);}
  else if(g.state===1){g.owner=att||g.owner;g.t=Math.min(g.t,.06);}}
function igniteGas(g,owner,delay){if(g.state===3||g.state===2)return;if(g.state===1&&g.t<delay)return;g.state=2;g.t=g.fuse=delay;if(!g.owner||owner)g.owner=owner||g.owner;}
function boomGas(g,i){g.state=3;g.t=70;g.smokeT=7;g.c.minY=g.c.maxY=-1e3;setGasM(g,i);if(g.jet){g.jet.visible=false;g.jet=null;}
  const p=new V3(g.x,g.y+.2,g.z);explode(p,g.owner&&g.owner.alive!==undefined?g.owner:null,WEAP.gas,8.5,175,true);
  for(let k=0;k<6&&debris.length<90;k++)debris.push({p:new V3(g.x,g.y+.5,g.z),v:new V3(rand(-8,8),rand(6,12),rand(-8,8)),t:rand(1.6,2.6),r:rand(0,6)});}
function updateGas(dt){if(!gasBody)return;let jetI=0;
  for(let i=0;i<CYLS.length;i++){const g=CYLS[i];if(g.state===0)continue;
    if(g.state===1||g.state===2){g.t-=dt;if(g.state===1){setGasM(g,i);if(jetI<gasJets.length){const s=gasJets[jetI++];g.jet=s;s.visible=true;s.position.set(g.x+Math.sin(g.ry)*.05,g.y+.86+Math.random()*.05,g.z+Math.cos(g.ry)*.05);s.scale.set(rand(.35,.55),rand(.7,1.1),1);s.material.rotation=rand(-.2,.2);}
        if(Math.random()<dt*14)spawnPuff(new V3(g.x+rand(-.1,.1),g.y+.9,g.z+rand(-.1,.1)),0xd8d4cc,.25,.6,1.2,.35);}
      if(g.t<=0&&!NET.client)boomGas(g,i);}
    else if(g.state===3){g.t-=dt;if(g.smokeT>0){g.smokeT-=dt;if(Math.random()<dt*5)spawnPuff(new V3(g.x+rand(-.4,.4),g.y+.3,g.z+rand(-.4,.4)),g.smokeT>5?0x3a3632:0x6a645c,rand(.8,1.4),rand(2.2,3.4),rand(1,1.8),.55);}
      if(g.t<=0&&!NET.client){let near=false;for(const s of soldiers)if(s.alive&&Math.hypot(s.pos.x-g.x,s.pos.z-g.z)<12){near=true;break;}if(near)g.t=5;else resetGasOne(g,i);}}}
  for(let k=jetI;k<gasJets.length;k++)gasJets[k].visible=false;}
function resetGasOne(g,i){g.state=0;g.owner=null;g.c.minY=g.y0;g.c.maxY=g.y0+.68;setGasM(g,i);}
function resetGas(){if(!gasBody)return;CYLS.forEach((g,i)=>resetGasOne(g,i));for(const s of gasJets)s.visible=false;}
function gasNear(p,r){for(const g of CYLS){if(g.state!==0)continue;const dx=g.x-p.x,dz=g.z-p.z;if(dx*dx+dz*dz<r*r&&Math.abs(g.y-p.y)<1.6)return g;}return null;}
