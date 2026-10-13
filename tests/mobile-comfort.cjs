const {chromium}=require('playwright');
const sharp=require('sharp');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,colorScheme:'dark'});
  const cdp=await p.context().newCDPSession(p);
  await cdp.send('Emulation.setAutoDarkModeOverride',{enabled:true});
  await p.goto(process.env.SITE_URL||'http://127.0.0.1:8765/v2/index.html?theme=blue');
  if(process.env.RELEASE)assert.equal(await p.locator('html').getAttribute('data-release'),process.env.RELEASE,'The published release is current');
  await p.evaluate(()=>document.fonts.ready);
  await p.waitForFunction(()=>document.querySelector('.mobile-hero').naturalWidth>0);
  const png=await p.screenshot({path:'.preview/mobile-browser-dark.png'});
  const pixel=await sharp(png).extract({left:5,top:300,width:1,height:1}).removeAlpha().raw().toBuffer();
  assert.deepEqual([...pixel],[255,253,248],'Auto-dark rendering preserves the cream page background');
  const t=await p.evaluate(()=>{
   const t=ScrollTrigger.getById('pitch-story');
   const word=gsap.getTweensOf(document.querySelector('.pitch-agreed'))[0];
   return {scrub:t.vars.scrub,travel:word.vars.startAt.x(),distance:t.end-t.start};
  });
  assert(t.scrub>=.3&&t.scrub<=.6,'Mobile choreography smooths gestures without trailing touch input for too long');
  assert(t.travel<=390*.2,'Opening word moves a short distance rather than crossing the screen');
  assert(t.distance>=1800&&t.distance<=2000,'Mobile sequence provides enough travel to read each beat without becoming excessively long');
  await p.locator('[data-theme=warm]').click();
  const warm=await p.screenshot();
  const warmPixel=await sharp(warm).extract({left:5,top:300,width:1,height:1}).removeAlpha().raw().toBuffer();
  assert.deepEqual([...warmPixel],[251,249,244],'Auto-dark rendering also preserves the warm palette');
  console.log('PASS: forced browser dark mode preserves palette; mobile motion is gentle with readable pacing');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
