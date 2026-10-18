/* ================= Terrain ================= */
const WATER=-5.6,SHELF=-6.2;
const GSTEPS=[];(()=>{let z=34,y=0;const st=n=>{for(let i=0;i<n;i++){y=Math.round((y-.31)*100)/100;GSTEPS.push({z0:z,z1:z+.8,y});z+=.8;}};const ld=L=>{GSTEPS.push({z0:z,z1:z+L,y,land:true});z+=L;};st(5);ld(3);st(6);ld(2.2);st(9);})();
const GHAT_END=GSTEPS[GSTEPS.length-1].z1;
function ghatY(z){for(let i=0;i<GSTEPS.length;i++)if(z<GSTEPS[i].z1)return GSTEPS[i].y;return SHELF;}
const BANDS=[{zl:11,zh:4,yl:0,yh:4.5},{zl:-15,zh:-22,yl:4.5,yh:9},{zl:-40,zh:-47,yl:9,yh:13.5}];
function bandY(z,b){const d=(b.zl-b.zh)/15;const k=clamp(Math.ceil((b.zl-z)/d-1e-6),0,15);return b.yl+k*.3;}
function tierT(z){if(z>=GHAT_END)return SHELF;if(z>=34)return ghatY(z);if(z>=11)return 0;if(z>=4)return bandY(z,BANDS[0]);if(z>=-15)return 4.5;if(z>=-22)return bandY(z,BANDS[1]);if(z>=-40)return 9;if(z>=-47)return bandY(z,BANDS[2]);return 13.5;}
const SPF=[[400,60],[160,28],[108,6],[86,-8.5],[66,-8.5],[63.6,SHELF],[55.2,SHELF],[46,-3],[36,-.2],[22,1.6],[6,4.2],[-14,5.4],[-30,9.6],[-48,13.6],[-72,16.5],[-200,40],[-600,60]];
function Sf(z){for(let i=0;i<SPF.length-1;i++){const a=SPF[i],b=SPF[i+1];if(z<=a[0]&&z>=b[0]){const t=(a[0]-z)/(a[0]-b[0]);const s=t*t*(3-2*t);return a[1]+(b[1]-a[1])*s;}}return z>SPF[0][0]?SPF[0][1]:SPF[SPF.length-1][1];}
function hash2(x,z){const h=Math.sin(x*127.1+z*311.7)*43758.5453;return h-Math.floor(h);}
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi;const u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);const a=hash2(xi,zi),b=hash2(xi+1,zi),c=hash2(xi,zi+1),d=hash2(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,z){return vnoise(x,z)*.5+vnoise(x*2.1+5.2,z*2.1+1.3)*.3+vnoise(x*4.3+9.1,z*4.3+7.7)*.2;}
function forestN(x,z){let n=(fbm(x*.045,z*.045)-.5)*2.6*(1-smooth(46,55,z));if(z>70)n+=(fbm(x*.02,z*.02)-.5)*14*smooth(80,110,z);const ax=Math.abs(x);if(ax>100)n+=(fbm(x*.015,z*.015)-.5)*18*smooth(100,140,ax);return n;}
function Hx(x,z){const ax=Math.abs(x);let h;
  if(ax>=70||z>=63.6)h=Sf(z)+forestN(x,z);
  else{h=tierT(z);const w=smooth(60,70,ax);if(w>0)h=lerp(h,Sf(z)+forestN(x,z),w);}
  if(ax>96)h+=(ax-96)*.38;if(z<-200)h+=(-200-z)*.5;
  if(ax>56&&ax<100&&z>-30&&z<30){const p=smooth(68,76,ax)*(1-smooth(18,26,Math.abs(z)));const r=(1-smooth(3.5,8,Math.abs(z+6.5)))*smooth(56,60,ax);const k=Math.max(p,r);if(k>0)h=lerp(h,4.5,k);}
  if(z>GHAT_END-.01&&z<63.6&&ax<120)h=Math.min(h,SHELF);
  if(ax<12&&z>56&&z<64){const d=Math.max(ax/9,Math.abs(z-60)/2.4);if(d<1.35)h=lerp(-5.15,h,smooth(.85,1.35,d));}
  return h;}
const HG={x0:-110,z0:-84,s:.5,nx:441,nz:317,a:null};
function buildHG(){const {x0,z0,s,nx,nz}=HG;const a=HG.a=new Float32Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)a[j*nx+i]=Hx(x0+i*s,z0+j*s);}
function Hg(x,z){const fx=(x-HG.x0)/HG.s,fz=(z-HG.z0)/HG.s;const i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=HG.nx-1||j>=HG.nz-1)return Hx(x,z);const tx=fx-i,tz=fz-j,a=HG.a,k=j*HG.nx+i;return (a[k]*(1-tx)+a[k+1]*tx)*(1-tz)+(a[k+HG.nx]*(1-tx)+a[k+HG.nx+1]*tx)*tz;}
const _tn=new V3();
function tNorm(x,z){const e=.3;return _tn.set(Hx(x-e,z)-Hx(x+e,z),2*e,Hx(x,z-e)-Hx(x,z+e)).normalize();}
function rayTerrain(o,d,maxT){const HMAX=20;let t=0;if(o.y>HMAX){if(d.y>=0)return -1;t=(o.y-HMAX)/-d.y;if(t>maxT)return -1;}
  if(o.y+d.y*t<Hg(o.x+d.x*t,o.z+d.z*t))return t;let prev=t;
  while(t<maxT){prev=t;t=Math.min(maxT,t+.6);const y=o.y+d.y*t;if(y>HMAX&&d.y>=0)return -1;
    if(y<Hg(o.x+d.x*t,o.z+d.z*t)){let a=prev,b=t;for(let k=0;k<6;k++){const m=(a+b)/2;if(o.y+d.y*m<Hg(o.x+d.x*m,o.z+d.z*m))b=m;else a=m;}return b;}}
  return -1;}

/* terrain meshes */
function terrainGeo(x0,z0,x1,z1,step,outer){const nx=Math.round((x1-x0)/step),nz=Math.round((z1-z0)/step);const vc=(nx+1)*(nz+1);
  const pos=new Float32Array(vc*3),uv=new Float32Array(vc*2),sp=new Float32Array(vc*2);
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*(nx+1)+i;const x=x0+i*step,z=z0+j*step;let h=Hx(x,z);
    if(outer&&x>-99.5&&x<99.5&&z>-77.5&&z<69.5)h-=5;
    pos[k*3]=x;pos[k*3+1]=h;pos[k*3+2]=z;uv[k*2]=x/4;uv[k*2+1]=-z/4;
    const sl=outer?Math.abs(Hx(x+step,z)-Hx(x-step,z))/(2*step)+Math.abs(Hx(x,z+step)-Hx(x,z-step))/(2*step):Math.abs(Hx(x+1,z)-Hx(x-1,z))/2+Math.abs(Hx(x,z+1)-Hx(x,z-1))/2;
    const ax=Math.abs(x);let dirt=smooth(.58,.75,fbm(x*.07+3,z*.07+9));
    if(z>44&&z<70)dirt=Math.max(dirt,smooth(44,52,z)*.85);
    if(ax<62&&z>-40&&z<-22)dirt=Math.max(dirt,.72);
    if(ax>70&&ax<100&&Math.abs(z)<22)dirt=Math.max(dirt,.6);
    if(ax>56&&ax<100&&Math.abs(z+6.5)<4)dirt=Math.max(dirt,.9);
    let rock=smooth(.6,.98,sl)+(outer?smooth(70,120,h)*.6:0);if(z>56&&z<66)rock=Math.max(rock,.35);
    sp[k*2]=clamp(dirt,0,1);sp[k*2+1]=clamp(rock,0,1);}
  const idx=new Uint32Array(nx*nz*6);let q=0;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx[q++]=a;idx[q++]=c;idx[q++]=b;idx[q++]=b;idx[q++]=c;idx[q++]=d;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('splat',new THREE.BufferAttribute(sp,2));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();return g;}
const terrMat=mat(T.forest,{roughness:.95,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:2});
terrMat.onBeforeCompile=sh=>{sh.uniforms.map2={value:T.soil.c};sh.uniforms.map3={value:T.rockG.c};
  sh.vertexShader='attribute vec2 splat;varying vec2 vSplat;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSplat=splat;');
  sh.fragmentShader='uniform sampler2D map2;uniform sampler2D map3;varying vec2 vSplat;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
  vec4 tg=texture2D(map,vUv);vec4 td=texture2D(map2,vUv*1.15);vec4 tr=texture2D(map3,vUv*.55);
  tr.rgb*=vec3(.74,.72,.69);vec4 sampledDiffuseColor=mix(mix(tg,td,vSplat.x),tr,vSplat.y);float mac=texture2D(map2,vUv*.043).g*.6+texture2D(map,vUv*.11).g*.4;sampledDiffuseColor.rgb*=mix(.78,1.18,smoothstep(.15,.75,mac));
  diffuseColor*=sampledDiffuseColor;
#endif`);};
terrMat.customProgramCacheKey=()=>'terrain';
function buildTerrain(){const inner=new THREE.Mesh(terrainGeo(-100,-78,100,70,1,false),terrMat);inner.receiveShadow=true;inner.castShadow=true;scene.add(inner);
  const outer=new THREE.Mesh(terrainGeo(-560,-640,560,520,8,true),terrMat);outer.receiveShadow=true;scene.add(outer);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(1300,700),M.water);water.rotation.x=-Math.PI/2;water.position.set(0,WATER,46+350);water.receiveShadow=true;scene.add(water);}
function buildMountains(){const mk=(cx,cz,len,depth,hmax,rotY,seedOff)=>{const nu=96,nv=24;const g=new THREE.PlaneGeometry(len,depth,nu,nv);g.rotateX(-Math.PI/2);const p=g.attributes.position;const col=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getZ(i);const e=1-Math.pow(Math.abs(v)/(depth/2),2);const n1=1-Math.abs(vnoise(u*.004+seedOff,v*.006)*2-1),n2=1-Math.abs(vnoise(u*.012+seedOff*2,v*.015)*2-1);
      const h=Math.max(0,e)*(Math.pow(n1,1.6)*.8+n2*.3)*hmax*(.6+.4*Math.sin(u*.002+seedOff));p.setY(i,h);
      const snow=smooth(hmax*.22,hmax*.32,h+(vnoise(u*.03,v*.03)-.5)*60);const sh=.85+vnoise(u*.05,v*.05)*.3;const r=lerp(.30*sh,.95,snow),gg=lerp(.34*sh,.97,snow),b=lerp(.42*sh,1.02,snow);const fa=.28;col[i*3]=lerp(r,.70,fa);col[i*3+1]=lerp(gg,.79,fa);col[i*3+2]=lerp(b,.9,fa);}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,flatShading:true,fog:false}));m.position.set(cx,-20,cz);m.rotation.y=rotY;scene.add(m);};
  mk(0,-760,2600,420,520,0,1.3);mk(-900,-200,1400,360,380,Math.PI/2,4.2);mk(900,-150,1400,360,400,-Math.PI/2,7.7);mk(0,820,2400,300,260,Math.PI,2.9);}
