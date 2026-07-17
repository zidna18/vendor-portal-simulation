import { useState, useRef } from "react";
import { C } from "../../theme";
import { g4 } from "../../lib/responsive";
import { fmtDate } from "../../lib/format";
import { SapIcon } from "./SapIcon";
import { Btn } from "./forms";

export const FilterBar = ({opts,val,onChange}) => (
  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
    {opts.map(f=>(
      <button key={f} onClick={()=>onChange(f)} style={{padding:"5px 14px",borderRadius:16,cursor:"pointer",fontSize:12,border:`1px solid ${val===f?C.primary:C.border}`,background:val===f?C.selection:C.card,color:val===f?C.primary:C.t2,fontWeight:val===f?700:400,fontFamily:"inherit",transition:"background .12s"}}>
        {f}
      </button>
    ))}
  </div>
);
// SAP Fiori-style compact filter bar
export const FioriBar = ({activeTokens=[],onGo,onReset,onAdaptFilters,adaptFiltersCount,children}:{activeTokens?:any[],onGo?:()=>void,onReset?:()=>void,onAdaptFilters?:()=>void,adaptFiltersCount?:number,children?:any}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
    <div style={{padding:"12px 16px 10px",display:"grid",gridTemplateColumns:g4(),gap:"10px 16px"}}>
      {children}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 16px 10px",flexWrap:"wrap" as const,gap:6}}>
      <div style={{display:"flex",flexWrap:"wrap" as const,gap:4,alignItems:"center",flex:1,minWidth:0}}>
        {activeTokens.length>0&&<span style={{fontSize:11,color:C.t2,fontWeight:600,marginRight:4,letterSpacing:0.3,flexShrink:0}}>Active:</span>}
        {activeTokens.map((t,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",height:"1.625rem",background:C.selection,border:`1px solid #8bb1d1`,borderRadius:"0.25rem",padding:"0 0 0 0.5rem",fontSize:12,color:C.t1,fontFamily:"'72','72full',Arial,Helvetica,sans-serif",maxWidth:260}}>
            <span style={{fontWeight:600,color:C.t2,marginRight:3,flexShrink:0}}>{t.label}:</span>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{t.val}</span>
            <button onClick={t.onClear} title={`Remove ${t.label} filter`}
              style={{background:"none",border:"none",cursor:"pointer",color:"#6a6d70",fontSize:16,padding:"0 0.375rem",lineHeight:1,display:"flex",alignItems:"center",flexShrink:0,height:"100%"}}>{"×"}</button>
          </span>
        ))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
        {onAdaptFilters&&<button onClick={onAdaptFilters} style={{background:"transparent",color:C.primary,border:`1px solid ${C.border}`,borderRadius:4,padding:"0 12px",height:"1.5rem",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Adapt Filters{adaptFiltersCount!=null?` (${adaptFiltersCount})`:""}</button>}
        <Btn v="neutral" sm onClick={onReset}>Reset</Btn>
        <Btn v="primary" sm onClick={onGo}>Go</Btn>
      </div>
    </div>
  </div>
);
// Compact filter field label wrapper (Fiori style)
export const FField = ({label,children,style={}}) => (
  <div style={style}>
    <div style={{fontSize:11,color:C.t2,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:0.6}}>{label}</div>
    {children}
  </div>
);
export const DateRangePicker = ({from,to,onChange}) => {
  const [open,setOpen]=useState(false);
  const [mode,setMode]=useState<string|null>(null);
  const [tf,setTf]=useState(from||"");
  const [tt,setTt]=useState(to||"");
  const [xVal,setXVal]=useState("7");
  const [yVal,setYVal]=useState("0");
  const [xUnit,setXUnit]=useState("Days");
  const [monSel,setMonSel]=useState<{y:number,m:number}>(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const ref=useRef<HTMLDivElement>(null);
  const today=new Date().toISOString().split("T")[0];
  useEffect(()=>{setTf(from||"");},[from]);
  useEffect(()=>{setTt(to||"");},[to]);
  useEffect(()=>{
    if(!open)return;
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node)){setOpen(false);setMode(null);}};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[open]);
  const apply=(f:string,t:string)=>{onChange(f,t);setOpen(false);setMode(null);};
  const clr=()=>{onChange("","");setTf("");setTt("");setMode(null);};
  const iso=(d:Date)=>d.toISOString().split("T")[0];
  const addDays=(d:Date,n:number)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r;};
  const addMonths=(d:Date,n:number)=>{const r=new Date(d);r.setMonth(r.getMonth()+n);return r;};
  const weekRange=(off:number)=>{const d=new Date();const dow=d.getDay();const mon=addDays(d,-(dow===0?6:dow-1)+off*7);return[iso(mon),iso(addDays(mon,6))];};
  const monthRange=(off:number)=>{const d=new Date();const f=new Date(d.getFullYear(),d.getMonth()+off,1);const l=new Date(d.getFullYear(),d.getMonth()+off+1,0);return[iso(f),iso(l)];};
  const qRange=(qOff:number,fixQ?:number)=>{const d=new Date();let y=d.getFullYear();let q=fixQ!==undefined?fixQ:Math.floor(d.getMonth()/3)+qOff;y+=Math.floor(q/4);q=((q%4)+4)%4;const f=new Date(y,q*3,1);const l=new Date(y,q*3+3,0);return[iso(f),iso(l)];};
  const yearRange=(off:number)=>{const y=new Date().getFullYear()+off;return[`${y}-01-01`,`${y}-12-31`];};
  const offsetDate=(d:Date,n:number,unit:string)=>{const r=new Date(d);if(unit==="Days")r.setDate(r.getDate()+n);else if(unit==="Weeks")r.setDate(r.getDate()+n*7);else if(unit==="Months")r.setMonth(r.getMonth()+n);else if(unit==="Quarters")r.setMonth(r.getMonth()+n*3);else if(unit==="Years")r.setFullYear(r.getFullYear()+n);else if(unit==="Hours")r.setHours(r.getHours()+n);else if(unit==="Minutes")r.setMinutes(r.getMinutes()+n);return r;};
  const UNITS=["Minutes","Hours","Days","Weeks","Months","Quarters","Years"];
  const MNAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const handleOpt=(k:string)=>{
    const d=new Date();
    if(k==="today"){apply(today,today);return;}
    if(k==="yesterday"){const y=iso(addDays(d,-1));apply(y,y);return;}
    if(k==="tomorrow"){const t=iso(addDays(d,1));apply(t,t);return;}
    if(k==="year-to-date"){apply(`${d.getFullYear()}-01-01`,today);return;}
    if(k==="date-to-year"){apply(today,`${d.getFullYear()}-12-31`);return;}
    if(k==="this-week"){const[f,t]=weekRange(0);apply(f,t);return;}
    if(k==="last-week"){const[f,t]=weekRange(-1);apply(f,t);return;}
    if(k==="next-week"){const[f,t]=weekRange(1);apply(f,t);return;}
    if(k==="this-month"){const[f,t]=monthRange(0);apply(f,t);return;}
    if(k==="last-month"){const[f,t]=monthRange(-1);apply(f,t);return;}
    if(k==="next-month"){const[f,t]=monthRange(1);apply(f,t);return;}
    if(k==="this-quarter"){const[f,t]=qRange(0);apply(f,t);return;}
    if(k==="last-quarter"){const[f,t]=qRange(-1);apply(f,t);return;}
    if(k==="next-quarter"){const[f,t]=qRange(1);apply(f,t);return;}
    if(k==="q1"){const[f,t]=qRange(0,0);apply(f,t);return;}
    if(k==="q2"){const[f,t]=qRange(0,1);apply(f,t);return;}
    if(k==="q3"){const[f,t]=qRange(0,2);apply(f,t);return;}
    if(k==="q4"){const[f,t]=qRange(0,3);apply(f,t);return;}
    if(k==="this-year"){const[f,t]=yearRange(0);apply(f,t);return;}
    if(k==="last-year"){const[f,t]=yearRange(-1);apply(f,t);return;}
    if(k==="next-year"){const[f,t]=yearRange(1);apply(f,t);return;}
    setMode(m=>m===k?null:k);
    if(k!==mode){setTf(from||"");setTt(to||"");}
  };
  const applyLastX=()=>{const n=parseInt(xVal)||1;const s=iso(offsetDate(new Date(),-n,xUnit));apply(s,today);};
  const applyNextX=()=>{const n=parseInt(xVal)||1;const e=iso(offsetDate(new Date(),n,xUnit));apply(today,e);};
  const applyTodayXY=()=>{const x=parseInt(xVal)||0;const y=parseInt(yVal)||0;const f=iso(addDays(new Date(),-x));const t=iso(addDays(new Date(),y));apply(f,t);};
  const disp=from&&to?`${fmtDate(from)} – ${fmtDate(to)}`:from?`From: ${fmtDate(from)}`:to?`To: ${fmtDate(to)}`:"";
  const rowSt=(active:boolean):any=>({padding:"7px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontSize:13,color:C.t1,background:active?C.infoBg:"transparent"});
  const secHdr=(title:string)=>(
    <div style={{padding:"6px 14px 3px",fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.6,marginTop:2}}>{title}</div>
  );
  const row=(k:string,label:string,ico?:boolean)=>(
    <div key={k}>
      <div onClick={()=>handleOpt(k)} style={rowSt(mode===k)}
        onMouseEnter={e=>(e.currentTarget.style.background=C.infoBg)}
        onMouseLeave={e=>(e.currentTarget.style.background=mode===k?C.infoBg:"transparent")}>
        <span>{label}</span>
        {ico&&<SapIcon name="appointment-2" size={13} color={C.t2}/>}
      </div>
      {mode===k&&subInp(k)}
    </div>
  );
  const subInpSt:any={padding:"4px 14px 10px",display:"flex",flexDirection:"column",gap:6};
  const numInpSt:any={width:64,padding:"4px 8px",fontSize:13,fontFamily:"inherit",color:C.t1,border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,outline:"none"};
  const unitSelSt:any={flex:1,padding:"4px 8px",fontSize:13,fontFamily:"inherit",color:C.t1,border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,outline:"none",cursor:"pointer"};
  const subInp=(k:string)=>{
    if(k==="date"||k==="date-time")return(
      <div style={subInpSt}><DateInp value={tf} onChange={v=>{setTf(v);if(v)apply(v,v);}}/></div>
    );
    if(k==="from-to"||k==="from-to-dt")return(
      <div style={subInpSt}>
        <DateInp value={tf} onChange={v=>setTf(v)}/>
        <DateInp value={tt} onChange={v=>setTt(v)}/>
        <div style={{display:"flex",gap:6}}><Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn><Btn v="primary" sm onClick={()=>apply(tf,tt)}>Apply</Btn></div>
      </div>
    );
    if(k==="from")return(<div style={subInpSt}><DateInp value={tf} onChange={v=>{setTf(v);if(v)apply(v,to||"");}}/></div>);
    if(k==="to")return(<div style={subInpSt}><DateInp value={tt} onChange={v=>{setTt(v);if(v)apply(from||"",v);}}/></div>);
    if(k==="last-x")return(
      <div style={subInpSt}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input style={numInpSt} type="number" min={1} value={xVal} onChange={e=>setXVal(e.target.value)}/>
          <select style={unitSelSt} value={xUnit} onChange={e=>setXUnit(e.target.value)}>{UNITS.map(u=><option key={u} value={u}>{u}</option>)}</select>
        </div>
        <div style={{display:"flex",gap:6}}><Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn><Btn v="primary" sm onClick={applyLastX}>Apply</Btn></div>
      </div>
    );
    if(k==="next-x")return(
      <div style={subInpSt}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input style={numInpSt} type="number" min={1} value={xVal} onChange={e=>setXVal(e.target.value)}/>
          <select style={unitSelSt} value={xUnit} onChange={e=>setXUnit(e.target.value)}>{UNITS.map(u=><option key={u} value={u}>{u}</option>)}</select>
        </div>
        <div style={{display:"flex",gap:6}}><Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn><Btn v="primary" sm onClick={applyNextX}>Apply</Btn></div>
      </div>
    );
    if(k==="today-xy")return(
      <div style={subInpSt}>
        <div style={{display:"flex",gap:6,alignItems:"center",fontSize:12,color:C.t2}}>
          <span style={{whiteSpace:"nowrap" as const}}>-X days:</span>
          <input style={numInpSt} type="number" min={0} value={xVal} onChange={e=>setXVal(e.target.value)}/>
          <span style={{whiteSpace:"nowrap" as const}}>+Y days:</span>
          <input style={numInpSt} type="number" min={0} value={yVal} onChange={e=>setYVal(e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:6}}><Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn><Btn v="primary" sm onClick={applyTodayXY}>Apply</Btn></div>
      </div>
    );
    if(k==="month")return(
      <div style={subInpSt}>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <button onClick={()=>setMonSel(p=>p.m===0?{y:p.y-1,m:11}:{y:p.y,m:p.m-1})} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:3,width:24,height:24,cursor:"pointer",color:C.t1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>{"‹"}</button>
          <span style={{flex:1,textAlign:"center" as const,fontSize:12,fontWeight:700,color:C.t1}}>{MNAMES[monSel.m]} {monSel.y}</span>
          <button onClick={()=>setMonSel(p=>p.m===11?{y:p.y+1,m:0}:{y:p.y,m:p.m+1})} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:3,width:24,height:24,cursor:"pointer",color:C.t1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>{"›"}</button>
        </div>
        <Btn v="primary" sm onClick={()=>{const f=`${monSel.y}-${String(monSel.m+1).padStart(2,"0")}-01`;const l=new Date(monSel.y,monSel.m+1,0);apply(f,iso(l));}}>Select Month</Btn>
      </div>
    );
    return null;
  };
  return(
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",minHeight:36,padding:"0 10px",gap:8,boxSizing:"border-box" as const}}>
        <span style={{flex:1,fontSize:14,color:disp?C.t1:C.t2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{disp||"Select date range…"}</span>
        {(from||to)&&<button onClick={e=>{e.stopPropagation();clr();}} style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:18,padding:"0",lineHeight:1,flexShrink:0}}>{"×"}</button>}
        <SapIcon name="calendar" size={14} color={C.t2} style={{flexShrink:0}}/>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 2px)",left:0,zIndex:600,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 20px rgba(0,0,0,0.18)",minWidth:260,maxHeight:480,overflowY:"auto" as const}}>
          {secHdr("Single Dates")}
          {row("date","Date",true)}
          {row("today","Today")}
          {row("yesterday","Yesterday")}
          {row("tomorrow","Tomorrow")}
          {row("date-time","Date and Time",true)}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Date Ranges")}
          {row("from-to","From / To",true)}
          {row("from-to-dt","From / To (Date and Time)",true)}
          {row("from","From",true)}
          {row("to","To",true)}
          {row("year-to-date","Year to Date")}
          {row("date-to-year","Date to Year")}
          {row("last-x","Last X Minutes / Hours / Days…")}
          {row("next-x","Next X Minutes / Hours / Days…")}
          {row("today-xy","Today -X / +Y Days")}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Weeks")}
          {row("this-week","This Week")}
          {row("last-week","Last Week")}
          {row("next-week","Next Week")}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Months")}
          {row("month","Month",true)}
          {row("this-month","This Month")}
          {row("last-month","Last Month")}
          {row("next-month","Next Month")}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Quarters")}
          {row("this-quarter","This Quarter")}
          {row("last-quarter","Last Quarter")}
          {row("next-quarter","Next Quarter")}
          {row("q1","First Quarter")}
          {row("q2","Second Quarter")}
          {row("q3","Third Quarter")}
          {row("q4","Fourth Quarter")}
          <div style={{height:1,background:C.border,margin:"4px 0"}}/>
          {secHdr("Years")}
          {row("this-year","This Year")}
          {row("last-year","Last Year")}
          {row("next-year","Next Year")}
          <div style={{height:8}}/>
        </div>
      )}
    </div>
  );
};

// eslint-disable-next-line
declare global { namespace JSX { interface IntrinsicElements { 'ui5-icon': any; 'ui5-multi-combobox': any; 'ui5-mcb-item': any; 'ui5-date-picker': any } } }
