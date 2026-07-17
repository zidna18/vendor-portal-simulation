// Toast.tsx — fixed-position toast container.
// Mount once in App.tsx. Subscribes to the module-level store in useToast.ts.
import { useState, useEffect } from "react";
import { C } from "../../theme";
import { setListener, dismissToast, ToastMessage, ToastType } from "../../lib/useToast";
import { SapIcon } from "./SapIcon";

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; icon: string; color: string }> = {
  info: { bg: "#dff0fd", border: "#0a6ed1", icon: "information", color: "#0854a0" },
  ok:   { bg: "#f1fdf6", border: "#107e3e", icon: "accept",      color: "#107e3e" },
  warn: { bg: "#fef7f1", border: "#df6e0c", icon: "warning",     color: "#c05b0a" },
  err:  { bg: "#ffebeb", border: "#bb0000", icon: "error",       color: "#bb0000" },
};

function ToastItem({ msg, onDismiss }: { msg: ToastMessage; onDismiss: () => void }) {
  const s = TYPE_STYLES[msg.type] || TYPE_STYLES.info;
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        background: s.bg, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.border}`,
        borderRadius: 4, padding: "12px 14px", minWidth: 280, maxWidth: 460,
        boxShadow: "0 4px 14px rgba(0,0,0,0.12)", animation: "fadeInUp .2s ease",
      }}
    >
      <SapIcon name={s.icon} size={18} color={s.color} />
      <span style={{ flex: 1, fontSize: 14, color: C.t1, lineHeight: 1.4 }}>{msg.text}</span>
      <button
        aria-label="Dismiss notification"
        onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: s.color, marginTop: 1 }}
      >
        <SapIcon name="decline" size={14} color={s.color} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [msgs, setMsgs] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setListener(setMsgs);
    return () => setListener(() => {});
  }, []);

  if (msgs.length === 0) return null;

  return (
    <>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div
        role="status"
        aria-label="Notifications"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          display: "flex", flexDirection: "column", gap: 10,
          pointerEvents: "none",
        }}
      >
        {msgs.map(m => (
          <div key={m.id} style={{ pointerEvents: "auto" }}>
            <ToastItem msg={m} onDismiss={() => dismissToast(m.id)} />
          </div>
        ))}
      </div>
    </>
  );
}
