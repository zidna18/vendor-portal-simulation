import { useState, useEffect, useRef } from "react";
import { C } from "../../theme";
import { SapIcon } from "./SapIcon";
import { Btn } from "./forms";

const INV_TYPE_OPTS = [
  {key:"Invoice",      text:"Invoice"},
  {key:"Supplier DPR", text:"Down Payment Req"},
];

// Generic inline multi-select combobox — same visual style as InvTypeMultiComboBox
export const FilterMultiComboBox = ({opts,value=[],onChange,placeholder="All"}:{opts:{key:string,text:string}[],value:string[],onChange:(v:string[])=>void,placeholder?:string}) => {
  const [open,setOpen]=useState(false);
  const ref=useRef<any>(null);
  useEffect(()=>{
    if(!open)return;
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[open]);
  const toggle=(key:string)=>{const next=value.includes(key)?value.filter(v=>v!==key):[...value,key];onChange(next);};
  const remove=(key:string,e:React.MouseEvent)=>{e.stopPropagation();onChange(value.filter(v=>v!==key));};
  return(
    <div ref={ref} style={{position:"relative" as const,fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
      <div onClick={()=>setOpen(p=>!p)} style={{display:"flex",flexWrap:"wrap" as const,alignItems:"center",gap:4,minHeight:"2.25rem",padding:"3px 28px 3px 6px",border:`1px solid ${open?C.primary:C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",position:"relative" as const,boxSizing:"border-box" as const,boxShadow:open?`0 0 0 2px ${C.primary}22`:"none",transition:"border-color .1s"}}>
        {value.length===0&&<span style={{color:C.t2,fontSize:14,padding:"2px 2px"}}>{placeholder}</span>}
        {value.map(k=>{
          const opt=opts.find(o=>o.key===k);
          return(
            <span key={k} style={{display:"inline-flex",alignItems:"center",height:22,background:C.selection,border:`1px solid ${C.primary}55`,borderRadius:2,padding:"0 0 0 8px",fontSize:12,color:C.t1,lineHeight:1}}>
              {opt?.text||k}
              <button onClick={e=>remove(k,e)} style={{background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:15,padding:"0 5px",lineHeight:1,display:"flex",alignItems:"center"}}>{"×"}</button>
            </span>
          );
        })}
        <span style={{position:"absolute" as const,right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" as const}}>
          <SapIcon name="slim-arrow-down" size={12} color={C.t2}/>
        </span>
      </div>
      {open&&(
        <div style={{position:"absolute" as const,top:"calc(100% + 2px)",left:0,right:0,zIndex:1000,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",overflow:"hidden",maxHeight:220,overflowY:"auto" as const}}>
          {opts.map(opt=>(
            <div key={opt.key} onClick={()=>toggle(opt.key)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:value.includes(opt.key)?C.selection:"transparent",fontSize:14,color:C.t1}}
              onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
              onMouseLeave={e=>(e.currentTarget.style.background=value.includes(opt.key)?C.selection:"transparent")}>
              <input type="checkbox" readOnly checked={value.includes(opt.key)} style={{width:16,height:16,cursor:"pointer",accentColor:C.primary,flexShrink:0}}/>
              <span>{opt.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export const InvTypeMultiComboBox = ({value=[],onChange}:{value:string[],onChange:(v:string[])=>void}) => {
  const [open,setOpen]=useState(false);
  const ref=useRef<any>(null);
  useEffect(()=>{
    if(!open) return;
    const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};
    document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  },[open]);
  const toggle=(key:string)=>{
    const next=value.includes(key)?value.filter(v=>v!==key):[...value,key];
    onChange(next);
  };
  const remove=(key:string,e:React.MouseEvent)=>{
    e.stopPropagation();
    onChange(value.filter(v=>v!==key));
  };
  return (
    <div ref={ref} style={{position:"relative" as const,fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
      <div onClick={()=>setOpen(p=>!p)} style={{display:"flex",flexWrap:"wrap" as const,alignItems:"center",gap:4,minHeight:"2.25rem",padding:"3px 28px 3px 6px",border:`1px solid ${open?C.primary:C.fieldBorder}`,borderRadius:2,background:C.field,cursor:"pointer",position:"relative" as const,boxSizing:"border-box" as const,boxShadow:open?`0 0 0 2px ${C.primary}22`:"none",transition:"border-color .1s"}}>
        {value.length===0&&<span style={{color:C.t2,fontSize:14,padding:"2px 2px"}}>All Types</span>}
        {value.map(k=>{
          const opt=INV_TYPE_OPTS.find(o=>o.key===k);
          return(
            <span key={k} style={{display:"inline-flex",alignItems:"center",height:22,background:C.selection,border:`1px solid ${C.primary}55`,borderRadius:2,padding:"0 0 0 8px",fontSize:12,color:C.t1,lineHeight:1}}>
              {opt?.text||k}
              <button onClick={e=>remove(k,e)} style={{background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:15,padding:"0 5px",lineHeight:1,display:"flex",alignItems:"center"}}>{"×"}</button>
            </span>
          );
        })}
        <span style={{position:"absolute" as const,right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" as const}}>
          <SapIcon name="slim-arrow-down" size={12} color={C.t2}/>
        </span>
      </div>
      {open&&(
        <div style={{position:"absolute" as const,top:"calc(100% + 2px)",left:0,right:0,zIndex:1000,background:C.card,border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",overflow:"hidden"}}>
          {INV_TYPE_OPTS.map(opt=>(
            <div key={opt.key} onClick={()=>toggle(opt.key)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",background:value.includes(opt.key)?C.selection:"transparent",fontSize:14,color:C.t1}}
              onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
              onMouseLeave={e=>(e.currentTarget.style.background=value.includes(opt.key)?C.selection:"transparent")}>
              <input type="checkbox" readOnly checked={value.includes(opt.key)} style={{width:16,height:16,cursor:"pointer",accentColor:C.primary,flexShrink:0}}/>
              <span>{opt.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Value Help Dialog (sap.ui.comp.valuehelpdialog.ValueHelpDialog) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const VH_OPS = ["equal to","not equal to","starts with","contains","does not contain","empty","not empty"];
const VH_NOVAL = new Set(["empty","not empty"]);
export type VHCol = {key:string, label:string, width?:string|number};
export const ValueHelpDialog = ({title,cols,rows,keyField="v",labelField="l",selected=[],multiSelect=true,onConfirm,onClose}:{title:string,cols:VHCol[],rows:any[],keyField?:string,labelField?:string,selected:string[],multiSelect?:boolean,onConfirm:(s:string[])=>void,onClose:()=>void}) => {
  const [tab,setTab]=useState<"sel"|"cond">("sel");
  const [search,setSearch]=useState("");
  const [localSel,setLocalSel]=useState<string[]>([...selected]);
  const [conds,setConds]=useState<{op:string,val:string}[]>([]);
  const [condOp,setCondOp]=useState(VH_OPS[0]);
  const [condVal,setCondVal]=useState("");
  const filtered=rows.filter(r=>!search||cols.some(c=>String(r[c.key]||"").toLowerCase().includes(search.toLowerCase())));
  const allSel=filtered.length>0&&filtered.every(r=>localSel.includes(r[keyField]));
  const toggleAll=()=>{
    if(allSel)setLocalSel(p=>p.filter(k=>!filtered.find(r=>r[keyField]===k)));
    else setLocalSel(p=>[...new Set([...p,...filtered.map(r=>r[keyField])])]);
  };
  const toggleRow=(key:string)=>{
    if(!multiSelect){setLocalSel([key]);return;}
    setLocalSel(p=>p.includes(key)?p.filter(k=>k!==key):[...p,key]);
  };
  const getLabel=(key:string)=>{const r=rows.find(r=>r[keyField]===key);return r?`${key} – ${r[labelField]||key}`:key;};
  const addCond=()=>{if(!VH_NOVAL.has(condOp)&&!condVal.trim())return;setConds(p=>[...p,{op:condOp,val:condVal.trim()}]);setCondVal("");};
  const confirm=()=>{
    let sel=[...localSel];
    if(conds.length>0){
      const matched=rows.filter(r=>conds.some(c=>{const v=String(r[keyField]||"").toLowerCase(),cv=c.val.toLowerCase();
        if(c.op==="equal to")return v===cv;if(c.op==="not equal to")return v!==cv;
        if(c.op==="starts with")return v.startsWith(cv);if(c.op==="contains")return v.includes(cv);
        if(c.op==="does not contain")return!v.includes(cv);if(c.op==="empty")return!v;if(c.op==="not empty")return!!v;return false;
      })).map(r=>r[keyField]);
      sel=[...new Set([...sel,...matched])];
    }
    onConfirm(sel);
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.45)"}}>
      <div style={{background:C.card,borderRadius:4,boxShadow:"0 8px 32px rgba(0,0,0,0.22)",width:"min(880px,95vw)",maxHeight:"85vh",display:"flex",flexDirection:"column",fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
        {/* Title + tabs */}
        <div style={{padding:"14px 16px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:16,fontWeight:700,color:C.t1,marginBottom:10}}>{title}</div>
          <div style={{display:"flex"}}>
            {(["sel","cond"] as const).map((t,i)=>(
              <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 16px 10px",fontSize:14,color:tab===t?C.info:C.t2,fontFamily:"inherit",fontWeight:tab===t?600:400,borderBottom:`2px solid ${tab===t?C.info:"transparent"}`,marginBottom:-1}}>
                {i===0?"Search and Select":"Define Conditions"}
              </button>
            ))}
          </div>
        </div>
        {/* Body */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {tab==="sel"?(
            <>
              <div style={{padding:"12px 16px 6px",display:"flex",gap:8,alignItems:"center"}}>
                <div style={{flex:1,position:"relative"}}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search"
                    style={{width:"100%",height:32,border:`1px solid ${C.fieldBorder}`,borderRadius:4,padding:"0 30px 0 8px",fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none",background:C.field,color:C.t1}}/>
                  <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><SapIcon name="search" size={14} color={C.t2}/></span>
                </div>
                <button style={{background:C.primary,color:"#fff",border:`1px solid ${C.primaryDk}`,borderRadius:4,height:32,padding:"0 16px",fontSize:14,fontFamily:"inherit",fontWeight:600,cursor:"pointer"}}>Go</button>
                <button style={{background:"none",border:"none",color:C.info,fontSize:14,fontFamily:"inherit",cursor:"pointer"}}>Show Filters</button>
              </div>
              <div style={{padding:"2px 16px 6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:14,fontWeight:700,color:C.t1}}>Items ({filtered.length})</span>
                <SapIcon name="copy" size={15} color={C.t2}/>
              </div>
              <div style={{flex:1,overflow:"auto",borderTop:`1px solid ${C.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:C.subtle,position:"sticky",top:0,zIndex:1}}>
                      <th style={{width:36,padding:"7px 8px 7px 14px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
                        <input type="checkbox" checked={allSel} onChange={toggleAll} style={{cursor:"pointer",accentColor:C.primaryDk}}/>
                      </th>
                      {cols.map(c=>(
                        <th key={c.key} style={{padding:"7px 10px",textAlign:"left",borderBottom:`1px solid ${C.border}`,color:C.t2,fontSize:12,fontWeight:700,whiteSpace:"nowrap",width:c.width,maxWidth:c.width}}>
                          {c.label} <span style={{color:C.t2,fontSize:9}}>{"▲"}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r,i)=>{const key=r[keyField];const sel=localSel.includes(key);return(
                      <tr key={key} onClick={()=>toggleRow(key)} style={{background:sel?C.selection:i%2===0?C.card:C.subtle,cursor:"pointer"}}
                        onMouseEnter={e=>{if(!sel)(e.currentTarget as HTMLElement).style.background=C.hover;}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=sel?C.selection:i%2===0?C.card:C.subtle;}}>
                        <td style={{padding:"7px 8px 7px 14px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
                          <input type="checkbox" checked={sel} onChange={()=>toggleRow(key)} onClick={e=>e.stopPropagation()} style={{cursor:"pointer",accentColor:C.primaryDk}}/>
                        </td>
                        {cols.map((c,ci)=>(
                          <td key={c.key} style={{padding:"7px 10px",borderBottom:`1px solid ${C.border}`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:c.width||140,color:ci===0?C.info:C.t1,fontWeight:ci===0?600:400}}>
                            {r[c.key]??""}</td>
                        ))}
                      </tr>
                    );})}
                    {filtered.length===0&&<tr><td colSpan={cols.length+1} style={{textAlign:"center",padding:"28px",color:C.t2,fontSize:13}}>No items found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          ):(
            <div style={{padding:16,flex:1,overflow:"auto"}}>
              <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                <select value={condOp} onChange={e=>setCondOp(e.target.value)} style={{height:32,border:`1px solid ${C.fieldBorder}`,borderRadius:4,padding:"0 8px",fontSize:13,fontFamily:"inherit",cursor:"pointer",background:C.field,color:C.t1}}>
                  {VH_OPS.map(o=><option key={o}>{o}</option>)}
                </select>
                {!VH_NOVAL.has(condOp)&&<input value={condVal} onChange={e=>setCondVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCond()} placeholder="Value…"
                  style={{flex:1,height:32,border:`1px solid ${C.fieldBorder}`,borderRadius:4,padding:"0 8px",fontSize:13,fontFamily:"inherit",outline:"none",background:C.field,color:C.t1}}/>}
                <button onClick={addCond} style={{background:C.primary,color:"#fff",border:"none",borderRadius:4,height:32,padding:"0 14px",fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight:600}}>Add Condition</button>
              </div>
              {conds.length>0?(
                <div style={{border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
                  {conds.map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",padding:"8px 12px",borderBottom:i<conds.length-1?`1px solid ${C.border}`:"none",background:i%2===0?C.card:C.subtle,gap:8}}>
                      <span style={{fontSize:12,color:C.t2,minWidth:120}}>{c.op}</span>
                      <span style={{fontSize:13,color:C.t1,flex:1}}>{c.val||<em style={{color:C.t2}}>any</em>}</span>
                      <button onClick={()=>setConds(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:C.err,cursor:"pointer",fontSize:18,padding:"0 4px",lineHeight:1}}>{"×"}</button>
                    </div>
                  ))}
                </div>
              ):<div style={{color:C.t2,fontSize:13,textAlign:"center",padding:32}}>No conditions defined.</div>}
            </div>
          )}
        </div>
        {/* Selected tokens bar */}
        <div style={{padding:"8px 16px",borderTop:`1px solid ${C.border}`,background:C.subtle}}>
          <div style={{fontSize:12,color:C.t2,marginBottom:5}}>
            {localSel.length===0&&conds.length===0?"No Items or Conditions Selected":`${localSel.length>0?`${localSel.length} Item${localSel.length!==1?"s":""}`:""} ${conds.length>0?`${conds.length} Condition${conds.length!==1?"s":""}`:""} Selected`}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,minHeight:30,border:`1px solid ${C.fieldBorder}`,borderRadius:4,padding:"3px 8px",background:C.field,flexWrap:"wrap"}}>
            {localSel.length===0&&conds.length===0&&<span style={{color:C.t2,fontSize:12}}>No selection</span>}
            {localSel.map(key=>(
              <span key={key} style={{display:"inline-flex",alignItems:"center",gap:3,background:C.selection,border:`1px solid ${C.info}44`,borderRadius:10,padding:"1px 8px 1px 8px",fontSize:12,color:C.info,whiteSpace:"nowrap"}}>
                {getLabel(key)}
                <button onClick={()=>setLocalSel(p=>p.filter(k=>k!==key))} style={{background:"none",border:"none",cursor:"pointer",color:C.info,padding:"0 0 0 2px",fontSize:14,lineHeight:1}}>{"×"}</button>
              </span>
            ))}
            {localSel.length>0&&<button onClick={()=>{setLocalSel([]);setConds([]);}} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:18,padding:"0 2px",lineHeight:1}} title="Clear all">{"×"}</button>}
          </div>
        </div>
        {/* Footer */}
        <div style={{padding:"10px 16px",display:"flex",justifyContent:"flex-end",gap:8,borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,height:32,padding:"0 16px",fontSize:14,fontFamily:"inherit",cursor:"pointer",color:C.t1}}>Cancel</button>
          <button onClick={confirm} style={{background:C.primary,border:`1px solid ${C.primaryDk}`,borderRadius:4,height:32,padding:"0 16px",fontSize:14,fontFamily:"inherit",fontWeight:600,cursor:"pointer",color:"#fff"}}>OK</button>
        </div>
      </div>
    </div>
  );
};

export const ValueHelpInp = ({selected=[],getLabel,onOpen,placeholder="Select…"}:{selected:string[],getLabel:(k:string)=>string,onOpen:()=>void,placeholder?:string}) => (
  <div onClick={onOpen} style={{position:"relative",display:"flex",alignItems:"center",minHeight:36,border:`1px solid ${C.fieldBorder}`,borderRadius:2,background:C.field,padding:"2px 28px 2px 6px",flexWrap:"wrap",gap:3,cursor:"pointer"}}>
    {selected.length===0&&<span style={{color:C.t2,fontSize:12,padding:"1px 2px"}}>{placeholder}</span>}
    {selected.map(k=>(
      <span key={k} style={{display:"inline-flex",alignItems:"center",background:C.selection,border:`1px solid ${C.info}44`,borderRadius:10,padding:"1px 7px",fontSize:11,color:C.info,whiteSpace:"nowrap"}}>{getLabel(k)}</span>
    ))}
    <button onClick={e=>{e.stopPropagation();onOpen();}} style={{position:"absolute",right:2,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",alignItems:"center"}}>
      <SapIcon name="value-help" size={14} color={C.t2}/>
    </button>
  </div>
);

