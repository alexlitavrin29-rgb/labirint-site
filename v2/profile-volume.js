import * as THREE from 'three';

const section=document.querySelector('#profile');
if(section){
 const viewer=section.querySelector('.profile-volume'),canvas=viewer.querySelector('canvas');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const full=matchMedia('(min-width:761px) and (min-height:600px) and (prefers-reduced-motion:no-preference)');
 const canRender=()=>full.matches&&document.documentElement.dataset.renderMode!=='light';
 const cssColor=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
 const color=name=>new THREE.Color(cssColor(name));
 let renderer,frame,last,time=0,visible=false,disposed=false;
 const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
 const camera=new THREE.OrthographicCamera(-2.3,2.3,2.3,-2.3,.1,20);camera.position.set(0,0,7);
 const uniforms={uPaper:{value:color('--paper')},uBlue:{value:color('--blue')},uInk:{value:color('--ink')},uAccent:{value:color('--accent')},uPressure:{value:0}};
 // The same surface transform is used for the solid and its fine meridian seams.
 function shape(p){
  const y=p.y,x=p.x*(.86+.08*Math.cos(y*3+p.z)),z=p.z*(.69+.08*Math.sin(p.x*4)),twist=y*.5;
  return new THREE.Vector3(x*Math.cos(twist)-z*Math.sin(twist),y*1.34,z*Math.cos(twist)+x*Math.sin(twist));
 }
 const geometry=new THREE.SphereGeometry(1,112,80),positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++){const p=shape(new THREE.Vector3().fromBufferAttribute(positions,i));positions.setXYZ(i,p.x,p.y,p.z);}geometry.computeVertexNormals();
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
  vertexShader:`uniform float uPressure;varying vec3 vNormal;varying vec3 vView;varying vec3 vSurface;
   void main(){vec3 p=position;p.x*=1.-uPressure*.13;p.z+=sin(p.y*2.)*uPressure*.08;
    vec4 view=modelViewMatrix*vec4(p,1.);vNormal=normalize(normalMatrix*normal);vView=-view.xyz;vSurface=p;gl_Position=projectionMatrix*view;}`,
  fragmentShader:`uniform vec3 uPaper;uniform vec3 uBlue;uniform vec3 uInk;uniform vec3 uAccent;
   varying vec3 vNormal;varying vec3 vView;varying vec3 vSurface;
   void main(){vec3 n=normalize(vNormal),v=normalize(vView),light=normalize(vec3(-.5,.8,.8));
    float rim=pow(1.-max(dot(n,v),0.),2.4);float shade=.78+.22*max(dot(n,light),0.);
    float sheen=pow(max(dot(reflect(-light,n),v),0.),28.);
    float wave=.5+.5*sin(vSurface.y*4.+vSurface.x*2.);
    vec3 c=mix(uPaper,uBlue,.2+rim*.55);c=mix(c,uInk,rim*.16+wave*.025);c*=shade;
    c+=uPaper*sheen*.28;c=mix(c,uAccent,rim*max(n.x,0.)*.08);
    gl_FragColor=vec4(c,.95);
    #include <colorspace_fragment>
   }`
 });
 group.add(new THREE.Mesh(geometry,material));
 const seamMaterial=new THREE.LineBasicMaterial({color:color('--ink'),transparent:true,opacity:.19});
 for(const angle of [.2,.95,1.7,2.5]){
  const points=[];for(let i=0;i<=200;i++){const t=i/200*Math.PI*2;points.push(shape(new THREE.Vector3(Math.sin(t)*Math.cos(angle),Math.cos(t),Math.sin(t)*Math.sin(angle))).multiplyScalar(1.002));}
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),seamMaterial));
 }
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;}
 catch{viewer.classList.add('is-error');}
 function render(){
  if(!renderer||disposed||!canRender())return;
  const progress=reduced.matches?0:(window.ScrollTrigger?.getById('profile-story')?.progress||0);
  const pressure=progress<.75?Math.pow(Math.sin(progress*Math.PI*4),2)*.8:0;
  uniforms.uPressure.value=pressure;
  group.rotation.set(-.3+progress*.18,-.55+progress*1.05,-.37+Math.sin(time*.18)*.035);
  group.scale.set(1-pressure*.06,1,1);
  renderer.render(scene,camera);
 }
 function resize(){
  if(!renderer||disposed)return;const width=viewer.clientWidth,height=viewer.clientHeight;if(!width||!height)return;
  // Camera transforms must not inflate the WebGL drawing buffer during a zoom.
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<761?1.25:1.5));renderer.setSize(width,height,false);
  const aspect=width/height,view=3.9;camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();render();
 }
 function stop(){if(frame)cancelAnimationFrame(frame);frame=undefined;last=undefined;}
 function tick(now){frame=undefined;if(!visible||document.hidden||!canRender()||disposed)return;if(last)time+=Math.min(now-last,100)/1000;last=now;render();frame=requestAnimationFrame(tick);}
 function sync(){stop();if(renderer&&visible&&!document.hidden&&canRender()&&!disposed)frame=requestAnimationFrame(tick);else render();}
 const ro=new ResizeObserver(resize),io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'80px'});
 if(renderer){ro.observe(viewer);io.observe(viewer);resize();viewer.classList.add('is-ready');}
 document.addEventListener('visibilitychange',sync);full.addEventListener('change',sync);
 window.addEventListener('visualmodechange',sync);
 window.addEventListener('palettechange',()=>{uniforms.uPaper.value.copy(color('--paper'));uniforms.uBlue.value.copy(color('--blue'));uniforms.uInk.value.copy(color('--ink'));uniforms.uAccent.value.copy(color('--accent'));seamMaterial.color.copy(color('--ink'));window.ScrollTrigger?.refresh();render();});
 window.addEventListener('pagehide',event=>{stop();if(event.persisted)return;disposed=true;ro.disconnect();io.disconnect();scene.traverse(o=>o.geometry?.dispose());material.dispose();seamMaterial.dispose();renderer?.dispose();});
 window.addEventListener('pageshow',event=>{if(event.persisted&&!disposed){resize();window.ScrollTrigger?.refresh();sync();}});

}
