import { useState, useEffect, useContext, createContext, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Capacitor } from '@capacitor/core';
import { writeWalkToHealth, getHealthSyncStatus, requestHealthAccess } from './lib/capacitorHealth';
// build marker: trigger redeploy

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Where password-reset emails send the user. Must be added to Supabase Auth →
// URL Configuration → Redirect URLs (an unlisted redirectTo is rejected by
// Supabase and it silently falls back to the Site URL instead).
const PASSWORD_RESET_REDIRECT_URL = "https://app.guidingpaw.com/reset-password";

// Where Google OAuth sends the user back after they authenticate. Unlike
// PASSWORD_RESET_REDIRECT_URL this doesn't need a fixed production URL — the
// app's normal signed-in/out flow (onAuthStateChange) already handles
// routing once back at "/", so returning to wherever this instance is
// actually running is correct for production, Vercel previews, and local
// dev alike, as long as that exact origin is allow-listed in Supabase Auth →
// URL Configuration → Redirect URLs.
// NOTE: this only covers the web/PWA build. A packaged Capacitor app's
// window.location.origin (capacitor://localhost etc.) isn't a reachable
// OAuth redirect target — native Google Sign-In needs its own deep-link
// setup, which is separate, larger work (checklist item 10).
const oauthRedirectUrl = () => window.location.origin;

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

// ─── ICON SYSTEM ────────────────────────────────────────────────────────────────
// Replaces emoji throughout the app with consistent, theme-colored stroke icons.
// Usage: <Icon name="paw" size={16}/> — size defaults to 16, color defaults to
// currentColor (inherits from surrounding text color) unless a color prop is given.
const ICON_PATHS = {
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  home: <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
  pin: <><path d="M12 22s7-7.4 7-12a7 7 0 1 0-14 0c0 4.6 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></>,
  heart: <path d="M20.8 7.6a5 5 0 0 0-8.4-2.6l-.4.4-.4-.4a5 5 0 0 0-8.4 5.4c1 2.6 3.4 5 8.8 9.6 5.4-4.6 7.8-7 8.8-9.6a5 5 0 0 0 0-2.8z"/>,
  book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></>,
  calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></>,
  bag: <><path d="M6 8h12l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20.5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
  paw: <><circle cx="6" cy="9" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="9.5" cy="5" r="2"/><circle cx="14.5" cy="5" r="2"/><path d="M12 12c-3.3 0-6 2.3-6 5a3 3 0 0 0 3 3c1.3 0 1.9-.7 3-.7s1.7.7 3 .7a3 3 0 0 0 3-3c0-2.7-2.7-5-6-5z"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
  brain: <><path d="M9.5 2a3 3 0 0 0-3 3v.3A3.5 3.5 0 0 0 4 8.5 3.5 3.5 0 0 0 5.5 15a3 3 0 0 0 3 4.5A3 3 0 0 0 12 21a3 3 0 0 0 3.5-1.5 3 3 0 0 0 3-4.5 3.5 3.5 0 0 0 1.5-6.5A3.5 3.5 0 0 0 17.5 5.3V5a3 3 0 0 0-3-3 3 3 0 0 0-2.5 1.4A3 3 0 0 0 9.5 2z"/><path d="M12 2.5v18"/></>,
  dog: <><path d="M4 10l3-5 3 1 2-1 2 1 3-1 3 5"/><path d="M5 10c0 6 3 10 7 10s7-4 7-10"/><circle cx="9.5" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12" r=".8" fill="currentColor" stroke="none"/></>,
  check: <path d="M20 6L9 17l-5-5"/>,
  checkCircle: <><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.5 2.5 5.5-6"/></>,
  x: <path d="M18 6L6 18M6 6l12 12"/>,
  alert: <><path d="M12 3l10 17.5H2z"/><path d="M12 9.5v4.5M12 17v.01"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M3 3l18 18"/><path d="M10.6 5.2A9.4 9.4 0 0 1 12 5c6.5 0 10 7 10 7a15.5 15.5 0 0 1-3.3 4.2M6.5 6.5C3.6 8.3 2 12 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.6"/><path d="M9.5 9.5a3 3 0 0 0 4.2 4.2"/></>,
  lock: <><rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M7 10.5V7a5 5 0 0 1 10 0v3.5"/></>,
  key: <><circle cx="8" cy="15" r="4.5"/><path d="M11.5 11.5L20 3M16.5 6.5l2.5 2.5M13.5 9.5l2 2"/></>,
  flame: <path d="M12 22a7 7 0 0 0 7-7c0-3.5-2.5-5-3.5-8-1.5 2-2 3-2 3s.5-4-2-7c0 4-3 5.5-4.5 8.5A7 7 0 0 0 12 22z"/>,
  star: <path d="M12 2.5l3 6.4 6.9.8-5 4.9 1.3 6.9-6.2-3.4-6.2 3.4 1.3-6.9-5-4.9 6.9-.8z"/>,
  gradCap: <><path d="M2 8.5L12 4l10 4.5-10 4.5-10-4.5z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5M22 8.5V15"/></>,
  party: <><path d="M4 20l4-13 9 9-13 4z"/><path d="M13 3l1.5 1.5M18 5l1.5 1.5M16 9l1.5 1.5"/></>,
  clipboard: <><rect x="5" y="4.5" width="14" height="17" rx="2"/><rect x="9" y="2.5" width="6" height="3.5" rx="1"/><path d="M9 12h6M9 16h6"/></>,
  footprints: <><ellipse cx="8" cy="8" rx="2.2" ry="3"/><ellipse cx="16" cy="17" rx="2.2" ry="3"/><path d="M6.5 12.5l1 1M17.5 21l1 1"/></>,
  trophy: <><path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 5H4v2a3 3 0 0 0 4 2.8M16 5h4v2a3 3 0 0 1-4 2.8"/><path d="M10 17.5h4M12 14v3.5M9 21h6"/></>,
  bulb: <><path d="M9 18h6M10 21h4"/><path d="M12 2a6.5 6.5 0 0 0-3.8 11.8c.5.4.8 1 .8 1.7V16h6v-.5c0-.7.3-1.3.8-1.7A6.5 6.5 0 0 0 12 2z"/></>,
  card: <><rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 15h4"/></>,
  leaf: <><path d="M21 3S9 2 5 9c-3 5.3 0 10.5 4 12 6 2.3 12-5 12-14 0-1.4-.1-3-.1-4z"/><path d="M4 21c3-3.5 6-6 10-8.5"/></>,
  pencil: <><path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 6.5l3.5 3.5"/></>,
  link: <><path d="M9 15l6-6"/><path d="M13 4.5l1-1a3.5 3.5 0 0 1 5 5l-1.5 1.5M11 19.5l-1 1a3.5 3.5 0 0 1-5-5l1.5-1.5"/></>,
  mail: <><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/></>,
  tag: <><path d="M20.5 12.5L12.8 20.2a1.5 1.5 0 0 1-2.1 0l-7-7a1.5 1.5 0 0 1 0-2.1L11.4 3.4a1.5 1.5 0 0 1 1.1-.4H19a1.5 1.5 0 0 1 1.5 1.5v6.4a1.5 1.5 0 0 1-.4 1.1z"/><circle cx="15" cy="7" r="1.4" fill="currentColor" stroke="none"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></>,
  sleep: <><path d="M17 4h-6l-3 5h4l-4 6h5l-3 5h6"/></>,
  bed: <><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18v2M21 18v2M3 12V8a2 2 0 0 1 2-2h4v4"/><circle cx="7" cy="9.5" r="1.3" fill="currentColor" stroke="none"/></>,
  bowl: <><path d="M3 12h18a8 8 0 0 1-16 0z"/><path d="M6 12a2.5 2.5 0 0 1 0-5M18 12a2.5 2.5 0 0 0 0-5"/></>,
  ball: <><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18M3 12h18"/></>,
  medal: <><circle cx="12" cy="15.5" r="5"/><path d="M9.5 11L6.5 3M14.5 11l3-8"/><path d="M12 13v5"/></>,
  bookOpen: <><path d="M12 6.5S9.5 4 4 4v14.5C9.5 18.5 12 21 12 21s2.5-2.5 8-2.5V4c-5.5 0-8 2.5-8 2.5z"/><path d="M12 6.5V21"/></>,
  camera: <><path d="M4 8h3l1.5-2.5h7L17 8h3a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 8z"/><circle cx="12" cy="14" r="3.6"/></>,
  message: <path d="M21 12a8 8 0 1 1-3.5-6.6L21 4l-1 3.8A8 8 0 0 1 21 12z"/>,
  music: <><path d="M9 18.5a2.5 2.5 0 1 1-2.5-2.5A2.5 2.5 0 0 1 9 18.5zM19 16.5a2.5 2.5 0 1 1-2.5-2.5 2.5 2.5 0 0 1 2.5 2.5z"/><path d="M9 18.5V5.5l10-2v13"/></>,
  puzzle: <path d="M14 4.5h-3v2a1.5 1.5 0 0 1-3 0v-2H5v3.5h2a1.5 1.5 0 0 1 0 3H5V15h3.5v-2a1.5 1.5 0 0 1 3 0v2H15v-3.5h2a1.5 1.5 0 0 0 0-3h-2V5z"/>,
  syringe: <><path d="M18 2l4 4M11 9l4 4M2 22l5-1.5L19 8 16 5 3.5 17z"/><path d="M14.5 5.5l4 4"/></>,
  plus: <path d="M12 4.5v15M4.5 12h15"/>,
  run: <><circle cx="14.5" cy="4.5" r="1.8"/><path d="M9 21l2-6-3-2 1-5 4 2 3 5-3 6M6 15l3-3 3 1"/></>,
  zap: <path d="M13 2L4 14h6l-1 8 9-12h-6z"/>,
  dice: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></>,
  droplet: <path d="M12 2.5S5 11 5 15.5a7 7 0 0 0 14 0C19 11 12 2.5 12 2.5z"/>,
  refresh: <><path d="M21 12a9 9 0 0 1-15.4 6.4M3 12a9 9 0 0 1 15.4-6.4"/><path d="M21 4.5V9h-4.5M3 19.5V15h4.5"/></>,
  gift: <><rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 9h18v4H3zM12 9v11"/><path d="M12 9S9 6 7 6a2 2 0 0 0 0 4M12 9s3-3 5-3a2 2 0 0 1 0 4"/></>,
  info: <><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.01"/></>,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6"/>,
  arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6"/>,
  video: <><rect x="2.5" y="6" width="14" height="12" rx="2"/><path d="M16.5 10.5L21 7v10l-4.5-3.5"/></>,
  handshake: <><path d="M2 12l4-4h4l3 3-1.5 1.5a1.5 1.5 0 0 1-2.2-2M22 12l-4-4h-4l-3 3 1.5 1.5a1.5 1.5 0 0 0 2.2-2"/><path d="M9 11l4 4M8 15l3 3"/></>,
  dot: <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>,
  globe: <><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.5 2.7 4 6.2 4 9.5s-1.5 6.8-4 9.5c-2.5-2.7-4-6.2-4-9.5s1.5-6.8 4-9.5z"/></>,
  car: <><path d="M4 16V11l2-5h12l2 5v5"/><path d="M2.5 16h19M6.5 16v2.5M17.5 16v2.5"/><circle cx="7.5" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="16.5" cy="16" r="1.5" fill="currentColor" stroke="none"/></>,
  door: <><rect x="5" y="2.5" width="14" height="19" rx="1"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/></>,
  wave: <path d="M2 15c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 10c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>,
  chart: <><path d="M4 20V10M12 20V4M20 20v-7"/><path d="M2 20h20"/></>,
  bone: <path d="M6 8.5a2.2 2.2 0 1 0-3.5 2.6L8 16.5a2.2 2.2 0 1 0 2.6-3.5M18 15.5a2.2 2.2 0 1 0 3.5-2.6L16 7.5a2.2 2.2 0 1 0-2.6 3.5"/>,
  backpack: <><path d="M7 8V6a5 5 0 0 1 10 0v2"/><rect x="4" y="8" width="16" height="14" rx="3"/><path d="M9 12h6M8 22v-6h8v6"/></>,
  box: <><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
  rocket: <><path d="M12 2s5 2 5 8-5 12-5 12-5-6-5-12 5-8 5-8z"/><circle cx="12" cy="9" r="1.6" fill="currentColor" stroke="none"/><path d="M8 16l-3 3 1-4M16 16l3 3-1-4"/></>,
  clock: <><circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.5 2"/></>,
  play: <path d="M6 4.5l14 7.5-14 7.5z"/>,
  pause: <><rect x="6" y="4.5" width="4.5" height="15" rx="1"/><rect x="13.5" y="4.5" width="4.5" height="15" rx="1"/></>,
  menu: <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/>,
  chat: <path d="M21 12a8 8 0 1 1-3.5-6.6L21 4l-1 3.8A8 8 0 0 1 21 12z"/>,
  flower: <><circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="12" r="2.5"/></>,
  timer: <><circle cx="12" cy="13" r="8"/><path d="M12 13V9M9 2h6"/></>,
  antenna: <><path d="M4 8l4-5M20 8l-4-5M12 3v18M9 21h6"/></>,
  controller: <><rect x="2.5" y="8" width="19" height="10" rx="5"/><path d="M7 11v4M5 13h4M16 12h.01M19 14h.01"/></>,
  muscle: <path d="M4 12V7a2 2 0 0 1 4 0v2h1V6a2 2 0 0 1 4 0v3h1a3 3 0 0 1 3 3v2a5 5 0 0 1-5 5H8a4 4 0 0 1-4-4z"/>,
  bird: <><path d="M17 8a5 5 0 0 0-10 0c0 3 2 4 2 7a4 4 0 0 1-4 4"/><circle cx="15" cy="7" r="1" fill="currentColor" stroke="none"/><path d="M17 8l4-1-2 3"/></>,
  phone: <path d="M6.5 2.5h5l1 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1v5a2 2 0 0 1-2 2C10.5 19.5 4.5 13.5 4.5 4.5a2 2 0 0 1 2-2z"/>,
  trash: <><path d="M4 6.5h16M9 6.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5"/><path d="M6 6.5V20a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 20V6.5M10 11v6M14 11v6"/></>,
  cameraPlus: <><path d="M4 8h3l1.5-2.5h7L17 8h3a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 4 8z"/><circle cx="11.5" cy="14" r="3.2"/><path d="M18 4.5v3M16.5 6h3"/></>,
};

const Icon = ({name, size=16, color="currentColor", style={}, strokeWidth=2}) => {
  const path = ICON_PATHS[name];
  if(!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{display:"inline-block",verticalAlign:"middle",flexShrink:0,...style}}>
      {path}
    </svg>
  );
};

// ─── THEMES ───────────────────────────────────────────────────────────────────
const DARK = {
  mode:"dark",
  // Navy is now the dominant background — gradient from deep navy to navy-green
  bg:"#0d1520",
  // Cards sit on top of navy — slightly lighter navy with navy tint
  card:"rgba(22,32,50,0.97)", cardSolid:"#162032", cardBorder:"rgba(176,141,87,0.22)",
  // Inner cards: medium navy
  cardInner:"rgba(28,40,60,0.88)", cardInnerBorder:"rgba(176,141,87,0.22)",
  // Inputs: navy-tinted
  inputBg:"rgba(28,38,58,0.6)", inputBorder:"rgba(176,141,87,0.28)", inputFocusBg:"rgba(28,45,65,0.8)",
  text:"#D8C6AE", textMuted:"rgba(216,198,174,0.72)", textFaint:"rgba(216,198,174,0.65)",
  gold:"#B08D57", goldLight:"#c9a870", green:"#2F4F3E", brown:"#A3562A", tan:"#D8C6AE",
  navy:"#1C2636", navyDeep:"#0d1520", navyMid:"#243044", navyLight:"rgba(28,38,54,0.7)", success:"#4caf7d",
  // Dividers: navy-blue tinted gold
  divider:"rgba(176,141,87,0.14)",
  // Nav bar: deep navy
  navBg:"rgba(13,21,32,0.98)",
  // Chips: navy surface
  chipBg:"rgba(28,38,54,0.65)", chipBorder:"rgba(176,141,87,0.2)",
  // Streak card: navy-gold blend
  streakCard:"rgba(28,38,54,0.9)", streakBorder:"rgba(176,141,87,0.35)",
  // Progress card: navy-green
  progressCard:"rgba(28,50,40,0.45)",
  // Assignment card: deep navy
  assignCard:"rgba(18,28,46,0.98)",
  liveGpsBg:"rgba(28,50,40,0.4)", liveGpsBorder:"rgba(47,79,62,0.55)",
  storeBg:"rgba(163,86,42,0.18)", storeBorder:"rgba(163,86,42,0.35)",
  socialBg:"rgba(28,50,40,0.35)", socialBorder:"rgba(47,79,62,0.4)",
  // Calendar: navy card
  calBg:"rgba(22,32,50,0.92)", dayToday:"#B08D57", dayTodayText:"#0d1520",
  signOutBg:"rgba(163,86,42,0.15)", signOutBorder:"rgba(163,86,42,0.35)", signOutText:"#e07a5f",
  placeholder:"rgba(216,198,174,0.28)", scrollThumb:"rgba(28,54,80,0.6)", bannerMid:"#1C2636",
  // Routine & diag cards: navy
  routineCard:"rgba(22,36,54,0.75)", diagCard:"rgba(22,36,54,0.88)",
  // New: navy accent for section headers, badges, week rows
  navyAccentBg:"rgba(28,38,54,0.85)", navyAccentBorder:"rgba(58,90,130,0.4)",
  weekRowActive:"rgba(28,50,80,0.5)",
  // Sidebar / bottom-tab / top-bar surface — distinct from page bg, theme-aware
  navBarBg:"#0d1823", navBarBorder:"rgba(176,141,87,.15)", navBarDivider:"rgba(176,141,87,.12)",
  navText:"rgba(216,198,174,0.6)", navTextStrong:"rgba(216,198,174,.85)", navActiveText:"#B08D57",
  navLogoText:"#c9a870", navLogoSub:"rgba(176,141,87,.6)", navSignOut:"rgba(216,198,174,.45)",
  navTopbarBg:"rgba(13,21,32,.97)",
};
const LIGHT = {
  mode:"light",
  // Light mode: warm cream bg, navy as the primary accent/header color
  bg:"#f0e8da",
  card:"rgba(255,252,246,0.98)", cardSolid:"#fffcf6", cardBorder:"rgba(28,38,54,0.18)",
  // Inner cards: white-cream with navy border
  cardInner:"rgba(255,248,238,0.92)", cardInnerBorder:"rgba(28,38,54,0.14)",
  inputBg:"rgba(255,255,255,0.88)", inputBorder:"rgba(28,38,54,0.22)", inputFocusBg:"rgba(255,255,255,1)",
  text:"#1C2636", textMuted:"#524c42", textFaint:"#6b6357",
  gold:"#8a6535", goldLight:"#a07840", green:"#2F4F3E", brown:"#A3562A", tan:"#D8C6AE",
  navy:"#1C2636", navyDeep:"#0d1520", navyMid:"#243044", navyLight:"rgba(28,38,54,0.08)", success:"#2e7d52",
  divider:"rgba(28,38,54,0.1)",
  // Nav: navy in light mode
  navBg:"#1C2636",
  chipBg:"rgba(28,38,54,0.06)", chipBorder:"rgba(28,38,54,0.18)",
  streakCard:"rgba(28,38,54,0.08)", streakBorder:"rgba(28,38,54,0.22)",
  progressCard:"rgba(47,79,62,0.1)",
  assignCard:"rgba(255,248,230,0.98)",
  liveGpsBg:"rgba(47,79,62,0.09)", liveGpsBorder:"rgba(47,79,62,0.28)",
  storeBg:"rgba(163,86,42,0.08)", storeBorder:"rgba(163,86,42,0.22)",
  socialBg:"rgba(47,79,62,0.08)", socialBorder:"rgba(47,79,62,0.22)",
  calBg:"rgba(28,38,54,0.06)", dayToday:"#1C2636", dayTodayText:"#D8C6AE",
  signOutBg:"rgba(163,86,42,0.08)", signOutBorder:"rgba(163,86,42,0.25)", signOutText:"#A3562A",
  placeholder:"#6b6357", scrollThumb:"rgba(28,38,54,0.2)", bannerMid:"#1C2636",
  routineCard:"rgba(28,38,54,0.05)", diagCard:"rgba(255,248,230,0.9)",
  navyAccentBg:"rgba(28,38,54,0.07)", navyAccentBorder:"rgba(28,38,54,0.2)",
  weekRowActive:"rgba(28,38,54,0.1)",
  // Sidebar / bottom-tab / top-bar surface — light in light mode (previously stayed navy)
  navBarBg:"#fffcf6", navBarBorder:"rgba(28,38,54,.12)", navBarDivider:"rgba(28,38,54,.1)",
  navText:"#6b6357", navTextStrong:"#1C2636", navActiveText:"#8a6535",
  navLogoText:"#6b4e26", navLogoSub:"rgba(138,101,53,.75)", navSignOut:"#8a8175",
  navTopbarBg:"rgba(255,252,246,.97)",
};

// ─── GLOBAL CSS ────────────────────────────────────────────────────────────────
const globalCss = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Lato:wght@300;400;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Lato',sans-serif;}
  input,select,textarea{font-family:'Lato',sans-serif;}
  input::placeholder{color:${T.placeholder};}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:4px;}
  @keyframes rise{from{opacity:0;transform:translateY(26px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes glow{0%,100%{opacity:.35}50%{opacity:.85}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(176,141,87,.4)}70%{box-shadow:0 0 0 8px rgba(176,141,87,0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
  @keyframes successPop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
  @keyframes checkIn{from{opacity:0;transform:scale(0) rotate(-20deg)}to{opacity:1;transform:scale(1) rotate(0)}}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .rise{animation:rise .55s cubic-bezier(.22,1,.36,1) both;}
  .s1{animation:up .4s .05s both;} .s2{animation:up .4s .1s both;}
  .s3{animation:up .4s .16s both;} .s4{animation:up .4s .22s both;}
  .s5{animation:up .4s .28s both;} .s6{animation:up .4s .34s both;}
  .slide{animation:slideIn .38s cubic-bezier(.22,1,.36,1) both;}
  .btn-gold{transition:all .2s;}
  .btn-gold:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 8px 22px rgba(176,141,87,.45)!important;}
  .btn-gold:active{transform:translateY(0);}
  .complete-btn{animation:pulse 2s infinite;}
  .week-row:hover{background:rgba(28,38,54,.12)!important;}
  .lesson-row:hover{opacity:.82;}
  .nav-icon-active{color:#B08D57!important;}
  /* ── Content protection: prevent download/save/copy on protected media ── */
  .protected-content{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-touch-callout:none;pointer-events:none;}
  .protected-content-wrap{position:relative;}
  /* This overlay must not capture clicks, or video controls (play/pause/seek) become unusable */
  .protected-content-wrap::after{content:"";position:absolute;inset:0;z-index:10;background:transparent;pointer-events:none;}
  video.protected-video::-webkit-media-controls-download-button{display:none!important;}
  video.protected-video::-webkit-media-controls-enclosure{overflow:hidden;}
  /* Videos must remain clickable so native play/pause/seek controls work; right-click and
     drag-out protection is instead handled via onContextMenu + controlsList in the component. */
  video.protected-video{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}
  img.protected-img{-webkit-user-drag:none;user-drag:none;-webkit-user-select:none;user-select:none;pointer-events:none;}
  a.protected-link{pointer-events:none;}
  /* ── Unified Web Layout (same sidebar + topbar structure on phone & desktop) ── */
  .app-root{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px 16px;transition:background .4s;}
  .phone-layout{display:flex;width:100%;max-width:390px;margin:0 auto;}
  .web-layout{display:flex;width:100%;min-height:100vh;}
  .app-root:has(.web-layout){padding:0;align-items:stretch;justify-content:stretch;}
  .web-sidebar{width:240px;min-height:100vh;flex-shrink:0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow:hidden;transition:transform .25s;}
  .web-main{flex:1;min-height:100vh;overflow-y:auto;display:flex;flex-direction:column;min-width:0;}
  .web-topbar{display:flex;flex-direction:column;border-bottom:1px solid rgba(176,141,87,.15);flex-shrink:0;}
  .web-topbar-row{display:flex;align-items:center;justify-content:space-between;padding:10px 28px;gap:10px;}
  .web-content{flex:1;padding:24px 32px;overflow-y:auto;max-height:calc(100vh - 60px);}
  .web-content::-webkit-scrollbar{width:5px;}
  .web-content::-webkit-scrollbar-thumb{background:rgba(176,141,87,.3);border-radius:4px;}
  .sidebar-nav-btn{width:100%;display:flex;align-items:center;gap:12px;padding:11px 22px;border:none;cursor:pointer;background:none;font-family:'Lato',sans-serif;font-size:13px;font-weight:600;letter-spacing:.04em;transition:all .18s;border-radius:0;}
  .sidebar-nav-btn:hover{background:rgba(176,141,87,.1);}
  .sidebar-nav-btn.active{background:rgba(176,141,87,.18);border-right:3px solid #B08D57;}
  .hamburger-btn{display:none;background:none;border:none;cursor:pointer;padding:4px;align-items:center;justify-content:center;flex-shrink:0;}
  .sidebar-backdrop{display:none;}
  @media(min-width:900px){
    .web-sidebar{position:sticky;transform:none!important;}
  }
  @media(max-width:899px){
    .web-sidebar{position:fixed;top:0;left:0;z-index:220;transform:translateX(-100%);box-shadow:0 0 40px rgba(0,0,0,.5);}
    .web-sidebar.open{transform:translateX(0);}
    .hamburger-btn{display:flex;}
    .web-topbar-row{padding:8px 14px;}
    .web-content{padding:16px;max-height:none;}
    .sidebar-backdrop.open{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:210;}
  }
  @media(max-width:599px){
    .phone-layout{max-width:100%;}
  }
  /* ── Rolling time-wheel picker (potty timer) ── */
  .wheel-scroll{scrollbar-width:none;-ms-overflow-style:none;}
  .wheel-scroll::-webkit-scrollbar{display:none;width:0;height:0;}
  /* ── Icon hover tooltips (top bar) — desktop/laptop only, since "hover" isn't a
     meaningful gesture on touch devices; @media(hover:hover) keeps these from getting
     stuck open after a tap on phones/tablets. ── */
  .icon-tt{position:relative;}
  .icon-tt-bubble{position:absolute;top:calc(100% + 9px);left:50%;transform:translateX(-50%) translateY(-4px);
    background:${T.mode==="dark"?"#1C2636":"#241d14"};color:#F7F1E4;font-family:'Lato',sans-serif;
    font-size:11px;font-weight:700;letter-spacing:.02em;white-space:nowrap;padding:6px 11px;border-radius:8px;
    box-shadow:0 8px 20px rgba(0,0,0,.28);opacity:0;visibility:hidden;pointer-events:none;
    transition:opacity .15s ease, transform .15s ease;z-index:80;}
  .icon-tt-bubble::before{content:"";position:absolute;bottom:100%;left:50%;transform:translateX(-50%);
    border:5px solid transparent;border-bottom-color:${T.mode==="dark"?"#1C2636":"#241d14"};}
  @media(hover:hover) and (pointer:fine){
    .icon-tt:hover .icon-tt-bubble{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0);}
  }
`;

// ─── SHARED UI ─────────────────────────────────────────────────────────────────
// Guiding Paw logo — the real brand mark, embedded as a data URI so it always
// renders regardless of hosting/build setup (no separate asset file to lose track of).
const LOGO_DATA_URI = "data:image/png;base64,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";

const LogoImg = ({size=56}) => {
  // A soft light badge behind the mark keeps it visible in dark mode too — the logo's
  // navy paw would otherwise nearly disappear against the app's dark navy sidebar.
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:"#F7F1E4",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:size*0.09,boxSizing:"border-box"}}>
      <img src={LOGO_DATA_URI} alt="Guiding Paw Training" width={size} height={size}
        style={{width:"100%",height:"100%",objectFit:"contain",display:"block"}}/>
    </div>
  );
};

// Logo header bar shown on each in-app page
const PageLogoHeader = () => {
  const T=useTheme();
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",padding:"10px 0 4px",flexShrink:0}}>
      <LogoImg size={44}/>
    </div>
  );
};

const TopBanner = ({setPage}) => {
  const T=useTheme();
  const pages=["live","bond","learn"];
  return (
    <div style={{background:`linear-gradient(90deg,${T.green} 0%,#1C2636 45%,${T.brown} 100%)`,padding:"8px 0",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
        {["LIVE","BOND","LEARN"].map((w,i)=>(
          <span key={w} style={{display:"flex",alignItems:"center"}}>
            <button onClick={()=>setPage&&setPage(pages[i])} style={{background:"none",border:"none",cursor:"pointer",padding:"2px 4px",fontSize:"9.5px",fontWeight:"900",letterSpacing:".18em",color:"#c9a870",fontFamily:"'Lato',sans-serif",transition:"color .18s,opacity .18s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}
            >{w}</button>
            {i<2&&<span style={{margin:"0 9px",color:"#B08D57",fontSize:"7px"}}>◆</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

const ThemeToggle = ({darkMode,setDarkMode}) => {
  const T=useTheme();
  return (
    <button onClick={()=>setDarkMode(d=>!d)} style={{display:"flex",alignItems:"center",gap:"6px",background:"none",border:"none",cursor:"pointer",padding:"4px 2px"}}>
      <Icon name={darkMode?"moon":"sun"} size={15} color={T.navText}/>
      <div style={{width:"40px",height:"22px",borderRadius:"11px",background:darkMode?"rgba(176,141,87,.35)":"rgba(163,86,42,.2)",border:`1.5px solid ${darkMode?"rgba(176,141,87,.6)":"rgba(163,86,42,.35)"}`,position:"relative",transition:"all .3s"}}>
        <div style={{position:"absolute",top:"2px",left:darkMode?"18px":"2px",width:"16px",height:"16px",borderRadius:"50%",background:darkMode?"#c9a870":"#A3562A",transition:"left .3s",boxShadow:"0 1px 4px rgba(0,0,0,.25)"}}/>
      </div>
    </button>
  );
};

const GoldBtn = ({children,onClick,style={}}) => {
  const T=useTheme();
  return <button className="btn-gold" onClick={onClick} style={{width:"100%",padding:"13px",background:T.gold,color:"#fff",border:"none",borderRadius:"11px",fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"'Lato',sans-serif",cursor:"pointer",boxShadow:"0 4px 18px rgba(176,141,87,.28)",...style}}>{children}</button>;
};

const Field = ({label,type="text",value,onChange,placeholder}) => {
  const T=useTheme();
  return (
    <div style={{marginBottom:"14px"}}>
      <label style={{display:"block",fontSize:"10px",letterSpacing:".16em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"5px"}}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"11px 14px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none",transition:"all .2s"}}
        onFocus={e=>{e.target.style.borderColor=T.gold;e.target.style.background=T.inputFocusBg;}}
        onBlur={e=>{e.target.style.borderColor=T.inputBorder;e.target.style.background=T.inputBg;}} />
    </div>
  );
};

const SectionTitle = ({children}) => { const T=useTheme(); return <h3 style={{fontFamily:"'Inter',serif",fontSize:"17px",fontWeight:"700",color:T.mode==="dark"?T.text:T.navy,marginBottom:"14px"}}>{children}</h3>; };

const Chip = ({label,selected,onClick,emoji=""}) => {
  const T=useTheme();
  return <button onClick={onClick} style={{padding:"9px 14px",borderRadius:"22px",border:`1px solid ${selected?T.gold:T.chipBorder}`,background:selected?"rgba(176,141,87,.18)":T.chipBg,color:selected?T.goldLight:T.textMuted,fontSize:"12.5px",fontWeight:selected?"700":"400",cursor:"pointer",transition:"all .18s",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",gap:"5px"}}>{emoji&&<Icon name={emoji} size={13}/>}{label}</button>;
};

const ChipGroup = ({options,selected,onToggle,single=false}) => (
  <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"18px"}}>
    {options.map(o=>{
      const val=typeof o==="string"?o:o.value, label=typeof o==="string"?o:o.label, emoji=typeof o==="object"?o.emoji:"";
      const isSel=single?selected===val:(selected||[]).includes(val);
      return <Chip key={val} label={label} emoji={emoji} selected={isSel} onClick={()=>onToggle(val,single)}/>;
    })}
  </div>
);

const ProgressDots = ({total,current}) => {
  const T=useTheme();
  return <div style={{display:"flex",gap:"5px",justifyContent:"center",marginBottom:"18px"}}>{Array.from({length:total}).map((_,i)=><div key={i} style={{width:i===current?20:7,height:7,borderRadius:"4px",background:i===current?T.gold:i<current?"rgba(176,141,87,.4)":"rgba(176,141,87,.15)",transition:"all .3s"}}/>)}</div>;
};

const BackBtn = ({onClick}) => { const T=useTheme(); return <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"12px",display:"flex",alignItems:"center",gap:"4px",marginBottom:"18px",padding:0}} onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textFaint}>← Back</button>; };

const TextLink = ({children,onClick}) => { const T=useTheme(); return <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",color:T.gold,fontWeight:"700",fontSize:"12.5px",padding:0}} onMouseEnter={e=>e.currentTarget.style.color=T.goldLight} onMouseLeave={e=>e.currentTarget.style.color=T.gold}>{children}</button>; };

const Divider = () => { const T=useTheme(); return <div style={{display:"flex",alignItems:"center",gap:"10px",margin:"8px 0"}}><div style={{flex:1,height:"1px",background:T.divider}}/><span style={{fontSize:"10px",color:T.textFaint,letterSpacing:".1em"}}>OR</span><div style={{flex:1,height:"1px",background:T.divider}}/></div>; };

const GoogleBtn = ({label, onClick}) => {
  const T=useTheme();
  return <button onClick={onClick} style={{width:"100%",padding:"11px",background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:"11px",fontSize:"13px",fontWeight:"700",color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.text;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.cardBorder;e.currentTarget.style.color=T.textMuted;}}><svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>{label}</button>;
};

const PhoneShell = ({children}) => {
  const T=useTheme();
  return <div className="phone-layout" style={{background:T.card,backdropFilter:"blur(24px)",borderRadius:"26px",overflow:"hidden",border:T.mode==="dark"?"1px solid rgba(58,90,130,0.4)":"1px solid rgba(28,38,54,0.22)",boxShadow:T.mode==="dark"?"0 40px 80px rgba(0,0,0,.65),0 0 0 1px rgba(176,141,87,.08) inset":"0 20px 60px rgba(28,38,54,.22),0 1px 0 rgba(255,255,255,.8) inset",flexDirection:"column",maxHeight:"90vh",minHeight:"600px",transition:"background .4s,border-color .4s"}}>{children}</div>;
};

// ─── SIDEBAR NAV (desktop web only) ────────────────────────────────────────────
const SideNav = ({page,setPage,setShowDiag,setShowLifeRecord,setShowWelcome,setShowVideo,setVideoHistory,setShowGame,setShowHandout,setHandoutHistory,plan,darkMode,setDarkMode,onSignOut,mobileOpen,setMobileOpen}) => {
  const T=useTheme();
  const navItems=[
    {id:"dashboard",label:"Dashboard",icon:"home"},
    {id:"live",label:"Live",icon:"pin"},
    {id:"bond",label:"Bond",icon:"heart"},
    {id:"learn",label:"Learn",icon:"book"},
    {id:"calendar",label:"Calendar",icon:"calendar"},
    {id:"store",label:"Store",icon:"bag"},
    {id:"share",label:"Share & Refer",icon:"paw"},
  ];
  const sidebarBg = T.navBarBg;
  const activeText = T.navActiveText;
  const mutedText = T.navText;
  return (
    <>
      {/* Mobile drawer backdrop — tapping it closes the nav */}
      <div className={`sidebar-backdrop${mobileOpen?" open":""}`} onClick={()=>setMobileOpen&&setMobileOpen(false)}/>
      <div className={`web-sidebar${mobileOpen?" open":""}`} style={{background:sidebarBg,borderRight:`1px solid ${T.navBarBorder}`}}>
        {/* Logo area */}
        <div style={{padding:"28px 22px 20px",borderBottom:`1px solid ${T.navBarDivider}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <LogoImg size={40}/>
            <div>
              <div style={{fontSize:"13px",fontWeight:"900",color:T.navLogoText,letterSpacing:".08em",lineHeight:1.1}}>GUIDING PAW</div>
              <div style={{fontSize:"9px",color:T.navLogoSub,letterSpacing:".2em",fontWeight:"600"}}>TRAINING</div>
            </div>
          </div>
          <button onClick={()=>setMobileOpen&&setMobileOpen(false)} className="hamburger-btn" style={{color:mutedText}}>
            <Icon name="x" size={18}/>
          </button>
        </div>
        {/* Nav items */}
        <div style={{flex:1,overflowY:"auto",paddingTop:"10px"}}>
          {navItems.map(item=>{
            const isActive=page===item.id;
            return (
              <button key={item.id} className={`sidebar-nav-btn${isActive?" active":""}`}
                onClick={()=>{setPage(item.id);setShowDiag&&setShowDiag(false);setShowLifeRecord&&setShowLifeRecord(false);setShowWelcome&&setShowWelcome(false);setShowVideo&&setShowVideo(null);setVideoHistory&&setVideoHistory([]);setShowGame&&setShowGame(null);setShowHandout&&setShowHandout(null);setHandoutHistory&&setHandoutHistory([]);setMobileOpen&&setMobileOpen(false);}}
                style={{color:isActive?activeText:mutedText,borderRight:isActive?`3px solid ${T.navActiveText}`:"3px solid transparent"}}>
                <span style={{width:"20px",display:"flex",justifyContent:"center"}}><Icon name={item.icon} size={17}/></span>
                <span style={{fontSize:"13px",fontWeight:isActive?"700":"500"}}>{item.label}</span>
              </button>
            );
          })}
        </div>
        {/* Bottom: theme toggle + sign out */}
        <div style={{padding:"16px 22px",borderTop:`1px solid ${T.navBarDivider}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
          <button onClick={onSignOut} style={{background:"none",border:"none",cursor:"pointer",fontSize:"11px",color:T.navSignOut,fontFamily:"'Lato',sans-serif",letterSpacing:".08em"}}>Sign out</button>
        </div>
      </div>
    </>
  );
};

const ScrollBody = ({children,pad="26px"}) => <div style={{flex:1,overflowY:"auto",padding:pad}}>{children}</div>;

// ─── PET SWITCHER ─────────────────────────────────────────────────────────────
// Lets a household with more than one pet flip between which pet's training
// (dashboard, curriculum, streak — everything) the app is currently showing.
// Only renders once there's actually more than one pet to switch between,
// so single-pet households never see it. Placed in the top bar so it's
// visible on every screen, not tucked away in Settings.
const PetSwitcher = ({pets=[], activePetId, onSwitch}) => {
  const T=useTheme();
  const [open,setOpen]=useState(false);
  if (pets.length < 2) return null;
  const active = pets.find(p=>p.id===activePetId) || pets[0];
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} title="Switch which pet you're viewing"
        style={{display:"flex",alignItems:"center",gap:"6px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"20px",padding:"7px 13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
        <Icon name="paw" size={13} color={T.gold}/>
        <span style={{fontSize:"12.5px",fontWeight:"700",color:T.text,maxWidth:"110px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{active?.name || "Pet"}</span>
        <span style={{fontSize:"9px",color:T.textMuted}}>▾</span>
      </button>
      {open&&(
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:998}}/>
          <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,minWidth:"180px",background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"12px",boxShadow:"0 8px 24px rgba(0,0,0,.18)",zIndex:999,overflow:"hidden"}}>
            <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",padding:"10px 14px 6px",margin:0}}>Switch Pet</p>
            {pets.map(p=>(
              <button key={p.id} onClick={()=>{onSwitch(p.id);setOpen(false);}}
                style={{width:"100%",textAlign:"left",padding:"10px 14px",background:p.id===activePetId?"rgba(176,141,87,.14)":"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:"8px",fontFamily:"'Lato',sans-serif"}}>
                <Icon name="paw" size={13} color={p.id===activePetId?T.gold:T.textFaint}/>
                <span style={{fontSize:"13px",fontWeight:p.id===activePetId?"700":"500",color:p.id===activePetId?T.gold:T.text}}>{p.name || "Unnamed pet"}</span>
                {p.id===activePetId&&<Icon name="check" size={12} color={T.gold} style={{marginLeft:"auto"}}/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};


// ─── PROTECTED MEDIA WRAPPER ──────────────────────────────────────────────────
// Wraps any handout PDF, image, or video to prevent right-click save / download.
// In production: serve assets via signed URLs that expire; never expose direct S3/CDN links.
const ProtectedMedia = ({children, type="image"}) => {
  const handleContextMenu=(e)=>e.preventDefault();
  const handleDragStart=(e)=>e.preventDefault();
  const handleKeyDown=(e)=>{ if((e.ctrlKey||e.metaKey)&&(e.key==="s"||e.key==="p"||e.key==="S"||e.key==="P")) e.preventDefault(); };
  return (
    <div
      className="protected-content-wrap"
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onKeyDown={handleKeyDown}
      style={{position:"relative",userSelect:"none",WebkitUserSelect:"none"}}
    >
      {children}
      {/* Transparent overlay blocks right-click on images/PDFs */}
      <div style={{position:"absolute",inset:0,zIndex:5,background:"transparent"}} onContextMenu={handleContextMenu}/>
    </div>
  );
};

// ─── BOTTOM NAV ────────────────────────────────────────────────────────────────
// Great-circle distance between two {lat,lng} points, in miles — used to turn
// real GPS coordinates into an actual walked distance.
function haversineMiles(a,b){
  if(!a||!b) return 0;
  const R=3958.8; // Earth radius, miles
  const toRad=(d)=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
  const lat1=toRad(a.lat), lat2=toRad(b.lat);
  const h=Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

const BottomNav = ({active,setPage,plan,showPlus,setShowPlus,onQuickAdd,walkLog=[],setWalkLog,petData,setPetData,petId=null}) => {
  const T=useTheme();
  const [quickNote,setQuickNote]=useState("");
  const [quickType,setQuickType]=useState(null);
  const [walkActive,setWalkActive]=useState(false);
  const [walkStart,setWalkStart]=useState(null);
  const [walkElapsed,setWalkElapsed]=useState(0);
  const [walkPoints,setWalkPoints]=useState([]); // real GPS coords (or simulated fallback)
  // "locating" while we wait for the first fix, "active" once the browser is giving us
  // real coordinates, "denied" if the person said no, "unsupported" if this browser/device
  // has no Geolocation API at all (falls back to an estimate either way).
  const [gpsStatus,setGpsStatus]=useState("idle");
  const watchIdRef=useRef(null);

  // Fallback base coords (Salt Lake City area) — only used when real GPS isn't available.
  const BASE_LAT=40.7608, BASE_LNG=-111.8910;
  const usingRealGps = gpsStatus==="active";

  const clearGpsWatch=()=>{
    if(watchIdRef.current!=null && typeof navigator!=="undefined" && navigator.geolocation){
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current=null;
  };
  // Always stop watching location if the component unmounts mid-walk.
  useEffect(()=>()=>clearGpsWatch(),[]);

  // Walk timer tick. When real device GPS isn't available (desktop without location
  // permission, browser without support, etc.) we still simulate gentle movement every
  // 5 seconds so the walk can be tracked and logged either way.
  useEffect(()=>{
    if(!walkActive||!walkStart) return;
    const id=setInterval(()=>{
      const secs=Math.floor((Date.now()-walkStart)/1000);
      setWalkElapsed(secs);
      if(!usingRealGps && secs%5===0){
        setWalkPoints(pts=>{
          const last=pts[pts.length-1]||{lat:BASE_LAT,lng:BASE_LNG};
          return [...pts,{
            lat:last.lat+(Math.random()-.48)*0.0005,
            lng:last.lng+(Math.random()-.45)*0.0007,
          }];
        });
      }
    },1000);
    return ()=>clearInterval(id);
  },[walkActive,walkStart,usingRealGps]);

  const fmtDuration=(secs)=>{ const m=Math.floor(secs/60),s=secs%60; return `${m}m ${s.toString().padStart(2,"0")}s`; };
  // Estimated ~3 mph pace fallback (used only while GPS is unavailable): 1 mile per 20 min
  const simDistanceMi=(secs)=>parseFloat(((secs/60)/20).toFixed(2));

  // Real distance walked so far, computed from actual GPS fixes.
  const realDistanceMi=()=>{
    let d=0;
    for(let i=1;i<walkPoints.length;i++) d+=haversineMiles(walkPoints[i-1],walkPoints[i]);
    return d;
  };

  const liveDistanceMi = usingRealGps && walkPoints.length>=2
    ? parseFloat(realDistanceMi().toFixed(2))
    : simDistanceMi(walkElapsed);

  const livePace=(secs,mi)=>{ if(mi<0.01) return "--'--\""; const paceMin=(secs/60)/mi; const pm=Math.floor(paceMin),ps=Math.round((paceMin-pm)*60); return `${pm}'${ps.toString().padStart(2,"0")}\"`; };

  // Starts tracking the walk using the device's real GPS (works on phones via the
  // location chip, and on laptops/desktops via the browser's Geolocation API — most
  // desktop browsers resolve an approximate Wi-Fi/IP-based location). Falls back to
  // a distance estimate if location isn't available or permission is declined, so the
  // walk can always still be tracked and logged.
  const startWalk=()=>{
    setWalkActive(true);
    setWalkStart(Date.now());
    setWalkElapsed(0);
    setWalkPoints([]);
    setShowPlus(false);
    setQuickType(null);

    if(typeof navigator!=="undefined" && navigator.geolocation){
      setGpsStatus("locating");
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos)=>{
          setGpsStatus("active");
          const {latitude,longitude}=pos.coords;
          setWalkPoints(pts=>[...pts,{lat:latitude,lng:longitude,t:Date.now()}]);
        },
        ()=>{
          // Permission denied, or location unavailable — keep the walk running with
          // the simulated-distance fallback instead of blocking the person.
          setGpsStatus("denied");
          setWalkPoints(pts=>pts.length?pts:[{lat:BASE_LAT,lng:BASE_LNG}]);
        },
        {enableHighAccuracy:true, maximumAge:2000, timeout:12000}
      );
    } else {
      setGpsStatus("unsupported");
      setWalkPoints([{lat:BASE_LAT,lng:BASE_LNG}]);
    }
  };

  const stopWalk=()=>{
      const secs=walkElapsed;
      const distanceMi=liveDistanceMi;
      const walkStartIso = walkStart ? new Date(walkStart).toISOString() : new Date(Date.now()-secs*1000).toISOString();
      const walkEndIso = new Date().toISOString();
      const entryId = walkStart || Date.now();
      const entry={
        id:entryId,
        date:new Date().toLocaleDateString(),
        time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
        duration:fmtDuration(secs),
        distanceMi,
        pace:livePace(secs,distanceMi),
        points:[...walkPoints],
        gpsSource:usingRealGps?"device-gps":"estimated",
        appleHealthSynced:false, // patched with the real result once the write below resolves
      };
      setWalkLog&&setWalkLog(l=>[entry,...l]);
      // Save the completed walk to the pet's profile so it shows up in the Pet Life Record.
      setPetData&&setPetData(d=>({
        ...d,
        walkLog:[entry, ...(d?.walkLog||[])],
        totalWalks:(d?.totalWalks||0)+1,
        totalWalkMiles:parseFloat((((d?.totalWalkMiles||0))+entry.distanceMi).toFixed(2)),
      }));

      // Actually write to Apple Health / Health Connect, then patch the log
      // entry with whether it really succeeded.
      writeWalkToHealth({startDate:walkStartIso, endDate:walkEndIso, distanceMi, durationSec:secs})
          .then(synced=>{
            setWalkLog&&setWalkLog(l=>l.map(e=>e.id===entryId?{...e,appleHealthSynced:synced}:e));
            setPetData&&setPetData(d=>({...d, walkLog:(d?.walkLog||[]).map(e=>e.id===entryId?{...e,appleHealthSynced:synced}:e)}));
          });

      clearGpsWatch();
      setGpsStatus("idle");
      setWalkActive(false);
      setWalkStart(null);
      setWalkElapsed(0);
      setWalkPoints([]);
      setPage("live");
  };

  const cancelWalk=()=>{
    clearGpsWatch();
    setGpsStatus("idle");
    setWalkActive(false);
    setWalkStart(null);
    setWalkElapsed(0);
    setWalkPoints([]);
  };

  const restartWalk=()=>{
    setWalkStart(Date.now());
    setWalkElapsed(0);
    setWalkPoints(usingRealGps?[]:[{lat:BASE_LAT,lng:BASE_LNG}]);
  };
  const [fileUploadBusy,setFileUploadBusy]=useState(false);
  const handleFileUpload=(type)=>{
    const input=document.createElement("input");
    input.type="file";
    input.accept=".pdf,.jpg,.jpeg,.png,.doc,.docx";
    input.onchange=async(e)=>{
      const file=e.target.files[0];
      if(!file) return;
      if(!petId){
        // No real pet id yet (e.g. still mid-onboarding) — nothing to upload to.
        setShowPlus(false); setQuickType(null);
        return;
      }
      setFileUploadBusy(true);
      const uploaded=await uploadPetDocument(petId, file, type);
      setFileUploadBusy(false);
      if(uploaded) onQuickAdd&&onQuickAdd(uploaded);
      setShowPlus(false);
      setQuickType(null);
    };
    input.click();
  };

  const handleSaveNote=(type)=>{
    if(!quickNote.trim()) return;
    onQuickAdd&&onQuickAdd({name:quickNote,type,date:new Date().toLocaleDateString(),url:null});
    setQuickNote("");
    setQuickType(null);
    setShowPlus(false);
  };

  return (
    <div style={{position:"relative",flexShrink:0}}>
      {/* Active walk banner */}
      {walkActive&&(
        <div style={{position:"absolute",bottom:"72px",left:0,right:0,background:"linear-gradient(90deg,rgba(47,79,62,.97),rgba(28,40,60,.97))",border:`1px solid rgba(76,175,125,.5)`,borderRadius:"16px 16px 0 0",padding:"12px 18px",zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <div style={{width:"9px",height:"9px",borderRadius:"50%",background:"#4caf7d",boxShadow:"0 0 0 4px rgba(76,175,125,.3)",animation:"pulse 1.5s infinite",flexShrink:0}}/>
              <div>
                <p style={{fontSize:"11px",color:"#4caf7d",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase"}}>Walk in Progress</p>
                <p style={{fontSize:"9.5px",color:"rgba(255,255,255,.55)",marginTop:"1px",display:"flex",alignItems:"center",gap:"3px"}}>
                  <Icon name="pin" size={9}/>
                  {gpsStatus==="active"?"Live GPS tracking":gpsStatus==="locating"?"Finding your location…":gpsStatus==="denied"?"Location unavailable — estimating distance":gpsStatus==="unsupported"?"GPS not supported here — estimating distance":"Starting…"}
                </p>
              </div>
            </div>
            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
              <button onClick={restartWalk} style={{padding:"6px 11px",background:"rgba(176,141,87,.18)",border:"1.5px solid rgba(176,141,87,.6)",borderRadius:"9px",color:"#c9a870",fontWeight:"900",fontSize:"10px",cursor:"pointer",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",gap:"4px"}} title="Restart walk timer"><Icon name="refresh" size={11}/>Restart</button>
              <button onClick={cancelWalk} style={{padding:"6px 11px",background:"rgba(28,38,54,.4)",border:"1.5px solid rgba(216,198,174,.3)",borderRadius:"9px",color:"rgba(216,198,174,.7)",fontWeight:"900",fontSize:"10px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}} title="Cancel walk without saving"><Icon name="x" size={11} style={{marginRight:"2px"}}/>Cancel</button>
              <button onClick={stopWalk} style={{padding:"6px 11px",background:"rgba(224,122,95,.18)",border:"1.5px solid #e07a5f",borderRadius:"9px",color:"#e07a5f",fontWeight:"900",fontSize:"11px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>Stop & Log</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
            {[
              {label:"Duration",value:fmtDuration(walkElapsed)},
              {label:"Distance",value:`${liveDistanceMi} mi`},
              {label:"Pace",value:livePace(walkElapsed,liveDistanceMi)},
            ].map(({label,value})=>(
              <div key={label} style={{background:"rgba(0,0,0,.25)",borderRadius:"8px",padding:"7px 10px",textAlign:"center"}}>
                <p style={{fontSize:"9px",color:"rgba(255,255,255,.5)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"2px"}}>{label}</p>
                <p style={{fontSize:"14px",fontWeight:"900",color:"#fff",fontVariantNumeric:"tabular-nums"}}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPlus&&!walkActive&&(
        <>
        {/* Backdrop: click outside to close */}
        <div onClick={()=>{setShowPlus(false);setQuickType(null);setQuickNote("");}} style={{position:"fixed",inset:0,zIndex:49,background:"transparent",cursor:"default"}}/>
        <div className="rise" style={{position:"absolute",bottom:"72px",left:0,right:0,background:T.mode==="dark"?"#162032":T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"16px 16px 0 0",padding:"16px 20px",zIndex:50,boxShadow:"0 -10px 30px rgba(0,0,0,.3)"}}>
          <p style={{fontSize:"10px",fontWeight:"900",letterSpacing:".14em",color:T.gold,textTransform:"uppercase",marginBottom:"10px"}}>Quick Add</p>

          {!quickType&&(
            <>
              {[
                {id:"walk",label:"Start a Walk",desc:"Track walk duration",icon:"dog"},
                {id:"homework",label:"Homework Assignment"},
                {id:"progress",label:"Progress Notes"},
              ].map(item=>(
                <button key={item.id}
                  onClick={()=>{
                    if(item.id==="walk"){ startWalk(); return; }
                    setQuickType(item.id);
                  }}
                  style={{display:"block",width:"100%",textAlign:"left",padding:"10px 0",background:"none",border:"none",borderBottom:`1px solid ${T.divider}`,color:item.id==="walk"?"#4caf7d":T.text,fontSize:"13.5px",cursor:"pointer",fontFamily:"'Lato',sans-serif",fontWeight:item.id==="walk"?"700":"400"}}>
                  {item.icon&&<Icon name={item.icon} size={12} style={{marginRight:"5px"}}/>}{item.label}
                </button>
              ))}
            </>
          )}

          {quickType&&(
            <div>
              <p style={{fontSize:"12px",fontWeight:"700",color:T.gold,marginBottom:"10px",textTransform:"capitalize"}}>{quickType === "homework" ? "Homework Assignment" : "Progress Notes"}</p>
              <textarea
                value={quickNote} onChange={e=>setQuickNote(e.target.value)}
                placeholder={quickType==="homework"?"Describe the homework assignment…":"Add a progress note…"}
                style={{width:"100%",padding:"10px 12px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13px",color:T.text,outline:"none",minHeight:"72px",resize:"none",fontFamily:"'Lato',sans-serif",marginBottom:"8px"}}
              />
              <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                <button onClick={()=>handleSaveNote(quickType)} style={{flex:1,padding:"9px",background:T.gold,border:"none",borderRadius:"9px",color:"#fff",fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>Save Note</button>
                <button onClick={()=>handleFileUpload(quickType)} disabled={fileUploadBusy} style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"9px",color:T.gold,fontWeight:"700",fontSize:"12px",cursor:fileUploadBusy?"wait":"pointer",fontFamily:"'Lato',sans-serif",opacity:fileUploadBusy?.6:1}}>{fileUploadBusy?"Uploading…":"Upload File"}</button>
              </div>
              <button onClick={()=>{setQuickType(null);setQuickNote("");}} style={{background:"none",border:"none",color:T.textFaint,fontSize:"11px",cursor:"pointer"}}>← Back</button>
            </div>
          )}

          {!quickType&&<button onClick={()=>setShowPlus(false)} style={{marginTop:"10px",background:"none",border:"none",color:T.textFaint,fontSize:"12px",cursor:"pointer"}}><Icon name="x" size={11} style={{marginRight:"2px"}}/>Close</button>}
        </div>
        </>
      )}
      {/* Nav bar with labels, plus the quick-add button centered in the middle */}
      <div style={{display:"flex",alignItems:"center",background:T.navBarBg,borderTop:`2px solid ${T.mode==="dark"?"rgba(176,141,87,0.3)":"rgba(28,38,54,0.15)"}`,padding:"6px 0 8px",transition:"background .4s"}}>
        {[
          {id:"dashboard",label:"Home",icon:"home"},
          {id:"live",label:"Live",icon:"heart"},
          {id:"bond",label:"Bond",icon:"handshake"},
        ].map(({id,label,icon})=>(
          <button key={id} onClick={()=>setPage(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",background:"none",border:"none",cursor:"pointer",color:active===id?T.navActiveText:T.navTextStrong,transition:"color .2s"}}>
            <Icon name={icon} size={18}/>
            <span style={{fontSize:"8px",fontWeight:"700",letterSpacing:".06em",textTransform:"uppercase"}}>{label}</span>
          </button>
        ))}
        <div style={{flex:1,display:"flex",justifyContent:"center"}}>
          <button onClick={()=>{setShowPlus(v=>!v);setQuickType(null);setQuickNote("");}} title="Quick add" style={{width:"46px",height:"46px",borderRadius:"50%",background:`linear-gradient(135deg,${T.gold},${T.brown})`,border:`3px solid ${T.navBarBg}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 16px rgba(176,141,87,.45)",marginTop:"-16px",transition:"all .2s",color:"#fff"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <Icon name="plus" size={20} strokeWidth={2.5}/>
          </button>
        </div>
        {[
          {id:"learn",label:"Learn",icon:"brain"},
          {id:"share",label:"Share",icon:"paw"},
          {id:"store",label:"Shop",icon:"bag"},
        ].map(({id,label,icon})=>(
          <button key={id} onClick={()=>setPage(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",background:"none",border:"none",cursor:"pointer",color:active===id?T.navActiveText:T.navTextStrong,transition:"color .2s"}}>
            <Icon name={icon} size={18}/>
            <span style={{fontSize:"8px",fontWeight:"700",letterSpacing:".06em",textTransform:"uppercase"}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: SIGN IN — real auth via the "login" Edge Function, which enforces
// the account lockout server-side (see supabase/functions/login) instead of
// calling supabase.auth.signInWithPassword directly.
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_ATTEMPTS = 5; // must match MAX_ATTEMPTS in supabase/functions/login

const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const validatePassword = (p) => p.length >= 8;

// ─── NEW-PASSWORD REQUIREMENTS (registration + change password) ─────────────
const PASSWORD_MIN_LENGTH = 10;
const checkPasswordRequirements = (pw="") => ({
  length: pw.length >= PASSWORD_MIN_LENGTH,
  upper:  /[A-Z]/.test(pw),
  special:/[^A-Za-z0-9]/.test(pw),
  number: /[0-9]/.test(pw),
});
// Auto-capitalizes the first letter of each word as the person types — handles
// hyphenated and apostrophe names reasonably (e.g. "mary-jane" → "Mary-Jane").
const capitalizeName = (str="") =>
  str.replace(/(^|[\s\-'])([a-zà-ÿ])/g, (m, sep, ch) => sep + ch.toUpperCase());

const isPasswordValid = (pw="") => {
  const r = checkPasswordRequirements(pw);
  return r.length && r.upper && r.special && r.number;
};
// red = doesn't meet requirements, yellow = meets minimum requirements, green = meets requirements with extra strength
const getPasswordStrength = (pw="") => {
  if(!pw) return {level:"none", label:"", color:""};
  if(!isPasswordValid(pw)) return {level:"red", label:"Weak", color:"#e07a5f"};
  const hasLower = /[a-z]/.test(pw);
  const extraLength = pw.length >= 14;
  const varietyBonus = (hasLower?1:0) + (extraLength?1:0);
  if(varietyBonus >= 1) return {level:"green", label:"Strong", color:"#4caf7d"};
  return {level:"yellow", label:"Good", color:"#f0a058"};
};
const generateSecurePassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const numbers = "23456789";
  const special = "!@#$%^&*?";
  const all = upper+lower+numbers+special;
  const pick = (s) => s[Math.floor(Math.random()*s.length)];
  let chars = [pick(upper), pick(lower), pick(numbers), pick(special)];
  for(let i=0;i<8;i++) chars.push(pick(all));
  for(let i=chars.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [chars[i],chars[j]]=[chars[j],chars[i]]; }
  return chars.join("");
};

// Red / Yellow / Green strength meter — used wherever a new password is being created
const PasswordStrengthMeter = ({pw}) => {
  const T=useTheme();
  if(!pw) return null;
  const s = getPasswordStrength(pw);
  const order = {red:1, yellow:2, green:3};
  const filled = order[s.level]||0;
  return (
    <div style={{marginTop:"8px"}}>
      <div style={{display:"flex",gap:"3px",marginBottom:"4px"}}>
        {[1,2,3].map(i=>(
          <div key={i} style={{flex:1,height:"4px",borderRadius:"2px",background:i<=filled?s.color:(T.mode==="dark"?"rgba(255,255,255,.1)":"rgba(28,38,54,.1)"),transition:"background .3s"}}/>
        ))}
      </div>
      <p style={{fontSize:"10px",color:s.color,fontWeight:"700"}}>{s.label}</p>
    </div>
  );
};

// Live checklist of password requirements — used wherever a new password is being created
const PasswordChecklist = ({pw}) => {
  const T=useTheme();
  const r = checkPasswordRequirements(pw||"");
  const items = [
    {ok:r.length,  label:`At least ${PASSWORD_MIN_LENGTH} characters`},
    {ok:r.upper,   label:"1 capital letter"},
    {ok:r.special, label:"1 special character"},
    {ok:r.number,  label:"1 number"},
  ];
  return (
    <div style={{marginTop:"9px",display:"flex",flexDirection:"column",gap:"4px"}}>
      {items.map((it,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:"7px"}}>
          <span style={{width:"14px",height:"14px",borderRadius:"50%",border:`1.5px solid ${it.ok?"#4caf7d":T.chipBorder}`,background:it.ok?"#4caf7d":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {it.ok && <Icon name="check" size={9} color="#fff" strokeWidth={3}/>}
          </span>
          <span style={{fontSize:"11px",color:it.ok?T.textMuted:T.textFaint}}>{it.label}</span>
        </div>
      ))}
    </div>
  );
};

// Reusable "Generate secure password" button
const GeneratePasswordBtn = ({onGenerate}) => {
  const T=useTheme();
  return (
    <button type="button" onClick={onGenerate}
      style={{marginTop:"8px",background:"none",border:"none",cursor:"pointer",color:T.gold,fontSize:"11.5px",fontWeight:"700",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",gap:"5px",padding:0}}>
      <Icon name="dice" size={12} style={{marginRight:"4px"}}/>Generate secure password
    </button>
  );
};

// ─── INACTIVITY TIMEOUT ──────────────────────────────────────────────────────
// How long the person can be inactive before they're automatically signed out.
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

// ─── COUNTRY / PHONE VALIDATION ──────────────────────────────────────────────
// Dial code + expected national significant-number length (digits only, not
// counting the country code) for common countries. The person picks their
// country first so we know which format to validate their phone number against.
const COUNTRIES = [
  {code:"US",name:"United States",dial:"+1",digits:10},
  {code:"CA",name:"Canada",dial:"+1",digits:10},
  {code:"GB",name:"United Kingdom",dial:"+44",digits:10},
  {code:"AU",name:"Australia",dial:"+61",digits:9},
  {code:"NZ",name:"New Zealand",dial:"+64",digits:9},
  {code:"IE",name:"Ireland",dial:"+353",digits:9},
  {code:"MX",name:"Mexico",dial:"+52",digits:10},
  {code:"DE",name:"Germany",dial:"+49",digits:10},
  {code:"FR",name:"France",dial:"+33",digits:9},
  {code:"ES",name:"Spain",dial:"+34",digits:9},
  {code:"IT",name:"Italy",dial:"+39",digits:10},
  {code:"NL",name:"Netherlands",dial:"+31",digits:9},
  {code:"PT",name:"Portugal",dial:"+351",digits:9},
  {code:"SE",name:"Sweden",dial:"+46",digits:9},
  {code:"NO",name:"Norway",dial:"+47",digits:8},
  {code:"DK",name:"Denmark",dial:"+45",digits:8},
  {code:"IN",name:"India",dial:"+91",digits:10},
  {code:"JP",name:"Japan",dial:"+81",digits:10},
  {code:"CN",name:"China",dial:"+86",digits:11},
  {code:"BR",name:"Brazil",dial:"+55",digits:11},
  {code:"ZA",name:"South Africa",dial:"+27",digits:9},
  {code:"SG",name:"Singapore",dial:"+65",digits:8},
  {code:"PH",name:"Philippines",dial:"+63",digits:10},
];
const findCountry = (code) => COUNTRIES.find(c=>c.code===code) || COUNTRIES[0];

// Email needs an "@" and a "." after it, with something on either side.
const isValidEmail = (email="") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Phone number just needs to have exactly the number of digits expected for
// the chosen country (ignoring spaces, dashes, parentheses, etc).
const isValidPhone = (phone="", countryCode="US") => {
  const digits = (phone||"").replace(/\D/g,"");
  const country = findCountry(countryCode);
  return digits.length === country.digits;
};

// Reusable "choose country, then enter phone number" field with inline
// format validation. Used at initial account setup and in Settings.
const PhoneField = ({label="Phone Number", countryCode, onCountryChange, phone, onPhoneChange, error, onFocusClear}) => {
  const T=useTheme();
  const country = findCountry(countryCode);
  return (
    <div>
      <label style={{display:"block",fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:error?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>{label}</label>
      <div style={{display:"flex",gap:"8px"}}>
        <select value={countryCode} onChange={e=>{onCountryChange(e.target.value);onFocusClear&&onFocusClear();}}
          style={{width:"128px",flexShrink:0,padding:"11px 8px",background:T.inputBg,border:`1px solid ${error?T.brown:T.inputBorder}`,borderRadius:"10px",fontSize:"13px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}>
          {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name} ({c.dial})</option>)}
        </select>
        <input type="tel" value={phone} placeholder={`${country.digits}-digit number`}
          onChange={e=>{onPhoneChange(e.target.value.replace(/[^\d\s\-()]/g,""));onFocusClear&&onFocusClear();}}
          style={{flex:1,minWidth:0,padding:"11px 14px",background:T.inputBg,border:`1px solid ${error?T.brown:T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
      </div>
      {error
        ? <p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {error}</p>
        : <p style={{fontSize:"10px",color:T.textFaint,marginTop:"3px"}}>Enter as {country.dial} followed by {country.digits} digits, e.g. {country.dial} {phone||"5551234567"}</p>}
    </div>
  );
};

const SignInScreen = ({onSignIn, goSignUp, darkMode, setDarkMode, kickedMsg="", clearKickedMsg=()=>{}}) => {
  const T = useTheme();
  const [mode, setMode] = useState("signin"); // "signin" | "forgot" | "forgot_sent"
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [lockSecs, setLockSecs] = useState(0);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [shake, setShake] = useState(false);
  const [savedUser, setSavedUser] = useState(null);
  const [autoLogging, setAutoLogging] = useState(false);
  const [expiredNotice, setExpiredNotice] = useState(false);

  // Countdown timer for lockout
  useEffect(()=>{
    if(!lockedUntil) return;
    const id = setInterval(()=>{
      const rem = Math.ceil((lockedUntil - Date.now()) / 1000);
      if(rem <= 0){ setLockedUntil(null); setLockSecs(0); setAttempts(0); clearInterval(id); }
      else setLockSecs(rem);
    }, 1000);
    return ()=>clearInterval(id);
  }, [lockedUntil]);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const triggerShake = () => { setShake(true); setTimeout(()=>setShake(false), 500); };

  const validate = () => {
    const e = {};
    if(!validateEmail(email)) e.email = "Please enter a valid email address.";
    if(!validatePassword(pw)) e.pw = "Password must be at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Sign-in goes through /api/login rather than calling
  // supabase.auth.signInWithPassword directly, so the attempt count and
  // lockout live server-side (in the login_attempts table) and can't be
  // cleared by refreshing the page or editing local state. On success the
  // endpoint hands back a session for this client to adopt.
  const handleSignIn = async () => {
    if(isLocked) return;
    if(!validate()){ triggerShake(); return; }
    setLoading(true);
    setErrors({});
    clearKickedMsg();
    let result = {};
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pw }),
      });
      result = await res.json();
    } catch (err) {
      console.error("[login] request failed:", err);
    }
    setLoading(false);
    if(!result.ok){
      triggerShake();
      if(result.locked){
        const until = new Date(result.lockedUntil).getTime();
        setLockedUntil(until);
        setLockSecs(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
        setAttempts(MAX_ATTEMPTS);
        setErrors({auth: result.message || "Too many failed attempts. Please try again later."});
      } else {
        const remaining = typeof result.attemptsRemaining === "number" ? result.attemptsRemaining : null;
        setAttempts(remaining!==null ? MAX_ATTEMPTS - remaining : 0);
        setErrors({auth: result.message || "Something went wrong. Please try again."});
      }
    } else {
      const { access_token, refresh_token } = result.session;
      await supabase.auth.setSession({ access_token, refresh_token });
      // onAuthStateChange in the root App will handle navigation
      onSignIn();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: oauthRedirectUrl() },
    });
    if(error){ setLoading(false); setErrors({auth: error.message}); }
    // On success, Supabase redirects to Google — onAuthStateChange handles the return
  };

  const handleForgot = async () => {
    if(!validateEmail(forgotEmail)){ setForgotError("Please enter a valid email address."); return; }
    setForgotError("");
    setLoading(true);
    // Explicit redirectTo so the link in the email always points at the live
    // web app rather than whatever Site URL happens to be set in Supabase
    // Auth (which can silently be a dev/localhost value). This URL must also
    // be added to Supabase Auth → URL Configuration → Redirect URLs, or
    // Supabase will reject it and fall back to the (possibly wrong) Site URL.
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: PASSWORD_RESET_REDIRECT_URL,
    });
    setLoading(false);
    if(error){ setForgotError(error.message); }
    else { setMode("forgot_sent"); }
  };

  // ── FORGOT PASSWORD FLOW ──
  if(mode === "forgot" || mode === "forgot_sent") return (
    <PhoneShell>
      <TopBanner/>
      <ScrollBody>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
          <button onClick={()=>setMode("signin")} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"13px",fontWeight:"700",padding:0,fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",gap:"4px"}}
            onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textFaint}>← Back to Sign In</button>
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
        </div>

        {mode==="forgot_sent" ? (
          <div className="s1" style={{textAlign:"center",paddingTop:"20px"}}>
            <div style={{width:"70px",height:"70px",borderRadius:"50%",background:T.success,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",boxShadow:`0 0 0 10px rgba(76,175,125,.1)`,color:"#fff"}}><Icon name="mail" size={32}/></div>
            <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"10px"}}>Check your inbox</h2>
            <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"6px"}}>We sent a password reset link to:</p>
            <p style={{fontSize:"14px",fontWeight:"700",color:T.gold,marginBottom:"22px"}}>{forgotEmail}</p>
            <p style={{fontSize:"12px",color:T.textFaint,lineHeight:1.6,marginBottom:"22px"}}>Didn't get it? Check your spam folder, or{" "}
              <button onClick={()=>setMode("forgot")} style={{background:"none",border:"none",cursor:"pointer",color:T.gold,fontWeight:"700",fontSize:"12px",padding:0,fontFamily:"'Lato',sans-serif"}}>try again</button>.</p>
            <GoldBtn onClick={()=>setMode("signin")}>Back to Sign In</GoldBtn>
          </div>
        ) : (
          <>
            <div className="s1" style={{textAlign:"center",marginBottom:"24px",paddingTop:"10px"}}>
              <div style={{marginBottom:"10px",display:"flex",justifyContent:"center",color:T.gold}}><Icon name="key" size={40}/></div>
              <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Reset Password</h2>
              <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.55}}>Enter your email and we'll send you a reset link.</p>
            </div>
            <div className="s2">
              <div style={{marginBottom:"14px"}}>
                <label style={{display:"block",fontSize:"10px",letterSpacing:".16em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"5px"}}>Email</label>
                <input type="email" value={forgotEmail} onChange={e=>{setForgotEmail(e.target.value);setForgotError("");}} placeholder="you@example.com"
                  style={{width:"100%",padding:"11px 14px",background:T.inputBg,border:`1px solid ${forgotError?T.brown:T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif",transition:"border-color .2s"}}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=forgotError?T.brown:T.inputBorder}/>
                {forgotError&&<p style={{fontSize:"11px",color:"#e07a5f",marginTop:"5px",fontWeight:"600"}}>{forgotError}</p>}
              </div>
              <button onClick={handleForgot} disabled={loading} style={{width:"100%",padding:"13px",background:loading?"rgba(176,141,87,.4)":T.gold,color:"#fff",border:"none",borderRadius:"11px",fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"'Lato',sans-serif",cursor:loading?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
                {loading?<><span style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Sending…</>:"Send Reset Link →"}
              </button>
            </div>
          </>
        )}
      </ScrollBody>
    </PhoneShell>
  );

  // ── AUTO-LOGIN SPLASH ──
  if(autoLogging) return (
    <PhoneShell>
      <TopBanner/>
      <ScrollBody>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"400px",gap:"20px"}}>
          <div style={{position:"relative",display:"inline-block"}}>
            <div style={{position:"absolute",inset:"-10px",borderRadius:"50%",border:`1px solid ${T.gold}`,opacity:.35,animation:"glow 2.8s ease-in-out infinite"}}/>
            <LogoImg size={72}/>
          </div>
          <div style={{textAlign:"center"}}>
            <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Welcome back! <Icon name="paw" size={17} style={{marginLeft:"2px"}}/></h2>
            <p style={{fontSize:"13px",color:T.textMuted}}>Signing you in…</p>
          </div>
          <span style={{width:"22px",height:"22px",border:"3px solid rgba(176,141,87,.3)",borderTopColor:T.gold,borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>
        </div>
      </ScrollBody>
    </PhoneShell>
  );

  // ── MAIN SIGN IN ──
  const inputStyle = (field) => ({
    width:"100%", padding:"11px 14px",
    background: T.inputBg,
    border:`1px solid ${errors[field]?T.brown:T.inputBorder}`,
    borderRadius:"10px", fontSize:"14px", color:T.text, outline:"none",
    fontFamily:"'Lato',sans-serif", transition:"border-color .2s",
  });

  return (
    <PhoneShell>
      <TopBanner/>
      <ScrollBody>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"4px"}}>
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
        </div>

        {/* Logo + tagline */}
        <div className="s1" style={{textAlign:"center",marginBottom:"22px"}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:"12px"}}>
            <div style={{position:"absolute",inset:"-10px",borderRadius:"50%",border:`1px solid ${T.gold}`,opacity:.35,animation:"glow 2.8s ease-in-out infinite"}}/>
            <LogoImg size={72}/>
          </div>
          <h1 style={{fontFamily:"'Inter',serif",fontSize:"26px",fontWeight:"700",color:T.text,marginBottom:"6px"}}>Guiding Paw</h1>
          <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.5,maxWidth:"260px",margin:"0 auto 10px"}}>Your daily guide to raising a well-behaved dog!</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
            {["LIVE","BOND","LEARN"].map((w,i)=>(
              <span key={w} style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <span style={{fontSize:"11px",fontWeight:"900",letterSpacing:".2em",color:T.gold}}>{w}</span>
                {i<2&&<Icon name="paw" size={13} color={T.gold}/>}
              </span>
            ))}
          </div>
        </div>

        {/* Signed out due to inactivity (not a manual sign-out) */}
        {expiredNotice && (
          <div className="s1" style={{background:"rgba(224,122,95,.1)",border:"1px solid rgba(224,122,95,.3)",borderRadius:"12px",padding:"11px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <Icon name="clock" size={16} color="#e07a5f" style={{flexShrink:0}}/>
            <p style={{fontSize:"12px",color:"#e07a5f",fontWeight:"600",lineHeight:1.4}}>You've been signed out after a period of inactivity, for your security. Please sign in again.</p>
          </div>
        )}

        {/* Signed out because this account was logged in on another device */}
        {kickedMsg && (
          <div className="s1" style={{background:"rgba(224,122,95,.1)",border:"1px solid rgba(224,122,95,.3)",borderRadius:"12px",padding:"11px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <Icon name="alert" size={16} color="#e07a5f" style={{flexShrink:0}}/>
            <p style={{fontSize:"12px",color:"#e07a5f",fontWeight:"600",lineHeight:1.4}}>{kickedMsg}</p>
          </div>
        )}

        {/* Saved user greeting */}
        {savedUser && (
          <div className="s1" style={{background:"rgba(176,141,87,.09)",border:`1px solid rgba(176,141,87,.25)`,borderRadius:"12px",padding:"11px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"34px",height:"34px",borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff"}}><Icon name="paw" size={17}/></div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:"11px",color:T.textFaint,marginBottom:"1px"}}>Signing in as</p>
              <p style={{fontSize:"13px",fontWeight:"700",color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{savedUser}</p>
            </div>
            <button onClick={()=>{clearSavedCredentials();setSavedUser(null);setEmail("");setPw("");setRememberMe(false);}}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:"11px",color:T.textFaint,fontFamily:"'Lato',sans-serif",flexShrink:0,padding:"4px 6px",borderRadius:"6px",transition:"all .18s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(176,141,87,.12)";e.currentTarget.style.color=T.text;}}
              onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=T.textFaint;}}>
              Not you?
            </button>
          </div>
        )}

        {/* Auth error banner */}
        {errors.auth&&(
          <div style={{background:"rgba(163,86,42,.15)",border:"1px solid rgba(163,86,42,.4)",borderRadius:"10px",padding:"10px 14px",marginBottom:"14px",display:"flex",gap:"8px",alignItems:"flex-start",animation:shake?"shake .4s":"none"}}>
            <span style={{fontSize:"15px",flexShrink:0}}><Icon name={isLocked?"lock":"alert"} size={15}/></span>
            <div>
              <p style={{fontSize:"12px",color:"#e07a5f",fontWeight:"700",marginBottom:isLocked?3:0}}>{errors.auth}</p>
              {isLocked&&<p style={{fontSize:"11px",color:T.textMuted}}>Try again in <strong style={{color:T.gold}}>{lockSecs}s</strong></p>}
            </div>
          </div>
        )}

        <div className="s2" style={{animation:shake?"shake .4s":"none"}}>
          {/* Email */}
          <div style={{marginBottom:"14px"}}>
            <label style={{display:"block",fontSize:"10px",letterSpacing:".16em",textTransform:"uppercase",color:errors.email?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>Email</label>
            <input type="email" value={email} placeholder="you@example.com" onChange={e=>{setEmail(e.target.value);setErrors(r=>({...r,email:undefined,auth:undefined}));}}
              style={inputStyle("email")}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors.email?T.brown:T.inputBorder}/>
            {errors.email&&<p style={{fontSize:"11px",color:"#e07a5f",marginTop:"4px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {errors.email}</p>}
          </div>

          {/* Password with show/hide */}
          <div style={{marginBottom:"8px"}}>
            <label style={{display:"block",fontSize:"10px",letterSpacing:".16em",textTransform:"uppercase",color:errors.pw?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>Password</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={pw} placeholder="Min 8 characters" onChange={e=>{setPw(e.target.value);setErrors(r=>({...r,pw:undefined,auth:undefined}));}}
                onKeyDown={e=>{ if(e.key==="Enter" && !loading && !isLocked) handleSignIn(); }}
                style={{...inputStyle("pw"),paddingRight:"44px"}}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors.pw?T.brown:T.inputBorder}/>
              <button onClick={()=>setShowPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}>
                <Icon name={showPw?"eyeOff":"eye"} size={16}/>
              </button>
            </div>
            {errors.pw&&<p style={{fontSize:"11px",color:"#e07a5f",marginTop:"4px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {errors.pw}</p>}
          </div>

          {/* Remember me + Forgot password */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
            <label style={{display:"flex",alignItems:"center",gap:"7px",cursor:"pointer"}}>
              <div onClick={()=>setRememberMe(v=>!v)} style={{width:"18px",height:"18px",borderRadius:"5px",border:`2px solid ${rememberMe?T.gold:T.inputBorder}`,background:rememberMe?"rgba(176,141,87,.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",cursor:"pointer"}}>
                {rememberMe&&<Icon name="check" size={11} color={T.gold} strokeWidth={3}/>}
              </div>
              <span style={{fontSize:"12px",color:T.textMuted,userSelect:"none"}}>Remember me</span>
            </label>
            <TextLink onClick={()=>{setForgotEmail(email);setForgotError("");setMode("forgot");}}>Forgot password?</TextLink>
          </div>

          {/* Sign in button */}
          <button onClick={handleSignIn} disabled={loading||isLocked} style={{
            width:"100%",padding:"13px",borderRadius:"11px",border:"none",
            background: isLocked?"rgba(128,128,128,.2)":loading?"rgba(176,141,87,.4)":T.gold,
            color: isLocked?"rgba(216,198,174,.3)":"#fff",
            fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Lato',sans-serif",cursor:loading||isLocked?"not-allowed":"pointer",
            boxShadow:isLocked?"none":"0 4px 18px rgba(176,141,87,.28)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:"all .2s",
          }}>
            {isLocked
              ? <><Icon name="lock" size={13}/>{`Locked (${lockSecs}s)`}</>
              : loading
                ? <><span style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Signing in…</>
                : "Sign In"}
          </button>

          {/* Attempts bar */}
          {attempts > 0 && !isLocked && (
            <div style={{marginTop:"10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span style={{fontSize:"10px",color:T.textFaint}}>Failed attempts</span>
                <span style={{fontSize:"10px",color:attempts>=3?"#e07a5f":T.textFaint,fontWeight:"700"}}>{attempts}/{MAX_ATTEMPTS}</span>
              </div>
              <div style={{height:"4px",borderRadius:"4px",background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(attempts/MAX_ATTEMPTS)*100}%`,borderRadius:"4px",background:attempts>=4?"#e07a5f":attempts>=3?"#f0a058":T.gold,transition:"width .3s"}}/>
              </div>
            </div>
          )}

          <div style={{margin:"16px 0"}}><Divider/></div>
          <GoogleBtn label="Continue with Google" onClick={handleGoogleSignIn}/>
        </div>

        <p className="s3" style={{textAlign:"center",fontSize:"12.5px",color:T.textMuted,marginTop:"20px"}}>
          New here? <TextLink onClick={goSignUp}>Get started free</TextLink>
        </p>
      </ScrollBody>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: RESET PASSWORD — served at /reset-password, the link sent by
// resetPasswordForEmail (see PASSWORD_RESET_REDIRECT_URL). Supabase's client
// auto-consumes the recovery token in the URL on load (detectSessionInUrl,
// on by default) and fires a PASSWORD_RECOVERY auth event once it does — this
// screen just waits for that (or an already-established session, in case the
// event fired before this component's listener attached) and otherwise shows
// an "invalid or expired" state instead of a stuck spinner.
// ═══════════════════════════════════════════════════════════════════════════════

const ResetPasswordScreen = ({darkMode, setDarkMode}) => {
  const T = useTheme();
  const [status, setStatus] = useState("verifying"); // "verifying" | "form" | "invalid" | "success"
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({data:{session}}) => {
      if(!cancelled && session?.user) setStatus("form");
      else if(!cancelled) setStatus(s => s==="verifying" ? "invalid" : s);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if(event === "PASSWORD_RECOVERY" && session?.user) setStatus("form");
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  const inputStyle = (field) => ({
    width:"100%", padding:"11px 14px",
    background: T.inputBg,
    border:`1px solid ${errors[field]?T.brown:T.inputBorder}`,
    borderRadius:"10px", fontSize:"14px", color:T.text, outline:"none",
    fontFamily:"'Lato',sans-serif", transition:"border-color .2s",
  });

  const handleSubmit = async () => {
    const e = {};
    if(!isPasswordValid(newPw)) e.newPw = `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include a capital letter, a number, and a special character.`;
    if(confirmPw !== newPw) e.confirmPw = "Passwords do not match.";
    setErrors(e);
    if(Object.keys(e).length>0) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if(error){ setErrors({auth: error.message || "Something went wrong. Please try again."}); return; }
    // Sign out of the recovery session — they should log back in fresh with the
    // new password rather than silently land in the app from this device/browser.
    await supabase.auth.signOut();
    setStatus("success");
  };

  const goToSignIn = () => { window.location.href = "/"; };

  return (
    <PhoneShell>
      <TopBanner/>
      <ScrollBody>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"4px"}}>
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
        </div>

        {status==="verifying" && (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <span style={{display:"inline-block",width:"22px",height:"22px",border:"2.5px solid rgba(176,141,87,.3)",borderTopColor:T.gold,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
            <p style={{marginTop:"14px",fontSize:"13px",color:T.textMuted}}>Verifying your reset link…</p>
          </div>
        )}

        {status==="invalid" && (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <Icon name="alert" size={32} color="#e07a5f"/>
            <p style={{marginTop:"14px",fontSize:"15px",fontWeight:"700",color:T.text}}>This link is invalid or has expired</p>
            <p style={{marginTop:"6px",fontSize:"12.5px",color:T.textMuted,lineHeight:1.5}}>Password reset links only work once and expire after a while. Request a new one from the sign-in screen.</p>
            <button onClick={goToSignIn} style={{marginTop:"22px",padding:"12px 22px",borderRadius:"11px",border:"none",background:T.gold,color:"#fff",fontSize:"13px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Back to Sign In
            </button>
          </div>
        )}

        {status==="success" && (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <Icon name="checkCircle" size={36} color={T.success}/>
            <p style={{marginTop:"14px",fontSize:"15px",fontWeight:"700",color:T.text}}>Password updated</p>
            <p style={{marginTop:"6px",fontSize:"12.5px",color:T.textMuted,lineHeight:1.5}}>Sign in with your new password to continue.</p>
            <button onClick={goToSignIn} style={{marginTop:"22px",padding:"12px 22px",borderRadius:"11px",border:"none",background:T.gold,color:"#fff",fontSize:"13px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Continue to Sign In
            </button>
          </div>
        )}

        {status==="form" && (
          <>
            <p style={{fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"4px",fontFamily:"'Inter',serif"}}>Set a new password</p>
            <p style={{fontSize:"12.5px",color:T.textMuted,marginBottom:"20px",lineHeight:1.5}}>Choose a new password for your account.</p>

            {errors.auth && (
              <div style={{background:"rgba(163,86,42,.15)",border:"1px solid rgba(163,86,42,.4)",borderRadius:"10px",padding:"10px 14px",marginBottom:"14px",display:"flex",gap:"8px",alignItems:"flex-start"}}>
                <Icon name="alert" size={15} style={{flexShrink:0}}/>
                <p style={{fontSize:"12px",color:"#e07a5f",fontWeight:"700"}}>{errors.auth}</p>
              </div>
            )}

            <div style={{marginBottom:"14px"}}>
              <label style={{display:"block",fontSize:"10px",letterSpacing:".16em",textTransform:"uppercase",color:errors.newPw?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>New Password</label>
              <div style={{position:"relative"}}>
                <input type={showPw?"text":"password"} value={newPw} placeholder={`Min ${PASSWORD_MIN_LENGTH} characters`}
                  onChange={e=>{setNewPw(e.target.value);setErrors(r=>({...r,newPw:undefined,auth:undefined}));}}
                  style={{...inputStyle("newPw"),paddingRight:"44px"}}/>
                <button onClick={()=>setShowPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textMuted}}>
                  <Icon name={showPw?"eyeOff":"eye"} size={16}/>
                </button>
              </div>
              {errors.newPw&&<p style={{fontSize:"11px",color:"#e07a5f",marginTop:"4px",fontWeight:"600"}}>{errors.newPw}</p>}
              <PasswordStrengthMeter pw={newPw}/>
              <PasswordChecklist pw={newPw}/>
            </div>

            <div style={{marginBottom:"20px"}}>
              <label style={{display:"block",fontSize:"10px",letterSpacing:".16em",textTransform:"uppercase",color:errors.confirmPw?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>Confirm Password</label>
              <input type={showPw?"text":"password"} value={confirmPw} placeholder="Re-enter password"
                onChange={e=>{setConfirmPw(e.target.value);setErrors(r=>({...r,confirmPw:undefined,auth:undefined}));}}
                onKeyDown={e=>{ if(e.key==="Enter" && !saving) handleSubmit(); }}
                style={inputStyle("confirmPw")}/>
              {errors.confirmPw&&<p style={{fontSize:"11px",color:"#e07a5f",marginTop:"4px",fontWeight:"600"}}>{errors.confirmPw}</p>}
            </div>

            <button onClick={handleSubmit} disabled={saving} style={{
              width:"100%",padding:"13px",borderRadius:"11px",border:"none",
              background:saving?"rgba(176,141,87,.4)":T.gold,color:"#fff",
              fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",
              fontFamily:"'Lato',sans-serif",cursor:saving?"not-allowed":"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            }}>
              {saving
                ? <><span style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Saving…</>
                : "Set New Password"}
            </button>
          </>
        )}
      </ScrollBody>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: CHECKOUT COMPLETE — served at /checkout-complete, Stripe Checkout's
// success_url. The webhook (api/stripe-webhook.js), not this page, is the
// source of truth for the actual account/pet writes — a full-page redirect
// destroys React state, so this page only ever polls Supabase for the row
// the webhook creates, then hands off to the normal signed-in app. See
// ResetPasswordScreen above for why this can't just be an early return
// inside the normal screen-driven flow.
// ═══════════════════════════════════════════════════════════════════════════════

const CheckoutCompleteScreen = ({darkMode, setDarkMode}) => {
  const T = useTheme();
  const [status, setStatus] = useState("polling"); // "polling" | "success" | "timeout" | "error"
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if(!session?.user){ if(!cancelled) setStatus("error"); return; }
      const userId = session.user.id;
      const deadline = Date.now() + 15000;
      while(!cancelled && Date.now() < deadline){
        const { data: pet } = await supabase.from("pets").select("id,name").eq("owner_id", userId).order("id",{ascending:false}).limit(1).maybeSingle();
        if(pet){
          const { data: enrollment } = await supabase.from("program_enrollment").select("program").eq("pet_id", pet.id).limit(1).maybeSingle();
          if(!cancelled){
            await claimSessionSlot(userId); // this device becomes the active one, same as an explicit sign-in
            try{ localStorage.removeItem("gp_pending_onboarding"); }catch{}
            setInfo({ program: enrollment?.program || "standard" });
            setStatus("success");
          }
          return;
        }
        await new Promise(r=>setTimeout(r, 1500));
      }
      if(!cancelled) setStatus("timeout");
    };
    poll();
    return () => { cancelled = true; };
  }, []);

  // Signal the normal app shell to show the first-time WelcomeDashboard once
  // it mounts (it can't be set directly — this page is a separate component
  // tree from the root App, and the redirect below is a full page reload).
  const continueToApp = () => {
    try{ localStorage.setItem("gp_show_welcome", "1"); }catch{}
    window.location.href = "/";
  };

  return (
    <PhoneShell>
      <TopBanner/>
      <ScrollBody>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"4px"}}>
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
        </div>

        {status==="polling" && (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <span style={{display:"inline-block",width:"22px",height:"22px",border:"2.5px solid rgba(176,141,87,.3)",borderTopColor:T.gold,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
            <p style={{marginTop:"14px",fontSize:"13px",color:T.textMuted}}>Finalizing your purchase…</p>
          </div>
        )}

        {status==="error" && (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <Icon name="alert" size={32} color="#e07a5f"/>
            <p style={{marginTop:"14px",fontSize:"15px",fontWeight:"700",color:T.text}}>You're not signed in</p>
            <p style={{marginTop:"6px",fontSize:"12.5px",color:T.textMuted,lineHeight:1.5}}>Sign back in to check on your purchase.</p>
            <button onClick={continueToApp} style={{marginTop:"22px",padding:"12px 22px",borderRadius:"11px",border:"none",background:T.gold,color:"#fff",fontSize:"13px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Go to Sign In
            </button>
          </div>
        )}

        {status==="timeout" && (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <Icon name="clock" size={32} color={T.gold}/>
            <p style={{marginTop:"14px",fontSize:"15px",fontWeight:"700",color:T.text}}>Almost there</p>
            <p style={{marginTop:"6px",fontSize:"12.5px",color:T.textMuted,lineHeight:1.5}}>Your payment succeeded — we're still finishing setting up your account. This can take a minute; check back shortly.</p>
            <button onClick={()=>window.location.reload()} style={{marginTop:"22px",padding:"12px 22px",borderRadius:"11px",border:"none",background:T.gold,color:"#fff",fontSize:"13px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Check Again
            </button>
          </div>
        )}

        {status==="success" && (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{width:"80px",height:"80px",borderRadius:"50%",background:T.success,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",boxShadow:"0 0 0 16px rgba(76,175,125,.1)"}}>
              <Icon name="check" size={36} color="#fff" strokeWidth={3}/>
            </div>
            <p style={{marginTop:"20px",fontSize:"11px",fontWeight:"900",letterSpacing:".18em",textTransform:"uppercase",color:T.gold}}>Payment Successful</p>
            <p style={{marginTop:"6px",fontSize:"22px",fontWeight:"700",color:T.text,fontFamily:"'Inter',serif"}}>Welcome to Guiding Paw!</p>
            <p style={{marginTop:"8px",fontSize:"13px",color:T.textMuted,lineHeight:1.5}}>Your <strong style={{color:T.goldL}}>{programLabel(info?.program)}</strong> is unlocked and ready to go.</p>
            <button onClick={continueToApp} style={{marginTop:"24px",width:"100%",padding:"13px",borderRadius:"11px",border:"none",background:T.gold,color:"#fff",fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Let's Get Started
            </button>
          </div>
        )}
      </ScrollBody>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: REGISTRATION — first name, last name, email, password
// ═══════════════════════════════════════════════════════════════════════════════
const RegistrationScreen = ({onVerify, onBack, darkMode, setDarkMode}) => {
  const T = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [phone,     setPhone]     = useState("");
  const [pw,        setPw]        = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [agreedPrivacy,  setAgreedPrivacy]  = useState(false);
  const [agreedTerms,    setAgreedTerms]    = useState(false);
  const [agreedLiability,setAgreedLiability]= useState(false);

  const allAgreed = agreedPrivacy && agreedTerms && agreedLiability;

  const handleGeneratePw = () => {
    const generated = generateSecurePassword();
    setPw(generated); setConfirmPw(generated);
    setShowPw(true); setShowConfirmPw(true);
    setErrors(r=>({...r,pw:undefined,confirmPw:undefined}));
  };

  const validate = () => {
    const e = {};
    if(!firstName.trim())                      e.firstName = "First name is required.";
    if(!lastName.trim())                       e.lastName  = "Last name is required.";
    if(!isValidEmail(email))                   e.email     = "Please enter a valid email (needs an @ and a .).";
    if(!isValidPhone(phone,countryCode))        e.phone     = `Please enter a valid ${findCountry(countryCode).digits}-digit phone number for ${findCountry(countryCode).name}.`;
    if(!isPasswordValid(pw))                   e.pw        = `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include a capital letter, a number, and a special character.`;
    if(confirmPw !== pw)                       e.confirmPw = "Passwords do not match.";
    if(!allAgreed)                             e.legal     = "You must agree to all policies to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [sendError, setSendError] = useState("");

  const handleContinue = async () => {
    if(!validate()) return;
    setLoading(true);
    setSendError("");
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pw,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          country_code: countryCode,
        },
      },
    });
    setLoading(false);
    if(error){
      setSendError(error.message || "We couldn't create your account right now. Please try again in a moment.");
    } else {
      // Create/update contact in GoHighLevel (best-effort — don't block registration)
      fetch("/api/create-contact", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email: email.trim(), firstName, lastName, phone, countryCode }),
      }).catch(()=>{});
      onVerify({ firstName, lastName, email: email.trim(), phone, countryCode, pw });
    }
  };

  const inputStyle = (field) => ({
    width:"100%", padding:"11px 14px",
    background: T.inputBg,
    border:`1px solid ${errors[field] ? T.brown : T.inputBorder}`,
    borderRadius:"10px", fontSize:"14px", color:T.text, outline:"none",
    fontFamily:"'Lato',sans-serif", transition:"border-color .2s",
  });

  return (
    <PhoneShell>
      <TopBanner/>
      <div style={{padding:"10px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:"13px",fontWeight:"700",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",gap:"4px",padding:0}}
          onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>← Sign In</button>
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
      </div>

      <ScrollBody>
        {/* Header */}
        <div className="s1" style={{textAlign:"center",marginBottom:"24px",paddingTop:"8px"}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:"10px"}}>
            <div style={{position:"absolute",inset:"-8px",borderRadius:"50%",border:`1px solid ${T.gold}`,opacity:.3,animation:"glow 2.8s ease-in-out infinite"}}/>
            <LogoImg size={56}/>
          </div>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"5px"}}>Create Your Account</h2>
          <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.5}}>Let's start with your basic info.</p>
        </div>

        <div className="s2">
          {/* Name row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
            {[{key:"firstName",label:"First Name",val:firstName,set:setFirstName,ph:"Jane"},
              {key:"lastName", label:"Last Name", val:lastName, set:setLastName, ph:"Smith"}].map(f=>(
              <div key={f.key}>
                <label style={{display:"block",fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:errors[f.key]?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>{f.label}</label>
                <input value={f.val} placeholder={f.ph} onChange={e=>{f.set(capitalizeName(e.target.value));setErrors(r=>({...r,[f.key]:undefined}));}}
                  style={inputStyle(f.key)}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors[f.key]?T.brown:T.inputBorder}/>
                {errors[f.key]&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {errors[f.key]}</p>}
              </div>
            ))}
          </div>

          {/* Email */}
          <div style={{marginBottom:"14px"}}>
            <label style={{display:"block",fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:errors.email?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>Email Address</label>
            <input type="email" value={email} placeholder="you@example.com"
              onChange={e=>{setEmail(e.target.value);setErrors(r=>({...r,email:undefined}));}}
              style={inputStyle("email")}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors.email?T.brown:T.inputBorder}/>
            {errors.email&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {errors.email}</p>}
          </div>

          {/* Phone (country selector first, so we know which number format to validate) */}
          <div style={{marginBottom:"14px"}}>
            <PhoneField countryCode={countryCode} onCountryChange={setCountryCode} phone={phone} onPhoneChange={setPhone}
              error={errors.phone} onFocusClear={()=>setErrors(r=>({...r,phone:undefined}))}/>
          </div>

          {/* Password */}
          <div style={{marginBottom:"16px"}}>
            <label style={{display:"block",fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:errors.pw?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>Password</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={pw} placeholder={`Min ${PASSWORD_MIN_LENGTH} characters`}
                onChange={e=>{setPw(e.target.value);setErrors(r=>({...r,pw:undefined}));}}
                style={{...inputStyle("pw"),paddingRight:"44px"}}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors.pw?T.brown:T.inputBorder}/>
              <button onClick={()=>setShowPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}><Icon name={showPw?"eyeOff":"eye"} size={16}/></button>
            </div>
            {errors.pw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {errors.pw}</p>}
            <PasswordStrengthMeter pw={pw}/>
            <GeneratePasswordBtn onGenerate={handleGeneratePw}/>
            <PasswordChecklist pw={pw}/>
          </div>

          {/* Confirm Password */}
          <div style={{marginBottom:"20px"}}>
            <label style={{display:"block",fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:errors.confirmPw?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>Confirm Password</label>
            <div style={{position:"relative"}}>
              <input type={showConfirmPw?"text":"password"} value={confirmPw} placeholder="Re-enter your password"
                onChange={e=>{setConfirmPw(e.target.value);setErrors(r=>({...r,confirmPw:undefined}));}}
                style={{...inputStyle("confirmPw"),paddingRight:"44px"}}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors.confirmPw?T.brown:T.inputBorder}/>
              <button onClick={()=>setShowConfirmPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}><Icon name={showConfirmPw?"eyeOff":"eye"} size={16}/></button>
            </div>
            {errors.confirmPw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {errors.confirmPw}</p>}
            {!errors.confirmPw && confirmPw.length>0 && confirmPw===pw && <p style={{fontSize:"10px",color:"#4caf7d",marginTop:"3px",fontWeight:"600"}}><Icon name="check" size={11} strokeWidth={3} style={{marginRight:"2px"}}/>Passwords match</p>}
          </div>

          {/* Legal agreements — required checkboxes */}
          <div style={{background:T.cardInner,border:`1px solid ${errors.legal?T.brown:T.cardInnerBorder}`,borderRadius:"12px",padding:"13px 14px",marginBottom:"14px"}}>
            <p style={{fontSize:"10px",fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",color:errors.legal?"#e07a5f":T.gold,marginBottom:"10px"}}>Required Agreements</p>
            {[
              {key:"privacy",  label:"Privacy Policy",   url:"https://guidingpaw.com/privacy-policy",                          agreed:agreedPrivacy,  set:setAgreedPrivacy},
              {key:"terms",    label:"Terms of Service",  url:"https://guidingpaw.com/terms-of-service",                        agreed:agreedTerms,    set:setAgreedTerms},
              {key:"liability",label:"Liability Waiver & Assumption of Risk", url:"https://guidingpaw.com/liability-waiver-and-assumption-of-risk", agreed:agreedLiability,set:setAgreedLiability},
            ].map(({key,label,url,agreed,set})=>(
              <div key={key} style={{display:"flex",alignItems:"flex-start",gap:"10px",marginBottom:"10px",cursor:"pointer"}} onClick={()=>{set(v=>!v);setErrors(r=>({...r,legal:undefined}));}}>
                <div style={{width:"20px",height:"20px",borderRadius:"5px",border:`2px solid ${agreed?T.gold:T.inputBorder}`,background:agreed?"rgba(176,141,87,.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px",transition:"all .2s"}}>
                  {agreed&&<Icon name="check" size={12} color={T.gold} strokeWidth={3}/>}
                </div>
                <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.5,userSelect:"none"}}>
                  I have read and agree to the{" "}
                  <a href={url} target="_blank" rel="noreferrer"
                    onClick={e=>e.stopPropagation()}
                    style={{color:T.gold,fontWeight:"700",textDecoration:"underline"}}>{label}</a>
                </p>
              </div>
            ))}
            {errors.legal&&<p style={{fontSize:"11px",color:"#e07a5f",fontWeight:"600",marginTop:"4px"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {errors.legal}</p>}
          </div>

          {/* CTA */}
          {sendError&&<p style={{fontSize:"11px",color:"#e07a5f",fontWeight:"600",marginBottom:"10px",textAlign:"center"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {sendError}</p>}
          <button onClick={handleContinue} disabled={loading} style={{
            width:"100%",padding:"13px",borderRadius:"11px",border:"none",
            background:loading?"rgba(176,141,87,.4)":allAgreed?T.gold:"rgba(176,141,87,.35)",
            color:"#fff",fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Lato',sans-serif",cursor:loading?"wait":"pointer",
            boxShadow:allAgreed?"0 4px 18px rgba(176,141,87,.28)":"none",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:"all .2s",
          }}>
            {loading
              ? <><span style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Creating account…</>
              : "Send Verification Email →"}
          </button>

          <div style={{margin:"14px 0"}}><Divider/></div>
          <GoogleBtn label="Sign up with Google" onClick={async ()=>{
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: oauthRedirectUrl() },
            });
            if(!error) { /* Supabase redirects to Google — onAuthStateChange handles the return */ }
          }}/>
        </div>
      </ScrollBody>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: EMAIL VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════
const EmailVerificationScreen = ({userData, onVerified, onBack}) => {
  const T = useTheme();
  const [phase, setPhase] = useState("waiting"); // "waiting" | "verified"
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeDigits, setCodeDigits] = useState(["","","","","",""]);
  const [codeError, setCodeError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = [0,1,2,3,4,5].map(()=>({ current:null }));

  // Resend cooldown ticker
  const startCooldown = () => {
    setResendCooldown(60);
    const id = setInterval(()=>{
      setResendCooldown(s=>{ if(s<=1){ clearInterval(id); return 0; } return s-1; });
    },1000);
  };
  useState(()=>{ startCooldown(); });

  const handleDigit = (idx, val) => {
    const d = val.replace(/\D/g,"").slice(-1);
    const next = [...codeDigits];
    next[idx] = d;
    setCodeDigits(next);
    setCodeError(false);
    // Auto-advance
    if(d && idx < 5) {
      const nextInput = document.getElementById(`vcode-${idx+1}`);
      if(nextInput) nextInput.focus();
    }
    // Auto-submit when all 6 filled
    if(d && idx===5 && next.filter(Boolean).length===6){
      handleVerify(next.join(""));
    }
  };

  const handleKeyDown = (idx, e) => {
    if(e.key==="Backspace" && !codeDigits[idx] && idx>0){
      const prev = document.getElementById(`vcode-${idx-1}`);
      if(prev) prev.focus();
    }
  };

  const handleVerify = async (code) => {
    const entered = code || codeDigits.join("");
    if(entered.length < 6){ setCodeError(true); return; }
    setVerifying(true);
    setCodeError(false);
    const { error } = await supabase.auth.verifyOtp({
      email: userData.email,
      token: entered,
      type: "signup",
    });
    setVerifying(false);
    if(error){
      setCodeError(true);
    } else {
      setPhase("verified");
      setTimeout(()=>onVerified(), 2000);
    }
  };

  const handleResend = async () => {
    if(resendCooldown>0) return;
    startCooldown();
    setCodeDigits(["","","","","",""]);
    setCodeError(false);
    await supabase.auth.resend({ type: "signup", email: userData.email }).catch(()=>{});
  };

  if(phase==="verified") return (
    <PhoneShell>
      <TopBanner/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",textAlign:"center"}}>
        <div style={{width:"80px",height:"80px",borderRadius:"50%",background:T.success,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"20px",animation:"successPop .5s cubic-bezier(.22,1,.36,1) both",boxShadow:`0 0 0 12px rgba(76,175,125,.1),0 0 0 24px rgba(76,175,125,.05)`}}><Icon name="check" size={36} color="#fff" strokeWidth={3}/></div>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"8px",animation:"fadeUp .4s .3s both"}}>Email Verified!</h2>
        <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,animation:"fadeUp .4s .5s both"}}>Welcome, <strong style={{color:T.gold}}>{userData.firstName}</strong>! Taking you to setup…</p>
        <div style={{marginTop:"20px",display:"flex",gap:"6px",animation:"fadeUp .4s .7s both"}}>
          {[0,1,2].map(i=><div key={i} style={{width:"8px",height:"8px",borderRadius:"50%",background:T.gold,animation:`bounce .8s ${i*0.15}s infinite`}}/>)}
        </div>
      </div>
    </PhoneShell>
  );

  return (
    <PhoneShell>
      <TopBanner/>
      <div style={{padding:"10px 20px 0",display:"flex",alignItems:"center",flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:"13px",fontWeight:"700",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",gap:"4px",padding:0}}
          onMouseEnter={e=>e.currentTarget.style.color=T.text} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>← Back</button>
      </div>

      <ScrollBody>
        <div className="s1" style={{textAlign:"center",marginBottom:"28px",paddingTop:"12px"}}>
          <div style={{marginBottom:"14px",animation:"fadeUp .5s both",display:"flex",justifyContent:"center",color:T.gold}}><Icon name="mail" size={52}/></div>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Check your email</h2>
          <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"4px"}}>We sent a 6-digit verification code to:</p>
          <p style={{fontSize:"14px",fontWeight:"700",color:T.gold,marginBottom:"16px"}}>{userData.email}</p>
          <div style={{background:"rgba(176,141,87,.08)",border:"1px solid rgba(176,141,87,.2)",borderRadius:"10px",padding:"9px 12px",display:"inline-block"}}>
            <p style={{fontSize:"11px",color:T.textMuted,display:"flex",alignItems:"center",gap:"5px"}}><Icon name="mail" size={11}/>Check your inbox (and spam folder) — the code can take a minute to arrive.</p>
          </div>
        </div>

        {/* 6-digit code input */}
        <div className="s2" style={{marginBottom:"24px"}}>
          <p style={{fontSize:"10px",fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",color:codeError?T.brown:T.gold,marginBottom:"12px",textAlign:"center"}}>Enter Verification Code</p>
          <div style={{display:"flex",gap:"8px",justifyContent:"center",marginBottom:"10px"}}>
            {codeDigits.map((d,i)=>(
              <input
                key={i} id={`vcode-${i}`}
                type="text" inputMode="numeric" maxLength={1}
                value={d}
                onChange={e=>handleDigit(i,e.target.value)}
                onKeyDown={e=>handleKeyDown(i,e)}
                style={{
                  width:"42px",height:"52px",textAlign:"center",
                  fontSize:"22px",fontWeight:"900",
                  background:d?T.inputFocusBg:T.inputBg,
                  border:`2px solid ${codeError?"#e07a5f":d?T.gold:T.inputBorder}`,
                  borderRadius:"12px",color:T.text,outline:"none",
                  fontFamily:"'Lato',sans-serif",transition:"border-color .2s",
                  caretColor:"transparent",
                }}
                onFocus={e=>{ e.target.style.borderColor=T.gold; e.target.select(); }}
                onBlur={e=>{ e.target.style.borderColor=codeError?"#e07a5f":d?T.gold:T.inputBorder; }}
              />
            ))}
          </div>
          {codeError&&<p style={{textAlign:"center",fontSize:"11px",color:"#e07a5f",fontWeight:"700",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}><Icon name="alert" size={11}/> Invalid code. Please try again.</p>}
        </div>

        {/* Verify button */}
        <button onClick={()=>handleVerify()} disabled={verifying} style={{
          width:"100%",padding:"13px",borderRadius:"11px",border:"none",
          background:verifying?"rgba(176,141,87,.4)":T.gold,
          color:"#fff",fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",
          fontFamily:"'Lato',sans-serif",cursor:verifying?"wait":"pointer",
          boxShadow:"0 4px 18px rgba(176,141,87,.28)",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",marginBottom:"18px",
        }}>
          {verifying
            ? <><span style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Verifying…</>
            : "Verify Email →"}
        </button>

        {/* Resend */}
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:"12px",color:T.textMuted,marginBottom:"6px"}}>Didn't receive a code?</p>
          <button onClick={handleResend} disabled={resendCooldown>0} style={{background:"none",border:"none",cursor:resendCooldown>0?"not-allowed":"pointer",color:resendCooldown>0?T.textFaint:T.gold,fontWeight:"700",fontSize:"13px",fontFamily:"'Lato',sans-serif",padding:0,transition:"color .2s"}}>
            {resendCooldown>0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
          </button>
        </div>

        <div style={{marginTop:"20px",background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"12px 14px"}}>
          <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.6}}>
            <Icon name="mail" size={12} style={{marginRight:"3px"}}/><strong style={{color:T.text}}>Can't find it?</strong> Check your spam or promotions folder. The email comes from <span style={{color:T.gold,fontWeight:"700"}}>noreply@guidingpaw.com</span>
          </p>
        </div>
      </ScrollBody>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: ONBOARDING
// ═══════════════════════════════════════════════════════════════════════════════
const OnboardingScreen = ({userData, onGoToPayment, darkMode, setDarkMode}) => {
  const T=useTheme();
  const [step,setStep]=useState(0);
  const [data,setData]=useState({
    role:[],rescue:null,petType:"dog",gender:null,age:"",weight:"",birthday:"",breed:"",name:"",
    knows:[],issues:[],trainTime:[],trainHour:"7",trainAmPm:"AM",trainMin:"00",plan:"annual",
    additionalPets:false,additionalPetsList:[],
    // pre-fill from registration
    firstName:userData?.firstName||"", lastName:userData?.lastName||"",
    email:userData?.email||"", phone:userData?.phone||"", countryCode:userData?.countryCode||"US", pw:userData?.pw||""
  });
  const set=(k,v)=>setData(d=>({...d,[k]:v}));
  const toggle=(k,v,single)=>{ if(single){set(k,v);return;} set(k,data[k].includes(v)?data[k].filter(x=>x!==v):[...data[k],v]); };
  const steps=buildSteps(data,set,toggle,T);
  const isLastStep=step===steps.length-1;
  const handleNext=()=>{
    if(isLastStep) onGoToPayment(data);
    else setStep(s=>s+1);
  };
  return (
    <PhoneShell>
      <TopBanner/>
      <div style={{padding:"12px 26px 0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <ProgressDots total={steps.length} current={step}/>
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
      </div>
      <ScrollBody>
        {step>0&&<BackBtn onClick={()=>setStep(s=>s-1)}/>}
        <div className="slide">{steps[step]?.content}</div>
        <GoldBtn onClick={handleNext} style={{marginTop:"18px"}}>{steps[step]?.nextLabel||"Continue →"}</GoldBtn>
      </ScrollBody>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: PAYMENT
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// PROGRAM PRICING (v2) — one-time program purchases, not ongoing subscription tiers.
// The program itself is assigned automatically from the dog's actual birthday —
// never a user choice. "standard" is kept as the internal/database identifier for
// the 6-week program (matching the existing Supabase schema + already-saved rows),
// but every customer-facing label below says "6-Week Training Program" instead.
// ═══════════════════════════════════════════════════════════════════════════════
const PROGRAM_PRICE = {
  puppy: 89.99,                  // 12-Week Puppy Training Program, one-time
  standard: 69.99,               // 6-Week Training Program, one-time (full price)
  standardGradDiscount: 49.99,   // offered to Puppy grads instead of full price
  secondDogDiscount: 17.50,      // 75% off $69.99 — 2nd dog, when both dogs are 19+ weeks
  membership: 9.99,              // /mo, household-wide, once a dog has completed its program
};

// Age gating — purely a function of the dog's actual birthday. 0–18 weeks old = Puppy
// Program; 19+ weeks old = 6-Week Program. There's no "suggested, but you can choose
// either" anymore — the age determines the program.
const programForAge = (birthday) => {
  const weeksOld = ageInWeeks(birthday||"");
  if(weeksOld===null) return null;
  return weeksOld <= 18 ? "puppy" : "standard";
};
const programLabel = (program) => program==="puppy" ? "12-Week Puppy Training Program" : "6-Week Training Program";

const PLAN_DETAILS = {
  // Kept only for the post-graduation ongoing membership — there's no more
  // monthly/annual/pro subscription choice at signup.
  membership: {name:"Ongoing Membership",price:`$${PROGRAM_PRICE.membership}`,per:"/mo",trial:`$${PROGRAM_PRICE.membership}/mo, billed monthly`},
};

const PaymentScreen = ({petData, onBack}) => {
  const T=useTheme();
  const program = petData?.program || "standard";
  const price = program==="puppy" ? PROGRAM_PRICE.puppy : PROGRAM_PRICE.standard;
  const [loading,setLoading]=useState(false);
  const [payError,setPayError]=useState("");

  // Real Stripe Checkout: builds a Checkout Session server-side (which needs
  // this data since the account/pet writes happen webhook-side, not here —
  // see api/stripe-webhook.js) and redirects to Stripe's hosted payment
  // page. Persist the in-progress onboarding data first, so a cancelled
  // Checkout can resume onboarding instead of losing it on the redirect.
  const handlePay=async ()=>{
    setLoading(true);
    setPayError("");
    try{
      const { data: { session } } = await supabase.auth.getSession();
      if(!session){ setLoading(false); setPayError("Your session expired — please sign in again."); return; }
      try{ localStorage.setItem("gp_pending_onboarding", JSON.stringify(petData)); }catch{}
      const res = await fetch("/api/create-program-checkout-session", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${session.access_token}` },
        body: JSON.stringify({
          program,
          pet:{ name:petData?.name, breed:petData?.breed, birthday:petData?.birthday, gender:petData?.gender, weight:petData?.weight },
          onboarding:{ role:petData?.role, trainingGoals:petData?.issues, preferredTrainingTime:petData?.trainTime },
          account:{ firstName:petData?.firstName, lastName:petData?.lastName, phone:petData?.phone, countryCode:petData?.countryCode },
        }),
      });
      const result = await res.json();
      if(result.url){ window.location.href = result.url; return; }
      setLoading(false);
      setPayError(result.error || "Something went wrong starting checkout. Please try again.");
    }catch(err){
      console.error("[checkout] failed to start:", err);
      setLoading(false);
      setPayError("Something went wrong starting checkout. Please try again.");
    }
  };

  return (
    <PhoneShell>
      <TopBanner/>
      <div style={{padding:"10px 18px 0",display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:"20px",padding:"2px 6px 2px 0"}}>‹</button>
        <p style={{fontSize:"11px",fontWeight:"700",color:T.textMuted,letterSpacing:".12em",textTransform:"uppercase"}}>Secure Checkout</p>
        <Icon name="lock" size={13} style={{marginLeft:"auto"}}/>
      </div>
      <ScrollBody pad="18px 22px">

        {/* Order summary */}
        <div className="s1" style={{background:T.green,borderRadius:"16px",padding:"16px",marginBottom:"18px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:"12px",top:"10px",opacity:.12}}><Icon name="paw" size={40}/></div>
          <p style={{fontSize:"9px",fontWeight:"900",letterSpacing:".16em",textTransform:"uppercase",color:"rgba(255,255,255,.5)",marginBottom:"6px"}}>Order Summary</p>
          <p style={{fontFamily:"'Inter',serif",fontSize:"20px",fontWeight:"700",color:"#fff",marginBottom:"4px"}}>{programLabel(program)}</p>
          <div style={{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"10px"}}>
            <span style={{fontSize:"28px",fontWeight:"900",color:T.goldL,display:"inline-flex",alignItems:"center",gap:"5px"}}>${price}</span>
          </div>
          <p style={{fontSize:"11px",color:"rgba(255,255,255,.45)",lineHeight:1.5}}>One-time purchase — full lifetime access to this program. No recurring charges.</p>
          <div style={{display:"flex",gap:"10px",marginTop:"10px",flexWrap:"wrap"}}>
            {["One-time payment","No contracts"].map(r=><span key={r} style={{fontSize:"10px",color:T.success,fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="check" size={10} strokeWidth={3}/>{r}</span>)}
          </div>
        </div>

        {/* Apple Pay / Google Pay */}
        <div className="s2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px",marginBottom:"16px"}}>
          <button onClick={handlePay} style={{padding:"11px",borderRadius:"12px",background:"#000",color:"#fff",border:"none",fontSize:"13px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",fontFamily:"'Lato',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>
            <svg width="16" height="16" viewBox="0 0 814 1000" fill="white"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-157.2-116.7c-44.2-66.5-81.5-174.6-81.5-278.1 0-159.4 104.2-243.9 206.5-243.9 54.6 0 100 36.4 133.4 36.4 31.8 0 81.5-38.5 143.7-38.5 23.3 0 106.7 2.2 162.3 92.4zm-220-173.7c27.8-32.8 47.5-78.5 47.5-124.3 0-6.3-.6-12.7-1.9-18.4-44.6 1.6-97.8 30.6-130.3 65.4-25.6 28.8-49.5 74.5-49.5 121.3 0 7 1.3 14 1.9 16.2 3.2.6 8.3 1.3 13.4 1.3 40.1 0 88.5-27.1 119-61.5z"/></svg>
            Apple Pay
          </button>
          <button onClick={handlePay} style={{padding:"11px",borderRadius:"12px",background:"#fff",color:"#3c4043",border:"1px solid #dadce0",fontSize:"13px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",fontFamily:"'Lato',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google Pay
          </button>
        </div>

        {/* Divider */}
        <div className="s2" style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
          <div style={{flex:1,height:"1px",background:T.divider}}/><span style={{fontSize:"11px",color:T.textFaint,fontWeight:"700"}}>or pay with card</span><div style={{flex:1,height:"1px",background:T.divider}}/>
        </div>

        {payError && (
          <div style={{background:"rgba(163,86,42,.15)",border:"1px solid rgba(163,86,42,.4)",borderRadius:"10px",padding:"10px 14px",marginBottom:"16px",display:"flex",gap:"8px",alignItems:"flex-start"}}>
            <Icon name="alert" size={15} style={{flexShrink:0}}/>
            <p style={{fontSize:"12px",color:"#e07a5f",fontWeight:"700"}}>{payError}</p>
          </div>
        )}

        {/* Pay button */}
        <button onClick={handlePay} disabled={loading} style={{
          width:"100%",padding:"15px",borderRadius:"12px",border:"none",cursor:loading?"wait":"pointer",
          background:loading?"rgba(176,141,87,.4)":T.gold,
          color:"#fff",fontSize:"15px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",
          fontFamily:"'Lato',sans-serif",boxShadow:"0 4px 20px rgba(176,141,87,.4)",transition:"all .2s",
          display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
        }}>
          {loading
            ? <><span style={{display:"inline-block",width:"16px",height:"16px",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Processing…</>
            : <>Pay ${price}</>}
        </button>
        <p style={{textAlign:"center",fontSize:"10px",color:T.textFaint,marginTop:"10px",lineHeight:1.5}}>One-time charge. No recurring subscription.</p>
      </ScrollBody>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: WELCOME DASHBOARD (first-time)
// ═══════════════════════════════════════════════════════════════════════════════
const WelcomeDashboard = ({petData, plan, onDismiss}) => {
  const T=useTheme();
  const petName=petData?.name||"your dog";
  const breed=petData?.breed||"";
  return (
    <ScrollBody>
      {/* Hero welcome banner */}
      <div className="s1" style={{background:T.green,borderRadius:"18px",padding:"22px 18px",marginBottom:"18px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:"-10px",top:"-10px",opacity:.08}}><Icon name="paw" size={80}/></div>
        <LogoImg size={52}/>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:"#fff",margin:"12px 0 6px",lineHeight:1.25}}>Welcome, {petName}!</h2>
        <p style={{fontSize:"13px",color:"rgba(255,255,255,.6)",lineHeight:1.55,marginBottom:"14px"}}>Your training journey starts today. Here's everything ready for you.</p>
        <div style={{display:"flex",justifyContent:"center",gap:"12px",flexWrap:"wrap"}}>
          {["Day 1","First Lesson","Goal Set"].map(t=>(
            <span key={t} style={{fontSize:"11px",fontWeight:"700",color:T.success}}>{t}</span>
          ))}
        </div>
      </div>

      {/* Quick-start cards */}
      <p style={{fontSize:"10px",fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",color:T.gold,marginBottom:"10px"}} className="s2">Your First Steps</p>
      {[
        {icon:"clipboard",title:"Complete Today's Assignment",desc:"Your first lesson is ready and waiting.",cta:"Start Lesson",color:T.gold},
        {icon:"paw",title:"Set Up Pet Profile",desc:breed?`We've saved ${breed} — you can add more details anytime.`:"Add your pet's breed to unlock personalized training tips.",cta:"Go to Settings",color:T.goldL},
        {icon:"calendar",title:"Build Your Daily Routine",desc:"Set your training schedule for maximum consistency.",cta:"Build Routine",color:T.success},
      ].map(({icon,title,desc,cta,color},i)=>(
        <div key={title} className={`s${i+3}`} style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"10px",display:"flex",gap:"12px",alignItems:"flex-start"}}>
          <span style={{fontSize:"24px",flexShrink:0}}>{icon}</span>
          <div style={{flex:1}}>
            <p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"3px"}}>{title}</p>
            <p style={{fontSize:"11.5px",color:T.textMuted,lineHeight:1.5,marginBottom:"8px"}}>{desc}</p>
            <span style={{fontSize:"11px",fontWeight:"700",color,letterSpacing:".06em"}}>{cta} →</span>
          </div>
        </div>
      ))}

      <GoldBtn onClick={onDismiss} style={{marginTop:"6px"}}>Go to My Dashboard →</GoldBtn>
    </ScrollBody>
  );
};

function buildSteps(data,set,toggle,T){
  const steps=[];
  // Role (first step now — account creation happens before onboarding)
  steps.push({content:(<><SectionTitle>What role will your pet play?</SectionTitle><ChipGroup options={[{value:"bestfriend",label:"Best Friend"},{value:"kid",label:"Kid"},{value:"family",label:"Family Member"},{value:"watchdog",label:"Watchdog"},{value:"service",label:"Service / Emotional Support"}]} selected={data.role} onToggle={v=>toggle("role",v,false)}/></>)});
  // Rescue
  steps.push({content:(<><SectionTitle>Is your pet a rescue?</SectionTitle><ChipGroup options={[{value:"yes",label:"Yes"},{value:"no",label:"No"}]} selected={data.rescue} onToggle={v=>set("rescue",v)} single/></>)});
  // Dog only — cat training removed
  // Auto-set petType to dog for all new users
  // Additional pets in household
  steps.push({content:(<><SectionTitle>Any additional pets in the home?</SectionTitle><p style={{fontSize:"12px",color:T.textMuted,marginBottom:"14px"}}>Check this box if you have more than one pet — you can fill out a profile for each one.</p><div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",border:`1px solid ${data.additionalPets?T.gold:T.chipBorder}`,borderRadius:"12px",background:data.additionalPets?"rgba(176,141,87,.1)":T.chipBg,cursor:"pointer"}} onClick={()=>set("additionalPets",!data.additionalPets)}><div style={{width:"22px",height:"22px",borderRadius:"6px",border:`2px solid ${data.additionalPets?T.gold:T.inputBorder}`,background:data.additionalPets?"rgba(176,141,87,.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>{data.additionalPets&&<Icon name="check" size={13} color={T.gold} strokeWidth={3}/>}</div><span style={{fontSize:"14px",fontWeight:"700",color:data.additionalPets?T.goldLight:T.text}}>Yes, I have additional pets</span></div>{data.additionalPets&&<p style={{fontSize:"11.5px",color:T.textMuted,marginTop:"12px",lineHeight:1.5}}>After completing this questionnaire you'll be able to add profiles for your other pets in the Profile section.</p>}</>)});
  // Gender
  steps.push({content:(<><SectionTitle>Boy or girl?</SectionTitle><ChipGroup options={[{value:"boy",label:"Boy",emoji:"heart"},{value:"girl",label:"Girl",emoji:"heart"}]} selected={data.gender} onToggle={v=>set("gender",v)} single/></>)});
  // Details
  steps.push({content:(<><SectionTitle>Tell us about your dog</SectionTitle><p style={{fontSize:"11.5px",color:T.textMuted,marginBottom:"12px",lineHeight:1.5}}>Age is calculated automatically from birthday, so no need to enter it separately.</p>{["name","weight","birthday","breed"].map(k=><div key={k} style={{marginBottom:"11px"}}><label style={{fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:T.gold,fontWeight:"700",display:"block",marginBottom:"5px"}}>{k==="birthday"?"Birthday (MM/DD/YYYY)":k.charAt(0).toUpperCase()+k.slice(1)}</label><input value={data[k]} onChange={e=>set(k,k==="name"?capitalizeName(e.target.value):e.target.value)} placeholder={k==="weight"?"lbs":k==="birthday"?"MM/DD/YYYY":k==="name"?"e.g. Luna":"e.g. Labrador Retriever"} style={{width:"100%",padding:"11px 14px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none"}}/></div>)}</>)});
  // Program is assigned automatically from the dog's actual birthday — 0–18 weeks
  // old gets the Puppy Program, 19+ weeks gets the 6-Week Program. This is no longer
  // a purchase decision the client makes; it's shown here purely so they see and
  // understand what they're about to be charged for on the next screen.
  steps.push({content:(()=>{
    const assigned = programForAge(data.birthday);
    if(data.program !== assigned) set("program", assigned); // lock it in — not user-selectable; guarded so this only fires once per birthday, not on every render
    const info = assigned==="puppy"
      ? {title:"12-Week Puppy Training Program", price:PROGRAM_PRICE.puppy, desc:"Structure, socialization, foundational skills, and kennel/potty training — for puppies 0–18 weeks old."}
      : {title:"6-Week Training Program", price:PROGRAM_PRICE.standard, desc:"Leash pressure, e-collar foundations, and off-leash reliability — for dogs 19+ weeks old."};
    return (<>
      <SectionTitle>Your Dog's Program</SectionTitle>
      <p style={{fontSize:"12px",color:T.textMuted,marginBottom:"14px",lineHeight:1.5}}>Based on {data.name||"your dog"}'s birthday, here's the program that's the right fit right now.</p>
      <div style={{padding:"18px 16px",borderRadius:"14px",border:`2px solid ${T.gold}`,background:"rgba(176,141,87,.12)"}}>
        <p style={{fontSize:"15px",fontWeight:"700",color:T.gold,marginBottom:"6px"}}>{info.title}</p>
        <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.5,marginBottom:"10px"}}>{info.desc}</p>
        <p style={{fontSize:"20px",fontWeight:"900",color:T.text}}>${info.price} <span style={{fontSize:"12px",fontWeight:"400",color:T.textMuted}}>one-time purchase</span></p>
      </div>
    </>);
  })()});
  // Knows — dog only
  steps.push({content:(<><SectionTitle>What does your dog know?</SectionTitle><p style={{fontSize:"12px",color:T.textMuted,marginBottom:"12px"}}>Select all that apply</p><ChipGroup options={["Name","Stand","Sit","Down","Leave it","Come / Here","Crate / Kennel","Heel","High five / Shake","None of the above"]} selected={data.knows} onToggle={v=>toggle("knows",v,false)}/></>)});
  steps.push({content:(<><SectionTitle>Behavior issues to work on?</SectionTitle><p style={{fontSize:"12px",color:T.textMuted,marginBottom:"12px"}}>Select all that apply</p><ChipGroup options={["Walking","Potty issues","Biting","Chewing","Jumping","Destructive behavior","Counter surfing","Eating poop","Barking","Reactivity / Aggression","Separation anxiety","Humping","Crate training","Socialization"]} selected={data.issues} onToggle={v=>toggle("issues",v,false)}/></>)});
  // Train time
  steps.push({content:(<><SectionTitle>Daily training time?</SectionTitle><ChipGroup options={["5 – 10 min","15 – 30 min","More than 30 min"]} selected={data.trainTime} onToggle={v=>toggle("trainTime",v,false)}/></>)});
  // Clock — scrollable hour/minute pickers
  steps.push({content:(<><SectionTitle>Preferred training time?</SectionTitle><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",margin:"20px 0"}}>
    <div style={{textAlign:"center"}}>
      <p style={{fontSize:"10px",color:T.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:"6px"}}>Hour</p>
      <div style={{height:"100px",overflowY:"auto",border:`1px solid ${T.inputBorder}`,borderRadius:"10px",width:"64px",scrollSnapType:"y mandatory"}}>
        {Array.from({length:12},(_,i)=>i+1).map(h=><div key={h} onClick={()=>set("trainHour",String(h))} style={{height:"36px",display:"flex",alignItems:"center",justifyContent:"center",scrollSnapAlign:"start",cursor:"pointer",background:data.trainHour===String(h)?"rgba(176,141,87,.2)":"transparent",color:data.trainHour===String(h)?T.gold:T.text,fontSize:"18px",fontWeight:"700"}}>{h}</div>)}
      </div>
    </div>
    <div style={{fontSize:"28px",color:T.gold,fontWeight:"900",paddingTop:"20px"}}>:</div>
    <div style={{textAlign:"center"}}>
      <p style={{fontSize:"10px",color:T.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:"6px"}}>Min</p>
      <div style={{height:"100px",overflowY:"auto",border:`1px solid ${T.inputBorder}`,borderRadius:"10px",width:"64px",scrollSnapType:"y mandatory"}}>
        {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m=><div key={m} onClick={()=>set("trainMin",m)} style={{height:"36px",display:"flex",alignItems:"center",justifyContent:"center",scrollSnapAlign:"start",cursor:"pointer",background:(data.trainMin||"00")===m?"rgba(176,141,87,.2)":"transparent",color:(data.trainMin||"00")===m?T.gold:T.text,fontSize:"18px",fontWeight:"700"}}>{m}</div>)}
      </div>
    </div>
    <div style={{textAlign:"center",paddingTop:"20px"}}>
      <p style={{fontSize:"10px",color:T.gold,letterSpacing:".12em",textTransform:"uppercase",marginBottom:"6px"}}>AM/PM</p>
      <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>{["AM","PM"].map(ap=><button key={ap} onClick={()=>set("trainAmPm",ap)} style={{padding:"10px 14px",borderRadius:"8px",fontWeight:"700",fontSize:"13px",border:`1px solid ${data.trainAmPm===ap?T.gold:T.inputBorder}`,background:data.trainAmPm===ap?"rgba(176,141,87,.18)":T.inputBg,color:data.trainAmPm===ap?T.gold:T.text,cursor:"pointer"}}>{ap}</button>)}</div>
    </div>
  </div></>)});
  // Program purchase confirmation — one-time purchase for whichever program was
  // assigned by age above. No subscription tiers here anymore; the ongoing $9.99/mo
  // membership only comes into play later, once the program is actually completed.
  steps.push({content:(()=>{
    const price = data.program==="puppy" ? PROGRAM_PRICE.puppy : PROGRAM_PRICE.standard;
    return (
    <>
      <div style={{background:T.green,borderRadius:"12px",padding:"12px 14px",marginBottom:"18px",textAlign:"center"}}>
        <p style={{fontSize:"10px",fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",color:"#8de0b0",marginBottom:"2px"}}>Your Goal</p>
        <p style={{fontSize:"13px",fontWeight:"700",color:"#d0f0e0",lineHeight:1.4}}>Build a well-trained, confident pet with daily guidance</p>
      </div>
      <SectionTitle>Confirm Your Purchase</SectionTitle>
      <div style={{padding:"16px",borderRadius:"14px",border:`2px solid ${T.gold}`,background:"rgba(176,141,87,.12)",marginBottom:"12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <p style={{fontSize:"14px",fontWeight:"700",color:T.gold,marginBottom:"3px"}}>{programLabel(data.program)}</p>
            <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.4}}>One-time purchase — full lifetime access to this program's curriculum, tasks, and videos.</p>
          </div>
          <div style={{textAlign:"right",marginLeft:"10px"}}>
            <span style={{fontSize:"20px",fontWeight:"900",color:T.gold}}>${price}</span>
          </div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:"14px",marginBottom:"4px",flexWrap:"wrap"}}>
        {["One-time payment","No recurring charge"].map(r=><span key={r} style={{fontSize:"11px",color:T.success,fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="check" size={10} strokeWidth={3}/>{r}</span>)}
      </div>
    </>
  );})(),nextLabel:"Continue to Payment →"});
  return steps;
}
// ═══════════════════════════════════════════════════════════════════════════════
// ─── BREED DATA LIBRARY ────────────────────────────────────────────────────────
const BREED_DATA = {
  // Retrievers
  "labrador retriever":   { tendency:"Labs are highly food-motivated and eager to please, but can be easily distracted by scent and surroundings.", tip:"Use high-value treats to keep focus. Keep sessions short — Labs can mentally fatigue faster than they look.", exercise:"Labs need 60–90 min of vigorous activity daily. Today's walk should be brisk, not leisurely.", enrichment:"A treat-dispensing puzzle feeder or a frozen stuffed Kong — Labs' food drive makes food-based puzzles their favorite enrichment." },
  "golden retriever":     { tendency:"Goldens are sensitive and bond deeply with their handler. Harsh corrections backfire — they shut down quickly.", tip:"Use a warm, encouraging tone during e-collar intro. Celebrate every correct response enthusiastically.", exercise:"45–60 min of active exercise today. A game of fetch after training reinforces your bond.", enrichment:"A soft retrieve toy for gentle 'find it' games, or a snuffle mat — Goldens enjoy enrichment that involves carrying or gathering." },
  // Working/Sport
  "german shepherd":      { tendency:"GSD's are highly intelligent and can anticipate commands — which means they'll also anticipate corrections.", tip:"Keep your timing razor sharp. GSD's read body language intensely, so stay calm and deliberate.", exercise:"GSD's need structured mental + physical work. Add a 15-min structured heel to today's walk.", enrichment:"A DIY scent-discrimination game (hide toys/treats around a room) — GSDs thrive on 'work' style enrichment that uses their nose and brain together." },
  "belgian malinois":     { tendency:"Malinois have an extremely high drive and need mental stimulation as much as physical. Boredom = destruction.", tip:"Keep sessions intense and reward-driven. This breed thrives on precision — reward exact responses only.", exercise:"Malinois need 90+ min of exercise. Include a run or high-intensity game before today's training session.", enrichment:"A flirt pole or tug-based puzzle — Malinois need enrichment that channels drive, not just a passive chew toy." },
  "dutch shepherd":       { tendency:"Dutch Shepherds are driven, athletic, and loyal. They respond well to clear structure and dislike inconsistency.", tip:"Be consistent with every command. Inconsistency frustrates this breed more than most.", exercise:"High energy — aim for 60–90 min. A structured off-leash run before training will improve focus.", enrichment:"A structured tracking or find-it game in the yard — this breed does best with enrichment tied to a clear 'job.'" },
  "rottweiler":           { tendency:"Rottweilers are calm and confident but can be stubborn. They need a handler who is equally calm and clear.", tip:"Give commands once, clearly. Repeating yourself teaches a Rottweiler that the first command is optional.", exercise:"45–60 min daily. Today include a weighted or structured walk to satisfy their working dog instincts.", enrichment:"A weighted or tug-resistant chew toy paired with a short obedience-style puzzle — Rottweilers enjoy enrichment with a clear task and payoff." },
  "doberman pinscher":    { tendency:"Dobermans are alert, sensitive, and fast. They pick up on handler energy — anxiety or frustration transfers instantly.", tip:"Project confidence and calm. Dobermans thrive with clarity; vague cues cause anxiety.", exercise:"60–90 min recommended. An off-leash sprint or structured jog is ideal before today's session.", enrichment:"A snuffle mat or slow-scent trail — enrichment that's calm and focused suits a Doberman's sensitivity to overstimulation." },
  "great dane":           { tendency:"Great Danes are gentle giants — often unaware of their size. They can be slow to mature but respond well to patience.", tip:"Keep sessions short (10–15 min max). Great Danes tire of repetition quickly. One skill per session.", exercise:"30–45 min of moderate walking. Avoid intense exercise until fully grown (18–24 months).", enrichment:"A large, soft puzzle feeder used at floor level — keep sessions short since Danes tire of repetition quickly." },
  // Herding
  "border collie":        { tendency:"Border Collies are exceptionally fast learners — which means they get bored faster than any other breed.", tip:"Rotate exercises every 3–4 reps to prevent anticipation. Channel herding instinct into structured games.", exercise:"90+ min is ideal. Include both physical and mental challenges — puzzle toy after training is a must.", enrichment:"A shape-sorting or herding-style puzzle toy (rolling treat balls work well) — rotate toys often since Border Collies master puzzles fast." },
  "australian shepherd":  { tendency:"Aussies are high-drive, high-intelligence, and prone to anxiety if understimulated. They need a job.", tip:"Structure every interaction as part of their 'job.' Reward calm behavior as much as correct responses.", exercise:"60–90 min daily. Include directional work or frisbee to satisfy their herding drive.", enrichment:"A treat maze or directional 'send-away' game — Aussies do best with enrichment that mimics having a job to do." },
  "australian cattle dog":{ tendency:"ACDs are tenacious, independent thinkers. They'll test you, and if you're inconsistent, they'll exploit it.", tip:"Be crystal clear with every expectation. This breed respects confidence and loses respect for weakness.", exercise:"90+ min. High-intensity fetch, frisbee, or structured running is ideal before today's session.", enrichment:"A durable rubber puzzle toy that requires nudging or flipping — ACDs like enrichment with some physical resistance built in." },
  "corgi":                { tendency:"Corgis were bred to herd cattle and are surprisingly bold for their size. They can be vocal and opinionated.", tip:"Use firm, clear corrections. Corgis can ignore soft cues. Keep training sessions engaging — they bore quickly.", exercise:"45–60 min including mental stimulation. A structured walk and short training burst works well.", enrichment:"A low-to-the-ground snuffle mat or rolling treat toy — keep it engaging since Corgis bore quickly." },
  // Terriers
  "american pit bull terrier":{ tendency:"Pit Bulls are people-pleasers with high drive. Their strength and tenacity means you need excellent leash skills.", tip:"Prioritize loose-leash walking and impulse control. Their strength amplifies any training gap.", exercise:"60–90 min of vigorous exercise. Today's walk should include structured heel work, not free-sniffing.", enrichment:"A tug or spring-pole style enrichment toy — channel their strength and drive into an appropriate outlet." },
  "american staffordshire terrier":{ tendency:"AmStaffs are strong-willed and physically powerful. They thrive with a clear pack structure and consistent rules.", tip:"Set rules and enforce them every time — AmStaffs notice when you let things slide and will push further.", exercise:"60–90 min. Include strength-building activities like tug or weighted walks alongside today's training.", enrichment:"A durable chew/puzzle combo toy that rewards persistence — AmStaffs enjoy enrichment they have to work hard for." },
  "bull terrier":         { tendency:"Bull Terriers are clown-like and stubborn. They have selective hearing and will test your patience on purpose.", tip:"Keep sessions fun and short. Use play as a reward — Bull Terriers respond to play more than food.", exercise:"45–60 min. Energy must be out before training — a tired Bull Terrier is a more compliant one.", enrichment:"A rolling, unpredictable-motion toy (like a Kong Wobbler) — the erratic movement matches this breed's playful, clownish energy." },
  "jack russell terrier": { tendency:"Jack Russells have massive prey drive and very high energy. They are not naturally wired to sit still.", tip:"Train in a distraction-free zone first. Their threshold for stimulation is very low.", exercise:"60+ min including both mental and physical exercise. Puzzle feeders before training help settle them.", enrichment:"A hidden-treat digging box or a squeaky puzzle toy — high-energy scent and chase-style enrichment suits their prey drive." },
  // Scent Hounds
  "beagle":               { tendency:"Beagles are nose-first dogs. Once a scent is found, recall becomes nearly impossible without solid foundation work.", tip:"Work recall in a low-distraction area first. Never trust an off-leash Beagle near open space without a long line.", exercise:"45–60 min including scent-based enrichment like a sniff walk or find-it game.", enrichment:"A snuffle mat or scattered 'find it' scent game — Beagles are nose-first, so scent-based enrichment is the most effective kind." },
  "bloodhound":           { tendency:"Bloodhounds are single-minded on a trail. They require a patient handler who accepts that this breed isn't naturally obedient.", tip:"Use scent games as reward. Make training feel like nose work — it motivates them far more than praise.", exercise:"45–60 min of moderate exercise. Avoid intense heat — their extra skin makes them prone to overheating.", enrichment:"A long scent trail laid with treats across the yard — nose work is this breed's favorite and most natural form of enrichment." },
  "basset hound":         { tendency:"Bassets are gentle and stubborn in equal measure. Motivation is everything — they won't work for free.", tip:"Find their highest-value reward and use it only in training. Bassets shut down when bored or when corrections are too harsh.", exercise:"30–45 min moderate walk. Not built for high intensity — keep exercise steady and consistent.", enrichment:"A low-profile snuffle mat with high-value treats — Bassets need enrichment that's worth the effort for a food-motivated dog." },
  // Toy / Small
  "chihuahua":            { tendency:"Chihuahuas are bold, opinionated, and often treated like accessories — which causes most of their behavior problems.", tip:"Train them exactly like a big dog. No baby talk, no exceptions for size. Consistency is everything.", exercise:"20–30 min. Short burst walks and indoor training sessions satisfy them well.", enrichment:"A small treat-dispensing puzzle sized for tiny mouths — short indoor enrichment sessions suit their size and energy." },
  "french bulldog":       { tendency:"Frenchies are stubborn but food-motivated. Their flat faces mean they tire quickly and can overheat.", tip:"Keep training sessions under 10 min. End before they disengage — stopping at a win keeps them eager.", exercise:"20–30 min in cool conditions. Avoid midday heat entirely. Morning or evening sessions only.", enrichment:"A low-effort lick mat or slow-feeder puzzle — keep enrichment calm and short given their tendency to overheat." },
  "pomeranian":           { tendency:"Pomeranians are clever, loud, and often spoiled. They learn fast — for good or bad habits alike.", tip:"Don't repeat commands. Poms learn quickly that waiting you out pays off if you ask twice.", exercise:"20–30 min. Structured leash walks prevent the 'tiny dog who rules the house' syndrome.", enrichment:"A small rolling puzzle toy — Poms enjoy quick-win enrichment that keeps their clever mind occupied." },
  "shih tzu":             { tendency:"Shih Tzus were bred as lap companions — obedience is not in their DNA. They need extra motivation to engage.", tip:"Use high-value food rewards and keep energy light and fun. Harsh corrections cause them to shut down entirely.", exercise:"20–30 min gentle walk. Avoid heat and humidity — their flat faces make breathing harder when hot.", enrichment:"A soft lick mat or gentle treat-hiding game — low-pressure enrichment that motivates without frustrating them." },
  // Sporting
  "vizsla":               { tendency:"Vizslas are velcro dogs — sensitive, attached, and prone to separation anxiety without proper structure.", tip:"Build independence slowly. Practice place and out-of-sight stays early to prevent anxiety from setting in.", exercise:"60–90 min of vigorous activity. Vizslas are marathon runners — they need real exertion, not a stroll.", enrichment:"A snuffle mat or long-line scent trail followed by tug play — Vizslas need enrichment that also satisfies their need for closeness." },
  "weimaraner":           { tendency:"Weims are high-drive, strong-willed, and prone to destruction when under-exercised. Exercise is not optional.", tip:"Exercise first, always. A Weimaraner who hasn't run today won't train well today.", exercise:"60–90 min minimum. Running, swimming, or fetch are ideal. Today's walk alone is not enough.", enrichment:"A durable puzzle feeder used after exercise, not before — enrichment works best once their energy is already spent." },
  "english springer spaniel":{ tendency:"Springers are enthusiastic, biddable, and prone to overexcitement. They need an outlet for their energy and drive.", tip:"Use calm transitions between exercises to prevent excitement spilling into frantic behavior.", exercise:"45–60 min including fetch or off-leash running to satisfy their sporting instincts.", enrichment:"A flushing-style hide-and-seek game with a favorite toy — taps into their natural sporting instincts." },
  // Guardian / Giant
  "cane corso":           { tendency:"Cane Corsos are dominant, deeply loyal, and require a handler who is calm but absolutely consistent.", tip:"Never lose your composure. A Cane Corso respects calmness above everything else. React — don't overreact.", exercise:"45–60 min structured walk. Leash manners are critical — their strength makes pulling dangerous.", enrichment:"A heavy-duty puzzle feeder or structured chew — enrichment should be calm, low-arousal, and supervised." },
  "kangal":               { tendency:"Kangals are independent livestock guardians. They were not bred to look to humans for direction — they were bred to think for themselves.", tip:"Build a relationship before asking for compliance. Trust must be established before commands will land.", exercise:"60–90 min of open-space exercise. Kangals need room to roam — a yard walk doesn't cut it.", enrichment:"An open-space scatter-feed in the yard — Kangals do best with enrichment that lets them patrol and investigate independently." },
  "boerboel":             { tendency:"Boerboels are confident, territorial, and incredibly strong. Handler authority must be established early and maintained consistently.", tip:"Never allow behavior you wouldn't accept from a 150lb dog — because that's what you're going to have.", exercise:"45–60 min of structured exercise. Include leash work to build handler relationship alongside physical fitness.", enrichment:"A sturdy, weighted puzzle toy — this breed needs enrichment tough enough to match their strength." },
  // Sighthounds
  "greyhound":            { tendency:"Greyhounds are gentle, quiet, and fast. They are sighthound-wired — movement triggers chase instinct instantly.", tip:"Long-line recall work is essential before any off-leash freedom. Do not trust recall near open space.", exercise:"Short sprints rather than long walks. 2–3 daily short sessions of activity suits them better than one long walk.", enrichment:"A slow-scent trail or lick mat — Greyhounds are sprinters, not workers, so low-key enrichment suits them better than puzzles." },
  "whippet":              { tendency:"Whippets are sensitive, affectionate, and surprisingly fast. Like Greyhounds, prey drive is hard-wired.", tip:"Use gentle, encouraging tones. Whippets are emotionally sensitive and respond poorly to harsh handling.", exercise:"45–60 min including a safe off-leash sprint in an enclosed area — they need to run.", enrichment:"A soft snuffle toy or gentle scent game — keep enrichment low-pressure to match their sensitive temperament." },
  // Doodles / Mixed
  "goldendoodle":         { tendency:"Goldendoodles combine retriever eagerness with poodle intelligence. They can be easily excitable and distracted.", tip:"Channel their enthusiasm — use their energy as a reward. Play after a good session beats food for many Doodles.", exercise:"45–60 min. Include both physical activity and a mental challenge like a puzzle or hide-and-seek game.", enrichment:"A treat-dispensing puzzle ball — Doodles enjoy mentally engaging enrichment that keeps their excitable energy focused." },
  "labradoodle":          { tendency:"Labradoodles are clever, energetic, and social. Without direction, that intelligence turns into mischief.", tip:"Keep training sessions varied and fast-paced. Repetitive drills bore Labradoodles into non-compliance.", exercise:"45–60 min. Structured fetch or swimming gives them the outlet they need before focused training.", enrichment:"A rotating variety of puzzle feeders — Labradoodles bore of repetition, so switch it up often." },
  "bernedoodle":          { tendency:"Bernedoodles are gentle and laid-back like Berners, with Poodle sharpness. They are sensitive to conflict and change.", tip:"Keep your energy steady and calm. Bernedoodles absorb handler stress easily — stay composed.", exercise:"30–45 min at a moderate pace. They enjoy outdoor exploration more than intense structured exercise.", enrichment:"A calm snuffle mat or lick mat — Bernedoodles enjoy relaxed, low-arousal enrichment over high-energy games." },
  // Default fallback
  "default":              { tendency:"Every dog is an individual shaped by genetics, history, and environment.", tip:"Read your dog's body language throughout the session. Adjust your energy and pace to match what they need today.", exercise:"Aim for at least 30 min of exercise today before your training session for best results.", enrichment:"A snuffle mat, treat-dispensing puzzle toy, or a short scent 'find it' game — great general enrichment for any dog." },
};

const getBreedData = (breedInput) => {
  if (!breedInput) return BREED_DATA["default"];
  const normalized = breedInput.toLowerCase().trim();
  if (BREED_DATA[normalized]) return BREED_DATA[normalized];
  const match = Object.keys(BREED_DATA).find(k => k !== "default" && (normalized.includes(k) || k.includes(normalized)));
  return match ? BREED_DATA[match] : BREED_DATA["default"];
};

// ─── PUPPY DATA (defined here so Dashboard can reference it) ──────────────────
const ageInWeeks = (birthdayStr) => {
  if(!birthdayStr) return null;
  const parts = birthdayStr.split("/");
  if(parts.length !== 3) return null;
  const bday = new Date(`${parts[2]}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`);
  if(isNaN(bday.getTime())) return null;
  return Math.floor((Date.now() - bday.getTime()) / (1000*60*60*24*7));
};

// Which curriculum a member is enrolled in — locked in ONCE at signup (based on the
// dog's age at that time) and stored on petData.enrolledProgram. It intentionally does
// NOT get recalculated from the dog's current age later (a puppy aging past 20 weeks
// mid-program shouldn't suddenly lose access to puppy content), and there is no way
// for the person to switch it themselves — Standard members can't preview/progress
// through the Puppy curriculum, or vice versa. Older petData that predates this field
// (or the app's default demo state) falls back to computing it from birthday, same as
// the app always used to.
const getEnrolledProgram = (petData) => {
  if(petData?.enrolledProgram==="puppy" || petData?.enrolledProgram==="standard") return petData.enrolledProgram;
  const weeksOld = ageInWeeks(petData?.birthday || "");
  return (weeksOld!==null && weeksOld<20) ? "puppy" : "standard";
};

// Which program(s) this account actually has PAID access to. Purchasing one program
// does not grant the other — the Learn tab only shows/unlocks curricula in this list,
// and offers the missing one as a paid add-on. Falls back to just the enrolled program
// for any pre-existing petData saved before purchasedPrograms existed.
const getPurchasedPrograms = (petData) => {
  if(Array.isArray(petData?.purchasedPrograms) && petData.purchasedPrograms.length){
    return petData.purchasedPrograms.filter(p=>p==="standard"||p==="puppy");
  }
  return [getEnrolledProgram(petData)];
};

// Computes a human-readable age ("2 yrs 3 mo", "5 months old", "3 weeks old") straight
// from the pet's birthday, so age always reflects today's date instead of a stale
// manually-typed value that drifts out of sync over time.
const computeAge = (birthdayStr) => {
  if(!birthdayStr) return null;
  const parts = birthdayStr.split("/");
  if(parts.length !== 3) return null;
  const bday = new Date(`${parts[2]}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`);
  if(isNaN(bday.getTime())) return null;
  const now = new Date();
  if(bday > now) return null;
  let years = now.getFullYear() - bday.getFullYear();
  let months = now.getMonth() - bday.getMonth();
  if(now.getDate() < bday.getDate()) months -= 1;
  if(months < 0){ years -= 1; months += 12; }
  if(years < 0) return null;
  if(years === 0 && months === 0){
    const weeks = Math.max(0, Math.floor((now - bday) / (1000*60*60*24*7)));
    return weeks <= 1 ? `${weeks} week old` : `${weeks} weeks old`;
  }
  if(years === 0) return months === 1 ? "1 month old" : `${months} months old`;
  if(months === 0) return years === 1 ? "1 year old" : `${years} years old`;
  return `${years} yr${years===1?"":"s"} ${months} mo`;
};

// Converts the app's MM/DD/YYYY display format to the YYYY-MM-DD a Postgres
// `date` column actually expects. Shared so every place that saves a
// birthday to Supabase — initial signup AND later edits in Settings —
// converts it the same way, rather than each call site needing its own copy.
const parseBirthday = (b) => {
  if (!b) return null;
  const parts = b.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`;
  return b; // already ISO or unknown format
};

// ─── WELCOME VIDEOS ────────────────────────────────────────────────────────────
// Place the corresponding .mp4 files in your app's public assets folder at these paths
// (e.g. /public/videos/... for Create React App or Vite, or /public/videos/... for Next.js).
// ─── TESTING MODE ───────────────────────────────────────────────────────────────
// While true: the 7-day wait between Learn section weeks is skipped, so testers can move
// through the entire program immediately instead of waiting real days between weeks.
// Set this to false before launching to real, paying customers — otherwise the intended
// weekly pacing (a real part of the training program) will never actually apply.
const TESTING_MODE = false;

// ─── SHARED WEEK-UNLOCK LOGIC ────────────────────────────────────────────────────
// Single source of truth for "is week `wi` of this curriculum unlocked" — used by
// both the Learn tab and the Video Library's locking check, so the two can never
// silently disagree about what's actually available.
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ─── GHL GRADUATION CERTIFICATE WEBHOOKS ─────────────────────────────────────
// Fired once, the moment a learner finishes the final week of each program.
// Each hits its own GoHighLevel Inbound Webhook trigger, which finds/updates the
// contact and sends the certificate email — no PDF/PNG rendering happens here,
// GHL's workflow does that part.
const GHL_CERTIFICATE_WEBHOOKS = {
  puppy: "https://services.leadconnectorhq.com/hooks/Vgv3jETZdSkRK8bOLkJd/webhook-trigger/8b70562c-63e0-465d-bbb1-d7e8c63f7b43",
  standard: "https://services.leadconnectorhq.com/hooks/Vgv3jETZdSkRK8bOLkJd/webhook-trigger/fcd2fd9e-0402-4f56-8be5-5268ba666abf",
};

const sendCertificateWebhook = (program, petData) => {
  const url = GHL_CERTIFICATE_WEBHOOKS[program];
  if(!url) return;
  const payload = {
    email: petData?.email || "",
    phone: petData?.phone || "",
    dogs_name: petData?.name || "",
    program: programLabel(program),
    completion_date: new Date().toISOString().slice(0,10),
  };
  fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  }).catch(err => console.error("[GHL certificate webhook] failed to send:", err));
};

// ─── GHL PROFILE SYNC WEBHOOK ────────────────────────────────────────────────
// Fires whenever a member saves changes to their name, email, or phone in
// Account Settings, so their GoHighLevel contact card stays current. Paste the
// Inbound Webhook URL here once that workflow is built in GHL (Find Contact by
// old_email → Update Contact Field with the new values). Left blank, the sync
// call is skipped — nothing else in the app depends on it.
const GHL_PROFILE_SYNC_WEBHOOK = "https://services.leadconnectorhq.com/hooks/Vgv3jETZdSkRK8bOLkJd/webhook-trigger/308bfdab-f527-4aad-a378-ebd3d14dee1e";

const syncProfileToGHL = (prevClient, nextClient) => {
  if(!GHL_PROFILE_SYNC_WEBHOOK) return;
  const payload = {
    old_email: prevClient.email || "",   // used by GHL to find the existing contact,
    email: nextClient.email || "",       // even when the email itself is what changed
    first_name: nextClient.firstName || "",
    last_name: nextClient.lastName || "",
    phone: nextClient.phone || "",
  };
  fetch(GHL_PROFILE_SYNC_WEBHOOK, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  }).catch(err => console.error("[GHL profile sync webhook] failed to send:", err));
};

// ─── GHL ACCOUNT-DELETED TAG WEBHOOK ─────────────────────────────────────────
// Fires the moment a member requests account deletion, so the GoHighLevel
// contact is immediately tagged "ACCOUNT DELETED" (find contact by email →
// add tag). This is separate from the 30-day data purge — it's just a
// same-second flag on the CRM record so nobody in GHL keeps marketing to,
// or treats as active, an account that's on its way out. Paste the Inbound
// Webhook URL here once that workflow is built in GHL. Left blank, the tag
// call is skipped — nothing else in the app depends on it.
const GHL_ACCOUNT_DELETED_WEBHOOK = "https://services.leadconnectorhq.com/hooks/Vgv3jETZdSkRK8bOLkJd/webhook-trigger/a48c678a-bc38-44cb-b566-3c228e84e100";

const tagAccountDeletedInGHL = (details) => {
  if(!GHL_ACCOUNT_DELETED_WEBHOOK) return;
  const payload = {
    email: details.email || "",
    first_name: details.firstName || "",
    last_name: details.lastName || "",
    tag: "ACCOUNT DELETED",
  };
  fetch(GHL_ACCOUNT_DELETED_WEBHOOK, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  }).catch(err => console.error("[GHL account-deleted tag webhook] failed to send:", err));
};

// ─── GHL ABANDONED CHECKOUT WEBHOOK ──────────────────────────────────────────
// Fires the moment someone reaches the payment screen without having paid yet,
// so GHL can tag the contact "checkout_started" and start a recovery sequence.
const GHL_ABANDONED_CHECKOUT_WEBHOOK = "https://services.leadconnectorhq.com/hooks/Vgv3jETZdSkRK8bOLkJd/webhook-trigger/784fcbfc-d706-4692-a41c-e52dfc5dfa74";

const sendAbandonedCheckoutWebhook = ({ firstName, lastName, email, phone, dogName, dogAge, dogBreed, program }) => {
  if(!GHL_ABANDONED_CHECKOUT_WEBHOOK) return;
  const payload = {
    first_name: firstName || "", last_name: lastName || "", email: email || "", phone: phone || "",
    dogs_name: dogName || "", dogs_age: dogAge || "", dogs_breed: dogBreed || "",
    program: programLabel(program),
  };
  fetch(GHL_ABANDONED_CHECKOUT_WEBHOOK, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  }).catch(err => console.error("[GHL abandoned checkout webhook] failed to send:", err));
};

// GHL new-signup webhook (tags the contact "purchased" in GoHighLevel) now
// fires server-side from api/stripe-webhook.js once payment actually
// completes, rather than from here — see sendSignupWebhook in that file.

// ─── ACCOUNT DELETION (Supabase-backed) ──────────────────────────────────────
// What actually happens, in order, when a member confirms account deletion:
//   1. The member's row in `users` is marked deletion_requested_at = now() and
//      status = "pending_deletion" — this is the real, persisted "delete my
//      account" action, not just a UI state change.
//   2. Their GoHighLevel contact is tagged ACCOUNT DELETED (best-effort, see above).
//   3. Their Supabase session is ended immediately (supabase.auth.signOut()),
//      so the account can no longer be used from this moment on.
//   4. Confirmation + internal emails go out (see simulateSendEmail below).
// Permanent data purge and Auth-user deletion happen 30 days later, matching
// the recovery window promised in the confirmation email. That step requires
// the Supabase service-role key (to call supabase.auth.admin.deleteUser),
// which must never be shipped in client code — it runs as a scheduled
// server-side job (a Supabase Edge Function / cron trigger) that finds every
// `users` row where deletion_requested_at is more than 30 days old, deletes
// the associated data tables, then deletes the Auth user itself. Restoring
// within the 30 days is just clearing deletion_requested_at back to null.
const requestAccountDeletion = async (userIdVal) => {
  if(!userIdVal) return { error: new Error("Missing user id") };
  const { error } = await supabase.from("users").update({
    status: "pending_deletion",
    deletion_requested_at: new Date().toISOString(),
  }).eq("id", userIdVal);
  return { error };
};

const isCurriculumWeekUnlocked = (curriculum, wi, isStandard, welcomeWatched, stdCompleted, puppyWeekDone, weekCompletedAt) => {
  if(wi === 0) return welcomeWatched;
  const prev = curriculum[wi-1];
  if(isStandard) {
    const allDone = prev.lessons.every(l => !!stdCompleted[`${prev.id}::${l}`]);
    if(!allDone) return false;
  } else {
    // For puppy: the prior week must be marked done before the 7-day pacing below applies
    if(!puppyWeekDone?.[prev.id]) return false;
  }
  // If no delay defined, unlock immediately
  if(!curriculum[wi].unlockAfterDays) return true;
  const completedAt = weekCompletedAt[prev.id];
  if(!completedAt) return false;
  // TESTING_MODE (above): skips the real 7-day wait so beta testers can move through
  // every week immediately. Keep this false for real, paying customers so the genuine
  // 7-day pacing between weeks — a real part of the training program, standard AND
  // puppy alike — takes effect.
  return TESTING_MODE ? true : (Date.now() - completedAt) >= SEVEN_DAYS_MS;
};

// ─── VIDEO HOSTING CONFIG ───────────────────────────────────────────────────────
// This ONE line controls where every video in the app is loaded from.
// - While testing locally / before you have a video host: leave as "/videos"
//   and put the .mp4 files in your public/videos folder.
// - Once your videos are uploaded to a host (Bunny.net, Cloudflare R2, etc.):
//   change this to your host's base URL, e.g. "https://guiding-paw.b-cdn.net/videos"
//   — every video reference below updates automatically, no other edits needed.
const VIDEO_BASE_URL = "https://guiding-paw-videos.b-cdn.net/Guiding-paw-videoss";

const WELCOME_VIDEO = {
  standard: {
    src: `${VIDEO_BASE_URL}/Guiding%20Paw%20Welcome%20Video.mp4`,
    title: "Welcome to Guiding Paw",
    caption: "Watch this welcome video before starting the Pre-Requisite section.",
  },
  puppy: {
    src: `${VIDEO_BASE_URL}/Guiding%20Paw%20PUPPY%20Welcome%20Video.mp4`,
    title: "Welcome to the Puppy Program",
    caption: "Watch this welcome video before starting Week 1.",
  },
};

const PUPPY_CURRICULUM = [
  {id:"pp1",  label:"Week 1",  sublabel:"Structure",
    goal:"Creating a predictable rhythm and introducing structure to the puppy through a management schedule, structuring a solid routine, and preventing bad habits early. This week the puppy is learning where to go potty, how to settle, and building trust and stability.",
    equipment:["Slip lead (puppies)","Treat pouch (any will do)","15-20' long line","A kennel","A place bed (raised is best, but any bed with defined edges will work)"],
    tasks:[
      {name:"Establish daily structure (potty-activity-potty-nap)", sessionsPerDay:"N/A", sessionLength:"N/A"},
      {name:"Work for food",                        sessionsPerDay:"24/7", sessionLength:"N/A"},
      {name:"100% Supervision",                     sessionsPerDay:"N/A", sessionLength:"N/A"},
      {name:"Bitey/destructive behavior management", sessionsPerDay:"24/7", sessionLength:"Redirect/assess schedule"},
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me",                      sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming/Handling",                    sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Socializing — 1-3 new sounds (vacuum, tv, knocking), 1-3 new surfaces (tile, rug, wood), 1-3 new objects (umbrella, box, bag)", sessionsPerDay:"1-2", sessionLength:"5 min"},
    ],
    mistakes:["Not giving the puppy enough alone time","Kenneling for too long","Giving too much space for the puppy to exist in","Not rewarding desired behaviors","Forgetting to have fun and enjoy the process"],
    lessons:["Intro to 100% supervision & tethering","Set a schedule","Create and write out your daily schedule"]},
  {id:"pp2",  label:"Week 2",  sublabel:"Communication",
    unlockAfterDays:7,
    goal:"Increase communication using marker words, continuing kennel work, and building engagement.",
    tasks:[
      {name:"Marker Words",                         sessionsPerDay:"1-3", sessionLength:"2-5 min"},
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me",                      sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit with food lure",                   sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Leash pressure inside",                sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Reward Calm",                          sessionsPerDay:"24/7", sessionLength:"24/7"},
      {name:"Socializing — 1-2 new trusted people, movement (walking, moving objects, gestures), novelty (hats, baggy clothes, backpack)", sessionsPerDay:"1-2", sessionLength:"5 min"},
    ],
    mistakes:["Using 'yes' without rewarding","Repeating cues (name, markers)","Forcing interactions instead of fostering curiosity","Inconsistent routines"],
    lessons:["Marker words introduction","Socializing","Name game"]},
  {id:"pp3",  label:"Week 3",  sublabel:"First Skill",
    unlockAfterDays:7,
    goal:"Building responsiveness through a continuation of name games, introduction to recall behaviors, and name \u201csit\u201d cue.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me",                      sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit with food lure and verbal cue",    sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Leash pressure inside with movement",  sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Socializing — sit outside and observe", sessionsPerDay:"1",   sessionLength:"5-10 min"},
      {name:"Reward Calm",                          sessionsPerDay:"24/7", sessionLength:"24/7"},
      {name:"Socializing — sounds (cars, birds, planes), surfaces (cement, wood chips, gravel)", sessionsPerDay:"1-2", sessionLength:"5 min"},
    ],
    mistakes:["Starting too far away from the puppy for recall","Not rewarding the puppy for recalling","Training when the puppy is too distracted/tired","Making training sessions too rigid and not having fun"],
    lessons:["Sit with a lure"]},
  {id:"pp4",  label:"Week 4",  sublabel:"Foundation Behavior",
    unlockAfterDays:7,
    goal:"Continue adding verbal cue for sit, using sit in daily life, expanding socializing. Introduce down with food lure.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me with mild distractions", sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit with verbal cue",                  sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Threshold boundaries",                 sessionsPerDay:"1-4", sessionLength:"2-5 min"},
      {name:"Down with food lure",                  sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Leash pressure outside — low distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Reward Calm",                          sessionsPerDay:"24/7", sessionLength:"24/7"},
      {name:"Socializing — sounds (neighbors, mower, leaf blower)", sessionsPerDay:"1-2", sessionLength:"5 min"},
    ],
    mistakes:["Repeating cues more than once","Overwhelming instead of socializing","Not consistently rewarding calm"],
    lessons:["Sit practice","Socializing inside the home"]},
  {id:"pp5",  label:"Week 5",  sublabel:"Second Skill",
    unlockAfterDays:7,
    goal:"Add verbal cue with down, strengthen sits with distractions, intro to waiting and patience.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me — increase distractions", sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit",                                  sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"1-4", sessionLength:"2-5 min"},
      {name:"Down with verbal cue",                 sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Leash pressure outside — low distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Reward Calm",                          sessionsPerDay:"24/7", sessionLength:"24/7"},
      {name:"Socializing — front yard people watching", sessionsPerDay:"1-2", sessionLength:"5 min"},
    ],
    mistakes:["Getting too close to distractions","Allowing overstimulation","Repeating cues"],
    lessons:["Down with a lure","Socializing inside the home"]},
  {id:"pp6",  label:"Week 6",  sublabel:"Environmental Exposure",
    unlockAfterDays:7,
    goal:"Continue adding verbal cue to \u201cdown\u201d, begin training in the backyard, mild distractions. Introduce Structured Calm - Place.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me",                      sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit — add to daily routine (before food, going outside, etc)", sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Down with verbal cue",                 sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"1-4", sessionLength:"2-5 min"},
      {name:"Leash pressure outside — increase distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Socializing — sounds (neighbors, mower, leaf blower)", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Structured Calm - Place",              sessionsPerDay:"1",   sessionLength:"1-5 min"},
    ],
    mistakes:["Only training at home","Progressing too quickly","Ignoring stress signals"],
    lessons:["Down practice","Socializing outside the home"]},
  {id:"pp7",  label:"Week 7",  sublabel:"Leash Skills",
    unlockAfterDays:7,
    goal:"Teach puppy to follow leash pressure, introduce boundary rules, and improve outdoor engagement.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me",                      sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit",                                  sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Down",                                 sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"1-4", sessionLength:"2-5 min"},
      {name:"Leash pressure outside — increase distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Socializing new environments — 1-2 sessions at a quiet park", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Leash games",                          sessionsPerDay:"1",   sessionLength:"1-5 min"},
      {name:"Structured Calm - Place",              sessionsPerDay:"1",   sessionLength:"1-5 min"},
    ],
    mistakes:["Not working on desensitizing daily","Allowing pulling","Choosing overstimulating environments"],
    lessons:["Leash games","Threshold manners"]},
  {id:"pp8",  label:"Week 8",  sublabel:"Walking Skills",
    unlockAfterDays:7,
    goal:"Build leash skills and engagement in slightly busier areas.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me",                      sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit",                                  sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Down",                                 sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"1-4", sessionLength:"2-5 min"},
      {name:"Socializing — 1-2 park visits with mild/moderate distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Leash Games",                          sessionsPerDay:"1",   sessionLength:"1-5 min"},
      {name:"Intro to loose leash walking",         sessionsPerDay:"1",   sessionLength:"3-5 min"},
      {name:"Structured Calm - Place",              sessionsPerDay:"1",   sessionLength:"1-5 min"},
    ],
    mistakes:["Expecting perfect leash skills","Not rewarding engagement","Moving too quickly into distractions","Ignoring body language"],
    lessons:["Leash games","Walking on leash"]},
  {id:"pp9",  label:"Week 9",  sublabel:"Generalization",
    unlockAfterDays:7,
    goal:"Build confidence and calmness in larger environments.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall with long leash",               sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit",                                  sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Down",                                 sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"1-4", sessionLength:"2-5 min"},
      {name:"Socializing — 1-2 park visits with moderate distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Leash Games",                          sessionsPerDay:"1",   sessionLength:"1-5 min"},
      {name:"Loose leash walking",                  sessionsPerDay:"1",   sessionLength:"5 min"},
      {name:"Structured Calm - Place",              sessionsPerDay:"1",   sessionLength:"5-10 min"},
    ],
    mistakes:["Allowing interaction with everything","Staying too long","Getting too close to distractions and losing engagement"],
    lessons:["Socializing at the park","Generalizing commands at the park"]},
  {id:"pp10", label:"Week 10", sublabel:"Public Socialization",
    unlockAfterDays:7,
    goal:"Introduce calm in controlled public environments.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall with long line",                sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit",                                  sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Down",                                 sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Socializing — 1-2 dog friendly store visits with moderate distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Leash Games",                          sessionsPerDay:"1",   sessionLength:"1-5 min"},
      {name:"Loose leash walking",                  sessionsPerDay:"1",   sessionLength:"5-8 min"},
      {name:"Structured Calm - Place",              sessionsPerDay:"1-2", sessionLength:"5-10 min"},
    ],
    mistakes:["Choosing environments that are too busy","Forcing interactions","Not advocating for the puppy"],
    lessons:["Socializing in the outside world","Store visit socialization"]},
  {id:"pp11", label:"Week 11", sublabel:"Public Socialization II",
    unlockAfterDays:7,
    goal:"Increase time spent in public spaces, build duration, remain calm around activity.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training",                      sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall with long leash",               sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit and Down",                         sessionsPerDay:"1-4", sessionLength:"5 min each"},
      {name:"Leash Games",                          sessionsPerDay:"1",   sessionLength:"1-5 min"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"1-4", sessionLength:"5 min"},
      {name:"Loose leash walking",                  sessionsPerDay:"1",   sessionLength:"8-10 min"},
      {name:"Socializing — 1-2 dog friendly store visits with moderate distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Settling / \u2018do nothing\u2019 practice", sessionsPerDay:"1", sessionLength:"5 min"},
      {name:"Structured Calm - Place",              sessionsPerDay:"1-2", sessionLength:"5-10 min"},
    ],
    mistakes:["Expecting too much","Allowing overstimulation","Not taking breaks"],
    lessons:["Socializing in the outside world","Visit a different type of store than last week"]},
  {id:"pp12", label:"Week 12", sublabel:"Dog Neutrality",
    unlockAfterDays:7,
    goal:"Learn to be neutral around other dogs, strengthen focus despite distractions, build long term habits.",
    note:"Tasks marked with * — see handout for explanations.",
    tasks:[
      {name:"Alone Time *",                         sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel Training *",                    sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game *",                          sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall with long leash *",             sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing *",             sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit and Down *",                       sessionsPerDay:"1-4", sessionLength:"5 min each"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"2-4", sessionLength:"5 min"},
      {name:"Settling / Do Nothing",                sessionsPerDay:"1",   sessionLength:"5 min"},
      {name:"Leash Games",                          sessionsPerDay:"1",   sessionLength:"1-5 min"},
      {name:"Loose leash walking *",                sessionsPerDay:"1",   sessionLength:"10+ min"},
      {name:"Socializing (1-2 park and store visits with moderate distractions) *", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Intro to dog neutrality",              sessionsPerDay:"1",   sessionLength:"5 min"},
      {name:"Structured Calm - Place *",            sessionsPerDay:"1-3", sessionLength:"10-15 min"},
    ],
    mistakes:["Being inconsistent","Allowing unwanted interactions","Expecting perfection"],
    lessons:["Dog neutrality training","Graduation ceremony"], graduation:true},
];

// Daily timed schedules for each puppy week — shown on the Dashboard
const PUPPY_DAILY_SCHEDULE = {
  pp1: [
    {time:"7:00 AM",  task:"Morning tether & feeding",       detail:"Keep pup tethered to you. Feed breakfast in crate.",             emoji:"sun"},
    {time:"8:00 AM",  task:"Potty break",                    detail:"Straight outside immediately after eating.",                    emoji:"leaf"},
    {time:"9:00 AM",  task:"Supervised free time",           detail:"30 min tethered exploration in one room.",                     emoji:"home"},
    {time:"10:00 AM", task:"Nap time in crate",              detail:"45–60 min crate rest. No exceptions.",                         emoji:"sleep"},
    {time:"12:00 PM", task:"Midday potty & lunch",           detail:"Potty, then feed in crate.",                                   emoji:"bowl"},
    {time:"2:00 PM",  task:"Schedule review",                detail:"Write out your puppy's daily schedule and check it against this week's goals.",   emoji:"clipboard"},
    {time:"5:00 PM",  task:"Evening tether & play",          detail:"30 min tethered play with appropriate toys.",                  emoji:"ball"},
    {time:"6:00 PM",  task:"Dinner & evening potty",         detail:"Feed in crate, immediate potty break after.",                  emoji:"moon"},
    {time:"9:00 PM",  task:"Final potty & bedtime",          detail:"Crate for the night. Keep crate near your bed.",               emoji:"bed"},
  ],
  pp2: [
    {time:"7:00 AM",  task:"Morning routine",                detail:"Potty → feed → crate nap.",                                   emoji:"sun"},
    {time:"9:00 AM",  task:"Name game session",              detail:"10 reps: say name → treat when they look. 2 min max.",        emoji:"target"},
    {time:"10:00 AM", task:"Marker word intro",              detail:"Say 'Yes!' → treat 15 times. Build the association.",         emoji:"checkCircle"},
    {time:"11:00 AM", task:"Socialization outing",           detail:"15 min outside — new sounds, surfaces, gentle people.",       emoji:"globe"},
    {time:"12:00 PM", task:"Midday potty & nap",             detail:"Crate nap 45–60 min after lunch.",                           emoji:"sleep"},
    {time:"3:00 PM",  task:"'Good' marker practice",         detail:"Say 'Good!' during calm behavior. 5 min session.",            emoji:"dot"},
    {time:"5:00 PM",  task:"Name game round 2",              detail:"10 more reps in a new location.",                             emoji:"target"},
    {time:"7:00 PM",  task:"Socialization log",              detail:"Write down 3 new things your puppy encountered today.",       emoji:"pencil"},
  ],
  pp3: [
    {time:"7:30 AM",  task:"Morning potty & energy burn",    detail:"10 min outside sniff walk before training.",                  emoji:"leaf"},
    {time:"9:00 AM",  task:"Sit lure session #1",            detail:"Hold treat at nose → move slowly up. 5 reps, mark 'Yes!'.",  emoji:"target"},
    {time:"9:05 AM",  task:"Play break",                     detail:"2 min play reward after session.",                            emoji:"ball"},
    {time:"11:00 AM", task:"Sit lure session #2",            detail:"5 reps in a new spot (kitchen vs living room).",              emoji:"target"},
    {time:"12:00 PM", task:"Lunch & crate nap",              detail:"Feed in crate. 60 min rest.",                                 emoji:"sleep"},
    {time:"3:00 PM",  task:"Sit lure session #3",            detail:"5 reps. Try fading lure: fake lure hand, treat from pocket.", emoji:"target"},
    {time:"5:30 PM",  task:"Free shaping play",              detail:"Let pup explore. Mark and treat any voluntary sits.",         emoji:"paw"},
  ],
  pp4: [
    {time:"8:00 AM",  task:"Morning sit practice",           detail:"5 reps sit from lure. Start adding verbal cue 'Sit'.",       emoji:"target"},
    {time:"9:30 AM",  task:"Indoor socialization",           detail:"New object (bag, box, umbrella) — let pup investigate.",     emoji:"box"},
    {time:"11:00 AM", task:"Sit stay attempt",               detail:"Ask for sit, pause 1 sec, mark & treat. Build to 3 sec.",    emoji:"timer"},
    {time:"12:00 PM", task:"Lunch & nap",                    detail:"Crate nap 45–60 min.",                                       emoji:"sleep"},
    {time:"3:00 PM",  task:"Sit with verbal only",           detail:"Try 'Sit' without lure hand. Reward if they get it.",        emoji:"message"},
    {time:"5:00 PM",  task:"Indoor socialization #2",        detail:"New visitor or unfamiliar sound (vacuum, blender).",         emoji:"users"},
  ],
  pp5: [
    {time:"8:00 AM",  task:"Sit review",                     detail:"5 quick sits to warm up. Verbal cue only.",                  emoji:"checkCircle"},
    {time:"9:00 AM",  task:"Down lure session #1",           detail:"Sit → lure nose to floor slowly. Mark the moment elbows hit.",emoji:"target"},
    {time:"10:00 AM", task:"Indoor socialization",           detail:"Invite pup to approach different textures (tile, rug, mat).",emoji:"home"},
    {time:"12:00 PM", task:"Nap",                            detail:"Crate rest 60 min.",                                         emoji:"sleep"},
    {time:"2:00 PM",  task:"Down lure session #2",           detail:"5 reps. Try 'Down' verbal cue before lure.",                 emoji:"target"},
    {time:"4:00 PM",  task:"Socialization walk",             detail:"On-leash walk in yard. New sounds, smells.",                  emoji:"leaf"},
    {time:"6:00 PM",  task:"Down lure session #3",           detail:"5 reps. Try luring from stand.",                             emoji:"target"},
  ],
  pp6: [
    {time:"8:00 AM",  task:"Down review",                    detail:"5 reps verbal cue only indoors.",                            emoji:"checkCircle"},
    {time:"9:30 AM",  task:"First outdoor training session", detail:"5 sit reps + 5 down reps outside on your driveway.",        emoji:"sun"},
    {time:"11:00 AM", task:"Outdoor socialization",          detail:"Meet a neighbor. Practice calm greeting.",                   emoji:"wave"},
    {time:"12:00 PM", task:"Lunch & nap",                    detail:"Crate rest.",                                                emoji:"sleep"},
    {time:"3:00 PM",  task:"Outdoor down practice",          detail:"5 downs on grass. New surface challenge.",                   emoji:"target"},
    {time:"5:00 PM",  task:"Socialization log",              detail:"Record 3 new outdoor things pup encountered.",               emoji:"pencil"},
  ],
  pp7: [
    {time:"8:00 AM",  task:"Leash introduction",             detail:"Put leash on in yard. Let pup drag it for 5 min.",           emoji:"link"},
    {time:"9:00 AM",  task:"Leash game: follow me",          detail:"Walk away, reward when pup catches up. 5 min.",              emoji:"target"},
    {time:"10:00 AM", task:"Threshold manners practice",     detail:"Stop at every doorway. Wait for pup to pause before going.", emoji:"door"},
    {time:"12:00 PM", task:"Nap",                            detail:"Crate rest.",                                                emoji:"sleep"},
    {time:"2:00 PM",  task:"Leash game: check-ins",          detail:"Walk, stop randomly. Reward eye contact.",                   emoji:"eye"},
    {time:"4:30 PM",  task:"Door threshold practice",        detail:"Practice front door, back door, and car door exits.",        emoji:"car"},
  ],
  pp8: [
    {time:"8:00 AM",  task:"Leash warm-up",                  detail:"Leash games in yard: 5 min direction changes.",              emoji:"refresh"},
    {time:"9:00 AM",  task:"First real walk",                detail:"10 min neighborhood walk. Reward check-ins every 30 sec.",   emoji:"footprints"},
    {time:"11:00 AM", task:"Loose leash practice",           detail:"Stop dead when pup pulls. Reward any slack.",                emoji:"link"},
    {time:"12:00 PM", task:"Nap",                            detail:"Crate rest after activity.",                                 emoji:"sleep"},
    {time:"3:00 PM",  task:"Walking session #2",             detail:"10 min walk. Focus on attention, not destination.",          emoji:"footprints"},
    {time:"5:00 PM",  task:"Review & log",                   detail:"How many steps had loose leash? Track progress.",            emoji:"chart"},
  ],
  pp9: [
    {time:"8:00 AM",  task:"Home commands review",           detail:"Sit + Down + Name game in yard.",                           emoji:"home"},
    {time:"10:00 AM", task:"Park outing",                    detail:"Drive to a park. Sit at distance from other dogs/people.",   emoji:"leaf"},
    {time:"10:20 AM", task:"Park training session",          detail:"5 sits + 5 downs at the park. Raise criteria slowly.",      emoji:"target"},
    {time:"10:40 AM", task:"Park socialization",             detail:"Controlled greet of 1–2 calm dogs (if safe).",              emoji:"dog"},
    {time:"12:00 PM", task:"Post-outing nap",                detail:"Long crate rest after stimulating outing.",                 emoji:"sleep"},
    {time:"4:00 PM",  task:"Generalization session",         detail:"Practice commands in backyard or new indoor room.",          emoji:"refresh"},
  ],
  pp10: [
    {time:"9:00 AM",  task:"Morning commands review",        detail:"Sit + Down + Walk check-ins before outing.",                emoji:"checkCircle"},
    {time:"10:00 AM", task:"Store visit #1",                 detail:"Pet-friendly store. Sit at entry, walk calmly inside.",     emoji:"bag"},
    {time:"10:30 AM", task:"Store training reps",            detail:"Ask for sits + downs inside store. Reward calm behavior.",  emoji:"target"},
    {time:"12:00 PM", task:"Post-outing rest",               detail:"Long crate nap after public outing.",                      emoji:"sleep"},
    {time:"4:00 PM",  task:"Debrief & plan",                 detail:"What went well? What needs work? Plan next store visit.",   emoji:"clipboard"},
  ],
  pp11: [
    {time:"9:00 AM",  task:"Pre-outing commands",            detail:"Warm up sits + downs at home before leaving.",              emoji:"checkCircle"},
    {time:"10:00 AM", task:"Store visit #2 (different type)",detail:"Hardware store, garden center, or outdoor retail.",         emoji:"bag"},
    {time:"10:30 AM", task:"New environment training",       detail:"Practice sit, down, name game in this new store.",          emoji:"target"},
    {time:"11:00 AM", task:"Outdoor socialization",          detail:"Sit near busy sidewalk or parking lot.",                    emoji:"sun"},
    {time:"12:00 PM", task:"Crate nap",                      detail:"Recovery rest after public exposure.",                     emoji:"sleep"},
    {time:"4:00 PM",  task:"Progress review",                detail:"Compare to Week 10. Celebrate improvements!",              emoji:"party"},
  ],
  pp12: [
    {time:"9:00 AM",  task:"Full commands review",           detail:"Sit, Down, Walk, Name — all from verbal cue only.",        emoji:"checkCircle"},
    {time:"10:00 AM", task:"Dog neutrality outing",          detail:"Walk past calm dogs at distance. Reward neutral response.", emoji:"dog"},
    {time:"10:30 AM", task:"Parallel walking",               detail:"Walk alongside a calm dog 10ft apart. Reward focus.",      emoji:"footprints"},
    {time:"12:00 PM", task:"Nap",                            detail:"Crate rest before graduation.",                            emoji:"sleep"},
    {time:"3:00 PM",  task:"Graduation preparation",         detail:"Final walk + commands demo for photos/video.",             emoji:"gradCap"},
    {time:"5:00 PM",  task:"Graduation ceremony",            detail:"Celebrate! Generate certificate and share with trainer.",  emoji:"medal"},
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: SHARE & REFER
// ═══════════════════════════════════════════════════════════════════════════════
const ShareScreen = () => {
  const T=useTheme();
  const [copied,setCopied]=useState(false);
  const [shareMsg,setShareMsg]=useState("");
  const REFERRAL_CODE="GPAW25";
  const REFERRAL_LINK=`https://app.guidingpaw.com?ref=${REFERRAL_CODE}`;

  const handleCopy=(text)=>{
    try{ navigator.clipboard.writeText(text); }catch{ /* fallback */ }
    setCopied(true); setTimeout(()=>setCopied(false),2200);
  };

  const shareText=`I've been using Guiding Paw Training and my dog's behavior has completely transformed! Check it out: ${REFERRAL_LINK}`;

  const socials=[
    {name:"Facebook",  emoji:"bookOpen", color:"#1877f2",
      url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(REFERRAL_LINK)}&quote=${encodeURIComponent("My dog is crushing it with Guiding Paw Training!")}` },
    {name:"Instagram", emoji:"camera", color:"#e1306c",
      url:null, note:"Copy link → paste in your bio or story" },
    {name:"X / Twitter",emoji:"bird", color:"#1da1f2",
      url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` },
    {name:"SMS / Text",emoji:"message", color:"#4caf7d",
      url:`sms:?body=${encodeURIComponent(shareText)}` },
    {name:"Email",     emoji:"mail", color:"#B08D57",
      url:`mailto:?subject=${encodeURIComponent("You need to try this dog training app!")}&body=${encodeURIComponent(shareText)}` },
    {name:"WhatsApp",  emoji:"chat", color:"#25d366",
      url:`https://wa.me/?text=${encodeURIComponent(shareText)}` },
  ];

  const handleNativeShare=()=>{
    if(navigator.share){
      navigator.share({ title:"Guiding Paw Training", text:"My dog is crushing it!", url:REFERRAL_LINK }).catch(()=>{});
    } else {
      handleCopy(shareText);
    }
  };

  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"18px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Share & Refer</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Spread the Word <Icon name="paw" size={17} style={{marginLeft:"2px"}}/></h2>
        <p style={{fontSize:"12px",color:T.textMuted,marginTop:"4px",lineHeight:1.55}}>Know someone whose dog could use some help? Share Guiding Paw and help them transform their relationship with their pup.</p>
      </div>

      {/* Referral code card */}
      <div className="s2" style={{background:T.mode==="dark"?"rgba(176,141,87,.1)":"rgba(176,141,87,.08)",border:`1px solid rgba(176,141,87,.35)`,borderRadius:"16px",padding:"18px",marginBottom:"14px",textAlign:"center"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"8px"}}>Your Referral Code</p>
        <div style={{fontFamily:"'Inter',serif",fontSize:"32px",fontWeight:"900",color:T.text,letterSpacing:".2em",marginBottom:"8px"}}>{REFERRAL_CODE}</div>
        <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"14px",lineHeight:1.5}}>Friends who use your code get a special welcome — and you're helping someone give their dog a better life.</p>
        <button onClick={()=>handleCopy(REFERRAL_CODE)}
          style={{background:T.gold,border:"none",borderRadius:"10px",padding:"10px 24px",fontSize:"13px",fontWeight:"900",color:"#fff",cursor:"pointer",letterSpacing:".06em",fontFamily:"'Lato',sans-serif",transition:"all .2s"}}>
          {copied?<><Icon name="check" size={11} strokeWidth={3}/> Copied!</>:"Copy Code"}
        </button>
      </div>

      {/* Share link */}
      <div className="s3" style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"8px"}}>Your Referral Link</p>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <div style={{flex:1,background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",padding:"9px 12px",overflow:"hidden"}}>
            <p style={{fontSize:"11.5px",color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{REFERRAL_LINK}</p>
          </div>
          <button onClick={()=>handleCopy(REFERRAL_LINK)}
            style={{background:T.gold,border:"none",borderRadius:"9px",padding:"9px 14px",fontSize:"12px",fontWeight:"700",color:"#fff",cursor:"pointer",fontFamily:"'Lato',sans-serif",flexShrink:0,transition:"all .2s"}}>
            {copied?<Icon name="check" size={11} strokeWidth={3}/>:"Copy"}
          </button>
        </div>
      </div>

      {/* Native share button */}
      <button onClick={handleNativeShare} className="btn-gold"
        style={{width:"100%",padding:"13px",background:T.gold,color:"#fff",border:"none",borderRadius:"11px",fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"'Lato',sans-serif",cursor:"pointer",boxShadow:"0 4px 18px rgba(176,141,87,.28)",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
        <Icon name="link" size={15} style={{marginRight:"3px"}}/> Share Guiding Paw
      </button>

      {/* Social platform buttons */}
      <div className="s4" style={{marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"10px"}}>Share On</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px"}}>
          {socials.map(({name,emoji,color,url,note})=>(
            <button key={name}
              onClick={()=>{
                if(url){
                  if(url.startsWith("mailto:")||url.startsWith("sms:")){
                    // These hand off to the Mail/Messages app directly — opening them
                    // in a new tab (window.open) leaves a blank tab behind instead.
                    window.location.href=url;
                  } else {
                    window.open(url,"_blank");
                  }
                } else {
                  handleCopy(REFERRAL_LINK); setShareMsg(`Link copied — paste it on ${name}!`);
                }
              }}
              style={{background:T.mode==="dark"?`${color}18`:`${color}12`,border:`1px solid ${color}44`,borderRadius:"12px",padding:"12px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:"9px",transition:"all .18s",textAlign:"left"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${color}28`;e.currentTarget.style.borderColor=`${color}88`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=T.mode==="dark"?`${color}18`:`${color}12`;e.currentTarget.style.borderColor=`${color}44`;}}>
              <span style={{flexShrink:0,color:T.text,display:"flex",alignItems:"center"}}><Icon name={emoji} size={19}/></span>
              <div style={{minWidth:0}}>
                <p style={{fontSize:"12px",fontWeight:"700",color:T.text,lineHeight:1.2}}>{name}</p>
                {note&&<p style={{fontSize:"9.5px",color:T.textFaint,lineHeight:1.3,marginTop:"1px"}}>{note}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {shareMsg&&<p style={{fontSize:"11px",color:"#4caf7d",fontWeight:"700",textAlign:"center",marginTop:"10px"}}>{shareMsg}</p>}

      {/* Pre-written message */}
      <div className="s5" style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"8px"}}>Ready-to-Send Message</p>
        <div style={{background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",padding:"12px 14px",marginBottom:"10px"}}>
          <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.7}}>{shareText}</p>
        </div>
        <button onClick={()=>handleCopy(shareText)}
          style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"10px",fontSize:"12px",fontWeight:"700",color:T.gold,cursor:"pointer",fontFamily:"'Lato',sans-serif",transition:"all .2s"}}>
          {copied?<><Icon name="check" size={11} strokeWidth={3}/> Copied!</>:"Copy Message"}
        </button>
      </div>

      {/* Social media follow */}
      <div className="s6" style={{background:T.socialBg,border:`1px solid ${T.socialBorder}`,borderRadius:"14px",padding:"14px 16px"}}>
        <p style={{fontSize:"10px",color:"#4caf7d",fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"6px"}}>Follow Guiding Paw</p>
        <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55,marginBottom:"10px"}}>Stay connected for training tips, success stories, and community support.</p>
        {[
          {name:"Instagram",emoji:"camera",handle:"@guidingpawtraining",url:"https://instagram.com/guidingpawtraining"},
          {name:"Facebook", emoji:"bookOpen",handle:"Guiding Paw Training",url:"https://facebook.com/guidingpawtraining"},
          {name:"TikTok",   emoji:"music",handle:"@guidingpawtraining",url:"https://tiktok.com/@guidingpawtraining"},
        ].map(({name,emoji,handle,url})=>(
          <a key={name} href={url} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",borderBottom:name!=="TikTok"?`1px solid ${T.divider}`:"none",textDecoration:"none"}}>
            <span style={{width:"24px",display:"flex",justifyContent:"center",color:T.text}}><Icon name={emoji} size={17}/></span>
            <div style={{flex:1}}>
              <p style={{fontSize:"12px",fontWeight:"700",color:T.text}}>{name}</p>
              <p style={{fontSize:"11px",color:T.textFaint}}>{handle}</p>
            </div>
            <span style={{color:T.textFaint,fontSize:"14px"}}>›</span>
          </a>
        ))}
      </div>
    </ScrollBody>
  );
};

// ─── SHARED "CURRENT WEEK" LOGIC ───────────────────────────────────────────────
// Both the Dashboard and the Learn screen need to agree on exactly which week the
// person is currently on for each program, so whichever week shows on the Dashboard
// is the same one that's front-and-center (auto-opened) in Learn. Centralizing the
// math here means there's only one place that can ever disagree with itself.
function getCurrentStdWeek(stdCompleted={}){
  const stdCurriculum = STANDARD_CURRICULUM;
  const isGraduated = stdCurriculum.filter(w=>!w.graduation).every(w=>
    w.lessons.every(l=>!!stdCompleted[`${w.id}::${l}`])
  );
  const idx = isGraduated
    ? stdCurriculum.length - 1
    : stdCurriculum.findIndex((w)=> !w.graduation && !w.lessons.every(l=>!!stdCompleted[`${w.id}::${l}`]));
  const safeIdx = Math.max(0, idx);
  return { isGraduated, idx: safeIdx, week: stdCurriculum[safeIdx] };
}
function getCurrentPuppyWeek(puppyWeekDone={}){
  const idx = PUPPY_CURRICULUM.findIndex(w=>!puppyWeekDone?.[w.id]);
  // If every week is marked done, "current" is the last week rather than looping
  // back to week 1.
  const safeIdx = idx===-1 ? PUPPY_CURRICULUM.length-1 : idx;
  return { idx: safeIdx, week: PUPPY_CURRICULUM[safeIdx] };
}

const DashboardScreen = ({petData,plan,onOpenRecord,puppyWeekDone,puppyStreak,stdCompleted,graduated,onOpenHandout,onOpenVideo,pottyTimer,onOpenPottyTimer,assignDone={},setAssignDone=()=>{},routineDone={},setRoutineDone=()=>{},petId=null}) => {
  const T=useTheme();
  const petName=petData?.name||"your dog";
  const breed=petData?.breed||"";
  const bd=getBreedData(breed);
  const [showGameInfo,setShowGameInfo]=useState(false);

  // Daily tip — same tip for everyone on a given calendar day, on any device
  const dailyTip = getDailyTip();

  // Which program this pet is enrolled in — locked in at signup (see getEnrolledProgram),
  // same source of truth the Learn tab and video locking use, so this never disagrees
  // with them even if the dog ages past the puppy cutoff mid-program.
  const isPuppy = getEnrolledProgram(petData) === "puppy";

  // ── Standard program: find current week from completed lessons ──
  // (shared with the Learn screen via getCurrentStdWeek, so the two screens can
  // never show different "current" weeks)
  const stdCurriculum = STANDARD_CURRICULUM;
  const stdCurrent = getCurrentStdWeek(stdCompleted||{});
  const isGraduated = graduated || stdCurrent.isGraduated;
  const currentStdWeekIdx = stdCurrent.idx;
  const currentStdWeek = stdCurrent.week;
  const stdProgress = isGraduated ? 100 : Math.round(
    (stdCurriculum.filter(w=>!w.graduation).filter(w=>
      w.lessons.every(l=>!!(stdCompleted||{})[`${w.id}::${l}`])
    ).length / stdCurriculum.filter(w=>!w.graduation).length) * 100
  );

  // Puppy (shared with the Learn screen via getCurrentPuppyWeek)
  const puppyCurrent = getCurrentPuppyWeek(puppyWeekDone||{});
  const currentPuppyWeekIdx = isPuppy ? puppyCurrent.idx : 0;
  const currentPuppyWeek = isPuppy ? puppyCurrent.week : PUPPY_CURRICULUM[0];
  const puppyProgress=isPuppy
    ? Math.round((Object.keys(puppyWeekDone||{}).filter(k=>puppyWeekDone[k]).length / PUPPY_CURRICULUM.length)*100)
    : 0;

  // ── Streak: loaded from Supabase (via puppyStreak prop), updated on assignment completion ──
  const [streak,setStreak]=useState(puppyStreak||0);
  // Keep local streak state in sync with the loaded pet — without this,
  // switching pets (or reloading puppyStreak from Supabase after the
  // initial render) would keep showing a stale streak from whichever pet
  // was active when this component first mounted.
  useEffect(()=>{ setStreak(puppyStreak||0); }, [petId, puppyStreak]);

  const handleAssignComplete=(taskName)=>{
    const alreadyDone=!!assignDone[taskName];
    setAssignDone(d=>({...d,[taskName]:!alreadyDone}));
    if(!alreadyDone){
      updateStreakOnActivity(petId, streak).then(newStreak=>setStreak(newStreak));
    }
  };

  // Maintenance tasks for graduation
  const MAINTENANCE_TASKS = isGraduated ? (currentStdWeek?.tasks||[]) : [];

  // ── CHANGE 6: Training Exercise reflects the pup's real current focus — the
  // active week's tasks, or graduation/maintenance work once the program is done ──
  const graduationWeek = STANDARD_CURRICULUM[STANDARD_CURRICULUM.length-1];
  const trainingFocusTasks = isGraduated
    ? (graduationWeek?.tasks||[])
    : isPuppy
      ? (currentPuppyWeek?.tasks||[])
      : (currentStdWeek?.tasks||[]);
  const trainingFocusLabel = isGraduated
    ? "Graduation & Beyond"
    : isPuppy
      ? `${currentPuppyWeek?.label}: ${currentPuppyWeek?.sublabel}`
      : (currentStdWeek?.label || "This Week");
  const trainingFocusDetail = trainingFocusTasks.length
    ? trainingFocusTasks.slice(0,2).map(t=>t.name).join(" · ")
    : "Recall";

  // ── CHANGE 5: Enrichment suggestion pulled from the pup's breed profile ──
  const enrichmentDetail = bd.enrichment || "Puzzle toy or scent-based sniff game";

  // ── Engagement Game: a real, named game with instructions, not a placeholder ──
  const featuredGame = getDailyEngagementGame();

  const routineItems=[
    {icon:"footprints",label:"Walk",detail:"25 minutes"},
    {icon:"controller",label:"Engagement Game",detail:featuredGame.name,sub:`${featuredGame.time} · ${featuredGame.level}`},
    {icon:"target",label:"Training Exercise",detail:trainingFocusDetail,sub:trainingFocusLabel},
    {icon:"puzzle",label:"Enrichment",detail:enrichmentDetail},
  ];

  const pottyRemaining=usePottyRemaining(pottyTimer||IDLE_POTTY_TIMER);
  const pottyActive=pottyTimer&&pottyTimer.status!=="idle";
  const pottyDone=pottyActive&&pottyRemaining===0;

  return (
    <ScrollBody>
      <div className="s1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",gap:"10px"}}>
        <div>
          <p style={{fontSize:"11px",color:T.textMuted,letterSpacing:".1em",textTransform:"uppercase"}}>Welcome</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700"}}>{petName}'s Dashboard</h2>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
          {/* Small live potty-timer badge — visible from the dashboard while the timer runs */}
          {pottyActive&&(
            <button onClick={onOpenPottyTimer} title="Potty timer"
              style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 10px",borderRadius:"20px",cursor:"pointer",fontFamily:"'Lato',sans-serif",
                background:pottyDone?"rgba(224,122,95,.14)":"rgba(176,141,87,.14)",
                border:`1px solid ${pottyDone?"#e07a5f":T.gold}`}}>
              <Icon name="droplet" size={12} color={pottyDone?"#e07a5f":T.gold}/>
              <span style={{fontSize:"11px",fontWeight:"900",color:pottyDone?"#e07a5f":T.gold,fontVariantNumeric:"tabular-nums"}}>
                {pottyDone?"GO NOW!":fmtPottyTime(pottyRemaining)}
              </span>
            </button>
          )}
          <LogoImg size={38}/>
        </div>
      </div>

      {/* Daily Trainer Tip */}
      <div className="s1" style={{background:T.mode==="dark"?"rgba(176,141,87,.08)":"rgba(176,141,87,.07)",border:`1px solid rgba(176,141,87,.28)`,borderRadius:"14px",padding:"13px 15px",marginBottom:"13px",display:"flex",gap:"11px",alignItems:"flex-start"}}>
        <span style={{flexShrink:0,marginTop:"1px",color:T.gold}}><Icon name={dailyTip.emoji} size={22}/></span>
        <div>
          <p style={{fontSize:"9px",color:T.gold,fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Trainer Tip of the Day</p>
          <p style={{fontSize:"12.5px",color:T.text,lineHeight:1.6,fontStyle:"italic"}}>"{dailyTip.tip}"</p>
        </div>
      </div>

      {/* Streak + Progress */}
      <div className="s2" style={{display:"flex",gap:"10px",marginBottom:"13px"}}>
        <div style={{width:"84px",flexShrink:0,background:T.streakCard,border:`1px solid ${T.streakBorder}`,borderRadius:"14px",padding:"12px 8px",textAlign:"center"}}>
          <div style={{marginBottom:"2px",display:"flex",color:isGraduated?T.gold:"#e07a5f"}}><Icon name={isGraduated?"trophy":"flame"} size={22}/></div>
          <div style={{fontSize:"22px",fontWeight:"900",color:T.gold,lineHeight:1}}>{streak}</div>
          <div style={{fontSize:"8px",color:T.textMuted,letterSpacing:".07em",textTransform:"uppercase",marginTop:"3px",lineHeight:1.3}}>{isGraduated?"Day\nStreak":"Active\nDays"}</div>
        </div>
        <div style={{flex:1,background:T.progressCard,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
            <span style={{fontSize:"10px",color:T.textMuted,textTransform:"uppercase",letterSpacing:".07em"}}>Progress</span>
            <span style={{fontSize:"11px",fontWeight:"700",color:T.gold}}>{isPuppy?puppyProgress:stdProgress}%</span>
          </div>
          <div style={{background:T.mode==="dark"?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)",borderRadius:"5px",height:"7px",overflow:"hidden",marginBottom:"6px"}}>
            <div style={{width:`${isPuppy?puppyProgress:stdProgress}%`,height:"100%",background:`linear-gradient(90deg,${T.green},${T.gold})`,borderRadius:"5px",transition:"width .5s"}}/>
          </div>
          <p style={{fontSize:"10.5px",color:T.textMuted}}>
            {isPuppy
              ? <>Phase: <span style={{color:T.text,fontWeight:"700"}}>{currentPuppyWeek.label} — {currentPuppyWeek.sublabel}</span></>
              : isGraduated
                ? <span style={{color:"#4caf7d",fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"4px"}}><Icon name="gradCap" size={12}/>Program Complete — Maintenance Mode</span>
                : <>Phase: <span style={{color:T.text,fontWeight:"700"}}>{currentStdWeek?.label}</span></>
            }
          </p>
          {!isPuppy && !isGraduated && streak > 0 && (
            <p style={{fontSize:"10px",color:T.textFaint,marginTop:"3px"}}>
              <Icon name="flame" size={12} style={{marginRight:"3px"}}/>{streak}-day streak — keep going!
            </p>
          )}
        </div>
      </div>

      {/* Puppy Daily Schedule block — shown only for puppy program */}
      {isPuppy && (
        <div className="s3" style={{background:T.assignCard,border:`1px solid ${T.cardInnerBorder}`,borderLeft:`4px solid #4caf7d`,borderRadius:"16px",padding:"16px",marginBottom:"13px",boxShadow:T.mode==="dark"?"0 4px 20px rgba(76,175,125,.1)":"0 4px 20px rgba(76,175,125,.15)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
            <div style={{flex:1}}>
              <p style={{fontSize:"10px",color:"#4caf7d",fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Puppy Daily Schedule</p>
              <p style={{fontFamily:"'Inter',serif",fontSize:"16px",fontWeight:"700",color:T.text,lineHeight:1.25}}>{currentPuppyWeek.label}: {currentPuppyWeek.sublabel}</p>
            </div>
            <div style={{background:"rgba(76,175,125,.15)",borderRadius:"10px",padding:"6px 9px",textAlign:"center",flexShrink:0,marginLeft:"10px"}}>
              <div style={{fontSize:"9px",fontWeight:"700",color:"#4caf7d"}}>WEEK</div>
              <div style={{fontSize:"18px",fontWeight:"900",color:"#4caf7d"}}>{currentPuppyWeekIdx+1}</div>
            </div>
          </div>
          {PUPPY_DAILY_SCHEDULE[currentPuppyWeek.id]?.map((item,i,arr)=>(
            <div key={item.time+item.task} style={{display:"flex",alignItems:"flex-start",gap:"10px",padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${T.divider}`:"none"}}>
              <div style={{background:"rgba(76,175,125,.15)",borderRadius:"7px",padding:"4px 8px",flexShrink:0,minWidth:"52px",textAlign:"center"}}>
                <span style={{fontSize:"10.5px",fontWeight:"900",color:"#4caf7d"}}>{item.time}</span>
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"1px"}}><Linkify text={item.task} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context="puppy"/></p>
                <p style={{fontSize:"10.5px",color:T.textMuted}}><Linkify text={item.detail} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context="puppy"/></p>
              </div>
              <span style={{flexShrink:0}}><Icon name={item.emoji} size={16}/></span>
            </div>
          ))}
        </div>
      )}

      {/* Standard: Today's Assignment — current week tasks */}
      {!isPuppy && !isGraduated && currentStdWeek && (
      <div className="s3" style={{background:T.assignCard,border:`1px solid ${T.cardInnerBorder}`,borderLeft:`4px solid ${T.gold}`,borderRadius:"16px",padding:"16px",marginBottom:"13px",boxShadow:T.mode==="dark"?"0 4px 20px rgba(176,141,87,.12)":"0 4px 20px rgba(176,141,87,.18)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
          <div style={{flex:1}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Today's Assignment</p>
            <p style={{fontFamily:"'Inter',serif",fontSize:"17px",fontWeight:"700",color:T.text,lineHeight:1.2}}>{currentStdWeek.label}</p>
            {currentStdWeek.goal && <p style={{fontSize:"11px",color:T.textMuted,marginTop:"4px",lineHeight:1.5}}>{currentStdWeek.goal.slice(0,120)}{currentStdWeek.goal.length>120?"…":""}</p>}
          </div>
          <div style={{background:"rgba(176,141,87,.15)",borderRadius:"10px",padding:"6px 9px",textAlign:"center",flexShrink:0,marginLeft:"10px"}}>
            <div style={{fontSize:"9px",fontWeight:"700",color:T.gold}}>WEEK</div>
            <div style={{fontSize:"18px",fontWeight:"900",color:T.gold}}>{currentStdWeekIdx}</div>
          </div>
        </div>
        {/* Task checklist from weekly sheet */}
        {currentStdWeek.tasks && currentStdWeek.tasks.length > 0 && (
          <div style={{marginTop:"10px",marginBottom:"12px"}}>
            <p style={{fontSize:"9px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"7px"}}>Today's Tasks</p>
            {currentStdWeek.tasks.map((task,ti)=>{
              const done=!!assignDone[task.name];
              return (
                <div key={ti} onClick={()=>handleAssignComplete(task.name)}
                  style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 10px",borderRadius:"9px",marginBottom:"4px",background:done?"rgba(76,175,125,.08)":"rgba(176,141,87,.05)",border:`1px solid ${done?"rgba(76,175,125,.3)":"rgba(176,141,87,.12)"}`,cursor:"pointer",transition:"all .2s"}}>
                  <div style={{width:"20px",height:"20px",borderRadius:"50%",border:`2px solid ${done?"#4caf7d":T.chipBorder}`,background:done?"#4caf7d":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                    {done&&<Icon name="check" size={10} color="#fff" strokeWidth={3}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:"12px",fontWeight:"600",color:done?T.textFaint:T.text,textDecoration:done?"line-through":"none",lineHeight:1.3}}><Linkify text={task.name} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context="standard"/></p>
                    <p style={{fontSize:"10px",color:T.textFaint}}>{task.sessionsPerDay} sessions/day · {task.sessionLength}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {breed ? (
          <div style={{background:T.mode==="dark"?"rgba(176,141,87,.07)":"rgba(176,141,87,.06)",border:`1px solid rgba(176,141,87,.22)`,borderRadius:"12px",padding:"12px 14px",marginBottom:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"7px"}}>
              <div style={{background:T.gold,borderRadius:"6px",padding:"3px 9px"}}>
                <span style={{fontSize:"9px",fontWeight:"900",color:"#fff",letterSpacing:".1em",textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="dog" size={10}/>{breed}</span>
              </div>
              <span style={{fontSize:"9px",color:T.textFaint,fontWeight:"700",letterSpacing:".08em",textTransform:"uppercase"}}>Breed Insights</span>
            </div>
            <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55}}>{bd.tip}</p>
          </div>
        ) : (
          <div style={{background:T.mode==="dark"?"rgba(176,141,87,.06)":"rgba(176,141,87,.04)",border:`1px solid rgba(176,141,87,.15)`,borderRadius:"10px",padding:"10px 13px",marginBottom:"12px"}}>
            <p style={{fontSize:"11.5px",color:T.textFaint,lineHeight:1.5,display:"flex",alignItems:"flex-start",gap:"4px"}}><Icon name="bulb" size={12} style={{marginTop:"1px",flexShrink:0}}/><span>Add your dog's breed in <span style={{color:T.gold,fontWeight:"700"}}>Settings → Pet Profile</span> for breed-specific tips.</span></p>
          </div>
        )}
        {Object.keys(assignDone).length > 0 && (
          <div style={{background:"rgba(76,175,125,.1)",border:"1px solid rgba(76,175,125,.3)",borderRadius:"10px",padding:"9px 13px",display:"flex",alignItems:"center",gap:"8px"}}>
            <Icon name="flame" size={16} color="#e07a5f"/>
            <p style={{fontSize:"12px",color:"#4caf7d",fontWeight:"700"}}>
              {Object.values(assignDone).filter(Boolean).length}/{currentStdWeek.tasks.length} tasks done today — streak: {streak} day{streak!==1?"s":""}!
            </p>
          </div>
        )}
      </div>
      )}

      {/* Graduation: Maintenance Plan */}
      {!isPuppy && isGraduated && (
      <div className="s3" style={{background:T.assignCard,border:`1px solid rgba(76,175,125,.35)`,borderLeft:`4px solid #4caf7d`,borderRadius:"16px",padding:"16px",marginBottom:"13px",boxShadow:T.mode==="dark"?"0 4px 20px rgba(76,175,125,.1)":"0 4px 20px rgba(76,175,125,.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div style={{flex:1}}>
            <p style={{fontSize:"10px",color:"#4caf7d",fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}><Icon name="gradCap" size={10} style={{marginRight:"3px"}}/>Maintenance Plan</p>
            <p style={{fontFamily:"'Inter',serif",fontSize:"17px",fontWeight:"700",color:T.text,lineHeight:1.2}}>Graduation & Beyond</p>
            <p style={{fontSize:"11px",color:T.textMuted,marginTop:"4px",lineHeight:1.5}}>Keep skills sharp with daily integration. Your streak tracks how often you log in and stay active.</p>
          </div>
          <div style={{background:"rgba(76,175,125,.15)",borderRadius:"10px",padding:"6px 9px",textAlign:"center",flexShrink:0,marginLeft:"10px"}}>
            <Icon name="trophy" size={16} color={T.gold}/>
            <div style={{fontSize:"8px",fontWeight:"700",color:"#4caf7d",marginTop:"2px"}}>GRAD</div>
          </div>
        </div>
        {STANDARD_CURRICULUM[STANDARD_CURRICULUM.length-1]?.tasks?.map((task,ti)=>{
          const done=!!assignDone[task.name];
          return (
            <div key={ti} onClick={()=>handleAssignComplete(task.name)}
              style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 10px",borderRadius:"9px",marginBottom:"4px",background:done?"rgba(76,175,125,.08)":"rgba(76,175,125,.04)",border:`1px solid ${done?"rgba(76,175,125,.3)":"rgba(76,175,125,.12)"}`,cursor:"pointer",transition:"all .2s"}}>
              <div style={{width:"20px",height:"20px",borderRadius:"50%",border:`2px solid ${done?"#4caf7d":"rgba(76,175,125,.4)"}`,background:done?"#4caf7d":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                {done&&<Icon name="check" size={10} color="#fff" strokeWidth={3}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:"12px",fontWeight:"600",color:done?T.textFaint:T.text,textDecoration:done?"line-through":"none",lineHeight:1.3}}><Linkify text={task.name} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context="standard"/></p>
                <p style={{fontSize:"10px",color:T.textFaint}}>{task.sessionsPerDay} sessions/day · {task.sessionLength}</p>
              </div>
            </div>
          );
        })}
        {Object.keys(assignDone).length > 0 && (
          <div style={{background:"rgba(76,175,125,.1)",border:"1px solid rgba(76,175,125,.3)",borderRadius:"10px",padding:"9px 13px",display:"flex",alignItems:"center",gap:"8px",marginTop:"8px"}}>
            <Icon name="trophy" size={16} color={T.gold}/>
            <p style={{fontSize:"12px",color:"#4caf7d",fontWeight:"700"}}>Active {streak} day{streak!==1?"s":""} — great maintenance!</p>
          </div>
        )}
      </div>
      )}

      {/* CHANGE 5: Daily Routine Builder */}
      <div className="s4" style={{background:T.routineCard,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"16px",marginBottom:"13px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <div>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Daily Routine Builder</p>
            <p style={{fontFamily:"'Inter',serif",fontSize:"14px",color:T.text,fontWeight:"700"}}>Today's Plan for {petName}</p>
          </div>
        </div>
        {routineItems.map(({icon,label,detail,sub},i)=>{
          const done=!!routineDone[i];
          const isGame=label==="Engagement Game";
          return (
            <div key={label} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",borderBottom:i<routineItems.length-1?`1px solid ${T.divider}`:"none",cursor:"pointer"}}
              onClick={()=>setRoutineDone(r=>({...r,[i]:!r[i]}))}>
              <span style={{width:"28px",display:"flex",justifyContent:"center",color:T.gold}}><Icon name={icon} size={19}/></span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:"13px",fontWeight:"700",color:done?T.textMuted:T.text,textDecoration:done?"line-through":"none"}}>{label}</p>
                <p style={{fontSize:"11px",color:T.textFaint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{detail}</p>
                {sub&&<p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",marginTop:"1px"}}>{sub}</p>}
              </div>
              {isGame&&(
                <button onClick={(e)=>{e.stopPropagation();setShowGameInfo(true);}} title="How to play"
                  style={{background:"rgba(176,141,87,.15)",border:`1px solid ${T.gold}`,borderRadius:"20px",padding:"5px 10px",display:"flex",alignItems:"center",gap:"4px",cursor:"pointer",flexShrink:0,color:T.gold,fontSize:"10px",fontWeight:"700",fontFamily:"'Lato',sans-serif"}}>
                  <Icon name="info" size={12}/>How to Play
                </button>
              )}
              <div style={{width:"22px",height:"22px",borderRadius:"50%",border:`2px solid ${done?"#4caf7d":T.chipBorder}`,background:done?"#4caf7d":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                {done&&<Icon name="check" size={11} color="#fff" strokeWidth={3}/>}
              </div>
            </div>
          );
        })}
      </div>

      {/* How-to-play instructions for today's featured Engagement Game */}
      {showGameInfo&&(
        <>
          <div onClick={()=>setShowGameInfo(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:99}}/>
          <div style={{position:"fixed",left:"50%",top:"50%",transform:"translate(-50%,-50%)",zIndex:100,width:"min(360px,90vw)",maxHeight:"80vh",overflowY:"auto",background:T.mode==="dark"?"#162032":T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"16px",padding:"20px",boxShadow:"0 20px 50px rgba(0,0,0,.4)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
              <div>
                <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"4px"}}>Today's Engagement Game</p>
                <h3 style={{fontFamily:"'Inter',serif",fontSize:"19px",fontWeight:"700",color:T.text}}>{featuredGame.name}</h3>
              </div>
              <button onClick={()=>setShowGameInfo(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,flexShrink:0}}><Icon name="x" size={16}/></button>
            </div>
            <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"16px"}}>{featuredGame.time} · {featuredGame.level}</p>

            <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"6px"}}>You'll Need</p>
            <p style={{fontSize:"13px",color:T.text,marginBottom:"16px"}}>{featuredGame.materials}</p>

            <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>How to Play</p>
            <ol style={{margin:0,paddingLeft:"18px",marginBottom:"16px"}}>
              {featuredGame.steps.map((s,si)=>(
                <li key={si} style={{fontSize:"13px",color:T.text,lineHeight:1.6,marginBottom:"6px"}}>{s}</li>
              ))}
            </ol>

            <div style={{background:"rgba(176,141,87,.08)",border:`1px solid rgba(176,141,87,.25)`,borderRadius:"10px",padding:"11px 13px"}}>
              <p style={{fontSize:"11.5px",color:T.textMuted,lineHeight:1.5,display:"flex",alignItems:"flex-start",gap:"5px"}}><Icon name="bulb" size={12} style={{marginTop:"1px",flexShrink:0,color:T.gold}}/><span><strong style={{color:T.text}}>Tip:</strong> {featuredGame.tip}</span></p>
            </div>
          </div>
        </>
      )}

      {/* Quick stats */}
      <div className="s5" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px",marginBottom:"13px"}}>
        {[{label:"Sessions Done",value:"14"},{label:"This Week",value:"3/5"}].map(({label,value})=>(
          <div key={label} style={{background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"12px",padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:"18px",fontWeight:"900",color:T.gold}}>{value}</div>
            <div style={{fontSize:"9.5px",color:T.textMuted,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</div>
          </div>
        ))}
      </div>
      {/* Pet Life Record card */}
      <div
        className="s6"
        onClick={onOpenRecord}
        style={{
          background:T.green,
          border:`1px solid rgba(176,141,87,.25)`,
          borderRadius:"16px",padding:"14px 16px",
          marginBottom:"13px",cursor:"pointer",
          display:"flex",alignItems:"center",gap:"12px",
          boxShadow:"0 4px 16px rgba(0,0,0,.18)",
          transition:"transform .18s, box-shadow .18s",
          position:"relative",overflow:"hidden",
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.28)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.18)";}}
      >
        <div style={{width:"44px",height:"44px",borderRadius:"50%",background:petData?.photoUrl?"transparent":"rgba(176,141,87,.25)",border:`2px solid ${T.gold}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:T.gold,overflow:"hidden"}}>
          {petData?.photoUrl
            ? <img src={petData.photoUrl} alt={petName} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <Icon name="paw" size={22}/>}
        </div>
        <div style={{flex:1}}>
          <p style={{fontSize:"10px",color:"rgba(255,255,255,.5)",fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"3px"}}>Full Profile</p>
          <p style={{fontFamily:"'Inter',serif",fontSize:"15px",fontWeight:"700",color:"#fff",marginBottom:"2px"}}>{petName}'s Life Record</p>
          <div style={{display:"flex",gap:"10px"}}>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,.6)",display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="flame" size={10}/>7-day streak</span>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,.6)",display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="syringe" size={10}/>Vaccines <Icon name="check" size={10} strokeWidth={3}/></span>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,.6)",display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="run" size={10}/>1.2mi</span>
          </div>
        </div>
        <div style={{color:"rgba(255,255,255,.4)",fontSize:"18px",flexShrink:0}}>›</div>
      </div>

    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: LIVE
// ═══════════════════════════════════════════════════════════════════════════════

// ─── POTTY TIMER — shared helpers ──────────────────────────────────────────────
// The potty timer's state lives in the App root (see <App/>) so it can tick down
// in the background and stay visible as a small badge on the Dashboard even while
// the person is on a different page — not just while the Potty Schedule tab is open.
const IDLE_POTTY_TIMER = { status:"idle", endTime:null, remainingSecs:0, totalSecs:0 };

function fmtPottyTime(s) {
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}

// Ticks once a second while the timer is running, and returns the live remaining seconds.
function usePottyRemaining(pottyTimer) {
  const [,forceTick] = useState(0);
  useEffect(() => {
    if (pottyTimer.status !== "running") return;
    const id = setInterval(() => forceTick(t => t+1), 1000);
    return () => clearInterval(id);
  }, [pottyTimer.status, pottyTimer.endTime]);
  if (pottyTimer.status === "running") {
    return Math.max(0, Math.round((pottyTimer.endTime - Date.now())/1000));
  }
  return pottyTimer.remainingSecs || 0;
}

// ─── ROLLING TIME WHEEL — pick a duration by scrolling, like the iPhone timer ──
const WheelColumn = ({values, selected, onChange}) => {
  const T=useTheme();
  const itemH=34, visible=3, pad=1;
  const ref=useRef(null);
  const skipNext=useRef(false);
  const debounceRef=useRef(null);

  useEffect(()=>{
    if(!ref.current) return;
    const idx=values.indexOf(selected);
    skipNext.current=true;
    ref.current.scrollTop=Math.max(0,idx)*itemH;
    const t=setTimeout(()=>{skipNext.current=false;},60);
    return ()=>clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const settleTo=(idx)=>{
    const clamped=Math.max(0,Math.min(values.length-1,idx));
    if(ref.current) ref.current.scrollTo({top:clamped*itemH,behavior:"smooth"});
    if(values[clamped]!==selected) onChange(values[clamped]);
  };

  const handleScroll=()=>{
    if(skipNext.current) return;
    if(debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current=setTimeout(()=>{
      if(!ref.current) return;
      settleTo(Math.round(ref.current.scrollTop/itemH));
    },110);
  };

  return (
    <div style={{position:"relative",height:itemH*visible,width:"58px"}}>
      <div style={{position:"absolute",top:itemH*pad,left:0,right:0,height:itemH,background:"rgba(176,141,87,.14)",borderTop:`1.5px solid ${T.gold}`,borderBottom:`1.5px solid ${T.gold}`,borderRadius:"7px",pointerEvents:"none"}}/>
      <div ref={ref} onScroll={handleScroll} className="wheel-scroll"
        style={{height:itemH*visible,overflowY:"auto",scrollSnapType:"y mandatory",WebkitOverflowScrolling:"touch"}}>
        <div style={{height:itemH*pad}}/>
        {values.map((v,i)=>(
          <div key={v} onClick={()=>settleTo(i)}
            style={{height:itemH,display:"flex",alignItems:"center",justifyContent:"center",scrollSnapAlign:"start",fontSize:v===selected?"19px":"14px",fontWeight:v===selected?"900":"500",color:v===selected?T.text:T.textFaint,cursor:"pointer",transition:"color .15s,font-size .15s",fontVariantNumeric:"tabular-nums"}}>
            {String(v).padStart(2,"0")}
          </div>
        ))}
        <div style={{height:itemH*pad}}/>
      </div>
    </div>
  );
};

const TimeWheelPicker = ({hours,minutes,onChangeHours,onChangeMinutes}) => {
  const T=useTheme();
  const HOUR_VALUES=[0,1,2,3,4];
  const MIN_VALUES=Array.from({length:12},(_,i)=>i*5); // :00 – :55 in 5-minute steps
  return (
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:"10px",marginBottom:"6px"}}>
      <div style={{textAlign:"center"}}>
        <WheelColumn values={HOUR_VALUES} selected={hours} onChange={onChangeHours}/>
        <p style={{fontSize:"8.5px",color:T.textFaint,letterSpacing:".1em",textTransform:"uppercase",marginTop:"4px"}}>Hours</p>
      </div>
      <div style={{fontSize:"18px",fontWeight:"900",color:T.textFaint,marginTop:"12px"}}>:</div>
      <div style={{textAlign:"center"}}>
        <WheelColumn values={MIN_VALUES} selected={minutes} onChange={onChangeMinutes}/>
        <p style={{fontSize:"8.5px",color:T.textFaint,letterSpacing:".1em",textTransform:"uppercase",marginTop:"4px"}}>Minutes</p>
      </div>
    </div>
  );
};

// ─── POTTY SCHEDULE SCREEN ────────────────────────────────────────────────────
// Default demo entries shown the first time someone opens the Potty Schedule
// before they've logged anything of their own to their pet's profile.
const DEFAULT_POTTY_LOG = [
  {time:"7:15 AM",type:"Pee",success:true,notes:"Right after breakfast"},
  {time:"9:00 AM",type:"Poop",success:true,notes:""},
  {time:"10:45 AM",type:"Pee",success:false,notes:"Accident in crate"},
];

const PottyScheduleScreen = ({pottyTimer,setPottyTimer,petData,setPetData}) => {
  const T=useTheme();
  // Wheel picker + alarm preference are saved to the pet's profile (petData.pottySettings)
  // so they persist between visits instead of resetting every time this screen mounts.
  const savedSettings = petData?.pottySettings || {};
  const [wheelHours,setWheelHours]=useState(savedSettings.wheelHours ?? 1);
  const [wheelMinutes,setWheelMinutes]=useState(savedSettings.wheelMinutes ?? 0);
  const [alarmEnabled,setAlarmEnabled]=useState(savedSettings.alarmEnabled ?? true);
  const persistSettings=(patch)=>{
    setPetData&&setPetData(d=>({...d, pottySettings:{...(d?.pottySettings||{}), wheelHours, wheelMinutes, alarmEnabled, ...patch}}));
  };
  const handleWheelHours=(v)=>{ setWheelHours(v); persistSettings({wheelHours:v}); };
  const handleWheelMinutes=(v)=>{ setWheelMinutes(v); persistSettings({wheelMinutes:v}); };
  const handleAlarmToggle=()=>{ setAlarmEnabled(v=>{ const nv=!v; persistSettings({alarmEnabled:nv}); return nv; }); };
  // Potty log is saved straight to the pet's profile (petData.pottyLog) so every entry
  // shows up in the Pet Life Record and is still there next time the app is opened.
  const pottyLog = petData?.pottyLog || DEFAULT_POTTY_LOG;
  const setPottyLog=(updater)=>{
    setPetData&&setPetData(d=>({
      ...d,
      pottyLog: typeof updater==="function" ? updater(d?.pottyLog||DEFAULT_POTTY_LOG) : updater,
    }));
  };
  const [logType,setLogType]=useState("Pee");
  const [logSuccess,setLogSuccess]=useState(true);
  const [logNotes,setLogNotes]=useState("");
  const [showAddLog,setShowAddLog]=useState(false);

  const remaining=usePottyRemaining(pottyTimer);
  const isRunning=pottyTimer.status==="running";
  const isPaused=pottyTimer.status==="paused";
  const isDone=(isRunning||isPaused)&&remaining===0;

  const startTimer=()=>{
    const secs=Math.max(60, wheelHours*3600 + wheelMinutes*60); // at least 1 minute
    setPottyTimer({status:"running", endTime:Date.now()+secs*1000, remainingSecs:secs, totalSecs:secs});
  };
  const pauseTimer=()=>{
    setPottyTimer(p=>({...p, status:"paused", endTime:null, remainingSecs:remaining}));
  };
  const resumeTimer=()=>{
    setPottyTimer(p=>({...p, status:"running", endTime:Date.now()+p.remainingSecs*1000}));
  };
  const cancelTimer=()=>setPottyTimer(IDLE_POTTY_TIMER);

  const pct=pottyTimer.totalSecs>0?((pottyTimer.totalSecs-remaining)/pottyTimer.totalSecs)*100:0;
  const radius=44, circ=2*Math.PI*radius;

  const addLog=()=>{
    const entry={time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:logType,success:logSuccess,notes:logNotes};
    setPottyLog(l=>[entry,...l]);
    setLogNotes("");setShowAddLog(false);
    // Logging a potty break resets the running/paused timer for the next one
    if(pottyTimer.status!=="idle"&&pottyTimer.totalSecs>0){
      setPottyTimer({status:"running", endTime:Date.now()+pottyTimer.totalSecs*1000, remainingSecs:pottyTimer.totalSecs, totalSecs:pottyTimer.totalSecs});
    }
  };

  return (
    <ScrollBody>
      <div style={{marginBottom:"16px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Puppy Care</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Potty Schedule</h2>
      </div>

      {/* Timer ring card */}
      <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"18px",marginBottom:"12px",textAlign:"center"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"14px"}}>Next Potty Timer</p>
        <svg width="110" height="110" style={{display:"block",margin:"0 auto 14px"}}>
          <circle cx="55" cy="55" r={radius} fill="none" stroke={T.mode==="dark"?"rgba(176,141,87,.12)":"rgba(176,141,87,.15)"} strokeWidth="8"/>
          <circle cx="55" cy="55" r={radius} fill="none" stroke={isDone?"#e07a5f":T.gold} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
            strokeLinecap="round" transform="rotate(-90 55 55)" style={{transition:"stroke-dashoffset .9s"}}/>
          <text x="55" y="50" textAnchor="middle" fontSize="18" fontWeight="900" fill={T.mode==="dark"?"#D8C6AE":"#1C2636"} fontFamily="'Lato',sans-serif">{isRunning||isPaused?fmtPottyTime(remaining):"--:--"}</text>
          <text x="55" y="65" textAnchor="middle" fontSize="9" fill={isDone?"#e07a5f":T.textFaint} fontFamily="'Lato',sans-serif">{isDone?"GO NOW!":isRunning?"remaining":isPaused?"paused":"set a time"}</text>
        </svg>

        {/* Rolling time-wheel duration picker — roll up/down like the iPhone timer */}
        {!isRunning&&!isPaused&&(
          <TimeWheelPicker hours={wheelHours} minutes={wheelMinutes} onChangeHours={handleWheelHours} onChangeMinutes={handleWheelMinutes}/>
        )}

        {/* Alarm toggle */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",margin:"10px 0 14px"}}>
          <span style={{fontSize:"12px",color:T.textMuted,display:"inline-flex",alignItems:"center",gap:"4px"}}><Icon name="alert" size={11}/>Alarm reminder</span>
          <div onClick={handleAlarmToggle} style={{width:"36px",height:"20px",borderRadius:"10px",background:alarmEnabled?"rgba(176,141,87,.35)":"rgba(128,128,128,.2)",border:`1.5px solid ${alarmEnabled?T.gold:T.chipBorder}`,position:"relative",cursor:"pointer",transition:"all .3s"}}>
            <div style={{position:"absolute",top:"2px",left:alarmEnabled?"16px":"2px",width:"14px",height:"14px",borderRadius:"50%",background:alarmEnabled?T.gold:"#888",transition:"left .3s"}}/>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          <button onClick={isRunning?pauseTimer:isPaused?resumeTimer:startTimer}
            style={{padding:"11px",background:isRunning?"rgba(224,122,95,.15)":T.gold,border:isRunning?"1.5px solid #e07a5f":"none",borderRadius:"10px",color:isRunning?"#e07a5f":"#fff",fontWeight:"900",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
            <Icon name={isRunning?"pause":"play"} size={12}/>{isRunning?"Pause":isPaused?"Resume":"Start Timer"}
          </button>
          <button onClick={()=>setShowAddLog(true)}
            style={{padding:"11px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"10px",color:T.gold,fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
            + Log Potty
          </button>
        </div>
        {(isRunning||isPaused)&&(
          <button onClick={cancelTimer} style={{marginTop:"8px",background:"none",border:"none",color:T.textFaint,fontSize:"11px",cursor:"pointer"}}>Cancel timer</button>
        )}
      </div>

      {/* Add log form */}
      {showAddLog&&(
        <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Log Potty Activity</p>
          <div style={{display:"flex",gap:"8px",marginBottom:"10px"}}>
            {["Pee","Poop","Both"].map(t=>(
              <button key={t} onClick={()=>setLogType(t)} style={{flex:1,padding:"8px",borderRadius:"9px",border:`1px solid ${logType===t?T.gold:T.chipBorder}`,background:logType===t?"rgba(176,141,87,.18)":T.chipBg,color:logType===t?T.goldLight:T.textMuted,fontSize:"12px",fontWeight:logType===t?"700":"400",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>{t}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:"8px",marginBottom:"10px"}}>
            {[{v:true,l:"Success",ic:"checkCircle"},{v:false,l:"Accident",ic:"x"}].map(({v,l,ic})=>(
              <button key={l} onClick={()=>setLogSuccess(v)} style={{flex:1,padding:"8px",borderRadius:"9px",border:`1px solid ${logSuccess===v?T.gold:T.chipBorder}`,background:logSuccess===v?"rgba(176,141,87,.18)":T.chipBg,color:logSuccess===v?T.goldLight:T.textMuted,fontSize:"12px",fontWeight:logSuccess===v?"700":"400",cursor:"pointer",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}><Icon name={ic} size={12}/>{l}</button>
            ))}
          </div>
          <input value={logNotes} onChange={e=>setLogNotes(e.target.value)} placeholder="Notes (optional)"
            style={{width:"100%",padding:"9px 12px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif",marginBottom:"10px"}}/>
          <div style={{display:"flex",gap:"8px"}}>
            <GoldBtn onClick={addLog} style={{padding:"10px",fontSize:"12px"}}>Save Log</GoldBtn>
            <button onClick={()=>setShowAddLog(false)} style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.textMuted,fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>Cancel</button>
          </div>
        </div>
      )}

      {/* Potty log */}
      <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Today's Log</p>
        {pottyLog.length===0&&<p style={{fontSize:"12px",color:T.textFaint,textAlign:"center",padding:"10px 0"}}>No entries yet — tap + Log Potty above.</p>}
        {pottyLog.map((e,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",borderBottom:i<pottyLog.length-1?`1px solid ${T.divider}`:"none"}}>
            <span style={{flexShrink:0,color:e.success?T.success:"#e07a5f"}}><Icon name={e.success?"checkCircle":"x"} size={20}/></span>
            <div style={{flex:1}}>
              <p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"1px"}}>{e.type} · {e.time}</p>
              {e.notes&&<p style={{fontSize:"11px",color:T.textFaint}}>{e.notes}</p>}
            </div>
            <span style={{fontSize:"10px",fontWeight:"700",color:e.success?T.success:"#e07a5f",padding:"3px 8px",borderRadius:"20px",background:e.success?"rgba(76,175,125,.1)":"rgba(224,122,95,.1)"}}>{e.success?"Outside":"Accident"}</span>
          </div>
        ))}
      </div>

      {/* Stats strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"12px"}}>
        {[
          {label:"Today",value:`${pottyLog.filter(e=>e.success).length}/${pottyLog.length}`},
          {label:"Success Rate",value:`${pottyLog.length?Math.round((pottyLog.filter(e=>e.success).length/pottyLog.length)*100):0}%`},
          {label:"Accidents",value:`${pottyLog.filter(e=>!e.success).length}`},
        ].map(({label,value})=>(
          <div key={label} style={{background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"12px",padding:"10px",textAlign:"center"}}>
            <p style={{fontSize:"16px",fontWeight:"900",color:T.gold,marginBottom:"2px"}}>{value}</p>
            <p style={{fontSize:"9px",color:T.textMuted,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</p>
          </div>
        ))}
      </div>
    </ScrollBody>
  );
};

// ─── GPS ROUTE MAP (SVG-based simulation) ─────────────────────────────────────
const WalkRouteMap = ({points,T}) => {
  if(!points||points.length<2) return (
    <div style={{background:T.mode==="dark"?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)",borderRadius:"10px",height:"100px",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:T.textFaint,fontSize:"12px"}}>No route data</p>
    </div>
  );
  const lats=points.map(p=>p.lat), lngs=points.map(p=>p.lng);
  const minLat=Math.min(...lats),maxLat=Math.max(...lats);
  const minLng=Math.min(...lngs),maxLng=Math.max(...lngs);
  const pad=0.0002;
  const W=300,H=110;
  const toX=lng=>((lng-(minLng-pad))/((maxLng+pad)-(minLng-pad)))*W;
  const toY=lat=>(1-(lat-(minLat-pad))/((maxLat+pad)-(minLat-pad)))*H;
  const pathD=points.map((p,i)=>`${i===0?"M":"L"}${toX(p.lng).toFixed(1)},${toY(p.lat).toFixed(1)}`).join(" ");
  const start=points[0], end=points[points.length-1];
  return (
    <div style={{background:T.mode==="dark"?"rgba(28,50,40,.5)":"rgba(240,248,244,.9)",borderRadius:"10px",overflow:"hidden",marginBottom:"8px",border:`1px solid ${T.liveGpsBorder}`}}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
        <rect width={W} height={H} fill="transparent"/>
        {/* Grid lines */}
        {[0.25,0.5,0.75].map(f=><line key={f} x1={0} y1={H*f} x2={W} y2={H*f} stroke={T.mode==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)"} strokeWidth="1"/>)}
        {/* Route path */}
        <path d={pathD} fill="none" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Start dot */}
        <circle cx={toX(start.lng)} cy={toY(start.lat)} r="5" fill={T.success}/>
        <text x={toX(start.lng)+7} y={toY(start.lat)+4} fontSize="8" fill={T.success} fontFamily="'Lato',sans-serif">Start</text>
        {/* End dot */}
        <circle cx={toX(end.lng)} cy={toY(end.lat)} r="5" fill="#e07a5f"/>
        <text x={toX(end.lng)+7} y={toY(end.lat)+4} fontSize="8" fill="#e07a5f" fontFamily="'Lato',sans-serif">End</text>
      </svg>
    </div>
  );
};

const LiveScreen = ({walkLog=[],pottyTimer,setPottyTimer,initialTab="activity",petData,setPetData}) => {
  const T=useTheme();
  const [liveTab,setLiveTab]=useState(initialTab);
  const [expandedWalk,setExpandedWalk]=useState(null);
  const [loggingGroomType,setLoggingGroomType]=useState(null); // which grooming type's log form is open
  const [groomNotes,setGroomNotes]=useState("");
  const groomingLog = petData?.groomingLog || [];
  const [healthStatus, setHealthStatus] = useState("checking"); // 'checking' | 'unavailable' | 'authorized' | 'not-authorized'
  useEffect(() => { getHealthSyncStatus().then(setHealthStatus); }, []);
  const connectHealth = () => { requestHealthAccess().then(setHealthStatus_result => getHealthSyncStatus().then(setHealthStatus)); };

  const saveGroomingLog=(type)=>{
    const entry={type,date:new Date().toISOString(),notes:groomNotes};
    setPetData&&setPetData(d=>({...d, groomingLog:[entry, ...(d?.groomingLog||[])]}));
    setGroomNotes("");
    setLoggingGroomType(null);
  };

  const lastGroomedFor=(type)=>{
    const entry=groomingLog.find(e=>e.type===type);
    if(!entry) return null;
    const days=Math.floor((Date.now()-new Date(entry.date).getTime())/(1000*60*60*24));
    return days<=0?"Today":days===1?"1 day ago":`${days} days ago`;
  };

  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Live</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Lifestyle and Wellness</h2>
      </div>

      {/* Tab selector */}
      <div style={{display:"flex",gap:"6px",marginBottom:"14px",background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"5px"}}>
        {[{id:"activity",label:"Activity"},{id:"potty",label:"Potty Schedule"},{id:"grooming",label:"Grooming"}].map(t=>(
          <button key={t.id} onClick={()=>setLiveTab(t.id)} style={{flex:1,padding:"7px 4px",borderRadius:"8px",border:"none",cursor:"pointer",fontFamily:"'Lato',sans-serif",fontSize:"10px",fontWeight:"700",transition:"all .2s",background:liveTab===t.id?T.gold:"transparent",color:liveTab===t.id?"#fff":T.textMuted}}>{t.label}</button>
        ))}
      </div>

      {liveTab==="potty"&&<PottyScheduleScreen pottyTimer={pottyTimer} setPottyTimer={setPottyTimer} petData={petData} setPetData={setPetData}/>}

      {liveTab==="grooming"&&(
        <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"16px"}}>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>Grooming Schedule</p>
          {["Bath","Nail trim","Brushing","Ear cleaning"].map(g=>(
            <div key={g}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:loggingGroomType===g?"none":`1px solid ${T.divider}`}}>
                <div>
                  <span style={{fontSize:"13.5px",color:T.text}}>{g}</span>
                  {lastGroomedFor(g)&&<p style={{fontSize:"10px",color:T.textFaint,marginTop:"2px"}}>Last logged: {lastGroomedFor(g)}</p>}
                </div>
                <button onClick={()=>{setLoggingGroomType(loggingGroomType===g?null:g);setGroomNotes("");}}
                  style={{background:T.streakCard,border:`1px solid ${T.streakBorder}`,borderRadius:"8px",padding:"5px 12px",fontSize:"11px",color:T.gold,cursor:"pointer",fontWeight:"700"}}>
                  {loggingGroomType===g?"Cancel":"Log"}
                </button>
              </div>
              {loggingGroomType===g&&(
                <div style={{padding:"0 0 12px",borderBottom:`1px solid ${T.divider}`}}>
                  <input value={groomNotes} onChange={e=>setGroomNotes(e.target.value)} placeholder="Notes (optional)"
                    style={{width:"100%",padding:"9px 12px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif",marginBottom:"8px"}}/>
                  <GoldBtn onClick={()=>saveGroomingLog(g)} style={{padding:"9px",fontSize:"12px"}}>Save to {petData?.name||"Pet"}'s Profile</GoldBtn>
                </div>
              )}
            </div>
          ))}

          {/* Recent grooming history — pulled from the pet's profile */}
          {groomingLog.length>0&&(
            <div style={{marginTop:"14px"}}>
              <p style={{fontSize:"9px",color:T.textFaint,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>Recent History</p>
              {groomingLog.slice(0,5).map((e,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0"}}>
                  <span style={{fontSize:"12px",color:T.text}}>{e.type}{e.notes?` · ${e.notes}`:""}</span>
                  <span style={{fontSize:"10px",color:T.textFaint}}>{new Date(e.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {liveTab==="activity"&&(
        <>
          {/* GPS tracker header card */}
          <div className="s2" style={{background:T.liveGpsBg,border:`1px solid ${T.liveGpsBorder}`,borderRadius:"16px",padding:"16px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <div>
                <p style={{fontSize:"10px",color:T.success,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"3px"}}>GPS Exercise Tracker</p>
                <p style={{fontSize:"14px",fontWeight:"700",color:T.text}}>Today: {walkLog.filter(w=>w.date===new Date().toLocaleDateString()).reduce((s,w)=>s+w.distanceMi,0).toFixed(2)} mi</p>
              </div>


              {/* Health sync badges — only shown on native builds where the OS actually supports it */}
              {healthStatus !== "unavailable" && (
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <div style={{background:"rgba(255,59,48,.1)",border:"1px solid rgba(255,59,48,.3)",borderRadius:"8px",padding:"5px 10px",display:"flex",alignItems:"center",gap:"5px"}}>
                      <Icon name="heart" size={13} color="#e07a5f"/>
                      <span style={{fontSize:"10px",fontWeight:"700",color:"#ff3b30"}}>Apple Health</span>
                    </div>
                    <div style={{background:"rgba(76,175,125,.1)",border:"1px solid rgba(76,175,125,.35)",borderRadius:"8px",padding:"5px 10px",display:"flex",alignItems:"center",gap:"5px"}}>
                      <Icon name="heart" size={13} color={T.success}/>
                      <span style={{fontSize:"10px",fontWeight:"700",color:T.success}}>Health Connect</span>
                    </div>
                  </div>
              )}
            </div>
            {/* ...GPS map/week-bar block stays exactly as-is... */}
          </div>
          {/* Health sync info — now reflects real permission status instead of a static claim */}
          {healthStatus === "authorized" && (
              <div style={{background:T.mode==="dark"?"rgba(176,141,87,.08)":"rgba(176,141,87,.07)",border:`1px solid rgba(176,141,87,.28)`,borderRadius:"12px",padding:"12px 14px",marginBottom:"12px",display:"flex",gap:"10px",alignItems:"center"}}>
                <Icon name="heart" size={22} color={T.gold} style={{flexShrink:0}}/>
                <div>
                  <p style={{fontSize:"12px",fontWeight:"700",color:T.gold,marginBottom:"2px"}}>Health Sync Active</p>
                  <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.5}}>Walk distance and estimated calories are written to Apple Health on iPhone or Health Connect on Android after each walk. Open your phone's Health app to view your activity history.</p>
                </div>
              </div>
          )}
          {healthStatus === "not-authorized" && (
              <div style={{background:T.mode==="dark"?"rgba(176,141,87,.08)":"rgba(176,141,87,.07)",border:`1px solid rgba(176,141,87,.28)`,borderRadius:"12px",padding:"12px 14px",marginBottom:"12px",display:"flex",gap:"10px",alignItems:"center",cursor:"pointer"}}
                   onClick={connectHealth}>
                <Icon name="heart" size={22} color={T.gold} style={{flexShrink:0}}/>
                <div>
                  <p style={{fontSize:"12px",fontWeight:"700",color:T.gold,marginBottom:"2px"}}>Enable Health Sync</p>
                  <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.5}}>Tap to let Guiding Paw write your walk distance and calories to {Capacitor.getPlatform()==="ios"?"Apple Health":"Health Connect"}.</p>
                </div>
              </div>
          )}
          {/* Walk Log */}
          {walkLog.length>0&&(
            <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"16px",marginBottom:"12px"}}>
              <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}><Icon name="dog" size={10} style={{marginRight:"3px"}}/>Walk History</p>
              {walkLog.map((w,i)=>(
                <div key={i}>
                  <div onClick={()=>setExpandedWalk(expandedWalk===i?null:i)}
                    style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.divider}`,cursor:"pointer"}}>
                    <div>
                      <p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{w.date} · {w.time}</p>
                      <div style={{display:"flex",gap:"10px"}}>
                        <span style={{fontSize:"11px",color:T.textMuted,display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="clock" size={10}/>{w.duration}</span>
                        <span style={{fontSize:"11px",color:T.textMuted,display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="pin" size={10}/>{w.distanceMi} mi</span>
                        <span style={{fontSize:"11px",color:T.textMuted,display:"inline-flex",alignItems:"center",gap:"3px"}}><Icon name="zap" size={10}/>{w.pace}/mi</span>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      {w.appleHealthSynced&&<Icon name="heart" size={10} color="#ff3b30"/>}
                      <span style={{color:T.textFaint,fontSize:"14px",transition:"transform .2s",transform:expandedWalk===i?"rotate(180deg)":"none"}}>▾</span>
                    </div>
                  </div>
                  {expandedWalk===i&&(
                    <div style={{padding:"10px 0 4px"}}>
                      <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"6px"}}>GPS Route</p>
                      <WalkRouteMap points={w.points} T={T}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginTop:"6px"}}>
                        {[{l:"Duration",v:w.duration},{l:"Distance",v:`${w.distanceMi} mi`},{l:"Avg Pace",v:`${w.pace}/mi`}].map(({l,v})=>(
                          <div key={l} style={{background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"8px",padding:"8px",textAlign:"center"}}>
                            <p style={{fontSize:"12px",fontWeight:"900",color:T.gold,marginBottom:"1px"}}>{v}</p>
                            <p style={{fontSize:"9px",color:T.textFaint,textTransform:"uppercase",letterSpacing:".06em"}}>{l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: BOND — CHANGE 3 subtitle added
// ═══════════════════════════════════════════════════════════════════════════════
const BondScreen = ({onOpenGame}) => {
  const T=useTheme();
  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"18px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Bond</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700",marginBottom:"5px"}}>Strengthen Your Connection</h2>
        <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.5}}>Engagement games, enrichment, and relationship building</p>
      </div>
      <div className="s2" style={{marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.textMuted,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>Engagement Games & Tricks</p>
        {ENGAGEMENT_GAMES.map(t=>(
          <button key={t.id} className="lesson-row" onClick={()=>onOpenGame&&onOpenGame(t.id)}
            style={{display:"flex",width:"100%",justifyContent:"space-between",alignItems:"center",padding:"12px 13px",cursor:"pointer",transition:"opacity .2s",borderRadius:"10px",marginBottom:"6px",border:`1px solid ${T.divider}`,background:"none",textAlign:"left",fontFamily:"'Lato',sans-serif"}}>
            <div style={{display:"flex",alignItems:"center",gap:"11px",minWidth:0}}>
              <span style={{width:"34px",height:"34px",borderRadius:"9px",background:"rgba(176,141,87,.14)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:T.gold}}><Icon name={t.icon||"paw"} size={16}/></span>
              <div style={{minWidth:0}}>
                <p style={{fontSize:"14px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{t.name}</p>
                <p style={{fontSize:"11px",color:T.textMuted}}>{t.time} · {t.level}</p>
              </div>
            </div>
            <span style={{color:T.textFaint,display:"flex",flexShrink:0}}><Icon name="arrowRight" size={16}/></span>
          </button>
        ))}
      </div>
      <div className="s3">
        <p style={{fontSize:"10px",color:T.textMuted,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>Socialization & Confidence</p>
        {SOCIALIZATION_GAMES.map(s=>(
          <button key={s.id} className="lesson-row" onClick={()=>onOpenGame&&onOpenGame(s.id)}
            style={{display:"flex",width:"100%",justifyContent:"space-between",alignItems:"center",gap:"10px",background:T.socialBg,border:`1px solid ${T.socialBorder}`,borderRadius:"12px",padding:"13px 14px",marginBottom:"8px",cursor:"pointer",transition:"opacity .2s",textAlign:"left",fontFamily:"'Lato',sans-serif"}}>
            <div style={{display:"flex",alignItems:"center",gap:"11px",minWidth:0}}>
              <span style={{width:"34px",height:"34px",borderRadius:"9px",background:"rgba(176,141,87,.14)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:T.gold}}><Icon name={s.icon||"paw"} size={16}/></span>
              <div style={{minWidth:0}}>
                <p style={{fontSize:"13.5px",fontWeight:"700",color:T.text,marginBottom:"3px"}}>{s.name}</p>
                <p style={{fontSize:"11.5px",color:T.textMuted}}>{s.time} · {s.level}</p>
              </div>
            </div>
            <span style={{color:T.textFaint,display:"flex",flexShrink:0}}><Icon name="arrowRight" size={16}/></span>
          </button>
        ))}
      </div>
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: LEARN — with progressive unlocking + puppy program
// ═══════════════════════════════════════════════════════════════════════════════

// ─── ENGAGEMENT GAMES LIBRARY ──────────────────────────────────────────────────
// Full how-to-play instructions for every game shown on the Bond screen and
// referenced by the Dashboard's Daily Routine Builder.
const ENGAGEMENT_GAMES = [
  {id:"nameGameEngage", name:"The Name Game", time:"5 min", level:"Beginner", icon:"dog",
    materials:"Small, high-value treats",
    steps:[
      "Say your dog's name once, in a happy, upbeat tone.",
      "The instant they look at you, mark it with \"Yes!\" and reward.",
      "Repeat 8–10 reps, gradually practicing with mild distractions nearby.",
    ],
    tip:"Never repeat the name over and over waiting for a response — say it once, then reward the moment they check in."},
  {id:"findIt", name:"Find It", time:"10 min", level:"Beginner", icon:"footprints",
    materials:"Treats or a favorite toy",
    steps:[
      "Say \"Find it!\" and toss a treat a few feet away so your dog watches it land.",
      "Let them sniff it out and eat it, then repeat.",
      "Once they've got it, start hiding treats in easy spots around the room, then trickier ones.",
    ],
    tip:"Great low-impact mental workout for rainy days or after a big outing."},
  {id:"targetTraining", name:"Target Training", time:"10 min", level:"Intermediate", icon:"target",
    materials:"Treats and your open palm (or a target stick)",
    steps:[
      "Hold your palm a few inches from your dog's nose.",
      "The moment they sniff or touch it, mark and reward.",
      "Once they're reliably touching your hand, add the verbal cue \"Touch.\"",
    ],
    tip:"This is the foundation for loose-leash redirection, recall games, and most tricks — well worth mastering."},
  {id:"spinTwist", name:"Spin & Twist", time:"8 min", level:"Intermediate", icon:"refresh",
    materials:"Treats",
    steps:[
      "Hold a treat at your dog's nose and slowly lure them in a full circle.",
      "Mark and reward the instant they complete the turn.",
      "Once reliable, add the cue \"Spin\" (one direction) and \"Twist\" (the other), then fade the food lure to a hand signal.",
    ],
    tip:"Practice both directions evenly so your dog doesn't develop a one-sided favorite."},
  {id:"bow", name:"Bow", time:"10 min", level:"Advanced", icon:"star",
    materials:"Treats",
    steps:[
      "Lure your dog's nose down toward their front paws while keeping their rear end up.",
      "Mark the exact moment their elbows touch the ground.",
      "Repeat until consistent, then add the verbal cue \"Bow.\"",
    ],
    tip:"Some dogs need their back end gently and briefly supported at first — never force the position."},
];
function getDailyEngagementGame() {
  // Same deterministic-by-calendar-date approach as the daily trainer tip, so
  // every device shows the same featured game on a given day.
  const now = new Date();
  const dayIndex = now.getFullYear()*372 + now.getMonth()*31 + now.getDate();
  return ENGAGEMENT_GAMES[((dayIndex % ENGAGEMENT_GAMES.length) + ENGAGEMENT_GAMES.length) % ENGAGEMENT_GAMES.length];
}

// ─── SOCIALIZATION & CONFIDENCE LIBRARY ────────────────────────────────────────
// Same shape as ENGAGEMENT_GAMES so both sections of the Bond screen can share
// one instructions screen.
const SOCIALIZATION_GAMES = [
  {id:"newSurface", name:"New Surface Challenge", time:"5 min", level:"Beginner", icon:"footprints",
    materials:"3 different textures (a bath mat, bubble wrap, a wobble cushion, gravel tray, etc.) and treats",
    steps:[
      "Lay one new-texture surface on the floor in a calm, familiar area.",
      "Toss a treat onto the edge of the surface and let your dog choose to step on it — never drag or force them onto it.",
      "Mark and reward every paw that touches the new surface, working up to all four paws standing on it calmly.",
      "Repeat with the second and third textures, one at a time.",
      "Finish the session as soon as your dog is confidently exploring — end on a win.",
    ],
    tip:"Confidence is built by choice. If your dog backs away, make the surface smaller/less intense (e.g. one sheet of bubble wrap instead of a full mat) and rebuild from there."},
  {id:"soundDesens", name:"Sound Desensitization", time:"10 min", level:"Beginner", icon:"music",
    materials:"A recording of the target sound (traffic, thunder, fireworks, vacuum, etc.) and high-value treats",
    steps:[
      "Play the sound at a very low volume — low enough that your dog notices but doesn't react.",
      "The moment they hear it and stay relaxed, mark and reward.",
      "Run 8–10 short reps at that volume across the session, keeping everything calm and upbeat.",
      "Only increase the volume once your dog is consistently relaxed at the current level — small increments over multiple sessions, not one sitting.",
      "Stop and drop back down in volume if your dog startles, paces, or refuses treats.",
    ],
    tip:"This is a slow-build exercise — rushing the volume is the most common mistake and can make sound sensitivity worse, not better."},
  {id:"strangerGreeting", name:"Stranger Greeting", time:"5–10 min", level:"Intermediate", icon:"handshake",
    materials:"Treats and a cooperative friend/neighbor the dog hasn't met",
    steps:[
      "Have the person stand a comfortable distance away and ignore your dog at first — no eye contact, no reaching out.",
      "Reward your dog for staying calm near the stranger from a distance.",
      "If your dog is relaxed, invite the person to toss a treat to your dog rather than reaching toward them.",
      "Only allow a hands-on greeting if your dog is loose, wiggly, and clearly seeking contact — and keep it brief.",
      "End the interaction while it's still going well, before your dog gets overexcited or overwhelmed.",
    ],
    tip:"Advocate for your dog — it's always OK to say \"no, we're training today\" and decline a greeting. See the Advocating for Your Dog handout for more."},
  {id:"novelObject", name:"Novel Object Exposure", time:"5 min", level:"Beginner", icon:"box",
    materials:"An unfamiliar object your dog hasn't seen before (umbrella, skateboard, bicycle, cardboard box, etc.) and treats",
    steps:[
      "Place the object at a distance where your dog notices it but is still comfortable — this might be across the yard, not right next to it.",
      "Mark and reward calm attention toward the object.",
      "Let your dog approach at their own pace; never pull or carry them toward it.",
      "Gradually decrease distance over multiple short sessions as your dog stays relaxed.",
      "If the object can move or make noise (umbrella opening, skateboard rolling), introduce that motion only once your dog is calm with the object still.",
    ],
    tip:"The goal isn't to make your dog love the object — it's for them to stay neutral and confident around anything new and unexpected."},
];

// Combined lookup so one instructions screen can serve both the Engagement
// Games and the Socialization & Confidence sections of the Bond screen.
const GAME_LIBRARY = [...ENGAGEMENT_GAMES, ...SOCIALIZATION_GAMES];
const GAME_MAP = Object.fromEntries(GAME_LIBRARY.map(g=>[g.id,g]));

// Dedicated "how to play" screen for a game — same pattern as HandoutScreen,
// so tapping a game navigates to full instructions instead of just an inline
// expand. Includes a hero icon graphic to give the instructions a visual anchor.
const GameInstructionsScreen = ({id, onClose, onBack}) => {
  const T=useTheme();
  const g=GAME_MAP[id];
  if(!g) return (
    <ScrollBody>
      <p style={{fontSize:"13px",color:T.textMuted}}>Game not found.</p>
      <div style={{marginTop:"10px"}}><BackBtn onClick={onBack||onClose}/></div>
    </ScrollBody>
  );
  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>How to Play</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700",lineHeight:1.2}}>{g.name}</h2>
          <p style={{fontSize:"13px",color:T.textMuted,marginTop:"3px"}}>{g.time} · {g.level}</p>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px",flexShrink:0}}><Icon name="x" size={18}/></button>
      </div>

      {/* Hero graphic — gives the instructions a picture to anchor to */}
      <div className="s1" style={{background:T.green,borderRadius:"18px",padding:"26px",marginBottom:"16px",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:.08,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={g.icon||"paw"} size={140} color="#fff"/></div>
        <div style={{width:"84px",height:"84px",borderRadius:"50%",background:"rgba(255,255,255,.12)",border:"2px solid rgba(255,255,255,.35)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <Icon name={g.icon||"paw"} size={40} color="#fff"/>
        </div>
      </div>

      <div className="s2" style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"16px",marginBottom:"14px"}}>
        <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"6px"}}>You'll Need</p>
        <p style={{fontSize:"13px",color:T.text,marginBottom:"16px",lineHeight:1.55}}>{g.materials}</p>

        <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>How to Play</p>
        <ol style={{margin:0,paddingLeft:"18px",marginBottom:g.tip?"16px":"0"}}>
          {g.steps.map((s,si)=>(<li key={si} style={{fontSize:"13px",color:T.text,lineHeight:1.65,marginBottom:"7px"}}>{s}</li>))}
        </ol>

        {g.tip && (
          <div style={{background:"rgba(176,141,87,.08)",border:`1px solid rgba(176,141,87,.25)`,borderRadius:"10px",padding:"11px 13px"}}>
            <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55,display:"flex",alignItems:"flex-start",gap:"6px"}}><Icon name="bulb" size={13} style={{marginTop:"1px",flexShrink:0,color:T.gold}}/><span><strong style={{color:T.text}}>Tip:</strong> {g.tip}</span></p>
          </div>
        )}
      </div>

      <BackBtn onClick={onBack||onClose}/>
    </ScrollBody>
  );
};

const STANDARD_CURRICULUM = [
  {id:"pre",  label:"Pre-Requisite", sublabel:"Foundation Skills",
    goal:"Ensure handler and dog have basic skills before starting the 6 week program. Introduce small boundaries and structure to prepare the dog for advancing skills.",
    equipment:["Slip lead","Treat pouch (any will do)","15-20' long line","A kennel","A place bed (raised is best, but any bed with defined edges will work)"],
    tasks:[
      {name:"Sit with marker words and a lure",        sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Down with marker words and a lure",       sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Place with marker words and a lure",      sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Threshold Boundaries (Wait) with marker words and a lure", sessionsPerDay:"1-2", sessionLength:"5 minutes"},
      {name:"Kennel with threshold boundary (Wait before leaving kennel)", sessionsPerDay:"1-2", sessionLength:"30 minute duration"},
      {name:"Work for food",                sessionsPerDay:"1",   sessionLength:"During training sessions"},
    ],
    mistakes:["Skipping the 'learning phase' of training and expecting excellence day 1","Expecting results without daily practice","Inconsistent timing with marker words","Focusing on end goals, not current progress"],
    lessons:["Sit stay","Down stay","Marker Words","Socializing","Crate / Kennel","Generalizing","Implied Stays","3 D's: Distance, Distraction, Duration"]},
  {id:"w1",  label:"Week 1", sublabel:"Intro to Pressure / Release",
    unlockAfterDays:7,
    goal:"Develop a clear understanding of leash pressure as a communication tool. The dog learns that moving toward pressure turns it off, replacing the natural oppositional reflex (moving away from pressure). This is a cornerstone skill for all advanced leash work.",
    equipment:["Treat pouch (any will do)","15-20' long line","Herm Sprenger 2.25mm or 3mm prong collar or slip lead","A kennel","A place bed (raised is best, but any bed with defined edges will work)","E-Collar Technologies ET300 Mini Educator E-Collar (or Micro Educator for smaller dogs) — introduced in Week 2, but good to have on hand now"],
    tasks:[
      {name:"Place with leash pressure",           sessionsPerDay:"1-3", sessionLength:"10 minutes"},
      {name:"Sit with leash pressure",             sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Down with leash pressure",            sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Threshold Boundaries (Wait) with leash pressure", sessionsPerDay:"1-4", sessionLength:"2-5 minutes"},
      {name:"Leash Games with leash pressure",     sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Recall with leash pressure",          sessionsPerDay:"1-2", sessionLength:"10-15 repetitions"},
    ],
    mistakes:["Pulling continuously on the leash","Repeating cues","Inconsistent use of marker words"],
    lessons:["Intro to leash pressure: Prong or slip lead","Place","Recall","Leash games / direction changes","Threshold boundaries"]},
  {id:"w2",  label:"Week 2", sublabel:"Intro to E-Collar (Non-Motion)",
    unlockAfterDays:7,
    goal:"Introduce the e-collar as a refined communication tool. The dog will learn to pair leash pressure with e-collar stimulation on non-motion cues (SIT, DOWN, PLACE).",
    note:"Before your first session this week, read the E-Collar Safety Guide in full — it covers fit, finding your dog's working level, and signs to watch for.",
    tasks:[
      {name:"Place with E-collar",                 sessionsPerDay:"1-2", sessionLength:"20 minutes"},
      {name:"Sit with E-collar",                   sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Down with E-collar",                  sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Threshold Boundaries (Wait) with leash pressure", sessionsPerDay:"1-4", sessionLength:"2-5 minutes"},
      {name:"Leash Games with leash pressure",     sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Loose Leash Walking with leash pressure", sessionsPerDay:"1-2", sessionLength:"15+ minutes"},
      {name:"Recall with leash pressure",          sessionsPerDay:"1-2", sessionLength:"10-15 repetitions"},
    ],
    mistakes:["Continuing stimulation after the behavior is fixed","Releasing pressure before the behavior is fixed","Repeating cues more than once","Introducing heavy distractions too soon"],
    lessons:["Intro to e-collar — Non-motion: Down","Intro to e-collar — Thresholds","Intro to e-collar — Sit"]},
  {id:"w3",  label:"Week 3", sublabel:"Intro to E-Collar (Motion)",
    unlockAfterDays:7,
    goal:"Advance e-collar work into movement-based behaviors. The dog learns to respond to stimulation while in motion (WALKING, RECALL, THRESHOLDS) developing the ability to make correct decisions in real time. The core principle remains consistent: responding to the cue turns pressure off.",
    tasks:[
      {name:"Place with E-collar",                 sessionsPerDay:"1-2", sessionLength:"30 minutes"},
      {name:"Sit with E-collar",                   sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Down with E-collar",                  sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Threshold Boundaries (Wait) with E-collar", sessionsPerDay:"1-4", sessionLength:"2-5 minutes"},
      {name:"Leash Games",                         sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Loose Leash Walking with E-collar",   sessionsPerDay:"1-2", sessionLength:"15+ minutes"},
      {name:"Recall with E-collar",                sessionsPerDay:"1-2", sessionLength:"10-20 repetitions"},
    ],
    mistakes:["Repeating cues more than once","Leaving stimulation on after behavior is fixed","Adding too many distractions too soon","Inconsistency with timing and follow-through"],
    lessons:["Intro to e-collar — Motion: Recall","Intro to e-collar — Walking","Intro to e-collar — Place"]},
  {id:"w4",  label:"Week 4", sublabel:"Generalizing at the Park",
    unlockAfterDays:7,
    goal:"Expand training into new environments to build true reliability. Introducing settings such as parks adds layers of distraction — new scents, sounds, movement, and unpredictability — challenging the dog to maintain engagement and responsiveness.",
    note:"2-4 Park visits this week to generalize each task",
    tasks:[
      {name:"Place with E-collar",                 sessionsPerDay:"1-2", sessionLength:"40 minutes"},
      {name:"Sit with E-collar",                   sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Down with E-collar",                  sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Threshold Boundaries (Wait) with E-collar", sessionsPerDay:"1-4", sessionLength:"2-5 minutes"},
      {name:"Leash Games",           sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Loose Leash Walking with E-collar",   sessionsPerDay:"1-2", sessionLength:"15+ minutes"},
      {name:"Recall with E-collar",                sessionsPerDay:"1-2", sessionLength:"10-20 repetitions"},
    ],
    mistakes:["Repeating cues","Only training at home","Assuming your dog 'knows it'","Training at a park with too many distractions","Pushing a tired dog to train for too long"],
    lessons:["Generalizing at the park"]},
  {id:"w5",  label:"Week 5", sublabel:"Generalizing in Public",
    unlockAfterDays:7,
    goal:"Continue building real-world reliability by introducing structured training in public environments. Stores add new challenges — tight aisles, close proximity to people, moving carts, and varied surfaces — creating valuable opportunities to develop confidence and composure.",
    note:"2-4 Store visits this week to generalize each task. Not all stores are dog friendly — call ahead if unsure. Always follow store guidelines and be respectful.",
    tasks:[
      {name:"Place with E-collar",                 sessionsPerDay:"1-2", sessionLength:"50 minutes"},
      {name:"Sit with E-collar",                   sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Down with E-collar",                  sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Threshold Boundaries (Wait) with E-collar", sessionsPerDay:"1-4", sessionLength:"2-5 minutes"},
      {name:"Leash Games",           sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Loose Leash Walking with E-collar",   sessionsPerDay:"1-2", sessionLength:"15+ minutes"},
      {name:"Recall with E-collar",                sessionsPerDay:"1-2", sessionLength:"10-20 repetitions"},
    ],
    mistakes:["Repeating cues","Only training at home","Assuming your dog 'knows it'","Training at a store with too many distractions","Pushing a tired dog to train for too long"],
    lessons:["Generalizing on a field trip"]},
  {id:"w6",  label:"Week 6", sublabel:"Intro to Off-Leash",
    unlockAfterDays:7,
    goal:"Introduce off-leash work with intention and accountability. Freedom is earned through consistent reliability, not given prematurely. Evaluate whether the dog consistently chooses engagement over distraction before removing the leash.",
    note:"Use a fenced area like a backyard, tennis court, or baseball diamond to safely build off-leash reliability. Start with a long line, then remove it as consistency improves. Focus on recalls and check-ins to ensure freedom still means staying engaged.",
    tasks:[
      {name:"Off Leash Place with E-collar",       sessionsPerDay:"1-2", sessionLength:"60 minutes"},
      {name:"Off Leash Sit with E-collar",         sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Off Leash Down with E-collar",        sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Off Leash Heel with E-collar",        sessionsPerDay:"1-2", sessionLength:"10 minutes"},
      {name:"Off Leash Threshold Boundaries (Wait) with E-collar", sessionsPerDay:"1-4", sessionLength:"2-5 minutes"},
      {name:"Leash Games",                         sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Off Leash Loose Leash Walking with E-collar", sessionsPerDay:"1-2", sessionLength:"15+ minutes"},
      {name:"Off Leash Recall with E-collar",      sessionsPerDay:"1-2", sessionLength:"10-20 repetitions"},
    ],
    mistakes:["Progressing to off-leash before on-leash reliability is established","Repeating cues","Expecting full understanding without daily practice","Immediately entering store without doing leash games to warm up"],
    lessons:["Intro to off leash","Issue graduation certificate & share to social media"]},
  {id:"grad", label:"Graduation & Beyond", sublabel:"Your Journey Continues",
    unlockAfterDays:7,
    goal:"Completion of the program marks the beginning of long-term success. Foundational skills are in place, but consistency and daily application are what create lasting reliability. Training is not an event — it is a lifestyle built through structure and clear communication.",
    sections:[
      {title:"Daily Integration — Real Life Application", body:"Reinforce training through small, intentional moments throughout the day. Incorporate structure into walks, mealtimes, doorways, and social interactions. These consistent touch points ensure expectations remain clear in all environments."},
      {title:"Consistency — The Standard", body:"Maintain clear rules, reinforce behaviors as needed, and continue using familiar communication tools. Consistency builds understanding, and understanding creates reliability."},
      {title:"Ongoing Development — Relationship & Growth", body:"Training extends beyond obedience; it strengthens trust, engagement, and relationship. Continue introducing new environments and challenges to build confidence and adaptability. With consistency and leadership, progress continues well beyond the program."},
    ],
    tasks:[
      {name:"Place with E-collar",                 sessionsPerDay:"1-2", sessionLength:"45-60 minutes"},
      {name:"Sit with E-collar",                   sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Down with E-collar",                  sessionsPerDay:"1-3", sessionLength:"5 minutes"},
      {name:"Threshold Boundaries (Wait) with E-collar", sessionsPerDay:"1-4", sessionLength:"2-5 minutes"},
      {name:"Leash Games",           sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Loose Leash Walking with E-collar",   sessionsPerDay:"1-2", sessionLength:"15+ minutes"},
      {name:"Recall with E-collar",                sessionsPerDay:"1-2", sessionLength:"10-20 repetitions"},
    ],
    lessons:["Graduation ceremony","Advanced recall in new environments","Maintaining skills long-term","Continuing education resources"],
    graduation:true},
];

// ─── DAILY TRAINER TIPS ──────────────────────────────────────────────────────
const DAILY_TIPS = [
  {emoji:"star", tip:"Every rep counts — you're building a relationship, not just a behavior. Keep showing up!"},
  {emoji:"paw", tip:"Consistency is your superpower. Dogs thrive on structure, and you're giving that every single day."},
  {emoji:"muscle", tip:"Struggling today? That's normal. Progress isn't always linear — the fact you're here means you're winning."},
  {emoji:"target", tip:"Short sessions work better than long ones. 10 focused minutes beats an hour of frustration every time."},
  {emoji:"flame", tip:"Your dog is learning even when you think nothing is happening. Trust the process — it's working."},
  {emoji:"leaf", tip:"You're not just training commands — you're growing a deeper bond with your dog. That's priceless."},
  {emoji:"party", tip:"Celebrate the small wins today. A better sit, a calmer threshold, a moment of eye contact. It all adds up."},
  {emoji:"zap", tip:"Integration training is genius. Every walk, every mealtime, every doorway is a rep. You've got this."},
  {emoji:"trophy", tip:"The best dog trainers aren't perfect — they're persistent. And you keep coming back. That's everything."},
  {emoji:"bulb", tip:"If something isn't working, simplify it. Go back one step and make it easier to succeed. Progress loves momentum."},
  {emoji:"dog", tip:"Your dog is trying to figure out the rules of your world. The clearer you are, the faster they learn."},
  {emoji:"party", tip:"Look how far you've both come! Your dog is lucky to have someone who cares this much."},
  {emoji:"brain", tip:"Remember: dogs don't generalize well. Practicing in a new spot isn't starting over — it's leveling up."},
  {emoji:"sun", tip:"A tired trainer makes for a frustrated dog. Be kind to yourself today — rest is part of the process."},
  {emoji:"rocket", tip:"You're closer to your goal than you think. Stay consistent, stay patient, and trust the program."},
  {emoji:"heart", tip:"The relationship you're building through training will last a lifetime. Every session is an investment."},
  {emoji:"gradCap", tip:"Your dog doesn't need perfection — they need your patience. You have more than you think."},
  {emoji:"wave", tip:"Some days flow, some days you feel stuck. Both are part of training. Just keep showing up."},
  {emoji:"dog", tip:"Structure isn't restrictive — it's loving. Dogs feel safe when they know what to expect. You're giving that."},
  {emoji:"star", tip:"Integration training tip: next walk, practice one threshold. One moment. That's enough for today."},
  {emoji:"music", tip:"Training should feel like a rhythm, not a chore. Find your groove and let it carry you."},
  {emoji:"message", tip:"Clear communication is a skill — and you're getting better at it every single day."},
  {emoji:"moon", tip:"End today knowing you did something for your dog. Even a 5-minute session is a 5-minute win."},
  {emoji:"medal", tip:"You don't need to be a professional trainer to have a great dog — you just need to be consistent. And you are."},
  {emoji:"handshake", tip:"You and your dog are a team. Teams that train together trust each other more. Keep building that trust."},
  {emoji:"key", tip:"The marker word is your dog's translator. The more consistent you are with it, the faster everything clicks."},
  {emoji:"flower", tip:"Patience isn't passive — it's active. It's choosing to breathe, reset, and try again. You do that beautifully."},
  {emoji:"star", tip:"Every dog is different. Honor where your dog is today, not where you wish they were. Progress from here."},
];

function getDailyTip() {
  // Deterministic on the local calendar date (not device/session-random), so
  // every device shows the same tip on a given day, and it changes daily.
  const now = new Date();
  const dayIndex = now.getFullYear()*372 + now.getMonth()*31 + now.getDate();
  return DAILY_TIPS[((dayIndex % DAILY_TIPS.length) + DAILY_TIPS.length) % DAILY_TIPS.length];
}

// ─── STREAK HELPERS (Supabase-backed) ────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0,10); // "2026-06-02"
}

// No module-level cache here on purpose. A previous version of this function
// cached the last-known streak/activity-date in plain module-level variables
// (_lastActivityCache / _streakCache) to save a DB read within a session —
// but those variables were shared across the whole app, not keyed by pet or
// user. Switching pets (or users) within the same session without a full
// page reload could read/write the wrong pet's streak. Supabase is the
// source of truth instead: every call reads the current row for THIS
// pet_id, computes the new streak, and writes it straight back. One extra
// read per activity-completion (not per render) is a trivial cost for
// correctness.
async function updateStreakOnActivity(petIdVal, currentStreak) {
  if (!petIdVal) return currentStreak || 0;
  const today = todayStr();
  const { data } = await supabase.from("streaks").select("current_streak, last_activity_date").eq("pet_id", petIdVal).single();
  const last = data?.last_activity_date || null;
  let streak = data?.current_streak ?? currentStreak ?? 0;
  if (last === today) return streak; // already logged today for this pet
  if (last) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0,10);
    streak = (last === yStr) ? streak + 1 : 1;
  } else {
    streak = 1;
  }
  const { error } = await supabase.from("streaks").upsert({ pet_id: petIdVal, current_streak: streak, last_activity_date: today }, { onConflict: "pet_id" });
  if (error) console.error("[streaks] failed to save:", error);
  return streak;
}

// ─── SINGLE ACTIVE SESSION (device-locking) ──────────────────────────────────
// Requires two new columns on the `users` table: active_device_id (text) and
// active_device_claimed_at (timestamptz). Both are nullable — existing rows
// without them are treated as "no lock yet" (see stillHoldsSessionSlot),
// so this ships safely without a backfill.
//
// Prevents a login from being shared across multiple people at once. This is
// deliberately "last login wins" rather than a hard device lock — sharing a
// password still works for a moment, but the paying customer's own device
// gets signed out the next time someone else logs in with the same
// credentials, with a clear on-screen explanation. It is not bulletproof
// (nothing client-side is), but it stops the common case: someone handing
// out their email/password to a friend or posting it somewhere.
//
// How it works:
//   - Each browser/device gets a random, persistent id (gp_device_id in
//     localStorage), generated once and reused across sessions on that device.
//   - On every EXPLICIT login (typing credentials, completing signup —
//     never a silent page-refresh session restore), this device claims the
//     "active_device_id" slot on the user's row in Supabase.
//   - While the app is open, this device periodically checks whether it
//     still holds that slot. If another device has claimed it since, this
//     device is signed out immediately with an explanatory message.
//   - A silent session restore (e.g. reopening the app after being closed)
//     only CHECKS the slot, it never re-claims it — so simply reloading the
//     app you were already using doesn't kick anyone else out.
const DEVICE_ID_KEY = "gp_device_id";
const SESSION_CHECK_INTERVAL_MS = 45000; // how often an open app re-checks its slot

function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage unavailable (e.g. private browsing edge cases) — fall back
    // to a per-load id. Session-locking simply won't persist across reloads
    // for this device, which fails safe (never wrongly locks someone out).
    return `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// Call on every EXPLICIT sign-in / signup completion — this device claims
// the active session slot, which will sign out any other device.
async function claimSessionSlot(userIdVal) {
  if (!userIdVal) return;
  const { error } = await supabase.from("users").update({
    active_device_id: getDeviceId(),
    active_device_claimed_at: new Date().toISOString(),
  }).eq("id", userIdVal);
  if (error) console.error("[users] failed to claim session slot:", error);
}

// Call periodically (and once after any session restore) — returns true if
// this device still holds the slot, false if another device has taken over
// (in which case the caller should sign this device out).
async function stillHoldsSessionSlot(userIdVal) {
  if (!userIdVal) return true;
  const { data } = await supabase.from("users").select("active_device_id").eq("id", userIdVal).single();
  // No active_device_id set yet (e.g. account created before this feature
  // shipped) — treat as fine rather than locking existing users out.
  if (!data || !data.active_device_id) return true;
  return data.active_device_id === getDeviceId();
}

// ─── SUPABASE PERSISTENCE HELPERS ─────────────────────────────────────────────
// These are fire-and-forget — UI state is updated optimistically, and these
// write the change to Supabase in the background.

async function saveLesson(petIdVal, program, weekNumber, lessonKey, completed, extras = {}) {
  if (!petIdVal) return;
  const { error } = await supabase.from("lesson_progress").upsert({
    pet_id: petIdVal,
    program,
    week_number: weekNumber,
    lesson_key: lessonKey,
    completed,
    ...extras,
  }, { onConflict: "pet_id,program,week_number,lesson_key" });
  if (error) console.error("[lesson_progress] failed to save:", error);
}

async function savePet(petIdVal, fields) {
  if (!petIdVal) return;
  const { error } = await supabase.from("pets").update(fields).eq("id", petIdVal);
  if (error) console.error("[pets] failed to save field(s):", fields, error);
}

// Bucket for real pet document/health-record uploads — private (not public),
// since these can hold real vaccine/vet records. See the RLS policies on
// storage.objects in schema.sql, which scope access to the pet's owner via
// the first folder segment of the storage path (petId/filename).
const PET_DOCUMENTS_BUCKET = "pet-documents";

// Uploads a file to Supabase Storage and returns a display-ready doc object
// — it does NOT write to the pet_documents table itself (see saveDocument
// below for that). Storage path is `${petId}/${timestamp}_${safeName}` so
// the bucket's RLS policies can key off the pet id folder. Because the
// bucket is private, "url" here is a short-lived SIGNED url (1 hour) good
// enough for immediate display right after upload — it is NOT stored
// anywhere; re-opening a document later re-signs a fresh url on demand
// (see getSignedDocUrl below).
async function uploadPetDocument(petIdVal, file, docType) {
  if (!petIdVal || !file) return null;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${petIdVal}/${Date.now()}_${safeName}`;
  const { error: uploadError } = await supabase.storage.from(PET_DOCUMENTS_BUCKET).upload(path, file, { upsert: false });
  if (uploadError) {
    console.error("[pet-documents upload] failed:", uploadError);
    return null;
  }
  const { data: signedData, error: signError } = await supabase.storage.from(PET_DOCUMENTS_BUCKET).createSignedUrl(path, 3600);
  if (signError) console.error("[pet-documents signed url] failed:", signError);
  return {
    name: file.name,
    type: docType,
    date: new Date().toLocaleDateString(),
    url: signedData?.signedUrl || null,
    storagePath: path,
  };
}

// Re-signs a fresh, short-lived url for a document already in Storage —
// use this when opening a document that was uploaded in an earlier session
// (the signed url from upload time has likely expired by then).
async function getSignedDocUrl(storagePath) {
  if (!storagePath) return null;
  const { data, error } = await supabase.storage.from(PET_DOCUMENTS_BUCKET).createSignedUrl(storagePath, 3600);
  if (error) { console.error("[pet-documents signed url] failed:", error); return null; }
  return data?.signedUrl || null;
}

// Single place responsible for writing to pet_documents — handles both
// real file uploads (doc.storagePath set) and text-only quick-add notes
// (doc.storagePath null), always using the actual schema column names.
async function saveDocument(petIdVal, doc) {
  if (!petIdVal) return;
  const { error } = await supabase.from("pet_documents").insert({
    pet_id: petIdVal,
    file_name: doc.name,
    document_type: doc.type,
    file_url: doc.storagePath || null,
  });
  if (error) console.error("[pet_documents] failed to save:", error);
}

async function saveEnrollment(petIdVal, program) {
  if (!petIdVal) return;
  const { error } = await supabase.from("program_enrollment").insert({ pet_id: petIdVal, program });
  if (error) console.error("[program_enrollment] failed to save:", error);
}

// ─── WEEKLY BADGES ────────────────────────────────────────────────────────────
// Awarded per completed week, for both the Puppy and Standard curricula. "Earned"
// is read straight from the same completion state that already drives the 7-day
// unlock pacing (weekCompletedAt for Standard, puppyWeekDone for Puppy), so a
// badge can never fall out of sync with real progress — there's no separate
// badge-tracking state to maintain.
const WeekBadge = ({weekNum, earned, size=56}) => {
  const T=useTheme();
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:size+14,flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
        background:earned?`linear-gradient(155deg, ${T.gold} 0%, ${T.brown} 100%)`:"transparent",
        border:`2.5px solid ${earned?T.gold:T.chipBorder}`,
        boxShadow:earned?"0 3px 10px rgba(176,141,87,.35)":"none",transition:"all .3s"}}>
        <div style={{width:size-10,height:size-10,borderRadius:"50%",background:earned?T.navy:"transparent",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          {earned
            ? <Icon name="paw" size={Math.round(size*0.42)} color={T.tan} strokeWidth={2}/>
            : <Icon name="lock" size={Math.round(size*0.32)} color={T.textFaint}/>}
        </div>
      </div>
      <div style={{marginTop:"6px",padding:"2px 8px",borderRadius:"6px",background:earned?T.brown:"transparent",minWidth:"26px",textAlign:"center"}}>
        <span style={{fontSize:"9.5px",fontWeight:"900",letterSpacing:".04em",color:earned?T.tan:T.textFaint,fontFamily:"'Lato',sans-serif"}}>WK {weekNum}</span>
      </div>
    </div>
  );
};

const BadgeRow = ({curriculum, earnedMap, title}) => {
  const T=useTheme();
  const earnedCount = curriculum.filter(w=>!!earnedMap?.[w.id]).length;
  return (
    <div className="s1b" style={{marginBottom:"14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"9px",padding:"0 1px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase"}}>{title}</p>
        <p style={{fontSize:"11px",color:T.textMuted,fontWeight:"700"}}>{earnedCount}/{curriculum.length} earned</p>
      </div>
      <div style={{display:"flex",gap:"4px",overflowX:"auto",paddingBottom:"4px"}}>
        {curriculum.map((w,i)=>(
          <WeekBadge key={w.id} weekNum={i+1} earned={!!earnedMap?.[w.id]}/>
        ))}
      </div>
    </div>
  );
};

// Celebratory popup shown the moment a week is marked complete and its badge
// unlocks. Fires from both the Standard "Mark Week Complete" button and the
// Puppy markPuppyWeekDone handler below.
const BadgeEarnedOverlay = ({badge, onClose}) => {
  const T=useTheme();
  if(!badge) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(13,21,32,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1300,animation:"fadeUp .25s both",padding:"20px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.cardSolid,borderRadius:"20px",padding:"32px 26px",maxWidth:"320px",width:"100%",textAlign:"center",border:`1px solid ${T.gold}`,boxShadow:"0 20px 60px rgba(0,0,0,.5)",animation:"rise .35s both"}}>
        <div style={{margin:"0 auto 16px",width:"88px",height:"88px",borderRadius:"50%",background:`linear-gradient(155deg, ${T.gold} 0%, ${T.brown} 100%)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 20px rgba(176,141,87,.45)"}}>
          <div style={{width:"74px",height:"74px",borderRadius:"50%",background:T.navy,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon name="paw" size={36} color={T.tan}/>
          </div>
        </div>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"900",letterSpacing:".16em",textTransform:"uppercase",marginBottom:"6px"}}>Badge Earned</p>
        <h3 style={{fontFamily:"'Inter',serif",fontSize:"19px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>{badge.label}</h3>
        <p style={{fontSize:"12.5px",color:T.textMuted,lineHeight:1.5,marginBottom:"22px"}}>
          {badge.isFinal
            ? "You've completed the entire program! Your certificate of completion is on its way to your email."
            : `Nice work — you're one step closer to graduating the ${badge.program==="puppy"?"Puppy":"6-Week"} Program.`}
        </p>
        <button onClick={onClose} className="btn-gold" style={{width:"100%",padding:"12px",background:T.gold,border:"none",borderRadius:"10px",fontSize:"12px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",color:"#fff",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
          Keep Training
        </button>
      </div>
    </div>
  );
};

const LearnScreen = ({petData, setPetData, puppyCompleted, setPuppyCompleted, puppyWeekDone, setPuppyWeekDone, setPuppyStreak, stdCompleted, setStdCompleted, welcomeVideoWatched, setWelcomeVideoWatched, onOpenHandout, onOpenVideo, openWeek, setOpenWeek, weekCompletedAt, setWeekCompletedAt, petId=null, userId=null}) => {
  const T=useTheme();
  // openWeek & weekCompletedAt come from App (lifted) so opening a lesson video and
  // hitting Back returns to exactly this same week, instead of losing progress.

  // Which curriculum this account is enrolled in. Under the v2 pricing model there's
  // no "buy the other program as an add-on" anymore — the app introduces the next
  // program automatically at the right point in the journey (graduation), see the
  // graduation-offer modal below.
  const purchasedPrograms = getPurchasedPrograms(petData);
  const enrolledProgram = getEnrolledProgram(petData);
  const isStandard = enrolledProgram === "standard";
  const curriculum = isStandard ? STANDARD_CURRICULUM : PUPPY_CURRICULUM;
  const programKey = enrolledProgram;
  const video = WELCOME_VIDEO[programKey];
  const videoWatched = !!welcomeVideoWatched?.[programKey];
  const markVideoWatched = () => {
    setWelcomeVideoWatched(w=>({...w,[programKey]:true}));
    saveLesson(petId, programKey, 0, "__welcome_video__", false, { welcome_video_watched: true });
  };

  const [justEarnedBadge,setJustEarnedBadge]=useState(null); // {label, isFinal, program} — drives BadgeEarnedOverlay

  // ── Graduation-triggered offers ─────────────────────────────────────────────
  // Puppy grads choose between the discounted 6-Week Program or going straight to
  // ongoing membership. 6-Week grads are moved to ongoing membership automatically
  // (no choice to make — see activateMembership below).
  const [showPuppyGradOffer,setShowPuppyGradOffer]=useState(false);
  const [showMembershipStarted,setShowMembershipStarted]=useState(false);
  const [gradOfferBusy,setGradOfferBusy]=useState(false);

  const activateMembership = async () => {
    setPetData && setPetData(d=>({...d, membershipActive:true}));
    if(userId){ const { error } = await supabase.from("users").update({ plan:"membership", subscription_status:"active" }).eq("id", userId); if(error) console.error("[users] failed to activate membership:", error); }
    setShowMembershipStarted(true);
  };

  const choosePuppyGradDiscountProgram = async () => {
    setGradOfferBusy(true);
    setPetData && setPetData(d=>({...d, purchasedPrograms:[...new Set([...getPurchasedPrograms(d), "standard"])], enrolledProgram:"standard"}));
    if(petId) await saveEnrollment(petId, "standard");
    setGradOfferBusy(false);
    setShowPuppyGradOffer(false);
  };
  const choosePuppyGradMembership = async () => {
    setGradOfferBusy(true);
    await activateMembership();
    setGradOfferBusy(false);
    setShowPuppyGradOffer(false);
  };

  // Standard lesson toggle
  const toggleStd = (wid,lesson) => {
    const k=`${wid}::${lesson}`;
    const newVal = !stdCompleted[k];
    setStdCompleted(c=>({...c,[k]:newVal}));
    saveLesson(petId, "standard", wid, lesson, newVal);
  };

  // Puppy lesson toggle — uses lifted state
  const togglePuppy = (wid,lesson) => {
    const k=`${wid}::${lesson}`;
    const newVal = !puppyCompleted[k];
    setPuppyCompleted(c=>({...c,[k]:newVal}));
    saveLesson(petId, "puppy", wid, lesson, newVal);
  };

  // Is a week unlocked? Delegates to the shared isCurriculumWeekUnlocked function
  // (see top of file) so this always agrees with the Video Library's lock check.
  const isUnlocked = (wi) => isCurriculumWeekUnlocked(curriculum, wi, isStandard, videoWatched, stdCompleted, puppyWeekDone, weekCompletedAt);

  // Why a given week is still locked, for user-facing messaging — distinguishes
  // "previous week isn't finished yet" from "finished, but still in the 7-day
  // practice window" so the notice (and the click-to-explain toast below) is accurate.
  const getWeekLockInfo = (wi) => {
    if(isUnlocked(wi)) return {locked:false};
    if(wi===0) return {locked:true, reason:"welcome"};
    const prev = curriculum[wi-1];
    const prevRequirementMet = isStandard
      ? prev.lessons.every(l => !!stdCompleted[`${prev.id}::${l}`])
      : !!puppyWeekDone?.[prev.id];
    if(!prevRequirementMet) return {locked:true, reason:"incomplete", prevLabel:prev.label};
    if(curriculum[wi].unlockAfterDays){
      const completedAt = weekCompletedAt[prev.id];
      if(completedAt){
        const unlockAt = completedAt + SEVEN_DAYS_MS;
        const daysLeft = Math.max(1, Math.ceil((unlockAt - Date.now()) / (1000*60*60*24)));
        const unlockDateStr = new Date(unlockAt).toLocaleDateString("en-US",{month:"short",day:"numeric"});
        return {locked:true, reason:"waiting", daysLeft, unlockDateStr};
      }
    }
    return {locked:true, reason:"incomplete", prevLabel:prev.label};
  };

  // Toast shown when someone taps a locked week, or right after completing one —
  // same pattern used elsewhere in the app (e.g. the video-locked toast).
  const [learnToast,setLearnToast]=useState(null); // {text, tone:"gold"|"green"}
  const showLearnToast = (text, tone="gold") => { setLearnToast({text,tone}); setTimeout(()=>setLearnToast(null), 4000); };

  // Puppy: mark whole week done, and record when — same as the standard program —
  // so the shared 7-day pacing gate above has a completion timestamp to check.
  const markPuppyWeekDone = (weekId, nextWeekLabel) => {
    const now = Date.now();
    setPuppyWeekDone(d => ({...d,[weekId]:true}));
    setWeekCompletedAt(d => ({...d,[weekId]:now}));
    saveLesson(petId, "puppy", weekId, "__week_complete__", true, { week_completed_at: new Date(now).toISOString() });
    setPuppyStreak(s => s+1);
    setOpenWeek(null); // collapse after marking done
    const unlockDateStr = new Date(Date.now()+SEVEN_DAYS_MS).toLocaleDateString("en-US",{month:"short",day:"numeric"});
    showLearnToast(nextWeekLabel ? `Week complete! Take these next 7 days to practice and reinforce these skills — ${nextWeekLabel} unlocks ${unlockDateStr}.` : "Week complete! You've finished the full program.", "green");
    const wk = PUPPY_CURRICULUM.find(w=>w.id===weekId);
    setJustEarnedBadge({label: wk?.label || "Week Complete", isFinal: !nextWeekLabel, program:"puppy"});
    if(!nextWeekLabel){
      sendCertificateWebhook("puppy", petData); // final week — fire the GHL certificate workflow
      setShowPuppyGradOffer(true); // offer the discounted 6-Week Program or membership
    }
  };

  const completed = isStandard ? stdCompleted : puppyCompleted;

  // ── CHANGE: which week is "current" here uses the exact same math as the
  // Dashboard (getCurrentStdWeek / getCurrentPuppyWeek), so whatever week shows
  // as "This Week" on the Dashboard is the one that auto-opens here too. ──
  const currentWeekId = isStandard
    ? getCurrentStdWeek(stdCompleted||{}).week?.id
    : getCurrentPuppyWeek(puppyWeekDone||{}).week?.id;

  // Auto-open the person's actual current week the first time this screen (or this
  // program tab) is shown, so Learn always lands on the same week the Dashboard is
  // showing instead of leaving every week collapsed. It never fights a week the
  // person already opened manually.
  useEffect(()=>{
    if(currentWeekId && openWeek==null){
      setOpenWeek(currentWeekId);
    }
  },[enrolledProgram, currentWeekId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scrolls the current week into view once it auto-opens, so the person doesn't
  // have to hunt for it in a long curriculum list.
  const currentWeekRef = useRef(null);
  useEffect(()=>{
    if(openWeek && openWeek===currentWeekId && currentWeekRef.current){
      const t=setTimeout(()=>currentWeekRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),80);
      return ()=>clearTimeout(t);
    }
  },[openWeek, currentWeekId]);

  return (
    <>
    <ScrollBody>
      <div className="s1" style={{marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Learn</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Training Curriculum</h2>
        <p style={{fontSize:"12px",color:T.textMuted,marginTop:"4px"}}>Complete each week to unlock the next</p>
      </div>

      {/* Program access — no more "add the other program" upsell here. The app
          introduces the next program automatically at graduation instead (see the
          graduation-offer modal below), matching whichever program this pet
          purchased based on their age. */}
      <div className="s2" style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px",background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"11px 14px"}}>
        <Icon name="lock" size={13} color={T.gold}/>
        <span style={{fontSize:"12px",fontWeight:"700",color:T.text}}>{programLabel(enrolledProgram)}</span>
      </div>

      {/* Puppy notice */}
      {!isStandard && (
        <div style={{background:"rgba(76,175,125,.08)",border:"1px solid rgba(76,175,125,.25)",borderRadius:"12px",padding:"11px 14px",marginBottom:"14px",display:"flex",gap:"9px",alignItems:"flex-start"}}>
          <Icon name="dog" size={20} style={{flexShrink:0}} color={T.gold}/>
          <div>
            <p style={{fontSize:"12px",fontWeight:"700",color:"#4caf7d",marginBottom:"2px"}}>Puppy Program</p>
            <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.5}}>Designed for puppies starting between 6–18 weeks old. Check off every lesson, then tap <strong style={{color:T.text}}>Mark Week Complete</strong> — the next week unlocks 7 days later, giving time to practice.</p>
          </div>
        </div>
      )}

      {/* Weekly badges for the currently-viewed program. Graduation weeks count as
          earned once their lessons/final action are done, even though they don't
          set weekCompletedAt/puppyWeekDone through the normal per-week button. */}
      <BadgeRow
        curriculum={curriculum}
        earnedMap={Object.fromEntries(curriculum.map(w => [
          w.id,
          isStandard
            ? (w.graduation ? w.lessons.every(l=>!!stdCompleted[`${w.id}::${l}`]) && !!weekCompletedAt[w.id] : !!weekCompletedAt[w.id])
            : !!puppyWeekDone?.[w.id]
        ]))}
        title={isStandard ? "6-Week Program Badges" : "Puppy Program Badges"}
      />

      {/* Required welcome video — must be watched before the first section unlocks */}
      <div className="s2" style={{marginBottom:"14px",animation:"up .4s .02s both"}}>
        <div style={{background:videoWatched?"rgba(76,175,125,.08)":T.cardInner,border:`1px solid ${videoWatched?"rgba(76,175,125,.3)":T.gold}`,borderRadius:"14px",overflow:"hidden"}}>
          <div style={{padding:"12px 15px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.divider}`}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{color:videoWatched?T.success:T.textFaint}}><Icon name={videoWatched?"checkCircle":"lock"} size={15}/></span>
              <div>
                <p style={{fontSize:"13px",fontWeight:"700",color:videoWatched?"#4caf7d":T.text}}>{video.title}</p>
                <p style={{fontSize:"10px",color:T.textFaint,marginTop:"1px"}}>{videoWatched?"Watched — you're all set":"Required before you can begin"}</p>
              </div>
            </div>
          </div>
          <div style={{padding:"12px 15px"}}>
            {!videoWatched && (
              <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"10px",lineHeight:1.5}}>{video.caption}</p>
            )}
            <div className="protected-content-wrap" style={{borderRadius:"10px",overflow:"hidden",background:"#000"}}>
              <video
                className="protected-video"
                src={video.src}
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e)=>e.preventDefault()}
                onEnded={markVideoWatched}
                style={{width:"100%",display:"block",maxHeight:"320px"}}
              />
            </div>
            {!videoWatched && (
              <button onClick={markVideoWatched} className="btn-gold"
                style={{width:"100%",marginTop:"10px",padding:"11px",background:T.gold,border:"none",borderRadius:"10px",
                  fontSize:"12px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",color:"#fff",
                  cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
                I've Watched the Welcome Video
              </button>
            )}
          </div>
        </div>
      </div>

      {curriculum.map((week,wi)=>{
        const isOpen=openWeek===week.id;
        const unlocked=isUnlocked(wi);
        const lockInfo=unlocked?null:getWeekLockInfo(wi);
        const weekMarkedDone = !isStandard ? !!puppyWeekDone?.[week.id] : false;
        const doneCount=week.lessons.filter(l=>!!completed[`${week.id}::${l}`]).length;
        const allLessonsDone=doneCount===week.lessons.length;
        // For standard: "all done" by lessons. For puppy: by mark-complete button
        const weekFullyDone = isStandard ? allLessonsDone : weekMarkedDone;
        const prevWeek=wi>0?curriculum[wi-1]:null;
        const prevDone=prevWeek?(isStandard?prevWeek.lessons.filter(l=>!!stdCompleted[`${prevWeek.id}::${l}`]).length:0):0;

        const isCurrentWeek = week.id===currentWeekId;
        return (
          <div key={week.id} ref={isCurrentWeek?currentWeekRef:null} style={{marginBottom:"7px",animation:`up .4s ${wi*.06}s both`}}>
            {/* Week header button */}
            <button className="week-row"
              onClick={()=>{
                if(unlocked){ setOpenWeek(isOpen?null:week.id); return; }
                // Tapping a locked week explains WHY instead of doing nothing.
                if(lockInfo?.reason==="waiting"){
                  showLearnToast(`${week.label} unlocks in ${lockInfo.daysLeft} day${lockInfo.daysLeft===1?"":"s"} (${lockInfo.unlockDateStr}) — this practice window helps ${petData?.name||"your dog"} lock in what they've already learned before moving on.`);
                } else if(lockInfo?.reason==="welcome"){
                  showLearnToast("Watch the welcome video above to unlock Week 1.");
                } else {
                  showLearnToast(`Finish ${lockInfo?.prevLabel||prevWeek?.label||"the previous week"} first to unlock ${week.label}.`);
                }
              }}
              style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 15px",
                background:weekFullyDone?"rgba(76,175,125,.12)":!unlocked?"rgba(255,255,255,.02)":isOpen?"rgba(176,141,87,.12)":T.chipBg,
                border:`1px solid ${isCurrentWeek&&unlocked?T.gold:weekFullyDone?"rgba(76,175,125,.4)":!unlocked?"rgba(176,141,87,.1)":isOpen?T.gold:T.chipBorder}`,
                borderRadius:isOpen?"14px 14px 0 0":"14px",
                cursor:"pointer",transition:"all .2s",opacity:unlocked?1:0.5}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                {!unlocked
                  ? <Icon name="lock" size={14}/>
                  : weekFullyDone
                    ? <span style={{color:T.success}}><Icon name="checkCircle" size={14}/></span>
                    : <div style={{width:"18px",height:"18px",borderRadius:"50%",border:`2px solid ${isOpen?T.gold:T.chipBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:T.gold,fontWeight:"700"}}>{doneCount}</div>
                }
                <div style={{textAlign:"left"}}>
                  <span style={{fontSize:"14px",fontWeight:"700",color:weekFullyDone?"#4caf7d":!unlocked?T.textFaint:isOpen?T.gold:T.text,display:"block"}}>{week.label}</span>
                </div>
                {/* Matches the week shown as "This Week" / "Phase" on the Dashboard */}
                {isCurrentWeek && !weekFullyDone && (
                  <span style={{fontSize:"8.5px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",color:"#fff",background:T.gold,borderRadius:"20px",padding:"2px 7px",flexShrink:0}}>Current</span>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                {!unlocked && lockInfo?.reason==="welcome" && (
                  <span style={{fontSize:"9px",color:T.textFaint,maxWidth:"90px",textAlign:"right",lineHeight:1.3}}>Watch welcome video above</span>
                )}
                {!unlocked && lockInfo?.reason==="waiting" && (
                  <span style={{fontSize:"9px",color:T.gold,fontWeight:"700",maxWidth:"90px",textAlign:"right",lineHeight:1.3}}>Unlocks in {lockInfo.daysLeft} day{lockInfo.daysLeft===1?"":"s"}</span>
                )}
                {!unlocked && lockInfo?.reason==="incomplete" && wi>0 && prevWeek && !isStandard && (
                  <span style={{fontSize:"9px",color:T.textFaint,maxWidth:"80px",textAlign:"right",lineHeight:1.3}}>Complete {prevWeek.label} first</span>
                )}
                {!unlocked && lockInfo?.reason==="incomplete" && wi>0 && isStandard && prevWeek && (
                  <span style={{fontSize:"9px",color:T.textFaint,maxWidth:"80px",textAlign:"right",lineHeight:1.3}}>{prevDone}/{prevWeek.lessons.length} done</span>
                )}
                {unlocked && !weekFullyDone && <span style={{fontSize:"11px",color:T.textFaint}}>{doneCount}/{week.lessons.length}</span>}
                {weekFullyDone && <span style={{fontSize:"10px",color:"#4caf7d",fontWeight:"700"}}><Icon name="check" size={10} strokeWidth={3} style={{marginRight:"2px"}}/>Done</span>}
                {unlocked && <span style={{color:T.textFaint,fontSize:"15px",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none"}}>▾</span>}
              </div>
            </button>


            {/* Expanded content */}
            {isOpen && unlocked && (
              <div style={{background:T.mode==="dark"?"rgba(10,15,22,.7)":T.cardInner,border:`1px solid ${weekFullyDone?"rgba(76,175,125,.4)":T.gold}`,borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>

                {/* Equipment Needed — shown at the start of a program/phase so people can
                    get set up before diving into the tasks below. */}
                {week.equipment && week.equipment.length > 0 && (
                  <div style={{padding:"12px 15px",borderBottom:`1px solid ${T.divider}`,background:T.mode==="dark"?"rgba(176,141,87,.09)":"rgba(176,141,87,.07)"}}>
                    <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"7px",display:"flex",alignItems:"center",gap:"5px"}}><Icon name="backpack" size={12}/>Equipment Needed</p>
                    <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:"5px"}}>
                      {week.equipment.map((item,ei)=>(
                        <li key={ei} style={{fontSize:"12px",color:T.textMuted,lineHeight:1.4,display:"flex",alignItems:"flex-start",gap:"7px"}}>
                          <span style={{color:T.gold,fontWeight:"900",marginTop:"1px",flexShrink:0}}>•</span>
                          <span onClick={()=>onOpenHandout&&onOpenHandout("equipmentList")}
                            style={onOpenHandout?{color:T.gold,textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:"2px",cursor:"pointer",fontWeight:"700"}:undefined}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weekly Sheet: Goal */}
                {week.goal && (
                  <div style={{padding:"12px 15px",borderBottom:`1px solid ${T.divider}`,background:T.mode==="dark"?"rgba(176,141,87,.05)":"rgba(176,141,87,.04)"}}>
                    <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"5px"}}>Goal for This {week.id==="pre"?"Phase":"Week"}</p>
                    <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55}}><Linkify text={week.goal} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></p>
                    {week.note && (
                      <div style={{marginTop:"8px",padding:"8px 11px",background:T.mode==="dark"?"rgba(163,86,42,.15)":"rgba(163,86,42,.08)",border:`1px solid ${T.mode==="dark"?"rgba(163,86,42,.35)":"rgba(163,86,42,.22)"}`,borderRadius:"8px"}}>
                        <p style={{fontSize:"11px",color:T.brown,fontWeight:"700",lineHeight:1.5,display:"flex",alignItems:"flex-start",gap:"4px"}}><Icon name="pin" size={11} style={{marginTop:"2px",flexShrink:0}}/><span><Linkify text={week.note} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></span></p>
                      </div>
                    )}
                    {week.sections && week.sections.length > 0 && (
                      <div style={{marginTop:"10px",display:"flex",flexDirection:"column",gap:"10px"}}>
                        {week.sections.map((sec,si)=>(
                          <div key={si}>
                            <p style={{fontSize:"11px",fontWeight:"700",color:T.text,marginBottom:"3px",lineHeight:1.3}}><Linkify text={sec.title} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></p>
                            <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55}}><Linkify text={sec.body} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Weekly Sheet: Training Schedule Table */}
                {week.tasks && week.tasks.length > 0 && (
                  <div style={{padding:"12px 15px",borderBottom:`1px solid ${T.divider}`}}>
                    <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"8px"}}>Daily Training Schedule</p>
                    {/* Header row */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 70px 90px",gap:"4px",marginBottom:"4px",padding:"5px 8px"}}>
                      {["Task","Per Day","Duration"].map(h=>(
                        <p key={h} style={{fontSize:"9px",fontWeight:"700",color:T.textFaint,textTransform:"uppercase",letterSpacing:".1em",textAlign:h==="Task"?"left":"center"}}>{h}</p>
                      ))}
                    </div>
                    {week.tasks.map((task,ti)=>(
                      <div key={ti} style={{display:"grid",gridTemplateColumns:"1fr 70px 90px",gap:"4px",padding:"6px 8px",borderRadius:"7px",background:ti%2===0?T.mode==="dark"?"rgba(255,255,255,.03)":"rgba(28,38,54,.03)":"transparent",alignItems:"center"}}>
                        <p style={{fontSize:"11.5px",color:T.text,lineHeight:1.35,fontWeight:"500"}}><Linkify text={task.name} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></p>
                        <p style={{fontSize:"11px",color:T.gold,fontWeight:"700",textAlign:"center"}}>{task.sessionsPerDay}</p>
                        <p style={{fontSize:"10.5px",color:T.textMuted,textAlign:"center",lineHeight:1.3}}>{task.sessionLength}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Weekly Sheet: Common Mistakes */}
                {week.mistakes && week.mistakes.length > 0 && (
                  <div style={{padding:"12px 15px",borderBottom:`1px solid ${T.divider}`,background:T.mode==="dark"?"rgba(163,86,42,.07)":"rgba(163,86,42,.04)"}}>
                    <p style={{fontSize:"10px",color:T.brown,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"7px"}}><Icon name="alert" size={11} style={{marginRight:"3px"}}/>Common Mistakes to Avoid</p>
                    {week.mistakes.map((m,mi)=>(
                      <div key={mi} style={{display:"flex",alignItems:"flex-start",gap:"7px",marginBottom:mi<week.mistakes.length-1?"5px":"0"}}>
                        <span style={{fontSize:"9px",color:T.brown,marginTop:"3px",flexShrink:0}}>—</span>
                        <p style={{fontSize:"11.5px",color:T.mode==="dark"?"rgba(216,198,174,.8)":T.textMuted,lineHeight:1.45}}><Linkify text={m} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Divider label for checklist section */}
                <div style={{padding:"9px 15px 4px",background:T.mode==="dark"?"rgba(176,141,87,.04)":"transparent"}}>
                  <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase"}}>Lesson Checklist</p>
                </div>

                {/* Lessons list */}
                {week.lessons.map((lesson,li)=>{
                  const key=`${week.id}::${lesson}`;
                  const done=!!completed[key];
                  const disabled=weekMarkedDone;
                  return (
                    <div key={lesson} className="lesson-row"
                      style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 15px",borderBottom:li<week.lessons.length-1?`1px solid ${T.divider}`:"none",cursor:disabled?"default":"pointer",opacity:disabled?0.65:1}}
                      onClick={()=>!disabled&&(isStandard?toggleStd(week.id,lesson):togglePuppy(week.id,lesson))}>
                      <ProtectedMedia type="text">
                        <span style={{fontSize:"13px",color:done?T.textFaint:T.text,textDecoration:done?"line-through":"none",flex:1,lineHeight:1.4}}><Linkify text={lesson} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></span>
                      </ProtectedMedia>
                      <div style={{width:"22px",height:"22px",borderRadius:"50%",border:`2px solid ${done?"#4caf7d":T.chipBorder}`,background:done?"#4caf7d":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:"10px",transition:"all .2s"}}>
                        {done&&<Icon name="check" size={11} color="#fff" strokeWidth={3}/>}
                      </div>
                    </div>
                  );
                })}

                {/* PUPPY: Mark Week Complete button — only actually completable once every
                    lesson/task for the week is checked, same requirement as the 6-week
                    program. The button still shows earlier (styled as disabled) so it's
                    clear what's left, but clicking it early no longer marks the week done. */}
                {!isStandard && !weekMarkedDone && (
                  <div style={{padding:"13px 15px",borderTop:`1px solid ${T.divider}`,background:"rgba(76,175,125,.05)"}}>
                    <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"8px",lineHeight:1.4}}>
                      {allLessonsDone
                        ? "All lessons checked! Tap below to complete this week and start the 7-day practice window."
                        : "Complete all the lessons and tasks above, then mark this week complete."}
                    </p>
                    <button
                      onClick={()=>{ if(allLessonsDone) markPuppyWeekDone(week.id, wi<curriculum.length-1?curriculum[wi+1].label:null); }}
                      disabled={!allLessonsDone}
                      className="btn-gold"
                      style={{width:"100%",padding:"12px",
                        background:allLessonsDone?"#4caf7d":"rgba(76,175,125,.25)",
                        color:allLessonsDone?"#fff":"rgba(76,175,125,.8)",
                        border:allLessonsDone?"none":"1px solid rgba(76,175,125,.4)",
                        borderRadius:"10px",fontSize:"13px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",
                        fontFamily:"'Lato',sans-serif",cursor:allLessonsDone?"pointer":"not-allowed",
                        boxShadow:allLessonsDone?"0 4px 16px rgba(76,175,125,.35)":"none",transition:"all .3s"}}>
                      Mark Week Complete <Icon name="check" size={13} strokeWidth={3}/>
                    </button>
                  </div>
                )}

                {/* Already marked done state */}
                {!isStandard && weekMarkedDone && (
                  <div style={{padding:"12px 15px",borderTop:`1px solid ${T.divider}`,display:"flex",alignItems:"center",gap:"9px",background:"rgba(76,175,125,.07)"}}>
                    <Icon name="calendar" size={18} color={T.gold}/>
                    <div>
                      <p style={{fontSize:"12px",color:"#4caf7d",fontWeight:"700",marginBottom:"2px"}}>Week complete!</p>
                      <p style={{fontSize:"11px",color:T.textMuted}}>
                        {wi<curriculum.length-1 ? `${curriculum[wi+1].label} unlocks 7 days after completion.` : "You've completed the full program!"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Standard: unlock next prompt when all lessons done (non-final weeks only —
                    the final/graduation week gets its own block below, same shape as Puppy's) */}
                {isStandard && !week.graduation && allLessonsDone && wi < curriculum.length-1 && (
                  <div style={{padding:"12px 15px",borderTop:`1px solid ${T.divider}`,background:"rgba(76,175,125,.07)"}}>
                    {!weekCompletedAt[week.id] ? (
                      <>
                        <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"8px",lineHeight:1.4}}>All lessons checked! Tap below to complete this week and start the 7-day unlock timer.</p>
                        <button onClick={()=>{
                            const now = Date.now();
                            setWeekCompletedAt(d=>({...d,[week.id]:now}));
                            saveLesson(petId, "standard", week.id, "__week_complete__", true, { week_completed_at: new Date(now).toISOString() });
                            const unlockDateStr = new Date(now+SEVEN_DAYS_MS).toLocaleDateString("en-US",{month:"short",day:"numeric"});
                            showLearnToast(`Week complete! Take these next 7 days to practice and reinforce these skills — ${curriculum[wi+1].label} unlocks ${unlockDateStr}.`, "green");
                            setJustEarnedBadge({label: week.label, isFinal: false, program:"standard"});
                          }}
                          style={{width:"100%",padding:"11px",background:"#4caf7d",border:"none",borderRadius:"10px",fontSize:"13px",fontWeight:"900",color:"#fff",cursor:"pointer",fontFamily:"'Lato',sans-serif",letterSpacing:".08em",textTransform:"uppercase"}}>
                          Mark Week Complete
                        </button>
                      </>
                    ) : (
                      <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                        <Icon name="calendar" size={18} color={T.gold}/>
                        <div>
                          <p style={{fontSize:"12px",color:"#4caf7d",fontWeight:"700",marginBottom:"2px"}}>Week complete!</p>
                          <p style={{fontSize:"11px",color:T.textMuted}}>{curriculum[wi+1].label} unlocks 7 days after completion.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Standard: final/graduation week — same "complete all lessons, then Mark
                    Week Complete" requirement as every other week, instead of the old
                    behavior where the certificate button alone could complete the week
                    with no lesson-completion check. Matches Puppy's final-week pattern. */}
                {isStandard && week.graduation && !weekCompletedAt[week.id] && (
                  <div style={{padding:"13px 15px",borderTop:`1px solid ${T.divider}`,background:"rgba(76,175,125,.05)"}}>
                    <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"8px",lineHeight:1.4}}>
                      {allLessonsDone
                        ? "All lessons checked! Tap below to complete this final week and generate your certificate."
                        : "Complete all the lessons and tasks above, then mark this week complete."}
                    </p>
                    <button
                      onClick={()=>{
                        if(!allLessonsDone) return;
                        const now = Date.now();
                        setWeekCompletedAt(d=>({...d,[week.id]:now}));
                        saveLesson(petId, "standard", week.id, "__week_complete__", true, { week_completed_at: new Date(now).toISOString() });
                        setJustEarnedBadge({label: week.label, isFinal:true, program:"standard"});
                        sendCertificateWebhook("standard", petData); // final week — fire the GHL certificate workflow, same as Puppy
                        activateMembership(); // 6-Week grads move to ongoing membership automatically — no choice to make
                      }}
                      disabled={!allLessonsDone}
                      style={{width:"100%",padding:"12px",
                        background:allLessonsDone?"#4caf7d":"rgba(76,175,125,.25)",
                        color:allLessonsDone?"#fff":"rgba(76,175,125,.8)",
                        border:allLessonsDone?"none":"1px solid rgba(76,175,125,.4)",
                        borderRadius:"10px",fontSize:"13px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",
                        fontFamily:"'Lato',sans-serif",cursor:allLessonsDone?"pointer":"not-allowed",
                        boxShadow:allLessonsDone?"0 4px 16px rgba(76,175,125,.35)":"none",transition:"all .3s"}}>
                      Mark Week Complete <Icon name="check" size={13} strokeWidth={3}/>
                    </button>
                  </div>
                )}

                {/* Graduation confirmation — shown once the final week is actually complete,
                    for both programs equally. The certificate webhook already fires the
                    moment that happens (above, or in markPuppyWeekDone), so this is a
                    celebratory confirmation, not a button that needs to be clicked. */}
                {week.graduation && (isStandard ? !!weekCompletedAt[week.id] : !!puppyWeekDone?.[week.id]) && (
                  <div style={{padding:"13px 15px",borderTop:`1px solid ${T.divider}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:"9px",background:"rgba(176,141,87,.08)",border:`1px solid ${T.gold}`,borderRadius:"10px",padding:"12px 14px"}}>
                      <Icon name="gradCap" size={20} color={T.gold}/>
                      <div>
                        <p style={{fontSize:"12px",fontWeight:"700",color:T.gold,marginBottom:"2px"}}>Program complete — certificate sent!</p>
                        <p style={{fontSize:"11px",color:T.textMuted}}>Check your email for your graduation certificate.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </ScrollBody>

    {/* Locked-week / week-complete toast */}
    {learnToast && (
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:learnToast.tone==="green"?T.success:T.navy,border:`1px solid ${learnToast.tone==="green"?T.success:T.gold}`,color:learnToast.tone==="green"?"#fff":T.text,padding:"14px 22px",borderRadius:"14px",fontWeight:"700",fontSize:"12.5px",zIndex:1200,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both",textAlign:"center",maxWidth:"280px",lineHeight:1.5,display:"flex",alignItems:"flex-start",gap:"7px"}}>
        <Icon name={learnToast.tone==="green"?"party":"lock"} size={14} style={{flexShrink:0,marginTop:"1px"}}/>
        <span>{learnToast.text}</span>
      </div>
    )}

    {/* Puppy graduation offer — choice between the discounted 6-Week Program or
        going straight to ongoing membership. Shown automatically the moment the
        Puppy Program's final week is marked complete (see markPuppyWeekDone). */}
    {showPuppyGradOffer && (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
        <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"340px",width:"100%",animation:"rise .35s both"}}>
          <div style={{textAlign:"center",marginBottom:"18px"}}>
            <div style={{marginBottom:"8px",display:"flex",justifyContent:"center",color:T.gold}}><Icon name="gradCap" size={36}/></div>
            <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Congratulations — {petData?.name||"your dog"} graduated! 🎓</h3>
            <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6}}>{petData?.name||"Your dog"} is old enough now for the next stage. Choose how you'd like to continue:</p>
          </div>
          <button onClick={choosePuppyGradDiscountProgram} disabled={gradOfferBusy} style={{width:"100%",padding:"14px",background:T.gold,border:"none",borderRadius:"12px",color:"#fff",cursor:gradOfferBusy?"wait":"pointer",fontFamily:"'Lato',sans-serif",marginBottom:"10px",textAlign:"left"}}>
            <span style={{display:"block",fontWeight:"900",fontSize:"14px"}}>Get the 6-Week Training Program</span>
            <span style={{display:"block",fontSize:"12px",opacity:.85,marginTop:"2px"}}>${PROGRAM_PRICE.standardGradDiscount} one-time — discounted for graduates (regularly ${PROGRAM_PRICE.standard})</span>
          </button>
          <button onClick={choosePuppyGradMembership} disabled={gradOfferBusy} style={{width:"100%",padding:"14px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"12px",color:T.text,cursor:gradOfferBusy?"wait":"pointer",fontFamily:"'Lato',sans-serif",textAlign:"left"}}>
            <span style={{display:"block",fontWeight:"900",fontSize:"14px"}}>Start Ongoing Membership</span>
            <span style={{display:"block",fontSize:"12px",color:T.textMuted,marginTop:"2px"}}>${PROGRAM_PRICE.membership}/mo — skip the 6-week program for now</span>
          </button>
        </div>
      </div>
    )}

    {/* Ongoing membership confirmation — shown automatically once the 6-Week
        Program's final week is completed (no choice to make, unlike Puppy grads
        above), and also shown if a Puppy grad picks membership directly. */}
    {showMembershipStarted && (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
        <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"320px",width:"100%",animation:"rise .35s both",textAlign:"center"}}>
          <div style={{marginBottom:"8px",display:"flex",justifyContent:"center",color:T.success}}><Icon name="check" size={36}/></div>
          <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>You're on Ongoing Membership</h3>
          <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"16px"}}>${PROGRAM_PRICE.membership}/mo, billed to your card on file. Cancel anytime from Settings.</p>
          <button onClick={()=>setShowMembershipStarted(false)} style={{width:"100%",padding:"12px",background:T.gold,border:"none",borderRadius:"10px",color:"#fff",fontWeight:"900",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
            Got It
          </button>
        </div>
      </div>
    )}

    <BadgeEarnedOverlay badge={justEarnedBadge} onClose={()=>setJustEarnedBadge(null)}/>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════
const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
const EVENT_TYPES=[{id:"training",label:"Training",color:"green"},{id:"vet",label:"Vet",color:"brown"},{id:"other",label:"Other",color:"gold"}];

// ── Export-to-external-calendar helpers ──────────────────────────────────────
// Level 1 sync: one-tap "Add to Calendar" per event. Not automatic, not two-way —
// that's a bigger project (real Google OAuth + backend) saved for later. This works
// for any calendar app (Google, Apple, Outlook) with no new infrastructure needed.
const pad2=(n)=>String(n).padStart(2,"0");

const parseEventTime=(timeStr)=>{
  if(!timeStr||/all day/i.test(timeStr)) return null;
  const m=timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if(!m) return null;
  let h=parseInt(m[1],10); const min=parseInt(m[2],10); const ampm=m[3].toUpperCase();
  if(ampm==="PM"&&h!==12) h+=12;
  if(ampm==="AM"&&h===12) h=0;
  return {h,min};
};

// Returns {start, end, allDay} as Date objects — end is start+1hr for timed events,
// or the next calendar day for all-day events (matches how Google/ICS expect all-day ranges).
const eventDateRange=(e)=>{
  const parsed=parseEventTime(e.time);
  if(parsed){
    const start=new Date(e.year,e.month,e.day,parsed.h,parsed.min);
    const end=new Date(start.getTime()+60*60*1000);
    return {start,end,allDay:false};
  }
  const start=new Date(e.year,e.month,e.day);
  const end=new Date(e.year,e.month,e.day+1);
  return {start,end,allDay:true};
};

const buildGoogleCalendarUrl=(e)=>{
  const {start,end,allDay}=eventDateRange(e);
  const fmtDateTime=(d)=>`${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
  const fmtDate=(d)=>`${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}`;
  const dates=allDay?`${fmtDate(start)}/${fmtDate(end)}`:`${fmtDateTime(start)}/${fmtDateTime(end)}`;
  const params=new URLSearchParams({
    action:"TEMPLATE",
    text:e.title,
    dates,
    details:`Added from the Guiding Paw app — ${EVENT_TYPES.find(t=>t.id===e.type)?.label||e.type} event.`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildICS=(e)=>{
  const {start,end,allDay}=eventDateRange(e);
  const fmtDateTime=(d)=>`${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
  const fmtDate=(d)=>`${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}`;
  const uid=`${e.id}@guidingpaw.com`;
  const lines=[
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Guiding Paw//Training App//EN","BEGIN:VEVENT",
    `UID:${uid}`,
    allDay?`DTSTART;VALUE=DATE:${fmtDate(start)}`:`DTSTART:${fmtDateTime(start)}`,
    allDay?`DTEND;VALUE=DATE:${fmtDate(end)}`:`DTEND:${fmtDateTime(end)}`,
    `SUMMARY:${e.title.replace(/[\n,;]/g,"")}`,
    `DESCRIPTION:Added from the Guiding Paw app — ${(EVENT_TYPES.find(t=>t.id===e.type)?.label||e.type)} event.`,
    "END:VEVENT","END:VCALENDAR",
  ];
  return lines.join("\r\n");
};

const downloadICS=(e)=>{
  const blob=new Blob([buildICS(e)],{type:"text/calendar;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=`${e.title.replace(/[^a-z0-9]+/gi,"_")}.ics`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Small "Add to Calendar" button + dropdown, used on every event row
const EventExportButton=({event,T})=>{
  const [open,setOpen]=useState(false);
  return (
    <div style={{position:"relative",flexShrink:0}}>
      <button onClick={()=>setOpen(o=>!o)} title="Add to your calendar"
        style={{background:"none",border:"none",cursor:"pointer",color:T.gold,flexShrink:0,display:"flex",alignItems:"center"}}>
        <Icon name="calendar" size={13}/>
      </button>
      {open&&(
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:149}}/>
          <div style={{position:"absolute",right:0,top:"100%",marginTop:"4px",background:T.mode==="dark"?"#1c2942":"#fff",border:`1px solid ${T.cardBorder}`,borderRadius:"10px",padding:"6px",zIndex:150,minWidth:"180px",boxShadow:"0 8px 24px rgba(0,0,0,.25)"}}>
            <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" onClick={()=>setOpen(false)}
              style={{display:"block",padding:"8px 10px",fontSize:"12px",color:T.text,textDecoration:"none",borderRadius:"7px",fontFamily:"'Lato',sans-serif"}}
              onMouseEnter={ev=>ev.currentTarget.style.background="rgba(176,141,87,.12)"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
              Add to Google Calendar
            </a>
            <button onClick={()=>{downloadICS(event);setOpen(false);}}
              style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",fontSize:"12px",color:T.text,background:"none",border:"none",cursor:"pointer",borderRadius:"7px",fontFamily:"'Lato',sans-serif"}}
              onMouseEnter={ev=>ev.currentTarget.style.background="rgba(176,141,87,.12)"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
              Apple / Outlook (.ics)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const CalendarScreen = ({userId}) => {
  const T=useTheme();
  const now=new Date();
  const [viewYear,setViewYear]=useState(now.getFullYear());
  const [viewMonth,setViewMonth]=useState(now.getMonth()); // 0-11
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(true);

  // Load this user's events from Supabase on mount (and if userId becomes available later)
  useEffect(()=>{
    if(!userId){ setLoading(false); return; }
    let cancelled=false;
    (async()=>{
      const {data,error}=await supabase.from("calendar_events").select("*").eq("owner_id",userId);
      if(!cancelled&&!error&&data){
        setEvents(data.map(r=>{
          const d=new Date(r.event_date+"T00:00:00");
          return {id:r.id,year:d.getFullYear(),month:d.getMonth(),day:d.getDate(),title:r.title,time:r.event_time||"All day",type:r.event_type||"other"};
        }));
      }
      if(!cancelled) setLoading(false);
    })();
    return ()=>{ cancelled=true; };
  },[userId]);

  const [showDayPanel,setShowDayPanel]=useState(false);
  const [addMode,setAddMode]=useState(false);
  const [selectedDay,setSelectedDay]=useState(null);
  const [newTitle,setNewTitle]=useState("");
  const [newTime,setNewTime]=useState("");
  const [newType,setNewType]=useState("training");
  const [saving,setSaving]=useState(false);

  const goPrevMonth=()=>{ if(viewMonth===0){ setViewMonth(11); setViewYear(y=>y-1);} else setViewMonth(m=>m-1); };
  const goNextMonth=()=>{ if(viewMonth===11){ setViewMonth(0); setViewYear(y=>y+1);} else setViewMonth(m=>m+1); };
  const goPrevYear=()=>setViewYear(y=>y-1);
  const goNextYear=()=>setViewYear(y=>y+1);
  const goToday=()=>{ setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); };

  const firstOfMonth=new Date(viewYear,viewMonth,1);
  const startWeekday=firstOfMonth.getDay(); // 0=Sun
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const isCurrentRealMonth=viewYear===now.getFullYear()&&viewMonth===now.getMonth();
  const todayDate=now.getDate();

  const eventsForDay=(day)=>events.filter(e=>e.year===viewYear&&e.month===viewMonth&&e.day===day);

  // Clicking a day opens the day panel showing its scheduled events first
  const openDay=(day)=>{
    setSelectedDay(day);
    setNewTitle(""); setNewTime(""); setNewType("training");
    setAddMode(false);
    setShowDayPanel(true);
  };
  const closeDayPanel=()=>{ setShowDayPanel(false); setAddMode(false); };

  const saveEvent=async()=>{
    if(!newTitle.trim()||!selectedDay||!userId) return;
    setSaving(true);
    const dateStr=`${viewYear}-${pad2(viewMonth+1)}-${pad2(selectedDay)}`;
    const time=newTime.trim()||"All day";
    const {data,error}=await supabase.from("calendar_events").insert({
      owner_id:userId, title:newTitle.trim(), event_date:dateStr, event_time:time, event_type:newType,
    }).select().single();
    setSaving(false);
    if(!error&&data){
      setEvents(evs=>[...evs,{id:data.id,year:viewYear,month:viewMonth,day:selectedDay,title:data.title,time:data.event_time,type:data.event_type}]);
      setNewTitle(""); setNewTime(""); setNewType("training");
      setAddMode(false); // drop back to the day view so the new event shows in the list
    }
  };

  const deleteEvent=async(id)=>{
    setEvents(evs=>evs.filter(e=>e.id!==id)); // optimistic — feels instant
    const {error}=await supabase.from("calendar_events").delete().eq("id",id);
    if(error){
      // Rare, but if the delete didn't actually go through server-side, reload
      // from Supabase so the UI doesn't silently drift from what's really saved.
      const {data}=await supabase.from("calendar_events").select("*").eq("owner_id",userId);
      if(data) setEvents(data.map(r=>{
        const d=new Date(r.event_date+"T00:00:00");
        return {id:r.id,year:d.getFullYear(),month:d.getMonth(),day:d.getDate(),title:r.title,time:r.event_time||"All day",type:r.event_type||"other"};
      }));
    }
  };

  // Upcoming: every stored event, sorted chronologically from today forward (falls back to all, oldest-future-first)
  const upcoming=[...events]
    .map(e=>({...e, ts:new Date(e.year,e.month,e.day).getTime()}))
    .sort((a,b)=>a.ts-b.ts)
    .filter(e=>e.ts >= new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime())
    .slice(0,8);

  const typeColor=(type)=> type==="vet"?T.brown : type==="other"?T.gold : T.green;

  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Calendar</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>{MONTH_NAMES[viewMonth]} {viewYear}</h2>
        </div>
        {!isCurrentRealMonth&&<button onClick={goToday} style={{background:"rgba(176,141,87,.15)",border:`1px solid ${T.gold}`,borderRadius:"20px",padding:"6px 12px",color:T.gold,fontSize:"11px",fontWeight:"700",cursor:"pointer",fontFamily:"'Lato',sans-serif",flexShrink:0}}>Today</button>}
      </div>

      {/* Month / year navigation */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"6px",marginBottom:"12px"}}>
        <div style={{display:"flex",gap:"4px"}}>
          <button onClick={goPrevYear} title="Previous year" style={{background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"8px",padding:"7px 9px",cursor:"pointer",color:T.textMuted,display:"flex",alignItems:"center"}}>
            <Icon name="arrowLeft" size={12}/><Icon name="arrowLeft" size={12} style={{marginLeft:"-7px"}}/>
          </button>
          <button onClick={goPrevMonth} title="Previous month" style={{background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"8px",padding:"7px 11px",cursor:"pointer",color:T.text,display:"flex",alignItems:"center"}}>
            <Icon name="arrowLeft" size={13}/>
          </button>
        </div>
        <div style={{display:"flex",gap:"4px"}}>
          <button onClick={goNextMonth} title="Next month" style={{background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"8px",padding:"7px 11px",cursor:"pointer",color:T.text,display:"flex",alignItems:"center"}}>
            <Icon name="arrowRight" size={13}/>
          </button>
          <button onClick={goNextYear} title="Next year" style={{background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"8px",padding:"7px 9px",cursor:"pointer",color:T.textMuted,display:"flex",alignItems:"center"}}>
            <Icon name="arrowRight" size={12}/><Icon name="arrowRight" size={12} style={{marginLeft:"-7px"}}/>
          </button>
        </div>
      </div>

      <div className="s2" style={{background:T.calBg,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"16px",marginBottom:"14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px",marginBottom:"8px"}}>{["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:"9.5px",color:T.textFaint,fontWeight:"700",padding:"3px 0"}}>{d}</div>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px"}}>
          {Array.from({length:Math.ceil((startWeekday+daysInMonth)/7)*7},(_,i)=>{
            const day=i-startWeekday+1;
            const valid=day>0&&day<=daysInMonth;
            const isToday=isCurrentRealMonth&&day===todayDate;
            const dayEvents=valid?eventsForDay(day):[];
            return(
              <div key={i}
                onClick={()=>valid&&openDay(day)}
                style={{textAlign:"center",padding:"6px 2px",borderRadius:"7px",cursor:valid?"pointer":"default",background:isToday?T.dayToday:"transparent",color:!valid?"transparent":isToday?T.dayTodayText:T.text,fontSize:"12.5px",fontWeight:isToday?"900":"400",position:"relative",transition:"background .15s"}}
                onMouseEnter={e=>{ if(valid&&!isToday) e.currentTarget.style.background=T.mode==="dark"?"rgba(176,141,87,.12)":"rgba(176,141,87,.1)"; }}
                onMouseLeave={e=>{ if(valid&&!isToday) e.currentTarget.style.background="transparent"; }}>
                {valid?day:""}
                {dayEvents.length>0&&!isToday&&<div style={{width:"3.5px",height:"3.5px",borderRadius:"50%",background:T.gold,margin:"1.5px auto 0"}}/>}
              </div>
            );
          })}
        </div>
        <p style={{fontSize:"10px",color:T.textFaint,textAlign:"center",marginTop:"10px"}}>Tap a day to view or add events</p>
      </div>

      {/* Day panel — shows the day's scheduled events first, with an option to add another */}
      {showDayPanel&&(
        <>
          <div onClick={closeDayPanel} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:99}}/>
          <div style={{position:"fixed",left:"50%",top:"50%",transform:"translate(-50%,-50%)",zIndex:100,width:"min(340px,90vw)",maxHeight:"80vh",overflowY:"auto",background:T.mode==="dark"?"#162032":T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"16px",padding:"18px",boxShadow:"0 20px 50px rgba(0,0,0,.4)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
              <p style={{fontSize:"14px",fontWeight:"700",color:T.text}}>{MONTH_NAMES[viewMonth]} {selectedDay}, {viewYear}</p>
              <button onClick={closeDayPanel} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint}}><Icon name="x" size={16}/></button>
            </div>

            {!addMode&&(
              <>
                {/* Scheduled events for this day */}
                <div style={{marginBottom:"14px"}}>
                  <p style={{fontSize:"9px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"8px"}}>Scheduled Events</p>
                  {selectedDay&&eventsForDay(selectedDay).length===0&&(
                    <p style={{fontSize:"12px",color:T.textFaint,padding:"6px 0"}}>Nothing scheduled on this day yet.</p>
                  )}
                  {selectedDay&&eventsForDay(selectedDay).map(e=>(
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
                      <div style={{width:"3px",height:"28px",borderRadius:"2px",background:typeColor(e.type),flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:"13px",fontWeight:"700",color:T.text}}>{e.title}</p>
                        <p style={{fontSize:"11px",color:T.textMuted}}>{e.time} · {EVENT_TYPES.find(t=>t.id===e.type)?.label||e.type}</p>
                      </div>
                      <EventExportButton event={e} T={T}/>
                      <button onClick={()=>deleteEvent(e.id)} title="Delete" style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,flexShrink:0}}><Icon name="trash" size={13}/></button>
                    </div>
                  ))}
                </div>
                <GoldBtn onClick={()=>setAddMode(true)} style={{padding:"11px",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
                  <Icon name="plus" size={13}/>Add Event
                </GoldBtn>
              </>
            )}

            {addMode&&(
              <>
                <div style={{marginBottom:"10px"}}>
                  <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"5px"}}>Title</label>
                  <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. Vet Appointment" autoFocus
                    style={{width:"100%",padding:"10px 12px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13.5px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                </div>
                <div style={{marginBottom:"10px"}}>
                  <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"5px"}}>Time</label>
                  <input value={newTime} onChange={e=>setNewTime(e.target.value)} placeholder="e.g. 2:30 PM"
                    style={{width:"100%",padding:"10px 12px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13.5px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                </div>
                <div style={{marginBottom:"14px"}}>
                  <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"5px"}}>Type</label>
                  <div style={{display:"flex",gap:"6px"}}>
                    {EVENT_TYPES.map(t=>(
                      <button key={t.id} onClick={()=>setNewType(t.id)} style={{flex:1,padding:"8px",borderRadius:"9px",border:`1px solid ${newType===t.id?T.gold:T.chipBorder}`,background:newType===t.id?"rgba(176,141,87,.18)":T.chipBg,color:newType===t.id?T.goldLight:T.textMuted,fontSize:"12px",fontWeight:newType===t.id?"700":"400",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:"8px"}}>
                  <GoldBtn onClick={saveEvent} disabled={saving} style={{padding:"11px",fontSize:"12px",opacity:saving?0.6:1}}>{saving?"Saving…":"Save Event"}</GoldBtn>
                  <button onClick={()=>setAddMode(false)} style={{flex:1,padding:"11px",background:"transparent",border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.textMuted,fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>Back</button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <p style={{fontSize:"10px",color:T.textFaint,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>Upcoming</p>
      {loading&&<p style={{fontSize:"12px",color:T.textFaint,textAlign:"center",padding:"14px 0"}}>Loading your events…</p>}
      {!loading&&upcoming.length===0&&<p style={{fontSize:"12px",color:T.textFaint,textAlign:"center",padding:"14px 0"}}>No upcoming events — tap a day above to add one.</p>}
      {upcoming.map(e=>{
        const isToday=e.year===now.getFullYear()&&e.month===now.getMonth()&&e.day===now.getDate();
        return (
          <div key={e.id} style={{display:"flex",gap:"11px",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${T.divider}`}}>
            <div style={{width:"46px",flexShrink:0}}><p style={{fontSize:"9.5px",color:T.textFaint}}>{isToday?"Today":`${MONTH_NAMES[e.month].slice(0,3)} ${e.day}`}</p></div>
            <div style={{width:"3px",height:"32px",borderRadius:"2px",background:typeColor(e.type),flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}><p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{e.title}</p><p style={{fontSize:"11px",color:T.textMuted}}>{e.time}</p></div>
            <EventExportButton event={e} T={T}/>
            <button onClick={()=>deleteEvent(e.id)} title="Delete" style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,flexShrink:0}}><Icon name="trash" size={13}/></button>
          </div>
        );
      })}
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: STORE — CHANGE 4: new page replacing affiliate on Live
// ═══════════════════════════════════════════════════════════════════════════════
// Curated equipment list — the ONLY product links in the app. Each product opens its own
// real product page directly (Amazon affiliate links or the Ruff Land site) — there is no
// generic storefront link anymore.
const STORE_PRODUCTS=[
    {name:"Prong Collar – Herm Sprenger 2.25mm Training Collar",cat:"Collars & Leashes",url:"https://amzn.to/4xRw4tf",emoji:"link"},
    {name:"Prong Collar – Herm Sprenger Quick Release 2.25mm",cat:"Collars & Leashes",url:"https://amzn.to/4qs9UeJ",emoji:"link"},
    {name:"Prong Collar – Herm Sprenger 3mm Training Collar",cat:"Collars & Leashes",url:"https://amzn.to/3UHFLMq",emoji:"link"},
    {name:"Prong Collar – Herm Sprenger Extra Links 3mm",cat:"Collars & Leashes",url:"https://amzn.to/3TYabKj",emoji:"link"},
    {name:"Prong Collar – Herm Sprenger Quick Release 3mm",cat:"Collars & Leashes",url:"https://amzn.to/3SqiX3f",emoji:"link"},
    {name:"Prong Collar – Herm Sprenger Extra Links 2.25mm",cat:"Collars & Leashes",url:"https://amzn.to/4iwP2Rr",emoji:"link"},
    {name:"Leash – Hands-Free (Pink)",cat:"Collars & Leashes",url:"https://amzn.to/4gn9iCA",emoji:"link"},
    {name:"Leash – Hands-Free (Blue)",cat:"Collars & Leashes",url:"https://amzn.to/4gr3wzH",emoji:"link"},
    {name:"Long Line – 20ft",cat:"Collars & Leashes",url:"https://amzn.to/4gkSxrE",emoji:"link"},
    {name:"Slip Lead",cat:"Collars & Leashes",url:"https://amzn.to/4wIfCe3",emoji:"link"},
    {name:"E-Collar – Micro Educator ME300",cat:"E-Collars",url:"https://amzn.to/4c1UEzf",emoji:"antenna"},
    {name:"E-Collar – Mini Educator ET300",cat:"E-Collars",url:"https://amzn.to/4cPCJvM",emoji:"antenna"},
    {name:"Treat Pouch – Fanny Pack",cat:"Treat Pouches",url:"https://amzn.to/4zp5dq9",emoji:"bag"},
    {name:"Treat Pouch – Magnetic",cat:"Treat Pouches",url:"https://amzn.to/4bYpitl",emoji:"bag"},
    {name:"Treat Pouch – Coastal Blue",cat:"Treat Pouches",url:"https://amzn.to/3UovkNK",emoji:"bag"},
    {name:"Treat Pouch – Silicone (2-Pack)",cat:"Treat Pouches",url:"https://amzn.to/4bU8lQM",emoji:"bag"},
    {name:"Kennel – Ruff Land Small",cat:"Kennels & Crates",url:"https://www.rufflandkennels.com/products/small-kennel",emoji:"box"},
    {name:"Kennel – Ruff Land Medium",cat:"Kennels & Crates",url:"https://www.rufflandkennels.com/products/medium-kennel",emoji:"box"},
    {name:"Kennel – Ruff Land Large",cat:"Kennels & Crates",url:"https://www.rufflandkennels.com/products/large-kennel",emoji:"box"},
    {name:"Kennel – Petmate Small 24\"",cat:"Kennels & Crates",url:"https://www.amazon.com/dp/B00DJR9X2M?lv=shuf&linkCode=spc&asc_contentid=amzn1.ideas.3IPKBTHKRC8B9&tag=barkbossacade-20&domainId=influencer&channelId=500&plpRedirect=mhFallback&th=1",emoji:"box"},
    {name:"Kennel – Petmate Medium 40\"",cat:"Kennels & Crates",url:"https://amzn.to/4gFFsdE",emoji:"box"},
    {name:"Kennel – Petmate 40\" Large",cat:"Kennels & Crates",url:"https://amzn.to/4hKSQhD",emoji:"box"},
    {name:"Kennel – Petmate Large 36\"",cat:"Kennels & Crates",url:"https://amzn.to/4wJ3oll",emoji:"box"},
    {name:"Kennel – Petmate XL 48\"",cat:"Kennels & Crates",url:"https://amzn.to/4zMaWGP",emoji:"box"},
    {name:"Kennel – MidWest iCrate Starter Kit 24\"",cat:"Kennels & Crates",url:"https://amzn.to/4xMzyNv",emoji:"box"},
    {name:"Kennel – MidWest iCrate Starter Kit 42\"",cat:"Kennels & Crates",url:"https://amzn.to/46bLbBX",emoji:"box"},
    {name:"Kennel – MidWest 30\" Medium iCrate",cat:"Kennels & Crates",url:"https://amzn.to/4cPbK3u",emoji:"box"},
    {name:"Kennel – MidWest 36\" Medium/Large iCrate",cat:"Kennels & Crates",url:"https://amzn.to/3Skd9bu",emoji:"box"},
    {name:"Kennel – MidWest 42\" Large iCrate",cat:"Kennels & Crates",url:"https://amzn.to/4bYHp2d",emoji:"box"},
    {name:"Dog Bed – Elevated Coolaroo On-The-Go Foldable (Medium)",cat:"Beds",url:"https://amzn.to/4qtpyGz",emoji:"bed"},
    {name:"Dog Bed – Elevated Cooling Breathable (Large)",cat:"Beds",url:"https://amzn.to/3SNlrsx",emoji:"bed"},
    {name:"Dog Bed – Elevated Coolaroo (Large)",cat:"Beds",url:"https://amzn.to/4zzATJx",emoji:"bed"},
    {name:"Bite Pillow Toy",cat:"Toys & Enrichment",url:"https://amzn.to/4gi0rTX",emoji:"bone"},
    {name:"Glow-in-the-Dark Soccer Ball with Straps",cat:"Toys & Enrichment",url:"https://amzn.to/4gtTT3s",emoji:"bone"},
    {name:"Treat-Dispensing Puzzle Toy",cat:"Toys & Enrichment",url:"https://amzn.to/4hJWtoa",emoji:"bone"},
    {name:"Treat-Dispensing Pineapple Toy",cat:"Toys & Enrichment",url:"https://amzn.to/45DggOJ",emoji:"bone"},
    {name:"Large Water Buffalo Horn Chew",cat:"Toys & Enrichment",url:"https://amzn.to/4hIZBkb",emoji:"bone"},
    {name:"Elk Antler Chew",cat:"Toys & Enrichment",url:"https://amzn.to/3SNlAfz",emoji:"bone"},
    {name:"Elk Antler Chew – Split Antler",cat:"Toys & Enrichment",url:"https://amzn.to/4xPmk2A",emoji:"bone"},
    {name:"Kong Natural Rubber Dental Chew Stuff-A-Ball",cat:"Toys & Enrichment",url:"https://amzn.to/4xPmk2A",emoji:"bone"},
    {name:"Kong Knot Bears (Small/Medium, 2-Pack)",cat:"Toys & Enrichment",url:"https://amzn.to/4wyLphf",emoji:"bone"},
    {name:"Kong Rubber Flying Disc Fetch Toy",cat:"Toys & Enrichment",url:"https://amzn.to/3SH2JTq",emoji:"bone"},
    {name:"Kong Tug Toy",cat:"Toys & Enrichment",url:"https://amzn.to/3UHH2mG",emoji:"bone"},
    {name:"Durable Rubber Bone",cat:"Toys & Enrichment",url:"https://amzn.to/4gGyrJx",emoji:"bone"},
    {name:"Enzyme Odor Spray Cleaner – Nature's Miracle",cat:"Grooming & Care",url:"https://amzn.to/3SdiyRD",emoji:"droplet"},
    {name:"Inflatable Dog Cone Collar",cat:"Grooming & Care",url:"https://amzn.to/4gl2CVr",emoji:"droplet"},
    {name:"Deshedding Brush",cat:"Grooming & Care",url:"https://amzn.to/4hEK7gY",emoji:"droplet"},
    {name:"Organic Lick-Safe Paw Balm",cat:"Grooming & Care",url:"https://amzn.to/4qxcOPu",emoji:"droplet"},
    {name:"Liquid Bandaid for Dogs",cat:"Grooming & Care",url:"https://amzn.to/4wXhqQx",emoji:"droplet"},
    {name:"Salmon Oil Supplement",cat:"Grooming & Care",url:"https://amzn.to/4xcyjYn",emoji:"droplet"},
    {name:"Ear Cleaner – Doctor Beasley's Advanced Ear Bomb",cat:"Grooming & Care",url:"https://amzn.to/4gI0XKM",emoji:"droplet"},
    {name:"Portable Water Bottle – PupFlask Stainless Steel",cat:"Travel & Car",url:"https://amzn.to/46g5wG8",emoji:"car"},
    {name:"Dog Seat Belt for Car",cat:"Travel & Car",url:"https://amzn.to/4ztP02G",emoji:"car"},
    {name:"Car First Aid Kit",cat:"Travel & Car",url:"https://amzn.to/4qtVNpc",emoji:"car"},
    {name:"Car Harness Seat Belt (Purple)",cat:"Travel & Car",url:"https://amzn.to/4ztMiKD",emoji:"car"},
    {name:"Car Harness Seat Belt (Black)",cat:"Travel & Car",url:"https://amzn.to/4cSQmdJ",emoji:"car"},
    {name:"Car Seat Belt Headrest Restraint Safety Leads (2-Pack)",cat:"Travel & Car",url:"https://amzn.to/4gDjg3T",emoji:"car"},
    {name:"Car Seat Harness (Black)",cat:"Travel & Car",url:"https://amzn.to/4ijtlEk",emoji:"car"},
    {name:"Agility Cones – Multi-Colored (30-Pack)",cat:"Training Aids",url:"https://amzn.to/4hJw4qw",emoji:"target"},
    {name:"Agility Cones – Orange (30-Pack)",cat:"Training Aids",url:"https://amzn.to/4wCLQqU",emoji:"target"},
    {name:"Collapsible Dog Bowl",cat:"Feeding",url:"https://amzn.to/4grmq9J",emoji:"bowl"},
];
const STORE_CATS=["All","Collars & Leashes","E-Collars","Treat Pouches","Kennels & Crates","Beds","Toys & Enrichment","Grooming & Care","Travel & Car","Training Aids","Feeding"];

const StoreScreen = () => {
  const T=useTheme();
  const [activeCat,setActiveCat]=useState("All");
  const filtered=activeCat==="All"?STORE_PRODUCTS:STORE_PRODUCTS.filter(p=>p.cat===activeCat);
  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"16px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Shop</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700",marginBottom:"4px"}}>Trainer-Recommended Gear</h2>
        <p style={{fontSize:"12px",color:T.textMuted}}>Our hand-picked equipment list — every link goes straight to the exact product</p>
      </div>
      {/* Category filter */}
      <div className="s2" style={{display:"flex",gap:"6px",overflowX:"auto",marginBottom:"16px",paddingBottom:"4px"}}>
        {STORE_CATS.map(c=><button key={c} onClick={()=>setActiveCat(c)} style={{flexShrink:0,padding:"6px 13px",borderRadius:"20px",border:`1px solid ${activeCat===c?T.gold:T.chipBorder}`,background:activeCat===c?"rgba(176,141,87,.18)":T.chipBg,color:activeCat===c?T.goldLight:T.textMuted,fontSize:"11.5px",fontWeight:activeCat===c?"700":"400",cursor:"pointer",transition:"all .18s",whiteSpace:"nowrap"}}>{c}</button>)}
      </div>
      <div className="s3" style={{display:"flex",flexDirection:"column",gap:"9px"}}>
        {filtered.map((p,pi)=>(
          <div key={p.name+pi} style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"13px 15px",display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"46px",height:"46px",borderRadius:"12px",background:T.storeBg,border:`1px solid ${T.storeBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:T.brown}}><Icon name={p.emoji} size={22}/></div>
            <div style={{flex:1}}>
              <p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px",lineHeight:1.3}}>{p.name}</p>
              <p style={{fontSize:"10px",color:T.gold,fontWeight:"700"}}>{p.cat}</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <button onClick={()=>window.open(p.url,"_blank","noopener,noreferrer")}
                style={{background:T.brown,border:"none",borderRadius:"8px",padding:"7px 12px",fontSize:"10.5px",color:"white",cursor:"pointer",fontWeight:"700",whiteSpace:"nowrap"}}>View →</button>
            </div>
          </div>
        ))}
      </div>
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: BEHAVIOR DIAGNOSIS — CHANGE 7
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// TRAINING HANDOUTS — reference library + inline hyperlinking
// ═══════════════════════════════════════════════════════════════════════════════
const HANDOUTS = {
  eCollarGuide: {
    title:"E-Collar Safety Guide", subtitle:"Equipment, Fit, Use & Handler Responsibility",
    content:[
      {type:"p", text:"An e-collar is a communication tool, not a shortcut — and it's a physical device worn by your dog, so it deserves real care. Read this guide in full before Week 2, and come back to it any time you have a question."},

      {type:"h", text:"1. Proper Equipment"},
      {type:"p", text:"Use the exact e-collar listed in your equipment list — the E-Collar Technologies Mini Educator ET300, or the Micro Educator ME300 for smaller dogs. These are remote collars built for low-level, momentary communication, not shock devices meant to punish or startle. Don't substitute a bark collar, an invisible-fence collar, or an unfamiliar brand — the stimulation range and safety features are different, and every instruction in this program assumes the specific unit listed."},
      {type:"note", heading:"Before every session", items:["Check that the collar and remote are charged.","Inspect the contact points for damage, dirt, or corrosion.","Confirm the remote is set to the level you last used — don't guess."]},

      {type:"h", text:"2. Appropriate Fit"},
      {type:"p", text:"Fit determines whether the collar can communicate at all. Too loose = the contact points lose contact, so the dog doesn't feel anything consistently, and you end up over-correcting because you think the level isn't working. Too tight = discomfort and skin irritation over time."},
      {type:"ul", items:["The collar should sit high on the neck, just behind the ears — not down at the base of the neck.","You should be able to fit one to two fingers between the collar and the neck, snug but not tight.","The contact points should touch the skin without pressing hard enough to leave a mark within a few minutes.","Rotate the collar's position slightly and check the skin daily during active use — staying in one spot too long can irritate any dog's skin, regardless of level."],},
      {type:"note", heading:"Skin check", text:"If you see redness, swelling, or scabbing at the contact points, stop use right away and give the skin several days to fully recover before trying again. Irritation that persists or gets worse means a call to your vet, not something to push through."},

      {type:"h", text:"3. Appropriate Use"},
      {type:"p", text:"The e-collar shows up in Week 2, and only after your dog already knows the cue from leash pressure or a lure — the collar reinforces something the dog already understands, it doesn't teach the behavior from scratch. Find the level using the lowest-level method: start at the lowest setting and go up one level at a time until you see the first, subtlest response — an ear flick, a slight head turn. That subtle response, not a dramatic one, is the working level for that dog, right now, in that environment."},
      {type:"ul", items:["Always pair stimulation with the cue and leash guidance during introduction — your dog should never wonder what turned the pressure on or how to turn it off.","Stimulation turns off the instant the dog responds correctly. Timing matters more than level.","Working levels shift — by dog, by environment, even by the day. Recheck instead of assuming yesterday's level still applies.","DO NOT use the boost/nick function to \"get the dog's attention\" as a first step — that's a correction tool for a behavior the dog already knows cold, not a way to introduce anything."]},

      {type:"h", text:"4. Handler Instruction"},
      {type:"p", text:"You won't have a trainer standing next to you for this part, so getting it right is on you. Before your first e-collar session:"},
      {type:"ol", items:["Watch the E-Collar Intro video in full before your first session — don't skip ahead to the exercises.","Practice finding your dog's working level somewhere quiet, like inside your home, before you ever use the collar outdoors or around distractions.","Read this entire guide, including the sections below on when not to use the collar and how to recognize distress.","If your dog's response doesn't match what's described here, stop and reach out before continuing — see the Contact tab."]},

      {type:"h", text:"5. When NOT to Use the E-Collar"},
      {type:"warning", items:[
        "On a puppy — this program does not introduce the e-collar until the 6-Week (post-puppy) curriculum, for dogs 19+ weeks old.",
        "If your dog has a known bite history, severe anxiety, or a diagnosed behavioral condition, without first talking to a veterinary behaviorist or the appropriate licensed professional — this app is not a substitute for that evaluation.",
        "On a dog who is already fearful, overstimulated, or shutting down in the moment — address the underlying state first.",
        "As a punishment after the fact — the collar communicates in real time about a specific cue, never as a delayed consequence for something already finished.",
        "If you are frustrated, rushed, or not able to give the session your full attention.",
        "On or near medical conditions affecting the neck, throat, or skin in that area — check with your vet if you're unsure.",
      ]},

      {type:"h", text:"6. Signs Your Dog May Be Distressed"},
      {type:"p", text:"Done right, an e-collar produces a subtle, momentary response — not visible distress. Watch for these signs. They mean the level's too high, things moved too fast, or something else is off:"},
      {type:"table", title:"Common signals", headers:["Signal","What it can mean"], rows:[
        ["Yelping, crying out, or a large full-body flinch","Level is too high for this dog in this moment — stop and lower it"],
        ["Tail tucked, ears pinned back, body lowered","Dog may be anxious about the collar or the session generally"],
        ["Refusing to move, freezing, or trying to escape/hide","Stop the session — this is not a working state to train through"],
        ["Excessive lip licking, yawning, or panting when not hot/tired","Common stress signals — take a break and reassess"],
        ["Avoiding the collar itself (backing away when you bring it out)","The association has become negative — pause use and reassess your approach"],
      ]},
      {type:"note", heading:"None of these are supposed to happen", text:"These signs aren't a normal part of introducing the e-collar. If you see any of them, don't push through the session to \"finish the exercise\" — see the next section."},

      {type:"h", text:"7. When to Stop"},
      {type:"ul", items:["Stop the session immediately if you see any of the distress signs above.","Stop and lower the level if your dog's response to stimulation is more than a subtle flick or turn.","Stop for the day if your dog seems distracted, tired, unwell, or is having an off day — resume the next scheduled session rather than pushing through.","Stop and remove the collar if you notice any skin irritation at the contact points.","Stop and remove the collar if it isn't behaving the way it should — stimulation that doesn't turn off, a remote that isn't responding, or anything else that feels off with the unit.","Stop and contact our support line if you're not confident about what you're seeing, rather than guessing."]},
      {type:"warning", heading:"If the collar malfunctions", items:["Remove it immediately — don't try to troubleshoot mid-session.","Once it's off, check the batteries and contact points. That solves most issues.","If the problem continues, contact E-Collar Technologies directly to troubleshoot the unit — see the contact information included with your collar or on their website.","Don't resume training with a collar you're not sure is working correctly."]},
      {type:"note", heading:"Stopping is not failure", text:"Ending a session early to protect your dog's comfort and trust is part of doing this correctly, not a sign you or your dog are behind schedule."},

      {type:"h", text:"8. Appropriate Progression"},
      {type:"p", text:"Progression here is slow on purpose — each week builds on a skill your dog has already shown you they understand, instead of stacking new variables on top of each other."},
      {type:"ol", items:["Week 2 — non-motion cues only (Sit, Down, Place), low distraction, at the dog's found working level.","Week 3 — motion-based cues (walking, recall, thresholds) are introduced only once non-motion cues are solid.","Weeks 4–5 — distance and duration increase gradually; distraction level increases only after the dog is reliable at the current level.","Off-leash work — introduced only after the dog is consistently reliable on leash at the corresponding stimulation level; off-leash is a privilege earned by demonstrated reliability, not a fixed calendar date."],},
      {type:"note", heading:"One variable at a time", text:"If you increase distraction, don't also increase distance or duration in the same session. Change one thing, confirm your dog is still successful, then move to the next."},

      {type:"p", text:"If what you're seeing with your own dog doesn't match this guide, trust what's in front of you. Reach out for support instead of pushing through on schedule."},
    ],
  },
  equipmentList: {
    title:"Full Equipment List", subtitle:"Trainer-Recommended Gear",
    content:[
      {type:"p", text:"Everything below is the exact gear we recommend, organized by category. Tap any item to go straight to that product’s page. This same list lives in the Shop tab if you’d rather browse by category there."},
      {type:"h", text:"Collars & Leashes"},
      {type:"links", items:[{label:"Prong Collar – Herm Sprenger 2.25mm Training Collar",url:"https://amzn.to/4xRw4tf"},{label:"Prong Collar – Herm Sprenger Quick Release 2.25mm",url:"https://amzn.to/4qs9UeJ"},{label:"Prong Collar – Herm Sprenger 3mm Training Collar",url:"https://amzn.to/3UHFLMq"},{label:"Prong Collar – Herm Sprenger Extra Links 3mm",url:"https://amzn.to/3TYabKj"},{label:"Leash – Hands-Free (Pink)",url:"https://amzn.to/4gn9iCA"},{label:"Leash – Hands-Free (Blue)",url:"https://amzn.to/4gr3wzH"},{label:"Long Line – 20ft",url:"https://amzn.to/4gkSxrE"},{label:"Slip Lead",url:"https://amzn.to/4wIfCe3"}]},
      {type:"h", text:"E-Collars"},
      {type:"p", text:"Read the E-Collar Safety Guide in full before your first e-collar session — it covers fit, appropriate use, and when not to use it."},
      {type:"links", items:[{label:"E-Collar – Micro Educator ME300",url:"https://amzn.to/4c1UEzf"},{label:"E-Collar – Mini Educator ET300",url:"https://amzn.to/4cPCJvM"}]},
      {type:"h", text:"Treat Pouches"},
      {type:"links", items:[{label:"Treat Pouch – Fanny Pack",url:"https://amzn.to/4zp5dq9"},{label:"Treat Pouch – Magnetic",url:"https://amzn.to/4bYpitl"},{label:"Treat Pouch – Coastal Blue",url:"https://amzn.to/3UovkNK"},{label:"Treat Pouch – Silicone (2-Pack)",url:"https://amzn.to/4bU8lQM"}]},
      {type:"h", text:"Kennels & Crates"},
      {type:"links", items:[{label:"Kennel – Ruff Land Small",url:"https://www.rufflandkennels.com/products/small-kennel"},{label:"Kennel – Ruff Land Medium",url:"https://www.rufflandkennels.com/products/medium-kennel"},{label:"Kennel – Ruff Land Large",url:"https://www.rufflandkennels.com/products/large-kennel"},{label:"Kennel – Petmate Small 24\"",url:"https://www.amazon.com/dp/B00DJR9X2M?lv=shuf&linkCode=spc&asc_contentid=amzn1.ideas.3IPKBTHKRC8B9&tag=barkbossacade-20&domainId=influencer&channelId=500&plpRedirect=mhFallback&th=1"},{label:"Kennel – Petmate Medium 40\"",url:"https://amzn.to/4gFFsdE"},{label:"Kennel – Petmate 40\" Large",url:"https://amzn.to/4hKSQhD"},{label:"Kennel – Petmate Large 36\"",url:"https://amzn.to/4wJ3oll"},{label:"Kennel – Petmate XL 48\"",url:"https://amzn.to/4zMaWGP"},{label:"Kennel – MidWest iCrate Starter Kit 24\"",url:"https://amzn.to/4xMzyNv"},{label:"Kennel – MidWest iCrate Starter Kit 42\"",url:"https://amzn.to/46bLbBX"},{label:"Kennel – MidWest 30\" Medium iCrate",url:"https://amzn.to/4cPbK3u"},{label:"Kennel – MidWest 36\" Medium/Large iCrate",url:"https://amzn.to/3Skd9bu"},{label:"Kennel – MidWest 42\" Large iCrate",url:"https://amzn.to/4bYHp2d"}]},
      {type:"h", text:"Beds"},
      {type:"links", items:[{label:"Dog Bed – Elevated Coolaroo On-The-Go Foldable (Medium)",url:"https://amzn.to/4qtpyGz"},{label:"Dog Bed – Elevated Cooling Breathable (Large)",url:"https://amzn.to/3SNlrsx"},{label:"Dog Bed – Elevated Coolaroo (Large)",url:"https://amzn.to/4zzATJx"}]},
      {type:"h", text:"Toys & Enrichment"},
      {type:"links", items:[{label:"Bite Pillow Toy",url:"https://amzn.to/4gi0rTX"},{label:"Glow-in-the-Dark Soccer Ball with Straps",url:"https://amzn.to/4gtTT3s"},{label:"Treat-Dispensing Puzzle Toy",url:"https://amzn.to/4hJWtoa"},{label:"Treat-Dispensing Pineapple Toy",url:"https://amzn.to/45DggOJ"},{label:"Large Water Buffalo Horn Chew",url:"https://amzn.to/4hIZBkb"},{label:"Elk Antler Chew",url:"https://amzn.to/3SNlAfz"},{label:"Elk Antler Chew – Split Antler",url:"https://amzn.to/4xPmk2A"},{label:"Kong Natural Rubber Dental Chew Stuff-A-Ball",url:"https://amzn.to/4xPmk2A"},{label:"Kong Knot Bears (Small/Medium, 2-Pack)",url:"https://amzn.to/4wyLphf"},{label:"Kong Rubber Flying Disc Fetch Toy",url:"https://amzn.to/3SH2JTq"},{label:"Kong Tug Toy",url:"https://amzn.to/3UHH2mG"},{label:"Durable Rubber Bone",url:"https://amzn.to/4gGyrJx"}]},
      {type:"h", text:"Grooming & Care"},
      {type:"links", items:[{label:"Enzyme Odor Spray Cleaner – Nature's Miracle",url:"https://amzn.to/3SdiyRD"},{label:"Inflatable Dog Cone Collar",url:"https://amzn.to/4gl2CVr"},{label:"Deshedding Brush",url:"https://amzn.to/4hEK7gY"},{label:"Organic Lick-Safe Paw Balm",url:"https://amzn.to/4qxcOPu"},{label:"Liquid Bandaid for Dogs",url:"https://amzn.to/4wXhqQx"},{label:"Salmon Oil Supplement",url:"https://amzn.to/4xcyjYn"},{label:"Ear Cleaner – Doctor Beasley's Advanced Ear Bomb",url:"https://amzn.to/4gI0XKM"}]},
      {type:"h", text:"Travel & Car"},
      {type:"links", items:[{label:"Portable Water Bottle – PupFlask Stainless Steel",url:"https://amzn.to/46g5wG8"},{label:"Dog Seat Belt for Car",url:"https://amzn.to/4ztP02G"},{label:"Car First Aid Kit",url:"https://amzn.to/4qtVNpc"},{label:"Car Harness Seat Belt (Purple)",url:"https://amzn.to/4ztMiKD"},{label:"Car Harness Seat Belt (Black)",url:"https://amzn.to/4cSQmdJ"},{label:"Car Seat Belt Headrest Restraint Safety Leads (2-Pack)",url:"https://amzn.to/4gDjg3T"},{label:"Car Seat Harness (Black)",url:"https://amzn.to/4ijtlEk"}]},
      {type:"h", text:"Training Aids"},
      {type:"links", items:[{label:"Agility Cones – Multi-Colored (30-Pack)",url:"https://amzn.to/4hJw4qw"},{label:"Agility Cones – Orange (30-Pack)",url:"https://amzn.to/4wCLQqU"}]},
      {type:"h", text:"Feeding"},
      {type:"links", items:[{label:"Collapsible Dog Bowl",url:"https://amzn.to/4grmq9J"}]},
    ],
    mistakes:[],
  },
  threeDs: {
    title:"3 D's of Training", subtitle:"Duration - Distance - Distraction",
    content:[
      {type:"p", text:"As training progresses, difficulty increases through three key variables: Duration, Distance, and Distraction."},
      {type:"p", text:"These elements define how challenging a behavior becomes. When performance declines, one of these has typically been increased too quickly."},
      {type:"h", text:"Duration = Sustained Behavior"},
      {type:"p", text:"Refers to how long a behavior is maintained. Build gradually by increasing time in position, reinforcing calm, consistent follow-through."},
      {type:"h", text:"Distance = Handler Separation"},
      {type:"p", text:"Refers to how far the handler moves away while the behavior is maintained. Increase distance in small increments to preserve clarity and confidence."},
      {type:"h", text:"Distraction = Environmental Pressure"},
      {type:"p", text:"Refers to competing stimuli within the environment. Begin in low-distraction settings, then progressively introduce more complex environments as reliability improves."},
      {type:"note", heading:"Progression Principle", text:"Increase only one variable at a time. Maintain success by building gradually, ensuring the dog remains confident, responsive, and engaged in every phase of training."},
    ],
    mistakes:["Increasing duration, distance, and distractions all at once","Advancing difficulty before consistency is established","Training in high-distraction environments too soon"],
  },
  advocating: {
    title:"Advocating for Your Dog",
    content:[
      {type:"p", text:"\u2018What is my dog telling me right now, and how can I help the dog be successful?\u2019"},
      {type:"h", text:"What Does It Mean to Advocate for Your Dog?"},
      {type:"p", text:"Your dog depends on you to make good decisions for them. Advocating for your dog means recognizing when they need support, space, a break, or a change in the situation \u2014 even if other people don't understand why. Your job isn't to make your dog handle every situation, it's to help them be successful in every situation. Every time you recognize your dog's needs and respond appropriately before they decide they need to respond (reactivity and aggression), you strengthen their trust in you. Dogs learn best when they feel safe, understood, and supported."},
      {type:"h", text:"You Don't Owe Anyone Access to Your Dog"},
      {type:"p", text:"\u2018No\u2019 is a complete sentence when someone asks to pet your dog. Your dog's well-being is more important than a stranger's feelings. It is up to you to decide if your dog is ready to greet a stranger or if it will be more beneficial to politely decline and move on. A few phrases to use\u2026"},
      {type:"ul", items:["No, we are training today","Not today, thank you","No, we are working on staying focused","No, my dog is not friendly","No, thank you for asking","No"]},
      {type:"p", text:"You don't owe a stranger an explanation behind your no. Every interaction should benefit your dog, not a stranger."},
      {type:"h", text:"Not Every Dog Wants to Be Touched"},
      {type:"p", text:"Some dogs are naturally outgoing and social while other dogs may be tired, nervous, distracted, recovering from stress, or learning to stay calm in a busy environment. Never force your dog into an interaction because you feel embarrassed saying no."},
      {type:"h", text:"End Training Before Your Dog Is Done"},
      {type:"p", text:"One of the biggest mistakes owners make is training until the dog is done listening. Instead, finish while the dog is still engaged, focused, and having fun. If the dog begins to lose focus, wander away, shut down, or refuse treats, they are telling you they need a break. Stopping early is not quitting \u2014 it's smart training."},
      {type:"h", text:"Your Dog Doesn't Need to Push Through"},
      {type:"p", text:"Dogs don't learn effectively when they are overwhelmed. If the dog is scared, overexcited, frustrated, or exhausted they need help. Crossing the street to create space, leaving a busy area, or moving away from loud noises are all positive ways to advocate for the dog."},
      {type:"p", text:"Being an advocate doesn't mean avoiding challenges \u2014 it means choosing the challenges the dog is ready for. Trust is built one thoughtful decision at a time.", bold:true},
    ],
    mistakes:[],
  },
  aloneTime: {
    title:"Alone Time", subtitle:"Building Independence",
    content:[
      {type:"p", text:"Puppies are not born knowing how to be alone \u2014 this is a skill that must be taught. Introducing alone time early helps prevent separation-related stress and builds confidence when left by themselves."},
      {type:"h", text:"TO TEACH:"},
      {type:"ul", items:["Place the puppy in a kennel or playpen","Step away for a short period (1\u20135 minutes)","Return before the puppy becomes stressed","Gradually increase duration over time","Start small and build slowly","Multiple short sessions per day","Pair with natural downtime (naps, rest periods)","Use the kennel or playpen consistently, not just when you leave the house"]},
      {type:"h", text:"TIPS:"},
      {type:"ul", items:["Always return while the puppy is still calm","Keep arrivals and departures low-key","Avoid big greetings or emotional reactions","Create a safe, comfortable space for the puppy","Practice daily to build consistency","Duration: Slowly increase time alone","Distance: Start nearby, then leave the room, then the home","Distractions: slowly increase distractions so the puppy gets used to life going on around them while they remain calm"]},
      {type:"note", text:"If the puppy becomes vocal or stressed, shorten the duration / distractions and increase them slower."},
    ],
    mistakes:["Starting with too much time alone","Big greetings when returning","Inconsistent practice","Letting puppy out when whining or barking","Giving too much freedom too soon","Only practicing when leaving the house"],
  },
  biting: {
    title:"Biting & Nipping",
    content:[
      {type:"p", text:"Puppies explore with their mouth, similar to human babies. Biting is normal, not always aggressive, and most important: TEMPORARY. Never punish a puppy for biting, instead redirect with a desired behavior."},
      {type:"p", text:"Setting up for success = always having toys nearby, avoid wearing clothing the puppy enjoys engaging with, and always be prepared and expect biting (this keeps emotions calm during moments of biting/nipping). Tired puppies tend to bite more so give them plenty of time to rest and engage in calm behaviors."},
      {type:"h", text:"Redirection Can Look Different Depending on Each Situation:"},
      {type:"ul", items:["Puppy is tired = redirect to the kennel/playpen for nap time","Puppy is playful = redirect with a toy","Puppy is curious = redirect with chew toy or begin socializing session","Puppy is teething = redirect with engaging chew toy"]},
      {type:"p", text:"DO NOT\u2026 yell, hit, punish, or hold the puppy's mouth shut", bold:true},
      {type:"p", text:"The mouthy phase does not last forever \u2014 expect 3-4 months of biting which improves with consistent redirecting and teaching correct outlets for behavior. Removing attention is a powerful tool to clearly show the biting/nipping is unwanted."},
    ],
    mistakes:["Punishing instead of teaching","Not giving enough or enough variety of chews/toys for a biting outlet","Keeping the puppy awake for too long"],
  },
  calmness: {
    title:"Calmness & Settling",
    content:[
      {type:"p", text:"Calmness is a trained skill \u2014 this does not happen automatically for most puppies. While consistency is a very important factor with all puppy training, being consistent with rewarding calm is high on the priority list. Each time the puppy chooses to lay down quietly, reward them. Paying for desired behavior is the quickest way for a puppy to learn. Avoid chaotic environments if the puppy is fresh to the idea of settling/stillness."},
      {type:"p", text:"Generalizing in layers applies to teaching calm: start in a quiet environment and repeatedly reward calm, once the puppy begins to understand calm, start slowly increasing the distractions and duration. If the puppy begins to fail, back track to where the puppy succeeds and slowly start increasing the distractions and duration again. Go slow!"},
      {type:"h", text:"TO TEACH:"},
      {type:"ul", items:["Reward when the dog offers calm","Use place or tethering when the dog needs guidance","Gradually add duration and then distractions"]},
      {type:"note", heading:"How to Reinforce Calm in Real Life:", items:["Calm before meals","Calm during down time","Calm before greetings","Calm before exiting kennel","Calm before exiting front door","Do Nothing sessions"]},
      {type:"p", text:"Do Nothing sessions teach a dog they don't always need to be entertained or engaged. See the Do Nothing handout for step by step instructions.", bold:true, linkable:true},
    ],
    mistakes:["Accidentally rewarding excitement","Only practicing in high energy situations","Expecting too much too soon","Repeating cues"],
  },
  chewing: {
    title:"Chewing / Destruction",
    content:[
      {type:"p", text:"Chewing is a biological need NOT disobedience. The teething stage will be the height of the puppy's chewing needs. Teaching the puppy what is appropriate to chew should be done early on, giving consistent redirection to appropriate outlets."},
      {type:"h", text:"TIPS FOR SUCCESS:"},
      {type:"ul", items:["Provide access to 3-5 different chew options","Rotate items to create novelty","Interrupt inappropriate chewing and redirect to appropriate chew items","'Puppy proof' the home to avoid disaster","Evaluate supervision if the puppy is consistently chewing unapproved items","Play with texture: rubber, fabric, edible, etc.","If the puppy is overtired or overstimulated, utilize kennel/playpen to avoid frustration for the handler and the puppy"]},
    ],
    mistakes:["Assuming destruction was disobedience","Expecting the puppy to know what to chew","Leaving forbidden items out","Allowing free roaming with zero supervision","Only providing one chew option and expecting satisfaction from the puppy","Punishing instead of redirecting"],
  },
  doNothing: {
    title:"Do Nothing",
    content:[
      {type:"h", text:"Goal:"},
      {type:"p", text:"Teach your dog the valuable skill of relaxing without needing constant entertainment or direction. \"Do Nothing\" helps develop calmness, patience, emotional regulation, and the ability to settle. Like any training exercise, this skill should be taught first in an easy environment before gradually practicing it in more challenging locations."},
      {type:"h", text:"To Teach:"},
      {type:"ul", items:["Start inside your home in a quiet, distraction-free area.","Put your dog on a leash and sit in a chair.","Hold the leash with enough slack for your dog to comfortably stand, sit, turn around, or lie down without wandering away.","Do not give commands, talk to, pet, or entertain your dog.","Ignore whining, barking, pacing, or attempts to get your attention. Simply remain calm and wait.","Allow your dog to work through the environment and discover that nothing is expected of them.","End the session once your dog is able to settle and relax consistently.","Practice several short sessions indoors until your dog quickly understands how to settle."]},
      {type:"h", text:"Generalize in Layers:"},
      {type:"p", text:"Once your dog can successfully relax indoors, begin practicing in slightly more distracting environments. Examples include:"},
      {type:"ul", items:["Backyard","Front porch","Quiet neighborhood park","Outside a coffee shop","Pet-friendly stores","Sporting events or busier public places"]},
      {type:"p", text:"Only increase the difficulty when your dog is successful at the current level. If your dog struggles to settle, move back to an easier environment and build up again gradually."},
      {type:"h", text:"Remember:"},
      {type:"p", text:"The goal isn't to make your dog tired \u2014 it's to teach them how to relax. By teaching the skill first and then gradually introducing new locations and distractions, your dog learns to remain calm no matter where they are. Consistent practice builds a dog that is more focused, confident, and enjoyable to live with."},
    ],
    mistakes:["Not waiting for calm before ending the session","Using \"Do Nothing\" to tire your dog out","Expecting instant results","Moving too quickly to harder locations","Talking to or correcting your dog"],
  },
  dogNeutrality: {
    title:"Dog Neutrality",
    content:[
      {type:"p", text:"The goal: To teach the puppy that other dogs are part of the environment, not something they must run to play with, bark at, or worry about."},
      {type:"h", text:"What a Well Socialized Dog Looks Like:"},
      {type:"ul", items:["Can calmly walk past other dogs without pulling","Remains focused on the handler","Relaxed when other dogs are around","Ignores other dogs when asked"]},
      {type:"p", text:"The most neutral dogs are the ones who learn seeing another dog is completely normal."},
      {type:"p", text:"A puppy should not meet every dog they see \u2014 this teaches the puppy to pull towards other dogs, whining/frustration when the puppy can't greet, barking/lunging out of frustration, difficulty focusing on the handler, or overexcitement whenever a dog appears. Reactivity is not always aggression or dislike towards other dogs; sometimes the behavior is frustration when they can't reach other dogs."},
      {type:"h", text:"To Teach:"},
      {type:"ul", items:["Start with enough distance for the puppy to notice other dogs but can still react to their name, take treats, and stay relaxed. If the puppy is unable to do those things, move further away from the other dog.","Let the puppy observe \u2014 watching another dog is not bad, curiosity is healthy.","Reward calm choices. This may look like: the puppy looking at the handler, the puppy is relaxed, sits calmly, sniffs the ground, continues walking calmly. Mark with 'Yes!' and reward immediately.","Move on. Do not linger allowing frustration to build \u2014 after a few successful moments continue walking. Many short positive experiences build neutrality and confidence much faster than one long interaction."]},
    ],
    mistakes:["Visiting dog parks","Allowing on leash greetings with every dog","Walking directly at unfamiliar dogs","Tightening the leash when another dog appears","Waiting for the puppy to react before creating distance","Thinking the puppy needs a dog friend"],
  },
  fieldtrips: {
    title:"Park & Store Visits / Field Trips",
    content:[
      {type:"p", text:"Goal: Show the puppy the world is safe, calm, and nothing the puppy sees requires a reaction or investigation."},
      {type:"h", text:"What a Well Socialized Puppy Looks Like:"},
      {type:"ul", items:["Staying calm around people, dogs, large moving objects, loud noises, new environments, etc.","Quick recovery from surprises","Focus on the handler around exciting moments","Confidence exploring new spaces","Observing the world without feeling the need to bark, pull, jump, or greet everything"]},
      {type:"p", text:"Keep trips short \u2014 for young puppies 5-15 minutes is plenty of time, and end while the puppy is still happy and engaged. Several shorter trips over the week is more impactful than 1 long outing."},
      {type:"h", text:"Choose Quiet Locations Before Busy Ones Such As:"},
      {type:"p", text:"Neighborhood parks, school yard after hours, pet friendly farm stores, quiet walking trails. As the puppy gains confidence, slowly introduce busier areas such as hardware stores, outdoor patios, outdoor shopping centers, garden centers, etc."},
      {type:"p", text:"Remember this outing is not just a walk for exercise \u2014 this is allowing the puppy to experience the world. Allow the puppy to look around, sniff, listen to new sounds, and explore at a pace comfortable to the puppy."},
      {type:"h", text:"When to Reward the Puppy:"},
      {type:"ul", items:["Looking at the handler","Choosing handler over distractions","Sitting quietly","Calmly watching the environment","Ignoring distractions","Relaxing in the space","Recovering after surprises"]},
      {type:"p", text:"Any behavior you want to see grow.", bold:true},
      {type:"p", text:"A successful trip is when the puppy felt safe, explored confidently, made good choices, and had a positive experience."},
    ],
    mistakes:["Visiting dog parks","Forcing the puppy to approach something scary","Letting humans and dogs greet the puppy","Staying for too long","Expecting the puppy to ignore all distractions on the first outing"],
  },
  handling: {
    title:"Handling / Grooming Desensitizing",
    content:[
      {type:"p", text:"Puppies must get used to being touched and handled; this prepares for successful vet visits, grooming appointments, and daily life (collars, leashes, weather specific gear, etc.). The goal is for the puppy to be comfortable being touched all over and remain calm."},
      {type:"p", text:"Being handled should be viewed as a positive experience. Sessions should be kept short and positive. All areas matter: individual paws, ears, mouth, tail, body. Make grooming a rewarding game to keep the puppy engaged and willing. Comfort and trust is the goal, not just tolerance. Doing a little every day is far more effective than long occasional sessions."},
      {type:"p", text:"Listed below is a progression guide to follow along with the 12 week puppy program."},
      {type:"h", text:"Weeks 1 & 2 \u2014 Comfortability with basic body handling, brief paw, ear, and tail touches"},
      {type:"ul", items:["Touch and immediately pair with 'yes' and food.","Keep sessions 1-2 minutes, 2-3 times per day.","Work the puppy when they are calm \u2014 the puppy should remain calm during each session.","If the puppy begins pulling away, scale back the touch and increase reward."]},
      {type:"h", text:"Weeks 3 & 4 \u2014 Increasing tolerance to longer handling"},
      {type:"ul", items:["Hold paws for 1-2 seconds, lift ear flaps, lift lips to look at teeth, 1-2 seconds of brief restraint.","Gradually increase duration before rewarding.","Continue pairing each touch with food.","Sessions should be short and positive \u2014 always start sessions with a calm puppy."]},
      {type:"h", text:"Weeks 5 & 6 \u2014 Introduce grooming tools without pressure"},
      {type:"ul", items:["Brush touching body, nail clippers touching paw, ear wipes/cotton ball, gentle collar handling. Allow puppy to approach and sniff/investigate tools before touching them.","Touch tool to puppy, mark 'yes', and reward.","Begin to simulate grooming without doing full procedures."]},
      {type:"h", text:"Weeks 7 & 8 \u2014 Fully introduce grooming motions"},
      {type:"ul", items:["Lightly brush, hold paw and touch nail with clippers, handle ears and mouth for longer duration, longer restraint (3-5 seconds).","Introduce grooming sequences: hold paw then open/close nail clippers and touch paw, slight restraint then touch brush to tail, gently lift each leg while puppy is standing."]},
      {type:"h", text:"Weeks 9 & 10 \u2014 Grooming tasks in small doses"},
      {type:"ul", items:["Trim 1-2 nails at a time.","Short brushing sessions, gentle ear cleanings, slightly longer restraint."]},
      {type:"h", text:"Weeks 11 & 12 \u2014 Generalizing skills"},
      {type:"ul", items:["Practice in new environments.","Allow trusted adults to lightly handle puppy.","Longer grooming sessions.","Combine multiple steps (ear cleaning and trim 1-4 nails)."]},
    ],
    mistakes:["Forcing the puppy to deal with it","Skipping areas that are more difficult for the puppy to tolerate, only practicing when grooming is necessary","Ignoring uncomfortable body language","Forcing the puppy to be handled when they are in a playful or tired mood"],
  },
  impulseControl: {
    title:"Impulse Control",
    content:[
      {type:"p", text:"A puppy does not come with built in patience \u2014 this is an important skill taught early on. Patience and self-control spill into every situation/experience. Jumping, barking, and lunging are examples of a lack of impulse control."},
      {type:"h", text:"TO TEACH:"},
      {type:"ul", items:["Start small and reward calm behavior consistently","Reinforce through structured exercises (place, leash work, recall)","Begin in calm environments with low distractions","Ask for a sit before a food bowl is set down or to go to place when a guest comes to the door/doorbell is rung","Wait for calm before giving a toy","Pause at doorways \u2014 the puppy will learn being calm gets them what they want","Short durations to begin and slowly increase time (1-2 seconds to start)","Gradually increase distractions"]},
      {type:"p", text:"Constantly re-evaluate handler expectations. Control is built through consistent repetitions. This also allows a puppy to learn how to manage their emotions \u2014 when they see familiar people and become excited, instead of jumping they know to stay calm to be able to greet."},
    ],
    mistakes:["Teaching in high-distraction environments too early","Reinforcing the wrong behavior accidentally \u2014 don't give attention to barking, whining, or jumping","Inconsistency with rules \u2014 this creates confusion, whereas impulse control relies heavily on predictable patterns"],
  },
  leashPressure: {
    title:"Intro to Leash Pressure",
    content:[
      {type:"p", text:"Introducing leash pressure to a puppy can feel overwhelming. With new sights, sounds, and smells, it's unrealistic to expect a puppy to stay close and focused right away. Strong leash skills begin in low-distraction environments to set the puppy up for success."},
      {type:"p", text:"Start inside the home \u2014 such as a living room \u2014 where the environment is familiar and comfortable. Before going on walks, the puppy should first understand leash pressure."},
      {type:"p", text:"With the leash on, apply gentle, steady pressure. The moment the puppy moves toward the pressure, mark with \"yes\" and reward. This teaches that moving with the leash turns the pressure off. Over time, this builds a habit of following pressure rather than resisting it."},
      {type:"p", text:"Once there is a clear understanding of leash pressure indoors, move to the backyard. Each new environment increases difficulty, so expectations should be adjusted accordingly. Continue applying light leash pressure and rewarding movement toward it."},
      {type:"p", text:"When the same level of understanding is shown in the backyard, progress to the front yard. From there, gradually expand to a few houses in either direction, then one side of the street, and continue building toward longer walks in more distracting environments."},
      {type:"p", text:"Progress gradually and avoid advancing environments until consistency is shown at the current level."},
      {type:"h", text:"TO TEACH:"},
      {type:"ul", items:["Introduce leash exposure gradually with short sessions","Reward calm behavior while on leash","Reinforce voluntary following behavior","Reward movement toward leash pressure","Increase distractions slowly over time"]},
    ],
    mistakes:["Yanking the puppy","Dragging the puppy instead of letting them follow the pressure","Inconsistent leash rules (sometimes allowing the puppy to pull)"],
  },
  chooseKennel: {
    title:"Choosing a Kennel",
    content:[
      {type:"h", text:"Goal:"},
      {type:"p", text:"A kennel should provide your dog with a safe, comfortable place to rest while helping with potty training, management, travel, and learning to settle."},
      {type:"p", text:"Choose a kennel that allows your dog to stand, turn around, lie down, and stretch comfortably, but avoid giving puppies more space than they need."},
      {type:"h", text:"What to Look For:"},
      {type:"ul", items:["Puppies can use a larger kennel with a divider as they grow.","Choose secure doors and latches.","Consider your dog's chewing, scratching, and escape habits.","Introduce the kennel gradually and make it a positive place\u2014not a punishment.","For travel, choose a kennel designed for safe transportation."]},
      {type:"h", text:"Our Recommendations:"},
      {type:"p", text:"\ud83e\udd47 Ruff Land \u2014 Best Overall", bold:true, linkable:false},
      {type:"p", text:"Our favorite for most dogs, especially chewers, destructive dogs, and escape artists. The molded construction is extremely durable and eliminates many exposed bars that dogs can damage.", linkable:false},
      {type:"p", text:"\ud83d\udcb0 On a Budget? Buy Used!", bold:true, linkable:false},
      {type:"p", text:"Ruff Land kennels are an investment. Check Facebook Marketplace and local classifieds for used kennels. They are durable enough that you can often find them in great condition for much less than buying new.", linkable:false},
      {type:"p", text:"\ud83d\udc36 Puppies & Dogs Comfortable in Wire Crates", bold:true, linkable:false},
      {type:"p", text:"A quality wire crate with a divider is an affordable option for puppies. We recommend a double-door crate when possible. The MidWest iCrate is a popular budget-friendly choice, but it is not our first choice for determined escape artists.", linkable:false},
      {type:"p", text:"\ud83c\udfe0 Hard-Sided Budget Option", bold:true, linkable:false},
      {type:"p", text:"The Petmate Vari Kennel is a good affordable alternative for families who prefer a hard-sided kennel.", linkable:false},
      {type:"note", heading:"Important:", text:"If your dog chews, bends wire, panics, or repeatedly tries to escape, choose a more durable kennel. A kennel that allows your dog to injure themselves trying to escape is not a good fit."},
      {type:"p", text:"Remember: The goal isn't simply to contain your dog\u2014it's to create a safe place where your dog can relax and settle. Choose the kennel based on your individual dog's needs, and ask your Guiding Paw trainer if you're unsure which option is best.", bold:true, linkable:false},
    ],
    mistakes:["Choosing a kennel that is too large or too small","Using an inexpensive wire crate for an escape artist","Giving puppies too much space too soon","Using the kennel as punishment","Increasing kennel time too quickly","Leaving unsafe items inside the kennel","Assuming any kennel is \"escape-proof\""],
  },
  kennelTraining: {
    title:"Kennel Training",
    content:[
      {type:"p", text:"Puppies do not know how to exist alone. They spent the first few weeks of their life existing with their mom and litter mates. This means the puppy now needs to start learning how to be alone when they leave their mom and litter mates. A small amount of whining is not manipulation \u2014 it is normal. Kennel time should always be viewed as a positive space."},
      {type:"p", text:"A puppy should not start out spending 6+ hours in the kennel with their handler away from the home \u2014 this will create anxiety about the kennel since all the data points to kennel = handler gone. To start, practice for 5 minutes, gradually moving up to 1+ hour. Kennel training should be done when the puppy is calm, not when the puppy is tired or overstimulated. The kennel should be used as the nap zone; the kennel may also be where the puppy receives chews like an antler or other interactive toys (the puppy should not be left with any toy that could be destroyed and ingested). Practice a lot of short departures from the room and the home."},
      {type:"p", text:"If there is hesitation or distress, take a few steps back for a few sessions and then slowly begin progressing again. Allowing the puppy to 'cry it out' is not an effective system for kennel training. The whining is a cue to step back and work within the puppy's current threshold."},
      {type:"h", text:"TO TEACH:"},
      {type:"ul", items:["Toss kibble into the kennel for the puppy to retrieve","Once the puppy enters the kennel, mark 'yes' and reward as the puppy exits","As the puppy becomes comfortable existing in the kennel, introduce shutting/opening the door","Increase duration with kennel door open and with the door shut","With increased duration, begin leaving the room for a few seconds and returning","Stay out of the room for longer periods of time","With the puppy in the kennel, leave the room and also the home for a few seconds","Stay out of the home for longer periods of time","Always have the dog 'wait' before leaving and always release from the kennel with the 'free' cue"]},
    ],
    mistakes:["Allowing the puppy to cry it out","Moving through the steps too quickly","Not practicing leaving the room","Only using the kennel when leaving the house for long periods","Expecting an instant understanding for calm behavior"],
  },
  leashGames: {
    title:"Loose Leash Walking / Leash Games",
    content:[
      {type:"h", text:"Walk Warm Up \u2014 Leash Games:"},
      {type:"p", text:"Create focus and connection prior to walks through unpredictable, purposeful movement patterns \u2014 directional changes, figure 8s, box drills, U-turns, pace shifts, and controlled stops \u2014 transforming the walk into a structured engagement exercise. This sets clear expectations and reinforces a consistent follow-the-leader mindset. Be unpredictable with your movement and keep sessions short and engaging."},
      {type:"h", text:"Loose Leash Walking \u2014 'With Me':"},
      {type:"p", text:"Prevents pulling, creates stress-free enjoyable walks, and builds engagement and focus."},
      {type:"h", text:"Tools Needed:"},
      {type:"ul", items:["Prong collar & 4-6 ft. leash OR slip lead","Treat pouch with kibble or preferred reward","E-Collar (AFTER week 3 of the core program)"]},
      {type:"h", text:"How to Teach:"},
      {type:"ul", items:["Reward the dog for walking near the handler's side","Stop walking when the dog crosses the acceptable walking zone","Change directions frequently to encourage focus (be very unpredictable)","Begin each walk with a warm up"]},
      {type:"h", text:"E-Collar (After Week 3 of the Core Program):"},
      {type:"p", text:"Establish clear spatial boundaries within the walk. Define the acceptable walking zone and hold the dog accountable for maintaining position. If the dog moves too far ahead, stop movement, apply leash pressure or stimulation, and step backward to guide re-engagement. Release pressure/stimulation as the dog returns to position, reinforcing awareness and handler focus throughout the walk."},
    ],
    mistakes:["Allowing the dog to pull sometimes and not other times","Using constant tension on the leash","Not rewarding desired behavior"],
  },
  markerWords: {
    title:"Marker Words",
    content:[
      {type:"p", text:"Marker words clearly communicate with a dog, defining when a behavior is correct, should continue, should stop, or is finished. Consistency with marker words builds clarity and speeds up learning."},
      {type:"h", text:"YES = Food Is Coming"},
      {type:"p", text:"\"YES\" is a positive marker that means food is on the way."},
      {type:"ul", items:["Say \"yes\" and immediately give food/treat","No behavior is required at first \u2014 this is about building meaning","The goal: the dog hears \"yes\" and expects a reward every time"]},
      {type:"h", text:"GOOD = Continue Behavior"},
      {type:"p", text:"\"GOOD\" tells the dog they are doing the right thing and should continue the behavior."},
      {type:"ul", items:["Use during a behavior you want to maintain (sit, down, walking calmly, etc.)","Sandwich between a \"Yes\" marker to continue without constant food rewards, which helps build duration"]},
      {type:"h", text:"NO = Stop Behavior"},
      {type:"p", text:"\"NO\" communicates that the current behavior should stop."},
      {type:"ul", items:["Keep the tone neutral \u2014 not harsh or emotional","The moment the behavior stops, follow with a positive","Always show the dog what to do instead"]},
      {type:"h", text:"FREE = Release"},
      {type:"p", text:"\"FREE\" releases the dog from a behavior."},
      {type:"ul", items:["Marks the end of an expectation (sit, place, leash position, etc.)","Teaches the dog the behavior is temporary and has a clear end"]},
      {type:"h", text:"Guidelines for Success"},
      {type:"ol", items:["Be consistent with each word's meaning","Timing matters \u2014 mark the behavior as it happens","Always follow \"yes\" with food/treat","Keep voice clear and unemotional"]},
    ],
    mistakes:["Not rewarding with food/treat after \"Yes\"","Poor timing \u2014 marking too early or too late confuses the dog","Using markers inconsistently","Forgetting to release \"Free\"","Repeating markers more than once reduces clarity"],
  },
  nameGame: {
    title:"Name Game",
    content:[
      {type:"p", text:"Goal: The puppy reliably comes when their name is called \u2014 anywhere, by anyone in the home."},
      {type:"p", text:"The name game builds the foundation for communication."},
      {type:"h", text:"TO TEACH:"},
      {type:"ul", items:["Say the puppy's name once in a clear, upbeat tone","When the puppy gets to you, mark \"yes!\" and immediately reward","Start at close distances to set the puppy up for success","Keep sessions short and positive","All household members should practice (individually and together)","Start close, gradually increase distance","Gradually increase distractions: Indoors \u2192 backyard \u2192 front yard \u2192 walks"]},
    ],
    mistakes:["Repeating name more than once","Not rewarding immediately","Not practicing with everyone in the household","Increasing distance and distractions too quickly"],
  },
  offLeash: {
    title:"Off-Leash",
    content:[
      {type:"p", text:"There is no timeline for off-leash readiness; progression is based on demonstrated consistent reliability. Reinforce all correct decisions, including voluntary check-ins, to strengthen engagement. True off-leash success is built on relationship, trust, and the dog's desire to stay connected \u2014 not control alone."},
      {type:"p", text:"Begin in highly familiar, low-risk environments where success has already been established. To start, use a long line to allow freedom while maintaining control \u2014 if responsiveness is inconsistent with the long line dragging, more on-leash work is required before progressing."},
      {type:"p", text:"Use a fenced area like a backyard, tennis court, or baseball diamond to safely build off-leash reliability to start. Start with a long line, then remove it as consistency improves. Focus on recalls and check-ins to ensure freedom still means staying engaged."},
      {type:"h", text:"How to Teach:"},
      {type:"ul", items:["Only begin when the dog has very strong, consistent, reliable recall","Always begin sessions with the dog on a long line","Practice in secure (fenced), low distraction environments"]},
    ],
    mistakes:["Allowing the dog to be off leash with unreliable on leash recall","Introducing heavy distractions too soon"],
  },
  pottyTraining: {
    title:"Potty Training",
    content:[
      {type:"h", text:"Goal: Build Habits and Prevent Accidents"},
      {type:"p", text:"Puppies lack bladder control and they don't automatically understand where they should go. Accidents are not an act of defiance, rather a management issue. The overarching goal is a puppy who consistently goes potty outside. A great way to figure out potty breaks is to take the puppy out after each activity change. This means the puppy wakes up and goes potty; plays, then goes potty; eats, then goes potty. While outside a leash is a great tool to manage distraction levels. Tracking each time the puppy goes potty will show patterns and highlight any management issues. There should be zero unsupervised roaming inside the house. REMEMBER: If an accident occurs, calmly interrupt if the puppy is caught mid accident; if the accident was not witnessed, do not correct as this will confuse and scare the puppy. Calmly take the puppy outside for an opportunity to finish going potty."},
      {type:"p", text:"Do not punish potty accidents found inside. Punishing confuses the puppy, especially if the accident did not happen in real time. Set 30, 45, or 60 minute timers depending on the puppy's bladder control \u2014 timers are great reminders for the handler. No food/water 2 hours before bed. Younger puppies require 1-2 potty breaks throughout the night to avoid accidents in the kennel. The late night wake ups will not last forever; this is a short period until the puppy learns/develops longer bladder control. If persistent indoor accidents occur, evaluate the potty training schedule and supervision. The risk of indoor accidents is significantly reduced when the puppy is supervised 100% of the time."},
      {type:"h", text:"What to Do If the Puppy Won't Go Potty When Taken Outside?"},
      {type:"p", text:"Remain calm \u2014 showing frustration only causes negative feelings towards being outside for the puppy. Go for a short walk or take the puppy to their designated potty spot. If the puppy still does not go potty, go inside and set a 5-10 minute timer; when the timer goes off, take the puppy outside again for a short period of time. Continue this cycle until they go potty outside and immediately mark and reward the behavior."},
      {type:"h", text:"TO TEACH:"},
      {type:"ul", items:["Take the puppy outside frequently, utilizing timers if necessary","Walk the puppy to the same spot each time","After the puppy eliminates, always mark \"yes\" and reward immediately","Continue with 100% supervision inside"]},
    ],
    mistakes:["Waiting too long between potty breaks","Punishing accidents","Allowing free roaming \u2014 not supervising 100% of the time","Not rewarding for going potty outside","Not sticking to a consistent routine"],
  },
  dailyStructure: {
    title:"Daily Structure", subtitle:"Early/Long Term Success",
    content:[
      {type:"p", text:"Puppies thrive on consistency and predictability. Daily structure allows a puppy to learn the world with clear boundaries. Training extends to life beyond formal sessions. Consistent, everyday structure prevents unwanted behaviors and reinforces clear expectations. Puppies thrive when rules, boundaries, and communication remain consistent, creating calm, confident, and respectful behavior in daily life."},
      {type:"p", text:"Puppies should never be free to roam \u2014 this allows for poor decision making. If the puppy cannot be on a leash they should be in their kennel or play pen. 100% supervision gives little room for the puppy to guess what they should be doing, thus minimizing undesired behaviors (nipping, potty accidents, etc.). Aim for 1-2 hours awake depending on their age and amount of awake activity, then 2-3 hours of calm in the kennel or playpen. The playpen is a great supervision tool but should never fully replace kennel time."},
      {type:"h", text:"Daily Schedule:"},
      {type:"ul", items:["Wake up - Potty","Eat - Potty","Play/Train - Potty","Nap (kennel/playpen) - Potty","REPEAT"]},
      {type:"note", text:"Remember this is a predictable cycle."},
    ],
    mistakes:["Too much freedom early on","Keeping the puppy awake for too long","Not sticking to a consistent schedule"],
  },
  puppyDevelopment: {
    title:"Puppy Development", subtitle:"Development / Behavior Expectations",
    content:[
      {type:"p", text:"Puppies have developing brains with no impulse control, short attention spans, and biological needs often deemed as bad behavior. A puppy does not develop in a straight line \u2014 this will come in waves. Do not expect perfection at each stage. The handler's responsibility is to guide the puppy through each stage, helping shape, teach, and redirect behaviors. With a very young puppy, the handler may expect a very short attention span, an easily exhausted puppy, and a puppy who shows nervousness towards mundane things. Effort early on creates an easier life later on. Puppyhood is not long lasting and with consistent effort does not need to be a stressful or frustrating period."},
      {type:"p", text:"These stages are key to understanding behavior and troubleshooting:"},
      {type:"ul", items:["Biting = tired/overstimulated","Not listening = confused","Mistakes = too much freedom","Biting/chewing = teething","Easily distracted = short attention span","Potty accidents = unclear on where to go","Fear/nervousness = lack of socializing / is a natural stage"]},
      {type:"p", text:"Most puppies are re-homed by the adolescence stage \u2014 this is the stage where the puppy may begin testing limits, have increased energy, and ignore cues. Do not assume at any age a puppy is 'fully trained,' as this will set the handler up for frustration and failure.", bold:true},
      {type:"h", text:"Developmental Stages:"},
      {type:"ul", items:["Neonatal (0-2 Weeks) \u2014 Helpless & Dependent","Transitional (2-3 Weeks) \u2014 Eyes Open, Starting to Explore","Socialization (3-12 Weeks) \u2014 Critical Learning & Social Skills","First Fear Period (8-11 Weeks) \u2014 Sudden Fear of New Things","Juvenile (3-6 Months) \u2014 Teething & Testing Limits","Adolescence (6-18 Months) \u2014 Rebellious & Independent","Second Fear Period (6-14 Months) \u2014 New Fears Resurface","Maturity (1-3 Years) \u2014 Calmer & More Settled"]},
    ],
    mistakes:["Assuming behavior is random","Reacting emotionally to normal behaviors","Not tracking behavior patterns","Assuming the puppy will be well-behaved after maturity with no early prevention","Waiting to begin management skills"],
  },
  generalizing: {
    title:"Puppy Generalizing",
    content:[
      {type:"p", text:"Puppies do not automatically apply their learning to each new situation/place. Sitting in the kitchen, in the yard, and at the park can feel like completely different behaviors to a puppy. Generalizing means teaching the puppy a cue (for example: sit) means the same thing in all environments, with any distraction, and in different emotional states. Generalizing may feel difficult because a puppy learns through context (where they are), the environment (sights, sounds, smells), and their emotional state (calm, excited, tired). When any of those variables change, the behavior can fall apart."},
      {type:"h", text:"Think of Teaching in Layers:"},
      {type:"ol", items:["Environment \u2014 Living room \u2192 backyard \u2192 sidewalk \u2192 park \u2192 store","Distractions \u2014 Quiet \u2192 noise \u2192 people \u2192 dogs \u2192 chaos","Distance \u2014 Far away and gradually move closer","Duration \u2014 1 second \u2192 5 seconds \u2192 30 seconds \u2192 1-2 minutes \u2192 10+ minutes"]},
      {type:"h", text:"Generalizing a Cue in Layers:"},
      {type:"ul", items:["The living room with a neutral environment","New room with slightly bigger distractions (people, noises)","Backyard","Sidewalk","Parking lots","Quiet corner of the park","Slightly busier area of the park","Quiet aisle of a dog friendly store","Entrance to a dog friendly store"]},
      {type:"p", text:"This process restarts with each cue taught to the puppy. Do not assume generalizing 'sit' with layers carries over to generalizing 'down'. If the process feels unsuccessful, evaluate: is the puppy overwhelmed, were too many layers skipped, was the reward valuable enough, are expectations adjusted to the new environment. Success is created through gradual exposure, clear structure, and consistent reinforcement."},
    ],
    mistakes:["Assuming learned once = learned everywhere","Changing too many things at once","Not using better rewards in harder situations","Repeating cues","Ending sessions after failure","Forgetting generalizing is lifelong"],
  },
  recallChaseMe: {
    title:"Recall - Chase Me",
    content:[
      {type:"p", text:"The Chase Me game builds engagement and works towards a fast and enthusiastic recall by making coming to you fun and rewarding."},
      {type:"h", text:"To Play:"},
      {type:"ul", items:["Say the puppy's name in a happy and excited tone \u2014 keep it playful and engaging","Immediately move away (walk or run backward)","When the puppy chases you, mark \"yes!\" and reward immediately","All household members should practice"]},
      {type:"h", text:"Tips:"},
      {type:"ul", items:["Always have the puppy chase you, not the other way around \u2014 DO NOT chase the puppy","Keep energy and voice tone high and positive","Start in low-distraction environments, work indoors in a familiar room, gradually transition to outside","Distance: Start close, increase gradually","Distractions: Indoors \u2192 backyard \u2192 front yard \u2192 gradually increase distractions"]},
    ],
    mistakes:["Chasing the puppy \u2014 accidentally reinforcing that running away is fun","Standing still after saying the puppy's name \u2014 movement motivates the puppy to follow","Having low or neutral energy","Repeating name \u2014 say it once","Making it too difficult too quickly"],
  },
  recallHere: {
    title:"Recall - Here",
    content:[
      {type:"h", text:"Tools Needed:"},
      {type:"ul", items:["Long leash (20 foot minimum)","Prong collar","E-Collar (AFTER week 3 of the core program)","Treat pouch filled with kibble or high value reward","Toy (to reward with play or use as a distraction)"]},
      {type:"h", text:"Leash Pressure"},
      {type:"p", text:"Begin in a low distraction environment. Call the dog by saying their name followed by 'here' once. Move backwards, pulling the leash in the same direction, encouraging the dog to move towards you. Once the dog has arrived, cue the dog into a sit, mark with 'yes' and reward (treats, praise, play). Release the dog away and repeat recall, practicing 10-15 times per training session. If the dog doesn't come all the way to you, stops before getting to you, or gets distracted, take a few steps backwards while at the same time saying the cue \"here\" again and pulling the leash in the same direction as you moved until they are in position, then mark with 'yes' and reward."},
      {type:"h", text:"E-Collar (After Week 3 of the Core Program)"},
      {type:"p", text:"Give the cue \"Here,\" then create space by quickly stepping backward to invite directional engagement. Maintain consistent e-collar stimulation until the dog commits to coming; release pressure the moment the correct decision is made and continue to guide the dog with the leash all the way into position. This builds a fast, confident, and complete recall."},
      {type:"p", text:"Keep consistency by practicing daily with short training sessions. Once the dog shows 80% proficiency with minimal distractions, slowly increase distractions, distance, and different environments (parks, in public, etc.)."},
    ],
    mistakes:["Repeating cue multiple times","Only calling the dog for negative events (crate, bath, leaving fun)","Not rewarding every recall","Introducing heavy distractions before 80% proficiency"],
  },
  sitStayDownStay: {
    title:"Sit-Stay & Down-Stay",
    content:[
      {type:"h", text:"Sit with Implied Stay \u2014 How to Teach:"},
      {type:"ul", items:["Say \"sit\" cue (if the concept is new to the dog, begin with a food lure \u2014 don't name it until the behavior is understood with the food lure first)","Pause before rewarding","Mark 'yes' and reward","Release after reward","Gradually increase duration before the release cue","Gradually increase distractions before the release cue"]},
      {type:"h", text:"Down with Implied Stay \u2014 How to Teach:"},
      {type:"ul", items:["Say \"down\" cue (if the concept is new to the dog, begin with a food lure \u2014 don't name it until the behavior is understood with the food lure first)","Pause before rewarding","Mark 'yes' and reward","Release after reward","Gradually increase duration before the release cue","Gradually increase distractions before the release cue"]},
      {type:"p", text:"If the dog breaks the behavior before the release, use gentle pressure to calmly guide the dog back into the desired behavior."},
      {type:"h", text:"E-Collar (After Week 2 of the Core Program)"},
      {type:"p", text:"If the dog comes out of the sit or down position before given the 'free' cue, layer continuous e-collar pressure with gentle leash pressure until the dog begins to move back into a sit or down position."},
    ],
    mistakes:["Repeating cue more than once","Allowing the dog to break the behavior without a release cue","Asking for too long of a stay/down too soon","Introducing heavy distractions too soon"],
  },
  socializingMistakes: {
    title:"Socializing - 20 Common Mistakes",
    content:[
      {type:"p", text:"Mistakes are incredibly common \u2014 they will quietly shape a dog's behavior for life. Issues such as reactivity, fearfulness, and over-excitement not only come from a lack of proper socializing but also from the wrong kind of exposure."},
      {type:"ol", items:[
        "Flooding \u2014 too much stimulus too quickly. Placing a young puppy in a busy/chaotic park environment without first working at home and in the yard.",
        "Forcing \u2014 taking choice away from the puppy by allowing strangers to handle the puppy, dogs to rush into the puppy's space, or picking the puppy up while something scary happens to them.",
        "Quantity over Quality \u2014 checking boxes instead of fostering curiosity and confidence. Meeting 50 people is not better than calmly investigating one neutral person. Overstimulation risks the puppy shutting down and associating negative feelings towards what should be neutral experiences.",
        "Ignoring body language \u2014 missing early stress signals causes the puppy to escalate to fearful or defensive behaviors. Signs like lip licking, freezing, and turning away should be an automatic trigger to slow down and create distance.",
        "Delaying socializing \u2014 waiting for vaccines or for the puppy to reach an older age means missing the critical socializing window.",
        "Letting every dog and person interact \u2014 frustration or overexcitement are side effects of constant interactions, teaching the puppy to expect interactions instead of reinforcing engagement with the handler and neutrality towards other people and dogs.",
        "Accidentally reinforcing fear \u2014 over-soothing while the puppy is unsure creates overstimulation and fear. Picking up the puppy at every perceived insecurity creates frustration and feelings of helplessness.",
        "Not enough variety \u2014 sticking with the same people, environments, sounds, etc. creates context specific feelings, meaning they are only comfortable with the same two people or neutrality only around one dog in the neighborhood, for example.",
        "Skipping Handling Desensitizing \u2014 being unprepared for grooming or vet appointments means fearful/reactive handling later.",
        "Focusing on other dogs, not the environment \u2014 constantly planning playdates means the puppy becomes socially fixated (only wants to interact with other dogs instead of the handler), or reactive (lunging to create space or overexcited).",
        "Permissive overexcitement \u2014 letting the puppy bark, jump, or lunge towards everything they find interesting/exciting leads to a loss of control during greetings and no engagement with the handler.",
        "Not teaching independence \u2014 'Helicopter parent' behavior in every situation never allows the puppy to think or feel okay existing on their own. Separation issues arise when the handler is always stepping in or engaging with the puppy.",
        "Inconsistent experiences \u2014 sometimes allowing behavior and sometimes redirecting (jumping, pulling, etc.). This confuses the learning process, keeping the puppy guessing on what expectations are.",
        "Punishing fearful reactions \u2014 suppressing the puppy's communication begins to ruin the relationship between puppy and handler. Scolding for fearful barking, backing away, shutting down, etc. adds fear and confusion.",
        "Not being the puppy's advocate \u2014 letting people crowd the puppy, pet without permission, and allowing uncontrolled dogs too close are all examples of not advocating for the puppy. It is the handler's responsibility to create safe boundaries.",
        "Poor timing \u2014 rewarding at the wrong moment or significantly delayed from the experience reinforces the wrong emotional state. If the puppy is already pulling away or panicked, feeding in that moment rewards incorrect feelings towards the experience.",
        "Sessions lasting too long \u2014 pushing a puppy past their threshold for new experiences creates negative associations. Do not push past fatigue or overstimulation.",
        "No recovery time \u2014 just as pushing past the puppy's fatigue, giving too many experiences back to back builds up to overstimulation or frustration.",
        "Expecting confidence rather than building confidence \u2014 assuming the puppy can handle every experience causes frustration on both the handler and puppy.",
        "Going to dog parks \u2014 dog parks have too many variables to be considered a safe space to socialize. Other dogs teach poor manners, over-arousal, and incorrect social skills. Having a puppy off-leash in an unpredictable environment means handler timing is way off and there is zero control over the puppy and what happens to them.",
      ]},
    ],
    mistakes:[],
  },
  socializingHomeYardPublic: {
    title:"Socializing - Home/Yard/Public",
    content:[
      {type:"p", text:"Socializing is pairing exposure to everyday experiences with positivity and curiosity. Allowing the puppy to investigate encourages confidence rather than forcing engagement. Start inside the home first to gauge the puppy's tolerance to new, stimulating experiences, then branch out to the yard and beyond. The goal is to build confidence no matter what is presented to the puppy."},
      {type:"h", text:"Body Language \u2014 Positive"},
      {type:"ul", items:["Curious","Relaxed","Sniffing","Taking treats easily","Soft eyes/normal blinking","Approaching voluntarily","Loose wiggly body","Playful bowing","Relaxed bouncing","Soft wagging tail at mid-height (not stiff \u2014 a wagging tail is not always positive; if paired with negative body language, take a step back)"]},
      {type:"note", text:"These behaviors say keep going, reward, build on the experiences."},
      {type:"h", text:"Body Language \u2014 Negative"},
      {type:"ul", items:["Hiding/trying to escape","Freezing","Cowering","Crouching","Defensive barking/lunging","Growling/showing teeth/snapping","Pulling away","Shutting down","Repeatedly yawning","Lip licking (when not eating/drinking)","Ears pinned back","Big whale eyes/avoiding eye contact","Not taking food"]},
      {type:"note", text:"These behaviors say take a step back, create distance, lower intensity, and try again."},
    ],
    mistakes:[],
  },
  socializingCheckList: {
    title:"Socializing Check List",
    content:[
      {type:"p", text:"This is not a comprehensive list, nor a mandatory one. Explore what aligns with the lifestyle the puppy will experience."},
      {type:"h", text:"Surfaces"},
      {type:"ul", items:["Walking from one surface to a different one","Rubber mats","Linoleum/tile","Pavement","Dirt/muddy ground","Metro grates","Puddles","Wet grass","Plastic","Branches","Wood","Vet tables","Cement","Gravel","Metal surfaces","Wet floors","Snow","Cobble/brick","Uneven terrain","Landscape rocks"]},
      {type:"h", text:"Places"},
      {type:"ul", items:["Streets","Class","Cafe","On a boat","River","Mountain","Farm","Dog park (outside)","Home","Park","Office","Pet friendly store","Beach","Woods","Large bodies of water","Market","Public transport (bus, plane, train, etc.)"]},
      {type:"h", text:"People"},
      {type:"ul", items:["Tall people","Babies","Deep voices","Beards","Other races","Elderly","Hats","Law enforcement","Children","Teens","High-pitched voices","Crowds","Uniforms","Hoodies","Seasoned clothing (ex: winter gear)","Cyclists","Skateboarders"]},
      {type:"h", text:"Animals"},
      {type:"ul", items:["Birds","Other dogs (calm/excited)","Horses","Reptiles","Cats","Fish","Rodents","Bugs"]},
      {type:"h", text:"Smells"},
      {type:"ul", items:["Smoke","Pet food","Other animals","Fish","Body odors","BBQ","Woods","Cleaning solutions","Sweets","Rotten/spoiled foods"]},
      {type:"h", text:"Objects"},
      {type:"ul", items:["Shopping carts","Boots","Headphones","Power chairs","Trucks/cars","Kennel","Vest","Eyegear","Wheelchairs","Canes","Planes","Fountains"]},
      {type:"h", text:"Situations"},
      {type:"ul", items:["Escalators","Vet","Nail trimming","Under umbrella","Dark tunnels w/o visible opening","Concert","Traffic","Crowded places","Elevators","Handling of body & paws","Grooming","Fabric tunnel","Festival/fair","Parade","Confrontations","Swimming"]},
      {type:"h", text:"Sounds"},
      {type:"ul", items:["Door knocking","Items dropping","Microwave door","TV","Balls bouncing, bats hitting balls","Playground equipment","Doorbell","Vacuum","Kitchen appliances","Fireworks","Children laughing/playing","Public transport (plane, bus, train, etc.)","Screams","Running water","Other animal sounds (wolf howl, dark bark, etc.)","Hair dryer","Fire alarm","Siren","Gunshot","Car horns","Doors opening/closing","Bells"]},
    ],
    mistakes:[],
  },
  socializingExperiences: {
    title:"Socializing - Experiences to Introduce",
    content:[
      {type:"h", text:"In the Home"},
      {type:"ul", items:["Household noises","Surface textures","People"]},
      {type:"h", text:"In the Yard"},
      {type:"ul", items:["Outdoor sounds","Movement","Textures"]},
      {type:"h", text:"At the Park"},
      {type:"ul", items:["Sights","Sounds","Textures"]},
      {type:"h", text:"At the Store"},
      {type:"ul", items:["Sights","Sounds","Textures"]},
      {type:"note", heading:"Tips", items:["Pair everything with food or play","Keep sessions short and calm","Allow the puppy to approach on their own \u2014 never force anything","Avoid dog parks, busy city parks, overwhelming environments","Always advocate for the puppy, don't let strangers approach and overwhelm","Quality > Quantity \u2014 keeping things calm and positive is always better than over-exposure"]},
      {type:"p", text:"End on a good note before the puppy is tired or stressed (5-15 minutes for younger puppies)."},
      {type:"p", text:"See the Socializing Check List for more experience ideas."},
    ],
    mistakes:[],
  },
  structuredCalmPlace: {
    title:"Structured Calm - Place",
    content:[
      {type:"p", text:"Establish a reliable \"off switch\" by teaching the dog to settle in a defined space. This exercise promotes true relaxation, impulse control, and mental clarity. A structured place (cot, bed, or mat with clear boundaries) becomes a consistent environment for decompression and focus."},
      {type:"h", text:"How to Teach:"},
      {type:"ul", items:["Introduce a defined 'place' (bed, cot, dog mat)","Guide the dog on leash to the bed","Mark 'yes' and reward immediately","If the dog leaves the place before the release cue is given, calmly guide the dog back with gentle pressure","Release","Gradually increase duration before the release cue","Gradually increase distractions before the release cue"]},
      {type:"h", text:"E-Collar (After Week 2 of the Core 6 Week Program)"},
      {type:"p", text:"Layer leash guidance with e-collar communication to reinforce commitment to \"Place.\" Apply stimulation and maintain it until the dog shows intention to move toward place; release immediately upon the correct decision. If the dog breaks position prior to the release cue, apply pressure and guide them back, reinforcing accountability and follow-through."},
    ],
    mistakes:["Allowing the dog to leave place without a release cue","Using place only when the dog is overstimulated/too energetic","Repeating cues","Introducing heavy distractions too soon"],
  },
  thresholdBoundaries: {
    title:"Threshold Boundaries - Wait",
    content:[
      {type:"p", text:"Goal: not to follow automatically \u2014 crossing a threshold until released."},
      {type:"p", text:"Threshold boundaries teach a dog to pause at doorways and transitions until released. This builds impulse control, patience, and awareness in everyday situations like doorways, sidewalks, vehicles, and new environments."},
      {type:"h", text:"TO TEACH:"},
      {type:"ul", items:["Approach a threshold (doorway, gate, etc.)","Give the cue \"wait\" before crossing","Continue moving forward with intention","The dog remains behind the threshold","Release with \"free\" marker when allowed to move forward","If the dog breaks the boundary, calmly guide back behind the threshold to reset and repeat \"wait\" cue","Practice at multiple thresholds (doors, crate/kennel, car, gates, etc.)","Build duration before releasing, gradually adding in distractions"]},
    ],
    mistakes:["Repeating cues","Inconsistent boundaries","Releasing too quickly, not building up duration","Introducing distractions too quickly","Not practicing at a variety of thresholds"],
  },
  workingForFood: {
    title:"Working for Food", subtitle:"Structured Meals vs. Free Feeding",
    content:[
      {type:"h", text:"Why Should a Dog Work for Their Food?"},
      {type:"h", text:"1. Mental Stimulation"},
      {type:"p", text:"When a dog works for their food through training, physical exercise, and puzzle feeders, the dog engages their brain. Mental stimulation tires a dog similar to physical exercise, which can reduce boredom, destructive behavior, and anxiety."},
      {type:"h", text:"2. Reinforces Training and Good Behavior"},
      {type:"p", text:"Using food as a reward connects desirable behavior (sit, leash manners, recall, place) with positive outcomes. Working for food strengthens the dog/handler bond as the dog learns paying attention and following cues is rewarding. The dog learns all good things come from their handler and they become the most exciting thing rather than other distractions."},
      {type:"h", text:"3. Encourages Problem Solving and Confidence"},
      {type:"p", text:"Dogs who earn their meals through challenges such as finding kibble in a toy, hunting for kibble in the grass, or performing a sequence of commands, build confidence. Training with food supports dogs with mild anxiety, fear, or lack of focus by giving them clear goals and wins."},
      {type:"h", text:"4. Reduces Overeating and Obesity"},
      {type:"p", text:"Working for food slows down the eating pace which helps with portion control. Structured feeding allows for supervised measuring, reducing the risk of obesity compared to free feeding."},
      {type:"h", text:"How Long Should a Dog Work for Food?"},
      {type:"p", text:"Working for food is a great way to build communication and strengthen your relationship. Use food often when teaching new skills, then gradually add other rewards like praise, play, and real-life experiences. Continue using food throughout your dog's life to reinforce great choices and maintain reliable behaviors. Since each dog's growth is different and their progress varies, working for food depends on the dog."},
      {type:"table", headers:["","Structured Meals","Free Feeding"], rows:[
        ["Portion Control","Meals are measured, preventing overeating","Unlimited access often leading to obesity"],
        ["Routine & Predictability","Dogs learn a schedule, reducing anxiety","Dog may graze or beg constantly"],
        ["Monitoring Health","Changes in appetite or eating habits are noticeable","Illness or changes in eating may go unnoticed"],
        ["Behavior Management","Encourages patience and impulse control","Can contribute to resource guarding or selective eating"],
      ]},
    ],
    mistakes:[],
  },
};
const HANDOUT_ORDER = ["equipmentList","eCollarGuide","threeDs","advocating","aloneTime","biting","calmness","chewing","chooseKennel","doNothing","dogNeutrality","fieldtrips","handling","impulseControl","leashPressure","kennelTraining","leashGames","markerWords","nameGame","offLeash","pottyTraining","dailyStructure","puppyDevelopment","generalizing","recallChaseMe","recallHere","sitStayDownStay","socializingMistakes","socializingHomeYardPublic","socializingCheckList","socializingExperiences","structuredCalmPlace","thresholdBoundaries","workingForFood"];

// Keyword → handout id map for automatic inline hyperlinking. Order matters: longest / most specific first.
const HANDOUT_KEYWORDS = [
  ["E-Collar Safety Guide","eCollarGuide"],
  ["E-Collar Guide","eCollarGuide"],
  ["e-collar safety","eCollarGuide"],
  ["Introduce the e-collar as a refined communication tool","eCollarGuide"],
  ["Advance e-collar work into movement-based behaviors","eCollarGuide"],
  ["3 D's of Training","threeDs"],
  ["Distance, Distraction, Duration","threeDs"],
  ["3 D's","threeDs"],
  ["Advocating for your dog","advocating"],
  ["Alone Time","aloneTime"],
  ["Biting & Nipping","biting"],
  ["Bitey","biting"],
  ["Calmness & Settling","calmness"],
  ["Reward Calm","calmness"],
  ["Chewing / Destruction","chewing"],
  ["destructive behavior","chewing"],
  ["Chewing","chewing"],
  ["Do Nothing","doNothing"],
  ["do nothing","doNothing"],
  ["Dog Neutrality","dogNeutrality"],
  ["dog neutrality","dogNeutrality"],
  ["Park & Store Visits","fieldtrips"],
  ["park visits","fieldtrips"],
  ["store visits","fieldtrips"],
  ["Store visit","fieldtrips"],
  ["Handling / Grooming Desensitizing","handling"],
  ["Grooming Desensitizing","handling"],
  ["Grooming/Handling","handling"],
  ["Impulse Control","impulseControl"],
  ["Intro to Leash Pressure","leashPressure"],
  ["leash pressure","leashPressure"],
  ["Kennel Training","kennelTraining"],
  ["Kennel with threshold boundary","kennelTraining"],
  ["Kennels","chooseKennel"],
  ["Kennel","chooseKennel"],
  ["Loose Leash Walking","leashGames"],
  ["Leash Games","leashGames"],
  ["Marker Words","markerWords"],
  ["marker words","markerWords"],
  ["Marker word","markerWords"],
  ["Name Game","nameGame"],
  ["Off Leash","offLeash"],
  ["Off-Leash","offLeash"],
  ["Potty Training","pottyTraining"],
  ["Daily Structure","dailyStructure"],
  ["daily structure","dailyStructure"],
  ["Puppy Generalizing","generalizing"],
  ["Generalizing","generalizing"],
  ["Recall/Chase Me","recallChaseMe"],
  ["Chase Me","recallChaseMe"],
  ["Sit-Stay & Down-Stay","sitStayDownStay"],
  ["Sit stay","sitStayDownStay"],
  ["Down stay","sitStayDownStay"],
  ["Sit and Down","sitStayDownStay"],
  ["Implied Stays","sitStayDownStay"],
  ["Socializing Check List","socializingCheckList"],
  ["20 Common Mistakes","socializingMistakes"],
  ["Structured Calm - Place","structuredCalmPlace"],
  ["Structured Calm","structuredCalmPlace"],
  ["Threshold Boundaries","thresholdBoundaries"],
  ["Threshold boundary","thresholdBoundaries"],
  ["Working for Food","workingForFood"],
  ["Work for food","workingForFood"],
  ["Recall","recallHere"],
  ["Place","structuredCalmPlace"],
];
const _escapeRx = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const HANDOUT_MAP = Object.fromEntries(HANDOUT_KEYWORDS.map(([k,id])=>[k.toLowerCase(),id]));
const HANDOUT_REGEX = new RegExp(HANDOUT_KEYWORDS.map(([k])=>_escapeRx(k)).join("|"), "gi");

// ─── TRAINING VIDEOS ────────────────────────────────────────────────────────────
// Place these .mp4 files in your app's public assets folder at these paths
// (e.g. /public/videos/... for Create React App or Vite, or /public/videos/... for Next.js).
const VIDEO_LIBRARY = {
  nameGame:              {title:"Name Game",                                        src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Name%20Game.mp4`},
  markerWords:           {title:"Marker Words",                                     src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Marker%20Words.mp4`},
  sitLure:               {title:"Sit with a Lure",                                  src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Sit%20with%20a%20Lure.mp4`},
  sitLeashPressure:      {title:"Sit with Leash Pressure",                          src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Sit%20with%20Leash%20Pressure.mp4`},
  sitEcollar:            {title:"Sit with E-Collar",                                src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Sit%20with%20E-Collar.mp4`},
  placeLure:             {title:"Place with a Lure",                                src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Place%20with%20a%20Lure.mp4`},
  placeLeashPressure:    {title:"Place with Leash Pressure",                        src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Place%20with%20Leash%20Pressure.mp4`},
  placeEcollar:          {title:"Place with E-Collar",                              src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Place%20with%20E-Collar.mp4`},
  offLeashPlaceEcollar:  {title:"Off Leash Place with E-Collar",                    src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Off%20Leash%20Place%20with%20E-Collar.mp4`},
  recallLeashPressure:   {title:"Recall with Leash Pressure",                       src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Recall%20with%20Leash%20Pressure.mp4`},
  recallEcollar:         {title:"Recall with E-Collar",                             src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Recall%20with%20E-Collar.mp4`},
  offLeashRecallEcollar: {title:"Off Leash Recall with E-Collar",                   src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Off%20Leash%20Recall%20with%20E-Collar.mp4`},
  thresholdLeashPressure:{title:"Threshold Boundaries (Wait) with a Leash Pressure",src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Threshold%20Boundaries%20(Wait)%20with%20a%20leash%20pressure.mp4`},
  thresholdEcollar:      {title:"Threshold Boundaries (Wait) with an E-Collar",     src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Threshold%20Boundaries%20(Wait)%20with%20an%20E-Collar.mp4`},
  offLeashThreshold:     {title:"Off Leash Threshold Boundaries (Wait) with an E-Collar", src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Off%20Leash%20Threshold%20Boundaries%20(Wait)%20with%20an%20E-Collar.mp4`},
  puppyThreshold:        {title:"Puppy Threshold Boundaries (Wait)",                src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Puppy%20Threshold%20Boundaries%20(Wait)%20.mp4`},
  offLeashHeel:          {title:"Off Leash Heel with an E-Collar",                  src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Off%20Leash%20Heel%20with%20an%20E-Collar.mp4`},
  downLure:              {title:"Down with a Lure",                                 src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Down%20with%20a%20Lure.mp4`},
  downLeashPressure:     {title:"Down with Leash Pressure",                         src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Down%20with%20Leash%20Pressure.mp4`},
  downEcollar:           {title:"Down with E-Collar",                               src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Down%20with%20E-Collar.mp4`},
  chaseMeLure:           {title:"Chase Me (Recall with a Lure)",                    src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Chase%20Me%20(recall%20with%20a%20lure).mp4`},
  eCollarIntro:          {title:"E-Collar Intro",                                   src:`${VIDEO_BASE_URL}/Guiding%20Paw%20E-Collar%20Intro.mp4`},
  introKennelThreshold:  {title:"Intro to Kennel with Threshold Boundary",          src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Intro%20to%20Kennel%20with%20Threshold%20Boundary.mp4`},
  introLeashPressure:    {title:"Intro to Leash Pressure",                          src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Intro%20to%20Leash%20Pressure.mp4`},
  leashGamesVideo:       {title:"Leash Games",                                      src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Leash%20Games.mp4`},
  looseLeashLure:        {title:"Loose Leash with a Lure",                          src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Loose%20Leash%20with%20a%20Lure.mp4`},
  looseLeashEcollar:     {title:"Loose Leash with E-Collar",                        src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Loose%20Leash%20with%20E-Collar.mp4`},
  looseLeashPressure:    {title:"Loose Leash with Leash Pressure",                  src:`${VIDEO_BASE_URL}/Guiding%20Paw%20Loose%20Leash%20with%20Leash%20Pressure.mp4`},
  parkVisit:             {title:"Park Visit",                                       src:`${VIDEO_BASE_URL}/park-visit.mp4`},
  fieldTrip:             {title:"Field Trip",                                       src:`${VIDEO_BASE_URL}/field-trip.mp4`},
};
const VIDEO_ORDER = ["nameGame","markerWords","sitLure","sitLeashPressure","sitEcollar","downLure","downLeashPressure","downEcollar","placeLure","placeLeashPressure","placeEcollar","offLeashPlaceEcollar","chaseMeLure","recallLeashPressure","recallEcollar","offLeashRecallEcollar","introLeashPressure","thresholdLeashPressure","thresholdEcollar","offLeashThreshold","puppyThreshold","introKennelThreshold","eCollarIntro","leashGamesVideo","looseLeashLure","looseLeashPressure","looseLeashEcollar","offLeashHeel","parkVisit","fieldTrip"];

// Keyword → video id map for automatic inline hyperlinking. Checked alongside handout
// keywords; when a phrase matches both, the video link wins since it's more specific.
// Longer / more specific phrases are listed first so they win over shorter overlapping ones.
const VIDEO_KEYWORDS = [
  ["Off Leash Threshold Boundaries (Wait) with an E-Collar","offLeashThreshold"],
  ["Off Leash Threshold Boundaries (Wait) with E-collar","offLeashThreshold"],
  ["Threshold Boundaries (Wait) with an E-Collar","thresholdEcollar"],
  ["Threshold Boundaries (Wait) with E-collar","thresholdEcollar"],
  ["Threshold Boundaries (Wait) with a leash pressure","thresholdLeashPressure"],
  ["Threshold Boundaries (Wait) with leash pressure","thresholdLeashPressure"],
  ["Off Leash Recall with E-collar","offLeashRecallEcollar"],
  ["Recall with leash pressure","recallLeashPressure"],
  ["Recall with E-collar","recallEcollar"],
  ["Off Leash Place with E-collar","offLeashPlaceEcollar"],
  ["Place with leash pressure","placeLeashPressure"],
  ["Place with E-collar","placeEcollar"],
  ["Place with a lure","placeLure"],
  ["Place with marker words and a lure","placeLure"],
  ["Off Leash Heel with an E-Collar","offLeashHeel"],
  ["Off Leash Heel with E-collar","offLeashHeel"],
  ["Sit with leash pressure","sitLeashPressure"],
  ["Sit with E-collar","sitEcollar"],
  ["Sit with a lure","sitLure"],
  ["Sit with food lure and verbal cue","sitLure"],
  ["Sit with food lure","sitLure"],
  ["Name Game","nameGame"],
  ["Marker Words","markerWords"],
  ["marker words","markerWords"],
  ["Down with E-collar","downEcollar"],
  ["Down with a lure","downLure"],
  ["Down with food lure","downLure"],
  ["Down with leash pressure","downLeashPressure"],
  ["Recall/Chase Me","chaseMeLure"],
  ["Chase Me","chaseMeLure"],
  ["Intro to Kennel with Threshold Boundary","introKennelThreshold"],
  ["Kennel with threshold boundary","introKennelThreshold"],
  ["Intro to Leash Pressure","introLeashPressure"],
  ["E-Collar Intro","eCollarIntro"],
  ["Intro to e-collar","eCollarIntro"],
  ["Off Leash Loose Leash Walking with E-collar","looseLeashEcollar"],
  ["Loose Leash Walking with E-collar","looseLeashEcollar"],
  ["Loose Leash with E-Collar","looseLeashEcollar"],
  ["Loose Leash Walking with leash pressure","looseLeashPressure"],
  ["Loose Leash with Leash Pressure","looseLeashPressure"],
  ["Loose Leash Walking with a lure","looseLeashLure"],
  ["Loose Leash with a Lure","looseLeashLure"],
  ["Leash Games with leash pressure","leashGamesVideo"],
  ["Leash Games","leashGamesVideo"],
  ["Leash Games","leashGamesVideo"],
  ["leash games","leashGamesVideo"],
  ["Generalizing at the park","parkVisit"],
  ["park visits","parkVisit"],
  ["Park visit","parkVisit"],
  ["Generalizing on a field trip","fieldTrip"],
  ["store visits","fieldTrip"],
  ["Store visit","fieldTrip"],
];

// Combined lookup used only to find matches (finds the longest recognized phrase at each
// position). Which target(s) that phrase actually opens is resolved separately below, from
// HANDOUT_MAP and VIDEO_MAP — so a phrase that exists in both lists isn't forced to pick one.
const _linkEntries = [
  ...HANDOUT_KEYWORDS.map(([k,id])=>({k,id,type:"handout"})),
  ...VIDEO_KEYWORDS.map(([k,id])=>({k,id,type:"video"})),
];
const LINK_REGEX = new RegExp(
  [..._linkEntries].sort((a,b)=>b.k.length-a.k.length).map(e=>_escapeRx(e.k)).join("|"), "gi"
);
const VIDEO_MAP = Object.fromEntries(VIDEO_KEYWORDS.map(([k,id])=>[k.toLowerCase(),id]));

// Renders text with any recognized handout topic or training video wrapped as a clickable
// word. If a phrase has BOTH a handout and a video, clicking it reveals two small inline
// buttons ("Handout" / "Video") right next to the word so the person can pick which one they
// want, instead of the app silently picking one for them. If only one exists, clicking the
// word opens it directly, same as before.
// If `currentId` matches a target (i.e. it would point to the page you're already on), that
// target is skipped — no point linking to yourself, or offering a choice that's really just one.
const Linkify = ({text, onOpenHandout, onOpenVideo, context, currentId}) => {
  const T=useTheme();
  const [openMatchIdx, setOpenMatchIdx] = useState(null); // which match (by start index) is showing its Handout/Video choice
  if(!text) return null;
  if(!onOpenHandout && !onOpenVideo) return <>{text}</>;
  const parts=[]; let lastIndex=0; let match;
  LINK_REGEX.lastIndex=0;
  while((match=LINK_REGEX.exec(text))){
    const key=match[0].toLowerCase();
    let handoutId = onOpenHandout ? (HANDOUT_MAP[key] || null) : null;
    let videoId = onOpenVideo ? (VIDEO_MAP[key] || null) : null;
    // In the puppy program, generic "Threshold Boundaries" (no qualifier) refers to the
    // puppy-specific demo video rather than the standard-program E-collar/leash-pressure videos.
    if(onOpenVideo && context==="puppy" && (key==="threshold boundaries" || key==="threshold boundary")){
      videoId = "puppyThreshold";
    }
    // Don't offer a target that's the page already open.
    if(currentId && handoutId===currentId) handoutId=null;
    if(currentId && videoId===currentId) videoId=null;
    if(!handoutId && !videoId){ continue; }
    if(match.index>lastIndex) parts.push(text.slice(lastIndex,match.index));

    if(handoutId && videoId){
      // Both exist — reveal a small inline choice instead of guessing which one to open.
      const idx=match.index;
      const isOpen=openMatchIdx===idx;
      parts.push(
        <span key={idx}>
          <span onClick={(e)=>{e.stopPropagation();setOpenMatchIdx(isOpen?null:idx);}}
            style={{color:T.gold,textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:"2px",cursor:"pointer",fontWeight:"700"}}>
            {match[0]}
          </span>
          {isOpen && (
            <span style={{display:"inline-flex",gap:"5px",marginLeft:"6px",verticalAlign:"middle"}}>
              <span onClick={(e)=>{e.stopPropagation();setOpenMatchIdx(null);onOpenHandout(handoutId);}}
                style={{display:"inline-flex",alignItems:"center",gap:"3px",background:"rgba(176,141,87,.15)",border:`1px solid ${T.gold}`,borderRadius:"20px",padding:"1px 8px 1px 6px",fontSize:"10px",fontWeight:"700",color:T.gold,cursor:"pointer",whiteSpace:"nowrap"}}>
                <Icon name="clipboard" size={9}/>Handout
              </span>
              <span onClick={(e)=>{e.stopPropagation();setOpenMatchIdx(null);onOpenVideo(videoId);}}
                style={{display:"inline-flex",alignItems:"center",gap:"3px",background:"rgba(76,175,125,.15)",border:"1px solid #4caf7d",borderRadius:"20px",padding:"1px 8px 1px 6px",fontSize:"10px",fontWeight:"700",color:"#4caf7d",cursor:"pointer",whiteSpace:"nowrap"}}>
                <Icon name="play" size={9}/>Video
              </span>
            </span>
          )}
        </span>
      );
    } else {
      const targetId = handoutId || videoId;
      const handler = handoutId ? onOpenHandout : onOpenVideo;
      parts.push(
        <span key={match.index} onClick={(e)=>{e.stopPropagation();handler(targetId);}}
          style={{color:T.gold,textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:"2px",cursor:"pointer",fontWeight:"700"}}>
          {match[0]}
        </span>
      );
    }
    lastIndex=match.index+match[0].length;
  }
  if(lastIndex<text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
};

const HandoutScreen = ({id, onClose, onBack, onOpenHandout}) => {
  const T=useTheme();
  const h=HANDOUTS[id];
  if(!h) return (
    <ScrollBody>
      <p style={{fontSize:"13px",color:T.textMuted}}>Handout not found.</p>
      <div style={{marginTop:"10px"}}><BackBtn onClick={onBack||onClose}/></div>
    </ScrollBody>
  );
  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Training Handout</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700",lineHeight:1.2}}>{h.title}</h2>
          {h.subtitle && <p style={{fontSize:"13px",color:T.textMuted,marginTop:"3px"}}>{h.subtitle}</p>}
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px",flexShrink:0}}><Icon name="x" size={18}/></button>
      </div>

      <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"16px",marginBottom:"14px"}}>
        {h.content.map((block,bi)=>{
          if(block.type==="p") return (
            <p key={bi} style={{fontSize:"13px",color:T.textMuted,lineHeight:1.65,marginBottom:bi<h.content.length-1?"12px":"0",fontWeight:block.bold?"700":"400"}}>
              <Linkify text={block.text} onOpenHandout={block.linkable!==false?onOpenHandout:undefined} currentId={id}/>
            </p>
          );
          if(block.type==="h") return (
            <p key={bi} style={{fontSize:"13px",fontWeight:"800",color:T.text,marginTop:bi>0?"14px":"0",marginBottom:"8px",lineHeight:1.3}}>
              <Linkify text={block.text} onOpenHandout={onOpenHandout} currentId={id}/>
            </p>
          );
          if(block.type==="ul") return (
            <ul key={bi} style={{margin:"0 0 12px",paddingLeft:"18px"}}>
              {block.items.map((it,ii)=>(
                <li key={ii} style={{fontSize:"12.5px",color:T.textMuted,lineHeight:1.55,marginBottom:"5px"}}>
                  <Linkify text={it} onOpenHandout={onOpenHandout} currentId={id}/>
                </li>
              ))}
            </ul>
          );
          if(block.type==="ol") return (
            <ol key={bi} style={{margin:"0 0 12px",paddingLeft:"18px"}}>
              {block.items.map((it,ii)=>(
                <li key={ii} style={{fontSize:"12.5px",color:T.textMuted,lineHeight:1.55,marginBottom:"5px",fontWeight:"700"}}>
                  <Linkify text={it} onOpenHandout={onOpenHandout} currentId={id}/>
                </li>
              ))}
            </ol>
          );
          if(block.type==="note") return (
            <div key={bi} style={{marginTop:"6px",marginBottom:"12px",padding:"10px 13px",background:T.mode==="dark"?"rgba(47,79,62,.18)":"rgba(47,79,62,.08)",border:`1px solid ${T.mode==="dark"?"rgba(47,79,62,.4)":"rgba(47,79,62,.25)"}`,borderRadius:"9px"}}>
              {block.heading && <p style={{fontSize:"11px",fontWeight:"800",color:T.green,marginBottom:"6px",textTransform:"uppercase",letterSpacing:".06em"}}>{block.heading}</p>}
              {block.text && <p style={{fontSize:"12.5px",color:T.mode==="dark"?"rgba(216,198,174,.9)":T.textMuted,lineHeight:1.55}}><Linkify text={block.text} onOpenHandout={onOpenHandout} currentId={id}/></p>}
              {block.items && (
                <ul style={{margin:0,paddingLeft:"16px"}}>
                  {block.items.map((it,ii)=>(<li key={ii} style={{fontSize:"12.5px",color:T.mode==="dark"?"rgba(216,198,174,.9)":T.textMuted,lineHeight:1.5,marginBottom:"3px",fontWeight:"600"}}><Linkify text={it} onOpenHandout={onOpenHandout} currentId={id}/></li>))}
                </ul>
              )}
            </div>
          );
          if(block.type==="warning") return (
            <div key={bi} style={{marginTop:"6px",marginBottom:"12px",padding:"10px 13px",background:T.mode==="dark"?"rgba(224,122,95,.12)":"rgba(224,122,95,.08)",border:"1px solid rgba(224,122,95,.35)",borderRadius:"9px"}}>
              {block.heading && <p style={{fontSize:"11px",fontWeight:"800",color:"#e07a5f",marginBottom:"6px",textTransform:"uppercase",letterSpacing:".06em"}}>{block.heading}</p>}
              {block.text && <p style={{fontSize:"12.5px",color:T.mode==="dark"?"rgba(216,198,174,.9)":T.textMuted,lineHeight:1.55}}><Linkify text={block.text} onOpenHandout={onOpenHandout} currentId={id}/></p>}
              {block.items && (
                <ul style={{margin:0,paddingLeft:"16px"}}>
                  {block.items.map((it,ii)=>(<li key={ii} style={{fontSize:"12.5px",color:T.mode==="dark"?"rgba(216,198,174,.9)":T.textMuted,lineHeight:1.5,marginBottom:"3px",fontWeight:"600"}}><Linkify text={it} onOpenHandout={onOpenHandout} currentId={id}/></li>))}
                </ul>
              )}
            </div>
          );
          if(block.type==="table") return (
            <div key={bi} style={{marginBottom:"12px",overflow:"hidden",borderRadius:"9px",border:`1px solid ${T.cardInnerBorder}`}}>
              {block.title && <p style={{fontSize:"11px",fontWeight:"800",color:T.text,padding:"8px 10px 4px"}}>{block.title}</p>}
              <div style={{display:"grid",gridTemplateColumns:`repeat(${block.headers.length},1fr)`,background:T.mode==="dark"?"rgba(176,141,87,.12)":"rgba(176,141,87,.1)"}}>
                {block.headers.map((hd,hi)=>(<p key={hi} style={{fontSize:"10px",fontWeight:"800",color:T.gold,padding:"7px 9px",textTransform:"uppercase",letterSpacing:".04em"}}>{hd}</p>))}
              </div>
              {block.rows.map((row,ri)=>(
                <div key={ri} style={{display:"grid",gridTemplateColumns:`repeat(${block.headers.length},1fr)`,background:ri%2===0?"transparent":T.mode==="dark"?"rgba(255,255,255,.02)":"rgba(28,38,54,.02)",borderTop:`1px solid ${T.divider}`}}>
                  {row.map((cell,ci)=>(<p key={ci} style={{fontSize:ci===0?"11.5px":"11px",fontWeight:ci===0?"700":"400",color:ci===0?T.text:T.textMuted,padding:"8px 9px",lineHeight:1.4}}>{cell}</p>))}
                </div>
              ))}
            </div>
          );
          if(block.type==="links") return (
            <div key={bi} style={{marginBottom:"12px",display:"flex",flexDirection:"column",gap:"5px"}}>
              {block.items.map((lnk,li)=>(
                <span key={li} onClick={()=>window.open(lnk.url,"_blank","noopener,noreferrer")}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px",padding:"9px 11px",borderRadius:"9px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,cursor:"pointer"}}>
                  <span style={{fontSize:"12.5px",color:T.text,fontWeight:"600",lineHeight:1.4}}>{lnk.label}</span>
                  <span style={{fontSize:"11px",color:T.gold,fontWeight:"700",flexShrink:0}}>View →</span>
                </span>
              ))}
            </div>
          );
          return null;
        })}
      </div>

      {h.mistakes && h.mistakes.length>0 && (
        <div style={{padding:"14px 16px",background:T.mode==="dark"?"rgba(163,86,42,.1)":"rgba(163,86,42,.06)",border:`1px solid ${T.mode==="dark"?"rgba(163,86,42,.35)":"rgba(163,86,42,.22)"}`,borderRadius:"14px",marginBottom:"14px"}}>
          <p style={{fontSize:"10px",color:T.brown,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"8px"}}><Icon name="alert" size={11} style={{marginRight:"3px"}}/>Common Mistakes</p>
          {h.mistakes.map((m,mi)=>(
            <div key={mi} style={{display:"flex",alignItems:"flex-start",gap:"7px",marginBottom:mi<h.mistakes.length-1?"5px":"0"}}>
              <span style={{fontSize:"9px",color:T.brown,marginTop:"3px",flexShrink:0}}>—</span>
              <p style={{fontSize:"11.5px",color:T.mode==="dark"?"rgba(216,198,174,.8)":T.textMuted,lineHeight:1.45}}><Linkify text={m} onOpenHandout={onOpenHandout} currentId={id}/></p>
            </div>
          ))}
        </div>
      )}

      <BackBtn onClick={onBack||onClose}/>
    </ScrollBody>
  );
};

const HandoutLibraryScreen = ({onOpenHandout, onClose}) => {
  const T=useTheme();
  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Reference Library</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700"}}>Training Handouts</h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}><Icon name="x" size={18}/></button>
      </div>
      <p style={{fontSize:"12.5px",color:T.textMuted,marginBottom:"14px",lineHeight:1.5}}>Every handout referenced throughout your training plan, all in one place.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
        {HANDOUT_ORDER.map(id=>{
          const h=HANDOUTS[id];
          return (
            <button key={id} onClick={()=>onOpenHandout(id)}
              style={{padding:"13px 15px",borderRadius:"12px",border:`1px solid ${T.chipBorder}`,background:T.chipBg,color:T.text,fontSize:"13.5px",fontWeight:"700",textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.chipBorder;}}>
              {h.title}<span style={{color:T.textFaint}}>›</span>
            </button>
          );
        })}
      </div>
    </ScrollBody>
  );
};

const VideoScreen = ({id, onClose, onBack}) => {
  const T=useTheme();
  const v=VIDEO_LIBRARY[id];
  if(!v) return (
    <ScrollBody>
      <p style={{fontSize:"13px",color:T.textMuted}}>Video not found.</p>
      <div style={{marginTop:"10px"}}><BackBtn onClick={onBack||onClose}/></div>
    </ScrollBody>
  );
  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Training Video</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700",lineHeight:1.2}}>{v.title}</h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px",flexShrink:0}}><Icon name="x" size={18}/></button>
      </div>

      <div className="protected-content-wrap" style={{borderRadius:"14px",overflow:"hidden",background:"#000",marginBottom:"14px"}}>
        <video
          className="protected-video"
          src={v.src}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e)=>e.preventDefault()}
          style={{width:"100%",display:"block",maxHeight:"420px"}}
        />
      </div>

      <BackBtn onClick={onBack||onClose}/>
    </ScrollBody>
  );
};

const VideoLibraryScreen = ({onOpenVideo, onClose, isVideoUnlocked, videoUnlocksWithLabel}) => {
  const T=useTheme();
  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Reference Library</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700"}}>Training Videos</h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}><Icon name="x" size={18}/></button>
      </div>
      <p style={{fontSize:"12.5px",color:T.textMuted,marginBottom:"14px",lineHeight:1.5}}>Every demo video referenced throughout your training plan, all in one place. Videos unlock along with the curriculum week they belong to.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
        {VIDEO_ORDER.map(id=>{
          const v=VIDEO_LIBRARY[id];
          const unlocked = isVideoUnlocked ? isVideoUnlocked(id) : true;
          const unlockLabel = videoUnlocksWithLabel ? videoUnlocksWithLabel(id) : null;
          return (
            <button key={id} onClick={()=>onOpenVideo(id)}
              style={{padding:"13px 15px",borderRadius:"12px",border:`1px solid ${T.chipBorder}`,background:T.chipBg,color:unlocked?T.text:T.textFaint,fontSize:"13.5px",fontWeight:"700",textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"10px",transition:"all .2s",opacity:unlocked?1:.6}}
              onMouseEnter={e=>{if(unlocked) e.currentTarget.style.borderColor=T.gold;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.chipBorder;}}>
              <span style={{display:"flex",alignItems:"center",gap:"9px"}}>
                <Icon name={unlocked?"play":"lock"} size={13}/>
                <span>
                  {v.title}
                  {!unlocked && unlockLabel && <span style={{display:"block",fontSize:"10.5px",fontWeight:"600",color:T.textFaint,marginTop:"2px"}}>Unlocks with {unlockLabel}</span>}
                </span>
              </span>
              <span style={{color:T.textFaint}}>{unlocked?"›":""}</span>
            </button>
          );
        })}
      </div>
    </ScrollBody>
  );
};

const BehaviorScreen = ({onClose,onOpenHandout}) => {
  const T=useTheme(); const [diagStep,setDiagStep]=useState("start"); const [answers,setAnswers]=useState({});
  const set=(k,v)=>{setAnswers(a=>({...a,[k]:v}));};

  const ISSUES=["Leash pulling","Jumping","Barking","Anxiety","Potty accidents","Biting","Chewing","Reactivity / Aggression"];
  const WHEN=["During walks","When guests arrive","When left alone","At night"];

  const PLANS={
    "Leash pulling":{title:"Leash Pulling Reset",weeks:["Week 1 — Engagement & focus games","Week 2 — Loose leash foundation","Week 3 — Distraction proofing"]},
    "Jumping":{title:"Jumping & Impulse Control",weeks:["Week 1 — Four on floor foundation","Week 2 — Threshold manners","Week 3 — Guest greetings"]},
    "Barking":{title:"Bark Control Protocol",weeks:["Week 1 — Marker + interrupt","Week 2 — Place command","Week 3 — Quiet on cue"]},
    "Anxiety":{title:"Anxiety & Confidence Building",weeks:["Week 1 — Desensitization basics","Week 2 — Crate confidence","Week 3 — Separation protocol"],
      caution:"This plan is a starting point for everyday nervousness, not a treatment for a diagnosed anxiety disorder. If your dog shows panic, self-injury, or distress that doesn't ease with time and practice, please talk to your veterinarian — anxiety can have medical causes and sometimes benefits from medication alongside training."},
    "Potty accidents":{title:"Potty Training Reset",weeks:["Week 1 — Schedule + supervision","Week 2 — Reward timing","Week 3 — Independence phase"]},
    "Biting":{title:"Bite Inhibition Program",weeks:["Week 1 — Redirect + interrupt","Week 2 — Marker training","Week 3 — Off-switch games"],
      caution:"This plan is designed for normal puppy mouthing and play-biting. If an adult dog has bitten and broken skin, or you're at all concerned about safety, please stop self-directed training and consult a certified professional dog trainer or veterinary behaviorist in person."},
    "Chewing":{title:"Chew Management Plan",weeks:["Week 1 — Confinement + supervision","Week 2 — Redirect to appropriate toys","Week 3 — Earn freedom"]},
    "Reactivity / Aggression":{title:"Reactivity Rehab",weeks:["Week 1 — Threshold awareness","Week 2 — Look at that game","Week 3 — Controlled exposure"],
      caution:"This plan addresses mild reactivity (barking, lunging, or over-excitement on leash). It is not a substitute for an in-person evaluation. If your dog has bitten someone or another animal, or you feel unsafe managing them, please work with a certified professional dog trainer or veterinary behaviorist directly rather than following this plan alone."},
  };

  const plan=PLANS[answers.issue];

  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Behavior Help</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"20px",color:T.text,fontWeight:"700"}}>Training Focus Finder</h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}><Icon name="x" size={18}/></button>
      </div>

      {diagStep==="start"&&(
        <div className="slide">
          <div style={{background:"rgba(176,141,87,.1)",border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"20px",textAlign:"center",marginBottom:"20px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"10px"}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color:"#B08D57"}}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <text x="12" y="13" textAnchor="middle" fontSize="9" fontWeight="900" fill="#B08D57" stroke="none" fontFamily="sans-serif">?</text>
              </svg>
            </div>
            <p style={{fontFamily:"'Inter',serif",fontSize:"17px",fontWeight:"700",color:T.text,marginBottom:"6px"}}>Is your pet struggling with a behavior?</p>
            <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.5}}>Answer a few quick questions and we'll recommend a personalized training path.</p>
          </div>
          <GoldBtn onClick={()=>{set("petType","dog");setDiagStep("issue");}}>I Need Help With Behavior →</GoldBtn>
        </div>
      )}

      {diagStep==="issue"&&(
        <div className="slide">
          <SectionTitle>What issue are you experiencing?</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:"7px",marginBottom:"14px"}}>
            {ISSUES.map(issue=>(
              <button key={issue} onClick={()=>{set("issue",issue);if(issue==="Potty accidents")setDiagStep("when");else setDiagStep("result");}} style={{padding:"12px 14px",borderRadius:"11px",border:`1px solid ${T.chipBorder}`,background:T.chipBg,color:T.text,fontSize:"13.5px",fontWeight:"700",textAlign:"left",cursor:"pointer",transition:"all .2s",display:"flex",justifyContent:"space-between",alignItems:"center"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.goldLight;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.chipBorder;e.currentTarget.style.color=T.text;}}>
                {issue}<span style={{color:T.textFaint}}>›</span>
              </button>
            ))}
          </div>
          <BackBtn onClick={()=>setDiagStep("start")}/>
        </div>
      )}

      {diagStep==="when"&&(
        <div className="slide">
          <SectionTitle>When does this happen?</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:"7px",marginBottom:"14px"}}>
            {WHEN.map(w=>(
              <button key={w} onClick={()=>{set("when",w);setDiagStep("result");}} style={{padding:"12px 14px",borderRadius:"11px",border:`1px solid ${T.chipBorder}`,background:T.chipBg,color:T.text,fontSize:"13.5px",fontWeight:"700",textAlign:"left",cursor:"pointer",transition:"all .2s",display:"flex",justifyContent:"space-between",alignItems:"center"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.chipBorder;}}>
                {w}<span style={{color:T.textFaint}}>›</span>
              </button>
            ))}
          </div>
          <BackBtn onClick={()=>setDiagStep("issue")}/>
        </div>
      )}

      {diagStep==="result"&&plan&&(
        <div className="slide">
          <div style={{background:"rgba(176,141,87,.12)",border:`2px solid ${T.gold}`,borderRadius:"18px",padding:"18px",marginBottom:"16px"}}>
            <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"900",letterSpacing:".18em",textTransform:"uppercase",marginBottom:"8px"}}>Recommended Plan</p>
            <p style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"14px",lineHeight:1.3}}>{plan.title}</p>
            {plan.weeks.map((w,i)=>(
              <div key={w} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"10px"}}>
                <div style={{width:"22px",height:"22px",borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px"}}>
                  <span style={{color:"white",fontSize:"10px",fontWeight:"900"}}>{i+1}</span>
                </div>
                <p style={{fontSize:"13px",color:T.text,lineHeight:1.4}}>{w}</p>
              </div>
            ))}
          </div>
          {answers.when&&<div style={{background:T.diagCard,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"12px",marginBottom:"14px"}}><p style={{fontSize:"11.5px",color:T.textMuted}}>Trigger noted: <span style={{color:T.text,fontWeight:"700"}}>{answers.when}</span> — we'll customize your timeline accordingly.</p></div>}
          {plan.caution&&<div style={{background:"rgba(224,122,95,.08)",border:"1px solid rgba(224,122,95,.3)",borderRadius:"12px",padding:"12px 14px",marginBottom:"14px"}}><p style={{fontSize:"11px",fontWeight:"800",color:"#e07a5f",marginBottom:"4px",textTransform:"uppercase",letterSpacing:".06em"}}>Please Read</p><p style={{fontSize:"11.5px",color:T.textMuted,lineHeight:1.55}}>{plan.caution}</p></div>}
          <GoldBtn onClick={()=>setDiagStep("program")}>Start This Program →</GoldBtn>
          <div style={{marginTop:"10px"}}><BackBtn onClick={()=>setDiagStep(answers.issue==="Potty accidents"?"when":"issue")}/></div>
        </div>
      )}

      {diagStep==="program"&&plan&&(
        <div className="slide">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
            <div>
              <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"900",letterSpacing:".18em",textTransform:"uppercase",marginBottom:"4px"}}>Your Program</p>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,lineHeight:1.3}}>{plan.title}</h3>
            </div>
            <div style={{background:"rgba(76,175,125,.15)",borderRadius:"10px",padding:"6px 10px",textAlign:"center",flexShrink:0}}>
              <p style={{fontSize:"9px",fontWeight:"700",color:"#4caf7d"}}>ACTIVE</p>
              <p style={{fontSize:"12px",fontWeight:"900",color:"#4caf7d"}}>{plan.weeks.length}wk</p>
            </div>
          </div>
          {plan.weeks.map((w,i)=>(
            <div key={w} style={{background:i===0?`linear-gradient(90deg,rgba(176,141,87,.15),transparent)`:T.cardInner,border:`1px solid ${i===0?T.gold:T.cardInnerBorder}`,borderRadius:"13px",padding:"13px 15px",marginBottom:"8px",display:"flex",gap:"12px",alignItems:"flex-start"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:i===0?T.gold:"rgba(176,141,87,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:i===0?"#fff":T.gold,fontSize:"11px",fontWeight:"900"}}>{i+1}</span>
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:"13px",fontWeight:"700",color:i===0?T.goldLight:T.text,marginBottom:"2px"}}>{w}</p>
                {i===0&&<p style={{fontSize:"10.5px",color:T.success,fontWeight:"700"}}>Start here today</p>}
              </div>
              {i===0&&<span style={{color:T.gold,fontSize:"14px"}}>▶</span>}
            </div>
          ))}
          <div style={{marginTop:"6px",marginBottom:"10px"}}>
            <GoldBtn onClick={()=>setDiagStep("start")}>Back to Training Focus Finder</GoldBtn>
          </div>
          <BackBtn onClick={()=>setDiagStep("result")}/>
        </div>
      )}
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: PET LIFE RECORD — CHANGE 8
// ═══════════════════════════════════════════════════════════════════════════════
const PetLifeRecord = ({petData,setPetData,onClose,onOpenSettings}) => {
  const T=useTheme(); const petName=petData?.name||"your dog";
  const groomingLog = petData?.groomingLog || [];
  const lastGroomedLabel = (() => {
    if(!groomingLog.length) return "Not logged yet";
    const days=Math.floor((Date.now()-new Date(groomingLog[0].date).getTime())/(1000*60*60*24));
    return days<=0?"Today":days===1?"1 day ago":`${days} days ago`;
  })();
  const inputId = "pet-photo-upload-input";
  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPetData && setPetData(d => ({...d, photoUrl: reader.result}));
    };
    reader.readAsDataURL(file);
  };
  const removePhoto = () => setPetData && setPetData(d => ({...d, photoUrl: null}));
  const petWalkLog = petData?.walkLog || [];
  const milesToday = petWalkLog
    .filter(w=>w.date===new Date().toLocaleDateString())
    .reduce((s,w)=>s+(w.distanceMi||0),0);
  const exerciseTodayLabel = petWalkLog.length
    ? `${milesToday.toFixed(2)} miles walked`
    : "No walks logged yet";
  // Potty schedule entries logged in Live → Potty Schedule are saved straight to
  // petData.pottyLog, so the profile always reflects the most recent success rate.
  const pottyLog = petData?.pottyLog || [];
  const pottyLabel = pottyLog.length
    ? `${pottyLog.filter(e=>e.success).length}/${pottyLog.length} successful`
    : "Not logged yet";
  const stats=[
    {label:"Age",value:computeAge(petData?.birthday)||"Not set",icon:"gift"},
    {label:"Training Streak",value:"7 days",icon:"chart"},
    {label:"Today's Assignment",value:"Loose leash walking",icon:"clipboard"},
    {label:"Health Status",value:"Vaccines up to date",icon:"syringe"},
    {label:"Exercise Today",value:exerciseTodayLabel,icon:"run"},
    {label:"Potty Schedule",value:pottyLabel,icon:"droplet"},
    {label:"Last Groomed",value:lastGroomedLabel,icon:"pencil"},
    {label:"Meals Today",value:"2 / 2 completed",icon:"bowl"},
    {label:"Training Phase",value:"Week 2 of 6",icon:"target"},
  ];
  // ── Every answer given during account setup, pulled straight from petData
  // (petData is populated with the full onboarding questionnaire on signup) ──
  const ROLE_LABELS = {bestfriend:"Best Friend",kid:"Kid",family:"Family Member",watchdog:"Watchdog",service:"Service / Emotional Support"};
  const fmtList = (arr) => Array.isArray(arr) && arr.length ? arr.join(", ") : "Not set";
  const setupAnswers=[
    {label:"Role in the Family",value:Array.isArray(petData?.role)&&petData.role.length?petData.role.map(r=>ROLE_LABELS[r]||r).join(", "):"Not set",icon:"heart"},
    {label:"Rescue",value:petData?.rescue==="yes"?"Yes":petData?.rescue==="no"?"No":"Not set",icon:"home"},
    {label:"Gender",value:petData?.gender==="boy"?"Boy":petData?.gender==="girl"?"Girl":"Not set",icon:"tag"},
    {label:"Knows Already",value:fmtList(petData?.knows),icon:"checkCircle"},
    {label:"Working On",value:fmtList(petData?.issues),icon:"target"},
    {label:"Daily Training Time",value:fmtList(petData?.trainTime),icon:"clock"},
    {label:"Preferred Training Time",value:petData?.trainHour?`${petData.trainHour}:${petData.trainMin||"00"} ${petData.trainAmPm||"AM"}`:"Not set",icon:"calendar"},
    {label:"Additional Pets in Home",value:petData?.additionalPets?"Yes":"No",icon:"paw"},
  ];
  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"18px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Unified Record</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"20px",color:T.text,fontWeight:"700"}}>Pet Life Record</h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}><Icon name="x" size={18}/></button>
      </div>

      {/* Pet hero card */}
      <div className="s1" style={{background:T.green,borderRadius:"18px",padding:"18px",marginBottom:"16px",position:"relative",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
          <label htmlFor={inputId} style={{width:"52px",height:"52px",borderRadius:"50%",background:petData?.photoUrl?"transparent":"rgba(176,141,87,.25)",border:`2px solid ${T.gold}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.gold,flexShrink:0,cursor:"pointer",overflow:"hidden",position:"relative"}}
            title={petData?.photoUrl?"Change photo":"Add a photo"}>
            {petData?.photoUrl
              ? <img src={petData.photoUrl} alt={petName} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <Icon name="cameraPlus" size={22}/>}
            <input id={inputId} type="file" accept="image/*" onChange={handlePhotoChange} style={{display:"none"}}/>
          </label>
          <div style={{flex:1}}>
            <h3 style={{fontFamily:"'Inter',serif",fontSize:"20px",fontWeight:"700",color:"#fff",marginBottom:"2px"}}>{petName}</h3>
            <p style={{fontSize:"12px",color:"rgba(255,255,255,.6)"}}>{petData?.breed||"Breed not set"} · {petData?.gender==="boy"?"Male":petData?.gender==="girl"?"Female":"Gender not set"} · {computeAge(petData?.birthday)||"Age not set"}</p>
          </div>
          {petData?.photoUrl && (
            <button onClick={removePhoto} title="Remove photo" style={{background:"rgba(0,0,0,.25)",border:"none",borderRadius:"7px",padding:"6px",cursor:"pointer",color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon name="trash" size={13}/>
            </button>
          )}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          {[{l:"Training",v:"42%"},{l:"Health",v:"Good",ic:"check"},{l:"Streak",v:"7d",ic:"flame"}].map(({l,v,ic})=>(
            <div key={l} style={{flex:1,background:"rgba(0,0,0,.25)",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
              <p style={{fontSize:"8.5px",color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:"2px"}}>{l}</p>
              <p style={{fontSize:"12.5px",fontWeight:"700",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:"3px"}}>{ic&&<Icon name={ic} size={11}/>}{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full stats grid */}
      <div className="s2" style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"14px"}}>
        {stats.map(({label,value,icon})=>(
          <div key={label} style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"12px 14px",display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{width:"28px",display:"flex",justifyContent:"center",flexShrink:0,color:T.gold}}><Icon name={icon} size={19}/></span>
            <div style={{flex:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:"12px",color:T.textMuted,fontWeight:"600"}}>{label}</p>
              <p style={{fontSize:"13px",fontWeight:"700",color:T.text,textAlign:"right",maxWidth:"55%"}}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Setup Answers — everything captured during account setup */}
      <div className="s2b" style={{marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"8px",paddingLeft:"2px"}}>From Your Setup</p>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {setupAnswers.map(({label,value,icon})=>(
            <div key={label} style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:"12px"}}>
              <span style={{width:"28px",display:"flex",justifyContent:"center",flexShrink:0,color:T.gold,marginTop:"1px"}}><Icon name={icon} size={19}/></span>
              <div style={{flex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px"}}>
                <p style={{fontSize:"12px",color:T.textMuted,fontWeight:"600",flexShrink:0}}>{label}</p>
                <p style={{fontSize:"13px",fontWeight:"700",color:T.text,textAlign:"right"}}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health records quick-links — uploading/viewing the actual files happens in
          Settings → Profile, so these tap through there instead of dead-ending. */}
      <div className="s3" style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Health Records</p>
        <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"10px",lineHeight:1.4}}>Tap any record to view or upload it in Settings.</p>
        {["Vaccine Records","Vet Records","Medications","Food & Allergies"].map(r=>(
          <div key={r} onClick={()=>onOpenSettings&&onOpenSettings()}
            style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`,cursor:onOpenSettings?"pointer":"default"}}>
            <span style={{fontSize:"13px",color:T.text}}>{r}</span>
            <span style={{fontSize:"12px",color:T.gold,cursor:"pointer",fontWeight:"700"}}>View →</span>
          </div>
        ))}
      </div>
    </ScrollBody>
  );
};

// ─── EMAIL SIMULATION HELPER ──────────────────────────────────────────────────
// ─── BRANDED EMAIL TEMPLATES ──────────────────────────────────────────────────
const LOGO_URL = LOGO_DATA_URI;
const SUPPORT_EMAIL = "info@guidingpaw.com";
const SUPPORT_PHONE = "801-435-1239";
const WEBSITE_URL = "https://guidingpaw.com/";
// Real email delivery goes through GoHighLevel, not a separate email
// provider — no new subscription needed. This app POSTs {to, subject, html}
// to a single GHL Inbound Webhook (same pattern as the other GHL_* webhooks
// in this file: GHL_PROFILE_SYNC_WEBHOOK, GHL_ACCOUNT_DELETED_WEBHOOK,
// GHL_CERTIFICATE_WEBHOOKS). On the GHL side, build ONE workflow that:
//   1. Triggers on this Inbound Webhook.
//   2. Uses a "Send Email" action where To = {{trigger.to}}, Subject =
//      {{trigger.subject}}, and Body = {{trigger.html}} (map the webhook's
//      html field into a custom value, then insert that custom value's
//      merge tag into the email body as HTML — GHL's email editor accepts
//      raw HTML pasted into a custom value this way).
// This keeps every branded HTML template already written below
// (buildDeleteEmail, buildCancellationEmail, etc.) exactly as designed —
// GHL is only the delivery mechanism, not the template builder. Paste the
// Inbound Webhook URL here once that workflow exists in GHL; left blank,
// simulateSendEmail falls back to console logging so nothing else breaks.
const GHL_EMAIL_WEBHOOK = "https://services.leadconnectorhq.com/hooks/Vgv3jETZdSkRK8bOLkJd/webhook-trigger/03ad1ca1-fa02-4452-a262-3463157d69af";

const emailShell = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Guiding Paw</title>
</head>
<body style="margin:0;padding:0;background:#f0ece4;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

        <!-- HEADER -->
        <tr><td style="background:#1C2636;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <img src="${LOGO_URL}" alt="Guiding Paw Training" width="90" style="display:block;margin:0 auto 14px;"/>
          <div style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#D8C6AE;letter-spacing:.02em;">Guiding Paw</div>
          <div style="font-size:11px;font-weight:700;letter-spacing:.2em;color:#4a7c5f;text-transform:uppercase;margin-top:3px;">Training</div>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#ffffff;padding:36px 32px;">
          ${bodyContent}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#1C2636;border-radius:0 0 16px 16px;padding:24px 32px;text-align:center;">
          <p style="margin:0 0 10px;font-size:12px;color:#B08D57;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Need Help?</p>
          <p style="margin:0 0 4px;font-size:13px;color:rgba(216,198,174,.8);">
            <a href="mailto:${SUPPORT_EMAIL}" style="color:#c9a870;text-decoration:none;">${SUPPORT_EMAIL}</a>
            &nbsp;·&nbsp;
            <a href="tel:${SUPPORT_PHONE.replace(/-/g,"")}" style="color:#c9a870;text-decoration:none;">${SUPPORT_PHONE}</a>
          </p>
          <p style="margin:8px 0 0;font-size:13px;">
            <a href="${WEBSITE_URL}" style="color:#c9a870;text-decoration:none;">${WEBSITE_URL}</a>
          </p>
          <p style="margin:14px 0 0;font-size:10px;color:rgba(216,198,174,.4);letter-spacing:.06em;">© ${new Date().getFullYear()} Guiding Paw Training. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const buildRenewalEmail = (details) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  const body = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1C2636;">Subscription Renewed</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">Hi ${details.name}, your subscription has been successfully renewed and your payment has been processed.</p>

    <!-- Receipt card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;border:1px solid #e0d8cc;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e0d8cc;">
        <span style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B08D57;">Payment Receipt</span>
      </td></tr>
      ${[
        ["Plan",details.plan],
        ["Amount Charged",details.amount],
        ["Card Charged","•••• •••• •••• "+details.card],
        ["Date Processed",dateStr+" · "+timeStr],
        ["Next Renewal Date",details.nextDate],
        ["Receipt Email",details.email],
      ].map(([l,v])=>`
      <tr><td style="padding:11px 20px;border-bottom:1px solid #e0d8cc;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:12px;color:#888;">${l}</td>
          <td style="font-size:13px;font-weight:700;color:#1C2636;text-align:right;">${v}</td>
        </tr></table>
      </td></tr>`).join("")}
    </table>

    <p style="font-size:13px;color:#555;line-height:1.7;margin:0 0 20px;">Thank you for being part of the Guiding Paw community. Your membership keeps your training journey going strong — we're excited to keep helping you and your dog grow together.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td align="center">
        <a href="${WEBSITE_URL}" style="display:inline-block;padding:13px 32px;background:#1C2636;color:#D8C6AE;font-family:'Georgia',serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;border-radius:10px;">Go to My Dashboard →</a>
      </td></tr>
    </table>

    <p style="font-size:11px;color:#aaa;line-height:1.6;margin:0;border-top:1px solid #e8e0d4;padding-top:16px;">If you didn't authorize this charge or have questions, contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#B08D57;">${SUPPORT_EMAIL}</a> or call <a href="tel:${SUPPORT_PHONE.replace(/-/g,"")}" style="color:#B08D57;">${SUPPORT_PHONE}</a>.</p>`;
  return { subject: `Guiding Paw — Subscription Renewed · ${details.amount}`, html: emailShell(body), to: details.email };
};

const buildDeleteEmail = (details) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  const purgeDate = new Date(now.getTime() + 30*24*60*60*1000).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;border-radius:50%;background:#f0f7f2;border:2px solid #4a7c5f;display:inline-flex;align-items:center;justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a7c5f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5l2.5 2.5 5.5-6"/></svg>
      </div>
    </div>

    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1C2636;text-align:center;">Account Deletion Confirmed</h2>
    <p style="margin:0 0 28px;font-size:14px;color:#666;line-height:1.6;text-align:center;">Hi ${details.name}, this email confirms that your Guiding Paw account has been scheduled for deletion.</p>

    <!-- Details card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;border:1px solid #e0d8cc;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e0d8cc;">
        <span style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B08D57;">Deletion Confirmation</span>
      </td></tr>
      ${[
        ["Account Email", details.email],
        ["Deletion Requested", dateStr+" · "+timeStr],
        ["Data Purge Date", purgeDate],
        ["Recovery Window", "30 days from deletion date"],
        ["Data Removed", "All training data, pet profiles &amp; records"],
      ].map(([l,v])=>`
      <tr><td style="padding:11px 20px;border-bottom:1px solid #e0d8cc;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:12px;color:#888;">${l}</td>
          <td style="font-size:13px;font-weight:700;color:#1C2636;text-align:right;">${v}</td>
        </tr></table>
      </td></tr>`).join("")}
    </table>

    <!-- 30-day recovery banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6e8;border:1.5px solid #e8c97a;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#B08D57;">Changed Your Mind?</p>
        <p style="margin:0 0 10px;font-size:13px;color:#5a4a2a;line-height:1.65;">Your data is kept securely for <strong>30 days</strong> before being permanently purged on <strong>${purgeDate}</strong>. If this was a mistake, contact us before that date and we can fully restore your account — no questions asked.</p>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;font-size:13px;color:#5a4a2a;"><a href="mailto:${SUPPORT_EMAIL}" style="color:#B08D57;font-weight:700;">${SUPPORT_EMAIL}</a></td>
          <td style="font-size:13px;color:#5a4a2a;"><a href="tel:${SUPPORT_PHONE.replace(/-/g,"")}" style="color:#B08D57;font-weight:700;">${SUPPORT_PHONE}</a></td>
        </tr></table>
      </td></tr>
    </table>

    <p style="font-size:13px;color:#555;line-height:1.7;margin:0 0 24px;">If you intended to delete your account and don't reach out within 30 days, all data will be permanently and irreversibly purged from our system on ${purgeDate}.</p>

    <p style="font-size:13px;color:#555;line-height:1.7;margin:0 0 24px;">We're sorry to see you go. Whenever you're ready to get back on track with your dog's training, we'd love to have you back.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td align="center">
        <a href="${WEBSITE_URL}" style="display:inline-block;padding:13px 32px;background:#1C2636;color:#D8C6AE;font-family:'Georgia',serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;border-radius:10px;">Re-Join Guiding Paw →</a>
      </td></tr>
    </table>

    <p style="font-size:11px;color:#aaa;line-height:1.6;margin:0;border-top:1px solid #e8e0d4;padding-top:16px;">To restore your account before ${purgeDate}, email <a href="mailto:${SUPPORT_EMAIL}" style="color:#B08D57;">${SUPPORT_EMAIL}</a> or call <a href="tel:${SUPPORT_PHONE.replace(/-/g,"")}" style="color:#B08D57;">${SUPPORT_PHONE}</a> with the subject line <strong style="color:#555;">"Account Recovery — ${details.email}"</strong>.</p>`;
  return { subject: `Guiding Paw — Your account has been scheduled for deletion`, html: emailShell(body), to: details.email };
};

// ─── INTERNAL / ADMIN NOTIFICATION EMAILS ────────────────────────────────────
// These always go to the business inbox (SUPPORT_EMAIL), not the member, so there's
// always a record of account changes and deletions on file.
const buildAdminProfileUpdateEmail = (details) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  const body = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1C2636;">Member Updated Their Account Info</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;"><strong>${details.memberName}</strong> (${details.memberEmail}) updated their account details on ${dateStr} · ${timeStr}.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;border:1px solid #e0d8cc;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e0d8cc;">
        <span style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B08D57;">Changes Made</span>
      </td></tr>
      ${details.changes.map(c=>`
      <tr><td style="padding:11px 20px;border-bottom:1px solid #e0d8cc;">
        <p style="margin:0 0 4px;font-size:12px;color:#888;">${c.label}</p>
        <p style="margin:0;font-size:13px;color:#1C2636;"><span style="text-decoration:line-through;color:#aaa;">${c.oldValue}</span>&nbsp;→&nbsp;<strong>${c.newValue}</strong></p>
      </td></tr>`).join("")}
    </table>
    <p style="font-size:12px;color:#999;line-height:1.6;margin:0;">Automated internal notification — no action needed unless something looks off.</p>`;
  return { subject: `Account Info Updated — ${details.memberName}`, html: emailShell(body), to: SUPPORT_EMAIL };
};

const buildAdminSubscriptionChangeEmail = (details) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  const body = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1C2636;">Subscription ${details.action}</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;"><strong>${details.memberName}</strong> (${details.memberEmail}) ${details.action.toLowerCase()} on ${dateStr} · ${timeStr}.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;border:1px solid #e0d8cc;border-radius:12px;margin-bottom:24px;">
      ${[["Plan",details.plan||"—"],["Action",details.action],["Details",details.extra||"—"]].map(([l,v])=>`
      <tr><td style="padding:11px 20px;border-bottom:1px solid #e0d8cc;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:12px;color:#888;">${l}</td><td style="font-size:13px;font-weight:700;color:#1C2636;text-align:right;">${v}</td></tr></table></td></tr>`).join("")}
    </table>
    <p style="font-size:12px;color:#999;line-height:1.6;margin:0;">Automated internal notification.</p>`;
  return { subject: `Subscription ${details.action} — ${details.memberName}`, html: emailShell(body), to: SUPPORT_EMAIL };
};

const buildAdminAccountDeletedEmail = (details) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  const petsList = (details.pets||[]).length
    ? details.pets.map(p=>`${p.name||"Unnamed pet"}${p.breed?` (${p.breed})`:""}`).join(", ")
    : "No pets on file";
  const body = `
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1C2636;">Account Deleted — Internal Record</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">A member deleted their account on ${dateStr} · ${timeStr}. Keeping this on file for your records.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;border:1px solid #e0d8cc;border-radius:12px;margin-bottom:24px;">
      ${[
        ["Name", details.name||"—"],
        ["Email", details.email||"—"],
        ["Phone", details.phone||"—"],
        ["Pet(s)", petsList],
        ["Plan", details.plan||"—"],
        ["Deleted On", dateStr+" · "+timeStr],
      ].map(([l,v])=>`
      <tr><td style="padding:11px 20px;border-bottom:1px solid #e0d8cc;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-size:12px;color:#888;">${l}</td><td style="font-size:13px;font-weight:700;color:#1C2636;text-align:right;">${v}</td></tr></table></td></tr>`).join("")}
    </table>
    <p style="font-size:12px;color:#999;line-height:1.6;margin:0;">The member also received their own confirmation email with the 30-day recovery window.</p>`;
  return { subject: `Account Deleted — ${details.name||details.email}`, html: emailShell(body), to: SUPPORT_EMAIL };
};

const buildCancellationEmail = (details) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  const accessDate = details.renewalDate || "the end of your current billing period";
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;border-radius:50%;background:#f5f0e8;border:2px solid #B08D57;margin:0 auto;display:inline-flex;align-items:center;justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B08D57" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5l2.5 2.5 5.5-6"/></svg>
      </div>
    </div>

    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1C2636;text-align:center;">Subscription Cancelled</h2>
    <p style="margin:0 0 28px;font-size:14px;color:#666;line-height:1.6;text-align:center;">Hi ${details.name}, your Guiding Paw subscription has been successfully cancelled. We're sorry to see you go.</p>

    <!-- Cancellation details card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;border:1px solid #e0d8cc;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e0d8cc;">
        <span style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B08D57;">Cancellation Confirmation</span>
      </td></tr>
      ${[
        ["Account Email", details.email],
        ["Plan Cancelled", details.plan],
        ["Cancelled On", dateStr+" · "+timeStr],
        ["Access Until", accessDate],
        ["Future Charges", "None — no further billing"],
      ].map(([l,v])=>`
      <tr><td style="padding:11px 20px;border-bottom:1px solid #e0d8cc;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:12px;color:#888;">${l}</td>
          <td style="font-size:13px;font-weight:700;color:#1C2636;text-align:right;">${v}</td>
        </tr></table>
      </td></tr>`).join("")}
    </table>

    <!-- Access reminder banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f2;border:1.5px solid #4a7c5f;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2F4F3E;">You Still Have Access</p>
        <p style="margin:0;font-size:13px;color:#2a4a38;line-height:1.65;">Your account remains fully active until <strong>${accessDate}</strong>. You can continue using all features until then — your training programs, pet records, and history are all still available.</p>
      </td></tr>
    </table>

    <p style="font-size:13px;color:#555;line-height:1.75;margin:0 0 14px;">After your access ends, your data will be retained for <strong>30 days</strong> in case you change your mind. You can reactivate your subscription at any time from the Billing &amp; Plan section in Settings.</p>

    <p style="font-size:13px;color:#555;line-height:1.75;margin:0 0 24px;">We'd love to know what we could do better. If you have a moment, reply to this email — your feedback helps us improve for every dog and owner we work with.</p>

    <!-- Reactivate CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td align="center">
        <a href="${WEBSITE_URL}" style="display:inline-block;padding:13px 32px;background:#1C2636;color:#D8C6AE;font-family:'Georgia',serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;border-radius:10px;">Reactivate My Subscription →</a>
      </td></tr>
    </table>

    <p style="font-size:11px;color:#aaa;line-height:1.6;margin:0;border-top:1px solid #e8e0d4;padding-top:16px;">Questions about your cancellation? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#B08D57;">${SUPPORT_EMAIL}</a> or <a href="tel:${SUPPORT_PHONE.replace(/-/g,"")}" style="color:#B08D57;">${SUPPORT_PHONE}</a>.</p>`;
  return { subject: `Guiding Paw — Your subscription has been cancelled`, html: emailShell(body), to: details.email };
};

const EMAIL_BUILDERS = {
  renewal: buildRenewalEmail,
  cancellation: buildCancellationEmail,
  deleteAccount: buildDeleteEmail,
  adminProfileUpdate: buildAdminProfileUpdateEmail,
  adminSubscriptionChange: buildAdminSubscriptionChangeEmail,
  adminAccountDeleted: buildAdminAccountDeletedEmail,
};
const simulateSendEmail = (type, details) => {
  // Real delivery happens through GoHighLevel (see GHL_EMAIL_WEBHOOK above),
  // not a separate email provider. Until that GHL workflow is built and its
  // webhook URL pasted in, this safely falls back to logging the email so
  // nothing else in the app breaks.
  const build = EMAIL_BUILDERS[type] || buildRenewalEmail;
  const email = build(details);
  const to = email.to || details.email;
  if (!GHL_EMAIL_WEBHOOK) {
    console.log(`[EMAIL — no GHL webhook configured, logging only] to ${to}\nSubject: ${email.subject}\n\n[HTML body — see email.html]\n`, email.html);
    return email;
  }
  fetch(GHL_EMAIL_WEBHOOK, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ type, to, subject: email.subject, html: email.html }),
  }).catch(err => console.error(`[email] failed to send "${email.subject}" to ${to}:`, err));
  return email;
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: SETTINGS (multi-tab: Profile / Settings / Contact / Sign Out)
// ═══════════════════════════════════════════════════════════════════════════════
const SettingsScreen = ({onSignOut,darkMode,setDarkMode,quickAddDocs=[],onOpenHandoutLibrary,onOpenVideoLibrary,petData,setPetData,onOpenDiagnosis,petId=null,userId=null,onAccountDeleted=()=>{},allPets=[],setAllPets=()=>{},switchActivePet=()=>{}}) => {
  const T=useTheme();
  const [tab,setTab]=useState("profile");
  const [showSaved,setShowSaved]=useState(false);

  // Delete account confirmation state
  const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
  const [deleteSuccess,setDeleteSuccess]=useState(false);
  const [deleteBusy,setDeleteBusy]=useState(false);
  const [deleteError,setDeleteError]=useState("");

  // Subscription state
  const [subStatus,setSubStatus]=useState("active"); // "active" | "cancelled"
  const [showCancelConfirm,setShowCancelConfirm]=useState(false);
  const [showRestartConfirm,setShowRestartConfirm]=useState(false);
  const [cancelEmailSent,setCancelEmailSent]=useState(false);
  const [restartSuccess,setRestartSuccess]=useState(false);

  // Update card state
  const [showUpdateCard,setShowUpdateCard]=useState(false);
  const [newCardNum,setNewCardNum]=useState("");
  const [newExpiry,setNewExpiry]=useState("");
  const [newCvv,setNewCvv]=useState("");
  const [newCardName,setNewCardName]=useState("");
  const [cardSaved,setCardSaved]=useState(false);

  // Change password state — real password change happens through Supabase Auth
  // (see handleSavePassword below). The app never stores the client's password itself.
  const [showChangePassword,setShowChangePassword]=useState(false);
  const [currentPw,setCurrentPw]=useState("");
  const [newPw,setNewPw]=useState("");
  const [confirmNewPw,setConfirmNewPw]=useState("");
  const [showCurrentPw,setShowCurrentPw]=useState(false);
  const [showNewPw,setShowNewPw]=useState(false);
  const [showConfirmNewPw,setShowConfirmNewPw]=useState(false);
  const [pwErrors,setPwErrors]=useState({});
  const [pwChangedSuccess,setPwChangedSuccess]=useState(false);
  const [pwSaving,setPwSaving]=useState(false);

  const resetPwFields=()=>{
    setCurrentPw("");setNewPw("");setConfirmNewPw("");
    setShowCurrentPw(false);setShowNewPw(false);setShowConfirmNewPw(false);
    setPwErrors({});
  };
  const closeChangePassword=()=>{ setShowChangePassword(false); resetPwFields(); };
  const handleGenerateNewPw=()=>{
    const generated=generateSecurePassword();
    setNewPw(generated); setConfirmNewPw(generated);
    setShowNewPw(true); setShowConfirmNewPw(true);
    setPwErrors(r=>({...r,newPw:undefined,confirmNewPw:undefined}));
  };
  // Real password change via Supabase Auth. Supabase doesn't offer a standalone
  // "check this password" call, so we verify the current password by attempting a
  // real sign-in with it (fails cleanly with a wrong-password error if it's incorrect)
  // before calling updateUser to actually set the new one. The password itself is
  // never stored in the app's own state or database — Supabase Auth owns it entirely.
  const handleSavePassword=async()=>{
    const e={};
    if(!currentPw)                e.currentPw="Enter your current password.";
    if(!isPasswordValid(newPw))   e.newPw=`Password must be at least ${PASSWORD_MIN_LENGTH} characters and include a capital letter, a number, and a special character.`;
    if(confirmNewPw!==newPw)      e.confirmNewPw="Passwords do not match.";
    setPwErrors(e);
    if(Object.keys(e).length>0) return;
    setPwSaving(true);
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: client.email, password: currentPw });
    if(verifyError){
      setPwSaving(false);
      setPwErrors({currentPw:"Current password is incorrect."});
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if(updateError){
      setPwErrors({newPw:"Something went wrong changing your password. Please try again."});
      return;
    }
    setShowChangePassword(false);
    resetPwFields();
    setPwChangedSuccess(true);
    setTimeout(()=>setPwChangedSuccess(false),3000);
  };

  // Pet profile state (supports multiple pets). The primary pet (index 0) is
  // initialized from — and kept in sync with — the real petData captured during
  // onboarding, so every setup answer stays stored and editable in one place.
  // Seeded from allPets (real, persisted pets loaded from Supabase) when
  // available; falls back to a single pet built from petData for the brief
  // window before that load completes, or if it's empty for some reason.
  const [pets,setPets]=useState(()=> allPets.length ? allPets : [{
    id:petId||undefined,
    name:petData?.name||"",breed:petData?.breed||"",birthday:petData?.birthday||"",
    gender:petData?.gender||"",weight:petData?.weight||"",
    food:petData?.food||"",allergiesAndSensitivities:petData?.allergiesAndSensitivities||"",
    medications:petData?.medications||"",grooming:petData?.grooming||"",potty:petData?.potty||"",
    docs:petData?.docs||[],
  }]);
  // allPets loads asynchronously and can resolve after this component has
  // already mounted with the single-pet fallback above — resync once it does.
  useEffect(()=>{ if(allPets && allPets.length) setPets(allPets); }, [allPets]);
  const [activePet,setActivePet]=useState(0);
  // Local pet-field keys don't all match the pets table's column names —
  // this mapping was previously incomplete (only birthday was handled),
  // which meant edits to allergies/grooming/potty notes were silently
  // failing to save to Supabase for every pet, including the primary one.
  const PET_FIELD_DB_MAP = {
    allergiesAndSensitivities: "allergies_sensitivities",
    grooming: "grooming_notes",
    potty: "potty_notes",
  };
  const sp=(k,v)=>{
    setPets(ps=>ps.map((p,i)=>i===activePet?{...p,[k]:v}:p));
    const activePetId = pets[activePet]?.id;
    // Mirror the same edit into the top-level pet list (used by the pet
    // switcher), matched by id rather than array index — the two lists are
    // normally in the same order, but matching by id is robust either way.
    if(activePetId) setAllPets(ps=>ps.map(p=>p.id===activePetId?{...p,[k]:v}:p));
    // Keep the top-level "currently active for training" pet record in
    // sync if that's the one being edited here — this is no longer always
    // index 0, since a household can switch which pet is active via the
    // pet switcher, independent of tab order in this Pet Profile screen.
    if(activePetId && activePetId===petId && setPetData) setPetData(d=>({...d,[k]:v}));
    // Persist pet field change to Supabase — every pet with a real id now
    // gets saved, not just the primary one (pets added via "+ Add Pet" get
    // a real id from addPet() below the moment they're created).
    if(activePetId){
      const dbKey = PET_FIELD_DB_MAP[k] || k;
      // Local state keeps the MM/DD/YYYY display format (computeAge and the
      // input itself both expect that) — only the value actually sent to
      // Postgres's `date` column needs converting to YYYY-MM-DD.
      const dbValue = k === "birthday" ? parseBirthday(v) : v;
      savePet(activePetId, {[dbKey]: dbValue});
    }
  };
  const pet=pets[activePet];

  // Client / account state — pre-filled from whatever was captured at signup
  const [client,setClient]=useState({
    firstName:petData?.firstName||"",lastName:petData?.lastName||"",
    email:petData?.email||"",phone:petData?.phone||"",countryCode:petData?.countryCode||"US",
    cardLast4:petData?.cardLast4||"",program:petData?.program||"",renewalDate:petData?.renewalDate||"",
  });
  const sc=(k,v)=>setClient(c=>({...c,[k]:v}));
  const [accountErrors,setAccountErrors]=useState({});
  // Tracks the last-saved values for name/email/phone so we can tell what actually
  // changed when "Save Account Info" is pressed, and notify the business by email.
  const committedClientRef = useRef({
    firstName:client.firstName, lastName:client.lastName, email:client.email, phone:client.phone,
  });

  const handleSavePetProfile=()=>{
    setShowSaved(true);
    setTimeout(()=>setShowSaved(false),2200);
  };

  const handleSaveAccountInfo=()=>{
    const e={};
    if(!isValidEmail(client.email)) e.email="Please enter a valid email (needs an @ and a .).";
    if(client.phone && !isValidPhone(client.phone,client.countryCode)) e.phone=`Please enter a valid ${findCountry(client.countryCode).digits}-digit phone number for ${findCountry(client.countryCode).name}.`;
    setAccountErrors(e);
    if(Object.keys(e).length>0) return;
    // Keep the account's email/phone in sync with the pet profile, same as
    // every other setting captured here.
    setPetData&&setPetData(d=>({...d,firstName:client.firstName,lastName:client.lastName,email:client.email,phone:client.phone,countryCode:client.countryCode}));

    // Notify the business by email whenever a member changes their own name,
    // email, or phone — so there's always a record of who changed what.
    const prev=committedClientRef.current;
    const fieldsToCheck=[
      {key:"firstName",label:"First Name"},
      {key:"lastName",label:"Last Name"},
      {key:"email",label:"Email"},
      {key:"phone",label:"Phone"},
    ];
    const changes=fieldsToCheck
      .filter(f=>(prev[f.key]||"")!==(client[f.key]||""))
      .map(f=>({label:f.label,oldValue:prev[f.key]||"(not set)",newValue:client[f.key]||"(not set)"}));
    if(changes.length){
      simulateSendEmail("adminProfileUpdate",{
        memberName:`${client.firstName||""} ${client.lastName||""}`.trim()||"Member",
        memberEmail:client.email,
        changes,
      });
      syncProfileToGHL(prev, client); // keep the GHL contact card in sync
    }
    committedClientRef.current={firstName:client.firstName,lastName:client.lastName,email:client.email,phone:client.phone};

    setShowSaved(true);
    setTimeout(()=>setShowSaved(false),2200);
  };

  // Training Setup — the account-setup questionnaire answers (role, knows, issues,
  // training time, preferred time) live on petData directly, same pattern as sp() for
  // pet fields, so edits here apply live and this button is just a confirmation toast.
  const setupSet=(k,v)=>setPetData&&setPetData(d=>({...d,[k]:v}));
  const setupToggle=(k,v)=>{
    setPetData&&setPetData(d=>({...d,[k]:(d?.[k]||[]).includes(v)?(d[k]||[]).filter(x=>x!==v):[...(d?.[k]||[]),v]}));
  };
  const handleSaveTrainingSetup=()=>{
    setShowSaved(true);
    setTimeout(()=>setShowSaved(false),2200);
  };


  const handleCancelSubscription=()=>{
    simulateSendEmail("cancellation",{
      name:client.firstName||"Member",
      email:client.email||"you@example.com",
      plan:"Ongoing Membership",
      renewalDate:client.renewalDate,
    });
    simulateSendEmail("adminSubscriptionChange",{
      memberName:`${client.firstName||""} ${client.lastName||""}`.trim()||"Member",
      memberEmail:client.email||"you@example.com",
      action:"Cancelled",
      plan:"Ongoing Membership",
      extra:`Access continues until ${client.renewalDate}`,
    });
    setSubStatus("cancelled");
    setShowCancelConfirm(false);
    setCancelEmailSent(true);
    setTimeout(()=>setCancelEmailSent(false),3500);
  };

  const handleRestartSubscription=()=>{
    simulateSendEmail("adminSubscriptionChange",{
      memberName:`${client.firstName||""} ${client.lastName||""}`.trim()||"Member",
      memberEmail:client.email||"you@example.com",
      action:"Reactivated",
      plan:"Ongoing Membership",
      extra:"Billing resumed immediately",
    });
    setSubStatus("active");
    setShowRestartConfirm(false);
    setRestartSuccess(true);
    setTimeout(()=>setRestartSuccess(false),3000);
  };

  const handleSaveCard=()=>{
    if(!newCardNum.trim()) return;
    const last4=newCardNum.replace(/\s/g,"").slice(-4);
    sc("cardLast4",last4);
    simulateSendEmail("adminSubscriptionChange",{
      memberName:`${client.firstName||""} ${client.lastName||""}`.trim()||"Member",
      memberEmail:client.email||"you@example.com",
      action:"Card Updated",
      plan:client.program?programLabel(client.program):"—",
      extra:`New card ending in ${last4}`,
    });
    setCardSaved(true);
    setShowUpdateCard(false);
    setNewCardNum("");setNewExpiry("");setNewCvv("");setNewCardName("");
    setTimeout(()=>setCardSaved(false),2500);
  };

  const handleDeleteAccount=async()=>{
    setDeleteError("");
    setDeleteBusy(true);
    // 1. Real, persisted deletion request — marks the account for deletion in
    //    Supabase (not just a UI flag). See requestAccountDeletion() for what
    //    happens next (30-day purge window, handled server-side).
    const { error } = await requestAccountDeletion(userId);
    if(error){
      setDeleteBusy(false);
      setDeleteError("Something went wrong and we couldn't process this. Please try again or contact support.");
      return;
    }
    // 2. Tag the GHL contact so it's immediately flagged as deleted.
    tagAccountDeletedInGHL({
      email: client.email || "",
      firstName: client.firstName || "",
      lastName: client.lastName || "",
    });
    // 3. Confirmation + internal notification emails.
    simulateSendEmail("deleteAccount",{
      name:client.firstName||"Member",
      email:client.email||"you@example.com",
    });
    simulateSendEmail("adminAccountDeleted",{
      name:`${client.firstName||""} ${client.lastName||""}`.trim()||"Member",
      email:client.email||"—",
      phone:client.phone||"—",
      pets:pets.map(p=>({name:p.name,breed:p.breed})),
      plan:client.program?programLabel(client.program):"—",
    });
    setDeleteBusy(false);
    setDeleteSuccess(true);
    // 4. End the session immediately — the account can no longer be used
    //    from this point on, even though the 30-day recovery window means
    //    the underlying data isn't purged yet.
    await supabase.auth.signOut();
    onAccountDeleted();
  };

  const fmtCard=(v)=>v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
  const fmtExp=(v)=>{ const d=v.replace(/\D/g,""); return d.length>=2?d.slice(0,2)+"/"+d.slice(2,4):d; };

  const [docUploadBusy,setDocUploadBusy]=useState(false);
  // Always re-sign a fresh url at the moment of viewing, rather than trust
  // whatever url was cached in state — that cached one can be well past its
  // 1-hour expiry if the app's been open a while. Falls back to doc.url for
  // the rare local-only entry that has no real storagePath (session-only
  // preview on a not-yet-persisted pet).
  const handleViewDoc=async(doc)=>{
    const fresh = doc.storagePath ? await getSignedDocUrl(doc.storagePath) : doc.url;
    if(fresh) window.open(fresh, "_blank", "noopener,noreferrer");
  };
  const handleUpload=(docType)=>{
    const input=document.createElement("input");
    input.type="file";
    input.accept=".pdf,.jpg,.jpeg,.png,.doc,.docx";
    input.onchange=async(e)=>{
      const file=e.target.files[0];
      if(!file) return;
      // Every pet now gets a real Supabase pet id the moment it's created
      // (see addPet below), so every pet's documents can go to real
      // Storage — not just the primary one.
      const activePetId=pets[activePet]?.id;
      if(activePetId){
        setDocUploadBusy(true);
        const uploaded=await uploadPetDocument(activePetId, file, docType);
        setDocUploadBusy(false);
        if(uploaded) setPets(ps=>ps.map((p,i)=>i===activePet?{...p,docs:[...(p.docs||[]),uploaded]}:p));
      }
      // If this pet somehow has no id yet (e.g. its insert is still in
      // flight), there's nowhere durable to put the file — nothing to do
      // here; the user can retry once the pet finishes being created.
    };
    input.click();
  };

  const addPet=async()=>{
    // Temp key lets us find this exact pet again once the insert resolves,
    // even if more pets get added in the meantime — safer than assuming
    // it's still the last item in the array by the time the await returns.
    const tempKey=`temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newPetLocal={tempKey,name:`Pet ${pets.length+1}`,breed:"",birthday:"",gender:"",food:"",allergiesAndSensitivities:"",medications:"",grooming:"",potty:"",docs:[]};
    setPets(ps=>[...ps,newPetLocal]);
    setAllPets(ps=>[...ps,newPetLocal]); // mirrors into the top-bar pet switcher immediately
    setActivePet(pets.length);
    if(!userId) return; // not signed in yet — stays local-only until it is
    const { data, error } = await supabase.from("pets").insert({
      owner_id: userId,
      name: `Pet ${pets.length+1}`,
      pet_type: "dog",
    }).select().single();
    if(error){ console.error("[pets] failed to create new pet:", error); return; }
    setPets(ps=>ps.map(p=>p.tempKey===tempKey?{...p,id:data.id}:p));
    setAllPets(ps=>ps.map(p=>p.tempKey===tempKey?{...p,id:data.id}:p));
  };

  const [petToDelete,setPetToDelete]=useState(null); // index, or null
  const deletePet=async(index)=>{
    if(pets.length<=1) return; // always keep at least one pet
    const target=pets[index];
    if(target?.id){
      // Real files in Storage aren't removed by the table's cascade delete
      // (that only cleans up Postgres rows) — clear them out explicitly so
      // a deleted pet's health records don't linger in the bucket forever.
      try{
        const { data: files } = await supabase.storage.from(PET_DOCUMENTS_BUCKET).list(target.id);
        if(files?.length){
          await supabase.storage.from(PET_DOCUMENTS_BUCKET).remove(files.map(f=>`${target.id}/${f.name}`));
        }
      }catch(err){ console.error("[pet-documents] failed to clean up storage on pet delete:", err); }
      const { error } = await supabase.from("pets").delete().eq("id", target.id);
      if(error){ console.error("[pets] failed to delete pet:", error); return; }
    }
    // If the pet being deleted is the one currently active for training,
    // the app can't be left pointing at a pet that no longer exists —
    // switch to whichever pet remains first.
    if(target?.id && target.id===petId){
      const fallback=allPets.find(p=>p.id && p.id!==target.id);
      if(fallback) switchActivePet(fallback.id);
    }
    setPets(ps=>ps.filter((_,i)=>i!==index));
    setAllPets(ps=>ps.filter(p=> target?.id ? p.id!==target.id : p.tempKey!==target?.tempKey));
    setActivePet(a=> a>=index ? Math.max(0,a-1) : a);
    setPetToDelete(null);
  };

  const TABS=[{id:"profile",label:"Profile"},{id:"settings",label:"Settings"},{id:"contact",label:"Contact Us"}];

  return (
    <ScrollBody>
      {/* Save confirmation popup */}
      {showSaved&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.success,color:"#fff",padding:"14px 28px",borderRadius:"14px",fontWeight:"900",fontSize:"15px",zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both"}}>
          Updated
        </div>
      )}

      {/* Card saved toast */}
      {cardSaved&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.success,color:"#fff",padding:"14px 28px",borderRadius:"14px",fontWeight:"900",fontSize:"15px",zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both"}}>
          <Icon name="card" size={13} style={{marginRight:"4px"}}/>Card Updated
        </div>
      )}

      {/* Cancellation email sent toast */}
      {cancelEmailSent&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.navy,border:`1px solid rgba(224,122,95,.5)`,color:T.text,padding:"14px 24px",borderRadius:"14px",fontWeight:"700",fontSize:"13px",zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both",textAlign:"center"}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}><Icon name="mail" size={13}/>Cancellation confirmed</span><br/><span style={{fontSize:"11px",color:T.textMuted}}>Confirmation email sent</span>
        </div>
      )}

      {/* Restart success toast */}
      {restartSuccess&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.success,color:"#fff",padding:"14px 28px",borderRadius:"14px",fontWeight:"900",fontSize:"15px",zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both",textAlign:"center"}}>
          <Icon name="party" size={13} style={{marginRight:"4px"}}/>Membership Reactivated!
        </div>
      )}

      {/* Cancel membership confirmation modal */}
      {showCancelConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"320px",width:"100%",animation:"rise .35s both"}}>
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div style={{marginBottom:"8px",display:"flex",justifyContent:"center",color:T.textFaint}}><Icon name="x" size={40}/></div>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Cancel Membership?</h3>
              <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"6px"}}>Your access will continue until <strong style={{color:T.text}}>{client.renewalDate}</strong>. No further charges will be made.</p>
              <p style={{fontSize:"12px",color:T.textFaint,lineHeight:1.5}}>You can reactivate at any time from this page.</p>
            </div>
            <button onClick={handleCancelSubscription} style={{width:"100%",padding:"12px",background:"rgba(224,122,95,.15)",border:"1.5px solid #e07a5f",borderRadius:"10px",color:"#e07a5f",fontWeight:"900",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:"8px",letterSpacing:".06em"}}>
              Yes, Cancel My Membership
            </button>
            <button onClick={()=>setShowCancelConfirm(false)} style={{width:"100%",padding:"12px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.text,fontWeight:"700",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Keep My Membership
            </button>
          </div>
        </div>
      )}

      {/* Restart membership confirmation modal */}
      {showRestartConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"320px",width:"100%",animation:"rise .35s both"}}>
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div style={{marginBottom:"8px",display:"flex",justifyContent:"center",color:T.gold}}><Icon name="paw" size={40}/></div>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Reactivate Membership?</h3>
              <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"6px"}}>Your Ongoing Membership will resume and your card ending in <strong style={{color:T.text}}>{client.cardLast4}</strong> will be billed on your next renewal date.</p>
            </div>
            <GoldBtn onClick={handleRestartSubscription} style={{marginBottom:"8px"}}>Yes, Reactivate →</GoldBtn>
            <button onClick={()=>setShowRestartConfirm(false)} style={{width:"100%",padding:"12px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.text,fontWeight:"700",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Not Yet
            </button>
          </div>
        </div>
      )}

      {/* Delete Pet confirmation modal */}
      {petToDelete!==null&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"320px",width:"100%",animation:"rise .35s both"}}>
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div style={{marginBottom:"8px",display:"flex",justifyContent:"center",color:T.brown}}><Icon name="alert" size={40}/></div>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Delete {pets[petToDelete]?.name||"This Pet"}?</h3>
              <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6}}>This permanently deletes their profile, uploaded documents, and training progress. This cannot be undone.</p>
            </div>
            <button onClick={()=>deletePet(petToDelete)} style={{width:"100%",padding:"12px",background:"rgba(224,122,95,.15)",border:"1.5px solid #e07a5f",borderRadius:"10px",color:"#e07a5f",fontWeight:"900",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:"8px",letterSpacing:".06em"}}>
              Yes, Delete {pets[petToDelete]?.name||"This Pet"}
            </button>
            <button onClick={()=>setPetToDelete(null)} style={{width:"100%",padding:"12px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.text,fontWeight:"700",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Account confirmation modal */}
      {showDeleteConfirm&&!deleteSuccess&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"320px",width:"100%",animation:"rise .35s both"}}>
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div style={{marginBottom:"8px",display:"flex",justifyContent:"center",color:T.brown}}><Icon name="alert" size={40}/></div>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Delete Account?</h3>
              <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6}}>Your account will be <strong style={{color:"#e07a5f"}}>deactivated immediately</strong> and your data will be <strong style={{color:"#e07a5f"}}>permanently purged in 30 days</strong>. You can contact us to restore your account any time before then — after that, it cannot be undone.</p>
              {deleteError&&<p style={{fontSize:"12px",color:"#e07a5f",marginTop:"10px"}}>{deleteError}</p>}
            </div>
            <button onClick={handleDeleteAccount} disabled={deleteBusy} style={{width:"100%",padding:"12px",background:"rgba(224,122,95,.15)",border:"1.5px solid #e07a5f",borderRadius:"10px",color:"#e07a5f",fontWeight:"900",fontSize:"13px",cursor:deleteBusy?"wait":"pointer",fontFamily:"'Lato',sans-serif",marginBottom:"8px",letterSpacing:".06em",opacity:deleteBusy?.7:1}}>
              {deleteBusy?"Deleting…":"Yes, Delete My Account"}
            </button>
            <button onClick={()=>setShowDeleteConfirm(false)} disabled={deleteBusy} style={{width:"100%",padding:"12px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.text,fontWeight:"700",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete success screen */}
      {deleteSuccess&&(
        <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"32px"}}>
          <div style={{textAlign:"center",animation:"rise .45s both",maxWidth:"300px"}}>
            <div style={{width:"80px",height:"80px",borderRadius:"50%",background:T.success,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:`0 0 0 16px rgba(76,175,125,.1)`}}><Icon name="check" size={36} color="#fff" strokeWidth={3}/></div>
            <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Account Deleted</h2>
            <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"6px"}}>Your account has been scheduled for deletion.</p>
            <p style={{fontSize:"12px",color:T.textFaint,marginBottom:"18px"}}>A confirmation email has been sent.</p>
            <div style={{background:"rgba(176,141,87,.1)",border:`1px solid rgba(176,141,87,.3)`,borderRadius:"12px",padding:"14px 16px",textAlign:"left"}}>
              <p style={{fontSize:"11px",fontWeight:"700",color:T.gold,marginBottom:"6px",letterSpacing:".08em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:"5px"}}><Icon name="clock" size={12}/>Changed your mind?</p>
              <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.6,marginBottom:"6px"}}>Your data is held for <strong style={{color:T.text}}>30 days</strong> before permanent purge. Contact us to restore your account:</p>
              <p style={{fontSize:"12px",color:T.gold,fontWeight:"700",marginBottom:"2px"}}>info@guidingpaw.com</p>
              <p style={{fontSize:"12px",color:T.gold,fontWeight:"700"}}>801-435-1239</p>
            </div>
          </div>
        </div>
      )}

      {/* Update Card modal */}
      {showUpdateCard&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"340px",width:"100%",animation:"rise .35s both"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"17px",fontWeight:"700",color:T.text}}>Update Payment Card</h3>
              <button onClick={()=>setShowUpdateCard(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}><Icon name="x" size={18}/></button>
            </div>
            {[
              {label:"Name on Card",val:newCardName,set:setNewCardName,ph:"Jane Smith",type:"text"},
              {label:"Card Number",val:newCardNum,set:(v)=>setNewCardNum(fmtCard(v)),ph:"1234 5678 9012 3456",type:"text"},
            ].map(f=>(
              <div key={f.label} style={{marginBottom:"12px"}}>
                <label style={{display:"block",fontSize:"9.5px",fontWeight:"700",color:T.gold,letterSpacing:".13em",textTransform:"uppercase",marginBottom:"4px"}}>{f.label}</label>
                <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  style={{width:"100%",padding:"11px 13px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"16px"}}>
              {[{label:"Expiry",val:newExpiry,set:(v)=>setNewExpiry(fmtExp(v)),ph:"MM/YY"},{label:"CVV",val:newCvv,set:setNewCvv,ph:"•••"}].map(f=>(
                <div key={f.label}>
                  <label style={{display:"block",fontSize:"9.5px",fontWeight:"700",color:T.gold,letterSpacing:".13em",textTransform:"uppercase",marginBottom:"4px"}}>{f.label}</label>
                  <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} maxLength={f.label==="CVV"?4:5}
                    style={{width:"100%",padding:"11px 13px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                </div>
              ))}
            </div>
            <GoldBtn onClick={handleSaveCard}>Save New Card</GoldBtn>
          </div>
        </div>
      )}

      {/* Change Password modal */}
      {showChangePassword&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"360px",width:"100%",maxHeight:"88vh",overflowY:"auto",animation:"rise .35s both"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"17px",fontWeight:"700",color:T.text}}>Change Password</h3>
              <button onClick={closeChangePassword} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}><Icon name="x" size={18}/></button>
            </div>

            {/* Current password */}
            <div style={{marginBottom:"14px"}}>
              <label style={{display:"block",fontSize:"9.5px",fontWeight:"700",color:pwErrors.currentPw?T.brown:T.gold,letterSpacing:".13em",textTransform:"uppercase",marginBottom:"4px"}}>Current Password</label>
              <div style={{position:"relative"}}>
                <input type={showCurrentPw?"text":"password"} value={currentPw}
                  onChange={e=>{setCurrentPw(e.target.value);setPwErrors(r=>({...r,currentPw:undefined}));}}
                  placeholder="Enter current password"
                  style={{width:"100%",padding:"11px 44px 11px 13px",background:T.inputBg,border:`1px solid ${pwErrors.currentPw?T.brown:T.inputBorder}`,borderRadius:"9px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                <button type="button" onClick={()=>setShowCurrentPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}><Icon name={showCurrentPw?"eyeOff":"eye"} size={16}/></button>
              </div>
              {pwErrors.currentPw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {pwErrors.currentPw}</p>}
            </div>

            {/* New password */}
            <div style={{marginBottom:"14px"}}>
              <label style={{display:"block",fontSize:"9.5px",fontWeight:"700",color:pwErrors.newPw?T.brown:T.gold,letterSpacing:".13em",textTransform:"uppercase",marginBottom:"4px"}}>New Password</label>
              <div style={{position:"relative"}}>
                <input type={showNewPw?"text":"password"} value={newPw}
                  onChange={e=>{setNewPw(e.target.value);setPwErrors(r=>({...r,newPw:undefined}));}}
                  placeholder={`Min ${PASSWORD_MIN_LENGTH} characters`}
                  style={{width:"100%",padding:"11px 44px 11px 13px",background:T.inputBg,border:`1px solid ${pwErrors.newPw?T.brown:T.inputBorder}`,borderRadius:"9px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                <button type="button" onClick={()=>setShowNewPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}><Icon name={showNewPw?"eyeOff":"eye"} size={16}/></button>
              </div>
              {pwErrors.newPw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {pwErrors.newPw}</p>}
              <PasswordStrengthMeter pw={newPw}/>
              <GeneratePasswordBtn onGenerate={handleGenerateNewPw}/>
              <PasswordChecklist pw={newPw}/>
            </div>

            {/* Confirm new password */}
            <div style={{marginBottom:"18px"}}>
              <label style={{display:"block",fontSize:"9.5px",fontWeight:"700",color:pwErrors.confirmNewPw?T.brown:T.gold,letterSpacing:".13em",textTransform:"uppercase",marginBottom:"4px"}}>Confirm New Password</label>
              <div style={{position:"relative"}}>
                <input type={showConfirmNewPw?"text":"password"} value={confirmNewPw}
                  onChange={e=>{setConfirmNewPw(e.target.value);setPwErrors(r=>({...r,confirmNewPw:undefined}));}}
                  placeholder="Re-enter new password"
                  style={{width:"100%",padding:"11px 44px 11px 13px",background:T.inputBg,border:`1px solid ${pwErrors.confirmNewPw?T.brown:T.inputBorder}`,borderRadius:"9px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                <button type="button" onClick={()=>setShowConfirmNewPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}><Icon name={showConfirmNewPw?"eyeOff":"eye"} size={16}/></button>
              </div>
              {pwErrors.confirmNewPw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {pwErrors.confirmNewPw}</p>}
              {!pwErrors.confirmNewPw && confirmNewPw.length>0 && confirmNewPw===newPw && <p style={{fontSize:"10px",color:"#4caf7d",marginTop:"3px",fontWeight:"600"}}><Icon name="check" size={11} strokeWidth={3} style={{marginRight:"2px"}}/>Passwords match</p>}
            </div>

            <GoldBtn onClick={handleSavePassword} disabled={pwSaving} style={{opacity:pwSaving?0.6:1}}>{pwSaving?"Saving…":"Save New Password"}</GoldBtn>
          </div>
        </div>
      )}

      <div className="s1" style={{marginBottom:"14px"}}>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Account</h2>
      </div>

      {onOpenHandoutLibrary && (
        <button onClick={onOpenHandoutLibrary}
          style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 15px",borderRadius:"12px",border:`1px solid ${T.chipBorder}`,background:T.chipBg,color:T.text,cursor:"pointer",marginBottom:"10px",transition:"all .2s"}}>
          <span style={{display:"flex",alignItems:"center",gap:"9px"}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:T.gold}}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span style={{fontSize:"13.5px",fontWeight:"700"}}>Training Handouts</span>
          </span>
          <span style={{color:T.textFaint}}>›</span>
        </button>
      )}

      {onOpenVideoLibrary && (
        <button onClick={onOpenVideoLibrary}
          style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 15px",borderRadius:"12px",border:`1px solid ${T.chipBorder}`,background:T.chipBg,color:T.text,cursor:"pointer",marginBottom:"16px",transition:"all .2s"}}>
          <span style={{display:"flex",alignItems:"center",gap:"9px"}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color:T.gold}}>
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span style={{fontSize:"13.5px",fontWeight:"700"}}>Training Videos</span>
          </span>
          <span style={{color:T.textFaint}}>›</span>
        </button>
      )}

      {/* Tab nav */}
      <div style={{display:"flex",gap:"6px",marginBottom:"16px",background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"5px"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"8px 4px",borderRadius:"8px",border:"none",cursor:"pointer",fontFamily:"'Lato',sans-serif",fontSize:"11px",fontWeight:"700",transition:"all .2s",
              background:tab===t.id?T.gold:"transparent",color:tab===t.id?"#fff":T.textMuted}}>
            {t.label}
          </button>
        ))}
        <button onClick={onSignOut}
          style={{flex:1,padding:"8px 4px",borderRadius:"8px",border:"none",cursor:"pointer",fontFamily:"'Lato',sans-serif",fontSize:"11px",fontWeight:"700",transition:"all .2s",background:"transparent",color:T.signOutText}}>
          Sign Out
        </button>
      </div>

      {/* PROFILE TAB — pet info */}
      {tab==="profile"&&(
        <>
          {/* Pet switcher */}
          {pets.length>1&&(
            <div style={{display:"flex",gap:"7px",marginBottom:"14px",flexWrap:"wrap"}}>
              {pets.map((p,i)=>(
                <button key={i} onClick={()=>setActivePet(i)}
                  style={{padding:"7px 14px",borderRadius:"20px",border:`1px solid ${activePet===i?T.gold:T.chipBorder}`,background:activePet===i?"rgba(176,141,87,.18)":T.chipBg,color:activePet===i?T.goldLight:T.textMuted,fontSize:"12px",fontWeight:activePet===i?"700":"400",cursor:"pointer",transition:"all .18s",fontFamily:"'Lato',sans-serif"}}>
                  {p.name||`Pet ${i+1}`}
                </button>
              ))}
            </div>
          )}

          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Pet Profile</p>
            {[
              {k:"name",l:"Pet Name",ph:"Buddy"},
              {k:"breed",l:"Breed",ph:"e.g. Labrador Retriever"},
              {k:"birthday",l:"Birthday",ph:"MM/DD/YYYY"},
              {k:"gender",l:"Gender",ph:"Male / Female"},
              {k:"weight",l:"Weight",ph:"e.g. 45 lbs"},
              {k:"food",l:"Daily Food Amount",ph:"e.g. 2 cups twice daily"},
              {k:"allergiesAndSensitivities",l:"Allergies & Food Sensitivities",ph:"e.g. chicken, pollen, bee stings"},
              {k:"medications",l:"Medications",ph:"Name, dose, frequency"},
              {k:"grooming",l:"Grooming Needs",ph:"e.g. brush 3x/week"},
              {k:"potty",l:"Potty Training Notes",ph:"Schedule, signals, accidents"},
            ].map(({k,l,ph})=>(
              <div key={k} style={{marginBottom:"10px"}}>
                <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"4px"}}>{l}</label>
                <input value={pet[k]||""} onChange={e=>sp(k,k==="name"?capitalizeName(e.target.value):e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 13px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13.5px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                {k==="birthday" && computeAge(pet.birthday) && (
                  <p style={{fontSize:"10.5px",color:T.textFaint,marginTop:"4px"}}>Current age: <strong style={{color:T.textMuted}}>{computeAge(pet.birthday)}</strong> (calculated automatically)</p>
                )}
              </div>
            ))}
            <GoldBtn onClick={handleSavePetProfile} style={{marginTop:"6px",padding:"11px",fontSize:"12px"}}>Save Pet Profile</GoldBtn>
            {pets.length>1&&(
              <button onClick={()=>setPetToDelete(activePet)} style={{width:"100%",marginTop:"8px",padding:"10px",background:"transparent",border:"1px solid rgba(224,122,95,.4)",borderRadius:"9px",color:"#e07a5f",fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
                Delete This Pet
              </button>
            )}
          </div>

          {/* Training Setup — everything captured during the onboarding questionnaire,
              editable here since a dog's needs, skills, and schedule change over time. */}
          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Training Setup</p>
            <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"12px",lineHeight:1.4}}>From your account setup — update anytime things change.</p>

            <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"7px"}}>Role in the Family</label>
            <ChipGroup options={[{value:"bestfriend",label:"Best Friend"},{value:"kid",label:"Kid"},{value:"family",label:"Family Member"},{value:"watchdog",label:"Watchdog"},{value:"service",label:"Service / Emotional Support"}]}
              selected={petData?.role} onToggle={v=>setupToggle("role",v)}/>

            <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"7px"}}>Knows Already</label>
            <ChipGroup options={["Name","Stand","Sit","Down","Leave it","Come / Here","Crate / Kennel","Heel","High five / Shake","None of the above"]}
              selected={petData?.knows} onToggle={v=>setupToggle("knows",v)}/>

            <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"7px"}}>Behavior Issues to Work On</label>
            <ChipGroup options={["Walking","Potty issues","Biting","Chewing","Jumping","Destructive behavior","Counter surfing","Eating poop","Barking","Reactivity / Aggression","Separation anxiety","Humping","Crate training","Socialization"]}
              selected={petData?.issues} onToggle={v=>setupToggle("issues",v)}/>

            <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"7px"}}>Daily Training Time</label>
            <ChipGroup options={["5 – 10 min","15 – 30 min","More than 30 min"]}
              selected={petData?.trainTime} onToggle={v=>setupToggle("trainTime",v)}/>

            <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"7px"}}>Preferred Training Time</label>
            <div style={{display:"flex",alignItems:"center",gap:"10px",margin:"4px 0 18px"}}>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:"9px",color:T.textFaint,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"5px"}}>Hour</p>
                <div style={{height:"88px",overflowY:"auto",border:`1px solid ${T.inputBorder}`,borderRadius:"9px",width:"54px",scrollSnapType:"y mandatory"}}>
                  {Array.from({length:12},(_,i)=>i+1).map(h=><div key={h} onClick={()=>setupSet("trainHour",String(h))} style={{height:"30px",display:"flex",alignItems:"center",justifyContent:"center",scrollSnapAlign:"start",cursor:"pointer",background:petData?.trainHour===String(h)?"rgba(176,141,87,.2)":"transparent",color:petData?.trainHour===String(h)?T.gold:T.text,fontSize:"14px",fontWeight:"700"}}>{h}</div>)}
                </div>
              </div>
              <div style={{fontSize:"20px",color:T.gold,fontWeight:"900",paddingTop:"22px"}}>:</div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:"9px",color:T.textFaint,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"5px"}}>Min</p>
                <div style={{height:"88px",overflowY:"auto",border:`1px solid ${T.inputBorder}`,borderRadius:"9px",width:"54px",scrollSnapType:"y mandatory"}}>
                  {["00","05","10","15","20","25","30","35","40","45","50","55"].map(m=><div key={m} onClick={()=>setupSet("trainMin",m)} style={{height:"30px",display:"flex",alignItems:"center",justifyContent:"center",scrollSnapAlign:"start",cursor:"pointer",background:(petData?.trainMin||"00")===m?"rgba(176,141,87,.2)":"transparent",color:(petData?.trainMin||"00")===m?T.gold:T.text,fontSize:"14px",fontWeight:"700"}}>{m}</div>)}
                </div>
              </div>
              <div style={{textAlign:"center",paddingTop:"22px"}}>
                <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>{["AM","PM"].map(ap=><button key={ap} onClick={()=>setupSet("trainAmPm",ap)} style={{padding:"8px 11px",borderRadius:"7px",fontWeight:"700",fontSize:"11px",border:`1px solid ${petData?.trainAmPm===ap?T.gold:T.inputBorder}`,background:petData?.trainAmPm===ap?"rgba(176,141,87,.18)":T.inputBg,color:petData?.trainAmPm===ap?T.gold:T.text,cursor:"pointer"}}>{ap}</button>)}</div>
              </div>
            </div>

            <GoldBtn onClick={handleSaveTrainingSetup} style={{padding:"11px",fontSize:"12px"}}>Save Training Setup</GoldBtn>
          </div>

          {/* Health records / upload */}
          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Health Records</p>
            {["Vaccine Records","Vet Records"].map(r=>(
              <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
                <span style={{fontSize:"13.5px",color:T.text}}>{r}</span>
                <button onClick={()=>handleUpload(r)} disabled={docUploadBusy} style={{background:T.streakCard,border:`1px solid ${T.streakBorder}`,borderRadius:"8px",padding:"5px 12px",fontSize:"11px",color:T.gold,cursor:docUploadBusy?"wait":"pointer",fontWeight:"700",opacity:docUploadBusy?.6:1}}>{docUploadBusy?"Uploading…":"Upload"}</button>
              </div>
            ))}
            {/* Uploaded docs + quick-add notes */}
            {([...(pet.docs||[]),...quickAddDocs]).length>0&&(
              <div style={{marginTop:"12px"}}>
                <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",letterSpacing:".13em",textTransform:"uppercase",marginBottom:"8px"}}>Attached Documents & Notes</p>
                {[...(pet.docs||[]),...quickAddDocs].map((doc,di)=>(
                  <div key={di} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 10px",background:T.navyAccentBg,border:`1px solid ${T.navyAccentBorder}`,borderRadius:"9px",marginBottom:"6px"}}>
                    <Icon name={(doc.storagePath||doc.url)?"clipboard":"pencil"} size={16}/>
                    <div style={{flex:1}}>
                      <p style={{fontSize:"12px",fontWeight:"700",color:T.text,marginBottom:"1px"}}>{doc.name}</p>
                      <p style={{fontSize:"10px",color:T.textMuted}}>{doc.type} · {doc.date}</p>
                    </div>
                    {(doc.storagePath||doc.url)&&(
                      <ProtectedMedia type="document">
                        <button
                          onClick={()=>handleViewDoc(doc)}
                          onContextMenu={e=>e.preventDefault()}
                          style={{fontSize:"11px",color:T.gold,fontWeight:"700",background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"'Lato',sans-serif"}}>View</button>
                      </ProtectedMedia>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={addPet} style={{width:"100%",padding:"11px",background:"transparent",border:`1px dashed ${T.gold}`,borderRadius:"11px",color:T.gold,fontSize:"12px",fontWeight:"700",cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:"12px"}}>
            + Add Another Pet
          </button>
        </>
      )}

      {/* SETTINGS TAB — client / account info */}
      {tab==="settings"&&(
        <>
          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Account Info</p>
            {[
              {k:"firstName",l:"First Name",ph:"Jane"},
              {k:"lastName",l:"Last Name",ph:"Smith"},
            ].map(({k,l,ph})=>(
              <div key={k} style={{marginBottom:"10px"}}>
                <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"4px"}}>{l}</label>
                <input value={client[k]||""} onChange={e=>sc(k,capitalizeName(e.target.value))} placeholder={ph} style={{width:"100%",padding:"10px 13px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13.5px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
              </div>
            ))}

            {/* Email — validated for @ and . on save */}
            <div style={{marginBottom:"10px"}}>
              <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:accountErrors.email?T.brown:T.gold,fontWeight:"700",marginBottom:"4px"}}>Email</label>
              <input type="email" value={client.email||""} onChange={e=>{sc("email",e.target.value);setAccountErrors(r=>({...r,email:undefined}));}} placeholder="you@example.com"
                style={{width:"100%",padding:"10px 13px",background:T.inputBg,border:`1px solid ${accountErrors.email?T.brown:T.inputBorder}`,borderRadius:"9px",fontSize:"13.5px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
              {accountErrors.email&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}><Icon name="alert" size={11} style={{marginRight:"2px"}}/> {accountErrors.email}</p>}
            </div>

            {/* Phone — country picked first so we know which digit-count/format to validate against */}
            <div style={{marginBottom:"10px"}}>
              <PhoneField label="Phone" countryCode={client.countryCode||"US"} onCountryChange={v=>sc("countryCode",v)}
                phone={client.phone||""} onPhoneChange={v=>sc("phone",v)}
                error={accountErrors.phone} onFocusClear={()=>setAccountErrors(r=>({...r,phone:undefined}))}/>
            </div>

            <GoldBtn onClick={handleSaveAccountInfo} style={{marginTop:"6px",padding:"11px",fontSize:"12px"}}>Save Account Info</GoldBtn>
          </div>

          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Password</p>
            {pwChangedSuccess ? (
              <div style={{background:"rgba(76,175,125,.1)",border:"1px solid rgba(76,175,125,.3)",borderRadius:"10px",padding:"10px 13px",display:"flex",alignItems:"center",gap:"8px"}}>
                <Icon name="check" size={16} color={T.success} strokeWidth={3}/>
                <p style={{fontSize:"12px",color:"#4caf7d",fontWeight:"700"}}>Password updated successfully.</p>
              </div>
            ) : (
              <>
                <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.5,marginBottom:"10px"}}>Keep your account secure with a strong, unique password.</p>
                <button onClick={()=>setShowChangePassword(true)} style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"9px",color:T.gold,fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
                  <Icon name="lock" size={13}/>Change Password
                </button>
              </>
            )}
          </div>

          {/* Your Program — a one-time purchase, not a subscription. No renewal
              date and no cancel option here; that only applies to the
              recurring Ongoing Membership below. */}
          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase"}}>Your Program</p>
              <span style={{fontSize:"10px",fontWeight:"900",letterSpacing:".08em",padding:"3px 9px",borderRadius:"20px",background:"rgba(76,175,125,.15)",color:"#4caf7d",border:"1px solid rgba(76,175,125,.4)"}}>
                ● PURCHASED
              </span>
            </div>
            {[
              {l:"Program",v:client.program?programLabel(client.program):"—"},
              {l:"Type",v:"One-time purchase"},
              {l:"Card on File",v:`•••• •••• •••• ${client.cardLast4}`},
            ].map(({l,v})=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
                <span style={{fontSize:"12px",color:T.textMuted}}>{l}</span>
                <span style={{fontSize:"12px",fontWeight:"700",color:T.text}}>{v}</span>
              </div>
            ))}
            <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.55,marginTop:"10px"}}>Your program is a single one-time purchase — there's nothing to renew or cancel here. Once you graduate, you can choose to continue with Ongoing Membership below.</p>
            <button onClick={()=>setShowUpdateCard(true)} style={{width:"100%",marginTop:"12px",padding:"10px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"9px",color:T.gold,fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
              <Icon name="card" size={13} style={{marginRight:"5px"}}/>Update / Change Payment Card
            </button>
          </div>

          {/* Ongoing Membership — the recurring, cancellable part of the new
              pricing model ($/mo after graduation). This is what Cancel /
              Reactivate and the renewal date actually apply to. */}
          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase"}}>Ongoing Membership</p>
              <span style={{fontSize:"10px",fontWeight:"900",letterSpacing:".08em",padding:"3px 9px",borderRadius:"20px",
                background:subStatus==="active"?"rgba(76,175,125,.15)":"rgba(224,122,95,.12)",
                color:subStatus==="active"?"#4caf7d":"#e07a5f",
                border:`1px solid ${subStatus==="active"?"rgba(76,175,125,.4)":"rgba(224,122,95,.35)"}`}}>
                {subStatus==="active"?"● ACTIVE":"● CANCELLED"}
              </span>
            </div>

            {/* Cancelled banner */}
            {subStatus==="cancelled"&&(
              <div style={{background:"rgba(224,122,95,.08)",border:"1px solid rgba(224,122,95,.25)",borderRadius:"10px",padding:"12px 14px",marginBottom:"12px"}}>
                <p style={{fontSize:"12px",fontWeight:"700",color:"#e07a5f",marginBottom:"4px"}}>Membership Cancelled</p>
                <p style={{fontSize:"11.5px",color:T.textMuted,lineHeight:1.55}}>Your access continues until <strong style={{color:T.text}}>{client.renewalDate}</strong>. Reactivate below to resume billing and keep your membership going.</p>
              </div>
            )}

            {[
              {l:"Price",v:`$${PROGRAM_PRICE.membership}/mo`},
              {l:subStatus==="cancelled"?"Access Until":"Next Renewal",v:client.renewalDate},
              {l:"Card on File",v:`•••• •••• •••• ${client.cardLast4}`},
            ].map(({l,v})=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
                <span style={{fontSize:"12px",color:T.textMuted}}>{l}</span>
                <span style={{fontSize:"12px",fontWeight:"700",color:T.text}}>{v}</span>
              </div>
            ))}

            {/* Cancel or Reactivate */}
            {subStatus==="active"?(
              <button onClick={()=>setShowCancelConfirm(true)} style={{width:"100%",marginTop:"12px",padding:"10px",background:"transparent",border:`1px solid rgba(224,122,95,.4)`,borderRadius:"9px",color:"#e07a5f",fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
                Cancel Membership
              </button>
            ):(
              <GoldBtn onClick={()=>setShowRestartConfirm(true)} style={{marginTop:"12px",padding:"11px",fontSize:"12px"}}>
                Reactivate My Membership
              </GoldBtn>
            )}

            {/* Real receipt emails are sent automatically on renewal via the GHL
                webhook (see GHL_EMAIL_WEBHOOK) — the demo simulate-button that
                used to be here has been removed. */}
          </div>

          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{darkMode?"Dark Mode":"Light Mode"}</p><p style={{fontSize:"11px",color:T.textMuted}}>Switch display preference</p></div>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
          </div>

          {/* Delete Account */}
          <div style={{background:"rgba(224,122,95,.06)",border:"1.5px solid rgba(224,122,95,.25)",borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:"#e07a5f",fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"8px"}}>Danger Zone</p>
            <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.5,marginBottom:"12px"}}>Deactivate your account immediately and schedule your training data for permanent deletion after a 30-day recovery window.</p>
            <button onClick={()=>setShowDeleteConfirm(true)} style={{width:"100%",padding:"11px",background:"rgba(224,122,95,.12)",border:"1.5px solid #e07a5f",borderRadius:"9px",color:"#e07a5f",fontWeight:"900",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif",letterSpacing:".06em"}}>
              <Icon name="trash" size={13} style={{marginRight:"4px"}}/>Delete My Account
            </button>
          </div>
        </>
      )}

      {/* CONTACT TAB */}
      {tab==="contact"&&(
        <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"18px",marginBottom:"12px"}}>
          <div style={{textAlign:"center",marginBottom:"18px"}}>
            <LogoImg size={48}/>
            <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginTop:"10px",marginBottom:"4px"}}>Guiding Paw</h3>
            <p style={{fontSize:"12px",color:T.textMuted}}>Professional Dog Training</p>
          </div>
          {[
            {icon:"mail",label:"Email",val:"info@guidingpaw.com",href:"mailto:info@guidingpaw.com"},
            {icon:"phone",label:"Phone",val:"801-435-1239",href:"tel:+18014351239"},
            {icon:"globe",label:"Website",val:"www.guidingpaw.com",href:"https://guidingpaw.com/"},
            {icon:"pin",label:"Location",val:"Serving clients worldwide"},
          ].map(({icon,label,val,href})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:"12px",padding:"11px 0",borderBottom:`1px solid ${T.divider}`}}>
              <span style={{width:"26px",display:"flex",justifyContent:"center",color:T.gold}}><Icon name={icon} size={17}/></span>
              <div>
                <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",textTransform:"uppercase",letterSpacing:".1em",marginBottom:"2px"}}>{label}</p>
                {href
                  ? <a href={href} target={href.startsWith("http")?"_blank":undefined} rel={href.startsWith("http")?"noopener noreferrer":undefined}
                      style={{fontSize:"13px",color:T.text,fontWeight:"600",textDecoration:"none",cursor:"pointer"}}
                      onMouseEnter={e=>{e.currentTarget.style.color=T.gold;e.currentTarget.style.textDecoration="underline";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=T.text;e.currentTarget.style.textDecoration="none";}}>
                      {val}
                    </a>
                  : <p style={{fontSize:"13px",color:T.text,fontWeight:"600"}}>{val}</p>}
              </div>
            </div>
          ))}
          <div style={{marginTop:"16px",background:T.navyAccentBg,border:`1px solid ${T.navyAccentBorder}`,borderRadius:"10px",padding:"12px 14px"}}>
            <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.6,textAlign:"center"}}>
              We typically respond within 24 hours. For urgent training questions,{" "}
              {onOpenDiagnosis
                ? <span onClick={onOpenDiagnosis} style={{color:T.gold,textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:"2px",cursor:"pointer",fontWeight:"700"}}>use the Training Focus Finder</span>
                : <>use the Training Focus Finder</>} in the app.
            </p>
          </div>
        </div>
      )}
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
function App() {
  // Some Chrome installs fail to paint the initial CSS media-query layout (mobile vs.
  // desktop view) on first load, leaving the page blank until something forces a
  // reflow — e.g. resizing the window or opening DevTools. Dispatching a resize event
  // shortly after mount reliably nudges Chrome to repaint, with no visible effect on
  // browsers that aren't affected by this quirk.
  // Some Chrome installs fail to paint the initial CSS media-query layout (mobile vs.
  // desktop view) on first load, leaving the page blank until something forces a real
  // reflow — e.g. resizing the window or opening DevTools. A synthetic "resize" event
  // alone doesn't trigger this (it doesn't change actual page dimensions), so instead we
  // briefly toggle the page's visibility, which forces Chrome to recompute layout and
  // repaint for real. No visible effect on browsers that aren't affected by this quirk.
  useEffect(() => {
    const t = setTimeout(() => {
      document.documentElement.style.display = "none";
      void document.documentElement.offsetHeight; // force synchronous layout recalculation
      document.documentElement.style.display = "";
    }, 60);
    return () => clearTimeout(t);
  }, []);

  const [darkMode,setDarkMode]=useState(true);
  const T=darkMode?DARK:LIGHT;
  const [screen,setScreen]=useState("signin");
  const [page,setPage]=useState("dashboard");
  const [plan,setPlan]=useState("annual");
  const [petData,setPetData]=useState(null);
  const [pendingData,setPendingData]=useState(null);
  const [regData,setRegData]=useState(null); // from registration screen
  const [userId, setUserId] = useState(null);
  // All of the account's pets (not just the primary one used for training/
  // curriculum) — loaded so pet profiles added via "+ Add Pet" in Settings
  // persist for real instead of resetting every session.
  const [allPets, setAllPets] = useState([]);
  // Message shown on the sign-in screen when this device gets signed out
  // because the account was logged in somewhere else (see claimSessionSlot /
  // stillHoldsSessionSlot above).
  const [sessionKickedMsg, setSessionKickedMsg] = useState("");
  const [petId, setPetId] = useState(null);
  const [showPlus,setShowPlus]=useState(false);
  const [showDiag,setShowDiag]=useState(false);
  const [showLifeRecord,setShowLifeRecord]=useState(false);
  const [mobileNavOpen,setMobileNavOpen]=useState(false);
  const [showHandout,setShowHandout]=useState(null); // null | "__library__" | handout id
  const [handoutHistory,setHandoutHistory]=useState([]); // stack of previously-viewed handout screens
  // Opens the Behavior Diagnosis tool from anywhere in the app (e.g. a "use the
  // diagnosis tool" link) and clears any other overlay so it's the only thing shown.
  const openDiagnosis=()=>{
    setShowDiag(true);
    setShowLifeRecord(false); setShowWelcome(false);
    setShowVideo(null); setVideoHistory([]);
    setShowHandout(null); setHandoutHistory([]);
    setShowGame(null);
  };
  const openHandout=(id)=>{
    if(showHandout) setHandoutHistory(h=>[...h, showHandout]); // remember where we came from
    setShowHandout(id);
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowGame(null);
  };
  const openHandoutLibrary=()=>{
    setHandoutHistory([]); // fresh entry point — nothing to go back to yet
    setShowHandout("__library__");
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowGame(null);
  };
  const goBackHandout=()=>{
    if(handoutHistory.length===0){ setShowHandout(null); return; }
    const remaining=handoutHistory.slice(0,-1);
    const prev=handoutHistory[handoutHistory.length-1];
    setHandoutHistory(remaining);
    setShowHandout(prev);
  };
  const closeHandout=()=>{ setShowHandout(null); setHandoutHistory([]); };
  const [showVideo,setShowVideo]=useState(null); // null | "__library__" | video id
  const [videoHistory,setVideoHistory]=useState([]); // stack of previously-viewed video screens
  const openVideo=(id)=>{
    if(id!=="__library__" && !isVideoUnlocked(id)){
      const label = videoUnlocksWithLabel(id);
      setVideoLockedMsg(label ? `This video unlocks with ${label}.` : "This video isn't unlocked yet.");
      setTimeout(()=>setVideoLockedMsg(null),3000);
      return;
    }
    if(showVideo) setVideoHistory(h=>[...h, showVideo]); // remember where we came from
    setShowVideo(id);
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowGame(null);
  };
  const openVideoLibrary=()=>{
    setVideoHistory([]); // fresh entry point — nothing to go back to yet
    setShowVideo("__library__");
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowGame(null);
  };
  const goBackVideo=()=>{
    if(videoHistory.length===0){ setShowVideo(null); return; }
    const remaining=videoHistory.slice(0,-1);
    const prev=videoHistory[videoHistory.length-1];
    setVideoHistory(remaining);
    setShowVideo(prev);
  };
  const closeVideo=()=>{ setShowVideo(null); setVideoHistory([]); };
  const [showWelcome,setShowWelcome]=useState(false);
  // Game instructions (Bond screen) — same open/close pattern as handouts/videos.
  const [showGame,setShowGame]=useState(null); // null | game id
  const openGame=(id)=>{
    setShowGame(id);
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);
    setShowVideo(null);setVideoHistory([]);setShowHandout(null);setHandoutHistory([]);
  };
  const closeGame=()=>setShowGame(null);
  // Shared puppy program state — lifted so Dashboard can show correct assignment/streak
  const [puppyCompleted,setPuppyCompleted]=useState({});
  const [stdCompleted,setStdCompleted]=useState({});
  // Dashboard "Today's Assignment" and "Daily Routine Builder" checkbox state —
  // lifted here (not local to DashboardScreen) so checking something off and
  // navigating away (e.g. the back arrow) doesn't lose the progress.
  const [assignDone,setAssignDone]=useState({});
  const [routineDone,setRoutineDone]=useState({});
  const [puppyWeekDone,setPuppyWeekDone]=useState({});
  const [puppyStreak,setPuppyStreak]=useState(3);
  // Which curriculum week is expanded, and when each week was marked complete —
  // lifted here (not local to LearnScreen) so opening a lesson video and hitting
  // Back returns to exactly this same week instead of collapsing back to the top.
  const [learnOpenWeek,setLearnOpenWeek]=useState(null);
  const [weekCompletedAt,setWeekCompletedAt]=useState({});
  // Tracks whether each program's required welcome video has been watched
  const [welcomeVideoWatched,setWelcomeVideoWatched]=useState({standard:false, puppy:false});

  // ── Load all user data from Supabase (called on sign-in and session restore) ──
  // ── Loads one pet's training data (enrollment, lesson progress, streak) ──
  // Extracted so both the initial sign-in load AND switching between pets
  // (see switchActivePet below) can reuse the exact same logic — a pet's
  // training progress works identically no matter which pet it is.
  const loadPetTrainingData = async (petIdVal) => {
    const result = { purchasedPrograms: [], enrolledProgram: undefined, stdC: {}, puppyC: {}, weekDone: {}, weekCAt: {}, welcomeVid: { standard: false, puppy: false }, streak: 0 };
    const { data: enrollments } = await supabase.from("program_enrollment").select("*").eq("pet_id", petIdVal);
    if (enrollments?.length) {
      result.purchasedPrograms = enrollments.map(e => e.program);
      result.enrolledProgram = enrollments[0].program;
    }
    const { data: progress } = await supabase.from("lesson_progress").select("*").eq("pet_id", petIdVal);
    if (progress?.length) {
      progress.forEach(row => {
        const key = `${row.week_number}::${row.lesson_key}`;
        if (row.program === "standard") { if (row.completed) result.stdC[key] = true; }
        else if (row.program === "puppy") { if (row.completed) result.puppyC[key] = true; }
        if (row.week_completed_at) { result.weekDone[row.week_number] = true; result.weekCAt[row.week_number] = row.week_completed_at; }
        if (row.welcome_video_watched) result.welcomeVid[row.program] = true;
      });
    }
    const { data: streakData } = await supabase.from("streaks").select("*").eq("pet_id", petIdVal).single();
    if (streakData) result.streak = streakData.current_streak || 0;
    return result;
  };

  // ── Switch which pet's training the app is showing ──
  // Households with two dogs going through the program at once use this to
  // flip between them — see the pet switcher in the top bar. Everything
  // that reads petId/petData/stdCompleted/etc. throughout the app keeps
  // working exactly as it already does; this just reloads those same
  // pieces of state with the newly-selected pet's data, the same way
  // loadUserData does on first sign-in.
  const switchActivePet = async (newPetId) => {
    if (!newPetId || newPetId === petId) return;
    const targetPet = allPets.find(p => p.id === newPetId);
    if (!targetPet) return;
    setPetId(newPetId);
    // Clear training-progress state immediately so there's no flash of the
    // previous pet's progress while the new pet's data is still loading.
    setStdCompleted({}); setPuppyCompleted({}); setPuppyWeekDone({});
    setWeekCompletedAt({}); setWelcomeVideoWatched({ standard: false, puppy: false }); setPuppyStreak(0);
    // These aren't persisted to Supabase at all (today's checklist state,
    // and which curriculum week is expanded) — but they'd still visually
    // bleed from one pet's dashboard onto another's if left alone, so
    // reset them too on every switch.
    setAssignDone({}); setRoutineDone({}); setWalkLog([]); setLearnOpenWeek(null);
    setPetData(d => ({
      ...d,
      name: targetPet.name, breed: targetPet.breed, birthday: targetPet.birthday,
      gender: targetPet.gender, weight: targetPet.weight, food: targetPet.food,
      allergiesAndSensitivities: targetPet.allergiesAndSensitivities, medications: targetPet.medications,
      grooming: targetPet.grooming, potty: targetPet.potty, docs: targetPet.docs || [],
      purchasedPrograms: [], enrolledProgram: undefined,
    }));
    const training = await loadPetTrainingData(newPetId);
    setPetData(d => ({ ...d, purchasedPrograms: training.purchasedPrograms, enrolledProgram: training.enrolledProgram }));
    setStdCompleted(training.stdC);
    setPuppyCompleted(training.puppyC);
    setPuppyWeekDone(training.weekDone);
    setWeekCompletedAt(training.weekCAt);
    setWelcomeVideoWatched(training.welcomeVid);
    setPuppyStreak(training.streak);
    // Remember this choice so re-opening the app picks up the same pet
    // instead of always defaulting back to the oldest one.
    if (userId) supabase.from("users").update({ active_pet_id: newPetId }).eq("id", userId);
  };

  const loadUserData = async (authUserId) => {
    setUserId(authUserId);
    // 1. Users table
    const { data: userData } = await supabase.from("users").select("*").eq("id", authUserId).single();
    if (!userData) return false; // no user row yet — still onboarding
    setPlan(userData.plan || "annual");
    // 2. Pets — load ALL of them (not just the primary one), so pets added
    // via "+ Add Pet" persist across sessions instead of resetting, and so
    // the pet switcher has the full list to offer. Which pet is "active"
    // for training defaults to the oldest one, unless the account has a
    // remembered active_pet_id from a previous switch.
    const { data: pets } = await supabase.from("pets").select("*").eq("owner_id", authUserId).order("created_at", { ascending: true });
    if (!pets?.length) return false;
    const activePetRow = (userData.active_pet_id && pets.find(p => p.id === userData.active_pet_id)) || pets[0];
    setPetId(activePetRow.id);
    // 3. Build the full pet list (id + every field + docs) for ALL pets on
    // the account — powers both the Settings > Pet Profile tabs and the
    // top-bar pet switcher.
    const allPetIds = pets.map(p => p.id);
    const { data: allDocsRows } = allPetIds.length
      ? await supabase.from("pet_documents").select("*").in("pet_id", allPetIds)
      : { data: [] };
    const allPetsBuilt = await Promise.all(pets.map(async (p) => {
      const rowsForPet = (allDocsRows || []).filter(d => d.pet_id === p.id);
      const docsForPet = await Promise.all(rowsForPet.map(async (d) => ({
        name: d.file_name,
        type: d.document_type,
        date: d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : "",
        url: await getSignedDocUrl(d.file_url),
        storagePath: d.file_url,
      })));
      return {
        id: p.id,
        name: p.name || "", breed: p.breed || "",
        birthday: p.birthday ? new Date(p.birthday + "T00:00:00").toLocaleDateString("en-US", {month:"2-digit",day:"2-digit",year:"numeric"}) : "",
        gender: p.gender || "", weight: p.weight || "",
        food: p.food || "", allergiesAndSensitivities: p.allergies_sensitivities || "",
        medications: p.medications || "", grooming: p.grooming_notes || "", potty: p.potty_notes || "",
        docs: docsForPet,
      };
    }));
    setAllPets(allPetsBuilt);
    const activePetBuilt = allPetsBuilt.find(p => p.id === activePetRow.id);
    const petObj = {
      name: activePetBuilt.name, breed: activePetBuilt.breed, birthday: activePetBuilt.birthday,
      gender: activePetBuilt.gender, weight: activePetBuilt.weight, food: activePetBuilt.food,
      allergiesAndSensitivities: activePetBuilt.allergiesAndSensitivities, medications: activePetBuilt.medications,
      grooming: activePetBuilt.grooming, potty: activePetBuilt.potty, docs: activePetBuilt.docs,
      // Account-level fields (from the users table, not the pet row) — these are
      // used all over the app (Settings, password change, receipts, etc.), so they
      // need to survive a fresh sign-in/page-refresh, not just the initial signup flow.
      firstName: userData.first_name, lastName: userData.last_name, email: userData.email,
      phone: userData.phone, countryCode: userData.country_code, plan: userData.plan,
      cardLast4: userData.card_last4, renewalDate: userData.renewal_date,
    };
    // 4. Training data (enrollment, lesson progress, streak) for the active pet
    const training = await loadPetTrainingData(activePetRow.id);
    petObj.purchasedPrograms = training.purchasedPrograms;
    petObj.enrolledProgram = training.enrolledProgram;
    setPetData(petObj);
    setStdCompleted(training.stdC);
    setPuppyCompleted(training.puppyC);
    setPuppyWeekDone(training.weekDone);
    setWeekCompletedAt(training.weekCAt);
    setWelcomeVideoWatched(training.welcomeVid);
    setPuppyStreak(training.streak);
    return true;
  };

  // ── Supabase auth state listener (handles sign-in, sign-out, and session restore) ──
  useEffect(() => {
    // Check for existing session on mount (page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id).then(ok => {
          if (ok) {
            setPage("dashboard"); setScreen("app");
            // Set by CheckoutCompleteScreen right before it redirects here,
            // once it's confirmed a real purchase went through — shows the
            // first-time welcome experience one time, since a plain
            // page-refresh mount reaching this same branch has no reason to.
            try {
              if (localStorage.getItem("gp_show_welcome")) {
                localStorage.removeItem("gp_show_welcome");
                setShowWelcome(true);
              }
            } catch {}
          } else {
            // No pets row yet — either still onboarding, or they cancelled
            // out of Stripe Checkout. Resume exactly where PaymentScreen
            // left off, using the onboarding data it stashed right before
            // redirecting (a full-page redirect drops React state, but not
            // this authenticated session — see PaymentScreen.handlePay).
            try {
              const saved = localStorage.getItem("gp_pending_onboarding");
              if (saved) { setPendingData(JSON.parse(saved)); setScreen("payment"); }
            } catch {}
          }
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUserId(null);
        setPetId(null);
        setAllPets([]);
        setPetData({ name: "", breed: "", birthday: "" });
        setPlan("annual");
        setStdCompleted({});
        setPuppyCompleted({});
        setPuppyWeekDone({});
        setPuppyStreak(0);
        setWeekCompletedAt({});
        setWelcomeVideoWatched({ standard: false, puppy: false });
        setScreen("signin");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Single active session enforcement ──
  // Runs whenever we have a signed-in userId: checks immediately (catches a
  // device that's been asleep/offline and lost its slot while away), then
  // re-checks periodically while the app is open. See stillHoldsSessionSlot
  // above for exactly what "checks" means — this never re-claims the slot,
  // it only ever detects losing it.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const check = async () => {
      const ok = await stillHoldsSessionSlot(userId);
      if (!ok && !cancelled) {
        setSessionKickedMsg("You've been signed out because this account was signed in on another device.");
        await supabase.auth.signOut();
      }
    };
    check(); // immediate check, e.g. right after a session restore
    const intervalId = setInterval(check, SESSION_CHECK_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [userId]);

  // ── Video locking: a video should only be watchable once the curriculum week
  // that references it is actually unlocked — otherwise someone could skip ahead
  // by browsing the Video Library directly.
  //
  // Covers every program the account has actually PAID for (getPurchasedPrograms —
  // usually just one, but both if the person bought the add-on program), so this can
  // never disagree with what's shown/unlocked in LearnScreen or DashboardScreen.
  const lockPurchasedPrograms = getPurchasedPrograms(petData);
  const lockCurriculaList = lockPurchasedPrograms.map(p=>({
    program: p,
    isStandard: p==="standard",
    curriculum: p==="standard" ? STANDARD_CURRICULUM : PUPPY_CURRICULUM,
  }));

  const unlockedWeekIds = new Set(); // week ids, unique across programs since "pp*"/"w*"/"pre"/"grad" never collide
  lockCurriculaList.forEach(({curriculum,isStandard})=>{
    const videoWatched = !!welcomeVideoWatched?.[isStandard?"standard":"puppy"];
    curriculum.forEach((w,wi)=>{
      if(isCurriculumWeekUnlocked(curriculum, wi, isStandard, videoWatched, stdCompleted, puppyWeekDone, weekCompletedAt)) unlockedWeekIds.add(w.id);
    });
  });

  // Map each video id to the set of week ids that reference it (via the same
  // keyword matching Linkify uses), across every purchased curriculum, so we know
  // which week(s) unlock which video.
  const videoIdToWeekIds = {};
  lockCurriculaList.forEach(({curriculum,isStandard})=>{
    curriculum.forEach(week=>{
      const texts = [...(week.lessons||[]), ...(week.tasks||[]).map(t=>t.name)];
      texts.forEach(text=>{
        const lower = text.toLowerCase();
        VIDEO_KEYWORDS.forEach(([kw,vid])=>{
          if(lower.includes(kw.toLowerCase())){
            if(!videoIdToWeekIds[vid]) videoIdToWeekIds[vid]=new Set();
            videoIdToWeekIds[vid].add(week.id);
          }
        });
        // Special case mirrored from Linkify: in the puppy program, generic "Threshold
        // Boundaries" (no qualifier) refers to the puppy-specific demo video rather than
        // the standard-program E-collar/leash-pressure videos.
        if(!isStandard && /threshold boundar(y|ies)/.test(lower)){
          if(!videoIdToWeekIds.puppyThreshold) videoIdToWeekIds.puppyThreshold=new Set();
          videoIdToWeekIds.puppyThreshold.add(week.id);
        }
      });
    });
  });

  // Videos genuinely not tied to a specific curriculum week — bonus/supplemental
  // content with no dedicated lesson (checked by hand against the curriculum text,
  // not just "whatever the keyword matcher happened to miss"). Defaulting an
  // unmatched video to LOCKED is the safer failure mode for a paid-pacing feature;
  // this is the explicit exception list for videos that really should stay open.
  const GENERAL_REFERENCE_VIDEOS = new Set(["looseLeashLure"]);
  const isVideoUnlocked = (id) => {
    if(GENERAL_REFERENCE_VIDEOS.has(id)) return true;
    const weekIds = videoIdToWeekIds[id];
    if(!weekIds || weekIds.size===0) return false;
    return [...weekIds].some(wid=>unlockedWeekIds.has(wid));
  };
  // Which week (label) unlocks a given locked video — for display in the library.
  // Checks purchased curricula in order, so the label matches whichever program
  // actually contains that video.
  const videoUnlocksWithLabel = (id) => {
    const weekIds = videoIdToWeekIds[id];
    if(!weekIds || weekIds.size===0) return null;
    for(const {curriculum} of lockCurriculaList){
      const idx = curriculum.findIndex(w=>weekIds.has(w.id));
      if(idx>=0) return curriculum[idx].label || curriculum[idx].id;
    }
    return null;
  };
  const [videoLockedMsg,setVideoLockedMsg]=useState(null);

  const [quickAddDocs,setQuickAddDocs]=useState([]);
  const handleQuickAdd=(doc)=>{
    setQuickAddDocs(d=>[...d,doc]);
    saveDocument(petId, doc);
  };
  const [walkLog,setWalkLog]=useState([]);
  // Potty timer lives here (not inside the Potty Schedule screen) so it keeps
  // counting down and can show up as a small badge on the Dashboard too.
  const [pottyTimer,setPottyTimer]=useState(IDLE_POTTY_TIMER);
  const [liveInitialTab,setLiveInitialTab]=useState("activity");
  const goToPottyTimer=()=>{ setLiveInitialTab("potty"); setPage("live"); setShowDiag(false); setShowLifeRecord(false); setShowWelcome(false); setShowVideo(null); setVideoHistory([]); setShowGame(null); };
  // Normal navigation to Live should always land on the Activity tab — only the
  // Dashboard potty-timer badge (goToPottyTimer, above) jumps straight to Potty.
  const navigateToPage=(p)=>{ if(p==="live") setLiveInitialTab("activity"); setPage(p); };

  // ── Inactivity auto-sign-out (bank-app style) ──
  // Tracks last interaction time in a ref; a periodic check signs the person out
  // via supabase.auth.signOut() once they've been idle for INACTIVITY_LIMIT_MS.
  const lastActivityRef = useRef(Date.now());
  useEffect(() => {
    if (screen !== "app") return;
    const bump = () => { lastActivityRef.current = Date.now(); };
    const events = ["mousedown","mousemove","keydown","scroll","touchstart","wheel"];
    events.forEach(ev => window.addEventListener(ev, bump, {passive:true}));
    const checkId = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_LIMIT_MS) {
        supabase.auth.signOut();
        setScreen("signin");
      }
    }, 15000);
    return () => {
      events.forEach(ev => window.removeEventListener(ev, bump));
      clearInterval(checkId);
    };
  }, [screen]);

  const handleSignIn=async ()=>{
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const ok = await loadUserData(session.user.id);
      claimSessionSlot(session.user.id); // explicit login — this device becomes the active one
      if (ok) { setPage("dashboard"); setScreen("app"); return; }
    }
    setPage("dashboard"); setScreen("app");
  };
  const handleGoRegister=()=>setScreen("register");
  const handleRegistered=(ud)=>{ setRegData(ud); if(ud.googleAuth){ setScreen("onboarding"); } else { setScreen("verify"); } };
  const handleVerified=()=>setScreen("onboarding");
  const handleGoToPayment=(data)=>{
    setPendingData(data);
    setScreen("payment");
    sendAbandonedCheckoutWebhook({
      firstName: regData?.firstName || "", lastName: regData?.lastName || "",
      email: regData?.email || "", phone: regData?.phone || "",
      dogName: data?.name || "", dogAge: computeAge(data?.birthday) || "",
      dogBreed: data?.breed || "", program: data?.program,
    });
  };
  const handleDismissWelcome=()=>setShowWelcome(false);

  // Page content (shared by the single unified layout on phone & desktop)
  const renderWebPage = () => {
    if(showWelcome) return <WelcomeDashboard petData={petData} plan={plan} onDismiss={handleDismissWelcome}/>;
    if(showVideo==="__library__") return <VideoLibraryScreen onOpenVideo={openVideo} onClose={closeVideo} isVideoUnlocked={isVideoUnlocked} videoUnlocksWithLabel={videoUnlocksWithLabel}/>;
    if(showVideo) return <VideoScreen id={showVideo} onClose={closeVideo} onBack={goBackVideo}/>;
    if(showHandout==="__library__") return <HandoutLibraryScreen onOpenHandout={openHandout} onClose={closeHandout}/>;
    if(showHandout) return <HandoutScreen id={showHandout} onOpenHandout={openHandout} onBack={goBackHandout} onClose={closeHandout}/>;
    if(showDiag) return <BehaviorScreen onClose={()=>setShowDiag(false)} onOpenHandout={openHandout}/>;
    if(showLifeRecord) return <PetLifeRecord petData={petData} setPetData={setPetData} onClose={()=>setShowLifeRecord(false)} onOpenSettings={()=>{setShowLifeRecord(false);navigateToPage("settings");}}/>;
    if(showGame) return <GameInstructionsScreen id={showGame} onClose={closeGame} onBack={closeGame}/>;
    switch(page){
      case "dashboard": return <DashboardScreen petData={petData} plan={plan} onOpenRecord={()=>{setShowLifeRecord(true);setShowDiag(false);}} puppyWeekDone={puppyWeekDone} puppyStreak={puppyStreak} stdCompleted={stdCompleted} onOpenHandout={openHandout} onOpenVideo={openVideo} pottyTimer={pottyTimer} onOpenPottyTimer={goToPottyTimer} assignDone={assignDone} setAssignDone={setAssignDone} routineDone={routineDone} setRoutineDone={setRoutineDone} petId={petId}/>;
      case "live":      return <LiveScreen walkLog={walkLog} pottyTimer={pottyTimer} setPottyTimer={setPottyTimer} initialTab={liveInitialTab} petData={petData} setPetData={setPetData}/>;
      case "bond":      return <BondScreen onOpenGame={openGame}/>;
      case "learn":     return <LearnScreen petData={petData} setPetData={setPetData} puppyCompleted={puppyCompleted} setPuppyCompleted={setPuppyCompleted} puppyWeekDone={puppyWeekDone} setPuppyWeekDone={setPuppyWeekDone} setPuppyStreak={setPuppyStreak} stdCompleted={stdCompleted} setStdCompleted={setStdCompleted} welcomeVideoWatched={welcomeVideoWatched} setWelcomeVideoWatched={setWelcomeVideoWatched} onOpenHandout={openHandout} onOpenVideo={openVideo} openWeek={learnOpenWeek} setOpenWeek={setLearnOpenWeek} weekCompletedAt={weekCompletedAt} setWeekCompletedAt={setWeekCompletedAt} petId={petId} userId={userId}/>;
      case "share":     return <ShareScreen/>;
      case "calendar":  return <CalendarScreen userId={userId}/>;
      case "store":     return <StoreScreen/>;
      case "settings":  return <SettingsScreen onSignOut={()=>{supabase.auth.signOut();setScreen("signin");}} darkMode={darkMode} setDarkMode={setDarkMode} quickAddDocs={quickAddDocs} onOpenHandoutLibrary={openHandoutLibrary} onOpenVideoLibrary={openVideoLibrary} petData={petData} setPetData={setPetData} onOpenDiagnosis={openDiagnosis} petId={petId} userId={userId} onAccountDeleted={()=>{supabase.auth.signOut();setScreen("signin");}} allPets={allPets} setAllPets={setAllPets} switchActivePet={switchActivePet}/>;
      default:          return <DashboardScreen petData={petData} plan={plan} onOpenRecord={()=>{setShowLifeRecord(true);setShowDiag(false);}} stdCompleted={stdCompleted} onOpenHandout={openHandout} onOpenVideo={openVideo} pottyTimer={pottyTimer} onOpenPottyTimer={goToPottyTimer} assignDone={assignDone} setAssignDone={setAssignDone} routineDone={routineDone} setRoutineDone={setRoutineDone}/>;
    }
  };

  const isAuthScreen = screen!=="app";

  return (
    <ThemeContext.Provider value={T}>
      <div className="app-root" style={{background:T.bg,fontFamily:"'Lato',sans-serif"}}>
        <style>{globalCss(T)}</style>

        {/* Locked-video toast — shown when someone taps a video that isn't unlocked yet */}
        {videoLockedMsg && (
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.navy,border:`1px solid ${T.gold}`,color:T.text,padding:"14px 22px",borderRadius:"14px",fontWeight:"700",fontSize:"12.5px",zIndex:1200,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both",textAlign:"center",display:"flex",alignItems:"center",gap:"7px"}}>
            <Icon name="lock" size={13}/>{videoLockedMsg}
          </div>
        )}

        {/* ── Auth screens (centered phone-style on all breakpoints) ── */}
        {isAuthScreen && (
          <div style={{width:"100%",maxWidth:"390px",margin:"0 auto"}}>
            {screen==="signin"&&<SignInScreen onSignIn={handleSignIn} goSignUp={handleGoRegister} darkMode={darkMode} setDarkMode={setDarkMode} kickedMsg={sessionKickedMsg} clearKickedMsg={()=>setSessionKickedMsg("")}/>}
            {screen==="register"&&<RegistrationScreen onVerify={handleRegistered} onBack={()=>setScreen("signin")} darkMode={darkMode} setDarkMode={setDarkMode}/>}
            {screen==="verify"&&<EmailVerificationScreen userData={regData} onVerified={handleVerified} onBack={()=>setScreen("register")}/>}
            {screen==="onboarding"&&<OnboardingScreen userData={regData} onGoToPayment={handleGoToPayment} darkMode={darkMode} setDarkMode={setDarkMode}/>}
            {screen==="payment"&&<PaymentScreen petData={pendingData} onBack={()=>setScreen("onboarding")}/>}
          </div>
        )}

        {/* ── App: unified layout — same sidebar + topbar structure on phone & desktop ── */}
        {screen==="app"&&(
          <div className="web-layout" style={{background:T.bg}}>
            <SideNav
              page={page}
              setPage={navigateToPage}
              setShowDiag={setShowDiag}
              setShowLifeRecord={setShowLifeRecord}
              setShowWelcome={setShowWelcome}
              setShowVideo={setShowVideo}
              setVideoHistory={setVideoHistory}
              setShowGame={setShowGame}
              setShowHandout={setShowHandout}
              setHandoutHistory={setHandoutHistory}
              plan={plan}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onSignOut={()=>{clearSession();setScreen("signin");}}
              mobileOpen={mobileNavOpen}
              setMobileOpen={setMobileNavOpen}
            />
            <div className="web-main" style={{background:T.bg}}>
              {/* Top bar */}
              <div className="web-topbar" style={{background:T.navTopbarBg,borderBottom:`1px solid ${T.navBarBorder}`}}>
                {/* Full-width banner — stretches edge-to-edge across the very top on both phone and desktop */}
                <TopBanner setPage={(p)=>{navigateToPage(p);setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowVideo(null);setVideoHistory([]);setShowGame(null);setShowHandout(null);setHandoutHistory([]);}}/>
                <div className="web-topbar-row">
                  <button className="hamburger-btn" onClick={()=>setMobileNavOpen(v=>!v)} style={{color:T.navTextStrong}} title="Menu">
                    <Icon name="menu" size={20}/>
                  </button>
                  <div style={{marginLeft:"10px"}}>
                    <PetSwitcher pets={allPets} activePetId={petId} onSwitch={switchActivePet}/>
                  </div>
                  <div style={{flex:1}}/>
                  <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                    <div className="icon-tt">
                      <button onClick={()=>{setShowDiag(true);setShowLifeRecord(false);setShowWelcome(false);setShowGame(null);}}
                        style={{background:"none",border:"none",cursor:"pointer",color:showDiag?T.navActiveText:T.navText,transition:"color .2s",display:"flex",alignItems:"center"}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          <text x="12" y="13" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor" stroke="none" fontFamily="sans-serif">?</text>
                        </svg>
                      </button>
                      <span className="icon-tt-bubble">Training Focus Finder</span>
                    </div>
                    <div className="icon-tt">
                      <button onClick={openHandoutLibrary}
                        style={{background:"none",border:"none",cursor:"pointer",color:showHandout?T.navActiveText:T.navText,transition:"color .2s",display:"flex",alignItems:"center"}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      </button>
                      <span className="icon-tt-bubble">Training Handouts</span>
                    </div>
                    <div className="icon-tt">
                      <button onClick={openVideoLibrary}
                        style={{background:"none",border:"none",cursor:"pointer",color:showVideo?T.navActiveText:T.navText,transition:"color .2s",display:"flex",alignItems:"center"}}>
                        <Icon name="video" size={18}/>
                      </button>
                      <span className="icon-tt-bubble">Training Videos</span>
                    </div>
                    <div className="icon-tt">
                      <button onClick={()=>{navigateToPage("settings");setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowVideo(null);setVideoHistory([]);setShowGame(null);setShowHandout(null);setHandoutHistory([]);}}
                        style={{background:"none",border:"none",cursor:"pointer",color:page==="settings"?T.navActiveText:T.navText,transition:"color .2s",display:"flex",alignItems:"center"}}>
                        <Icon name="settings" size={18}/>
                      </button>
                      <span className="icon-tt-bubble">Settings</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Page content */}
              <div className="web-content">
                {renderWebPage()}
              </div>
              {/* Quick-add / walk tracker bar — same on phone & desktop for feature parity */}
              {!showWelcome&&<BottomNav active={page} setPage={(p)=>{navigateToPage(p);setShowDiag(false);setShowLifeRecord(false);setShowVideo(null);setVideoHistory([]);setShowGame(null);setShowHandout(null);setHandoutHistory([]);}} plan={plan} showPlus={showPlus} setShowPlus={setShowPlus} onQuickAdd={handleQuickAdd} walkLog={walkLog} setWalkLog={setWalkLog} petData={petData} setPetData={setPetData} petId={petId}/>}
            </div>
          </div>
        )}

      </div>
    </ThemeContext.Provider>
  );
}

// ─── /reset-password is served as its own standalone screen, entirely outside
// the normal signed-in/signed-out state machine above (App assumes a session
// found on mount means "go straight to the dashboard", which is wrong for a
// password-recovery session). Decided once, before App's hooks ever run, so
// there's no conditional-hooks issue — this is a separate component tree, not
// an early return inside App. See vercel.json for the rewrite that lets this
// path reach index.html instead of 404ing on a static host.
function ResetPasswordApp() {
  const [darkMode, setDarkMode] = useState(true);
  const T = darkMode ? DARK : LIGHT;
  return (
    <ThemeContext.Provider value={T}>
      <div className="app-root" style={{background:T.bg,fontFamily:"'Lato',sans-serif"}}>
        <style>{globalCss(T)}</style>
        <div style={{width:"100%",maxWidth:"390px",margin:"0 auto"}}>
          <ResetPasswordScreen darkMode={darkMode} setDarkMode={setDarkMode}/>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

// Same pattern as ResetPasswordApp above — /checkout-complete is Stripe
// Checkout's success_url, reached via a full page redirect from Stripe's
// hosted payment page.
function CheckoutCompleteApp() {
  const [darkMode, setDarkMode] = useState(true);
  const T = darkMode ? DARK : LIGHT;
  return (
    <ThemeContext.Provider value={T}>
      <div className="app-root" style={{background:T.bg,fontFamily:"'Lato',sans-serif"}}>
        <style>{globalCss(T)}</style>
        <div style={{width:"100%",maxWidth:"390px",margin:"0 auto"}}>
          <CheckoutCompleteScreen darkMode={darkMode} setDarkMode={setDarkMode}/>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default function AppRoot() {
  if (typeof window !== "undefined" && window.location.pathname === "/reset-password") {
    return <ResetPasswordApp/>;
  }
  if (typeof window !== "undefined" && window.location.pathname === "/checkout-complete") {
    return <CheckoutCompleteApp/>;
  }
  return <App/>;
}