const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  for(const size of [{width:390,height:844},{width:1440,height:960}]){
   const p=await b.newPage({viewport:size,isMobile:size.width<761,hasTouch:size.width<761});
   await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
   await p.waitForFunction(()=>!!ScrollTrigger.getById('pitch-story'));
   async function allHidden(){return p.locator('.pitch-letter, .pressure-demand').evaluateAll(es=>es.every(e=>getComputedStyle(e).visibility==='hidden'||Number(getComputedStyle(e).opacity)<.01));}
   assert(await allHidden(),'All letters stay hidden before the story starts, including staggered letters');
   await p.evaluate(()=>{const t=ScrollTrigger.getById('pitch-story');scrollTo({top:t.start,behavior:'instant'})});await p.waitForTimeout(1000);
   assert(await allHidden(),'No letters appear on first arrival at the scene');
   if(size.width<761)await p.screenshot({path:'.preview/pressure-clean-entry-mobile.png'});
   // A 600px wheel/swipe-equivalent movement must leave time for the rest of the story.
   await p.evaluate(()=>scrollBy({top:600,behavior:'instant'}));await p.waitForTimeout(1100);
   const progress=await p.evaluate(()=>ScrollTrigger.getById('pitch-story').progress);
   assert(progress<=(size.width<761?.34:.2),'One large gesture must not skip most of the scene: '+progress);
   await p.evaluate(()=>{const t=ScrollTrigger.getById('pitch-story');scrollTo({top:t.start+(t.end-t.start)*.22,behavior:'instant'})});await p.waitForTimeout(1100);
   assert(await p.locator('.pitch-letter').evaluateAll(es=>es.every(e=>getComputedStyle(e).visibility==='visible'&&Number(getComputedStyle(e).opacity)>.95)),'Complete word becomes readable during the animation');
   assert(await p.locator('.pressure-demand').evaluateAll(es=>es.every(e=>getComputedStyle(e).visibility==='visible'&&Number(getComputedStyle(e).opacity)>.95)),'Demand phrases appear during their beat after being initially hidden');
   if(size.width<761)await p.screenshot({path:'.preview/pressure-paced-mobile.png'});
   await p.evaluate(()=>{const t=ScrollTrigger.getById('pitch-story');scrollTo({top:t.start-1,behavior:'instant'})});await p.waitForTimeout(1100);
   assert(await allHidden(),'Reversing to the start hides all letters again');
   await p.close();
  }
  console.log('PASS: first-entry/rewind letters hidden, word readable during scene, large gesture preserves story pacing');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
