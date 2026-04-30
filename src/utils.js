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

/* ═══ ROUND-UP SAVINGS ═══
 * Calculate the round-up amount: how much to round X up to the next multiple of N.
 * Example: roundupAmount(82, 10) = 8 ; roundupAmount(50, 10) = 0 (already round) */
export const roundupAmount=(x,roundTo)=>{
  if(!x||x<=0||!roundTo||roundTo<=0)return 0;
  const rem=x%roundTo;
  return rem===0?0:roundTo-rem;
};

/* ═══ SLIP PARSER ═══
 * Extract amount + date from common Thai bank notification text.
 * Uses pattern matching on amount keywords + Thai/Eng date formats. */
export function parseSlip(text){
  if(!text)return{amount:null,date:null};
  let amount=null;
  // Look for keywords near number: "จำนวน X", "ยอด X", "X บาท", "amount X"
  const amountPatterns=[
    /(?:จำนวน(?:เงิน)?|ยอด(?:เงิน)?|amount|total)[:\s]*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:บาท|baht|thb)/i,
    /฿\s*([\d,]+(?:\.\d{1,2})?)/,
  ];
  for(const re of amountPatterns){
    const m=text.match(re);
    if(m){amount=parseFloat(m[1].replace(/,/g,""));if(amount>0&&amount<10000000)break;}
  }
  // Date patterns: "27 เม.ย. 2569" / "27 เม.ย." / "27/04/2569" / "2026-04-27"
  let date=null;
  // ISO format
  let m=text.match(/(20\d{2}|25\d{2})[-/](\d{1,2})[-/](\d{1,2})/);
  if(m){let y=+m[1];if(y>2500)y-=543;date=`${y}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`}
  // dd/mm/yyyy
  if(!date){m=text.match(/(\d{1,2})[/.](\d{1,2})[/.](20\d{2}|25\d{2})/);if(m){let y=+m[3];if(y>2500)y-=543;date=`${y}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`}}
  // Thai short month: "27 เม.ย. 2569"
  if(!date){
    const thMonths={"ม.ค.":"01","ก.พ.":"02","มี.ค.":"03","เม.ย.":"04","พ.ค.":"05","มิ.ย.":"06","ก.ค.":"07","ส.ค.":"08","ก.ย.":"09","ต.ค.":"10","พ.ย.":"11","ธ.ค.":"12"};
    m=text.match(/(\d{1,2})\s*(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s*(?:(\d{2,4}))?/);
    if(m){const yr=m[3]?(+m[3]>50?(+m[3]<100?2500+ +m[3]:+m[3]):2000+ +m[3]):new Date().getFullYear()+543;const y=yr>2500?yr-543:yr;date=`${y}-${thMonths[m[2]]}-${m[1].padStart(2,"0")}`;}
  }
  return{amount,date};
}

/* ═══ DAILY INSIGHT ═══
 * Pick the most relevant rule-based insight for today.
 * Returns {emoji, text, sub} or null. No AI required — uses local data only. */
export function generateInsight(data,streak){
  if(!data)return null;
  const today=td();
  const ym=today.slice(0,7);
  const txns=data.transactions||[];
  const insights=[];

  // Today not logged yet
  const todayTxns=txns.filter(t=>t.date===today);
  if(todayTxns.length===0&&streak?.current>0){
    insights.push({priority:90,emoji:"⚠️",text:`อย่าลืมบันทึกวันนี้นะ`,sub:`Streak ${streak.current} วันของคุณกำลังจะหายตอนเที่ยงคืน`});
  }

  // Streak milestone close
  if(streak?.current>0){
    const next=[5,10,15,20,25,30].find(m=>m>streak.current);
    if(next&&next-streak.current<=2){
      insights.push({priority:80,emoji:"🎁",text:`อีก ${next-streak.current} วันได้กล่องสุ่ม!`,sub:`บันทึกต่อเพื่อปลดล็อกกล่องสุ่ม "ท่านพจน์"`});
    }
  }

  // Today vs avg
  const last30=[];for(let i=1;i<=30;i++)last30.push(addDays(today,-i));
  const last30Exp=txns.filter(t=>t.type==="expense"&&last30.includes(t.date)).reduce((s,t)=>s+t.amount,0);
  const avgDaily=last30Exp/30;
  const todayExp=todayTxns.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  if(avgDaily>0&&todayExp>avgDaily*1.3){
    insights.push({priority:70,emoji:"📈",text:`วันนี้ใช้สูงกว่าเฉลี่ย`,sub:`฿${Math.round(todayExp).toLocaleString()} (เฉลี่ย ฿${Math.round(avgDaily).toLocaleString()}/วัน)`});
  }
  if(avgDaily>0&&todayExp>0&&todayExp<avgDaily*0.7){
    insights.push({priority:50,emoji:"💚",text:`วันนี้ใช้น้อยกว่าเฉลี่ย — ดีมาก!`,sub:`฿${Math.round(todayExp).toLocaleString()} (เฉลี่ย ฿${Math.round(avgDaily).toLocaleString()}/วัน)`});
  }

  // This month vs last month
  const lastYm=(()=>{const d=new Date(today+"T00:00:00");d.setMonth(d.getMonth()-1);return d.toLocaleDateString("en-CA",{timeZone:"Asia/Bangkok"}).slice(0,7)})();
  const thisMonthExp=txns.filter(t=>t.type==="expense"&&t.date.startsWith(ym)).reduce((s,t)=>s+t.amount,0);
  const lastMonthExp=txns.filter(t=>t.type==="expense"&&t.date.startsWith(lastYm)).reduce((s,t)=>s+t.amount,0);
  if(lastMonthExp>0&&thisMonthExp>0){
    const diff=((thisMonthExp-lastMonthExp)/lastMonthExp)*100;
    if(Math.abs(diff)>=15){
      insights.push({priority:60,emoji:diff>0?"⚠️":"✨",text:`เดือนนี้ใช้${diff>0?"มากกว่า":"น้อยกว่า"}เดือนก่อน ${Math.abs(diff).toFixed(0)}%`,sub:`฿${Math.round(thisMonthExp).toLocaleString()} vs ฿${Math.round(lastMonthExp).toLocaleString()}`});
    }
  }

  // Goal close to completion
  const closestGoal=(data.goals||[]).map(g=>({...g,pct:g.target>0?(g.saved/g.target)*100:0})).filter(g=>g.pct>=80&&g.pct<100).sort((a,b)=>b.pct-a.pct)[0];
  if(closestGoal){
    insights.push({priority:75,emoji:"🎯",text:`เป้าหมาย "${closestGoal.name}" ใกล้สำเร็จแล้ว!`,sub:`เหลืออีก ฿${Math.round(closestGoal.target-closestGoal.saved).toLocaleString()} (${Math.round(closestGoal.pct)}%)`});
  }

  // Subscription due today
  const today2=new Date(today+"T00:00:00");
  const dueToday=(data.recurring||[]).filter(r=>r.active&&r.type==="expense"&&Math.min(+r.dayOfMonth||1,28)===today2.getDate());
  if(dueToday.length>0){
    insights.push({priority:65,emoji:"⏰",text:`Subscription ตัดวันนี้`,sub:dueToday.map(r=>`${r.name} ฿${(+r.amount).toLocaleString()}`).join(" · ")});
  }

  // Big expense yesterday
  const yesterday=addDays(today,-1);
  const yExp=txns.filter(t=>t.type==="expense"&&t.date===yesterday).reduce((s,t)=>s+t.amount,0);
  if(yExp>avgDaily*2&&avgDaily>100){
    insights.push({priority:40,emoji:"💸",text:`เมื่อวานใช้เยอะ`,sub:`฿${Math.round(yExp).toLocaleString()} — มีงาน special?`});
  }

  // First-time / Empty state
  if(txns.length===0){
    insights.push({priority:100,emoji:"👋",text:`ยินดีต้อนรับ!`,sub:`เริ่มบันทึกรายการแรก กด ⊕ ตรงกลางได้เลย`});
  }

  // No insight applicable → fallback motivational
  if(insights.length===0){
    insights.push({priority:10,emoji:"🌟",text:`คุณจัดการการเงินได้ดี`,sub:`รักษานิสัยนี้ไว้ ทุกวันคือก้าวเล็กๆ สู่อิสรภาพการเงิน`});
  }

  insights.sort((a,b)=>b.priority-a.priority);
  return insights[0];
}

/* ═══ TXN → CASH FLOW DETAIL (CFD) MAPPER ═══
 * Maps a transaction into one of CFD's 4 sections (inflow/fixed/variable/saving).
 * Income with goalId → also counted as 'saving' (allocated money).
 *
 * Section logic:
 *  - INCOME → inflow (salary/dividend/otherInc by category)
 *  - EXPENSE w/ recurringId or matching name (loan/insurance/PVD) → FIXED
 *  - EXPENSE otherwise → VARIABLE (mapped by category)
 *  - INCOME w/ goalId → also added to saving */
export function mapTxnToCFD(tx,opts={}){
  const recurringRules=opts.recurringRules||[];
  if(tx.type==="income"){
    const inflowKey=
      tx.category==="salary"||tx.category==="bonus"?"salary":
      tx.category==="interest"?"interest":
      tx.category==="dividend"||tx.category==="investment"?"dividend":
      "otherInc";
    return{section:"inflow",key:inflowKey,alsoSaving:tx.goalId?"save":null};
  }
  // Expense — use category first (explicit user choice), fallback to keyword matching
  const cat=tx.category;
  // 💰 Saving categories
  if(cat==="save")return{section:"saving",key:"save"};
  if(cat==="invest")return{section:"saving",key:"invest"};
  // 🏠 Fixed categories (explicit)
  if(cat==="rent")return{section:"fixed",key:"rent"};
  if(cat==="loan")return{section:"fixed",key:"debtPay"};
  if(cat==="insurance")return{section:"fixed",key:"lifeIns"};
  // 💸 Variable categories (explicit)
  if(cat==="food")return{section:"variable",key:"food"};
  if(cat==="transport")return{section:"variable",key:"travel"};
  if(cat==="shopping")return{section:"variable",key:"cloth"};
  if(cat==="entertainment")return{section:"variable",key:"enter"};
  if(cat==="education")return{section:"variable",key:"child"};
  if(cat==="travel")return{section:"variable",key:"travel"};
  if(cat==="tax")return{section:"variable",key:"tax"};
  if(cat==="phone")return{section:"variable",key:"phone"};
  if(cat==="bills"){
    const note=(tx.note||"").toLowerCase();
    if(/phone|โทร|เบอร์|เน็ต|internet|wifi/i.test(note))return{section:"variable",key:"phone"};
    return{section:"variable",key:"util"};
  }
  if(cat==="health")return{section:"variable",key:"otherExp"};
  // Fallback: recurring without explicit category → fixed
  const ruleId=tx.recurringId;
  const rule=ruleId?recurringRules.find(r=>r.id===ruleId):null;
  const ruleName=(rule?.name||tx.note||"").toLowerCase();
  const isFixed=!!rule||/ผ่อน|loan|หนี้|debt|ประกัน|insurance|ประกันสังคม|pvd|สำรองเลี้ยง|ค่าเช่า|rent/i.test(ruleName);
  if(isFixed){
    if(/ค่าเช่า|rent|ห้อง|หอ/i.test(ruleName))return{section:"fixed",key:"rent"};
    if(/ประกันสังคม|social\s?sec/i.test(ruleName))return{section:"fixed",key:"socSec"};
    if(/pvd|สำรองเลี้ยง|provident/i.test(ruleName))return{section:"fixed",key:"provFund"};
    if(/ประกัน(?!สัง)|insurance|life\s?ins/i.test(ruleName))return{section:"fixed",key:"lifeIns"};
    return{section:"fixed",key:"debtPay"};
  }
  return{section:"variable",key:"otherExp"};
}

/* Aggregate actual cash flow from txns into the CFD structure.
 * Returns {inflow:{...}, fixed:{...}, variable:{...}, saving:{...}}
 * with the same key shape as data.cashFlow.[period].[key] used by CFD page. */
export function aggregateActualCF(txns,recurringRules=[]){
  const result={
    inflow:{salary:0,interest:0,dividend:0,otherInc:0},
    fixed:{rent:0,debtPay:0,lifeIns:0,socSec:0,provFund:0},
    variable:{food:0,phone:0,util:0,enter:0,tax:0,travel:0,cloth:0,child:0,otherExp:0},
    saving:{save:0,invest:0},
  };
  (txns||[]).forEach(tx=>{
    const m=mapTxnToCFD(tx,{recurringRules});
    if(m.section&&result[m.section]&&m.key in result[m.section]){
      result[m.section][m.key]+=(+tx.amount||0);
    }
    if(m.alsoSaving&&result.saving[m.alsoSaving]!==undefined){
      result.saving[m.alsoSaving]+=(+tx.amount||0);
    }
  });
  return result;
}

/* Today as `YYYY-MM-DD` (timezone-aware: Bangkok = UTC+7) */
export const td=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Bangkok"});

/* Convert any Date object to `YYYY-MM-DD` in Bangkok timezone.
 * Use this anywhere you'd reach for `d.toISOString().slice(0,10)` — that
 * one gives UTC date and breaks past 17:00 UTC (= midnight BKK). */
export const tdBkk=d=>(d instanceof Date?d:new Date(d)).toLocaleDateString("en-CA",{timeZone:"Asia/Bangkok"});

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
      taxYear:{...DF.taxYear,...(d.taxYear||{}),deductions:{...DF.taxYear.deductions,...(d.taxYear?.deductions||{})}},
      insights:{...DF.insights,...(d.insights||{})},
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

/* ═══ INSIGHTS HELPERS ═══
 * Pure analytics — no side effects. Used by Smart Insights cards. */

/* ISO week key — "2026-W17" — used as dedupe key for weekly review */
export function isoWeekKey(dateStr){
  const d=new Date(dateStr+"T12:00:00");
  const day=d.getUTCDay()||7;
  d.setUTCDate(d.getUTCDate()+4-day); // Thursday of this week
  const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNum=Math.ceil((((d-yearStart)/86400000)+1)/7);
  return`${d.getUTCFullYear()}-W${String(weekNum).padStart(2,"0")}`;
}

/* Get start (Mon) and end (Sun) dates for the week containing dateStr */
export function weekRange(dateStr){
  const d=new Date(dateStr+"T00:00:00");
  const day=d.getDay()||7; // Mon=1..Sun=7
  const monday=addDays(dateStr,-(day-1));
  const sunday=addDays(monday,6);
  return{from:monday,to:sunday};
}

/* Summarize transactions in [from, to] inclusive — returns totals & top */
export function summarizeRange(txns,from,to){
  const inRange=(txns||[]).filter(t=>t.date>=from&&t.date<=to);
  const expenses=inRange.filter(t=>t.type==="expense");
  const income=inRange.filter(t=>t.type==="income");
  const totalExp=expenses.reduce((s,t)=>s+t.amount,0);
  const totalInc=income.reduce((s,t)=>s+t.amount,0);
  const byCat={};
  expenses.forEach(t=>{byCat[t.category]=(byCat[t.category]||0)+t.amount});
  const topCat=Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0]||null;
  const topTxn=expenses.sort((a,b)=>b.amount-a.amount)[0]||null;
  return{count:inRange.length,totalExp,totalInc,net:totalInc-totalExp,byCat,topCat,topTxn};
}

/* Project end-of-month total expense based on current run-rate */
export function projectEOM(txns,today){
  const tm=today.slice(0,7);
  const day=+today.slice(8,10);
  const lastDay=new Date(+today.slice(0,4),+today.slice(5,7),0).getDate();
  const monthTxns=(txns||[]).filter(t=>t.type==="expense"&&t.date.startsWith(tm));
  const monthIncome=(txns||[]).filter(t=>t.type==="income"&&t.date.startsWith(tm)).reduce((s,t)=>s+t.amount,0);
  const monthSpent=monthTxns.reduce((s,t)=>s+t.amount,0);
  if(day<3)return null; // not enough data
  const avgDaily=monthSpent/day;
  const projectedSpent=Math.round(monthSpent+avgDaily*(lastDay-day));
  return{
    daysIn:day,
    daysLeft:lastDay-day,
    monthSpent,
    monthIncome,
    avgDaily:Math.round(avgDaily),
    projectedSpent,
    projectedNet:monthIncome-projectedSpent,
  };
}

/* Compare expense-by-category for this month vs avg of N prior months
 * Returns sorted array of {cat, current, avg, deltaPct, dir} */
export function compareCategorySpend(txns,today,priorMonths=6){
  const tm=today.slice(0,7);
  const cur={};
  const past={}; // sum across months
  const monthsSeen=new Set();
  (txns||[]).forEach(t=>{
    if(t.type!=="expense")return;
    const m=t.date.slice(0,7);
    if(m===tm){cur[t.category]=(cur[t.category]||0)+t.amount;return}
    // Check if within priorMonths window
    const [yy,mm]=t.date.slice(0,7).split("-").map(Number);
    const [cyy,cmm]=tm.split("-").map(Number);
    const monthsDiff=(cyy-yy)*12+(cmm-mm);
    if(monthsDiff>0&&monthsDiff<=priorMonths){
      monthsSeen.add(m);
      past[t.category]=(past[t.category]||0)+t.amount;
    }
  });
  const monthCount=monthsSeen.size||1;
  const allCats=new Set([...Object.keys(cur),...Object.keys(past)]);
  return[...allCats].map(c=>{
    const current=cur[c]||0;
    const avg=(past[c]||0)/monthCount;
    const deltaPct=avg>0?((current-avg)/avg)*100:(current>0?100:0);
    return{cat:c,current,avg:Math.round(avg),deltaPct:Math.round(deltaPct),dir:deltaPct>0?"up":deltaPct<0?"down":"flat"};
  }).filter(x=>x.current>0||x.avg>0).sort((a,b)=>b.current-a.current);
}
