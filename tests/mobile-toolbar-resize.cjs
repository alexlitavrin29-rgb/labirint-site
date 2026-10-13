const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const p=await b.newPage({viewport:{width:390,height:650},isMobile:true,hasTouch:true});
 await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(()=>{const t=ScrollTrigger.getById('pitch-story');window.__toolbarScene=t;scrollTo({top:t.start+(t.end-t.start)*.88,behavior:'instant'});});await p.waitForTimeout(1000);
 const originalY=await p.evaluate(()=>scrollY);
 await p.evaluate(()=>{window.__toolbarRefreshes=0;ScrollTrigger.addEventListener('refresh',()=>__toolbarRefreshes++);});
 for(const height of [610,590,570,590,610,650,570,650]){
  await p.setViewportSize({width:390,height});await p.waitForTimeout(350);
  const state=await p.evaluate(()=>({same:ScrollTrigger.getById('pitch-story')===__toolbarScene,exists:!!ScrollTrigger.getById('pitch-story'),y:scrollY,animated:document.querySelector('#pressure').classList.contains('is-pitch-animated')}));
  assert(state.same&&state.exists&&state.animated,'Toolbar-height change must not destroy/rebuild the scene: '+JSON.stringify(state));
  assert(Math.abs(state.y-originalY)<3,'Toolbar-height changes must not collapse scroll travel: '+JSON.stringify(state));
 }
 assert.equal(await p.evaluate(()=>__toolbarRefreshes),0,'Height-only toolbar cycles avoid heavyweight ScrollTrigger layout refreshes');
 await p.setViewportSize({width:740,height:390});await p.waitForTimeout(700);
 assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('pitch-story')),false,'Actual width/orientation change switches a short landscape viewport to static reading');
 await p.setViewportSize({width:390,height:650});await p.waitForTimeout(700);
 assert(await p.evaluate(()=>!!ScrollTrigger.getById('pitch-story')),'Return to portrait recreates the scene');
 await p.screenshot({path:'.preview/mobile-toolbar-stable.png'});
 const short=await b.newPage({viewport:{width:390,height:500},isMobile:true,hasTouch:true});await short.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');
 assert.equal(await short.evaluate(()=>!!ScrollTrigger.getById('pitch-story')),false,'Initially short viewports keep static reading');
 console.log('PASS: toolbar-height cycles preserve scene identity and scroll offset; actual rotation and short-viewport fallbacks work');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
