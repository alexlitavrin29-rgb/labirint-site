const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});
 const cdp=await p.context().newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.goto('http://127.0.0.1:8765/v2/index.html?theme=blue');await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(()=>{const t=ScrollTrigger.getById('pitch-story');scrollTo({top:t.start+10,behavior:'instant'});});await p.waitForTimeout(700);
 await p.evaluate(()=>{window.__touchFrames=[];window.__touchDrift=[];window.__touchSampling=true;let last;const t=ScrollTrigger.getById('pitch-story'),scene=document.querySelector('.pitch-scene'),header=document.querySelector('.header');function tick(now){if(!__touchSampling)return;if(last!==undefined)__touchFrames.push(now-last);last=now;const progress=(scrollY-t.start)/(t.end-t.start);if(progress>.01&&progress<.99)__touchDrift.push(Math.abs(scene.getBoundingClientRect().top-header.offsetHeight));requestAnimationFrame(tick)}requestAnimationFrame(tick)});
 for(let i=0;i<4;i++)await cdp.send('Input.synthesizeScrollGesture',{x:190,y:600,yDistance:-250,speed:1000,gestureSourceType:'touch'});
 for(let i=0;i<4;i++)await cdp.send('Input.synthesizeScrollGesture',{x:190,y:350,yDistance:250,speed:1000,gestureSourceType:'touch'});
 const result=await p.evaluate(()=>{__touchSampling=false;const sorted=__touchFrames.toSorted((a,b)=>a-b);return {cpuSlowdown:4,dpr:devicePixelRatio,frameCount:sorted.length,p95Ms:sorted[Math.ceil(sorted.length*.95)-1],stalls:sorted.filter(n=>n>100).length,maxStickyDriftPx:Math.max(...__touchDrift),pin:ScrollTrigger.getById('pitch-story').vars.pin}});
 fs.writeFileSync('.preview/mobile-native-touch.json',JSON.stringify(result,null,2));
 assert(result.frameCount>50&&result.maxStickyDriftPx<2,'Scene stays aligned with header during real forward/reverse touch gestures');
 assert.equal(result.pin,false,'Touch does not depend on a JS-transformed pin box');assert(result.p95Ms<=33.5&&result.stalls===0,'Touch gestures do not freeze under 4x CPU slowdown: '+JSON.stringify(result));
 console.log('PASS: native forward/reverse touch scroll at 4x CPU; '+JSON.stringify(result));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
