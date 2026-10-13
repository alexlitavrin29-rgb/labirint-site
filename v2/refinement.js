/* A model exercise: the visual opens a little room for a considered answer. */
(() => {
 const demo=document.querySelector('[data-practice-demo]');
 if(!demo||!window.gsap||!window.ScrollTrigger)return;
 const control=demo.querySelector('[data-pause-toggle]');
 const status=demo.querySelector('.pause-status');
 const mm=gsap.matchMedia();
 mm.add({all:'(min-width:0px)',motion:'(prefers-reduced-motion:no-preference)'},context=>{
  const motion=context.conditions.motion;
  const rings=demo.querySelectorAll('.pause-ring');
  const demands=demo.querySelectorAll('.pause-demand');
  const choices=demo.querySelectorAll('.pause-choice');
  let transition;
  control.hidden=false;
  function setPaused(paused){
   transition?.kill();
   demo.dataset.state=paused?'paused':'pressure';
   control.setAttribute('aria-pressed',String(paused));
   control.firstChild.textContent=paused?'Повторить пример ':'Взять паузу ';
   status.textContent=paused?'Можно уточнить, проверить информацию или отложить ответ.':'';
   const duration=motion?.65:0;
   transition=gsap.timeline({defaults:{duration,ease:'sine.inOut',overwrite:'auto'}})
    .to(rings,{scale:i=>paused?(i?1.2:1.12):1,transformOrigin:'50% 50%'},0)
    .to(demands,{x:i=>paused?(i?30:-30):0,y:paused?-10:0,opacity:paused?.25:1,rotation:i=>paused?(i?3:-3):0},0)
    .to(demo.querySelector('.pause-core'),{scale:paused?1.09:1,backgroundColor:paused?'var(--accent)':'var(--paper)'},0)
    .to(choices,{opacity:1,y:paused?0:8,borderColor:paused?'var(--ink)':'var(--line)',stagger:motion?.08:0,duration:motion?.4:0},motion?.2:0);
  }
  function toggle(){setPaused(control.getAttribute('aria-pressed')!=='true');}
  setPaused(false);transition.progress(1);
  control.addEventListener('click',toggle);
  return()=>{
   control.removeEventListener('click',toggle);transition?.kill();
   gsap.set([...rings,...demands,...choices,demo.querySelector('.pause-core')],{clearProps:'all'});
   control.hidden=true;control.setAttribute('aria-pressed','false');
   status.textContent='';demo.dataset.state='pressure';
  };
 });
 mm.add('(prefers-reduced-motion:no-preference)',()=>{
  gsap.from('.hero-copy > *',{opacity:0,y:12,duration:.55,stagger:.075,ease:'power2.out',clearProps:'opacity,transform'});
  document.querySelectorAll('.module-card').forEach(card=>{
   gsap.from(card,{y:24,rotation:-.6,duration:.7,ease:'power2.out',clearProps:'transform',scrollTrigger:{trigger:card,start:'top 94%',once:true}});
  });
  gsap.from('.pause-diagram',{scale:.96,opacity:.5,duration:.8,ease:'sine.out',scrollTrigger:{trigger:demo,start:'top 85%',once:true}});
  const buttonHandlers=[];
  document.querySelectorAll('.button > span, .text-link > span').forEach(arrow=>{
   const button=arrow.parentElement;
   function enter(){gsap.to(arrow,{x:3,y:-3,duration:.22,ease:'power2.out',overwrite:true});}
   function leave(){gsap.to(arrow,{x:0,y:0,duration:.3,ease:'sine.out',overwrite:true});}
   button.addEventListener('pointerenter',enter);button.addEventListener('pointerleave',leave);
   button.addEventListener('focus',enter);button.addEventListener('blur',leave);
   buttonHandlers.push(()=>{
    button.removeEventListener('pointerenter',enter);button.removeEventListener('pointerleave',leave);
    button.removeEventListener('focus',enter);button.removeEventListener('blur',leave);
    gsap.killTweensOf(arrow);gsap.set(arrow,{clearProps:'transform'});
   });
  });
  return()=>buttonHandlers.forEach(cleanup=>cleanup());
 });
})();
