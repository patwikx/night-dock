export async function connectTV() {
 const targetHost=process.env.TV_HOST;
 if(!targetHost)throw new Error('Set TV_HOST to your TV hostname or root@IP before using TV tools');
 const host=process.env.TV_DEBUG_HOST||targetHost.split('@').pop();
 const port=process.env.TV_DEBUG_PORT||'9998';
 const targets=await(await fetch('http://'+host+':'+port+'/json/list')).json();
 const target=targets.find(t=>t.description==='works.partridge.webos-launcher');
 if(!target)throw new Error('Launcher is not running');
 const ws=new WebSocket(target.webSocketDebuggerUrl);let seq=0;const pending=new Map();const listeners=new Map();
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}}else{for(const fn of listeners.get(m.method)||[])fn(m.params);}};
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Timed out: '+method));},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async(expression)=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 return {call,evaluate,on(method,fn){const list=listeners.get(method)||[];list.push(fn);listeners.set(method,list);},close(){ws.close();}};
}
