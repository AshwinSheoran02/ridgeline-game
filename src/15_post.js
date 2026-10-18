/* ================= Post-processing ================= */
const POST={on:false,ao:false};
const pScene=new THREE.Scene(),pCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);const pQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));pQuad.frustumCulled=false;pScene.add(pQuad);
const PV='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const KERN=[];for(let i=0;i<12;i++){const v=new V3(rand(-1,1),rand(-1,1),rand(.15,1)).normalize();const s=(i+1)/12;v.multiplyScalar(lerp(.12,1,s*s));KERN.push(v);}
const pm=(frag,uni)=>new THREE.ShaderMaterial({vertexShader:PV,fragmentShader:frag,uniforms:uni,depthTest:false,depthWrite:false});
const AOMat=pm(`uniform sampler2D tDepth;uniform vec2 texel;uniform mat4 proj;uniform mat4 projInv;uniform float radius;uniform vec3 kern[12];varying vec2 vUv;
vec3 vpos(vec2 uv){float d=texture2D(tDepth,uv).x;vec4 c=vec4(uv*2.-1.,d*2.-1.,1.);vec4 v=projInv*c;return v.xyz/v.w;}
float ign(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
void main(){float d=texture2D(tDepth,vUv).x;if(d>=.99999){gl_FragColor=vec4(1.);return;}
 vec3 p=vpos(vUv);vec3 p1=vpos(vUv+vec2(texel.x,0.)),p2=vpos(vUv-vec2(texel.x,0.)),p3=vpos(vUv+vec2(0.,texel.y)),p4=vpos(vUv-vec2(0.,texel.y));
 vec3 dx=abs(p1.z-p.z)<abs(p.z-p2.z)?p1-p:p-p2;vec3 dy=abs(p3.z-p.z)<abs(p.z-p4.z)?p3-p:p-p4;vec3 n=normalize(cross(dx,dy));
 float a=ign(gl_FragCoord.xy)*6.2831853;vec3 rv=vec3(cos(a),sin(a),0.);vec3 t=normalize(rv-n*dot(rv,n));vec3 b=cross(n,t);mat3 tbn=mat3(t,b,n);
 float r=radius*clamp(-p.z*.06,.6,2.2);float occ=0.;
 for(int i=0;i<12;i++){vec3 s=p+tbn*kern[i]*r;vec4 o=proj*vec4(s,1.);vec2 su=o.xy/o.w*.5+.5;if(su.x<0.||su.x>1.||su.y<0.||su.y>1.)continue;float sz=vpos(su).z;float rc=smoothstep(0.,1.,r/abs(p.z-sz));occ+=(sz>=s.z+.03?1.:0.)*rc;}
 float ao=1.-occ/12.;ao=mix(ao,1.,smoothstep(50.,120.,-p.z));gl_FragColor=vec4(ao,ao,ao,1.);}`,
 {tDepth:{value:null},texel:{value:new THREE.Vector2()},proj:{value:new THREE.Matrix4()},projInv:{value:new THREE.Matrix4()},radius:{value:.55},kern:{value:KERN}});
const BlurMat=pm(`uniform sampler2D tAO;uniform sampler2D tDepth;uniform vec2 texel;uniform float near;uniform float far;varying vec2 vUv;
float lz(float d){float z=d*2.-1.;return 2.*near*far/(far+near-z*(far-near));}
void main(){float c=lz(texture2D(tDepth,vUv).x);float s=0.,w=0.;for(int x=-2;x<=2;x++)for(int y=-2;y<=2;y++){vec2 o=vec2(float(x),float(y))*texel;float z=lz(texture2D(tDepth,vUv+o).x);float wt=exp(-abs(z-c)/(c*.04+.05));s+=texture2D(tAO,vUv+o).r*wt;w+=wt;}float a=s/max(w,1e-4);gl_FragColor=vec4(a,a,a,1.);}`,
 {tAO:{value:null},tDepth:{value:null},texel:{value:new THREE.Vector2()},near:{value:.05},far:{value:1400}});
const ApplyMat=pm(`uniform sampler2D tColor;uniform sampler2D tAO;uniform float str;varying vec2 vUv;void main(){vec3 c=texture2D(tColor,vUv).rgb;float a=texture2D(tAO,vUv).r;gl_FragColor=vec4(c*mix(1.,a,str),1.);}`,{tColor:{value:null},tAO:{value:null},str:{value:.85}});
const BrightMat=pm(`uniform sampler2D tSrc;uniform vec2 texel;uniform float thr;varying vec2 vUv;void main(){vec3 c=(texture2D(tSrc,vUv+texel*vec2(-1,-1)).rgb+texture2D(tSrc,vUv+texel*vec2(1,-1)).rgb+texture2D(tSrc,vUv+texel*vec2(-1,1)).rgb+texture2D(tSrc,vUv+texel*vec2(1,1)).rgb)*.25;c=min(c,vec3(30.));float l=max(c.r,max(c.g,c.b));float k=max(l-thr,0.);gl_FragColor=vec4(c*k/max(l,1e-4),1.);}`,{tSrc:{value:null},texel:{value:new THREE.Vector2()},thr:{value:1.2}});
const DownMat=pm(`uniform sampler2D tSrc;uniform vec2 texel;varying vec2 vUv;void main(){vec3 c=texture2D(tSrc,vUv).rgb*.5+(texture2D(tSrc,vUv+texel*vec2(-1,-1)).rgb+texture2D(tSrc,vUv+texel*vec2(1,-1)).rgb+texture2D(tSrc,vUv+texel*vec2(-1,1)).rgb+texture2D(tSrc,vUv+texel*vec2(1,1)).rgb)*.125;gl_FragColor=vec4(c,1.);}`,{tSrc:{value:null},texel:{value:new THREE.Vector2()}});
const UpMat=pm(`uniform sampler2D tLow;uniform sampler2D tBase;uniform vec2 texel;varying vec2 vUv;void main(){vec3 s=vec3(0.);s+=texture2D(tLow,vUv+texel*vec2(-1,-1)).rgb;s+=texture2D(tLow,vUv+texel*vec2(0,-1)).rgb*2.;s+=texture2D(tLow,vUv+texel*vec2(1,-1)).rgb;s+=texture2D(tLow,vUv+texel*vec2(-1,0)).rgb*2.;s+=texture2D(tLow,vUv).rgb*4.;s+=texture2D(tLow,vUv+texel*vec2(1,0)).rgb*2.;s+=texture2D(tLow,vUv+texel*vec2(-1,1)).rgb;s+=texture2D(tLow,vUv+texel*vec2(0,1)).rgb*2.;s+=texture2D(tLow,vUv+texel*vec2(1,1)).rgb;gl_FragColor=vec4(texture2D(tBase,vUv).rgb+s/16.,1.);}`,{tLow:{value:null},tBase:{value:null},texel:{value:new THREE.Vector2()}});
const CompMat=pm(`uniform sampler2D tColor;uniform sampler2D tBloom;uniform vec2 texel;uniform float exposure;uniform float bloomStr;uniform float sharp;uniform float vig;uniform float flash;uniform sampler2D tShaft;varying vec2 vUv;
vec3 rrtFitD(vec3 v){vec3 a=v*(v+0.0245786)-0.000090537;vec3 b=v*(0.983729*v+0.4329510)+0.238081;return a/b;}
vec3 acesD(vec3 color){const mat3 I=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));const mat3 O=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602));color*=exposure/0.6;color=I*color;color=rrtFitD(color);color=O*color;return clamp(color,0.,1.);}
vec3 toSRGB(vec3 c){return mix(pow(c,vec3(.41666))*1.055-.055,c*12.92,vec3(lessThanEqual(c,vec3(.0031308))));}
void main(){vec3 c=texture2D(tColor,vUv).rgb;vec3 nb=texture2D(tColor,vUv+vec2(texel.x,0.)).rgb+texture2D(tColor,vUv-vec2(texel.x,0.)).rgb+texture2D(tColor,vUv+vec2(0.,texel.y)).rgb+texture2D(tColor,vUv-vec2(0.,texel.y)).rgb;
 c=max(c+(c-nb*.25)*sharp,0.);c+=texture2D(tBloom,vUv).rgb*bloomStr+texture2D(tShaft,vUv).rgb*vec3(1.,.88,.7);c=acesD(c);
 float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.16);c+=vec3(.012,.004,-.01)*smoothstep(.45,1.,l)+vec3(-.008,0.,.014)*(1.-smoothstep(0.,.35,l));
 c=mix(c,c*c*(3.-2.*c),.16);vec2 q=vUv-.5;c*=1.-dot(q,q)*vig;c=mix(c,vec3(1.,.97,.9),flash);gl_FragColor=vec4(toSRGB(clamp(c,0.,1.)),1.);}`,
 {tColor:{value:null},tBloom:{value:null},texel:{value:new THREE.Vector2()},exposure:{value:.86},bloomStr:{value:.07},sharp:{value:.22},vig:{value:.5},flash:{value:0},tShaft:{value:null}});
const ShaftMat=pm(`uniform sampler2D tSrc;uniform vec2 sun;uniform float str;uniform float aspect;varying vec2 vUv;
void main(){vec2 st=(vUv-sun)*(.92/36.);vec2 uv=vUv;float dc=1.;vec3 s=vec3(0.);for(int i=0;i<36;i++){uv-=st;vec3 c=texture2D(tSrc,uv).rgb;vec2 q=(uv-sun)*vec2(aspect,1.);s+=c*(1.-smoothstep(0.,.42,length(q)))*dc;dc*=.955;}gl_FragColor=vec4(s*(str/36.),1.);}`,
 {tSrc:{value:null},sun:{value:new THREE.Vector2(.5,.5)},str:{value:0},aspect:{value:1}});
const _sp=new V3(),_cf=new V3();
let RT={};
function makeRT(w,h,o={}){const t=new THREE.WebGLRenderTarget(Math.max(1,w|0),Math.max(1,h|0),Object.assign({type:THREE.HalfFloatType,depthBuffer:false},o));t.texture.generateMipmaps=false;return t;}
function disposeRT(){for(const k in RT)if(RT[k]&&RT[k].dispose)RT[k].dispose();RT={};}
function setupPost(){disposeRT();POST.on=isGL2&&settings.quality!=='low';POST.ao=POST.on&&settings.quality==='high';if(!POST.on)return;
  const sz=renderer.getDrawingBufferSize(new THREE.Vector2());const w=sz.x,h=sz.y;
  if(POST.ao){RT.A=makeRT(w,h,{depthBuffer:true,samples:4});RT.A.depthTexture=new THREE.DepthTexture(w,h);RT.A.depthTexture.type=THREE.UnsignedIntType;RT.A.ignoreDepthForMultisampleCopy=false;
    RT.ao1=makeRT(w/2,h/2,{type:THREE.UnsignedByteType});RT.ao2=makeRT(w/2,h/2,{type:THREE.UnsignedByteType});}
  RT.B=makeRT(w,h,{depthBuffer:true,samples:4});
  RT.d1=makeRT(w/2,h/2);RT.d2=makeRT(w/4,h/4);RT.d3=makeRT(w/8,h/8);RT.u2=makeRT(w/4,h/4);RT.u1=makeRT(w/2,h/2);RT.sh=makeRT(w/4,h/4);RT.w=w;RT.h=h;}
function resizePost(){if(settings.quality!=='low')setupPost();else disposeRT(),POST.on=false;}
function pass(mat,target){pQuad.material=mat;renderer.setRenderTarget(target);renderer.render(pScene,pCam);}
function renderFrame(drawVM){
  if(!POST.on){renderer.setRenderTarget(null);renderer.clear();renderer.render(scene,camera);if(drawVM){renderer.clearDepth();renderer.render(vmScene,vmCam);}return;}
  const w=RT.w,h=RT.h;
  if(POST.ao){renderer.setRenderTarget(RT.A);renderer.clear();renderer.render(scene,camera);
    AOMat.uniforms.tDepth.value=RT.A.depthTexture;AOMat.uniforms.texel.value.set(1/w,1/h);AOMat.uniforms.proj.value.copy(camera.projectionMatrix);AOMat.uniforms.projInv.value.copy(camera.projectionMatrixInverse);pass(AOMat,RT.ao1);
    BlurMat.uniforms.tAO.value=RT.ao1.texture;BlurMat.uniforms.tDepth.value=RT.A.depthTexture;BlurMat.uniforms.texel.value.set(2/w,2/h);BlurMat.uniforms.near.value=camera.near;BlurMat.uniforms.far.value=camera.far;pass(BlurMat,RT.ao2);
    ApplyMat.uniforms.tColor.value=RT.A.texture;ApplyMat.uniforms.tAO.value=RT.ao2.texture;pass(ApplyMat,RT.B);}
  else{renderer.setRenderTarget(RT.B);renderer.clear();renderer.render(scene,camera);}
  if(drawVM){renderer.setRenderTarget(RT.B);renderer.clearDepth();renderer.render(vmScene,vmCam);}
  BrightMat.uniforms.tSrc.value=RT.B.texture;BrightMat.uniforms.texel.value.set(1/w,1/h);pass(BrightMat,RT.d1);
  DownMat.uniforms.tSrc.value=RT.d1.texture;DownMat.uniforms.texel.value.set(2/w,2/h);pass(DownMat,RT.d2);
  DownMat.uniforms.tSrc.value=RT.d2.texture;DownMat.uniforms.texel.value.set(4/w,4/h);pass(DownMat,RT.d3);
  UpMat.uniforms.tLow.value=RT.d3.texture;UpMat.uniforms.tBase.value=RT.d2.texture;UpMat.uniforms.texel.value.set(8/w,8/h);pass(UpMat,RT.u2);
  UpMat.uniforms.tLow.value=RT.u2.texture;UpMat.uniforms.tBase.value=RT.d1.texture;UpMat.uniforms.texel.value.set(4/w,4/h);pass(UpMat,RT.u1);
  _sp.copy(camera.position).addScaledVector(sunDir,900).project(camera);camera.getWorldDirection(_cf);const facing=smooth(.15,.75,_cf.dot(sunDir));const edge=1-smooth(.9,1.6,Math.max(Math.abs(_sp.x),Math.abs(_sp.y)));
  ShaftMat.uniforms.str.value=_sp.z<1?.55*facing*edge:0;
  if(ShaftMat.uniforms.str.value>.01){ShaftMat.uniforms.tSrc.value=RT.d1.texture;ShaftMat.uniforms.sun.value.set(_sp.x*.5+.5,_sp.y*.5+.5);ShaftMat.uniforms.aspect.value=w/h;pass(ShaftMat,RT.sh);CompMat.uniforms.tShaft.value=RT.sh.texture;}
  else{renderer.setRenderTarget(RT.sh);renderer.setClearColor(0,1);renderer.clear();CompMat.uniforms.tShaft.value=RT.sh.texture;}
  CompMat.uniforms.tColor.value=RT.B.texture;CompMat.uniforms.tBloom.value=RT.u1.texture;CompMat.uniforms.texel.value.set(1/w,1/h);CompMat.uniforms.flash.value=clamp(flashT,0,.6);pass(CompMat,null);}
