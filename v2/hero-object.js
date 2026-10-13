import * as THREE from 'three';
import {GLTFLoader} from './vendor/three/GLTFLoader.js';
const viewer=document.querySelector('[data-hero-object]');
if(viewer){
 const canvas=viewer.querySelector('canvas');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const full=matchMedia('(min-width:761px) and (min-height:600px) and (prefers-reduced-motion:no-preference)');
 const canRender=()=>full.matches&&document.documentElement.dataset.renderMode!=='light';
 let renderer,model,frame,visible=true,time=0,last,disposed=false,rotation=0;
 const interaction={spread:0,jitter:0};
 const pointer=new THREE.Vector2(0,0);
 const art=viewer.closest('.hero-art');
 const materials=[];
 const scene=new THREE.Scene();
 const camera=new THREE.OrthographicCamera(-2.4,2.4,2.4,-2.4,.1,30);
 camera.position.set(0,0,7);
 const colors=()=>{const css=getComputedStyle(document.documentElement);return {ink:new THREE.Color(css.getPropertyValue('--ink').trim()),accent:new THREE.Color(css.getPropertyValue('--accent').trim())};};
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;}catch{viewer.classList.add('is-error');}
 if(renderer){
  const resize=()=>{const{width,height}=viewer.getBoundingClientRect();if(!width||!height)return;const ratio=Math.min(devicePixelRatio,1.5);renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);const aspect=width/height,view=4.7;camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();materials.forEach(m=>m.uniforms.uAspect.value=aspect);render();};
  function render(){
   if(disposed||!canRender())return;
   materials.forEach(m=>{m.uniforms.uTime.value=time;m.uniforms.uSpread.value=interaction.spread;m.uniforms.uJitter.value=interaction.jitter;});
   if(model){model.rotation.y=-.5+rotation;model.rotation.x=.2+Math.sin(rotation)*.14;model.rotation.z=.08;}
   renderer.render(scene,camera);
  }
  const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=undefined;last=undefined;};
  function animate(now){frame=undefined;if(!visible||document.hidden||!canRender()||disposed)return;if(last){const delta=Math.min(now-last,100)/1000;time+=delta;rotation+=delta*.16;}last=now;render();frame=requestAnimationFrame(animate);}
  const sync=()=>{stop();if(visible&&!document.hidden&&canRender()&&!disposed)frame=requestAnimationFrame(animate);else render();};
  function hover(event){
   const active=event.detail.active&&canRender();
   window.gsap?.to(interaction,{spread:0,jitter:active?.12:0,duration:motion.matches?0:.35,ease:'sine.inOut',overwrite:true});
  }
  function movePointer(event){
   if(!canRender())return;
   const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
   pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);
  }
  art?.addEventListener('pointermove',movePointer);art?.addEventListener('pointerenter',movePointer);
  art?.addEventListener('herohoverchange',hover);
  if(art?.dataset.interacting==='true'){if(art._heroPointer)movePointer(art._heroPointer);hover({detail:{active:true}});}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'50px'});observer.observe(viewer);
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewer);
  new GLTFLoader().load('./assets/models/consciousness.glb',gltf=>{
   if(disposed)return;model=gltf.scene;
   const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
   model.position.sub(center);model.scale.setScalar(3.6/Math.max(size.x,size.y,size.z));
   model.traverse(child=>{if(!child.isPoints&&!child.isLine)return;
    const count=child.geometry.attributes.position?.count||0;child.geometry.setDrawRange(0,Math.min(count,innerWidth<761?35000:80000));
    const c=colors();const material=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uSpread:{value:0},uJitter:{value:0},uPointer:{value:pointer},uAspect:{value:1},uInk:{value:c.ink},uAccent:{value:c.accent},uSize:{value:child.isPoints?2.2:1}},vertexShader:`uniform float uTime;uniform float uSize;uniform float uSpread;uniform float uJitter;uniform vec2 uPointer;uniform float uAspect;varying float vSeed;float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}void main(){vSeed=hash(position);vec3 p=position+normalize(position)*(sin(uTime*.3+vSeed*18.)*.025+uSpread*(.5+vSeed));vec4 projected=projectionMatrix*modelViewMatrix*vec4(p,1.);vec2 aspect=vec2(uAspect,1.);vec2 delta=(projected.xy/projected.w-uPointer)*aspect;float proximity=1.-smoothstep(0.,.06,length(delta));float angle=proximity*uJitter*2.5*sin(uTime*1.1+vSeed*1.3);float c=cos(angle),s=sin(angle);vec2 swirled=mat2(c,s,-s,c)*delta;projected.xy+=(swirled-delta)/aspect*projected.w;gl_Position=projected;gl_PointSize=uSize*(.65+vSeed*.7);}`,fragmentShader:child.isPoints?`uniform vec3 uInk;uniform vec3 uAccent;varying float vSeed;void main(){float a=smoothstep(.5,.08,length(gl_PointCoord-.5));if(a<.03)discard;gl_FragColor=vec4(mix(uInk,uAccent,step(.76,vSeed)),a*.72);}`:`uniform vec3 uInk;void main(){gl_FragColor=vec4(uInk,.13);}`,transparent:true,depthWrite:false,depthTest:false});
    if(Array.isArray(child.material))child.material.forEach(m=>m.dispose());else child.material.dispose();child.material=material;materials.push(material);
   });scene.add(model);viewer.classList.add('is-ready');resize();sync();
  },undefined,()=>viewer.classList.add('is-error'));
  document.addEventListener('visibilitychange',sync);full.addEventListener('change',sync);
  window.addEventListener('visualmodechange',sync);
  window.addEventListener('palettechange',()=>{const c=colors();materials.forEach(m=>{m.uniforms.uInk.value.copy(c.ink);if(m.uniforms.uAccent)m.uniforms.uAccent.value.copy(c.accent);});render();});
  window.addEventListener('pagehide',event=>{stop();if(event.persisted)return;disposed=true;art?.removeEventListener('herohoverchange',hover);art?.removeEventListener('pointermove',movePointer);art?.removeEventListener('pointerenter',movePointer);window.gsap?.killTweensOf(interaction);observer.disconnect();resizeObserver.disconnect();scene.traverse(o=>o.geometry?.dispose());materials.forEach(m=>m.dispose());renderer.dispose();});
  window.addEventListener('pageshow',event=>{if(event.persisted&&!disposed){resize();window.ScrollTrigger?.refresh();sync();}});resize();
 }
}
