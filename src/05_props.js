/* ================= Props & building blocks ================= */
const DIST=[];function district(name,x0,z0,x1,z1,w){DIST.push({name,x0,z0,x1,z1,w});}
const wireArr=[];
function wireLine(ax,ay,az,bx,by,bz,sag=.5){for(let k=0;k<8;k++){const t0=k/8,t1=(k+1)/8;const s=t=>Math.sin(t*Math.PI)*sag;wireArr.push(lerp(ax,bx,t0),lerp(ay,by,t0)-s(t0),lerp(az,bz,t0),lerp(ax,bx,t1),lerp(ay,by,t1)-s(t1),lerp(az,bz,t1));}}
const FLAGG=(()=>{const out=[];for(let i=0;i<5;i++){const g=new THREE.PlaneGeometry(.3,.26);g.translate(0,-.13,0);const uv=g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setX(k,(i+uv.getX(k))/5);out.push(g);}return out;})();
const PENG=(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.14,0,0,.14,0,0,0,-.3,0],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,1,.5,0],2));g.computeVertexNormals();return g;})();
function flagLine(ax,ay,az,bx,by,bz,kind='prayer',sag){const dx=bx-ax,dz=bz-az,dy=by-ay;const L=Math.hypot(dx,dy,dz);sag=sag??Math.min(1.2,L*.06);wireLine(ax,ay,az,bx,by,bz,sag);
  const n=Math.floor(L/.36);const ry=-Math.atan2(dz,dx);for(let i=1;i<n;i++){const t=i/n;const x=ax+dx*t,y=ay+dy*t-Math.sin(t*Math.PI)*sag,z=az+dz*t;
    if(kind==='prayer')place(FLAGG[i%5],M.prayer,x,y,z,ry);else place(PENG,M.saffron,x,y,z,ry);}}
function faceBox(b,side,u,y,fw,fh,depth,m,o={}){const {x,z,w,d}=b;let px,pz,bw,bd;
  if(side<2){px=x+u;pz=z+(side===0?1:-1)*(d/2+depth/2-0.02);bw=fw;bd=depth;}else{pz=z+u;px=x+(side===2?1:-1)*(w/2+depth/2-0.02);bw=depth;bd=fw;}
  box(px,y,pz,bw,fh,bd,m,Object.assign({col:false,ts:o.ts===undefined?1:o.ts},o));}
function parapet(x,z,y,w,d,h,m,gap){const t=.28,ph=.75;
  [[0,w],[1,w],[2,d],[3,d]].forEach(([side,len])=>{const segs=gap&&gap.side===side?[[-len/2,gap.from],[gap.to,len/2]]:[[-len/2,len/2]];
    for(const [a,bb] of segs){if(bb-a<.2)continue;const L=bb-a,c=(a+bb)/2;
      if(side<2)box(x+c,y+h,z+(side===0?1:-1)*(d/2-t/2),L,ph,t,m,{ts:3});else box(x+(side===2?1:-1)*(w/2-t/2),y+h,z+c,t,ph,L,m,{ts:3});}});}
const gableCache=new Map();
function gableGeo(L,W,rise){const k=L.toFixed(2)+'|'+W.toFixed(2)+'|'+rise.toFixed(2);let g=gableCache.get(k);if(g)return g;const hl=L/2,hw=W/2,sl=Math.hypot(hw,rise)/2.2,ul=L/2.2;
  const P=[-hl,0,hw, hl,0,hw, hl,rise,0, -hl,rise,0, hl,0,-hw, -hl,0,-hw, -hl,rise,0, hl,rise,0];
  const U=[0,0, ul,0, ul,sl, 0,sl, 0,0, ul,0, ul,sl, 0,sl];
  g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);g.computeVertexNormals();gableCache.set(k,g);return g;}
function gableEndGeo(W,rise){const k='e'+W.toFixed(2)+'|'+rise.toFixed(2);let g=gableCache.get(k);if(g)return g;const hw=W/2;
  g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-hw,0,0,hw,0,rise,0, 0,0,hw,0,0,-hw,0,rise,0],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,W/3,0,W/6,rise/3, W/3,0,0,0,W/6,rise/3],2));g.computeVertexNormals();gableCache.set(k,g);return g;}
function gableRoof(x,y,z,w,d,rm,wm){const alongX=w>=d;const Lw=alongX?w:d,Sw=alongX?d:w;const ov=.45;const rise=Math.min(3.0,Sw*.34);const pitch=rise/(Sw/2);
  const ry=alongX?0:Math.PI/2;place(gableGeo(Lw+ov*2,Sw+ov*2,rise+pitch*ov),rm,x,y-pitch*ov,z,ry);
  for(const s of [-1,1]){if(alongX)place(gableEndGeo(Sw,rise),wm,x+s*Lw/2,y,z,0);else place(gableEndGeo(Sw,rise),wm,x,y,z+s*Lw/2,Math.PI/2);}
  const n=Math.max(2,Math.ceil(rise/.42));for(let i=0;i<n;i++){const hw=Sw/2*(1-(i+1)/n)+.05;const y0=y+i*rise/n,y1=y+(i+1)*rise/n;
    if(alongX)addCol(x-Lw/2,y0,z-hw,x+Lw/2,y1,z+hw,false);else addCol(x-hw,y0,z-Lw/2,x+hw,y1,z+Lw/2,false);}
  return y+rise;}
const PYR=new THREE.ConeGeometry(1,1,4,1);PYR.rotateY(Math.PI/4);PYR.translate(0,.5,0);
const HALFSPH=new THREE.SphereGeometry(1,16,8,0,TAU,0,Math.PI/2);
function chhatri(x,y,z,s,m){for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])place(boxGeo(.16*s,1.5*s,.16*s,0),m,x+a*.7*s,y+.75*s,z+b*.7*s);
  place(boxGeo(1.8*s,.16*s,1.8*s,0),m,x,y+1.58*s,z);place(HALFSPH,m,x,y+1.66*s,z,0,0,0,.75*s,.6*s,.75*s);place(cylGeo(.05,.08,.4,6),M.gold,x,y+2.2*s,z);}
function tankOnRoof(x,y,z){place(cylGeo(.55,.55,1.0,14),M.tankBlk,x,y+.65,z);place(boxGeo(1.2,.15,1.2,0),M.metal,x,y+.08,z);}
function jharokha(b,side,u,wy,m){faceBox(b,side,u,wy-.25,1.5,.25,.65,M.trim,{ts:0});faceBox(b,side,u,wy,1.35,1.55,.55,m,{ts:0});faceBox(b,side,u,wy+.05,1.0,1.35,.58,M.arch,{ts:0});
  const {x,z,w,d}=b;let px,pz;if(side<2){px=x+u;pz=z+(side===0?1:-1)*(d/2+.3);}else{pz=z+u;px=x+(side===2?1:-1)*(w/2+.3);}place(PYR,M.trim,px,wy+1.55,pz,0,0,0,1.0,.55,1.0);}
function balcony(b,side,len,y){const {x,z,w,d}=b;const L=len*.7;let px,pz,bw,bd;if(side<2){px=x;pz=z+(side===0?1:-1)*(d/2+.5);bw=L;bd=1;}else{pz=z;px=x+(side===2?1:-1)*(w/2+.5);bw=1;bd=L;}
  place(boxGeo(bw,.12,bd,1),M.woodDark,px,y,pz);const ox=side<2?0:(side===2?.45:-.45),oz=side<2?(side===0?.45:-.45):0;place(boxGeo(side<2?L:.06,.08,side<2?.06:L,1),M.woodDark,px+ox,y+.95,pz+oz);
  const n=Math.floor(L/.25);for(let i=0;i<=n;i++){const t=-L/2+i*L/n;place(boxGeo(.04,.9,.04,0),M.woodDark,px+(side<2?t:ox),y+.5,pz+(side<2?oz:t));}}
function house(x,z,y,w,d,h,o={}){const st=o.style||'haveli';const b={x,z,w,d};
  const wallM=o.mat||(st==='hill'?pick(TIMBERS):pick(PLASTERS));const floors=Math.max(1,Math.round(h/3));
  if(st==='hill'){const sp=Math.min(3,h);box(x,y,z,w,sp,d,M.fstone,{ts:2});if(h>sp+.1)box(x,y+sp,z,w,h-sp,d,wallM,{ts:3});}
  else box(x,y,z,w,h,d,wallM,{ts:3});
  box(x,y,z,w+.14,.55,d+.14,st==='hill'?M.fstone:M.stoneBase,{ts:1.2,col:false});
  if(st!=='hill')for(let f=1;f<floors;f++)box(x,y+f*3-.07,z,w+.1,.14,d+.1,M.trim,{col:false,ts:0});
  const gable=o.gable!==undefined?o.gable:(st==='hill'||(st==='shop'&&srand()<.6));
  if(gable)gableRoof(x,y+h,z,w,d,o.roofM||(st==='hill'?(srand()<.55?M.slate:pick(TINS)):pick(TINS)),wallM);
  else{parapet(x,z,y,w,d,h,st==='haveli'?M.trim:wallM,o.gap);box(x,y+h+.03,z,w-.56,.02,d-.56,M.roof,{col:false,ts:3});
    if(srand()<.45)tankOnRoof(x+sr(-w/4,w/4),y+h,z+sr(-d/4,d/4));
    if(st==='haveli'&&srand()<.3&&w>5&&d>5)chhatri(x+(w/2-1.3)*(srand()<.5?1:-1),y+h,z+(d/2-1.3)*(srand()<.5?1:-1),1,M.trim);}
  [[0,w],[1,w],[2,d],[3,d]].forEach(([side,len])=>{if(o.blank&&o.blank.includes(side))return;const n=Math.max(1,Math.floor((len-.6)/3.2));const spc=len/n;const front=o.front===side;
    for(let f=0;f<floors;f++){const wy=y+f*3+(f===0?1.0:.9);
      for(let i=0;i<n;i++){const u=-len/2+spc*(i+.5);
        if(f===0&&(front||(i===((n/2)|0)&&srand()<.7))){
          if(st==='shop'&&front){faceBox(b,side,u,y+.05,spc-.6,2.55,.06,M.shopF,{ts:0});faceBox(b,side,u,y+2.65,spc-.3,.55,.08,pick(signs),{ts:0});}
          else if(srand()<.3&&st!=='hill'){faceBox(b,side,u,y,2.4,2.5,.08,M.corr,{ts:1.2});faceBox(b,side,u,y+2.5,2.6,.45,.06,pick(signs),{ts:0});}
          else{faceBox(b,side,u,y,1.45,2.42,.1,M.frame,{ts:0});faceBox(b,side,u,y,1.2,2.28,.14,M.door,{ts:1});}
          continue;}
        if(srand()<.14)continue;
        if(st==='haveli'){if(f>0&&srand()<.2)jharokha(b,side,u,wy,wallM);else{faceBox(b,side,u,wy,1.0,1.5,.07,M.arch,{ts:0});faceBox(b,side,u,wy-.1,1.25,.1,.2,M.sill,{ts:0});}}
        else{faceBox(b,side,u,wy,1.0,1.3,.07,M.woodWin,{ts:0});faceBox(b,side,u,wy-.1,1.2,.1,.18,M.woodDark,{ts:0});faceBox(b,side,u,wy+1.3,1.25,.1,.12,M.woodDark,{ts:0});
          if(srand()<.4){const sm=srand()<.5?M.shutterB:M.shutterG;faceBox(b,side,u-.85,wy,.5,1.32,.05,sm,{ts:0});faceBox(b,side,u+.85,wy,.5,1.32,.05,sm,{ts:0});}}
        if(Math.random()<(st==='hill'?.45:.3))flowerBox(b,side,u,wy-.1);}}
    if(st==='shop'&&front){const aw=pick(TINS);if(side<2){const s=side===0?1:-1;place(boxGeo(len*.94,.05,1.4,1.5),aw,x,y+3.25,z+s*(d/2+.65),0,s*.22,0);}else{const s=side===2?1:-1;place(boxGeo(1.4,.05,len*.94,1.5),aw,x+s*(w/2+.65),y+3.25,z,0,0,-s*.22);}}
    if(st!=='haveli'&&h>5.4&&side===o.balc)balcony(b,side,len,y+3);});
  buildings.push({x,z,w,d,h,y});}
function flowerBox(b,side,u,yy){const {x,z,w,d}=b;faceBox(b,side,u,yy-.3,1.15,.3,.34,M.woodDark,{ts:0});let px,pz,ry=0;const o=.2;
  if(side<2){px=x+u;pz=z+(side===0?1:-1)*(d/2+o);}else{pz=z+u;px=x+(side===2?1:-1)*(w/2+o);ry=Math.PI/2;}
  place(tuftGeo[0],M.flowers,px,yy-.06,pz,ry,0,0,1.15,.75,.3);place(tuftGeo[1],M.flowers,px,yy-.06,pz,ry,0,0,1.15,.6,.3);}
function garland(ax,ay,az,bx,by,bz,sag){const pts=[];const N=16;for(let i=0;i<=N;i++){const t=i/N;pts.push(new V3(lerp(ax,bx,t),lerp(ay,by,t)-Math.sin(t*Math.PI)*sag,lerp(az,bz,t)));}
  const L=Math.hypot(bx-ax,by-ay,bz-az);place(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),Math.max(12,L*3|0),.06,5,false),M.marigold,0,0,0);
  for(let i=1;i<L/.7;i++){const t=i/(L/.7);const p=new V3(lerp(ax,bx,t),lerp(ay,by,t)-Math.sin(t*Math.PI)*sag,lerp(az,bz,t));const l=rand(.3,.6);place(cylGeo(.045,.045,l,5),M.marigold,p.x,p.y-l/2,p.z);}}
function wallRun(side,cx,cz,y,len,h,t,m,openings){let cur=-len/2;
  const seg=(a,bb,y0,y1)=>{if(bb-a<.05||y1-y0<.05)return;const u=(a+bb)/2,L=bb-a;if(side<2)box(cx+u,y+y0,cz,L,y1-y0,t,m,{ts:3});else box(cx,y+y0,cz+u,t,y1-y0,L,m,{ts:3});};
  openings.sort((a,b)=>a.u0-b.u0);for(const o of openings){seg(cur,o.u0,0,h);seg(o.u0,o.u1,0,o.y0);seg(o.u0,o.u1,o.y1,h);cur=o.u1;}seg(cur,len/2,0,h);}
function hollowHouse(x,z,y,w,d,h,o={}){const m=o.mat||(o.style==='hill'?M.fstone:pick(PLASTERS)),t=.3;const doors=o.doors||[(srand()*4)|0];
  for(let side=0;side<4;side++){const len=side<2?w:(d-2*t);const ops=[];
    for(const ds of doors)if(ds===side){const u=sr(-len/2+1.5,len/2-1.5);ops.push({u0:u-1.05,u1:u+1.05,y0:0,y1:2.4,door:true});}
    const n=Math.floor((len-1.5)/3.2);if(h>=3)for(let k=0;k<n;k++){const u=-len/2+(k+.5)*len/n;if(ops.some(q=>q.u0-1<u&&q.u1+1>u))continue;if(srand()<.7)ops.push({u0:u-.55,u1:u+.55,y0:1.15,y1:2.25});}
    const cx=side<2?x:x+(side===2?1:-1)*(w/2-t/2),cz=side<2?z+(side===0?1:-1)*(d/2-t/2):z;
    wallRun(side,cx,cz,y,len,h,t,m,ops.map(q=>Object.assign({},q)));
    for(const q of ops){const u=(q.u0+q.u1)/2,ww=q.u1-q.u0;const ox=side<2?cx+u:cx+(side===2?1:-1)*t/2,oz=side<2?cz+(side===0?1:-1)*t/2:cz+u;
      if(q.door){if(side<2)box(ox,y+2.4,oz,ww+.3,.16,.1,M.woodDark,{col:false,ts:0});else box(ox,y+2.4,oz,.1,.16,ww+.3,M.woodDark,{col:false,ts:0});}
      else{if(side<2)box(ox,y+q.y0-.08,oz,ww+.2,.08,.22,M.woodDark,{col:false,ts:0});else box(ox,y+q.y0-.08,oz,.22,.08,ww+.2,M.woodDark,{col:false,ts:0});}}}
  if(o.style==='hill'){box(x,y+h-.2,z,w,.2,d,M.woodDark,{ts:2});gableRoof(x,y+h,z,w,d,srand()<.5?M.slate:pick(TINS),m===M.fstone?pick(TIMBERS):m);}
  else{box(x,y+h-.22,z,w,.22,d,M.roof,{ts:3});parapet(x,z,y,w,d,h,m,o.gap);}
  const fl=new THREE.PlaneGeometry(w-.6,d-.6);fl.rotateX(-Math.PI/2);const uv=fl.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(w-.6)/3,uv.getY(i)*(d-.6)/3);place(fl,o.style==='hill'?M.wood:M.tile,x,y+.02,z);
  if(srand()<.6)crate(x+sr(-w/4,w/4),z+sr(-d/4,d/4),1,y);if(srand()<.4)box(x-w/2+1.2,y,z-d/2+.8,1.6,.8,.7,M.wood,{ts:0});
  buildings.push({x,z,w,d,h,y,hollow:true});}
function stairsVis(x,z0,y0,dirZ,n,width,stepH,stepD,m){for(let i=0;i<n;i++){const top=y0+(i+1)*stepH;const cz=z0+dirZ*(i+.5)*stepD;box(x,y0-1,cz,width,top-y0+1,stepD,m,{ts:1.5,col:false});}}
function crate(x,z,s=1.1,y,ry=0){y=y??Hx(x,z);box(x,y,z,s,s,s,M.crate,{ts:0,ry});}
function barrel(x,z,m,y){y=y??Hx(x,z);place(cylGeo(.3,.3,.92,14),m,x,y+.46,z);place(cylGeo(.31,.31,.05,14),M.pole,x,y+.3,z);place(cylGeo(.31,.31,.05,14),M.pole,x,y+.62,z);addCol(x-.3,y,z-.3,x+.3,y+.92,z+.3);}
function lpg(x,z,y){y=y??Hx(x,z);gasCyl(x,z,y);}
const bagGeo=boxGeo(.62,.22,.34,0);
function sandbags(x,z,len,ry=0,layers=4,y){y=y??Hx(x,z);const n=Math.round(len/.6);const c=Math.cos(ry),s=Math.sin(ry);
  for(let l=0;l<layers;l++)for(let i=0;i<n;i++){const u=-len/2+(i+.5+(l%2)*.5)*(len/n);if(u>len/2)continue;place(bagGeo,M.sandbag,x+c*u,y+l*.21+.11,z-s*u,ry+sr(-.08,.08),0,sr(-.05,.05));}
  const hw=Math.abs(c)*len/2+Math.abs(s)*.2,hd=Math.abs(s)*len/2+Math.abs(c)*.2;addCol(x-hw,y,z-hd,x+hw,y+layers*.21+.02,z+hd);}
function rotP(x,z,ry){const c=Math.cos(ry),s=Math.sin(ry);return (u,v)=>[x+c*u+s*v,z-s*u+c*v];}
function rotCol(x,z,y,hw,hd,ry,h){const c=Math.abs(Math.cos(ry)),s=Math.abs(Math.sin(ry));addCol(x-(c*hw+s*hd),y,z-(s*hw+c*hd),x+(c*hw+s*hd),y+h,z+(s*hw+c*hd));}
function jeep(x,z,ry,m=M.jeep){const y=Hx(x,z);const P=rotP(x,z,ry);const put=(u,yy,v,w,h,d,mm)=>{const [px,pz]=P(u,v);place(boxGeo(w,h,d,0),mm,px,y+yy+h/2,pz,ry);};
  put(0,.45,0,1.8,.75,4.0,m);put(0,1.2,.35,1.75,.7,2.2,m);put(0,1.3,-.78,1.6,.5,.06,M.glass);
  put(.89,1.3,.35,.04,.42,1.9,M.glass);put(-.89,1.3,.35,.04,.42,1.9,M.glass);put(0,.62,-2.05,1.6,.25,.12,M.pole);put(0,.82,-1.4,1.7,.08,1.0,m);
  [[.82,1.3],[-.82,1.3],[.82,-1.35],[-.82,-1.35]].forEach(([u,v])=>{const [px,pz]=P(u,v);place(cylGeo(.42,.42,.3,16),M.tire,px,y+.42,pz,ry,0,Math.PI/2);place(cylGeo(.2,.2,.32,10),M.rim,px,y+.42,pz,ry,0,Math.PI/2);});
  const [sx,sz]=P(0,2.12);place(cylGeo(.42,.42,.28,16),M.tire,sx,y+1.05,sz,ry,Math.PI/2,0);rotCol(x,z,y,.95,2.1,ry,1.55);}
const HALFCYL=(()=>{const g=new THREE.CylinderGeometry(1.25,1.25,4.4,12,1,true,-Math.PI/2,Math.PI);g.rotateX(Math.PI/2);return g;})();
function truck(x,z,ry,m=M.olive){const y=Hx(x,z);const P=rotP(x,z,ry);const put=(u,yy,v,w,h,d,mm)=>{const [px,pz]=P(u,v);place(boxGeo(w,h,d,0),mm,px,y+yy+h/2,pz,ry);};
  put(0,.6,0,2.3,.5,7,m);put(0,1.1,-2.6,2.3,1.5,1.8,m);put(0,1.9,-3.52,2.1,.6,.05,M.glass);put(0,1.1,1.0,2.3,.6,4.6,m);
  const [hx,hz]=P(0,1.0);place(HALFCYL,M.canvas,hx,y+1.7,hz,ry,0,0,.94,1,1);
  [[1.05,-2.6],[-1.05,-2.6],[1.05,.6],[-1.05,.6],[1.05,2.1],[-1.05,2.1]].forEach(([u,v])=>{const [px,pz]=P(u,v);place(cylGeo(.5,.5,.36,16),M.tire,px,y+.5,pz,ry,0,Math.PI/2);place(cylGeo(.25,.25,.38,10),M.rim,px,y+.5,pz,ry,0,Math.PI/2);});
  rotCol(x,z,y,1.2,3.5,ry,2.9);}
function bus(x,z,ry){const y=Hx(x,z);const P=rotP(x,z,ry);const [cx,cz]=P(0,0);place(boxGeo(2.5,2.6,10.5,0),M.bus,cx,y+1.65,cz,ry);place(boxGeo(2.55,.12,10.6,0),M.tinR,cx,y+3.0,cz,ry);
  [[1.1,3.5],[-1.1,3.5],[1.1,-3.5],[-1.1,-3.5]].forEach(([u,v])=>{const [px,pz]=P(u,v);place(cylGeo(.5,.5,.3,14),M.tire,px,y+.42,pz,ry,0,Math.PI/2);});rotCol(x,z,y,1.25,5.25,ry,3.0);}
const CONE=new THREE.ConeGeometry(1,1,10,1,true);CONE.translate(0,.5,0);
const CONE6=new THREE.ConeGeometry(1,1,6,1,true);CONE6.translate(0,.5,0);
function deodar(x,z,h,low=false){const y=Hx(x,z)-.2;place(cylGeo(.12*h/12,.3*h/12,h*.85,low?5:8),M.bark,x,y+h*.42,z);
  const n=low?4:7;for(let i=0;i<n;i++){const t=i/(n-1);const r=(1-t*.86)*h*.27+.25;const hh=r*1.05;const ly=y+h*(.24+.66*t);place(low?CONE6:CONE,M.needle,x+sr(-.2,.2),ly,z+sr(-.2,.2),sr(0,TAU),0,0,r,hh,r);}
  if(!low)addCol(x-.3,y,z-.3,x+.3,y+h*.8,z+.3,false);}
function broadTree(x,z,s,y){y=y??Hx(x,z);place(cylGeo(.35*s,.6*s,4.2*s,9),M.bark,x,y+2.1*s,z);
  for(let i=0;i<5;i++){const a=i/5*TAU;place(cylGeo(.08*s,.22*s,2.4*s,6),M.bark,x+Math.cos(a)*.9*s,y+4.6*s,z+Math.sin(a)*.9*s,a,0,.9);}
  for(let i=0;i<26;i++){const a=sr(0,TAU),r=sr(0,3.4)*s;place(tuftGeo[0],M.leaf,x+Math.cos(a)*r,y+sr(4.2,7.5)*s,z+Math.sin(a)*r,sr(0,3),sr(-.6,.6),0,3.2*s,3.8*s,3.2*s);}
  addCol(x-.6*s,y,z-.6*s,x+.6*s,y+4*s,z+.6*s,true);}
const tuftGeo=(()=>{const g1=new THREE.PlaneGeometry(1,.7);g1.translate(0,.35,0);const a=g1.toNonIndexed();const b=a.clone();b.rotateY(Math.PI/2);return [a,b];})();
function tuft(x,z,m=M.grass,s=1,y){y=y??Hx(x,z);const r=sr(0,3);place(tuftGeo[0],m,x,y-.02,z,r,0,0,s,s,s);place(tuftGeo[1],m,x,y-.02,z,r,0,0,s,s,s);}
function bushAt(x,z,s,m=M.rhodo,y){y=y??Hx(x,z);const r=sr(0,3);place(tuftGeo[0],m,x,y-.05,z,r,0,0,s*1.6,s*1.5,s);place(tuftGeo[1],m,x,y-.05,z,r,0,0,s*1.6,s*1.5,s);}
const DODE=new THREE.DodecahedronGeometry(1,0);
function rock(x,z,s){place(DODE,M.rock,x,Hx(x,z)+s*.1,z,sr(0,3),sr(0,1),0,s,s*.55,s*.85);}
function boulder(x,z,s){const y=Hx(x,z);place(DODE,M.rock,x,y+s*.4,z,sr(0,3),sr(0,1),sr(0,1),s,s*.85,s*.9);addCol(x-s*.62,y,z-s*.62,x+s*.62,y+s*1.1,z+s*.62);}
function log(x,z,len,ry){const y=Hx(x,z);place(cylGeo(.32,.36,len,10),M.bark,x,y+.32,z,ry,0,Math.PI/2);rotCol(x,z,y,len/2,.34,ry,.66);}
function stall(x,z,ry,am,y){y=y??Hx(x,z);const P=rotP(x,z,ry);
  [[-1.4,-1],[1.4,-1],[-1.4,1],[1.4,1]].forEach(([u,v])=>{const [px,pz]=P(u,v);place(boxGeo(.1,2.5,.1,0),M.woodDark,px,y+1.25,pz,ry);});
  const [cx,cz]=P(0,0);place(boxGeo(3.1,.05,2.4,1.5),am,cx,y+2.5,cz,ry,.14,0);
  const [tx,tz]=P(0,-.35);place(boxGeo(2.6,.85,.9,0),M.wood,tx,y+.425,tz,ry);
  const gm=[M.goods1,M.goods2,M.goods3,M.goods4];for(let i=0;i<6;i++){const [gx,gz]=P(-1+i*.4,-.35+sr(-.2,.2));place(boxGeo(.3,.18,.3,0),gm[i%4],gx,y+.94,gz,ry+sr(-.3,.3));}
  rotCol(tx,tz,y,1.3,.45,ry,.85);}
const TENT=(()=>{const g=new THREE.CylinderGeometry(2.2,2.2,4.5,3,1,true);g.rotateZ(Math.PI/2);g.rotateX(-Math.PI/2);return g;})();
function tent(x,z,ry,m){const y=Hx(x,z);place(TENT,m,x,y+1.1,z,ry);rotCol(x,z,y,2.25,1.7,ry,2.2);}
function lowWall(x0,z0,x1,z1,h=1.1,m=M.fstone,t=.5,y){const cx=(x0+x1)/2,cz=(z0+z1)/2;y=y??Hx(cx,cz);if(Math.abs(x1-x0)>Math.abs(z1-z0))box(cx,y-.3,z0,Math.abs(x1-x0),h+.3,t,m,{ts:1.5});else box(x0,y-.3,cz,t,h+.3,Math.abs(z1-z0),m,{ts:1.5});}
function courtyard(x,z,y,w,d){const h=2.5,t=.4,m=srand()<.6?M.fstone:pick(PLASTERS);const gs=(srand()*4)|0;
  for(let side=0;side<4;side++){const len=side<2?w:d-2*t;const ops=side===gs?[{u0:-1.2,u1:1.2,y0:0,y1:h+1}]:(srand()<.3?[{u0:-.5+len*.2,u1:.5+len*.2,y0:1.2,y1:2}]:[]);
    const cx=side<2?x:x+(side===2?1:-1)*(w/2-t/2),cz=side<2?z+(side===0?1:-1)*(d/2-t/2):z;wallRun(side,cx,cz,y,len,h,t,m,ops);}
  if(srand()<.5)deodar(x+sr(-1,1),z+sr(-1,1),sr(7,10));else box(x,y,z,1.4,.7,1.4,M.stone,{ts:1});
  for(let i=0;i<3;i++)if(srand()<.6)crate(x+sr(-w/2+1.2,w/2-1.2),z+sr(-d/2+1.2,d/2-1.2),sr(.8,1.1),y);
  for(let i=0;i<6;i++)tuft(x+sr(-w/2+.8,w/2-.8),z+sr(-d/2+.8,d/2-.8),M.grass,sr(.6,1),y);
  buildings.push({x,z,w,d,h,y,court:true});}
function firewood(x,z,ry,y){y=y??Hx(x,z);const P=rotP(x,z,ry);for(let l=0;l<4;l++)for(let i=0;i<5;i++){const [px,pz]=P(-.7+i*.35,0);place(cylGeo(.11,.11,.9,6),M.bark,px,y+.12+l*.21,pz,ry,Math.PI/2,0);}rotCol(x,z,y,.9,.45,ry,.95);}
function lampPost(x,z,y){y=y??Hx(x,z);place(cylGeo(.06,.09,4.2,8),M.pole,x,y+2.1,z);place(boxGeo(.9,.06,.06,0),M.pole,x+.4,y+4.1,z);place(boxGeo(.22,.3,.22,0),M.glass,x+.82,y+3.9,z);addCol(x-.1,y,z-.1,x+.1,y+4.2,z+.1,false);}
function ePole(x,z,y){y=y??Hx(x,z);place(cylGeo(.1,.14,8,8),M.woodDark,x,y+4,z);place(boxGeo(1.8,.1,.1,0),M.woodDark,x,y+7.4,z);addCol(x-.15,y,z-.15,x+.15,y+8,z+.15,false);return [x,y+7.4,z];}
function boat(x,z,ry){const y=WATER-.32;const P=rotP(x,z,ry);const [cx,cz]=P(0,0);place(boxGeo(1.5,.55,4.6,2),M.boat,cx,y+.27,cz,ry);
  for(const s of [-1,1]){const [px,pz]=P(0,s*2.6);place(boxGeo(1.05,.55,1.05,1),M.boat,px,y+.3,pz,ry+Math.PI/4);}
  for(let i=-1;i<=1;i++){const [px,pz]=P(0,i*1.3);place(boxGeo(1.4,.06,.3,0),M.wood,px,y+.5,pz,ry);}rotCol(x,z,y,.78,3.0,ry,.62);}
function umbrella(x,z,y){place(cylGeo(.04,.05,2.8,6),M.woodDark,x,y+1.4,z);place(new THREE.ConeGeometry(1.8,.5,12,1,true),M.hay,x,y+2.85,z);}
function chowki(x,z,y){box(x,y,z,2,.55,1.3,M.wood,{ts:1});}
