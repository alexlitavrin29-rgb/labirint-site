const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 for(const size of [{width:390,height:844},{width:320,height:600},{width:430,height:932},{width:844,height:390}]){
  const p=await b.newPage({viewport:size,isMobile:true,hasTouch:true,deviceScaleFactor:3});const requested=[],errors=[];
  p.on('request',r=>requested.push(r.url()));p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{window.__mobileTasks=[];window.__mobileGL=0;new PerformanceObserver(list=>__mobileTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(String(type).startsWith('webgl'))__mobileGL++;return get.call(this,type,...args)};});
  const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.evaluate(()=>__mobileGL),0,'Phone does not allocate WebGL contexts');
  assert(!requested.some(url=>/\.glb|vendor\/three\/|hero-object\.js|profile-volume\.js/.test(url)),'Phone does not download desktop 3D assets');
  assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('hero-turn')),false,'Hero does not hold up mobile scrolling');
  for(const id of ['profile-story','skills-story'])assert.equal(await p.evaluate(id=>!!ScrollTrigger.getById(id),id),false,'Story reads in normal flow on mobile');
  for(const selector of ['.profile-panel','.skill-beat'])for(const el of await p.locator(selector).all()){
   await el.scrollIntoViewIfNeeded();const box=await el.boundingBox();assert(box.x>=-1&&box.x+box.width<=size.width+1,'Text fits mobile width');assert(await el.evaluate(e=>Number(getComputedStyle(e).opacity)===1),'All mobile story text is readable');
  }
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No sideways overflow');
  if(await p.locator('.menu-button').isVisible()){await p.locator('.menu-button').click();await p.locator('.nav-links a[href="#programs"]').click();assert.equal(await p.locator('.menu-button').getAttribute('aria-expanded'),'false');}
  await p.locator('#program .button').click();assert(await p.locator('dialog').isVisible());
  const field=p.locator('dialog input').first();assert(await field.evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16),'Input does not trigger iOS text zoom');await p.locator('[data-close]').click();
  if(size.height>=600){const distance=await p.evaluate(()=>{const t=ScrollTrigger.getById('pitch-story');return t.end-t.start});assert(distance>=1800&&distance<=2000,'Mobile hook leaves enough scroll travel for readable beats');}
  const tasks=await p.evaluate(()=>__mobileTasks);assert(tasks.reduce((sum,n)=>sum+n,0)<1000,'Limited main-thread blocking under 4x CPU throttling: '+tasks);
  assert.deepEqual(errors,[]);if(size.width===390){await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:'.preview/mobile-optimized-hero.png'});await p.locator('#skills').scrollIntoViewIfNeeded();await p.screenshot({path:'.preview/mobile-optimized-skills.png'});}await p.close();
 }
 console.log('PASS: mobile 3D/network budget, natural scrolling, readable text, touch UI and 4x CPU checks');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
