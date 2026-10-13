const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
const page=await browser.newPage({viewport:{width:1440,height:960}});await page.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.locator('.pitch-map, .pitch-ball, .pitch-orbit, .pitch-loop').count(),0,'Нет клевера, орбит и диаграммы в хуке');
assert.equal(await page.locator('.introduction, .outcome-grid, .practice-stat').count(),0,'Удалены лишние блоки перед программой');
const flow=await page.locator('main>section').evaluateAll(nodes=>nodes.map(e=>e.id||e.className));
const opinion=flow.findIndex(v=>v.includes('expert-opinion')),certificate=flow.findIndex(v=>v.includes('certificate-section'));
assert(opinion<certificate&&certificate<flow.indexOf('enroll')&&flow.indexOf('enroll')<flow.indexOf('programs'),'Отзывы → сертификат → заявка → дополнительные программы');
assert.equal(await page.locator('.program-practice').count(),1,'70% практики остаются внутри программы');
for(const photo of await page.locator('.expert-photo img').all())assert.equal(await photo.evaluate(e=>getComputedStyle(e).filter),'none','Реальные портреты в цвете');
assert.equal(await page.getByRole('link',{name:'Посмотреть программу ↗',exact:true}).count(),0,'Программа видна на странице, без промежуточной кнопки');
assert.equal(await page.locator('#program .module').count(),3,'Три модуля доступны сразу');
assert((await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily)).includes('Montserrat'),'Шрифт основного текста совпадает с референсом');
assert(await page.evaluate(()=>document.fonts.check('500 20px Montserrat','Психология')),'Кириллица загружена');
for(const selector of ['.practice-layout .body-text','.module p','.format-card p','.expert-info p','.program-card p','.faq-items p']){
 assert(await page.locator(selector).first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=18),selector+' читается крупным шрифтом');
}
for(const size of [{width:1440,height:960},{width:1440,height:768},{width:1024,height:768},{width:390,height:844},{width:320,height:640},{width:844,height:390}]){
 await page.setViewportSize(size);await page.reload();await page.evaluate(()=>document.fonts.ready);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Без горизонтального переполнения: '+size.width);
 if(size.width>760&&size.height>700){
  await page.evaluate(()=>scrollTo({top:document.querySelector('#program').getBoundingClientRect().top+scrollY+350,behavior:'instant'}));await page.waitForTimeout(400);
  const cta=await page.locator('.program-intro .button').boundingBox();
  assert(cta.y>=96&&cta.y+cta.height<=size.height,'Заявка видна рядом с программой в закреплённом блоке');
 }
 if(size.width===1440&&size.height===960){
  await page.evaluate(()=>scrollTo({top:document.querySelector('#program').getBoundingClientRect().top+scrollY-310,behavior:'instant'}));await page.waitForTimeout(550);
  await page.screenshot({path:'.preview/erickson-program-updated.png'});
 }
 for(const card of await page.locator('#program .module').all()){
  await card.scrollIntoViewIfNeeded();assert(await card.isVisible());
  const r=await card.boundingBox();assert(r.x>=0&&r.x+r.width<=size.width+1,'Карточка модуля помещается на экране');
 }
}
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
for(const statement of await page.locator('.pitch-statement').all())assert(await statement.isVisible(),'Обе фразы видны без движения');
console.log('PASS: новые фразы, локальные шрифты, крупный текст, программа, tablet/mobile и reduced motion');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
