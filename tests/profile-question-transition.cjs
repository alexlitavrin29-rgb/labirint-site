const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const p=await b.newPage();
 for(const size of [{width:1440,height:960},{width:1440,height:640},{width:1024,height:768}]){
  await p.setViewportSize(size);await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
  async function at(time){await p.evaluate(time=>{const t=ScrollTrigger.getById('profile-story');scrollTo({top:t.start+(t.end-t.start)*time/5.7,behavior:'instant'})},time);await p.waitForTimeout(1100);}
  await at(3.15);assert(await p.locator('.profile-emotion').evaluate(e=>Number(getComputedStyle(e).opacity)>.95),'Third phrase remains readable before the question');
  for(const time of [3.4,3.9,4.3,4.8]){
   await at(time);
   for(const selector of ['.profile-camera','.profile-ending'])assert(await p.locator(selector).evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return Math.abs(m.a-1)<.01&&Math.abs(m.d-1)<.01}),'Transition never enlarges the scene or a letter: '+selector+' at '+time);
  }
  await at(4.05);const middle=await p.locator('.profile-ending').evaluate(e=>Number(getComputedStyle(e).opacity));assert(middle>.05&&middle<.95,'Question fades in progressively rather than switching abruptly');
  await at(5.1);const end=await p.locator('.profile-ending').evaluate(e=>{const b=e.getBoundingClientRect();return {opacity:Number(getComputedStyle(e).opacity),w:b.width,h:b.height,header:document.querySelector('.header').offsetHeight,viewport:innerHeight}});
  assert(end.opacity>.95&&end.h>=end.viewport-end.header-1&&end.w>=Math.min(size.width*.8,1280),'Question is readable at full scene size');
  if(size.width===1440&&size.height===960)await p.screenshot({path:'.preview/profile-question-soft-desktop.png'});
  await at(3.15);assert(await p.locator('.profile-camera').evaluate(e=>Number(getComputedStyle(e).opacity)>.95),'Reverse scrolling restores the third phrase');
 }
 console.log('PASS: third phrase to full-screen question uses gradual opacity, no letter/camera zoom, and reversible transition');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
