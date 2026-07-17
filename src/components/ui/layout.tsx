import { C } from "../../theme";
import { mob } from "../../lib/responsive";
import { SapIcon } from "./SapIcon";

export const Lbl = ({children}) => <div style={{fontSize:12,color:C.t2,marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{children}</div>;
export const Val = ({children}) => <div style={{fontSize:14,color:C.t1,lineHeight:1.5}}>{children||"–"}</div>;
export const Sep = () => <div style={{height:1,background:C.border,margin:"14px 0"}}/>;

export const Modal = ({title,onClose,children,width=640,expanded=false,onToggleExpand=null}:any) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:expanded?0:16}}>
    <div style={{background:C.card,borderRadius:expanded?0:6,width:expanded?"100%":width,maxWidth:expanded?"100vw":"95vw",maxHeight:expanded?"100vh":"90vh",height:expanded?"100vh":"auto",overflow:"auto",boxShadow:"0 16px 48px rgba(0,0,0,0.22)"}}>
      <div style={{padding:"14px 20px",borderBottom:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.card,zIndex:1}}>
        <span style={{fontWeight:700,fontSize:16,color:C.t1}}>{title}</span>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {onToggleExpand&&<button onClick={onToggleExpand} title={expanded?"Restore":"Full Screen"} style={{background:"none",border:"1px solid "+C.border,cursor:"pointer",fontSize:13,color:C.t2,lineHeight:1,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4}}>{expanded?"⊡":"⊞"}</button>}
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.t2,lineHeight:1,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4}}>✕</button>
        </div>
      </div>
      <div style={{padding:mob()?14:20}}>{children}</div>
    </div>
  </div>
);


export const Th = ({children}) => <th style={{padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:700,color:C.t2,borderBottom:`2px solid ${C.border}`,background:C.subtle,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{children}</th>;
export const Td = ({children,style={}}) => <td style={{padding:"10px 14px",fontSize:14,color:C.t1,borderBottom:`1px solid ${C.border}`,...style}}>{children}</td>;
