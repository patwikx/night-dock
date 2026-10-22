import fs from 'node:fs';
import postcss from '../node_modules/postcss/lib/postcss.mjs';
const cssPath='src/nightdock.css';
const html=fs.readFileSync('src/nightdock.html','utf8');
const js=fs.readFileSync('src/nightdock.js','utf8');
const used=new Set();
for(const match of html.matchAll(/class="([^"]+)"/g))for(const cls of match[1].split(/\s+/))used.add(cls);
for(const match of js.matchAll(/['"]([^'"\n]*)['"]/g))for(const cls of match[1].split(/\s+/))if(/^-?[\w-]+$/.test(cls))used.add(cls);
const original=fs.readFileSync(cssPath,'utf8'),root=postcss.parse(original),removed=[];
root.walkRules(rule=>{
 const selectors=rule.selectors.filter(selector=>{
  const classes=[...selector.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)].map(m=>m[1]);
  const keep=classes.every(cls=>used.has(cls)||cls.startsWith('plate--'));
  if(!keep)removed.push(selector);return keep;
 });
 if(!selectors.length)rule.remove();else rule.selectors=selectors;
});
root.walkAtRules(rule=>{if(rule.nodes&&!rule.nodes.length)rule.remove();});
root.walkComments(comment=>comment.remove());
const output=root.toString().replace(/\n\s*\n\s*\n/g,'\n\n');
fs.writeFileSync('performance/css-prune-report.json',JSON.stringify({beforeBytes:Buffer.byteLength(original),afterBytes:Buffer.byteLength(output),removed},null,2));
fs.writeFileSync(cssPath,output);
console.log(JSON.stringify({beforeBytes:Buffer.byteLength(original),afterBytes:Buffer.byteLength(output),removedSelectors:removed.length}));
