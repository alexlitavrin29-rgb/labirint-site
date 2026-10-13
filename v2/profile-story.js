const section=document.querySelector('#profile');
if(section&&window.gsap&&window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  const mm=gsap.matchMedia();
  mm.add({desktop:'(min-width:761px)',room:'(min-width:761px) and (min-height:600px)',motion:'(prefers-reduced-motion:no-preference)'},context=>{
   if(!context.conditions.desktop||!context.conditions.room||!context.conditions.motion)return;
   const headerHeight=()=>document.querySelector('.header')?.offsetHeight||0;
   section.classList.add('is-profile-animated');section.style.setProperty('--profile-header',headerHeight()+'px');
   const panels=[...section.querySelectorAll('.profile-panel')],paths=[...section.querySelectorAll('.profile-line')];
   // Keep every textual beat in the reading tree while only the current one is painted.
   gsap.set(panels,{opacity:0});gsap.set(panels[0],{opacity:1});
   const cameraLayer=section.querySelector('.profile-camera'),ending=panels[3];
   const cssColor=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
   const tl=gsap.timeline({scrollTrigger:{id:'profile-story',trigger:section,start:()=>`top ${headerHeight()}px`,end:'+=3864',pin:true,scrub:.9,anticipatePin:1,invalidateOnRefresh:true,onRefresh:()=>section.style.setProperty('--profile-header',headerHeight()+'px')}});
   tl.fromTo(paths,{strokeDasharray:(i,e)=>e.getTotalLength(),strokeDashoffset:(i,e)=>e.getTotalLength()},{strokeDashoffset:0,stagger:.06,duration:.75,ease:'sine.out'},0)
    .to(panels[0],{opacity:0,y:-15,duration:.3},1.1)
    .fromTo(panels[1],{y:20,opacity:0},{y:0,opacity:1,duration:.3},1.4)
    .to(panels[1],{opacity:0,y:-15,duration:.3},2.25)
    .fromTo(panels[2],{y:20,opacity:0},{y:0,opacity:1,duration:.3},2.55)
    .to(cameraLayer,{opacity:0,y:-12,duration:.7,ease:'sine.inOut'},3.45)
    .fromTo(ending,{opacity:0,y:18},{opacity:1,y:0,duration:.9,ease:'sine.inOut'},3.75)
    .to(section.querySelector('.profile-progress i'),{scaleX:1,duration:5.7,ease:'none'},0);
   for(const [name,start,end] of [['authority',.05,1.1],['haste',1.4,2.25],['emotion',2.55,3.65]]){
    const label=section.querySelector('.factor-'+name),line=section.querySelector('.line-'+name),dot=section.querySelector('.node-'+name);
    tl.to(label,{backgroundColor:()=>cssColor('--accent'),opacity:1,scale:1.03,duration:.3},start)
      .to(line,{stroke:()=>cssColor('--accent'),opacity:.95,duration:.3},start)
      .to(dot,{fill:()=>cssColor('--accent'),opacity:1,duration:.3},start)
      .to(label,{backgroundColor:'transparent',opacity:.65,scale:1,duration:.3},end)
      .to(line,{stroke:()=>cssColor('--ink'),opacity:.32,duration:.3},end)
      .to(dot,{fill:()=>cssColor('--ink'),opacity:.55,duration:.3},end);
   }
   return()=>{section.classList.remove('is-profile-animated');section.style.removeProperty('--profile-header');};
  });
 }
