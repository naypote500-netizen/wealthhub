import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, LineChart, Line, Legend } from "recharts";

/* ═══ THEME ═══ */
const L={bg:"#F4F6F9",sidebar:"#0F1B2D",sidebarText:"#8899AA",sidebarActive:"#38BDF8",card:"#FFFFFF",cb:"#E2E8F0",text:"#1E293B",ts:"#64748B",tm:"#94A3B8",ac:"#0EA5E9",acL:"#E0F2FE",g:"#10B981",gL:"#D1FAE5",r:"#EF4444",rL:"#FEE2E2",am:"#F59E0B",amL:"#FEF3C7",tl:"#14B8A6",pp:"#8B5CF6",ib:"#FFFFFF",ibr:"#CBD5E1",thBg:"#F8FAFC"};
const Dk={bg:"#0B1120",sidebar:"#060D1B",sidebarText:"#4B6584",sidebarActive:"#38BDF8",card:"#111827",cb:"#1E293B",text:"#E2E8F0",ts:"#94A3B8",tm:"#475569",ac:"#38BDF8",acL:"#0C2D48",g:"#34D399",gL:"#064E3B",r:"#F87171",rL:"#450A0A",am:"#FBBF24",amL:"#451A03",tl:"#2DD4BF",pp:"#A78BFA",ib:"#1E293B",ibr:"#334155",thBg:"#0F172A"};
const PC=["#0EA5E9","#10B981","#F59E0B","#8B5CF6","#EF4444","#14B8A6","#EC4899","#6366F1","#F97316"];

const AT=[{v:"stock_th",l:"หุ้นไทย",i:"📊"},{v:"stock_us",l:"หุ้น US",i:"🇺🇸"},{v:"crypto",l:"Crypto",i:"₿"},{v:"gold",l:"ทองคำ",i:"🥇"},{v:"fund",l:"กองทุนรวม",i:"📈"},{v:"bond",l:"พันธบัตร",i:"🏦"},{v:"property",l:"อสังหาฯ",i:"🏠"},{v:"other",l:"อื่นๆ",i:"💼"}];
const EC=[{v:"food",l:"อาหาร",i:"🍜"},{v:"transport",l:"เดินทาง",i:"🚗"},{v:"shopping",l:"ช้อปปิ้ง",i:"🛍️"},{v:"bills",l:"ค่าบิล",i:"💡"},{v:"health",l:"สุขภาพ",i:"💊"},{v:"entertainment",l:"บันเทิง",i:"🎬"},{v:"education",l:"การศึกษา",i:"📚"},{v:"other",l:"อื่นๆ",i:"📦"}];
const IC=[{v:"salary",l:"เงินเดือน",i:"💰"},{v:"freelance",l:"ฟรีแลนซ์",i:"💻"},{v:"investment",l:"ผลตอบแทนลงทุน",i:"📈"},{v:"bonus",l:"โบนัส",i:"🎁"},{v:"other",l:"อื่นๆ",i:"📦"}];

const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const fB=n=>`฿${Math.abs(n).toLocaleString("th-TH",{maximumFractionDigits:0})}`;
const fP=n=>`${n>=0?"+":""}${n.toFixed(1)}%`;
const td=()=>new Date().toISOString().slice(0,10);
const mk=d=>d.slice(0,7);
const fm=d=>new Date(d+"-01").toLocaleDateString("th-TH",{month:"short",year:"2-digit"});

const SK="wealthhub-v6";const OSK="wealthhub-v5";
const DF={assets:[],transactions:[],goals:[],debts:[],recurring:[],budgets:{},balanceSheet:{cash:0,savings:0,car:0,house:0,otherAssets:0,creditCard:0,carLoan:0,homeLoan:0,otherLiab:0},settings:{rate:35.5}};
function ld(){try{const r=localStorage.getItem(SK)||localStorage.getItem(OSK);if(!r)return null;const d=JSON.parse(r);return{...DF,...d,balanceSheet:{...DF.balanceSheet,...(d.balanceSheet||{})},settings:{...DF.settings,...(d.settings||{})},recurring:d.recurring||[],budgets:d.budgets||{}}}catch{return null}}
function sv(d){try{localStorage.setItem(SK,JSON.stringify(d))}catch(e){console.error(e)}}

/* Process recurring: generate txn for current month if day-of-month has passed and not yet run this month */
function processRecurring(data){
  if(!data.recurring?.length)return data;
  const today=new Date();const curDay=today.getDate();const curMonth=mk(td());
  const newTxns=[];
  const updated=data.recurring.map(r=>{
    if(!r.active)return r;
    if(r.lastRun===curMonth)return r;
    if(curDay<(r.dayOfMonth||1))return r;
    const day=Math.min(r.dayOfMonth||1,28);
    const date=`${curMonth}-${String(day).padStart(2,"0")}`;
    newTxns.push({id:uid(),type:r.type,category:r.category,amount:+r.amount,date,note:(r.name||"รายการประจำ")+" (auto)",recurringId:r.id});
    return{...r,lastRun:curMonth};
  });
  if(!newTxns.length)return data;
  return{...data,transactions:[...data.transactions,...newTxns],recurring:updated};
}

/* ═══ NAV ═══ */
const NAV=[
  {k:"dashboard",l:"Dashboard",i:"⬡",g:"ภาพรวม"},{k:"portfolio",l:"พอร์ตลงทุน",i:"◈",g:"ภาพรวม"},{k:"txn",l:"รายรับ-รายจ่าย",i:"⇄",g:"ภาพรวม"},{k:"recurring",l:"รายการประจำ",i:"↻",g:"ภาพรวม"},{k:"budget",l:"งบประมาณ",i:"⊡",g:"ภาพรวม"},
  {k:"balance",l:"งบดุลส่วนบุคคล",i:"☷",g:"การเงิน"},{k:"cashflow",l:"งบกระแสเงินสด",i:"≋",g:"การเงิน"},
  {k:"goals",l:"เป้าหมาย",i:"◎",g:"วางแผน"},{k:"debts",l:"หนี้สิน",i:"▤",g:"วางแผน"},{k:"dca",l:"คำนวณ DCA",i:"⟳",g:"เครื่องมือ"},{k:"retire",l:"วางแผนเกษียณ",i:"☰",g:"เครื่องมือ"},{k:"plan",l:"สุขภาพการเงิน",i:"⊞",g:"เครื่องมือ"},{k:"reports",l:"รายงาน & PDF",i:"▥",g:"รายงาน"},
];

/* ═══ COMPONENTS ═══ */
function Sidebar({page,setPage,dark,setDark,t}){
  const groups=[...new Set(NAV.map(n=>n.g))];
  return(<div style={{width:220,minHeight:"100vh",background:t.sidebar,padding:"16px 0",display:"flex",flexDirection:"column",position:"fixed",left:0,top:0,zIndex:100,borderRight:`1px solid ${dark?"#1E293B":"#1a2744"}`,overflowY:"auto"}}>
    <div style={{padding:"0 20px 16px",borderBottom:`1px solid ${dark?"#1E293B":"#1a2744"}`}}>
      <div style={{fontSize:19,fontWeight:600}}><span style={{color:t.ac}}>Wealth</span><span style={{color:t.sidebarText}}>Hub</span></div>
      <div style={{fontSize:9,color:t.sidebarText,marginTop:2}}>ระบบจัดการการเงินส่วนบุคคล</div>
    </div>
    <div style={{padding:"10px 10px",flex:1}}>
      {groups.map(g=>(<div key={g}>
        <div style={{fontSize:9,color:t.sidebarText,textTransform:"uppercase",letterSpacing:1.2,padding:"10px 8px 4px",fontWeight:600}}>{g}</div>
        {NAV.filter(n=>n.g===g).map(n=>(<button key={n.k} onClick={()=>setPage(n.k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",borderRadius:7,cursor:"pointer",marginBottom:1,fontSize:12,background:page===n.k?(dark?"#1E293B":"#162035"):"transparent",color:page===n.k?t.sidebarActive:t.sidebarText,fontWeight:page===n.k?500:400,borderLeft:page===n.k?`3px solid ${t.ac}`:"3px solid transparent"}}><span style={{fontSize:13,width:16,textAlign:"center"}}>{n.i}</span>{n.l}</button>))}
      </div>))}
    </div>
    <div style={{padding:"10px 20px",borderTop:`1px solid ${dark?"#1E293B":"#1a2744"}`}}>
      <button onClick={()=>setDark(!dark)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",color:t.sidebarText,cursor:"pointer",fontSize:11,padding:0}}><span style={{fontSize:14}}>{dark?"☀️":"🌙"}</span>{dark?"Light":"Dark"} Mode</button>
    </div>
  </div>);
}

function MC({icon,label,value,sub,color,t}){return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:"14px 16px",flex:"1 1 140px",minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><div style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:color?`${color}18`:t.acL,fontSize:14}}>{icon}</div><span style={{fontSize:11,color:t.ts}}>{label}</span></div><div style={{fontSize:19,fontWeight:600,color:color||t.text,letterSpacing:-0.5}}>{value}</div>{sub&&<div style={{fontSize:10,color:color||t.tm,marginTop:1}}>{sub}</div>}</div>)}

function Modal({open,onClose,title,children,t,w}){if(!open)return null;return(<div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:16}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:14,padding:22,width:"100%",maxWidth:w||440,maxHeight:"85vh",overflowY:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{margin:0,fontSize:16,fontWeight:600,color:t.text}}>{title}</h3><button onClick={onClose} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:t.tm}}>✕</button></div>{children}</div></div>)}

function Btn({children,onClick,primary,danger,small,disabled,t,style:s}){return<button onClick={disabled?undefined:onClick} style={{padding:small?"5px 12px":"8px 18px",fontSize:small?11:13,fontWeight:500,cursor:disabled?"not-allowed":"pointer",borderRadius:8,border:"none",opacity:disabled?0.5:1,...(primary?{background:t.ac,color:"#fff"}:danger?{background:t.r,color:"#fff"}:{background:"transparent",border:`1px solid ${t.cb}`,color:t.ts}),...s}}>{children}</button>}

function Empty({icon,title,sub,action,onAction,t}){return(<div style={{textAlign:"center",padding:"40px 20px",color:t.ts}}><div style={{fontSize:40,marginBottom:10,opacity:0.4}}>{icon}</div><div style={{fontSize:15,fontWeight:500,color:t.text,marginBottom:4}}>{title}</div><div style={{fontSize:12,marginBottom:16}}>{sub}</div>{action&&<Btn primary t={t} onClick={onAction}>{action}</Btn>}</div>)}

function PB({pct,color,height,t}){return(<div style={{height:height||6,borderRadius:99,background:t.cb,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,pct))}%`,background:color||t.ac,borderRadius:99,transition:"width .5s ease"}}/></div>)}

function Badge({children,color}){return<span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:`${color}20`,color,fontWeight:500}}>{children}</span>}

function Inp({label,t,...p}){return(<label style={{fontSize:11,color:t.ts,display:"block"}}>{label}<input {...p} style={{width:"100%",marginTop:2,padding:"8px 10px",borderRadius:7,border:`1px solid ${t.ibr}`,fontSize:12,background:t.ib,color:t.text,boxSizing:"border-box",outline:"none",...p.style}}/></label>)}

function Sel({label,children,t,...p}){return(<label style={{fontSize:11,color:t.ts,display:"block"}}>{label}<select {...p} style={{width:"100%",marginTop:2,padding:"8px 10px",borderRadius:7,border:`1px solid ${t.ibr}`,fontSize:12,background:t.ib,color:t.text,boxSizing:"border-box",...p.style}}>{children}</select></label>)}

function useF(ini){const[f,setF]=useState(ini);const set=(k,v)=>setF(p=>({...p,[k]:v}));return[f,set,setF]}

/* ═══ BALANCE SHEET (งบดุลส่วนบุคคล) ═══ */
function BalancePage({data,stats,persist,t}){
  const bs=data.balanceSheet||{};
  const set=(k,v)=>persist({...data,balanceSheet:{...bs,[k]:+v||0}});

  const investmentAssets=stats.totalPortfolio||0;
  const goalSavings=stats.totalGoalSaved||0;

  const totalAssets=(bs.cash||0)+(bs.savings||0)+investmentAssets+goalSavings+(bs.car||0)+(bs.house||0)+(bs.otherAssets||0);
  const totalLiab=(bs.creditCard||0)+(bs.carLoan||0)+(bs.homeLoan||0)+(bs.otherLiab||0)+stats.debtRemaining;
  const netWorth=totalAssets-totalLiab;

  const assetItems=[
    {label:"เงินสด / กระเป๋าเงิน",key:"cash",val:bs.cash||0,edit:true,icon:"💵"},
    {label:"เงินฝากธนาคาร",key:"savings",val:bs.savings||0,edit:true,icon:"🏦"},
    {label:"พอร์ตลงทุน (จากข้อมูลพอร์ต)",val:investmentAssets,edit:false,icon:"📈",auto:true},
    {label:"เงินออมตามเป้าหมาย",val:goalSavings,edit:false,icon:"🎯",auto:true},
    {label:"รถยนต์ (มูลค่าปัจจุบัน)",key:"car",val:bs.car||0,edit:true,icon:"🚗"},
    {label:"บ้าน/คอนโด (มูลค่าปัจจุบัน)",key:"house",val:bs.house||0,edit:true,icon:"🏠"},
    {label:"สินทรัพย์อื่นๆ",key:"otherAssets",val:bs.otherAssets||0,edit:true,icon:"📦"},
  ];

  const liabItems=[
    {label:"หนี้บัตรเครดิต",key:"creditCard",val:bs.creditCard||0,edit:true,icon:"💳"},
    {label:"สินเชื่อรถยนต์",key:"carLoan",val:bs.carLoan||0,edit:true,icon:"🚗"},
    {label:"สินเชื่อบ้าน",key:"homeLoan",val:bs.homeLoan||0,edit:true,icon:"🏠"},
    {label:"หนี้อื่นๆ (จากหน้าหนี้สิน)",val:stats.debtRemaining,edit:false,icon:"📋",auto:true},
    {label:"หนี้สินอื่นๆ",key:"otherLiab",val:bs.otherLiab||0,edit:true,icon:"📦"},
  ];

  const pieData=[{name:"สินทรัพย์",value:totalAssets,color:t.g},{name:"หนี้สิน",value:totalLiab,color:t.r}];

  return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💎" label="สินทรัพย์รวม" value={fB(totalAssets)} t={t} color={t.g}/>
      <MC icon="💳" label="หนี้สินรวม" value={fB(totalLiab)} t={t} color={t.r}/>
      <MC icon="👑" label="ความมั่งคั่งสุทธิ (Net Worth)" value={fB(netWorth)} t={t} color={netWorth>=0?t.ac:t.r} sub={totalAssets>0?`หนี้/สินทรัพย์ = ${(totalLiab/totalAssets*100).toFixed(1)}%`:""}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr) minmax(0,auto)",gap:16}}>
      {/* สินทรัพย์ */}
      <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
        <div style={{fontSize:14,fontWeight:600,color:t.g,marginBottom:12}}>📗 สินทรัพย์ (Assets)</div>
        {assetItems.map((it,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<assetItems.length-1?`1px solid ${t.cb}`:"none",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}>
            <span style={{fontSize:13}}>{it.icon}</span>
            <span style={{fontSize:12,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.label}</span>
            {it.auto&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:t.acL,color:t.ac}}>auto</span>}
          </div>
          {it.edit?<input type="number" value={it.val||""} onChange={e=>set(it.key,e.target.value)} style={{width:100,padding:"5px 8px",borderRadius:6,border:`1px solid ${t.ibr}`,fontSize:12,background:t.ib,color:t.text,textAlign:"right"}}/>
          :<span style={{fontSize:12,fontWeight:500,color:t.g,minWidth:80,textAlign:"right"}}>{fB(it.val)}</span>}
        </div>))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",borderTop:`2px solid ${t.g}`,marginTop:8}}>
          <span style={{fontSize:13,fontWeight:600,color:t.g}}>รวมสินทรัพย์</span>
          <span style={{fontSize:15,fontWeight:600,color:t.g}}>{fB(totalAssets)}</span>
        </div>
      </div>

      {/* หนี้สิน */}
      <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
        <div style={{fontSize:14,fontWeight:600,color:t.r,marginBottom:12}}>📕 หนี้สิน (Liabilities)</div>
        {liabItems.map((it,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<liabItems.length-1?`1px solid ${t.cb}`:"none",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}>
            <span style={{fontSize:13}}>{it.icon}</span>
            <span style={{fontSize:12,color:t.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.label}</span>
            {it.auto&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:t.rL,color:t.r}}>auto</span>}
          </div>
          {it.edit?<input type="number" value={it.val||""} onChange={e=>set(it.key,e.target.value)} style={{width:100,padding:"5px 8px",borderRadius:6,border:`1px solid ${t.ibr}`,fontSize:12,background:t.ib,color:t.text,textAlign:"right"}}/>
          :<span style={{fontSize:12,fontWeight:500,color:t.r,minWidth:80,textAlign:"right"}}>{fB(it.val)}</span>}
        </div>))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",borderTop:`2px solid ${t.r}`,marginTop:8}}>
          <span style={{fontSize:13,fontWeight:600,color:t.r}}>รวมหนี้สิน</span>
          <span style={{fontSize:15,fontWeight:600,color:t.r}}>{fB(totalLiab)}</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18,minWidth:200}}>
        <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>สัดส่วน</div>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={v=>fB(v)} contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:8}}/></PieChart>
        </ResponsiveContainer>
        <div style={{textAlign:"center",marginTop:8}}>
          <div style={{fontSize:11,color:t.tm}}>Net Worth</div>
          <div style={{fontSize:20,fontWeight:600,color:netWorth>=0?t.ac:t.r}}>{fB(netWorth)}</div>
        </div>
      </div>
    </div>

    <div style={{fontSize:10,color:t.tm,textAlign:"center"}}>* ข้อมูลพอร์ตลงทุนและหนี้สินจากหน้าอื่นจะถูกรวมอัตโนมัติ กรอกเฉพาะรายการที่ไม่ได้อยู่ในระบบ</div>
  </div>);
}

/* ═══ CASH FLOW STATEMENT (งบกระแสเงินสด) ═══ */
function CashFlowPage({data,stats,t}){
  const tm=mk(td());
  const txns=data.transactions.filter(tx=>mk(tx.date)===tm);
  
  // Income breakdown
  const incByCat={};txns.filter(tx=>tx.type==="income").forEach(tx=>{const cat=IC.find(c=>c.v===tx.category)||IC[4];incByCat[cat.l]=(incByCat[cat.l]||0)+tx.amount});
  const incItems=Object.entries(incByCat).sort((a,b)=>b[1]-a[1]);

  // Expense breakdown
  const expByCat={};txns.filter(tx=>tx.type==="expense").forEach(tx=>{const cat=EC.find(c=>c.v===tx.category)||EC[7];expByCat[cat.l]=(expByCat[cat.l]||0)+tx.amount});
  const expItems=Object.entries(expByCat).sort((a,b)=>b[1]-a[1]);

  const totalInc=stats.incomeThisMonth;const totalExp=stats.expenseThisMonth;const netCash=totalInc-totalExp;

  // 6-month trend
  const ms=[];for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);ms.push(mk(d.toISOString().slice(0,10)))}
  const trend=ms.map(m=>{
    const inc=data.transactions.filter(tx=>tx.type==="income"&&mk(tx.date)===m).reduce((s,tx)=>s+tx.amount,0);
    const exp=data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===m).reduce((s,tx)=>s+tx.amount,0);
    return{month:fm(m),income:inc,expense:exp,net:inc-exp};
  });

  const savingRate=totalInc>0?((netCash/totalInc)*100):0;

  return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💵" label="กระแสเงินสดเข้า" value={fB(totalInc)} t={t} color={t.g}/>
      <MC icon="💸" label="กระแสเงินสดออก" value={fB(totalExp)} t={t} color={t.r}/>
      <MC icon="💰" label="กระแสเงินสดสุทธิ" value={`${netCash>=0?"+":"-"}${fB(netCash)}`} t={t} color={netCash>=0?t.g:t.r}/>
      <MC icon="📊" label="อัตราการออม" value={`${savingRate.toFixed(1)}%`} sub={savingRate>=20?"ดีมาก":savingRate>=10?"พอใช้":"ควรปรับปรุง"} t={t} color={savingRate>=20?t.g:savingRate>=10?t.am:t.r}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:16}}>
      {/* กระแสเงินสดเข้า */}
      <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
        <div style={{fontSize:14,fontWeight:600,color:t.g,marginBottom:12}}>⬆️ กระแสเงินสดเข้า (เดือนนี้)</div>
        {incItems.length===0?<div style={{fontSize:12,color:t.tm,padding:16,textAlign:"center"}}>ยังไม่มีรายการ</div>:
          incItems.map(([name,val],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<incItems.length-1?`1px solid ${t.cb}`:"none"}}>
            <span style={{fontSize:12,color:t.text}}>{name}</span>
            <span style={{fontSize:13,fontWeight:500,color:t.g}}>+{fB(val)}</span>
          </div>))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",borderTop:`2px solid ${t.g}`,marginTop:8}}>
          <span style={{fontSize:13,fontWeight:600}}>รวมรายรับ</span>
          <span style={{fontSize:14,fontWeight:600,color:t.g}}>{fB(totalInc)}</span>
        </div>
      </div>

      {/* กระแสเงินสดออก */}
      <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
        <div style={{fontSize:14,fontWeight:600,color:t.r,marginBottom:12}}>⬇️ กระแสเงินสดออก (เดือนนี้)</div>
        {expItems.length===0?<div style={{fontSize:12,color:t.tm,padding:16,textAlign:"center"}}>ยังไม่มีรายการ</div>:
          expItems.map(([name,val],i)=>{const pct=totalExp>0?(val/totalExp*100):0;return(<div key={i} style={{padding:"8px 0",borderBottom:i<expItems.length-1?`1px solid ${t.cb}`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:t.text}}>{name}</span>
              <span style={{fontSize:12,fontWeight:500,color:t.r}}>-{fB(val)} ({Math.round(pct)}%)</span>
            </div>
            <PB pct={pct} color={t.r} height={3} t={t}/>
          </div>)})}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",borderTop:`2px solid ${t.r}`,marginTop:8}}>
          <span style={{fontSize:13,fontWeight:600}}>รวมรายจ่าย</span>
          <span style={{fontSize:14,fontWeight:600,color:t.r}}>{fB(totalExp)}</span>
        </div>
      </div>
    </div>

    {/* Trend chart */}
    {trend.some(m=>m.income||m.expense)&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>📈 แนวโน้มกระแสเงินสด (6 เดือน)</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={trend} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.cb}/>
          <XAxis dataKey="month" tick={{fontSize:10,fill:t.tm}}/>
          <YAxis tick={{fontSize:10,fill:t.tm}} tickFormatter={v=>v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/>
          <Tooltip formatter={v=>fB(v)} contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:8}}/>
          <Bar dataKey="income" name="รายรับ" fill={t.g} radius={[4,4,0,0]}/>
          <Bar dataKey="expense" name="รายจ่าย" fill={t.r} radius={[4,4,0,0]}/>
          <Line type="monotone" dataKey="net" name="สุทธิ" stroke={t.ac} strokeWidth={2}/>
          <Legend/>
        </BarChart>
      </ResponsiveContainer>
    </div>)}

    {/* Net Cash Flow box */}
    <div style={{background:netCash>=0?`${t.g}08`:`${t.r}08`,border:`1px solid ${netCash>=0?`${t.g}30`:`${t.r}30`}`,borderRadius:12,padding:20,textAlign:"center"}}>
      <div style={{fontSize:13,color:t.ts}}>กระแสเงินสดสุทธิเดือนนี้</div>
      <div style={{fontSize:28,fontWeight:600,color:netCash>=0?t.g:t.r,margin:"4px 0"}}>{netCash>=0?"+":"-"}{fB(netCash)}</div>
      <div style={{fontSize:11,color:t.tm}}>{netCash>=0?"เงินสดไหลเข้ามากกว่าออก — ดี!":"เงินสดไหลออกมากกว่าเข้า — ควรลดรายจ่าย"}</div>
    </div>
  </div>);
}

/* ═══ DCA ═══ */
function DCAPage({t}){
  const[f,set]=useF({amount:"10000",months:"60",returnRate:"8",name:"กองทุนหุ้น"});
  const data=useMemo(()=>{const a=+f.amount,m=+f.months,r=+f.returnRate/100/12;if(!a||!m)return{total:0,invested:0,profit:0,chart:[]};let bal=0;const chart=[];for(let i=1;i<=m;i++){bal=(bal+a)*(1+r);if(i%6===0||i===m)chart.push({month:i,value:Math.round(bal),invested:a*i})}return{total:Math.round(bal),invested:a*m,profit:Math.round(bal-a*m),chart}},[f]);
  return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:20}}>
    <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>⟳ คำนวณ DCA</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
      <Inp label="ชื่อหุ้น/กองทุน" t={t} value={f.name} onChange={e=>set("name",e.target.value)}/>
      <Inp label="เงินลงทุน/เดือน (฿)" t={t} type="number" value={f.amount} onChange={e=>set("amount",e.target.value)}/>
      <Inp label="จำนวนเดือน" t={t} type="number" value={f.months} onChange={e=>set("months",e.target.value)}/>
      <Inp label="ผลตอบแทน (%/ปี)" t={t} type="number" step="0.5" value={f.returnRate} onChange={e=>set("returnRate",e.target.value)}/>
    </div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}><MC icon="💰" label="ลงทุนรวม" value={fB(data.invested)} t={t}/><MC icon="📈" label="มูลค่าคาดการณ์" value={fB(data.total)} t={t} color={t.ac}/><MC icon="🎯" label="กำไรคาดการณ์" value={fB(data.profit)} sub={data.invested>0?fP(data.profit/data.invested*100):""} t={t} color={t.g}/></div>
    {data.chart.length>0&&(<ResponsiveContainer width="100%" height={220}><AreaChart data={data.chart}><defs><linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.ac} stopOpacity={0.3}/><stop offset="95%" stopColor={t.ac} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={t.cb}/><XAxis dataKey="month" tick={{fontSize:10,fill:t.tm}}/><YAxis tick={{fontSize:10,fill:t.tm}} tickFormatter={v=>v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/><Tooltip formatter={v=>fB(v)} contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:8}}/><Area type="monotone" dataKey="value" stroke={t.ac} fill="url(#gD)" strokeWidth={2} name="มูลค่า"/><Line type="monotone" dataKey="invested" stroke={t.tm} strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="เงินลงทุน"/><Legend/></AreaChart></ResponsiveContainer>)}
  </div>);
}

/* ═══ RETIRE ═══ */
function RetirePage({t}){
  const[f,set]=useF({age:"30",retireAge:"60",lifeExpect:"85",monthlyExpense:"30000",currentSaving:"500000",monthlyInvest:"10000",returnRate:"7",inflationRate:"3"});
  const res=useMemo(()=>{const age=+f.age,ra=+f.retireAge,le=+f.lifeExpect,me=+f.monthlyExpense,cs=+f.currentSaving,mi=+f.monthlyInvest,rr=+f.returnRate/100;if(!age||!ra||!le||!me)return null;const ytr=ra-age;const yir=le-ra;const fe=me*Math.pow(1+(+f.inflationRate/100),ytr);const need=fe*12*yir;let proj=cs;const chart=[];for(let y=0;y<=ytr;y++){chart.push({year:age+y,value:Math.round(proj),needed:Math.round(need)});proj=(proj+mi*12)*(1+rr)}const gap=need-proj;return{ytr,yir,fe:Math.round(fe),need:Math.round(need),proj:Math.round(proj),gap:Math.round(gap),ok:proj>=need,chart}},[f]);
  return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:20}}>
    <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>☰ วางแผนเกษียณ</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
      <Inp label="อายุปัจจุบัน" t={t} type="number" value={f.age} onChange={e=>set("age",e.target.value)}/><Inp label="อายุเกษียณ" t={t} type="number" value={f.retireAge} onChange={e=>set("retireAge",e.target.value)}/><Inp label="อายุคาดหมาย" t={t} type="number" value={f.lifeExpect} onChange={e=>set("lifeExpect",e.target.value)}/><Inp label="ค่าใช้จ่าย/เดือน (฿)" t={t} type="number" value={f.monthlyExpense} onChange={e=>set("monthlyExpense",e.target.value)}/>
      <Inp label="เงินออมปัจจุบัน" t={t} type="number" value={f.currentSaving} onChange={e=>set("currentSaving",e.target.value)}/><Inp label="ลงทุน/เดือน" t={t} type="number" value={f.monthlyInvest} onChange={e=>set("monthlyInvest",e.target.value)}/><Inp label="ผลตอบแทน (%/ปี)" t={t} type="number" step="0.5" value={f.returnRate} onChange={e=>set("returnRate",e.target.value)}/><Inp label="เงินเฟ้อ (%/ปี)" t={t} type="number" step="0.5" value={f.inflationRate} onChange={e=>set("inflationRate",e.target.value)}/>
    </div>
    {res&&(<><div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}><MC icon="📅" label="ปีถึงเกษียณ" value={`${res.ytr} ปี`} t={t}/><MC icon="💸" label="ค่าใช้จ่ายตอนเกษียณ/เดือน" value={fB(res.fe)} t={t} color={t.am}/><MC icon="🎯" label="ต้องมี" value={fB(res.need)} t={t} color={t.r}/><MC icon="📈" label="จะมี (คาดการณ์)" value={fB(res.proj)} t={t} color={res.ok?t.g:t.r}/></div>
    <div style={{padding:14,borderRadius:10,background:res.ok?`${t.g}12`:`${t.r}12`,border:`1px solid ${res.ok?`${t.g}30`:`${t.r}30`}`,marginBottom:16}}><div style={{fontSize:13,fontWeight:600,color:res.ok?t.g:t.r}}>{res.ok?`✅ เงินพอ! เกินมา ${fB(Math.abs(res.gap))}`:`⚠️ ยังขาด ${fB(res.gap)}`}</div></div>
    {res.chart.length>0&&(<ResponsiveContainer width="100%" height={220}><AreaChart data={res.chart}><defs><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.g} stopOpacity={0.3}/><stop offset="95%" stopColor={t.g} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={t.cb}/><XAxis dataKey="year" tick={{fontSize:10,fill:t.tm}}/><YAxis tick={{fontSize:10,fill:t.tm}} tickFormatter={v=>v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/><Tooltip formatter={v=>fB(v)} contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:8}}/><Area type="monotone" dataKey="value" stroke={t.g} fill="url(#gR)" strokeWidth={2} name="เงินออม"/><Line type="monotone" dataKey="needed" stroke={t.r} strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="เป้า"/><Legend/></AreaChart></ResponsiveContainer>)}</>)}
  </div>);
}

/* ═══ FINANCIAL HEALTH ═══ */
function PlanPage({data,stats,t}){
  const inc=stats.incomeThisMonth||0;const exp=stats.expenseThisMonth||0;const sr=inc>0?((inc-exp)/inc*100):0;
  const ef=exp*6;const ce=data.goals.filter(g=>g.name.includes("ฉุกเฉิน")).reduce((s,g)=>s+g.saved,0);
  const di=inc>0?(stats.debtRemaining/(inc*12)*100):0;
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}><MC icon="💰" label="อัตราการออม" value={`${sr.toFixed(1)}%`} sub={sr>=20?"ดีมาก":sr>=10?"พอใช้":"ปรับปรุง"} t={t} color={sr>=20?t.g:sr>=10?t.am:t.r}/><MC icon="🛡️" label="เงินฉุกเฉิน 6 เดือน" value={fB(ef)} sub={`มี ${fB(ce)}`} t={t} color={ce>=ef?t.g:t.am}/><MC icon="📊" label="หนี้/รายได้ต่อปี" value={`${di.toFixed(1)}%`} t={t} color={di<=30?t.g:di<=50?t.am:t.r}/><MC icon="💎" label="Net Worth" value={fB(stats.netWorth)} t={t} color={t.ac}/></div>
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>📋 เช็คลิสต์สุขภาพการเงิน</div>
      {[{rule:"กฎ 50/30/20",desc:"ออมอย่างน้อย 20%",ok:sr>=20,val:`ออม ${sr.toFixed(0)}%`},{rule:"เงินฉุกเฉิน 6 เดือน",desc:`ควรมี ${fB(ef)}`,ok:ce>=ef,val:`${fB(ce)}`},{rule:"หนี้ไม่เกิน 30%",desc:"ของรายได้ต่อปี",ok:di<=30,val:`${di.toFixed(0)}%`},{rule:"มีพอร์ตลงทุน",desc:"ลงทุนเพื่ออนาคต",ok:stats.totalPortfolio>0,val:stats.totalPortfolio>0?fB(stats.totalPortfolio):"ยังไม่มี"}].map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<3?`1px solid ${t.cb}`:"none"}}>
        <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,background:r.ok?`${t.g}18`:`${t.r}18`,color:r.ok?t.g:t.r,flexShrink:0}}>{r.ok?"✓":"✗"}</div>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{r.rule}</div><div style={{fontSize:10,color:t.tm}}>{r.desc}</div></div>
        <Badge color={r.ok?t.g:t.r}>{r.val}</Badge>
      </div>))}
    </div>
  </div>);
}

/* ═══ FORMS ═══ */
function AssetForm({initial,onSave,onCancel,t,rate}){const[f,set]=useF(initial||{name:"",type:"stock_th",units:"",avgCost:"",currentPrice:"",currency:"THB",note:""});const ok=f.name&&+f.units>0&&+f.avgCost>0&&+f.currentPrice>0;return(<div style={{display:"flex",flexDirection:"column",gap:10}}><Inp label="ชื่อ/Symbol" t={t} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="KBANK, AAPL"/><div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}><Sel label="ประเภท" t={t} value={f.type} onChange={e=>set("type",e.target.value)}>{AT.map(a=><option key={a.v} value={a.v}>{a.i} {a.l}</option>)}</Sel><Sel label="สกุลเงิน" t={t} value={f.currency} onChange={e=>set("currency",e.target.value)}><option value="THB">🇹🇭 THB</option><option value="USD">🇺🇸 USD</option></Sel></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="จำนวน" t={t} type="number" step="any" value={f.units} onChange={e=>set("units",e.target.value)}/><Inp label={`ต้นทุน/หน่วย (${f.currency})`} t={t} type="number" step="any" value={f.avgCost} onChange={e=>set("avgCost",e.target.value)}/></div><Inp label={`ราคาปัจจุบัน/หน่วย (${f.currency})`} t={t} type="number" step="any" value={f.currentPrice} onChange={e=>set("currentPrice",e.target.value)}/>{f.currency==="USD"&&+f.currentPrice>0&&<div style={{fontSize:10,color:t.ac}}>≈ {fB(+f.currentPrice*rate)}/unit</div>}<Inp label="โน้ต" t={t} value={f.note||""} onChange={e=>set("note",e.target.value)}/><div style={{display:"flex",gap:6}}><Btn primary t={t} disabled={!ok} onClick={()=>onSave(f)} style={{flex:1}}>{initial?"💾":"✓ เพิ่ม"}</Btn><Btn t={t} onClick={onCancel}>ยกเลิก</Btn></div></div>)}

function TxnForm({onSave,onCancel,t}){const[f,set]=useF({type:"expense",category:"food",amount:"",date:td(),note:""});const cats=f.type==="income"?IC:EC;const ok=+f.amount>0;return(<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"flex",gap:6}}>{["income","expense"].map(tp=>(<button key={tp} onClick={()=>{set("type",tp);set("category",tp==="income"?"salary":"food")}} style={{flex:1,padding:8,border:f.type===tp?"none":`1px solid ${t.cb}`,borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:500,background:f.type===tp?(tp==="income"?t.g:t.r):"transparent",color:f.type===tp?"#fff":t.ts}}>{tp==="income"?"💵 รายรับ":"💸 รายจ่าย"}</button>))}</div><Sel label="หมวดหมู่" t={t} value={f.category} onChange={e=>set("category",e.target.value)}>{cats.map(c=><option key={c.v} value={c.v}>{c.i} {c.l}</option>)}</Sel><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="จำนวนเงิน (฿)" t={t} type="number" value={f.amount} onChange={e=>set("amount",e.target.value)}/><Inp label="วันที่" t={t} type="date" value={f.date} onChange={e=>set("date",e.target.value)}/></div><Inp label="โน้ต" t={t} value={f.note} onChange={e=>set("note",e.target.value)}/><Btn primary t={t} disabled={!ok} onClick={()=>onSave(f)}>✓ บันทึก</Btn></div>)}

function GoalForm({initial,onSave,onCancel,t}){const[f,set]=useF(initial||{name:"",icon:"🎯",target:"",saved:"0",deadline:""});const ok=f.name&&+f.target>0;return(<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"flex",gap:4}}>{"🎯🏠🚗✈️💍🎓💰🛡️".split("").filter((_,i)=>i%2===0||(i===1)).length&&["🎯","🏠","🚗","✈️","💍","🎓","💰","🛡️"].map(ic=>(<button key={ic} onClick={()=>set("icon",ic)} style={{width:34,height:34,borderRadius:7,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",border:f.icon===ic?`2px solid ${t.ac}`:`1px solid ${t.cb}`,background:f.icon===ic?t.acL:"transparent",cursor:"pointer"}}>{ic}</button>))}</div><Inp label="ชื่อเป้าหมาย" t={t} value={f.name} onChange={e=>set("name",e.target.value)}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="เป้าหมาย (฿)" t={t} type="number" value={f.target} onChange={e=>set("target",e.target.value)}/><Inp label="ออมแล้ว (฿)" t={t} type="number" value={f.saved} onChange={e=>set("saved",e.target.value)}/></div><Inp label="กำหนด" t={t} type="date" value={f.deadline||""} onChange={e=>set("deadline",e.target.value)}/><div style={{display:"flex",gap:6}}><Btn primary t={t} disabled={!ok} onClick={()=>onSave(f)} style={{flex:1}}>{initial?"💾":"✓ สร้าง"}</Btn><Btn t={t} onClick={onCancel}>ยกเลิก</Btn></div></div>)}

function DebtForm({initial,onSave,onCancel,t}){const[f,set]=useF(initial||{name:"",icon:"🏦",total:"",paid:"0",rate:"0"});const ok=f.name&&+f.total>0;return(<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{display:"flex",gap:4}}>{["🏦","💳","🏠","🚗","🎓"].map(ic=>(<button key={ic} onClick={()=>set("icon",ic)} style={{width:34,height:34,borderRadius:7,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",border:f.icon===ic?`2px solid ${t.am}`:`1px solid ${t.cb}`,background:f.icon===ic?t.amL:"transparent",cursor:"pointer"}}>{ic}</button>))}</div><Inp label="ชื่อหนี้" t={t} value={f.name} onChange={e=>set("name",e.target.value)}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="ยอดหนี้ (฿)" t={t} type="number" value={f.total} onChange={e=>set("total",e.target.value)}/><Inp label="จ่ายแล้ว (฿)" t={t} type="number" value={f.paid} onChange={e=>set("paid",e.target.value)}/></div><Inp label="ดอกเบี้ย (%/ปี)" t={t} type="number" step="0.1" value={f.rate} onChange={e=>set("rate",e.target.value)}/><div style={{display:"flex",gap:6}}><Btn primary t={t} disabled={!ok} onClick={()=>onSave(f)} style={{flex:1}}>{initial?"💾":"✓ เพิ่ม"}</Btn><Btn t={t} onClick={onCancel}>ยกเลิก</Btn></div></div>)}

/* ═══ RECURRING FORM & PAGE ═══ */
function RecurringForm({initial,onSave,onCancel,t}){
  const[f,set]=useF(initial||{name:"",type:"expense",category:"food",amount:"",dayOfMonth:"1",active:true});
  const cats=f.type==="income"?IC:EC;const ok=f.name&&+f.amount>0&&+f.dayOfMonth>=1&&+f.dayOfMonth<=31;
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{display:"flex",gap:6}}>{["income","expense"].map(tp=>(<button key={tp} onClick={()=>{set("type",tp);set("category",tp==="income"?"salary":"food")}} style={{flex:1,padding:8,border:f.type===tp?"none":`1px solid ${t.cb}`,borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:500,background:f.type===tp?(tp==="income"?t.g:t.r):"transparent",color:f.type===tp?"#fff":t.ts}}>{tp==="income"?"💵 รายรับประจำ":"💸 รายจ่ายประจำ"}</button>))}</div>
    <Inp label="ชื่อรายการ" t={t} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="เงินเดือน, ค่าเช่า, Netflix"/>
    <Sel label="หมวดหมู่" t={t} value={f.category} onChange={e=>set("category",e.target.value)}>{cats.map(c=><option key={c.v} value={c.v}>{c.i} {c.l}</option>)}</Sel>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <Inp label="จำนวนเงิน (฿)" t={t} type="number" value={f.amount} onChange={e=>set("amount",e.target.value)}/>
      <Inp label="วันที่ของเดือน (1-31)" t={t} type="number" min="1" max="31" value={f.dayOfMonth} onChange={e=>set("dayOfMonth",e.target.value)}/>
    </div>
    <label style={{fontSize:12,color:t.ts,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><input type="checkbox" checked={!!f.active} onChange={e=>set("active",e.target.checked)}/>เปิดใช้งาน (สร้างรายการอัตโนมัติทุกเดือน)</label>
    <div style={{fontSize:10,color:t.tm}}>* ระบบจะสร้างรายการอัตโนมัติเมื่อเปิดแอปในวันที่กำหนดของทุกเดือน</div>
    <div style={{display:"flex",gap:6}}><Btn primary t={t} disabled={!ok} onClick={()=>onSave(f)} style={{flex:1}}>{initial?"💾 บันทึก":"✓ เพิ่ม"}</Btn><Btn t={t} onClick={onCancel}>ยกเลิก</Btn></div>
  </div>);
}

function RecurringPage({data,onAdd,onEdit,onDel,onToggle,onRunNow,t}){
  const list=data.recurring||[];
  const monthlyIn=list.filter(r=>r.active&&r.type==="income").reduce((s,r)=>s+(+r.amount||0),0);
  const monthlyOut=list.filter(r=>r.active&&r.type==="expense").reduce((s,r)=>s+(+r.amount||0),0);
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💵" label="รายรับประจำ/เดือน" value={fB(monthlyIn)} t={t} color={t.g}/>
      <MC icon="💸" label="รายจ่ายประจำ/เดือน" value={fB(monthlyOut)} t={t} color={t.r}/>
      <MC icon="💰" label="สุทธิประจำเดือน" value={`${monthlyIn-monthlyOut>=0?"+":"-"}${fB(monthlyIn-monthlyOut)}`} t={t} color={monthlyIn-monthlyOut>=0?t.g:t.r}/>
    </div>
    {list.length===0?<Empty icon="↻" title="ยังไม่มีรายการประจำ" sub="เพิ่มเงินเดือน ค่าเช่า subscription ที่เกิดทุกเดือน" action="+ เพิ่มรายการประจำ" onAction={onAdd} t={t}/>:(
      <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,overflow:"hidden"}}>
        {list.map((r,i)=>{const cats=r.type==="income"?IC:EC;const cat=cats.find(c=>c.v===r.category)||cats[cats.length-1];const isI=r.type==="income";return(<div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderBottom:i<list.length-1?`1px solid ${t.cb}`:"none",opacity:r.active?1:0.5}}>
          <div style={{width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,background:isI?`${t.g}18`:`${t.r}18`}}>{cat.i}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:13,fontWeight:500}}>{r.name}</span>
              <Badge color={isI?t.g:t.r}>{cat.l}</Badge>
              {!r.active&&<Badge color={t.tm}>ปิดอยู่</Badge>}
              {r.lastRun===mk(td())&&<Badge color={t.ac}>เดือนนี้แล้ว</Badge>}
            </div>
            <div style={{fontSize:10,color:t.tm,marginTop:2}}>ทุกวันที่ {r.dayOfMonth} ของเดือน{r.lastRun?` • รันล่าสุด ${fm(r.lastRun)}`:""}</div>
          </div>
          <span style={{fontSize:14,fontWeight:600,color:isI?t.g:t.r}}>{isI?"+":"-"}{fB(r.amount)}</span>
          <div style={{display:"flex",gap:3}}>
            <Btn small t={t} onClick={()=>onToggle(r)}>{r.active?"⏸":"▶"}</Btn>
            <Btn small t={t} onClick={()=>onRunNow(r)} disabled={r.lastRun===mk(td())}>รันเดี๋ยวนี้</Btn>
            <Btn small t={t} onClick={()=>onEdit(r)}>แก้ไข</Btn>
            <Btn small danger t={t} onClick={()=>{if(window.confirm(`ลบ ${r.name}?`))onDel(r.id)}}>ลบ</Btn>
          </div>
        </div>)})}
      </div>
    )}
  </div>);
}

/* ═══ BUDGET PAGE ═══ */
function BudgetPage({data,stats,persist,t}){
  const budgets=data.budgets||{};
  const tm=mk(td());
  const spent={};data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===tm).forEach(tx=>{spent[tx.category]=(spent[tx.category]||0)+tx.amount});
  const setBudget=(k,v)=>persist({...data,budgets:{...budgets,[k]:+v||0}});
  const totalBudget=EC.reduce((s,c)=>s+(+budgets[c.v]||0),0);
  const totalSpent=Object.values(spent).reduce((s,v)=>s+v,0);
  const totalPct=totalBudget>0?(totalSpent/totalBudget*100):0;
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="🎯" label="งบประมาณรวม/เดือน" value={fB(totalBudget)} t={t} color={t.ac}/>
      <MC icon="💸" label="ใช้ไปเดือนนี้" value={fB(totalSpent)} t={t} color={t.r}/>
      <MC icon="💰" label="คงเหลือ" value={fB(Math.max(0,totalBudget-totalSpent))} sub={totalBudget>0?`${totalPct.toFixed(0)}% ของงบ`:""} t={t} color={totalSpent<=totalBudget?t.g:t.r}/>
    </div>
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>⊡ งบประมาณรายหมวด (เดือนนี้)</div>
      <div style={{fontSize:11,color:t.tm,marginBottom:12}}>ตั้งเพดานรายจ่ายแต่ละหมวด ระบบจะเตือนเมื่อใกล้เกิน/เกินงบ</div>
      {EC.map((c,i)=>{const b=+budgets[c.v]||0;const s=spent[c.v]||0;const p=b>0?(s/b*100):0;const col=p>=100?t.r:p>=80?t.am:t.g;return(<div key={c.v} style={{padding:"10px 0",borderBottom:i<EC.length-1?`1px solid ${t.cb}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{fontSize:15,width:24}}>{c.i}</span>
          <span style={{fontSize:12,fontWeight:500,flex:1}}>{c.l}</span>
          <span style={{fontSize:11,color:t.tm}}>ใช้ไป {fB(s)}</span>
          <input type="number" value={b||""} onChange={e=>setBudget(c.v,e.target.value)} placeholder="ตั้งงบ" style={{width:100,padding:"5px 8px",borderRadius:6,border:`1px solid ${t.ibr}`,fontSize:12,background:t.ib,color:t.text,textAlign:"right"}}/>
          <span style={{fontSize:11,color:t.tm,width:30}}>฿</span>
        </div>
        {b>0&&(<><PB pct={p} color={col} height={6} t={t}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:10}}>
            <span style={{color:col}}>{p>=100?`⚠️ เกินงบ ${fB(s-b)}`:p>=80?`⚠ ใกล้เต็มงบ`:`เหลือ ${fB(b-s)}`}</span>
            <span style={{color:t.tm}}>{p.toFixed(0)}%</span>
          </div></>)}
      </div>)})}
    </div>
    <div style={{fontSize:10,color:t.tm,textAlign:"center"}}>* ตัวเลขใช้จ่ายคำนวณจากธุรกรรมประเภท "รายจ่าย" ของเดือนปัจจุบัน</div>
  </div>);
}

/* ═══ TXN PAGE ═══ */
function TxnPage({data,stats,onAdd,onDel,t}){const[filter,setFilter]=useState("all");const[mf,setMf]=useState(mk(td()));const filtered=useMemo(()=>data.transactions.filter(tx=>filter==="all"||tx.type===filter).filter(tx=>mk(tx.date)===mf).sort((a,b)=>new Date(b.date)-new Date(a.date)),[data.transactions,filter,mf]);const months=useMemo(()=>{const s=new Set(data.transactions.map(tx=>mk(tx.date)));s.add(mk(td()));return[...s].sort().reverse()},[data.transactions]);
return(<div style={{display:"flex",flexDirection:"column",gap:14}}><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><MC icon="💵" label="รายรับ" value={fB(stats.incomeThisMonth)} t={t} color={t.g}/><MC icon="💸" label="รายจ่าย" value={fB(stats.expenseThisMonth)} t={t} color={t.r}/><MC icon="💰" label="คงเหลือ" value={fB(stats.netThisMonth)} t={t} color={stats.netThisMonth>=0?t.g:t.r}/></div>
<div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div style={{display:"flex",gap:4}}>{[{k:"all",l:"ทั้งหมด"},{k:"income",l:"รายรับ"},{k:"expense",l:"รายจ่าย"}].map(f=>(<button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:"4px 12px",fontSize:11,border:filter===f.k?"none":`1px solid ${t.cb}`,borderRadius:7,cursor:"pointer",background:filter===f.k?(f.k==="income"?t.g:f.k==="expense"?t.r:t.ac):"transparent",color:filter===f.k?"#fff":t.ts}}>{f.l}</button>))}</div><select value={mf} onChange={e=>setMf(e.target.value)} style={{fontSize:11,padding:"4px 8px",borderRadius:7,border:`1px solid ${t.ibr}`,background:t.ib,color:t.text}}>{months.map(m=><option key={m} value={m}>{fm(m)}</option>)}</select></div>
{filtered.length===0?<Empty icon="💸" title="ไม่มีรายการ" sub="เพิ่มรายรับหรือรายจ่าย" action="+ บันทึก" onAction={onAdd} t={t}/>:(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,overflow:"hidden"}}>{filtered.map((tx,i)=>{const isI=tx.type==="income";const cats=isI?IC:EC;const cat=cats.find(c=>c.v===tx.category)||cats[cats.length-1];return(<div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<filtered.length-1?`1px solid ${t.cb}`:"none"}}><div style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,background:isI?`${t.g}18`:`${t.r}18`}}>{cat.i}</div><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.note||cat.l}</div><div style={{fontSize:10,color:t.tm}}>{new Date(tx.date).toLocaleDateString("th-TH",{day:"numeric",month:"short"})}</div></div><span style={{fontSize:13,fontWeight:600,color:isI?t.g:t.r}}>{isI?"+":"-"}{fB(tx.amount)}</span><button onClick={()=>onDel(tx.id)} style={{fontSize:10,padding:"2px 6px",border:`1px solid ${t.cb}`,borderRadius:4,background:"transparent",cursor:"pointer",color:t.tm}}>✕</button></div>)})}</div>)}</div>)}

/* ═══ MAIN APP ═══ */
function WealthHub(){
  const[data,setData]=useState(null);const[loading,setLoading]=useState(true);const[page,setPage]=useState("dashboard");const[modal,setModal]=useState(null);const[dark,setDark]=useState(false);
  const t=dark?Dk:L;
  useEffect(()=>{const loaded=ld()||DF;const processed=processRecurring(loaded);if(processed!==loaded)sv(processed);setData(processed);try{setDark(localStorage.getItem("wealthhub-dark")==="1")}catch{}setLoading(false)},[]);
  useEffect(()=>{try{localStorage.setItem("wealthhub-dark",dark?"1":"0")}catch{}},[dark]);
  const persist=useCallback(nd=>{setData(nd);sv(nd)},[]);
  const rate=data?.settings?.rate||35.5;const setRate=r=>persist({...data,settings:{...data.settings,rate:r}});
  const toThb=(v,cur)=>cur==="USD"?v*rate:v;

  const addAsset=f=>{persist({...data,assets:[...data.assets,{...f,id:uid(),units:+f.units,avgCost:+f.avgCost,currentPrice:+f.currentPrice}]});setModal(null)};
  const updateAsset=(id,f)=>{persist({...data,assets:data.assets.map(a=>a.id===id?{...a,...f,units:+f.units,avgCost:+f.avgCost,currentPrice:+f.currentPrice}:a)});setModal(null)};
  const delAsset=id=>persist({...data,assets:data.assets.filter(a=>a.id!==id)});
  const addTxn=f=>{persist({...data,transactions:[...data.transactions,{...f,id:uid(),amount:+f.amount}]});setModal(null)};
  const delTxn=id=>persist({...data,transactions:data.transactions.filter(tx=>tx.id!==id)});
  const addGoal=f=>{persist({...data,goals:[...data.goals,{...f,id:uid(),target:+f.target,saved:+f.saved}]});setModal(null)};
  const updateGoal=(id,f)=>{persist({...data,goals:data.goals.map(g=>g.id===id?{...g,...f,target:+f.target,saved:+f.saved}:g)});setModal(null)};
  const delGoal=id=>persist({...data,goals:data.goals.filter(g=>g.id!==id)});
  const addDebt=f=>{persist({...data,debts:[...data.debts,{...f,id:uid(),total:+f.total,paid:+f.paid,rate:+f.rate}]});setModal(null)};
  const updateDebt=(id,f)=>{persist({...data,debts:data.debts.map(d=>d.id===id?{...d,...f,total:+f.total,paid:+f.paid,rate:+f.rate}:d)});setModal(null)};
  const delDebt=id=>persist({...data,debts:data.debts.filter(d=>d.id!==id)});
  const addRecurring=f=>{persist({...data,recurring:[...(data.recurring||[]),{...f,id:uid(),amount:+f.amount,dayOfMonth:+f.dayOfMonth,active:!!f.active,lastRun:null}]});setModal(null)};
  const updateRecurring=(id,f)=>{persist({...data,recurring:(data.recurring||[]).map(r=>r.id===id?{...r,...f,amount:+f.amount,dayOfMonth:+f.dayOfMonth,active:!!f.active}:r)});setModal(null)};
  const delRecurring=id=>persist({...data,recurring:(data.recurring||[]).filter(r=>r.id!==id)});
  const toggleRecurring=r=>persist({...data,recurring:data.recurring.map(x=>x.id===r.id?{...x,active:!x.active}:x)});
  const runRecurringNow=r=>{const cm=mk(td());const day=Math.min(r.dayOfMonth||1,28);const date=`${cm}-${String(day).padStart(2,"0")}`;const tx={id:uid(),type:r.type,category:r.category,amount:+r.amount,date,note:(r.name||"รายการประจำ")+" (manual)",recurringId:r.id};persist({...data,transactions:[...data.transactions,tx],recurring:data.recurring.map(x=>x.id===r.id?{...x,lastRun:cm}:x)})};

  const exportData=()=>{const payload={version:SK,exportedAt:new Date().toISOString(),data};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`wealthhub-backup-${td()}.json`;a.click();URL.revokeObjectURL(url)};
  const importData=e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{const parsed=JSON.parse(ev.target.result);const payload=parsed.data||parsed;if(!payload||typeof payload!=="object"||!Array.isArray(payload.assets))throw new Error("รูปแบบไฟล์ไม่ถูกต้อง");if(!window.confirm("นำเข้าข้อมูลจะเขียนทับข้อมูลปัจจุบันทั้งหมด ดำเนินการต่อ?"))return;const merged={...DF,...payload,balanceSheet:{...DF.balanceSheet,...(payload.balanceSheet||{})},settings:{...DF.settings,...(payload.settings||{})},recurring:payload.recurring||[],budgets:payload.budgets||{}};persist(merged);window.alert("นำเข้าข้อมูลสำเร็จ ✅")}catch(err){window.alert("นำเข้าไม่สำเร็จ: "+err.message)}};reader.readAsText(file);e.target.value=""};

  const stats=useMemo(()=>{
    if(!data)return{};
    const tp=data.assets.reduce((s,a)=>s+toThb(a.units*a.currentPrice,a.currency||"THB"),0);
    const tc=data.assets.reduce((s,a)=>s+toThb(a.units*a.avgCost,a.currency||"THB"),0);
    const pl=tp-tc;const pp=tc>0?(pl/tc)*100:0;const tm=mk(td());
    const iM=data.transactions.filter(tx=>tx.type==="income"&&mk(tx.date)===tm).reduce((s,tx)=>s+tx.amount,0);
    const eM=data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===tm).reduce((s,tx)=>s+tx.amount,0);
    const nM=iM-eM;const gs=data.goals.reduce((s,g)=>s+g.saved,0);const gt=data.goals.reduce((s,g)=>s+g.target,0);
    const td2=data.debts.reduce((s,d)=>s+d.total,0);const dp=data.debts.reduce((s,d)=>s+d.paid,0);const dr=td2-dp;
    const nw=tp+gs-dr;
    const alloc=data.assets.map((a,i)=>{const v=toThb(a.units*a.currentPrice,a.currency||"THB");const c=toThb(a.units*a.avgCost,a.currency||"THB");return{...a,value:v,cost:c,pl:v-c,pct:tp>0?(v/tp)*100:0,color:PC[i%PC.length]}}).sort((a,b)=>b.value-a.value);
    const ms=[];for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);ms.push(mk(d.toISOString().slice(0,10)))}
    const mt=ms.map(m=>({month:fm(m),income:data.transactions.filter(tx=>tx.type==="income"&&mk(tx.date)===m).reduce((s,tx)=>s+tx.amount,0),expense:data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===m).reduce((s,tx)=>s+tx.amount,0)}));
    const ec={};data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===tm).forEach(tx=>{ec[tx.category]=(ec[tx.category]||0)+tx.amount});
    const ecd=Object.entries(ec).map(([k,v],i)=>{const cat=EC.find(c=>c.v===k)||EC[7];return{name:cat.l,value:v,color:PC[i%PC.length],icon:cat.i}}).sort((a,b)=>b.value-a.value);
    return{totalPortfolio:tp,totalCost:tc,portfolioPL:pl,portfolioPct:pp,allocation:alloc,incomeThisMonth:iM,expenseThisMonth:eM,netThisMonth:nM,totalGoalSaved:gs,totalGoalTarget:gt,totalDebt:td2,totalDebtPaid:dp,debtRemaining:dr,netWorth:nw,monthlyTrend:mt,expCatData:ecd};
  },[data,rate]);

  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:t.bg,color:t.ts}}>กำลังโหลด...</div>;

  const pl=NAV.find(n=>n.k===page)?.l||"Dashboard";

  return(<div style={{display:"flex",minHeight:"100vh",background:t.bg,color:t.text,fontFamily:"'Segoe UI','Noto Sans Thai',system-ui,sans-serif"}}>
    <Sidebar page={page} setPage={setPage} dark={dark} setDark={setDark} t={t}/>
    <div style={{marginLeft:220,flex:1,padding:"20px 28px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:600}}>{pl}</h1><div style={{fontSize:11,color:t.tm,marginTop:1}}>WealthHub / {pl}</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:t.tm}}>{new Date().toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"})}</span>
          {!["reports","dca","retire","plan","balance","cashflow","budget"].includes(page)&&<Btn primary t={t} onClick={()=>{if(page==="portfolio")setModal({type:"addAsset"});else if(page==="txn")setModal({type:"addTxn"});else if(page==="goals")setModal({type:"addGoal"});else if(page==="debts")setModal({type:"addDebt"});else if(page==="recurring")setModal({type:"addRecurring"});else setModal({type:"addTxn"})}}>+ เพิ่มรายการ</Btn>}
        </div>
      </div>

      {/* DASHBOARD */}
      {page==="dashboard"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><MC icon="$" label="มูลค่าสุทธิ" value={fB(stats.netWorth)} t={t} color={t.ac}/><MC icon="📈" label="กำไร/ขาดทุน" value={fB(stats.portfolioPL)} sub={fP(stats.portfolioPct)} t={t} color={stats.portfolioPL>=0?t.g:t.r}/><MC icon="💵" label="รายรับเดือนนี้" value={fB(stats.incomeThisMonth)} t={t} color={t.g}/><MC icon="💸" label="รายจ่ายเดือนนี้" value={fB(stats.expenseThisMonth)} t={t} color={t.r}/></div>
        {/* Portfolio on dashboard */}
        {data.assets.length>0&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:13,fontWeight:600}}>📊 พอร์ตลงทุน</span><button onClick={()=>setPage("portfolio")} style={{fontSize:11,color:t.ac,background:"none",border:"none",cursor:"pointer"}}>ดูทั้งหมด →</button></div>
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,auto)",gap:16}}>
            <div>{stats.allocation.slice(0,4).map(a=>{const tp2=AT.find(at=>at.v===a.type)||AT[7];const pp2=a.cost>0?(a.pl/a.cost)*100:0;return(<div key={a.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{tp2.i}</span><span style={{fontSize:12,fontWeight:500}}>{a.name}</span><Badge color={a.currency==="USD"?t.ac:t.tl}>{a.currency||"THB"}</Badge></div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:500}}>{fB(a.value)}</span><Badge color={a.pl>=0?t.g:t.r}>{fP(pp2)}</Badge></div></div><PB pct={a.pct} color={a.color} height={3} t={t}/></div>)})}</div>
            <div><ResponsiveContainer width={140} height={140}><PieChart><Pie data={stats.allocation} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2}>{stats.allocation.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
          </div>
        </div>)}
        {/* Currency + alerts */}
        <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:14}}>
          <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>💱 แปลงสกุลเงิน</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:11,color:t.tm}}>1 USD =</span><input value={rate} onChange={e=>setRate(+e.target.value)} type="number" step="0.1" style={{width:60,padding:"4px 6px",borderRadius:6,border:`1px solid ${t.ibr}`,fontSize:11,background:t.ib,color:t.text,textAlign:"center"}}/><span style={{fontSize:11,color:t.tm}}>บาท</span></div>
          </div>
          <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>🔔 แจ้งเตือน</div>
            {(()=>{const al=[];data.debts.forEach(d=>{if(d.total-d.paid>0&&d.rate>=10)al.push({c:t.r,t:`⚠️ ${d.name} ดอกเบี้ยสูง`})});if(!al.length)al.push({c:t.g,t:"✅ ปกติ"});return al.map((a,i)=>(<div key={i} style={{padding:"6px 10px",borderRadius:6,fontSize:11,marginBottom:2,background:`${a.c}12`,color:a.c}}>{a.t}</div>))})()}
          </div>
        </div>
        {stats.monthlyTrend.some(m=>m.income||m.expense)&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>รายรับ vs รายจ่าย (6 เดือน)</div><ResponsiveContainer width="100%" height={180}><BarChart data={stats.monthlyTrend} barGap={2}><CartesianGrid strokeDasharray="3 3" stroke={t.cb}/><XAxis dataKey="month" tick={{fontSize:10,fill:t.tm}}/><YAxis tick={{fontSize:10,fill:t.tm}} tickFormatter={v=>v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/><Tooltip formatter={v=>fB(v)} contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:8}}/><Bar dataKey="income" name="รายรับ" fill={t.g} radius={[4,4,0,0]}/><Bar dataKey="expense" name="รายจ่าย" fill={t.r} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>)}
        {data.goals.length>0&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🎯 เป้าหมาย</div>{data.goals.map(g=>{const p=g.target>0?(g.saved/g.target)*100:0;return(<div key={g.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:500}}>{g.icon} {g.name}</span><span style={{color:t.ts}}>{fB(g.saved)}/{fB(g.target)} ({Math.round(p)}%)</span></div><PB pct={p} color={p>=100?t.g:t.ac} height={5} t={t}/></div>)})}</div>)}
      </div>)}

      {page==="portfolio"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><MC icon="💰" label="มูลค่ารวม" value={fB(stats.totalPortfolio)} t={t}/><MC icon="📈" label="P&L" value={fB(stats.portfolioPL)} sub={fP(stats.portfolioPct)} t={t} color={stats.portfolioPL>=0?t.g:t.r}/><MC icon="🏷️" label="ต้นทุน" value={fB(stats.totalCost)} t={t}/></div>
        {data.assets.length===0?<Empty icon="📊" title="ยังไม่มีสินทรัพย์" sub="เพิ่มหุ้น กองทุน คริปโต" action="+ เพิ่ม" onAction={()=>setModal({type:"addAsset"})} t={t}/>:(
          <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:`1px solid ${t.cb}`}}>{["สินทรัพย์","สกุล","จำนวน","ต้นทุน","ราคา","มูลค่า(฿)","P&L","%",""].map((h,i)=>(<th key={i} style={{padding:"10px",textAlign:"left",fontSize:10,color:t.tm,fontWeight:500,background:t.thBg}}>{h}</th>))}</tr></thead><tbody>{stats.allocation.map(a=>{const tp2=AT.find(at=>at.v===a.type)||AT[7];const pp2=a.cost>0?(a.pl/a.cost)*100:0;const cur=a.currency||"THB";const sym=cur==="USD"?"$":"฿";return(<tr key={a.id} style={{borderBottom:`1px solid ${t.cb}`}}><td style={{padding:10,fontWeight:500}}>{tp2.i} {a.name}</td><td style={{padding:10}}><Badge color={cur==="USD"?t.ac:t.tl}>{cur}</Badge></td><td style={{padding:10}}>{a.units}</td><td style={{padding:10}}>{sym}{a.avgCost}</td><td style={{padding:10}}>{sym}{a.currentPrice}</td><td style={{padding:10,fontWeight:500}}>{fB(a.value)}</td><td style={{padding:10}}><Badge color={a.pl>=0?t.g:t.r}>{a.pl>=0?"▲":"▼"}{fB(a.pl)}</Badge></td><td style={{padding:10}}>{Math.round(a.pct)}%</td><td style={{padding:10}}><div style={{display:"flex",gap:3}}><button onClick={()=>setModal({type:"editAsset",asset:a})} style={{fontSize:10,padding:"2px 6px",border:`1px solid ${t.cb}`,borderRadius:3,background:"transparent",cursor:"pointer",color:t.ts}}>แก้ไข</button><button onClick={()=>{if(window.confirm(`ลบ ${a.name}?`))delAsset(a.id)}} style={{fontSize:10,padding:"2px 6px",border:`1px solid ${t.r}40`,borderRadius:3,background:"transparent",cursor:"pointer",color:t.r}}>ลบ</button></div></td></tr>)})}</tbody></table></div>)}
      </div>)}

      {page==="txn"&&<TxnPage data={data} stats={stats} onAdd={()=>setModal({type:"addTxn"})} onDel={delTxn} t={t}/>}
      {page==="recurring"&&<RecurringPage data={data} onAdd={()=>setModal({type:"addRecurring"})} onEdit={r=>setModal({type:"editRecurring",recurring:r})} onDel={delRecurring} onToggle={toggleRecurring} onRunNow={runRecurringNow} t={t}/>}
      {page==="budget"&&<BudgetPage data={data} stats={stats} persist={persist} t={t}/>}
      {page==="balance"&&<BalancePage data={data} stats={stats} persist={persist} t={t}/>}
      {page==="cashflow"&&<CashFlowPage data={data} stats={stats} t={t}/>}

      {page==="goals"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><MC icon="🎯" label="เป้าหมายรวม" value={fB(stats.totalGoalTarget)} t={t}/><MC icon="💰" label="ออมแล้ว" value={fB(stats.totalGoalSaved)} t={t} color={t.g}/><MC icon="📊" label="เหลือ" value={fB(stats.totalGoalTarget-stats.totalGoalSaved)} t={t} color={t.am}/></div>
        {data.goals.length===0?<Empty icon="🎯" title="ยังไม่มีเป้าหมาย" sub="ตั้งเป้าออม" action="+ ตั้งเป้า" onAction={()=>setModal({type:"addGoal"})} t={t}/>:(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{data.goals.map(g=>{const p=g.target>0?(g.saved/g.target)*100:0;return(<div key={g.id} style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:14,fontWeight:600}}>{g.icon} {g.name}</span><Badge color={p>=100?t.g:t.ac}>{p>=100?"สำเร็จ!":`${Math.round(p)}%`}</Badge></div><PB pct={p} color={p>=100?t.g:t.ac} height={8} t={t}/><div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:t.ts}}><span>{fB(g.saved)}</span><span>{fB(g.target)}</span></div><div style={{display:"flex",gap:3,marginTop:8}}><Btn small t={t} onClick={()=>setModal({type:"editGoal",goal:g})}>แก้ไข</Btn><Btn small t={t} onClick={()=>{const a=window.prompt("เพิ่มเงินออม?");if(a&&+a>0)updateGoal(g.id,{...g,saved:g.saved+ +a})}}>+เพิ่ม</Btn><Btn small danger t={t} onClick={()=>{if(window.confirm("ลบ?"))delGoal(g.id)}}>ลบ</Btn></div></div>)})}</div>)}
      </div>)}

      {page==="debts"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><MC icon="🏦" label="หนี้ทั้งหมด" value={fB(stats.totalDebt)} t={t}/><MC icon="✅" label="จ่ายแล้ว" value={fB(stats.totalDebtPaid)} t={t} color={t.g}/><MC icon="⚠️" label="คงเหลือ" value={fB(stats.debtRemaining)} t={t} color={t.r}/></div>
        {data.debts.length===0?<Empty icon="🏦" title="ไม่มีหนี้" sub="บันทึกหนี้สิน" action="+ เพิ่ม" onAction={()=>setModal({type:"addDebt"})} t={t}/>:(data.debts.map(d=>{const p=d.total>0?(d.paid/d.total)*100:0;const r=d.total-d.paid;const mi=r*(d.rate/100/12);return(<div key={d.id} style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16,borderLeft:`4px solid ${t.am}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:14,fontWeight:600}}>{d.icon} {d.name}</span><span style={{fontSize:11,color:t.ts}}>{d.rate}%/ปี</span></div><PB pct={p} color={p>=100?t.g:t.am} height={8} t={t}/><div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:t.ts}}><span>จ่าย {fB(d.paid)} ({Math.round(p)}%)</span><span>เหลือ {fB(r)}</span></div>{mi>0&&<div style={{fontSize:10,color:t.r,marginTop:3}}>ดอกเบี้ย/เดือน ~{fB(Math.round(mi))}</div>}<div style={{display:"flex",gap:3,marginTop:8}}><Btn small t={t} onClick={()=>setModal({type:"editDebt",debt:d})}>แก้ไข</Btn><Btn small t={t} onClick={()=>{const pay=window.prompt("จ่าย?");if(pay&&+pay>0)updateDebt(d.id,{...d,paid:Math.min(d.total,d.paid+ +pay)})}}>+จ่าย</Btn><Btn small danger t={t} onClick={()=>{if(window.confirm("ลบ?"))delDebt(d.id)}}>ลบ</Btn></div></div>)}))}
      </div>)}

      {page==="dca"&&<DCAPage t={t}/>}
      {page==="retire"&&<RetirePage t={t}/>}
      {page==="plan"&&<PlanPage data={data} stats={stats} t={t}/>}

      {page==="reports"&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:22}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:14}}>📄 รายงานสรุป</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}><div style={{padding:12,borderRadius:8,background:`${t.ac}10`}}><div style={{fontSize:10,color:t.ts}}>Net Worth</div><div style={{fontSize:18,fontWeight:600,color:t.ac}}>{fB(stats.netWorth)}</div></div><div style={{padding:12,borderRadius:8,background:`${t.g}10`}}><div style={{fontSize:10,color:t.ts}}>รายรับ</div><div style={{fontSize:18,fontWeight:600,color:t.g}}>{fB(stats.incomeThisMonth)}</div></div><div style={{padding:12,borderRadius:8,background:`${t.r}10`}}><div style={{fontSize:10,color:t.ts}}>รายจ่าย</div><div style={{fontSize:18,fontWeight:600,color:t.r}}>{fB(stats.expenseThisMonth)}</div></div></div>
        <Btn primary t={t} onClick={()=>{const w=window.open("","_blank");w.document.write(`<html><head><title>WealthHub</title><style>body{font-family:Segoe UI,sans-serif;padding:40px;color:#1e293b}h1{color:#0ea5e9}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:13px}th{background:#f8fafc}</style></head><body><h1>WealthHub — รายงาน</h1><p>${new Date().toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"})}</p><table><tr><td>Net Worth</td><td>${fB(stats.netWorth)}</td></tr><tr><td>พอร์ต</td><td>${fB(stats.totalPortfolio)}</td></tr><tr><td>P&L</td><td>${fB(stats.portfolioPL)}</td></tr><tr><td>รายรับ</td><td>${fB(stats.incomeThisMonth)}</td></tr><tr><td>รายจ่าย</td><td>${fB(stats.expenseThisMonth)}</td></tr><tr><td>หนี้</td><td>${fB(stats.debtRemaining)}</td></tr></table>`);if(data.assets.length){w.document.write(`<h2>พอร์ต</h2><table><tr><th>ชื่อ</th><th>สกุล</th><th>มูลค่า</th><th>P&L</th></tr>`);stats.allocation.forEach(a=>{w.document.write(`<tr><td>${a.name}</td><td>${a.currency||"THB"}</td><td>${fB(a.value)}</td><td>${fB(a.pl)}</td></tr>`)});w.document.write(`</table>`)}w.document.write(`<p style="color:#94a3b8;font-size:11px;margin-top:30px">WealthHub</p></body></html>`);w.document.close();w.print()}}>🖨️ พิมพ์ / PDF</Btn>
      </div>)}

      <div style={{marginTop:28,paddingTop:14,borderTop:`1px solid ${t.cb}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <Btn small t={t} onClick={exportData}>💾 Export JSON</Btn>
          <label style={{display:"inline-block"}}><span style={{padding:"5px 12px",fontSize:11,fontWeight:500,cursor:"pointer",borderRadius:8,border:`1px solid ${t.cb}`,color:t.ts,display:"inline-block"}}>📂 Import JSON</span><input type="file" accept="application/json" onChange={importData} style={{display:"none"}}/></label>
          <span style={{fontSize:10,color:t.tm}}>สำรอง/กู้คืนข้อมูลทั้งหมด</span>
        </div>
        <button onClick={()=>{if(window.confirm("ล้างทั้งหมด?"))persist(DF)}} style={{fontSize:9,color:t.tm,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>🗑 ล้างข้อมูล</button>
      </div>
    </div>

    <Modal open={modal?.type==="addAsset"||modal?.type==="editAsset"} onClose={()=>setModal(null)} title={modal?.type==="editAsset"?"แก้ไข":"เพิ่มสินทรัพย์"} t={t}><AssetForm initial={modal?.asset} onSave={f=>modal?.type==="editAsset"?updateAsset(modal.asset.id,f):addAsset(f)} onCancel={()=>setModal(null)} t={t} rate={rate}/></Modal>
    <Modal open={modal?.type==="addTxn"} onClose={()=>setModal(null)} title="บันทึกรายรับ/รายจ่าย" t={t}><TxnForm onSave={addTxn} onCancel={()=>setModal(null)} t={t}/></Modal>
    <Modal open={modal?.type==="addGoal"||modal?.type==="editGoal"} onClose={()=>setModal(null)} title={modal?.type==="editGoal"?"แก้ไข":"ตั้งเป้าหมาย"} t={t}><GoalForm initial={modal?.goal} onSave={f=>modal?.type==="editGoal"?updateGoal(modal.goal.id,f):addGoal(f)} onCancel={()=>setModal(null)} t={t}/></Modal>
    <Modal open={modal?.type==="addDebt"||modal?.type==="editDebt"} onClose={()=>setModal(null)} title={modal?.type==="editDebt"?"แก้ไข":"เพิ่มหนี้"} t={t}><DebtForm initial={modal?.debt} onSave={f=>modal?.type==="editDebt"?updateDebt(modal.debt.id,f):addDebt(f)} onCancel={()=>setModal(null)} t={t}/></Modal>
    <Modal open={modal?.type==="addRecurring"||modal?.type==="editRecurring"} onClose={()=>setModal(null)} title={modal?.type==="editRecurring"?"แก้ไขรายการประจำ":"เพิ่มรายการประจำ"} t={t}><RecurringForm initial={modal?.recurring} onSave={f=>modal?.type==="editRecurring"?updateRecurring(modal.recurring.id,f):addRecurring(f)} onCancel={()=>setModal(null)} t={t}/></Modal>
  </div>);
}

export default WealthHub;