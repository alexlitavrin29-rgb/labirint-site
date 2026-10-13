const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const p=await b.newPage({viewport:{width:1440,height:960}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8765/v2/?theme=blue');await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.evaluate(()=>!!ScrollTrigger.getById('hero-turn')),false,'Первый экран листается без закрепления');
  assert.equal(await p.locator('.hero-description,.hero .hero-practice,.hero .actions,.hero .hero-facts').count(),0,'Первый экран не перегружен деталями');
  const before=await p.locator('.hero').boundingBox();await p.evaluate(()=>scrollBy({top:220,behavior:'instant'}));await p.waitForTimeout(100);
  assert(Math.abs((await p.locator('.hero').boundingBox()).y-before.y+220)<3,'Первый экран движется вместе с обычной прокруткой');
  assert.equal(await p.locator('#training-intro img[src="assets/lykov.jpeg"]').count(),1,'Ведущий показан до обращения');
  const teacher=p.locator('.intro-teacher');await teacher.scrollIntoViewIfNeeded();await p.waitForTimeout(850);
  assert(await teacher.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0));
  assert(await teacher.innerText().then(t=>t.replace(/\s+/g,' ').includes('Валерий Иванович Лыков')));
  assert(await p.locator('.marquee-phrase').first().innerText().then(t=>t.includes('Валерием Ивановичем Лыковым')));
  for(const step of await p.locator('.intro-step').all()){await step.scrollIntoViewIfNeeded();await p.waitForTimeout(1000);}
  assert((await p.locator('#training-intro').ariaSnapshot()).includes('Практикуем, как замечать давление, брать паузу и выбирать ответ в своих интересах.'),'Описание практики доступно скринридеру');
  assert(await p.locator('.intro-practice').innerText().then(t=>t.includes('70%')));
  await p.locator('#training-intro [data-apply]').click();assert(await p.locator('dialog').isVisible());await p.locator('[data-close]').click();
  assert.equal(await p.locator('#experts .expert-card').count(),2,'Лыков и Кутушев остаются в команде');
  assert(await p.locator('#skills-title').innerText().then(t=>t.includes('тренировать?')));
  const names=['Умение замечать давление','Умение брать паузу','Понимание своих реакций','Выбор следующего шага'];
  assert.deepEqual(await p.locator('.skill-copy h3').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').trim())),names);
  assert(await p.evaluate(()=>ScrollTrigger.getById('profile-story').end-ScrollTrigger.getById('profile-story').start>=3700),'История влияния движется медленнее');
  await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForSelector('.hero-object.is-ready');
  const art=p.locator('.hero-art');await art.hover();await p.waitForTimeout(700);assert.equal(await art.getAttribute('data-interacting'),'true','Модель реагирует на наведение');
  await art.focus();assert.equal(await art.getAttribute('data-interacting'),'true','Модель реагирует на фокус с клавиатуры');
  await p.locator('.navigation .logo').focus();
  await p.mouse.move(10,10);await p.waitForTimeout(700);assert.equal(await art.getAttribute('data-interacting'),'false','Наведение можно завершить');
  await p.screenshot({path:'.preview/clean-hero-desktop.png'});
  await teacher.scrollIntoViewIfNeeded();await p.waitForTimeout(1000);await p.locator('#training-intro').screenshot({path:'.preview/hero-followup-desktop.png'});
  for(const size of [{width:1440,height:640},{width:390,height:844},{width:320,height:640}]){
   await p.setViewportSize(size);await p.reload();await p.evaluate(()=>document.fonts.ready);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Нет горизонтального скролла '+size.width);
   for(const step of await p.locator('.intro-step').all()){await step.scrollIntoViewIfNeeded();await p.waitForTimeout(850);const r=await step.boundingBox();assert(r.x>=-1&&r.x+r.width<=size.width+1);}
   if(size.width===390){await p.locator('#training-intro').screenshot({path:'.preview/hero-followup-mobile.png'});await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:'.preview/clean-hero-mobile.png'});}
  }
  await p.setViewportSize({width:1440,height:960});await p.reload();await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await art.hover();await p.emulateMedia({reducedMotion:'reduce'});
  await p.waitForFunction(()=>!document.querySelector('.hero-art').hasAttribute('tabindex'));
  assert.equal(await p.locator('.hero-art[tabindex]').count(),0,'При отключении движения наведение не оставляет управление');
  assert.equal(await p.locator('.mobile-hero').evaluate(e=>gsap.getTweensOf(e).length),0,'Переход на reduced motion прекращает движение fallback');
  await p.reload();assert.equal(await p.locator('.intro-letter').count(),0,'Без движения фразы сразу доступны целиком');
  assert(await p.locator('#training-intro').innerText().then(t=>t.includes('Валерием Ивановичем Лыковым')));
  const plain=await b.newPage({javaScriptEnabled:false,viewport:{width:320,height:640}});await plain.goto('http://127.0.0.1:8765/v2/');
  for(const step of await plain.locator('.intro-step').all())assert(await step.isVisible(),'Содержание доступно без JS');
  assert(await plain.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);console.log('PASS: обычная прокрутка, последовательное знакомство, бегущая строка, hover, CTA, команда, mobile и reduced/no-JS');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
