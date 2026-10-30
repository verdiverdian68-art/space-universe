import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

gsap.registerPlugin(ScrollTrigger);
const M=/Mobi|Android/i.test(navigator.userAgent)||innerWidth<700,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const c=document.getElementById('c'),R=new THREE.WebGLRenderer({canvas:c,antialias:!M});let pr=Math.min(devicePixelRatio,M?1.5:2);R.setPixelRatio(pr);
const S=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.5,150000),V=(x,y,z)=>new THREE.Vector3(x,y,z);
function rs(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}rs();addEventListener('resize',rs);
const gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)/.75;
S.add(new THREE.AmbientLight(0x334466,.35));const dl=new THREE.DirectionalLight(0xfff0dd,2.4);dl.position.set(0,.3,1);S.add(dl);
// ---------- shaders
const VS=`varying vec3 vO,vW,vN;void main(){vO=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
const FS=`precision highp float;varying vec3 vO,vW,vN;uniform float uT,uType,uSc,uBands,uSpot,uSeed;uniform vec3 uA,uB;
float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float nz(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*nz(p);p=p*2.03+1.7;a*=.5;}return s;}
void main(){vec3 p=normalize(vO),N=normalize(vN),L=normalize(-vW),Vv=normalize(cameraPosition-vW);vec3 c;float n=fbm(p*uSc+uSeed),spec=0.,city=0.;int t=int(uType+.5);
if(t==5){float g=fbm(p*uSc*2.+vec3(uT*.08,uT*.05,0.)+fbm(p*3.+uT*.05)*2.);c=mix(uA,uB,smoothstep(.3,.8,g));c+=vec3(.5,.2,0.)*smoothstep(.55,.7,fbm(p*9.-uT*.1));gl_FragColor=vec4(c*1.5,1.);return;}
if(t==1){float b=sin(p.y*uBands+fbm(p*vec3(2.,7.,2.)+uSeed+uT*.01)*4.)*.5+.5;c=mix(uA,uB,b*.75+.25*fbm(p*12.));float lon=atan(p.z,p.x);vec2 d=vec2(mod(lon-1.+3.14159,6.28318)-3.14159,(p.y+.28)*2.2);c=mix(c,vec3(.72,.28,.16),smoothstep(.34,.12,length(d*vec2(1.2,1.)))*uSpot);}
else if(t==3){float q=fbm(p*vec3(2.,5.,2.)+vec3(uT*.01,0.,0.)+fbm(p*3.)*1.5);c=mix(uA,uB,q);}
else if(t==2){float land=smoothstep(.5,.53,n);vec3 oc=mix(vec3(.01,.06,.25),vec3(.03,.2,.5),smoothstep(.3,.5,n));vec3 lc=mix(vec3(.12,.3,.08),vec3(.5,.42,.25),smoothstep(.4,.8,fbm(p*6.)+n-.5));lc=mix(lc,vec3(.9),smoothstep(.8,.9,abs(p.y)+n*.1));c=mix(oc,lc,land);spec=(1.-land)*pow(max(dot(reflect(-L,N),Vv),0.),40.)*.8;float cl=smoothstep(.5,.78,fbm(p*4.+vec3(uT*.012,0.,0.)+3.));c=mix(c,vec3(1.),cl*.85);city=step(.74,nz(p*70.))*land*(1.-cl*.8)*smoothstep(.45,.6,fbm(p*5.));}
else{c=mix(uA,uB,n);float k=nz(p*22.);c*=1.-.35*smoothstep(.55,.62,k)*(1.-smoothstep(.62,.7,k));c*=.75+.5*fbm(p*uSc*4.);
if(t==4){c*=.8+.4*fbm(p*3.);c=mix(c,vec3(.95),smoothstep(.86,.93,abs(p.y)+n*.1));c=mix(c,vec3(.7,.45,.34),smoothstep(.14,.05,length(p-normalize(vec3(.6,.25,.5))))*.7);}}
float lit=smoothstep(-.08,.25,dot(N,L));c=c*(.03+lit*1.2)+spec*lit;c+=vec3(1.,.72,.3)*city*(1.-lit)*1.6;gl_FragColor=vec4(c,1.);}`;
const AV=`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const AF=`varying vec3 vN;uniform vec3 uC;uniform float uP;void main(){float i=pow(clamp(-vN.z,0.,1.),uP);gl_FragColor=vec4(uC*i,i);}`;
const U=[],P={},hit=[];
function planet(key,r,x,z,o){const u={uT:{value:0},uType:{value:o.t||0},uSc:{value:o.sc||3},uBands:{value:o.b||8},uSpot:{value:o.sp||0},uSeed:{value:Math.random()*20},uA:{value:new THREE.Vector3(...o.A)},uB:{value:new THREE.Vector3(...o.B)}};U.push(u);
const m=new THREE.Mesh(new THREE.SphereGeometry(r,M?48:96,M?32:64),new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,uniforms:u}));m.position.set(x,0,z);m.userData={u,spin:o.spin||.05,r};S.add(m);P[key]=m;
if(o.atm){const a=new THREE.Mesh(new THREE.SphereGeometry(r*(o.as||1.12),48,32),new THREE.ShaderMaterial({vertexShader:AV,fragmentShader:AF,uniforms:{uC:{value:new THREE.Vector3(...o.atm)},uP:{value:o.ap||2.5}},side:THREE.BackSide,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));a.position.copy(m.position);S.add(a)}return m}
function glowTex(r,g,b){const k=document.createElement('canvas');k.width=k.height=128;const x=k.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,`rgba(${r},${g},${b},1)`);gr.addColorStop(.25,`rgba(${r},${g},${b},.35)`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`);x.fillStyle=gr;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(k)}
function sprite(tex,s,pos,op){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:op}));sp.scale.set(s,s,1);sp.position.copy(pos);S.add(sp);return sp}
// ---------- bodies
planet('sun',22,0,0,{t:5,A:[1,.4,.05],B:[1,.9,.5],sc:4,atm:[1,.5,.15],as:1.5,ap:1.6,spin:.01});
sprite(glowTex(255,190,100),240,V(0,0,0),.9);
planet('mercury',3,0,-90,{A:[.4,.38,.36],B:[.72,.67,.6],sc:3});
planet('venus',5.5,0,-150,{t:3,A:[.85,.6,.28],B:[.98,.86,.55],atm:[1,.75,.4],as:1.1,ap:2});
planet('earth',6,0,-215,{t:2,sc:2.2,A:[0,0,0],B:[0,0,0],atm:[.3,.55,1],as:1.13,ap:2.6,spin:.08});
const mp=V(22,2,-241);planet('moon',2.2,mp.x,mp.z,{A:[.3,.3,.3],B:[.8,.78,.74],sc:4,spin:.01}).position.y=2;
planet('mars',4,0,-285,{t:4,sc:3,A:[.5,.2,.09],B:[.85,.45,.25],atm:[.9,.5,.35],as:1.06,ap:3});
planet('jupiter',16,0,-480,{t:1,b:14,sp:1,A:[.6,.42,.28],B:[.93,.85,.72],spin:.18});
planet('saturn',13,0,-610,{t:1,b:10,A:[.74,.64,.44],B:[.94,.88,.7],atm:[.9,.8,.5],as:1.05,ap:3,spin:.15});
planet('uranus',8,0,-720,{t:1,b:3,A:[.5,.8,.85],B:[.62,.88,.9],atm:[.5,.9,.95],as:1.08,ap:2.5,spin:.1}).rotation.z=1.7;
planet('neptune',8,0,-800,{t:1,b:6,A:[.08,.18,.7],B:[.25,.45,.95],atm:[.2,.4,1],as:1.08,ap:2.5,spin:.1});
planet('pluto',3,120,-1000,{A:[.5,.4,.35],B:[.85,.75,.65],sc:3});planet('eris',4,-260,-1150,{A:[.6,.6,.62],B:[.9,.9,.95],sc:3});
// Saturn rings
{const r=13,rg=new THREE.RingGeometry(r*1.35,r*2.4,128,1),uv=rg.attributes.uv,ps=rg.attributes.position;for(let i=0;i<ps.count;i++)uv.setXY(i,(Math.hypot(ps.getX(i),ps.getY(i))-r*1.35)/(r*1.05),.5);
const k=document.createElement('canvas');k.width=512;k.height=4;const x=k.getContext('2d');for(let i=0;i<512;i++){const t=i/512;let a=.25+.5*Math.abs(Math.sin(t*40))*Math.random()+.2*Math.sin(t*9);if(t>.58&&t<.64)a=.05;if(t<.12)a*=.35;if(t>.92)a*=.4;x.fillStyle=`rgba(${215-t*40|0},${190-t*40|0},${150-t*40|0},${Math.max(0,Math.min(1,a))})`;x.fillRect(i,0,1,4)}
const ring=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(k),transparent:true,side:THREE.DoubleSide,depthWrite:false}));ring.position.copy(P.saturn.position);ring.rotation.x=Math.PI/2-.45;ring.rotation.y=.1;S.add(ring)}
// Jupiter moons
const moons=[[1.9,.9,0xd9c27a,1.3],[2.4,.6,0xcfc6b5,1.1],[3.1,.45,0xb0a79a,1.8],[3.9,.3,0x8a7d70,1.5]].map(([d,s,col,rr],i)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(rr,24,16),new THREE.MeshStandardMaterial({color:col,roughness:1}));S.add(m);return{m,d:d*16,s,ph:i*1.7}});
// Asteroid belt
{const g=new THREE.IcosahedronGeometry(1,1),pp=g.attributes.position;for(let i=0;i<pp.count;i++){const k=.7+Math.random()*.5;pp.setXYZ(i,pp.getX(i)*k,pp.getY(i)*k,pp.getZ(i)*k)}g.computeVertexNormals();
const n=M?700:2200,im=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:0x8a7a6a,roughness:1,flatShading:true}),n),d=new THREE.Object3D();
for(let i=0;i<n;i++){let x,y;do{x=gauss()*38;y=gauss()*24}while(Math.abs(x)<5&&Math.abs(y)<4);d.position.set(x,y,-325-Math.random()*100);d.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);const s=Math.pow(Math.random(),3)*2.6+.15;d.scale.set(s,s*(.6+Math.random()*.6),s*(.7+Math.random()*.5));d.updateMatrix();im.setMatrixAt(i,d.matrix)}S.add(im);P.belt=im}
// ---------- stars, dust, nebulae
function pts(n,fn,size,att,op){const p=new Float32Array(n*3),cl=new Float32Array(n*3),t=new THREE.Color();for(let i=0;i<n;i++){const o=fn(i,t);p.set(o,i*3);cl.set([t.r,t.g,t.b],i*3)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(cl,3));return new THREE.Points(g,new THREE.PointsMaterial({size,vertexColors:true,sizeAttenuation:att,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}))}
const stars=pts(M?3000:8000,(i,t)=>{const a=Math.random()*6.283,b=Math.acos(2*Math.random()-1),r=70000;t.setHSL(.55+Math.random()*.15,.4,.6+Math.random()*.4);return[r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a)]},1.6,false,1);S.add(stars);
const dust=pts(M?1500:4000,(i,t)=>{t.setHSL(.6,.3,.7);return[gauss()*220,gauss()*140,-Math.random()*1400+200]},.9,true,.6);S.add(dust);
[[-350,120,-250,[110,70,255],700],[400,-80,-600,[40,120,255],900],[-300,60,-950,[180,60,200],1000],[200,150,-60,[70,80,220],500]].forEach(a=>sprite(glowTex(...a[3]),a[4],V(a[0],a[1],a[2]),.22));
const kuiper=pts(M?1500:3500,(i,t)=>{const a=Math.random()*6.283,r=950+Math.random()*550;t.setHSL(.6,.2,.6);return[Math.cos(a)*r,gauss()*30,Math.sin(a)*r]},1.4,false,.8);S.add(kuiper);
// Galaxy
const G=new THREE.Group();G.position.set(0,0,-4200);G.rotation.x=.45;G.rotation.z=.2;S.add(G);const RG=2500;
G.add(pts(M?14000:40000,(i,t)=>{let r,th,y;const core=Math.random()<.2;if(core){r=Math.pow(Math.random(),2)*RG*.2;th=Math.random()*6.283;y=gauss()*RG*.03}else{r=Math.pow(Math.random(),.6)*RG;th=(i%4)*1.5708+r/RG*4.2+gauss()*.3*(1-.5*r/RG);y=gauss()*RG*.015}
const q=r/RG;t.setRGB(1-q*.5+(core?0:-.1),.8-q*.15,.55+q*.45);if(!core&&Math.random()<.12)t.setRGB(.5,.65,1);return[Math.cos(th)*r,y,Math.sin(th)*r]},1.5,false,.9));
G.add(sprite(glowTex(255,200,140),RG*.7,V(0,0,0),.6));
{const k=document.createElement('canvas');k.width=k.height=64;const x=k.getContext('2d');x.strokeStyle='#8fb8ff';x.lineWidth=3;x.beginPath();x.arc(32,32,22,0,6.3);x.stroke();const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(k),depthTest:false,transparent:true}));s.scale.set(160,160,1);const th=.6*4.2+.3;s.position.set(Math.cos(th)*RG*.6,0,Math.sin(th)*RG*.6);G.add(s)}
// Cosmic web
const W=new THREE.Group();W.position.set(0,0,-4200);S.add(W);{const N=70,nodes=[];for(let i=0;i<N;i++)nodes.push(V(gauss(),gauss(),gauss()).multiplyScalar(7000));const arr=[],cnt=M?40:70;
nodes.forEach((a,i)=>{const near=nodes.map((b,j)=>[a.distanceTo(b),j]).sort((x,y)=>x[0]-y[0]).slice(1,3);near.forEach(([,j])=>{for(let k=0;k<cnt;k++){const t=Math.random();arr.push(a.clone().lerp(nodes[j],t).add(V(gauss(),gauss(),gauss()).multiplyScalar(180)).toArray())}});for(let k=0;k<(M?60:130);k++)arr.push(a.clone().add(V(gauss(),gauss(),gauss()).multiplyScalar(260)).toArray())});
W.add(pts(arr.length,(i,t)=>{t.setHSL(.58+Math.random()*.15,.7,.45+Math.random()*.3);return arr[i]},2,false,.9))}
// ---------- story data
const T=[{},
{n:'Sun',k:'01 · Our star',t:'The Sun',x:'A glowing ball of plasma holding 99.86% of the Solar System’s mass. Its light takes about 8 minutes to reach us.',f:[['Diameter','1,392,700 km'],['Surface','≈ 5,500 °C'],['Core','≈ 15 million °C'],['Composition','≈ 73% hydrogen, 25% helium'],['From Earth','149.6 million km (1 AU)']]},
{n:'Mercury',k:'02 · Planet',t:'Mercury',x:'The smallest planet, a cratered world with almost no atmosphere to hold heat.',f:[['Diameter','4,879 km'],['Temperature','−180 °C to 430 °C'],['Orbit','88 days'],['From Sun','57.9 million km']]},
{n:'Venus',k:'03 · Planet',t:'Venus',x:'Thick carbon dioxide clouds trap heat, making it the hottest planet. It spins backwards, one turn in 243 days.',f:[['Diameter','12,104 km'],['Surface','≈ 465 °C'],['Pressure','≈ 92 × Earth'],['Orbit','225 days'],['From Sun','108.2 million km']]},
{n:'Earth',k:'04 · Home',t:'Earth',x:'The only known world with liquid surface oceans and life. Clouds drift over blue seas and continents.',f:[['Diameter','12,742 km'],['Average temp','≈ 15 °C'],['Moons','1'],['Orbit','365.25 days'],['From Sun','149.6 million km']]},
{k:'04 · Home',t:'Earth by Night',x:'On the dark side, cities glow. Our atmosphere is a thin shell, about 100 km up to the edge of space.',f:[['Rotation','23 h 56 min'],['Land / ocean','29% / 71%'],['Atmosphere','78% N₂, 21% O₂']]},
{n:'Moon',k:'05 · Satellite',t:'The Moon',x:'Cratered, airless and tidally locked, it always shows us one face. Earth hangs in the distance.',f:[['Diameter','3,474 km'],['Distance','384,400 km'],['Temperature','−173 °C to 127 °C'],['Orbit','27.3 days']]},
{n:'Mars',k:'06 · Planet',t:'Mars',x:'A cold desert with polar ice caps, dust storms and Olympus Mons, the tallest volcano known in the Solar System.',f:[['Diameter','6,779 km'],['Average temp','≈ −63 °C'],['Moons','2 (Phobos, Deimos)'],['Olympus Mons','≈ 22 km high'],['Orbit','687 days']]},
{n:'Belt',k:'07 · Asteroids',t:'The Asteroid Belt',x:'Rocky remnants between Mars and Jupiter. In reality they lie millions of km apart; here they are packed for drama.',f:[['Region','2.2 – 3.2 AU'],['Largest','Ceres, ≈ 940 km'],['Total mass','≈ 3% of the Moon']]},
{n:'Jupiter',k:'08 · Gas giant',t:'Jupiter',x:'More massive than all other planets combined. The Great Red Spot is a storm wider than Earth, raging for centuries.',f:[['Diameter','139,820 km'],['Cloud tops','≈ −110 °C'],['Moons','90+ known'],['Orbit','11.9 years'],['From Sun','778 million km']]},
{n:'Saturn',k:'09 · Gas giant',t:'Saturn',x:'Less dense than water, wrapped in a vast ring system.',f:[['Diameter','116,460 km'],['Moons','140+ known'],['Orbit','29.4 years'],['From Sun','1.43 billion km']]},
{k:'09 · Gas giant',t:'The Rings',x:'Billions of ice chunks, mostly water ice. The rings span ~280,000 km yet are often only ~10 m thick.',f:[['Main rings','A, B, C'],['Gap','Cassini Division'],['Composition','≈ 99% water ice']]},
{n:'Uranus',k:'10 · Ice giant',t:'Uranus',x:'Methane in its hydrogen-helium atmosphere absorbs red light, giving a cyan tint. It rolls on its side.',f:[['Diameter','50,724 km'],['Axial tilt','97.8°'],['Min temp','≈ −224 °C'],['Orbit','84 years']]},
{n:'Neptune',k:'11 · Ice giant',t:'Neptune',x:'A deep-blue world with the fastest winds in the Solar System, up to about 2,000 km/h.',f:[['Diameter','49,244 km'],['Temperature','≈ −214 °C'],['Moons','16 known'],['Orbit','165 years'],['From Sun','4.5 billion km']]},
{n:'Beyond',k:'12 · Outer reaches',t:'Beyond the Planets',x:'The Kuiper Belt holds icy bodies and dwarf planets such as Pluto and Eris. Voyager 1 left the Sun’s bubble in 2012.',f:[['Kuiper Belt','30 – 50 AU'],['Pluto','2,377 km'],['Heliopause','≈ 120 AU']]},
{n:'Galaxy',k:'13 · Our galaxy',t:'The Milky Way',x:'A barred spiral of hundreds of billions of stars. We live in a minor arm, about 26,000 light-years from the core (ringed). This image is an artist’s model.',f:[['Width','≈ 100,000 ly'],['Our orbit','≈ 230 million years'],['Core','Sagittarius A*, ≈ 4 million suns']]},
{n:'Universe',k:'14 · Everything',t:'Observable Universe',x:'Galaxies gather in clusters and filaments around vast voids, the cosmic web. Colours and layout here are illustrative.',f:[['Diameter','≈ 93 billion ly'],['Age','13.8 billion years'],['Galaxies','Hundreds of billions+'],['Ordinary matter','≈ 5%']]},{}];
const N=T.length,st=document.getElementById('scroll');st.style.height=(N*85)+'vh';
// ---------- camera keyframes
const kf=(k,o,l=[-.9,0,0])=>{const b=P[k],r=b.userData.r;return{p:b.position.clone().add(V(o[0]*r,o[1]*r,o[2]*r)),l:b.position.clone().add(V(l[0]*r,l[1]*r,l[2]*r))}};
const K=[{p:V(0,8,560),l:V(0,0,0)},kf('sun',[.9,.3,2.9]),kf('mercury',[1.2,.5,3.6]),kf('venus',[1.2,.5,3.6]),kf('earth',[1.4,.5,3.6]),kf('earth',[2.4,.4,-3.2]),kf('moon',[4.1,.45,-1.8],[-.4,0,0]),kf('mars',[1.2,.5,3.8]),
{p:V(5,2,-322),l:V(0,0,-400)},kf('jupiter',[1.2,.4,3.6]),kf('saturn',[1.3,.5,3.8]),kf('saturn',[-3,1.1,2.8],[.6,0,0]),kf('uranus',[1.2,.4,3.8]),kf('neptune',[1.2,.4,3.8]),
{p:V(260,160,-1300),l:V(0,0,-500)},{p:V(0,4600,-600),l:V(0,0,-4200)},{p:V(0,20000,9000),l:V(0,0,-4200)},{p:V(0,26000,13000),l:V(0,0,-4200)}];
// ---------- UI
const panel=document.getElementById('panel'),nav=document.getElementById('nav'),ctr=document.getElementById('ctr'),tip=document.getElementById('tip');let shown=-1;
const navB=[];T.forEach((d,i)=>{if(!d.n)return;const b=document.createElement('button');b.innerHTML=`<span>${d.n}</span><i></i>`;b.onclick=()=>go(i);nav.appendChild(b);navB[i]=b});
function go(i){scrollTo({top:i/(N-1)*(document.documentElement.scrollHeight-innerHeight),behavior:RM?'auto':'smooth'})}
function show(i){if(i===shown)return;shown=i;const d=T[i];navB.forEach((b,j)=>b&&b.classList.toggle('on',j===i));ctr.textContent=String(i).padStart(2,'0')+' / '+String(N-1).padStart(2,'0');
gsap.to('#end',{opacity:i===N-1?1:0,duration:2});gsap.to(panel,{opacity:0,y:10,duration:.25,onComplete:()=>{if(!d.k||shown!==i)return;panel.children[0].textContent=d.k;panel.children[1].textContent=d.t;panel.children[2].textContent=d.x;panel.children[3].innerHTML=d.f.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('');gsap.to(panel,{opacity:1,y:0,duration:.7})}})}
ScrollTrigger.create({trigger:st,start:'top top',end:'bottom bottom',onUpdate:s=>{prog=s.progress;document.getElementById('bar').style.width=prog*100+'%'}});
gsap.to('#hero',{opacity:0,y:-60,scrollTrigger:{trigger:st,start:'top top',end:'+='+innerHeight*.6,scrub:true}});
gsap.fromTo(c,{opacity:0},{opacity:1,duration:3.5,delay:1.8});gsap.to('#load',{opacity:0,delay:1.8,duration:1.2,onComplete:()=>load.remove()});
document.getElementById('fs').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
let ac,on=false;snd.onclick=()=>{if(!ac){ac=new AudioContext();const g=ac.createGain(),f=ac.createBiquadFilter();g.gain.value=0;f.type='lowpass';f.frequency.value=380;[55,82.4,110.3].forEach(fr=>{const o=ac.createOscillator();o.frequency.value=fr;o.connect(f);o.start()});f.connect(g);g.connect(ac.destination);ac.g=g}on=!on;ac.g.gain.setTargetAtTime(on?.12:0,ac.currentTime,.5);snd.textContent='Sound '+(on?'on':'off')}
// hover + click planets
const rc=new THREE.Raycaster(),mv=new THREE.Vector2(),HS={sun:1,mercury:2,venus:3,earth:4,moon:6,mars:7,jupiter:9,saturn:10,uranus:12,neptune:13};let hov=null;
addEventListener('pointermove',e=>{mv.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);rc.setFromCamera(mv,cam);const h=rc.intersectObjects(Object.keys(HS).map(k=>P[k]))[0];hov=h?Object.keys(HS).find(k=>P[k]===h.object):null;tip.style.opacity=hov?1:0;if(hov){tip.textContent=hov;tip.style.left=e.clientX+14+'px';tip.style.top=e.clientY+14+'px'}c.style.cursor=hov?'pointer':''});
addEventListener('click',e=>{if(hov&&e.target===c||hov&&e.target.tagName==='HTML')go(HS[hov])});
// ---------- loop
let prog=0,look=K[0].l.clone(),last=performance.now(),ft=16,cnt=0;const tp=V(0,0,0),tl=V(0,0,0);cam.position.copy(K[0].p);show(0);
function tick(now){requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.1);last=now;ft=ft*.95+dt*1000*.05;
if(++cnt%90===0&&ft>26&&pr>.8){pr-=.15;R.setPixelRatio(pr);rs()}
const s=prog*(N-1+0)*((K.length-1)/(N-1)),i=Math.min(Math.floor(s),K.length-2),f0=s-i,f=THREE.MathUtils.lerp(f0,f0*f0*(3-2*f0),.65);
tp.lerpVectors(K[i].p,K[i+1].p,f);tl.lerpVectors(K[i].l,K[i+1].l,f);const k=RM?1:1-Math.exp(-dt*3.5);cam.position.lerp(tp,k);look.lerp(tl,k);cam.lookAt(look);
show(Math.max(0,Math.min(N-1,Math.round(s))));
const t=now/1000;U.forEach(u=>u.uT.value=RM?0:t);Object.values(P).forEach(m=>{if(m.userData.spin&&!RM)m.rotation.y+=dt*m.userData.spin});
moons.forEach(o=>{const a=t*o.s*.5+o.ph;o.m.position.set(Math.cos(a)*o.d,Math.sin(a*.7)*2,-480+Math.sin(a)*o.d)});
P.belt.rotation.z=RM?0:t*.004;stars.position.copy(cam.position);kuiper.visible=s>12.5;G.visible=s>13.3;W.visible=s>14.7;if(!RM)G.rotation.y=t*.01;
R.render(S,cam)}
requestAnimationFrame(tick);
