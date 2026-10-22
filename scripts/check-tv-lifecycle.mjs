import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {connectTV} from './tv-devtools.mjs';
const c=await connectTV(),wait=ms=>new Promise(r=>setTimeout(r,ms));
const ssh=command=>execFileSync('ssh',['-tt','-o','LogLevel=ERROR','-o','BatchMode=yes','-o','StrictHostKeyChecking=accept-new','-i',process.env.TV_SSH_KEY||process.env.HOME+'/.ssh/lg-tv-root',process.env.TV_HOST,command],{encoding:'utf8',timeout:10000});
const launch=id=>ssh(`luna-send -n 1 luna://com.webos.applicationManager/launch '${JSON.stringify({id})}'`);
let identifier;
const youtubeWasRunning=JSON.parse(ssh("luna-send -n 1 luna://com.webos.applicationManager/running '{}'").trim()).running.some(app=>app.id==='youtube.leanback.v4');
async function waitVisibility(hidden){for(let i=0;i<50;i++){if(await c.evaluate('document.hidden==='+hidden))return true;await wait(200);}return false;}
try{
 await c.call('Page.enable');
 const result={};
 for(let i=0;i<60;i++){if(await c.evaluate('Boolean(document.querySelector(".app-chip"))'))break;await wait(100);}
 await c.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Backspace',bubbles:true,cancelable:true}))`);
 await c.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await c.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}))`);await wait(100);
 result.reducedMotion=await c.evaluate(`({matches:matchMedia('(prefers-reduced-motion: reduce)').matches,artTransform:getComputedStyle(document.querySelector('.app-chip.is-focused .app-chip__plate')).transform,outerTransform:getComputedStyle(document.querySelector('.app-chip.is-focused')).transform})`);
 await c.call('Emulation.setEmulatedMedia',{features:[]});
 identifier=(await c.call('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const records=new Map();const set=window.setTimeout.bind(window),clear=window.clearTimeout.bind(window);window.__timers=records;window.setTimeout=(fn,ms,...args)=>{const id=set(()=>{records.delete(id);fn(...args)},ms);records.set(id,ms);return id};window.clearTimeout=id=>{records.delete(id);clear(id)};})()`})).identifier;
 const old=await c.evaluate('performance.timeOrigin');await c.call('Page.reload');
 for(let i=0;i<80;i++){await wait(100);if(await c.evaluate('performance.timeOrigin!=='+old+'&&document.getElementById("bootStatus")?.hidden'))break;}
 await wait(400);
 result.foreground=await c.evaluate(`({hidden:document.hidden,timers:[...window.__timers.values()],apps:document.querySelectorAll('.app-chip').length})`);
 await c.evaluate(`document.querySelector('.app-chip[data-id="youtube.leanback.v4"]').click()`);
 await waitVisibility(true);
 result.youtube=ssh(`luna-send -n 1 luna://com.webos.applicationManager/getForegroundAppInfo '{}'`).trim();
 result.background=await c.evaluate(`({hidden:document.hidden,timers:[...window.__timers.values()]})`);
 launch('works.partridge.webos-launcher');await waitVisibility(false);await wait(100);
 result.resumed=await c.evaluate(`({hidden:document.hidden,timers:[...window.__timers.values()],clock:document.getElementById('clockTime').innerText,focus:document.querySelector('.app-chip.is-focused')?.getAttribute('aria-label')})`);
 fs.writeFileSync('performance/optimized/lifecycle.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{
 try{if(!youtubeWasRunning)ssh(`luna-send -n 1 luna://com.webos.applicationManager/closeByAppId '{"id":"youtube.leanback.v4"}'`);await c.call('Emulation.setEmulatedMedia',{features:[]});if(identifier)await c.call('Page.removeScriptToEvaluateOnNewDocument',{identifier});launch('works.partridge.webos-launcher');await waitVisibility(false);await c.call('Page.reload');}finally{c.close();}
}
