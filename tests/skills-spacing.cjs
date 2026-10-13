const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const p=await b.newPage();
 for(const size of [{width:1440,height:720},{width:1280,height:650},{width:1024,height:600},{width:564,height:762},{width:320,height:600}]){
  await p.setViewportSize(size);await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
  for(const progress of size.width>760?[.1,.21,.22,.3,.35,.46,.48,.6,.7,.72,.82,.86]:[0]){
   await p.evaluate(progress=>{const t=ScrollTrigger.getById('skills-story');if(t){scrollTo({top:t.start+(t.end-t.start)*progress,behavior:'instant'});t.animation.progress(progress);}},progress);await p.waitForTimeout(250);
   const heading=await p.locator('.skills-heading').boundingBox();
   const note=size.width>760?await p.locator('.skill-space-note').boundingBox():null;
   for(const beat of await p.locator('.skill-beat').all()){
    if(await beat.evaluate(e=>Number(getComputedStyle(e).opacity)<.08))continue;
    const number=await beat.locator('.skill-number').boundingBox(),title=await beat.locator('h3').boundingBox(),body=await beat.locator('p').boundingBox();
    const context=JSON.stringify({size,progress,number,title,body,note});
    assert(number.y>=heading.y+heading.height+20,'Номер не подходит вплотную к общему заголовку: '+context);
    assert(title.y>=number.y+number.height+18,'Движущийся заголовок не подходит вплотную к номеру: '+context);
    if(note)assert(note.y>=body.y+body.height+60,'Нижняя подпись отделена от пояснения минимум на 60px: '+context);
   }
  }
 }
 console.log('PASS: skills text spacing in stable and transitional frames at short/tablet/mobile sizes');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
