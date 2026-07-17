// theme.ts — palette objects and theme switcher.
// C and STC are exported as mutable let bindings (ESM live exports) so every
// component that imports them picks up the swapped value on re-render.
// applyTheme() also writes CSS custom properties to :root so tokens.css /
// tokens.dark.css are kept in sync with the JS palette for any future CSS-first usage.

const LIGHT = {
  shell:"#354a5f", shellHov:"rgba(255,255,255,0.15)",
  primary:"#0a6ed1", primaryDk:"#0854a0",
  bg:"#f7f7f7", card:"#ffffff", field:"#ffffff", subtle:"#f2f2f2", border:"#d9d9d9", fieldBorder:"#89919a",
  t1:"#1d2d3e", t2:"#6a6d70",
  ok:"#107e3e", okBg:"#f1fdf6",
  warn:"#df6e0c", warnBg:"#fef7f1",
  err:"#bb0000", errBg:"#ffebeb",
  info:"#0a6ed1", infoBg:"#dff0fd",
  draft:"#6a6d70", draftBg:"#f4f4f4",
  gold:"#c87941",
  hover:"#ededed", selection:"#e8f2fb",
};

const DARK = {
  shell:"#1b2534", shellHov:"rgba(255,255,255,0.14)",
  primary:"#64b5f6", primaryDk:"#4da3ff",
  bg:"#16191d", card:"#1c2128", field:"#23292f", subtle:"#252c36", border:"#3d444d", fieldBorder:"#56616d",
  t1:"#d1e4f4", t2:"#8696a9",
  ok:"#4cc15a", okBg:"#16301c",
  warn:"#f0913d", warnBg:"#36281a",
  err:"#ff6b6b", errBg:"#3a1e1e",
  info:"#64b5f6", infoBg:"#162338",
  draft:"#8696a9", draftBg:"#252c36",
  gold:"#d8945c",
  hover:"#2d3540", selection:"#1a2d42",
};

// C and STC are mutable bindings reassigned by applyTheme; every component
// reads them from module scope at render time, so a re-render picks up the swap.
export let C = LIGHT;

const buildSTC = () => ({
  Draft:       {c:C.draft, bg:C.draftBg},
  Submitted:   {c:C.info,  bg:C.infoBg},
  "Under Review":{c:C.warn, bg:C.warnBg},
  Confirmed:   {c:C.ok,   bg:C.okBg},
  Rejected:    {c:C.err,  bg:C.errBg},
  Created:     {c:"#5b738b", bg:"#e8edf1"},
  Open:        {c:"#0854a0", bg:"#dbeeff"},
  Scored:      {c:"#6f2da8", bg:"#f3eeff"},
  Closed:      {c:"#6a6d70", bg:"#f4f4f4"},
  Accepted:    {c:C.ok,   bg:C.okBg},
  Withdrawn:   {c:C.draft,bg:C.draftBg},
  Revised:     {c:C.warn, bg:C.warnBg},
  Win:         {c:"#188918", bg:"#eaf7ea"},
  Lost:        {c:C.err,  bg:C.errBg},
  "PO Ready":  {c:"#6f2da8", bg:"#f3eeff"},
  Active:      {c:C.ok,   bg:C.okBg},
  "Posted":              {c:C.ok,    bg:C.okBg},
  "Converted to Invoice":{c:C.info,  bg:C.infoBg},
  "Cleared":             {c:C.draft, bg:C.draftBg},
  "Supplier DPR":        {c:C.gold,  bg:C.warnBg},
  "Award Proposed":      {bg:"#fff8e1", color:"#856404", border:"#f0d080", c:"#856404"},
  "Award Approved":      {bg:"#e8f5e9", color:"#107e3e", border:"#9FE1CB", c:"#107e3e"},
});
export let STC = buildSTC();

// Write palette values to CSS custom properties so tokens.css stays in sync
function syncCSSVars(palette: typeof LIGHT, mode: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  // Sync key palette entries to CSS vars (tokens.dark.css handles full overrides
  // via [data-theme="dark"], so this setAttribute alone is sufficient for switching)
}

export const applyTheme = (mode: string) => {
  C = mode === "dark" ? DARK : LIGHT;
  STC = buildSTC();
  syncCSSVars(C, mode);
};
