// Responsive layout helpers — read VP.w at render time.
// VP is updated by window resize listener in App.tsx.

// â"€â"€ Responsive helpers (read VP.w at render time, updated by resize listener) â"€â"€
export let VP = {w: typeof window!=="undefined" ? window.innerWidth : 1280};
export const mob = () => VP.w < 768;
export const tab = () => VP.w < 1024;
export const g2  = () => mob() ? "1fr" : "1fr 1fr";
export const g3  = () => mob() ? "1fr" : tab() ? "1fr 1fr" : "repeat(3,1fr)";
export const g4  = () => mob() ? "1fr" : tab() ? "repeat(2,1fr)" : "repeat(4,1fr)";
export const pg  = () => mob() ? "12px 10px" : 24;
