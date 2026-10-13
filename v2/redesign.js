(() => {
  const root=document.documentElement;
  const themeButtons=[...document.querySelectorAll('[data-theme]')];
  function updateTheme(theme, persist=false) {
    root.dataset.palette=theme;
    themeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===theme)));
    document.querySelectorAll('a[href]').forEach(link=>{
      const href=link.getAttribute('href');
      if(!href || href.startsWith('#') || !/^[\w-]+\.html(?:[?#].*)?$/.test(href)) return;
      const url=new URL(href,location.href);url.searchParams.set('theme',theme);link.setAttribute('href',url.pathname.split('/').pop()+url.search+url.hash);
    });
    if(persist){
      try{localStorage.setItem('labyrinth-palette',theme);}catch{}
      const url=new URL(location.href);url.searchParams.set('theme',theme);history.replaceState(null,'',url);
      window.dispatchEvent(new Event('palettechange'));
    }
  }
  updateTheme(root.dataset.palette);
  themeButtons.forEach(button=>button.addEventListener('click',()=>updateTheme(button.dataset.theme,true)));
  const menuButton=document.querySelector('.menu-button');
  const menu=document.querySelector('.nav-links');
  function closeMenu(){menu?.classList.remove('is-open');menuButton?.setAttribute('aria-expanded','false');}
  menuButton?.addEventListener('click',()=>{const open=menu.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));});
  menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  const dialog=document.querySelector('dialog');
  document.querySelectorAll('[data-apply]').forEach(button=>button.addEventListener('click',()=>{
    closeMenu();
    const format=dialog?.querySelector('select[name="format"]');
    if(format)format.value=button.dataset.format||'undecided';
    if(dialog){const result=dialog.querySelector('.form-result');if(result)result.hidden=true;dialog.showModal();}
  }));
  dialog?.querySelector('[data-close]')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog?.querySelector('form')?.addEventListener('submit',event=>{event.preventDefault();dialog.querySelector('.form-result').hidden=false;});
  if(!window.gsap || !window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});
  document.fonts?.ready.then(()=>ScrollTrigger.refresh());
  const mm=gsap.matchMedia();
  // Browser chrome changes height while scrolling; only real width changes
  // should reconsider the mobile short-screen fallback (e.g. phone rotation).
  if(document.querySelector('.pitch-scroll')){
    // Re-measure after the browser restores the native scroll position on reload/back.
    window.addEventListener('pageshow',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>ScrollTrigger.refresh())));
    let layoutWidth=innerWidth,widthRefresh;
    window.addEventListener('resize',()=>{
      const width=innerWidth;if(width===layoutWidth)return;
      const wasMobile=layoutWidth<=760;layoutWidth=width;clearTimeout(widthRefresh);
      if(wasMobile&&width<=760)widthRefresh=setTimeout(()=>gsap.matchMediaRefresh(),200);
    });
  }
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
    document.querySelectorAll('[data-reveal]').forEach(el=>gsap.from(el,{y:30,opacity:0,duration:.9,ease:'sine.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
    const program=document.querySelector('.program-section');
    if(program&&matchMedia('(min-width:761px)').matches){
      gsap.to(program.querySelector('[data-wave-top]'),{attr:{d:'M0 44C160 -25 285 164 450 73S720 -25 900 72S1210 156 1440 36V160H0Z'},ease:'none',scrollTrigger:{trigger:program,start:'top bottom',end:'top 15%',scrub:.8}});
      gsap.to(program.querySelector('[data-wave-bottom]'),{attr:{d:'M0 108C190 12 305 154 500 65S760 22 950 105S1240 5 1440 86V160H0Z'},ease:'none',scrollTrigger:{trigger:program,start:'bottom bottom',end:'bottom top',scrub:.8}});
    }

  });
  mm.add({desktop:'(min-width: 761px)',mobile:'(max-width: 760px)',room:'(min-width:761px) and (min-height:600px)',motion:'(prefers-reduced-motion: no-preference)'},context=>{
    if(!context.conditions.motion)return;
    const desktop=context.conditions.desktop;
    const room=desktop?context.conditions.room:innerHeight>=600;
    const header=document.querySelector('.header');
    const headerHeight=()=>header?.offsetHeight||0;
    // A pinned story needs enough room for its copy and the sticky navigation.
    if(!room)return;
    const section=document.querySelector('.pitch-scroll');if(!section)return;
    const find=selector=>section.querySelector(selector);
    const all=selector=>section.querySelectorAll(selector);
    const justified=find('.pitch-justified');
    const originalWord=justified.textContent;
    justified.setAttribute('aria-label',originalWord);
    justified.replaceChildren(...Array.from(originalWord,letter=>{
      const span=document.createElement('span');span.className='pitch-letter';
      span.textContent=letter;span.setAttribute('aria-hidden','true');return span;
    }));
    section.classList.add('is-pitch-animated');
    section.style.setProperty('--pitch-header',`${headerHeight()}px`);
    const opening=find('.pitch-opening'),thought=find('.pitch-rumination'),explanation=find('.pitch-explanation');
    const first=find('.statement-pressure'),second=find('.statement-choice'),cta=find('.pitch-cta');
    const decor=find('.pressure-decor'),title=find('.pitch-title'),frame=find('.frame-inner');
    // Seed every staggered letter and demand before the first render.
    gsap.set(all('.pitch-letter, .pressure-demand'),{autoAlpha:0});
    gsap.set([thought,explanation,second],{autoAlpha:0});
    gsap.set(find('.pressure-echoes'),{autoAlpha:0});
    // Mobile uses native CSS sticky: no fixed-height pin wrapper to clip resized content.
    // GSAP still animates the story; the browser keeps its position during touch scrolling.
    const travel=desktop?5500:1900;
    section.style.setProperty('--pitch-travel',`${travel}px`);
    const scene=gsap.timeline({scrollTrigger:{id:'pitch-story',trigger:section,start:()=>`top ${headerHeight()}px`,end:()=>`+=${travel}`,pin:desktop,pinType:'fixed',scrub:desktop?.85:.5,anticipatePin:desktop?1:0,invalidateOnRefresh:true,
      onRefresh:()=>section.style.setProperty('--pitch-header',`${headerHeight()}px`)}});
    if(!desktop){
      const edges=[...all('.pressure-frame'),...all('.pressure-rail')];
      gsap.set(edges,{autoAlpha:0});
      scene.to(edges,{autoAlpha:1,stagger:.04,duration:1.4,ease:'sine.out'},0);
    }
    scene.fromTo(find('.pitch-agreed'),{x:()=>innerWidth*(desktop?.9:.14),y:desktop?0:8,rotation:desktop?6:1,opacity:desktop?1:0},{x:0,y:0,rotation:desktop?-1:0,opacity:1,duration:desktop?1:1.4,ease:desktop?'power3.out':'sine.out'},0)
      .fromTo(find('.rail-left'),{x:()=>-innerWidth*(desktop?.17:.055)},{x:0,duration:1.15,ease:desktop?'power3.out':'sine.out'},0)
      .fromTo(find('.rail-right'),{x:()=>innerWidth*(desktop?.17:.055)},{x:0,duration:1.15,ease:desktop?'power3.out':'sine.out'},0)
      .fromTo(frame,{scaleX:desktop?1.1:1.025,scaleY:desktop?1.06:1.02},{scaleX:desktop?.84:.93,scaleY:()=>Math.max(desktop?0:.7,Math.min(1,(title.offsetHeight+(desktop?90:70))/frame.offsetHeight)),duration:2.1,ease:'sine.inOut'},0)
      .fromTo(all('.pressure-demand'),{x:desktop?20:8,autoAlpha:0},{x:0,autoAlpha:1,stagger:.12,duration:desktop?.5:.7,ease:desktop?'power2.out':'sine.out'},.25)
      .to(find('.rail-left'),{x:()=>innerWidth*(desktop?.11:.035),scaleY:desktop?.95:.85,duration:1,ease:'sine.inOut'},1.05)
      .to(find('.rail-right'),{x:()=>-innerWidth*(desktop?.11:.035),scaleY:desktop?.95:.85,duration:1,ease:'sine.inOut'},1.05)
      .to(title,{scaleX:desktop?.88:.96,scaleY:desktop?.97:1,duration:.9,ease:'sine.inOut'},1.2)
      .to(find('.demand-one'),{x:()=>innerWidth*(desktop?.055:.018),y:desktop?15:6,duration:1,ease:'sine.inOut'},1.05)
      .to(find('.demand-two'),{x:()=>-innerWidth*(desktop?.055:.018),y:desktop?15:6,duration:1,ease:'sine.inOut'},1.05)
      .to(find('.demand-three'),{x:()=>-innerWidth*(desktop?.04:.018),y:desktop?-15:-6,duration:1,ease:'sine.inOut'},1.05)
      .fromTo(all('.pitch-letter'),{yPercent:desktop?110:45,rotation:desktop?8:0,autoAlpha:0},{yPercent:0,rotation:0,autoAlpha:1,stagger:desktop?.025:.015,duration:desktop?.5:.8,ease:desktop?'power3.out':'sine.out'},.5)
      .to(title,{x:desktop?-80:-18,y:desktop?-20:-8,autoAlpha:0,duration:.6,ease:'sine.inOut'},2.35)
      .to(find('.frame-inner'),{scaleX:1,scaleY:1,duration:1.15,ease:'sine.inOut'},2.45)
      .to([find('.rail-left'),find('.rail-right')],{x:0,scaleY:1,duration:1.15,ease:'sine.inOut'},2.45)
      .to(opening,{autoAlpha:0,duration:.1},2.95)
      .set(thought,{autoAlpha:1},2.8)
      .fromTo(all('.pitch-thought'),{x:desktop?80:24,y:desktop?20:8,autoAlpha:0},{x:0,y:0,autoAlpha:1,stagger:.1,duration:desktop?.65:.8,ease:'sine.out'},2.8)
      .to(all('.pressure-demand'),{autoAlpha:0,duration:.65},2.6)
      .to(find('.pressure-echoes'),{autoAlpha:1,duration:.65},2.9)
      .fromTo(all('.pressure-echoes span'),{x:()=>innerWidth*.12},{x:()=>-innerWidth*.08,stagger:.12,duration:1.9,ease:'none'},2.8)
      .to(all('.pitch-thought'),{y:desktop?-30:-12,autoAlpha:0,stagger:.04,duration:.65,ease:'sine.inOut'},4.65)
      .to(decor,{autoAlpha:0,duration:.85},4.7)
      .set(thought,{autoAlpha:0},5.4)
      .to(explanation,{autoAlpha:1,duration:.55},5.25)
      .fromTo(first,{y:desktop?25:12,autoAlpha:0},{y:0,autoAlpha:1,duration:.55,ease:'sine.out'},5.25)
      .from(cta,{y:desktop?15:6,autoAlpha:0,duration:.45,ease:desktop?'power1.out':'sine.out'},5.35)
      .to(first,{y:desktop?-45:-12,rotation:desktop?-2:0,autoAlpha:0,duration:.45,ease:desktop?'power2.inOut':'sine.inOut'},6.65)
      .fromTo(second,{y:desktop?45:12,rotation:desktop?2:0,autoAlpha:0},{y:0,rotation:0,autoAlpha:1,duration:.65,ease:desktop?'power2.out':'sine.inOut'},6.95)
      .to(find('.pitch-progress i'),{scaleX:1,duration:9,ease:'none'},0)
      .to(all('.pitch-chapters span')[0],{opacity:1,duration:.15},0)
      .to(all('.pitch-chapters span')[0],{opacity:.4,duration:.15},2.65)
      .to(all('.pitch-chapters span')[1],{opacity:1,duration:.15},2.65)
      .to(all('.pitch-chapters span')[1],{opacity:.4,duration:.15},5.3)
      .to(all('.pitch-chapters span')[2],{opacity:1,duration:.15},5.3);
    return()=>{
      section.classList.remove('is-pitch-animated');section.style.removeProperty('--pitch-header');
      section.style.removeProperty('--pitch-travel');
      justified.textContent=originalWord;justified.removeAttribute('aria-label');
    };
  });
})();
