import { useState, useEffect } from "react";
import {
  C, VENDORS, COMPANY_CODES, PURCH_ORGS,
  fmtDate, pg,
  Badge, SapIcon,
} from "./shared";

const Section = ({title,icon,children}:{title:string,icon:string,children:any}) => (
  <div style={{marginBottom:24}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,paddingBottom:10,borderBottom:`2px solid ${C.border}`}}>
      <SapIcon name={icon} size={16} color={C.primary}/>
      <span style={{fontSize:14,fontWeight:700,color:C.primary,letterSpacing:0.2,textTransform:"uppercase"}}>{title}</span>
    </div>
    {children}
  </div>
);

const Row = ({label,value,mono=false}:{label:string,value:any,mono?:boolean}) => (
  <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:16,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
    <div style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:0.8,paddingTop:2}}>{label}</div>
    <div style={{fontSize:14,color:C.t1,fontFamily:mono?"monospace":"inherit",fontWeight:mono?600:400}}>{value||"—"}</div>
  </div>
);

export const VendorProfile = ({user}) => {
  const [loading,setL]=useState(true);
  const [tab,setTab]=useState<"info"|"bank"|"tax"|"cc">("info");
  useEffect(()=>{setTimeout(()=>setL(false),700);},[]);
  const v=VENDORS[user.vendorId] as any;
  if(!v) return null;
  if(loading) return(
    <div style={{padding:60,textAlign:"center",color:C.t2,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
      <SapIcon name="time-entry-request" size={16} color={C.t2}/>
      Fetching data from SAP Business Partner API…
    </div>
  );

  const TK={hdrBg:"#f2f2f2",hdrBorder:"#e5e5e5",hdrText:"#6a6d70",rowBg:"#ffffff",rowBorder:"#e5e5e5"};

  const tabs=[
    {id:"info",  label:"General Information",      icon:"employee"},
    {id:"bank",  label:"Bank Accounts",             icon:"payment-approval"},
    {id:"tax",   label:"Tax & Compliance",          icon:"document-text"},
    {id:"cc",    label:"Company Code Assignment",   icon:"business-objects-experience"},
  ] as const;

  return(
    <div style={{padding:pg(),fontFamily:"'72','72full',Arial,Helvetica,sans-serif"}}>

      {/* Page header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.t1,marginBottom:4}}>Vendor Profile</div>
          <div style={{fontSize:12,color:C.t2,display:"flex",alignItems:"center",gap:5}}>
            <SapIcon name="connected" size={12} color={C.t2}/>
            OData: /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('{v.id}')
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Badge s={v.status}/>
        </div>
      </div>

      {/* Vendor identity strip */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"16px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:20,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <SapIcon name="employee" size={26} color="#fff"/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:18,fontWeight:700,color:C.t1}}>{v.name}</div>
          <div style={{fontSize:13,color:C.t2,marginTop:2}}>Vendor ID: <span style={{fontFamily:"monospace",fontWeight:600,color:C.t1}}>{v.id}</span> · {v.cat}</div>
          <div style={{fontSize:12,color:C.t2,marginTop:2}}>Registered since {fmtDate(v.since)} · Rep: {v.rep}</div>
        </div>
        <div style={{display:"flex",gap:24,flexShrink:0}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:C.t2,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Bank Accounts</div>
            <div style={{fontSize:20,fontWeight:700,color:C.primary}}>{(v.banks||[]).length}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:C.t2,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Tax Status</div>
            <Badge s={v.taxStatus||"Active"}/>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,marginBottom:20,background:C.card}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{display:"flex",alignItems:"center",gap:7,padding:"0 20px",height:44,background:"none",border:"none",
              borderBottom:`2px solid ${tab===t.id?C.primary:"transparent"}`,
              color:tab===t.id?C.primary:C.t2,fontSize:14,fontWeight:tab===t.id?700:400,
              cursor:"pointer",fontFamily:"inherit",transition:"color .12s",whiteSpace:"nowrap" as const}}>
            <SapIcon name={t.icon} size={14} color={tab===t.id?C.primary:C.t2}/>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: General Information */}
      {tab==="info"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {/* Company Information */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"20px 24px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <Section title="Company Information" icon="employee">
              <Row label="Business Partner ID" value={v.id} mono/>
              <Row label="Legal Name"           value={v.name}/>
              <Row label="Tax ID (NPWP)"        value={v.tax} mono/>
              <Row label="Category"             value={v.cat}/>
              <Row label="Vendor Since"         value={fmtDate(v.since)}/>
              <Row label="PIC / Representative" value={v.rep}/>
              {v.pkp&&<Row label="PKP Status"   value={v.pkp}/>}
              {v.website&&<Row label="Website"  value={v.website}/>}
            </Section>
          </div>
          {/* Contact & Address */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"20px 24px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            {(()=>{
              // Build address table rows from vendor data + mock additional addresses
              const mainCity=v.addr?.split(",")[1]?.trim()||"Jakarta";
              const addrRows=[
                {no:"0001",type:"HQ / Registered",default:true, street:v.addr, city:mainCity, postal:v.addr?.match(/\d{5}/)?.[0]||"10000", country:"Indonesia", phone:v.phone, fax:v.fax||"—", email:v.email},
                {no:"0002",type:"Billing Address",default:false, street:v.addr, city:mainCity, postal:v.addr?.match(/\d{5}/)?.[0]||"10000", country:"Indonesia", phone:v.phone, fax:v.fax||"—", email:"billing@"+v.email?.split("@")[1]},
                {no:"0003",type:"Warehouse / Delivery",default:false, street:"Jl. Industri Raya No. 88, Kawasan Industri Pulogadung", city:"Jakarta Timur", postal:"13920", country:"Indonesia", phone:v.phone?.replace("1234","9900"), fax:"—", email:"warehouse@"+v.email?.split("@")[1]},
                {no:"0004",type:"NPWP / Tax Office",default:false, street:v.npwpAddress||v.addr, city:mainCity, postal:v.addr?.match(/\d{5}/)?.[0]||"10000", country:"Indonesia", phone:v.phone, fax:"—", email:"tax@"+v.email?.split("@")[1]},
              ];
              const addrCols=["No.","Address Type","Street / Address","City","Postal","Country","Phone","Fax","Email","Default"];
              const colW=["48px","150px","auto","120px","70px","100px","130px","130px","200px","70px"];
              return(
                <div style={{marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,paddingBottom:10,borderBottom:`2px solid ${C.border}`}}>
                    <SapIcon name="map" size={16} color={C.primary}/>
                    <span style={{fontSize:14,fontWeight:700,color:C.primary,letterSpacing:0.2,textTransform:"uppercase"}}>Contact & Address</span>
                    <span style={{marginLeft:"auto",fontSize:11,color:C.t2,background:C.subtle,border:`1px solid ${C.border}`,borderRadius:3,padding:"2px 8px"}}>{addrRows.length} addresses</span>
                  </div>
                  <div style={{overflowX:"auto",border:`1px solid ${C.border}`,borderRadius:4}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,tableLayout:"fixed" as const}}>
                      <colgroup>{colW.map((w,i)=><col key={i} style={{width:w}}/>)}</colgroup>
                      <thead>
                        <tr style={{background:TK.hdrBg}}>
                          {addrCols.map(h=>(
                            <th key={h} style={{padding:"7px 10px",fontSize:11,fontWeight:700,color:TK.hdrText,textTransform:"uppercase" as const,letterSpacing:0.6,borderBottom:`1px solid ${TK.hdrBorder}`,textAlign:"left" as const,whiteSpace:"nowrap" as const}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {addrRows.map((a,i)=>(
                          <tr key={a.no} style={{background:i%2===0?TK.rowBg:C.subtle,borderBottom:`1px solid ${TK.rowBorder}`}}>
                            <td style={{padding:"8px 10px",fontFamily:"monospace",fontSize:12,color:C.t2}}>{a.no}</td>
                            <td style={{padding:"8px 10px",fontSize:13,fontWeight:600,color:C.t1,whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{a.type}</td>
                            <td style={{padding:"8px 10px",fontSize:13,color:C.t1}}>{a.street}</td>
                            <td style={{padding:"8px 10px",fontSize:13,color:C.t1,whiteSpace:"nowrap" as const}}>{a.city}</td>
                            <td style={{padding:"8px 10px",fontSize:13,color:C.t2,fontFamily:"monospace"}}>{a.postal}</td>
                            <td style={{padding:"8px 10px",fontSize:13,color:C.t1}}>{a.country}</td>
                            <td style={{padding:"8px 10px",fontSize:12,color:C.t1,fontFamily:"monospace"}}>{a.phone}</td>
                            <td style={{padding:"8px 10px",fontSize:12,color:a.fax==="—"?C.t2:C.t1,fontFamily:"monospace"}}>{a.fax}</td>
                            <td style={{padding:"8px 10px",fontSize:12,color:"#0854a0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{a.email}</td>
                            <td style={{padding:"8px 10px",textAlign:"center" as const}}>
                              {a.default&&<span style={{display:"inline-block",background:"#e8f4e8",color:"#256025",border:"1px solid #9dd89d",borderRadius:3,fontSize:10,fontWeight:700,padding:"1px 7px",letterSpacing:0.4}}>DEFAULT</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{marginTop:12,borderTop:`1px solid ${C.border}`,paddingTop:12,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px 24px"}}>
                    {[
                      {label:"Primary Contact",value:v.rep},
                      {label:"Main Phone",    value:v.phone},
                      {label:"Main Email",    value:v.email},
                      {label:"Website",       value:v.website||"—"},
                      {label:"Fax",           value:v.fax||"—"},
                      {label:"Language",      value:"Indonesian (ID)"},
                    ].map(r=>(
                      <div key={r.label} style={{display:"flex",gap:8,alignItems:"baseline"}}>
                        <span style={{fontSize:11,fontWeight:700,color:C.t2,textTransform:"uppercase" as const,letterSpacing:0.7,minWidth:110,flexShrink:0}}>{r.label}</span>
                        <span style={{fontSize:13,color:C.t1}}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tab: Bank Accounts */}
      {tab==="bank"&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14,fontWeight:700,color:C.t1}}>Bank Accounts</span>
              <span style={{fontSize:12,color:C.t2}}>({(v.banks||[]).length})</span>
            </div>
            <div style={{fontSize:12,color:C.t2,display:"flex",alignItems:"center",gap:5}}>
              <SapIcon name="locked" size={12} color={C.t2}/>
              Read-only — managed in SAP S/4HANA
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:TK.hdrBg,height:36}}>
                  {["#","Bank Name","Branch","Account Number","Account Holder","Currency","SWIFT / BIC","Primary"].map(h=>(
                    <th key={h} style={{padding:"0 14px",textAlign:"left",fontSize:11,fontWeight:700,color:TK.hdrText,borderBottom:`1px solid ${TK.hdrBorder}`,whiteSpace:"nowrap" as const,letterSpacing:.3,textTransform:"uppercase" as const}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(v.banks||[]).map((b,i)=>(
                  <tr key={b.no} style={{background:i%2===0?TK.rowBg:"#fafafa",height:48,borderBottom:`1px solid ${TK.rowBorder}`}}>
                    <td style={{padding:"0 14px",color:C.t2,fontSize:12}}>{b.no}</td>
                    <td style={{padding:"0 14px",fontWeight:600,color:C.t1}}>{b.name}</td>
                    <td style={{padding:"0 14px",color:C.t2}}>{b.branch}</td>
                    <td style={{padding:"0 14px",fontFamily:"monospace",fontWeight:700,color:C.t1,letterSpacing:.5}}>{b.acc}</td>
                    <td style={{padding:"0 14px",color:C.t1}}>{b.aname}</td>
                    <td style={{padding:"0 14px"}}>
                      <span style={{background:C.infoBg,color:C.info,border:`1px solid ${C.info}30`,borderRadius:3,padding:"2px 8px",fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{b.currency}</span>
                    </td>
                    <td style={{padding:"0 14px",fontFamily:"monospace",fontSize:12,color:C.t2}}>{b.swift}</td>
                    <td style={{padding:"0 14px",textAlign:"center"}}>
                      {b.primary
                        ? <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#ecf8f0",color:"#107e3e",border:"1px solid #b7dfcc",borderRadius:10,padding:"2px 10px",fontSize:11,fontWeight:700}}><SapIcon name="accept" size={10} color="#107e3e"/>Primary</span>
                        : <span style={{color:C.t2,fontSize:12}}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tax & Compliance */}
      {tab==="tax"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"20px 24px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <Section title="Tax Registration" icon="document-text">
              <Row label="NPWP Number"       value={v.tax} mono/>
              <Row label="NPWP Address"      value={v.npwpAddress}/>
              <Row label="PKP Status"        value={v.pkp}/>
              <Row label="Tax Status"        value={v.taxStatus}/>
              <Row label="Certificate Expiry" value={v.certExpiry?fmtDate(v.certExpiry):"—"}/>
            </Section>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"20px 24px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <Section title="Compliance Status" icon="official-service">
              <Row label="Vendor Status"     value={v.status}/>
              <Row label="Category"          value={v.cat}/>
              <Row label="Registered Since"  value={fmtDate(v.since)}/>
              <Row label="PIC / Contact"     value={v.rep}/>
            </Section>
          </div>
        </div>
      )}

      {/* Tab: Company Code Assignment */}
      {tab==="cc"&&(()=>{
        const lfb1 = v.lfb1||[];
        const lfm1 = v.lfm1||[];
        const thSt:any={padding:"0 14px",textAlign:"left",fontSize:11,fontWeight:700,color:TK.hdrText,borderBottom:`1px solid ${TK.hdrBorder}`,whiteSpace:"nowrap",letterSpacing:.3,textTransform:"uppercase",height:36};
        const tdSt:any=(i)=>({padding:"0 14px",fontSize:13,height:46,borderBottom:`1px solid ${TK.rowBorder}`,background:i%2===0?TK.rowBg:"#fafafa"});
        const chip=(txt,c,bg)=><span style={{display:"inline-block",padding:"2px 8px",borderRadius:3,fontSize:11,fontWeight:700,color:c,background:bg,border:`1px solid ${c}33`}}>{txt}</span>;
        return(
          <div style={{display:"flex",flexDirection:"column" as const,gap:20}}>

            {/* LFB1 */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <SapIcon name="building" size={15} color={C.primary}/>
                  <span style={{fontSize:14,fontWeight:700,color:C.t1}}>LFB1 — Vendor per Company Code</span>
                  <span style={{fontSize:12,color:C.t2}}>({lfb1.length} assignment{lfb1.length!==1?"s":""})</span>
                </div>
                <span style={{fontSize:12,color:C.t2,display:"flex",alignItems:"center",gap:5}}>
                  <SapIcon name="locked" size={12} color={C.t2}/>Table: LFB1
                </span>
              </div>
              <div style={{overflowX:"auto" as const}}>
                <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:13}}>
                  <thead>
                    <tr style={{background:TK.hdrBg}}>
                      {["Company Code","Company Name","Recon. Account","Reconciliation Acct Name","Payment Terms","Pmt Method","Accounting Clerk","Check Dbl Inv","Planning Grp"].map(h=><th key={h} style={thSt}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {lfb1.map((r,i)=>{
                      const cc=COMPANY_CODES.find(c=>c.v===r.bukrs);
                      return(
                        <tr key={r.bukrs}>
                          <td style={tdSt(i)}><span style={{fontFamily:"monospace",fontWeight:700,color:C.primary}}>{r.bukrs}</span></td>
                          <td style={tdSt(i)}>{cc?.l||r.bukrs}</td>
                          <td style={tdSt(i)}><span style={{fontFamily:"monospace",color:C.t1,fontWeight:600}}>{r.akont}</span></td>
                          <td style={tdSt(i)}><span style={{color:C.t2}}>{r.reconcAcct}</span></td>
                          <td style={tdSt(i)}><span style={{fontFamily:"monospace",fontWeight:600}}>{r.zterm}</span></td>
                          <td style={tdSt(i)}><span style={{fontFamily:"monospace",color:C.t1}}>{r.zwels}</span></td>
                          <td style={tdSt(i)}>{r.busab}</td>
                          <td style={tdSt(i)}>{r.reprf?chip("Yes",C.ok,C.okBg):chip("No",C.t2,"#f4f4f4")}</td>
                          <td style={tdSt(i)}>{r.fdgrp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LFM1 */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <SapIcon name="customer-order-entry" size={15} color={C.primary}/>
                  <span style={{fontSize:14,fontWeight:700,color:C.t1}}>LFM1 — Vendor per Purchasing Org</span>
                  <span style={{fontSize:12,color:C.t2}}>({lfm1.length} assignment{lfm1.length!==1?"s":""})</span>
                </div>
                <span style={{fontSize:12,color:C.t2,display:"flex",alignItems:"center",gap:5}}>
                  <SapIcon name="locked" size={12} color={C.t2}/>Table: LFM1
                </span>
              </div>
              <div style={{overflowX:"auto" as const}}>
                <table style={{width:"100%",borderCollapse:"collapse" as const,fontSize:13}}>
                  <thead>
                    <tr style={{background:TK.hdrBg}}>
                      {["Purch. Org","Purch. Org Name","Company Code","Order Currency","Payment Terms","Incoterms","Incoterms Location","Min. Order Value","Salesperson","Telephone","Auto PO"].map(h=><th key={h} style={thSt}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {lfm1.map((r,i)=>{
                      const po=PURCH_ORGS.find(p=>p.v===r.ekorg);
                      const cc=COMPANY_CODES.find(c=>c.v===r.bukrs);
                      return(
                        <tr key={r.ekorg}>
                          <td style={tdSt(i)}><span style={{fontFamily:"monospace",fontWeight:700,color:C.primary}}>{r.ekorg}</span></td>
                          <td style={tdSt(i)}>{po?.l||r.ekorg}</td>
                          <td style={tdSt(i)}><span style={{fontFamily:"monospace",fontWeight:600}}>{r.bukrs}</span> <span style={{color:C.t2,fontSize:12}}>{cc?.l}</span></td>
                          <td style={tdSt(i)}><span style={{background:C.infoBg,color:C.info,border:`1px solid ${C.info}30`,borderRadius:3,padding:"2px 7px",fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{r.waers}</span></td>
                          <td style={tdSt(i)}><span style={{fontFamily:"monospace",fontWeight:600}}>{r.zterm}</span></td>
                          <td style={tdSt(i)}><span style={{fontFamily:"monospace"}}>{r.inco1}</span></td>
                          <td style={tdSt(i)}>{r.inco2}</td>
                          <td style={tdSt(i)}>{r.minbw>0?new Intl.NumberFormat("id-ID").format(r.minbw)+" IDR":"—"}</td>
                          <td style={tdSt(i)}>{r.verkf}</td>
                          <td style={tdSt(i)}><span style={{color:C.t2,fontSize:12}}>{r.telf1}</span></td>
                          <td style={tdSt(i)}>{r.autom?chip("Yes",C.ok,C.okBg):chip("No",C.t2,"#f4f4f4")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        );
      })()}

      {/* Read-only notice */}
      <div style={{marginTop:20,padding:"10px 14px",background:C.warnBg,borderRadius:4,border:`1px solid ${C.warn}33`,fontSize:12,color:C.t2,display:"flex",alignItems:"flex-start",gap:8}}>
        <SapIcon name="message-information" size={14} color={C.warn} style={{flexShrink:0,marginTop:1}}/>
        <span><strong style={{color:C.warn}}>Read-only view.</strong> Vendor master data is managed directly in SAP S/4HANA Public Cloud. Changes must be submitted through the official vendor data change process.</span>
      </div>
    </div>
  );
};
