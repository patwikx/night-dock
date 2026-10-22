'use strict';
const fs=require('fs'),cp=require('child_process');
const dir=__dirname;
const before=JSON.parse(fs.readFileSync(dir+'/before.json','utf8'));
const run=(bin,args)=>cp.execFileSync(bin,args,{encoding:'utf8',timeout:10000});
const call=(uri,p)=>{const r=JSON.parse(run('/usr/bin/luna-send',['-w','5000','-n','1',uri,JSON.stringify(p)]));if(!r.returnValue)throw Error(uri+': '+JSON.stringify(r));return r;};
async function apply(){
 // Settings and Homebrew's own flag survive reboot; system images are untouched.
 call('luna://com.webos.settingsservice/setSystemSettings',{category:'support',settings:{automaticUpdate:'off'}});
 fs.closeSync(fs.openSync('/var/luna/preferences/webosbrew_block_updates','a'));
 const hosts=['snu.lge.com','su-dev.lge.com','su.lge.com','su-ssl.lge.com'];
 let text=fs.readFileSync('/etc/hosts','utf8');
 if(!hosts.every(host=>text.split('\n').some(line=>/^127\.0\.0\.1\s/.test(line)&&line.split(/\s+/).includes(host)))){
  const mounted=fs.readFileSync('/proc/self/mountinfo','utf8').split('\n').some(l=>l.split(' ')[4]==='/etc/hosts');
  if(!mounted){fs.writeFileSync('/tmp/hosts',text);run('mount',['--bind','/tmp/hosts','/etc/hosts']);}
  fs.appendFileSync('/etc/hosts','\n# Homebrew system-update block\n127.0.0.1 '+hosts.join(' ')+'\n::1 '+hosts.join(' ')+'\n');
 }
 // Remove only these three registrations from the running bus, not their files.
 const removed=[];
 for(const path of before.manifests){call('luna://com.webos.service.bus/removeOneManifest',{prefix:'',path});removed.push(path);}
 run('systemctl',['mask','--runtime','uploadd.service']);
 run('systemctl',['stop','uploadd.service']);
 const targets=new Set(['/usr/sbin/admanager','/usr/sbin/adoverlay-service','/usr/sbin/uploadd']);
 const pids=()=>fs.readdirSync('/proc').filter(p=>/^\d+$/.test(p)).filter(p=>{try{return targets.has(fs.readlinkSync('/proc/'+p+'/exe'))}catch(_){return false}});
 for(const pid of pids()){try{process.kill(Number(pid),'SIGTERM')}catch(e){if(e.code!=='ESRCH')throw e}}
 await new Promise(resolve=>setTimeout(resolve,750));
 for(const pid of pids()){try{process.kill(Number(pid),'SIGKILL')}catch(e){if(e.code!=='ESRCH')throw e}}
 await new Promise(resolve=>setTimeout(resolve,100));
 const settings=call('luna://com.webos.settingsservice/getSystemSettings',{category:'support',keys:['automaticUpdate','softwareUpdateEnable']});
 const result={at:new Date().toISOString(),automaticUpdate:settings.settings.automaticUpdate,homebrewBlock:fs.existsSync('/var/luna/preferences/webosbrew_block_updates'),removedRegistrations:removed,remainingTargetPids:pids(),uploaddRuntimeMasked:fs.readlinkSync('/run/systemd/system/uploadd.service')==='/dev/null'};
 if(result.automaticUpdate!=='off'||result.remainingTargetPids.length)throw Error('Verification failed: '+JSON.stringify(result));
 fs.writeFileSync(dir+'/last-apply.json',JSON.stringify(result,null,2),{mode:0o600});console.log(JSON.stringify(result));
}
apply().catch(e=>{console.error(e.stack);process.exitCode=1;});
