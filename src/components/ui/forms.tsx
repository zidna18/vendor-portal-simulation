import { useState, useEffect, useRef } from "react";
import { C } from "../../theme";
import { SETTINGS } from "../../lib/format";
import { SapIcon } from "./SapIcon";

export const Card = ({children,style={}}) => (
  <div style={{background:C.card,borderRadius:6,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",padding:20,marginBottom:14,...style}}>{children}</div>
);

export const Btn = ({children,onClick,v="primary",sm,disabled,style={}}) => {
  const VS:any = {
    primary:{background:C.primary,  color:"#fff",    border:`1px solid ${C.primary}`,   hov:C.primaryDk},
    ghost:  {background:"transparent",color:C.primary,border:"1px solid transparent",   hov:C.selection},
    danger: {background:C.err,      color:"#fff",    border:`1px solid ${C.err}`,        hov:"#9e0000"},
    success:{background:C.ok,       color:"#fff",    border:`1px solid ${C.ok}`,         hov:"#0d6b34"},
    neutral:{background:C.card,     color:C.t1,      border:`1px solid #89919a`,          hov:C.subtle},
  };
  const [hov,setHov]=useState(false);
  const s=VS[v]||VS.primary;
  return <button
    onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    onClick={onClick} disabled={disabled}
    style={{
      background:hov&&!disabled?s.hov:s.background,
      color:s.color, border:s.border,
      borderRadius:"0.25rem",
      cursor:disabled?"not-allowed":"pointer",
      fontFamily:"'72','72full',Arial,Helvetica,sans-serif",
      fontWeight:600, fontSize:sm?12:14,
      height:sm?"1.5rem":"2.25rem",
      padding:sm?"0 0.75rem":"0 1rem",
      opacity:disabled?.4:1,
      transition:"background .1s,opacity .1s",
      lineHeight:1, display:"inline-flex", alignItems:"center", gap:4, whiteSpace:"nowrap" as const,
      ...style
    }}>{children}</button>;
};

export const Inp = ({value,onChange,placeholder="",type="text",style={}}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:"100%",padding:"7px 10px",borderRadius:2,border:`1px solid ${C.fieldBorder}`,fontSize:14,fontFamily:"inherit",color:C.t1,background:C.field,outline:"none",boxSizing:"border-box",...style}}/>
);
// Positive-only amount input – no spinner buttons, rejects negative/non-numeric input
export const AmtInp = ({value,onChange,placeholder="0",style={}}) => (
  <input type="text" inputMode="decimal" value={value} onChange={e=>{const v=e.target.value;if(v===""||/^\d*\.?\d*$/.test(v))onChange(v);}} placeholder={placeholder}
    style={{width:"100%",padding:"7px 10px",borderRadius:2,border:`1px solid ${C.fieldBorder}`,fontSize:14,fontFamily:"inherit",color:C.t1,background:C.field,outline:"none",boxSizing:"border-box",...style}}/>
);
export const DateInp = ({value, onChange, style={}}) => {
  const [raw, setRaw] = useState(value ? fmtDate(value) : "");
  const handle = v => {
    setRaw(v);
    if (!v) { onChange(""); return; }
    const iso = parseToISO(v);
    if (iso) onChange(iso);
  };
  return <Inp value={raw} onChange={handle} placeholder={SETTINGS.dateFmt} style={style}/>;
};

export const Ui5DatePicker = ({value, onChange}:{value:string, onChange:(v:string)=>void}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const initDate = value ? new Date(value+"T00:00:00") : new Date();
  const [viewY, setViewY] = useState(initDate.getFullYear());
  const [viewM, setViewM] = useState(initDate.getMonth()); // 0-indexed
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!open) return;
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[open]);
  useEffect(()=>{
    if(value){ const d=new Date(value+"T00:00:00"); setViewY(d.getFullYear()); setViewM(d.getMonth()); }
  },[value]);
  const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS=["Mo","Tu","We","Th","Fr","Sa","Su"];
  const prevM=()=>{ if(viewM===0){setViewM(11);setViewY(y=>y-1);}else setViewM(m=>m-1); };
  const nextM=()=>{ if(viewM===11){setViewM(0);setViewY(y=>y+1);}else setViewM(m=>m+1); };
  const firstDow = new Date(viewY, viewM, 1).getDay(); // 0=Sun
  const offset = firstDow===0?6:firstDow-1; // shift so Mon=0
  const daysInMonth = new Date(viewY, viewM+1, 0).getDate();
  const cells:Array<number|null> = [...Array(offset).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while(cells.length%7!==0) cells.push(null);
  const toISO=(d:number)=>`${viewY}-${String(viewM+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const pick=(d:number)=>{ onChange(toISO(d)); setOpen(false); };
  const disp = value ? fmtDate(value) : "";
  return (
    <div ref={ref} style={{position:"relative",width:"100%"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",border:`1px solid ${open?C.primary:C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",minHeight:36,padding:"0 10px 0 10px",gap:8,boxSizing:"border-box" as const,outline:open?`2px solid ${C.primary}40`:"none"}}>
        <span style={{flex:1,fontSize:14,color:disp?C.t1:C.t2}}>{disp||SETTINGS.dateFmt}</span>
        <SapIcon name="calendar" size={14} color={open?C.primary:C.t2}/>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:600,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 8px 24px rgba(0,0,0,0.18)",width:280,padding:"8px 0 10px"}}>
          {/* header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px 6px",borderBottom:`1px solid ${C.border}`}}>
            <button onClick={prevM} style={{background:"none",border:"none",cursor:"pointer",padding:"2px 6px",borderRadius:2,fontSize:16,color:C.t1,lineHeight:1}}>‹</button>
            <span style={{fontWeight:700,fontSize:13,color:C.t1}}>{MONTHS[viewM]} {viewY}</span>
            <button onClick={nextM} style={{background:"none",border:"none",cursor:"pointer",padding:"2px 6px",borderRadius:2,fontSize:16,color:C.t1,lineHeight:1}}>›</button>
          </div>
          {/* day-of-week header */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"6px 8px 2px",gap:0}}>
            {DAYS.map(d=><div key={d} style={{textAlign:"center" as const,fontSize:11,fontWeight:700,color:C.t2,padding:"2px 0"}}>{d}</div>)}
          </div>
          {/* day cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 8px",gap:0}}>
            {cells.map((d,i)=>{
              if(!d) return <div key={i}/>;
              const iso=toISO(d);
              const isToday=iso===todayStr;
              const isSel=iso===value;
              return (
                <div key={i} onClick={()=>pick(d)}
                  style={{textAlign:"center" as const,fontSize:13,padding:"5px 2px",borderRadius:2,cursor:"pointer",
                    background:isSel?C.primary:"transparent",color:isSel?"#fff":isToday?C.primary:C.t1,
                    fontWeight:isSel||isToday?700:400,
                    outline:isToday&&!isSel?`1px solid ${C.primary}`:"none"}}
                  onMouseEnter={e=>{ if(!isSel)(e.currentTarget as HTMLElement).style.background=C.infoBg; }}
                  onMouseLeave={e=>{ if(!isSel)(e.currentTarget as HTMLElement).style.background="transparent"; }}>
                  {d}
                </div>
              );
            })}
          </div>
          {/* footer — today button */}
          <div style={{padding:"6px 10px 0",borderTop:`1px solid ${C.border}`,marginTop:6,display:"flex",justifyContent:"center"}}>
            <span onClick={()=>{ onChange(todayStr); setOpen(false); }} style={{fontSize:12,color:C.primary,cursor:"pointer",fontWeight:600}}>Today</span>
          </div>
        </div>
      )}
    </div>
  );
};
export const DatePickerInp = ({value, onChange}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<string|null>(null);
  const [manVal, setManVal] = useState(value||"");
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];
  const iso = (d:Date) => d.toISOString().split("T")[0];
  const addDays = (d:Date, n:number) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
  useEffect(()=>{ setManVal(value||""); },[value]);
  useEffect(()=>{
    if(!open) return;
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)){setOpen(false);setMode(null);} };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[open]);
  const pick = (v:string) => { onChange(v); setOpen(false); setMode(null); };
  const clr = () => { onChange(""); setManVal(""); setMode(null); };
  const rowSt = (active:boolean):any => ({padding:"7px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontSize:13,color:C.t1,background:active?C.infoBg:"transparent"});
  const secHdr = (title:string) => <div style={{padding:"6px 14px 3px",fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:.6,marginTop:2}}>{title}</div>;
  const row = (k:string, label:string, onPick?:()=>void) => (
    <div key={k}>
      <div onClick={()=>{ if(onPick){onPick();}else{setMode(m=>m===k?null:k);} }}
        style={rowSt(mode===k)}
        onMouseEnter={e=>(e.currentTarget.style.background=C.infoBg)}
        onMouseLeave={e=>(e.currentTarget.style.background=mode===k?C.infoBg:"transparent")}>
        <span>{label}</span>
        {!onPick&&<SapIcon name="slim-arrow-right" size={12} color={C.t2}/>}
      </div>
      {mode===k&&(
        <div style={{padding:"4px 14px 10px",display:"flex",flexDirection:"column",gap:6}}>
          <DateInp value={manVal} onChange={v=>{setManVal(v);}}/>
          <div style={{display:"flex",gap:6}}>
            <Btn v="neutral" sm onClick={()=>setMode(null)}>Cancel</Btn>
            <Btn v="primary" sm onClick={()=>{if(manVal)pick(manVal);}}>Apply</Btn>
          </div>
        </div>
      )}
    </div>
  );
  const disp = value ? fmtDate(value) : "";
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",minHeight:36,padding:"0 10px",gap:8,boxSizing:"border-box" as const}}>
        <span style={{flex:1,fontSize:14,color:disp?C.t1:C.t2,whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{disp||"Select date…"}</span>
        <SapIcon name="calendar" size={14} color={C.t2}/>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:500,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 8px 24px rgba(0,0,0,0.15)",minWidth:220,maxHeight:360,overflowY:"auto" as const}}>
          {secHdr("Quick Select")}
          {row("today","Today",()=>pick(today))}
          {row("tomorrow","Tomorrow",()=>pick(iso(addDays(new Date(),1))))}
          {row("in-7","In 7 days",()=>pick(iso(addDays(new Date(),7))))}
          {row("in-14","In 14 days",()=>pick(iso(addDays(new Date(),14))))}
          {row("in-30","In 30 days",()=>pick(iso(addDays(new Date(),30))))}
          {secHdr("Specific Date")}
          {row("specific","Enter date…")}
          {value&&(
            <>
              <div style={{height:1,background:C.border,margin:"4px 0"}}/>
              <div onClick={clr} style={{...rowSt(false),color:C.err}}
                onMouseEnter={e=>(e.currentTarget.style.background=C.infoBg)}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                Clear
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export const Sel = ({value,onChange,opts,style={}}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"7px 10px",borderRadius:2,border:`1px solid ${C.fieldBorder}`,fontSize:14,fontFamily:"inherit",color:C.t1,outline:"none",boxSizing:"border-box",background:C.field,...style}}>
    {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);
export const TA = ({value,onChange,placeholder="",rows=3}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:"100%",padding:"7px 10px",borderRadius:2,border:`1px solid ${C.fieldBorder}`,fontSize:14,fontFamily:"inherit",color:C.t1,background:C.field,outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
);

