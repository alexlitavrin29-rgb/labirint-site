const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const viewport of [{width:2560,height:1440},{width:1440,height:960},{width:1440,height:640},{width:390,height:844},{width:320,height:640},{width:320,height:600}]){
 await p.setViewportSize(viewport);await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
 assert.equal(await p.locator('#profile').count(),1,'История восприимчивости добавлена');
 assert(await p.locator('#profile').evaluate(e=>{const outer=e.parentElement.classList.contains('pin-spacer')?e.parentElement:e;const prev=outer.previousElementSibling;return (prev.id==='pressure'||!!prev.querySelector('#pressure'))&&outer.nextElementSibling.id==='approach'}),'История сразу после давления, до подхода');
 if(viewport.width<=760){
  assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('profile-story')),false,'Mobile profile reads without pinning');
  for(const panel of await p.locator('.profile-panel').all()){assert(await panel.isVisible());const box=await panel.boundingBox();assert(box.x>=0&&box.x+box.width<=viewport.width+1);}
  assert(await p.locator('.profile-volume-fallback').isVisible());continue;
 }
 await p.waitForSelector('.profile-volume.is-ready');
 assert.equal(await p.locator('.profile-factor').count(),6);
 for(const [progress,selector] of [[.12,'.profile-authority'],[.34,'.profile-haste'],[.56,'.profile-emotion'],[.88,'.profile-ending']]){
  await p.evaluate(progress=>{const s=ScrollTrigger.getById('profile-story');scrollTo({top:s.start+(s.end-s.start)*progress,behavior:'instant'})},progress);await p.waitForTimeout(1100);
  const card=p.locator(selector);assert(await card.evaluate(e=>getComputedStyle(e).visibility==='visible'&&Number(getComputedStyle(e).opacity)>.95),'Сцена читается: '+selector);
  const box=await card.boundingBox();assert(box.x>=0&&box.x+box.width<=viewport.width+1,'Текст по ширине');assert(box.y>=0&&box.y+box.height<=viewport.height+1,'Текст по высоте');
  const heading=await card.locator('h3').boundingBox();assert(heading.x>=0&&heading.x+heading.width<=viewport.width+1&&heading.y+heading.height<=viewport.height,'Сам заголовок целиком читается');
  const slot=await p.locator(selector==='.profile-ending'?'.profile-scene':'.profile-copy').boundingBox();for(const child of await card.locator('h3,p,a').all()){const r=await child.boundingBox();assert(r.y>=slot.y-1&&r.y+r.height<=slot.y+slot.height+1,'Содержимое не выходит за свою область: '+JSON.stringify({viewport,selector,text:await child.textContent(),r,slot}));}
  if(selector==='.profile-ending'){
   assert(box.width>=Math.min(viewport.width*.8,1280),'Финальный вопрос занимает ширину композиции');
   assert(box.height>=viewport.height-await p.locator('.header').evaluate(e=>e.offsetHeight)-1,'Вопрос занимает всю высоту экрана, следующий блок ещё не появляется');
   assert(await p.locator('.profile-camera').evaluate(e=>Number(getComputedStyle(e).opacity)<.05),'Карта мягко уступает место вопросу');
  }
  const tree=await p.locator('#profile').ariaSnapshot();for(const phrase of ['Одного сбивает','Другого сбивает','Третьего сбивает','А как это'])assert(tree.includes(phrase),'Вся история доступна для чтения скринридером: '+phrase);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Без горизонтального скролла');
  if(viewport.width===1440&&viewport.height===960&&progress===.34)await p.screenshot({path:'.preview/profile-story-desktop.png'});
  if(viewport.width===1440&&viewport.height===960&&progress===.88)await p.screenshot({path:'.preview/profile-question-desktop.png'});
  if(viewport.width===390&&progress===.34)await p.screenshot({path:'.preview/profile-story-mobile.png'});
 }
 await p.evaluate(()=>{const s=ScrollTrigger.getById('profile-story');scrollTo({top:s.start+(s.end-s.start)*.12,behavior:'instant'})});await p.waitForTimeout(1100);
 assert(await p.locator('.profile-authority').isVisible(),'Обратная прокрутка');
}
await p.emulateMedia({reducedMotion:'reduce'});await p.reload();assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('profile-story')),false);
for(const card of await p.locator('.profile-panel').all())assert(await card.isVisible(),'Все сцены доступны без анимации');
await p.setViewportSize({width:844,height:390});await p.emulateMedia({reducedMotion:'no-preference'});await p.reload();assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('profile-story')),false,'Без закрепления на низком экране');
const plain=await b.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await plain.goto('http://127.0.0.1:8765/v2/index.html');for(const card of await plain.locator('.profile-panel').all())assert(await card.isVisible());assert(await plain.locator('.profile-volume-fallback').isVisible());
assert.deepEqual(errors,[]);console.log('PASS: profile placement, 3D, four beats, desktop/mobile, reverse, static fallbacks');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
