const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const sizes=[{width:2560,height:1440},{width:1440,height:960},{width:1440,height:720},{width:1440,height:640},{width:564,height:762},{width:390,height:844},{width:320,height:600}];
 const names=['Умение замечать давление','Умение брать паузу','Понимание своих реакций','Выбор следующего шага'];
 for(const size of sizes){
  await p.setViewportSize(size);await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
  const flow=await p.locator('main>section,main>.pin-spacer>section').evaluateAll(es=>es.map(e=>e.id));
  assert.deepEqual(flow.filter(id=>['pressure','profile','approach','skills','training-result','program'].includes(id)),['pressure','profile','approach','skills','training-result','program'],'Последовательность истории ведёт к программе');
  assert.equal(await p.locator('#skills .skill-beat').count(),4);
  const heading=await p.locator('#skills-title').boundingBox();assert(Math.abs(heading.x+heading.width/2-size.width/2)<2,'Вместе мы научимся по центру экрана');
  if(size.width<=760){
   assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('skills-story')),false,'Mobile skills read without pinning');
   for(const beat of await p.locator('.skill-beat').all()){assert(await beat.isVisible());const r=await beat.boundingBox();assert(r.x>=0&&r.x+r.width<=size.width+1);}
   continue;
  }
  assert((await p.locator('.skills-scene').boundingBox()).height>=size.height-await p.locator('.header').evaluate(e=>e.offsetHeight)-1,'Сцена навыков занимает всю высоту экрана');
  for(const [index,progress] of [.1,.35,.6,.86].entries()){
   await p.evaluate(progress=>{const t=ScrollTrigger.getById('skills-story');scrollTo({top:t.start+(t.end-t.start)*progress,behavior:'instant'})},progress);await p.waitForTimeout(1100);
   const beat=p.locator('.skill-beat').nth(index);assert(await beat.evaluate(e=>Number(getComputedStyle(e).opacity)>.95),'Навык читается: '+names[index]);
   for(const el of await beat.locator('h3,p,.skill-number').all()){
    const r=await el.boundingBox();assert(r.x>=-1&&r.x+r.width<=size.width+1&&r.y>=await p.locator('.header').evaluate(e=>e.offsetHeight)-1&&r.y+r.height<=size.height,'Навык целиком помещается в экран: '+await el.textContent());
   }
   if(size.width>760){const note=await p.locator('.skill-space-note').boundingBox(),body=await beat.locator('p').boundingBox();assert(note.y>=body.y+body.height+20,'Подпись про место для решения ниже текста и не перекрывает его');}
   for(let j=0;j<4;j++)if(j!==index)assert(await p.locator('.skill-beat').nth(j).evaluate(e=>Number(getComputedStyle(e).opacity)<.05),'Текст навыков не перекрывается');
   const tree=await p.locator('#skills').ariaSnapshot();for(const name of names)assert(tree.replace(/\s+/g,' ').includes(name),'Все навыки доступны скринридеру');
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Нет горизонтального скролла');
   if(size.width===1440&&size.height===960)await p.screenshot({path:'.preview/skills-'+(index+1)+'-desktop.png'});
   if(size.width===390&&index===2)await p.screenshot({path:'.preview/skills-mobile.png'});
  }
  await p.evaluate(()=>{const t=ScrollTrigger.getById('skills-story');scrollTo({top:t.start+(t.end-t.start)*.1,behavior:'instant'})});await p.waitForTimeout(1100);
  assert(await p.locator('.skill-beat').first().evaluate(e=>Number(getComputedStyle(e).opacity)>.95),'Обратная прокрутка возвращает первый навык');
 }
 await p.setViewportSize(sizes[0]);await p.reload();await p.locator('#program .button').click();assert(await p.locator('dialog').isVisible(),'Обсудить ситуацию открывает заявку');await p.locator('[data-close]').click();
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('skills-story')),false);
 for(const el of await p.locator('.skill-beat').all())assert(await el.isVisible(),'Без анимации доступны все навыки');
 await p.setViewportSize({width:844,height:390});await p.emulateMedia({reducedMotion:'no-preference'});await p.reload();assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('skills-story')),false,'Низкий экран без закрепления');
 const plain=await b.newPage({javaScriptEnabled:false,viewport:{width:320,height:600}});await plain.goto('http://127.0.0.1:8765/v2/index.html');for(const el of await plain.locator('.skill-beat').all())assert(await el.isVisible());assert(await plain.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);console.log('PASS: story order, four readable skills, reverse scroll, CTA and static fallbacks');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
