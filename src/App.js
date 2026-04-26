import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from './supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, LineChart, Line, Legend, ReferenceLine, LabelList } from "recharts";
import { L, Dk, Paper, Cream, PC } from "./theme";
import { AT, EC, IC, CF_DEFAULTS, NAV, SK, DF } from "./constants";
import { uid, fB, fP, td, mk, fm, ld, sv, processRecurring, haptic } from "./utils";

/* ═══ COMPONENTS ═══ */
function Sidebar({page,setPage,theme,setTheme,t,isMobile,open,onClose,onLogout,userEmail}){
  const groups=[...new Set(NAV.map(n=>n.g))];
  const visible=!isMobile||open;
  const go=k=>{setPage(k);if(isMobile)onClose&&onClose()};
  const themes=[{k:"light",i:"☀️",l:"Light"},{k:"paper",i:"📄",l:"Paper"},{k:"cream",i:"🍵",l:"Cream"},{k:"dark",i:"🌙",l:"Dark"}];
  return(<>
    {isMobile&&open&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:99}}/>}
    <div style={{width:220,height:"100vh",background:t.sidebar,display:"flex",flexDirection:"column",position:"fixed",left:isMobile?(visible?0:-240):0,top:0,zIndex:100,borderRight:`1px solid ${t.sideBorder}`,overflowY:"auto",transition:"left .25s ease",boxShadow:isMobile&&visible?"4px 0 16px rgba(0,0,0,0.2)":"none",paddingTop:"env(safe-area-inset-top)",paddingBottom:"env(safe-area-inset-bottom)",boxSizing:"border-box"}}>
    <div style={{padding:"16px 20px 16px",borderBottom:`1px solid ${t.sideBorder}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,position:"sticky",top:0,background:t.sidebar,zIndex:1}}>
      <div><div style={{fontSize:19,fontWeight:600}}><span style={{color:t.ac}}>Wealth</span><span style={{color:t.sidebarText}}>Hub</span></div>
        <div style={{fontSize:9,color:t.sidebarText,marginTop:2}}>ระบบจัดการการเงินส่วนบุคคล</div></div>
      {isMobile&&<button onClick={onClose} style={{background:"none",border:"none",color:t.sidebarText,fontSize:20,cursor:"pointer",lineHeight:1,padding:0}}>✕</button>}
    </div>
    <div style={{padding:"10px 10px",flex:1}}>
      {groups.map(g=>(<div key={g}>
        <div style={{fontSize:9,color:t.sidebarText,textTransform:"uppercase",letterSpacing:1.2,padding:"10px 8px 4px",fontWeight:600}}>{g}</div>
        {NAV.filter(n=>n.g===g).map(n=>(<button key={n.k} onClick={()=>go(n.k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",border:"none",borderRadius:7,cursor:"pointer",marginBottom:1,fontSize:12,background:page===n.k?`${t.sidebarActive}18`:"transparent",color:page===n.k?t.sidebarActive:t.sidebarText,fontWeight:page===n.k?600:400,borderLeft:page===n.k?`3px solid ${t.ac}`:"3px solid transparent"}}><span style={{fontSize:13,width:16,textAlign:"center"}}>{n.i}</span>{n.l}</button>))}
      </div>))}
    </div>
    <div style={{padding:"10px 20px",borderTop:`1px solid ${t.sideBorder}`,position:"sticky",bottom:0,background:t.sidebar}}>
      <div style={{fontSize:9,color:t.sidebarText,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>ธีม</div>
      <div style={{display:"flex",gap:4,marginBottom:6}}>
        {themes.map(th=>(<button key={th.k} onClick={()=>setTheme(th.k)} title={th.l} style={{flex:1,padding:"5px 2px",border:`1px solid ${theme===th.k?t.ac:t.sideBorder}`,borderRadius:6,background:theme===th.k?`${t.ac}20`:"transparent",cursor:"pointer",fontSize:12,color:theme===th.k?t.ac:t.sidebarText,fontWeight:theme===th.k?700:400,transition:"all .15s"}}>{th.i}</button>))}
      </div>
      {userEmail&&<div style={{fontSize:9,color:t.sidebarText,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>👤 {userEmail}</div>}
      {onLogout&&<button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",color:t.r,cursor:"pointer",fontSize:11,padding:"4px 0"}}>🚪 ออกจากระบบ</button>}
    </div>
  </div></>);
}

function MC({icon,label,value,sub,color,t}){return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:"14px 16px",flex:"1 1 140px",minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><div style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:color?`${color}18`:t.acL,fontSize:14}}>{icon}</div><span style={{fontSize:11,color:t.ts}}>{label}</span></div><div style={{fontSize:19,fontWeight:600,color:color||t.text,letterSpacing:-0.5}}>{value}</div>{sub&&<div style={{fontSize:10,color:color||t.tm,marginTop:1}}>{sub}</div>}</div>)}

function Modal({open,onClose,title,children,t,w}){
  const isMobile=t.m;
  const[mounted,setMounted]=useState(false);
  const[visible,setVisible]=useState(false);
  const[dragY,setDragY]=useState(0);
  const[isDragging,setIsDragging]=useState(false);
  const startY=useRef(0);

  // Mount/unmount with delay for exit animation
  useEffect(()=>{
    if(open){
      setMounted(true);
      const id=requestAnimationFrame(()=>setVisible(true));
      return()=>cancelAnimationFrame(id);
    }else{
      setVisible(false);
      const tm=setTimeout(()=>{setMounted(false);setDragY(0)},280);
      return()=>clearTimeout(tm);
    }
  },[open]);

  // Lock body scroll while open (especially helps iOS rubber-band behind sheet)
  useEffect(()=>{
    if(!mounted)return;
    const prev=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow=prev};
  },[mounted]);

  if(!mounted)return null;

  // Touch handlers for drag-to-dismiss (mobile only, attached to drag-handle area)
  const onTouchStart=e=>{startY.current=e.touches[0].clientY;setIsDragging(true)};
  const onTouchMove=e=>{
    if(!isDragging)return;
    const dy=e.touches[0].clientY-startY.current;
    if(dy>0)setDragY(dy);
  };
  const onTouchEnd=()=>{
    setIsDragging(false);
    if(dragY>100){onClose()}else{setDragY(0)}
  };

  // ── Mobile: bottom sheet ──
  if(isMobile){
    const wh=typeof window!=="undefined"?window.innerHeight:800;
    const transY=visible?dragY:wh;
    const backdropOpacity=visible?Math.max(0,0.5-dragY/600):0;
    return(<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:999,background:`rgba(0,0,0,${backdropOpacity})`,transition:isDragging?"none":"background .25s ease",display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.card,width:"100%",maxHeight:"90vh",borderRadius:"20px 20px 0 0",padding:"0 18px 18px",paddingBottom:"calc(18px + env(safe-area-inset-bottom))",transform:`translateY(${transY}px)`,transition:isDragging?"none":"transform .28s cubic-bezier(0.32, 0.72, 0, 1)",overflowY:"auto",boxShadow:"0 -8px 28px rgba(0,0,0,0.25)",willChange:"transform",WebkitOverflowScrolling:"touch"}}>
        {/* Drag handle */}
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{padding:"10px 0 6px",display:"flex",justifyContent:"center",cursor:"grab",touchAction:"none",position:"sticky",top:0,background:t.card,zIndex:1}}>
          <div style={{width:40,height:4,borderRadius:2,background:t.cb}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingTop:6}}>
          <h3 style={{margin:0,fontSize:16,fontWeight:600,color:t.text}}>{title}</h3>
          <button onClick={onClose} aria-label="ปิด" style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:t.tm,padding:"4px 8px",lineHeight:1,marginRight:-8}}>✕</button>
        </div>
        {children}
      </div>
    </div>);
  }

  // ── Desktop: centered popup with fade+scale ──
  return(<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",background:`rgba(0,0,0,${visible?0.5:0})`,padding:16,transition:"background .2s ease"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:14,padding:22,width:"100%",maxWidth:w||440,maxHeight:"85vh",overflowY:"auto",opacity:visible?1:0,transform:visible?"translateY(0) scale(1)":"translateY(8px) scale(0.97)",transition:"opacity .18s ease, transform .2s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:600,color:t.text}}>{title}</h3>
        <button onClick={onClose} aria-label="ปิด" style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:t.tm}}>✕</button>
      </div>
      {children}
    </div>
  </div>);
}

function Btn({children,onClick,primary,danger,small,disabled,t,style:s}){return<button onClick={disabled?undefined:onClick} style={{padding:small?"5px 12px":"8px 18px",fontSize:small?11:13,fontWeight:500,cursor:disabled?"not-allowed":"pointer",borderRadius:8,border:"none",opacity:disabled?0.5:1,...(primary?{background:t.ac,color:"#fff"}:danger?{background:t.r,color:"#fff"}:{background:"transparent",border:`1px solid ${t.cb}`,color:t.ts}),...s}}>{children}</button>}

function Empty({icon,title,sub,action,onAction,t}){return(<div style={{textAlign:"center",padding:"40px 20px",color:t.ts}}><div style={{fontSize:40,marginBottom:10,opacity:0.4}}>{icon}</div><div style={{fontSize:15,fontWeight:500,color:t.text,marginBottom:4}}>{title}</div><div style={{fontSize:12,marginBottom:16}}>{sub}</div>{action&&<Btn primary t={t} onClick={onAction}>{action}</Btn>}</div>)}

function PB({pct,color,height,t}){return(<div style={{height:height||6,borderRadius:99,background:t.cb,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,pct))}%`,background:color||t.ac,borderRadius:99,transition:"width .5s ease"}}/></div>)}

function Badge({children,color}){return<span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:`${color}20`,color,fontWeight:500}}>{children}</span>}

function Inp({label,t,...p}){return(<label style={{fontSize:11,color:t.ts,display:"block"}}>{label}<input {...p} style={{width:"100%",marginTop:2,padding:"8px 10px",borderRadius:7,border:`1px solid ${t.ibr}`,fontSize:12,background:t.ib,color:t.text,boxSizing:"border-box",outline:"none",...p.style}}/></label>)}

function Sel({label,children,t,...p}){return(<label style={{fontSize:11,color:t.ts,display:"block"}}>{label}<select {...p} style={{width:"100%",marginTop:2,padding:"8px 10px",borderRadius:7,border:`1px solid ${t.ibr}`,fontSize:12,background:t.ib,color:t.text,boxSizing:"border-box",...p.style}}>{children}</select></label>)}

function useF(ini){const[f,setF]=useState(ini);const set=(k,v)=>setF(p=>({...p,[k]:v}));return[f,set,setF]}

function useIsMobile(){const[m,setM]=useState(()=>typeof window!=="undefined"&&window.matchMedia("(max-width: 767px)").matches);useEffect(()=>{const mq=window.matchMedia("(max-width: 767px)");const h=e=>setM(e.matches);if(mq.addEventListener)mq.addEventListener("change",h);else mq.addListener(h);return()=>{if(mq.removeEventListener)mq.removeEventListener("change",h);else mq.removeListener(h)}},[]);return m}

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

    <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"minmax(0,1fr) minmax(0,1fr) minmax(0,auto)",gap:16}}>
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

    <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"minmax(0,1fr) minmax(0,1fr)",gap:16}}>
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
    <div style={{display:"grid",gridTemplateColumns:t.m?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
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
    <div style={{display:"grid",gridTemplateColumns:t.m?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:16}}>
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
  const inc=stats.incomeThisMonth||0;const exp=stats.expenseThisMonth||0;
  const sr=inc>0?((inc-exp)/inc*100):0;
  const ef=exp*6;
  const ce=data.goals.filter(g=>g.name.includes("ฉุกเฉิน")).reduce((s,g)=>s+g.saved,0);
  const efMonths=exp>0?(ce/exp):0;
  const di=inc>0?(stats.debtRemaining/(inc*12)*100):0;
  // Score components (0-100)
  const sSavings=sr>=20?25:sr>=15?20:sr>=10?15:sr>=5?8:sr>0?3:0;
  const sEmergency=efMonths>=6?25:efMonths>=3?18:efMonths>=1?10:efMonths>0?4:0;
  const sDebt=stats.debtRemaining===0?25:di<=20?22:di<=30?18:di<=50?10:di<=80?5:0;
  const sInvest=stats.totalPortfolio>0?(stats.totalPortfolio>=inc*6?15:stats.totalPortfolio>=inc?10:5):0;
  const sGoals=data.goals.length>0?(data.goals.some(g=>g.saved>0)?10:5):0;
  const score=Math.round(sSavings+sEmergency+sDebt+sInvest+sGoals);
  const grade=score>=85?"A+":score>=75?"A":score>=65?"B":score>=50?"C":score>=35?"D":"F";
  const gradeColor=score>=75?t.g:score>=50?t.am:t.r;
  const gradeLabel=score>=85?"ยอดเยี่ยม":score>=75?"ดีมาก":score>=65?"ดี":score>=50?"พอใช้":score>=35?"ต้องปรับปรุง":"วิกฤต";
  // Tips
  const tips=[];
  if(sr<20)tips.push({i:"💰",t:`เพิ่ม Savings Rate ให้ถึง 20% (ตอนนี้ ${sr.toFixed(0)}%)`,p:"ตัดรายจ่ายไม่จำเป็น หรือหารายได้เสริม"});
  if(efMonths<6)tips.push({i:"🛡️",t:`สร้างเงินฉุกเฉินให้ครบ 6 เดือนก่อน`,p:`ตอนนี้มี ${efMonths.toFixed(1)} เดือน · ขาดอีก ${fB(Math.max(0,ef-ce))}`});
  if(di>30)tips.push({i:"🏦",t:"ลดสัดส่วนหนี้ต่อรายได้",p:`ตอนนี้ ${di.toFixed(0)}% ของรายได้ต่อปี — ควรไม่เกิน 30%`});
  if(stats.totalPortfolio===0)tips.push({i:"📈",t:"เริ่มลงทุนเพื่อสร้างความมั่งคั่ง",p:"DCA กองทุนรวมเดือนละ 5-10% ของรายได้"});
  if(data.goals.length===0)tips.push({i:"🎯",t:"ตั้งเป้าหมายการเงิน",p:"การมีเป้าชัดทำให้ออมเงินมีจุดมุ่งหมาย"});
  if(!tips.length)tips.push({i:"🌟",t:"คุณจัดการการเงินได้ยอดเยี่ยม!",p:"รักษามาตรฐานนี้ไว้ และพิจารณาขยับเป้าหมายให้ใหญ่ขึ้น"});
  const breakdown=[
    {l:"💰 อัตราการออม",val:sSavings,max:25,desc:`${sr.toFixed(1)}% ของรายได้`},
    {l:"🛡️ เงินฉุกเฉิน",val:sEmergency,max:25,desc:`${efMonths.toFixed(1)} / 6 เดือน`},
    {l:"🏦 หนี้สิน",val:sDebt,max:25,desc:stats.debtRemaining===0?"ไม่มีหนี้":`${di.toFixed(0)}% ของรายได้/ปี`},
    {l:"📈 ลงทุน",val:sInvest,max:15,desc:stats.totalPortfolio>0?fB(stats.totalPortfolio):"ยังไม่มี"},
    {l:"🎯 เป้าหมาย",val:sGoals,max:10,desc:data.goals.length>0?`${data.goals.length} เป้าหมาย`:"ยังไม่ตั้ง"},
  ];
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    {/* Score Hero */}
    <div style={{background:t.card,border:`2px solid ${gradeColor}`,borderRadius:14,padding:20,display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
      <div style={{position:"relative",width:130,height:130,flexShrink:0}}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="55" stroke={t.cb} strokeWidth="10" fill="none"/>
          <circle cx="65" cy="65" r="55" stroke={gradeColor} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={`${score/100*345.6} 345.6`} transform="rotate(-90 65 65)" style={{transition:"stroke-dasharray 1s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:32,fontWeight:700,color:gradeColor,lineHeight:1}}>{score}</div>
          <div style={{fontSize:10,color:t.tm,marginTop:2}}>/ 100</div>
          <div style={{fontSize:18,fontWeight:700,color:gradeColor,marginTop:3}}>{grade}</div>
        </div>
      </div>
      <div style={{flex:1,minWidth:200}}>
        <div style={{fontSize:11,color:t.tm,marginBottom:4}}>คะแนนสุขภาพการเงิน</div>
        <div style={{fontSize:22,fontWeight:700,color:t.text,marginBottom:6}}>{gradeLabel}</div>
        <div style={{fontSize:12,color:t.ts,lineHeight:1.5}}>คำนวณจาก 5 ด้าน: การออม, เงินฉุกเฉิน, หนี้สิน, การลงทุน, และเป้าหมาย</div>
      </div>
    </div>

    {/* Score Breakdown */}
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>📊 คะแนนแยกรายด้าน</div>
      {breakdown.map((b,i)=>{const pct=b.val/b.max*100;const c=pct>=80?t.g:pct>=50?t.am:t.r;return(<div key={i} style={{marginBottom:i<breakdown.length-1?12:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,fontSize:12}}>
          <span style={{fontWeight:500}}>{b.l}</span>
          <span style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{color:t.tm,fontSize:10}}>{b.desc}</span>
            <span style={{fontWeight:700,color:c}}>{b.val}/{b.max}</span>
          </span>
        </div>
        <PB pct={pct} color={c} height={7} t={t}/>
      </div>);})}
    </div>

    {/* Tips */}
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>💡 คำแนะนำ ({tips.length})</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {tips.map((tip,i)=>(<div key={i} style={{display:"flex",gap:12,padding:"10px 12px",background:t.bg,borderRadius:8,borderLeft:`3px solid ${t.ac}`}}>
          <div style={{fontSize:22,flexShrink:0}}>{tip.i}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>{tip.t}</div>
            <div style={{fontSize:11,color:t.tm,lineHeight:1.5}}>{tip.p}</div>
          </div>
        </div>))}
      </div>
    </div>

    {/* Quick Stats Cards */}
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💰" label="อัตราการออม" value={`${sr.toFixed(1)}%`} sub={sr>=20?"ดีมาก":sr>=10?"พอใช้":"ปรับปรุง"} t={t} color={sr>=20?t.g:sr>=10?t.am:t.r}/>
      <MC icon="🛡️" label="เงินฉุกเฉิน" value={`${efMonths.toFixed(1)} เดือน`} sub={`เป้า 6 เดือน · มี ${fB(ce)}`} t={t} color={efMonths>=6?t.g:efMonths>=3?t.am:t.r}/>
      <MC icon="📊" label="หนี้/รายได้/ปี" value={`${di.toFixed(1)}%`} t={t} color={di<=30?t.g:di<=50?t.am:t.r}/>
      <MC icon="💎" label="Net Worth" value={fB(stats.netWorth)} t={t} color={t.ac}/>
    </div>
  </div>);
}

/* ═══ FORMS ═══ */
function AssetForm({initial,onSave,onCancel,t,rate}){const[f,set]=useF(initial||{name:"",type:"stock_th",units:"",avgCost:"",currentPrice:"",currency:"THB",note:""});const ok=f.name&&+f.units>0&&+f.avgCost>0&&+f.currentPrice>0;return(<div style={{display:"flex",flexDirection:"column",gap:10}}><Inp label="ชื่อ/Symbol" t={t} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="KBANK, AAPL"/><div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}><Sel label="ประเภท" t={t} value={f.type} onChange={e=>set("type",e.target.value)}>{AT.map(a=><option key={a.v} value={a.v}>{a.i} {a.l}</option>)}</Sel><Sel label="สกุลเงิน" t={t} value={f.currency} onChange={e=>set("currency",e.target.value)}><option value="THB">🇹🇭 THB</option><option value="USD">🇺🇸 USD</option></Sel></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="จำนวน" t={t} type="number" step="any" value={f.units} onChange={e=>set("units",e.target.value)}/><Inp label={`ต้นทุน/หน่วย (${f.currency})`} t={t} type="number" step="any" value={f.avgCost} onChange={e=>set("avgCost",e.target.value)}/></div><Inp label={`ราคาปัจจุบัน/หน่วย (${f.currency})`} t={t} type="number" step="any" value={f.currentPrice} onChange={e=>set("currentPrice",e.target.value)}/>{f.currency==="USD"&&+f.currentPrice>0&&<div style={{fontSize:10,color:t.ac}}>≈ {fB(+f.currentPrice*rate)}/unit</div>}<Inp label="โน้ต" t={t} value={f.note||""} onChange={e=>set("note",e.target.value)}/><div style={{display:"flex",gap:6}}><Btn primary t={t} disabled={!ok} onClick={()=>onSave(f)} style={{flex:1}}>{initial?"💾":"✓ เพิ่ม"}</Btn><Btn t={t} onClick={onCancel}>ยกเลิก</Btn></div></div>)}

function TxnForm({onSave,onCancel,t,initialDate,initial,data}){
  const[f,set]=useF(initial?{type:initial.type,category:initial.category,amount:String(initial.amount),date:initial.date,note:initial.note||""}:{type:"expense",category:"food",amount:"",date:initialDate||td(),note:""});
  const cats=f.type==="income"?IC:EC;const ok=+f.amount>0;
  // Smart Category: build keyword→category map from history (expenses only)
  const noteMap=useMemo(()=>{const m={};(data?.transactions||[]).filter(tx=>tx.type==="expense"&&tx.note).forEach(tx=>{tx.note.toLowerCase().split(/[\s,.-]+/).filter(w=>w.length>=2).forEach(w=>{if(!m[w])m[w]={};m[w][tx.category]=(m[w][tx.category]||0)+1})});return m},[data?.transactions]);
  const suggestion=useMemo(()=>{if(f.type!=="expense"||!f.note||f.note.length<2)return null;const words=f.note.toLowerCase().split(/[\s,.-]+/).filter(w=>w.length>=2);const scores={};words.forEach(w=>{if(noteMap[w])Object.entries(noteMap[w]).forEach(([c,n])=>{scores[c]=(scores[c]||0)+n})});const top=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];return(top&&top[0]!==f.category)?top[0]:null},[f.note,f.category,f.type,noteMap]);
  const sugCat=suggestion?EC.find(c=>c.v===suggestion):null;
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{display:"flex",gap:6}}>{["income","expense"].map(tp=>(<button key={tp} onClick={()=>{set("type",tp);set("category",tp==="income"?"salary":"food")}} style={{flex:1,padding:8,border:f.type===tp?"none":`1px solid ${t.cb}`,borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:500,background:f.type===tp?(tp==="income"?t.g:t.r):"transparent",color:f.type===tp?"#fff":t.ts}}>{tp==="income"?"💵 รายรับ":"💸 รายจ่าย"}</button>))}</div>
    <Sel label="หมวดหมู่" t={t} value={f.category} onChange={e=>set("category",e.target.value)}>{cats.map(c=><option key={c.v} value={c.v}>{c.i} {c.l}</option>)}</Sel>
    {sugCat&&<button type="button" onClick={()=>set("category",suggestion)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",border:`1px dashed ${t.ac}`,borderRadius:8,background:`${t.ac}10`,cursor:"pointer",color:t.ac,fontSize:11,textAlign:"left"}}>💡 น่าจะเป็นหมวด <b>{sugCat.i} {sugCat.l}</b> ใช่ไหม? <span style={{marginLeft:"auto",fontSize:10,color:t.tm}}>คลิกเพื่อเปลี่ยน →</span></button>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="จำนวนเงิน (฿)" t={t} type="number" inputMode="decimal" value={f.amount} onChange={e=>set("amount",e.target.value)}/><Inp label="วันที่" t={t} type="date" value={f.date} onChange={e=>set("date",e.target.value)}/></div>
    {/* Quick amount chips — tap to add to current amount */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
      {(f.type==="income"?[[1000,"1K"],[5000,"5K"],[10000,"10K"],[15000,"15K"],[20000,"20K"]]:[[50,"50"],[100,"100"],[200,"200"],[500,"500"],[1000,"1K"]]).map(([v,l])=>(
        <button key={v} type="button" onClick={()=>{haptic(5);set("amount",String((+f.amount||0)+v))}} style={{padding:"7px 14px",border:`1px solid ${t.cb}`,borderRadius:99,background:t.bg,color:t.text,fontSize:12,fontWeight:600,cursor:"pointer",minHeight:34,touchAction:"manipulation"}}>+{l}</button>
      ))}
      {+f.amount>0&&<button type="button" onClick={()=>{haptic(5);set("amount","")}} aria-label="ล้างจำนวน" title="ล้าง" style={{padding:"7px 11px",border:`1px solid ${t.cb}`,borderRadius:99,background:"transparent",color:t.tm,fontSize:12,cursor:"pointer",minHeight:34,marginLeft:"auto"}}>✕</button>}
    </div>
    <Inp label="โน้ต" t={t} value={f.note} onChange={e=>set("note",e.target.value)} placeholder="เช่น เซเว่น, กาแฟสตาร์บัค, ค่าน้ำมัน"/>
    <div style={{display:"flex",gap:6}}><Btn primary t={t} disabled={!ok} onClick={()=>{haptic(15);onSave(f)}} style={{flex:1}}>{initial?"💾 บันทึก":"✓ บันทึก"}</Btn>{onCancel&&<Btn t={t} onClick={onCancel}>ยกเลิก</Btn>}</div>
  </div>);
}

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
const fBshort=v=>{const a=Math.abs(v);if(a>=1000000)return`${(v/1000000).toFixed(1)}M`;if(a>=1000)return`${(v/1000).toFixed(0)}k`;return`${Math.round(v)}`};

function CalendarPage({data,t,onAddTxn,setPage}){
  const[ym,setYm]=useState(()=>mk(td()));
  const[selDay,setSelDay]=useState(td());
  const[y,m]=ym.split("-").map(Number);
  const firstDay=new Date(y,m-1,1).getDay();
  const daysInMonth=new Date(y,m,0).getDate();
  const dayData=useCallback(d=>{const date=`${ym}-${String(d).padStart(2,"0")}`;const txns=data.transactions.filter(tx=>tx.date===date);const inc=txns.filter(tx=>tx.type==="income").reduce((s,tx)=>s+tx.amount,0);const exp=txns.filter(tx=>tx.type==="expense").reduce((s,tx)=>s+tx.amount,0);return{txns,inc,exp}},[data.transactions,ym]);
  const fmt=d=>`${ym}-${String(d).padStart(2,"0")}`;
  const monthInc=Array.from({length:daysInMonth},(_,i)=>dayData(i+1).inc).reduce((s,v)=>s+v,0);
  const monthExp=Array.from({length:daysInMonth},(_,i)=>dayData(i+1).exp).reduce((s,v)=>s+v,0);
  const selData=(()=>{const[yy,mm,dd]=selDay.split("-").map(Number);if(`${yy}-${String(mm).padStart(2,"0")}`!==ym)return{txns:[],inc:0,exp:0};return dayData(dd)})();
  const prev=()=>{const nd=new Date(y,m-2,1);setYm(`${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,"0")}`)};
  const next=()=>{const nd=new Date(y,m,1);setYm(`${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,"0")}`)};
  const upcoming=(data.recurring||[]).filter(r=>!r.disabled).map(r=>({...r,day:Math.min(r.dayOfMonth||1,daysInMonth)})).sort((a,b)=>a.day-b.day);
  const monthName=new Date(y,m-1).toLocaleDateString("th-TH",{month:"long",year:"numeric"});
  const weeks=[];let cur=[];for(let i=0;i<firstDay;i++)cur.push(null);for(let d=1;d<=daysInMonth;d++){cur.push(d);if(cur.length===7){weeks.push(cur);cur=[]}}if(cur.length){while(cur.length<7)cur.push(null);weeks.push(cur)}
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💵" label="รายรับเดือนนี้" value={fB(monthInc)} t={t} color={t.g}/>
      <MC icon="💸" label="รายจ่ายเดือนนี้" value={fB(monthExp)} t={t} color={t.r}/>
      <MC icon="💰" label="คงเหลือ" value={fB(monthInc-monthExp)} t={t} color={monthInc>=monthExp?t.g:t.r}/>
    </div>
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8}}>
        <button onClick={prev} style={{background:"none",border:`1px solid ${t.cb}`,padding:"4px 14px",borderRadius:6,cursor:"pointer",color:t.text,fontSize:14}}>‹</button>
        <div style={{fontSize:15,fontWeight:600}}>📅 {monthName}</div>
        <button onClick={next} style={{background:"none",border:`1px solid ${t.cb}`,padding:"4px 14px",borderRadius:6,cursor:"pointer",color:t.text,fontSize:14}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
        {["อา","จ","อ","พ","พฤ","ศ","ส"].map((d,i)=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:600,color:i===0?t.r:t.tm,padding:"4px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
        {weeks.flat().map((d,i)=>{
          if(!d)return<div key={i} style={{minHeight:64}}/>;
          const dt=fmt(d);const{inc,exp,txns}=dayData(d);const isToday=dt===td();const isSel=dt===selDay;const dow=i%7;
          return(<button key={i} onClick={()=>setSelDay(dt)} style={{minHeight:64,padding:"4px 4px",border:`1px solid ${isSel?t.ac:t.cb}`,borderRadius:6,background:isSel?`${t.ac}15`:isToday?`${t.am}10`:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",fontSize:11,gap:1,color:t.text,position:"relative",textAlign:"left"}}>
            <span style={{fontSize:11,fontWeight:isToday?700:500,color:isToday?t.am:dow===0?t.r:t.text}}>{d}{isToday&&<span style={{fontSize:8,marginLeft:3}}>•</span>}</span>
            {(inc>0||exp>0)&&<div style={{display:"flex",flexDirection:"column",gap:1,fontSize:9,width:"100%",alignItems:"flex-start",lineHeight:1.2}}>
              {inc>0&&<span style={{color:t.g,fontWeight:600}}>+{fBshort(inc)}</span>}
              {exp>0&&<span style={{color:t.r,fontWeight:600}}>-{fBshort(exp)}</span>}
            </div>}
            {txns.length>0&&<div style={{position:"absolute",bottom:3,right:4,fontSize:8,color:t.tm,background:`${t.tm}20`,borderRadius:8,padding:"0 4px"}}>{txns.length}</div>}
          </button>);
        })}
      </div>
    </div>
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:6}}>
        <div style={{fontSize:13,fontWeight:600}}>{new Date(selDay).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric",weekday:"long"})}</div>
        <div style={{fontSize:11,color:t.tm}}>{selData.txns.length} รายการ {selData.inc>0&&<span style={{color:t.g,marginLeft:6}}>+{fB(selData.inc)}</span>} {selData.exp>0&&<span style={{color:t.r,marginLeft:6}}>-{fB(selData.exp)}</span>}</div>
      </div>
      {selData.txns.length===0?<div style={{textAlign:"center",color:t.tm,fontSize:11,padding:20}}>ไม่มีรายการในวันนี้ <button onClick={()=>{onAddTxn&&onAddTxn(selDay)}} style={{background:"none",border:"none",color:t.ac,cursor:"pointer",fontSize:11,marginLeft:4,textDecoration:"underline"}}>+ เพิ่ม</button></div>:
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {selData.txns.map(tx=>{const cats=tx.type==="income"?IC:EC;const cat=cats.find(c=>c.v===tx.category)||cats[cats.length-1];return(<div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:t.bg,border:`1px solid ${t.cb}`}}>
            <span style={{fontSize:18}}>{cat.i}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500}}>{tx.note||cat.l}</div>
              <div style={{fontSize:10,color:t.tm}}>{cat.l}</div>
            </div>
            <span style={{fontSize:13,fontWeight:600,color:tx.type==="income"?t.g:t.r}}>{tx.type==="income"?"+":"-"}{fB(tx.amount)}</span>
          </div>);})}
        </div>}
    </div>
    {upcoming.length>0&&<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🔁 รายการประจำของเดือนนี้</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {upcoming.map(r=>{const cats=r.type==="income"?IC:EC;const cat=cats.find(c=>c.v===r.category)||cats[cats.length-1];return(<div key={r.id} onClick={()=>setSelDay(fmt(r.day))} style={{display:"flex",alignItems:"center",gap:10,fontSize:11,padding:"8px 6px",borderBottom:`1px solid ${t.cb}`,cursor:"pointer"}}>
          <span style={{color:t.tm,width:60,fontSize:10}}>วันที่ {r.day}</span>
          <span style={{fontSize:14}}>{cat.i}</span>
          <span style={{flex:1,fontWeight:500}}>{r.name||cat.l}</span>
          <span style={{color:r.type==="income"?t.g:t.r,fontWeight:600}}>{r.type==="income"?"+":"-"}{fB(r.amount)}</span>
        </div>);})}
      </div>
    </div>}
  </div>);
}

function EnvelopesPage({data,persist,t}){
  const budgets=data.budgets||{};
  const tm=mk(td());
  const spent={};data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===tm).forEach(tx=>{spent[tx.category]=(spent[tx.category]||0)+tx.amount});
  const monthInc=data.transactions.filter(tx=>tx.type==="income"&&mk(tx.date)===tm).reduce((s,tx)=>s+tx.amount,0);
  const totalAlloc=EC.reduce((s,c)=>s+(+budgets[c.v]||0),0);
  const unalloc=monthInc-totalAlloc;
  const setEnv=(k,v)=>persist({...data,budgets:{...budgets,[k]:+v||0}});
  const autoAlloc=()=>{if(!window.confirm("จัดสรรอัตโนมัติตามสัดส่วนรายจ่ายเฉลี่ย 3 เดือนล่าสุด?\n(จะเขียนทับซองเดิมที่ตั้งไว้)"))return;const ms=[];for(let i=0;i<3;i++){const d=new Date();d.setMonth(d.getMonth()-i);ms.push(mk(d.toISOString().slice(0,10)))}const totals={};let grand=0;EC.forEach(c=>{totals[c.v]=data.transactions.filter(tx=>tx.type==="expense"&&tx.category===c.v&&ms.includes(mk(tx.date))).reduce((s,tx)=>s+tx.amount,0)/3;grand+=totals[c.v]});if(grand===0){window.alert("ยังไม่มีข้อมูลรายจ่าย 3 เดือนย้อนหลังพอที่จะจัดสรรอัตโนมัติ");return}const newB={...budgets};EC.forEach(c=>{newB[c.v]=Math.round(totals[c.v])});persist({...data,budgets:newB})};
  const reset=()=>{if(window.confirm("ล้างซองทั้งหมด?")){const newB={};EC.forEach(c=>newB[c.v]=0);persist({...data,budgets:newB})}};
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💵" label="รายรับเดือนนี้" value={fB(monthInc)} t={t} color={t.g}/>
      <MC icon="💌" label="จัดสรรเข้าซองรวม" value={fB(totalAlloc)} sub={monthInc>0?`${(totalAlloc/monthInc*100).toFixed(0)}% ของรายรับ`:""} t={t} color={t.ac}/>
      <MC icon="🪙" label={unalloc>=0?"ยังไม่จัดสรร":"จัดสรรเกินรายรับ"} value={fB(Math.abs(unalloc))} t={t} color={unalloc>=0?t.am:t.r}/>
    </div>
    <div style={{background:`${t.ac}10`,border:`1px solid ${t.ac}40`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <span style={{fontSize:11,color:t.ts,flex:1,minWidth:200}}>💡 <b>แนวคิดซองเงิน</b>: ใส่เงินเข้าซองตามหมวดค่าใช้จ่าย เมื่อซองหมด = หยุดใช้หมวดนั้น เพื่อสร้างวินัยการใช้เงิน</span>
      <Btn small t={t} onClick={autoAlloc}>🤖 จัดสรรอัตโนมัติ</Btn>
      <Btn small t={t} onClick={reset} style={{color:t.r,borderColor:`${t.r}40`}}>🗑 ล้าง</Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
      {EC.map(c=>{
        const b=+budgets[c.v]||0;const s=spent[c.v]||0;const remain=b-s;const pct=b>0?(s/b*100):0;
        const status=b===0?"empty":pct>=100?"over":pct>=80?"low":"ok";
        const col=status==="over"?t.r:status==="low"?t.am:status==="ok"?t.g:t.tm;
        const fillH=Math.max(0,100-Math.min(pct,100));
        return(<div key={c.v} style={{background:t.card,border:`2px solid ${b>0?col:t.cb}`,borderRadius:12,padding:14,position:"relative",overflow:"hidden",minHeight:200}}>
          <div style={{position:"absolute",left:0,right:0,bottom:0,height:`${100-fillH}%`,background:`${col}10`,transition:"height .3s",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:40,height:40,borderRadius:10,background:`${col}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{c.i}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600}}>{c.l}</div>
                <div style={{fontSize:10,color:t.tm}}>💌 ซองเงิน</div>
              </div>
              {b>0&&<div style={{fontSize:10,fontWeight:700,color:col,padding:"3px 7px",borderRadius:6,background:`${col}20`}}>{status==="over"?"⚠️ เกิน":status==="low"?"⚠ ใกล้หมด":"✓ ปกติ"}</div>}
            </div>
            <div style={{fontSize:10,color:t.tm,marginBottom:5,display:"flex",alignItems:"center",gap:4}}>💵 <span>เงินในซอง</span></div>
            <div style={{position:"relative",marginBottom:10}}>
              <div style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",width:26,height:26,borderRadius:8,background:b>0?col:t.cb,color:b>0?"#fff":t.tm,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,transition:"all .2s",pointerEvents:"none"}}>฿</div>
              <input type="number" inputMode="decimal" value={b||""} onChange={e=>setEnv(c.v,e.target.value)} onFocus={e=>{e.target.parentElement.style.boxShadow=`0 0 0 3px ${col}30`;e.target.style.borderColor=col}} onBlur={e=>{e.target.parentElement.style.boxShadow="none";e.target.style.borderColor=t.ibr}} placeholder="0" style={{width:"100%",boxSizing:"border-box",padding:"12px 14px 12px 44px",borderRadius:10,border:`1.5px solid ${t.ibr}`,fontSize:18,background:t.ib,color:t.text,fontWeight:700,letterSpacing:0.3,outline:"none",transition:"border-color .2s,box-shadow .2s",fontFamily:"inherit",display:"block"}}/>
            </div>
            {b>0&&<><PB pct={Math.min(pct,100)} color={col} height={10} t={t}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginTop:6}}>
                <span style={{color:t.tm}}>ใช้ไป {fB(s)}</span>
                <span style={{color:col,fontWeight:600}}>{pct.toFixed(0)}%</span>
              </div>
              <div style={{textAlign:"center",fontSize:13,fontWeight:700,marginTop:8,color:col}}>
                {pct>=100?`⚠️ เกินซอง ${fB(s-b)}`:`💰 เหลือ ${fB(remain)}`}
              </div></>}
          </div>
        </div>);
      })}
    </div>
  </div>);
}

function AnalyticsPage({data,stats,t}){
  const[range,setRange]=useState("6m");
  const tdy=new Date();
  const monthsBack=range==="3m"?3:range==="12m"?12:6;
  const months=useMemo(()=>{
    const arr=[];
    for(let i=monthsBack-1;i>=0;i--){const d=new Date(tdy.getFullYear(),tdy.getMonth()-i,1);arr.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`)}
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[monthsBack]);
  const tm=mk(td());
  // Pie data this month
  const expByCat={};
  data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===tm).forEach(tx=>{expByCat[tx.category]=(expByCat[tx.category]||0)+tx.amount});
  const pieData=EC.map(c=>({name:c.l,icon:c.i,key:c.v,value:expByCat[c.v]||0,color:c.v==="food"?"#EF4444":c.v==="transport"?"#F59E0B":c.v==="shopping"?"#EC4899":c.v==="bills"?"#8B5CF6":c.v==="health"?"#10B981":c.v==="entertainment"?"#3B82F6":c.v==="education"?"#06B6D4":"#6B7280"})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);
  const totalExpThis=pieData.reduce((s,d)=>s+d.value,0);
  // Monthly trend per category
  const trend=months.map(m=>{const row={month:m.slice(5)+"/"+m.slice(2,4)};EC.forEach(c=>{row[c.v]=0});data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===m).forEach(tx=>{row[tx.category]=(row[tx.category]||0)+tx.amount});row.total=Object.keys(row).filter(k=>k!=="month"&&k!=="total").reduce((s,k)=>s+row[k],0);return row});
  // Savings rate trend
  const srTrend=months.map(m=>{const inc=data.transactions.filter(tx=>tx.type==="income"&&mk(tx.date)===m).reduce((s,tx)=>s+tx.amount,0);const exp=data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===m).reduce((s,tx)=>s+tx.amount,0);return{month:m.slice(5)+"/"+m.slice(2,4),income:inc,expense:exp,saving:inc-exp,rate:inc>0?+((inc-exp)/inc*100).toFixed(1):0}});
  // Top categories with prev-month comparison
  const prevTm=months[months.length-2];
  const prevByCat={};
  if(prevTm)data.transactions.filter(tx=>tx.type==="expense"&&mk(tx.date)===prevTm).forEach(tx=>{prevByCat[tx.category]=(prevByCat[tx.category]||0)+tx.amount});
  const topCats=pieData.slice(0,5).map(d=>{const prev=prevByCat[d.key]||0;const change=prev>0?((d.value-prev)/prev*100):(d.value>0?100:0);return{...d,prev,change}});
  // Avg expense per day
  const dayInMonth=tdy.getDate();
  const avgPerDay=dayInMonth>0?totalExpThis/dayInMonth:0;
  // Forecast: project end-of-month total based on avg/day
  const daysInMonth=new Date(tdy.getFullYear(),tdy.getMonth()+1,0).getDate();
  const remainingDays=daysInMonth-dayInMonth;
  const projected=Math.round(avgPerDay*daysInMonth);
  const totalBudget=Object.values(data?.budgets||{}).reduce((s,v)=>s+(+v||0),0);
  const overBudget=totalBudget>0?projected-totalBudget:0;
  // Heatmap: last ~13 weeks aligned to Sunday-start
  const heatmap=useMemo(()=>{
    const dailyExp={};
    data.transactions.filter(tx=>tx.type==="expense").forEach(tx=>{dailyExp[tx.date]=(dailyExp[tx.date]||0)+tx.amount});
    const today=new Date();today.setHours(12,0,0,0);
    const start=new Date(today);start.setDate(today.getDate()-89);
    while(start.getDay()!==0)start.setDate(start.getDate()-1);
    const cells=[];const cur=new Date(start);
    while(cur<=today){const k=cur.toISOString().slice(0,10);cells.push({date:k,day:cur.getDay(),amount:dailyExp[k]||0});cur.setDate(cur.getDate()+1)}
    const weeks=[];for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
    const max=Math.max(1,...cells.map(c=>c.amount));
    return{weeks,max};
  },[data.transactions]);
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
      <div style={{display:"flex",gap:5}}>
        {[{k:"3m",l:"3 เดือน"},{k:"6m",l:"6 เดือน"},{k:"12m",l:"12 เดือน"}].map(r=>(<button key={r.k} onClick={()=>setRange(r.k)} style={{padding:"6px 14px",fontSize:11,border:`1px solid ${range===r.k?t.ac:t.cb}`,borderRadius:7,cursor:"pointer",background:range===r.k?`${t.ac}15`:"transparent",color:range===r.k?t.ac:t.text,fontWeight:range===r.k?600:400}}>{r.l}</button>))}
      </div>
    </div>

    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💸" label="รายจ่ายเดือนนี้" value={fB(totalExpThis)} t={t} color={t.r}/>
      <MC icon="📅" label="เฉลี่ย/วัน" value={fB(avgPerDay)} t={t}/>
      <MC icon="📊" label="หมวดที่ใช้สุด" value={topCats[0]?(topCats[0].icon+" "+topCats[0].name):"-"} sub={topCats[0]?fB(topCats[0].value):""} t={t} color={t.am}/>
      <MC icon="💰" label="Savings Rate ล่าสุด" value={`${srTrend[srTrend.length-1]?.rate||0}%`} t={t} color={(srTrend[srTrend.length-1]?.rate||0)>=20?t.g:t.am}/>
    </div>

    {/* Forecast end-of-month */}
    {totalExpThis>0&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <span style={{fontSize:18}}>🔮</span>
        <div style={{fontSize:14,fontWeight:600}}>คาดการณ์สิ้นเดือน</div>
      </div>
      <div style={{fontSize:10,color:t.tm,marginBottom:14}}>ประมาณการจากค่าเฉลี่ยรายจ่ายต่อวัน × {daysInMonth} วัน</div>
      <div style={{display:"grid",gridTemplateColumns:t.m?"1fr 1fr":"repeat(3, minmax(0,1fr))",gap:12}}>
        <div style={{background:t.bg,border:`1px solid ${t.cb}`,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:t.tm,marginBottom:4}}>ใช้ไปแล้ว</div>
          <div style={{fontSize:16,fontWeight:700,color:t.text}}>{fB(totalExpThis)}</div>
          <div style={{fontSize:10,color:t.tm,marginTop:2}}>{dayInMonth}/{daysInMonth} วัน</div>
        </div>
        <div style={{background:`${t.ac}10`,border:`1px solid ${t.ac}40`,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:t.tm,marginBottom:4}}>คาดการณ์ทั้งเดือน</div>
          <div style={{fontSize:16,fontWeight:700,color:t.ac}}>{fB(projected)}</div>
          <div style={{fontSize:10,color:t.tm,marginTop:2}}>เหลืออีก {remainingDays} วัน</div>
        </div>
        {totalBudget>0&&(<div style={{background:overBudget>0?`${t.r}10`:`${t.g}10`,border:`1px solid ${overBudget>0?t.r:t.g}40`,borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:t.tm,marginBottom:4}}>เทียบงบ ({fB(totalBudget)})</div>
          <div style={{fontSize:16,fontWeight:700,color:overBudget>0?t.r:t.g}}>{overBudget>0?"+":""}{fB(overBudget)}</div>
          <div style={{fontSize:10,color:overBudget>0?t.r:t.g,marginTop:2,fontWeight:600}}>{overBudget>0?"⚠️ จะเกินงบ":"✅ อยู่ในงบ"}</div>
        </div>)}
      </div>
      {totalBudget>0&&overBudget>0&&remainingDays>0&&(<div style={{marginTop:12,padding:"10px 12px",background:`${t.am}15`,border:`1px solid ${t.am}40`,borderRadius:8,fontSize:11,color:t.text}}>
        💡 ลดรายจ่ายเหลือ <b>{fB(Math.max(0,(totalBudget-totalExpThis)/Math.max(1,remainingDays)))}/วัน</b> เพื่อไม่ให้เกินงบ
      </div>)}
    </div>)}

    {/* Spending Heatmap */}
    {data.transactions.some(tx=>tx.type==="expense")&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <span style={{fontSize:18}}>🗓️</span>
        <div style={{fontSize:14,fontWeight:600}}>Spending Heatmap (90 วันล่าสุด)</div>
      </div>
      <div style={{fontSize:10,color:t.tm,marginBottom:14}}>วันที่สีเข้ม = ใช้เงินเยอะ · สีอ่อน = ใช้น้อย</div>
      <div style={{display:"flex",gap:10,alignItems:"flex-start",overflowX:"auto",paddingBottom:6}}>
        {/* Day-of-week labels */}
        <div style={{display:"flex",flexDirection:"column",gap:3,paddingTop:0,flexShrink:0}}>
          {["อา","จ","อ","พ","พฤ","ศ","ส"].map((d,i)=>(<div key={i} style={{fontSize:9,color:t.tm,height:14,lineHeight:"14px",textAlign:"right",width:18}}>{i%2===1?d:""}</div>))}
        </div>
        {/* Week columns */}
        <div style={{display:"flex",gap:3,flexShrink:0}}>
          {heatmap.weeks.map((week,wi)=>(<div key={wi} style={{display:"flex",flexDirection:"column",gap:3}}>
            {Array.from({length:7}).map((_,di)=>{
              const cell=week[di];
              if(!cell)return<div key={di} style={{width:14,height:14}}/>;
              const intensity=cell.amount/heatmap.max;
              const lvl=cell.amount===0?0:intensity<0.25?1:intensity<0.5?2:intensity<0.75?3:4;
              const colors=[t.cb,`${t.ac}30`,`${t.ac}60`,`${t.ac}90`,t.ac];
              return(<div key={di} title={`${cell.date}: ${cell.amount>0?fB(cell.amount):"ไม่มีรายจ่าย"}`} style={{width:14,height:14,borderRadius:3,background:colors[lvl],cursor:"pointer"}}/>);
            })}
          </div>))}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,marginTop:12,fontSize:10,color:t.tm}}>
        <span>น้อย</span>
        {[t.cb,`${t.ac}30`,`${t.ac}60`,`${t.ac}90`,t.ac].map((c,i)=>(<div key={i} style={{width:12,height:12,borderRadius:3,background:c}}/>))}
        <span>เยอะ</span>
      </div>
    </div>)}

    {/* Pie chart this month */}
    {pieData.length>0&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>🥧 สัดส่วนรายจ่าย (เดือนนี้)</div>
      <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"minmax(0,1fr) minmax(0,1fr)",gap:18,alignItems:"center"}}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie>
            <Tooltip formatter={v=>fB(v)} contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:6,fontSize:11}}/>
          </PieChart>
        </ResponsiveContainer>
        <div>{pieData.map((d,i)=>{const pct=totalExpThis>0?(d.value/totalExpThis*100):0;return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:i<pieData.length-1?`1px solid ${t.cb}`:"none"}}>
          <div style={{width:14,height:14,borderRadius:4,background:d.color,flexShrink:0}}/>
          <span style={{fontSize:13}}>{d.icon}</span>
          <span style={{flex:1,fontSize:12,fontWeight:500}}>{d.name}</span>
          <span style={{fontSize:11,color:t.tm}}>{pct.toFixed(0)}%</span>
          <span style={{fontSize:12,fontWeight:600,minWidth:70,textAlign:"right"}}>{fB(d.value)}</span>
        </div>);})}</div>
      </div>
    </div>)}

    {/* Top 5 categories with comparison */}
    {topCats.length>0&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>🏆 Top 5 หมวดที่ใช้เยอะสุด</div>
      <div style={{fontSize:10,color:t.tm,marginBottom:12}}>เปรียบเทียบกับเดือนก่อนหน้า</div>
      {topCats.map((c,i)=>{const up=c.change>0;const sym=c.prev>0?(up?"▲":"▼"):"NEW";const col=c.prev===0?t.ac:up?t.r:t.g;return(<div key={c.key} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<topCats.length-1?`1px solid ${t.cb}`:"none"}}>
        <div style={{width:24,height:24,borderRadius:"50%",background:`${c.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:c.color}}>{i+1}</div>
        <span style={{fontSize:16}}>{c.icon}</span>
        <span style={{flex:1,fontSize:12,fontWeight:500}}>{c.name}</span>
        <span style={{fontSize:10,color:t.tm}}>เดือนก่อน {fB(c.prev)}</span>
        <Badge color={col}>{sym} {c.prev>0?`${Math.abs(c.change).toFixed(0)}%`:""}</Badge>
        <span style={{fontSize:13,fontWeight:600,minWidth:80,textAlign:"right"}}>{fB(c.value)}</span>
      </div>);})}
    </div>)}

    {/* Trend by category - stacked bar */}
    {trend.some(r=>r.total>0)&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>📊 รายจ่ายแยกหมวด ({monthsBack} เดือน)</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={trend} margin={{top:10,right:10,left:0,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.cb} vertical={false}/>
          <XAxis dataKey="month" tick={{fontSize:10,fill:t.tm}}/>
          <YAxis tick={{fontSize:10,fill:t.tm}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}K`:v}/>
          <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:6,fontSize:11}} formatter={(v,n)=>[fB(v),EC.find(c=>c.v===n)?.l||n]}/>
          <Legend wrapperStyle={{fontSize:10}} formatter={n=>EC.find(c=>c.v===n)?.l||n}/>
          {EC.map((c,i)=>{const colors=["#EF4444","#F59E0B","#EC4899","#8B5CF6","#10B981","#3B82F6","#06B6D4","#6B7280"];return<Bar key={c.v} dataKey={c.v} stackId="a" fill={colors[i]}/>})}
        </BarChart>
      </ResponsiveContainer>
    </div>)}

    {/* Savings rate trend */}
    {srTrend.some(r=>r.income>0)&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:18}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>💰 Savings Rate ({monthsBack} เดือน)</div>
      <div style={{fontSize:10,color:t.tm,marginBottom:12}}>% ของรายได้ที่เก็บออม (เกิน 20% = ดีมาก)</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={srTrend} margin={{top:10,right:10,left:0,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.cb}/>
          <XAxis dataKey="month" tick={{fontSize:10,fill:t.tm}}/>
          <YAxis tick={{fontSize:10,fill:t.tm}} tickFormatter={v=>`${v}%`} domain={[(min)=>Math.min(0,min),(max)=>Math.max(40,max)]}/>
          <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:6,fontSize:11}} formatter={(v,n)=>n==="rate"?[`${v}%`,"Savings Rate"]:[fB(v),n]}/>
          <ReferenceLine y={20} stroke={t.g} strokeDasharray="5 3" label={{value:"เป้า 20%",fill:t.g,fontSize:10,position:"insideTopRight"}}/>
          <Line type="monotone" dataKey="rate" stroke={t.ac} strokeWidth={3} dot={{fill:t.ac,r:5}} activeDot={{r:7}}/>
        </LineChart>
      </ResponsiveContainer>
    </div>)}

    {pieData.length===0&&<Empty icon="📊" title="ยังไม่มีข้อมูลรายจ่าย" sub="เพิ่มรายการรายจ่ายเพื่อดูสถิติ" t={t}/>}
  </div>);
}

/* ═══ TAX CALCULATOR (ภาษีเงินได้บุคคลธรรมดา ระบบไทย) ═══ */
/* ประเภทเงินได้ ม.40 พร้อมอัตราหักค่าใช้จ่าย */
const TAX_INC_TYPES=[
  {v:"401",l:"ม.40(1)+(2) เงินเดือน/รับจ้างทำงาน",expPct:50,expMax:100000},
  {v:"403",l:"ม.40(3) ค่าลิขสิทธิ์/สิทธิบัตร",expPct:50,expMax:100000},
  {v:"404a",l:"ม.40(4)(ก) ดอกเบี้ย",expPct:0,expMax:0},
  {v:"404b",l:"ม.40(4)(ข) เงินปันผล (ถือหุ้นไทย)",expPct:0,expMax:0},
  {v:"405a",l:"ม.40(5)(ก) ค่าเช่าบ้าน/อาคาร",expPct:30,expMax:null},
  {v:"405b",l:"ม.40(5)(ข) ค่าเช่ายานพาหนะ",expPct:30,expMax:null},
  {v:"406a",l:"ม.40(6) วิชาชีพ (แพทย์/ทนาย/บัญชี/วิศวกร)",expPct:60,expMax:null},
  {v:"406b",l:"ม.40(6) วิชาชีพอื่น (สถาปนิก/ช่างภาพ ฯลฯ)",expPct:30,expMax:null},
  {v:"407",l:"ม.40(7) รับเหมาก่อสร้าง",expPct:70,expMax:null},
  {v:"408",l:"ม.40(8) อื่นๆ/ธุรกิจทั่วไป",expPct:60,expMax:null},
];
/* อัตราภาษีบันได 2567 */
const TAX_BRACKETS=[
  {min:0,max:150000,rate:0},
  {min:150000,max:300000,rate:5},
  {min:300000,max:500000,rate:10},
  {min:500000,max:750000,rate:15},
  {min:750000,max:1000000,rate:20},
  {min:1000000,max:2000000,rate:25},
  {min:2000000,max:5000000,rate:30},
  {min:5000000,max:Infinity,rate:35},
];

function calcTax(net){
  let tax=0;const detail=[];
  for(const b of TAX_BRACKETS){
    if(net<=b.min)break;
    const taxable=Math.min(net,b.max)-b.min;
    const t=taxable*(b.rate/100);
    detail.push({...b,taxable,tax:t});
    tax+=t;
  }
  return{tax:Math.max(0,tax),detail};
}

function TaxPage({t}){
  const[incomes,setIncomes]=useState([{id:"i1",type:"401",amount:""}]);
  const[ded,setDed]=useF({
    spouse:false,children:"0",parents:"0",disabledDep:"0",
    lifeIns:"",healthIns:"",parentHealthIns:"",socSec:"",
    rmf:"",ssf:"",tesg:"",pvd:"",
    homeLoan:"",donate:"",donateDouble:"",
    withheld:"",
  });
  const[year,setYear]=useState("2567");

  /* Income + expense deduction */
  const incomeData=useMemo(()=>incomes.map(inc=>{
    const tp=TAX_INC_TYPES.find(x=>x.v===inc.type)||TAX_INC_TYPES[0];
    const gross=+inc.amount||0;
    const exp=tp.expMax!==null?Math.min(gross*tp.expPct/100,tp.expMax):gross*tp.expPct/100;
    return{...inc,gross,exp,net:gross-exp,label:tp.l};
  }),[incomes]);
  const totalGross=incomeData.reduce((s,x)=>s+x.gross,0);
  const totalExp=incomeData.reduce((s,x)=>s+x.exp,0);
  const totalIncNet=incomeData.reduce((s,x)=>s+x.net,0);

  /* Deduction caps */
  const d={
    personal:60000,
    spouse:ded.spouse?60000:0,
    children:Math.min(+ded.children||0,10)*30000,
    parents:Math.min(+ded.parents||0,4)*30000,
    disabledDep:Math.min(+ded.disabledDep||0,4)*60000,
    lifeIns:Math.min(+ded.lifeIns||0,100000),
    healthIns:Math.min(+ded.healthIns||0,25000),
    parentHealthIns:Math.min(+ded.parentHealthIns||0,15000),
    socSec:Math.min(+ded.socSec||0,9000),
    rmf:Math.min(+ded.rmf||0,totalGross*0.30,500000),
    ssf:Math.min(+ded.ssf||0,totalGross*0.30,200000),
    tesg:Math.min(+ded.tesg||0,totalGross*0.30,300000),
    pvd:Math.min(+ded.pvd||0,totalGross*0.15,500000),
    homeLoan:Math.min(+ded.homeLoan||0,100000),
    donate:Math.min(+ded.donate||0,(totalIncNet-0)*0.10),
    donateDouble:Math.min((+ded.donateDouble||0)*2,(totalIncNet-0)*0.10),
  };
  const totalDed=Object.values(d).reduce((s,v)=>s+v,0);
  const netIncome=Math.max(0,totalIncNet-totalDed);
  const {tax,detail}=calcTax(netIncome);
  const withHeld=+ded.withheld||0;
  const payOrRefund=tax-withHeld;

  const addIncome=()=>setIncomes(p=>[...p,{id:uid(),type:"401",amount:""}]);
  const updateIncome=(id,k,v)=>setIncomes(p=>p.map(i=>i.id===id?{...i,[k]:v}:i));
  const delIncome=id=>setIncomes(p=>p.filter(i=>i.id!==id));

  const fN=v=>v.toLocaleString("th-TH",{maximumFractionDigits:0});
  const DedRow=({label,val,cap,note})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:`1px solid ${t.cb}`,gap:8}}>
      <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,color:t.text}}>{label}</div>{note&&<div style={{fontSize:9,color:t.tm}}>{note}</div>}</div>
      <span style={{fontSize:12,fontWeight:500,color:val>0?t.g:t.tm,minWidth:70,textAlign:"right"}}>฿{fN(val)}</span>
      {cap!==undefined&&<span style={{fontSize:9,color:t.tm,width:70,textAlign:"right"}}>max {fN(cap)}</span>}
    </div>
  );

  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    {/* Summary */}
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💰" label="เงินได้รวม" value={`฿${fN(totalGross)}`} t={t}/>
      <MC icon="📋" label="ค่าใช้จ่าย+ลดหย่อน" value={`฿${fN(totalExp+totalDed)}`} t={t} color={t.g}/>
      <MC icon="📊" label="เงินได้สุทธิ" value={`฿${fN(netIncome)}`} t={t} color={t.am}/>
      <MC icon={payOrRefund>=0?"💸":"🎉"} label={payOrRefund>=0?"ภาษีที่ต้องจ่าย":"ภาษีที่ได้คืน"} value={`฿${fN(Math.abs(payOrRefund))}`} t={t} color={payOrRefund>=0?t.r:t.g}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"minmax(0,1fr) minmax(320px,380px)",gap:14,alignItems:"start"}}>
      {/* LEFT: เงินได้ + ลดหย่อน */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* เงินได้ */}
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:600}}>💰 เงินได้ (ปี พ.ศ. <input value={year} onChange={e=>setYear(e.target.value)} style={{width:52,padding:"2px 6px",borderRadius:5,border:`1px solid ${t.ibr}`,fontSize:13,background:t.ib,color:t.text,textAlign:"center"}}/>)</div>
            <Btn small primary t={t} onClick={addIncome}>+ เพิ่มแหล่งเงินได้</Btn>
          </div>
          {incomeData.map((inc,i)=>(
            <div key={inc.id} style={{marginBottom:10,padding:10,borderRadius:8,border:`1px solid ${t.cb}`,background:t.bg}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                <select value={inc.type} onChange={e=>updateIncome(inc.id,"type",e.target.value)} style={{flex:1,padding:"6px 8px",borderRadius:6,border:`1px solid ${t.ibr}`,fontSize:11,background:t.ib,color:t.text}}>
                  {TAX_INC_TYPES.map(tp=><option key={tp.v} value={tp.v}>{tp.l}</option>)}
                </select>
                {incomes.length>1&&<button onClick={()=>delIncome(inc.id)} style={{padding:"4px 8px",border:"none",borderRadius:5,background:t.rL,color:t.r,cursor:"pointer",fontSize:11}}>✕</button>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Inp label="เงินได้รวมทั้งปี (฿)" t={t} type="number" value={inc.amount} onChange={e=>updateIncome(inc.id,"amount",e.target.value)} style={{flex:1}}/>
                <div style={{fontSize:10,color:t.tm,textAlign:"right",whiteSpace:"nowrap"}}>
                  <div>หักค่าใช้จ่าย</div>
                  <div style={{color:t.g,fontWeight:500}}>฿{fN(inc.exp)}</div>
                  <div style={{color:t.tm,fontSize:9}}>{TAX_INC_TYPES.find(x=>x.v===inc.type)?.expPct||0}%{TAX_INC_TYPES.find(x=>x.v===inc.type)?.expMax?" max "+fN(TAX_INC_TYPES.find(x=>x.v===inc.type).expMax):""}</div>
                </div>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"flex-end",gap:16,padding:"8px 0 0",borderTop:`1px solid ${t.cb}`,fontSize:11}}>
            <span style={{color:t.ts}}>เงินได้รวม ฿{fN(totalGross)}</span>
            <span style={{color:t.g}}>หักค่าใช้จ่าย ฿{fN(totalExp)}</span>
            <span style={{color:t.ac,fontWeight:600}}>เงินได้หลังหัก ฿{fN(totalIncNet)}</span>
          </div>
        </div>

        {/* ค่าลดหย่อน */}
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>📋 ค่าลดหย่อน</div>
          <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"1fr 1fr",gap:16}}>
            {/* คอลัมน์ซ้าย */}
            <div>
              <div style={{fontSize:11,fontWeight:600,color:t.ac,marginBottom:8}}>👤 ส่วนตัวและครอบครัว</div>
              <DedRow label="ค่าลดหย่อนส่วนตัว" val={d.personal}/>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${t.cb}`}}>
                <input type="checkbox" checked={ded.spouse} onChange={e=>setDed("spouse",e.target.checked)} id="spouse"/>
                <label htmlFor="spouse" style={{fontSize:11,cursor:"pointer",flex:1}}>คู่สมรสไม่มีเงินได้</label>
                <span style={{fontSize:12,fontWeight:500,color:ded.spouse?t.g:t.tm}}>฿{fN(d.spouse)}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"8px 0",borderBottom:`1px solid ${t.cb}`}}>
                <Inp label="บุตร (คน, max 10)" t={t} type="number" min="0" max="10" value={ded.children} onChange={e=>setDed("children",e.target.value)}/>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><span style={{fontSize:11,color:t.tm}}>= ฿{fN(d.children)}</span><span style={{fontSize:9,color:t.tm}}>30,000/คน</span></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"8px 0",borderBottom:`1px solid ${t.cb}`}}>
                <Inp label="พ่อแม่ (คน, max 4)" t={t} type="number" min="0" max="4" value={ded.parents} onChange={e=>setDed("parents",e.target.value)}/>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><span style={{fontSize:11,color:t.tm}}>= ฿{fN(d.parents)}</span><span style={{fontSize:9,color:t.tm}}>30,000/คน (อายุ 60+)</span></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"8px 0",borderBottom:`1px solid ${t.cb}`}}>
                <Inp label="ผู้พิการ/ทุพพลภาพ (คน)" t={t} type="number" min="0" max="4" value={ded.disabledDep} onChange={e=>setDed("disabledDep",e.target.value)}/>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><span style={{fontSize:11,color:t.tm}}>= ฿{fN(d.disabledDep)}</span><span style={{fontSize:9,color:t.tm}}>60,000/คน</span></div>
              </div>

              <div style={{fontSize:11,fontWeight:600,color:t.ac,margin:"12px 0 8px"}}>🏦 ประกันและกองทุน</div>
              <Inp label="เบี้ยประกันชีวิต ฿ (max 100,000)" t={t} type="number" value={ded.lifeIns} onChange={e=>setDed("lifeIns",e.target.value)}/>
              <div style={{height:6}}/>
              <Inp label="ประกันสุขภาพตัวเอง ฿ (max 25,000)" t={t} type="number" value={ded.healthIns} onChange={e=>setDed("healthIns",e.target.value)}/>
              <div style={{height:6}}/>
              <Inp label="ประกันสุขภาพพ่อแม่ ฿ (max 15,000)" t={t} type="number" value={ded.parentHealthIns} onChange={e=>setDed("parentHealthIns",e.target.value)}/>
              <div style={{height:6}}/>
              <Inp label="เงินสมทบประกันสังคม ฿ (max 9,000)" t={t} type="number" value={ded.socSec} onChange={e=>setDed("socSec",e.target.value)}/>
            </div>

            {/* คอลัมน์ขวา */}
            <div>
              <div style={{fontSize:11,fontWeight:600,color:t.ac,marginBottom:8}}>📈 กองทุนเพื่อการลงทุน</div>
              <Inp label="กองทุน RMF ฿ (max 30% เงินได้, 500K)" t={t} type="number" value={ded.rmf} onChange={e=>setDed("rmf",e.target.value)}/>
              <div style={{fontSize:9,color:t.tm,marginBottom:6}}>ใช้ได้จริง: ฿{fN(d.rmf)}</div>
              <Inp label="กองทุน SSF ฿ (max 30%, 200K)" t={t} type="number" value={ded.ssf} onChange={e=>setDed("ssf",e.target.value)}/>
              <div style={{fontSize:9,color:t.tm,marginBottom:6}}>ใช้ได้จริง: ฿{fN(d.ssf)}</div>
              <Inp label="กองทุน TESG ฿ (max 30%, 300K)" t={t} type="number" value={ded.tesg} onChange={e=>setDed("tesg",e.target.value)}/>
              <div style={{fontSize:9,color:t.tm,marginBottom:6}}>ใช้ได้จริง: ฿{fN(d.tesg)}</div>
              <Inp label="กองทุนสำรองเลี้ยงชีพ PVD ฿ (max 15%, 500K)" t={t} type="number" value={ded.pvd} onChange={e=>setDed("pvd",e.target.value)}/>
              <div style={{fontSize:9,color:t.tm,marginBottom:6}}>ใช้ได้จริง: ฿{fN(d.pvd)}</div>

              <div style={{fontSize:11,fontWeight:600,color:t.ac,margin:"8px 0"}}>🏠 อื่นๆ</div>
              <Inp label="ดอกเบี้ยเงินกู้บ้าน ฿ (max 100,000)" t={t} type="number" value={ded.homeLoan} onChange={e=>setDed("homeLoan",e.target.value)}/>
              <div style={{height:6}}/>
              <Inp label="เงินบริจาคทั่วไป ฿ (max 10% เงินได้สุทธิ)" t={t} type="number" value={ded.donate} onChange={e=>setDed("donate",e.target.value)}/>
              <div style={{fontSize:9,color:t.tm,marginBottom:6}}>ใช้ได้จริง: ฿{fN(d.donate)}</div>
              <Inp label="บริจาคการศึกษา/สาธารณสุข ฿ (ลด 2 เท่า)" t={t} type="number" value={ded.donateDouble} onChange={e=>setDed("donateDouble",e.target.value)}/>
              <div style={{fontSize:9,color:t.tm,marginBottom:6}}>ใช้ได้จริง: ฿{fN(d.donateDouble)} (×2)</div>
              <div style={{marginTop:8}}>
                <Inp label="ภาษีหัก ณ ที่จ่ายทั้งปี ฿" t={t} type="number" value={ded.withheld} onChange={e=>setDed("withheld",e.target.value)}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",padding:"10px 0 0",borderTop:`1px solid ${t.cb}`,marginTop:8}}>
            <span style={{fontSize:13,fontWeight:600,color:t.g}}>ค่าลดหย่อนรวม ฿{fN(totalDed)}</span>
          </div>
        </div>
      </div>

      {/* RIGHT: สรุปภาษี + บันได */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* สรุป */}
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>📊 สรุปการคำนวณ</div>
          {[
            {l:"เงินได้รวม",v:totalGross,c:t.text},
            {l:"หัก ค่าใช้จ่าย",v:-totalExp,c:t.g},
            {l:"เงินได้หลังหักค่าใช้จ่าย",v:totalIncNet,c:t.text,bold:true},
            {l:"หัก ค่าลดหย่อน",v:-totalDed,c:t.g},
            {l:"เงินได้สุทธิ",v:netIncome,c:t.am,bold:true},
            {l:`ภาษีที่คำนวณได้ (${year})`,v:tax,c:t.r,bold:true},
            {l:"หัก ภาษีหัก ณ ที่จ่าย",v:-withHeld,c:t.g},
          ].map(({l,v,c,bold},i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.cb}`,fontSize:12,fontWeight:bold?600:400}}>
            <span style={{color:t.ts}}>{l}</span>
            <span style={{color:c}}>{v<0?"-":""} ฿{fN(Math.abs(v))}</span>
          </div>))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0 0",fontSize:15,fontWeight:700}}>
            <span style={{color:payOrRefund>=0?t.r:t.g}}>{payOrRefund>=0?"ภาษีที่ต้องจ่าย":"ภาษีที่ได้คืน"}</span>
            <span style={{color:payOrRefund>=0?t.r:t.g}}>฿{fN(Math.abs(payOrRefund))}</span>
          </div>
          {totalGross>0&&<div style={{marginTop:6,fontSize:10,color:t.tm}}>อัตราภาษีที่แท้จริง {(tax/totalGross*100).toFixed(2)}% ของเงินได้รวม</div>}
        </div>

        {/* บันไดภาษี */}
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>📐 บันไดภาษี {year}</div>
          <div style={{display:"flex",gap:4,marginBottom:8,fontSize:9,color:t.tm,justifyContent:"space-between",padding:"0 4px"}}><span>ขั้น</span><span>เงินได้สุทธิ</span><span>อัตรา</span><span>ภาษีขั้นนี้</span></div>
          {TAX_BRACKETS.map((b,i)=>{
            const hit=detail.find(d=>d.min===b.min);
            const active=hit&&hit.taxable>0;
            return(<div key={i} style={{display:"flex",gap:4,alignItems:"center",padding:"5px 4px",borderRadius:5,marginBottom:2,background:active?`${t.ac}12`:"transparent",border:`1px solid ${active?t.ac:t.cb}`}}>
              <Badge color={b.rate===0?t.g:b.rate<=15?t.am:t.r}>{b.rate}%</Badge>
              <span style={{flex:1,fontSize:10,color:t.ts}}>{fN(b.min+1)}–{b.max===Infinity?"∞":fN(b.max)}</span>
              <span style={{fontSize:10,color:t.tm,width:60,textAlign:"right"}}>{active?`฿${fN(hit.taxable)}`:"-"}</span>
              <span style={{fontSize:11,fontWeight:active?600:400,color:active?t.r:t.tm,width:70,textAlign:"right"}}>{active?`฿${fN(Math.round(hit.tax))}`:"-"}</span>
            </div>);
          })}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 4px 0",borderTop:`1px solid ${t.cb}`,marginTop:4}}>
            <span style={{fontSize:12,fontWeight:600}}>รวมภาษี</span>
            <span style={{fontSize:13,fontWeight:700,color:t.r}}>฿{fN(Math.round(tax))}</span>
          </div>
        </div>

        <div style={{background:`${t.am}10`,border:`1px solid ${t.am}30`,borderRadius:10,padding:12,fontSize:10,color:t.tm,lineHeight:1.6}}>
          ⚠️ <b>หมายเหตุ:</b> การคำนวณนี้เป็นการประมาณการเบื้องต้น ตัวเลขจริงอาจต่างกันขึ้นอยู่กับรายละเอียดของแต่ละบุคคล กรุณาตรวจสอบกับสรรพากรหรือนักบัญชีก่อนยื่นแบบ
        </div>
      </div>
    </div>
  </div>);
}

/* ═══ CASH FLOW DETAIL (งบกระแสเงินสดละเอียด ตามแบบมาตรฐานไทย) ═══ */
/* NOTE: sub-components ต้องอยู่ระดับ module — ถ้าประกาศใน parent จะ unmount ทุกครั้งที่ re-render ทำให้ input เสีย focus */
function CFRow({item,row,setVal,pct,t,onRename,onDelete}){
  return(<tr style={{borderBottom:`1px solid ${t.cb}`}}>
    <td style={{padding:"6px 10px",fontSize:11,color:t.text}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{flex:1,cursor:"pointer"}} onClick={onRename} title="คลิกเพื่อเปลี่ยนชื่อ">{item.l}</span>
        <button onClick={onDelete} title="ลบหัวข้อ" style={{fontSize:11,padding:"2px 6px",border:"none",borderRadius:4,background:"transparent",cursor:"pointer",color:t.tm,lineHeight:1}}>✕</button>
      </div>
    </td>
    <td style={{padding:"4px 6px",width:130}}><input type="number" value={row[item.k]??""} onChange={e=>setVal(item.k,e.target.value)} style={{width:"100%",padding:"5px 8px",borderRadius:6,border:`1px solid ${t.ibr}`,fontSize:11,background:t.ib,color:t.text,textAlign:"right"}}/></td>
    <td style={{padding:"6px 10px",fontSize:11,color:t.tm,width:60,textAlign:"right"}}>{(+row[item.k])?pct(+row[item.k]).toFixed(2):"0"}</td>
  </tr>);
}
function CFHead({children,t}){return(<tr style={{background:t.thBg}}><th colSpan={3} style={{padding:"8px 10px",textAlign:"left",fontSize:12,fontWeight:600,color:t.text,borderBottom:`2px solid ${t.cb}`}}>{children}</th></tr>)}
function CFTotal({label,val,color,totalIn,pct,fmt}){return(<tr style={{background:`${color}10`}}><td style={{padding:"8px 10px",fontSize:11,fontWeight:600,color}}>{label}</td><td style={{padding:"8px 10px",fontSize:12,fontWeight:600,color,textAlign:"right"}}>{fmt(val)}</td><td style={{padding:"8px 10px",fontSize:11,fontWeight:600,color,textAlign:"right"}}>{totalIn>0?pct(val).toFixed(2):"0"}</td></tr>)}
function CFAddRow({onAdd,t}){return(<tr><td colSpan={3} style={{padding:"6px 10px",background:t.bg}}><button onClick={onAdd} style={{fontSize:11,padding:"4px 12px",border:`1px dashed ${t.ac}`,borderRadius:6,background:"transparent",cursor:"pointer",color:t.ac,fontWeight:500}}>+ เพิ่มหัวข้อ</button></td></tr>)}

function CashFlowDetailPage({data,persist,t}){
  const[period,setPeriod]=useState("monthly");
  const[mKey,setMKey]=useState(mk(td()));
  const[yKey,setYKey]=useState(td().slice(0,4));
  const key=period==="monthly"?mKey:yKey;
  const store=(data.cashFlow||{})[period]||{};
  const row=store[key]||{};
  const setVal=(k,v)=>{const n=+v||0;persist({...data,cashFlow:{...(data.cashFlow||{monthly:{},yearly:{}}),[period]:{...store,[key]:{...row,[k]:n}}}})};
  const delPeriod=()=>{if(!window.confirm(`ลบข้อมูล ${key}?`))return;const n={...store};delete n[key];persist({...data,cashFlow:{...(data.cashFlow||{monthly:{},yearly:{}}),[period]:n}})};

  /* Dynamic items (user can add/rename/delete) */
  const itemsFor=s=>(data.cfItems&&data.cfItems[s])||CF_DEFAULTS[s];
  const inflow=itemsFor("inflow"),fixed=itemsFor("fixed"),variable=itemsFor("variable"),saving=itemsFor("saving");
  const persistItems=(section,newList)=>{const full={inflow:itemsFor("inflow"),fixed:itemsFor("fixed"),variable:itemsFor("variable"),saving:itemsFor("saving"),[section]:newList};persist({...data,cfItems:full})};
  const addItem=section=>{const name=window.prompt("ชื่อหัวข้อใหม่:");if(!name||!name.trim())return;persistItems(section,[...itemsFor(section),{k:uid(),l:name.trim()}])};
  const renameItem=(section,k)=>{const cur=itemsFor(section).find(it=>it.k===k);const name=window.prompt("แก้ไขชื่อหัวข้อ:",cur?.l);if(name===null||!name.trim())return;persistItems(section,itemsFor(section).map(it=>it.k===k?{...it,l:name.trim()}:it))};
  const delItem=(section,k)=>{const cur=itemsFor(section).find(it=>it.k===k);if(!window.confirm(`ลบ "${cur?.l}"? ข้อมูลตัวเลขของหัวข้อนี้ในทุกช่วงเวลาจะหายไปด้วย`))return;persistItems(section,itemsFor(section).filter(it=>it.k!==k))};

  const sum=items=>items.reduce((s,it)=>s+(+row[it.k]||0),0);
  const totalIn=sum(inflow);const totalFixed=sum(fixed);const totalVar=sum(variable);const totalSave=sum(saving);const totalOut=totalFixed+totalVar+totalSave;const net=totalIn-totalOut;
  const pct=v=>totalIn>0?(v/totalIn*100):0;
  const fmt=v=>v?v.toLocaleString("th-TH",{maximumFractionDigits:0}):"0";

  /* Period list */
  const periods=Object.keys(store).sort().reverse();
  const curYear=new Date().getFullYear();
  const years=[];for(let y=curYear+1;y>=curYear-5;y--)years.push(String(y));
  const months=[];for(let i=0;i<24;i++){const d=new Date();d.setMonth(d.getMonth()-i);months.push(mk(d.toISOString().slice(0,10)))}

  const exportPDF=()=>{
    const title=period==="monthly"?`งบกระแสเงินสด เดือน ${fm(mKey)}`:`งบกระแสเงินสด ปี ${yKey}`;
    const w=window.open("","_blank");
    const mkRows=items=>items.map(it=>{const v=+row[it.k]||0;return`<tr><td>${it.l}</td><td class="num">${fmt(v)}</td><td class="num">${v?pct(v).toFixed(2):"0"}</td></tr>`}).join("");
    w.document.write(`<html><head><title>${title}</title><style>
      body{font-family:'Sarabun','Segoe UI',sans-serif;padding:30px;color:#1e293b;font-size:12px}
      h1{color:#0ea5e9;font-size:18px;margin:0 0 4px}
      .sub{color:#64748b;font-size:11px;margin-bottom:20px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
      table{width:100%;border-collapse:collapse;margin-bottom:16px}
      th,td{padding:6px 10px;border:1px solid #cbd5e1;text-align:left}
      th{background:#f1f5f9;font-weight:600}
      .num{text-align:right}
      .sec{background:#e0f2fe;font-weight:600}
      .tot{background:#fef3c7;font-weight:600}
      .net{background:#d1fae5;font-weight:700;font-size:13px}
      @media print{body{padding:15px}}
    </style></head><body>
      <h1>${title}</h1>
      <div class="sub">WealthHub — พิมพ์เมื่อ ${new Date().toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"})}</div>
      <div class="grid">
        <div>
          <table>
            <thead><tr class="sec"><th>กระแสเงินสดรับ</th><th class="num">บาท</th><th class="num">ร้อยละ</th></tr></thead>
            <tbody>${mkRows(inflow)}<tr class="tot"><td>รวมกระแสเงินสดรับ</td><td class="num">${fmt(totalIn)}</td><td class="num">100</td></tr></tbody>
          </table>
          <table>
            <thead><tr class="sec"><th>กระแสเงินสดจ่ายคงที่</th><th class="num">บาท</th><th class="num">ร้อยละ</th></tr></thead>
            <tbody>${mkRows(fixed)}<tr class="tot"><td>รวมกระแสเงินสดจ่ายคงที่</td><td class="num">${fmt(totalFixed)}</td><td class="num">${totalIn>0?pct(totalFixed).toFixed(2):"0"}</td></tr></tbody>
          </table>
        </div>
        <div>
          <table>
            <thead><tr class="sec"><th>กระแสเงินสดจ่ายผันแปร</th><th class="num">บาท</th><th class="num">ร้อยละ</th></tr></thead>
            <tbody>${mkRows(variable)}<tr class="tot"><td>รวมกระแสเงินสดจ่ายผันแปร</td><td class="num">${fmt(totalVar)}</td><td class="num">${totalIn>0?pct(totalVar).toFixed(2):"0"}</td></tr></tbody>
          </table>
          <table>
            <thead><tr class="sec"><th>กระแสเงินสดจ่ายเพื่อการออม / การลงทุน</th><th class="num">บาท</th><th class="num">ร้อยละ</th></tr></thead>
            <tbody>${mkRows(saving)}<tr class="tot"><td>รวมกระแสเงินสดจ่ายเพื่อการออม / การลงทุน</td><td class="num">${fmt(totalSave)}</td><td class="num">${totalIn>0?pct(totalSave).toFixed(2):"0"}</td></tr></tbody>
          </table>
          <table>
            <tbody>
              <tr class="tot"><td>กระแสเงินสดจ่ายรวม</td><td class="num">${fmt(totalOut)}</td><td class="num">${totalIn>0?pct(totalOut).toFixed(2):"0"}</td></tr>
              <tr class="net"><td>กระแสเงินสดสุทธิ</td><td class="num">${net>=0?"":"-"}${fmt(Math.abs(net))}</td><td class="num">${totalIn>0?pct(net).toFixed(2):"0"}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </body></html>`);w.document.close();setTimeout(()=>w.print(),300);
  };

  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    {/* Controls */}
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
      <div style={{display:"flex",gap:4,background:t.bg,borderRadius:8,padding:3}}>
        {[{k:"monthly",l:"รายเดือน"},{k:"yearly",l:"รายปี"}].map(p=>(<button key={p.k} onClick={()=>setPeriod(p.k)} style={{padding:"6px 14px",fontSize:12,border:"none",borderRadius:6,cursor:"pointer",background:period===p.k?t.ac:"transparent",color:period===p.k?"#fff":t.ts,fontWeight:500}}>{p.l}</button>))}
      </div>
      {period==="monthly"?(<select value={mKey} onChange={e=>setMKey(e.target.value)} style={{fontSize:12,padding:"6px 10px",borderRadius:7,border:`1px solid ${t.ibr}`,background:t.ib,color:t.text}}>{[...new Set([...months,...periods])].sort().reverse().map(m=><option key={m} value={m}>{fm(m)}</option>)}</select>
      ):(<select value={yKey} onChange={e=>setYKey(e.target.value)} style={{fontSize:12,padding:"6px 10px",borderRadius:7,border:`1px solid ${t.ibr}`,background:t.ib,color:t.text}}>{[...new Set([...years,...periods])].sort().reverse().map(y=><option key={y} value={y}>ปี {y}</option>)}</select>)}
      <div style={{flex:1}}/>
      <Btn t={t} onClick={exportPDF}>🖨 พิมพ์ / PDF</Btn>
      {periods.includes(key)&&<Btn small danger t={t} onClick={delPeriod}>ลบข้อมูลช่วงนี้</Btn>}
    </div>

    {/* Summary */}
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="⬆" label="กระแสเงินสดรับ" value={fB(totalIn)} t={t} color={t.g}/>
      <MC icon="⬇" label="กระแสเงินสดจ่ายรวม" value={fB(totalOut)} sub={`คงที่ ${fmt(totalFixed)} + ผันแปร ${fmt(totalVar)} + ออม ${fmt(totalSave)}`} t={t} color={t.r}/>
      <MC icon="💰" label="กระแสเงินสดสุทธิ" value={`${net>=0?"+":"-"}${fB(net)}`} sub={totalIn>0?`${pct(net).toFixed(2)}% ของรายรับ`:""} t={t} color={net>=0?t.g:t.r}/>
    </div>

    {/* Tables - 2 columns */}
    <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"minmax(0,1fr) minmax(0,1fr)",gap:14}}>
      {/* LEFT: รับ + จ่ายคงที่ */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:10,overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
            <thead><CFHead t={t}>กระแสเงินสดรับ</CFHead><tr style={{background:t.bg}}><th style={{padding:"6px 10px",fontSize:10,color:t.tm,fontWeight:500,textAlign:"left",borderBottom:`1px solid ${t.cb}`}}>หัวข้อ</th><th style={{padding:"6px 10px",fontSize:10,color:t.tm,fontWeight:500,textAlign:"right",borderBottom:`1px solid ${t.cb}`}}>บาท</th><th style={{padding:"6px 10px",fontSize:10,color:t.tm,fontWeight:500,textAlign:"right",borderBottom:`1px solid ${t.cb}`}}>ร้อยละ</th></tr></thead>
            <tbody>{inflow.map(it=><CFRow key={it.k} item={it} row={row} setVal={setVal} pct={pct} t={t} onRename={()=>renameItem("inflow",it.k)} onDelete={()=>delItem("inflow",it.k)}/>)}<CFAddRow onAdd={()=>addItem("inflow")} t={t}/><CFTotal label="รวมกระแสเงินสดรับ" val={totalIn} color={t.g} totalIn={totalIn} pct={pct} fmt={fmt}/></tbody>
          </table>
        </div>
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:10,overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
            <thead><CFHead t={t}>กระแสเงินสดจ่ายคงที่</CFHead></thead>
            <tbody>{fixed.map(it=><CFRow key={it.k} item={it} row={row} setVal={setVal} pct={pct} t={t} onRename={()=>renameItem("fixed",it.k)} onDelete={()=>delItem("fixed",it.k)}/>)}<CFAddRow onAdd={()=>addItem("fixed")} t={t}/><CFTotal label="รวมกระแสเงินสดจ่ายคงที่" val={totalFixed} color={t.am} totalIn={totalIn} pct={pct} fmt={fmt}/></tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: ผันแปร + ออม + สุทธิ */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:10,overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
            <thead><CFHead t={t}>กระแสเงินสดจ่ายผันแปร</CFHead></thead>
            <tbody>{variable.map(it=><CFRow key={it.k} item={it} row={row} setVal={setVal} pct={pct} t={t} onRename={()=>renameItem("variable",it.k)} onDelete={()=>delItem("variable",it.k)}/>)}<CFAddRow onAdd={()=>addItem("variable")} t={t}/><CFTotal label="รวมกระแสเงินสดจ่ายผันแปร" val={totalVar} color={t.r} totalIn={totalIn} pct={pct} fmt={fmt}/></tbody>
          </table>
        </div>
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:10,overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
            <thead><CFHead t={t}>กระแสเงินสดจ่ายเพื่อการออม / การลงทุน</CFHead></thead>
            <tbody>{saving.map(it=><CFRow key={it.k} item={it} row={row} setVal={setVal} pct={pct} t={t} onRename={()=>renameItem("saving",it.k)} onDelete={()=>delItem("saving",it.k)}/>)}<CFAddRow onAdd={()=>addItem("saving")} t={t}/><CFTotal label="รวมกระแสเงินสดจ่ายเพื่อการออม/การลงทุน" val={totalSave} color={t.ac} totalIn={totalIn} pct={pct} fmt={fmt}/></tbody>
          </table>
        </div>
        <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:10,overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:360}}>
            <tbody>
              <CFTotal label="กระแสเงินสดจ่ายรวม" val={totalOut} color={t.r} totalIn={totalIn} pct={pct} fmt={fmt}/>
              <tr style={{background:net>=0?`${t.g}15`:`${t.r}15`}}><td style={{padding:"10px",fontSize:12,fontWeight:700,color:net>=0?t.g:t.r}}>กระแสเงินสดสุทธิ</td><td style={{padding:"10px",fontSize:14,fontWeight:700,color:net>=0?t.g:t.r,textAlign:"right"}}>{net>=0?"":"-"}{fmt(Math.abs(net))}</td><td style={{padding:"10px",fontSize:12,fontWeight:700,color:net>=0?t.g:t.r,textAlign:"right"}}>{totalIn>0?pct(net).toFixed(2):"0"}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div style={{fontSize:10,color:t.tm,textAlign:"center"}}>* ข้อมูลบันทึกอัตโนมัติ • คลิกชื่อหัวข้อเพื่อเปลี่ยนชื่อ • ✕ เพื่อลบ • "+ เพิ่มหัวข้อ" เพื่อเพิ่ม • ร้อยละคำนวณจากกระแสเงินสดรับรวม</div>
  </div>);
}

/* ═══ TXN PAGE ═══ */
function TxnPage({data,stats,onAdd,onEdit,onDel,t}){
  const[filter,setFilter]=useState("all");
  const[search,setSearch]=useState("");
  const[catFilter,setCatFilter]=useState("all");
  const[dateRange,setDateRange]=useState("month");
  const[customFrom,setCustomFrom]=useState("");
  const[customTo,setCustomTo]=useState("");
  const[minAmt,setMinAmt]=useState("");
  const[maxAmt,setMaxAmt]=useState("");
  const[showAdv,setShowAdv]=useState(false);
  const allCats=useMemo(()=>[...IC.map(c=>({...c,kind:"income"})),...EC.map(c=>({...c,kind:"expense"}))],[]);
  const{from,to}=useMemo(()=>{
    const tdy=new Date();const today=tdy.toISOString().slice(0,10);
    if(dateRange==="all")return{from:null,to:null};
    if(dateRange==="month"){const f=`${mk(today)}-01`;return{from:f,to:today}}
    if(dateRange==="lastmonth"){const d=new Date(tdy.getFullYear(),tdy.getMonth()-1,1);const last=new Date(tdy.getFullYear(),tdy.getMonth(),0);return{from:d.toISOString().slice(0,10),to:last.toISOString().slice(0,10)}}
    if(dateRange==="3m"){const d=new Date(tdy);d.setMonth(d.getMonth()-3);return{from:d.toISOString().slice(0,10),to:today}}
    if(dateRange==="6m"){const d=new Date(tdy);d.setMonth(d.getMonth()-6);return{from:d.toISOString().slice(0,10),to:today}}
    if(dateRange==="year"){return{from:`${tdy.getFullYear()}-01-01`,to:today}}
    if(dateRange==="custom")return{from:customFrom||null,to:customTo||null};
    return{from:null,to:null};
  },[dateRange,customFrom,customTo]);
  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return data.transactions.filter(tx=>{
      if(filter!=="all"&&tx.type!==filter)return false;
      if(catFilter!=="all"&&tx.category!==catFilter)return false;
      if(from&&tx.date<from)return false;
      if(to&&tx.date>to)return false;
      if(minAmt&&tx.amount<+minAmt)return false;
      if(maxAmt&&tx.amount>+maxAmt)return false;
      if(q){
        const cats=tx.type==="income"?IC:EC;
        const cat=cats.find(c=>c.v===tx.category);
        const hay=`${tx.note||""} ${cat?.l||""} ${cat?.v||""}`.toLowerCase();
        if(!hay.includes(q))return false;
      }
      return true;
    }).sort((a,b)=>new Date(b.date)-new Date(a.date));
  },[data.transactions,filter,catFilter,from,to,minAmt,maxAmt,search]);
  const sumInc=filtered.filter(tx=>tx.type==="income").reduce((s,tx)=>s+tx.amount,0);
  const sumExp=filtered.filter(tx=>tx.type==="expense").reduce((s,tx)=>s+tx.amount,0);
  const hasFilter=filter!=="all"||search||catFilter!=="all"||dateRange!=="month"||minAmt||maxAmt;
  const clearAll=()=>{setFilter("all");setSearch("");setCatFilter("all");setDateRange("month");setCustomFrom("");setCustomTo("");setMinAmt("");setMaxAmt("")};
  const ranges=[{k:"month",l:"เดือนนี้"},{k:"lastmonth",l:"เดือนก่อน"},{k:"3m",l:"3 เดือน"},{k:"6m",l:"6 เดือน"},{k:"year",l:"ปีนี้"},{k:"all",l:"ทั้งหมด"},{k:"custom",l:"กำหนดเอง"}];
  const exportCSV=()=>{
    if(!filtered.length){window.alert("ไม่มีรายการให้ส่งออก");return;}
    const esc=v=>{const s=String(v??"").replace(/"/g,'""');return /[",\n]/.test(s)?`"${s}"`:s};
    const rows=[["วันที่","ประเภท","หมวดหมู่","จำนวนเงิน","โน้ต"]];
    filtered.forEach(tx=>{const cats=tx.type==="income"?IC:EC;const cat=cats.find(c=>c.v===tx.category);rows.push([tx.date,tx.type==="income"?"รายรับ":"รายจ่าย",cat?.l||tx.category,tx.amount,tx.note||""])});
    rows.push([]);
    rows.push(["สรุป",`${filtered.length} รายการ`,"","",""]);
    rows.push(["รายรับรวม","","",sumInc,""]);
    rows.push(["รายจ่ายรวม","","",sumExp,""]);
    rows.push(["คงเหลือ","","",sumInc-sumExp,""]);
    const csv="\uFEFF"+rows.map(r=>r.map(esc).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`wealthhub-transactions-${td()}.csv`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <MC icon="💵" label="รายรับ" value={fB(stats.incomeThisMonth)} t={t} color={t.g}/>
      <MC icon="💸" label="รายจ่าย" value={fB(stats.expenseThisMonth)} t={t} color={t.r}/>
      <MC icon="💰" label="คงเหลือ" value={fB(stats.netThisMonth)} t={t} color={stats.netThisMonth>=0?t.g:t.r}/>
    </div>

    {/* Search + Filter Panel */}
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14,display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{flex:1,position:"relative"}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:t.tm,pointerEvents:"none"}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหา... เช่น 7-11, กาแฟ, อาหาร" style={{width:"100%",padding:"8px 32px 8px 32px",borderRadius:8,border:`1px solid ${t.ibr}`,fontSize:12,background:t.ib,color:t.text,boxSizing:"border-box"}}/>
          {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:t.tm,fontSize:13}}>✕</button>}
        </div>
        <button onClick={()=>setShowAdv(s=>!s)} style={{padding:"8px 12px",fontSize:11,border:`1px solid ${showAdv?t.ac:t.cb}`,borderRadius:8,cursor:"pointer",background:showAdv?`${t.ac}15`:"transparent",color:showAdv?t.ac:t.text,fontWeight:500,whiteSpace:"nowrap"}}>{showAdv?"⚙ ปิดตัวกรอง":"⚙ ตัวกรอง"}</button>
        <button onClick={exportCSV} disabled={!filtered.length} style={{padding:"8px 12px",fontSize:11,border:`1px solid ${t.g}40`,borderRadius:8,cursor:filtered.length?"pointer":"not-allowed",background:filtered.length?`${t.g}15`:"transparent",color:t.g,fontWeight:500,whiteSpace:"nowrap",opacity:filtered.length?1:0.4}} title="ส่งออกเป็น CSV (รายการที่กรองไว้)">📤 Export</button>
      </div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[{k:"all",l:"ทั้งหมด",c:t.ac},{k:"income",l:"💵 รายรับ",c:t.g},{k:"expense",l:"💸 รายจ่าย",c:t.r}].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:"5px 12px",fontSize:11,border:filter===f.k?"none":`1px solid ${t.cb}`,borderRadius:7,cursor:"pointer",background:filter===f.k?f.c:"transparent",color:filter===f.k?"#fff":t.ts,fontWeight:filter===f.k?600:400}}>{f.l}</button>
        ))}
      </div>

      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {ranges.map(r=>(
          <button key={r.k} onClick={()=>setDateRange(r.k)} style={{padding:"4px 10px",fontSize:10,border:`1px solid ${dateRange===r.k?t.ac:t.cb}`,borderRadius:6,cursor:"pointer",background:dateRange===r.k?`${t.ac}15`:"transparent",color:dateRange===r.k?t.ac:t.ts,fontWeight:dateRange===r.k?600:400}}>{r.l}</button>
        ))}
      </div>

      {dateRange==="custom"&&(<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:t.tm}}>จาก</span>
        <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={{padding:"5px 8px",fontSize:11,borderRadius:6,border:`1px solid ${t.ibr}`,background:t.ib,color:t.text}}/>
        <span style={{fontSize:11,color:t.tm}}>ถึง</span>
        <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} style={{padding:"5px 8px",fontSize:11,borderRadius:6,border:`1px solid ${t.ibr}`,background:t.ib,color:t.text}}/>
      </div>)}

      {showAdv&&(<div style={{display:"flex",flexDirection:"column",gap:10,paddingTop:10,borderTop:`1px dashed ${t.cb}`}}>
        <div>
          <div style={{fontSize:10,color:t.tm,marginBottom:5}}>หมวดหมู่</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            <button onClick={()=>setCatFilter("all")} style={{padding:"5px 10px",fontSize:10,border:`1px solid ${catFilter==="all"?t.ac:t.cb}`,borderRadius:6,cursor:"pointer",background:catFilter==="all"?`${t.ac}15`:"transparent",color:catFilter==="all"?t.ac:t.ts}}>ทุกหมวด</button>
            {allCats.filter(c=>filter==="all"||c.kind===filter).map(c=>(
              <button key={c.kind+c.v} onClick={()=>setCatFilter(c.v)} style={{padding:"5px 10px",fontSize:10,border:`1px solid ${catFilter===c.v?t.ac:t.cb}`,borderRadius:6,cursor:"pointer",background:catFilter===c.v?`${t.ac}15`:"transparent",color:catFilter===c.v?t.ac:t.ts}}>{c.i} {c.l}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:10,color:t.tm,marginBottom:5}}>ช่วงจำนวนเงิน (฿)</div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input type="number" value={minAmt} onChange={e=>setMinAmt(e.target.value)} placeholder="ต่ำสุด" style={{flex:1,minWidth:100,padding:"6px 10px",fontSize:11,borderRadius:6,border:`1px solid ${t.ibr}`,background:t.ib,color:t.text}}/>
            <span style={{fontSize:11,color:t.tm}}>—</span>
            <input type="number" value={maxAmt} onChange={e=>setMaxAmt(e.target.value)} placeholder="สูงสุด" style={{flex:1,minWidth:100,padding:"6px 10px",fontSize:11,borderRadius:6,border:`1px solid ${t.ibr}`,background:t.ib,color:t.text}}/>
          </div>
        </div>
      </div>)}

      {hasFilter&&(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:`1px solid ${t.cb}`,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:11,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{color:t.text,fontWeight:600}}>📊 พบ {filtered.length} รายการ</span>
          {sumInc>0&&<span style={{color:t.g}}>รายรับ +{fB(sumInc)}</span>}
          {sumExp>0&&<span style={{color:t.r}}>รายจ่าย -{fB(sumExp)}</span>}
          {(sumInc||sumExp)&&<span style={{color:sumInc-sumExp>=0?t.g:t.r,fontWeight:600}}>คงเหลือ {fB(sumInc-sumExp)}</span>}
        </div>
        <button onClick={clearAll} style={{fontSize:10,padding:"4px 10px",border:`1px solid ${t.r}40`,borderRadius:6,background:"transparent",cursor:"pointer",color:t.r}}>✕ ล้างตัวกรอง</button>
      </div>)}
    </div>

    {filtered.length===0?<Empty icon="🔍" title={hasFilter?"ไม่พบรายการที่ตรงกับตัวกรอง":"ไม่มีรายการ"} sub={hasFilter?"ลองเปลี่ยนเงื่อนไขดู":"เพิ่มรายรับหรือรายจ่าย"} action={hasFilter?"✕ ล้างตัวกรอง":"+ บันทึก"} onAction={hasFilter?clearAll:onAdd} t={t}/>:
      (<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,overflow:"hidden"}}>{filtered.map((tx,i)=>{
        const isI=tx.type==="income";const cats=isI?IC:EC;const cat=cats.find(c=>c.v===tx.category)||cats[cats.length-1];
        return(<div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<filtered.length-1?`1px solid ${t.cb}`:"none"}}>
          <div style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,background:isI?`${t.g}18`:`${t.r}18`}}>{cat.i}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.note||cat.l}</div>
            <div style={{fontSize:10,color:t.tm}}>{new Date(tx.date).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"})} · {cat.l}</div>
          </div>
          <span style={{fontSize:13,fontWeight:600,color:isI?t.g:t.r}}>{isI?"+":"-"}{fB(tx.amount)}</span>
          {onEdit&&<button onClick={()=>onEdit(tx)} style={{fontSize:10,padding:"2px 8px",border:`1px solid ${t.cb}`,borderRadius:4,background:"transparent",cursor:"pointer",color:t.ts}} title="แก้ไข">✏</button>}
          <button onClick={()=>{if(window.confirm("ลบรายการนี้?"))onDel(tx.id)}} style={{fontSize:10,padding:"2px 6px",border:`1px solid ${t.cb}`,borderRadius:4,background:"transparent",cursor:"pointer",color:t.tm}} title="ลบ">✕</button>
        </div>);
      })}</div>)}
  </div>);
}

/* ═══ AUTH PAGE ═══ */
function AuthPage({theme,setTheme,t}){
  const[mode,setMode]=useState("login");
  const[email,setEmail]=useState("");
  const[pw,setPw]=useState("");
  const[showPw,setShowPw]=useState(false);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const[msg,setMsg]=useState("");
  const submit=async()=>{
    const emailRe=/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if(!email)return;
    if(!emailRe.test(email)){setErr("รูปแบบอีเมลไม่ถูกต้อง");return;}
    if(mode!=="forgot"&&!pw)return;
    if(mode==="signup"&&pw.length<6){setErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");return;}
    setLoading(true);setErr("");setMsg("");
    if(mode==="login"){
      const{error}=await supabase.auth.signInWithPassword({email,password:pw});
      if(error){
        if(error.message.toLowerCase().includes("email not confirmed"))setErr("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ (เช็ค inbox หรือ Spam)");
        else setErr(error.message);
      }
    }else if(mode==="signup"){
      const{error}=await supabase.auth.signUp({email,password:pw});
      if(error)setErr(error.message);
      else setMsg("✉️ ส่งลิงก์ยืนยันไปที่ "+email+" แล้ว กรุณาคลิกลิงก์ในอีเมลเพื่อยืนยันตัวตน (ถ้าไม่เห็นให้เช็คโฟลเดอร์ Spam / Junk)");
    }else{
      const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
      if(error)setErr(error.message);
      else setMsg("✉️ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ "+email+" แล้ว กรุณาคลิกลิงก์ในอีเมลเพื่อตั้งรหัสผ่านใหม่ (ถ้าไม่เห็นให้เช็ค Spam / Junk)");
    }
    setLoading(false);
  };
  return(<div style={{color:t.text,fontFamily:"'Segoe UI','Noto Sans Thai',system-ui,sans-serif"}}>
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:16,padding:32,width:"min(360px,calc(100vw - 32px))"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:26,fontWeight:700,marginBottom:4}}><span style={{color:t.ac}}>Wealth</span><span style={{color:t.text}}>Hub</span></div>
        <div style={{fontSize:11,color:t.tm}}>ระบบจัดการการเงินส่วนบุคคล</div>
      </div>
      {mode!=="forgot"?(<div style={{display:"flex",gap:4,background:t.bg,borderRadius:8,padding:3,marginBottom:20}}>
        {[{k:"login",l:"เข้าสู่ระบบ"},{k:"signup",l:"ลงทะเบียนใช้งาน"}].map(m=>(<button key={m.k} onClick={()=>{setMode(m.k);setErr("");setMsg("")}} style={{flex:1,padding:"7px",fontSize:12,border:"none",borderRadius:6,cursor:"pointer",background:mode===m.k?t.ac:"transparent",color:mode===m.k?"#fff":t.ts,fontWeight:500}}>{m.l}</button>))}
      </div>):(<div style={{marginBottom:16,fontSize:14,fontWeight:600,color:t.text,textAlign:"center"}}>🔑 ลืมรหัสผ่าน</div>)}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Inp label="อีเมล" t={t} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/>
        {mode!=="forgot"&&(<div style={{position:"relative"}}>
          <Inp label={mode==="signup"?"รหัสผ่าน (อย่างน้อย 6 ตัว)":"รหัสผ่าน"} t={t} type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••" onKeyDown={e=>e.key==="Enter"&&submit()} style={{paddingRight:36}}/>
          <button type="button" onClick={()=>setShowPw(s=>!s)} aria-label={showPw?"ซ่อนรหัสผ่าน":"แสดงรหัสผ่าน"} style={{position:"absolute",right:6,bottom:4,background:"none",border:"none",cursor:"pointer",fontSize:14,color:t.tm,padding:"4px 6px",lineHeight:1}}>{showPw?"🙈":"👁️"}</button>
        </div>)}
        {mode==="login"&&(<button type="button" onClick={()=>{setMode("forgot");setErr("");setMsg("");setPw("")}} style={{background:"none",border:"none",color:t.ac,cursor:"pointer",fontSize:11,textAlign:"right",padding:0,marginTop:-4,alignSelf:"flex-end"}}>ลืมรหัสผ่าน?</button>)}
        {err&&<div style={{fontSize:11,color:t.r,padding:"8px 10px",background:`${t.r}12`,borderRadius:6}}>{err}</div>}
        {msg&&<div style={{fontSize:11,color:t.g,padding:"8px 10px",background:`${t.g}12`,borderRadius:6}}>{msg}</div>}
        <Btn primary t={t} disabled={loading||!email||(mode!=="forgot"&&!pw)} onClick={submit} style={{width:"100%",marginTop:4}}>
          {loading?"กำลังดำเนินการ...":(mode==="login"?"เข้าสู่ระบบ":mode==="signup"?"ลงทะเบียนใช้งาน":"ส่งลิงก์รีเซ็ตรหัสผ่าน")}
        </Btn>
        {mode==="forgot"&&(<button type="button" onClick={()=>{setMode("login");setErr("");setMsg("")}} style={{background:"none",border:"none",color:t.tm,cursor:"pointer",fontSize:11,textAlign:"center"}}>← กลับไปเข้าสู่ระบบ</button>)}
      </div>
      <div style={{marginTop:20,textAlign:"right"}}>
        <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} style={{background:"none",border:"none",color:t.tm,cursor:"pointer",fontSize:11}}>{theme==="dark"?"☀️ Light":"🌙 Dark"}</button>
      </div>
    </div>
  </div>);
}

/* ═══ NOTIFICATIONS ═══ */
async function createNotif(userId,type,title,body,link,dedupKey){
  if(!userId)return;
  try{await supabase.from("notifications").upsert({user_id:userId,type,title,body:body||null,link:link||null,dedup_key:dedupKey||null},{onConflict:"user_id,dedup_key",ignoreDuplicates:true});}catch(e){}
}

function NotifBell({session,t,onNavigate}){
  const[list,setList]=useState([]);const[open,setOpen]=useState(false);
  const unread=list.filter(n=>!n.read_at).length;
  const load=useCallback(async()=>{
    if(!session?.user)return;
    const{data}=await supabase.from("notifications").select("*").eq("user_id",session.user.id).order("created_at",{ascending:false}).limit(30);
    setList(data||[]);
  },[session]);
  useEffect(()=>{load();const i=setInterval(load,60000);return()=>clearInterval(i)},[load]);
  const markRead=async id=>{await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("id",id);load()};
  const markAll=async()=>{await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("user_id",session.user.id).is("read_at",null);load()};
  const remove=async id=>{await supabase.from("notifications").delete().eq("id",id);load()};
  if(!session?.user)return null;
  return(<div style={{position:"relative"}}>
    <button onClick={()=>setOpen(!open)} aria-label="notifications" style={{background:t.card,border:`1px solid ${t.cb}`,color:t.text,fontSize:16,padding:"6px 10px",borderRadius:8,cursor:"pointer",position:"relative",lineHeight:1}}>🔔
      {unread>0&&<span style={{position:"absolute",top:-5,right:-5,background:t.r,color:"#fff",fontSize:9,fontWeight:700,borderRadius:10,minWidth:16,height:16,padding:"0 4px",display:"flex",alignItems:"center",justifyContent:"center"}}>{unread>9?"9+":unread}</span>}
    </button>
    {open&&<>
      <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:200}}/>
      <div style={{position:"absolute",right:0,top:42,width:340,maxHeight:460,overflowY:"auto",background:t.card,border:`1px solid ${t.cb}`,borderRadius:10,boxShadow:"0 10px 30px rgba(0,0,0,0.15)",zIndex:201}}>
        <div style={{padding:"10px 12px",borderBottom:`1px solid ${t.cb}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:t.card}}>
          <div style={{fontSize:12,fontWeight:600}}>🔔 การแจ้งเตือน{unread>0&&` (${unread})`}</div>
          {unread>0&&<button onClick={markAll} style={{background:"none",border:"none",color:t.ac,fontSize:10,cursor:"pointer"}}>อ่านทั้งหมด</button>}
        </div>
        {list.length===0?<div style={{padding:24,textAlign:"center",color:t.tm,fontSize:11}}>ยังไม่มีการแจ้งเตือน</div>:
          list.map(n=>(<div key={n.id} onClick={()=>{markRead(n.id);if(n.link&&onNavigate){onNavigate(n.link);setOpen(false)}}} style={{padding:"10px 12px",borderBottom:`1px solid ${t.cb}`,cursor:n.link?"pointer":"default",background:n.read_at?"transparent":`${t.ac}10`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:600,color:t.text}}>{!n.read_at&&<span style={{color:t.ac,marginRight:4}}>•</span>}{n.title}</div>
                {n.body&&<div style={{fontSize:10,color:t.ts,marginTop:3,whiteSpace:"pre-wrap"}}>{n.body}</div>}
                <div style={{fontSize:9,color:t.tm,marginTop:4}}>{new Date(n.created_at).toLocaleString("th-TH",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();remove(n.id)}} style={{background:"none",border:"none",color:t.tm,cursor:"pointer",fontSize:12,padding:"0 2px"}}>✕</button>
            </div>
          </div>))}
      </div>
    </>}
  </div>);
}

/* ═══ NET WORTH HISTORY ═══ */
function NetWorthHistoryChart({session,t}){
  const[rows,setRows]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!session?.user){setLoading(false);return}
    supabase.from("net_worth_history").select("*").eq("user_id",session.user.id).order("date").limit(365).then(({data})=>{setRows(data||[]);setLoading(false)});
  },[session]);
  if(!session?.user||loading)return null;
  if(rows.length<2)return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
    <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>📈 มูลค่าสุทธิย้อนหลัง</div>
    <div style={{fontSize:11,color:t.tm,padding:"20px 0",textAlign:"center"}}>ระบบจะเก็บข้อมูลให้อัตโนมัติวันละ 1 ครั้งเมื่อคุณเข้าใช้งาน ({rows.length}/2 วัน)</div>
  </div>);
  const chartData=rows.map(r=>({date:r.date.slice(5),netWorth:+r.net_worth,assets:+(r.assets||0),liabilities:+(r.liabilities||0)}));
  const first=+rows[0].net_worth,last=+rows[rows.length-1].net_worth;
  const change=last-first,pct=first!==0?(change/Math.abs(first))*100:0;
  return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6,marginBottom:10}}>
      <div>
        <div style={{fontSize:13,fontWeight:600}}>📈 มูลค่าสุทธิย้อนหลัง ({rows.length} วัน)</div>
        <div style={{fontSize:10,color:t.tm,marginTop:2}}>บันทึกอัตโนมัติเมื่อเข้าใช้งานแต่ละวัน</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:14,fontWeight:700,color:change>=0?t.g:t.r}}>{change>=0?"▲":"▼"} {fB(Math.abs(change))}</div>
        <div style={{fontSize:10,color:change>=0?t.g:t.r}}>{pct>=0?"+":""}{pct.toFixed(2)}% ตั้งแต่เริ่มเก็บ</div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{top:8,right:10,left:0,bottom:4}}>
        <defs><linearGradient id="nwgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.ac} stopOpacity={0.35}/><stop offset="95%" stopColor={t.ac} stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke={t.cb} vertical={false}/>
        <XAxis dataKey="date" tick={{fontSize:9,fill:t.ts}}/>
        <YAxis tick={{fontSize:9,fill:t.tm}} tickFormatter={v=>v>=1000000?`฿${(v/1000000).toFixed(1)}M`:v>=1000?`฿${(v/1000).toFixed(0)}k`:`฿${v}`} width={55}/>
        <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:6,fontSize:11}} formatter={v=>fB(v)}/>
        <Area type="monotone" dataKey="netWorth" name="มูลค่าสุทธิ" stroke={t.ac} strokeWidth={2} fill="url(#nwgrad)"/>
      </AreaChart>
    </ResponsiveContainer>
  </div>);
}

/* ═══ CHALLENGES ═══ */
function genCode(){return Math.random().toString(36).substring(2,8).toUpperCase()}

function ChallengesPage({t,session,rate,toThb,detailId,setDetailId}){
  const[challenges,setChallenges]=useState([]);
  const[loading,setLoading]=useState(false);
  const[modal,setModal]=useState(null);
  const load=useCallback(async()=>{
    setLoading(true);
    const{data:rows,error}=await supabase.from("challenge_members").select("challenge:challenges(*)").eq("user_id",session.user.id);
    if(!error&&rows)setChallenges(rows.map(r=>r.challenge).filter(Boolean).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)));
    setLoading(false);
  },[session.user.id]);
  useEffect(()=>{if(!detailId)load();},[detailId,load]);
  if(detailId)return<ChallengeDetail id={detailId} onBack={()=>setDetailId(null)} t={t} session={session} rate={rate} toThb={toThb}/>;
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <Btn primary t={t} onClick={()=>setModal({type:"create"})}>+ สร้างชาเลนจ์</Btn>
      <Btn t={t} onClick={()=>setModal({type:"join"})}>🔑 เข้าร่วมด้วยรหัส</Btn>
    </div>
    {loading?<div style={{color:t.tm,fontSize:12,padding:20,textAlign:"center"}}>กำลังโหลด...</div>:
     challenges.length===0?<Empty icon="🏆" title="ยังไม่มีชาเลนจ์" sub="สร้างชาเลนจ์ใหม่ หรือเข้าร่วมด้วยรหัสเชิญจากเพื่อน" t={t}/>:
     <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
       {challenges.map(c=>(<div key={c.id} onClick={()=>setDetailId(c.id)} style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16,cursor:"pointer",transition:"transform .1s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
         <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>🏆 {c.name}</div>
         {c.description&&<div style={{fontSize:11,color:t.tm,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.description}</div>}
         <div style={{fontSize:10,color:t.tm}}>เริ่ม {c.start_date}{c.end_date?` · สิ้นสุด ${c.end_date}`:" · ไม่มีวันสิ้นสุด"}</div>
         <div style={{fontSize:10,color:t.ac,marginTop:6}}>รหัสเชิญ: <code style={{fontWeight:600}}>{c.join_code}</code></div>
       </div>))}
     </div>}
    <Modal open={modal?.type==="create"} onClose={()=>setModal(null)} title="🏆 สร้างชาเลนจ์" t={t}>
      <CreateChallengeForm onClose={created=>{setModal(null);if(created)setDetailId(created);else load()}} t={t} session={session}/>
    </Modal>
    <Modal open={modal?.type==="join"} onClose={()=>setModal(null)} title="🔑 เข้าร่วมชาเลนจ์" t={t}>
      <JoinChallengeForm onClose={joined=>{setModal(null);if(joined)setDetailId(joined);else load()}} t={t} session={session}/>
    </Modal>
  </div>);
}

function CreateChallengeForm({onClose,t,session}){
  const[f,set]=useF({mode:"investment",name:"",description:"",end_date:"",starting_cash:"",target_amount:"",forbidden:["food","shopping","entertainment"]});
  const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const toggleCat=v=>set("forbidden",f.forbidden.includes(v)?f.forbidden.filter(x=>x!==v):[...f.forbidden,v]);
  const submit=async()=>{
    if(!f.name)return;
    if(f.mode==="no_spend"&&f.forbidden.length===0){setErr("กรุณาเลือกหมวดหมู่ที่จะหลีกเลี่ยงอย่างน้อย 1 หมวด");return;}
    setLoading(true);setErr("");
    const code=genCode();
    const payload={name:f.name,description:f.description||null,creator_id:session.user.id,end_date:f.end_date||null,join_code:code,mode:f.mode,forbidden_categories:f.mode==="no_spend"?f.forbidden:[],target_amount:f.mode==="investment"&&f.target_amount!==""?+f.target_amount:null};
    const{data:ch,error}=await supabase.from("challenges").insert(payload).select().single();
    if(error){setErr(error.message);setLoading(false);return;}
    const{error:mErr}=await supabase.from("challenge_members").insert({challenge_id:ch.id,user_id:session.user.id,display_name:session.user.email,starting_cash:f.mode==="investment"?+f.starting_cash||0:0,cash:f.mode==="investment"?+f.starting_cash||0:0,assets:[]});
    if(mErr){setErr(mErr.message);setLoading(false);return;}
    setLoading(false);onClose(ch.id);
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div>
      <div style={{fontSize:11,color:t.tm,marginBottom:5}}>ประเภทชาเลนจ์</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        <button onClick={()=>set("mode","investment")} style={{padding:"10px 8px",border:f.mode==="investment"?`2px solid ${t.ac}`:`1px solid ${t.cb}`,borderRadius:8,background:f.mode==="investment"?`${t.ac}10`:"transparent",cursor:"pointer",textAlign:"left",color:t.text}}>
          <div style={{fontSize:13,fontWeight:600}}>📈 ลงทุน</div>
          <div style={{fontSize:10,color:t.tm,marginTop:2}}>แข่งกันสร้างผลตอบแทนพอร์ต</div>
        </button>
        <button onClick={()=>set("mode","no_spend")} style={{padding:"10px 8px",border:f.mode==="no_spend"?`2px solid ${t.ac}`:`1px solid ${t.cb}`,borderRadius:8,background:f.mode==="no_spend"?`${t.ac}10`:"transparent",cursor:"pointer",textAlign:"left",color:t.text}}>
          <div style={{fontSize:13,fontWeight:600}}>🚫 ไม่ใช้เงิน</div>
          <div style={{fontSize:10,color:t.tm,marginTop:2}}>No-Spend Challenge — งดใช้บางหมวด</div>
        </button>
      </div>
    </div>
    <Inp label="ชื่อชาเลนจ์" t={t} value={f.name} onChange={e=>set("name",e.target.value)} placeholder={f.mode==="no_spend"?"เช่น งดช้อป 30 วัน":"เช่น ลงทุน 30 วัน"}/>
    <Inp label="คำอธิบาย (ไม่บังคับ)" t={t} value={f.description} onChange={e=>set("description",e.target.value)} placeholder="กติกา / รายละเอียด"/>
    <Inp label="วันสิ้นสุด (ไม่บังคับ)" t={t} type="date" value={f.end_date} onChange={e=>set("end_date",e.target.value)}/>
    {f.mode==="investment"?<>
      <Inp label="เงินสดเริ่มต้น (บาท)" t={t} type="number" value={f.starting_cash} onChange={e=>set("starting_cash",e.target.value)} placeholder="100000"/>
      <Inp label="🎯 เป้าหมาย (จำนวนเงิน บาท, ไม่บังคับ)" t={t} type="number" step="1" value={f.target_amount} onChange={e=>set("target_amount",e.target.value)} placeholder="เช่น 150000 = เป้า ฿150,000"/>
      <div style={{fontSize:10,color:t.tm}}>* เงินสดเริ่มต้น = เงินที่ทุกคนเริ่มต้นชาเลนจ์นี้ ใช้คำนวณ % กำไร/ขาดทุน<br/>* เป้าหมาย = มูลค่ารวมที่ต้องการไปถึงภายในเวลา (เช่น เริ่ม ฿100,000 ตั้งเป้า ฿150,000 = +50%)</div>
    </>:<>
      <div>
        <div style={{fontSize:11,color:t.tm,marginBottom:6}}>หมวดหมู่ที่ห้ามใช้เงิน <span style={{color:t.r}}>*</span></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {EC.map(c=>{const on=f.forbidden.includes(c.v);return(<button key={c.v} onClick={()=>toggleCat(c.v)} style={{padding:"6px 10px",border:`1px solid ${on?t.r:t.cb}`,borderRadius:6,background:on?`${t.r}15`:"transparent",cursor:"pointer",fontSize:11,color:on?t.r:t.text,fontWeight:on?600:400}}>{on?"🚫":""} {c.i} {c.l}</button>);})}
        </div>
      </div>
      <div style={{fontSize:10,color:t.tm,padding:"6px 10px",background:`${t.am}10`,borderRadius:6,borderLeft:`3px solid ${t.am}`}}>💡 ทุกคนที่บันทึกรายจ่ายในหมวดที่เลือกระหว่างชาเลนจ์ = นับเป็น Violation 1 ครั้ง<br/>คนที่ violation น้อยที่สุด + streak ยาวที่สุด = ชนะ!</div>
    </>}
    {err&&<div style={{fontSize:11,color:t.r,padding:"6px 10px",background:`${t.r}12`,borderRadius:6}}>{err}</div>}
    <div style={{display:"flex",gap:6}}>
      <Btn primary t={t} onClick={submit} disabled={loading||!f.name} style={{flex:1}}>{loading?"กำลังสร้าง...":"✓ สร้าง"}</Btn>
      <Btn t={t} onClick={()=>onClose()}>ยกเลิก</Btn>
    </div>
  </div>);
}

function EditChallengeForm({challenge,onClose,onSaved,t}){
  const isNoSpend=challenge.mode==="no_spend";
  const[f,set]=useF({name:challenge.name||"",description:challenge.description||"",start_date:challenge.start_date||"",end_date:challenge.end_date||"",target_amount:challenge.target_amount!=null?String(challenge.target_amount):"",forbidden:Array.isArray(challenge.forbidden_categories)?challenge.forbidden_categories:[]});
  const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const toggleCat=v=>set("forbidden",f.forbidden.includes(v)?f.forbidden.filter(x=>x!==v):[...f.forbidden,v]);
  const submit=async()=>{
    if(!f.name){setErr("กรุณาใส่ชื่อชาเลนจ์");return;}
    if(isNoSpend&&f.forbidden.length===0){setErr("เลือกหมวดที่ห้ามใช้เงินอย่างน้อย 1 หมวด");return;}
    setLoading(true);setErr("");
    const payload={name:f.name,description:f.description||null,start_date:f.start_date||null,end_date:f.end_date||null,target_amount:isNoSpend?null:(f.target_amount===""?null:+f.target_amount)};
    if(isNoSpend)payload.forbidden_categories=f.forbidden;
    const{error}=await supabase.from("challenges").update(payload).eq("id",challenge.id);
    if(error){setErr(error.message);setLoading(false);return;}
    setLoading(false);onSaved&&onSaved();onClose();
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <Inp label="ชื่อชาเลนจ์" t={t} value={f.name} onChange={e=>set("name",e.target.value)}/>
    <Inp label="คำอธิบาย (ไม่บังคับ)" t={t} value={f.description} onChange={e=>set("description",e.target.value)}/>
    <Inp label="วันเริ่มต้น" t={t} type="date" value={f.start_date} onChange={e=>set("start_date",e.target.value)}/>
    <Inp label="วันสิ้นสุด (ไม่บังคับ)" t={t} type="date" value={f.end_date} onChange={e=>set("end_date",e.target.value)}/>
    {isNoSpend?<div>
      <div style={{fontSize:11,color:t.tm,marginBottom:6}}>หมวดหมู่ที่ห้ามใช้เงิน 🚫</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {EC.map(c=>{const on=f.forbidden.includes(c.v);return(<button key={c.v} onClick={()=>toggleCat(c.v)} style={{padding:"6px 10px",border:`1px solid ${on?t.r:t.cb}`,borderRadius:6,background:on?`${t.r}15`:"transparent",cursor:"pointer",fontSize:11,color:on?t.r:t.text,fontWeight:on?600:400}}>{on?"🚫":""} {c.i} {c.l}</button>);})}
      </div>
    </div>:<Inp label="🎯 เป้าหมาย (จำนวนเงิน บาท, ไม่บังคับ)" t={t} type="number" step="1" value={f.target_amount} onChange={e=>set("target_amount",e.target.value)} placeholder="เช่น 1000000 = เป้า ฿1,000,000"/>}
    <div style={{fontSize:10,color:t.tm}}>* การแก้ไขจะมีผลกับทุกคนในชาเลนจ์ทันที</div>
    {err&&<div style={{fontSize:11,color:t.r,padding:"6px 10px",background:`${t.r}12`,borderRadius:6}}>{err}</div>}
    <div style={{display:"flex",gap:6}}>
      <Btn primary t={t} onClick={submit} disabled={loading||!f.name} style={{flex:1}}>{loading?"กำลังบันทึก...":"💾 บันทึก"}</Btn>
      <Btn t={t} onClick={()=>onClose()}>ยกเลิก</Btn>
    </div>
  </div>);
}

function JoinChallengeForm({onClose,t,session,challengeId}){
  const[code,setCode]=useState("");const[name,setName]=useState(session?.user?.email||"");
  const[cash,setCash]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const submit=async()=>{
    setLoading(true);setErr("");
    let cid=challengeId;
    if(!cid){
      if(!code)return setLoading(false);
      const{data:ch,error}=await supabase.from("challenges").select("id").eq("join_code",code.trim().toUpperCase()).maybeSingle();
      if(error||!ch){setErr("ไม่พบชาเลนจ์รหัสนี้");setLoading(false);return;}
      cid=ch.id;
    }
    const{error:mErr}=await supabase.from("challenge_members").insert({challenge_id:cid,user_id:session.user.id,display_name:name||session.user.email,starting_cash:+cash||0,cash:+cash||0,assets:[]});
    if(mErr){
      if(mErr.code==="23505")setErr("คุณเข้าร่วมชาเลนจ์นี้อยู่แล้ว");
      else setErr(mErr.message);
      setLoading(false);return;
    }
    setLoading(false);onClose(cid);
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
    {!challengeId&&<Inp label="รหัสเชิญ" t={t} value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ABC123" style={{textTransform:"uppercase",letterSpacing:2,fontWeight:600}}/>}
    <Inp label="ชื่อที่แสดงในชาเลนจ์" t={t} value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อเล่น / email"/>
    <Inp label="เงินสดเริ่มต้น (บาท)" t={t} type="number" value={cash} onChange={e=>setCash(e.target.value)} placeholder="100000"/>
    {err&&<div style={{fontSize:11,color:t.r,padding:"6px 10px",background:`${t.r}12`,borderRadius:6}}>{err}</div>}
    <div style={{display:"flex",gap:6}}>
      <Btn primary t={t} onClick={submit} disabled={loading||(!challengeId&&!code)} style={{flex:1}}>{loading?"กำลังเข้าร่วม...":"✓ เข้าร่วม"}</Btn>
      <Btn t={t} onClick={()=>onClose()}>ยกเลิก</Btn>
    </div>
  </div>);
}

function ReportViolationForm({challenge,session,onClose,onSaved,t}){
  const fb=Array.isArray(challenge.forbidden_categories)?challenge.forbidden_categories:[];
  const cats=EC.filter(c=>fb.includes(c.v));
  const[f,set]=useF({date:td(),category:cats[0]?.v||"food",amount:"",note:""});
  const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const submit=async()=>{
    setLoading(true);setErr("");
    const{error}=await supabase.from("no_spend_violations").insert({challenge_id:challenge.id,user_id:session.user.id,date:f.date,category:f.category,amount:+f.amount||0,note:f.note||null});
    if(error){setErr(error.message);setLoading(false);return;}
    setLoading(false);onSaved&&onSaved();onClose();
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontSize:11,color:t.tm,padding:"6px 10px",background:`${t.r}10`,borderRadius:6,borderLeft:`3px solid ${t.r}`}}>⚠️ ซื่อสัตย์กับตัวเอง! บันทึกครั้งที่เผลอใช้เงินในหมวดที่ห้าม</div>
    <Inp label="วันที่" t={t} type="date" value={f.date} onChange={e=>set("date",e.target.value)}/>
    <Sel label="หมวดที่ใช้เงิน" t={t} value={f.category} onChange={e=>set("category",e.target.value)}>
      {cats.map(c=><option key={c.v} value={c.v}>{c.i} {c.l}</option>)}
    </Sel>
    <Inp label="จำนวนเงิน (฿) — ไม่บังคับ" t={t} type="number" value={f.amount} onChange={e=>set("amount",e.target.value)} placeholder="0"/>
    <Inp label="โน้ต (ไม่บังคับ)" t={t} value={f.note} onChange={e=>set("note",e.target.value)} placeholder="เช่น เผลอซื้อกาแฟ"/>
    {err&&<div style={{fontSize:11,color:t.r,padding:"6px 10px",background:`${t.r}12`,borderRadius:6}}>{err}</div>}
    <div style={{display:"flex",gap:6}}>
      <Btn primary t={t} onClick={submit} disabled={loading} style={{flex:1}}>{loading?"กำลังบันทึก...":"📝 บันทึก Violation"}</Btn>
      <Btn t={t} onClick={()=>onClose()}>ยกเลิก</Btn>
    </div>
  </div>);
}

function NoSpendChallengeView({challenge,members,session,t,onLoad}){
  const[violations,setViolations]=useState([]);
  const[modal,setModal]=useState(null);
  const fb=Array.isArray(challenge.forbidden_categories)?challenge.forbidden_categories:[];
  const fbCats=EC.filter(c=>fb.includes(c.v));
  const load=useCallback(async()=>{
    const{data}=await supabase.from("no_spend_violations").select("*").eq("challenge_id",challenge.id).order("date",{ascending:false});
    setViolations(data||[]);
  },[challenge.id]);
  useEffect(()=>{load()},[load]);
  const today=td();
  const startD=challenge.start_date||today;
  const endD=challenge.end_date||today;
  const dayDiff=(a,b)=>Math.floor((new Date(b)-new Date(a))/86400000);
  const totalDays=Math.max(1,dayDiff(startD,endD)+1);
  const elapsedDays=Math.max(0,Math.min(totalDays,dayDiff(startD,today)+1));
  const stats=members.map(m=>{
    const myV=violations.filter(v=>v.user_id===m.user_id);
    const violationDates=new Set(myV.map(v=>v.date));
    let streak=0;
    for(let i=0;i<elapsedDays;i++){
      const d=new Date(startD);d.setDate(d.getDate()+(elapsedDays-1-i));
      const ds=d.toISOString().slice(0,10);
      if(violationDates.has(ds))break;
      streak++;
    }
    const cleanDays=Math.max(0,elapsedDays-violationDates.size);
    const totalSpent=myV.reduce((s,v)=>s+(+v.amount||0),0);
    return{member:m,violations:myV,vCount:myV.length,streak,cleanDays,totalSpent};
  });
  const sorted=[...stats].sort((a,b)=>b.streak-a.streak||a.vCount-b.vCount||a.totalSpent-b.totalSpent);
  const me=members.find(m=>m.user_id===session.user.id);
  const myStat=stats.find(s=>s.member.user_id===session.user.id);
  return(<>
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:13,fontWeight:600}}>🚫 หมวดที่ห้ามใช้เงิน</div>
        <div style={{fontSize:11,color:t.tm}}>วันที่ {elapsedDays}/{totalDays} ของชาเลนจ์</div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {fbCats.length===0?<span style={{fontSize:11,color:t.tm}}>ยังไม่ได้เลือกหมวด — กดแก้ไขเพื่อตั้งค่า</span>:fbCats.map(c=>(<span key={c.v} style={{padding:"6px 12px",borderRadius:20,background:`${t.r}15`,color:t.r,fontSize:11,fontWeight:500,border:`1px solid ${t.r}40`}}>🚫 {c.i} {c.l}</span>))}
      </div>
      <PB pct={Math.min(100,elapsedDays/totalDays*100)} color={t.ac} height={6} t={t}/>
    </div>

    {me&&<div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
      <Btn primary t={t} onClick={()=>setModal({type:"report"})}>📝 บันทึก Violation</Btn>
      {myStat&&<>
        <span style={{fontSize:12,padding:"6px 12px",background:`${t.g}15`,color:t.g,borderRadius:6,fontWeight:600}}>🔥 Streak: {myStat.streak} วัน</span>
        <span style={{fontSize:12,padding:"6px 12px",background:`${t.r}15`,color:t.r,borderRadius:6,fontWeight:600}}>⚠️ {myStat.vCount} violations</span>
        {myStat.totalSpent>0&&<span style={{fontSize:12,padding:"6px 12px",background:`${t.am}15`,color:t.am,borderRadius:6,fontWeight:600}}>💸 {fB(myStat.totalSpent)}</span>}
      </>}
    </div>}

    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🏆 Leaderboard (Streak สูงสุด)</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:480}}>
        <thead><tr style={{borderBottom:`1px solid ${t.cb}`}}>{["#","ผู้เล่น","🔥 Streak","Clean Days","Violations","ใช้ไป"].map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:"left",fontSize:10,color:t.tm,fontWeight:500}}>{h}</th>)}</tr></thead>
        <tbody>{sorted.map((s,i)=>{const isMe=s.member.user_id===session.user.id;return(<tr key={s.member.id} style={{borderBottom:`1px solid ${t.cb}`,background:isMe?`${t.ac}10`:"transparent"}}>
          <td style={{padding:"8px 10px",fontWeight:600}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</td>
          <td style={{padding:"8px 10px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar url={s.member.avatar_url} name={s.member.display_name} size={28} t={t}/><span style={{fontWeight:500}}>{s.member.display_name||"(ไม่มีชื่อ)"}{isMe&&<span style={{color:t.ac,marginLeft:6,fontSize:10}}>(คุณ)</span>}</span></div></td>
          <td style={{padding:"8px 10px",color:s.streak>=7?t.g:s.streak>=3?t.am:t.tm,fontWeight:700}}>🔥 {s.streak}</td>
          <td style={{padding:"8px 10px",color:t.g}}>{s.cleanDays} วัน</td>
          <td style={{padding:"8px 10px"}}><Badge color={s.vCount===0?t.g:t.r}>{s.vCount===0?"✅ ไม่มี":`${s.vCount} ครั้ง`}</Badge></td>
          <td style={{padding:"8px 10px",color:s.totalSpent>0?t.r:t.tm}}>{s.totalSpent>0?fB(s.totalSpent):"-"}</td>
        </tr>);})}</tbody>
      </table></div>
    </div>

    {violations.length>0&&<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>📋 Violations ทั้งหมด ({violations.length})</div>
      <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:360,overflowY:"auto"}}>
        {violations.map(v=>{const m=members.find(x=>x.user_id===v.user_id);const cat=EC.find(c=>c.v===v.category)||EC[EC.length-1];const isMe=v.user_id===session.user.id;return(<div key={v.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:t.bg,border:`1px solid ${t.cb}`}}>
          <Avatar url={m?.avatar_url} name={m?.display_name} size={28} t={t}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:500}}>{m?.display_name||"?"} <span style={{color:t.r,marginLeft:6}}>{cat.i} {cat.l}</span></div>
            <div style={{fontSize:10,color:t.tm}}>{v.date}{v.note?` · ${v.note}`:""}</div>
          </div>
          {v.amount>0&&<span style={{fontSize:12,color:t.r,fontWeight:600}}>-{fB(v.amount)}</span>}
          {isMe&&<button onClick={async()=>{if(window.confirm("ลบ violation นี้?")){await supabase.from("no_spend_violations").delete().eq("id",v.id);load()}}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:t.r}}>🗑</button>}
        </div>);})}
      </div>
    </div>}

    <Modal open={modal?.type==="report"} onClose={()=>setModal(null)} title="📝 บันทึก Violation" t={t}>
      <ReportViolationForm challenge={challenge} session={session} t={t} onClose={()=>setModal(null)} onSaved={()=>{load();onLoad&&onLoad()}}/>
    </Modal>
  </>);
}

function ChallengeDetail({id,onBack,t,session,rate,toThb}){
  const[challenge,setChallenge]=useState(null);
  const[members,setMembers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(null);
  const[refresh,setRefresh]=useState({loading:false,msg:"",err:""});
  const load=useCallback(async()=>{
    setLoading(true);
    const[{data:ch},{data:ms}]=await Promise.all([
      supabase.from("challenges").select("*").eq("id",id).maybeSingle(),
      supabase.from("challenge_members").select("*").eq("challenge_id",id).order("joined_at",{ascending:true}),
    ]);
    setChallenge(ch||null);setMembers(ms||[]);setLoading(false);
  },[id]);
  useEffect(()=>{load();},[load]);
  const calcNetWorth=useCallback(m=>((m.assets||[]).reduce((s,a)=>s+toThb((+a.units||0)*(+a.currentPrice||0),a.currency||"THB"),0))+(+m.cash||0)+((m.other_items||[]).reduce((s,o)=>s+(+o.amount||0),0)),[toThb]);
  useEffect(()=>{
    if(!challenge||!session?.user||!members.length)return;
    const me2=members.find(m=>m.user_id===session.user.id);if(!me2)return;
    const nv=calcNetWorth(me2);
    const today=new Date().toISOString().slice(0,10);
    if(challenge.mode!=="no_spend")supabase.from("challenge_snapshots").upsert({challenge_id:id,user_id:session.user.id,date:today,net_worth:+nv.toFixed(2)},{onConflict:"challenge_id,user_id,date"}).then(()=>{});
    // Check challenge end-date notification
    if(challenge.end_date){
      const diff=(new Date(challenge.end_date)-new Date())/86400000;
      if(diff>=0&&diff<=3)createNotif(session.user.id,"challenge_end",`⏰ ${challenge.name} ใกล้สิ้นสุด`,`เหลืออีก ${Math.ceil(diff)} วัน!`,`challenge:${id}`,`challenge_end_${id}`);
    }
    // Check if anyone reached target
    const target=challenge.target_amount!=null?+challenge.target_amount:(challenge.target_pct!=null?null:null);
    if(target!=null){
      members.forEach(m=>{
        const nv2=calcNetWorth(m);
        if(nv2>=target){
          const who=m.user_id===session.user.id?"คุณ":(m.display_name||"ผู้เล่น");
          createNotif(session.user.id,"challenge_reached",`🏁 ${who} ถึงเป้าหมายแล้ว!`,`${challenge.name}: ${fB(nv2)} / ${fB(target)}`,`challenge:${id}`,`reached_${id}_${m.user_id}`);
        }
      });
    }
  },[challenge,members,session,id,calcNetWorth]);
  if(loading)return<div style={{color:t.tm,fontSize:12,padding:20,textAlign:"center"}}>กำลังโหลด...</div>;
  if(!challenge)return(<div><Btn small t={t} onClick={onBack}>← กลับ</Btn><div style={{marginTop:10,color:t.tm}}>ไม่พบชาเลนจ์</div></div>);
  const calcStartingValue=m=>((m.assets||[]).reduce((s,a)=>s+toThb((+a.units||0)*(+a.avgCost||0),a.currency||"THB"),0))+(+m.starting_cash||0)+((m.other_items||[]).reduce((s,o)=>s+(+(o.cost??o.amount)||0),0));
  const sorted=[...members].sort((a,b)=>{
    const aS=calcStartingValue(a),bS=calcStartingValue(b);
    const aG=aS>0?(calcNetWorth(a)-aS)/aS:0;
    const bG=bS>0?(calcNetWorth(b)-bS)/bS:0;
    return bG-aG;
  });
  const me=members.find(m=>m.user_id===session.user.id);
  const isCreator=challenge.creator_id===session.user.id;
  const updateMe=async changes=>{
    const{error}=await supabase.from("challenge_members").update({...changes,updated_at:new Date().toISOString()}).eq("challenge_id",id).eq("user_id",session.user.id);
    if(error){window.alert(error.message);return;}
    load();
  };
  const leave=async()=>{
    if(!window.confirm("ออกจากชาเลนจ์นี้? ข้อมูลพอร์ตในชาเลนจ์จะถูกลบ"))return;
    await supabase.from("challenge_members").delete().eq("challenge_id",id).eq("user_id",session.user.id);
    onBack();
  };
  const deleteChallenge=async()=>{
    if(!window.confirm("ลบชาเลนจ์นี้? สมาชิกทั้งหมดจะถูกลบไปด้วย"))return;
    await supabase.from("challenges").delete().eq("id",id);
    onBack();
  };
  const mapSym=a=>{
    const s=(a.name||"").trim().toUpperCase();if(!s)return null;
    if(a.type==="stock_th")return s.includes(".")?s:s+".BK";
    if(a.type==="stock_us")return s;
    if(a.type==="crypto")return s.includes("-")?s:s+"-USD";
    if(a.type==="gold")return "GC=F";
    return null;
  };
  const refreshMyPrices=async()=>{
    if(!me)return;
    const assets=me.assets||[];
    const pairs=assets.map(a=>[a,mapSym(a)]).filter(([,s])=>s);
    if(!pairs.length){setRefresh({loading:false,msg:"",err:"ไม่มีหุ้นที่ดึงราคาได้"});return;}
    setRefresh({loading:true,msg:"",err:""});
    try{
      const syms=[...new Set(pairs.map(([,s])=>s))].join(",");
      const r=await fetch(`/api/quote?symbols=${encodeURIComponent(syms)}`);
      const{quotes}=await r.json();
      let ok=0;
      const newAssets=assets.map(a=>{const s=mapSym(a);const q=s?quotes[s]:null;if(q?.price!=null){ok++;return{...a,currentPrice:+q.price.toFixed(4)}}return a;});
      await updateMe({assets:newAssets});
      setRefresh({loading:false,msg:`อัปเดต ${ok} รายการ`,err:""});
      setTimeout(()=>setRefresh(p=>({...p,msg:""})),4000);
    }catch(e){setRefresh({loading:false,msg:"",err:e.message});}
  };
  const targetAmount=challenge.target_amount!=null?+challenge.target_amount:(challenge.target_pct!=null?null:null);
  const legacyTargetPct=challenge.target_amount==null&&challenge.target_pct!=null?+challenge.target_pct:null;
  const chartData=sorted.map(m=>{
    const nv=calcNetWorth(m),sv=calcStartingValue(m);
    const target=targetAmount!=null?targetAmount:(legacyTargetPct!=null?sv*(1+legacyTargetPct/100):null);
    const pctOfTarget=target&&target>0?(nv/target)*100:null;
    const pctGain=sv>0?((nv-sv)/sv)*100:0;
    const name=(m.display_name||"?").slice(0,12);
    const reached=target!=null&&nv>=target;
    const fill=target!=null?(reached?t.g:pctOfTarget>=75?t.ac:pctOfTarget>=50?t.am:t.r):(pctGain>=0?t.g:t.r);
    return{name:m.user_id===session.user.id?name+" (คุณ)":name,amount:+nv.toFixed(0),starting:+sv.toFixed(0),target:target!=null?+target.toFixed(0):null,pctOfTarget:pctOfTarget!=null?+pctOfTarget.toFixed(1):null,pctGain:+pctGain.toFixed(2),reached,fill};
  });
  const hasTarget=targetAmount!=null||legacyTargetPct!=null;
  const maxTarget=chartData.reduce((mx,d)=>Math.max(mx,d.target||0),0);
  const maxNet=chartData.reduce((mx,d)=>Math.max(mx,d.amount||0),0);
  const yDomainMax=Math.max(maxTarget,maxNet)*1.08||100;
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
      <Btn small t={t} onClick={onBack}>← กลับ</Btn>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap",marginTop:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:18,fontWeight:700}}>🏆 {challenge.name}</div>
          {challenge.description&&<div style={{fontSize:12,color:t.ts,marginTop:4}}>{challenge.description}</div>}
          <div style={{fontSize:11,color:t.tm,marginTop:6}}>เริ่ม {challenge.start_date}{challenge.end_date?` · สิ้นสุด ${challenge.end_date}`:""} · {members.length} คน{challenge.mode==="no_spend"?` · 🚫 No-Spend Mode`:targetAmount!=null?` · 🎯 เป้า ${fB(targetAmount)}`:legacyTargetPct!=null?` · 🎯 เป้า ${legacyTargetPct>=0?"+":""}${legacyTargetPct}%`:""}</div>
          <div style={{fontSize:11,color:t.ac,marginTop:4,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>รหัสเชิญ: <code style={{fontWeight:600,padding:"2px 6px",background:`${t.ac}15`,borderRadius:4}}>{challenge.join_code}</code><button onClick={()=>{navigator.clipboard.writeText(challenge.join_code);window.alert("คัดลอกรหัสแล้ว ✅")}} style={{background:"none",border:"none",color:t.ac,cursor:"pointer",fontSize:11}}>📋 คัดลอก</button></div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {!me&&<Btn primary t={t} onClick={()=>setModal({type:"join"})}>+ เข้าร่วม</Btn>}
          {me&&<Btn small t={t} onClick={leave}>🚪 ออก</Btn>}
          {isCreator&&<Btn small t={t} onClick={()=>setModal({type:"editChallenge"})}>✏️ แก้ไข</Btn>}
          {isCreator&&<Btn small t={t} onClick={deleteChallenge} style={{color:t.r,border:`1px solid ${t.r}40`}}>🗑 ลบ</Btn>}
        </div>
      </div>
    </div>
    {challenge.mode==="no_spend"?<NoSpendChallengeView challenge={challenge} members={members} session={session} t={t} onLoad={load}/>:<>
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>📊 Leaderboard</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:480}}>
        <thead><tr style={{borderBottom:`1px solid ${t.cb}`}}>{["#","ผู้เล่น","เงินเริ่มต้น","มูลค่ารวม","P&L","%"].map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:"left",fontSize:10,color:t.tm,fontWeight:500}}>{h}</th>)}</tr></thead>
        <tbody>{sorted.map((m,i)=>{const nv=calcNetWorth(m),sv=calcStartingValue(m),pl=nv-sv,pct=sv>0?(pl/sv)*100:0;const isMe=m.user_id===session.user.id;return(<tr key={m.id} style={{borderBottom:`1px solid ${t.cb}`,background:isMe?`${t.ac}10`:"transparent"}}><td style={{padding:"8px 10px",fontWeight:600}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</td><td style={{padding:"8px 10px",fontWeight:500}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar url={m.avatar_url} name={m.display_name} size={28} t={t}/><span>{m.display_name||"(ไม่มีชื่อ)"}{isMe&&<span style={{color:t.ac,marginLeft:6,fontSize:10}}>(คุณ)</span>}</span></div></td><td style={{padding:"8px 10px",color:t.tm}}>{fB(sv)}</td><td style={{padding:"8px 10px",fontWeight:600}}>{fB(nv)}</td><td style={{padding:"8px 10px"}}><Badge color={pl>=0?t.g:t.r}>{pl>=0?"▲":"▼"}{fB(pl)}</Badge></td><td style={{padding:"8px 10px",color:pct>=0?t.g:t.r,fontWeight:600}}>{fP(pct)}</td></tr>);})}</tbody>
      </table></div>
    </div>
    {members.length>0&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>📈 เปรียบเทียบผู้เล่น (มูลค่ารวม)</div>
      <div style={{fontSize:10,color:t.tm,marginBottom:12}}>{targetAmount!=null?`แกนตั้ง = มูลค่ารวม (฿) · ขีดสูงสุด = เป้าหมาย ${fB(targetAmount)} · ตัวเลขบนแท่ง = % ที่ได้ของเป้า`:legacyTargetPct!=null?`แกนตั้ง = มูลค่ารวม (฿) · ขีดสูงสุด = เป้าหมาย (เริ่มต้น + ${legacyTargetPct>=0?"+":""}${legacyTargetPct}%) · ตัวเลขบนแท่ง = % ที่ได้ของเป้า`:"แกนตั้ง = มูลค่ารวม (฿) ของแต่ละผู้เล่น (ตั้งเป้าได้ตอนสร้างชาเลนจ์)"}</div>
      <ResponsiveContainer width="100%" height={Math.max(260,members.length*30+200)}>
        <BarChart data={chartData} margin={{top:30,right:16,left:10,bottom:40}}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.cb} vertical={false}/>
          <XAxis dataKey="name" tick={{fontSize:10,fill:t.ts}} angle={-20} textAnchor="end" interval={0} height={50}/>
          <YAxis type="number" domain={[0,yDomainMax]} tick={{fontSize:10,fill:t.tm}} tickFormatter={v=>v>=1000000?`฿${(v/1000000).toFixed(1)}M`:v>=1000?`฿${(v/1000).toFixed(0)}k`:`฿${v}`} width={60}/>
          <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:6,fontSize:11}} formatter={(v,n)=>n==="amount"?[fB(v),"มูลค่ารวม"]:[v,n]} labelFormatter={(l,p)=>{const d=p?.[0]?.payload;if(!d)return l;return`${l} · เริ่มต้น ${fB(d.starting)}${d.target!=null?` · เป้า ${fB(d.target)}`:""}${d.pctOfTarget!=null?` · ${d.pctOfTarget}% ของเป้า`:""}`}}/>
          <Bar dataKey="amount" radius={[6,6,0,0]}>
            {chartData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
            <LabelList dataKey={hasTarget?"pctOfTarget":"amount"} position="top" formatter={v=>hasTarget?(v!=null?`${v}%${v>=100?" 🏁":""}`:""):fB(v)} style={{fontSize:10,fill:t.text,fontWeight:600}}/>
          </Bar>
          {maxTarget>0&&<ReferenceLine y={maxTarget} stroke={t.am} strokeDasharray="5 3" strokeWidth={2} label={{value:`🎯 เป้า ${fB(maxTarget)}`,fill:t.am,fontSize:10,position:"insideTopRight"}}/>}
        </BarChart>
      </ResponsiveContainer>
      {hasTarget&&(<div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{fontSize:12,fontWeight:600,color:t.ts}}>🎯 ความคืบหน้าสู่เป้าหมาย {targetAmount!=null?fB(targetAmount):`(${legacyTargetPct>=0?"+":""}${legacyTargetPct}%)`}</div>
        {sorted.map(m=>{
          const nv=calcNetWorth(m),sv=calcStartingValue(m);
          const target=targetAmount!=null?targetAmount:sv*(1+legacyTargetPct/100);
          const progress=target>0?(nv/target)*100:0;
          const clamped=Math.max(0,Math.min(100,progress));
          const done=progress>=100;
          const isMe=m.user_id===session.user.id;
          const color=done?t.g:progress>=75?t.ac:progress>=50?t.am:t.r;
          return(<div key={m.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,fontSize:11,gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                <Avatar url={m.avatar_url} name={m.display_name} size={22} t={t}/>
                <span style={{fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{done&&"✅ "}{m.display_name||"(ไม่มีชื่อ)"}{isMe&&<span style={{color:t.ac,marginLeft:4,fontSize:10}}>(คุณ)</span>}</span>
              </div>
              <span style={{color,fontWeight:600,flexShrink:0}}>{progress.toFixed(1)}% ของเป้า{done&&" 🏁"}</span>
            </div>
            <PB pct={clamped} color={color} height={8} t={t}/>
            <div style={{fontSize:9,color:t.tm,marginTop:2}}>{fB(nv)} / เป้า {fB(target)}</div>
          </div>);
        })}
      </div>)}
    </div>)}
    {me&&<div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
      <Btn t={t} onClick={refreshMyPrices} disabled={refresh.loading}>{refresh.loading?"⏳ กำลังดึงราคา...":"🔄 อัปเดตราคาหุ้นของฉัน"}</Btn>
      {refresh.msg&&<span style={{fontSize:11,color:t.g,padding:"4px 10px",background:`${t.g}15`,borderRadius:6}}>✅ {refresh.msg}</span>}
      {refresh.err&&<span style={{fontSize:11,color:t.r,padding:"4px 10px",background:`${t.r}15`,borderRadius:6}}>⚠️ {refresh.err}</span>}
    </div>}
    <ChallengeHistoryChart challengeId={id} members={sorted} session={session} t={t}/>
    {sorted.map(m=>(<MemberPortfolio key={m.id} member={m} isMe={m.user_id===session.user.id} onUpdate={updateMe} onEditProfile={mem=>setModal({type:"profile",member:mem})} t={t} toThb={toThb} rate={rate}/>))}
    </>}
    <ChallengePosts challengeId={id} members={members} session={session} t={t}/>
    <Modal open={modal?.type==="join"} onClose={()=>setModal(null)} title="เข้าร่วมชาเลนจ์" t={t}>
      <JoinChallengeForm onClose={()=>{setModal(null);load()}} t={t} session={session} challengeId={id}/>
    </Modal>
    <Modal open={modal?.type==="profile"} onClose={()=>setModal(null)} title="✏️ แก้ไขโปรไฟล์ในชาเลนจ์" t={t}>
      {modal?.member&&<EditProfileForm member={modal.member} session={session} t={t} onClose={()=>setModal(null)} onSaved={load}/>}
    </Modal>
    <Modal open={modal?.type==="editChallenge"} onClose={()=>setModal(null)} title="✏️ แก้ไขชาเลนจ์" t={t}>
      <EditChallengeForm challenge={challenge} t={t} onClose={()=>setModal(null)} onSaved={load}/>
    </Modal>
  </div>);
}

function ChallengePosts({challengeId,members,session,t}){
  const[posts,setPosts]=useState([]);
  const[msg,setMsg]=useState("");
  const[sending,setSending]=useState(false);
  const load=useCallback(async()=>{
    const{data}=await supabase.from("challenge_posts").select("*").eq("challenge_id",challengeId).order("created_at",{ascending:false}).limit(100);
    setPosts(data||[]);
  },[challengeId]);
  useEffect(()=>{load();const i=setInterval(load,30000);return()=>clearInterval(i)},[load]);
  const send=async()=>{
    if(!msg.trim())return;
    setSending(true);
    await supabase.from("challenge_posts").insert({challenge_id:challengeId,user_id:session.user.id,message:msg.trim()});
    setMsg("");setSending(false);load();
  };
  const del=async id=>{
    if(!window.confirm("ลบข้อความนี้?"))return;
    await supabase.from("challenge_posts").delete().eq("id",id);load();
  };
  const getMem=uid=>members.find(m=>m.user_id===uid);
  return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
    <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>💬 พูดคุยในชาเลนจ์ ({posts.length})</div>
    <div style={{display:"flex",gap:6,marginBottom:12}}>
      <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง)" maxLength={500} style={{flex:1,padding:"8px 10px",borderRadius:6,border:`1px solid ${t.ibr}`,background:t.ib,color:t.text,fontSize:12,outline:"none"}}/>
      <Btn primary t={t} onClick={send} disabled={sending||!msg.trim()}>{sending?"...":"ส่ง"}</Btn>
    </div>
    {posts.length===0?<div style={{textAlign:"center",color:t.tm,fontSize:11,padding:20}}>ยังไม่มีข้อความ — มาเริ่มคุยกันเลย! 🎉</div>:
      <div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:400,overflowY:"auto",paddingRight:4}}>
        {posts.map(p=>{const m=getMem(p.user_id);const isMe=p.user_id===session.user.id;return(<div key={p.id} style={{display:"flex",gap:8}}>
          <Avatar url={m?.avatar_url} name={m?.display_name} size={32} t={t}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:6,alignItems:"center",fontSize:11,flexWrap:"wrap"}}>
              <span style={{fontWeight:600}}>{m?.display_name||"ผู้ใช้"}</span>
              {isMe&&<span style={{color:t.ac,fontSize:10}}>(คุณ)</span>}
              <span style={{color:t.tm,fontSize:10}}>{new Date(p.created_at).toLocaleString("th-TH",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
              {isMe&&<button onClick={()=>del(p.id)} style={{background:"none",border:"none",color:t.tm,cursor:"pointer",fontSize:11,marginLeft:"auto"}}>🗑</button>}
            </div>
            <div style={{fontSize:12,color:t.text,marginTop:3,padding:"7px 11px",background:isMe?`${t.ac}15`:t.bg,borderRadius:8,border:`1px solid ${t.cb}`,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{p.message}</div>
          </div>
        </div>);})}
      </div>}
  </div>);
}

function ChallengeHistoryChart({challengeId,members,session,t}){
  const[rows,setRows]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!challengeId){setLoading(false);return}
    supabase.from("challenge_snapshots").select("*").eq("challenge_id",challengeId).order("date").then(({data})=>{setRows(data||[]);setLoading(false)});
  },[challengeId,members.length]);
  if(loading)return null;
  if(rows.length<2)return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
    <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>📈 มูลค่าพอร์ตในชาเลนจ์ย้อนหลัง</div>
    <div style={{fontSize:11,color:t.tm,textAlign:"center",padding:"16px 0"}}>ระบบจะเก็บข้อมูลวันละ 1 ครั้งเมื่อมีผู้เล่นเข้ามาดู ({new Set(rows.map(r=>r.date)).size}/2 วัน)</div>
  </div>);
  const memMap=Object.fromEntries(members.map(m=>[m.user_id,(m.display_name||"?").slice(0,12)]));
  const byDate={};
  rows.forEach(r=>{if(!byDate[r.date])byDate[r.date]={date:r.date};byDate[r.date][memMap[r.user_id]||r.user_id.slice(0,6)]=+r.net_worth});
  const data=Object.values(byDate).sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({...d,date:d.date.slice(5)}));
  const COLORS=["#0EA5E9","#10B981","#F59E0B","#EF4444","#8B5CF6","#14B8A6","#EC4899","#F97316","#6366F1","#84CC16"];
  const keys=members.map(m=>memMap[m.user_id]).filter(Boolean);
  return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
    <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>📈 มูลค่าพอร์ตในชาเลนจ์ย้อนหลัง ({Object.keys(byDate).length} วัน)</div>
    <div style={{fontSize:10,color:t.tm,marginBottom:10}}>เส้นหนา = ของคุณ · บันทึกอัตโนมัติเมื่อเข้าดูชาเลนจ์</div>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{top:10,right:16,left:0,bottom:4}}>
        <CartesianGrid strokeDasharray="3 3" stroke={t.cb} vertical={false}/>
        <XAxis dataKey="date" tick={{fontSize:9,fill:t.ts}}/>
        <YAxis tick={{fontSize:9,fill:t.tm}} tickFormatter={v=>v>=1000000?`฿${(v/1000000).toFixed(1)}M`:v>=1000?`฿${(v/1000).toFixed(0)}k`:`฿${v}`} width={55}/>
        <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:6,fontSize:11}} formatter={v=>fB(v)}/>
        <Legend wrapperStyle={{fontSize:10}}/>
        {members.map((m,i)=>{const name=memMap[m.user_id];if(!keys.includes(name))return null;const isMe=m.user_id===session.user.id;return<Line key={m.user_id} type="monotone" dataKey={name} stroke={COLORS[i%COLORS.length]} strokeWidth={isMe?3:1.5} dot={{r:isMe?4:2.5}} activeDot={{r:5}} connectNulls/>})}
      </LineChart>
    </ResponsiveContainer>
  </div>);
}

function Avatar({url,name,size,t}){
  const s=size||36;
  const initial=(name||"?").trim().charAt(0).toUpperCase()||"?";
  if(url)return<img src={url} alt={name||""} style={{width:s,height:s,borderRadius:"50%",objectFit:"cover",border:`2px solid ${t.cb}`,background:t.cb,flexShrink:0}} onError={e=>{e.currentTarget.style.display="none"}}/>;
  const hue=(initial.charCodeAt(0)*37)%360;
  return<div style={{width:s,height:s,borderRadius:"50%",background:`hsl(${hue},65%,55%)`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600,fontSize:s*0.42,flexShrink:0,border:`2px solid ${t.cb}`}}>{initial}</div>;
}

function EditProfileForm({member,onClose,onSaved,t,session}){
  const[name,setName]=useState(member.display_name||"");
  const[url,setUrl]=useState(member.avatar_url||"");
  const[uploading,setUploading]=useState(false);
  const[err,setErr]=useState("");
  const upload=async(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>2*1024*1024){setErr("ไฟล์ใหญ่เกิน 2MB");return;}
    if(!/^image\//.test(file.type)){setErr("ต้องเป็นไฟล์รูปภาพ");return;}
    setUploading(true);setErr("");
    try{
      const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
      const path=`${session.user.id}/${member.challenge_id}-${Date.now()}.${ext}`;
      const{error:upErr}=await supabase.storage.from("avatars").upload(path,file,{cacheControl:"3600",upsert:true,contentType:file.type});
      if(upErr)throw upErr;
      const{data:{publicUrl}}=supabase.storage.from("avatars").getPublicUrl(path);
      setUrl(publicUrl);
    }catch(ex){setErr("อัปโหลดไม่สำเร็จ: "+(ex.message||ex));}
    setUploading(false);
  };
  const save=async()=>{
    setUploading(true);setErr("");
    const{error}=await supabase.from("challenge_members").update({display_name:name.trim()||null,avatar_url:url||null,updated_at:new Date().toISOString()}).eq("id",member.id);
    setUploading(false);
    if(error){setErr(error.message);return;}
    onSaved&&onSaved();onClose();
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"flex",alignItems:"center",gap:14,padding:10,background:`${t.ac}08`,borderRadius:8}}>
      <Avatar url={url} name={name} size={64} t={t}/>
      <div style={{fontSize:11,color:t.tm,flex:1}}>รูปโปรไฟล์จะแสดงในกระดานคะแนนและการ์ดพอร์ตของชาเลนจ์นี้</div>
    </div>
    <Inp label="ชื่อที่แสดง" t={t} value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อเล่น / ชื่อในชาเลนจ์" maxLength={30}/>
    <label style={{fontSize:11,color:t.ts}}>📸 รูปโปรไฟล์ (ไม่เกิน 2MB)
      <div style={{marginTop:4,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        <label style={{padding:"6px 12px",fontSize:11,background:t.ac,color:"#fff",borderRadius:6,cursor:uploading?"wait":"pointer",display:"inline-block"}}>
          {uploading?"⏳ กำลังอัปโหลด...":"📤 เลือกไฟล์"}
          <input type="file" accept="image/*" onChange={upload} disabled={uploading} style={{display:"none"}}/>
        </label>
        {url&&<button onClick={()=>setUrl("")} style={{padding:"5px 10px",fontSize:11,background:"transparent",color:t.r,border:`1px solid ${t.r}40`,borderRadius:6,cursor:"pointer"}}>🗑 ลบรูป</button>}
      </div>
    </label>
    <Inp label="หรือวาง URL รูปภาพ (ไม่บังคับ)" t={t} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."/>
    {err&&<div style={{fontSize:11,color:t.r,padding:"6px 10px",background:`${t.r}12`,borderRadius:6}}>{err}</div>}
    <div style={{display:"flex",gap:6,marginTop:4}}>
      <Btn primary t={t} onClick={save} disabled={uploading} style={{flex:1}}>{uploading?"กำลังบันทึก...":"✓ บันทึก"}</Btn>
      <Btn t={t} onClick={onClose}>ยกเลิก</Btn>
    </div>
  </div>);
}

const OTHER_PRESETS=[
  {v:"loan",l:"เงินปล่อยกู้/ให้ยืม",i:"🤝"},
  {v:"deposit",l:"เงินฝาก/ออมทรัพย์",i:"🏦"},
  {v:"property",l:"อสังหาริมทรัพย์",i:"🏠"},
  {v:"vehicle",l:"ยานพาหนะ",i:"🚗"},
  {v:"business",l:"เงินลงทุนธุรกิจ",i:"💼"},
  {v:"collectible",l:"ของสะสม/พระ/ศิลปะ",i:"🎨"},
  {v:"receivable",l:"ลูกหนี้การค้า",i:"📋"},
  {v:"other",l:"อื่นๆ",i:"✨"},
];

function OtherItemForm({initial,onSave,onCancel,t}){
  const[f,set]=useF({category:initial?.category||"loan",name:initial?.name||"",amount:initial?.amount??"",cost:initial?.cost??"",note:initial?.note||""});
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <Sel label="หมวดหมู่" t={t} value={f.category} onChange={e=>set("category",e.target.value)}>{OTHER_PRESETS.map(p=><option key={p.v} value={p.v}>{p.i} {p.l}</option>)}</Sel>
    <Inp label="ชื่อรายการ" t={t} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="เช่น ปล่อยกู้คุณ A, คอนโดฯ รังสิต"/>
    <Inp label="มูลค่าปัจจุบัน (บาท)" t={t} type="number" value={f.amount} onChange={e=>set("amount",e.target.value)} placeholder="เช่น 105000"/>
    <Inp label="ต้นทุน/เงินต้น (บาท) — ไม่บังคับ" t={t} type="number" value={f.cost} onChange={e=>set("cost",e.target.value)} placeholder="เว้นว่าง = ไม่มีกำไร/ขาดทุน"/>
    <div style={{fontSize:10,color:t.tm}}>* ต้นทุน = เงินที่ลงไปครั้งแรก เช่น ปล่อยกู้ 100,000 ได้คืน 105,000 → ต้นทุน 100,000 / มูลค่าปัจจุบัน 105,000 = กำไร 5,000</div>
    <Inp label="หมายเหตุ (ไม่บังคับ)" t={t} value={f.note} onChange={e=>set("note",e.target.value)} placeholder="ดอกเบี้ย 5% ครบ 31 ธ.ค."/>
    <div style={{display:"flex",gap:6}}>
      <Btn primary t={t} onClick={()=>onSave(f)} disabled={!f.name||f.amount===""} style={{flex:1}}>✓ บันทึก</Btn>
      <Btn t={t} onClick={onCancel}>ยกเลิก</Btn>
    </div>
  </div>);
}

function MemberPortfolio({member,isMe,onUpdate,onEditProfile,t,toThb,rate}){
  const[modal,setModal]=useState(null);
  const[editCash,setEditCash]=useState(false);
  const[cashInput,setCashInput]=useState(member.cash||0);
  const assets=member.assets||[];
  const others=member.other_items||[];
  const stockValue=assets.reduce((s,a)=>s+toThb((+a.units||0)*(+a.currentPrice||0),a.currency||"THB"),0);
  const stockCost=assets.reduce((s,a)=>s+toThb((+a.units||0)*(+a.avgCost||0),a.currency||"THB"),0);
  const pl=stockValue-stockCost;
  const otherValue=others.reduce((s,o)=>s+(+o.amount||0),0);
  const otherCost=others.reduce((s,o)=>s+(+(o.cost??o.amount)||0),0);
  const otherPL=otherValue-otherCost;
  const total=stockValue+(+member.cash||0)+otherValue;
  const addAsset=f=>{onUpdate({assets:[...assets,{...f,id:uid(),units:+f.units,avgCost:+f.avgCost,currentPrice:+f.currentPrice}]});setModal(null);};
  const updateAsset=(aid,f)=>{onUpdate({assets:assets.map(a=>a.id===aid?{...a,...f,units:+f.units,avgCost:+f.avgCost,currentPrice:+f.currentPrice}:a)});setModal(null);};
  const delAsset=aid=>{if(!window.confirm("ลบสินทรัพย์นี้?"))return;onUpdate({assets:assets.filter(a=>a.id!==aid)});};
  const saveCash=()=>{onUpdate({cash:+cashInput||0});setEditCash(false);};
  const addOther=f=>{onUpdate({other_items:[...others,{...f,id:uid(),amount:+f.amount,cost:f.cost===""?null:+f.cost}]});setModal(null);};
  const updateOther=(oid,f)=>{onUpdate({other_items:others.map(o=>o.id===oid?{...o,...f,amount:+f.amount,cost:f.cost===""?null:+f.cost}:o)});setModal(null);};
  const delOther=oid=>{if(!window.confirm("ลบรายการนี้?"))return;onUpdate({other_items:others.filter(o=>o.id!==oid)});};
  return(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:"1 1 auto"}}>
        <Avatar url={member.avatar_url} name={member.display_name} size={40} t={t}/>
        <div style={{minWidth:0}}>
          <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis"}}>{member.display_name||"(ไม่มีชื่อ)"}{isMe&&<span style={{color:t.ac,marginLeft:6,fontSize:11}}>(คุณ)</span>}</div>
          {isMe&&onEditProfile&&<button onClick={()=>onEditProfile(member)} style={{fontSize:10,background:"none",border:"none",color:t.ac,cursor:"pointer",padding:0,marginTop:2}}>✏️ แก้ชื่อ / รูปโปรไฟล์</button>}
        </div>
      </div>
      <div style={{fontSize:12,color:t.tm}}>มูลค่ารวม: <span style={{color:t.text,fontWeight:600,fontSize:13}}>{fB(total)}</span></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"repeat(3,1fr)",gap:10,marginBottom:12}}>
      <div style={{background:`${t.ac}10`,padding:10,borderRadius:8}}>
        <div style={{fontSize:10,color:t.tm}}>📊 หุ้น ({assets.length} ตัว)</div>
        <div style={{fontSize:15,fontWeight:600,color:t.ac}}>{fB(stockValue)}</div>
        <div style={{fontSize:10,color:pl>=0?t.g:t.r}}>P&L: {pl>=0?"+":""}{fB(pl)}</div>
      </div>
      <div style={{background:`${t.g}10`,padding:10,borderRadius:8,position:"relative"}}>
        <div style={{fontSize:10,color:t.tm}}>💵 เงินสด/บัญชี</div>
        {editCash&&isMe?<div style={{display:"flex",gap:4,alignItems:"center",marginTop:2}}>
          <input value={cashInput} onChange={e=>setCashInput(e.target.value)} type="number" autoFocus style={{flex:1,padding:"4px 6px",borderRadius:4,border:`1px solid ${t.ibr}`,fontSize:13,background:t.ib,color:t.text,minWidth:0}}/>
          <button onClick={saveCash} style={{fontSize:11,padding:"3px 8px",background:t.g,color:"#fff",border:"none",borderRadius:4,cursor:"pointer"}}>✓</button>
          <button onClick={()=>setEditCash(false)} style={{fontSize:11,padding:"3px 8px",background:"transparent",color:t.tm,border:`1px solid ${t.cb}`,borderRadius:4,cursor:"pointer"}}>✕</button>
        </div>:<><div style={{fontSize:15,fontWeight:600,color:t.g}}>{fB(member.cash||0)}</div>{isMe&&<button onClick={()=>{setCashInput(member.cash||0);setEditCash(true)}} style={{position:"absolute",top:8,right:8,fontSize:10,background:"none",border:"none",color:t.tm,cursor:"pointer",textDecoration:"underline"}}>แก้ไข</button>}</>}
      </div>
      <div style={{background:`${t.pp}10`,padding:10,borderRadius:8}}>
        <div style={{fontSize:10,color:t.tm}}>✨ อื่นๆ ({others.length} รายการ)</div>
        <div style={{fontSize:15,fontWeight:600,color:t.pp}}>{fB(otherValue)}</div>
        <div style={{fontSize:10,color:otherPL>=0?t.g:t.r}}>P&L: {otherPL>=0?"+":""}{fB(otherPL)}</div>
      </div>
    </div>
    {assets.length>0?<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:isMe?560:480}}>
      <thead><tr style={{borderBottom:`1px solid ${t.cb}`}}>{["สินทรัพย์","จำนวน","ต้นทุน","ราคา","มูลค่า(฿)","P&L",...(isMe?[""]:[])].map((h,i)=><th key={i} style={{padding:"6px 8px",textAlign:"left",fontSize:9,color:t.tm,background:t.thBg}}>{h}</th>)}</tr></thead>
      <tbody>{assets.map(a=>{const cur=a.currency||"THB";const sym=cur==="USD"?"$":"฿";const v=toThb((+a.units)*(+a.currentPrice),cur);const c=toThb((+a.units)*(+a.avgCost),cur);const ap=v-c;const tp=AT.find(at=>at.v===a.type)||AT[7];return(<tr key={a.id} style={{borderBottom:`1px solid ${t.cb}`}}>
        <td style={{padding:"6px 8px",fontWeight:500}}>{tp.i} {a.name}<Badge color={cur==="USD"?t.ac:t.tl}>{cur}</Badge></td>
        <td style={{padding:"6px 8px"}}>{a.units}</td>
        <td style={{padding:"6px 8px"}}>{sym}{a.avgCost}</td>
        <td style={{padding:"6px 8px"}}>{sym}{a.currentPrice}</td>
        <td style={{padding:"6px 8px",fontWeight:500}}>{fB(v)}</td>
        <td style={{padding:"6px 8px",color:ap>=0?t.g:t.r}}>{ap>=0?"+":""}{fB(ap)}</td>
        {isMe&&<td style={{padding:"6px 8px"}}><div style={{display:"flex",gap:3}}><button onClick={()=>setModal({type:"edit",asset:a})} style={{fontSize:9,padding:"2px 6px",border:`1px solid ${t.cb}`,borderRadius:3,background:"transparent",cursor:"pointer",color:t.ts}}>แก้</button><button onClick={()=>delAsset(a.id)} style={{fontSize:9,padding:"2px 6px",border:`1px solid ${t.r}40`,borderRadius:3,background:"transparent",cursor:"pointer",color:t.r}}>ลบ</button></div></td>}
      </tr>);})}</tbody>
    </table></div>:<div style={{fontSize:11,color:t.tm,textAlign:"center",padding:14,background:`${t.cb}20`,borderRadius:8}}>ยังไม่มีสินทรัพย์</div>}
    {others.length>0&&(<div style={{marginTop:12}}>
      <div style={{fontSize:11,fontWeight:600,color:t.ts,marginBottom:6}}>✨ สินทรัพย์อื่นๆ</div>
      <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:isMe?520:440}}>
        <thead><tr style={{borderBottom:`1px solid ${t.cb}`}}>{["หมวด","ชื่อรายการ","ต้นทุน","มูลค่าปัจจุบัน","P&L",...(isMe?[""]:[])].map((h,i)=><th key={i} style={{padding:"6px 8px",textAlign:"left",fontSize:9,color:t.tm,background:t.thBg}}>{h}</th>)}</tr></thead>
        <tbody>{others.map(o=>{const cat=OTHER_PRESETS.find(p=>p.v===o.category)||OTHER_PRESETS[7];const hasCost=o.cost!=null&&o.cost!=="";const cost=+o.cost||0;const amt=+o.amount||0;const gain=amt-cost;return(<tr key={o.id} style={{borderBottom:`1px solid ${t.cb}`}}>
          <td style={{padding:"6px 8px"}}><span style={{fontSize:13,marginRight:4}}>{cat.i}</span><span style={{fontSize:10,color:t.tm}}>{cat.l}</span></td>
          <td style={{padding:"6px 8px",fontWeight:500}}>{o.name}{o.note&&<div style={{fontSize:9,color:t.tm,fontWeight:400}}>{o.note}</div>}</td>
          <td style={{padding:"6px 8px",color:t.tm}}>{hasCost?fB(cost):"-"}</td>
          <td style={{padding:"6px 8px",fontWeight:500,color:t.pp}}>{fB(amt)}</td>
          <td style={{padding:"6px 8px",color:hasCost?(gain>=0?t.g:t.r):t.tm}}>{hasCost?`${gain>=0?"+":""}${fB(gain)}`:"-"}</td>
          {isMe&&<td style={{padding:"6px 8px"}}><div style={{display:"flex",gap:3}}><button onClick={()=>setModal({type:"editOther",other:o})} style={{fontSize:9,padding:"2px 6px",border:`1px solid ${t.cb}`,borderRadius:3,background:"transparent",cursor:"pointer",color:t.ts}}>แก้</button><button onClick={()=>delOther(o.id)} style={{fontSize:9,padding:"2px 6px",border:`1px solid ${t.r}40`,borderRadius:3,background:"transparent",cursor:"pointer",color:t.r}}>ลบ</button></div></td>}
        </tr>);})}</tbody>
      </table></div>
    </div>)}
    {isMe&&<div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
      <Btn small primary t={t} onClick={()=>setModal({type:"add"})}>+ เพิ่มสินทรัพย์</Btn>
      <Btn small t={t} onClick={()=>setModal({type:"addOther"})} style={{background:`${t.pp}15`,border:`1px solid ${t.pp}60`,color:t.pp}}>+ เพิ่มอื่นๆ (ปล่อยกู้/อสังหา/ฯลฯ)</Btn>
    </div>}
    <Modal open={modal?.type==="add"||modal?.type==="edit"} onClose={()=>setModal(null)} title={modal?.type==="edit"?"แก้ไขสินทรัพย์":"เพิ่มสินทรัพย์"} t={t}>
      <AssetForm initial={modal?.asset} onSave={f=>modal?.type==="edit"?updateAsset(modal.asset.id,f):addAsset(f)} onCancel={()=>setModal(null)} t={t} rate={rate}/>
    </Modal>
    <Modal open={modal?.type==="addOther"||modal?.type==="editOther"} onClose={()=>setModal(null)} title={modal?.type==="editOther"?"แก้ไขรายการอื่นๆ":"เพิ่มสินทรัพย์อื่นๆ"} t={t}>
      <OtherItemForm initial={modal?.other} onSave={f=>modal?.type==="editOther"?updateOther(modal.other.id,f):addOther(f)} onCancel={()=>setModal(null)} t={t}/>
    </Modal>
  </div>);
}

/* ═══ QUICK ADD FAB ═══ */
function QuickAddFAB({data,t,onQuickAdd,onOpenFull,disabled}){
  const[open,setOpen]=useState(false);
  const templates=useMemo(()=>{
    const now=Date.now();const days60=60*86400000;
    const recent=(data?.transactions||[]).filter(tx=>tx.type==="expense"&&(now-new Date(tx.date).getTime())<=days60);
    const groups={};
    recent.forEach(tx=>{
      const bucket=Math.round(tx.amount/10)*10||10;
      const key=`${tx.category}-${bucket}`;
      if(!groups[key])groups[key]={count:0,category:tx.category,amount:bucket,note:tx.note||""};
      groups[key].count++;
      if(tx.note&&!groups[key].note)groups[key].note=tx.note;
    });
    const sorted=Object.values(groups).sort((a,b)=>b.count-a.count).slice(0,5);
    if(sorted.length<4){
      const defaults=[{category:"food",amount:60,note:"กาแฟ"},{category:"food",amount:80,note:"ข้าวเที่ยง"},{category:"transport",amount:50,note:"เดินทาง"},{category:"shopping",amount:100,note:"เซเว่น"}];
      defaults.forEach(d=>{if(sorted.length<4&&!sorted.some(s=>s.category===d.category&&s.amount===d.amount))sorted.push(d)});
    }
    return sorted.slice(0,5);
  },[data?.transactions]);
  useEffect(()=>{if(disabled&&open)setOpen(false)},[disabled,open]);
  if(disabled)return null;
  const cats=EC.reduce((a,c)=>{a[c.v]=c;return a},{});
  return(<>
    {open&&<div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:998,backdropFilter:"blur(2px)"}}/>}
    <div style={{position:"fixed",right:"calc(16px + env(safe-area-inset-right))",bottom:"calc(74px + env(safe-area-inset-bottom))",zIndex:999,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
      {open&&(<>
        {templates.map((tpl,i)=>{const c=cats[tpl.category]||cats.other;return(
          <button key={i} onClick={()=>{onQuickAdd(tpl);setOpen(false)}} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",background:t.card,border:`1px solid ${t.cb}`,borderRadius:24,boxShadow:"0 4px 12px rgba(0,0,0,0.18)",cursor:"pointer",color:t.text,fontSize:13,fontWeight:500,animation:`fabIn .22s ease ${i*0.04}s both`,whiteSpace:"nowrap"}}>
            <span style={{fontSize:16}}>{c.i}</span>
            <span style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis"}}>{tpl.note||c.l}</span>
            <span style={{color:t.r,fontWeight:600}}>{fB(tpl.amount)}</span>
          </button>
        )})}
        <button onClick={()=>{onOpenFull();setOpen(false)}} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",background:t.card,border:`1px solid ${t.cb}`,borderRadius:24,boxShadow:"0 4px 12px rgba(0,0,0,0.18)",cursor:"pointer",color:t.text,fontSize:13,fontWeight:500,animation:`fabIn .22s ease ${templates.length*0.04}s both`}}>
          <span style={{fontSize:16}}>📝</span><span>กรอกเอง</span>
        </button>
      </>)}
      <button onClick={()=>setOpen(o=>!o)} aria-label="quick add" style={{width:56,height:56,borderRadius:"50%",background:t.ac,color:"#fff",border:"none",fontSize:28,fontWeight:300,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.28)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .22s ease",transform:open?"rotate(45deg)":"rotate(0)",lineHeight:1}}>+</button>
    </div>
    <style>{`@keyframes fabIn{from{opacity:0;transform:translateY(8px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
  </>);
}

function Toast({toast,onClose,t}){
  useEffect(()=>{if(!toast)return;const id=setTimeout(onClose,toast.duration||5000);return()=>clearTimeout(id)},[toast,onClose]);
  if(!toast)return null;
  const handleUndo=()=>{haptic(10);toast.onUndo&&toast.onUndo();onClose()};
  return(<div style={{position:"fixed",left:"50%",bottom:"calc(146px + env(safe-area-inset-bottom))",transform:"translateX(-50%)",zIndex:1001,background:t.text,color:t.bg,padding:"11px 18px",borderRadius:24,boxShadow:"0 6px 20px rgba(0,0,0,0.32)",display:"flex",alignItems:"center",gap:14,fontSize:13,maxWidth:"calc(100vw - 32px)",animation:"toastIn .25s ease"}}>
    <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{toast.msg}</span>
    {toast.onUndo&&<button onClick={handleUndo} style={{background:"transparent",border:"none",color:t.ac,fontWeight:600,cursor:"pointer",fontSize:13,padding:0,whiteSpace:"nowrap"}}>↶ {toast.undoLabel||"ยกเลิก"}</button>}
    <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
  </div>);
}

/* ═══ BOTTOM TAB BAR (mobile) ═══ */
/* ═══ MOBILE MENU SHEET ═══
 * Full-screen icon grid menu (DRMK-style) for mobile only.
 * Triggered by BottomTabBar's "เพิ่มเติม" tab. Replaces the slide-in
 * sidebar on mobile. Desktop still uses the regular Sidebar component.
 */
const NAV_COLORS={
  dashboard:"#0EA5E9",portfolio:"#8B5CF6",txn:"#10B981",calendar:"#3B82F6",
  recurring:"#06B6D4",envelopes:"#EC4899",analytics:"#F59E0B",
  balance:"#14B8A6",cashflow:"#22C55E",cfdetail:"#65A30D",
  goals:"#FBBF24",debts:"#EF4444",
  dca:"#6366F1",retire:"#F97316",plan:"#0D9488",tax:"#F472B6",
  reports:"#0891B2",challenges:"#FACC15",about:"#94A3B8",
};

/* ═══ NAV ICONS (Lucide-style SVG) ═══
 * Cohesive line-icon set used in MobileMenuSheet.
 * 24×24 viewBox, stroke=currentColor, strokeWidth=2, round caps/joins.
 * Renders white on the gradient tile.
 */
function NavIcon({name,size=26}){
  const s={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};
  switch(name){
    case"dashboard":return<svg {...s}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
    case"portfolio":return<svg {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 13h20"/></svg>;
    case"txn":return<svg {...s}><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>;
    case"calendar":return<svg {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg>;
    case"recurring":return<svg {...s}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
    case"envelopes":return<svg {...s}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
    case"analytics":return<svg {...s}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
    case"balance":return<svg {...s}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
    case"cashflow":return<svg {...s}><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2C17 7 17 5 19.5 5c1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>;
    case"cfdetail":return<svg {...s}><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>;
    case"goals":return<svg {...s}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case"debts":return<svg {...s}><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M11 15h3"/></svg>;
    case"dca":return<svg {...s}><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M8 6h8"/><path d="M16 14v4"/><circle cx="8" cy="10" r=".5" fill="currentColor"/><circle cx="12" cy="10" r=".5" fill="currentColor"/><circle cx="16" cy="10" r=".5" fill="currentColor"/><circle cx="8" cy="14" r=".5" fill="currentColor"/><circle cx="12" cy="14" r=".5" fill="currentColor"/><circle cx="8" cy="18" r=".5" fill="currentColor"/><circle cx="12" cy="18" r=".5" fill="currentColor"/></svg>;
    case"retire":return<svg {...s}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
    case"plan":return<svg {...s}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>;
    case"tax":return<svg {...s}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>;
    case"reports":return<svg {...s}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
    case"challenges":return<svg {...s}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
    case"about":return<svg {...s}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
    case"menu":return<svg {...s}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case"chat":return<svg {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>;
    case"profile":return<svg {...s}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    default:return null;
  }
}

/* ═══ MOBILE MENU PAGE ═══
 * Renders all NAV items as a DRMK-style icon grid (mobile only).
 * Now a regular page (page==="menu") instead of a slide-over sheet.
 */
function MobileMenuPage({page,setPage,t}){
  const groups=[...new Set(NAV.map(n=>n.g))];
  const go=k=>{haptic(8);setPage(k)};
  return(<div style={{padding:"4px 0 8px"}}>
    {groups.map(g=>(<div key={g} style={{marginBottom:22}}>
      <div style={{fontSize:10,color:t.tm,fontWeight:700,letterSpacing:1.4,textTransform:"uppercase",padding:"0 6px 12px"}}>{g}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap:10}}>
        {NAV.filter(n=>n.g===g).map(n=>{
          const color=NAV_COLORS[n.k]||t.ac;
          const isActive=page===n.k;
          return(<button key={n.k} onClick={()=>go(n.k)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"14px 4px 12px",background:isActive?`${color}12`:"transparent",border:`1px solid ${isActive?color+"40":"transparent"}`,cursor:"pointer",borderRadius:14,transition:"transform .15s ease",WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}
            onTouchStart={e=>{e.currentTarget.style.transform="scale(0.93)"}}
            onTouchEnd={e=>{e.currentTarget.style.transform="scale(1)"}}
            onTouchCancel={e=>{e.currentTarget.style.transform="scale(1)"}}
          >
            <div style={{width:58,height:58,borderRadius:16,background:`linear-gradient(140deg, ${color} 0%, ${color}d9 60%, ${color}b3 100%)`,boxShadow:isActive?`0 0 0 3px ${t.bg}, 0 0 0 5px ${color}, 0 8px 18px ${color}55`:`0 8px 18px ${color}45, 0 2px 5px ${color}30, inset 0 1px 0 rgba(255,255,255,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)",pointerEvents:"none",borderRadius:"16px 16px 0 0"}}/>
              <div style={{position:"absolute",inset:0,borderRadius:16,boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.12)",pointerEvents:"none"}}/>
              <div style={{position:"relative",filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.18))",display:"flex"}}>
                <NavIcon name={n.k} size={26}/>
              </div>
            </div>
            <span style={{fontSize:11,fontWeight:isActive?700:500,color:isActive?color:t.text,textAlign:"center",lineHeight:1.3,minHeight:28,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px"}}>{n.l}</span>
          </button>);
        })}
      </div>
    </div>))}
  </div>);
}

/* ═══ PROFILE PAGE ═══
 * Avatar (Supabase Storage 'avatars' bucket), display name (user_profiles
 * table), email, theme switcher, logout. Required tables: see SQL doc.
 */
function ProfilePage({session,t,theme,setTheme,onLogout}){
  const[profile,setProfile]=useState({display_name:"",avatar_url:""});
  const[name,setName]=useState("");
  const[saving,setSaving]=useState(false);
  const[uploading,setUploading]=useState(false);
  const[err,setErr]=useState("");
  const fileRef=useRef();

  useEffect(()=>{
    if(!session)return;
    supabase.from("user_profiles").select("*").eq("user_id",session.user.id).maybeSingle()
      .then(({data})=>{
        if(data){setProfile(data);setName(data.display_name||"")}
        else setName(session.user.email?.split("@")[0]||"");
      });
  },[session]);

  const saveName=async()=>{
    if(!session||!name.trim())return;
    setSaving(true);setErr("");
    const{error}=await supabase.from("user_profiles").upsert({user_id:session.user.id,display_name:name.trim(),avatar_url:profile.avatar_url||null,updated_at:new Date().toISOString()});
    if(error){setErr(error.message)}
    else{setProfile(p=>({...p,display_name:name.trim()}));haptic(15)}
    setSaving(false);
  };

  const uploadAvatar=async(e)=>{
    const file=e.target.files?.[0];if(!file||!session)return;
    if(file.size>3*1024*1024){setErr("รูปต้องไม่เกิน 3 MB");return}
    setUploading(true);setErr("");
    const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
    const path=`${session.user.id}/avatar.${ext}`;
    const{error:upErr}=await supabase.storage.from("avatars").upload(path,file,{upsert:true,contentType:file.type});
    if(upErr){setErr(upErr.message);setUploading(false);return}
    const{data:pub}=supabase.storage.from("avatars").getPublicUrl(path);
    const url=pub.publicUrl+"?t="+Date.now();
    const{error:dbErr}=await supabase.from("user_profiles").upsert({user_id:session.user.id,display_name:name||(session.user.email?.split("@")[0]||""),avatar_url:url,updated_at:new Date().toISOString()});
    if(dbErr){setErr(dbErr.message)}
    else{setProfile(p=>({...p,avatar_url:url}));haptic(15)}
    setUploading(false);
  };

  const themeIcon=k=>{
    const sv={width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};
    if(k==="light")return<svg {...sv}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
    if(k==="dark")return<svg {...sv}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
    if(k==="paper")return<svg {...sv}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
    return<svg {...sv}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v3"/><path d="M10 2v3"/><path d="M14 2v3"/></svg>;
  };
  const themes=[{k:"light",l:"Light"},{k:"paper",l:"Paper"},{k:"cream",l:"Cream"},{k:"dark",l:"Dark"}];

  if(!session)return(<div style={{padding:"30px 16px",textAlign:"center",color:t.ts}}>
    <div style={{fontSize:48,marginBottom:12,opacity:0.5}}>🔒</div>
    <div>กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</div>
  </div>);

  const initial=(name||session.user.email||"U")[0]?.toUpperCase()||"U";

  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    {/* Avatar card */}
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:16,padding:"22px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{position:"relative"}}>
        <div style={{width:96,height:96,borderRadius:"50%",overflow:"hidden",background:`linear-gradient(135deg, ${t.ac}, ${t.ac}99)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:36,fontWeight:700,boxShadow:`0 6px 20px ${t.ac}40`}}>
          {profile.avatar_url
            ?<img src={profile.avatar_url} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            :initial}
        </div>
        <button onClick={()=>{haptic(5);fileRef.current?.click()}} disabled={uploading} style={{position:"absolute",bottom:0,right:0,width:32,height:32,borderRadius:"50%",border:`2px solid ${t.card}`,background:t.ac,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
          {uploading
            ?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>
            :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} style={{display:"none"}}/>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:16,fontWeight:600,color:t.text}}>{profile.display_name||name||"ผู้ใช้ใหม่"}</div>
        <div style={{fontSize:11,color:t.tm,marginTop:2}}>{session.user.email}</div>
      </div>
    </div>

    {/* Name editor */}
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}>
      <div style={{fontSize:11,color:t.tm,fontWeight:600,marginBottom:8}}>ชื่อที่แสดง</div>
      <div style={{display:"flex",gap:8}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="ชื่อของคุณ" maxLength={32} style={{flex:1,padding:"10px 12px",border:`1px solid ${t.ibr}`,borderRadius:8,background:t.ib,color:t.text,fontSize:13,minWidth:0}}/>
        <button onClick={saveName} disabled={saving||!name.trim()||name===profile.display_name} style={{padding:"10px 16px",borderRadius:8,border:"none",background:t.ac,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",opacity:(saving||!name.trim()||name===profile.display_name)?0.5:1,WebkitTapHighlightColor:"transparent"}}>{saving?"...":"บันทึก"}</button>
      </div>
      {err&&<div style={{fontSize:11,color:t.r,marginTop:6}}>{err}</div>}
    </div>

    {/* Theme */}
    <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}>
      <div style={{fontSize:11,color:t.tm,fontWeight:600,marginBottom:10}}>ธีม</div>
      <div style={{display:"flex",gap:8}}>
        {themes.map(th=>{const sel=theme===th.k;return(<button key={th.k} onClick={()=>{haptic(5);setTheme(th.k)}} style={{flex:1,padding:"12px 4px",border:`2px solid ${sel?t.ac:t.cb}`,borderRadius:10,background:sel?`${t.ac}15`:t.bg,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all .15s",WebkitTapHighlightColor:"transparent",color:sel?t.ac:t.ts}}>
          <div style={{lineHeight:1,display:"flex"}}>{themeIcon(th.k)}</div>
          <span style={{fontSize:10,fontWeight:sel?700:500}}>{th.l}</span>
        </button>)})}
      </div>
    </div>

    {/* Logout */}
    <button onClick={()=>{haptic([10,40,10]);onLogout()}} style={{width:"100%",padding:14,border:`1px solid ${t.r}40`,borderRadius:12,background:`${t.r}10`,color:t.r,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,WebkitTapHighlightColor:"transparent"}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
      ออกจากระบบ
    </button>
  </div>);
}

/* ═══ CHAT PAGE ═══
 * Global chatroom — every signed-in user sees the same stream.
 * Tables: chat_messages (with realtime), user_profiles (for display_name/avatar).
 */
function ChatPage({session,t}){
  const[msgs,setMsgs]=useState([]);
  const[profiles,setProfiles]=useState({});
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(true);
  const[sending,setSending]=useState(false);
  const scrollRef=useRef();

  // Load history + subscribe
  useEffect(()=>{
    if(!session)return;
    let mounted=true;
    supabase.from("chat_messages").select("*").order("created_at",{ascending:false}).limit(100)
      .then(({data})=>{if(mounted){setMsgs((data||[]).reverse());setLoading(false)}});
    supabase.from("user_profiles").select("user_id,display_name,avatar_url")
      .then(({data})=>{if(!mounted)return;const m={};(data||[]).forEach(p=>m[p.user_id]=p);setProfiles(m)});
    const ch=supabase.channel("chat-room").on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages"},payload=>{
      setMsgs(prev=>prev.some(m=>m.id===payload.new.id)?prev:[...prev,payload.new]);
      // Lazy-load profile if unknown
      const uid=payload.new.user_id;
      setProfiles(prev=>{
        if(prev[uid])return prev;
        supabase.from("user_profiles").select("*").eq("user_id",uid).maybeSingle().then(({data})=>{
          if(data)setProfiles(p=>({...p,[uid]:data}));
        });
        return prev;
      });
    }).subscribe();
    return()=>{mounted=false;supabase.removeChannel(ch)};
  },[session]);

  // Auto-scroll on new message
  useEffect(()=>{
    const el=scrollRef.current;if(!el)return;
    el.scrollTop=el.scrollHeight;
  },[msgs]);

  const send=async()=>{
    const m=input.trim();if(!m||!session||sending)return;
    setSending(true);haptic(10);
    setInput("");
    const{error}=await supabase.from("chat_messages").insert({user_id:session.user.id,message:m});
    if(error){console.error(error);setInput(m)}
    setSending(false);
  };

  if(!session)return(<div style={{padding:"30px 16px",textAlign:"center",color:t.ts}}>
    <div style={{fontSize:48,marginBottom:12,opacity:0.5}}>💬</div>
    <div>กรุณาเข้าสู่ระบบเพื่อแชท</div>
  </div>);

  const fmtTime=ts=>{
    const d=new Date(ts);const now=new Date();
    if(d.toDateString()===now.toDateString())return d.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"});
    return d.toLocaleDateString("th-TH",{month:"short",day:"numeric"})+" "+d.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"});
  };

  return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)",minHeight:400,background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,overflow:"hidden"}}>
    <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"14px 12px",WebkitOverflowScrolling:"touch"}}>
      {loading&&<div style={{textAlign:"center",color:t.tm,fontSize:12,padding:20}}>กำลังโหลด...</div>}
      {!loading&&msgs.length===0&&<div style={{textAlign:"center",color:t.tm,fontSize:12,padding:30}}>ยังไม่มีข้อความ — เริ่มทักทายเลย!</div>}
      {msgs.map((m,i)=>{
        const isMe=m.user_id===session.user.id;
        const p=profiles[m.user_id]||{};
        const prev=msgs[i-1];
        const showAvatar=!prev||prev.user_id!==m.user_id;
        const name=p.display_name||"ผู้ใช้";
        const initial=name[0]?.toUpperCase()||"U";
        return(<div key={m.id||i} style={{display:"flex",flexDirection:isMe?"row-reverse":"row",alignItems:"flex-end",gap:6,marginBottom:showAvatar?10:2}}>
          <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,visibility:showAvatar?"visible":"hidden",overflow:"hidden",background:`linear-gradient(135deg, ${isMe?t.ac:t.pp}, ${isMe?t.ac:t.pp}99)`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>
            {p.avatar_url?<img src={p.avatar_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initial}
          </div>
          <div style={{maxWidth:"72%",display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start"}}>
            {showAvatar&&!isMe&&<div style={{fontSize:10,color:t.tm,marginBottom:3,padding:"0 8px"}}>{name}</div>}
            <div style={{padding:"8px 12px",borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",background:isMe?t.ac:t.bg,color:isMe?"#fff":t.text,fontSize:13,lineHeight:1.4,wordBreak:"break-word",whiteSpace:"pre-wrap",border:isMe?"none":`1px solid ${t.cb}`}}>{m.message}</div>
            <div style={{fontSize:9,color:t.tm,marginTop:2,padding:"0 4px"}}>{fmtTime(m.created_at)}</div>
          </div>
        </div>);
      })}
    </div>
    <div style={{borderTop:`1px solid ${t.cb}`,padding:10,display:"flex",gap:8,background:t.card}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="พิมพ์ข้อความ..." maxLength={500} style={{flex:1,padding:"10px 14px",border:`1px solid ${t.ibr}`,borderRadius:20,background:t.ib,color:t.text,fontSize:13,minWidth:0,outline:"none"}}/>
      <button onClick={send} disabled={!input.trim()||sending} aria-label="ส่ง" style={{width:40,height:40,borderRadius:"50%",border:"none",background:input.trim()?t.ac:t.cb,color:"#fff",cursor:input.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .15s",WebkitTapHighlightColor:"transparent"}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9z"/></svg>
      </button>
    </div>
  </div>);
}

function BottomTabBar({page,setPage,t,disabled}){
  if(disabled)return null;
  const tabs=[
    {k:"dashboard",l:"หน้าแรก"},
    {k:"menu",l:"เมนู"},
    {k:"challenges",l:"ชาเลนจ์"},
    {k:"chat",l:"แชท"},
    {k:"profile",l:"โปรไฟล์"},
  ];
  return(<div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:97,background:t.card,borderTop:`1px solid ${t.cb}`,boxShadow:"0 -2px 10px rgba(0,0,0,0.06)",paddingBottom:"env(safe-area-inset-bottom)",paddingLeft:"env(safe-area-inset-left)",paddingRight:"env(safe-area-inset-right)"}}>
    <div style={{display:"flex",justifyContent:"space-around",alignItems:"stretch",height:60}}>
      {tabs.map(tab=>{const active=page===tab.k;const col=active?t.ac:t.tm;return(<button key={tab.k} onClick={()=>{haptic(5);setPage(tab.k)}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,background:"transparent",border:"none",cursor:"pointer",color:col,padding:"6px 4px",position:"relative",transition:"color .15s",WebkitTapHighlightColor:"transparent"}}>
        {active&&<div style={{position:"absolute",top:0,left:"30%",right:"30%",height:3,background:t.ac,borderRadius:"0 0 3px 3px"}}/>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
          <NavIcon name={tab.k} size={22}/>
        </div>
        <span style={{fontSize:10,fontWeight:active?600:500,letterSpacing:0.2}}>{tab.l}</span>
      </button>)})}
    </div>
  </div>);
}

/* ═══ MAIN APP ═══ */
function WealthHub(){
  const[data,setData]=useState(null);const[loading,setLoading]=useState(true);const[page,setPage]=useState("dashboard");const[modal,setModal]=useState(null);const[theme,setTheme]=useState("light");const[sbOpen,setSbOpen]=useState(false);const[session,setSession]=useState(undefined);const[showAuth,setShowAuth]=useState(false);const[recovery,setRecovery]=useState(false);const[newPw,setNewPw]=useState("");const[newPw2,setNewPw2]=useState("");const[showNewPw,setShowNewPw]=useState(false);const[recErr,setRecErr]=useState("");const[recLoading,setRecLoading]=useState(false);const[challengeDetailId,setChallengeDetailId]=useState(null);const[toast,setToast]=useState(null);
  const isMobile=useIsMobile();
  const t=useMemo(()=>({...(theme==="dark"?Dk:theme==="paper"?Paper:theme==="cream"?Cream:L),m:isMobile}),[theme,isMobile]);

  useEffect(()=>{try{const saved=localStorage.getItem("wealthhub-theme");if(saved)setTheme(saved)}catch{}},[]);
  useEffect(()=>{try{localStorage.setItem("wealthhub-theme",theme)}catch{}},[theme]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session:s}})=>setSession(s||null));
    const{data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{
      setSession(s||null);
      if(event==="PASSWORD_RECOVERY"){setRecovery(true);setShowAuth(false)}
    });
    return()=>subscription.unsubscribe();
  },[]);

  const updatePassword=async()=>{
    if(newPw.length<6){setRecErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");return;}
    if(newPw!==newPw2){setRecErr("รหัสผ่านไม่ตรงกัน");return;}
    setRecLoading(true);setRecErr("");
    const{error}=await supabase.auth.updateUser({password:newPw});
    setRecLoading(false);
    if(error)setRecErr(error.message);
    else{setRecovery(false);setNewPw("");setNewPw2("");setRecErr("");window.alert("เปลี่ยนรหัสผ่านสำเร็จ ✅")}
  };

  useEffect(()=>{
    if(session===undefined)return;
    if(!session){
      const loaded=ld()||DF;
      const processed=processRecurring(loaded);
      setData(processed);
      if(processed!==loaded)sv(processed);
      setLoading(false);
      return;
    }
    setShowAuth(false);
    let cancelled=false;
    (async()=>{
      setLoading(true);
      const{data:row}=await supabase.from("user_data").select("data").eq("user_id",session.user.id).single();
      if(cancelled)return;
      const loaded=row?.data||ld()||DF;
      const processed=processRecurring(loaded);
      setData(processed);
      if(!row?.data||processed!==loaded){
        supabase.from("user_data").upsert({user_id:session.user.id,data:processed,updated_at:new Date().toISOString()},{onConflict:"user_id"}).then(({error})=>{if(error)console.error("initial sync error:",error)});
        sv(processed);
      }
      setLoading(false);
    })();
    return()=>{cancelled=true};
  },[session]);

  const persist=useCallback((nd)=>{
    setData(nd);sv(nd);
    if(session?.user?.id)supabase.from("user_data").upsert({user_id:session.user.id,data:nd,updated_at:new Date().toISOString()},{onConflict:"user_id"}).then(({error})=>{if(error)console.error("sync:",error)});
  },[session]);

  const logout=()=>supabase.auth.signOut().then(()=>{setPage("dashboard")});

  const[priceRefresh,setPriceRefresh]=useState({loading:false,msg:"",err:""});
  const mapYahooSymbol=(a)=>{
    const s=(a.name||"").trim().toUpperCase();
    if(!s)return null;
    if(a.type==="stock_th")return s.includes(".")?s:s+".BK";
    if(a.type==="stock_us")return s;
    if(a.type==="crypto")return s.includes("-")?s:s+"-USD";
    if(a.type==="gold")return "GC=F";
    return null;
  };
  const refreshPrices=async(opts={})=>{
    const fxOnly=!!opts.fxOnly;
    const pairs=fxOnly?[]:(data?.assets||[]).map(a=>[a,mapYahooSymbol(a)]).filter(([,s])=>s);
    if(!fxOnly&&!pairs.length){setPriceRefresh({loading:false,msg:"",err:"ไม่มีสินทรัพย์ที่รองรับการดึงราคา (รองรับ: หุ้นไทย/US, Crypto, ทอง)"});return;}
    setPriceRefresh({loading:true,msg:"",err:""});
    try{
      const symSet=new Set(pairs.map(([,s])=>s));
      symSet.add("THB=X");
      const syms=[...symSet].join(",");
      const r=await fetch(`/api/quote?symbols=${encodeURIComponent(syms)}`);
      if(!r.ok)throw new Error(`server ${r.status}`);
      const{quotes}=await r.json();
      let ok=0,fail=0;
      const newAssets=fxOnly?data.assets:data.assets.map(a=>{
        const sym=mapYahooSymbol(a);
        const q=sym?quotes[sym]:null;
        if(q&&q.price!=null&&!q.error){ok++;return{...a,currentPrice:+q.price.toFixed(4)}}
        if(sym)fail++;
        return a;
      });
      const fx=quotes["THB=X"];
      const newRate=fx?.price?+fx.price.toFixed(4):null;
      const newSettings=newRate?{...data.settings,rate:newRate}:data.settings;
      persist({...data,assets:newAssets,settings:newSettings});
      const fxMsg=newRate?` · 💱 1 USD = ฿${newRate.toFixed(2)}`:"";
      const assetMsg=fxOnly?"อัปเดตอัตราแลกเปลี่ยนสำเร็จ":`อัปเดต ${ok} รายการสำเร็จ`;
      setPriceRefresh({loading:false,msg:`${assetMsg}${fxMsg}${fail?` (ไม่พบ ${fail} รายการ)`:""}`,err:""});
      setTimeout(()=>setPriceRefresh(p=>({...p,msg:""})),5000);
    }catch(e){
      setPriceRefresh({loading:false,msg:"",err:"ดึงข้อมูลไม่สำเร็จ: "+e.message});
    }
  };
  const rate=data?.settings?.rate||35.5;const setRate=r=>persist({...data,settings:{...data.settings,rate:r}});
  const toThb=useCallback((v,cur)=>cur==="USD"?v*rate:v,[rate]);

  // Generic delete + undo: snapshot before delete, show toast w/ "ยกเลิก" for 5s
  const deleteWithUndo=(label,filterFn)=>{
    const snap=data;
    haptic([10,40,10]);
    persist(filterFn(data));
    setToast({msg:`🗑️ ลบ${label?` "${label}"`:""} แล้ว`,onUndo:()=>persist(snap)});
  };

  const addAsset=f=>{haptic(15);persist({...data,assets:[...data.assets,{...f,id:uid(),units:+f.units,avgCost:+f.avgCost,currentPrice:+f.currentPrice}]});setModal(null)};
  const updateAsset=(id,f)=>{haptic(15);persist({...data,assets:data.assets.map(a=>a.id===id?{...a,...f,units:+f.units,avgCost:+f.avgCost,currentPrice:+f.currentPrice}:a)});setModal(null)};
  const delAsset=id=>{const a=data.assets.find(x=>x.id===id);deleteWithUndo(a?.name,d=>({...d,assets:d.assets.filter(x=>x.id!==id)}))};
  const addTxn=f=>{haptic(15);persist({...data,transactions:[...data.transactions,{...f,id:uid(),amount:+f.amount}]});setModal(null)};
  const updateTxn=(id,f)=>{haptic(15);persist({...data,transactions:data.transactions.map(tx=>tx.id===id?{...tx,...f,amount:+f.amount}:tx)});setModal(null)};
  const delTxn=id=>{const tx=data.transactions.find(x=>x.id===id);const lab=tx?.note||(EC.find(c=>c.v===tx?.category)?.l)||"";deleteWithUndo(lab,d=>({...d,transactions:d.transactions.filter(x=>x.id!==id)}))};
  const quickAddTxn=tpl=>{
    const snap=data;
    haptic(15);
    const newTxn={type:"expense",category:tpl.category,amount:+tpl.amount,date:td(),note:tpl.note||"",id:uid()};
    persist({...data,transactions:[...data.transactions,newTxn]});
    setToast({msg:`✓ บันทึก ${tpl.note||(EC.find(c=>c.v===tpl.category)?.l||"")} ${fB(tpl.amount)}`,onUndo:()=>persist(snap)});
  };
  const addGoal=f=>{haptic(15);persist({...data,goals:[...data.goals,{...f,id:uid(),target:+f.target,saved:+f.saved}]});setModal(null)};
  const updateGoal=(id,f)=>{haptic(15);persist({...data,goals:data.goals.map(g=>g.id===id?{...g,...f,target:+f.target,saved:+f.saved}:g)});setModal(null)};
  const delGoal=id=>{const g=data.goals.find(x=>x.id===id);deleteWithUndo(g?.name,d=>({...d,goals:d.goals.filter(x=>x.id!==id)}))};
  const addDebt=f=>{haptic(15);persist({...data,debts:[...data.debts,{...f,id:uid(),total:+f.total,paid:+f.paid,rate:+f.rate}]});setModal(null)};
  const updateDebt=(id,f)=>{haptic(15);persist({...data,debts:data.debts.map(d=>d.id===id?{...d,...f,total:+f.total,paid:+f.paid,rate:+f.rate}:d)});setModal(null)};
  const delDebt=id=>{const d2=data.debts.find(x=>x.id===id);deleteWithUndo(d2?.name,d=>({...d,debts:d.debts.filter(x=>x.id!==id)}))};
  const addRecurring=f=>{haptic(15);persist({...data,recurring:[...(data.recurring||[]),{...f,id:uid(),amount:+f.amount,dayOfMonth:+f.dayOfMonth,active:!!f.active,lastRun:null}]});setModal(null)};
  const updateRecurring=(id,f)=>{haptic(15);persist({...data,recurring:(data.recurring||[]).map(r=>r.id===id?{...r,...f,amount:+f.amount,dayOfMonth:+f.dayOfMonth,active:!!f.active}:r)});setModal(null)};
  const delRecurring=id=>{const r=(data.recurring||[]).find(x=>x.id===id);deleteWithUndo(r?.name,d=>({...d,recurring:(d.recurring||[]).filter(x=>x.id!==id)}))};
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
    return{totalPortfolio:tp,totalCost:tc,portfolioPL:pl,portfolioPct:pp,allocation:alloc,incomeThisMonth:iM,expenseThisMonth:eM,netThisMonth:nM,totalGoalSaved:gs,totalGoalTarget:gt,totalDebt:td2,totalDebtPaid:dp,debtRemaining:dr,netWorth:nw,totalAssets:tp+gs+(data.balanceSheet?((data.balanceSheet.cash||0)+(data.balanceSheet.savings||0)+(data.balanceSheet.car||0)+(data.balanceSheet.house||0)+(data.balanceSheet.otherAssets||0)):0),totalLiab:dr+(data.balanceSheet?((data.balanceSheet.creditCard||0)+(data.balanceSheet.carLoan||0)+(data.balanceSheet.homeLoan||0)+(data.balanceSheet.otherLiab||0)):0),monthlyTrend:mt,expCatData:ecd};
  },[data,toThb]);

  // Daily net worth snapshot
  useEffect(()=>{
    if(!session?.user||!data||stats.netWorth===undefined)return;
    const today=new Date().toISOString().slice(0,10);
    const key=`nwSnap_${session.user.id}_${today}`;
    if(localStorage.getItem(key))return;
    const realNW=(stats.totalAssets||0)-(stats.totalLiab||0);
    supabase.from("net_worth_history").upsert({user_id:session.user.id,date:today,net_worth:+realNW.toFixed(2),assets:+(stats.totalAssets||0).toFixed(2),liabilities:+(stats.totalLiab||0).toFixed(2)},{onConflict:"user_id,date"}).then(({error})=>{if(!error)localStorage.setItem(key,"1")});
    // Debt due-soon notification
    (data.debts||[]).forEach(d=>{
      if(d.dueDate&&d.total-d.paid>0){
        const diff=(new Date(d.dueDate)-new Date())/86400000;
        if(diff>=0&&diff<=7)createNotif(session.user.id,"debt_due",`💳 ${d.name} ใกล้ครบกำหนด`,`เหลืออีก ${Math.ceil(diff)} วัน · คงเหลือ ${fB(d.total-d.paid)}`,"debts",`debt_${d.id}_${d.dueDate}`);
      }
    });
  },[session,data,stats]);

  if(session===undefined||loading||!data)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:t.bg,color:t.ts,fontFamily:"'Segoe UI','Noto Sans Thai',system-ui,sans-serif"}}>กำลังโหลด...</div>;

  const pl=NAV.find(n=>n.k===page)?.l||"Dashboard";

  // Pages that should hide the top header on mobile (full-bleed look)
  const mobileFullPages=["menu","chat","profile"];
  const hideMobileHeader=isMobile&&mobileFullPages.includes(page);
  // Custom mobile titles for new tab pages
  const mobileTitle=page==="menu"?"เมนู":page==="chat"?"แชทสนทนา":page==="profile"?"โปรไฟล์":pl;

  return(<div style={{display:"flex",minHeight:"100vh",background:t.bg,color:t.text,fontFamily:"'Segoe UI','Noto Sans Thai',system-ui,sans-serif",paddingTop:"env(safe-area-inset-top)",paddingBottom:"env(safe-area-inset-bottom)",paddingLeft:"env(safe-area-inset-left)",paddingRight:"env(safe-area-inset-right)",boxSizing:"border-box"}}>
    {!isMobile&&<Sidebar page={page} setPage={setPage} theme={theme} setTheme={setTheme} t={t} isMobile={isMobile} open={sbOpen} onClose={()=>setSbOpen(false)} onLogout={logout} userEmail={session?.user?.email}/>}
    <div style={{marginLeft:isMobile?0:220,flex:1,padding:isMobile?"14px 14px 90px":"20px 28px",minWidth:0}}>
      {/* Mobile minimal header for menu/chat/profile pages */}
      {hideMobileHeader&&(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:10}}>
        <h1 style={{margin:0,fontSize:20,fontWeight:700,letterSpacing:-0.3}}>{mobileTitle}</h1>
        <NotifBell session={session} t={t} onNavigate={link=>{if(link?.startsWith("challenge:")){setChallengeDetailId(link.slice(10));setPage("challenges")}else if(link)setPage(link)}}/>
      </div>)}
      {/* Standard header (desktop always; mobile when not on minimal-header pages) */}
      {!hideMobileHeader&&(<div style={{display:"flex",justifyContent:"space-between",alignItems:isMobile?"flex-start":"center",marginBottom:16,gap:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:isMobile?"1 1 100%":"0 1 auto"}}>
          <div style={{minWidth:0}}><h1 style={{margin:0,fontSize:isMobile?17:20,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pl}</h1><div style={{fontSize:10,color:t.tm,marginTop:1}}>WealthHub / {pl}</div></div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {!isMobile&&<span style={{fontSize:11,color:t.tm}}>{new Date().toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"})}</span>}
          <NotifBell session={session} t={t} onNavigate={link=>{if(link?.startsWith("challenge:")){setChallengeDetailId(link.slice(10));setPage("challenges")}else if(link)setPage(link)}}/>
          {!session&&<Btn primary t={t} onClick={()=>setShowAuth(true)}>🔐 ลงทะเบียน / เข้าสู่ระบบ</Btn>}
          {!["reports","dca","retire","plan","balance","cashflow","cfdetail","tax","about","challenges","calendar","envelopes","analytics","menu","chat","profile"].includes(page)&&<Btn primary t={t} onClick={()=>{if(page==="portfolio")setModal({type:"addAsset"});else if(page==="txn")setModal({type:"addTxn"});else if(page==="goals")setModal({type:"addGoal"});else if(page==="debts")setModal({type:"addDebt"});else if(page==="recurring")setModal({type:"addRecurring"});else setModal({type:"addTxn"})}}>+ เพิ่มรายการ</Btn>}
        </div>
      </div>)}

      {/* DASHBOARD */}
      {page==="dashboard"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><MC icon="$" label="มูลค่าสุทธิ" value={fB(stats.netWorth)} t={t} color={t.ac}/><MC icon="📈" label="กำไร/ขาดทุน" value={fB(stats.portfolioPL)} sub={fP(stats.portfolioPct)} t={t} color={stats.portfolioPL>=0?t.g:t.r}/><MC icon="💵" label="รายรับเดือนนี้" value={fB(stats.incomeThisMonth)} t={t} color={t.g}/><MC icon="💸" label="รายจ่ายเดือนนี้" value={fB(stats.expenseThisMonth)} t={t} color={t.r}/></div>
        {/* Portfolio on dashboard */}
        {data.assets.length>0&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:13,fontWeight:600}}>📊 พอร์ตลงทุน</span><button onClick={()=>setPage("portfolio")} style={{fontSize:11,color:t.ac,background:"none",border:"none",cursor:"pointer"}}>ดูทั้งหมด →</button></div>
          <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"minmax(0,1fr) minmax(0,auto)",gap:16}}>
            <div>{stats.allocation.slice(0,4).map(a=>{const tp2=AT.find(at=>at.v===a.type)||AT[7];const pp2=a.cost>0?(a.pl/a.cost)*100:0;return(<div key={a.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{tp2.i}</span><span style={{fontSize:12,fontWeight:500}}>{a.name}</span><Badge color={a.currency==="USD"?t.ac:t.tl}>{a.currency||"THB"}</Badge></div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,fontWeight:500}}>{fB(a.value)}</span><Badge color={a.pl>=0?t.g:t.r}>{fP(pp2)}</Badge></div></div><PB pct={a.pct} color={a.color} height={3} t={t}/></div>)})}</div>
            <div><ResponsiveContainer width={140} height={140}><PieChart><Pie data={stats.allocation} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2}>{stats.allocation.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
          </div>
        </div>)}
        {/* Currency + alerts */}
        <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"minmax(0,1fr) minmax(0,1fr)",gap:14}}>
          <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:12,fontWeight:600}}>💱 แปลงสกุลเงิน</span>
              <button onClick={()=>refreshPrices({fxOnly:true})} disabled={priceRefresh.loading} style={{fontSize:10,color:t.ac,background:"none",border:"none",cursor:"pointer",padding:0}}>{priceRefresh.loading?"⏳":"🔄 อัปเดต"}</button>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:11,color:t.tm}}>1 USD =</span><input value={rate} onChange={e=>setRate(+e.target.value)} type="number" step="0.1" style={{width:60,padding:"4px 6px",borderRadius:6,border:`1px solid ${t.ibr}`,fontSize:11,background:t.ib,color:t.text,textAlign:"center"}}/><span style={{fontSize:11,color:t.tm}}>บาท</span></div>
            {priceRefresh.msg&&<div style={{fontSize:10,color:t.g,marginTop:6}}>{priceRefresh.msg}</div>}
            {priceRefresh.err&&<div style={{fontSize:10,color:t.r,marginTop:6}}>{priceRefresh.err}</div>}
          </div>
          <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>🔔 แจ้งเตือน</div>
            {(()=>{const al=[];data.debts.forEach(d=>{if(d.total-d.paid>0&&d.rate>=10)al.push({c:t.r,t:`⚠️ ${d.name} ดอกเบี้ยสูง`})});if(!al.length)al.push({c:t.g,t:"✅ ปกติ"});return al.map((a,i)=>(<div key={i} style={{padding:"6px 10px",borderRadius:6,fontSize:11,marginBottom:2,background:`${a.c}12`,color:a.c}}>{a.t}</div>))})()}
          </div>
        </div>
        <NetWorthHistoryChart session={session} t={t}/>
        {stats.monthlyTrend.some(m=>m.income||m.expense)&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>รายรับ vs รายจ่าย (6 เดือน)</div><ResponsiveContainer width="100%" height={180}><BarChart data={stats.monthlyTrend} barGap={2}><CartesianGrid strokeDasharray="3 3" stroke={t.cb}/><XAxis dataKey="month" tick={{fontSize:10,fill:t.tm}}/><YAxis tick={{fontSize:10,fill:t.tm}} tickFormatter={v=>v>=1e3?`${(v/1e3).toFixed(0)}K`:v}/><Tooltip formatter={v=>fB(v)} contentStyle={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:8}}/><Bar dataKey="income" name="รายรับ" fill={t.g} radius={[4,4,0,0]}/><Bar dataKey="expense" name="รายจ่าย" fill={t.r} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>)}
        {data.goals.length>0&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:14}}><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🎯 เป้าหมาย</div>{data.goals.map(g=>{const p=g.target>0?(g.saved/g.target)*100:0;return(<div key={g.id} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{fontWeight:500}}>{g.icon} {g.name}</span><span style={{color:t.ts}}>{fB(g.saved)}/{fB(g.target)} ({Math.round(p)}%)</span></div><PB pct={p} color={p>=100?t.g:t.ac} height={5} t={t}/></div>)})}</div>)}
      </div>)}

      {page==="portfolio"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><MC icon="💰" label="มูลค่ารวม" value={fB(stats.totalPortfolio)} t={t}/><MC icon="📈" label="P&L" value={fB(stats.portfolioPL)} sub={fP(stats.portfolioPct)} t={t} color={stats.portfolioPL>=0?t.g:t.r}/><MC icon="🏷️" label="ต้นทุน" value={fB(stats.totalCost)} t={t}/></div>
        {data.assets.length>0&&(<div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <Btn t={t} onClick={refreshPrices} disabled={priceRefresh.loading}>{priceRefresh.loading?"⏳ กำลังดึงราคา...":"🔄 อัปเดตราคาจากตลาด"}</Btn>
          <span style={{fontSize:10,color:t.tm}}>ข้อมูลจาก Yahoo Finance (ดีเลย์ ~15 นาที) · รองรับ: หุ้นไทย (.BK), หุ้น US, Crypto, ทอง</span>
          {priceRefresh.msg&&<span style={{fontSize:11,color:t.g,padding:"4px 10px",background:`${t.g}15`,borderRadius:6}}>✅ {priceRefresh.msg}</span>}
          {priceRefresh.err&&<span style={{fontSize:11,color:t.r,padding:"4px 10px",background:`${t.r}15`,borderRadius:6}}>⚠️ {priceRefresh.err}</span>}
        </div>)}
        {data.assets.length===0?<Empty icon="📊" title="ยังไม่มีสินทรัพย์" sub="เพิ่มหุ้น กองทุน คริปโต" action="+ เพิ่ม" onAction={()=>setModal({type:"addAsset"})} t={t}/>:(
          <div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:640}}><thead><tr style={{borderBottom:`1px solid ${t.cb}`}}>{["สินทรัพย์","สกุล","จำนวน","ต้นทุน","ราคา","มูลค่า(฿)","P&L","%",""].map((h,i)=>(<th key={i} style={{padding:"10px",textAlign:"left",fontSize:10,color:t.tm,fontWeight:500,background:t.thBg}}>{h}</th>))}</tr></thead><tbody>{stats.allocation.map(a=>{const tp2=AT.find(at=>at.v===a.type)||AT[7];const cur=a.currency||"THB";const sym=cur==="USD"?"$":"฿";return(<tr key={a.id} style={{borderBottom:`1px solid ${t.cb}`}}><td style={{padding:10,fontWeight:500}}>{tp2.i} {a.name}</td><td style={{padding:10}}><Badge color={cur==="USD"?t.ac:t.tl}>{cur}</Badge></td><td style={{padding:10}}>{a.units}</td><td style={{padding:10}}>{sym}{a.avgCost}</td><td style={{padding:10}}>{sym}{a.currentPrice}</td><td style={{padding:10,fontWeight:500}}>{fB(a.value)}</td><td style={{padding:10}}><Badge color={a.pl>=0?t.g:t.r}>{a.pl>=0?"▲":"▼"}{fB(a.pl)}</Badge></td><td style={{padding:10}}>{Math.round(a.pct)}%</td><td style={{padding:10}}><div style={{display:"flex",gap:3}}><button onClick={()=>setModal({type:"editAsset",asset:a})} style={{fontSize:10,padding:"2px 6px",border:`1px solid ${t.cb}`,borderRadius:3,background:"transparent",cursor:"pointer",color:t.ts}}>แก้ไข</button><button onClick={()=>{if(window.confirm(`ลบ ${a.name}?`))delAsset(a.id)}} style={{fontSize:10,padding:"2px 6px",border:`1px solid ${t.r}40`,borderRadius:3,background:"transparent",cursor:"pointer",color:t.r}}>ลบ</button></div></td></tr>)})}</tbody></table></div>)}
      </div>)}

      {page==="txn"&&<TxnPage data={data} stats={stats} onAdd={()=>setModal({type:"addTxn"})} onEdit={tx=>setModal({type:"editTxn",txn:tx})} onDel={delTxn} t={t}/>}
      {page==="recurring"&&<RecurringPage data={data} onAdd={()=>setModal({type:"addRecurring"})} onEdit={r=>setModal({type:"editRecurring",recurring:r})} onDel={delRecurring} onToggle={toggleRecurring} onRunNow={runRecurringNow} t={t}/>}
      {page==="calendar"&&<CalendarPage data={data} t={t} onAddTxn={dt=>setModal({type:"addTxn",date:dt})} setPage={setPage}/>}
      {page==="envelopes"&&<EnvelopesPage data={data} persist={persist} t={t}/>}
      {page==="analytics"&&<AnalyticsPage data={data} stats={stats} t={t}/>}
      {page==="balance"&&<><BalancePage data={data} stats={stats} persist={persist} t={t}/><div style={{marginTop:14}}><NetWorthHistoryChart session={session} t={t}/></div></>}
      {page==="cashflow"&&<CashFlowPage data={data} stats={stats} t={t}/>}
      {page==="cfdetail"&&<CashFlowDetailPage data={data} persist={persist} t={t}/>}

      {page==="goals"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><MC icon="🎯" label="เป้าหมายรวม" value={fB(stats.totalGoalTarget)} t={t}/><MC icon="💰" label="ออมแล้ว" value={fB(stats.totalGoalSaved)} t={t} color={t.g}/><MC icon="📊" label="เหลือ" value={fB(stats.totalGoalTarget-stats.totalGoalSaved)} t={t} color={t.am}/></div>
        {data.goals.length===0?<Empty icon="🎯" title="ยังไม่มีเป้าหมาย" sub="ตั้งเป้าออม" action="+ ตั้งเป้า" onAction={()=>setModal({type:"addGoal"})} t={t}/>:(<div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"1fr 1fr",gap:12}}>{data.goals.map(g=>{const p=g.target>0?(g.saved/g.target)*100:0;return(<div key={g.id} style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:14,fontWeight:600}}>{g.icon} {g.name}</span><Badge color={p>=100?t.g:t.ac}>{p>=100?"สำเร็จ!":`${Math.round(p)}%`}</Badge></div><PB pct={p} color={p>=100?t.g:t.ac} height={8} t={t}/><div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:t.ts}}><span>{fB(g.saved)}</span><span>{fB(g.target)}</span></div><div style={{display:"flex",gap:3,marginTop:8}}><Btn small t={t} onClick={()=>setModal({type:"editGoal",goal:g})}>แก้ไข</Btn><Btn small t={t} onClick={()=>{const a=window.prompt("เพิ่มเงินออม?");if(a&&+a>0)updateGoal(g.id,{...g,saved:g.saved+ +a})}}>+เพิ่ม</Btn><Btn small danger t={t} onClick={()=>{if(window.confirm("ลบ?"))delGoal(g.id)}}>ลบ</Btn></div></div>)})}</div>)}
      </div>)}

      {page==="debts"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><MC icon="🏦" label="หนี้ทั้งหมด" value={fB(stats.totalDebt)} t={t}/><MC icon="✅" label="จ่ายแล้ว" value={fB(stats.totalDebtPaid)} t={t} color={t.g}/><MC icon="⚠️" label="คงเหลือ" value={fB(stats.debtRemaining)} t={t} color={t.r}/></div>
        {data.debts.length===0?<Empty icon="🏦" title="ไม่มีหนี้" sub="บันทึกหนี้สิน" action="+ เพิ่ม" onAction={()=>setModal({type:"addDebt"})} t={t}/>:(data.debts.map(d=>{const p=d.total>0?(d.paid/d.total)*100:0;const r=d.total-d.paid;const mi=r*(d.rate/100/12);return(<div key={d.id} style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:16,borderLeft:`4px solid ${t.am}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:14,fontWeight:600}}>{d.icon} {d.name}</span><span style={{fontSize:11,color:t.ts}}>{d.rate}%/ปี</span></div><PB pct={p} color={p>=100?t.g:t.am} height={8} t={t}/><div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:t.ts}}><span>จ่าย {fB(d.paid)} ({Math.round(p)}%)</span><span>เหลือ {fB(r)}</span></div>{mi>0&&<div style={{fontSize:10,color:t.r,marginTop:3}}>ดอกเบี้ย/เดือน ~{fB(Math.round(mi))}</div>}<div style={{display:"flex",gap:3,marginTop:8}}><Btn small t={t} onClick={()=>setModal({type:"editDebt",debt:d})}>แก้ไข</Btn><Btn small t={t} onClick={()=>{const pay=window.prompt("จ่าย?");if(pay&&+pay>0)updateDebt(d.id,{...d,paid:Math.min(d.total,d.paid+ +pay)})}}>+จ่าย</Btn><Btn small danger t={t} onClick={()=>{if(window.confirm("ลบ?"))delDebt(d.id)}}>ลบ</Btn></div></div>)}))}
      </div>)}

      {page==="dca"&&<DCAPage t={t}/>}
      {page==="retire"&&<RetirePage t={t}/>}
      {page==="plan"&&<PlanPage data={data} stats={stats} t={t}/>}
      {page==="tax"&&<TaxPage t={t}/>}

      {page==="reports"&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:22}}>
        <div style={{fontSize:15,fontWeight:600,marginBottom:14}}>📄 รายงานสรุป</div>
        <div style={{display:"grid",gridTemplateColumns:t.m?"1fr":"1fr 1fr 1fr",gap:10,marginBottom:16}}><div style={{padding:12,borderRadius:8,background:`${t.ac}10`}}><div style={{fontSize:10,color:t.ts}}>Net Worth</div><div style={{fontSize:18,fontWeight:600,color:t.ac}}>{fB(stats.netWorth)}</div></div><div style={{padding:12,borderRadius:8,background:`${t.g}10`}}><div style={{fontSize:10,color:t.ts}}>รายรับ</div><div style={{fontSize:18,fontWeight:600,color:t.g}}>{fB(stats.incomeThisMonth)}</div></div><div style={{padding:12,borderRadius:8,background:`${t.r}10`}}><div style={{fontSize:10,color:t.ts}}>รายจ่าย</div><div style={{fontSize:18,fontWeight:600,color:t.r}}>{fB(stats.expenseThisMonth)}</div></div></div>
        <Btn primary t={t} onClick={()=>{const w=window.open("","_blank");w.document.write(`<html><head><title>WealthHub</title><style>body{font-family:Segoe UI,sans-serif;padding:40px;color:#1e293b}h1{color:#0ea5e9}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:13px}th{background:#f8fafc}</style></head><body><h1>WealthHub — รายงาน</h1><p>${new Date().toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"})}</p><table><tr><td>Net Worth</td><td>${fB(stats.netWorth)}</td></tr><tr><td>พอร์ต</td><td>${fB(stats.totalPortfolio)}</td></tr><tr><td>P&L</td><td>${fB(stats.portfolioPL)}</td></tr><tr><td>รายรับ</td><td>${fB(stats.incomeThisMonth)}</td></tr><tr><td>รายจ่าย</td><td>${fB(stats.expenseThisMonth)}</td></tr><tr><td>หนี้</td><td>${fB(stats.debtRemaining)}</td></tr></table>`);if(data.assets.length){w.document.write(`<h2>พอร์ต</h2><table><tr><th>ชื่อ</th><th>สกุล</th><th>มูลค่า</th><th>P&L</th></tr>`);stats.allocation.forEach(a=>{w.document.write(`<tr><td>${a.name}</td><td>${a.currency||"THB"}</td><td>${fB(a.value)}</td><td>${fB(a.pl)}</td></tr>`)});w.document.write(`</table>`)}w.document.write(`<p style="color:#94a3b8;font-size:11px;margin-top:30px">WealthHub</p></body></html>`);w.document.close();w.print()}}>🖨️ พิมพ์ / PDF</Btn>
      </div>)}

      {page==="challenges"&&(session?<ChallengesPage t={t} session={session} rate={rate} toThb={toThb} detailId={challengeDetailId} setDetailId={setChallengeDetailId}/>:<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:28,textAlign:"center"}}><div style={{fontSize:42,marginBottom:10}}>🏆</div><div style={{fontSize:15,fontWeight:600,marginBottom:6}}>ชาเลนจ์การลงทุน</div><div style={{fontSize:12,color:t.ts,marginBottom:14,lineHeight:1.7}}>เข้าร่วมชาเลนจ์ลงทุนกับเพื่อน เปรียบเทียบพอร์ตหุ้น + เงินสด<br/>ดูกระดานคะแนนแบบเรียลไทม์</div><div style={{fontSize:11,color:t.tm,marginBottom:14}}>กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้</div><Btn primary t={t} onClick={()=>setShowAuth(true)}>🔐 เข้าสู่ระบบ</Btn></div>)}
      {page==="menu"&&<MobileMenuPage page={page} setPage={setPage} t={t}/>}
      {page==="chat"&&<ChatPage session={session} t={t}/>}
      {page==="profile"&&<ProfilePage session={session} t={t} theme={theme} setTheme={setTheme} onLogout={logout}/>}

      {page==="about"&&(<div style={{background:t.card,border:`1px solid ${t.cb}`,borderRadius:12,padding:28,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>♥</div>
        <div style={{fontSize:18,fontWeight:600,marginBottom:8,color:t.tp}}>เกี่ยวกับเรา</div>
        <div style={{fontSize:14,color:t.ts,marginBottom:20,lineHeight:1.7}}>สวัสดีครับ ผมพจน์ นักพัฒนาเว็บไซต์<br/>ผู้ช่วยน้องชาย Claude Code</div>
        <div style={{background:`${t.ac}10`,border:`1px solid ${t.ac}40`,borderRadius:10,padding:18,margin:"0 auto",maxWidth:420}}>
          <div style={{fontSize:12,color:t.tm,marginBottom:6}}>สนับสนุนเราได้ที่</div>
          <div style={{fontSize:22,fontWeight:700,color:t.ac,letterSpacing:1,marginBottom:4}}>661-8-47774-3</div>
          <div style={{fontSize:13,color:t.ts,marginBottom:10}}>ธนาคารกรุงไทย</div>
          <div style={{fontSize:11,color:t.tm,fontStyle:"italic"}}>(ไม่ต้องโอนเด้อ หรือจะโอนก็แล้วแต่)</div>
        </div>
      </div>)}

      {!hideMobileHeader&&<div style={{marginTop:28,paddingTop:14,borderTop:`1px solid ${t.cb}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <Btn small t={t} onClick={exportData}>💾 Export JSON</Btn>
          <label style={{display:"inline-block"}}><span style={{padding:"5px 12px",fontSize:11,fontWeight:500,cursor:"pointer",borderRadius:8,border:`1px solid ${t.cb}`,color:t.ts,display:"inline-block"}}>📂 Import JSON</span><input type="file" accept="application/json" onChange={importData} style={{display:"none"}}/></label>
          <span style={{fontSize:10,color:t.tm}}>สำรอง/กู้คืนข้อมูลทั้งหมด</span>
        </div>
        <button onClick={()=>{if(window.confirm("ล้างทั้งหมด?"))persist(DF)}} style={{fontSize:9,color:t.tm,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>🗑 ล้างข้อมูล</button>
      </div>}
    </div>

    <Modal open={modal?.type==="addAsset"||modal?.type==="editAsset"} onClose={()=>setModal(null)} title={modal?.type==="editAsset"?"แก้ไข":"เพิ่มสินทรัพย์"} t={t}><AssetForm initial={modal?.asset} onSave={f=>modal?.type==="editAsset"?updateAsset(modal.asset.id,f):addAsset(f)} onCancel={()=>setModal(null)} t={t} rate={rate}/></Modal>
    <Modal open={modal?.type==="addTxn"} onClose={()=>setModal(null)} title="บันทึกรายรับ/รายจ่าย" t={t}><TxnForm onSave={addTxn} onCancel={()=>setModal(null)} t={t} initialDate={modal?.date} data={data}/></Modal>
    <Modal open={modal?.type==="editTxn"} onClose={()=>setModal(null)} title="✏️ แก้ไขรายการ" t={t}>{modal?.txn&&<TxnForm onSave={f=>updateTxn(modal.txn.id,f)} onCancel={()=>setModal(null)} t={t} initial={modal.txn} data={data}/>}</Modal>
    <Modal open={modal?.type==="addGoal"||modal?.type==="editGoal"} onClose={()=>setModal(null)} title={modal?.type==="editGoal"?"แก้ไข":"ตั้งเป้าหมาย"} t={t}><GoalForm initial={modal?.goal} onSave={f=>modal?.type==="editGoal"?updateGoal(modal.goal.id,f):addGoal(f)} onCancel={()=>setModal(null)} t={t}/></Modal>
    <Modal open={modal?.type==="addDebt"||modal?.type==="editDebt"} onClose={()=>setModal(null)} title={modal?.type==="editDebt"?"แก้ไข":"เพิ่มหนี้"} t={t}><DebtForm initial={modal?.debt} onSave={f=>modal?.type==="editDebt"?updateDebt(modal.debt.id,f):addDebt(f)} onCancel={()=>setModal(null)} t={t}/></Modal>
    <Modal open={modal?.type==="addRecurring"||modal?.type==="editRecurring"} onClose={()=>setModal(null)} title={modal?.type==="editRecurring"?"แก้ไขรายการประจำ":"เพิ่มรายการประจำ"} t={t}><RecurringForm initial={modal?.recurring} onSave={f=>modal?.type==="editRecurring"?updateRecurring(modal.recurring.id,f):addRecurring(f)} onCancel={()=>setModal(null)} t={t}/></Modal>
    {showAuth&&!session&&(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflow:"auto"}} onClick={()=>setShowAuth(false)}><div onClick={e=>e.stopPropagation()} style={{position:"relative"}}><button onClick={()=>setShowAuth(false)} style={{position:"absolute",top:8,right:8,zIndex:2,background:"rgba(0,0,0,0.1)",border:"none",width:28,height:28,borderRadius:"50%",fontSize:14,cursor:"pointer",color:t.tm}}>✕</button><AuthPage theme={theme} setTheme={setTheme} t={t}/></div></div>)}
    <BottomTabBar page={page} setPage={setPage} t={t} disabled={!isMobile||!!modal||showAuth||recovery}/>
    <QuickAddFAB data={data} t={t} onQuickAdd={quickAddTxn} onOpenFull={()=>setModal({type:"addTxn"})} disabled={!isMobile||!!modal||showAuth||recovery||["menu","chat","profile"].includes(page)}/>
    <Toast toast={toast} onClose={()=>setToast(null)} t={t}/>
    <Modal open={recovery} onClose={()=>setRecovery(false)} title="🔑 ตั้งรหัสผ่านใหม่" t={t}>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{fontSize:11,color:t.tm}}>กำหนดรหัสผ่านใหม่สำหรับบัญชี <b>{session?.user?.email}</b></div>
        <div style={{position:"relative"}}>
          <Inp label="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)" t={t} type={showNewPw?"text":"password"} value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="••••••" style={{paddingRight:36}}/>
          <button type="button" onClick={()=>setShowNewPw(s=>!s)} style={{position:"absolute",right:6,bottom:4,background:"none",border:"none",cursor:"pointer",fontSize:14,color:t.tm,padding:"4px 6px",lineHeight:1}}>{showNewPw?"🙈":"👁️"}</button>
        </div>
        <Inp label="ยืนยันรหัสผ่าน" t={t} type={showNewPw?"text":"password"} value={newPw2} onChange={e=>setNewPw2(e.target.value)} placeholder="••••••"/>
        {recErr&&<div style={{fontSize:11,color:t.r,padding:"8px 10px",background:`${t.r}12`,borderRadius:6}}>{recErr}</div>}
        <Btn primary t={t} onClick={updatePassword} disabled={recLoading||!newPw||!newPw2} style={{width:"100%",marginTop:4}}>{recLoading?"กำลังบันทึก...":"บันทึกรหัสผ่านใหม่"}</Btn>
      </div>
    </Modal>
  </div>);
}

export default WealthHub;