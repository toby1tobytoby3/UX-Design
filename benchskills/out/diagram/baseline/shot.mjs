import {chromium} from '/home/user/UX-Design/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
for(const [w,h] of [[1280,900],[390,800]]){
  const p=await b.newPage({viewport:{width:w,height:h}});
  await p.goto('file://'+process.cwd()+'/diagram.html');
  const o=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  console.log(w,o);
  await p.screenshot({path:`shot-${w}.png`,fullPage:true});
}
await b.close();
