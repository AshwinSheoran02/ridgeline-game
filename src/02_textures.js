/* ================= Procedural textures ================= */
function canv(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c;}
function toTex(c,srgb,opts={}){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=opts.aniso||MAXANI;
  if(opts.nomip){t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;}return t;}
function nmap(c,str){const w=c.width,h=c.height;const src=c.getContext('2d').getImageData(0,0,w,h).data;const L=new Float32Array(w*h);
  for(let i=0;i<w*h;i++)L[i]=(src[i*4]*.3+src[i*4+1]*.59+src[i*4+2]*.11)/255;
  const out=document.createElement('canvas');out.width=w;out.height=h;const og=out.getContext('2d');const id=og.createImageData(w,h);const D=id.data;
  for(let y=0;y<h;y++){const yu=((y-1+h)%h)*w,yd=((y+1)%h)*w,yr=y*w;for(let x=0;x<w;x++){const xl=(x-1+w)%w,xr=(x+1)%w;
    const nx=-(L[yr+xr]-L[yr+xl])*str,ny=(L[yd+x]-L[yu+x])*str;const il=1/Math.sqrt(nx*nx+ny*ny+1);const k=(yr+x)*4;
    D[k]=(nx*il*.5+.5)*255;D[k+1]=(ny*il*.5+.5)*255;D[k+2]=(il*.5+.5)*255;D[k+3]=255;}}
  og.putImageData(id,0,0);return out;}
function pbr(w,h,draw,str,hdraw){const c=canv(w,h,draw);const hc=hdraw?canv(w,h,hdraw):c;return {c:toTex(c,true),n:toTex(nmap(hc,str),false),cv:c};}
function tex(w,h,draw,opts={}){return toTex(canv(w,h,draw),true,opts);}
function speck(g,w,h,n,cols,amin,amax,smin,smax){for(let i=0;i<n;i++){g.globalAlpha=rand(amin,amax);g.fillStyle=cols[(Math.random()*cols.length)|0];const s=rand(smin,smax);g.fillRect(Math.random()*w,Math.random()*h,s,s);}g.globalAlpha=1;}
function blot(g,w,h,x,y,r,col,a){for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){const cx=x+ox*w,cy=y+oy*h;if(cx+r<0||cx-r>w||cy+r<0||cy-r>h)continue;const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);}g.globalAlpha=1;}
function weave(g,w,h,a){g.globalAlpha=a;for(let y=0;y<h;y+=2){g.fillStyle=y%4?'#000':'#fff';g.fillRect(0,y,w,1);}for(let x=0;x<w;x+=2){g.fillStyle=x%4?'#000':'#fff';g.fillRect(x,0,1,h);}g.globalAlpha=1;}
function wrapRect(g,w,h,x,y,rw,rh){for(const ox of [-w,0,w])for(const oy of [-h,0,h]){if(x+ox+rw<0||x+ox>w||y+oy+rh<0||y+oy>h)continue;g.fillRect(x+ox,y+oy,rw,rh);}}
function blocks(g,w,h,rows,minW,maxW,base,jitter,joint){g.fillStyle=joint;g.fillRect(0,0,w,h);const rh=h/rows;
  for(let r=0;r<rows;r++){let x=-rand(0,maxW);while(x<w){const bw=rand(minW,maxW);const v=rand(-jitter,jitter);g.fillStyle=`rgb(${base[0]+v|0},${base[1]+v*.9|0},${base[2]+v*.8|0})`;wrapRect(g,w,h,x+2,r*rh+2,bw-4,rh-4);
    g.fillStyle='rgba(255,255,255,.08)';wrapRect(g,w,h,x+2,r*rh+2,bw-4,2);g.fillStyle='rgba(0,0,0,.12)';wrapRect(g,w,h,x+2,r*rh+rh-6,bw-4,3);x+=bw;}}}
const T={};
T.forest=pbr(512,512,(g,w,h)=>{g.fillStyle='#55682f';g.fillRect(0,0,w,h);
  for(let i=0;i<70;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(30,95),rpick(['#46572a','#6c7c3a','#5d5631','#7b8b47','#4e6a33']),.45);
  g.lineWidth=1.3;for(let i=0;i<3000;i++){const x=rand(0,w),y=rand(0,h),a=rand(0,TAU),l=rand(3,9);g.strokeStyle=Math.random()<.35?'rgba(118,84,46,.6)':'rgba(72,100,40,.65)';g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}
  speck(g,w,h,5000,['#3b4921','#8a9a50','#6b5a3a'],.2,.5,1,2.5);},2.4);
T.soil=pbr(256,256,(g,w,h)=>{g.fillStyle='#8a6a48';g.fillRect(0,0,w,h);for(let i=0;i<30;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(20,60),Math.random()<.5?'#6d5238':'#a3825b',.4);speck(g,w,h,3500,['#55402c','#b89870','#6a5038','#8a8478'],.25,.6,1,3);},3);
T.rockG=pbr(256,256,(g,w,h)=>{g.fillStyle='#7c7a74';g.fillRect(0,0,w,h);for(let i=0;i<40;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(15,60),rpick(['#5f5e5a','#9a978e','#6e6a60']),.5);
  g.strokeStyle='rgba(40,38,34,.55)';g.lineWidth=1.5;for(let i=0;i<18;i++){let x=rand(0,w),y=rand(0,h);g.beginPath();g.moveTo(x,y);for(let k=0;k<6;k++){x+=rand(-18,18);y+=rand(-18,18);g.lineTo(x,y);}g.stroke();}
  speck(g,w,h,3000,['#4a4844','#b0ada4'],.2,.5,1,2.5);},4);
T.plaster=pbr(512,512,(g,w,h)=>{g.fillStyle='#e2d4b8';g.fillRect(0,0,w,h);
  for(let i=0;i<70;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(30,110),Math.random()<.6?'#c6b594':'#efe4cc',.3);
  speck(g,w,h,8000,['#b0a07e','#f6ecd6','#a39070'],.15,.45,1,2.2);
  g.strokeStyle='rgba(90,70,45,.35)';g.lineWidth=1;for(let i=0;i<12;i++){let x=rand(0,w),y=rand(0,h);g.beginPath();g.moveTo(x,y);for(let k=0;k<8;k++){x+=rand(-10,10);y+=rand(2,12);g.lineTo(x,y);}g.stroke();}
  for(let i=0;i<6;i++){const x=rand(0,w),y=rand(0,h);g.fillStyle='rgba(120,100,80,.45)';g.beginPath();g.ellipse(x,y,rand(10,30),rand(6,18),0,0,TAU);g.fill();g.fillStyle='rgba(160,130,100,.8)';g.fillRect(x-8,y-4,16,8);}
  const gr=g.createLinearGradient(0,h*.7,0,h);gr.addColorStop(0,'rgba(90,70,45,0)');gr.addColorStop(1,'rgba(90,70,45,.35)');g.fillStyle=gr;g.fillRect(0,h*.7,w,h*.3);
  for(let i=0;i<10;i++){const x=rand(0,w);const gr2=g.createLinearGradient(0,0,0,h*.6);gr2.addColorStop(0,'rgba(70,60,50,.18)');gr2.addColorStop(1,'rgba(70,60,50,0)');g.fillStyle=gr2;g.fillRect(x,0,rand(3,8),rand(h*.2,h*.6));}},2.6);
T.stone=pbr(256,256,(g,w,h)=>blocks(g,w,h,8,48,80,[168,150,122],18,'#6e6152'),4.5);
T.fstone=pbr(256,256,(g,w,h)=>{g.fillStyle='#3e3a34';g.fillRect(0,0,w,h);const rows=[];let tot=0;while(tot<h-14){const r=rand(16,30);rows.push(r);tot+=r;}const sc=h/tot;let y=0;for(const r0 of rows){const rh=r0*sc;const xs=0;let x=xs;while(x<xs+w-1){let sw=rand(22,52);if(x+sw>xs+w-16)sw=xs+w-x;for(const ox of [0]){x+=ox;const v=rand(-16,14),wm=rand(0,1)<.3?10:0;
    const r=118+v+wm,gg=112+v,b=102+v-wm;g.fillStyle=`rgb(${r|0},${gg|0},${b|0})`;const x0=x+rand(1.5,3),y0=y+rand(1.5,3),x1=x+sw-rand(1.5,3),y1=y+rh-rand(1.5,3);const rr=rand(3,7);
    g.beginPath();g.moveTo(x0+rr,y0);g.lineTo(x1-rr,y0+rand(-1,1));g.quadraticCurveTo(x1,y0,x1,y0+rr);g.lineTo(x1+rand(-1,1),y1-rr);g.quadraticCurveTo(x1,y1,x1-rr,y1);g.lineTo(x0+rr,y1+rand(-1,1));g.quadraticCurveTo(x0,y1,x0,y1-rr);g.lineTo(x0,y0+rr);g.quadraticCurveTo(x0,y0,x0+rr,y0);g.fill();
    const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'rgba(255,250,240,.10)');gr.addColorStop(1,'rgba(0,0,0,.16)');g.fillStyle=gr;g.fill();
    for(let k=0;k<14;k++){g.fillStyle=`rgba(${rand(0,1)<.5?'30,28,24':'200,195,185'},${rand(.05,.14)})`;g.fillRect(rand(x0,x1),rand(y0,y1),rand(1,4),rand(1,3));}
    if(rand(0,1)<.18){g.fillStyle='rgba(90,110,60,.22)';g.beginPath();g.ellipse(rand(x0,x1),y1-2,rand(4,9),rand(2,4),0,0,TAU);g.fill();}
    x-=ox;}x+=sw;}y+=rh;}},2.2);
T.retain=pbr(256,256,(g,w,h)=>{g.fillStyle='#3e3a33';g.fillRect(0,0,w,h);for(let i=0;i<120;i++){const x=rand(0,w),y=rand(0,h),r=rand(7,16),v=rand(-25,25);
    for(const ox of [-w,0,w])for(const oy of [-h,0,h]){g.fillStyle=`rgb(${128+v|0},${120+v|0},${106+v|0})`;g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+rand(-.3,.3),rr=r*rand(.75,1.1);k?g.lineTo(x+ox+Math.cos(a)*rr,y+oy+Math.sin(a)*rr*.8):g.moveTo(x+ox+Math.cos(a)*rr,y+oy+Math.sin(a)*rr*.8);}g.closePath();g.fill();}}
  speck(g,w,h,2500,['#2e2a24','#c8bca2','#5d6b3a'],.2,.5,1,2.5);for(let i=0;i<8;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(10,30),'#4f6030',.35);},5);
T.flag=pbr(512,512,(g,w,h)=>{blocks(g,w,h,8,60,130,[196,174,142],16,'#6d5f50');for(let i=0;i<20;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(20,60),'rgba(90,75,60,1)',.18);speck(g,w,h,6000,['#8a7a66','#e6d6bc'],.15,.4,1,2);},3);
T.ghat=pbr(512,256,(g,w,h)=>{blocks(g,w,h,2,140,260,[200,164,124],14,'#7a5e48');for(let i=0;i<25;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(20,70),rpick(['rgba(80,60,45,1)','rgba(150,120,90,1)']),.2);
  const gr=g.createLinearGradient(0,h*.6,0,h);gr.addColorStop(0,'rgba(60,50,40,0)');gr.addColorStop(1,'rgba(60,50,40,.3)');g.fillStyle=gr;g.fillRect(0,h*.6,w,h*.4);speck(g,w,h,6000,['#8a6e56','#ead2b0'],.15,.4,1,2);},3);
T.asphalt=pbr(256,256,(g,w,h)=>{g.fillStyle='#55534f';g.fillRect(0,0,w,h);speck(g,w,h,9000,['#3f3d3a','#6e6c66','#7a776e'],.3,.7,1,2);for(let i=0;i<10;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(15,45),rpick(['#47453f','#625f57']),.5);
  g.strokeStyle='rgba(25,24,22,.6)';for(let i=0;i<8;i++){let x=rand(0,w),y=rand(0,h);g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=rand(-15,15);y+=rand(-15,15);g.lineTo(x,y);}g.stroke();}},2);
T.wood=pbr(256,256,(g,w,h)=>{const n=5,pw=w/n;for(let i=0;i<n;i++){const v=rand(-20,20);g.fillStyle=`rgb(${150+v|0},${108+v|0},${66+v|0})`;g.fillRect(i*pw,0,pw,h);
  g.strokeStyle='rgba(70,45,22,.4)';for(let k=0;k<8;k++){g.beginPath();const x=i*pw+rand(4,pw-4);g.moveTo(x,0);for(let y=0;y<=h;y+=16)g.lineTo(x+Math.sin(y*.05+k)*2,y);g.stroke();}
  g.fillStyle='rgba(40,25,10,.7)';g.fillRect(i*pw,0,3,h);}speck(g,w,h,1500,['#5b3c1e','#c99a62'],.2,.5,1,2);},3.5);
T.crate=pbr(256,256,(g,w,h)=>{g.drawImage(T.wood.cv,0,0);g.fillStyle='rgba(60,38,18,.88)';g.fillRect(0,0,w,22);g.fillRect(0,h-22,w,22);g.fillRect(0,0,22,h);g.fillRect(w-22,0,22,h);
  g.save();g.translate(w/2,h/2);g.rotate(Math.PI/4);g.fillRect(-w*.7,-11,w*1.4,22);g.restore();g.fillStyle='#2a1c10';[[11,11],[w-11,11],[11,h-11],[w-11,h-11]].forEach(([x,y])=>{g.beginPath();g.arc(x,y,4,0,TAU);g.fill();});},3);
T.metal=pbr(256,256,(g,w,h)=>{g.fillStyle='#7d7f7c';g.fillRect(0,0,w,h);for(let i=0;i<30;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(20,70),Math.random()<.5?'#8a5a36':'#5e605c',.4);
  g.strokeStyle='rgba(90,55,30,.35)';for(let i=0;i<40;i++){const x=rand(0,w);g.beginPath();g.moveTo(x,rand(0,h*.5));g.lineTo(x+rand(-2,2),rand(h*.5,h));g.stroke();}speck(g,w,h,2000,['#4a4b49','#a8aaa5'],.2,.5,1,2);},1.6);
T.corr=pbr(256,256,(g,w,h)=>{for(let x=0;x<w;x++){const v=175+Math.sin(x/w*TAU*10)*40;g.fillStyle=`rgb(${v|0},${v|0},${v|0})`;g.fillRect(x,0,1,h);}
  for(let i=0;i<22;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(20,70),'#7a5030',.3);speck(g,w,h,1500,['#6a4a30','#e0e0e0'],.2,.5,1,2);},7,
  (g,w,h)=>{for(let x=0;x<w;x++){const v=128+Math.sin(x/w*TAU*10)*100;g.fillStyle=`rgb(${v|0},${v|0},${v|0})`;g.fillRect(x,0,1,h);}});
T.bark=pbr(128,256,(g,w,h)=>{g.fillStyle='#4a3b2c';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.fillStyle=rpick(['#3a2d20','#5e4a36','#6b5a48']);g.fillRect(rand(0,w),rand(0,h),rand(3,9),rand(20,60));}
  g.strokeStyle='rgba(20,15,10,.6)';g.lineWidth=2;for(let i=0;i<14;i++){const x=rand(0,w);g.beginPath();g.moveTo(x,0);for(let y=0;y<h;y+=20)g.lineTo(x+rand(-3,3),y);g.stroke();}},6);
T.tile=pbr(256,256,(g,w,h)=>{for(let y=0;y<4;y++)for(let x=0;x<4;x++){const v=rand(-12,12);g.fillStyle=`rgb(${176+v|0},${120+v|0},${84+v|0})`;g.fillRect(x*64+1,y*64+1,62,62);}g.fillStyle='#6b5040';for(let i=0;i<=4;i++){g.fillRect(i*64-1,0,2,h);g.fillRect(0,i*64-1,w,2);}speck(g,w,h,1500,['#5a4030','#e0b090'],.2,.5,1,2);},3);
T.timber=pbr(256,256,(g,w,h)=>{g.drawImage(T.plaster.cv,0,0,w,h);g.fillStyle='#4a3424';g.fillRect(0,0,14,h);g.fillRect(128,0,14,h);g.fillRect(0,0,w,12);g.fillRect(0,122,w,12);
  g.strokeStyle='#4a3424';g.lineWidth=11;g.beginPath();g.moveTo(14,134);g.lineTo(128,h);g.moveTo(142,12);g.lineTo(w,122);g.stroke();speck(g,w,h,800,['#2e2016','#6a4c34'],.3,.6,1,3);},3);
T.slate=pbr(256,256,(g,w,h)=>{g.fillStyle='#2e3236';g.fillRect(0,0,w,h);for(let r=0;r<8;r++){const off=(r%2)*20;for(let x=-40+off;x<w+40;x+=40){const v=rand(-14,14);g.fillStyle=`rgb(${92+v|0},${98+v|0},${104+v|0})`;wrapRect(g,w,h,x+1,r*32,38,30);g.fillStyle='rgba(0,0,0,.35)';wrapRect(g,w,h,x+1,r*32+26,38,4);}}speck(g,w,h,2000,['#3a3e42','#9aa2a8','#6a7a5a'],.2,.5,1,2);},4);
T.carve=pbr(256,256,(g,w,h)=>{g.fillStyle='#c9a27a';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32){g.fillStyle='rgba(255,240,210,.35)';g.fillRect(0,y,w,4);g.fillStyle='rgba(80,50,30,.45)';g.fillRect(0,y+22,w,6);}
  for(let x=0;x<w;x+=32){g.fillStyle='rgba(80,50,30,.3)';g.fillRect(x,0,3,h);}for(let i=0;i<60;i++){g.fillStyle='rgba(90,60,40,.4)';g.beginPath();g.arc(rand(0,w),rand(0,h),rand(2,4),0,TAU);g.fill();}speck(g,w,h,3000,['#8a6a4e','#ecd2a8'],.2,.4,1,2);},5);
T.monWall=pbr(256,256,(g,w,h)=>{g.fillStyle='#efede6';g.fillRect(0,0,w,h);for(let i=0;i<20;i++)blot(g,w,h,rand(0,w),rand(0,h),rand(20,60),'rgba(200,195,180,1)',.4);
  g.fillStyle='#1d1a18';g.beginPath();g.moveTo(96,70);g.lineTo(160,70);g.lineTo(172,170);g.lineTo(84,170);g.closePath();g.fill();
  g.fillStyle='#2b3a4a';g.fillRect(110,84,36,72);g.strokeStyle='#b2342a';g.lineWidth=4;g.strokeRect(110,84,36,72);g.fillStyle='#b2342a';g.fillRect(100,62,56,8);g.fillStyle='#2d6a3e';g.fillRect(100,56,56,6);g.fillStyle='#d9a93a';g.fillRect(100,52,56,4);
  speck(g,w,h,3000,['#c8c2b4','#ffffff'],.15,.4,1,2);},2);
T.penbey=pbr(128,128,(g,w,h)=>{g.fillStyle='#5a1f1a';g.fillRect(0,0,w,h);for(let i=0;i<400;i++){g.fillStyle=rpick(['#4a1714','#6e2a22','#3e1210']);g.fillRect(rand(0,w),rand(0,h),rand(1,2),rand(8,30));}},4);
T.shopfront=tex(256,256,(g,w,h)=>{g.fillStyle='#231d18';g.fillRect(0,0,w,h);for(let s=0;s<4;s++){const y=40+s*52;g.fillStyle='#5a4028';g.fillRect(8,y+38,w-16,6);for(let x=12;x<w-20;x+=rand(10,22)){g.fillStyle=rpick(['#d9772b','#c9302c','#e8c14a','#2f6fb3','#3f9a5a','#e6e0d0','#a85fb0']);g.fillRect(x,y+rand(8,20),rand(8,16),38-rand(8,20));}}
  for(let y=0;y<34;y+=4){g.fillStyle=y%8?'#8a8c8e':'#6e7072';g.fillRect(0,y,w,4);}g.fillStyle='#ffd27a';g.globalAlpha=.25;g.fillRect(w*.3,40,w*.4,h);g.globalAlpha=1;});
T.arch=tex(128,128,(g,w,h)=>{g.fillStyle='#f4ecdc';g.fillRect(0,0,w,h);g.fillStyle='#22282c';g.beginPath();g.moveTo(22,h-8);g.lineTo(22,48);g.arc(64,48,42,Math.PI,0);g.lineTo(106,h-8);g.closePath();g.fill();
  g.fillStyle='rgba(140,170,190,.35)';g.fillRect(30,52,30,64);g.fillStyle='#3d7a8a';for(let y=56;y<h-12;y+=9)g.fillRect(66,y,34,4);g.strokeStyle='#3d7a8a';g.lineWidth=4;g.beginPath();g.arc(64,48,42,Math.PI,0);g.stroke();});
T.woodWin=tex(128,128,(g,w,h)=>{g.fillStyle='#3a2a1c';g.fillRect(0,0,w,h);for(let y=0;y<3;y++)for(let x=0;x<2;x++){const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#5d7a90');gr.addColorStop(1,'#1e2830');g.fillStyle=gr;g.fillRect(12+x*56,12+y*38,48,30);}});
T.needles=tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<520;i++){const x=rand(4,w-4),y=rand(4,h-4);const a=Math.PI/2+rand(-.9,.9),l=rand(6,14);g.strokeStyle=rpick(['#2a4426','#36552f','#41633a','#243a22']);g.lineWidth=rand(1.2,2.4);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}},{aniso:2});
T.leaf=tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<300;i++){const a=rand(0,TAU),r=Math.sqrt(Math.random())*w*.46;const v=rand(-18,18);g.fillStyle=`rgb(${70+v|0},${110+v|0},${44+v|0})`;g.beginPath();g.ellipse(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r,rand(4,8),rand(2,4),rand(0,3),0,TAU);g.fill();}});
T.rhodo=tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<260;i++){const a=rand(0,TAU),r=Math.sqrt(Math.random())*w*.45;const v=rand(-20,20);g.fillStyle=`rgb(${52+v|0},${84+v|0},${40+v|0})`;g.beginPath();g.ellipse(w/2+Math.cos(a)*r,h*.55+Math.sin(a)*r*.8,rand(4,8),rand(2,4),rand(0,3),0,TAU);g.fill();}
  for(let i=0;i<34;i++){const a=rand(0,TAU),r=Math.sqrt(Math.random())*w*.38;g.fillStyle=rpick(['#c8263f','#e03a55','#b51d34']);g.beginPath();g.arc(w/2+Math.cos(a)*r,h*.5+Math.sin(a)*r*.7,rand(3,6),0,TAU);g.fill();}});
T.grass=tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<40;i++){const x=rand(10,w-10),v=rand(-20,20);g.strokeStyle=`rgb(${100+v|0},${130+v|0},${55+v|0})`;g.lineWidth=rand(1.5,3);g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+rand(-10,10),h*.5,x+rand(-25,25),rand(10,h*.5));g.stroke();}});
T.fern=tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let f=0;f<5;f++){const bx=rand(30,98),tx=bx+rand(-40,40),ty=rand(10,40);g.strokeStyle='#3d6a2e';g.lineWidth=2;g.beginPath();g.moveTo(bx,h);g.quadraticCurveTo(bx,ty+30,tx,ty);g.stroke();
  for(let t=.1;t<.95;t+=.06){const x=lerp(bx,tx,t),y=lerp(h,ty,t);const l=(1-t)*14+3;g.strokeStyle=rpick(['#4a7a36','#3b6a2c','#5a8a40']);g.beginPath();g.moveTo(x,y);g.lineTo(x-l,y-l*.4);g.moveTo(x,y);g.lineTo(x+l,y-l*.4);g.stroke();}}});
T.prayer=tex(320,64,(g,w,h)=>{['#2f5fb3','#f2f2ee','#c9302c','#2f8f4e','#f2c230'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(i*64,0,64,h);g.fillStyle='rgba(30,30,30,.28)';for(let y=12;y<h-8;y+=6)g.fillRect(i*64+10,y,44,2);g.beginPath();g.arc(i*64+32,32,9,0,TAU);g.fill();});});
T.saree=tex(128,128,(g,w,h)=>{const cs=['#e0457b','#f28c28','#1fa3a3','#7a3fb0','#e8c33a','#2f8f4e'];let y=0;while(y<h){const c=rpick(cs);const t=rand(6,30);g.fillStyle=c;g.fillRect(0,y,w,t);y+=t;g.fillStyle='#e8c33a';g.fillRect(0,y,w,2);y+=2;}});
T.clock=tex(256,256,(g,w,h)=>{g.fillStyle='#2b3a2e';g.fillRect(0,0,w,h);g.fillStyle='#f6f1e3';g.beginPath();g.arc(128,128,110,0,TAU);g.fill();g.strokeStyle='#1e1e1e';g.lineWidth=6;g.stroke();
  g.fillStyle='#1e1e1e';g.font='bold 28px Georgia,serif';g.textAlign='center';g.textBaseline='middle';const R=['XII','III','VI','IX'];for(let i=0;i<4;i++){const a=i*Math.PI/2-Math.PI/2;g.fillText(R[i],128+Math.cos(a)*84,128+Math.sin(a)*84);}
  for(let i=0;i<12;i++){const a=i/12*TAU;g.fillRect(128+Math.cos(a)*100-2,128+Math.sin(a)*100-2,4,4);}g.lineWidth=7;g.beginPath();g.moveTo(128,128);g.lineTo(128+50,128-30);g.stroke();g.lineWidth=4;g.beginPath();g.moveTo(128,128);g.lineTo(128-10,128-88);g.stroke();});
T.boat=pbr(256,128,(g,w,h)=>{g.drawImage(T.wood.cv,0,0,w,h);g.fillStyle='rgba(40,90,150,.75)';g.fillRect(0,0,w,h*.7);g.fillStyle='#c9302c';g.fillRect(0,h*.08,w,8);g.fillStyle='#f2f2ee';g.fillRect(0,h*.08+8,w,4);speck(g,w,h,800,['#2a1c10','#d0c0a0'],.3,.6,1,3);},3);
T.mani=pbr(256,128,(g,w,h)=>{g.drawImage(T.fstone.cv,0,0,w,h);g.strokeStyle='rgba(250,248,240,.8)';g.lineWidth=2;for(let i=0;i<14;i++){const x=rand(10,w-40),y=rand(10,h-20);for(let k=0;k<4;k++){g.beginPath();g.moveTo(x+k*8,y);g.lineTo(x+k*8+rand(-2,2),y+rand(6,12));g.stroke();}}},4);
T.puff=tex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},{nomip:true});
T.flash=tex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,250,220,1)');gr.addColorStop(.25,'rgba(255,190,90,.9)');gr.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,210,120,.8)';g.lineWidth=6;for(let i=0;i<6;i++){const a=i/6*TAU;g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.cos(a)*62,64+Math.sin(a)*62);g.stroke();}},{nomip:true});
T.fire=tex(128,128,(g,w,h)=>{for(let i=0;i<18;i++){const x=64+rand(-28,28),y=64+rand(-28,28),r=rand(18,40);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,240,190,.9)');gr.addColorStop(.4,'rgba(255,150,50,.6)');gr.addColorStop(1,'rgba(160,50,10,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}},{nomip:true});
T.hole=tex(32,32,(g,w,h)=>{const gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(10,8,6,1)');gr.addColorStop(.35,'rgba(30,22,15,.9)');gr.addColorStop(1,'rgba(40,30,20,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},{nomip:true});
T.scorch=tex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(12,10,8,.95)');gr.addColorStop(.5,'rgba(25,20,15,.6)');gr.addColorStop(1,'rgba(30,25,20,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let i=0;i<40;i++){const a=rand(0,TAU),r=rand(20,62);g.fillStyle='rgba(15,12,10,.5)';g.beginPath();g.arc(64+Math.cos(a)*r,64+Math.sin(a)*r,rand(2,6),0,TAU);g.fill();}},{nomip:true});
T.window=tex(64,64,(g,w,h)=>{g.fillStyle='#1b2024';g.fillRect(0,0,w,h);const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(150,180,200,.5)');gr.addColorStop(.5,'rgba(40,50,60,.1)');gr.addColorStop(1,'rgba(120,150,170,.35)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#4a3a28';g.fillRect(w/2-2,0,4,h);g.fillRect(0,h/2-2,w,4);});
T.busWin=tex(256,64,(g,w,h)=>{g.fillStyle='#e6ddc8';g.fillRect(0,0,w,h);for(let i=0;i<6;i++){g.fillStyle='#1f262b';g.fillRect(8+i*41,10,34,30);g.fillStyle='rgba(160,190,210,.3)';g.fillRect(8+i*41,10,34,10);}g.fillStyle='#b2342a';g.fillRect(0,44,w,7);g.fillStyle='#2f5fb3';g.fillRect(0,52,w,4);speck(g,w,h,600,['#8a5a36','#5e3a20'],.3,.6,2,5);});
T.waterN=(()=>{const c=canv(256,256,(g,w,h)=>{const id=g.createImageData(w,h);const D=id.data;const waves=[];for(let i=0;i<9;i++)waves.push([((Math.random()*8)|0)+1,((Math.random()*8)|0)-4,rand(0,TAU),rand(.4,1)]);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(const [a,b,p,amp] of waves)v+=Math.sin((a*x/w+b*y/h)*TAU+p)*amp;const k=(y*w+x)*4;const c2=128+v*22;D[k]=D[k+1]=D[k+2]=c2;D[k+3]=255;}g.putImageData(id,0,0);});
  const t=toTex(nmap(c,6),false);return t;})();
function signTex(text,bg,fg){return tex(512,96,(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(8,8,w-16,h-16);g.fillStyle=fg;g.font='bold 46px Georgia, serif';g.textAlign='center';g.textBaseline='middle';
  let s=46;while(g.measureText(text).width>w-40&&s>20){s-=2;g.font=`bold ${s}px Georgia, serif`;}g.fillText(text,w/2,h/2+3);speck(g,w,h,900,['rgba(80,60,40,.5)','rgba(255,255,255,.3)'],.3,.6,1,3);});}

T.flowers=tex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<90;i++){const x=rand(4,w-4);g.strokeStyle=rpick(['#3c6a2c','#4c7a34','#2f5524']);g.lineWidth=rand(1.5,3);g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+rand(-8,8),h*.7,x+rand(-10,10),rand(h*.18,h*.6));g.stroke();}
  for(let i=0;i<140;i++){const a=rand(0,TAU);g.fillStyle=rpick(['#4f8a38','#3f7430','#5c9640']);g.beginPath();g.ellipse(rand(4,w-4),rand(h*.35,h-4),rand(3,7),rand(1.5,3),a,0,TAU);g.fill();}
  const pal=['#ff8a00','#ffb300','#f2365a','#e8e2f0','#ff5ea0','#c03a9e','#ffd23a','#e8402c'];for(let i=0;i<70;i++){const x=rand(6,w-6),y=rand(h*.12,h*.62),r=rand(3,6.5);const c=rpick(pal);g.fillStyle=c;for(let k=0;k<5;k++){const a=k/5*TAU;g.beginPath();g.arc(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,r*.55,0,TAU);g.fill();}g.fillStyle='rgba(90,50,10,.8)';g.beginPath();g.arc(x,y,r*.3,0,TAU);g.fill();}});
T.marigold=tex(64,64,(g,w,h)=>{g.fillStyle='#e07000';g.fillRect(0,0,w,h);for(let i=0;i<160;i++){g.fillStyle=rpick(['#ff9a10','#ffb020','#f57c00','#ffc640','#d65a00']);g.beginPath();g.arc(rand(0,w),rand(0,h),rand(2,5),0,TAU);g.fill();}});
T.foam=tex(256,64,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<900;i++){const y=Math.pow(Math.random(),1.8)*h;const a=(1-y/h)*rand(.25,.85);g.fillStyle=`rgba(245,250,250,${a})`;g.beginPath();g.ellipse(rand(0,w),y,rand(3,14),rand(.8,2.4),0,0,TAU);g.fill();}});
