const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const p=await b.newPage({viewport:{width:1440,height:960}});
  await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');
  await p.evaluate(()=>document.fonts.ready);
  await p.waitForSelector('.hero-object.is-ready');
  const expectedTravel={'pitch-story':5500,'profile-story':3864,'skills-story':3780};
  for(const id of ['pitch-story','profile-story','skills-story']){
   assert.equal(await p.evaluate(id=>{const t=ScrollTrigger.getById(id);return t.end-t.start},id),expectedTravel[id],id+': desktop travel matches the requested calmer pacing');
   await p.evaluate(id=>{const t=ScrollTrigger.getById(id);scrollTo({top:t.start+(t.end-t.start)*.15,behavior:'instant'});},id);
   await p.waitForTimeout(1100);
   const before=await p.evaluate(id=>ScrollTrigger.getById(id).progress,id);
   await p.mouse.move(720,500);
   await p.mouse.wheel(0,600);
   await p.waitForTimeout(1100);
   const after=await p.evaluate(id=>{const t=ScrollTrigger.getById(id);return {progress:t.progress,animated:t.animation?.progress()};},id);
   assert(after.progress-before>.04&&after.progress-before<=.31,id+': one strong wheel gesture advances at most a third of the scene');
   if(after.animated!==undefined)assert(Math.abs(after.animated-after.progress)<.01,id+': animation catches up without remaining stuck');
   await p.mouse.wheel(0,-600);
   await p.waitForTimeout(1100);
   assert(Math.abs(await p.evaluate(id=>ScrollTrigger.getById(id).progress,id)-before)<.01,id+': reverse wheel scrolling returns to the same place');
  }
  await p.keyboard.press('End');await p.waitForTimeout(1100);
  assert(await p.evaluate(()=>scrollY>=document.documentElement.scrollHeight-innerHeight-2),'Native keyboard navigation reaches the bottom');
  console.log('PASS: actual forward/reverse wheel gestures stay within each scene; animation settles and keyboard navigation works');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
