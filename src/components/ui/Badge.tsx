import { C, STC } from "../../theme";
import { SapIcon } from "./SapIcon";

// SAP Fiori Avatar – 10 accent color variants (Quartz Light design tokens)
export const AVT_ACCENTS = [
  {bg:"#E5E0EC",fg:"#6C32A9"},{bg:"#FFDDE2",fg:"#CC1677"},
  {bg:"#D3F0EA",fg:"#046C7A"},{bg:"#DAEEFF",fg:"#0854A0"},
  {bg:"#FEF0D0",fg:"#C87741"},{bg:"#E3F1E2",fg:"#256F3A"},
  {bg:"#FFF0DB",fg:"#BE5B00"},{bg:"#E0CFEC",fg:"#7030A0"},
  {bg:"#E8ECF0",fg:"#364DA0"},{bg:"#F0F4EF",fg:"#1B6B35"},
];
export const avtColor = id => AVT_ACCENTS[(id||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0) % AVT_ACCENTS.length];
export const avtIni = name => { const p=name.trim().split(/\s+/); return p.length===1?p[0].slice(0,2).toUpperCase():(p[0][0]+p[1][0]).toUpperCase(); };

export const Badge = ({s,sq=false}:{s:string,sq?:boolean}) => {
  const x = STC[s]||{c:C.draft,bg:C.draftBg};
  return <span style={{display:"inline-block",padding:"3px 10px",borderRadius:sq?3:12,fontSize:12,fontWeight:700,color:x.c,background:x.bg,border:`1px solid ${x.c}40`,letterSpacing:0.2}}>{s}</span>;
};

const STATUS_ICONS:Record<string,string> = {
  "Draft":               "edit-document",
  "Submitted":           "paper-plane",
  "Under Review":        "pending",
  "Confirmed":           "accept",
  "Rejected":            "decline",
  "Posted":              "complete",
  "Converted to Invoice":"document-text",
  "Cleared":             "complete",
  "Withdrawn":           "undo",
  "Open":                "add-document",
  "Closed":              "sys-cancel",
  "Accepted":            "accept",
  "Active":              "complete",
};
export const StatusTag = ({s}:{s:string}) => {
  const x = STC[s]||{c:C.draft,bg:C.draftBg};
  const icon = STATUS_ICONS[s]||"status-inactive";
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,color:x.c,fontSize:12,fontWeight:600,whiteSpace:"nowrap" as const}}>
      <SapIcon name={icon} size={13} color={x.c}/>
      {s}
    </span>
  );
};
