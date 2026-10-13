const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  for(const size of [{width:564,height:640},{width:390,height:680},{width:320,height:600}]){
   const p=await b.newPage({viewport:size,isMobile:true,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
   async function at(progress){await p.evaluate(progress=>{const t=ScrollTrigger.getById('pitch-story');scrollTo({top:t.start+(t.end-t.start)*progress,behavior:'instant'});},progress);await p.waitForTimeout(1000);}
   async function buttonVisible(){
    const r=await p.locator('.pitch-cta').evaluate(e=>{const b=e.getBoundingClientRect(),s=document.querySelector('#pressure').getBoundingClientRect(),header=document.querySelector('.header').getBoundingClientRect();return {left:b.left,right:b.right,center:b.left+b.width/2,width:innerWidth,top:b.top,bottom:b.bottom,parentBottom:s.bottom,viewport:innerHeight,headerBottom:header.bottom,hit:e.contains(document.elementFromPoint(b.left+b.width/2,b.top+b.height/2))};});
    assert(r.top>=r.headerBottom&&r.bottom<=r.viewport&&r.left>=0&&r.right<=r.width,'Whole mobile CTA stays in the visible viewport');
    assert(Math.abs(r.center-r.width/2)<2,'Mobile CTA remains horizontally centered while animating');
    assert(r.bottom<=r.parentBottom+1&&r.hit,'CTA is neither clipped nor covered by the following section: '+JSON.stringify(r));
   }
   await at(.97);await buttonVisible();
   await p.setViewportSize({width:size.width,height:size.height+110});await p.waitForTimeout(600);await buttonVisible();
   await p.setViewportSize(size);await p.waitForTimeout(600);await buttonVisible();
   await at(.01);const early=await p.locator('.frame-outer').evaluate(e=>Number(getComputedStyle(e).opacity));
   await at(.2);const late=await p.locator('.frame-outer').evaluate(e=>Number(getComputedStyle(e).opacity));
   assert(early<.4&&late>.95,'Frames gradually appear rather than arriving fully painted');
   await at(.97);await p.locator('.pitch-cta').click();await p.waitForURL(/#skills$/);
   assert.equal(new URL(p.url()).hash,'#skills','Призыв ведёт к утверждённым навыкам на этой странице');
   assert.deepEqual(errors,[]);await p.close();
  }
  console.log('PASS: mobile CTA remains visible/clickable after browser-height changes; frames fade in progressively');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
