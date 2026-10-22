'use strict';
const fs=require('fs'),cp=require('child_process');
const dir=__dirname,before=JSON.parse(fs.readFileSync(dir+'/before.json','utf8'));
const run=(bin,args)=>cp.execFileSync(bin,args,{encoding:'utf8',timeout:10000});
const call=(uri,p)=>{const r=JSON.parse(run('/usr/bin/luna-send',['-w','5000','-n','1',uri,JSON.stringify(p)]));if(!r.returnValue)throw Error(JSON.stringify(r));return r;};
const hook='/var/lib/webosbrew/init.d/privacy-update-guard';if(fs.existsSync(hook))fs.unlinkSync(hook);
const errors=[];
for(const path of before.manifests){try{call('luna://com.webos.service.bus/addOneManifest',{prefix:'',path})}catch(e){errors.push('Manifest restore: '+e.message)}}
if(before.uploaddRuntimeMask===null){try{run('systemctl',['unmask','--runtime','uploadd.service'])}catch(e){errors.push(e.message)}}
try{call('luna://com.webos.settingsservice/setSystemSettings',{category:'support',settings:{automaticUpdate:before.support.automaticUpdate}})}catch(e){errors.push(e.message)}
const flag='/var/luna/preferences/webosbrew_block_updates';if(!before.updateBlockFlag&&fs.existsSync(flag))fs.unlinkSync(flag);
if(before.hostsMounts.length===0){
 const mounted=fs.readFileSync('/proc/self/mountinfo','utf8').split('\n').some(l=>l.split(' ')[4]==='/etc/hosts');
 if(mounted){try{run('umount',['/etc/hosts'])}catch(e){errors.push(e.message)}}
 if(fs.readFileSync('/etc/hosts','utf8')!==before.hosts)errors.push('Hosts contents differ from saved original; not overwriting system file');
 if(!before.tmpHostsExisted&&fs.existsSync('/tmp/hosts')&&!fs.readFileSync('/proc/self/mountinfo','utf8').split('\n').some(l=>l.split(' ')[4]==='/etc/hosts'))fs.unlinkSync('/tmp/hosts');
}else{fs.writeFileSync('/etc/hosts',before.hosts)}
if(before.uploaddWasActive){try{run('systemctl',['start','uploadd.service'])}catch(e){errors.push(e.message)}}
if(before.running.some(p=>p.name==='admanager')){try{call('luna://com.webos.service.admanager/start',{})}catch(e){errors.push(e.message)}}
if(before.running.some(p=>p.name==='adoverlay-servic')){try{call('luna://com.webos.service.adoverlay/startAdoverlay',{reason:'normal'})}catch(e){errors.push(e.message)}}
console.log(JSON.stringify({rollbackComplete:errors.length===0,errors}));if(errors.length)process.exitCode=1;
