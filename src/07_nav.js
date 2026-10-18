/* ================= Spatial grid, rays ================= */
const CG={cs:6,x0:-102,z0:-78,nx:34,nz:26,cells:null,stamp:1};
function buildColGrid(){CG.cells=Array.from({length:CG.nx*CG.nz},()=>[]);for(const c of colliders){const i0=clamp(Math.floor((c.minX-CG.x0)/CG.cs),0,CG.nx-1),i1=clamp(Math.floor((c.maxX-CG.x0)/CG.cs),0,CG.nx-1),j0=clamp(Math.floor((c.minZ-CG.z0)/CG.cs),0,CG.nz-1),j1=clamp(Math.floor((c.maxZ-CG.z0)/CG.cs),0,CG.nz-1);
  for(let j=j0;j<=j1;j++)for(let k=i0;k<=i1;k++)CG.cells[j*CG.nx+k].push(c);}}
const _cand=[];
function gather(minX,minZ,maxX,maxZ){_cand.length=0;const s=++CG.stamp;const i0=clamp(Math.floor((minX-CG.x0)/CG.cs),0,CG.nx-1),i1=clamp(Math.floor((maxX-CG.x0)/CG.cs),0,CG.nx-1),j0=clamp(Math.floor((minZ-CG.z0)/CG.cs),0,CG.nz-1),j1=clamp(Math.floor((maxZ-CG.z0)/CG.cs),0,CG.nz-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cell=CG.cells[j*CG.nx+i];for(let k=0;k<cell.length;k++){const c=cell[k];if(c.st!==s){c.st=s;_cand.push(c);}}}return _cand;}
function rayWorld(o,d,maxT){let best=maxT,hit=false,nx=0,ny=0,nz=0,hc=null;const ix=1/d.x,iy=1/d.y,iz=1/d.z;const s=++CG.stamp;
  const {cs,x0,z0,nx:GX,nz:GZ,cells}=CG;let cx=Math.floor((o.x-x0)/cs),cz=Math.floor((o.z-z0)/cs);
  const stepX=d.x>0?1:-1,stepZ=d.z>0?1:-1;let tMaxX=d.x!==0?((cx+(d.x>0?1:0))*cs+x0-o.x)*ix:Infinity,tMaxZ=d.z!==0?((cz+(d.z>0?1:0))*cs+z0-o.z)*iz:Infinity;
  const tdX=d.x!==0?Math.abs(cs*ix):Infinity,tdZ=d.z!==0?Math.abs(cs*iz):Infinity;let t=0,guard=0;
  while(t<=best&&guard++<200){
    if(cx>=0&&cz>=0&&cx<GX&&cz<GZ){const cell=cells[cz*GX+cx];for(let k=0;k<cell.length;k++){const c=cell[k];if(c.st===s)continue;c.st=s;
      let t1=(c.minX-o.x)*ix,t2=(c.maxX-o.x)*ix;let tmin=Math.min(t1,t2),tmax=Math.max(t1,t2),ax=0;
      t1=(c.minY-o.y)*iy;t2=(c.maxY-o.y)*iy;let a=Math.min(t1,t2),b=Math.max(t1,t2);if(a>tmin){tmin=a;ax=1;}if(b<tmax)tmax=b;if(tmax<tmin)continue;
      t1=(c.minZ-o.z)*iz;t2=(c.maxZ-o.z)*iz;a=Math.min(t1,t2);b=Math.max(t1,t2);if(a>tmin){tmin=a;ax=2;}if(b<tmax)tmax=b;
      if(tmax<tmin||tmin<0||tmin>=best)continue;best=tmin;hit=true;hc=c;nx=ny=nz=0;if(ax===0)nx=-stepX;else if(ax===1)ny=d.y>0?-1:1;else nz=-stepZ;}}
    else if((cx<0&&stepX<0)||(cx>=GX&&stepX>0)||(cz<0&&stepZ<0)||(cz>=GZ&&stepZ>0))break;
    if(tMaxX<tMaxZ){t=tMaxX;tMaxX+=tdX;cx+=stepX;}else{t=tMaxZ;tMaxZ+=tdZ;cz+=stepZ;}}
  const tt=rayTerrain(o,d,best);if(tt>=0&&tt<best){best=tt;hit=true;hc=null;const n=tNorm(o.x+d.x*tt,o.z+d.z*tt);nx=n.x;ny=n.y;nz=n.z;}
  return hit?{t:best,nx,ny,nz,c:hc}:null;}
const _lo=new V3(),_ld=new V3();
function losClear(ax,ay,az,bx,by,bz){_lo.set(ax,ay,az);_ld.set(bx-ax,by-ay,bz-az);const L=_ld.length();if(L<.01)return true;_ld.divideScalar(L);return !rayWorld(_lo,_ld,L-.15);}
function raySoldier(o,d,s,maxT){const top=s.pos.y+s.h;const hy=top-.13,hr=.16;
  let lx=o.x-s.pos.x,ly=o.y-hy,lz=o.z-s.pos.z;let b=lx*d.x+ly*d.y+lz*d.z,c=lx*lx+ly*ly+lz*lz-hr*hr,disc=b*b-c;let best=null;
  if(disc>0){const t=-b-Math.sqrt(disc);if(t>0&&t<maxT)best={t,head:true};}
  const r=.3;const a=d.x*d.x+d.z*d.z;if(a>1e-6){b=lx*d.x+lz*d.z;c=lx*lx+lz*lz-r*r;disc=b*b-a*c;if(disc>0){const t=(-b-Math.sqrt(disc))/a;if(t>0&&t<maxT&&(!best||t<best.t)){const y=o.y+d.y*t;if(y>=s.pos.y&&y<=top-.28)best={t,head:false};}}}
  return best;}

/* ================= Navigation ================= */
const NAV={cs:1,x0:-95,z0:-72,nx:190,nz:136};
const DX=[1,-1,0,0,1,1,-1,-1],DZ=[0,0,1,-1,1,-1,1,-1];
const cellOf=(x,z)=>{const i=Math.floor((x-NAV.x0)/NAV.cs),j=Math.floor((z-NAV.z0)/NAV.cs);if(i<0||j<0||i>=NAV.nx||j>=NAV.nz)return -1;return j*NAV.nx+i;};
const cellX=i=>NAV.x0+((i%NAV.nx)+.5)*NAV.cs,cellZ=i=>NAV.z0+(((i/NAV.nx)|0)+.5)*NAV.cs;
const freeAt=(x,z)=>{const c=cellOf(x,z);return c>=0&&!NAV.blk[c];};
const navH=(x,z)=>{const c=cellOf(x,z);return c>=0?NAV.h[c]:Hx(x,z);};
function buildNav(){const {cs,x0,z0,nx,nz}=NAV;const N=nx*nz;NAV.blk=new Uint8Array(N);NAV.h=new Float32Array(N);const inf=.45;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const cx=x0+(i+.5)*cs,cz=z0+(j+.5)*cs;let g=Hx(cx,cz);
    let b=cx<BOUND.x0+.3||cx>BOUND.x1-.3||cz<BOUND.z0+.3||cz>BOUND.z1-.3;
    const cand=gather(cx-inf,cz-inf,cx+inf,cz+inf);
    for(const c of cand)if((c.kind==='fill'||c.kind==='plat')&&cx>=c.minX&&cx<=c.maxX&&cz>=c.minZ&&cz<=c.maxZ&&c.maxY>g)g=c.maxY;
    if(!b)for(const c of cand){if(c.maxY-g<.45||c.minY-g>1.7)continue;const qx=clamp(cx,c.minX,c.maxX),qz=clamp(cz,c.minZ,c.maxZ);if((qx-cx)**2+(qz-cz)**2<inf*inf){b=true;break;}}
    if(g<SHELF-.4)b=true;NAV.blk[j*nx+i]=b?1:0;NAV.h[j*nx+i]=g;}
  NAV.gs=new Float32Array(N);NAV.from=new Int32Array(N);NAV.mark=new Uint32Array(N);NAV.closed=new Uint32Array(N);NAV.stamp=0;
  const reach=new Uint8Array(N);const st=nearestFree(cellOf(-86,0));const q=[st];reach[st]=1;
  for(let h=0;h<q.length;h++){const c=q[h];const x=c%nx,z=(c/nx)|0;for(let k=0;k<4;k++){const X=x+DX[k],Z=z+DZ[k];if(X<0||Z<0||X>=nx||Z>=nz)continue;const n=Z*nx+X;if(!reach[n]&&!NAV.blk[n]&&Math.abs(NAV.h[n]-NAV.h[c])<.8){reach[n]=1;q.push(n);}}}
  let cnt=0;for(let i=0;i<N;i++){if(!reach[i])NAV.blk[i]=1;else cnt++;}NAV.count=cnt;}
function nearestFree(c){if(c<0)return -1;if(!NAV.blk[c])return c;const cx=c%NAV.nx,cz=(c/NAV.nx)|0;for(let r=1;r<10;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)!==r&&Math.abs(dz)!==r)continue;const x=cx+dx,z=cz+dz;if(x<0||z<0||x>=NAV.nx||z>=NAV.nz)continue;const i=z*NAV.nx+x;if(!NAV.blk[i])return i;}return -1;}
function astar(sx,sz,gx,gz,noise){const {nx,nz,blk,gs,from,mark,closed,h:HH}=NAV;let s=nearestFree(cellOf(clamp(sx,BOUND.x0,BOUND.x1),clamp(sz,BOUND.z0,BOUND.z1))),g=nearestFree(cellOf(clamp(gx,BOUND.x0,BOUND.x1),clamp(gz,BOUND.z0,BOUND.z1)));if(s<0||g<0)return null;
  const stamp=++NAV.stamp;const hq=[],hf=[];
  const push=(i,f)=>{hq.push(i);hf.push(f);let k=hq.length-1;while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[hq[p],hq[k]]=[hq[k],hq[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p;}};
  const pop=()=>{const top=hq[0];const li=hq.pop(),lf=hf.pop();if(hq.length){hq[0]=li;hf[0]=lf;let k=0;for(;;){const l=k*2+1,r=l+1;let m=k;if(l<hq.length&&hf[l]<hf[m])m=l;if(r<hq.length&&hf[r]<hf[m])m=r;if(m===k)break;[hq[m],hq[k]]=[hq[k],hq[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m;}}return top;};
  const gxC=g%nx,gzC=(g/nx)|0;const hh=i=>{const dx=Math.abs(i%nx-gxC),dz=Math.abs(((i/nx)|0)-gzC);return dx+dz-.586*Math.min(dx,dz);};
  const nz_=noise||0;const nf=i=>nz_?(Math.sin((i%nx)*.21+nz_)*Math.sin(((i/nx)|0)*.17+nz_*1.7)+1)*.5:0;
  gs[s]=0;mark[s]=stamp;from[s]=-1;push(s,hh(s));let found=false,it=0;
  while(hq.length&&it++<45000){const cur=pop();if(cur===g){found=true;break;}if(closed[cur]===stamp)continue;closed[cur]=stamp;const cx=cur%nx,cz=(cur/nx)|0;
    for(let k=0;k<8;k++){const x=cx+DX[k],z=cz+DZ[k];if(x<0||z<0||x>=nx||z>=nz)continue;const ni=z*nx+x;if(blk[ni]||closed[ni]===stamp)continue;if(Math.abs(HH[ni]-HH[cur])>.8)continue;
      if(k>3&&(blk[cz*nx+x]||blk[z*nx+cx]))continue;const ng=gs[cur]+(k>3?1.414:1)+nf(ni);if(mark[ni]!==stamp||ng<gs[ni]){mark[ni]=stamp;gs[ni]=ng;from[ni]=cur;push(ni,ng+hh(ni));}}}
  if(!found)return null;const path=[];let c=g;while(c!==-1&&path.length<1000){path.push({x:cellX(c),z:cellZ(c)});c=from[c];}path.reverse();
  const out=[];let i=0;while(i<path.length-1){let j=Math.min(path.length-1,i+36);while(j>i+1&&!lineFree(path[i].x,path[i].z,path[j].x,path[j].z))j--;out.push(path[j]);i=j;}
  return out;}
function lineFree(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az);const n=Math.ceil(d/.35);let ph=navH(ax,az);for(let k=1;k<n;k++){const t=k/n;const x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(!freeAt(x,z))return false;const h=navH(x,z);if(Math.abs(h-ph)>.5)return false;ph=h;}return true;}
function randomFreeIn(d){for(let k=0;k<40;k++){const x=rand(d.x0,d.x1),z=rand(d.z0,d.z1);if(freeAt(x,z))return {x,z};}return null;}

/* ================= Cover points ================= */
const COV={cs:8,x0:-100,z0:-76,nx:26,nz:19,cells:null,list:[]};
function buildCover(){COV.cells=Array.from({length:COV.nx*COV.nz},()=>[]);
  const tryAdd=(x,z,nx,nz,c)=>{if(!freeAt(x,z))return;const g=navH(x,z);const hgt=c.maxY-g;if(hgt<.9||c.minY>g+.35)return;const ci=clamp(Math.floor((x-COV.x0)/COV.cs),0,COV.nx-1),cj=clamp(Math.floor((z-COV.z0)/COV.cs),0,COV.nz-1);
    for(const p of COV.cells[cj*COV.nx+ci])if((p.x-x)**2+(p.z-z)**2<1.1)return;const p={x,z,y:g,nx,nz,low:hgt<1.5,claim:null,d2:0};COV.list.push(p);COV.cells[cj*COV.nx+ci].push(p);};
  for(const c of colliders){if(!c.cover)continue;const w=c.maxX-c.minX,d=c.maxZ-c.minZ;if(w<.5&&d<.5)continue;const off=.65;
    const faces=[[0,1,w,(c.minX+c.maxX)/2,c.maxZ+off],[0,-1,w,(c.minX+c.maxX)/2,c.minZ-off],[1,0,d,c.maxX+off,(c.minZ+c.maxZ)/2],[-1,0,d,c.minX-off,(c.minZ+c.maxZ)/2]];
    for(const [nx,nz,len,fx,fz] of faces){const n=Math.max(1,Math.floor(len/1.8));for(let i=0;i<n;i++){const u=-len/2+(i+.5)*len/n;tryAdd(nx?fx:fx+u,nx?fz+u:fz,nx,nz,c);}}}}
function coverNear(x,z,r){const out=[];const i0=clamp(Math.floor((x-r-COV.x0)/COV.cs),0,COV.nx-1),i1=clamp(Math.floor((x+r-COV.x0)/COV.cs),0,COV.nx-1),j0=clamp(Math.floor((z-r-COV.z0)/COV.cs),0,COV.nz-1),j1=clamp(Math.floor((z+r-COV.z0)/COV.cs),0,COV.nz-1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)for(const p of COV.cells[j*COV.nx+i]){const d2=(p.x-x)**2+(p.z-z)**2;if(d2<r*r){p.d2=d2;out.push(p);}}out.sort((a,b)=>a.d2-b.d2);return out;}
