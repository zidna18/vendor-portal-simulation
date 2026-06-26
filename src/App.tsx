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
  const [username,setU]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [loading,setL]=useState(false); const [role,setRole]=useState("vendor");
  const go=()=>{
    setL(true);setErr("");
    setTimeout(()=>{
      const u=USERS.find(x=>x.username===username&&x.password===pw&&x.role===role);
      u?onLogin(u):(setErr("Invalid credentials. Please try again."),setL(false));
    },700);
  };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(150deg,#1a2a3d 0%,#354a5f 50%,#2c4a6a 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <div style={{marginBottom:32,textAlign:"center",color:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
          <SapIcon name="grid" size={22} color="rgba(255,255,255,0.6)"/>
          <span style={{fontSize:12,letterSpacing:3,color:"rgba(255,255,255,0.5)",fontWeight:600,textTransform:"uppercase"}}>SAP BTP · Accenture</span>
        </div>
        <div style={{fontSize:28,fontWeight:700,letterSpacing:.3,color:"#fff"}}>BRM Vendor Portal</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:6}}>End-to-end digital collaboration platform</div>
      </div>
      <div style={{background:"#fff",borderRadius:8,padding:mob()?"20px 24px":"32px 36px",width:mob()?"92%":400,maxWidth:400,boxShadow:"0 24px 64px rgba(0,0,0,0.4)"}}>
        <div style={{fontSize:20,fontWeight:700,color:"#1d2d3e",marginBottom:4}}>Sign In</div>
        <div style={{fontSize:13,color:"#6a6d70",marginBottom:22}}>Select your role and enter credentials</div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,color:"#6a6d70",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Login As</div>
          <div style={{display:"flex",gap:8}}>
            {[["vendor","factory","Vendor"],["brm","building","BRM Employee"]].map(([r,ico,lbl])=>(
              <button key={r} onClick={()=>setRole(r)} style={{flex:1,padding:"9px 0",borderRadius:4,cursor:"pointer",border:`2px solid ${role===r?"#0a6ed1":"#d9d9d9"}`,background:role===r?"#dff0fd":"#fff",color:role===r?"#0854a0":"#6a6d70",fontWeight:700,fontSize:13,fontFamily:"inherit",transition:"border-color .15s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><SapIcon name={ico} size={14} color={role===r?"#0854a0":"#6a6d70"}/>{lbl}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:"#6a6d70",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:5}}>Username</div>
          <Inp value={username} onChange={setU} placeholder="Enter username"/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,color:"#6a6d70",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:5}}>Password</div>
          <Inp value={pw} onChange={setPw} placeholder="Enter password" type="password"/>
        </div>
        {err&&<div style={{color:"#bb0000",fontSize:13,marginBottom:16,padding:"10px 12px",background:"#ffebeb",borderRadius:4,border:"1px solid #bb000030"}}>{err}</div>}
        <Btn onClick={go} disabled={loading} style={{width:"100%",padding:"10px 0",justifyContent:"center",fontSize:14,display:"flex",alignItems:"center",gap:6}}>{loading?"Signing in…":"Sign In"}</Btn>
        <div style={{marginTop:24,paddingTop:18,borderTop:"1px solid #d9d9d9"}}>
          <div style={{fontSize:11,color:"#6a6d70",fontWeight:700,marginBottom:10,letterSpacing:.6,textTransform:"uppercase"}}>Quick Demo Access</div>
          {[["vendor1","factory","PT Maju Bersama"],["vendor2","factory","CV Sukses Mandiri"],["brm.user","building","Ahmad Rizki – Procurement Mgr"]].map(([u,ico,lbl])=>(
            <button key={u} onClick={()=>onLogin(USERS.find(x=>x.username===u))} style={{display:"flex",alignItems:"center",gap:7,width:"100%",textAlign:"left",padding:"8px 12px",marginBottom:6,borderRadius:4,border:"1px solid #d9d9d9",background:"#f7f7f7",cursor:"pointer",fontSize:13,fontFamily:"inherit",color:"#1d2d3e",transition:"background .12s"}}><SapIcon name={ico} size={13} color="#6a6d70"/>{lbl}</button>
          ))}
        </div>
      </div>
      <div style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginTop:24,letterSpacing:.3}}>© 2025 BRM · Accenture · SAP BTP Public Cloud</div>
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
