/* ================= Tirthkot ================= */
const MAPX=95;const BOUND={x0:-94.5,x1:94.5,z0:-71.5,z1:63.2};
function pave(x0,z0,x1,z1,y,m,ts=3){const w=x1-x0,d=z1-z0;const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/ts,uv.getY(i)*d/ts);place(g,m,(x0+x1)/2,y+.02,(z0+z1)/2);}
function bsp(x0,z0,x1,z1,depth,out){const w=x1-x0,d=z1-z0;if((w<14&&d<14)||depth>6){out.push([x0,z0,x1,z1]);return;}
  const al=sr(3.2,4.4);if(w>d){const c=sr(x0+w*.35,x0+w*.65);bsp(x0,z0,c-al/2,z1,depth+1,out);bsp(c+al/2,z0,x1,z1,depth+1,out);}
  else{const c=sr(z0+d*.35,z0+d*.65);bsp(x0,z0,x1,c-al/2,depth+1,out);bsp(x0,c+al/2,x1,z1,depth+1,out);}}
function townBlock(x0,z0,x1,z1,y,kind){const lots=[];bsp(x0,z0,x1,z1,0,lots);
  for(const [a,b,c,d] of lots){const w=c-a,dd=d-b,cx=(a+c)/2,cz=(b+d)/2;
    if(Math.min(w,dd)<4.4){if(srand()<.5)crate(cx,cz,1,y);else firewood(cx,cz,srand()*3,y);continue;}
    const r=srand();
    if(kind==='L0'){
      if(r<.55){house(cx,cz,y,w-sr(.2,.8),dd-sr(.2,.8),Math.round(sr(2,4.4))*3,{style:'haveli'});}
      else if(r<.8){hollowHouse(cx,cz,y,w-sr(.2,.6),dd-sr(.2,.6),3.6,{doors:[(srand()*4)|0,(srand()*4)|0]});}
      else if(r<.93)courtyard(cx,cz,y,w-.4,dd-.4);
      else{box(cx,y,cz,Math.min(w,dd)*.5,.5,Math.min(w,dd)*.5,M.ghat,{ts:2,kind:'plat'});chhatri(cx,y+.5,cz,1.2,M.trim);}}
    else{
      if(r<.42)house(cx,cz,y,w-sr(.6,1.2),dd-sr(.6,1.2),srand()<.5?5.8:3.2,{style:'hill',balc:(srand()*4)|0});
      else if(r<.75)hollowHouse(cx,cz,y,w-sr(.6,1),dd-sr(.6,1),3.3,{style:'hill',doors:[(srand()*4)|0,(srand()*4)|0]});
      else if(r<.9)courtyard(cx,cz,y,w-.4,dd-.4);
      else{lowWall(a+.5,b+.5,c-.5,b+.5,.9,M.fstone,.4,y);lowWall(a+.5,d-.5,c-.5,d-.5,.9,M.fstone,.4,y);for(let i=0;i<10;i++)tuft(sr(a+1,c-1),sr(b+1,d-1),M.grass,sr(.8,1.3),y);}}
    if(srand()<.3)barrel(a+.5,b+.5,pick([M.barrelB,M.barrelG,M.barrelR]),y);}}
function buildBand(b,lanes,topM){const segs=[];let x=-62;for(const [cx,w] of lanes){segs.push([x,cx-w/2]);x=cx+w/2;}segs.push([x,62]);const depth=b.zl-b.zh,H=b.yh-b.yl;
  for(const [a,c] of segs){if(c-a<.5)continue;const cx=(a+c)/2,len=c-a;addCol(a,b.yl-1,b.zh,c,b.yh,b.zl,true,'fill');
    box(cx,b.yl-.5,b.zl-.35,len,H+.5,.7,M.retain,{col:false,ts:2.5});box(cx,b.yh-.3,(b.zh+b.zl-.7)/2,len,.3,depth-.7,topM,{col:false,ts:3});
    if(a>-62)box(a+.2,b.yl-.5,(b.zl+b.zh)/2,.4,H+.5,depth,M.retain,{col:false,ts:2.5});if(c<62)box(c-.2,b.yl-.5,(b.zl+b.zh)/2,.4,H+.5,depth,M.retain,{col:false,ts:2.5});
    box(cx,b.yh,b.zl-.22,len,1.0,.3,M.trim,{ts:2});}
  const d=depth/15;for(const [cx,w] of lanes)stairsVis(cx,b.zl,b.yl,-1,15,w,.3,d,M.ghat);}
function temple(x,z,y){box(x,y,z,14,.6,16,M.ghat,{ts:2,kind:'plat'});box(x,y+.6,z-.5,12,.6,13,M.ghat,{ts:2,kind:'plat'});
  box(x,y+1.2,z-2,6.4,5,6.4,M.carve,{ts:3});addCol(x-3.2,y+6.2,z-5.2,x+3.2,y+15,z+1.2);
  const sh=new THREE.LatheGeometry([[3.7,0],[3.55,1.6],[3.3,3.2],[2.95,4.8],[2.5,6.3],[1.95,7.6],[1.35,8.7],[.8,9.5],[.45,9.95],[0,10.1]].map(p=>new THREE.Vector2(p[0],p[1])),12);
  const uv=sh.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*6,uv.getY(i)*3);place(sh,M.carve,x,y+6.2,z-2,Math.PI/12);
  place(cylGeo(1.0,1.0,.45,16),M.carve,x,y+16.3,z-2);place(new THREE.SphereGeometry(.45,12,8),M.gold,x,y+16.9,z-2);place(cylGeo(.02,.04,2.2,6),M.pole,x,y+18,z-2);
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1.6,-.35,0,0,-.75,0],3));fg.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,.5,0,0],2));fg.computeVertexNormals();place(fg,M.saffron,x,y+19,z-2);
  for(const px of [-2.6,2.6])for(const pz of [2.2,5.2]){box(x+px,y+1.2,z+pz,.45,3.4,.45,M.carve,{ts:1});}
  box(x,y+4.6,z+3.7,6.4,.35,4.2,M.carve,{col:false,ts:2});place(HALFSPH,M.carve,x,y+4.95,z+3.7,0,0,0,1.6,1.1,1.6);
  for(let i=0;i<4;i++)flagLine(x-6.5+i*.1,y+5,z+6+i*.2,x+6.5,y+5.1,z+6+i*.2,'pennant',.6);
  for(const s of [-1,1]){place(cylGeo(.18,.22,.3,10),M.gold,x+s*1.6,y+4.2,z+5.6);}
  district('Temple Square',x-9.5,z-9,x+9.5,z+13.5,1.4);}
function clockTower(x,z,y){box(x,y,z,6,.5,6,M.stone,{ts:2,kind:'plat'});box(x,y+.5,z,4.2,13.5,4.2,M.retain,{ts:2.5});
  for(const [px,pz,ry] of [[0,2.12,0],[0,-2.12,Math.PI],[2.12,0,Math.PI/2],[-2.12,0,-Math.PI/2]])place(boxGeo(2.4,2.4,.05,0),M.clock,x+px,y+11.2,z+pz,ry);
  box(x,y+13.8,z,4.8,.3,4.8,M.trim,{col:false,ts:0});place(PYR,M.tinG,x,y+14.1,z,0,0,0,3.6,3.2,3.6);}
function chorten(x,z,y,s=1){box(x,y,z,4*s,.8*s,4*s,M.whiteW,{ts:2,kind:'plat'});box(x,y+.8*s,z,3.2*s,.7*s,3.2*s,M.whiteW,{ts:2});box(x,y+1.5*s,z,2.5*s,.5*s,2.5*s,M.whiteW,{ts:2});
  place(cylGeo(1.2*s,1.45*s,1.1*s,16),M.whiteW,x,y+2.55*s,z);place(HALFSPH,M.whiteW,x,y+3.1*s,z,0,0,0,1.2*s,.9*s,1.2*s);box(x,y+3.9*s,z,.9*s,.4*s,.9*s,M.whiteW,{ts:0,col:false});
  place(cylGeo(.2*s,.5*s,2.2*s,12),M.gold,x,y+5.4*s,z);place(cylGeo(.55*s,.55*s,.1*s,12),M.gold,x,y+6.55*s,z);place(new THREE.SphereGeometry(.18*s,8,6),M.gold,x,y+6.8*s,z);}
function darchor(x,z,y){place(cylGeo(.08,.12,9,8),M.woodDark,x,y+4.5,z);addCol(x-.15,y,z-.15,x+.15,y+9,z+.15,false);for(let i=0;i<7;i++){const a=i/7*TAU+.3;flagLine(x,y+8.8,z,x+Math.cos(a)*7,y+.6,z+Math.sin(a)*7,'prayer',.3);}}
function maniWall(x,z,len,ry,y){y=y??Hx(x,z);box(x,y-.2,z,len,1.3,1.0,M.mani,{ts:2,ry});box(x,y+1.1,z,len,.2,1.2,M.whiteW,{col:false,ts:2,ry});}
function prayerGallery(x,z,y,len){const t=.4;box(x+.7,y,z,t,2.6,len,M.whiteW,{ts:3});box(x,y,z,1.0,1.0,len,M.redW,{ts:2});
  const n=Math.floor(len/.6);for(let i=0;i<n;i++)place(cylGeo(.22,.22,.6,12),i%2?M.gold:M.redW,x-.05,y+1.35,z-len/2+.3+i*.6);
  place(boxGeo(1.8,.12,len+.4,2),M.tinR,x+.1,y+2.55,z,0,0,-.25);for(let i=0;i<=4;i++)place(boxGeo(.14,2.5,.14,0),M.redW,x-.6,y+1.25,z-len/2+i*len/4);}
function monastery(){const y=13.5,X0=-26,X1=26,Z0=-71,Z1=-49,H=3.8,t=.7;const W=X1-X0,D=Z1-Z0,cx=0,cz=(Z0+Z1)/2;
  const wall=(side,ops)=>{const len=side<2?W:D-2*t;const wx=side<2?cx:(side===2?X1-t/2:X0+t/2),wz=side<2?(side===0?Z1-t/2:Z0+t/2):cz;wallRun(side,wx,wz,y,len,H,t,M.whiteW,ops);
    if(side<2)box(wx,y+H,wz,len,.45,t+.1,M.penbey,{col:false,ts:2});else box(wx,y+H,wz,t+.1,.45,len,M.penbey,{col:false,ts:2});};
  wall(0,[{u0:-4,u1:4,y0:0,y1:H+2}]);wall(1,[]);wall(2,[{u0:-1.4,u1:1.4,y0:0,y1:2.6}]);wall(3,[{u0:-1.4,u1:1.4,y0:0,y1:2.6}]);
  for(const s of [-1,1])box(s*4.4,y,Z1-.35,.8,5.4,.9,M.redW,{ts:1});box(0,y+5.4,Z1-.35,9.6,.5,1.6,M.redW,{col:false,ts:2});place(PYR,M.gold,0,y+5.9,Z1-.35,0,0,0,5.4,1.2,1.4);
  pave(X0+t,Z0+t,X1-t,Z1-t,y,M.flagG);
  box(0,y,-63.5,22,9,11,M.monW,{ts:4});box(0,y+8,-63.5,22.3,1,11.3,M.penbey,{col:false,ts:2});parapet(0,-63.5,y,22,11,9,M.whiteW);
  box(0,y+9,-63.5,8,2.4,6,M.redW,{ts:2});place(PYR,M.gold,0,y+11.4,-63.5,0,0,0,6.6,2.4,5.4);place(cylGeo(.2,.45,1.6,10),M.gold,0,y+14.3,-63.5);
  for(const sx of [-1,1])for(const sz of [-1,1])place(cylGeo(.12,.28,1.4,8),M.gold,sx*10.5,y+9.7,-63.5+sz*5);
  box(0,y,-57.4,12,.5,2.6,M.whiteW,{ts:2,kind:'plat'});for(const px of [-4.5,-1.5,1.5,4.5])box(px,y+.5,-56.8,.4,3.9,.4,M.redW,{ts:1});box(0,y+4.4,-57.3,11.5,.4,2.8,M.redW,{col:false,ts:2});
  faceBox({x:0,z:-63.5,w:22,d:11},0,0,y,3,3.6,.1,M.door,{ts:1});
  chorten(0,-53.2,y,1);
  for(const s of [-1,1]){prayerGallery(s*23.7,-65.2,y,9);prayerGallery(s*23.7,-53.6,y,8);}
  for(const s of [-1,1])hollowHouse(s*17.5,-66,y,8,6.5,3.5,{style:'hill',mat:M.whiteW,doors:[0,s<0?2:3]});
  darchor(-10,-53,y);darchor(10,-53,y);
  for(const s of [-1,1]){flagLine(s*11,y+9.2,-58,s*25,y+H,-50,'prayer');flagLine(s*11,y+9.2,-69,s*25,y+H,-70.5,'prayer');flagLine(0,y+12,-63.5,s*24,y+H,-49.5,'prayer');}
  district('Monastery',X0,Z0,X1,Z1,1.8);}
function buildGhats(){const y=0;
  for(const s of GSTEPS)box(0,-7.5,(s.z0+s.z1)/2,112,s.y+7.5,s.z1-s.z0+.01,M.ghat,{col:false,ts:2.5});
  for(const sx of [-1,1]){box(sx*30,-7.5,40.5,8,7.5,13,M.ghat,{ts:2.5,kind:'plat'});
    box(sx*30,0,46.85,8,.8,.3,M.ghat,{ts:1.5});box(sx*30-3.85,0,40.5,.3,.8,13,M.ghat,{ts:1.5});box(sx*30+3.85,0,40.5,.3,.8,13,M.ghat,{ts:1.5});chhatri(sx*30,0,42,1.5,M.trim);
    box(sx*59.5,-7.5,44.6,7,8.1,21.2,M.ghat,{ts:2.5,kind:'plat'});chhatri(sx*59.5,.6,50,1.3,M.trim);}
  box(0,-7.5,56.4,5,2.35,2.4,M.ghat,{ts:2,kind:'plat'});
  box(0,-5.2,60,4,.6,4,M.ghat,{ts:2,kind:'plat'});box(0,-4.6,60,2.4,2.2,2.4,M.carve,{ts:2});place(PYR,M.carve,0,-2.4,60,0,0,0,2.1,2.4,2.1);place(new THREE.SphereGeometry(.25,8,6),M.gold,0,.1,60);
  broadTree(-5.5,60.2,.85);flagLine(-5,-2,59,0,-2.6,60,'prayer',.4);
  const L1=GSTEPS.find(s=>s.land),L2=GSTEPS.filter(s=>s.land)[1];
  for(const L of [L1,L2]){const zc=(L.z0+L.z1)/2;for(let x=-52;x<=52;x+=sr(7,12)){if(Math.abs(Math.abs(x)-30)<5.5)continue;const r=srand();if(r<.35)umbrella(x,zc+sr(-.6,.6),L.y);else if(r<.65)chowki(x,zc+sr(-.5,.5),L.y);else if(r<.8){box(x,L.y,zc,1.2,.9,1.2,M.ghat,{ts:1});place(HALFSPH,M.carve,x,L.y+.9,zc,0,0,0,.5,.6,.5);}}}
  for(let i=0;i<3;i++){const x=-50+i*4.5;place(cylGeo(.05,.05,2.2,6),M.woodDark,x,L1.y+1.1,L1.z0+.4);}
  for(let i=0;i<2;i++){const xa=-50+i*4.5,xb=xa+4.5;wireLine(xa,L1.y+2.1,L1.z0+.4,xb,L1.y+2.1,L1.z0+.4,.2);for(let k=0;k<3;k++)place(new THREE.PlaneGeometry(1.2,1.4).translate(0,-.7,0),M.saree,xa+.8+k*1.4,L1.y+2.05,L1.z0+.4);}
  for(let i=0;i<9;i++){let x=sr(-52,52);if(Math.abs(x)<5)x+=8;boat(x,sr(57,62.5),Math.PI/2+sr(-.3,.3));}
  for(let x=-55;x<=55;x+=11)lampPost(x,32.6,0);
  for(let i=0;i<12;i++)stall(sr(-55,55),31.3,Math.PI,pick([M.tinR,M.tinB,M.saree]),0);
  district('Ghats',-56,34,56,GHAT_END,2);district('River',-60,GHAT_END,60,63.5,.5);}
function buildTown(){
  pave(-60,11,60,34,0,M.flagS);pave(-60,-15,60,4,4.5,M.flagS);pave(-95,-9,95,-4,4.53,M.asph,4);
  buildBand(BANDS[0],[[-44,3.5],[-22,3.5],[0,8],[22,3.5],[44,3.5]],M.flagS);
  buildBand(BANDS[1],[[-34,3.5],[0,6],[34,3.5]],M.flagS);
  buildBand(BANDS[2],[[-20,3.5],[0,8],[20,3.5]],M.flagG);
  const L0B=[[-59,-45.75],[-42.25,-23.75],[-20.25,-9.5],[9.5,20.25],[23.75,42.25],[45.75,59]];
  for(const [a,c] of L0B)townBlock(a,12.5,c,29.5,0,'L0');
  temple(0,20.5,0);
  for(let i=0;i<5;i++)tuft(sr(-8,8),sr(13,16),M.grass,1,0);
  district('Lower Bazaar',-60,11,60,34,2);
  district('Viewpoint',-62,4,62,11,.5);
  const y1=4.5;
  const row=(blocks,z0,z1,front)=>{for(const [a,c] of blocks){let x=a;while(x<c-3){let w=sr(4.8,7.4);if(c-x-w<3.8)w=c-x;house(x+w/2,(z0+z1)/2,y1,w-.06,z1-z0,srand()<.5?6:8.6,{style:'shop',front,balc:front});x+=w;if(srand()<.2&&c-x>7)x+=1.8;}}};
  row([[-59,-45.75],[-42.25,-23.75],[-20.25,-9.5],[9.5,20.25],[23.75,42.25],[45.75,59]],-3.4,3.6,1);
  row([[-59,-35.75],[-32.25,-9.5],[9.5,32.25],[35.75,59]],-14.6,-9.6,0);
  clockTower(6,-12.2,y1);
  box(-6,y1,-12.2,3.4,.6,3.4,M.stone,{ts:1.5,kind:'plat'});place(cylGeo(.5,.6,2.2,10),M.stone,-6,y1+1.7,-12.2);place(new THREE.SphereGeometry(.6,10,8),M.gold,-6,y1+3.2,-12.2);
  for(const bx of [-7.5,-4.5,4.5,7.5])box(bx,y1,-1.8,1.6,.5,.5,M.woodDark,{ts:0});
  bus(-30,-6.5,Math.PI/2+.05);jeep(18,-7.4,-Math.PI/2);jeep(-52,-5.6,Math.PI/2);truck(40,-6.8,Math.PI/2,M.truckO);jeep(-14,-7.6,Math.PI/2+.1,M.olive);
  let prev=null;for(let x=-56;x<=56;x+=12){if(Math.abs(x)<10){prev=null;continue;}const top=ePole(x,-9.5,y1);if(prev){for(let k=-1;k<=1;k++)wireLine(prev[0]+k*.7,prev[1],prev[2],top[0]+k*.7,top[1],top[2],.6);}prev=top;
    wireLine(top[0],top[1],top[2],x+sr(-3,3),y1+6.5,-12.5,.3);}
  for(let i=0;i<10;i++){const x=sr(-58,58);if(Math.abs(x)<10)continue;lpg(x,-3.9,y1);}
  for(let i=0;i<6;i++)stall(sr(-55,55),-9.9+(srand()<.5?0:5.8),srand()<.5?0:Math.PI,pick(TINS),y1);
  district('Clock Tower',-9.5,-15,9.5,4,1.2);district('Mall Road',-62,-15,62,4,2);
  const L2B=[[-59,-35.75],[-32.25,-21.75],[-18.25,-3],[3,18.25],[21.75,32.25],[35.75,59]];
  for(const [a,c] of L2B)townBlock(a,-39.4,c,-22.6,9,'L2');
  for(let i=0;i<22;i++){const x=sr(-56,56),z=sr(-39,-23);flagLine(x,sr(13,15),z,x+sr(-6,6),sr(12,14.5),z+sr(-8,8),'prayer');}
  district('Upper Village',-62,-47,62,-15,2);
  monastery();
  for(const s of [-1,1]){for(let i=0;i<3;i++)house(s*sr(32,54),sr(-68,-52),13.5,sr(6,8),sr(5.5,7),srand()<.5?5.8:3.2,{style:'hill',balc:(srand()*4)|0});
    chorten(s*30,-48.8+-1.5,13.5,.6);darchor(s*44,-50,13.5);maniWall(s*38,-59,7,Math.PI/2,13.5);maniWall(s*50,-62,6,0,13.5);
    for(let i=0;i<5;i++)deodar(s*sr(28,58),sr(-70,-50),sr(9,14));for(let i=0;i<6;i++)firewood(s*sr(30,58),sr(-70,-50),srand()*3);for(let i=0;i<30;i++)tuft(s*sr(28,60),sr(-71,-48),M.grass,sr(.6,1.2));}
  district('High Meadow',-62,-72,62,-47,1.2);}
function camp(sx){const bx=sx*84;district(sx<0?'Alpha Camp':'Bravo Camp',sx<0?-95:72,-24,sx<0?-72:95,24,0);
  const gaps=[[-14,-9],[-3,3],[9,14]];let z=-22;for(const [a,b] of gaps){const zc=(z+a)/2,len=a-z;for(let k=0;k<3;k++){place(cylGeo(.24,.26,len,8),M.bark,sx*72.5,4.5+.25+k*.42,zc,0,Math.PI/2,0);}addCol(sx*72.5-.3,4.5,z,sx*72.5+.3,4.5+1.3,a,true);z=b;}
  {const zc=(z+22)/2,len=22-z;for(let k=0;k<3;k++)place(cylGeo(.24,.26,len,8),M.bark,sx*72.5,4.5+.25+k*.42,zc,0,Math.PI/2,0);addCol(sx*72.5-.3,4.5,z,sx*72.5+.3,5.8,22,true);}
  const tm=sx<0?M.tentA:M.tentB;tent(bx+sx*4,-13,0,tm);tent(bx+sx*4,13,0,tm);tent(bx+sx*7,0,Math.PI/2,tm);
  truck(bx-sx*2,-19,Math.PI/2+.2);jeep(bx-sx*3,17,.4);sandbags(sx*76,-6,4,Math.PI/2);sandbags(sx*76,6,4,Math.PI/2);
  crate(bx,7);crate(bx,8.2,1);crate(bx+sx*.4,7.6,.9,5.6);barrel(bx-sx*1,-8,sx<0?M.barrelG:M.barrelR);barrel(bx-sx*1.6,-8.5,M.barrelB);
  for(let i=0;i<8;i++){const a=i/8*TAU;place(DODE,M.rock,bx+sx*2+Math.cos(a)*.8,4.6,1.8+Math.sin(a)*.8,0,0,0,.25,.18,.25);}
  flags.push(makeFlag(sx*75,-3.8,sx<0?0x6f9a3e:0xb5352a));}
const flags=[];
function makeFlag(x,z,color){const y=Hx(x,z);box(x,y,z,.12,7,.12,M.pole,{ts:0,cover:false});const g=new THREE.PlaneGeometry(2.2,1.3,12,6);g.translate(1.1,0,0);
  const m=new THREE.Mesh(g,std({color,side:DS,roughness:.9}));m.position.set(x+.06,y+6.2,z);m.castShadow=true;scene.add(m);m.userData.base=g.attributes.position.array.slice();return m;}
function buildForest(){const trees=[];const ok=(x,z,r)=>{for(const t of trees)if((t[0]-x)**2+(t[1]-z)**2<r*r)return false;return true;};
  for(const sx of [-1,1]){district(sx<0?'West Woods':'East Woods',sx<0?-95:56,-72,sx<0?-56:95,63.5,1);
    for(let i=0;i<520&&trees.length<(sx<0?130:260);i++){const x=sx*sr(61,95),z=sr(-71,58);const ax=Math.abs(x);if(ax>70&&Math.abs(z)<24)continue;if(Math.abs(z+6.5)<5.5)continue;if(z>52)continue;if(!ok(x,z,3.6))continue;trees.push([x,z]);deodar(x,z,sr(9,17));}
    for(let i=0;i<34;i++){const x=sx*sr(62,94),z=sr(-70,60);const ax=Math.abs(x);if(ax>70&&Math.abs(z)<22)continue;if(Math.abs(z+6.5)<5)continue;boulder(x,z,sr(.9,2.2));}
    for(let i=0;i<18;i++){const x=sx*sr(62,93),z=sr(-68,50);if(Math.abs(x)>70&&Math.abs(z)<22)continue;if(Math.abs(z+6.5)<5)continue;log(x,z,sr(3,5.5),sr(0,3));}
    for(let i=0;i<70;i++){const x=sx*sr(60,95),z=sr(-71,58);if(Math.abs(x)>70&&Math.abs(z)<22)continue;bushAt(x,z,sr(.9,1.5));}
    for(let i=0;i<160;i++){const x=sx*sr(58,95),z=sr(-71,60);tuft(x,z,M.fern,sr(.9,1.5));}
    for(let i=0;i<220;i++){const x=sx*sr(56,95),z=sr(-71,62);tuft(x,z,M.grass,sr(.6,1.1));}
    for(let i=0;i<40;i++)rock(sx*sr(58,95),sr(-71,62),sr(.2,.5));}
  let n=0;for(let i=0;i<4000&&n<900;i++){const x=sr(-520,520),z=sr(-560,480);if(x>-102&&x<102&&z>-80&&z<90)continue;if(z>63&&z<90&&Math.abs(x)<300)continue;const h=Hx(x,z);if(h>95||h<-4)continue;deodar(x,z,sr(10,18),true);n++;}}
function gasSpots(){const want=(x,z,y)=>{if(CYLS.length>=40)return;y=y??Hx(x,z);if(y<WATER+.2)return;if(!clearAt(x,z,y+.05,y+.75,.22))return;for(const g of CYLS)if(Math.hypot(g.x-x,g.z-z)<.4)return;lpg(x,z,y);if(Math.random()<.35&&clearAt(x+.38,z,y+.05,y+.75,.22))lpg(x+.38,z+rand(-.05,.05),y);};
  for(let i=0;i<8;i++)want(rand(-54,54),31.9);
  for(const lx of [-44,-22,22,44])for(let k=0;k<2;k++)want(lx+(Math.random()<.5?-1.45:1.45),rand(14,29),0);
  for(const b of buildings){if(Math.random()>.18)continue;const sd=Math.random()<.5?-1:1;want(b.x+sd*(b.w/2+.3),b.z+rand(-b.d/3,b.d/3),b.y);}
  for(let i=0;i<4;i++)want(rand(-50,50),-23.5,9);}
function decorate(){const y1=4.5;
  for(let x=-50;x<=50;x+=rand(7,10)){if(Math.abs(x)<11||Math.abs((x%12+12)%12)<1.2)continue;garland(x,y1+5.6,-3.5,x+rand(-2,2),y1+5.4,-9.5,.9);}
  for(const lx of [-44,-22,22,44])for(let z=14;z<29;z+=rand(4,6))garland(lx-1.75,4.4,z,lx+1.75,4.5,z+rand(-.4,.4),.35);
  for(let z=13;z<29;z+=5)garland(-4,5,z,4,5,z+rand(-.5,.5),.7);
  for(const [x,z] of [[0,-13.4],[8.3,1.6],[-8.3,1.6],[-15,7.5],[15,7.5],[-40,7.5],[40,7.5],[-27,7.5],[27,7.5]]){const y=Hx(x,z);box(x,y,z,1.8,.45,1.8,M.stone,{ts:1});broadTree(x,z,rand(.7,.85),y+.45);for(let k=0;k<4;k++)tuft(x+rand(-.6,.6),z+rand(-.6,.6),M.flowers,.7,y+.45);}
  for(let i=0;i<70;i++){const x=rand(-58,58),z=rand(-71,-47);const h=Hx(x,z);if(Math.abs(x)<12&&z<-55)continue;tuft(x,z,M.flowers,rand(.6,1));}
  for(let i=0;i<160;i++){const sx=Math.random()<.5?-1:1,x=sx*rand(61,94),z=rand(-70,52);if(Math.abs(x)>70&&Math.abs(z)<24)continue;if(Math.abs(z+6.5)<5.5)continue;tuft(x,z,Math.random()<.35?M.flowers:M.fern,rand(.6,1));}
  const fp=[];const step=1.5;for(let x=-62;x<=62;x+=step){let z=40;while(z<64&&Hx(x,z)>WATER)z+=.25;if(z>=64)continue;fp.push([x,z]);}
  const pos=[],uv=[];for(let i=0;i<fp.length-1;i++){const [xa,za]=fp[i],[xb,zb]=fp[i+1];if(Math.abs(za-zb)>2)continue;const y=WATER+.03;
    const q=[[xa,za-.2,0],[xb,zb-.2,0],[xb,zb+1.6,1],[xa,za+1.6,1]];const u0=i*step/10,u1=(i+1)*step/10;const U=[u0,u1,u1,u0];
    for(const k of [0,1,2,0,2,3]){pos.push(q[k][0],y,q[k][1]);uv.push(U[k],q[k][2]);}}
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));fg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));fg.computeVertexNormals();
  T.foam.repeat.set(1,1);const fm=new THREE.Mesh(fg,M.foam);fm.renderOrder=2;scene.add(fm);}
function buildMap(){buildGhats();buildTown();camp(-1);camp(1);buildForest();decorate();
  const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wireArr,3));scene.add(new THREE.LineSegments(wg,M.wire));}
