// Same twin-like layered graph for both: generate N nodes over 7 layers, edges to the next layer.
import dagre from '@dagrejs/dagre'; import ELK from 'elkjs/lib/elk.bundled.js';
function graph(n,seed=1){let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;const L=7;const nodes=[],edges=[];
 for(let i=0;i<n;i++)nodes.push({id:'n'+i,layer:Math.floor(i*L/n)});
 for(const a of nodes){const next=nodes.filter(b=>b.layer===a.layer+1);if(!next.length)continue;const k=1+Math.floor(r()*2);for(let j=0;j<k;j++)edges.push({s:a.id,t:next[Math.floor(r()*next.length)].id});}
 return {nodes,edges};}
async function runDagre(G){const g=new dagre.graphlib.Graph({multigraph:true});g.setGraph({rankdir:'TB',nodesep:12,ranksep:40});g.setDefaultEdgeLabel(()=>({}));
 G.nodes.forEach(n=>g.setNode(n.id,{width:60,height:20}));G.edges.forEach((e,i)=>g.setEdge(e.s,e.t,{},'e'+i));const t=performance.now();dagre.layout(g);const ms=performance.now()-t;
 return {ms,pos:Object.fromEntries(G.nodes.map(n=>{const p=g.node(n.id);return [n.id,{x:p.x,y:p.y}]})),edges:g.edges().map(e=>g.edge(e).points)};}
async function runElk(G){const elk=new ELK();const t=performance.now();
 const res=await elk.layout({id:'root',layoutOptions:{'elk.algorithm':'layered','elk.direction':'DOWN','elk.spacing.nodeNode':'12','elk.layered.spacing.nodeNodeBetweenLayers':'40'},
 children:G.nodes.map(n=>({id:n.id,width:60,height:20})),edges:G.edges.map((e,i)=>({id:'e'+i,sources:[e.s],targets:[e.t]}))});const ms=performance.now()-t;
 return {ms,pos:Object.fromEntries(res.children.map(c=>[c.id,{x:c.x+30,y:c.y+10}])),edges:res.edges.map(e=>{const s=e.sections[0];return [s.startPoint,...(s.bendPoints||[]),s.endPoint]})};}
const out={};
for(const n of [35,500,2000,5000]){const G=graph(n);out[n]={};for(const [k,f] of [['dagre',runDagre],['elk',runElk]]){try{const t0=Date.now();const r=await Promise.race([f(G),new Promise((_,j)=>setTimeout(()=>j(new Error('timeout 120s')),120000))]);out[n][k]=Math.round(r.ms);if(n===35){(await import('fs')).writeFileSync(k+'-35.json',JSON.stringify({G,...r}));}}catch(e){out[n][k]=e.message}}console.log(n,JSON.stringify(out[n]));}
(await import('fs')).writeFileSync('layout-times.json',JSON.stringify(out));
