const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const CFG=window.APP_CONFIG||{};

// One configuration path for dashboard, prize checker and health check.
// The value is public by design: it must be a read-only deployment URL.
function getBackendUrl(){
  const raw=String(CFG.DATA_URL||'').trim();
  if(!raw)throw new Error('CONFIG_MISSING');
  let url;
  try{url=new URL(raw);}catch(_){throw new Error('CONFIG_INVALID');}
  if(url.protocol!=='https:' && !['localhost','127.0.0.1'].includes(url.hostname))
    throw new Error('CONFIG_INVALID');
  if(url.hostname==='script.google.com'){
    if(/\/dev\/?$/.test(url.pathname))throw new Error('CONFIG_DEV_URL');
    if(!/\/macros\/s\/[^/]+\/exec\/?$/.test(url.pathname))throw new Error('CONFIG_INVALID');
  }
  url.hash='';
  return url;
}
function buildBackendUrl(params={}){
  const url=getBackendUrl();
  Object.entries(params).forEach(([key,value])=>url.searchParams.set(key,String(value)));
  return url.toString();
}
function connectionMessage(err){
  const code=String(err?.message||err||'');
  if(code==='CONFIG_MISSING')return {
    title:'ยังไม่ได้ตั้งค่าเชื่อมต่อ Backend',
    detail:'เปิด config.js ใน GitHub แล้วใส่ DATA_URL เป็น URL Web App ที่ลงท้ายด้วย /exec จากนั้น Commit ไฟล์อีกครั้ง'
  };
  if(code==='CONFIG_INVALID')return {
    title:'DATA_URL ไม่ถูกต้อง',
    detail:'ตรวจว่าใช้ URL Web App แบบ HTTPS ที่ Deploy แล้ว ไม่ใช่ลิงก์หน้าแก้ไข Google Apps Script'
  };
  if(code==='CONFIG_DEV_URL')return {
    title:'กำลังใช้ URL /dev',
    detail:'URL /dev ใช้ทดสอบเฉพาะผู้มีสิทธิ์แก้ไขสคริปต์ ให้เปลี่ยนเป็น /exec ของ Web App Deployment'
  };
  if(code==='FETCH_TIMEOUT')return {
    title:'Backend ตอบกลับช้าเกินไป',
    detail:'ลองโหลดอีกครั้ง ตรวจ Apps Script → Executions และเปิดลิงก์ตรวจ Backend ด้านล่าง'
  };
  if(code==='FETCH_FAILED')return {
    title:'เบราว์เซอร์เข้าถึง Backend ไม่ได้',
    detail:'ตรวจ URL /exec, สิทธิ์ Who has access: Anyone, Execute as: Me และดูว่า Browser บล็อกการเชื่อมต่อข้ามเว็บไซต์หรือไม่'
  };
  if(/^HTTP_401|^HTTP_403/.test(code))return {
    title:'Backend ไม่อนุญาตให้เข้าถึง',
    detail:'ตรวจการ Deploy Web App ให้ Execute as: Me และ Who has access: Anyone แล้ว Deploy เป็น New version'
  };
  if(/^HTTP_404/.test(code))return {
    title:'ไม่พบ Backend Deployment',
    detail:'ตรวจ DATA_URL ว่าเป็น /exec ของ Deployment ที่ยังใช้งานอยู่ และไม่ได้คัดลอก URL หน้า Editor'
  };
  if(code==='NON_JSON')return {
    title:'Backend ไม่ได้ส่งข้อมูล JSON',
    detail:'URL อาจเปิดหน้า Login, หน้า Error หรือเป็น Deployment ที่ไม่ถูกต้อง เปิดลิงก์ตรวจ Backend เพื่อยืนยัน'
  };
  if(code==='RENDER_FAILED')return {
    title:'ข้อมูลส่งมาถึงแล้ว แต่หน้าเว็บแสดงผลไม่สำเร็จ',
    detail:'Backend ติดต่อได้ปกติ ปัญหาอยู่ที่ JavaScript หน้าเว็บ กรุณาตรวจ Console (F12)'
  };
  if(code==='BAD_PAYLOAD')return {
    title:'Backend ส่งข้อมูลไม่ครบ',
    detail:'ตรวจว่า Frontend และ Apps Script เป็นชุดที่เข้ากันได้ และ Deploy Backend v5.3.2 เป็น New version แล้ว'
  };
  if(code.startsWith('API_'))return {
    title:'Backend ตอบกลับว่ามีข้อผิดพลาด',
    detail:'ลองเปิดลิงก์ตรวจ Backend หากต้องแก้ไขเพิ่มเติมให้ดู Apps Script → Executions / SystemLog'
  };
  return {
    title:'ไม่สามารถแสดงข้อมูลได้',
    detail:'พบข้อผิดพลาดในการประมวลผลหน้าเว็บ กรุณาดู Browser Console (F12) และ Apps Script → Executions'
  };
}
function showConnectionError(err){
  const box=$('#connectionAlert');
  const message=connectionMessage(err);
  $('#connectionAlertTitle').textContent=message.title;
  $('#connectionAlertText').textContent=message.detail;
  const health=$('#connectionHealthLink');
  try{health.href=buildBackendUrl({mode:'health'});health.hidden=false;}
  catch(_){health.removeAttribute('href');health.hidden=true;}
  box.hidden=false;
}
function hideConnectionError(){const e=$('#connectionAlert');if(e)e.hidden=true;}
async function requestBackend(params,acceptApiError=false){
  const url=buildBackendUrl(params);
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),35000);
  let response;
  try{response=await fetch(url,{cache:'no-store',signal:controller.signal});}
  catch(err){throw new Error(err?.name==='AbortError'?'FETCH_TIMEOUT':'FETCH_FAILED');}
  finally{clearTimeout(timer);}
  if(!response.ok)throw new Error('HTTP_'+response.status);
  let body;
  try{body=await response.json();}catch(_){throw new Error('NON_JSON');}
  if(!body || typeof body!=='object' || Array.isArray(body))throw new Error('BAD_PAYLOAD');
  if(body.ok!==true && !acceptApiError)throw new Error('API_'+String(body.code||'ERROR'));
  return body;
}

let state={results:[],predictions:[],currentPrediction:null,predictions6:[],currentPrediction6:null,latestPrizeSummary:null,algorithmPerformance:null,news:null,lastSync:"",source:"",range:50};

function toast(m){const e=$("#toast");e.textContent=m;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),2000)}
function applyTheme(v){document.body.classList.toggle("dark",v==="dark");$("#themeBtn").textContent=v==="dark"?"☀️":"🌙";localStorage.setItem("lottery-theme",v)}
function thDate(s){if(!s)return"—";const d=new Date(String(s).slice(0,10)+"T00:00:00");return Number.isNaN(d.getTime())?s:d.toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"})}
function thDateTime(s){if(!s)return"—";const d=new Date(s);return Number.isNaN(d.getTime())?s:d.toLocaleString("th-TH",{dateStyle:"short",timeStyle:"short"})}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function money(v){const n=Number(v);return Number.isFinite(n)&&n>0?n.toLocaleString("th-TH")+" บาท":""}
function hydrate(data){
  state.results=data.results||[];
  state.predictions=data.predictions||[];
  state.currentPrediction=data.currentPrediction||null;
  state.predictions6=data.predictions6||[];
  state.currentPrediction6=data.currentPrediction6||null;
  state.latestPrizeSummary=data.latestPrizeSummary||null;
  state.algorithmPerformance=data.algorithmPerformance||null;
  state.news=data.news||null;
  state.lastSync=data.lastSync||"";
  state.source=data.source||"";
}

function setLoaderText(text){const e=$("#pageLoaderText");if(e)e.textContent=text}
function hidePageLoader(){const e=$("#pageLoader");if(!e)return;e.classList.add("is-hidden");setTimeout(()=>{e.style.display="none"},330)}
async function load(initial=false){
  $('#statusText').textContent='กำลังโหลด';
  if(initial)setLoaderText('กำลังเชื่อมต่อข้อมูลล่าสุด...');
  try{
    const data=await requestBackend({mode:'dashboard',t:Date.now()});
    if(!Array.isArray(data.results)||!Array.isArray(data.predictions)||!Array.isArray(data.predictions6))
      throw new Error('BAD_PAYLOAD');
    try{
      hydrate(data);
      render();
    }catch(renderErr){
      console.error('Rendering error:',renderErr);
      throw new Error('RENDER_FAILED');
    }
    hideConnectionError();
    $('#statusText').textContent='อัปเดตอัตโนมัติ';
  }catch(err){
    console.error('Lottery Insight load:',err);
    $('#statusText').textContent='เชื่อมต่อไม่ได้';
    showConnectionError(err);
    toast('ไม่สามารถโหลดข้อมูลล่าสุด');
  }finally{
    if(initial)setTimeout(hidePageLoader,180);
  }
}
function dataRange(){return state.range==="all"?state.results:state.results.slice(0,Math.min(Number(state.range),state.results.length))}
function renderPrizeNumbers(target,numbers,length){
  const el=$(target);
  const vals=(numbers||[])
    .map(x=>String(x??"").trim())
    .filter(x=>new RegExp(`^\\d{${length}}$`).test(x))
    .slice(0,2);

  el.innerHTML=(vals.length?vals:Array(2).fill("-".repeat(length)))
    .map(n=>`<b>${esc(n)}</b>`)
    .join("");
}

function prizeAmountLabel(item){
  const n=Number(item?.amount||0);
  return Number.isFinite(n)&&n>0?`${n.toLocaleString("th-TH")} บาท`:"";
}

function renderLatestPrizeSummary(){
  const s=state.latestPrizeSummary||{};

  renderPrizeNumbers("#front3Numbers",s.front3?.numbers,3);
  renderPrizeNumbers("#back3Numbers",s.back3?.numbers,3);

  $("#front3Amount").textContent=prizeAmountLabel(s.front3);
  $("#back3Amount").textContent=prizeAmountLabel(s.back3);

  const adjacent=(s.adjacentFirst?.numbers||[])
    .map(x=>String(x??"").trim())
    .filter(x=>/^\d{6}$/.test(x))
    .slice(0,2);

  const group=$("#adjacentFirstGroup");
  if(adjacent.length){
    group.hidden=false;
    $("#adjacentFirstAmount").textContent=prizeAmountLabel(s.adjacentFirst);
    $("#adjacentFirstNumbers").innerHTML=adjacent.map(n=>`<b>${esc(n)}</b>`).join("");
  }else{
    group.hidden=true;
    $("#adjacentFirstNumbers").innerHTML="";
  }
}

function sixBreakdown(n){
  const s=String(n||"").padStart(6,"0").slice(-6);
  return {
    front3:s.slice(0,3),
    back3:s.slice(-3),
    last2:s.slice(-2)
  };
}
function renderLatest(){
  const d=state.results[0];
  $("#latestDate").textContent=d?.displayName||thDate(d?.drawDate);
  $("#firstPrize").textContent=d?.firstPrize||"------";
  $("#last2").textContent=d?.last2||"--";
  $("#lastSync").textContent=state.lastSync?`อัปเดตล่าสุด ${thDateTime(state.lastSync)}`:"อัปเดตข้อมูลอัตโนมัติ";
  renderLatestPrizeSummary();
}

function normalizeSixCandidates(value){
  if(Array.isArray(value)){
    return value
      .map(x=>String(x??"").replace(/\D/g,"").padStart(6,"0").slice(-6))
      .filter(x=>/^\d{6}$/.test(x));
  }
  if(typeof value==="string"){
    try{
      const parsed=JSON.parse(value);
      if(Array.isArray(parsed))return normalizeSixCandidates(parsed);
    }catch(_){}
    return value.split(",")
      .map(x=>String(x).trim())
      .filter(x=>/^\d{6}$/.test(x));
  }
  return [];
}
function renderPrediction(){
  const p=state.currentPrediction||null;
  if(p){
    $("#predictionSub").textContent=`อิงข้อมูลถึงงวด ${thDate(p.basedOnDrawDate)}`;
    $("#excludedLast2").textContent=p.excludedLast2||state.results[0]?.last2||"—";
    $("#candidateList").innerHTML=(p.candidates||[]).map((n,i)=>
      `<div class="candidate"><strong>${esc(n)}</strong><span>score ${Number((p.scores||[])[i]||0).toFixed(1)}</span></div>`
    ).join("");
  }else{
    $("#candidateList").innerHTML=`<div class="candidate"><strong>—</strong><span>กำลังสร้าง Candidate ชุดใหม่</span></div>`;
    $("#excludedLast2").textContent=state.results[0]?.last2||"—";
  }

  const p6=state.currentPrediction6||null;
  if(p6){
    $("#excludedFirstPrize").textContent=p6.excludedFirstPrize||state.results[0]?.firstPrize||"—";
    const sixCandidates=normalizeSixCandidates(p6.candidates);
    $("#candidate6List").innerHTML=sixCandidates.map((n,i)=>{
      const b=sixBreakdown(n);
      return `<div class="candidate6">
        <div class="candidate6-main">
          <strong>${esc(n)}</strong>
          <small>หน้า ${b.front3} · ท้าย ${b.back3} · ท้าย 2 ตัว ${b.last2}</small>
        </div>
        <span>score ${Number((p6.scores||[])[i]||0).toFixed(1)}</span>
      </div>`;
    }).join("") || `<div class="candidate6"><strong>กำลังสร้างใหม่</strong><span>รอ Sync รอบถัดไป</span></div>`;
  }else{
    $("#candidate6List").innerHTML=`<div class="candidate6"><div class="candidate6-main"><strong>กำลังสร้าง Candidate ชุดใหม่</strong><small>รอ Sync Algorithm v2</small></div><span>—</span></div>`;
    $("#excludedFirstPrize").textContent=state.results[0]?.firstPrize||"—";
  }
}

function renderAudit(){
  const closed=state.predictions.filter(x=>x.status==="CLOSED").sort((a,b)=>String(b.actualDrawDate).localeCompare(String(a.actualDrawDate))),p=closed[0],badge=$("#auditBadge"),repeat=$("#repeatExplanation");repeat.hidden=true;
  if(!p){$("#auditCandidates").textContent="—";$("#auditActual").textContent="—";$("#auditResult").textContent="ยังไม่มีงวดให้ตรวจ";$("#auditCreated").textContent="—";badge.textContent="รอผล";badge.className="audit-badge pending"}
  else{$("#auditCandidates").textContent=(p.candidates||[]).join(" · ");$("#auditActual").textContent=p.actualLast2||"—";$("#auditCreated").textContent=thDateTime(p.createdAt);if(p.hit){$("#auditResult").textContent=`ตรง ✓ อันดับ ${p.hitRank}`;badge.textContent="ตรง";badge.className="audit-badge hit"}else{$("#auditResult").textContent="ไม่ตรง";badge.textContent="ไม่ตรง";badge.className="audit-badge miss"}if(p.actualRepeatedPrevious)repeat.hidden=false}
  $("#auditHistory").innerHTML=closed.slice(0,12).map(x=>{
    const rowClass=x.hit?"history-hit":"history-miss";
    const result=x.hit
      ? `<span class="history-status hit"><i></i>ถูกรางวัล · อันดับ ${x.hitRank}</span>`
      : `<span class="history-status miss"><i></i>ไม่ตรง</span>`;
    return `<tr class="${rowClass}">
      <td>${thDate(x.actualDrawDate)}</td>
      <td>${esc((x.candidates||[]).join(" · "))}</td>
      <td><b class="two-no">${esc(x.actualLast2||"—")}</b></td>
      <td>${result}</td>
      <td>${x.actualRepeatedPrevious?"ออกซ้ำงวดก่อน (ถูก exclude)":"—"}</td>
    </tr>`;
  }).join("")||`<tr><td colspan="5">ยังไม่มีประวัติ</td></tr>`;
}

function renderAudit6(){
  const closed=state.predictions6
    .filter(x=>x.status==="CLOSED")
    .sort((a,b)=>String(b.actualDrawDate).localeCompare(String(a.actualDrawDate)));
  const p=closed[0],badge=$("#audit6Badge");

  if(!p){
    $("#audit6Candidates").textContent="—";
    $("#audit6Actual").textContent="—";
    $("#audit6Result").textContent="ยังไม่มีงวดให้ตรวจ";
    $("#audit6Created").textContent="—";
    badge.textContent="รอผล";
    badge.className="audit-badge pending";
  }else{
    $("#audit6Candidates").textContent=normalizeSixCandidates(p.candidates).join(" · ")||"—";
    $("#audit6Actual").textContent=p.actualFirstPrize||"—";
    $("#audit6Created").textContent=thDateTime(p.createdAt);

    const hits=p.matches||[];
    if(p.hitAnyPrize&&hits.length){
      const short=hits.map(h=>{
        const names=(h.matches||[]).map(m=>m.name).filter(Boolean).join(" + ");
        return `${h.number}${names?` → ${names}`:""}`;
      }).join(" | ");
      $("#audit6Result").textContent=short;
      badge.textContent="มีถูกรางวัล";
      badge.className="audit-badge hit";
    }else{
      $("#audit6Result").textContent="Candidate ยังไม่ตรงรางวัล";
      badge.textContent="ไม่ตรง";
      badge.className="audit-badge miss";
    }
  }

  $("#audit6History").innerHTML=closed.slice(0,12).map(x=>{
    const hits=x.matches||[];
    const result=x.hitAnyPrize&&hits.length
      ? hits.map(h=>`${esc(h.number)} → ${esc((h.matches||[]).map(m=>m.name).join(" + "))}`).join("<br>")
      : "ไม่ตรงรางวัล";
    const rowClass=x.hitAnyPrize?"history-hit":"history-miss";
    const status=x.hitAnyPrize
      ? `<span class="history-status hit"><i></i>ถูกรางวัล</span>`
      : `<span class="history-status miss"><i></i>ไม่ตรง</span>`;
    return `<tr class="${rowClass}">
      <td>${thDate(x.actualDrawDate)}</td>
      <td>${esc(normalizeSixCandidates(x.candidates).join(" · "))}</td>
      <td><b class="main-no">${esc(x.actualFirstPrize||"—")}</b></td>
      <td>${result}</td>
      <td>${status}</td>
    </tr>`;
  }).join("")||`<tr><td colspan="5">ยังไม่มีประวัติ</td></tr>`;
}

function renderAlgorithmPerformance(){
  const p=state.algorithmPerformance;
  const body=$("#algoModelBody");
  if(!p||!p.tests){
    $("#algoEnsembleRate").textContent="—";
    $("#algoEnsembleHits").textContent="รอข้อมูลเพิ่ม";
    $("#algoTests").textContent=p?.tests||"—";
    $("#algoBestModel").textContent="—";
    $("#algoBestRate").textContent="—";
    $("#algoBaseline").textContent=`${Number(p?.baselineRate??5).toFixed(1)}%`;
    $("#algoEdgeNote").className="algorithm-edge neutral";
    $("#algoEdgeNote").textContent="ต้องมีผลย้อนหลังเพียงพอก่อนจึงจะวัด Walk-forward ได้";
    body.innerHTML='<tr><td colspan="4">รอข้อมูล Backtest</td></tr>';
    return;
  }

  const ensemble=p.ensemble||{};
  const baseline=Number(p.baselineRate||5);
  const rate=Number(ensemble.rate||0);
  const edge=rate-baseline;
  const best=p.bestModel||null;

  $("#algoVersionBadge").textContent=p.label||"ENSEMBLE V3";
  $("#algoEnsembleRate").textContent=`${rate.toFixed(1)}%`;
  $("#algoEnsembleHits").textContent=`${ensemble.hits||0} / ${p.tests} งวด`;
  $("#algoBaseline").textContent=`${baseline.toFixed(1)}%`;
  $("#algoTests").textContent=String(p.tests);
  $("#algoBestModel").textContent=best?.label||"—";
  $("#algoBestRate").textContent=best?`${Number(best.rate||0).toFixed(1)}% · ${best.hits||0}/${p.tests}`:"—";

  const edgeEl=$("#algoEdgeNote");
  if(edge>0.01){
    edgeEl.className="algorithm-edge positive";
    edgeEl.textContent=`Walk-forward สูงกว่า random baseline ${edge>=0?"+":""}${edge.toFixed(1)} percentage points ในชุดทดสอบนี้ — ยังไม่ใช่การรับประกันงวดถัดไป`;
  }else if(edge<-.01){
    edgeEl.className="algorithm-edge negative";
    edgeEl.textContent=`Walk-forward ต่ำกว่า random baseline ${edge.toFixed(1)} percentage points ในชุดทดสอบนี้ ระบบยังคงแสดงผลตามข้อมูลจริง`;
  }else{
    edgeEl.className="algorithm-edge neutral";
    edgeEl.textContent="Walk-forward ใกล้เคียง random baseline ในชุดทดสอบปัจจุบัน";
  }

  const models=p.models||[];
  const maxWeight=Math.max(1,...models.map(m=>Number(m.weight||0)));
  body.innerHTML=models.map(m=>{
    const width=Math.max(5,Math.round(Number(m.weight||0)/maxWeight*70));
    return `<tr>
      <td><span class="algorithm-model-name">${esc(m.label||m.id)}</span></td>
      <td>${m.hits||0} / ${m.tests||p.tests}</td>
      <td>${Number(m.rate||0).toFixed(1)}%</td>
      <td><span class="algorithm-model-weight"><i style="width:${width}px"></i>${Number(m.weightPct||0).toFixed(1)}%</span></td>
    </tr>`;
  }).join("")||'<tr><td colspan="4">ไม่มีข้อมูล Model</td></tr>';
}

/* ===== v5.2 News Intelligence (read-only) ===== */
function newsSafeLink(url){
  const str=String(url||'').trim();
  return /^https:\/\/[^<>"'\s]{4,1800}$/i.test(str)?str:'';
}
function newsNumberChips(items,maxLength){
  if(!items?.length)return '<span class="news-empty">ยังไม่พบเลขที่กล่าวถึงชัดเจนในข่าว</span>';
  return items.slice(0,5).filter(x=>
    new RegExp('^\\d{'+maxLength+'}$').test(String(x.number||''))
  ).map((x,i)=>`<div class="news-number-card">
    <small>อันดับ ${i+1}</small>
    <strong>${esc(x.number)}</strong>
    <span>${Number(x.sourceCount||0)} สำนัก · ${Number(x.mentions||0)} ชุดข้อมูล</span>
  </div>`).join('')||'<span class="news-empty">ยังไม่มีเลขที่ผ่านการตรวจสอบ</span>';
}
function renderNews(){
  const n=state.news||{};
  const disabled=n.enabled===false;
  const error=n.status==='error';
  const waiting=n.status==='waiting-results';
  const empty=!(n.articleCount>0);
  const status=$('#newsStatus');
  const diagEl=$('#newsDiagnostics');
  if(diagEl){
    const v=String(n.engineVersion||'');
    const d=n.diagnostics||{};
    const old=!v||!/^5\.3(?:\.|$)/.test(v);
    const noData=empty&&!error&&n.enabled!==false;
    diagEl.hidden=!(old||noData);
    diagEl.textContent=old
      ? 'Backend ข่าวเป็นรุ่นเก่า: ตรวจ DATA_URL แล้ว Deploy → New version'
      : noData && d.reason==='configure-structured-source'
      ? 'ไม่มีเลขที่ยืนยันได้จากแหล่งข่าวอัตโนมัติสำหรับงวดนี้: ตรวจ probeLotteryNewsSource() ใน Apps Script'
      : noData
      ? 'ไม่พบชุดเลขสำหรับงวดนี้: ดู diagnoseLotteryNews() ใน Apps Script'
      : '';
  }
  if(disabled){status.textContent='ปิดใช้งาน';status.className='news-status';}
  else if(error){status.textContent='แหล่งข่าวขัดข้อง';status.className='news-status warning';}
  else if(waiting){status.textContent='รอประกาศผลใหม่';status.className='news-status';}
  else if(empty){status.textContent='ยังไม่มีชุดเลขยืนยัน';status.className='news-status';}
  else{status.textContent='ข้อมูลแยกหมวดแล้ว';status.className='news-status ready';}
  $('#newsPeriod').textContent=n.targetDrawDate
    ? 'ติดตามงวดประมาณ '+thDate(n.targetDrawDate)
    : 'รอข้อมูลรอบถัดไป';
  $('#newsLastSync').textContent=n.lastSync
    ? 'อัปเดตข่าว '+thDateTime(n.lastSync)
    : 'ยังไม่มีข้อมูลอัปเดต';
  $('#newsTop2').innerHTML=newsNumberChips(n.top2,2);
  $('#newsTop3').innerHTML=newsNumberChips(n.top3,3);
  const overlaps=Array.isArray(n.overlap2)?n.overlap2.filter(x=>/^\d{2}$/.test(x)):[];
  const ov=$('#newsOverlap');
  ov.hidden=!overlaps.length;
  ov.textContent=overlaps.length
    ? 'เลขที่ตรงกันระหว่างข่าวกับ Candidate ของ Algorithm: '+overlaps.join(' · ')
    : '';
  $('#newsArticleCount').textContent=`${Number(n.articleCount||0)} หน้ารวม · ${Number(n.sourceCount||0)} สำนัก · ${Number(n.pickSourceCount||0)} ชุดเลข`;
  const articles=Array.isArray(n.articles)?n.articles:[];
  $('#newsArticles').innerHTML=articles.map(a=>{
    const url=newsSafeLink(a.url);
    if(!url)return '';
    const tags=[...(a.two||[]),...(a.three||[])]
      .filter(x=>/^\d{2,3}$/.test(String(x))).slice(0,8);
    return `<a class="news-article" href="${esc(url)}" target="_blank" rel="noopener noreferrer nofollow">
      <span class="news-article-title">${esc(a.title||'ข่าว')}</span>
      <span class="news-article-meta">${esc(a.source||'แหล่งข่าว')} · รวบรวมเมื่อ ${thDate(a.publishedAt)}</span>
      <span class="news-article-tipster">ที่มาของชุดเลข: ${esc(a.pickSource||a.source||'ไม่ระบุ')}${(a.featured||[]).length?' · เด่น '+(a.featured||[]).filter(x=>/^\d$/.test(String(x))).map(esc).join(' · '):''}</span>
      ${tags.length?`<span class="news-article-tags">${tags.map(x=>`<b>${esc(x)}</b>`).join('')}</span>`:''}
    </a>`;
  }).join('') || `<div class="news-empty news-empty-block">${error?'ยังเชื่อมต่อแหล่งข่าวไม่ได้ แต่ระบบตรวจสลากยังทำงานตามปกติ':'ยังไม่มีเลขที่แหล่งข่าวระบุแยกเป็นชุด 2/3 ตัวสำหรับงวดนี้'}</div>`;
  const history=Array.isArray(n.history)?n.history:[];
  $('#newsAuditHistory').innerHTML=history.map(x=>{
    const two=x.hit2===true
      ? '<span class="history-status hit">ถูกรางวัล</span>'
      : '<span class="history-status miss">ไม่ตรง</span>';
    const three=x.hit3===null
      ? '<span class="news-unknown">ข้อมูลไม่ครบ</span>'
      : x.hit3===true
      ? `<span class="history-status hit">ตรง ${esc((x.matches||[]).join(' · '))}</span>`
      : '<span class="history-status miss">ไม่ตรง</span>';
    return `<tr class="${x.hit2||x.hit3?'history-hit':'history-miss'}">
      <td>${thDate(x.actualDrawDate)}</td>
      <td>${esc((x.candidates2||[]).join(' · ')||'—')}</td>
      <td><b class="two-no">${esc(x.actualLast2||'—')}</b></td>
      <td>${two}</td>
      <td>${three}</td>
    </tr>`;
  }).join('')||'<tr><td colspan="5">ยังไม่มี Snapshot ข่าวที่ตรวจผลแล้ว</td></tr>';
}


function statCounts(){const map=new Map(),digits=Array(10).fill(0);dataRange().forEach(d=>{if(!/^\d{2}$/.test(d.last2))return;map.set(d.last2,(map.get(d.last2)||0)+1);digits[+d.last2[0]]++;digits[+d.last2[1]]++});return{freq:[...map].map(([number,count])=>({number,count})),digits}}
function renderStats(){const{freq,digits}=statCounts(),hot=[...freq].sort((a,b)=>b.count-a.count||a.number.localeCompare(b.number)).slice(0,5),cold=[...freq].sort((a,b)=>a.count-b.count||a.number.localeCompare(b.number)).slice(0,5),chips=a=>a.map(x=>`<div class="num-chip"><strong>${x.number}</strong><span>${x.count} ครั้ง</span></div>`).join("");$("#hotNumbers").innerHTML=chips(hot);$("#coldNumbers").innerHTML=chips(cold);const max=Math.max(1,...digits);$("#digitChart").innerHTML=digits.map((v,i)=>`<div class="digit-col"><div class="digit-bar" data-value="${v}" style="height:${Math.max(4,v/max*86)}%"></div><b>${i}</b></div>`).join("")}
function renderHistory(){$("#historyCount").textContent=`(${state.results.length} งวด)`;$("#historyBody").innerHTML=state.results.slice(0,100).map(d=>`<tr><td>${thDate(d.drawDate)}</td><td><span class="main-no">${esc(d.firstPrize)}</span></td><td><span class="two-no">${esc(d.last2)}</span></td></tr>`).join("")||`<tr><td colspan="3">ไม่มีข้อมูล</td></tr>`}
function renderDrawOptions(){
  const select=$("#ticketDate");
  if(!select)return;
  const previous=select.value;
  const options=state.results.map(d=>`<option value="${esc(d.drawDate)}">${esc(d.displayName||thDate(d.drawDate))}</option>`).join("");
  select.innerHTML=`<option value="">เลือกงวดที่ต้องการตรวจ</option>${options}`;
  if(previous && state.results.some(d=>d.drawDate===previous)) select.value=previous;
  else if(state.results[0]?.drawDate) select.value=state.results[0].drawDate;
}

function render(){renderLatest();renderPrediction();renderAudit();renderAudit6();renderAlgorithmPerformance();renderNews();renderStats();renderHistory();renderDrawOptions()}

/* =========================
   Prize checker + animated modal
   ========================= */
function sanitizeTicketInput(input){
  input.value=String(input.value||"").replace(/\D/g,"").slice(0,6);
}

function getTicketInputs(){
  return [...document.querySelectorAll(".ticket-number-input")];
}

function collectTicketEntries(){
  const raw=getTicketInputs().map(i=>i.value.trim());
  const nonEmpty=raw.filter(Boolean);
  const invalid=nonEmpty.filter(v=>!/^\d{6}$/.test(v));
  const valid=nonEmpty.filter(v=>/^\d{6}$/.test(v));
  const counts=new Map();
  valid.forEach(n=>counts.set(n,(counts.get(n)||0)+1));
  return {valid,invalid,unique:[...counts.keys()],counts};
}

function updateTicketRows(){
  const rows=[...document.querySelectorAll("[data-ticket-row]")];
  rows.forEach((row,index)=>{
    const idx=row.querySelector(".ticket-index");
    const input=row.querySelector(".ticket-number-input");
    const remove=row.querySelector(".remove-ticket-btn");
    if(idx)idx.textContent=String(index+1);
    if(input)input.setAttribute("aria-label",`เลขสลากใบที่ ${index+1}`);
    if(remove)remove.hidden=rows.length<=1;
  });
  $("#ticketCount").textContent=`${rows.length} ช่อง`;
}

function createTicketRow(value=""){
  const row=document.createElement("div");
  row.className="ticket-input-row";
  row.dataset.ticketRow="";
  row.innerHTML=`
    <span class="ticket-index"></span>
    <input
      class="ticket-number-input"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="6"
      autocomplete="off"
      placeholder="กรอกเลข 6 หลัก">
    <button class="remove-ticket-btn" type="button">ลบ</button>`;
  const input=row.querySelector(".ticket-number-input");
  input.value=String(value||"").replace(/\D/g,"").slice(0,6);
  input.addEventListener("input",()=>sanitizeTicketInput(input));
  row.querySelector(".remove-ticket-btn").addEventListener("click",()=>{
    row.remove();
    if(!getTicketInputs().length)createTicketRow();
    updateTicketRows();
  });
  $("#ticketInputs").appendChild(row);
  updateTicketRows();
  return input;
}

function resetTicketRows(){
  $("#ticketInputs").innerHTML="";
  const input=createTicketRow();
  input.focus();
}

function initTicketRows(){
  getTicketInputs().forEach(input=>{
    input.addEventListener("input",()=>sanitizeTicketInput(input));
  });
  updateTicketRows();
}

async function requestCheckMany(numbers,date){
  return await requestBackend({
    mode:'check-many',
    drawDate:date,
    numbers:numbers.join(','),
    t:Date.now()
  },true);
}
function prizeAmountForMatches(matches){
  return (matches||[]).reduce((sum,m)=>{
    const n=Number(m.amount);
    return sum+(Number.isFinite(n)?n:0);
  },0);
}

function batchResultBody(data,parsed,date){
  const byNumber=new Map((data.results||[]).map(r=>[r.number,r]));
  let winningTickets=0;
  let winningNumbers=0;
  let totalPrize=0;

  const rows=parsed.unique.map(number=>{
    const qty=parsed.counts.get(number)||1;
    const result=byNumber.get(number)||{number,matches:[]};
    const matches=result.matches||[];
    const win=matches.length>0;

    if(win){
      winningNumbers++;
      winningTickets+=qty;
    }

    const perTicket=prizeAmountForMatches(matches);
    totalPrize+=perTicket*qty;

    const prizeNames=win
      ? matches.map(m=>esc(m.name||"รางวัล")).join(" + ")
      : "ไม่พบรางวัล";

    const amountText=win && perTicket>0
      ? `${money(perTicket*qty)}`
      : win ? "พบรางวัล" : "—";

    return `<div class="batch-result-row ${win?"win":"miss"}">
      <div class="batch-result-number">
        <strong>${esc(number)}</strong>
        <span>${qty>1?`${qty} ใบ`:"1 ใบ"}</span>
      </div>
      <div class="batch-result-prizes">
        <strong>${prizeNames}</strong>
        <span>${win?(qty>1?`เงินรางวัลต่อใบ ${money(perTicket)||"ตามประกาศ"}`:"เลขนี้ตรงรายการรางวัล"):"ไม่พบเลขนี้ในรายการรางวัล"}</span>
      </div>
      <div class="batch-result-amount">${amountText}</div>
    </div>`;
  }).join("");

  return {
    winningTickets,
    winningNumbers,
    totalPrize,
    html:`
      <div class="batch-modal-summary">
        <div class="batch-summary-box"><strong>${parsed.valid.length}</strong><span>จำนวนใบ</span></div>
        <div class="batch-summary-box"><strong>${parsed.unique.length}</strong><span>หมายเลข</span></div>
        <div class="batch-summary-box winning"><strong>${winningTickets}</strong><span>ใบที่ถูกรางวัล</span></div>
      </div>
      <div class="batch-results">${rows}</div>
      ${totalPrize>0?`<div class="batch-total"><span>รวมเงินรางวัลตามข้อมูล</span><strong>${money(totalPrize)}</strong></div>`:""}
      ${data.completePrizeData===false?`<div class="result-modal-message">ข้อมูลงวดนี้อาจยังไม่ครบทุกรายการ กรุณาตรวจสอบกับประกาศทางการอีกครั้ง</div>`:""}
    `
  };
}

async function checkPrize(){
  const parsed=collectTicketEntries();
  const date=$("#ticketDate").value;

  if(!parsed.valid.length){
    toast("กรุณากรอกเลขสลากอย่างน้อย 1 เลข");
    getTicketInputs()[0]?.focus();
    return;
  }
  if(parsed.invalid.length){
    toast("มีรายการที่ไม่ใช่เลข 6 หลัก กรุณาตรวจสอบก่อน");
    getTicketInputs()[0]?.focus();
    return;
  }
  if(parsed.unique.length>100){
    toast("ตรวจได้สูงสุด 100 หมายเลขไม่ซ้ำต่อครั้ง");
    return;
  }
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){
    toast("กรุณาเลือกงวดวันที่");
    $("#ticketDate").focus();
    return;
  }

  const btn=$("#checkPrizeBtn"),old=btn.textContent;
  btn.disabled=true;
  btn.textContent=`กำลังตรวจ ${parsed.valid.length} ใบ...`;

  try{
    const data=await requestCheckMany(parsed.unique,date);

    if(!data.ok){
      openResultModal("error","ตรวจรางวัลไม่สำเร็จ","",date,
        `<div class="result-modal-message">${esc(data.error||"เกิดข้อผิดพลาด")}</div>`);
      return;
    }

    if(!data.found){
      openResultModal("error","ยังไม่มีข้อมูลของงวดนี้","",date,
        `<div class="result-modal-message">
          ยังไม่มีข้อมูลของงวด ${esc(thDate(date))} สำหรับตรวจในขณะนี้
          กรุณาตรวจต่อกับสำนักงานสลากกินแบ่งรัฐบาล
        </div>
        <a class="result-modal-link" href="https://www.glo.or.th/mission/reward-payment/check-reward" target="_blank" rel="noreferrer">ตรวจที่ GLO ↗</a>`);
      return;
    }

    if(data.unavailableFullPrizeData){
      openResultModal("error","งวดนี้ยังตรวจรางวัลเต็มไม่ได้","",date,
        `<div class="result-modal-message">
          ระบบมีข้อมูลสถิติของงวดนี้แล้ว แต่รายละเอียดรางวัลทั้งหมดสำหรับตรวจเลขยังไม่ครบ
          กรุณาตรวจงวดนี้กับสำนักงานสลากกินแบ่งรัฐบาล
        </div>
        <a class="result-modal-link" href="https://www.glo.or.th/mission/reward-payment/check-reward" target="_blank" rel="noreferrer">ตรวจที่ GLO ↗</a>`);
      return;
    }

    const summary=batchResultBody(data,parsed,date);

    if(summary.winningTickets>0){
      const title=summary.winningTickets===1
        ? "ยินดีด้วย พบ 1 ใบถูกรางวัล"
        : `ยินดีด้วย พบ ${summary.winningTickets} ใบถูกรางวัล`;
      openResultModal("win",title,"",date,summary.html);
    }else{
      openResultModal("miss","ไม่พบเลขที่ถูกรางวัล","",date,summary.html);
    }
  }catch(e){
    console.error('Prize checker:',e);
    const details=connectionMessage(e);
    openResultModal("error","ตรวจรางวัลไม่สำเร็จ","",date,
      `<div class="result-modal-message">${esc(details.title)} · ${esc(details.detail)}</div>`);
  }finally{
    btn.disabled=false;
    btn.textContent=old;
  }
}
function openResultModal(kind,title,number,date,bodyHtml){
  const backdrop=$("#resultModal"),card=$("#resultModalCard");
  card.className=`result-modal-card ${kind}`;
  $("#resultModalIcon").textContent=kind==="win"?"✓":kind==="miss"?"–":"!";
  $("#resultModalEyebrow").textContent=kind==="win"?"ตรวจพบรางวัล":kind==="miss"?"ผลการตรวจรางวัล":"ตรวจสอบข้อมูล";
  $("#resultModalTitle").textContent=title;
  $("#resultModalTicket").textContent=number?`${number} · งวด ${thDate(date)}`:"";
  $("#resultModalBody").innerHTML=bodyHtml;
  backdrop.hidden=false;
  document.body.classList.add("modal-open");
  $("#resultModalOk").focus({preventScroll:true});
}
function closeResultModal(){
  $("#resultModal").hidden=true;
  document.body.classList.remove("modal-open");
}

$("#addTicketBtn").onclick=()=>{
  if(getTicketInputs().length>=100){toast("เพิ่มได้สูงสุด 100 ช่อง");return}
  const input=createTicketRow();
  input.focus();
};
$("#clearTicketsBtn").onclick=resetTicketRows;
$("#checkPrizeBtn").onclick=checkPrize;
$("#themeBtn").onclick=()=>applyTheme(document.body.classList.contains("dark")?"light":"dark");
$("#reloadBtn").onclick=()=>{load(false);toast("กำลังโหลดข้อมูลล่าสุด")};
$("#rangeTabs").onclick=e=>{const b=e.target.closest("[data-range]");if(!b)return;$$('[data-range]').forEach(x=>x.classList.remove("active"));b.classList.add("active");state.range=b.dataset.range==="all"?"all":Number(b.dataset.range);renderStats()};

$("#resultModalOk").onclick=closeResultModal;
$("#resultModal").onclick=e=>{if(e.target===$("#resultModal"))closeResultModal()};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#resultModal").hidden)closeResultModal()});

$('#retryConnectionBtn').onclick=()=>load(false);
initTicketRows();applyTheme(localStorage.getItem("lottery-theme")||"light");load(true);
