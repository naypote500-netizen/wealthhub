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

/* Return list of badge IDs that should be unlocked given streak.current and longest */
export function badgesEarned(current,longest,BADGES){
  const max=Math.max(current||0,longest||0);
  return BADGES.filter(b=>max>=b.req).map(b=>b.id);
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
