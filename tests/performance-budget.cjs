const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const url=process.env.AUDIT_URL||'http://a0091381.xsph.ru/v2/?theme=blue';
const runs=Number(process.env.AUDIT_RUNS||3),label=process.env.AUDIT_LABEL||'latest';
const limits={lcpMs:2500,cls:.1,blockingMs:200,tapMs:200,frameP95Ms:33.5,scrollStalls:0};
const results=[];
const save=(error)=>fs.writeFileSync('.preview/performance-'+label+'.json',JSON.stringify({url,conditions:{width:390,height:844,dpr:3,cpuSlowdown:4,downloadBytesPerSecond:200000,latencyMs:150,coldCache:true,freshBrowserPerRun:true,pinnedIPv4:!!process.env.AUDIT_IPV4},limits,results,error:error||null},null,2));
const percentile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.max(0,Math.ceil(values.length*p)-1)]||0;
(async()=>{
for(let run=1;run<=runs;run++){
 const args=[];
 if(process.env.AUDIT_NETLOG)args.push('--log-net-log=/private/tmp/labyrinth-budget-netlog-'+run+'.json');
 if(process.env.AUDIT_IPV4)args.push('--host-resolver-rules=MAP a0091381.xsph.ru 141.8.193.173');
 const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args});
 try{
 const context=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 if(process.env.AUDIT_DEBUG){const start=Date.now();p.on('request',r=>console.log(Date.now()-start,'request',r.url()));p.on('response',r=>console.log(Date.now()-start,'response',r.status(),r.url()));p.on('requestfailed',r=>console.log('failed',r.url(),r.failure()));p.on('pageerror',e=>console.log('pageerror',e.message));}
 await p.addInitScript(()=>{
  window.__audit={lcp:[],shifts:[],tasks:[],events:[]};
  new PerformanceObserver(list=>__audit.lcp.push(...list.getEntries().map(e=>({time:e.startTime,size:e.size,element:e.element?.outerHTML.slice(0,180),url:e.url})))).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>__audit.shifts.push(...list.getEntries().filter(e=>!e.hadRecentInput).map(e=>({time:e.startTime,value:e.value,sources:e.sources.map(s=>({element:s.node?.outerHTML?.slice(0,180),previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))})))).observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(list=>__audit.tasks.push(...list.getEntries().map(e=>({time:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
  new PerformanceObserver(list=>__audit.events.push(...list.getEntries().filter(e=>e.interactionId).map(e=>({name:e.name,duration:e.duration,id:e.interactionId})))).observe({type:'event',buffered:true,durationThreshold:16});
 });
 const cdp=await context.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:100000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.goto(url,{waitUntil:'domcontentloaded'});
 await p.evaluate(async()=>{
  await document.fonts.ready;
  const hero=document.querySelector('.mobile-hero');
  await hero.decode();
  if(!hero.naturalWidth)throw new Error('Hero image did not load');
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 });
 await p.waitForTimeout(1000);
 const loading=await p.evaluate(()=>{
  const fcp=performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0,now=performance.now();let start=0,last=0,sum=0,cls=0;
  for(const e of __audit.shifts){if(e.time-last>1000||e.time-start>5000){start=e.time;sum=0}sum+=e.value;last=e.time;cls=Math.max(cls,sum)}
  return {fcpMs:fcp,lcpMs:__audit.lcp.at(-1)?.time||0,lcpElements:__audit.lcp,cls,blockingMs:__audit.tasks.filter(e=>e.time>=fcp&&e.time<now).reduce((sum,e)=>sum+Math.max(0,e.duration-50),0),initialBytes:performance.getEntriesByType('resource').reduce((sum,e)=>sum+e.transferSize,0),tasks:__audit.tasks};
 });
 await p.locator('#training-intro .button').tap();assert(await p.locator('dialog').isVisible());await p.locator('[data-close]').tap();await p.locator('.menu-button').tap();await p.locator('.menu-button').tap();await p.waitForTimeout(200);
 const tapMs=await p.evaluate(()=>Math.max(0,...__audit.events.map(e=>e.duration)));
 await p.evaluate(()=>{window.__frames=[];let last;window.__sampleFrames=true;function tick(now){if(!__sampleFrames)return;if(last!==undefined)__frames.push(now-last);last=now;requestAnimationFrame(tick)}requestAnimationFrame(tick)});
 // Native touch gestures exercise the complete page and the pinned pressure scene.
 for(let i=0;i<12;i++){
  await cdp.send('Input.synthesizeScrollGesture',{x:190,y:600,yDistance:-2200,speed:1600,gestureSourceType:'touch'});
  if(await p.evaluate(()=>scrollY>(document.documentElement.scrollHeight-innerHeight)*.85))break;
 }
 await p.waitForTimeout(200);
 const scrolling=await p.evaluate(()=>{
  __sampleFrames=false;let start=0,last=0,sum=0,cls=0;
  for(const e of __audit.shifts){if(e.time-last>1000||e.time-start>5000){start=e.time;sum=0}sum+=e.value;last=e.time;cls=Math.max(cls,sum)}
  return {frames:__frames,scrollY,maxY:document.documentElement.scrollHeight-innerHeight,cls,shifts:__audit.shifts};
 });
 if(scrolling.scrollY<=scrolling.maxY*.8)console.log('Scroll diagnostics',JSON.stringify({scrollY:scrolling.scrollY,maxY:scrolling.maxY,loading}));
 assert(scrolling.scrollY>scrolling.maxY*.8,'Scroll workload reaches the lower part of the page');assert.deepEqual(errors,[]);
 const result={run,...loading,initialCls:loading.cls,cls:scrolling.cls,shifts:scrolling.shifts,tapMs,frameP95Ms:percentile(scrolling.frames,.95),scrollStalls:scrolling.frames.filter(n=>n>100).length,frameCount:scrolling.frames.length};
 result.passed=Object.entries(limits).every(([key,limit])=>result[key]<=limit)&&result.lcpMs>0;
 results.push(result);save();console.log(JSON.stringify({run,lcpMs:Math.round(result.lcpMs),cls:result.cls,blockingMs:result.blockingMs,tapMs,frameP95Ms:result.frameP95Ms,scrollStalls:result.scrollStalls,initialKiB:Math.round(result.initialBytes/1024),passed:result.passed}));await context.close();
 }finally{await b.close()}
}
 save();
 if(process.env.AUDIT_ENFORCE!=='0')assert(results.every(r=>r.passed),'Performance budget must pass every cold run');
})().catch(e=>{save(e.message);console.error(e);process.exit(1)});
