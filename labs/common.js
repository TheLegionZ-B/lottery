'use strict';
const $=s=>document.querySelector(s);
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function thDate(v){if(!v)return '—';const d=new Date(v.length===10?v+'T12:00:00+07:00':v);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeZone:'Asia/Bangkok'}).format(d):'—';}
function safeLink(v){try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch(_){return '';}}
async function request(raw,mode){let u;try{u=new URL(raw);}catch(_){throw Error('กรุณาตั้ง URL ของ Web App ที่ลงท้าย /exec');}if(u.protocol!=='https:'||u.hostname!=='script.google.com'||!u.pathname.endsWith('/exec'))throw Error('กรุณาตั้ง URL ของ Web App ที่ลงท้าย /exec');u.searchParams.set('mode',mode);const c=new AbortController(),timer=setTimeout(()=>c.abort(),25000);try{const r=await fetch(u,{signal:c.signal,credentials:'omit',cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const d=await r.json();if(!d||d.ok!==true)throw Error('Backend ไม่พร้อม ตรวจการตั้งค่าและ Deployment');return d;}finally{clearTimeout(timer);}}
const labUrl=()=>String(window.LOTTERY_LABS_CONFIG?.DATA_URL||'');
const mainUrl=()=>String(window.APP_CONFIG?.DATA_URL||'');
function link(text,url){const a=el('a',text);const u=safeLink(url);if(u){a.href=u;a.target='_blank';a.rel='noopener noreferrer nofollow';}return a;}
function errorText(e){return e.name==='AbortError'?'หมดเวลารอข้อมูล':String(e.message||e);}
