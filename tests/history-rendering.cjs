const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',ignoreDefaultArgs:['--disable-back-forward-cache']});try{
const p=await b.newPage({viewport:{width:1440,height:960}});
await p.addInitScript(()=>{window.__renderCalls={};window.__historyEvents=[];for(const event of ['pageshow','pagehide'])addEventListener(event,e=>__historyEvents.push([event,e.persisted]));const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){const gl=original.apply(this,args);if(gl&&String(args[0]).startsWith('webgl')&&!gl.__observed){gl.__observed=true;const key=this.closest('.profile-volume')?'profile':'hero';for(const method of ['drawElements','drawArrays']){const originalDraw=gl[method];gl[method]=function(...a){__renderCalls[key]=(__renderCalls[key]||0)+1;return originalDraw.apply(this,a);}}}return gl;};});
for(const key of ['profile','hero']){
 await p.setViewportSize({width:1440,height:960});await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.waitForSelector('.hero-object.is-ready');await p.waitForSelector('.profile-volume.is-ready');
 await p.evaluate(key=>{if(key==='hero')scrollTo({top:700,behavior:'instant'});else{const s=ScrollTrigger.getById('profile-story');scrollTo({top:s.start+(s.end-s.start)*.34,behavior:'instant'});}},key);await p.waitForTimeout(500);
 await p.goto('http://127.0.0.1:8765/v2/about.html');await p.goBack({waitUntil:'commit'});await p.waitForTimeout(500);
 assert(await p.evaluate(()=>__historyEvents.some(([name,persisted])=>name==='pageshow'&&persisted)),'Документ восстановлен из BFCache');
 const before=await p.evaluate(key=>__renderCalls[key],key);await p.waitForFunction(({key,before})=>__renderCalls[key]>before,{key,before},{timeout:5000});const after=await p.evaluate(key=>__renderCalls[key],key);assert(after>before,key+' снова рисуется после Назад');
 const selector=key==='profile'?'.profile-volume canvas':'.hero-object canvas';const width=await p.locator(selector).getAttribute('width');await p.setViewportSize({width:390,height:844});await p.waitForTimeout(500);assert.notEqual(await p.locator(selector).getAttribute('width'),width,key+' реагирует на изменение размера после Назад');
}
console.log('PASS: BFCache return resumes both renderers and responsive canvas sizes');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
