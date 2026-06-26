import { useState, useEffect } from "react";
import {
  C, VENDORS,
  fmtDate, pg, g2,
  Badge, Card, Lbl, Val, SapIcon,
} from "./shared";

// ── Vendor Profile ─────────────────────────────────────────────
export const VendorProfile = ({user}) => {
  const [loading,setL]=useState(true);
  useEffect(()=>{setTimeout(()=>setL(false),700);},[]);
  const v=VENDORS[user.vendorId];
  if(loading) return <div style={{padding:60,textAlign:"center",color:C.t2,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><SapIcon name="time-entry-request" size={16} color={C.t2}/> Fetching data from SAP Business Partner API (A_BusinessPartner)…</div>;
  return (
    <div style={{padding:pg(),maxWidth:960,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:C.t1}}>Vendor Profile</div>
          <div style={{fontSize:12,color:C.t2,marginTop:4}}>📡 OData: /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('{v.id}')</div>
        </div>
        <Badge s={v.status}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:g2(),gap:16}}>
        <Card>
          <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>Company Information</div>
          {[["Business Partner ID",v.id],["Legal Name",v.name],["Tax ID (NPWP)",v.tax],["Category",v.cat],["Vendor Since",fmtDate(v.since)],["PIC / Representative",v.rep]].map(([l,val])=>(
            <div key={l} style={{marginBottom:14}}><Lbl>{l}</Lbl><Val>{val}</Val></div>
          ))}
        </Card>
        <div>
          <Card>
            <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>Contact & Address</div>
            {[["Registered Address",v.addr],["Phone",v.phone],["Email",v.email]].map(([l,val])=>(
              <div key={l} style={{marginBottom:14}}><Lbl>{l}</Lbl><Val>{val}</Val></div>
            ))}
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:14,color:C.primary,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>Bank Account</div>
            {[["Bank Name",v.bank.name],["Account Number",v.bank.acc],["Account Holder",v.bank.aname]].map(([l,val])=>(
              <div key={l} style={{marginBottom:14}}><Lbl>{l}</Lbl><Val>{val}</Val></div>
            ))}
          </Card>
        </div>
      </div>
      <div style={{padding:12,background:C.warnBg,borderRadius:6,border:`1px solid ${C.warn}33`,fontSize:12,color:C.t2}}>
        ℹ️ <strong style={{color:C.warn}}>Read-only view.</strong> Vendor master data is managed directly in SAP S/4HANA Public Cloud. Changes must be submitted through the official vendor data change process.
      </div>
    </div>
  );
};
