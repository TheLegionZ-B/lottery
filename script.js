const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const CFG=window.APP_CONFIG||{};
let state={results:[],predictions:[],currentPrediction:null,predictions6:[],currentPrediction6:null,lastSync:"",source:"",range:50};

const DEMO={
  ok:true,source:"Demo data",lastSync:new Date().toISOString(),
  results:[
    {drawDate:"2026-10-16",displayName:"งวดวันที่ 16 ตุลาคม 2569",firstPrize:"011781",last2:"48",
      prizes:[
        {slug:"first-prize",name:"รางวัลที่ 1",amount:"6000000.00",numbers:["011781"]},
        {slug:"last-two-digit",name:"เลขท้าย 2 ตัว",amount:"2000.00",numbers:["48"]}
      ],completePrizeData:false},
    {drawDate:"2026-10-01",displayName:"งวดวันที่ 1 ตุลาคม 2569",firstPrize:"402701",last2:"70",
      prizes:[
        {slug:"first-prize",name:"รางวัลที่ 1",amount:"6000000.00",numbers:["402701"]},
        {slug:"last-two-digit",name:"เลขท้าย 2 ตัว",amount:"2000.00",numbers:["70"]}
      ],completePrizeData:false},
    {drawDate:"2026-09-16",displayName:"งวดวันที่ 16 กันยายน 2569",firstPrize:"730640",last2:"64",prizes:[],completePrizeData:false},
    {drawDate:"2026-09-01",displayName:"งวดวันที่ 1 กันยายน 2569",firstPrize:"417212",last2:"04",prizes:[],completePrizeData:false},
    {drawDate:"2026-08-16",displayName:"งวดวันที่ 16 สิงหาคม 2569",firstPrize:"004615",last2:"53",prizes:[],completePrizeData:false},
    {drawDate:"2026-08-01",displayName:"งวดวันที่ 1 สิงหาคม 2569",firstPrize:"932479",last2:"69",prizes:[],completePrizeData:false},
    {drawDate:"2026-07-16",displayName:"งวดวันที่ 16 กรกฎาคม 2569",firstPrize:"639214",last2:"71",prizes:[],completePrizeData:false},
    {drawDate:"2026-07-01",displayName:"งวดวันที่ 1 กรกฎาคม 2569",firstPrize:"751495",last2:"62",prizes:[],completePrizeData:false},
    {drawDate:"2026-06-16",displayName:"งวดวันที่ 16 มิถุนายน 2569",firstPrize:"287184",last2:"48",prizes:[],completePrizeData:false},
    {drawDate:"2026-06-01",displayName:"งวดวันที่ 1 มิถุนายน 2569",firstPrize:"173770",last2:"95",prizes:[],completePrizeData:false}
  ],
  predictions:[],currentPrediction:null,predictions6:[],currentPrediction6:null
};

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
  state.lastSync=data.lastSync||"";
  state.source=data.source||"";
}

function setLoaderText(text){const e=$("#pageLoaderText");if(e)e.textContent=text}
function hidePageLoader(){const e=$("#pageLoader");if(!e)return;e.classList.add("is-hidden");setTimeout(()=>{e.style.display="none"},330)}
async function load(initial=false){
  $("#statusText").textContent="กำลังโหลด";
  if(initial)setLoaderText("กำลังเชื่อมต่อข้อมูลล่าสุด...");
  try{
    let data;
    if(CFG.DATA_URL){
      if(initial)setLoaderText("กำลังอ่านผลสลากและสถิติ...");
      const r=await fetch(CFG.DATA_URL+"?mode=dashboard&t="+Date.now(),{cache:"no-store"});
      if(!r.ok)throw new Error("HTTP "+r.status);
      data=await r.json();if(!data.ok)throw new Error(data.error||"API error");
    }else if(CFG.DEMO_MODE){data=DEMO}else{throw new Error("ยังไม่ได้ตั้งค่าแหล่งข้อมูล")}
    hydrate(data);render();$("#statusText").textContent=CFG.DATA_URL?"อัปเดตอัตโนมัติ":"Demo";
  }catch(err){console.error(err);$("#statusText").textContent="เชื่อมต่อไม่ได้";toast("เชื่อมต่อข้อมูลไม่สำเร็จ")}
  finally{if(initial)setTimeout(hidePageLoader,180)}
}
function dataRange(){return state.range==="all"?state.results:state.results.slice(0,Math.min(Number(state.range),state.results.length))}
function makeLocalPreview(){
  const rows=state.results.slice(0,50); if(!rows.length)return null;
  const latest=rows[0].last2,tens=Array(10).fill(1),ones=Array(10).fill(1),pairs=Array(100).fill(.25),n=rows.length;
  rows.forEach((d,i)=>{if(!/^\d{2}$/.test(d.last2))return;const w=1+((n-i)/n)*.5;tens[+d.last2[0]]+=w;ones[+d.last2[1]]+=w;pairs[+d.last2]+=w});
  const maxT=Math.max(...tens),maxO=Math.max(...ones),maxP=Math.max(...pairs),all=[];
  for(let i=0;i<100;i++){const num=String(i).padStart(2,"0");if(num===latest)continue;const score=(.45*tens[+num[0]]/maxT+.45*ones[+num[1]]/maxO+.10*pairs[i]/maxP)*100;all.push({number:num,score:+score.toFixed(1)})}
  all.sort((a,b)=>b.score-a.score||a.number.localeCompare(b.number));const top=all.slice(0,5);
  return {basedOnDrawDate:rows[0].drawDate,excludedLast2:latest,candidates:top.map(x=>x.number),scores:top.map(x=>x.score),status:"PREVIEW"};
}

function makeLocalPreview6(){
  const rows=state.results.slice(0,50).filter(d=>/^\d{6}$/.test(d.firstPrize||""));
  if(!rows.length)return null;
  const n=rows.length;
  const pos=Array.from({length:6},()=>Array(10).fill(1));

  rows.forEach((d,i)=>{
    const w=1+((n-i)/n)*.35;
    [...d.firstPrize].forEach((ch,p)=>pos[p][Number(ch)]+=w);
  });

  const rankedDigits=pos.map(arr=>{
    const max=Math.max(...arr);
    return arr.map((v,d)=>({digit:String(d),score:v/max}))
      .sort((a,b)=>b.score-a.score||a.digit.localeCompare(b.digit))
      .slice(0,4);
  });

  let beam=[{number:"",sum:0}];
  rankedDigits.forEach(options=>{
    const next=[];
    beam.forEach(base=>options.forEach(o=>{
      next.push({number:base.number+o.digit,sum:base.sum+o.score});
    }));
    next.sort((a,b)=>b.sum-a.sum||a.number.localeCompare(b.number));
    beam=next.slice(0,80);
  });

  const excluded=rows[0].firstPrize;
  const top=beam.filter(x=>x.number!==excluded).slice(0,5);
  const max=top[0]?.sum||1;
  return {
    basedOnDrawDate:rows[0].drawDate,
    excludedFirstPrize:excluded,
    candidates:top.map(x=>x.number),
    scores:top.map(x=>+(x.sum/max*100).toFixed(1)),
    status:"PREVIEW"
  };
}
function renderLatest(){
  const d=state.results[0];
  $("#latestDate").textContent=d?.displayName||thDate(d?.drawDate);
  $("#firstPrize").textContent=d?.firstPrize||"------";
  $("#last2").textContent=d?.last2||"--";
  $("#lastSync").textContent=state.lastSync?`อัปเดตล่าสุด ${thDateTime(state.lastSync)}`:"อัปเดตข้อมูลอัตโนมัติ";
}
function renderPrediction(){
  const p=state.currentPrediction||makeLocalPreview();
  if(p){
    $("#predictionSub").textContent=`อิงข้อมูลถึงงวด ${thDate(p.basedOnDrawDate)}`;
    $("#excludedLast2").textContent=p.excludedLast2||state.results[0]?.last2||"—";
    $("#candidateList").innerHTML=(p.candidates||[]).map((n,i)=>
      `<div class="candidate"><strong>${esc(n)}</strong><span>score ${Number((p.scores||[])[i]||0).toFixed(1)}</span></div>`
    ).join("");
  }else{
    $("#candidateList").innerHTML="";
  }

  const p6=state.currentPrediction6||makeLocalPreview6();
  if(p6){
    $("#excludedFirstPrize").textContent=p6.excludedFirstPrize||state.results[0]?.firstPrize||"—";
    $("#candidate6List").innerHTML=(p6.candidates||[]).map((n,i)=>
      `<div class="candidate6"><strong>${esc(n)}</strong><span>score ${Number((p6.scores||[])[i]||0).toFixed(1)}</span></div>`
    ).join("");
  }else{
    $("#candidate6List").innerHTML="";
    $("#excludedFirstPrize").textContent="—";
  }
}

function renderAudit(){
  const closed=state.predictions.filter(x=>x.status==="CLOSED").sort((a,b)=>String(b.actualDrawDate).localeCompare(String(a.actualDrawDate))),p=closed[0],badge=$("#auditBadge"),repeat=$("#repeatExplanation");repeat.hidden=true;
  if(!p){$("#auditCandidates").textContent="—";$("#auditActual").textContent="—";$("#auditResult").textContent="ยังไม่มีงวดให้ตรวจ";$("#auditCreated").textContent="—";badge.textContent="รอผล";badge.className="audit-badge pending"}
  else{$("#auditCandidates").textContent=(p.candidates||[]).join(" · ");$("#auditActual").textContent=p.actualLast2||"—";$("#auditCreated").textContent=thDateTime(p.createdAt);if(p.hit){$("#auditResult").textContent=`ตรง ✓ อันดับ ${p.hitRank}`;badge.textContent="ตรง";badge.className="audit-badge hit"}else{$("#auditResult").textContent="ไม่ตรง";badge.textContent="ไม่ตรง";badge.className="audit-badge miss"}if(p.actualRepeatedPrevious)repeat.hidden=false}
  $("#auditHistory").innerHTML=closed.slice(0,12).map(x=>`<tr><td>${thDate(x.actualDrawDate)}</td><td>${esc((x.candidates||[]).join(" · "))}</td><td><b class="two-no">${esc(x.actualLast2||"—")}</b></td><td>${x.hit?`ตรง #${x.hitRank}`:"ไม่ตรง"}</td><td>${x.actualRepeatedPrevious?"ออกซ้ำงวดก่อน (ถูก exclude)":"—"}</td></tr>`).join("")||`<tr><td colspan="5">ยังไม่มีประวัติ</td></tr>`;
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
    $("#audit6Candidates").textContent=(p.candidates||[]).join(" · ");
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
    return `<tr>
      <td>${thDate(x.actualDrawDate)}</td>
      <td>${esc((x.candidates||[]).join(" · "))}</td>
      <td><b class="main-no">${esc(x.actualFirstPrize||"—")}</b></td>
      <td>${result}</td>
    </tr>`;
  }).join("")||`<tr><td colspan="4">ยังไม่มีประวัติ</td></tr>`;
}

function statCounts(){const map=new Map(),digits=Array(10).fill(0);dataRange().forEach(d=>{if(!/^\d{2}$/.test(d.last2))return;map.set(d.last2,(map.get(d.last2)||0)+1);digits[+d.last2[0]]++;digits[+d.last2[1]]++});return{freq:[...map].map(([number,count])=>({number,count})),digits}}
function renderStats(){const{freq,digits}=statCounts(),hot=[...freq].sort((a,b)=>b.count-a.count||a.number.localeCompare(b.number)).slice(0,5),cold=[...freq].sort((a,b)=>a.count-b.count||a.number.localeCompare(b.number)).slice(0,5),chips=a=>a.map(x=>`<div class="num-chip"><strong>${x.number}</strong><span>${x.count} ครั้ง</span></div>`).join("");$("#hotNumbers").innerHTML=chips(hot);$("#coldNumbers").innerHTML=chips(cold);const max=Math.max(1,...digits);$("#digitChart").innerHTML=digits.map((v,i)=>`<div class="digit-col"><div class="digit-bar" data-value="${v}" style="height:${Math.max(4,v/max*86)}%"></div><b>${i}</b></div>`).join("")}
function renderHistory(){$("#historyCount").textContent=`(${state.results.length} งวด)`;$("#historyBody").innerHTML=state.results.slice(0,60).map(d=>`<tr><td>${thDate(d.drawDate)}</td><td><span class="main-no">${esc(d.firstPrize)}</span></td><td><span class="two-no">${esc(d.last2)}</span></td></tr>`).join("")||`<tr><td colspan="3">ไม่มีข้อมูล</td></tr>`}
function renderDrawOptions(){
  const select=$("#ticketDate");
  if(!select)return;
  const previous=select.value;
  const options=state.results.map(d=>`<option value="${esc(d.drawDate)}">${esc(d.displayName||thDate(d.drawDate))}</option>`).join("");
  select.innerHTML=`<option value="">เลือกงวดที่ต้องการตรวจ</option>${options}`;
  if(previous && state.results.some(d=>d.drawDate===previous)) select.value=previous;
  else if(state.results[0]?.drawDate) select.value=state.results[0].drawDate;
}

function render(){renderLatest();renderPrediction();renderAudit();renderAudit6();renderStats();renderHistory();renderDrawOptions()}

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

function isFront3Prize(p){const s=(p.slug+" "+p.name).toLowerCase();return /front|first-three|หน้า\s*3|เลขหน้า/.test(s)}
function isBack3Prize(p){const s=(p.slug+" "+p.name).toLowerCase();return /last-three|back|ท้าย\s*3|เลขท้าย\s*3/.test(s)}
function isLast2Prize(p){const s=(p.slug+" "+p.name).toLowerCase();return /last-two|ท้าย\s*2|เลขท้าย\s*2/.test(s)}
function matchPrize(number,p){
  const nums=(p.numbers||[]).map(String),six=number.padStart(6,"0");
  if(isLast2Prize(p))return nums.includes(six.slice(-2));
  if(isFront3Prize(p))return nums.includes(six.slice(0,3));
  if(isBack3Prize(p))return nums.includes(six.slice(-3));
  return nums.includes(six);
}
function checkAgainstDraw(number,draw){
  const prizes=Array.isArray(draw.prizes)?draw.prizes:[];
  return prizes.filter(p=>matchPrize(number,p)).map(p=>({
    name:p.name||p.slug||"รางวัล",
    amount:p.amount||"",
    numbers:p.numbers||[]
  }));
}

async function requestCheckMany(numbers,date){
  if(CFG.DATA_URL){
    const u=new URL(CFG.DATA_URL);
    u.searchParams.set("mode","check-many");
    u.searchParams.set("drawDate",date);
    u.searchParams.set("numbers",numbers.join(","));
    u.searchParams.set("t",Date.now());
    const r=await fetch(u.toString(),{cache:"no-store"});
    if(!r.ok)throw Error("HTTP "+r.status);
    return await r.json();
  }

  const draw=state.results.find(x=>x.drawDate===date);
  if(!draw)return {ok:true,found:false,results:[]};
  return {
    ok:true,
    found:true,
    draw,
    completePrizeData:!!draw.completePrizeData,
    results:numbers.map(number=>({
      number,
      matches:checkAgainstDraw(number,draw)
    }))
  };
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
    console.error(e);
    openResultModal("error","เชื่อมต่อระบบตรวจรางวัลไม่ได้","",date,
      '<div class="result-modal-message">กรุณาลองใหม่อีกครั้งภายหลัง</div>');
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

initTicketRows();applyTheme(localStorage.getItem("lottery-theme")||"light");load(true);
