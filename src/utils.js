/* ═══ UTILITIES ═══
 * Pure helper functions: ID, format, date, storage, recurring engine
 */
import { SK, OSK, DF } from "./constants";

/* Random unique ID (used for new entities) */
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

/* Format Baht — `฿1,234` (no decimals) */
export const fB=n=>`฿${Math.abs(n).toLocaleString("th-TH",{maximumFractionDigits:0})}`;

/* Format percent with sign — `+12.3%` / `-5.1%` */
export const fP=n=>`${n>=0?"+":""}${n.toFixed(1)}%`;

/* Today as `YYYY-MM-DD` */
export const td=()=>new Date().toISOString().slice(0,10);

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
