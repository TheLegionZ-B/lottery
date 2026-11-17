/* Offline walk-forward comparison. Scores are rankings, not chances. */
const LabEngine=(()=>{
const spec={last2:{d:2,draws:1},front3:{d:3,draws:2},back3:{d:3,draws:2},six:{d:6,draws:1}};
const unique=a=>[...new Set(a)];
const valid=(s,d)=>typeof s==='string'&&new RegExp('^\\d{'+d+'}$').test(s);
const rank=(a,b)=>b.score-a.score||a.number.localeCompare(b.number);
function actual(r,k){if(k==='last2')return valid(r.last2,2)?[r.last2]:[];if(k==='six')return valid(r.firstPrize,6)?[r.firstPrize]:[];const s=buildPrizeSummary_(r.prizes||[])[k];const a=s.numbers||[];return a.length===2&&a.every(x=>valid(x,3))?unique(a):[];}
function model(rows,k){const d=spec[k].d, obs=rows.map(r=>actual(r,k)).filter(a=>a.length);if(obs.length<20)return null;
  const windows=[{size:12,w:.25},{size:30,w:.35},{size:80,w:.40}];
  return windows.map(({size,w})=>{const arr=obs.slice(0,size),p=Array.from({length:d},()=>Array(10).fill(2));const exact=new Map();let n=0;
    for(const nums of arr)for(const num of nums){n++;for(let j=0;j<d;j++)p[j][+num[j]]++;exact.set(num,(exact.get(num)||0)+1);}
    return {w,p:p.map(x=>x.map(v=>v/(n+20))),exact,n};});}
function score(m,n){const U=10**n.length;return m.reduce((total,x)=>{let p=1;for(let j=0;j<n.length;j++)p*=x.p[j][+n[j]];const e=((x.exact.get(n)||0)+50/U)/(x.n+50);return total+x.w*(.75*p+.25*e);},0);}
function shortPick(rows,k){const m=model(rows,k);if(!m)return[];const d=spec[k].d, a=Array.from({length:10**d},(_,i)=>{const number=String(i).padStart(d,'0');return {number,score:score(m,number)};});return a.sort(rank).slice(0,5).map(x=>x.number);}
function sixPick(rows){const m=model(rows,'six');if(!m)return[];
  const f=model(rows,'front3'),b=model(rows,'back3'),l=model(rows,'last2');
  // Score all 1,000 prefixes and all 1,000 suffixes independently.
  const subseq=(start,sub)=>Array.from({length:1000},(_,i)=>{const number=String(i).padStart(3,'0');let position=1;for(let j=0;j<3;j++)position*=m.reduce((z,v)=>z+v.w*v.p[start+j][+number[j]],0);let s=position*1000;if(sub)s=.5*s+.5*score(sub,number)*1000;if(start===3&&l)s=.8*s+.2*score(l,number.slice(-2))*100;return {number,score:s};}).sort(rank);
  const fronts=subseq(0,f),backs=subseq(3,b);
  // Every final selected prefix and last-two is unique; no relaxed fallback.
  const chosen=[],pf=new Set(),pb=new Set(),pl=new Set();
  for(let i=0;i<5;i++){const front=fronts.find(x=>!pf.has(x.number));const back=backs.find(x=>!pb.has(x.number)&&!pl.has(x.number.slice(-2)));if(!front||!back)break;const n=front.number+back.number;chosen.push(n);pf.add(front.number);pb.add(back.number);pl.add(back.number.slice(-2));}
  return chosen;
}
function oldTwo(train){const p=runTwoWalkForwardArena_(train), maps={};twoArenaModels_().forEach(m=>maps[m.id]=twoModelScores_(train,m.id));return selectTwoDiverse_(ensembleScoreMap_(maps,p.models),train[0].last2,5).map(x=>x.number);}
function oldSix(train){return makeSixCandidates_(train,train[0].firstPrize).map(x=>x.number);}
function prizeType(p){const s=(p.slug+' '+p.name).toLowerCase();if(/adjacent|ข้างเคียง/.test(s))return 'near';if(/last-two|last-2|ท้าย\s*2|2\s*ตัว\s*ท้าย/.test(s))return 'last2';if(/first-three|front|หน้า\s*3|3\s*ตัว\s*หน้า/.test(s))return 'front3';if(/last-three|back|ท้าย\s*3|3\s*ตัว\s*ท้าย/.test(s))return 'back3';for(let i=1;i<=5;i++){if(new RegExp('รางวัลที่\\s*'+i+'(?:\\D|$)|(?:prize[-_ ]?'+i+'|'+['','first','second','third','fourth','fifth'][i]+'[-_ ]?prize)(?:\\W|$)').test(s))return 'p'+i;}return '';}
function complete(r){if(!r.completePrizeData)return null;const required={p1:1,p2:5,p3:10,p4:50,p5:100,near:2,front3:2,back3:2,last2:1},groups={};for(const p of r.prizes||[]){const k=prizeType(p);if(!k)continue;if(groups[k])return null;const d=k==='last2'?2:k.endsWith('3')&&!k.startsWith('p')?3:6;const n=p.numbers;if(!Array.isArray(n)||n.length!==required[k]||!n.every(x=>valid(x,d)))return null;groups[k]=n;}return Object.keys(required).every(k=>groups[k])&&groups.p1[0]===r.firstPrize&&groups.last2[0]===r.last2?groups:null;}
function hit(nums,act){return nums.some(n=>act.includes(n));}
function any(nums,g){return nums.some(n=>Object.entries(g).some(([k,a])=>a.includes(k==='last2'?n.slice(-2):k==='front3'?n.slice(0,3):k==='back3'?n.slice(-3):n)));}
function stats(label){return {label,tests:0,hits:0};}function tally(s,ok){s.tests++;if(ok)s.hits++;}
function baseline(k){return k==='last2'?5:k==='six'?.0005:100*(1-(995/1000)*(994/999));}
function run(rows,limit=40){const hist=[...new Map(rows.filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.drawDate)&&valid(r.firstPrize,6)&&valid(r.last2,2)).map(r=>[r.drawDate,r])).values()].sort((a,b)=>a.drawDate.localeCompare(b.drawDate));
  limit=Math.max(1,Math.min(60,Math.floor(Number(limit)||40)));
  const start=Math.max(0,hist.length-limit), evaluationStart=Math.max(20,start);
  const result={draws:hist.length,latest:hist.at(-1)?.drawDate||'',categories:{},quality:{requested:limit,window:hist.length-start,earliest:hist[0]?.drawDate||'',windowStart:hist[start]?.drawDate||'',categories:{},rows:[]}};
  const q=result.quality;
  const required={p1:1,p2:5,p3:10,p4:50,p5:100,near:2,front3:2,back3:2,last2:1};
  function issues(r){const found={};for(const p of r.prizes||[]){const k=prizeType(p);if(k)(found[k]??=[]).push(p.numbers);}
    const out=[];for(const [k,n] of Object.entries(required)){const a=found[k],d=k==='last2'?2:k==='front3'||k==='back3'?3:6;if(!a)out.push(k+':missing');else if(a.length!==1||!Array.isArray(a[0])||a[0].length!==n||!a[0].every(x=>valid(x,d)))out.push(k+':invalid');else if(k==='p1'&&a[0][0]!==r.firstPrize||k==='last2'&&a[0][0]!==r.last2)out.push(k+':mismatch');}if(!r.completePrizeData)out.push('flag');return out;}
  for(let t=0;t<hist.length;t++){const r=hist[t];q.rows.push({date:r.drawDate,inWindow:t>=start,issues:issues(r),front3:actual(r,'front3').length>0,back3:actual(r,'back3').length>0,complete:!!complete(r)});}
  function quality(k){return {available:hist.filter(r=>k==='any'?!!complete(r):actual(r,k).length>0).length,window:q.window,missing:0,training:0,formula:0,tested:0,skipped:[]};}
  function skip(v,t,reason){v[reason]++;v.skipped.push({date:hist[t].drawDate,reason});}
  const aq=q.categories.any=quality('any');
  for(const k of Object.keys(spec)){const newer=stats('Multi-window lab'),older=stats(k==='last2'?'Production v3':k==='six'?'Production v2':'Frequency baseline');const na=stats('Lab — any prize'),oa=stats('Production — any prize');const cq=q.categories[k]=quality(k);
    for(let t=start;t<hist.length;t++){const train=hist.slice(0,t).reverse(),target=hist[t],a=actual(target,k),g=k==='six'?complete(target):null;
      if(!a.length){skip(cq,t,'missing');if(k==='six')skip(aq,t,g?'formula':'missing');continue;}
      if(t<evaluationStart||train.filter(r=>actual(r,k).length>0).length<20){skip(cq,t,'training');if(k==='six')skip(aq,t,g?'training':'missing');continue;}
      const pick=k==='six'?sixPick(train):shortPick(train,k);if(pick.length!==5){skip(cq,t,'formula');if(k==='six')skip(aq,t,g?'formula':'missing');continue;}
      let old;if(k==='last2')old=oldTwo(train);else if(k==='six')old=oldSix(train);else {const c=new Map();train.slice(0,80).flatMap(r=>actual(r,k)).forEach(n=>c.set(n,(c.get(n)||0)+1));old=Array.from({length:1000},(_,i)=>String(i).padStart(3,'0')).sort((a,b)=>(c.get(b)||0)-(c.get(a)||0)||a.localeCompare(b)).slice(0,5);}if(old.length!==5){skip(cq,t,'formula');if(k==='six')skip(aq,t,g?'formula':'missing');continue;}
      tally(newer,hit(pick,a));tally(older,hit(old,a));cq.tested++;if(k==='six'){if(g){tally(na,any(pick,g));tally(oa,any(old,g));aq.tested++;}else skip(aq,t,'missing');}
    }
    // Candidate output is intentionally not promoted or stored in production.
    result.categories[k]={baseline:baseline(k),newer,older,anyNew:k==='six'?na:null,anyOld:k==='six'?oa:null};
  }return result;
}
return {run,actual,complete,shortPick,sixPick,baseline};})();
if(typeof module!=='undefined')module.exports=LabEngine;
