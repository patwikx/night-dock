import fs from 'node:fs';
import {connectTV} from './tv-devtools.mjs';
const dir=process.argv[2];if(!dir)throw new Error('Output directory required');fs.mkdirSync(dir,{recursive:true});
const c=await connectTV();const wait=ms=>new Promise(r=>setTimeout(r,ms));
const metrics=async()=>Object.fromEntries((await c.call('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
const delta=(a,b)=>Object.fromEntries(Object.keys(b).filter(k=>/Duration|Count/.test(k)).map(k=>[k,b[k]-(a[k]||0)]));
const instrument=`(()=>{
 window.__profile={started:performance.now(),ready:null};
 const observer=new MutationObserver(()=>{const status=document.getElementById('bootStatus');if(status?.hidden&&document.querySelector('.app-chip,.utility.is-focused')){window.__profile.ready??=performance.now();}});
 observer.observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
})()`;
try{
 await c.call('Page.enable');
 await c.call('Performance.enable');
 const {identifier}=await c.call('Page.addScriptToEvaluateOnNewDocument',{source:instrument});
 const boots=[];
 for(let i=0;i<3;i++){
  const oldOrigin=await c.evaluate('performance.timeOrigin');
  await c.call('Page.reload');
  let ready=false;
  for(let attempt=0;attempt<100;attempt++){await wait(100);ready=await c.evaluate('performance.timeOrigin!=='+oldOrigin+'&&Boolean(window.__profile?.ready)&&Boolean(document.getElementById("stage"))');if(ready)break;}
  if(!ready)throw new Error('Launcher did not become ready: '+JSON.stringify(await c.evaluate('({profile:window.__profile,body:document.body?.innerText})')));
  boots.push(await c.evaluate(`({readyMs:window.__profile.ready,nodes:document.getElementsByTagName('*').length,images:[...document.images].filter(i=>i.complete&&i.naturalWidth).length,heap:performance.memory?.usedJSHeapSize,nav:performance.getEntriesByType('navigation')[0]?.toJSON()})`));
 }
 await c.call('Page.removeScriptToEvaluateOnNewDocument',{identifier});
 await wait(500);
 await c.evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Backspace',bubbles:true,cancelable:true}));window.__mutations=0;window.__mo=new MutationObserver(records=>window.__mutations+=records.length);window.__mo.observe(document.getElementById('stage'),{subtree:true,attributes:true,childList:true,characterData:true});})()`);
 let before=await metrics();
 const pointer=await c.evaluate(`(()=>{const tile=document.querySelector('.app-chip');const start=performance.now();for(let i=0;i<500;i++)tile.dispatchEvent(new PointerEvent('pointermove',{bubbles:true}));return {dispatchMs:performance.now()-start};})()`);
 await wait(250);pointer.metrics=delta(before,await metrics());pointer.mutations=await c.evaluate('window.__mutations');
 before=await metrics();
 const navigation=await c.evaluate(`new Promise(resolve=>{const frames=[],handlerTimes=[];let last=performance.now(),start=last,step=0;function frame(now){frames.push(now-last);last=now;if(now-start<1000)requestAnimationFrame(frame);}requestAnimationFrame(frame);function advance(){const key=step++%2?'ArrowLeft':'ArrowRight';const t=performance.now();document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));handlerTimes.push(performance.now()-t);if(step<12)setTimeout(advance,90);else setTimeout(()=>resolve({handlerTimes,frames}),200);}advance();})`);
 navigation.metrics=delta(before,await metrics());
 await c.evaluate(`window.__mo.disconnect();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Backspace',bubbles:true,cancelable:true}));`);
 await wait(300);
 const ui=await c.evaluate(`(()=>{document.getElementById('clockTime').textContent='12:00';document.getElementById('clockDate').textContent='Friday, 23 October';return {config:localStorage.getItem('launcher-config-v1'),apps:[...document.querySelectorAll('.app-chip')].map(e=>e.dataset.id),styles:[...document.querySelectorAll('.app-chip,.utility')].map(e=>({label:e.getAttribute('aria-label'),rect:e.getBoundingClientRect().toJSON(),background:getComputedStyle(e).backgroundColor,transition:getComputedStyle(e).transition,outline:getComputedStyle(e).outline,transform:getComputedStyle(e).transform})),cssBytes:[...document.styleSheets].map(sheet=>{try{return [...sheet.cssRules].reduce((n,r)=>n+r.cssText.length,0)}catch{return 0}})}})()`);
 for(const [name,action] of [ ['home',null],['sources',`document.getElementById('sourcesButton').click()`],['settings',`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Backspace',bubbles:true,cancelable:true}));document.querySelector('[data-utility="1"]').click()`] ]){
  if(action)await c.evaluate(action);await wait(350);const shot=await c.call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(dir+'/'+name+'.png',Buffer.from(shot.data,'base64'));
 }
 const settingsStyles=await c.evaluate(`({glass:getComputedStyle(document.getElementById('settingsPanel')).backdropFilter,fill:getComputedStyle(document.getElementById('settingsPanel')).backgroundColor,tiles:[...document.querySelectorAll('.nd-tile')].map(e=>({id:e.dataset.id,rect:e.getBoundingClientRect().toJSON(),color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}))})`);
 await c.evaluate(`document.getElementById('settingsClose').click()`);
 const idleBefore=await metrics();await wait(2000);const idle=delta(idleBefore,await metrics());
 const final=await metrics();
 fs.writeFileSync(dir+'/profile.json',JSON.stringify({boots,pointer,navigation,ui,settingsStyles,idle,final},null,2));
 console.log(JSON.stringify({readyMs:boots.map(b=>b.readyMs),pointer,navigationMs:navigation.handlerTimes,idle,heap:final.JSHeapUsedSize,nodes:final.Nodes},null,2));
}finally{c.close();}
