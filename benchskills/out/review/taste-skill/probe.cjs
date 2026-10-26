const { chromium } = require('/home/user/UX-Design/node_modules/playwright');
(async()=>{
 const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
 for (const w of [1440,390]) {
  const p = await b.newPage({viewport:{width:w,height:w==390?844:900}});
  await p.goto('file:///home/user/UX-Design/benchskills/fixtures/seeded-pricing.html');
  const r = await p.evaluate(()=>{
   const q=s=>[...document.querySelectorAll(s)].map(e=>{const b=e.getBoundingClientRect();return [s,Math.round(b.x),Math.round(b.y+scrollY),Math.round(b.width),Math.round(b.height)]});
   return {plans:q('.plan'),btn:q('.choose'),close:q('.banner-close'),input:q('input'),sub:q('.btn-primary'),ok:q('.confirm button'),footerA:q('footer a'),summ:q('summary'),feat:q('.feature-line'),hdr:q('header.site'),sw:document.documentElement.scrollWidth,
    fl:(()=>{const e=document.querySelector('.feature-line');return [e.scrollWidth,e.clientWidth]})(), comp:(()=>{const e=document.querySelector('.compare');const t=e.querySelector('table');return [t.getBoundingClientRect().width,e.clientWidth]})(),
    about:getComputedStyle(document.querySelector('.about p')).lineHeight, aboutW:document.querySelector('.about p').getBoundingClientRect().width};
  });
  console.log(w,JSON.stringify(r));
 }
 // hover + tab order at desktop
 const p = await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('file:///home/user/UX-Design/benchskills/fixtures/seeded-pricing.html');
 const before = await p.evaluate(()=>[...document.querySelectorAll('.plan')].map(e=>Math.round(e.getBoundingClientRect().width)));
 await p.hover('.plan:nth-child(2)'); await p.waitForTimeout(900);
 const after = await p.evaluate(()=>[...document.querySelectorAll('.plan')].map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.width),Math.round(b.height)]}));
 console.log('hover',before,after);
 const order=[];
 for(let i=0;i<14;i++){await p.keyboard.press('Tab');order.push(await p.evaluate(()=>{const e=document.activeElement;const cs=getComputedStyle(e);return (e.tagName+':'+(e.textContent||e.id||'').trim().slice(0,20)+' outline='+cs.outlineStyle+' bs='+cs.boxShadow.slice(0,10))}));}
 console.log(order.join('\n'));
 await p.screenshot({path:'compare-full.png',fullPage:true});
 // compare-link click
 console.log(await p.evaluate(()=>typeof toggleCompare));
 // ticker
 console.log(await p.evaluate(()=>{const s=document.querySelector('.ticker span');return [getComputedStyle(s).animationDuration, s.scrollWidth]}));
 await b.close();
})();
