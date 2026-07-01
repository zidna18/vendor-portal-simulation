import { useState, useEffect, Component } from "react";
import {
  C, USERS, INIT_INV, INIT_QT, INIT_RFQS,
  VP, applyTheme, applySettings,
  mob, avtColor, avtIni,
  Btn, Inp, Sep, Modal, SapIcon,
  g2, pg,
} from "./shared";
import { VendorInvoice, BrmInvoice } from "./InvoicePages";
import { VendorQuotation, BrmQuotation, BrmRfq } from "./QuotationRfqPages";
import { VendorHome, BrmHome } from "./HomePages";
import { VendorProfile } from "./VendorProfile";

// ── Shell Bar ──────────────────────────────────────────────────
const relTime=(t:number)=>{const s=Math.floor((Date.now()-t)/1000);if(s<60)return"just now";if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`;};
const Shell = ({user,onLogout,section,setSection,onOpenSettings,notifs=[],onMarkRead,onMarkAllRead}:any) => {
  const [menuOpen,setMenuOpen]=useState(false);
  const [avatarOpen,setAvatarOpen]=useState(false);
  const [notifOpen,setNotifOpen]=useState(false);
  const ac=avtColor(user.id); const ini=avtIni(user.name);
  const myNotifs=(notifs as any[]).filter(n=>user.role==="vendor"?n.forRole==="vendor"&&(!n.forVendorId||n.forVendorId===user.vendorId):n.forRole==="brm");
  const unread=myNotifs.filter(n=>!n.read).length;
  const nav=user.role==="vendor"
    ?[{id:"dashboard",l:"Home"},{id:"profile",l:"Profile"},{id:"invoice",l:"Invoice"},{id:"quotation",l:"Quotation"}]
    :[{id:"dashboard",l:"Home"},{id:"brm-invoice",l:"Invoice Mgmt"},{id:"brm-quotation",l:"Quotation Mgmt"},{id:"brm-rfq",l:"RFQ Mgmt"}];
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

          {/* Notification bell */}
          <div style={{position:"relative"}}>
            <button onClick={()=>{setNotifOpen(o=>!o);setAvatarOpen(false);}} title="Notifications" aria-label="Notifications"
              style={{width:36,height:36,borderRadius:"50%",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0,transition:"background .1s"}}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.1)")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <SapIcon name="bell" size={16} color="rgba(255,255,255,0.75)"/>
              {unread>0&&<span style={{position:"absolute",top:5,right:5,minWidth:16,height:16,borderRadius:8,background:"#e9730c",border:"2px solid #354a5f",fontSize:9,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,padding:"0 3px"}}>{unread>9?"9+":unread}</span>}
            </button>
            {notifOpen&&<>
              <div onClick={()=>setNotifOpen(false)} style={{position:"fixed",inset:0,zIndex:299}}/>
              <div style={{position:"absolute",top:42,right:-8,width:380,background:C.card,borderRadius:6,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",zIndex:300,overflow:"hidden",maxHeight:"80vh",display:"flex",flexDirection:"column",fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>
                {/* Panel header */}
                <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                  <span style={{fontSize:15,fontWeight:700,color:C.t1}}>Notifications</span>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    {unread>0&&<button onClick={()=>onMarkAllRead?.()} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:C.primary,fontFamily:"inherit",padding:0}}>Mark All Read</button>}
                    <button onClick={()=>setNotifOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.t2,fontSize:18,lineHeight:1,padding:0,display:"flex",alignItems:"center"}}>×</button>
                  </div>
                </div>
                {/* Panel body */}
                {myNotifs.length===0?(
                  <div style={{padding:"48px 24px 40px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                    <div style={{width:72,height:72,borderRadius:"50%",background:C.subtle,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4}}>
                      <SapIcon name="bell" size={32} color={C.border}/>
                    </div>
                    <div style={{fontSize:14,fontWeight:600,color:C.t1}}>You don't have any new notifications</div>
                    <div style={{fontSize:13,color:C.t2}}>Check back again later.</div>
                  </div>
                ):(
                  <div style={{overflowY:"auto",flex:1}}>
                    {myNotifs.map((n:any)=>(
                      <div key={n.id} onClick={()=>{onMarkRead?.(n.id);}}
                        style={{display:"flex",gap:12,padding:"12px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:n.read?"transparent":"#fef6ee",transition:"background .1s",borderLeft:n.read?"3px solid transparent":`3px solid ${C.primary}`}}
                        onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
                        onMouseLeave={e=>(e.currentTarget.style.background=n.read?"transparent":"#fef6ee")}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:`${n.iconColor||C.primary}18`,border:`1px solid ${n.iconColor||C.primary}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                          <SapIcon name={n.icon||"bell"} size={16} color={n.iconColor||C.primary}/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:6}}>
                            <div style={{fontSize:13,fontWeight:n.read?400:700,color:C.t1,lineHeight:1.3,wordBreak:"break-word"}}>{n.title}</div>
                            {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:C.primary,flexShrink:0,marginTop:4}}/>}
                          </div>
                          <div style={{fontSize:12,color:C.t2,marginTop:3,lineHeight:1.45}}>{n.desc}</div>
                          <div style={{fontSize:11,color:C.t2,marginTop:5}}>{relTime(n.time)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>}
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
                    <div style={{fontSize:12,color:C.t2}}>{user.role==="vendor"?"Supplier":"BRM Employee"}</div>
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
            <span style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{user.name} · {user.role==="vendor"?"Supplier":"BRM"}</span>
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
              {[["vendor1","PT Maju Bersama","Vendor"],["vendor2","CV Sukses Mandiri","Vendor"],["brm.user","Ahmad Rizki","BRM Employee"],["buyer1","Siti Rahma","BRM Employee"]].map(([u,name,roleLabel])=>(
                <button key={u} onClick={()=>quickLogin(u)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",textAlign:"left",padding:"7px 10px",borderRadius:3,border:"1px solid #e5e5e5",background:"#fafafa",cursor:"pointer",fontSize:12,fontFamily:"inherit",color:"#1d2d3e"}}>
                  <SapIcon name={roleLabel==="Vendor"?"factory":"employee"} size={12} color="#6a6d70"/>
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
            <div style={{fontSize:13,color:C.t2,marginTop:3}}>{user?.role==="vendor"?"Supplier":"BRM Employee"}</div>
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
          {["Theme","Display Settings"].map((t,i)=>(
            <div key={t} style={{padding:"8px 16px",fontSize:13,fontWeight:600,color:i===0?C.primary:C.t2,borderBottom:i===0?`2px solid ${C.primary}`:"2px solid transparent",cursor:"pointer",marginBottom:-1}}>{t}</div>
          ))}
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
  const [drillInvoiceNo,setDrillInvoiceNo]=useState("");
  const [drillBrmInvoiceNo,setDrillBrmInvoiceNo]=useState("");
  const [notifs,setNotifs]=useState<any[]>([]);
  const addNotif=(n:any)=>setNotifs(p=>[{...n,id:`N-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,time:Date.now(),read:false},...p]);
  const markRead=(id:string)=>setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n));
  const markAllRead=()=>setNotifs(p=>p.map(n=>({...n,read:true})));
  const [,setVpw]=useState(window.innerWidth);
  useEffect(()=>{const h=()=>{VP.w=window.innerWidth;setVpw(window.innerWidth);};window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const login=u=>{setUser(u);setSection("dashboard");};
  const logout=()=>{setUser(null);setSection("dashboard");};
  if(!user) return <ErrorBoundary><Login onLogin={login}/></ErrorBoundary>;
  const render=()=>{
    if(user.role==="vendor") switch(section){
      case "profile":   return <VendorProfile user={user}/>;
      case "invoice":   return <VendorInvoice user={user} invoices={invoices} setInvoices={setInvoices} drillInvoiceNo={drillInvoiceNo} onClearDrill={()=>setDrillInvoiceNo("")} addNotif={addNotif}/>;
      case "quotation": return <VendorQuotation user={user} quotations={quotations} setQuotations={setQuotations} rfqs={rfqs}/>;
      default:          return <VendorHome user={user} invoices={invoices} quotations={quotations} rfqs={rfqs} setSection={setSection} onDrillInvoice={setDrillInvoiceNo}/>;
    }
    switch(section){
      case "brm-invoice":   return <BrmInvoice invoices={invoices} setInvoices={setInvoices} drillInvoiceNo={drillBrmInvoiceNo} onClearDrill={()=>setDrillBrmInvoiceNo("")} addNotif={addNotif}/>;
      case "brm-quotation": return <BrmQuotation quotations={quotations} setQuotations={setQuotations} rfqs={rfqs}/>;
      case "brm-rfq":       return <BrmRfq rfqs={rfqs} setRfqs={setRfqs} quotations={quotations}/>;
      default:              return <BrmHome user={user} invoices={invoices} quotations={quotations} rfqs={rfqs} setSection={setSection} onDrillInvoice={(no)=>{setDrillBrmInvoiceNo(no);setSection("brm-invoice");}}/>;
    }
  };
  return (
    <ErrorBoundary>
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'72','72full',Arial,Helvetica,sans-serif",fontSize:14,color:C.t1}}>
      <Shell user={user} onLogout={logout} section={section} setSection={setSection} onOpenSettings={()=>setShowSettings(true)} notifs={notifs} onMarkRead={markRead} onMarkAllRead={markAllRead}/>
      {showSettings&&<SettingsModal settings={settings} onUpdate={updateSettings} onClose={()=>setShowSettings(false)} theme={theme} onThemeChange={changeTheme} user={user}/>}
      <div style={{minHeight:"calc(100vh - 46px)"}}>{render()}</div>
      <div style={{textAlign:"center",padding:"14px 0",fontSize:12,color:C.t2,borderTop:`1px solid ${C.border}`,background:C.card,marginTop:20}}>
        BRM Vendor Portal · Powered by SAP BTP & Accenture · © 2025 BRM
      </div>
    </div>
    </ErrorBoundary>
  );
}
