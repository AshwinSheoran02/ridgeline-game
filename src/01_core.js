/* ================= Core ================= */
const TAU=Math.PI*2;
const V3=THREE.Vector3;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d;};
let seed=20261018;const srand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
const sr=(a,b)=>a+srand()*(b-a);
const pick=a=>a[(srand()*a.length)|0];
const rpick=a=>a[(Math.random()*a.length)|0];
const $=id=>document.getElementById(id);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let isTouch=!!(window.matchMedia&&(matchMedia('(pointer: coarse)').matches||(navigator.maxTouchPoints>0&&!matchMedia('(hover: hover)').matches)))||/iPad|iPhone|Android/i.test(navigator.userAgent);
const store={get(k,d){try{const v=localStorage.getItem('dustline.'+k);return v==null?d:v;}catch(e){return d;}},set(k,v){try{localStorage.setItem('dustline.'+k,v);}catch(e){}}};
const settings={quality:store.get('quality3',isTouch?'low':'high'),sens:parseFloat(store.get('sens','1'))||1,squad:parseInt(store.get('squad','5'))||5,voice:store.get('voice','on')!=='off',fov:parseFloat(store.get('fov','75'))||75,vol:parseFloat(store.get('vol','0.8')),spawn:store.get('spawn','halves')};if(isNaN(settings.vol))settings.vol=.8;
if(!['low','med','high'].includes(settings.quality))settings.quality='high';

/* ================= Renderer ================= */
const canvas=$('game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=settings.quality!=='low';
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.autoClear=false;
const MAXANI=Math.min(8,renderer.capabilities.getMaxAnisotropy());
const isGL2=renderer.capabilities.isWebGL2;

const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xa8bcd2,80,700);
const camera=new THREE.PerspectiveCamera(75,1,0.1,1400);
camera.rotation.order='YXZ';
const vmScene=new THREE.Scene();
const vmCam=new THREE.PerspectiveCamera(56,1,0.01,10);

const RES={s:1,t:0,n:0,cool:0};
function pixelRatio(){const d=devicePixelRatio||1;const base=settings.quality==='high'?Math.min(d,isTouch?1.5:1.75):settings.quality==='med'?Math.min(d,1.25):Math.min(d,1);return Math.max(.5,base*RES.s);}
function resize(){const w=innerWidth,h=innerHeight;renderer.setPixelRatio(pixelRatio());renderer.setSize(w,h,false);
  camera.aspect=vmCam.aspect=w/h;camera.updateProjectionMatrix();vmCam.updateProjectionMatrix();if(typeof resizePost==='function')resizePost();}
addEventListener('resize',()=>resize());

/* ================= Sky, light, environment ================= */
const sunDir=new V3(-0.42,0.78,0.46).normalize();
const skyVert='varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const skyFrag=`uniform vec3 sunDir;uniform float env;varying vec3 vD;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1.,0.)),u.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),u.x),u.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=vn(p)*a;p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){vec3 d=normalize(vD);float h=d.y;
 vec3 top=vec3(.07,.22,.62);vec3 hor=vec3(.50,.63,.78);
 vec3 c=mix(hor,top,pow(clamp(h,0.,1.),.45));
 float s=max(dot(d,sunDir),0.);
 c+=vec3(1.,.86,.62)*pow(s,8.)*.22;
 if(h>0.){vec2 cp=d.xz/(h+.12)*1.25;float base=fb(cp*.7+vec2(3.,1.));float det=fb(cp*2.6+vec2(9.,4.));float cl=smoothstep(.46,.74,base*.75+det*.35)*smoothstep(0.,.2,h);
  float lit=clamp(fb((cp+sunDir.xz*.06)*.7+vec2(3.,1.))-base+.55,0.,1.);vec3 dark=vec3(.50,.56,.66),bright=vec3(1.15,1.11,1.05);vec3 cc=mix(dark,bright,smoothstep(.3,.75,lit));cc+=vec3(1.,.85,.6)*pow(s,6.)*.35;c=mix(c,cc,cl*.95);
  float cir=smoothstep(.55,.8,fb(cp*.25+vec2(13.,2.)))*smoothstep(.15,.6,h)*.35;c=mix(c,vec3(.95,.97,1.),cir*(1.-cl));}
 c+=vec3(1.,.96,.9)*pow(s,1200.)*60.*(1.-env)+vec3(1.,.9,.7)*pow(s,200.)*1.2*(1.-env);
 if(h<0.)c=mix(hor,vec3(.30,.33,.26),clamp(-h*4.,0.,1.));
 gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <encodings_fragment>
}`;
const sky=new THREE.Mesh(new THREE.SphereGeometry(1200,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{sunDir:{value:sunDir},env:{value:0}},vertexShader:skyVert,fragmentShader:skyFrag}));
sky.renderOrder=-1;sky.frustumCulled=false;scene.add(sky);
(function(){const es=new THREE.Scene();es.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{sunDir:{value:sunDir},env:{value:1}},vertexShader:skyVert,fragmentShader:skyFrag})));
  const sunBlob=new THREE.Mesh(new THREE.SphereGeometry(3.5,12,8),new THREE.MeshBasicMaterial({color:new THREE.Color(16,14,11)}));sunBlob.position.copy(sunDir).multiplyScalar(40);es.add(sunBlob);
  const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromScene(es,.02).texture;scene.environment=env;vmScene.environment=env;pm.dispose();})();
const hemi=new THREE.HemisphereLight(0xb8d0f0,0x5a5444,0.34);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe8c8,2.45);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const SH=50;Object.assign(sun.shadow.camera,{left:-SH,right:SH,top:SH,bottom:-SH,near:5,far:360});
sun.shadow.bias=-0.0003;sun.shadow.normalBias=0.03;
scene.add(sun);scene.add(sun.target);
function placeSun(x,z){const tx=2*SH/2048;x=Math.round(x/tx)*tx;z=Math.round(z/tx)*tx;sun.target.position.set(x,0,z);sun.position.set(x,0,z).addScaledVector(sunDir,170);}
const flashLight=new THREE.PointLight(0xffc070,0,10,2);scene.add(flashLight);
const boomLight=new THREE.PointLight(0xffa040,0,22,2);scene.add(boomLight);
const vmHemi=new THREE.HemisphereLight(0xc4dcff,0x6a6650,0.3);vmScene.add(vmHemi);
const vmSun=new THREE.DirectionalLight(0xffe8c8,2.0);vmScene.add(vmSun);vmScene.add(vmSun.target);
const vmFlashLight=new THREE.PointLight(0xffb060,0,2,2);vmScene.add(vmFlashLight);
const WIND={value:0};
