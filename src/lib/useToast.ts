// useToast.ts — module-level toast singleton.
// Components import { toast } directly; no prop threading needed.
// The ToastContainer in App.tsx subscribes via setListener().

export type ToastType = "info" | "ok" | "warn" | "err";

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

type Listener = (msgs: ToastMessage[]) => void;

let _msgs: ToastMessage[] = [];
let _listener: Listener | null = null;
let _seq = 0;

function _notify() {
  if (_listener) _listener([..._msgs]);
}

export function setListener(fn: Listener) {
  _listener = fn;
}

export function toast(text: string, type: ToastType = "info", durationMs = 4000) {
  const id = ++_seq;
  _msgs = [..._msgs, { id, text, type }];
  _notify();
  setTimeout(() => {
    _msgs = _msgs.filter(m => m.id !== id);
    _notify();
  }, durationMs);
}

export function dismissToast(id: number) {
  _msgs = _msgs.filter(m => m.id !== id);
  _notify();
}
