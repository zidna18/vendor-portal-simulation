import { useState, useEffect } from "react";

// Shared settings object — mutated by applySettings() in App
export let SETTINGS = { numFmt:"comma", dateFmt:"YYYY-MM-DD" };
export const applySettings = s => { SETTINGS = {...SETTINGS,...s}; };

export const idr = n => {
  const t = SETTINGS.numFmt==="dot" ? "." : ",";
  return "IDR " + Math.round(Number(n||0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, t);
};
export const fmtAmt = (n, currency = "IDR") => {
  const dec = currency==="IDR" ? 0 : 2;
  const t = SETTINGS.numFmt==="dot" ? "." : ",";
  const d = SETTINGS.numFmt==="dot" ? "," : ".";
  const [ip, dp] = Number(n||0).toFixed(dec).split(".");
  return `${currency} ${ip.replace(/\B(?=(\d{3})+(?!\d))/g, t)}${dp ? d+dp : ""}`;
};
export const fmtDate = d => {
  if (!d) return "–";
  const p = String(d).split("-");
  if (p.length !== 3 || p[0].length !== 4) return d;
  const [y,m,day] = p;
  switch(SETTINGS.dateFmt) {
    case "DD/MM/YYYY": return `${day}/${m}/${y}`;
    case "MM/DD/YYYY": return `${m}/${day}/${y}`;
    case "DD.MM.YYYY": return `${day}.${m}.${y}`;
    case "MM.DD.YYYY": return `${m}.${day}.${y}`;
    case "DD-MM-YYYY": return `${day}-${m}-${y}`;
    case "YYYY/MM/DD": return `${y}/${m}/${day}`;
    default: return d;
  }
};
export const parseToISO = raw => {
  if (!raw) return "";
  const fmt = SETTINGS.dateFmt;
  const sep = fmt.includes("/") ? "/" : fmt.includes(".") ? "." : "-";
  const parts = raw.split(sep);
  if (parts.length !== 3) return "";
  let y, m, day;
  if (fmt.startsWith("DD"))      { [day, m, y] = parts; }
  else if (fmt.startsWith("MM")) { [m, day, y] = parts; }
  else                           { [y, m, day] = parts; }
  if (!y || y.length !== 4) return "";
  const iso = `${y}-${m.padStart(2,"0")}-${day.padStart(2,"0")}`;
  return isNaN(new Date(iso).getTime()) ? "" : iso;
};
export const uid = () => Date.now().toString(36);
export const fmtPOs = inv => { const a=inv.poNumbers?.length?inv.poNumbers:inv.poNumber?[inv.poNumber]:[]; return a.join(", ")||"–"; };
