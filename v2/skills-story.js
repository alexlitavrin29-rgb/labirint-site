(() => {
 const section=document.querySelector('#skills');
 if(!section||!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const mm=gsap.matchMedia();
 mm.add({desktop:'(min-width:761px)',room:'(min-width:761px) and (min-height:600px)',motion:'(prefers-reduced-motion:no-preference)'},context=>{
  if(!context.conditions.desktop||!context.conditions.room||!context.conditions.motion)return;
  const headerHeight=()=>document.querySelector('.header')?.offsetHeight||0;
  section.classList.add('is-skills-animated');section.style.setProperty('--skills-header',headerHeight()+'px');
  const beats=[...section.querySelectorAll('.skill-beat')],tracks=[...section.querySelectorAll('.skill-track b')];
  // Keep all four skills in the reading tree while only the current one is painted.
  gsap.set(beats,{opacity:0});gsap.set(beats[0],{opacity:1});
  const tl=gsap.timeline({scrollTrigger:{id:'skills-story',trigger:section,start:()=>`top ${headerHeight()}px`,end:'+=3780',pin:true,scrub:.85,anticipatePin:1,invalidateOnRefresh:true,onRefresh:()=>section.style.setProperty('--skills-header',headerHeight()+'px')}});
  const firstWord=beats[0].querySelector('.skill-word'),scan=beats[0].querySelector('.skill-scan');
  tl.fromTo(firstWord,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.5,ease:'power2.out'},0)
    .fromTo(scan,{x:0,opacity:1},{x:()=>firstWord.offsetWidth,opacity:0,duration:.5,ease:'power2.out'},0)
    .to(beats[0],{opacity:0,duration:.25},1.15)
    .to(beats[0].querySelector('.skill-copy'),{xPercent:-8,duration:.35,ease:'power2.in'},1.15)
    .to(beats[1],{opacity:1,duration:.3},1.5)
    .fromTo(beats[1].querySelector('.skill-word'),{xPercent:18,rotation:3,scale:1.08},{xPercent:0,rotation:0,scale:1,duration:.5,ease:'power3.out'},1.5)
    .fromTo(beats[1].querySelector('.skill-number'),{x:-50,rotation:-8},{x:0,rotation:0,duration:.5,ease:'power2.out'},1.5)
    .to(beats[1],{opacity:0,duration:.25},2.65)
    .to(beats[1].querySelector('.skill-copy'),{xPercent:-20,duration:.35,ease:'power2.in'},2.65)
    .to(beats[2],{opacity:1,duration:.3},3)
    .fromTo(beats[2].querySelectorAll('.control-line'),{x:(i)=>innerWidth*(i? .08:-.08),rotation:(i)=>i?2:-2},{x:0,rotation:0,stagger:.08,duration:.5,ease:'power3.out'},3)
    .fromTo(beats[2].querySelector('.skill-number'),{scale:.6,rotation:12},{scale:1,rotation:0,duration:.5,ease:'back.out(1.3)'},3)
    .to(beats[2],{opacity:0,duration:.25},4.15)
    .to(beats[2].querySelector('.skill-copy'),{xPercent:-8,duration:.35,ease:'power2.in'},4.15)
    .to(beats[3],{opacity:1,duration:.3},4.5)
    .fromTo(beats[3].querySelectorAll('.neutralize-line'),{clipPath:'inset(100% 0 0 0)',y:25},{clipPath:'inset(0% 0 0 0)',y:0,stagger:.08,duration:.5,ease:'power3.out'},4.5)
    .fromTo(beats[3].querySelector('.skill-number'),{x:40},{x:0,duration:.5,ease:'power2.out'},4.5);
  for(const [i,start] of [0,1.5,3,4.5].entries())tl.to(tracks[i],{scaleX:1,duration:1.2,ease:'none'},start);
  // Distancing visibly opens the frame; the final skill settles into that space.
  tl.fromTo(section.querySelector('.edge-left'),{x:()=>innerWidth*.035},{x:0,duration:.55,ease:'power3.out'},1.5)
    .fromTo(section.querySelector('.edge-right'),{x:()=>-innerWidth*.035},{x:0,duration:.55,ease:'power3.out'},1.5)
    .to({}, {duration:.4},5.7);
  return()=>{section.classList.remove('is-skills-animated');section.style.removeProperty('--skills-header');};
 });
 window.addEventListener('palettechange',()=>ScrollTrigger.refresh());
})();
