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
const Shell = ({user,onLogout,section,setSection,theme,onToggleTheme,onOpenSettings}) => {
  const [menuOpen,setMenuOpen]=useState(false);
  const [avatarOpen,setAvatarOpen]=useState(false);
  const ac=avtColor(user.id); const ini=avtIni(user.name);
  const nav=user.role==="vendor"
    ?[{id:"dashboard",l:"Home"},{id:"profile",l:"Profile"},{id:"invoice",l:"Invoice"},{id:"quotation",l:"Quotation"}]
    :[{id:"dashboard",l:"Home"},{id:"brm-invoice",l:"Invoice Mgmt"},{id:"brm-quotation",l:"Quotation Mgmt"},{id:"brm-rfq",l:"RFQ Mgmt"}];
  const isMob=mob();
  return (
    <div style={{background:C.shell,color:"#fff",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
      <div style={{display:"flex",alignItems:"center",padding:"0 16px",height:48}}>
        <div style={{fontWeight:800,fontSize:isMob?13:15,marginRight:isMob?10:24,whiteSpace:"nowrap",letterSpacing:.2,flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
          <SapIcon name="grid" size={18} color="rgba(255,255,255,0.65)"/>
          <span style={{color:"#fff",fontWeight:700}}>{isMob?"BRM Portal":"BRM Vendor Portal"}</span>
        </div>
        {!isMob&&(
          <div style={{display:"flex",gap:0,flex:1}}>
            {nav.map(n=>(
              <button key={n.id} onClick={()=>setSection(n.id)} style={{
                background:section===n.id?C.shellHov:"transparent",
                color:section===n.id?"#fff":"rgba(255,255,255,0.75)",border:"none",cursor:"pointer",padding:"0 16px",height:48,fontFamily:"inherit",
                fontSize:13,fontWeight:section===n.id?600:400,whiteSpace:"nowrap",
                borderBottom:`2px solid ${section===n.id?"rgba(255,255,255,0.9)":"transparent"}`,
                transition:"background .15s,color .15s",
              }}>{n.l}</button>
            ))}
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:isMob?0:10,flex:isMob?1:0,justifyContent:"flex-end"}}>
          <button onClick={onToggleTheme} title="Toggle theme" style={{background:"rgba(255,255,255,0.12)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",borderRadius:4,width:32,height:32,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}><SapIcon name={theme==="dark"?"brightness-high":"night-mode"} size={14} color="#fff"/></button>
          {!isMob&&<button onClick={onOpenSettings} title="Settings" style={{background:"rgba(255,255,255,0.12)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",borderRadius:4,width:32,height:32,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}><SapIcon name="action-settings" size={14} color="#fff"/></button>}
          {!isMob&&<div style={{textAlign:"right",marginLeft:4}}><div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.95)"}}>{user.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.55)"}}>{user.role==="vendor"?"Supplier":"BRM Employee"}</div></div>}
          <div style={{position:"relative"}}>
            <button onClick={()=>setAvatarOpen(o=>!o)} title={user.name} aria-label={`User menu: ${user.name}`} aria-expanded={avatarOpen} style={{width:36,height:36,borderRadius:"50%",background:ac.bg,border:`2px solid ${avatarOpen?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.35)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:ac.fg,cursor:"pointer",padding:0,outline:"none",flexShrink:0,transition:"border-color .15s,box-shadow .15s",boxShadow:avatarOpen?"0 0 0 3px rgba(255,255,255,0.22)":"none"}}>{ini}</button>
            {avatarOpen&&<>
              <div onClick={()=>setAvatarOpen(false)} style={{position:"fixed",inset:0,zIndex:299}}/>
              <div style={{position:"absolute",top:44,right:0,background:C.card,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",minWidth:244,zIndex:300,overflow:"hidden"}}>
                <div style={{padding:"20px 20px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,background:C.subtle,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{width:64,height:64,borderRadius:"50%",background:ac.bg,border:`2px solid ${ac.fg}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700,color:ac.fg,letterSpacing:.5}}>{ini}</div>
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
          {isMob&&<button onClick={()=>setMenuOpen(o=>!o)} style={{background:"rgba(255,255,255,0.12)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",borderRadius:4,width:32,height:32,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>☰</button>}
        </div>
      </div>
      {isMob&&menuOpen&&(
        <div style={{background:C.shell,borderTop:"1px solid rgba(255,255,255,0.12)",paddingBottom:6}}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>{setSection(n.id);setMenuOpen(false);}} style={{display:"block",width:"100%",textAlign:"left",background:section===n.id?C.shellHov:"transparent",color:"#fff",border:"none",cursor:"pointer",padding:"12px 20px",fontFamily:"inherit",fontSize:14,fontWeight:section===n.id?700:400,borderLeft:`3px solid ${section===n.id?"#F0A500":"transparent"}`}}>{n.l}</button>
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
const SettingsModal = ({settings,onUpdate,onClose}) => {
  const btnStyle = (active) => ({
    display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:8,
    borderRadius:6,border:`2px solid ${active?C.primary:C.border}`,
    background:active?C.infoBg:C.card,cursor:"pointer",width:"100%",textAlign:"left" as const,
    fontFamily:"inherit",
  });
  const NUM_FMTS = [
    {v:"comma", sample:"1,234,567.89", desc:"Comma — thousand separator, dot — decimal"},
    {v:"dot",   sample:"1.234.567,89", desc:"Dot — thousand separator, comma — decimal"},
  ];
  const DATE_FMTS = [
    {v:"YYYY-MM-DD", ex:"2025-06-25"},
    {v:"DD/MM/YYYY", ex:"25/06/2025"},
    {v:"MM/DD/YYYY", ex:"06/25/2025"},
    {v:"DD.MM.YYYY", ex:"25.06.2025"},
    {v:"MM.DD.YYYY", ex:"06.25.2025"},
    {v:"DD-MM-YYYY", ex:"25-06-2025"},
    {v:"YYYY/MM/DD", ex:"2025/06/25"},
  ];
  return (
    <Modal title="Settings" onClose={onClose} width={520}>
      <div style={{marginBottom:6,fontWeight:700,fontSize:14,color:C.t1}}>Number Format</div>
      <div style={{fontSize:13,color:C.t2,marginBottom:12}}>Controls thousand and decimal separators for all amounts.</div>
      {NUM_FMTS.map(f=>(
        <button key={f.v} style={btnStyle(settings.numFmt===f.v)} onClick={()=>onUpdate({numFmt:f.v})}>
          <input type="radio" readOnly checked={settings.numFmt===f.v} style={{accentColor:C.primary,flexShrink:0}}/>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:C.t1,fontFamily:"monospace"}}>{f.sample}</div>
            <div style={{fontSize:11,color:C.t2,marginTop:2}}>{f.desc}</div>
          </div>
        </button>
      ))}
      <Sep/>
      <div style={{marginBottom:6,fontWeight:700,fontSize:14,color:C.t1}}>Date Format</div>
      <div style={{fontSize:13,color:C.t2,marginBottom:12}}>Controls how dates are displayed across the portal.</div>
      <div style={{display:"grid",gridTemplateColumns:g2(),gap:8}}>
        {DATE_FMTS.map(f=>(
          <button key={f.v} style={{...btnStyle(settings.dateFmt===f.v),flexDirection:"column",alignItems:"flex-start",gap:2}} onClick={()=>onUpdate({dateFmt:f.v})}>
            <div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}>
              <input type="radio" readOnly checked={settings.dateFmt===f.v} style={{accentColor:C.primary,flexShrink:0}}/>
              <span style={{fontWeight:700,fontSize:12,color:C.t1,fontFamily:"monospace"}}>{f.v}</span>
            </div>
            <div style={{fontSize:11,color:C.t2,paddingLeft:24}}>{f.ex}</div>
          </button>
        ))}
      </div>
    </Modal>
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
  const toggleTheme=()=>{const n=theme==="dark"?"light":"dark";applyTheme(n);setTheme(n);};
  const [settings,setSettings]=useState({numFmt:"comma",dateFmt:"YYYY-MM-DD"});
  const [showSettings,setShowSettings]=useState(false);
  const updateSettings=s=>{const n={...settings,...s};applySettings(n);setSettings(n);};
  const [invoices,setInvoices]=useState(INIT_INV);
  const [quotations,setQuotations]=useState(INIT_QT);
  const [rfqs,setRfqs]=useState(INIT_RFQS);
  const [,setVpw]=useState(window.innerWidth);
  useEffect(()=>{const h=()=>{VP.w=window.innerWidth;setVpw(window.innerWidth);};window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  const login=u=>{setUser(u);setSection("dashboard");};
  const logout=()=>{setUser(null);setSection("dashboard");};
  if(!user) return <ErrorBoundary><Login onLogin={login}/></ErrorBoundary>;
  const render=()=>{
    if(user.role==="vendor") switch(section){
      case "profile":   return <VendorProfile user={user}/>;
      case "invoice":   return <VendorInvoice user={user} invoices={invoices} setInvoices={setInvoices}/>;
      case "quotation": return <VendorQuotation user={user} quotations={quotations} setQuotations={setQuotations} rfqs={rfqs}/>;
      default:          return <VendorHome user={user} invoices={invoices} quotations={quotations} rfqs={rfqs} setSection={setSection}/>;
    }
    switch(section){
      case "brm-invoice":   return <BrmInvoice invoices={invoices} setInvoices={setInvoices}/>;
      case "brm-quotation": return <BrmQuotation quotations={quotations} setQuotations={setQuotations} rfqs={rfqs}/>;
      case "brm-rfq":       return <BrmRfq rfqs={rfqs} setRfqs={setRfqs} quotations={quotations}/>;
      default:              return <BrmHome user={user} invoices={invoices} quotations={quotations} rfqs={rfqs} setSection={setSection}/>;
    }
  };
  return (
    <ErrorBoundary>
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'72','72full',Arial,Helvetica,sans-serif",fontSize:14,color:C.t1}}>
      <Shell user={user} onLogout={logout} section={section} setSection={setSection} theme={theme} onToggleTheme={toggleTheme} onOpenSettings={()=>setShowSettings(true)}/>
      {showSettings&&<SettingsModal settings={settings} onUpdate={updateSettings} onClose={()=>setShowSettings(false)}/>}
      <div style={{minHeight:"calc(100vh - 46px)"}}>{render()}</div>
      <div style={{textAlign:"center",padding:"14px 0",fontSize:12,color:C.t2,borderTop:`1px solid ${C.border}`,background:C.card,marginTop:20}}>
        BRM Vendor Portal · Powered by SAP BTP & Accenture · © 2025 BRM
      </div>
    </div>
    </ErrorBoundary>
  );
}
