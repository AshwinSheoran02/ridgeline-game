/* ================= Materials ================= */
function mat(p,o={}){const ns=o.ns||1;const oo=Object.assign({roughness:.92,metalness:0},o);delete oo.ns;const m=new THREE.MeshStandardMaterial(oo);if(p){m.map=p.c;m.normalMap=p.n;m.normalScale=new THREE.Vector2(ns,ns);}return m;}
const std=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},o));
function repT(p,x,y){const c=p.c.clone(),n=p.n.clone();c.needsUpdate=n.needsUpdate=true;c.repeat.set(x,y);n.repeat.set(x,y);return {c,n};}
function windify(m,mode,amp,freq){m.onBeforeCompile=sh=>{sh.uniforms.uTime=WIND;
  const k=mode==='flag'?'(1.0-uv.y)':mode==='grass'?'uv.y':'1.0';
  sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  { float wk=${k}; float ph=transformed.x*.31+transformed.z*.23; transformed.x+=sin(uTime*${freq.toFixed(2)}+ph)*${amp.toFixed(3)}*wk; transformed.z+=cos(uTime*${(freq*.83).toFixed(2)}+ph*1.3)*${(amp*.7).toFixed(3)}*wk; transformed.y+=sin(uTime*${(freq*1.7).toFixed(2)}+ph*2.1)*${(amp*.25).toFixed(3)}*wk; }`);};
  m.customProgramCacheKey=()=>'wind_'+mode+amp+freq;return m;}
const DS=THREE.DoubleSide;
const PALC=[0xe8b44c,0xdc7c52,0xea978f,0x92bbdc,0xa0d4b2,0xf6ecd4,0xcbd76e,0xd6aad3,0xf2c47e,0x8abab2,0xeed870];
const PLASTERS=PALC.map(c=>mat(T.plaster,{color:c}));
const TIMBERS=[0xf6eedc,0xeed8b6,0xdce4e8,0xf0d0ae].map(c=>mat(T.timber,{color:c}));
const M={
  plaster:mat(T.plaster),stone:mat(T.stone),stoneBase:mat(T.stone,{color:0xb8a88c}),fstone:mat(T.fstone),retain:mat(T.retain),
  wood:mat(T.wood),woodDark:mat(T.wood,{color:0x7a5a44}),crate:mat(T.crate),metal:mat(T.metal,{roughness:.6,metalness:.4}),corr:mat(T.corr,{roughness:.55,metalness:.45,color:0x9a9a96,side:DS}),
  window:std({map:T.window,roughness:.15,metalness:.3}),frame:std({color:0xe8dfcf,roughness:.8}),sill:mat(T.stone,{color:0xcfc2a8}),
  shutterB:mat(T.wood,{color:0x5f8fb0}),shutterG:mat(T.wood,{color:0x6f9a6a}),door:mat(T.wood,{color:0x9b6f4c}),roof:mat(T.plaster,{color:0xb8a68a}),tile:mat(T.tile),
  bark:mat(T.bark),needle:std({map:T.needles,alphaTest:.42,side:DS,roughness:.85}),leaf:std({map:T.leaf,alphaTest:.42,side:DS,roughness:.8}),rhodo:std({map:T.rhodo,alphaTest:.4,side:DS}),
  grass:std({map:T.grass,alphaTest:.4,side:DS}),fern:std({map:T.fern,alphaTest:.4,side:DS}),
  sandbag:mat(T.soil,{color:0xd8c4a0}),tire:std({color:0x1d1b19,roughness:.95}),rim:std({color:0xb9b3a6,roughness:.4,metalness:.6}),
  jeep:mat(T.metal,{color:0xeeeadc,roughness:.45,metalness:.3}),olive:mat(T.metal,{color:0x6c7a4a,roughness:.55,metalness:.3}),truckO:mat(T.metal,{color:0xe08a2c,roughness:.5,metalness:.3}),glass:std({color:0x26313a,roughness:.1,metalness:.5}),
  barrelG:mat(T.metal,{color:0x7b9a54,roughness:.5,metalness:.4}),barrelB:mat(T.metal,{color:0x4f74b8,roughness:.5,metalness:.4}),barrelR:mat(T.metal,{color:0xb5452e,roughness:.5,metalness:.4}),
  rock:mat(T.rockG,{color:0xd0ccc2}),tentA:mat(T.soil,{color:0x7f8a58,side:DS}),tentB:mat(T.soil,{color:0x5a5c60,side:DS}),canvas:mat(T.soil,{color:0x7a8460,side:DS}),
  pole:std({color:0x3a3330,roughness:.5,metalness:.5}),wire:new THREE.LineBasicMaterial({color:0x26221e}),
  goods1:std({color:0xd98a2b}),goods2:std({color:0x9c3b2c}),goods3:std({color:0x6c8a3a}),goods4:std({color:0xe7d27a}),hay:mat(T.wood,{color:0xe0c27a}),
  bus:std({map:T.busWin,roughness:.5,metalness:.2}),
  tinR:mat(T.corr,{color:0xb03a2e,roughness:.5,metalness:.35,side:DS}),tinG:mat(T.corr,{color:0x3f7a4a,roughness:.5,metalness:.35,side:DS}),tinB:mat(T.corr,{color:0x3a6aa0,roughness:.5,metalness:.35,side:DS}),
  slate:mat(T.slate,{side:DS,roughness:.75}),ghat:mat(T.ghat,{color:0xd2cbc0}),flagS:mat(T.flag,{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),flagG:mat(T.flag,{color:0xbdb8ae,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),asph:mat(T.asphalt,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-3}),
  carve:mat(T.carve),monW:mat(T.monWall,{roughness:.85}),penbey:mat(T.penbey),whiteW:mat(T.plaster,{color:0xffffff}),redW:mat(T.plaster,{color:0xa83a2c}),trim:mat(T.plaster,{color:0xfaf6ec}),
  gold:std({color:0xe0b040,roughness:.22,metalness:.95}),shopF:std({map:T.shopfront,roughness:.8,emissive:0x2a1a08,emissiveIntensity:.4}),arch:std({map:T.arch,roughness:.35,metalness:.15}),woodWin:std({map:T.woodWin,roughness:.35,metalness:.15}),
  prayer:std({map:T.prayer,side:DS,roughness:.9}),saree:std({map:T.saree,side:DS,roughness:.85}),saffron:std({color:0xf28c28,side:DS,roughness:.85}),
  clock:std({map:T.clock,roughness:.5}),boat:mat(T.boat),mani:mat(T.mani),tankBlk:std({color:0x1e1e1e,roughness:.45}),
  water:new THREE.MeshStandardMaterial({color:0x031012,roughness:.12,metalness:0,envMapIntensity:.6,transparent:true,opacity:.96,normalMap:T.waterN,normalScale:new THREE.Vector2(.35,.35)}),
};
T.waterN.repeat.set(70,36);
const TINS=[M.tinR,M.tinG,M.tinB];
windify(M.needle,'tree',.05,1.3);windify(M.leaf,'tree',.06,1.6);windify(M.rhodo,'grass',.06,2);windify(M.grass,'grass',.08,2.4);windify(M.fern,'grass',.06,2);
windify(M.prayer,'flag',.12,5.5);windify(M.saffron,'flag',.12,5.5);windify(M.saree,'flag',.18,2.6);
const depthA=(t,a)=>new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:t,alphaTest:a});
M.needle.userData.depthMat=depthA(T.needles,.42);M.leaf.userData.depthMat=depthA(T.leaf,.42);M.rhodo.userData.depthMat=depthA(T.rhodo,.4);
for(const k of ['grass','fern','window','frame','tile','water','flagS','flagG','asph','prayer','saffron'])M[k].userData.noCast=true;
const signs=[['DEODAR CAFE','#efe3c4','#2d4f7a'],['HIMALAYA STORES','#f2efe6','#a83a2c'],['MOMO HOUSE','#f2c230','#3a2a1a'],['GANGA TEA STALL','#e9e1cf','#2b7a3c'],['RIVERSIDE LODGE','#ddd2b8','#26405e'],['HILL VIEW BAKERY','#d8c49a','#7a2b20'],
  ['SHARMA MEDICAL','#e6f0e8','#1f7a3c'],['NEW BOOK DEPOT','#2f5fb3','#f2f2ee'],['PAHADI DHABA','#c9302c','#f6e7c8'],['TIRTHKOT TRAVELS','#1f4f5f','#f2e6c8'],['KUMAR TAILORS','#f6ecd4','#5a3a7a'],['GUEST HOUSE','#e8dcc0','#1f4f5f']].map(s=>std({map:signTex(...s),roughness:.7}));

/* ================= Static geometry ================= */
const staticParts=[];const colliders=[];const buildings=[];
const geoCache=new Map();
function boxGeo(w,h,d,ts){const k=w.toFixed(3)+'|'+h.toFixed(3)+'|'+d.toFixed(3)+'|'+ts;let g=geoCache.get(k);if(g)return g;
  g=new THREE.BoxGeometry(w,h,d);if(ts){const uv=g.attributes.uv;const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
    for(let f=0;f<6;f++)for(let i=0;i<4;i++){const j=f*4+i;uv.setXY(j,uv.getX(j)*dims[f][0]/ts,uv.getY(j)*dims[f][1]/ts);}}
  geoCache.set(k,g);return g;}
const _e=new THREE.Euler(),_q=new THREE.Quaternion(),_p=new V3(),_s=new V3();
function place(geo,m,x,y,z,ry=0,rx=0,rz=0,sx=1,sy=1,sz=1){_e.set(rx,ry,rz,'YXZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(sx,sy,sz);
  staticParts.push({geo,mat:m,m:new THREE.Matrix4().compose(_p,_q,_s),x,z});}
function addCol(x0,y0,z0,x1,y1,z1,cover=true,kind=''){colliders.push({minX:Math.min(x0,x1),maxX:Math.max(x0,x1),minY:y0,maxY:y1,minZ:Math.min(z0,z1),maxZ:Math.max(z0,z1),st:0,cover,kind});}
function box(x,y,z,w,h,d,m,o={}){const ry=o.ry||0;place(boxGeo(w,h,d,o.ts===undefined?2:o.ts),m,x,y+h/2,z,ry,o.rx||0,o.rz||0);
  if(o.col!==false){const c=Math.abs(Math.cos(ry)),s=Math.abs(Math.sin(ry));const hw=(w*c+d*s)/2,hd=(w*s+d*c)/2;addCol(x-hw,y,z-hd,x+hw,y+h,z+hd,o.cover!==false,o.kind||'');}}
const cylCache=new Map();
function cylGeo(rt,rb,h,seg,open){const k=[rt,rb,h,seg,open].join('|');let g=cylCache.get(k);if(!g){g=new THREE.CylinderGeometry(rt,rb,h,seg,1,!!open);cylCache.set(k,g);}return g;}
const nonIdx=new Map();
const _defOBC=THREE.Material.prototype.onBeforeCompile;const sigReps=new Map();const _u=t=>t?t.uuid:'-';
function matSig(m){if(!m.isMeshStandardMaterial||m.onBeforeCompile!==_defOBC||m.userData.depthMat||m.vertexColors)return m;
  const k=[_u(m.map),_u(m.normalMap),_u(m.roughnessMap),_u(m.metalnessMap),_u(m.emissiveMap),m.roughness,m.metalness,m.transparent,m.opacity,m.side,m.alphaTest,m.emissive.getHex(),m.emissiveIntensity,m.envMapIntensity,m.normalScale.x,m.polygonOffset,m.depthWrite,!!m.userData.noCast].join('|');
  let r=sigReps.get(k);if(!r){r=m.clone();r.color.setRGB(1,1,1);r.vertexColors=true;r.userData=Object.assign({},m.userData);sigReps.set(k,r);}return r;}
const DETAIL=[];
function mergeStatic(){const groups=new Map();const CH=64;
  for(const p of staticParts){const ck=Math.floor((p.x+600)/CH)+'_'+Math.floor((p.z+600)/CH);const key=matSig(p.mat);let mg=groups.get(key);if(!mg){mg=new Map();groups.set(key,mg);}let a=mg.get(ck);if(!a){a=[];mg.set(ck,a);}a.push(p);}
  const v=new V3(),nm=new THREE.Matrix3();
  for(const [m,chunks] of groups)for(const [,parts] of chunks){let total=0;const geos=parts.map(p=>{let g=nonIdx.get(p.geo);if(!g){g=p.geo.index?p.geo.toNonIndexed():p.geo;nonIdx.set(p.geo,g);}total+=g.attributes.position.count;return g;});
    const vc=m.vertexColors&&m!==parts[0].mat;const pos=new Float32Array(total*3),nor=new Float32Array(total*3),uv=new Float32Array(total*2),col=vc?new Float32Array(total*3):null;let o=0;
    parts.forEach((p,i)=>{const g=geos[i],P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;nm.getNormalMatrix(p.m);
      if(vc){const c=p.mat.color;for(let k=0;k<P.count;k++){const j=(o+k)*3;col[j]=c.r;col[j+1]=c.g;col[j+2]=c.b;}}
      for(let k=0;k<P.count;k++){const j=o+k;v.fromBufferAttribute(P,k).applyMatrix4(p.m);pos[j*3]=v.x;pos[j*3+1]=v.y;pos[j*3+2]=v.z;
        v.fromBufferAttribute(N,k).applyMatrix3(nm).normalize();nor[j*3]=v.x;nor[j*3+1]=v.y;nor[j*3+2]=v.z;if(U){uv[j*2]=U.getX(k);uv[j*2+1]=U.getY(k);}}
      o+=P.count;});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(col)g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeBoundingSphere();
    const mesh=new THREE.Mesh(g,m);mesh.userData.st=1;if(m.userData.detail)DETAIL.push(mesh);mesh.castShadow=!m.userData.noCast;mesh.receiveShadow=true;if(m.userData.depthMat)mesh.customDepthMaterial=m.userData.depthMat;scene.add(mesh);}
  staticParts.length=0;}

M.flowers=std({map:T.flowers,alphaTest:.4,side:DS,roughness:.8});windify(M.flowers,'grass',.05,2.2);M.flowers.userData.depthMat=depthA(T.flowers,.4);M.flowers.userData.noCast=true;
M.marigold=std({map:T.marigold,roughness:.85});for(const k of ['flowers','grass','fern','marigold'])M[k].userData.detail=true;
T.foam.wrapS=T.foam.wrapT=THREE.RepeatWrapping;T.foam.repeat.set(12,1);
M.foam=new THREE.MeshStandardMaterial({map:T.foam,transparent:true,depthWrite:false,roughness:.5,color:0xffffff,polygonOffset:true,polygonOffsetFactor:-2});
