import fs from 'node:fs';
import {connectTV} from './tv-devtools.mjs';
const c=await connectTV();
const call=c.call;
try {
 if(process.argv[2]==='shot'){
  const r=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(process.argv[3],Buffer.from(r.data,'base64'));console.log(process.argv[3]);
 }else{
  const expression=process.argv[2]==='file'?fs.readFileSync(process.argv[3],'utf8'):process.argv[2];
  const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  console.log(JSON.stringify(r.result.value,null,2));
 }
}finally{c.close()}
