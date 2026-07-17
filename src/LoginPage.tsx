// LoginPage.tsx — lazy-loaded so Vite tree-shakes this chunk (and mockData)
// out of the BTP production bundle (VITE_USE_MOCK=false).
import { useState } from "react";
import { USERS } from "./data/mockData";
import { C, SapIcon } from "./shared";

const LoginPage = ({ onLogin }) => {
  const [username, setU] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setL] = useState(false);
  const [role, setRole] = useState("vendor");
  const [showPw, setShowPw] = useState(false);
  const [keepMe, setKeep] = useState(false);

  const go = () => {
    if (!username.trim()) { setErr("Please enter a User ID or Login Name."); return; }
    if (!pw) { setErr("Please enter your password."); return; }
    setL(true); setErr("");
    setTimeout(() => {
      const u = USERS.find(x => x.username === username && x.password === pw);
      u ? onLogin(u) : (setErr("The user name or password you entered is incorrect. Please try again."), setL(false));
    }, 700);
  };

  const quickLogin = (uname) => onLogin(USERS.find(x => x.username === uname));

  const F: any = { fontFamily: "'72','72full',Arial,Helvetica,sans-serif" };
  return (
    <div style={{ ...F, minHeight: "100vh", background: "#f3f4f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ background: "#fff", borderRadius: 4, width: "100%", maxWidth: 380, boxShadow: "0 2px 16px rgba(0,0,0,0.12)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "32px 40px 0 40px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/tenant_logo.png" alt="BRM" style={{ height: 26, width: "auto" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <span style={{ fontSize: 11, color: "#6a6d70", fontWeight: 400, letterSpacing: .2 }}>SAP<sup style={{ fontSize: 8 }}>®</sup> ID</span>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1d2d3e", margin: "0 0 28px 0", lineHeight: 1.2 }}>Sign In</h1>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 0, border: "1px solid #d9d9d9", borderRadius: 4, overflow: "hidden" }}>
              {[["vendor", "Vendor / Supplier"], ["brm", "BRM Employee"]].map(([r, lbl], i) => (
                <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: "7px 0", border: "none", borderRight: i === 0 ? "1px solid #d9d9d9" : "none", background: role === r ? "#0a6ed1" : "#fff", color: role === r ? "#fff" : "#6a6d70", fontSize: 12, fontWeight: role === r ? 700 : 400, fontFamily: "inherit", cursor: "pointer", transition: "background .15s" }}>{lbl}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6a6d70", marginBottom: 4 }}>User ID or Login Name</label>
            <div style={{ position: "relative" }}>
              <input value={username} onChange={e => setU(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} placeholder="User ID or Login Name"
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 0", fontSize: 14, color: "#1d2d3e", background: "transparent", border: "none", borderBottom: "1px dotted #8c8c8c", outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#6a6d70", marginBottom: 4 }}>Password</label>
            <div style={{ position: "relative", border: "1px solid #0a6ed1", borderRadius: 4, display: "flex", alignItems: "center" }}>
              <input value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} type={showPw ? "text" : "password"} placeholder="Password"
                style={{ flex: 1, padding: "8px 10px", fontSize: 14, color: "#1d2d3e", background: "transparent", border: "none", outline: "none", fontFamily: "inherit" }} />
              <button onClick={() => setShowPw(p => !p)} title={showPw ? "Hide Password" : "Show Password"}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0 10px", display: "flex", alignItems: "center", color: "#6a6d70" }}>
                <SapIcon name={showPw ? "hide" : "show"} size={16} color="#6a6d70" />
              </button>
            </div>
          </div>

          {err && <div style={{ fontSize: 13, color: "#bb0000", marginBottom: 12, padding: "8px 10px", background: "#fff1f0", border: "1px solid #ffccc7", borderRadius: 3 }}>{err}</div>}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#32363a", cursor: "pointer" }}>
              <input type="checkbox" checked={keepMe} onChange={e => setKeep(e.target.checked)} style={{ width: 13, height: 13, cursor: "pointer", accentColor: "#0a6ed1" }} />
              Keep me signed in
            </label>
            <a style={{ fontSize: 13, color: "#0a6ed1", fontWeight: 700, textDecoration: "none", cursor: "pointer" }}>Forgot password?</a>
          </div>

          <div style={{ marginBottom: 20, padding: "12px 0", borderTop: "1px solid #e5e5e5" }}>
            <div style={{ fontSize: 11, color: "#6a6d70", fontWeight: 700, marginBottom: 8, letterSpacing: .6, textTransform: "uppercase" }}>Quick Demo Access</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[["vendor1", "PT Maju Bersama", "Vendor"], ["vendor2", "CV Sukses Mandiri", "Vendor"], ["vendor3", "PT Solusi Nusantara", "Vendor"], ["brm.user", "Ahmad Rizki", "BRM Employee"], ["buyer1", "Siti Rahma", "BRM Employee"], ["approver1", "Budi Santoso", "Approver"], ["director1", "Arief Budiman", "Director"]].map(([u, name, roleLabel]) => (
                <button key={u} onClick={() => quickLogin(u)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 3, border: "1px solid #e5e5e5", background: "#fafafa", cursor: "pointer", fontSize: 12, fontFamily: "inherit", color: "#1d2d3e" }}>
                  <SapIcon name={roleLabel === "Vendor" ? "factory" : roleLabel === "Approver" ? "approvals" : roleLabel === "Director" ? "manager" : "employee"} size={12} color="#6a6d70" />
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  <span style={{ color: "#8c8c8c", marginLeft: "auto", fontSize: 11 }}>{roleLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 40px 24px 40px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f0f0f0" }}>
          <button onClick={go} disabled={loading}
            style={{ background: loading ? "#b3d3f5" : "#0a6ed1", color: "#fff", border: "none", borderRadius: 4, padding: "9px 24px", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", minWidth: 110, transition: "background .15s" }}>
            {loading ? "Signing in…" : "Continue"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20, background: "#fff", borderRadius: 24, padding: "10px 28px", display: "flex", gap: 20, alignItems: "center" }}>
        {["Privacy Policy", "Legal Disclosure", "Cookie Statement"].map(l => (
          <a key={l} style={{ fontSize: 12, color: "#0a6ed1", textDecoration: "none", cursor: "pointer" }}>{l}</a>
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
