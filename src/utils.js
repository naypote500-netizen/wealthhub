/* ═══ UTILITIES ═══
 * Pure helper functions: ID, format, date, storage, recurring engine
 */
import { SK, OSK, DF } from "./constants";

/* Random unique ID (used for new entities) */
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

/* Haptic feedback — silent no-op on devices without Vibration API.
 * Pass a number (ms) or array (alternating vibrate/pause pattern).
 * Conventions: tap=5, save=15, delete=[10,40,10], success=[40,30,40]. */
export const haptic=p=>{try{navigator.vibrate?.(p)}catch{}};

/* Format Baht — `฿1,234` (no decimals) */
export const fB=n=>`฿${Math.abs(n).toLocaleString("th-TH",{maximumFractionDigits:0})}`;

/* Format percent with sign — `+12.3%` / `-5.1%` */
export const fP=n=>`${n>=0?"+":""}${n.toFixed(1)}%`;

/* Today as `YYYY-MM-DD` (timezone-aware: Bangkok = UTC+7) */
export const td=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Bangkok"});

/* Add days to a YYYY-MM-DD string */
export const addDays=(s,n)=>{const d=new Date(s+"T00:00:00");d.setDate(d.getDate()+n);return d.toLocaleDateString("en-CA")};

/* Days between two YYYY-MM-DD (b - a) */
export const daysBetween=(a,b)=>{const da=new Date(a+"T00:00:00"),db=new Date(b+"T00:00:00");return Math.round((db-da)/86400000)};

/* Calculate streak from transactions list
 * Returns { current, longest, hasToday, lastLogDate, datesSet } */
export function calcStreak(transactions){
  if(!transactions?.length)return{current:0,longest:0,hasToday:false,lastLogDate:null,datesSet:new Set()};
  // Dedupe to unique dates only (manual entries; ignore auto-recurring? we count them too for simplicity)
  const datesSet=new Set(transactions.map(t=>t.date));
  const dates=[...datesSet].sort((a,b)=>b.localeCompare(a)); // descending
  const today=td();
  const yesterday=addDays(today,-1);
  const hasToday=datesSet.has(today);
  // Longest streak across history
  let longest=1,run=1;
  for(let i=1;i<dates.length;i++){
    if(addDays(dates[i],1)===dates[i-1]){run++;longest=Math.max(longest,run)}
    else run=1;
  }
  if(dates.length===1)longest=1;
  // Current streak — must include today OR yesterday (grace period until end of today)
  let current=0;
  let cursorIdx=-1;
  if(hasToday)cursorIdx=dates.indexOf(today);
  else if(datesSet.has(yesterday))cursorIdx=dates.indexOf(yesterday);
  if(cursorIdx>=0){
    current=1;
    let i=cursorIdx;
    while(i+1<dates.length&&addDays(dates[i+1],1)===dates[i]){current++;i++}
  }
  return{current,longest,hasToday,lastLogDate:dates[0]||null,datesSet};
}

/* Compute stats used for achievement evaluation
 * Returns object keyed by badge category */
export function calcAchievementStats(data,streak,fxRate=35.5){
  const goals=data?.goals||[];
  const assets=data?.assets||[];
  const txns=data?.transactions||[];
  const portValue=assets.reduce((s,a)=>{const u=+a.units||0;const p=+a.currentPrice||0;const v=u*p;return s+(a.currency==="USD"?v*fxRate:v)},0);
  return{
    streak:Math.max(streak?.current||0,streak?.longest||0),
    savings:goals.reduce((s,g)=>s+(+g.saved||0),0),
    goals:goals.filter(g=>(+g.saved||0)>=(+g.target||0)&&(+g.target||0)>0).length,
    portfolio:portValue,
    portfolioCount:assets.length,
    txn:txns.length,
  };
}

/* Return list of badge IDs unlocked given full stats object */
export function badgesEarned(stats,BADGES){
  return BADGES.filter(b=>{
    if(b.cat==="streak")return stats.streak>=b.req;
    if(b.cat==="savings")return stats.savings>=b.req;
    if(b.cat==="goals")return stats.goals>=b.req;
    if(b.cat==="portfolio")return b.id==="firstAsset"?stats.portfolioCount>=b.req:stats.portfolio>=b.req;
    if(b.cat==="txn")return stats.txn>=b.req;
    return false;
  }).map(b=>b.id);
}

/* Year-month key from date string — `2025-04-26` → `2025-04` */
export const mk=d=>d.slice(0,7);

/* Format month-year for Thai display — `2025-04` → `เม.ย. 25` */
export const fm=d=>new Date(d+"-01").toLocaleDateString("th-TH",{month:"short",year:"2-digit"});

/* Load app state from localStorage; falls back to old key + merges defaults */
export function ld(){
  try{
    const r=localStorage.getItem(SK)||localStorage.getItem(OSK);
    if(!r)return null;
    const d=JSON.parse(r);
    return{
      ...DF,
      ...d,
      balanceSheet:{...DF.balanceSheet,...(d.balanceSheet||{})},
      settings:{...DF.settings,...(d.settings||{})},
      recurring:d.recurring||[],
      budgets:d.budgets||{},
      cashFlow:{monthly:{...(d.cashFlow?.monthly||{})},yearly:{...(d.cashFlow?.yearly||{})}},
      cfItems:d.cfItems||null,
    };
  }catch{return null}
}

/* Save app state to localStorage */
export function sv(d){
  try{localStorage.setItem(SK,JSON.stringify(d))}
  catch(e){console.error(e)}
}

/* Process recurring transactions: auto-generate this-month txn when day-of-month
 * has passed and we haven't already run this month for that recurring rule */
export function processRecurring(data){
  if(!data.recurring?.length)return data;
  const today=new Date();
  const curDay=today.getDate();
  const curMonth=mk(td());
  const newTxns=[];
  const updated=data.recurring.map(r=>{
    if(!r.active)return r;
    if(r.lastRun===curMonth)return r;
    if(curDay<(r.dayOfMonth||1))return r;
    const day=Math.min(r.dayOfMonth||1,28);
    const date=`${curMonth}-${String(day).padStart(2,"0")}`;
    newTxns.push({
      id:uid(),
      type:r.type,
      category:r.category,
      amount:+r.amount,
      date,
      note:(r.name||"รายการประจำ")+" (auto)",
      recurringId:r.id,
    });
    return{...r,lastRun:curMonth};
  });
  if(!newTxns.length)return data;
  return{...data,transactions:[...data.transactions,...newTxns],recurring:updated};
}

/* ═══ OCR HELPERS ═══
 * Parse extracted receipt text → best-guess amount + date.
 * extractAmount: prioritises lines containing total/รวม keywords, then
 *   falls back to the largest reasonable number on the receipt.
 * extractDate: handles dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd; converts
 *   Buddhist year (>2500) to Gregorian. Returns YYYY-MM-DD or null. */
export function extractAmount(text){
  if(!text)return null;
  const lines=text.split(/\n/);
  const candidates=[];
  for(const line of lines){
    // Numbers like 1,234.56 / 1234 / 1234.50 / 99.00
    const matches=line.match(/(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/g);
    if(!matches)continue;
    const lower=line.toLowerCase();
    const isTotal=/total|รวม|ทั้งหมด|amount|net|grand|sum|จ่าย|ยอดสุทธิ/.test(lower);
    const hasCurrency=/฿|baht|บาท|thb/.test(lower);
    matches.forEach(m=>{
      const n=parseFloat(m.replace(/,/g,""));
      if(n>=10&&n<5000000)candidates.push({value:n,score:(isTotal?100:0)+(hasCurrency?20:0)+Math.log10(n)});
    });
  }
  if(!candidates.length)return null;
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0].value;
}

export function extractDate(text){
  if(!text)return null;
  // yyyy-mm-dd or yyyy/mm/dd
  let m=text.match(/(20\d{2}|25\d{2})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if(m){
    let yr=+m[1];if(yr>2500)yr-=543;
    return`${yr}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  }
  // dd/mm/yyyy or dd-mm-yyyy
  m=text.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](20\d{2}|25\d{2}|\d{2})/);
  if(m){
    let yr=+m[3];if(yr<100)yr+=yr>50?1900:2000;if(yr>2500)yr-=543;
    return`${yr}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  }
  return null;
}

/* Run OCR on an image file/blob. Lazy-loads tesseract.js to keep main
 * bundle small. Returns {text, amount, date}.
 * onProgress: optional cb({status, progress}) for UI feedback. */
export async function scanReceipt(file,onProgress){
  const{recognize}=await import("tesseract.js");
  const{data}=await recognize(file,"eng+tha",{
    logger:m=>{if(onProgress)onProgress(m)},
  });
  const text=data?.text||"";
  return{text,amount:extractAmount(text),date:extractDate(text)};
}
