import { useState, useEffect, useRef, Component } from "react";
import {
  C, USERS, INIT_INV, INIT_QT, INIT_RFQS,
  VP, applyTheme, applySettings,
  mob, avtColor, avtIni,
  Btn, Inp, Sep, Modal, SapIcon,
  g2, pg,
} from "./shared";
import { VendorInvoice, BrmInvoice } from "./InvoicePages";
import { VendorQuotation, BrmQuotation, BrmRfq, ApproverRfq, ApproverQuotation, DirectorHome, DirectorRfq } from "./QuotationRfqPages";
import { VendorHome, BrmHome, ApproverHome } from "./HomePages";
import { VendorProfile } from "./VendorProfile";

// ── Notification mock data ──────────────────────────────────────
const BRM_NOTIFS = [
  {id:"n1", type:"quotation-approved", icon:"accept", color:"#107e3e", title:"Quotation Approved", msg:"PT Maju Bersama's quotation for RFQ-2025-0003 (Laptops & Workstations) has been approved.", time:"2 min ago", read:false},
  {id:"n2", type:"quotation-rejected", icon:"decline", color:"#bb0000", title:"Quotation Rejected", msg:"CV Sukses Mandiri's quotation QT-2025-0002 for RFQ-2025-0001 was rejected due to price non-compliance.", time:"15 min ago", read:false},
  {id:"n3", type:"quotation-submitted", icon:"add-document", color:"#0070f2", title:"New Quotation Submitted", msg:"PT Maju Bersama submitted a new quotation for RFQ-2025-0005 (HVAC Maintenance Contract).", time:"1 hr ago", read:false},
  {id:"n3b", type:"quotation-sent-to-me", icon:"paper-plane", color:"#0070f2", title:"Quotation Sent to You", msg:"CV Sukses Mandiri sent quotation QT-2025-0009 (IDR 385,000,000) directly to you for RFQ-2025-0007 (Medical & Safety Supplies). Please review.", time:"45 min ago", read:false},
  {id:"n3c", type:"quotation-sent-to-me", icon:"paper-plane", color:"#0070f2", title:"Quotation Sent to You", msg:"PT Maju Bersama sent quotation QT-2025-0010 (IDR 210,750,000) to you for RFQ-2025-0009 (Fuel & Lubricants). Awaiting your evaluation.", time:"1 hr ago", read:false},
  {id:"n4", type:"change-request", icon:"pending", color:"#e76500", title:"Revision Request", msg:"CV Sukses Mandiri requested a revision on QT-2025-0007 — reason: updated material specs.", time:"2 hr ago", read:false},
  {id:"n5", type:"rfq-closing", icon:"alert", color:"#e76500", title:"RFQ Closing Soon", msg:"RFQ-2025-0004 'Industrial Safety Equipment' is closing in 2 days. 1 vendor has not submitted.", time:"3 hr ago", read:true},
  {id:"n6", type:"invoice-submitted", icon:"document", color:"#0070f2", title:"Invoice Submitted", msg:"New invoice INV/MJB/2025/009 (IDR 142,500,000) submitted by PT Maju Bersama — awaiting review.", time:"5 hr ago", read:true},
  {id:"n7", type:"po-issued", icon:"sales-order", color:"#107e3e", title:"Purchase Order Issued", msg:"PO-2025-0018 issued to PT Maju Bersama for accepted quotation QT-2025-0003.", time:"Yesterday", read:true},
  {id:"n8", type:"budget-approval", icon:"money-bills", color:"#6a2282", title:"Budget Approval Needed", msg:"RFQ-2025-0006 (Waste Management Services) is awaiting budget approval from Finance.", time:"Yesterday", read:true},
  {id:"n9", type:"deadline-miss", icon:"warning2", color:"#bb0000", title:"Quotation Deadline Missed", msg:"2 target vendors did not submit quotations for RFQ-2025-0002 before the closing date.", time:"2 days ago", read:true},
  {id:"n10", type:"report-ready", icon:"bar-chart", color:"#0070f2", title:"Monthly Report Ready", msg:"June 2025 procurement summary is ready. 34 RFQs closed, IDR 8.2B in quotations evaluated.", time:"3 days ago", read:true},
];
const APPROVER_NOTIFS = [
  // Pending approval — what he should act on
  {id:"a1", type:"pending-approval", icon:"approvals", color:"#e76500", title:"Awaiting Your Approval", msg:"QT-2025-0001 (IDR 490,000,000) — Procurement of Laptops & Workstations by PT Maju Bersama. Submitted 12 Jun 2025.", time:"Just now", read:false},
  {id:"a2", type:"pending-approval", icon:"approvals", color:"#e76500", title:"Awaiting Your Approval", msg:"QT-2025-0029 (IDR 510,000,000) — Procurement of Laptops & Workstations by CV Sukses Mandiri. Submitted 14 Jun 2025.", time:"5 min ago", read:false},
  {id:"a3", type:"pending-approval", icon:"approvals", color:"#e76500", title:"Awaiting Your Approval", msg:"QT-2025-0030 (IDR 90,500,000) — Medical & First Aid Supplies – All Sites by CV Sukses Mandiri. Submitted 08 Jun 2025.", time:"1 hr ago", read:false},
  {id:"a4", type:"pending-approval", icon:"approvals", color:"#e76500", title:"Awaiting Your Approval", msg:"QT-2025-0031 (IDR 283,500,000) — Waste Management & Environmental Services by CV Sukses Mandiri. Submitted 10 Jun 2025.", time:"2 hr ago", read:false},
  // Final approved — outcomes
  {id:"a5", type:"final-approved", icon:"accept", color:"#107e3e", title:"Quotation Finally Approved", msg:"QT-2025-0003 (IDR 350,000,000) — Security Services – HO Building by CV Sukses Mandiri has been fully approved and awarded.", time:"Yesterday", read:true},
  {id:"a6", type:"final-approved", icon:"accept", color:"#107e3e", title:"Quotation Finally Approved", msg:"QT-2025-0004 (IDR 228,000,000) — HVAC Maintenance Contract by PT Maju Bersama has been fully approved. PO in progress.", time:"Yesterday", read:true},
  {id:"a7", type:"final-approved", icon:"accept", color:"#107e3e", title:"Quotation Finally Approved", msg:"QT-2025-0006 (IDR 175,000,000) — Industrial Safety Equipment by PT Maju Bersama has been fully approved and closed.", time:"2 days ago", read:true},
  {id:"a8", type:"approval-rejected", icon:"decline", color:"#bb0000", title:"Approval Rejected", msg:"QT-2025-0008 (IDR 620,000,000) — IT Infrastructure Services by PT Maju Bersama was rejected by you. Reason: Exceeds budget ceiling.", time:"3 days ago", read:true},
];
const DIRECTOR_NOTIFS = [
  {id:"d1", type:"pending-approval", icon:"approvals", color:"#e76500", title:"5 RFQs Awaiting Approval", msg:"RFQ-2025-0003, 0008, 0021, 0022, 0028 are pending Finance Approver decision. Total value IDR 6.13B.", time:"Just now", read:false},
  {id:"d2", type:"score-submitted", icon:"performance", color:"#107e3e", title:"Evaluation Score Submitted", msg:"Budi Santoso submitted evaluation scores for RFQ-2025-0021 (Road Infrastructure). Winner: PT Maju Bersama (score: 86).", time:"2 hr ago", read:false},
  {id:"d3", type:"rfq-closed", icon:"complete", color:"#107e3e", title:"RFQ Closed – Winner Selected", msg:"RFQ-2025-0001 (Laptops & Workstations) closed. Winner: PT Maju Bersama. Contract value IDR 490,000,000.", time:"Yesterday", read:true},
  {id:"d4", type:"budget-alert", icon:"alert", color:"#e76500", title:"High-Value RFQ Submitted", msg:"RFQ-2025-0028 (IT Hardware Refresh – IDR 2.2B) submitted for approval. Requires Director awareness.", time:"2 days ago", read:true},
  {id:"d5", type:"discussion-activity", icon:"discussion", color:"#0070f2", title:"Active Discussion", msg:"5 new messages in RFQ-2025-0021 discussion thread. Procurement Manager and Finance Approver are aligned on vendor selection.", time:"3 days ago", read:true},
];
const VENDOR_NOTIFS = [
  {id:"v1", type:"rfq-invite", icon:"add-document", color:"#0070f2", title:"New RFQ Invitation", msg:"You have been invited to submit a quotation for RFQ-2025-0008 (IT Infrastructure Services). Deadline: 14 Jul 2025.", time:"10 min ago", read:false},
  {id:"v2", type:"quotation-approved", icon:"accept", color:"#107e3e", title:"Quotation Accepted", msg:"Your quotation QT-2025-0003 for RFQ-2025-0001 (Laptops & Workstations) has been accepted. PO will follow.", time:"1 hr ago", read:false},
  {id:"v3", type:"quotation-rejected", icon:"decline", color:"#bb0000", title:"Quotation Rejected", msg:"Your quotation QT-2025-0005 for RFQ-2025-0003 was rejected. Reason: price above budget ceiling.", time:"3 hr ago", read:false},
  {id:"v4", type:"change-request", icon:"pending", color:"#e76500", title:"Revision Requested", msg:"BRM has requested a revision on your quotation QT-2025-0007. Please update and resubmit.", time:"5 hr ago", read:true},
  {id:"v5", type:"invoice-confirmed", icon:"accept", color:"#107e3e", title:"Invoice Confirmed", msg:"Invoice INV/MJB/2025/006 (IDR 215,000,000) has been confirmed by BRM and is being processed.", time:"Yesterday", read:true},
  {id:"v6", type:"rfq-closing", icon:"alert", color:"#e76500", title:"RFQ Deadline Reminder", msg:"RFQ-2025-0005 (HVAC Maintenance) closes in 1 day. Submit your quotation before the deadline.", time:"Yesterday", read:true},
];

// ── Shell Bar ──────────────────────────────────────────────────
const Shell = ({user,onLogout,section,setSection,onOpenSettings}) => {
  const [menuOpen,setMenuOpen]=useState(false);
  const [avatarOpen,setAvatarOpen]=useState(false);
  const [notifOpen,setNotifOpen]=useState(false);
  const [readIds,setReadIds]=useState<Set<string>>(new Set());
  const notifRef=useRef<HTMLDivElement>(null);
  const allNotifs=user.role==="vendor"?VENDOR_NOTIFS:user.role==="approver"?APPROVER_NOTIFS:user.role==="director"?DIRECTOR_NOTIFS:BRM_NOTIFS;
  const notifs=allNotifs.map(n=>({...n,read:n.read||readIds.has(n.id)}));
  const unread=notifs.filter(n=>!n.read).length;
  useEffect(()=>{
    if(!notifOpen)return;
    const h=(e:MouseEvent)=>{if(notifRef.current&&!notifRef.current.contains(e.target as Node))setNotifOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[notifOpen]);
  const ac=avtColor(user.id); const ini=avtIni(user.name);
  const nav=user.role==="vendor"
    ?[{id:"dashboard",l:"Home"},{id:"profile",l:"Profile"},{id:"invoice",l:"Invoice"},{id:"quotation",l:"Quotation"}]
    :user.role==="approver"
    ?[{id:"dashboard",l:"Home"},{id:"apr-rfq",l:"RFQ Approval"},{id:"apr-quotation",l:"PO Confirmation"}]
    :user.role==="director"
    ?[{id:"dashboard",l:"Home"},{id:"dir-rfq",l:"RFQ Management"}]
    :[{id:"dashboard",l:"Home"},{id:"brm-invoice",l:"Invoice Mgmt"},{id:"brm-rfq",l:"RFQ Mgmt"},{id:"brm-quotation",l:"Quotation Mgmt"}];
  const isMob=mob();
  const iconBtn=(onClick,title,children)=>(
    <button onClick={onClick} title={title} aria-label={title} style={{width:36,height:36,borderRadius:"50%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.75)",transition:"background .1s",flexShrink:0}}
      onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.1)")}
      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>{children}</button>
  );
  return (
    <div style={{background:C.shell,color:"#fff",position:"sticky",top:0,zIndex:200,fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",height:44,paddingLeft:4,paddingRight:8}}>

        {/* Product switch */}
        {iconBtn(undefined,"Product switch",<SapIcon name="grid" size={16} color="rgba(255,255,255,0.65)"/>)}

        {/* Logo + title */}
        <div style={{display:"flex",alignItems:"center",gap:0,paddingLeft:4,paddingRight:16,flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:4,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",marginRight:8,flexShrink:0}}>
            <SapIcon name="business-objects-experience" size={18} color="#fff"/>
          </div>
          <div>
            <div style={{fontSize:isMob?12:14,fontWeight:700,color:"#fff",lineHeight:1.15}}>{isMob?"BRM Portal":"BRM Vendor Portal"}</div>
            {!isMob&&<div style={{fontSize:10,color:"rgba(255,255,255,0.55)",lineHeight:1}}>PT Bumi Resource Minerals Group</div>}
          </div>
        </div>

        {/* Separator */}
        {!isMob&&<div style={{width:1,height:24,background:"rgba(255,255,255,0.25)",marginRight:4,flexShrink:0}}/>}

        {/* Nav items */}
        {!isMob&&(
          <div style={{display:"flex",gap:0,flex:1,height:44}}>
            {nav.map(n=>{
              const active=section===n.id;
              return(
                <button key={n.id} onClick={()=>setSection(n.id)}
                  style={{background:active?"rgba(255,255,255,0.1)":"transparent",color:active?"#fff":"rgba(255,255,255,0.72)",
                    border:"none",borderBottom:`3px solid ${active?"rgba(255,255,255,0.9)":"transparent"}`,
                    cursor:"pointer",padding:"0 1rem",height:44,fontFamily:"inherit",
                    fontSize:13,fontWeight:active?600:400,whiteSpace:"nowrap" as const,
                    transition:"background .1s,color .1s",letterSpacing:0.1}}
                  onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="#fff";}}}
                  onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.72)";}}}
                >{n.l}</button>
              );
            })}
          </div>
        )}
        {isMob&&<div style={{flex:1}}/>}

        {/* Right-side action icons */}
        <div style={{display:"flex",alignItems:"center",gap:0,marginLeft:4}}>
          {iconBtn(undefined,"Search",<SapIcon name="search" size={16} color="rgba(255,255,255,0.75)"/>)}
          <div ref={notifRef} style={{position:"relative"}}>
            <button onClick={()=>setNotifOpen(o=>!o)} title="Notifications" aria-label="Notifications"
              style={{width:36,height:36,borderRadius:"50%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.75)",transition:"background .1s",flexShrink:0,position:"relative"}}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.1)")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <SapIcon name="bell" size={16} color="rgba(255,255,255,0.75)"/>
              {unread>0&&<span style={{position:"absolute",top:4,right:4,minWidth:16,height:16,borderRadius:8,background:"#bb0000",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",lineHeight:1,border:"2px solid "+C.shell}}>{unread>9?"9+":unread}</span>}
            </button>
            {notifOpen&&(
              <div style={{position:"absolute",top:44,right:-8,width:360,maxHeight:520,background:C.card,border:`1px solid ${C.border}`,borderRadius:6,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",zIndex:400,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                  <span style={{fontWeight:700,fontSize:14,color:C.t1}}>Notifications {unread>0&&<span style={{background:"#bb0000",color:"#fff",borderRadius:10,fontSize:10,padding:"1px 7px",marginLeft:6}}>{unread}</span>}</span>
                  {unread>0&&<button onClick={()=>setReadIds(new Set(allNotifs.map(n=>n.id)))} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.primary,fontFamily:"inherit",padding:0}}>Mark all as read</button>}
                </div>
                <div style={{overflowY:"auto",flex:1}}>
                  {notifs.map(n=>(
                    <div key={n.id} onClick={()=>setReadIds(r=>new Set([...r,n.id]))}
                      style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:n.read?"transparent":C.infoBg,display:"flex",gap:12,alignItems:"flex-start"}}
                      onMouseEnter={e=>(e.currentTarget.style.background=C.subtle)}
                      onMouseLeave={e=>(e.currentTarget.style.background=n.read?"transparent":C.infoBg)}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:n.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                        <SapIcon name={n.icon} size={14} color={n.color}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:2}}>
                          <span style={{fontSize:12,fontWeight:700,color:C.t1,whiteSpace:"nowrap"}}>{n.title}</span>
                          <span style={{fontSize:11,color:C.t2,whiteSpace:"nowrap",flexShrink:0}}>{n.time}</span>
                        </div>
                        <div style={{fontSize:12,color:C.t2,lineHeight:1.45}}>{n.msg}</div>
                      </div>
                      {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:"#0070f2",flexShrink:0,marginTop:6}}/>}
                    </div>
                  ))}
                </div>
                <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,textAlign:"center",flexShrink:0}}>
                  <button style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.primary,fontFamily:"inherit"}}>View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div style={{position:"relative",marginLeft:4}}>
            <button onClick={()=>setAvatarOpen(o=>!o)} title={user.name} aria-label={`User menu: ${user.name}`} aria-expanded={avatarOpen}
              style={{width:32,height:32,borderRadius:"50%",background:ac.bg,border:`2px solid ${avatarOpen?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.3)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:ac.fg,
                cursor:"pointer",padding:0,outline:"none",flexShrink:0,transition:"border-color .12s"}}>{ini}</button>
            {avatarOpen&&<>
              <div onClick={()=>setAvatarOpen(false)} style={{position:"fixed",inset:0,zIndex:299}}/>
              <div style={{position:"absolute",top:40,right:0,background:C.card,borderRadius:6,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",minWidth:248,zIndex:300,overflow:"hidden"}}>
                <div style={{padding:"20px 20px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,background:C.subtle,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{width:56,height:56,borderRadius:"50%",background:ac.bg,border:`2px solid ${ac.fg}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:ac.fg}}>{ini}</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:15,fontWeight:700,color:C.t1,marginBottom:2}}>{user.name}</div>
                    <div style={{fontSize:12,color:C.t2}}>{user.role==="vendor"?"Supplier":user.role==="approver"?"Finance Approver":"BRM Employee"}</div>
                    {user.title&&<div style={{fontSize:12,color:C.t2,marginTop:1}}>{user.title}</div>}
                    {user.vendorId&&<div style={{fontSize:11,color:C.info,marginTop:5,padding:"2px 10px",background:C.infoBg,borderRadius:10,display:"inline-block",border:`1px solid ${C.info}30`}}>Vendor ID: {user.vendorId}</div>}
                  </div>
                </div>
                <div style={{padding:"6px 0"}}>
                  <button onClick={()=>{setAvatarOpen(false);onOpenSettings();}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 18px",background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.t1,fontFamily:"inherit"}}>
                    <SapIcon name="action-settings" size={15} style={{flexShrink:0}}/><span>Settings</span>
                  </button>
                  <div style={{margin:"4px 18px",borderTop:`1px solid ${C.border}`}}/>
                  <button onClick={()=>{setAvatarOpen(false);onLogout();}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 18px",background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.err,fontFamily:"inherit"}}>
                    <SapIcon name="log" size={15} color={C.err}/><span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>}
          </div>

          {isMob&&<button onClick={()=>setMenuOpen(o=>!o)} style={{background:"rgba(255,255,255,0.1)",color:"#fff",border:"none",cursor:"pointer",borderRadius:4,width:32,height:32,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",marginLeft:6}}>☰</button>}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {isMob&&menuOpen&&(
        <div style={{background:C.shell,borderTop:"1px solid rgba(255,255,255,0.12)",paddingBottom:6}}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>{setSection(n.id);setMenuOpen(false);}} style={{display:"block",width:"100%",textAlign:"left",background:section===n.id?"rgba(255,255,255,0.1)":"transparent",color:"#fff",border:"none",borderLeft:`3px solid ${section===n.id?"rgba(255,255,255,0.9)":"transparent"}`,cursor:"pointer",padding:"12px 20px",fontFamily:"inherit",fontSize:14,fontWeight:section===n.id?600:400}}>{n.l}</button>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 20px",borderTop:"1px solid rgba(255,255,255,0.12)",marginTop:4}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{user.name} · {user.role==="vendor"?"Supplier":user.role==="approver"?"Approver":user.role==="director"?"Director":"BRM"}</span>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{onOpenSettings();setMenuOpen(false);}} style={{background:"rgba(255,255,255,0.13)",color:"#fff",border:"none",cursor:"pointer",borderRadius:4,width:30,height:30,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}><SapIcon name="action-settings" size={14} color="#fff"/></button>
              <button onClick={onLogout} style={{background:"rgba(255,255,255,0.13)",color:"#fff",border:"none",cursor:"pointer",borderRadius:4,padding:"4px 12px",fontSize:12,fontFamily:"inherit"}}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Login ──────────────────────────────────────────────────────
const Login = ({onLogin}) => {
  const [username,setU]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [loading,setL]=useState(false); const [role,setRole]=useState("vendor"); const [showPw,setShowPw]=useState(false); const [keepMe,setKeep]=useState(false);
  const go=()=>{
    if(!username.trim()){setErr("Please enter a User ID or Login Name.");return;}
    if(!pw){setErr("Please enter your password.");return;}
    setL(true);setErr("");
    setTimeout(()=>{
      const u=USERS.find(x=>x.username===username&&x.password===pw);
      u?onLogin(u):(setErr("The user name or password you entered is incorrect. Please try again."),setL(false));
    },700);
  };
  const quickLogin=(uname)=>onLogin(USERS.find(x=>x.username===uname));
  const F:any={fontFamily:"'72','72full',Arial,Helvetica,sans-serif"};
  return (
    <div style={{...F,minHeight:"100vh",background:"#f3f4f5",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
      {/* Card */}
      <div style={{background:"#fff",borderRadius:4,width:"100%",maxWidth:380,boxShadow:"0 2px 16px rgba(0,0,0,0.12)",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {/* Card body */}
        <div style={{padding:"32px 40px 0 40px",flex:1}}>
          {/* Logo row */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <img src="/tenant_logo.png" alt="BRM" style={{height:26,width:"auto"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              <span style={{fontSize:11,color:"#6a6d70",fontWeight:400,letterSpacing:.2}}>SAP<sup style={{fontSize:8}}>®</sup> ID</span>
            </div>
          </div>

          {/* Heading */}
          <h1 style={{fontSize:28,fontWeight:700,color:"#1d2d3e",margin:"0 0 28px 0",lineHeight:1.2}}>Sign In</h1>

          {/* Role selector — kept for demo, styled subtly */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",gap:0,border:"1px solid #d9d9d9",borderRadius:4,overflow:"hidden"}}>
              {[["vendor","Vendor / Supplier"],["brm","BRM Employee"]].map(([r,lbl],i)=>(
                <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:"7px 0",border:"none",borderRight:i===0?"1px solid #d9d9d9":"none",background:role===r?"#0a6ed1":"#fff",color:role===r?"#fff":"#6a6d70",fontSize:12,fontWeight:role===r?700:400,fontFamily:"inherit",cursor:"pointer",transition:"background .15s"}}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* Username field */}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,color:"#6a6d70",marginBottom:4}}>User ID or Login Name</label>
            <div style={{position:"relative"}}>
              <input
                value={username} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
                placeholder="User ID or Login Name"
                style={{width:"100%",boxSizing:"border-box",padding:"8px 0",fontSize:14,color:"#1d2d3e",background:"transparent",border:"none",borderBottom:"1px dotted #8c8c8c",outline:"none",fontFamily:"inherit"}}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,color:"#6a6d70",marginBottom:4}}>Password</label>
            <div style={{position:"relative",border:"1px solid #0a6ed1",borderRadius:4,display:"flex",alignItems:"center"}}>
              <input
                value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
                type={showPw?"text":"password"} placeholder="Password"
                style={{flex:1,padding:"8px 10px",fontSize:14,color:"#1d2d3e",background:"transparent",border:"none",outline:"none",fontFamily:"inherit"}}
              />
              <button onClick={()=>setShowPw(p=>!p)} title={showPw?"Hide Password":"Show Password"}
                style={{background:"none",border:"none",cursor:"pointer",padding:"0 10px",display:"flex",alignItems:"center",color:"#6a6d70"}}>
                <SapIcon name={showPw?"hide":"show"} size={16} color="#6a6d70"/>
              </button>
            </div>
          </div>

          {/* Error */}
          {err&&<div style={{fontSize:13,color:"#bb0000",marginBottom:12,padding:"8px 10px",background:"#fff1f0",border:"1px solid #ffccc7",borderRadius:3}}>{err}</div>}

          {/* Keep me signed in + Forgot password */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#32363a",cursor:"pointer"}}>
              <input type="checkbox" checked={keepMe} onChange={e=>setKeep(e.target.checked)} style={{width:13,height:13,cursor:"pointer",accentColor:"#0a6ed1"}}/>
              Keep me signed in
            </label>
            <a style={{fontSize:13,color:"#0a6ed1",fontWeight:700,textDecoration:"none",cursor:"pointer"}}>Forgot password?</a>
          </div>

          {/* Quick demo access */}
          <div style={{marginBottom:20,padding:"12px 0",borderTop:"1px solid #e5e5e5"}}>
            <div style={{fontSize:11,color:"#6a6d70",fontWeight:700,marginBottom:8,letterSpacing:.6,textTransform:"uppercase"}}>Quick Demo Access</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {[["vendor1","PT Maju Bersama","Vendor"],["vendor2","CV Sukses Mandiri","Vendor"],["vendor3","PT Solusi Nusantara","Vendor"],["brm.user","Ahmad Rizki","BRM Employee"],["buyer1","Siti Rahma","BRM Employee"],["approver1","Budi Santoso","Approver"],["director1","Arief Budiman","Director"]].map(([u,name,roleLabel])=>(
                <button key={u} onClick={()=>quickLogin(u)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",textAlign:"left",padding:"7px 10px",borderRadius:3,border:"1px solid #e5e5e5",background:"#fafafa",cursor:"pointer",fontSize:12,fontFamily:"inherit",color:"#1d2d3e"}}>
                  <SapIcon name={roleLabel==="Vendor"?"factory":roleLabel==="Approver"?"approvals":roleLabel==="Director"?"manager":"employee"} size={12} color="#6a6d70"/>
                  <span style={{fontWeight:600}}>{name}</span>
                  <span style={{color:"#8c8c8c",marginLeft:"auto",fontSize:11}}>{roleLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card footer with Continue button */}
        <div style={{padding:"16px 40px 24px 40px",display:"flex",justifyContent:"flex-end",borderTop:"1px solid #f0f0f0"}}>
          <button onClick={go} disabled={loading}
            style={{background:loading?"#b3d3f5":"#0a6ed1",color:"#fff",border:"none",borderRadius:4,padding:"9px 24px",fontSize:14,fontWeight:700,fontFamily:"inherit",cursor:loading?"not-allowed":"pointer",minWidth:110,transition:"background .15s"}}>
            {loading?"Signing in…":"Continue"}
          </button>
        </div>
      </div>

      {/* Page footer */}
      <div style={{marginTop:20,background:"#fff",borderRadius:24,padding:"10px 28px",display:"flex",gap:20,alignItems:"center"}}>
        {["Privacy Policy","Legal Disclosure","Cookie Statement"].map(l=>(
          <a key={l} style={{fontSize:12,color:"#0a6ed1",textDecoration:"none",cursor:"pointer"}}>{l}</a>
        ))}
      </div>
    </div>
  );
};

// ── Settings Modal ─────────────────────────────────────────────
const SettingsModal = ({settings,onUpdate,onClose,theme,onThemeChange,user}) => {
  const [nav,setNav]=useState("appearance");

  const NUM_FMTS = [
    {v:"comma", sample:"1,234,567.89", desc:"Comma thousand sep, dot decimal"},
    {v:"dot",   sample:"1.234.567,89", desc:"Dot thousand sep, comma decimal"},
  ];
  const DATE_FMTS = [
    {v:"YYYY-MM-DD", ex:"2025-06-25"},{v:"DD/MM/YYYY", ex:"25/06/2025"},
    {v:"MM/DD/YYYY", ex:"06/25/2025"},{v:"DD.MM.YYYY", ex:"25.06.2025"},
    {v:"DD-MM-YYYY", ex:"25-06-2025"},{v:"YYYY/MM/DD", ex:"2025/06/25"},
  ];

  const THEMES = [
    {v:"light", label:"SAP Quartz Light", desc:"Light background, default SAP Fiori theme",
      preview:<svg viewBox="0 0 72 48" xmlns="http://www.w3.org/2000/svg" style={{width:72,height:48,borderRadius:3,border:"1px solid #d9d9d9"}}>
        <rect width="72" height="48" fill="#f5f6f7"/>
        <rect width="72" height="9" fill="#354a5f"/>
        <rect x="4" y="13" width="20" height="31" fill="#e8ebee"/>
        <rect x="28" y="13" width="40" height="4" fill="#0a6ed1" rx="1"/>
        <rect x="28" y="20" width="40" height="2" fill="#d9d9d9" rx="1"/>
        <rect x="28" y="25" width="35" height="2" fill="#d9d9d9" rx="1"/>
        <rect x="28" y="30" width="38" height="2" fill="#d9d9d9" rx="1"/>
        <rect x="28" y="35" width="30" height="2" fill="#d9d9d9" rx="1"/>
      </svg>},
    {v:"dark", label:"SAP Quartz Dark", desc:"Dark background, high-contrast dark theme",
      preview:<svg viewBox="0 0 72 48" xmlns="http://www.w3.org/2000/svg" style={{width:72,height:48,borderRadius:3,border:"1px solid #454545"}}>
        <rect width="72" height="48" fill="#1c2228"/>
        <rect width="72" height="9" fill="#29354a"/>
        <rect x="4" y="13" width="20" height="31" fill="#243040"/>
        <rect x="28" y="13" width="40" height="4" fill="#5ab0ff" rx="1"/>
        <rect x="28" y="20" width="40" height="2" fill="#454545" rx="1"/>
        <rect x="28" y="25" width="35" height="2" fill="#454545" rx="1"/>
        <rect x="28" y="30" width="38" height="2" fill="#454545" rx="1"/>
        <rect x="28" y="35" width="30" height="2" fill="#454545" rx="1"/>
      </svg>},
  ];

  const NAV_ITEMS = [
    {id:"account",    icon:"employee",        label:"User Account",        sub:user?.name||""},
    {id:"appearance", icon:"palette",         label:"Appearance",          sub:theme==="dark"?"SAP Quartz Dark":"SAP Quartz Light"},
    {id:"language",   icon:"world",           label:"Language and Region", sub:"American English"},
    {id:"numfmt",     icon:"number-sign",     label:"Number Format",       sub:settings.numFmt==="comma"?"1,234,567.89":"1.234.567,89"},
    {id:"datefmt",    icon:"appointment-2",   label:"Date Format",         sub:settings.dateFmt},
  ];

  const sideW=220, contentW=460;

  const renderContent=()=>{
    if(nav==="account") return (
      <div style={{padding:"28px 32px"}}>
        <div style={{fontSize:20,fontWeight:600,color:C.t1,marginBottom:24}}>User Account</div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,padding:"18px 20px",background:C.subtle,borderRadius:6,border:`1px solid ${C.border}`}}>
          {(()=>{const {avtColor,avtIni}=({avtColor:(id)=>({bg:"#354a5f",fg:"#fff"}),avtIni:(n)=>n?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"??"});const ac={bg:"#354a5f",fg:"#fff"};const ini=user?.name?.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase()||"??";return(<div style={{width:56,height:56,borderRadius:"50%",background:ac.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:ac.fg,flexShrink:0}}>{ini}</div>);})()}
          <div>
            <div style={{fontSize:16,fontWeight:700,color:C.t1}}>{user?.name}</div>
            <div style={{fontSize:13,color:C.t2,marginTop:3}}>{user?.role==="vendor"?"Supplier":user?.role==="approver"?"Finance Approver":"BRM Employee"}</div>
            {user?.title&&<div style={{fontSize:12,color:C.t2,marginTop:2}}>{user.title}</div>}
            {user?.email&&<div style={{fontSize:12,color:C.info,marginTop:4}}>{user.email}</div>}
          </div>
        </div>
        {user?.vendorId&&<div style={{fontSize:13,color:C.t2,padding:"10px 14px",background:C.infoBg,borderRadius:4,border:`1px solid ${C.border}`}}>Vendor ID: <strong style={{color:C.t1}}>{user.vendorId}</strong></div>}
      </div>
    );

    if(nav==="appearance") return (
      <div style={{padding:"28px 32px"}}>
        <div style={{fontSize:20,fontWeight:600,color:C.t1,marginBottom:6}}>Appearance</div>
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,marginBottom:24}}>
          <div style={{padding:"8px 16px",fontSize:13,fontWeight:600,color:C.primary,borderBottom:`2px solid ${C.primary}`,marginBottom:-1}}>Theme</div>
        </div>
        <div style={{marginBottom:12,fontSize:12,fontWeight:700,color:C.t2,letterSpacing:.5,textTransform:"uppercase"}}>SAP Quartz (Set)</div>
        <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:20}}>
          {THEMES.map(t=>(
            <button key={t.v} onClick={()=>onThemeChange(t.v)}
              style={{display:"flex",alignItems:"center",gap:16,padding:"12px 14px",background:theme===t.v?"#edf4ff":C.card,border:`1px solid ${theme===t.v?"#91c8f6":C.border}`,borderRadius:4,cursor:"pointer",textAlign:"left" as const,fontFamily:"inherit",transition:"background .1s",width:"100%"}}>
              {t.preview}
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:theme===t.v?700:400,color:C.t1}}>{t.label}</div>
                <div style={{fontSize:12,color:C.t2,marginTop:2}}>{t.desc}</div>
              </div>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${theme===t.v?C.primary:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {theme===t.v&&<div style={{width:10,height:10,borderRadius:"50%",background:C.primary}}/>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );

    if(nav==="language") return (
      <div style={{padding:"28px 32px"}}>
        <div style={{fontSize:20,fontWeight:600,color:C.t1,marginBottom:20}}>Language and Region</div>
        <div style={{padding:"12px 16px",background:C.subtle,borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,color:C.t2}}>
          <div style={{fontWeight:600,color:C.t1,marginBottom:4}}>Language</div>
          <div>American English (en-US)</div>
          <div style={{marginTop:10,fontSize:12,color:C.t2}}>Language settings are managed by your SAP system administrator.</div>
        </div>
      </div>
    );

    if(nav==="numfmt") return (
      <div style={{padding:"28px 32px"}}>
        <div style={{fontSize:20,fontWeight:600,color:C.t1,marginBottom:6}}>Number Format</div>
        <div style={{fontSize:13,color:C.t2,marginBottom:20}}>Controls thousand and decimal separators for all amounts.</div>
        {NUM_FMTS.map(f=>(
          <button key={f.v} onClick={()=>onUpdate({numFmt:f.v})}
            style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",marginBottom:8,background:settings.numFmt===f.v?"#edf4ff":C.card,border:`1px solid ${settings.numFmt===f.v?"#91c8f6":C.border}`,borderRadius:4,cursor:"pointer",width:"100%",textAlign:"left" as const,fontFamily:"inherit"}}>
            <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${settings.numFmt===f.v?C.primary:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {settings.numFmt===f.v&&<div style={{width:10,height:10,borderRadius:"50%",background:C.primary}}/>}
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.t1,fontFamily:"monospace"}}>{f.sample}</div>
              <div style={{fontSize:12,color:C.t2,marginTop:2}}>{f.desc}</div>
            </div>
          </button>
        ))}
      </div>
    );

    if(nav==="datefmt") return (
      <div style={{padding:"28px 32px"}}>
        <div style={{fontSize:20,fontWeight:600,color:C.t1,marginBottom:6}}>Date Format</div>
        <div style={{fontSize:13,color:C.t2,marginBottom:20}}>Controls how dates are displayed across the portal.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {DATE_FMTS.map(f=>(
            <button key={f.v} onClick={()=>onUpdate({dateFmt:f.v})}
              style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:settings.dateFmt===f.v?"#edf4ff":C.card,border:`1px solid ${settings.dateFmt===f.v?"#91c8f6":C.border}`,borderRadius:4,cursor:"pointer",textAlign:"left" as const,fontFamily:"inherit"}}>
              <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${settings.dateFmt===f.v?C.primary:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {settings.dateFmt===f.v&&<div style={{width:8,height:8,borderRadius:"50%",background:C.primary}}/>}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.t1,fontFamily:"monospace"}}>{f.v}</div>
                <div style={{fontSize:11,color:C.t2}}>{f.ex}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
    return null;
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:8,boxShadow:"0 8px 48px rgba(0,0,0,0.28)",width:sideW+contentW,maxWidth:"95vw",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:52,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontSize:16,fontWeight:700,color:C.t1}}>Settings</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:20,lineHeight:1,padding:4,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4}}>×</button>
        </div>
        {/* Body */}
        <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
          {/* Left nav */}
          <div style={{width:sideW,borderRight:`1px solid ${C.border}`,background:C.subtle,flexShrink:0,overflowY:"auto",padding:"8px 0"}}>
            {NAV_ITEMS.map(item=>(
              <button key={item.id} onClick={()=>setNav(item.id)}
                style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 20px",background:nav===item.id?C.card:"none",border:"none",borderLeft:`3px solid ${nav===item.id?C.primary:"transparent"}`,cursor:"pointer",textAlign:"left" as const,fontFamily:"inherit",transition:"background .1s"}}>
                <SapIcon name={item.icon} size={18} color={nav===item.id?C.primary:C.t2}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:nav===item.id?700:400,color:nav===item.id?C.t1:C.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</div>
                  {item.sub&&<div style={{fontSize:11,color:C.t2,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.sub}</div>}
                </div>
              </button>
            ))}
          </div>
          {/* Right content */}
          <div style={{flex:1,overflowY:"auto"}}>
            {renderContent()}
          </div>
        </div>
        {/* Footer */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:8,padding:"12px 20px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <button onClick={onClose} style={{padding:"0 16px",height:36,background:C.primary,border:`1px solid ${C.primary}`,borderRadius:4,color:"#fff",fontSize:14,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>Save</button>
          <button onClick={onClose} style={{padding:"0 16px",height:36,background:"none",border:`1px solid ${C.border}`,borderRadius:4,color:C.t1,fontSize:14,fontFamily:"inherit",cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ── Error Boundary ─────────────────────────────────────────────
class ErrorBoundary extends Component<{children:any},{err:any,info:any}> {
  constructor(p){super(p);this.state={err:null,info:null};}
  componentDidCatch(err,info){this.setState({err,info});}
  render(){
    if(this.state.err) return (
      <div style={{padding:40,fontFamily:"monospace",background:"#fff1f1",minHeight:"100vh"}}>
        <h2 style={{color:"#cc0000",marginBottom:16}}>App crashed — error details:</h2>
        <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all",background:"#fff",padding:16,border:"1px solid #cc0000",borderRadius:4,fontSize:13}}>{String(this.state.err)}</pre>
        <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all",background:"#fff",padding:16,border:"1px solid #ccc",borderRadius:4,fontSize:12,marginTop:12}}>{this.state.info?.componentStack}</pre>
      </div>
    );
    return this.props.children;
  }
}

// ── App Root ───────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [section,setSection]=useState("dashboard");
  const [theme,setTheme]=useState("light");
  const changeTheme=(t)=>{applyTheme(t);setTheme(t);};
  const [settings,setSettings]=useState({numFmt:"comma",dateFmt:"YYYY-MM-DD"});
  const [showSettings,setShowSettings]=useState(false);
  const updateSettings=s=>{const n={...settings,...s};applySettings(n);setSettings(n);};
  const [invoices,setInvoices]=useState(INIT_INV);
  const [quotations,setQuotations]=useState(INIT_QT);
  const [rfqs,setRfqs]=useState(INIT_RFQS);
  const [,setVpw]=useState(window.innerWidth);
  useEffect(()=>{const h=()=>{VP.w=window.innerWidth;setVpw(window.innerWidth);};window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const [drillInvoiceNo,setDrillInvoiceNo]=useState("");
  const login=u=>{setUser(u);setSection("dashboard");};
  const logout=()=>{setUser(null);setSection("dashboard");};
  const drillInvoice=(no:string,sec:string)=>{setDrillInvoiceNo(no);setSection(sec);};
  if(!user) return <ErrorBoundary><Login onLogin={login}/></ErrorBoundary>;
  const render=()=>{
    if(user.role==="vendor") switch(section){
      case "profile":   return <VendorProfile user={user}/>;
      case "invoice":   return <VendorInvoice user={user} invoices={invoices} setInvoices={setInvoices} drillInvoiceNo={drillInvoiceNo} onClearDrill={()=>setDrillInvoiceNo("")}/>;
      case "quotation": return <VendorQuotation user={user} quotations={quotations} setQuotations={setQuotations} rfqs={rfqs}/>;
      default:          return <VendorHome user={user} invoices={invoices} quotations={quotations} rfqs={rfqs} setSection={setSection} onDrillInvoice={(no:string)=>drillInvoice(no,"invoice")}/>;
    }
    if(user.role==="approver") switch(section){
      case "apr-rfq":       return <ApproverRfq rfqs={rfqs} setRfqs={setRfqs} quotations={quotations} setQuotations={setQuotations} user={user}/>;
      case "apr-quotation": return <ApproverQuotation quotations={quotations} setQuotations={setQuotations} rfqs={rfqs} user={user}/>;
      default:              return <ApproverHome user={user} quotations={quotations} setQuotations={setQuotations} rfqs={rfqs} setRfqs={setRfqs} setSection={setSection}/>;
    }
    if(user.role==="director") switch(section){
      case "dir-rfq": return <DirectorRfq rfqs={rfqs} quotations={quotations} user={user} setRfqs={setRfqs}/>;
      default:        return <DirectorHome user={user} rfqs={rfqs} quotations={quotations} setSection={setSection}/>;
    }
    switch(section){
      case "brm-invoice":   return <BrmInvoice invoices={invoices} setInvoices={setInvoices} drillInvoiceNo={drillInvoiceNo} onClearDrill={()=>setDrillInvoiceNo("")}/>;
      case "brm-quotation": return <BrmQuotation quotations={quotations} setQuotations={setQuotations} rfqs={rfqs}/>;
      case "brm-rfq":       return <BrmRfq rfqs={rfqs} setRfqs={setRfqs} quotations={quotations} user={user}/>;
      default:              return <BrmHome user={user} invoices={invoices} quotations={quotations} rfqs={rfqs} setSection={setSection} onDrillInvoice={(no:string)=>drillInvoice(no,"brm-invoice")}/>;
    }
  };
  return (
    <ErrorBoundary>
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'72','72full',Arial,Helvetica,sans-serif",fontSize:14,color:C.t1}}>
      <Shell user={user} onLogout={logout} section={section} setSection={setSection} onOpenSettings={()=>setShowSettings(true)}/>
      {showSettings&&<SettingsModal settings={settings} onUpdate={updateSettings} onClose={()=>setShowSettings(false)} theme={theme} onThemeChange={changeTheme} user={user}/>}
      <div style={{minHeight:"calc(100vh - 46px)"}}>{render()}</div>
      <div style={{textAlign:"center",padding:"14px 0",fontSize:12,color:C.t2,borderTop:`1px solid ${C.border}`,background:C.card,marginTop:20}}>
        BRM Vendor Portal · Powered by SAP BTP & Accenture · © 2025 BRM
      </div>
    </div>
    </ErrorBoundary>
  );
}
