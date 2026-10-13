(() => {
 const hero=document.querySelector('.home-page .hero');
 if(!hero||!window.gsap||!window.ScrollTrigger)return;
 const art=hero.querySelector('.hero-art'),mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion:no-preference)',()=>{
  const marquee=document.querySelector('.trust-marquee'),track=marquee.querySelector('.marquee-track'),phrase=track.querySelector('.marquee-phrase');
  const headerHeight=()=>document.querySelector('.header').offsetHeight;
  marquee.classList.add('is-marquee-animated');
  const setHeader=()=>marquee.style.setProperty('--trust-header',headerHeight()+'px');setHeader();
  const originalPhrase=phrase.innerHTML;
  const readable=document.createElement('span');readable.className='marquee-readable';readable.textContent=phrase.textContent.replace(/\s+/g,' ').trim();
  // Keep one accessible sentence; the visual characters assemble at the right edge.
  const visual=document.createElement('span');visual.className='marquee-visual';visual.setAttribute('aria-hidden','true');
  visual.innerHTML=originalPhrase;phrase.replaceChildren(readable,visual);
  const hook=visual.querySelector('.marquee-hook'),name=visual.querySelector('.marquee-name'),qualification=visual.querySelector('.marquee-qualification');
  hook.dataset.arrival='rise';name.dataset.arrival='turn';
  const nameParts=name.textContent.trim().match(/^(.+) (\S+)$/);
  if(nameParts){const given=document.createElement('span'),surname=document.createElement('span');given.className='marquee-given';given.textContent=nameParts[1]+' ';surname.className='marquee-surname';surname.textContent=nameParts[2];name.replaceChildren(given,surname);}
  const qualifications=qualification.textContent.trim().match(/^(—\s*)([^,]+,)(\s*.*)$/);
  if(qualifications){const profession=document.createElement('span'),degree=document.createElement('span');profession.className='marquee-profession';profession.dataset.arrival='scale';profession.textContent=qualifications[2];degree.className='marquee-degree';degree.dataset.arrival='soft';degree.textContent=qualifications[3].trim();qualification.replaceChildren(qualifications[1],profession,' ',degree);}
  const walker=document.createTreeWalker(visual,NodeFilter.SHOW_TEXT),textNodes=[];
  while(walker.nextNode())textNodes.push(walker.currentNode);
  textNodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   node.textContent.replace(/\s+/g,' ').split(/( )/).forEach(word=>{
    if(!word)return;if(word===' '){fragment.append(' ');return;}
    const wrapper=document.createElement('span');wrapper.className='marquee-word';
    [...word].forEach(character=>{const letter=document.createElement('span');letter.className='marquee-letter';letter.textContent=character;wrapper.append(letter);});fragment.append(wrapper);
   });node.replaceWith(fragment);
  });
  const letters=[...visual.querySelectorAll('.marquee-letter')].map((element,index)=>({element,index,mode:element.closest('[data-arrival]')?.dataset.arrival||'rise',x:0,last:-1}));
  let viewportWidth=marquee.clientWidth,measureFrame,measured=false;
  function measureLetters(){
   viewportWidth=marquee.clientWidth;
   letters.forEach(letter=>{let node=letter.element,x=letter.element.offsetWidth/2;while(node&&node!==phrase){x+=node.offsetLeft;node=node.offsetParent;}letter.x=x;letter.last=-1;});measured=true;
  }
  function assembleLetters(){
   if(!measured)return;
   const x=Number(gsap.getProperty(track,'x')),entryWidth=innerWidth<761?100:180;
   letters.forEach(letter=>{
    const progress=Math.max(0,Math.min(1,(viewportWidth-x-letter.x)/entryWidth));
    if(Math.abs(progress-letter.last)<.002)return;letter.last=progress;
    const remaining=1-progress*progress*(3-2*progress);
    const mode=letter.mode,tilt=mode==='turn'?32:mode==='scale'?-12:mode==='soft'?0:(letter.index%2?7:-7);
    const rise=mode==='soft'?-12:mode==='scale'?8:24,scale=mode==='scale'?1-remaining*.28:1;
    letter.element.style.transform=`translate3d(0,${remaining*rise}px,0) rotate(${remaining*tilt}deg) scale(${scale})`;
    letter.element.style.opacity=String(1-remaining);
   });
  }
  // Collapse the startup/font/pin refreshes into one measurement per frame.
  function queueMeasure(){cancelAnimationFrame(measureFrame);measureFrame=requestAnimationFrame(()=>{measureFrame=undefined;measureLetters();assembleLetters();});}
  // Linear travel with scrub smoothing: no abrupt stops between words.
  const travel=()=>marquee.clientWidth+phrase.offsetWidth;
  gsap.fromTo(track,{x:()=>marquee.clientWidth},{x:()=>-phrase.offsetWidth,ease:'none',onUpdate:assembleLetters,scrollTrigger:{id:'trust-scroll-intro',refreshPriority:10,trigger:marquee,start:()=>`top ${headerHeight()}px`,end:()=>'+='+Math.round(Math.min(travel()*1.35,innerWidth<761?4400:7400)),pin:true,scrub:.9,anticipatePin:1,invalidateOnRefresh:true,onRefresh:()=>{setHeader();queueMeasure();}}});
  gsap.from('.intro-offer',{opacity:0,y:26,duration:.8,ease:'sine.out',scrollTrigger:{trigger:'.intro-offer',start:'top 86%',once:true}});
  // The shared page runtime already refreshes after fonts and pageshow.
  // Sort now so that its refresh measures this pin before the following scenes.
  ScrollTrigger.sort();
  art.classList.add('is-idle-rotating');let heroVisible=false;
  function syncHero(){art.classList.toggle('is-hero-visible',heroVisible&&!document.hidden);}
  const heroObserver=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;syncHero();});heroObserver.observe(art);document.addEventListener('visibilitychange',syncHero);
  return()=>{
   cancelAnimationFrame(measureFrame);phrase.innerHTML=originalPhrase;marquee.classList.remove('is-marquee-animated');marquee.style.removeProperty('--trust-header');
   heroObserver.disconnect();document.removeEventListener('visibilitychange',syncHero);art.classList.remove('is-idle-rotating','is-hero-visible');
  };
 });
 mm.add('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',()=>{
  art.tabIndex=0;let active=false,jitter;
  const picture=art.querySelector('picture'),orbits=art.querySelectorAll('.art-orbit');
  function setActive(value){
   if(value===active)return;active=value;art.dataset.interacting=String(active);
   art.dispatchEvent(new CustomEvent('herohoverchange',{detail:{active}}));jitter?.kill();
   if(active)jitter=gsap.to(picture,{x:1,y:.4,duration:.25,repeat:-1,yoyo:true,ease:'sine.inOut'});
   else gsap.to(picture,{x:0,y:0,duration:.5,ease:'sine.out',overwrite:true});
   gsap.to(orbits,{scale:active?1.01:1,duration:.8,ease:'sine.inOut',overwrite:true});
  }
  function rememberPointer(event){if(event.clientX!==undefined)art._heroPointer={clientX:event.clientX,clientY:event.clientY};}
  function enter(event){rememberPointer(event);setActive(true);}function leave(){if(!art.matches(':focus'))setActive(false);}function blur(){if(!art.matches(':hover'))setActive(false);}
  art.dataset.interacting='false';art.addEventListener('pointermove',rememberPointer);art.addEventListener('pointerenter',enter);art.addEventListener('pointerleave',leave);art.addEventListener('focus',enter);art.addEventListener('blur',blur);
  return()=>{
   art.removeEventListener('pointermove',rememberPointer);art.removeEventListener('pointerenter',enter);art.removeEventListener('pointerleave',leave);art.removeEventListener('focus',enter);art.removeEventListener('blur',blur);
   jitter?.kill();gsap.killTweensOf([picture,...orbits]);gsap.set([picture,...orbits],{clearProps:'transform'});
   active=false;art.dispatchEvent(new CustomEvent('herohoverchange',{detail:{active:false}}));art.removeAttribute('tabindex');delete art.dataset.interacting;delete art._heroPointer;
  };
 });
})();
