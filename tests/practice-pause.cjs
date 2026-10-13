const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  for(const reducedMotion of ['no-preference','reduce']){
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:8765/v2/?theme=blue');
   const control=page.locator('[data-pause-toggle]');
   assert.equal(await control.count(),1,'Есть интерактивный пример паузы');
   await control.click();
   assert.equal(await control.getAttribute('aria-pressed'),'true');
   await page.waitForTimeout(reducedMotion==='reduce'?30:1100);
   assert.equal(await page.locator('[data-practice-demo]').getAttribute('data-state'),'paused');
   for(const choice of await page.locator('.pause-choice').all()){
    assert(await choice.isVisible());
    assert(await choice.evaluate(e=>Number(getComputedStyle(e).opacity)>.95),'Варианты ответа читаются после паузы');
   }
   await control.focus();await control.press('Enter');
   assert.equal(await control.getAttribute('aria-pressed'),'false','Пример можно повторить с клавиатуры');
   assert.equal(await page.locator('[data-practice-demo]').getAttribute('data-state'),'pressure');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Пример не вызывает горизонтальный скролл');
   assert.deepEqual(errors,[]);await page.close();
  }
  const course=await browser.newPage({viewport:{width:320,height:640}});
  await course.goto('http://127.0.0.1:8765/v2/course.html?theme=blue');
  await course.evaluate(()=>document.fonts.ready);
  assert(await course.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Страница тренинга помещается в 320px');
  assert(await course.locator('.price-value').evaluate(e=>e.scrollWidth<=e.clientWidth),'Текст стоимости помещается внутри карточки');
  await course.locator('main [data-apply]').first().click();
  assert.equal(await course.locator('dialog select[name="format"]').count(),1,'На странице тренинга можно выбрать формат');
  await course.close();
  const live=await browser.newPage({viewport:{width:390,height:844}});
  await live.goto('http://127.0.0.1:8765/v2/?theme=blue');
  await live.locator('[data-format="online"]').click();
  assert.equal(await live.locator('dialog select[name="format"]').inputValue(),'online','Формат переносится из выбранной карточки в обращение');
  await live.locator('[data-close]').click();
  await live.locator('[data-pause-toggle]').click();
  await live.waitForTimeout(900);
  await live.locator('[data-practice-demo]').screenshot({path:'.preview/approved-pause-mobile.png'});
  await live.emulateMedia({reducedMotion:'reduce'});
  assert(await live.locator('[data-pause-toggle]').isVisible(),'При смене настройки интерактивный пример остаётся доступным');
  await live.locator('[data-pause-toggle]').click();
  assert.equal(await live.locator('[data-pause-toggle]').getAttribute('aria-pressed'),'true');
  await live.close();
  const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:640}});
  await plain.goto('http://127.0.0.1:8765/v2/');
  assert(await plain.locator('.pause-choice').first().isVisible(),'Пример читается и без JavaScript');
  assert(!await plain.locator('[data-pause-toggle]').isVisible(),'Без JS нет неработающего интерактивного управления');
  console.log('PASS: пример паузы, варианты ответа, повтор с клавиатуры, reduced motion, mobile, no-JS');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
