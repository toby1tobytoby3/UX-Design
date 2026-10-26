const { chromium } = require('/home/user/UX-Design/node_modules/playwright');
(async()=>{
 const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',args:['--no-sandbox']});
 const p = await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('file:///home/user/UX-Design/benchskills/fixtures/seeded-pricing.html');
 for (const n of [1,2,3]) { await p.hover('.plan:nth-child('+n+')'); await p.waitForTimeout(900);
  console.log(n, await p.evaluate(()=>[...document.querySelectorAll('.plan')].map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.width),Math.round(b.height)]})));}
 // sticky header covers anchor target
 await p.click('header a[href="#plans"]'); await p.waitForTimeout(300);
 console.log('plans top after anchor', await p.evaluate(()=>[document.querySelector('#plans').getBoundingClientRect().top, scrollY]));
 await p.click('header a[href="#faq"]'); await p.waitForTimeout(300);
 console.log('faq h2 top', await p.evaluate(()=>document.querySelector('#faq').getBoundingClientRect().top));
 await p.evaluate(()=>scrollTo(0,0));
 await p.click('.compare-link'); await p.waitForTimeout(300);
 console.log('compare top', await p.evaluate(()=>document.querySelector('.compare').getBoundingClientRect().top));
 // contrast of white on yellow, error colors
 await p.screenshot({path:'x.png'});
 const m = await b.newPage({viewport:{width:390,height:844}});
 await m.goto('file:///home/user/UX-Design/benchskills/fixtures/seeded-pricing.html');
 await m.evaluate(()=>document.querySelector('#plans').scrollIntoView());
 await m.screenshot({path:'mobile-plans.png'});
 console.log(await m.evaluate(()=>[document.documentElement.scrollWidth, innerWidth, visualViewport.scale]));
 await b.close();
})();
