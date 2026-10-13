const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:1440,height:960}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await page.waitForSelector('.hero-object.is-ready');
const copy=(await page.locator('#pressure').textContent()).replace(/\s+/g,' ');
assert(copy.includes('Согласились. Оправдывались. А потом продолжали разговор у себя в голове.'),'Узнаваемая ситуация без усиления тревоги');
assert(copy.includes('Тренируем способы дать себе это время.'),'Утверждённая связь давления с практикой паузы');
assert(await page.locator('#training-intro').evaluate(e=>{const next=e.nextElementSibling;return next.id==='pressure'||!!next.querySelector('#pressure');}),'История сразу после знакомства и условий');
await page.evaluate(()=>scrollTo({top:700,behavior:'instant'}));await page.waitForTimeout(850);
const bounds=await page.locator('.hero').boundingBox();assert(bounds.y<0,'Первый экран уходит при обычной прокрутке');
assert.equal(await page.evaluate(()=>!!ScrollTrigger.getById('hero-turn')),false);
async function beat(progress,selector){
 await page.waitForFunction(()=>{const t=ScrollTrigger.getById('pitch-story');return t&&Math.round(t.end-t.start)===(innerWidth>760?5500:1900);});
 await page.evaluate(p=>{const t=ScrollTrigger.getById('pitch-story');scrollTo({top:t.start+(t.end-t.start)*p,behavior:'instant'});},progress);await page.waitForTimeout(950);
 const readable=await page.locator(selector).evaluate(e=>getComputedStyle(e).visibility==='visible'&&Number(getComputedStyle(e).opacity)>.95);
 if(!readable)console.log('Scene diagnostics',await page.evaluate(selector=>{const t=ScrollTrigger.getById('pitch-story'),e=document.querySelector(selector);return {width:innerWidth,height:innerHeight,scrollY,start:t.start,end:t.end,progress:t.progress,timeline:t.animation.progress(),opacity:getComputedStyle(e).opacity,visibility:getComputedStyle(e).visibility}},selector));
 assert(readable,'Нужная фраза читается');
 if(selector.startsWith('.statement-')){
  assert(await page.locator('.pitch-cta').isVisible(),'Призыв к действию виден под обеими фразами');
  const c=await page.locator('.pitch-cta').boundingBox();assert(c.y>=await page.locator('.header').evaluate(e=>e.offsetHeight)&&c.y+c.height<=await page.evaluate(()=>innerHeight),'Кнопка целиком видна внизу');
 }
 const r=await page.locator(selector).boundingBox();assert(r.x>=-2&&r.x+r.width<=await page.evaluate(()=>innerWidth)+2,'Фраза целиком помещается по ширине');
 assert(r.y>=0&&r.y+r.height<=await page.evaluate(()=>innerHeight),'Сцена целиком помещается по высоте');
 const phrases=page.locator(selector).locator('.pitch-word, .pitch-thought, h3, .statement-choice-copy');
 for(const phrase of await phrases.all()){
  const b=await phrase.boundingBox();
  assert(b.x>=-2&&b.x+b.width<=await page.evaluate(()=>innerWidth)+2,'Каждая фраза целиком помещается по ширине');
  assert(b.y>=await page.locator('.header').evaluate(e=>e.offsetHeight)-2&&b.y+b.height<=await page.evaluate(()=>innerHeight),'Текст и CTA не перекрываются шапкой и не уходят за нижний край');
 }
}
for(const size of [{width:1440,height:960},{width:1440,height:640},{width:390,height:844},{width:320,height:640}]){
 await page.setViewportSize(size);await page.reload();if(size.width>760)await page.waitForSelector('.hero-object.is-ready');
 await beat(.20,'.pitch-opening');
 assert(await page.locator('#pressure').evaluate(e=>{
  const probe=document.createElement('span');probe.style.color='var(--blue)';e.appendChild(probe);
  const palette=getComputedStyle(probe).color;probe.remove();return getComputedStyle(e).backgroundColor===palette;
 }),'Хук использует голубой фон основной палитры');
 await beat(.24,'.pitch-opening');
 if(size.width===1440&&size.height===960)await page.screenshot({path:'.preview/pressure-tension-desktop.png'});
 if(size.width===390)await page.screenshot({path:'.preview/pressure-tension-mobile.png'});
 await beat(.44,'.pitch-rumination');
 if(size.width===1440&&size.height===960)await page.screenshot({path:'.preview/pressure-echoes-desktop.png'});await beat(.65,'.statement-pressure');
 if(size.width===1440&&size.height===960)await page.screenshot({path:'.preview/pressure-centered-updated.png'});
 await beat(.89,'.statement-choice');
 if(size.width===1440&&size.height===960)await page.screenshot({path:'.preview/pressure-choice-updated.png'});await beat(.20,'.pitch-opening');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Нет горизонтального скролла');
 await page.evaluate(()=>{const t=ScrollTrigger.getById('pitch-story');scrollTo({top:t.start+(t.end-t.start)*.62,behavior:'instant'});});await page.waitForTimeout(700);
 assert(await page.locator('.pitch-heading').evaluate(e=>getComputedStyle(e).color===getComputedStyle(document.body).color),'Цвет подписи синхронизирован со светлым фоном');
 await beat(.44,'.pitch-rumination');
 assert(await page.locator('.pitch-heading').evaluate(e=>getComputedStyle(e).color===getComputedStyle(document.body).color),'Обратная прокрутка сохраняет общую палитру сайта');
}
await page.setViewportSize({width:1440,height:960});await beat(.20,'.pitch-opening');
await page.setViewportSize({width:390,height:844});await beat(.44,'.pitch-rumination');
for(const size of [{width:844,height:390},{width:390,height:500}]){
 await page.setViewportSize(size);await page.reload();
 assert.equal(await page.evaluate(()=>!!ScrollTrigger.getById('pitch-story')),false,'На низком экране история читается без закрепления');
 for(const selector of ['.pitch-opening','.pitch-rumination','.pitch-explanation'])assert(await page.locator(selector).isVisible());
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
}
await page.setViewportSize({width:390,height:844});
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.locator('.pin-spacer').count(),0);
for(const selector of ['.pitch-opening','.pitch-rumination','.pitch-explanation'])assert(await page.locator(selector).isVisible(),'Весь текст виден без движения');
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();await page.waitForFunction(()=>document.querySelector('.mobile-hero').naturalWidth>0);
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);assert.equal(await page.locator('.pin-spacer').count(),0,'Смена настройки возвращает статическую версию');
const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await plain.goto('http://127.0.0.1:8765/v2/index.html');
for(const selector of ['.pitch-opening','.pitch-rumination','.pitch-explanation'])assert(await plain.locator(selector).isVisible(),'Без JavaScript история читается');
assert.deepEqual(errors,[]);console.log('PASS: точный текст питча, четыре читаемые сцены, обратный скролл, герой, desktop/mobile, reduced motion и без JS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
