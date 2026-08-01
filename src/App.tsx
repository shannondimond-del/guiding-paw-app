import { useState, useEffect, useContext, createContext } from "react";

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

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
  gold:"#B08D57", goldLight:"#c9a870", green:"#2F4F3E", brown:"#A3562A",
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
  gold:"#8a6535", goldLight:"#a07840", green:"#2F4F3E", brown:"#A3562A",
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
  /* ── Responsive Web Layout ── */
  .app-root{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px 16px;transition:background .4s;}
  .web-layout{display:none;}
  .phone-layout{display:flex;width:100%;max-width:390px;margin:0 auto;}
  @media(min-width:900px){
    .app-root{align-items:flex-start;padding:0;}
    .web-layout{display:flex;width:100%;min-height:100vh;}
    .phone-layout{display:none;}
    .web-sidebar{width:240px;min-height:100vh;flex-shrink:0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow:hidden;}
    .web-main{flex:1;min-height:100vh;overflow-y:auto;display:flex;flex-direction:column;}
    .web-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;border-bottom:1px solid rgba(176,141,87,.15);flex-shrink:0;}
    .web-content{flex:1;padding:24px 32px;overflow-y:auto;max-height:calc(100vh - 60px);}
    .web-content::-webkit-scrollbar{width:5px;}
    .web-content::-webkit-scrollbar-thumb{background:rgba(176,141,87,.3);border-radius:4px;}
    .sidebar-nav-btn{width:100%;display:flex;align-items:center;gap:12px;padding:11px 22px;border:none;cursor:pointer;background:none;font-family:'Lato',sans-serif;font-size:13px;font-weight:600;letter-spacing:.04em;transition:all .18s;border-radius:0;}
    .sidebar-nav-btn:hover{background:rgba(176,141,87,.1);}
    .sidebar-nav-btn.active{background:rgba(176,141,87,.18);border-right:3px solid #B08D57;}
  }
  @media(min-width:600px) and (max-width:899px){
    .phone-layout{max-width:480px;}
  }
`;

// ─── SHARED UI ─────────────────────────────────────────────────────────────────
// Guiding Paw logo using the uploaded PNG
const LogoImg = ({size=56}) => {
  // No real logo image file is bundled with the app, so we render the paw-print
  // fallback directly instead of attempting to load a path that will always 404.
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
      <div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",background:"#1C2636",borderRadius:"50%",fontSize:size*.4,flexShrink:0}}>🐾</div>
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

const ThemeToggle = ({darkMode,setDarkMode}) => (
  <button onClick={()=>setDarkMode(d=>!d)} style={{display:"flex",alignItems:"center",gap:"6px",background:"none",border:"none",cursor:"pointer",padding:"4px 2px"}}>
    <span style={{fontSize:"14px"}}>{darkMode?"🌙":"☀️"}</span>
    <div style={{width:"40px",height:"22px",borderRadius:"11px",background:darkMode?"rgba(176,141,87,.35)":"rgba(163,86,42,.2)",border:`1.5px solid ${darkMode?"rgba(176,141,87,.6)":"rgba(163,86,42,.35)"}`,position:"relative",transition:"all .3s"}}>
      <div style={{position:"absolute",top:"2px",left:darkMode?"18px":"2px",width:"16px",height:"16px",borderRadius:"50%",background:darkMode?"#c9a870":"#A3562A",transition:"left .3s",boxShadow:"0 1px 4px rgba(0,0,0,.25)"}}/>
    </div>
  </button>
);

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
  return <button onClick={onClick} style={{padding:"9px 14px",borderRadius:"22px",border:`1px solid ${selected?T.gold:T.chipBorder}`,background:selected?"rgba(176,141,87,.18)":T.chipBg,color:selected?T.goldLight:T.textMuted,fontSize:"12.5px",fontWeight:selected?"700":"400",cursor:"pointer",transition:"all .18s",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",gap:"5px"}}>{emoji&&<span>{emoji}</span>}{label}</button>;
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
const SideNav = ({page,setPage,setShowDiag,setShowLifeRecord,setShowWelcome,setShowVideo,setVideoHistory,plan,darkMode,setDarkMode,onSignOut}) => {
  const T=useTheme();
  const navItems=[
    {id:"dashboard",label:"Dashboard",icon:"🏠"},
    {id:"live",label:"Live Walk",icon:"📍"},
    {id:"bond",label:"Bond",icon:"❤️"},
    {id:"learn",label:"Learn",icon:"📚"},
    {id:"calendar",label:"Calendar",icon:"📅"},
    {id:"store",label:"Store",icon:"🛍️"},
    {id:"share",label:"Share & Refer",icon:"🐾"},
    {id:"settings",label:"Settings",icon:"⚙️"},
  ];
  const sidebarBg = T.mode==="dark" ? "#0d1823" : "#1C2636";
  const activeText = "#B08D57";
  const mutedText = "rgba(216,198,174,0.6)";
  const hoverBg = "rgba(176,141,87,0.1)";
  return (
    <div className="web-sidebar" style={{background:sidebarBg,borderRight:`1px solid rgba(176,141,87,.15)`}}>
      {/* Logo area */}
      <div style={{padding:"28px 22px 20px",borderBottom:"1px solid rgba(176,141,87,.12)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <LogoImg size={40}/>
          <div>
            <div style={{fontSize:"13px",fontWeight:"900",color:"#c9a870",letterSpacing:".08em",lineHeight:1.1}}>GUIDING PAW</div>
            <div style={{fontSize:"9px",color:"rgba(176,141,87,.6)",letterSpacing:".2em",fontWeight:"600"}}>TRAINING</div>
          </div>
        </div>
      </div>
      {/* Nav items */}
      <div style={{flex:1,overflowY:"auto",paddingTop:"10px"}}>
        {navItems.map(item=>{
          const isActive=page===item.id;
          return (
            <button key={item.id} className={`sidebar-nav-btn${isActive?" active":""}`}
              onClick={()=>{setPage(item.id);setShowDiag&&setShowDiag(false);setShowLifeRecord&&setShowLifeRecord(false);setShowWelcome&&setShowWelcome(false);setShowVideo&&setShowVideo(null);setVideoHistory&&setVideoHistory([]);}}
              style={{color:isActive?activeText:mutedText,borderRight:isActive?`3px solid #B08D57`:"3px solid transparent"}}>
              <span style={{fontSize:"16px",width:"20px",textAlign:"center"}}>{item.icon}</span>
              <span style={{fontSize:"13px",fontWeight:isActive?"700":"500"}}>{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Bottom: theme toggle + sign out */}
      <div style={{padding:"16px 22px",borderTop:"1px solid rgba(176,141,87,.12)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
        <button onClick={onSignOut} style={{background:"none",border:"none",cursor:"pointer",fontSize:"11px",color:"rgba(216,198,174,.45)",fontFamily:"'Lato',sans-serif",letterSpacing:".08em"}}>Sign out</button>
      </div>
    </div>
  );
};

const ScrollBody = ({children,pad="26px"}) => <div style={{flex:1,overflowY:"auto",padding:pad}}>{children}</div>;

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
const BottomNav = ({active,setPage,plan,showPlus,setShowPlus,onQuickAdd,walkLog=[],setWalkLog}) => {
  const T=useTheme();
  const [quickNote,setQuickNote]=useState("");
  const [quickType,setQuickType]=useState(null);
  const [walkActive,setWalkActive]=useState(false);
  const [walkStart,setWalkStart]=useState(null);
  const [walkElapsed,setWalkElapsed]=useState(0);
  const [walkPoints,setWalkPoints]=useState([]); // simulated GPS coords

  // Simulated base coords (Salt Lake City area)
  const BASE_LAT=40.7608, BASE_LNG=-111.8910;

  // Walk timer tick + simulate GPS movement
  useState(()=>{
    if(!walkActive||!walkStart) return;
    const id=setInterval(()=>{
      const secs=Math.floor((Date.now()-walkStart)/1000);
      setWalkElapsed(secs);
      // Add a simulated GPS point every 5 seconds
      if(secs%5===0){
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
  });

  const fmtDuration=(secs)=>{ const m=Math.floor(secs/60),s=secs%60; return `${m}m ${s.toString().padStart(2,"0")}s`; };
  // Simulate ~3 mph pace: 1 mile per 20 min
  const simDistanceMi=(secs)=>parseFloat(((secs/60)/20).toFixed(2));
  const simPace=(secs)=>{ const mi=simDistanceMi(secs); if(mi<0.01) return "--'--\""; const paceMin=secs/60/mi; const pm=Math.floor(paceMin),ps=Math.round((paceMin-pm)*60); return `${pm}'${ps.toString().padStart(2,"0")}\"`; };

  const startWalk=()=>{
    setWalkActive(true);
    setWalkStart(Date.now());
    setWalkElapsed(0);
    setWalkPoints([{lat:BASE_LAT,lng:BASE_LNG}]);
    setShowPlus(false);
    setQuickType(null);
  };

  const stopWalk=()=>{
    const secs=walkElapsed;
    const entry={
      date:new Date().toLocaleDateString(),
      time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      duration:fmtDuration(secs),
      distanceMi:simDistanceMi(secs),
      pace:simPace(secs),
      points:[...walkPoints],
      appleHealthSynced:true,
    };
    setWalkLog&&setWalkLog(l=>[entry,...l]);
    setWalkActive(false);
    setWalkStart(null);
    setWalkElapsed(0);
    setWalkPoints([]);
    setPage("live");
  };

  const cancelWalk=()=>{
    setWalkActive(false);
    setWalkStart(null);
    setWalkElapsed(0);
    setWalkPoints([]);
  };

  const restartWalk=()=>{
    setWalkStart(Date.now());
    setWalkElapsed(0);
    setWalkPoints([{lat:BASE_LAT,lng:BASE_LNG}]);
  };
  const icons=[
    {id:"dashboard",label:"Home",icon:"🏠"},
    {id:"live",label:"Live",icon:"❤️"},
    {id:"bond",label:"Bond",icon:"🤝"},
    {id:"plus",label:"",icon:null,center:true},
    {id:"learn",label:"Learn",icon:"🧠"},
    {id:"share",label:"Share",icon:"🐾"},
    {id:"store",label:"Shop",icon:"🛍️"},
  ];

  const handleFileUpload=(type)=>{
    const input=document.createElement("input");
    input.type="file";
    input.accept=".pdf,.jpg,.jpeg,.png,.doc,.docx";
    input.onchange=(e)=>{
      const file=e.target.files[0];
      if(!file) return;
      onQuickAdd&&onQuickAdd({name:file.name,type,date:new Date().toLocaleDateString(),url:URL.createObjectURL(file)});
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
              <p style={{fontSize:"11px",color:"#4caf7d",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase"}}>Walk in Progress</p>
            </div>
            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
              <button onClick={restartWalk} style={{padding:"6px 11px",background:"rgba(176,141,87,.18)",border:"1.5px solid rgba(176,141,87,.6)",borderRadius:"9px",color:"#c9a870",fontWeight:"900",fontSize:"10px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}} title="Restart walk timer">↺ Restart</button>
              <button onClick={cancelWalk} style={{padding:"6px 11px",background:"rgba(28,38,54,.4)",border:"1.5px solid rgba(216,198,174,.3)",borderRadius:"9px",color:"rgba(216,198,174,.7)",fontWeight:"900",fontSize:"10px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}} title="Cancel walk without saving">✕ Cancel</button>
              <button onClick={stopWalk} style={{padding:"6px 11px",background:"rgba(224,122,95,.18)",border:"1.5px solid #e07a5f",borderRadius:"9px",color:"#e07a5f",fontWeight:"900",fontSize:"11px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>Stop & Log</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
            {[
              {label:"Duration",value:fmtDuration(walkElapsed)},
              {label:"Distance",value:`${simDistanceMi(walkElapsed)} mi`},
              {label:"Pace",value:simPace(walkElapsed)},
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
                {id:"walk",label:"🐕 Start a Walk",desc:"Track walk duration"},
                {id:"homework",label:"Homework Assignment"},
                {id:"progress",label:"Progress Notes"},
                ...(plan==="pro"?[{id:"trainer",label:"Message a Trainer"}]:[]),
              ].map(item=>(
                <button key={item.id}
                  onClick={()=>{
                    if(item.id==="walk"){ startWalk(); return; }
                    if(item.id==="trainer"){ setShowPlus(false); return; }
                    setQuickType(item.id);
                  }}
                  style={{display:"block",width:"100%",textAlign:"left",padding:"10px 0",background:"none",border:"none",borderBottom:`1px solid ${T.divider}`,color:item.id==="walk"?"#4caf7d":T.text,fontSize:"13.5px",cursor:"pointer",fontFamily:"'Lato',sans-serif",fontWeight:item.id==="walk"?"700":"400"}}>
                  {item.label}
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
                <button onClick={()=>handleFileUpload(quickType)} style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"9px",color:T.gold,fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>Upload File</button>
              </div>
              <button onClick={()=>{setQuickType(null);setQuickNote("");}} style={{background:"none",border:"none",color:T.textFaint,fontSize:"11px",cursor:"pointer"}}>← Back</button>
            </div>
          )}

          {!quickType&&<button onClick={()=>setShowPlus(false)} style={{marginTop:"10px",background:"none",border:"none",color:T.textFaint,fontSize:"12px",cursor:"pointer"}}>✕ Close</button>}
        </div>
        </>
      )}
      {/* Nav bar is always navy #1C2636 — the brand's signature color */}
      <div style={{display:"flex",alignItems:"center",background:"#1C2636",borderTop:"2px solid rgba(176,141,87,0.3)",padding:"5px 0 8px",transition:"background .4s"}}>
        {icons.map(({id,label,icon,center})=>
          center?(
            <div key="plus" style={{flex:1,display:"flex",justifyContent:"center"}}>
              <button onClick={()=>{setShowPlus(v=>!v);setQuickType(null);setQuickNote("");}} style={{width:"46px",height:"46px",borderRadius:"50%",background:`linear-gradient(135deg,${T.gold},${T.brown})`,border:"3px solid #1C2636",fontSize:"24px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 16px rgba(176,141,87,.45)",marginTop:"-16px",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>＋</button>
            </div>
          ):(
            <button key={id} onClick={()=>setPage(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",background:"none",border:"none",cursor:"pointer",color:active===id?"#B08D57":"rgba(216,198,174,0.85)",transition:"color .2s"}}>
              <span style={{fontSize:"17px"}}>{icon}</span>
              <span style={{fontSize:"8px",fontWeight:"700",letterSpacing:".06em",textTransform:"uppercase"}}>{label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: SIGN IN — full simulated auth
// ═══════════════════════════════════════════════════════════════════════════════

// Demo credentials — in a real app this would be a backend call
const DEMO_ACCOUNTS = [
  {email:"demo@guidingpaw.com",   password:"Training1!"},
  {email:"test@guidingpaw.com",   password:"Paws1234!"},
];
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECS = 30;

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
            {it.ok && <span style={{color:"#fff",fontSize:"9px",fontWeight:"900",lineHeight:1}}>✓</span>}
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
      🎲 Generate secure password
    </button>
  );
};

// ─── SAVED CREDENTIALS HELPERS ───────────────────────────────────────────────
const SAVED_CREDS_KEY = "gp_saved_creds";
const SESSION_KEY     = "gp_session";

function saveCredentials(email, pw) {
  try {
    // Store base64-encoded (not true encryption, but obscures plaintext in storage)
    const payload = btoa(JSON.stringify({ email, pw, savedAt: Date.now() }));
    localStorage.setItem(SAVED_CREDS_KEY, payload);
  } catch {}
}

function loadSavedCredentials() {
  try {
    const raw = localStorage.getItem(SAVED_CREDS_KEY);
    if (!raw) return null;
    return JSON.parse(atob(raw));
  } catch { return null; }
}

function clearSavedCredentials() {
  try { localStorage.removeItem(SAVED_CREDS_KEY); } catch {}
}

function saveSession(email) {
  try { sessionStorage.setItem(SESSION_KEY, btoa(email)); } catch {}
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? atob(raw) : null;
  } catch { return null; }
}

const SignInScreen = ({onSignIn, goSignUp, darkMode, setDarkMode}) => {
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
  const [savedUser, setSavedUser] = useState(null); // pre-filled saved credential display
  const [autoLogging, setAutoLogging] = useState(false);

  // ── On mount: load saved credentials or active session ──
  useState(() => {
    // 1. Active session this browser tab (page refresh) → auto sign in
    const session = loadSession();
    if (session) {
      setAutoLogging(true);
      setTimeout(() => { setAutoLogging(false); onSignIn(); }, 800);
      return;
    }
    // 2. Remembered credentials → pre-fill form
    const saved = loadSavedCredentials();
    if (saved) {
      setEmail(saved.email);
      setPw(saved.pw);
      setRememberMe(true);
      setSavedUser(saved.email);
    }
  });

  // Countdown timer for lockout
  useState(()=>{
    if(!lockedUntil) return;
    const id = setInterval(()=>{
      const rem = Math.ceil((lockedUntil - Date.now()) / 1000);
      if(rem <= 0){ setLockedUntil(null); setLockSecs(0); setAttempts(0); clearInterval(id); }
      else setLockSecs(rem);
    }, 1000);
    return ()=>clearInterval(id);
  });

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const triggerShake = () => { setShake(true); setTimeout(()=>setShake(false), 500); };

  const validate = () => {
    const e = {};
    if(!validateEmail(email)) e.email = "Please enter a valid email address.";
    if(!validatePassword(pw)) e.pw = "Password must be at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignIn = () => {
    if(isLocked) return;
    if(!validate()){ triggerShake(); return; }
    setLoading(true);
    setErrors({});
    // Simulate network delay
    setTimeout(()=>{
      const match = DEMO_ACCOUNTS.find(
        a => a.email.toLowerCase()===email.trim().toLowerCase() && a.password===pw
      );
      if(match){
        // Save credentials if "Remember me" checked
        if(rememberMe) {
          saveCredentials(email.trim().toLowerCase(), pw);
        } else {
          clearSavedCredentials();
        }
        // Save session for this browser tab
        saveSession(email.trim().toLowerCase());
        setLoading(false);
        onSignIn();
      } else {
        const next = attempts + 1;
        setAttempts(next);
        setLoading(false);
        triggerShake();
        if(next >= MAX_ATTEMPTS){
          setLockedUntil(Date.now() + LOCKOUT_SECS * 1000);
          setLockSecs(LOCKOUT_SECS);
          setErrors({auth:`Too many failed attempts. Account locked for ${LOCKOUT_SECS} seconds.`});
        } else {
          const left = MAX_ATTEMPTS - next;
          setErrors({auth:`Incorrect email or password. ${left} attempt${left===1?"":"s"} remaining.`});
        }
      }
    }, 1100);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(()=>{ setLoading(false); onSignIn(); }, 900);
  };

  const handleForgot = () => {
    if(!validateEmail(forgotEmail)){ setForgotError("Please enter a valid email address."); return; }
    setForgotError("");
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setMode("forgot_sent"); }, 1000);
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
            <div style={{width:"70px",height:"70px",borderRadius:"50%",background:T.success,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px",margin:"0 auto 18px",boxShadow:`0 0 0 10px rgba(76,175,125,.1)`}}>✉️</div>
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
              <div style={{fontSize:"40px",marginBottom:"10px"}}>🔑</div>
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
            <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Welcome back! 🐾</h2>
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
                {i<2&&<span style={{fontSize:"13px",lineHeight:1,filter:T.mode==="dark"?"brightness(0) saturate(100%) invert(72%) sepia(60%) saturate(400%) hue-rotate(340deg) brightness(110%)":"none"}}>🐾</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Saved user greeting */}
        {savedUser && (
          <div className="s1" style={{background:"rgba(176,141,87,.09)",border:`1px solid rgba(176,141,87,.25)`,borderRadius:"12px",padding:"11px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"34px",height:"34px",borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>🐾</div>
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

        {/* Demo hint */}
        <div style={{background:"rgba(176,141,87,.08)",border:"1px solid rgba(176,141,87,.2)",borderRadius:"10px",padding:"9px 12px",marginBottom:"16px",display:"flex",gap:"8px",alignItems:"flex-start"}}>
          <span style={{fontSize:"14px",flexShrink:0}}>💡</span>
          <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.5}}>
            <strong style={{color:T.gold}}>Demo:</strong> use <strong style={{color:T.text}}>demo@guidingpaw.com</strong> / <strong style={{color:T.text}}>Training1!</strong> — or try wrong credentials to see error states.
          </p>
        </div>

        {/* Auth error banner */}
        {errors.auth&&(
          <div style={{background:"rgba(163,86,42,.15)",border:"1px solid rgba(163,86,42,.4)",borderRadius:"10px",padding:"10px 14px",marginBottom:"14px",display:"flex",gap:"8px",alignItems:"flex-start",animation:shake?"shake .4s":"none"}}>
            <span style={{fontSize:"15px",flexShrink:0}}>{isLocked?"🔒":"⚠️"}</span>
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
            {errors.email&&<p style={{fontSize:"11px",color:"#e07a5f",marginTop:"4px",fontWeight:"600"}}>⚠ {errors.email}</p>}
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
                {showPw?"🙈":"👁️"}
              </button>
            </div>
            {errors.pw&&<p style={{fontSize:"11px",color:"#e07a5f",marginTop:"4px",fontWeight:"600"}}>⚠ {errors.pw}</p>}
          </div>

          {/* Remember me + Forgot password */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
            <label style={{display:"flex",alignItems:"center",gap:"7px",cursor:"pointer"}}>
              <div onClick={()=>setRememberMe(v=>!v)} style={{width:"18px",height:"18px",borderRadius:"5px",border:`2px solid ${rememberMe?T.gold:T.inputBorder}`,background:rememberMe?"rgba(176,141,87,.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",cursor:"pointer"}}>
                {rememberMe&&<span style={{color:T.gold,fontSize:"11px",fontWeight:"900",lineHeight:1}}>✓</span>}
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
              ? `🔒 Locked (${lockSecs}s)`
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
// SCREEN: REGISTRATION — first name, last name, email, password
// ═══════════════════════════════════════════════════════════════════════════════
const RegistrationScreen = ({onVerify, onBack, darkMode, setDarkMode}) => {
  const T = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
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
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Please enter a valid email.";
    if(!isPasswordValid(pw))                   e.pw        = `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include a capital letter, a number, and a special character.`;
    if(confirmPw !== pw)                       e.confirmPw = "Passwords do not match.";
    if(!allAgreed)                             e.legal     = "You must agree to all policies to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if(!validate()) return;
    setLoading(true);
    // Simulate account creation + email dispatch (1.2s)
    setTimeout(() => {
      setLoading(false);
      onVerify({ firstName, lastName, email, pw });
    }, 1200);
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
                <input value={f.val} placeholder={f.ph} onChange={e=>{f.set(e.target.value);setErrors(r=>({...r,[f.key]:undefined}));}}
                  style={inputStyle(f.key)}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors[f.key]?T.brown:T.inputBorder}/>
                {errors[f.key]&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}>⚠ {errors[f.key]}</p>}
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
            {errors.email&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}>⚠ {errors.email}</p>}
          </div>

          {/* Password */}
          <div style={{marginBottom:"16px"}}>
            <label style={{display:"block",fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:errors.pw?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>Password</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={pw} placeholder={`Min ${PASSWORD_MIN_LENGTH} characters`}
                onChange={e=>{setPw(e.target.value);setErrors(r=>({...r,pw:undefined}));}}
                style={{...inputStyle("pw"),paddingRight:"44px"}}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors.pw?T.brown:T.inputBorder}/>
              <button onClick={()=>setShowPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}>{showPw?"🙈":"👁️"}</button>
            </div>
            {errors.pw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}>⚠ {errors.pw}</p>}
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
              <button onClick={()=>setShowConfirmPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}>{showConfirmPw?"🙈":"👁️"}</button>
            </div>
            {errors.confirmPw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}>⚠ {errors.confirmPw}</p>}
            {!errors.confirmPw && confirmPw.length>0 && confirmPw===pw && <p style={{fontSize:"10px",color:"#4caf7d",marginTop:"3px",fontWeight:"600"}}>✓ Passwords match</p>}
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
                  {agreed&&<span style={{color:T.gold,fontSize:"12px",fontWeight:"900",lineHeight:1}}>✓</span>}
                </div>
                <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.5,userSelect:"none"}}>
                  I have read and agree to the{" "}
                  <a href={url} target="_blank" rel="noreferrer"
                    onClick={e=>e.stopPropagation()}
                    style={{color:T.gold,fontWeight:"700",textDecoration:"underline"}}>{label}</a>
                </p>
              </div>
            ))}
            {errors.legal&&<p style={{fontSize:"11px",color:"#e07a5f",fontWeight:"600",marginTop:"4px"}}>⚠ {errors.legal}</p>}
          </div>

          {/* CTA */}
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
          <GoogleBtn label="Sign up with Google" onClick={()=>onVerify({firstName:"Demo",lastName:"User",email:"demo@gmail.com",pw:"",googleAuth:true})}/>
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

  const handleVerify = (code) => {
    const entered = code || codeDigits.join("");
    if(entered.length < 6){ setCodeError(true); return; }
    setVerifying(true);
    setCodeError(false);
    setTimeout(()=>{
      // Demo: any 6-digit code works, or specifically 123456
      if(entered.length===6){
        setVerifying(false);
        setPhase("verified");
        setTimeout(()=>onVerified(), 2000);
      } else {
        setVerifying(false);
        setCodeError(true);
      }
    },1100);
  };

  const handleResend = () => {
    if(resendCooldown>0) return;
    startCooldown();
    setCodeDigits(["","","","","",""]);
    setCodeError(false);
  };

  if(phase==="verified") return (
    <PhoneShell>
      <TopBanner/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",textAlign:"center"}}>
        <div style={{width:"80px",height:"80px",borderRadius:"50%",background:T.success,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"36px",marginBottom:"20px",animation:"successPop .5s cubic-bezier(.22,1,.36,1) both",boxShadow:`0 0 0 12px rgba(76,175,125,.1),0 0 0 24px rgba(76,175,125,.05)`}}>✓</div>
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
          <div style={{fontSize:"52px",marginBottom:"14px",animation:"fadeUp .5s both"}}>✉️</div>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Check your email</h2>
          <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"4px"}}>We sent a 6-digit verification code to:</p>
          <p style={{fontSize:"14px",fontWeight:"700",color:T.gold,marginBottom:"16px"}}>{userData.email}</p>
          <div style={{background:"rgba(176,141,87,.08)",border:"1px solid rgba(176,141,87,.2)",borderRadius:"10px",padding:"9px 12px",display:"inline-block"}}>
            <p style={{fontSize:"11px",color:T.textMuted}}>💡 Demo: any 6 digits work — try <strong style={{color:T.gold}}>123456</strong></p>
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
          {codeError&&<p style={{textAlign:"center",fontSize:"11px",color:"#e07a5f",fontWeight:"700"}}>⚠ Invalid code. Please try again.</p>}
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
            📬 <strong style={{color:T.text}}>Can't find it?</strong> Check your spam or promotions folder. The email comes from <span style={{color:T.gold,fontWeight:"700"}}>noreply@guidingpaw.com</span>
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
    role:[],rescue:null,petType:null,gender:null,age:"",weight:"",birthday:"",breed:"",name:"",
    knows:[],issues:[],trainTime:[],trainHour:"7",trainAmPm:"AM",trainMin:"00",lifestyle:[],plan:"annual",petType:"dog",
    additionalPets:false,additionalPetsList:[],
    // pre-fill from registration
    name:(userData?.firstName||"")+" "+(userData?.lastName||""),
    firstName:userData?.firstName||"", lastName:userData?.lastName||"",
    email:userData?.email||"", pw:userData?.pw||""
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
const PLAN_DETAILS = {
  monthly: {name:"Monthly",price:"$14.99",per:"/mo",trial:"7-day free trial, then $14.99/mo"},
  annual:  {name:"Annual",price:"$99",per:"/yr",trial:"7-day free trial, then $99/yr (just $8.25/mo)"},
  pro:     {name:"Pro Coaching",price:"$39",per:"/mo",trial:"7-day free trial, then $39/mo"},
};

const PaymentScreen = ({petData, onSuccess, onBack}) => {
  const T=useTheme();
  const pd=PLAN_DETAILS[petData?.plan||"annual"];
  const [cardName,setCardName]=useState("");
  const [cardNum,setCardNum]=useState("");
  const [expiry,setExpiry]=useState("");
  const [cvv,setCvv]=useState("");
  const [promo,setPromo]=useState("");
  const [promoApplied,setPromoApplied]=useState(false);
  const [promoError,setPromoError]=useState(false);
  const [loading,setLoading]=useState(false);

  const fmtCard=(v)=>v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExpiry=(v)=>{const d=v.replace(/\D/g,"").slice(0,4);return d.length>2?d.slice(0,2)+"/"+d.slice(2):d;};

  const applyPromo=()=>{
    if(promo.trim().toUpperCase()==="PAWS10"){setPromoApplied(true);setPromoError(false);}
    else{setPromoError(true);setPromoApplied(false);}
  };

  const handlePay=()=>{
    setLoading(true);
    setTimeout(()=>{ setLoading(false); onSuccess(); }, 1800);
  };

  return (
    <PhoneShell>
      <TopBanner/>
      <div style={{padding:"10px 18px 0",display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:"20px",padding:"2px 6px 2px 0"}}>‹</button>
        <p style={{fontSize:"11px",fontWeight:"700",color:T.textMuted,letterSpacing:".12em",textTransform:"uppercase"}}>Secure Checkout</p>
        <span style={{marginLeft:"auto",fontSize:"13px"}}>🔒</span>
      </div>
      <ScrollBody pad="18px 22px">

        {/* Order summary */}
        <div className="s1" style={{background:T.green,borderRadius:"16px",padding:"16px",marginBottom:"18px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:"12px",top:"10px",fontSize:"40px",opacity:.12}}>🐾</div>
          <p style={{fontSize:"9px",fontWeight:"900",letterSpacing:".16em",textTransform:"uppercase",color:"rgba(255,255,255,.5)",marginBottom:"6px"}}>Order Summary</p>
          <p style={{fontFamily:"'Inter',serif",fontSize:"20px",fontWeight:"700",color:"#fff",marginBottom:"4px"}}>Guiding Paw {pd.name}</p>
          <div style={{display:"flex",alignItems:"baseline",gap:"4px",marginBottom:"10px"}}>
            <span style={{fontSize:"28px",fontWeight:"900",color:T.goldL}}>{promoApplied?"🏷️ "+pd.price:pd.price}</span>
            <span style={{fontSize:"13px",color:"rgba(255,255,255,.5)"}}>{pd.per}</span>
            {promoApplied&&<span style={{fontSize:"11px",color:T.success,fontWeight:"700",marginLeft:"4px"}}>−10% applied!</span>}
          </div>
          <p style={{fontSize:"11px",color:"rgba(255,255,255,.45)",lineHeight:1.5}}>{pd.trial}</p>
          <div style={{display:"flex",gap:"10px",marginTop:"10px",flexWrap:"wrap"}}>
            {["✓ Cancel anytime","✓ No contracts","✓ 7-day free trial"].map(r=><span key={r} style={{fontSize:"10px",color:T.success,fontWeight:"700"}}>{r}</span>)}
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

        {/* Card fields */}
        <div className="s3">
          {[
            {label:"Name on Card",val:cardName,set:setCardName,ph:"Jane Smith",type:"text"},
            {label:"Card Number",val:cardNum,set:(v)=>setCardNum(fmtCard(v)),ph:"1234 5678 9012 3456",type:"text"},
          ].map(f=>(
            <div key={f.label} style={{marginBottom:"12px"}}>
              <label style={{display:"block",fontSize:"10px",fontWeight:"700",color:T.gold,letterSpacing:".14em",textTransform:"uppercase",marginBottom:"5px"}}>{f.label}</label>
              <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                style={{width:"100%",padding:"12px 14px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
            {[{label:"Expiry",val:expiry,set:(v)=>setExpiry(fmtExpiry(v)),ph:"MM/YY"},{label:"CVV",val:cvv,set:setCvv,ph:"•••"}].map(f=>(
              <div key={f.label}>
                <label style={{display:"block",fontSize:"10px",fontWeight:"700",color:T.gold,letterSpacing:".14em",textTransform:"uppercase",marginBottom:"5px"}}>{f.label}</label>
                <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} maxLength={f.label==="CVV"?4:5}
                  style={{width:"100%",padding:"12px 14px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
              </div>
            ))}
          </div>
        </div>

        {/* Promo code */}
        <div className="s4" style={{marginBottom:"18px"}}>
          <label style={{display:"block",fontSize:"10px",fontWeight:"700",color:T.gold,letterSpacing:".14em",textTransform:"uppercase",marginBottom:"5px"}}>Promo Code</label>
          <div style={{display:"flex",gap:"8px"}}>
            <input value={promo} onChange={e=>{setPromo(e.target.value);setPromoError(false);setPromoApplied(false);}} placeholder="Enter code (try PAWS10)"
              style={{flex:1,padding:"11px 13px",background:T.inputBg,border:`1px solid ${promoError?T.brown:promoApplied?T.success:T.inputBorder}`,borderRadius:"10px",fontSize:"13px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
            <button onClick={applyPromo} style={{padding:"11px 15px",borderRadius:"10px",background:"rgba(176,141,87,.15)",border:`1px solid ${T.gold}`,color:T.gold,fontWeight:"700",fontSize:"12px",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Lato',sans-serif"}}>Apply</button>
          </div>
          {promoApplied&&<p style={{fontSize:"11px",color:T.success,fontWeight:"700",marginTop:"5px"}}>✓ Code applied — 10% off your first payment!</p>}
          {promoError&&<p style={{fontSize:"11px",color:"#e07a5f",fontWeight:"700",marginTop:"5px"}}>✗ Invalid code. Try PAWS10 for a demo.</p>}
        </div>

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
            : <>Start My Free Trial</>}
        </button>
        <p style={{textAlign:"center",fontSize:"10px",color:T.textFaint,marginTop:"10px",lineHeight:1.5}}>Your card won't be charged during the 7-day trial. Cancel anytime.</p>
      </ScrollBody>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: PAYMENT SUCCESS (animated)
// ═══════════════════════════════════════════════════════════════════════════════
const SuccessScreen = ({petData, onContinue}) => {
  const T=useTheme();
  const [phase,setPhase]=useState(0); // 0=checkmark, 1=details, 2=button
  const pd=PLAN_DETAILS[petData?.plan||"annual"];
  useState(()=>{ // cascade animations
    const t1=setTimeout(()=>setPhase(1),900);
    const t2=setTimeout(()=>setPhase(2),1600);
    return ()=>{clearTimeout(t1);clearTimeout(t2);};
  });
  return (
    <PhoneShell>
      <TopBanner/>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",textAlign:"center"}}>
        {/* Animated checkmark ring */}
        <div style={{position:"relative",marginBottom:"24px"}}>
          <div style={{width:"90px",height:"90px",borderRadius:"50%",background:T.success,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 0 12px rgba(76,175,125,.12), 0 0 0 24px rgba(76,175,125,.06)`,animation:"successPop .5s cubic-bezier(.22,1,.36,1) both"}}>
            <span style={{fontSize:"42px",animation:"checkIn .4s .2s both",display:"block"}}>✓</span>
          </div>
        </div>

        <div style={{animation:phase>=1?"fadeUp .5s both":"none",opacity:phase>=1?1:0}}>
          <p style={{fontSize:"11px",fontWeight:"900",letterSpacing:".18em",textTransform:"uppercase",color:T.gold,marginBottom:"8px"}}>Payment Successful</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"26px",fontWeight:"700",color:T.text,marginBottom:"8px",lineHeight:1.25}}>Welcome to Guiding Paw!</h2>
          <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"20px"}}>Your <strong style={{color:T.goldL}}>{pd.name}</strong> plan is active. Your 7-day free trial starts now.</p>

          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"24px",textAlign:"left"}}>
            {[
              {icon:"🐾",label:"Plan",val:pd.name},
              {icon:"💳",label:"Billed",val:pd.price+pd.per},
              {icon:"📅",label:"Trial ends",val:"Mar 16, 2026"},
              {icon:"✉️",label:"Receipt sent to",val:"you@example.com"},
            ].map(({icon,label,val})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.divider}`}}>
                <span style={{fontSize:"12px",color:T.textMuted}}>{icon} {label}</span>
                <span style={{fontSize:"12px",fontWeight:"700",color:T.text}}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{width:"100%",animation:phase>=2?"fadeUp .45s .05s both":"none",opacity:phase>=2?1:0}}>
          <GoldBtn onClick={onContinue}>Let's Get Started 🐾</GoldBtn>
        </div>
      </div>
    </PhoneShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: WELCOME DASHBOARD (first-time)
// ═══════════════════════════════════════════════════════════════════════════════
const WelcomeDashboard = ({petData, plan, onDismiss}) => {
  const T=useTheme();
  const petName=petData?.name||"Luna";
  const breed=petData?.breed||"";
  return (
    <ScrollBody>
      {/* Hero welcome banner */}
      <div className="s1" style={{background:T.green,borderRadius:"18px",padding:"22px 18px",marginBottom:"18px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:"-10px",top:"-10px",fontSize:"80px",opacity:.08}}>🐾</div>
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
        {icon:"📋",title:"Complete Today's Assignment",desc:"Your first lesson is ready and waiting.",cta:"Start Lesson",color:T.gold},
        {icon:"🐾",title:"Set Up Pet Profile",desc:breed?`We've saved ${breed} — you can add more details anytime.`:"Add your pet's breed to unlock personalized training tips.",cta:"Go to Settings",color:T.goldL},
        {icon:"🗓️",title:"Build Your Daily Routine",desc:"Set your training schedule for maximum consistency.",cta:"Build Routine",color:T.success},
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
  steps.push({content:(<><SectionTitle>Any additional pets in the home?</SectionTitle><p style={{fontSize:"12px",color:T.textMuted,marginBottom:"14px"}}>Check this box if you have more than one pet — you can fill out a profile for each one.</p><div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",border:`1px solid ${data.additionalPets?T.gold:T.chipBorder}`,borderRadius:"12px",background:data.additionalPets?"rgba(176,141,87,.1)":T.chipBg,cursor:"pointer"}} onClick={()=>set("additionalPets",!data.additionalPets)}><div style={{width:"22px",height:"22px",borderRadius:"6px",border:`2px solid ${data.additionalPets?T.gold:T.inputBorder}`,background:data.additionalPets?"rgba(176,141,87,.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>{data.additionalPets&&<span style={{color:T.gold,fontSize:"13px",fontWeight:"900"}}>✓</span>}</div><span style={{fontSize:"14px",fontWeight:"700",color:data.additionalPets?T.goldLight:T.text}}>Yes, I have additional pets</span></div>{data.additionalPets&&<p style={{fontSize:"11.5px",color:T.textMuted,marginTop:"12px",lineHeight:1.5}}>After completing this questionnaire you'll be able to add profiles for your other pets in the Profile section.</p>}</>)});
  // Gender
  steps.push({content:(<><SectionTitle>Boy or girl?</SectionTitle><ChipGroup options={[{value:"boy",label:"Boy 💙"},{value:"girl",label:"Girl 💗"}]} selected={data.gender} onToggle={v=>set("gender",v)} single/></>)});
  // Details
  steps.push({content:(<><SectionTitle>Tell us about your dog</SectionTitle>{["name","age","weight","birthday","breed"].map(k=><div key={k} style={{marginBottom:"11px"}}><label style={{fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:T.gold,fontWeight:"700",display:"block",marginBottom:"5px"}}>{k==="birthday"?"Birthday (MM/DD/YYYY)":k.charAt(0).toUpperCase()+k.slice(1)}</label><input value={data[k]} onChange={e=>set(k,e.target.value)} placeholder={k==="age"?"e.g. 2 years":k==="weight"?"lbs":k==="birthday"?"MM/DD/YYYY":k==="name"?"e.g. Luna":"e.g. Labrador Retriever"} style={{width:"100%",padding:"11px 14px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none"}}/></div>)}</>)});
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
  // Lifestyle
  const lifeOpts=["Outdoorsy","Active","Fast-paced lifestyle","Nomadic / Travel often","Love having people over","I have kids","Sometimes I'm a couch potato","Want my dog to be my service / emotional support animal"];
  steps.push({content:(<><SectionTitle>Your lifestyle?</SectionTitle><p style={{fontSize:"12px",color:T.textMuted,marginBottom:"12px"}}>Select all that apply</p><ChipGroup options={lifeOpts} selected={data.lifestyle} onToggle={v=>toggle("lifestyle",v,false)}/></>)});

  // CHANGE 6: Plan selection only — payment handled on dedicated screen
  steps.push({content:(
    <>
      <div style={{background:T.green,borderRadius:"12px",padding:"12px 14px",marginBottom:"18px",textAlign:"center"}}>
        <p style={{fontSize:"10px",fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",color:"#8de0b0",marginBottom:"2px"}}>Your Goal</p>
        <p style={{fontSize:"13px",fontWeight:"700",color:"#d0f0e0",lineHeight:1.4}}>Build a well-trained, confident pet with daily guidance</p>
      </div>
      <SectionTitle>Choose Your Plan</SectionTitle>
      <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"12px"}}>
        {[
          {id:"monthly",name:"Monthly",price:"$14.99",per:"/mo",desc:"Full access to all training programs",badge:null,highlight:false,savings:null},
          {id:"annual",name:"Annual",price:"$99",per:"/yr",desc:"Full access to all training programs",badge:"MOST POPULAR",highlight:true,savings:"Save $80/yr vs monthly — just $8.25/mo"},
          {id:"pro",name:"Pro Coaching",price:"$39",per:"/mo",desc:"Full training programs + TRAINER MESSAGING + VIDEO FEEDBACK",badge:"PREMIUM",highlight:false,savings:null},        ].map(p=>(
          <div key={p.id} onClick={()=>set("plan",p.id)} style={{padding:p.highlight?"16px":"13px 14px",borderRadius:"14px",cursor:"pointer",border:`2px solid ${data.plan===p.id?T.gold:p.highlight?"#B08D57":T.chipBorder}`,background:data.plan===p.id?"rgba(176,141,87,.15)":p.highlight?"rgba(176,141,87,.07)":T.chipBg,transition:"all .2s",position:"relative",transform:p.highlight?"scale(1.02)":"scale(1)"}}>
            {p.badge&&<div style={{position:"absolute",top:"-10px",right:"10px",background:p.id==="annual"?T.gold:T.brown,color:"white",fontSize:"9px",fontWeight:"900",letterSpacing:".1em",padding:"3px 9px",borderRadius:"10px"}}>{p.badge}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <p style={{fontSize:p.highlight?"15px":"13.5px",fontWeight:"700",color:data.plan===p.id?T.gold:p.highlight?T.goldLight:T.text,marginBottom:"3px"}}>{p.name}</p>
                <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.4}}>{p.desc}</p>
                {p.savings&&<p style={{fontSize:"10.5px",color:T.success,fontWeight:"700",marginTop:"5px"}}>✓ {p.savings}</p>}
              </div>
              <div style={{textAlign:"right",marginLeft:"10px"}}>
                <span style={{fontSize:p.highlight?"20px":"16px",fontWeight:"900",color:T.gold}}>{p.price}</span>
                <span style={{fontSize:"11px",color:T.textMuted}}>{p.per}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:"14px",marginBottom:"4px",flexWrap:"wrap"}}>
        {["Cancel anytime","No contracts"].map(r=><span key={r} style={{fontSize:"11px",color:T.success,fontWeight:"700"}}>✓ {r}</span>)}
      </div>
    </>
  ),nextLabel:"Continue to Payment →"});
  return steps;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── BREED DATA LIBRARY ────────────────────────────────────────────────────────
const BREED_DATA = {
  // Retrievers
  "labrador retriever":   { tendency:"Labs are highly food-motivated and eager to please, but can be easily distracted by scent and surroundings.", tip:"Use high-value treats to keep focus. Keep sessions short — Labs can mentally fatigue faster than they look.", exercise:"Labs need 60–90 min of vigorous activity daily. Today's walk should be brisk, not leisurely." },
  "golden retriever":     { tendency:"Goldens are sensitive and bond deeply with their handler. Harsh corrections backfire — they shut down quickly.", tip:"Use a warm, encouraging tone during e-collar intro. Celebrate every correct response enthusiastically.", exercise:"45–60 min of active exercise today. A game of fetch after training reinforces your bond." },
  // Working/Sport
  "german shepherd":      { tendency:"GSD's are highly intelligent and can anticipate commands — which means they'll also anticipate corrections.", tip:"Keep your timing razor sharp. GSD's read body language intensely, so stay calm and deliberate.", exercise:"GSD's need structured mental + physical work. Add a 15-min structured heel to today's walk." },
  "belgian malinois":     { tendency:"Malinois have an extremely high drive and need mental stimulation as much as physical. Boredom = destruction.", tip:"Keep sessions intense and reward-driven. This breed thrives on precision — reward exact responses only.", exercise:"Malinois need 90+ min of exercise. Include a run or high-intensity game before today's training session." },
  "dutch shepherd":       { tendency:"Dutch Shepherds are driven, athletic, and loyal. They respond well to clear structure and dislike inconsistency.", tip:"Be consistent with every command. Inconsistency frustrates this breed more than most.", exercise:"High energy — aim for 60–90 min. A structured off-leash run before training will improve focus." },
  "rottweiler":           { tendency:"Rottweilers are calm and confident but can be stubborn. They need a handler who is equally calm and clear.", tip:"Give commands once, clearly. Repeating yourself teaches a Rottweiler that the first command is optional.", exercise:"45–60 min daily. Today include a weighted or structured walk to satisfy their working dog instincts." },
  "doberman pinscher":    { tendency:"Dobermans are alert, sensitive, and fast. They pick up on handler energy — anxiety or frustration transfers instantly.", tip:"Project confidence and calm. Dobermans thrive with clarity; vague cues cause anxiety.", exercise:"60–90 min recommended. An off-leash sprint or structured jog is ideal before today's session." },
  "great dane":           { tendency:"Great Danes are gentle giants — often unaware of their size. They can be slow to mature but respond well to patience.", tip:"Keep sessions short (10–15 min max). Great Danes tire of repetition quickly. One skill per session.", exercise:"30–45 min of moderate walking. Avoid intense exercise until fully grown (18–24 months)." },
  // Herding
  "border collie":        { tendency:"Border Collies are exceptionally fast learners — which means they get bored faster than any other breed.", tip:"Rotate exercises every 3–4 reps to prevent anticipation. Channel herding instinct into structured games.", exercise:"90+ min is ideal. Include both physical and mental challenges — puzzle toy after training is a must." },
  "australian shepherd":  { tendency:"Aussies are high-drive, high-intelligence, and prone to anxiety if understimulated. They need a job.", tip:"Structure every interaction as part of their 'job.' Reward calm behavior as much as correct responses.", exercise:"60–90 min daily. Include directional work or frisbee to satisfy their herding drive." },
  "australian cattle dog":{ tendency:"ACDs are tenacious, independent thinkers. They'll test you, and if you're inconsistent, they'll exploit it.", tip:"Be crystal clear with every expectation. This breed respects confidence and loses respect for weakness.", exercise:"90+ min. High-intensity fetch, frisbee, or structured running is ideal before today's session." },
  "corgi":                { tendency:"Corgis were bred to herd cattle and are surprisingly bold for their size. They can be vocal and opinionated.", tip:"Use firm, clear corrections. Corgis can ignore soft cues. Keep training sessions engaging — they bore quickly.", exercise:"45–60 min including mental stimulation. A structured walk and short training burst works well." },
  // Terriers
  "american pit bull terrier":{ tendency:"Pit Bulls are people-pleasers with high drive. Their strength and tenacity means you need excellent leash skills.", tip:"Prioritize loose-leash walking and impulse control. Their strength amplifies any training gap.", exercise:"60–90 min of vigorous exercise. Today's walk should include structured heel work, not free-sniffing." },
  "american staffordshire terrier":{ tendency:"AmStaffs are strong-willed and physically powerful. They thrive with a clear pack structure and consistent rules.", tip:"Set rules and enforce them every time — AmStaffs notice when you let things slide and will push further.", exercise:"60–90 min. Include strength-building activities like tug or weighted walks alongside today's training." },
  "bull terrier":         { tendency:"Bull Terriers are clown-like and stubborn. They have selective hearing and will test your patience on purpose.", tip:"Keep sessions fun and short. Use play as a reward — Bull Terriers respond to play more than food.", exercise:"45–60 min. Energy must be out before training — a tired Bull Terrier is a more compliant one." },
  "jack russell terrier": { tendency:"Jack Russells have massive prey drive and very high energy. They are not naturally wired to sit still.", tip:"Train in a distraction-free zone first. Their threshold for stimulation is very low.", exercise:"60+ min including both mental and physical exercise. Puzzle feeders before training help settle them." },
  // Scent Hounds
  "beagle":               { tendency:"Beagles are nose-first dogs. Once a scent is found, recall becomes nearly impossible without solid foundation work.", tip:"Work recall in a low-distraction area first. Never trust an off-leash Beagle near open space without a long line.", exercise:"45–60 min including scent-based enrichment like a sniff walk or find-it game." },
  "bloodhound":           { tendency:"Bloodhounds are single-minded on a trail. They require a patient handler who accepts that this breed isn't naturally obedient.", tip:"Use scent games as reward. Make training feel like nose work — it motivates them far more than praise.", exercise:"45–60 min of moderate exercise. Avoid intense heat — their extra skin makes them prone to overheating." },
  "basset hound":         { tendency:"Bassets are gentle and stubborn in equal measure. Motivation is everything — they won't work for free.", tip:"Find their highest-value reward and use it only in training. Bassets shut down when bored or when corrections are too harsh.", exercise:"30–45 min moderate walk. Not built for high intensity — keep exercise steady and consistent." },
  // Toy / Small
  "chihuahua":            { tendency:"Chihuahuas are bold, opinionated, and often treated like accessories — which causes most of their behavior problems.", tip:"Train them exactly like a big dog. No baby talk, no exceptions for size. Consistency is everything.", exercise:"20–30 min. Short burst walks and indoor training sessions satisfy them well." },
  "french bulldog":       { tendency:"Frenchies are stubborn but food-motivated. Their flat faces mean they tire quickly and can overheat.", tip:"Keep training sessions under 10 min. End before they disengage — stopping at a win keeps them eager.", exercise:"20–30 min in cool conditions. Avoid midday heat entirely. Morning or evening sessions only." },
  "pomeranian":           { tendency:"Pomeranians are clever, loud, and often spoiled. They learn fast — for good or bad habits alike.", tip:"Don't repeat commands. Poms learn quickly that waiting you out pays off if you ask twice.", exercise:"20–30 min. Structured leash walks prevent the 'tiny dog who rules the house' syndrome." },
  "shih tzu":             { tendency:"Shih Tzus were bred as lap companions — obedience is not in their DNA. They need extra motivation to engage.", tip:"Use high-value food rewards and keep energy light and fun. Harsh corrections cause them to shut down entirely.", exercise:"20–30 min gentle walk. Avoid heat and humidity — their flat faces make breathing harder when hot." },
  // Sporting
  "vizsla":               { tendency:"Vizslas are velcro dogs — sensitive, attached, and prone to separation anxiety without proper structure.", tip:"Build independence slowly. Practice place and out-of-sight stays early to prevent anxiety from setting in.", exercise:"60–90 min of vigorous activity. Vizslas are marathon runners — they need real exertion, not a stroll." },
  "weimaraner":           { tendency:"Weims are high-drive, strong-willed, and prone to destruction when under-exercised. Exercise is not optional.", tip:"Exercise first, always. A Weimaraner who hasn't run today won't train well today.", exercise:"60–90 min minimum. Running, swimming, or fetch are ideal. Today's walk alone is not enough." },
  "english springer spaniel":{ tendency:"Springers are enthusiastic, biddable, and prone to overexcitement. They need an outlet for their energy and drive.", tip:"Use calm transitions between exercises to prevent excitement spilling into frantic behavior.", exercise:"45–60 min including fetch or off-leash running to satisfy their sporting instincts." },
  // Guardian / Giant
  "cane corso":           { tendency:"Cane Corsos are dominant, deeply loyal, and require a handler who is calm but absolutely consistent.", tip:"Never lose your composure. A Cane Corso respects calmness above everything else. React — don't overreact.", exercise:"45–60 min structured walk. Leash manners are critical — their strength makes pulling dangerous." },
  "kangal":               { tendency:"Kangals are independent livestock guardians. They were not bred to look to humans for direction — they were bred to think for themselves.", tip:"Build a relationship before asking for compliance. Trust must be established before commands will land.", exercise:"60–90 min of open-space exercise. Kangals need room to roam — a yard walk doesn't cut it." },
  "boerboel":             { tendency:"Boerboels are confident, territorial, and incredibly strong. Handler authority must be established early and maintained consistently.", tip:"Never allow behavior you wouldn't accept from a 150lb dog — because that's what you're going to have.", exercise:"45–60 min of structured exercise. Include leash work to build handler relationship alongside physical fitness." },
  // Sighthounds
  "greyhound":            { tendency:"Greyhounds are gentle, quiet, and fast. They are sighthound-wired — movement triggers chase instinct instantly.", tip:"Long-line recall work is essential before any off-leash freedom. Do not trust recall near open space.", exercise:"Short sprints rather than long walks. 2–3 daily short sessions of activity suits them better than one long walk." },
  "whippet":              { tendency:"Whippets are sensitive, affectionate, and surprisingly fast. Like Greyhounds, prey drive is hard-wired.", tip:"Use gentle, encouraging tones. Whippets are emotionally sensitive and respond poorly to harsh handling.", exercise:"45–60 min including a safe off-leash sprint in an enclosed area — they need to run." },
  // Doodles / Mixed
  "goldendoodle":         { tendency:"Goldendoodles combine retriever eagerness with poodle intelligence. They can be easily excitable and distracted.", tip:"Channel their enthusiasm — use their energy as a reward. Play after a good session beats food for many Doodles.", exercise:"45–60 min. Include both physical activity and a mental challenge like a puzzle or hide-and-seek game." },
  "labradoodle":          { tendency:"Labradoodles are clever, energetic, and social. Without direction, that intelligence turns into mischief.", tip:"Keep training sessions varied and fast-paced. Repetitive drills bore Labradoodles into non-compliance.", exercise:"45–60 min. Structured fetch or swimming gives them the outlet they need before focused training." },
  "bernedoodle":          { tendency:"Bernedoodles are gentle and laid-back like Berners, with Poodle sharpness. They are sensitive to conflict and change.", tip:"Keep your energy steady and calm. Bernedoodles absorb handler stress easily — stay composed.", exercise:"30–45 min at a moderate pace. They enjoy outdoor exploration more than intense structured exercise." },
  // Default fallback
  "default":              { tendency:"Every dog is an individual shaped by genetics, history, and environment.", tip:"Read your dog's body language throughout the session. Adjust your energy and pace to match what they need today.", exercise:"Aim for at least 30 min of exercise today before your training session for best results." },
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

// ─── WELCOME VIDEOS ────────────────────────────────────────────────────────────
// Place the corresponding .mp4 files in your app's public assets folder at these paths
// (e.g. /public/videos/... for Create React App or Vite, or /public/videos/... for Next.js).
// ─── TESTING MODE ───────────────────────────────────────────────────────────────
// While true: the 7-day wait between Learn section weeks is skipped, so testers can move
// through the entire program immediately instead of waiting real days between weeks.
// Set this to false before launching to real, paying customers — otherwise the intended
// weekly pacing (a real part of the training program) will never actually apply.
const TESTING_MODE = true;

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
    tasks:[
      {name:"Establish daily structure (potty-activity-potty-nap)", sessionsPerDay:"N/A", sessionLength:"N/A"},
      {name:"Work for food",                        sessionsPerDay:"24/7", sessionLength:"N/A"},
      {name:"100% Supervision",                     sessionsPerDay:"N/A", sessionLength:"N/A"},
      {name:"Bitey/destructive behavior management", sessionsPerDay:"24/7", sessionLength:"Redirect/assess schedule"},
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall/Chase Me",                      sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming/Handling",                    sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Socializing — 1-3 new sounds (vacuum, tv, knocking), 1-3 new surfaces (tile, rug, wood), 1-3 new objects (umbrella, box, bag)", sessionsPerDay:"1-2", sessionLength:"5 min"},
    ],
    mistakes:["Not giving the puppy enough alone time","Kenneling for too long","Giving too much space for the puppy to exist in","Not rewarding desired behaviors","Forgetting to have fun and enjoy the process"],
    lessons:["Intro to 100% supervision & tethering","Set a schedule","Create and submit schedule for feedback in Pro"]},
  {id:"pp2",  label:"Week 2",  sublabel:"Communication",
    goal:"Increase communication using marker words, continuing kennel work, and building engagement.",
    tasks:[
      {name:"Marker Words",                         sessionsPerDay:"1-3", sessionLength:"2-5 min"},
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Building responsiveness through a continuation of name games, introduction to recall behaviors, and name \u201csit\u201d cue.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Continue adding verbal cue for sit, using sit in daily life, expanding socializing. Introduce down with food lure.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Add verbal cue with down, strengthen sits with distractions, intro to waiting and patience.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Continue adding verbal cue to \u201cdown\u201d, begin training in the backyard, mild distractions. Introduce Structured Calm - Place.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Teach puppy to follow leash pressure, introduce boundary rules, and improve outdoor engagement.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Build leash skills and engagement in slightly busier areas.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Build confidence and calmness in larger environments.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Introduce calm in controlled public environments.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
    goal:"Increase time spent in public spaces, build duration, remain calm around activity.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
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
  {id:"pp12", label:"Week 12 🎓", sublabel:"Dog Neutrality",
    goal:"Learn to be neutral around other dogs, strengthen focus despite distractions, build long term habits.",
    tasks:[
      {name:"Alone Time",                           sessionsPerDay:"1-3", sessionLength:"1-5 min"},
      {name:"Kennel",                               sessionsPerDay:"1-4", sessionLength:"Nap Time"},
      {name:"Name Game",                            sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Recall with long leash",               sessionsPerDay:"1-2", sessionLength:"5-10 reps"},
      {name:"Grooming Desensitizing",               sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Sit and Down",                         sessionsPerDay:"1-4", sessionLength:"5 min each"},
      {name:"Threshold Boundaries",                 sessionsPerDay:"2-4", sessionLength:"5 min"},
      {name:"Settling / Do Nothing",                sessionsPerDay:"1",   sessionLength:"5 min"},
      {name:"Leash Games",                          sessionsPerDay:"1",   sessionLength:"1-5 min"},
      {name:"Loose leash walking",                  sessionsPerDay:"1",   sessionLength:"10+ min"},
      {name:"Socializing — 1-2 park visits with moderate distractions", sessionsPerDay:"1-2", sessionLength:"5 min"},
      {name:"Intro to dog neutrality",              sessionsPerDay:"1",   sessionLength:"5 min"},
      {name:"Structured Calm - Place",              sessionsPerDay:"1-3", sessionLength:"10-15 min"},
    ],
    mistakes:["Being inconsistent","Allowing unwanted interactions","Expecting perfection"],
    lessons:["Dog neutrality training","Graduation ceremony"], graduation:true},
];

// Daily timed schedules for each puppy week — shown on the Dashboard
const PUPPY_DAILY_SCHEDULE = {
  pp1: [
    {time:"7:00 AM",  task:"Morning tether & feeding",       detail:"Keep pup tethered to you. Feed breakfast in crate.",             emoji:"🌅"},
    {time:"8:00 AM",  task:"Potty break",                    detail:"Straight outside immediately after eating.",                    emoji:"🌿"},
    {time:"9:00 AM",  task:"Supervised free time",           detail:"30 min tethered exploration in one room.",                     emoji:"🏠"},
    {time:"10:00 AM", task:"Nap time in crate",              detail:"45–60 min crate rest. No exceptions.",                         emoji:"😴"},
    {time:"12:00 PM", task:"Midday potty & lunch",           detail:"Potty, then feed in crate.",                                   emoji:"🥣"},
    {time:"2:00 PM",  task:"Schedule review",                detail:"Write out and submit your puppy schedule for Pro feedback.",   emoji:"📋"},
    {time:"5:00 PM",  task:"Evening tether & play",          detail:"30 min tethered play with appropriate toys.",                  emoji:"🎾"},
    {time:"6:00 PM",  task:"Dinner & evening potty",         detail:"Feed in crate, immediate potty break after.",                  emoji:"🌙"},
    {time:"9:00 PM",  task:"Final potty & bedtime",          detail:"Crate for the night. Keep crate near your bed.",               emoji:"🛏️"},
  ],
  pp2: [
    {time:"7:00 AM",  task:"Morning routine",                detail:"Potty → feed → crate nap.",                                   emoji:"🌅"},
    {time:"9:00 AM",  task:"Name game session",              detail:"10 reps: say name → treat when they look. 2 min max.",        emoji:"🎯"},
    {time:"10:00 AM", task:"Marker word intro",              detail:"Say 'Yes!' → treat 15 times. Build the association.",         emoji:"✅"},
    {time:"11:00 AM", task:"Socialization outing",           detail:"15 min outside — new sounds, surfaces, gentle people.",       emoji:"🌍"},
    {time:"12:00 PM", task:"Midday potty & nap",             detail:"Crate nap 45–60 min after lunch.",                           emoji:"😴"},
    {time:"3:00 PM",  task:"'Good' marker practice",         detail:"Say 'Good!' during calm behavior. 5 min session.",            emoji:"🟡"},
    {time:"5:00 PM",  task:"Name game round 2",              detail:"10 more reps in a new location.",                             emoji:"🎯"},
    {time:"7:00 PM",  task:"Socialization log",              detail:"Write down 3 new things your puppy encountered today.",       emoji:"📝"},
  ],
  pp3: [
    {time:"7:30 AM",  task:"Morning potty & energy burn",    detail:"10 min outside sniff walk before training.",                  emoji:"🌿"},
    {time:"9:00 AM",  task:"Sit lure session #1",            detail:"Hold treat at nose → move slowly up. 5 reps, mark 'Yes!'.",  emoji:"🎯"},
    {time:"9:05 AM",  task:"Play break",                     detail:"2 min play reward after session.",                            emoji:"🎾"},
    {time:"11:00 AM", task:"Sit lure session #2",            detail:"5 reps in a new spot (kitchen vs living room).",              emoji:"🎯"},
    {time:"12:00 PM", task:"Lunch & crate nap",              detail:"Feed in crate. 60 min rest.",                                 emoji:"😴"},
    {time:"3:00 PM",  task:"Sit lure session #3",            detail:"5 reps. Try fading lure: fake lure hand, treat from pocket.", emoji:"🎯"},
    {time:"5:30 PM",  task:"Free shaping play",              detail:"Let pup explore. Mark and treat any voluntary sits.",         emoji:"🐾"},
  ],
  pp4: [
    {time:"8:00 AM",  task:"Morning sit practice",           detail:"5 reps sit from lure. Start adding verbal cue 'Sit'.",       emoji:"🎯"},
    {time:"9:30 AM",  task:"Indoor socialization",           detail:"New object (bag, box, umbrella) — let pup investigate.",     emoji:"📦"},
    {time:"11:00 AM", task:"Sit stay attempt",               detail:"Ask for sit, pause 1 sec, mark & treat. Build to 3 sec.",    emoji:"⏱️"},
    {time:"12:00 PM", task:"Lunch & nap",                    detail:"Crate nap 45–60 min.",                                       emoji:"😴"},
    {time:"3:00 PM",  task:"Sit with verbal only",           detail:"Try 'Sit' without lure hand. Reward if they get it.",        emoji:"🗣️"},
    {time:"5:00 PM",  task:"Indoor socialization #2",        detail:"New visitor or unfamiliar sound (vacuum, blender).",         emoji:"👥"},
  ],
  pp5: [
    {time:"8:00 AM",  task:"Sit review",                     detail:"5 quick sits to warm up. Verbal cue only.",                  emoji:"✅"},
    {time:"9:00 AM",  task:"Down lure session #1",           detail:"Sit → lure nose to floor slowly. Mark the moment elbows hit.",emoji:"🎯"},
    {time:"10:00 AM", task:"Indoor socialization",           detail:"Invite pup to approach different textures (tile, rug, mat).",emoji:"🏠"},
    {time:"12:00 PM", task:"Nap",                            detail:"Crate rest 60 min.",                                         emoji:"😴"},
    {time:"2:00 PM",  task:"Down lure session #2",           detail:"5 reps. Try 'Down' verbal cue before lure.",                 emoji:"🎯"},
    {time:"4:00 PM",  task:"Socialization walk",             detail:"On-leash walk in yard. New sounds, smells.",                  emoji:"🌿"},
    {time:"6:00 PM",  task:"Down lure session #3",           detail:"5 reps. Try luring from stand.",                             emoji:"🎯"},
  ],
  pp6: [
    {time:"8:00 AM",  task:"Down review",                    detail:"5 reps verbal cue only indoors.",                            emoji:"✅"},
    {time:"9:30 AM",  task:"First outdoor training session", detail:"5 sit reps + 5 down reps outside on your driveway.",        emoji:"🌤️"},
    {time:"11:00 AM", task:"Outdoor socialization",          detail:"Meet a neighbor. Practice calm greeting.",                   emoji:"👋"},
    {time:"12:00 PM", task:"Lunch & nap",                    detail:"Crate rest.",                                                emoji:"😴"},
    {time:"3:00 PM",  task:"Outdoor down practice",          detail:"5 downs on grass. New surface challenge.",                   emoji:"🎯"},
    {time:"5:00 PM",  task:"Socialization log",              detail:"Record 3 new outdoor things pup encountered.",               emoji:"📝"},
  ],
  pp7: [
    {time:"8:00 AM",  task:"Leash introduction",             detail:"Put leash on in yard. Let pup drag it for 5 min.",           emoji:"🪢"},
    {time:"9:00 AM",  task:"Leash game: follow me",          detail:"Walk away, reward when pup catches up. 5 min.",              emoji:"🎯"},
    {time:"10:00 AM", task:"Threshold manners practice",     detail:"Stop at every doorway. Wait for pup to pause before going.", emoji:"🚪"},
    {time:"12:00 PM", task:"Nap",                            detail:"Crate rest.",                                                emoji:"😴"},
    {time:"2:00 PM",  task:"Leash game: check-ins",          detail:"Walk, stop randomly. Reward eye contact.",                   emoji:"👁️"},
    {time:"4:30 PM",  task:"Door threshold practice",        detail:"Practice front door, back door, and car door exits.",        emoji:"🚗"},
  ],
  pp8: [
    {time:"8:00 AM",  task:"Leash warm-up",                  detail:"Leash games in yard: 5 min direction changes.",              emoji:"🔄"},
    {time:"9:00 AM",  task:"First real walk",                detail:"10 min neighborhood walk. Reward check-ins every 30 sec.",   emoji:"🚶"},
    {time:"11:00 AM", task:"Loose leash practice",           detail:"Stop dead when pup pulls. Reward any slack.",                emoji:"🪢"},
    {time:"12:00 PM", task:"Nap",                            detail:"Crate rest after activity.",                                 emoji:"😴"},
    {time:"3:00 PM",  task:"Walking session #2",             detail:"10 min walk. Focus on attention, not destination.",          emoji:"🚶"},
    {time:"5:00 PM",  task:"Review & log",                   detail:"How many steps had loose leash? Track progress.",            emoji:"📊"},
  ],
  pp9: [
    {time:"8:00 AM",  task:"Home commands review",           detail:"Sit + Down + Name game in yard.",                           emoji:"🏠"},
    {time:"10:00 AM", task:"Park outing",                    detail:"Drive to a park. Sit at distance from other dogs/people.",   emoji:"🌳"},
    {time:"10:20 AM", task:"Park training session",          detail:"5 sits + 5 downs at the park. Raise criteria slowly.",      emoji:"🎯"},
    {time:"10:40 AM", task:"Park socialization",             detail:"Controlled greet of 1–2 calm dogs (if safe).",              emoji:"🐕"},
    {time:"12:00 PM", task:"Post-outing nap",                detail:"Long crate rest after stimulating outing.",                 emoji:"😴"},
    {time:"4:00 PM",  task:"Generalization session",         detail:"Practice commands in backyard or new indoor room.",          emoji:"🔁"},
  ],
  pp10: [
    {time:"9:00 AM",  task:"Morning commands review",        detail:"Sit + Down + Walk check-ins before outing.",                emoji:"✅"},
    {time:"10:00 AM", task:"Store visit #1",                 detail:"Pet-friendly store. Sit at entry, walk calmly inside.",     emoji:"🛒"},
    {time:"10:30 AM", task:"Store training reps",            detail:"Ask for sits + downs inside store. Reward calm behavior.",  emoji:"🎯"},
    {time:"12:00 PM", task:"Post-outing rest",               detail:"Long crate nap after public outing.",                      emoji:"😴"},
    {time:"4:00 PM",  task:"Debrief & plan",                 detail:"What went well? What needs work? Plan next store visit.",   emoji:"📋"},
  ],
  pp11: [
    {time:"9:00 AM",  task:"Pre-outing commands",            detail:"Warm up sits + downs at home before leaving.",              emoji:"✅"},
    {time:"10:00 AM", task:"Store visit #2 (different type)",detail:"Hardware store, garden center, or outdoor retail.",         emoji:"🏪"},
    {time:"10:30 AM", task:"New environment training",       detail:"Practice sit, down, name game in this new store.",          emoji:"🎯"},
    {time:"11:00 AM", task:"Outdoor socialization",          detail:"Sit near busy sidewalk or parking lot.",                    emoji:"🌆"},
    {time:"12:00 PM", task:"Crate nap",                      detail:"Recovery rest after public exposure.",                     emoji:"😴"},
    {time:"4:00 PM",  task:"Progress review",                detail:"Compare to Week 10. Celebrate improvements!",              emoji:"🎉"},
  ],
  pp12: [
    {time:"9:00 AM",  task:"Full commands review",           detail:"Sit, Down, Walk, Name — all from verbal cue only.",        emoji:"✅"},
    {time:"10:00 AM", task:"Dog neutrality outing",          detail:"Walk past calm dogs at distance. Reward neutral response.", emoji:"🐕"},
    {time:"10:30 AM", task:"Parallel walking",               detail:"Walk alongside a calm dog 10ft apart. Reward focus.",      emoji:"🚶"},
    {time:"12:00 PM", task:"Nap",                            detail:"Crate rest before graduation.",                            emoji:"😴"},
    {time:"3:00 PM",  task:"Graduation preparation",         detail:"Final walk + commands demo for photos/video.",             emoji:"🎓"},
    {time:"5:00 PM",  task:"Graduation ceremony",            detail:"Celebrate! Generate certificate and share with trainer.",  emoji:"🏅"},
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

  const shareText=`🐾 I've been using Guiding Paw Training and my dog's behavior has completely transformed! Check it out: ${REFERRAL_LINK}`;

  const socials=[
    {name:"Facebook",  emoji:"📘", color:"#1877f2",
      url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(REFERRAL_LINK)}&quote=${encodeURIComponent("My dog is crushing it with Guiding Paw Training! 🐾")}` },
    {name:"Instagram", emoji:"📸", color:"#e1306c",
      url:null, note:"Copy link → paste in your bio or story" },
    {name:"X / Twitter",emoji:"🐦", color:"#1da1f2",
      url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` },
    {name:"SMS / Text",emoji:"💬", color:"#4caf7d",
      url:`sms:?body=${encodeURIComponent(shareText)}` },
    {name:"Email",     emoji:"✉️", color:"#B08D57",
      url:`mailto:?subject=${encodeURIComponent("You need to try this dog training app!")}&body=${encodeURIComponent(shareText)}` },
    {name:"WhatsApp",  emoji:"🟢", color:"#25d366",
      url:`https://wa.me/?text=${encodeURIComponent(shareText)}` },
  ];

  const handleNativeShare=()=>{
    if(navigator.share){
      navigator.share({ title:"Guiding Paw Training", text:"My dog is crushing it! 🐾", url:REFERRAL_LINK }).catch(()=>{});
    } else {
      handleCopy(shareText);
    }
  };

  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"18px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Share & Refer</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Spread the Word 🐾</h2>
        <p style={{fontSize:"12px",color:T.textMuted,marginTop:"4px",lineHeight:1.55}}>Know someone whose dog could use some help? Share Guiding Paw and help them transform their relationship with their pup.</p>
      </div>

      {/* Referral code card */}
      <div className="s2" style={{background:T.mode==="dark"?"rgba(176,141,87,.1)":"rgba(176,141,87,.08)",border:`1px solid rgba(176,141,87,.35)`,borderRadius:"16px",padding:"18px",marginBottom:"14px",textAlign:"center"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"8px"}}>Your Referral Code</p>
        <div style={{fontFamily:"'Inter',serif",fontSize:"32px",fontWeight:"900",color:T.text,letterSpacing:".2em",marginBottom:"8px"}}>{REFERRAL_CODE}</div>
        <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"14px",lineHeight:1.5}}>Friends who use your code get a special welcome — and you're helping someone give their dog a better life.</p>
        <button onClick={()=>handleCopy(REFERRAL_CODE)}
          style={{background:T.gold,border:"none",borderRadius:"10px",padding:"10px 24px",fontSize:"13px",fontWeight:"900",color:"#fff",cursor:"pointer",letterSpacing:".06em",fontFamily:"'Lato',sans-serif",transition:"all .2s"}}>
          {copied?"✓ Copied!":"Copy Code"}
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
            {copied?"✓":"Copy"}
          </button>
        </div>
      </div>

      {/* Native share button */}
      <button onClick={handleNativeShare} className="btn-gold"
        style={{width:"100%",padding:"13px",background:T.gold,color:"#fff",border:"none",borderRadius:"11px",fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"'Lato',sans-serif",cursor:"pointer",boxShadow:"0 4px 18px rgba(176,141,87,.28)",marginBottom:"14px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
        <span style={{fontSize:"16px"}}>📤</span> Share Guiding Paw
      </button>

      {/* Social platform buttons */}
      <div className="s4" style={{marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"10px"}}>Share On</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px"}}>
          {socials.map(({name,emoji,color,url,note})=>(
            <button key={name}
              onClick={()=>{ if(url){ window.open(url,"_blank"); } else { handleCopy(REFERRAL_LINK); setShareMsg(`Link copied — paste it on ${name}!`); } }}
              style={{background:T.mode==="dark"?`${color}18`:`${color}12`,border:`1px solid ${color}44`,borderRadius:"12px",padding:"12px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:"9px",transition:"all .18s",textAlign:"left"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${color}28`;e.currentTarget.style.borderColor=`${color}88`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=T.mode==="dark"?`${color}18`:`${color}12`;e.currentTarget.style.borderColor=`${color}44`;}}>
              <span style={{fontSize:"20px",flexShrink:0}}>{emoji}</span>
              <div style={{minWidth:0}}>
                <p style={{fontSize:"12px",fontWeight:"700",color:T.text,lineHeight:1.2}}>{name}</p>
                {note&&<p style={{fontSize:"9.5px",color:T.textFaint,lineHeight:1.3,marginTop:"1px"}}>{note}</p>}
              </div>
            </button>
          ))}
        </div>
        {shareMsg&&<p style={{fontSize:"11px",color:"#4caf7d",fontWeight:"700",textAlign:"center",marginTop:"10px"}}>{shareMsg}</p>}
      </div>

      {/* Pre-written message */}
      <div className="s5" style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"8px"}}>Ready-to-Send Message</p>
        <div style={{background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",padding:"12px 14px",marginBottom:"10px"}}>
          <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.7}}>{shareText}</p>
        </div>
        <button onClick={()=>handleCopy(shareText)}
          style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"10px",fontSize:"12px",fontWeight:"700",color:T.gold,cursor:"pointer",fontFamily:"'Lato',sans-serif",transition:"all .2s"}}>
          {copied?"✓ Copied!":"Copy Message"}
        </button>
      </div>

      {/* Social media follow */}
      <div className="s6" style={{background:T.socialBg,border:`1px solid ${T.socialBorder}`,borderRadius:"14px",padding:"14px 16px"}}>
        <p style={{fontSize:"10px",color:"#4caf7d",fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"6px"}}>Follow Guiding Paw</p>
        <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55,marginBottom:"10px"}}>Stay connected for training tips, success stories, and community support.</p>
        {[
          {name:"Instagram",emoji:"📸",handle:"@guidingpawtraining",url:"https://instagram.com/guidingpawtraining"},
          {name:"Facebook", emoji:"📘",handle:"Guiding Paw Training",url:"https://facebook.com/guidingpawtraining"},
          {name:"TikTok",   emoji:"🎵",handle:"@guidingpawtraining",url:"https://tiktok.com/@guidingpawtraining"},
        ].map(({name,emoji,handle,url})=>(
          <a key={name} href={url} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",borderBottom:name!=="TikTok"?`1px solid ${T.divider}`:"none",textDecoration:"none"}}>
            <span style={{fontSize:"18px",width:"24px",textAlign:"center"}}>{emoji}</span>
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

const DashboardScreen = ({petData,plan,onOpenRecord,puppyWeekDone,puppyStreak,stdCompleted,graduated,onOpenHandout,onOpenVideo}) => {
  const T=useTheme();
  const petName=petData?.name||"Luna";
  const breed=petData?.breed||"";
  const bd=getBreedData(breed);
  const [assignDone,setAssignDone]=useState({});
  const [routineDone,setRoutineDone]=useState({});
  const routineItems=[
    {emoji:"🚶",label:"Walk",detail:"25 minutes"},
    {emoji:"🎮",label:"Engagement Game",detail:"5 minutes"},
    {emoji:"🎯",label:"Training Exercise",detail:"Recall"},
    {emoji:"🧩",label:"Enrichment",detail:"Puzzle Toy"},
  ];

  // Daily tip — changes each login session
  const dailyTip = getSessionTip();

  // Detect puppy program
  const birthday=petData?.birthday||"";
  const weeksOld=ageInWeeks(birthday);
  const isPuppy=weeksOld!==null&&weeksOld<20;

  // ── Standard program: find current week from completed lessons ──
  const stdCurriculum = STANDARD_CURRICULUM;
  const isGraduated = graduated || stdCurriculum.filter(w=>!w.graduation).every(w=>
    w.lessons.every(l=>!!(stdCompleted||{})[`${w.id}::${l}`])
  );
  // Current week = first non-graduation week where not all lessons are done
  const currentStdWeekIdx = isGraduated
    ? stdCurriculum.length - 1 // graduation week
    : stdCurriculum.findIndex((w,i) =>
        !w.graduation && !w.lessons.every(l=>!!(stdCompleted||{})[`${w.id}::${l}`])
      );
  const currentStdWeek = stdCurriculum[Math.max(0, currentStdWeekIdx)];
  const stdProgress = isGraduated ? 100 : Math.round(
    (stdCurriculum.filter(w=>!w.graduation).filter(w=>
      w.lessons.every(l=>!!(stdCompleted||{})[`${w.id}::${l}`])
    ).length / stdCurriculum.filter(w=>!w.graduation).length) * 100
  );

  // Puppy
  const currentPuppyWeekIdx=isPuppy
    ? Math.min(PUPPY_CURRICULUM.findIndex(w=>!puppyWeekDone?.[w.id]), PUPPY_CURRICULUM.length-1)
    : 0;
  const currentPuppyWeek=PUPPY_CURRICULUM[Math.max(0,currentPuppyWeekIdx)];
  const puppyProgress=isPuppy
    ? Math.round((Object.keys(puppyWeekDone||{}).filter(k=>puppyWeekDone[k]).length / PUPPY_CURRICULUM.length)*100)
    : 0;

  // ── Streak: loaded from localStorage, updated on assignment completion ──
  const [streak,setStreak]=useState(()=>loadStreak()||0);

  const handleAssignComplete=(taskName)=>{
    if(assignDone[taskName]) return; // don't double-count
    setAssignDone(d=>({...d,[taskName]:true}));
    const newStreak=updateStreakOnActivity();
    setStreak(newStreak);
  };

  // Maintenance tasks for graduation
  const MAINTENANCE_TASKS = isGraduated ? (currentStdWeek?.tasks||[]) : [];

  return (
    <ScrollBody>
      <div className="s1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
        <div>
          <p style={{fontSize:"11px",color:T.textMuted,letterSpacing:".1em",textTransform:"uppercase"}}>Welcome</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700"}}>{petName}'s Dashboard</h2>
        </div>
        <LogoImg size={38}/>
      </div>

      {/* Daily Trainer Tip */}
      <div className="s1" style={{background:T.mode==="dark"?"rgba(176,141,87,.08)":"rgba(176,141,87,.07)",border:`1px solid rgba(176,141,87,.28)`,borderRadius:"14px",padding:"13px 15px",marginBottom:"13px",display:"flex",gap:"11px",alignItems:"flex-start"}}>
        <span style={{fontSize:"22px",flexShrink:0,marginTop:"1px"}}>{dailyTip.emoji}</span>
        <div>
          <p style={{fontSize:"9px",color:T.gold,fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Trainer Tip of the Day</p>
          <p style={{fontSize:"12.5px",color:T.text,lineHeight:1.6,fontStyle:"italic"}}>"{dailyTip.tip}"</p>
        </div>
      </div>

      {/* Streak + Progress */}
      <div className="s2" style={{display:"flex",gap:"10px",marginBottom:"13px"}}>
        <div style={{width:"84px",flexShrink:0,background:T.streakCard,border:`1px solid ${T.streakBorder}`,borderRadius:"14px",padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:"22px",marginBottom:"2px"}}>{isGraduated?"🏆":"🔥"}</div>
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
                ? <span style={{color:"#4caf7d",fontWeight:"700"}}>🎓 Program Complete — Maintenance Mode</span>
                : <>Phase: <span style={{color:T.text,fontWeight:"700"}}>{currentStdWeek?.label}</span></>
            }
          </p>
          {!isPuppy && !isGraduated && streak > 0 && (
            <p style={{fontSize:"10px",color:T.textFaint,marginTop:"3px"}}>
              🔥 {streak}-day streak — keep going!
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
              <span style={{fontSize:"16px",flexShrink:0}}>{item.emoji}</span>
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
                    {done&&<span style={{color:"white",fontSize:"10px",fontWeight:"900"}}>✓</span>}
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
                <span style={{fontSize:"9px",fontWeight:"900",color:"#fff",letterSpacing:".1em",textTransform:"uppercase"}}>🐕 {breed}</span>
              </div>
              <span style={{fontSize:"9px",color:T.textFaint,fontWeight:"700",letterSpacing:".08em",textTransform:"uppercase"}}>Breed Insights</span>
            </div>
            <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55}}>{bd.tip}</p>
          </div>
        ) : (
          <div style={{background:T.mode==="dark"?"rgba(176,141,87,.06)":"rgba(176,141,87,.04)",border:`1px solid rgba(176,141,87,.15)`,borderRadius:"10px",padding:"10px 13px",marginBottom:"12px"}}>
            <p style={{fontSize:"11.5px",color:T.textFaint,lineHeight:1.5}}>💡 Add your dog's breed in <span style={{color:T.gold,fontWeight:"700"}}>Settings → Pet Profile</span> for breed-specific tips.</p>
          </div>
        )}
        {Object.keys(assignDone).length > 0 && (
          <div style={{background:"rgba(76,175,125,.1)",border:"1px solid rgba(76,175,125,.3)",borderRadius:"10px",padding:"9px 13px",display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"16px"}}>🔥</span>
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
            <p style={{fontSize:"10px",color:"#4caf7d",fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>🎓 Maintenance Plan</p>
            <p style={{fontFamily:"'Inter',serif",fontSize:"17px",fontWeight:"700",color:T.text,lineHeight:1.2}}>Graduation & Beyond</p>
            <p style={{fontSize:"11px",color:T.textMuted,marginTop:"4px",lineHeight:1.5}}>Keep skills sharp with daily integration. Your streak tracks how often you log in and stay active.</p>
          </div>
          <div style={{background:"rgba(76,175,125,.15)",borderRadius:"10px",padding:"6px 9px",textAlign:"center",flexShrink:0,marginLeft:"10px"}}>
            <div style={{fontSize:"16px"}}>🏆</div>
            <div style={{fontSize:"8px",fontWeight:"700",color:"#4caf7d",marginTop:"2px"}}>GRAD</div>
          </div>
        </div>
        {STANDARD_CURRICULUM[STANDARD_CURRICULUM.length-1]?.tasks?.map((task,ti)=>{
          const done=!!assignDone[task.name];
          return (
            <div key={ti} onClick={()=>handleAssignComplete(task.name)}
              style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 10px",borderRadius:"9px",marginBottom:"4px",background:done?"rgba(76,175,125,.08)":"rgba(76,175,125,.04)",border:`1px solid ${done?"rgba(76,175,125,.3)":"rgba(76,175,125,.12)"}`,cursor:"pointer",transition:"all .2s"}}>
              <div style={{width:"20px",height:"20px",borderRadius:"50%",border:`2px solid ${done?"#4caf7d":"rgba(76,175,125,.4)"}`,background:done?"#4caf7d":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                {done&&<span style={{color:"white",fontSize:"10px",fontWeight:"900"}}>✓</span>}
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
            <span style={{fontSize:"16px"}}>🏆</span>
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
        {routineItems.map(({emoji,label,detail},i)=>{
          const done=!!routineDone[i];
          return (
            <div key={label} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 0",borderBottom:i<routineItems.length-1?`1px solid ${T.divider}`:"none",cursor:"pointer"}}
              onClick={()=>setRoutineDone(r=>({...r,[i]:!r[i]}))}>
              <span style={{fontSize:"20px",width:"28px",textAlign:"center"}}>{emoji}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:"13px",fontWeight:"700",color:done?T.textMuted:T.text,textDecoration:done?"line-through":"none"}}>{label}</p>
                <p style={{fontSize:"11px",color:T.textFaint}}>{detail}</p>
              </div>
              <div style={{width:"22px",height:"22px",borderRadius:"50%",border:`2px solid ${done?"#4caf7d":T.chipBorder}`,background:done?"#4caf7d":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                {done&&<span style={{color:"white",fontSize:"11px",fontWeight:"900"}}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

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
        <div style={{position:"absolute",right:"12px",top:"8px",fontSize:"42px",opacity:.15}}>🐕</div>
        <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"rgba(176,141,87,.25)",border:`2px solid ${T.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>🐾</div>
        <div style={{flex:1}}>
          <p style={{fontSize:"10px",color:"rgba(255,255,255,.5)",fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"3px"}}>Full Profile</p>
          <p style={{fontFamily:"'Inter',serif",fontSize:"15px",fontWeight:"700",color:"#fff",marginBottom:"2px"}}>{petName}'s Life Record</p>
          <div style={{display:"flex",gap:"10px"}}>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,.6)"}}>🔥 7-day streak</span>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,.6)"}}>💉 Vaccines ✓</span>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,.6)"}}>🏃 1.2mi</span>
          </div>
        </div>
        <div style={{color:"rgba(255,255,255,.4)",fontSize:"18px",flexShrink:0}}>›</div>
      </div>

      {plan==="pro"&&<div style={{background:T.progressCard,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"12px",display:"flex",alignItems:"center",gap:"10px",marginBottom:"13px"}}><span style={{fontSize:"22px"}}></span><div style={{flex:1}}><p style={{fontSize:"12px",fontWeight:"700",color:T.gold,marginBottom:"2px"}}>Pro Coaching Active</p><p style={{fontSize:"11px",color:T.textMuted}}>Your trainer responded!</p></div><button style={{background:T.gold,border:"none",borderRadius:"8px",padding:"6px 11px",fontSize:"11px",fontWeight:"700",color:"#fff",cursor:"pointer"}}>View</button></div>}
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: LIVE
// ═══════════════════════════════════════════════════════════════════════════════
// ─── POTTY SCHEDULE SCREEN ────────────────────────────────────────────────────
const PottyScheduleScreen = () => {
  const T=useTheme();
  const INTERVALS=["30 min","1 hour","2 hours","3 hours","Custom"];
  const [interval,setInterval]=useState("1 hour");
  const [customMin,setCustomMin]=useState("90");
  const [timerActive,setTimerActive]=useState(false);
  const [timerStart,setTimerStart]=useState(null);
  const [timerSecs,setTimerSecs]=useState(0);
  const [totalSecs,setTotalSecs]=useState(60*60);
  const [pottyLog,setPottyLog]=useState([
    {time:"7:15 AM",type:"Pee",success:true,notes:"Right after breakfast"},
    {time:"9:00 AM",type:"Poop",success:true,notes:""},
    {time:"10:45 AM",type:"Pee",success:false,notes:"Accident in crate"},
  ]);
  const [logType,setLogType]=useState("Pee");
  const [logSuccess,setLogSuccess]=useState(true);
  const [logNotes,setLogNotes]=useState("");
  const [showAddLog,setShowAddLog]=useState(false);
  const [alarmEnabled,setAlarmEnabled]=useState(true);

  useState(()=>{
    if(!timerActive||!timerStart) return;
    const id=setInterval(()=>{
      const elapsed=Math.floor((Date.now()-timerStart)/1000);
      const remaining=Math.max(0,totalSecs-elapsed);
      setTimerSecs(remaining);
      if(remaining===0){ setTimerActive(false); }
    },1000);
    return()=>clearInterval(id);
  });

  const startTimer=()=>{
    let secs=3600;
    if(interval==="30 min") secs=1800;
    else if(interval==="1 hour") secs=3600;
    else if(interval==="2 hours") secs=7200;
    else if(interval==="3 hours") secs=10800;
    else secs=parseInt(customMin||"60")*60;
    setTotalSecs(secs);
    setTimerSecs(secs);
    setTimerStart(Date.now());
    setTimerActive(true);
  };

  const fmtTimer=(s)=>{ const m=Math.floor(s/60),sec=s%60; return `${m}:${sec.toString().padStart(2,"0")}`; };
  const pct=totalSecs>0?((totalSecs-timerSecs)/totalSecs)*100:0;
  const radius=44, circ=2*Math.PI*radius;

  const addLog=()=>{
    const entry={time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),type:logType,success:logSuccess,notes:logNotes};
    setPottyLog(l=>[entry,...l]);
    setLogNotes("");setShowAddLog(false);
    if(timerActive){ setTimerSecs(totalSecs); setTimerStart(Date.now()); }
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
          <circle cx="55" cy="55" r={radius} fill="none" stroke={timerSecs===0?"#e07a5f":T.gold} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
            strokeLinecap="round" transform="rotate(-90 55 55)" style={{transition:"stroke-dashoffset .9s"}}/>
          <text x="55" y="50" textAnchor="middle" fontSize="18" fontWeight="900" fill={T.mode==="dark"?"#D8C6AE":"#1C2636"} fontFamily="'Lato',sans-serif">{timerActive?fmtTimer(timerSecs):"--:--"}</text>
          <text x="55" y="65" textAnchor="middle" fontSize="9" fill={timerSecs===0?"#e07a5f":T.textFaint} fontFamily="'Lato',sans-serif">{timerSecs===0?"GO NOW!":timerActive?"remaining":"paused"}</text>
        </svg>

        {/* Interval selector */}
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",justifyContent:"center",marginBottom:"12px"}}>
          {INTERVALS.map(iv=>(
            <button key={iv} onClick={()=>setInterval(iv)} style={{padding:"5px 11px",borderRadius:"20px",border:`1px solid ${interval===iv?T.gold:T.chipBorder}`,background:interval===iv?"rgba(176,141,87,.18)":T.chipBg,color:interval===iv?T.goldLight:T.textMuted,fontSize:"11px",fontWeight:interval===iv?"700":"400",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>{iv}</button>
          ))}
        </div>
        {interval==="Custom"&&(
          <div style={{display:"flex",alignItems:"center",gap:"8px",justifyContent:"center",marginBottom:"12px"}}>
            <input type="number" value={customMin} onChange={e=>setCustomMin(e.target.value)} style={{width:"70px",padding:"8px 10px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"8px",fontSize:"14px",color:T.text,outline:"none",textAlign:"center",fontFamily:"'Lato',sans-serif"}}/>
            <span style={{fontSize:"12px",color:T.textMuted}}>minutes</span>
          </div>
        )}

        {/* Alarm toggle */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",marginBottom:"14px"}}>
          <span style={{fontSize:"12px",color:T.textMuted}}>🔔 Alarm reminder</span>
          <div onClick={()=>setAlarmEnabled(v=>!v)} style={{width:"36px",height:"20px",borderRadius:"10px",background:alarmEnabled?"rgba(176,141,87,.35)":"rgba(128,128,128,.2)",border:`1.5px solid ${alarmEnabled?T.gold:T.chipBorder}`,position:"relative",cursor:"pointer",transition:"all .3s"}}>
            <div style={{position:"absolute",top:"2px",left:alarmEnabled?"16px":"2px",width:"14px",height:"14px",borderRadius:"50%",background:alarmEnabled?T.gold:"#888",transition:"left .3s"}}/>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          <button onClick={timerActive?()=>{setTimerActive(false);}:startTimer}
            style={{padding:"11px",background:timerActive?"rgba(224,122,95,.15)":T.gold,border:timerActive?"1.5px solid #e07a5f":"none",borderRadius:"10px",color:timerActive?"#e07a5f":"#fff",fontWeight:"900",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
            {timerActive?"⏸ Pause":"▶ Start Timer"}
          </button>
          <button onClick={()=>setShowAddLog(true)}
            style={{padding:"11px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"10px",color:T.gold,fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
            + Log Potty
          </button>
        </div>
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
            {[{v:true,l:"✅ Success"},{v:false,l:"❌ Accident"}].map(({v,l})=>(
              <button key={l} onClick={()=>setLogSuccess(v)} style={{flex:1,padding:"8px",borderRadius:"9px",border:`1px solid ${logSuccess===v?T.gold:T.chipBorder}`,background:logSuccess===v?"rgba(176,141,87,.18)":T.chipBg,color:logSuccess===v?T.goldLight:T.textMuted,fontSize:"12px",fontWeight:logSuccess===v?"700":"400",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>{l}</button>
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
            <span style={{fontSize:"20px",flexShrink:0}}>{e.success?"✅":"❌"}</span>
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

const LiveScreen = ({walkLog=[]}) => {
  const T=useTheme();
  const [liveTab,setLiveTab]=useState("activity");
  const [expandedWalk,setExpandedWalk]=useState(null);

  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Live</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Lifestyle and Wellness</h2>
      </div>

      {/* Tab selector */}
      <div style={{display:"flex",gap:"6px",marginBottom:"14px",background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"5px"}}>
        {[{id:"activity",label:"Activity"},{id:"potty",label:"🐾 Potty Schedule"},{id:"grooming",label:"Grooming"}].map(t=>(
          <button key={t.id} onClick={()=>setLiveTab(t.id)} style={{flex:1,padding:"7px 4px",borderRadius:"8px",border:"none",cursor:"pointer",fontFamily:"'Lato',sans-serif",fontSize:"10px",fontWeight:"700",transition:"all .2s",background:liveTab===t.id?T.gold:"transparent",color:liveTab===t.id?"#fff":T.textMuted}}>{t.label}</button>
        ))}
      </div>

      {liveTab==="potty"&&<PottyScheduleScreen/>}

      {liveTab==="grooming"&&(
        <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"16px"}}>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>Grooming Schedule</p>
          {["Bath","Nail trim","Brushing","Ear cleaning"].map(g=>(
            <div key={g} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
              <span style={{fontSize:"13.5px",color:T.text}}>{g}</span>
              <button style={{background:T.streakCard,border:`1px solid ${T.streakBorder}`,borderRadius:"8px",padding:"5px 12px",fontSize:"11px",color:T.gold,cursor:"pointer",fontWeight:"700"}}>Log</button>
            </div>
          ))}
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
              {/* Apple Health badge */}
              <div style={{background:"rgba(255,59,48,.1)",border:"1px solid rgba(255,59,48,.3)",borderRadius:"8px",padding:"5px 10px",display:"flex",alignItems:"center",gap:"5px"}}>
                <span style={{fontSize:"13px"}}>❤️</span>
                <span style={{fontSize:"10px",fontWeight:"700",color:"#ff3b30"}}>Apple Health</span>
              </div>
            </div>
            <div style={{background:T.mode==="dark"?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)",borderRadius:"10px",height:"60px",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"10px"}}>
              <p style={{color:T.textFaint,fontSize:"11px"}}>📍 Live map appears during walk · Use ＋ to start</p>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>(
                <div key={d} style={{flex:1,textAlign:"center"}}>
                  <div style={{height:`${[20,40,15,55,30,70,0][i]}px`,background:i<6?"rgba(76,175,125,.4)":"rgba(128,128,128,.12)",borderRadius:"4px",marginBottom:"3px"}}/>
                  <span style={{fontSize:"7.5px",color:T.textFaint}}>{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Apple Health sync info */}
          <div style={{background:"rgba(255,59,48,.06)",border:"1px solid rgba(255,59,48,.2)",borderRadius:"12px",padding:"12px 14px",marginBottom:"12px",display:"flex",gap:"10px",alignItems:"center"}}>
            <span style={{fontSize:"22px",flexShrink:0}}>❤️</span>
            <div>
              <p style={{fontSize:"12px",fontWeight:"700",color:"#ff3b30",marginBottom:"2px"}}>Apple Health Sync Active</p>
              <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.5}}>Walk data (duration, distance, calories) is automatically written to Apple Health after each walk. Open the Health app to view your activity history.</p>
            </div>
          </div>

          {/* Walk Log */}
          {walkLog.length>0&&(
            <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"16px",marginBottom:"12px"}}>
              <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>🐕 Walk History</p>
              {walkLog.map((w,i)=>(
                <div key={i}>
                  <div onClick={()=>setExpandedWalk(expandedWalk===i?null:i)}
                    style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.divider}`,cursor:"pointer"}}>
                    <div>
                      <p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{w.date} · {w.time}</p>
                      <div style={{display:"flex",gap:"10px"}}>
                        <span style={{fontSize:"11px",color:T.textMuted}}>⏱ {w.duration}</span>
                        <span style={{fontSize:"11px",color:T.textMuted}}>📍 {w.distanceMi} mi</span>
                        <span style={{fontSize:"11px",color:T.textMuted}}>⚡ {w.pace}/mi</span>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      {w.appleHealthSynced&&<span style={{fontSize:"10px",color:"#ff3b30",fontWeight:"700"}}>❤️</span>}
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
const BondScreen = () => {
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
        {[{name:"The Name Game",time:"5 min",level:"Beginner"},{name:"Find It",time:"10 min",level:"Beginner"},{name:"Target Training",time:"10 min",level:"Intermediate"},{name:"Spin & Twist",time:"8 min",level:"Intermediate"},{name:"Bow",time:"10 min",level:"Advanced"}].map(t=>(
          <div key={t.name} className="lesson-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 10px",borderRadius:"10px",marginBottom:"6px",border:`1px solid ${T.divider}`,cursor:"pointer",transition:"opacity .2s"}}>
            <div><p style={{fontSize:"14px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{t.name}</p><p style={{fontSize:"11px",color:T.textMuted}}>{t.time} · {t.level}</p></div>
            <span style={{fontSize:"20px",color:T.textFaint}}>▶</span>
          </div>
        ))}
      </div>
      <div className="s3">
        <p style={{fontSize:"10px",color:T.textMuted,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>Socialization & Confidence</p>
        {[{name:"New Surface Challenge",desc:"Introduce 3 new textures today"},{name:"Sound Desensitization",desc:"Play traffic sounds at low volume"},{name:"Stranger Greeting",desc:"Practice calm greetings with someone new"},{name:"Novel Object Exposure",desc:"Umbrella, skateboard, or bicycle"}].map(s=>(
          <div key={s.name} style={{background:T.socialBg,border:`1px solid ${T.socialBorder}`,borderRadius:"12px",padding:"13px 14px",marginBottom:"8px"}}>
            <p style={{fontSize:"13.5px",fontWeight:"700",color:T.text,marginBottom:"3px"}}>{s.name}</p>
            <p style={{fontSize:"11.5px",color:T.textMuted}}>{s.desc}</p>
          </div>
        ))}
      </div>
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: LEARN — with progressive unlocking + puppy program
// ═══════════════════════════════════════════════════════════════════════════════

const STANDARD_CURRICULUM = [
  {id:"pre",  label:"Pre-Requisite", sublabel:"Foundation Skills",
    goal:"Ensure handler and dog have basic skills before starting the 6 week program. Introduce small boundaries and structure to prepare the dog for advancing skills.",
    tasks:[
      {name:"Sit with marker words",        sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Down with marker words",       sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Threshold Boundaries (Wait) with marker words", sessionsPerDay:"1-2", sessionLength:"5 minutes"},
      {name:"Kennel with threshold boundary (Wait before leaving kennel)", sessionsPerDay:"1-2", sessionLength:"30 minute duration"},
      {name:"Work for food",                sessionsPerDay:"1",   sessionLength:"During training sessions"},
    ],
    mistakes:["Skipping the 'learning phase' of training and expecting excellence day 1","Expecting results without daily practice","Inconsistent timing with marker words","Focusing on end goals, not current progress"],
    lessons:["Sit stay","Down stay","Marker Words","Socializing","Crate / Kennel","Generalizing","Implied Stays","3 D's: Distance, Distraction, Duration"]},
  {id:"w1",  label:"Week 1", sublabel:"Intro to Pressure / Release",
    unlockAfterDays:7,
    goal:"Develop a clear understanding of leash pressure as a communication tool. The dog learns that moving toward pressure turns it off, replacing the natural oppositional reflex (moving away from pressure). This is a cornerstone skill for all advanced leash work.",
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
      {name:"Leash Games with E-collar",           sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
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
      {name:"Leash Games with E-collar",           sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
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
      {name:"Leash Games with E-collar",           sessionsPerDay:"1-2", sessionLength:"5-10 minutes"},
      {name:"Loose Leash Walking with E-collar",   sessionsPerDay:"1-2", sessionLength:"15+ minutes"},
      {name:"Recall with E-collar",                sessionsPerDay:"1-2", sessionLength:"10-20 repetitions"},
    ],
    lessons:["Graduation ceremony","Advanced recall in new environments","Maintaining skills long-term","Continuing education resources"],
    graduation:true},
];

// ─── DAILY TRAINER TIPS ──────────────────────────────────────────────────────
const DAILY_TIPS = [
  {emoji:"🌟", tip:"Every rep counts — you're building a relationship, not just a behavior. Keep showing up!"},
  {emoji:"🐾", tip:"Consistency is your superpower. Dogs thrive on structure, and you're giving that every single day."},
  {emoji:"💪", tip:"Struggling today? That's normal. Progress isn't always linear — the fact you're here means you're winning."},
  {emoji:"🎯", tip:"Short sessions work better than long ones. 10 focused minutes beats an hour of frustration every time."},
  {emoji:"🔥", tip:"Your dog is learning even when you think nothing is happening. Trust the process — it's working."},
  {emoji:"🌱", tip:"You're not just training commands — you're growing a deeper bond with your dog. That's priceless."},
  {emoji:"🙌", tip:"Celebrate the small wins today. A better sit, a calmer threshold, a moment of eye contact. It all adds up."},
  {emoji:"⚡", tip:"Integration training is genius. Every walk, every mealtime, every doorway is a rep. You've got this."},
  {emoji:"🏆", tip:"The best dog trainers aren't perfect — they're persistent. And you keep coming back. That's everything."},
  {emoji:"💡", tip:"If something isn't working, simplify it. Go back one step and make it easier to succeed. Progress loves momentum."},
  {emoji:"🐕", tip:"Your dog is trying to figure out the rules of your world. The clearer you are, the faster they learn."},
  {emoji:"🎉", tip:"Look how far you've both come! Your dog is lucky to have someone who cares this much."},
  {emoji:"🧠", tip:"Remember: dogs don't generalize well. Practicing in a new spot isn't starting over — it's leveling up."},
  {emoji:"☀️", tip:"A tired trainer makes for a frustrated dog. Be kind to yourself today — rest is part of the process."},
  {emoji:"🚀", tip:"You're closer to your goal than you think. Stay consistent, stay patient, and trust the program."},
  {emoji:"❤️", tip:"The relationship you're building through training will last a lifetime. Every session is an investment."},
  {emoji:"🎓", tip:"Your dog doesn't need perfection — they need your patience. You have more than you think."},
  {emoji:"🌊", tip:"Some days flow, some days you feel stuck. Both are part of training. Just keep showing up."},
  {emoji:"🦮", tip:"Structure isn't restrictive — it's loving. Dogs feel safe when they know what to expect. You're giving that."},
  {emoji:"✨", tip:"Integration training tip: next walk, practice one threshold. One moment. That's enough for today."},
  {emoji:"🎵", tip:"Training should feel like a rhythm, not a chore. Find your groove and let it carry you."},
  {emoji:"💬", tip:"Clear communication is a skill — and you're getting better at it every single day."},
  {emoji:"🌙", tip:"End today knowing you did something for your dog. Even a 5-minute session is a 5-minute win."},
  {emoji:"🏅", tip:"You don't need to be a professional trainer to have a great dog — you just need to be consistent. And you are."},
  {emoji:"🤝", tip:"You and your dog are a team. Teams that train together trust each other more. Keep building that trust."},
  {emoji:"🔑", tip:"The marker word is your dog's translator. The more consistent you are with it, the faster everything clicks."},
  {emoji:"🌺", tip:"Patience isn't passive — it's active. It's choosing to breathe, reset, and try again. You do that beautifully."},
  {emoji:"⭐", tip:"Every dog is different. Honor where your dog is today, not where you wish they were. Progress from here."},
];

function getDailyTip() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return DAILY_TIPS[dayIndex % DAILY_TIPS.length];
}

function getSessionTip() {
  // Changes each login session
  try {
    const key = "gp_session_tip_idx";
    let idx = parseInt(sessionStorage.getItem(key) || "-1");
    if(idx < 0) {
      idx = Math.floor(Math.random() * DAILY_TIPS.length);
      sessionStorage.setItem(key, String(idx));
    }
    return DAILY_TIPS[idx % DAILY_TIPS.length];
  } catch {
    return getDailyTip();
  }
}

// ─── STREAK STORAGE HELPERS ───────────────────────────────────────────────────
const STREAK_KEY = "gp_streak";
const LAST_ACTIVITY_KEY = "gp_last_activity";

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? parseInt(raw) : 0;
  } catch { return 0; }
}

function saveStreak(n) {
  try { localStorage.setItem(STREAK_KEY, String(n)); } catch {}
}

function loadLastActivity() {
  try { return localStorage.getItem(LAST_ACTIVITY_KEY) || null; } catch { return null; }
}

function saveLastActivity(dateStr) {
  try { localStorage.setItem(LAST_ACTIVITY_KEY, dateStr); } catch {}
}

function todayStr() {
  return new Date().toISOString().slice(0,10); // "2026-06-02"
}

function updateStreakOnActivity() {
  const today = todayStr();
  const last = loadLastActivity();
  let streak = loadStreak();
  if(last === today) return streak; // already logged today
  if(last) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0,10);
    if(last === yStr) {
      streak = streak + 1; // continued streak
    } else {
      streak = 1; // broke streak, restart
    }
  } else {
    streak = 1; // first time
  }
  saveStreak(streak);
  saveLastActivity(today);
  return streak;
}

const LearnScreen = ({petData, puppyCompleted, setPuppyCompleted, puppyWeekDone, setPuppyWeekDone, setPuppyStreak, stdCompleted, setStdCompleted, welcomeVideoWatched, setWelcomeVideoWatched, onOpenHandout, onOpenVideo}) => {
  const T=useTheme();
  const [openWeek,setOpenWeek]=useState(null);
  // stdCompleted & setStdCompleted come from App (lifted state)
  const [programTab,setProgramTab]=useState("auto");
  const [weekCompletedAt,setWeekCompletedAt]=useState({}); // weekId -> timestamp ms

  const birthday = petData?.birthday || "";
  const weeksOld = ageInWeeks(birthday);
  const isPuppy = weeksOld !== null && weeksOld < 20;
  const effectiveTab = programTab === "auto" ? (isPuppy ? "puppy" : "standard") : programTab;
  const isStandard = effectiveTab === "standard";
  const curriculum = isStandard ? STANDARD_CURRICULUM : PUPPY_CURRICULUM;
  const programKey = isStandard ? "standard" : "puppy";
  const video = WELCOME_VIDEO[programKey];
  const videoWatched = !!welcomeVideoWatched?.[programKey];
  const markVideoWatched = () => setWelcomeVideoWatched(w=>({...w,[programKey]:true}));

  // Standard lesson toggle
  const toggleStd = (wid,lesson) => { const k=`${wid}::${lesson}`; setStdCompleted(c=>({...c,[k]:!c[k]})); };

  // Puppy lesson toggle — uses lifted state
  const togglePuppy = (wid,lesson) => { const k=`${wid}::${lesson}`; setPuppyCompleted(c=>({...c,[k]:!c[k]})); };

  // Is a week unlocked? For weeks after pre-req: must wait 7 days since previous week was completed
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const isUnlocked = (wi) => {
    if(wi === 0) return videoWatched;
    const prev = curriculum[wi-1];
    if(isStandard) {
      const allDone = prev.lessons.every(l => !!stdCompleted[`${prev.id}::${l}`]);
      if(!allDone) return false;
      // If no delay defined, unlock immediately
      if(!curriculum[wi].unlockAfterDays) return true;
      const completedAt = weekCompletedAt[prev.id];
      if(!completedAt) return false;
      // TESTING_MODE (see top of file): skips the real 7-day wait so beta testers can move
      // through every week immediately. Set TESTING_MODE to false before launching to real
      // customers so the genuine 7-day pacing between weeks takes effect.
      return TESTING_MODE ? true : (Date.now() - completedAt) >= SEVEN_DAYS_MS;
    }
    // For puppy: unlock by week-done mark
    return !!puppyWeekDone?.[prev.id];
  };

  // Puppy: mark whole week done
  const markPuppyWeekDone = (weekId) => {
    setPuppyWeekDone(d => ({...d,[weekId]:true}));
    setPuppyStreak(s => s+1);
    setOpenWeek(null); // collapse after marking done
  };

  const completed = isStandard ? stdCompleted : puppyCompleted;

  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Learn</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Training Curriculum</h2>
        <p style={{fontSize:"12px",color:T.textMuted,marginTop:"4px"}}>Complete each week to unlock the next</p>
      </div>

      {/* Program selector tabs */}
      <div className="s2" style={{display:"flex",gap:"7px",marginBottom:"14px",background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"6px"}}>
        {[{id:"standard",label:"Standard (6 Week)"},{id:"puppy",label:"Puppy (12 Week)"}].map(tab=>(
          <button key={tab.id} onClick={()=>setProgramTab(tab.id)}
            style={{flex:1,padding:"8px 4px",borderRadius:"8px",border:"none",cursor:"pointer",fontFamily:"'Lato',sans-serif",
              fontSize:"11px",fontWeight:"700",transition:"all .2s",
              background:effectiveTab===tab.id?T.gold:"transparent",
              color:effectiveTab===tab.id?"#fff":T.textMuted}}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Puppy notice */}
      {!isStandard && (
        <div style={{background:"rgba(76,175,125,.08)",border:"1px solid rgba(76,175,125,.25)",borderRadius:"12px",padding:"11px 14px",marginBottom:"14px",display:"flex",gap:"9px",alignItems:"flex-start"}}>
          <span style={{fontSize:"20px",flexShrink:0}}>🐶</span>
          <div>
            <p style={{fontSize:"12px",fontWeight:"700",color:"#4caf7d",marginBottom:"2px"}}>Puppy Foundation Program</p>
            <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.5}}>Under 20 weeks. Check off every lesson, then tap <strong style={{color:T.text}}>Mark Week Complete</strong> to unlock the next week.</p>
          </div>
        </div>
      )}

      {/* Required welcome video — must be watched before the first section unlocks */}
      <div className="s2" style={{marginBottom:"14px",animation:"up .4s .02s both"}}>
        <div style={{background:videoWatched?"rgba(76,175,125,.08)":T.cardInner,border:`1px solid ${videoWatched?"rgba(76,175,125,.3)":T.gold}`,borderRadius:"14px",overflow:"hidden"}}>
          <div style={{padding:"12px 15px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.divider}`}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"15px"}}>{videoWatched?"✅":"🔒"}</span>
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
        const weekMarkedDone = !isStandard ? !!puppyWeekDone?.[week.id] : false;
        const doneCount=week.lessons.filter(l=>!!completed[`${week.id}::${l}`]).length;
        const allLessonsDone=doneCount===week.lessons.length;
        // For standard: "all done" by lessons. For puppy: by mark-complete button
        const weekFullyDone = isStandard ? allLessonsDone : weekMarkedDone;
        const prevWeek=wi>0?curriculum[wi-1]:null;
        const prevDone=prevWeek?(isStandard?prevWeek.lessons.filter(l=>!!stdCompleted[`${prevWeek.id}::${l}`]).length:0):0;

        return (
          <div key={week.id} style={{marginBottom:"7px",animation:`up .4s ${wi*.06}s both`}}>
            {/* Week header button */}
            <button className="week-row"
              onClick={()=>unlocked?setOpenWeek(isOpen?null:week.id):null}
              style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 15px",
                background:weekFullyDone?"rgba(76,175,125,.12)":!unlocked?"rgba(255,255,255,.02)":isOpen?"rgba(176,141,87,.12)":T.chipBg,
                border:`1px solid ${weekFullyDone?"rgba(76,175,125,.4)":!unlocked?"rgba(176,141,87,.1)":isOpen?T.gold:T.chipBorder}`,
                borderRadius:isOpen?"14px 14px 0 0":"14px",
                cursor:unlocked?"pointer":"not-allowed",transition:"all .2s",opacity:unlocked?1:0.5}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                {!unlocked
                  ? <span style={{fontSize:"14px"}}>🔒</span>
                  : weekFullyDone
                    ? <span style={{fontSize:"14px"}}>✅</span>
                    : <div style={{width:"18px",height:"18px",borderRadius:"50%",border:`2px solid ${isOpen?T.gold:T.chipBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:T.gold,fontWeight:"700"}}>{doneCount}</div>
                }
                <div style={{textAlign:"left"}}>
                  <span style={{fontSize:"14px",fontWeight:"700",color:weekFullyDone?"#4caf7d":!unlocked?T.textFaint:isOpen?T.gold:T.text,display:"block"}}>{week.label}</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                {!unlocked && wi===0 && (
                  <span style={{fontSize:"9px",color:T.textFaint,maxWidth:"90px",textAlign:"right",lineHeight:1.3}}>Watch welcome video above</span>
                )}
                {!unlocked && wi>0 && prevWeek && !isStandard && (
                  <span style={{fontSize:"9px",color:T.textFaint,maxWidth:"80px",textAlign:"right",lineHeight:1.3}}>Complete {prevWeek.label} first</span>
                )}
                {!unlocked && wi>0 && isStandard && prevWeek && (
                  <span style={{fontSize:"9px",color:T.textFaint,maxWidth:"80px",textAlign:"right",lineHeight:1.3}}>{prevDone}/{prevWeek.lessons.length} done</span>
                )}
                {unlocked && !weekFullyDone && <span style={{fontSize:"11px",color:T.textFaint}}>{doneCount}/{week.lessons.length}</span>}
                {weekFullyDone && <span style={{fontSize:"10px",color:"#4caf7d",fontWeight:"700"}}>Done ✓</span>}
                {unlocked && <span style={{color:T.textFaint,fontSize:"15px",transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none"}}>▾</span>}
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && unlocked && (
              <div style={{background:T.mode==="dark"?"rgba(10,15,22,.7)":T.cardInner,border:`1px solid ${weekFullyDone?"rgba(76,175,125,.4)":T.gold}`,borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>

                {/* Weekly Sheet: Goal */}
                {week.goal && (
                  <div style={{padding:"12px 15px",borderBottom:`1px solid ${T.divider}`,background:T.mode==="dark"?"rgba(176,141,87,.05)":"rgba(176,141,87,.04)"}}>
                    <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"5px"}}>Goal for This {week.id==="pre"?"Phase":"Week"}</p>
                    <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55}}><Linkify text={week.goal} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></p>
                    {week.note && (
                      <div style={{marginTop:"8px",padding:"8px 11px",background:T.mode==="dark"?"rgba(163,86,42,.15)":"rgba(163,86,42,.08)",border:`1px solid ${T.mode==="dark"?"rgba(163,86,42,.35)":"rgba(163,86,42,.22)"}`,borderRadius:"8px"}}>
                        <p style={{fontSize:"11px",color:T.brown,fontWeight:"700",lineHeight:1.5}}>📌 <Linkify text={week.note} onOpenHandout={onOpenHandout} onOpenVideo={onOpenVideo} context={isStandard?"standard":"puppy"}/></p>
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
                    <p style={{fontSize:"10px",color:T.brown,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"7px"}}>⚠️ Common Mistakes to Avoid</p>
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
                        {done&&<span style={{color:"white",fontSize:"11px",fontWeight:"900"}}>✓</span>}
                      </div>
                    </div>
                  );
                })}

                {/* PUPPY: Mark Week Complete button */}
                {!isStandard && !weekMarkedDone && (
                  <div style={{padding:"13px 15px",borderTop:`1px solid ${T.divider}`,background:"rgba(76,175,125,.05)"}}>
                    <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"8px",lineHeight:1.4}}>
                      {allLessonsDone
                        ? "🎉 All lessons checked! Tap below to unlock the next week."
                        : "Work through all lessons, then mark this week complete to unlock the next."}
                    </p>
                    <button
                      onClick={()=>markPuppyWeekDone(week.id)}
                      className="btn-gold"
                      style={{width:"100%",padding:"12px",
                        background:allLessonsDone?"#4caf7d":"rgba(76,175,125,.25)",
                        color:allLessonsDone?"#fff":"rgba(76,175,125,.8)",
                        border:allLessonsDone?"none":"1px solid rgba(76,175,125,.4)",
                        borderRadius:"10px",fontSize:"13px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",
                        fontFamily:"'Lato',sans-serif",cursor:"pointer",
                        boxShadow:allLessonsDone?"0 4px 16px rgba(76,175,125,.35)":"none",transition:"all .3s"}}>
                      {allLessonsDone ? "✓ Mark Week Complete & Unlock Next" : "Mark Week Complete ✓"}
                    </button>
                  </div>
                )}

                {/* Already marked done state */}
                {!isStandard && weekMarkedDone && (
                  <div style={{padding:"12px 15px",borderTop:`1px solid ${T.divider}`,display:"flex",alignItems:"center",gap:"9px",background:"rgba(76,175,125,.07)"}}>
                    <span style={{fontSize:"18px"}}>🎉</span>
                    <p style={{fontSize:"12px",color:"#4caf7d",fontWeight:"700"}}>
                      Week complete! {wi<curriculum.length-1 ? `${curriculum[wi+1].label} is now unlocked.` : "You've completed the full program!"}
                    </p>
                  </div>
                )}

                {/* Standard: unlock next prompt when all lessons done */}
                {isStandard && allLessonsDone && wi < curriculum.length-1 && (
                  <div style={{padding:"12px 15px",borderTop:`1px solid ${T.divider}`,background:"rgba(76,175,125,.07)"}}>
                    {!weekCompletedAt[week.id] ? (
                      <>
                        <p style={{fontSize:"11px",color:T.textMuted,marginBottom:"8px",lineHeight:1.4}}>All lessons checked! Tap below to complete this week and start the 7-day unlock timer.</p>
                        <button onClick={()=>setWeekCompletedAt(d=>({...d,[week.id]:Date.now()}))}
                          style={{width:"100%",padding:"11px",background:"#4caf7d",border:"none",borderRadius:"10px",fontSize:"13px",fontWeight:"900",color:"#fff",cursor:"pointer",fontFamily:"'Lato',sans-serif",letterSpacing:".08em",textTransform:"uppercase"}}>
                          Mark Week Complete
                        </button>
                      </>
                    ) : (
                      <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                        <span style={{fontSize:"18px"}}>🗓️</span>
                        <div>
                          <p style={{fontSize:"12px",color:"#4caf7d",fontWeight:"700",marginBottom:"2px"}}>Week complete!</p>
                          <p style={{fontSize:"11px",color:T.textMuted}}>{curriculum[wi+1].label} unlocks 7 days after completion.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {week.graduation && (
                  <div style={{padding:"13px 15px",borderTop:`1px solid ${T.divider}`}}>
                    <GoldBtn style={{padding:"10px",fontSize:"12px"}}>🎓 Generate Graduation Certificate</GoldBtn>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════
const CalendarScreen = () => {
  const T=useTheme(); const today=9;
  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"18px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Calendar</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>March 2026</h2>
      </div>
      <div className="s2" style={{background:T.calBg,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"16px",marginBottom:"14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px",marginBottom:"8px"}}>{["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:"9.5px",color:T.textFaint,fontWeight:"700",padding:"3px 0"}}>{d}</div>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px"}}>
          {Array.from({length:35},(_,i)=>{const day=i-5;const isToday=day===today;const hasEvent=[3,7,10,14,17,21].includes(day);return(<div key={i} style={{textAlign:"center",padding:"6px 2px",borderRadius:"7px",cursor:day>0&&day<=31?"pointer":"default",background:isToday?T.dayToday:"transparent",color:day<=0||day>31?"transparent":isToday?T.dayTodayText:T.text,fontSize:"12.5px",fontWeight:isToday?"900":"400",position:"relative"}}>{day>0&&day<=31?day:""}{hasEvent&&!isToday&&<div style={{width:"3.5px",height:"3.5px",borderRadius:"50%",background:T.gold,margin:"1.5px auto 0"}}/>}</div>);})}
        </div>
      </div>
      <p style={{fontSize:"10px",color:T.textFaint,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>Upcoming</p>
      {[{day:"Today",title:"E-Collar Session",time:"7:00 AM",type:"training"},{day:"Mar 11",title:"Vet Appointment",time:"2:30 PM",type:"vet"},{day:"Mar 14",title:"Park Generalization",time:"9:00 AM",type:"training"}].map(e=>(
        <div key={e.title} style={{display:"flex",gap:"11px",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${T.divider}`}}>
          <div style={{width:"38px"}}><p style={{fontSize:"9.5px",color:T.textFaint}}>{e.day}</p></div>
          <div style={{width:"3px",height:"32px",borderRadius:"2px",background:e.type==="vet"?T.brown:T.green,flexShrink:0}}/>
          <div style={{flex:1}}><p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{e.title}</p><p style={{fontSize:"11px",color:T.textMuted}}>{e.time}</p></div>
        </div>
      ))}
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: STORE — CHANGE 4: new page replacing affiliate on Live
// ═══════════════════════════════════════════════════════════════════════════════
const StoreScreen = () => {
  const T=useTheme();
  const products=[
    {name:"E-Collar Technologies ET-300",cat:"Training Tools",price:"$179",rating:"⭐ 4.9",emoji:"📡"},
    {name:"Herm Sprenger Prong Collar",cat:"Training Tools",price:"$38",rating:"⭐ 4.8",emoji:"🔗"},
    {name:"Zuke's Mini Naturals Treats",cat:"Treats",price:"$12",rating:"⭐ 4.7",emoji:"🦴"},
    {name:"50ft Long Line Lead",cat:"Leads & Leashes",price:"$24",rating:"⭐ 4.8",emoji:"🪢"},
    {name:"West Paw Toppl Puzzle Toy",cat:"Enrichment",price:"$22",rating:"⭐ 4.9",emoji:"🧩"},
    {name:"Kurgo Wander Dog Pack",cat:"Gear",price:"$55",rating:"⭐ 4.6",emoji:"🎒"},
  ];
  const cats=["All","Training Tools","Treats","Leads & Leashes","Enrichment","Gear"];
  const [activeCat,setActiveCat]=useState("All");
  const filtered=activeCat==="All"?products:products.filter(p=>p.cat===activeCat);
  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"16px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Shop</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700",marginBottom:"4px"}}>Trainer-Recommended Gear</h2>
        <p style={{fontSize:"12px",color:T.textMuted}}>Curated products from our Amazon storefront</p>
      </div>
      {/* Category filter */}
      <div className="s2" style={{display:"flex",gap:"6px",overflowX:"auto",marginBottom:"16px",paddingBottom:"4px"}}>
        {cats.map(c=><button key={c} onClick={()=>setActiveCat(c)} style={{flexShrink:0,padding:"6px 13px",borderRadius:"20px",border:`1px solid ${activeCat===c?T.gold:T.chipBorder}`,background:activeCat===c?"rgba(176,141,87,.18)":T.chipBg,color:activeCat===c?T.goldLight:T.textMuted,fontSize:"11.5px",fontWeight:activeCat===c?"700":"400",cursor:"pointer",transition:"all .18s",whiteSpace:"nowrap"}}>{c}</button>)}
      </div>
      <div className="s3" style={{display:"flex",flexDirection:"column",gap:"9px"}}>
        {filtered.map(p=>(
          <div key={p.name} style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"13px 15px",display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"46px",height:"46px",borderRadius:"12px",background:T.storeBg,border:`1px solid ${T.storeBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>{p.emoji}</div>
            <div style={{flex:1}}>
              <p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px",lineHeight:1.3}}>{p.name}</p>
              <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",marginBottom:"2px"}}>{p.cat}</p>
              <p style={{fontSize:"10.5px",color:T.textMuted}}>{p.rating}</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <p style={{fontSize:"14px",fontWeight:"900",color:T.gold,marginBottom:"5px"}}>{p.price}</p>
              <button style={{background:T.brown,border:"none",borderRadius:"8px",padding:"5px 10px",fontSize:"10.5px",color:"white",cursor:"pointer",fontWeight:"700",whiteSpace:"nowrap"}}>Shop →</button>
            </div>
          </div>
        ))}
      </div>
      <div className="s4" style={{textAlign:"center",marginTop:"16px",padding:"12px",background:T.storeBg,border:`1px solid ${T.storeBorder}`,borderRadius:"12px"}}>
        <p style={{fontSize:"11px",color:T.textMuted}}>View all products: <span style={{color:T.gold,fontWeight:"700",cursor:"pointer"}}>VIEW ALL PRODUCTS →</span></p>
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
const HANDOUT_ORDER = ["threeDs","advocating","aloneTime","biting","calmness","chewing","doNothing","dogNeutrality","fieldtrips","handling","impulseControl","leashPressure","kennelTraining","leashGames","markerWords","nameGame","offLeash","pottyTraining","dailyStructure","puppyDevelopment","generalizing","recallChaseMe","recallHere","sitStayDownStay","socializingMistakes","socializingHomeYardPublic","socializingCheckList","socializingExperiences","structuredCalmPlace","thresholdBoundaries","workingForFood"];

// Keyword → handout id map for automatic inline hyperlinking. Order matters: longest / most specific first.
const HANDOUT_KEYWORDS = [
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
  ["Kennel","kennelTraining"],
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
  ["Leash Games with E-collar","leashGamesVideo"],
  ["Leash Games","leashGamesVideo"],
  ["leash games","leashGamesVideo"],
  ["Generalizing at the park","parkVisit"],
  ["park visits","parkVisit"],
  ["Park visit","parkVisit"],
  ["Generalizing on a field trip","fieldTrip"],
  ["store visits","fieldTrip"],
  ["Store visit","fieldTrip"],
];

// Combined lookup: video keywords are layered on top of handout keywords, so an exact
// phrase match (e.g. "Name Game") resolves to the video when both exist for that phrase.
const _linkEntries = [
  ...HANDOUT_KEYWORDS.map(([k,id])=>({k,id,type:"handout"})),
  ...VIDEO_KEYWORDS.map(([k,id])=>({k,id,type:"video"})),
];
const LINK_MAP = {};
_linkEntries.forEach(({k,id,type})=>{ LINK_MAP[k.toLowerCase()] = {id,type}; });
const LINK_REGEX = new RegExp(
  [..._linkEntries].sort((a,b)=>b.k.length-a.k.length).map(e=>_escapeRx(e.k)).join("|"), "gi"
);

// Renders text with any recognized handout topic or training video wrapped as a clickable link.
const Linkify = ({text, onOpenHandout, onOpenVideo, context}) => {
  const T=useTheme();
  if(!text) return null;
  if(!onOpenHandout && !onOpenVideo) return <>{text}</>;
  const parts=[]; let lastIndex=0; let match;
  LINK_REGEX.lastIndex=0;
  while((match=LINK_REGEX.exec(text))){
    const key=match[0].toLowerCase();
    let entry=LINK_MAP[key];
    // In the puppy program, generic "Threshold Boundaries" (no qualifier) refers to the
    // puppy-specific demo video rather than the standard-program handout/e-collar videos.
    if(context==="puppy" && (key==="threshold boundaries" || key==="threshold boundary")){
      entry={id:"puppyThreshold", type:"video"};
    }
    if(!entry){ continue; }
    let handler=null, targetId=entry.id;
    if(entry.type==="video" && onOpenVideo){ handler=onOpenVideo; }
    else if(entry.type==="handout" && onOpenHandout){ handler=onOpenHandout; }
    else if(onOpenHandout && HANDOUT_MAP[key]){ handler=onOpenHandout; targetId=HANDOUT_MAP[key]; } // graceful fallback
    if(!handler){ continue; }
    if(match.index>lastIndex) parts.push(text.slice(lastIndex,match.index));
    parts.push(
      <span key={match.index} onClick={(e)=>{e.stopPropagation();handler(targetId);}}
        style={{color:T.gold,textDecoration:"underline",textDecorationStyle:"dotted",textUnderlineOffset:"2px",cursor:"pointer",fontWeight:"700"}}>
        {match[0]}
      </span>
    );
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
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px",flexShrink:0}}>✕</button>
      </div>

      <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"16px",marginBottom:"14px"}}>
        {h.content.map((block,bi)=>{
          if(block.type==="p") return (
            <p key={bi} style={{fontSize:"13px",color:T.textMuted,lineHeight:1.65,marginBottom:bi<h.content.length-1?"12px":"0",fontWeight:block.bold?"700":"400"}}>
              <Linkify text={block.text} onOpenHandout={block.linkable!==false?onOpenHandout:undefined}/>
            </p>
          );
          if(block.type==="h") return (
            <p key={bi} style={{fontSize:"13px",fontWeight:"800",color:T.text,marginTop:bi>0?"14px":"0",marginBottom:"8px",lineHeight:1.3}}>
              <Linkify text={block.text} onOpenHandout={onOpenHandout}/>
            </p>
          );
          if(block.type==="ul") return (
            <ul key={bi} style={{margin:"0 0 12px",paddingLeft:"18px"}}>
              {block.items.map((it,ii)=>(
                <li key={ii} style={{fontSize:"12.5px",color:T.textMuted,lineHeight:1.55,marginBottom:"5px"}}>
                  <Linkify text={it} onOpenHandout={onOpenHandout}/>
                </li>
              ))}
            </ul>
          );
          if(block.type==="ol") return (
            <ol key={bi} style={{margin:"0 0 12px",paddingLeft:"18px"}}>
              {block.items.map((it,ii)=>(
                <li key={ii} style={{fontSize:"12.5px",color:T.textMuted,lineHeight:1.55,marginBottom:"5px",fontWeight:"700"}}>
                  <Linkify text={it} onOpenHandout={onOpenHandout}/>
                </li>
              ))}
            </ol>
          );
          if(block.type==="note") return (
            <div key={bi} style={{marginTop:"6px",marginBottom:"12px",padding:"10px 13px",background:T.mode==="dark"?"rgba(47,79,62,.18)":"rgba(47,79,62,.08)",border:`1px solid ${T.mode==="dark"?"rgba(47,79,62,.4)":"rgba(47,79,62,.25)"}`,borderRadius:"9px"}}>
              {block.heading && <p style={{fontSize:"11px",fontWeight:"800",color:T.green,marginBottom:"6px",textTransform:"uppercase",letterSpacing:".06em"}}>{block.heading}</p>}
              {block.text && <p style={{fontSize:"12.5px",color:T.mode==="dark"?"rgba(216,198,174,.9)":T.textMuted,lineHeight:1.55}}><Linkify text={block.text} onOpenHandout={onOpenHandout}/></p>}
              {block.items && (
                <ul style={{margin:0,paddingLeft:"16px"}}>
                  {block.items.map((it,ii)=>(<li key={ii} style={{fontSize:"12.5px",color:T.mode==="dark"?"rgba(216,198,174,.9)":T.textMuted,lineHeight:1.5,marginBottom:"3px",fontWeight:"600"}}>{it}</li>))}
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
          return null;
        })}
      </div>

      {h.mistakes && h.mistakes.length>0 && (
        <div style={{padding:"14px 16px",background:T.mode==="dark"?"rgba(163,86,42,.1)":"rgba(163,86,42,.06)",border:`1px solid ${T.mode==="dark"?"rgba(163,86,42,.35)":"rgba(163,86,42,.22)"}`,borderRadius:"14px",marginBottom:"14px"}}>
          <p style={{fontSize:"10px",color:T.brown,fontWeight:"700",letterSpacing:".12em",textTransform:"uppercase",marginBottom:"8px"}}>⚠️ Common Mistakes</p>
          {h.mistakes.map((m,mi)=>(
            <div key={mi} style={{display:"flex",alignItems:"flex-start",gap:"7px",marginBottom:mi<h.mistakes.length-1?"5px":"0"}}>
              <span style={{fontSize:"9px",color:T.brown,marginTop:"3px",flexShrink:0}}>—</span>
              <p style={{fontSize:"11.5px",color:T.mode==="dark"?"rgba(216,198,174,.8)":T.textMuted,lineHeight:1.45}}>{m}</p>
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
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}>✕</button>
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
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px",flexShrink:0}}>✕</button>
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

const VideoLibraryScreen = ({onOpenVideo, onClose}) => {
  const T=useTheme();
  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Reference Library</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700"}}>Training Videos</h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}>✕</button>
      </div>
      <p style={{fontSize:"12.5px",color:T.textMuted,marginBottom:"14px",lineHeight:1.5}}>Every demo video referenced throughout your training plan, all in one place.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
        {VIDEO_ORDER.map(id=>{
          const v=VIDEO_LIBRARY[id];
          return (
            <button key={id} onClick={()=>onOpenVideo(id)}
              style={{padding:"13px 15px",borderRadius:"12px",border:`1px solid ${T.chipBorder}`,background:T.chipBg,color:T.text,fontSize:"13.5px",fontWeight:"700",textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"10px",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.chipBorder;}}>
              <span style={{display:"flex",alignItems:"center",gap:"9px"}}>
                <span style={{fontSize:"14px"}}>▶️</span>{v.title}
              </span>
              <span style={{color:T.textFaint}}>›</span>
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
    "Anxiety":{title:"Anxiety & Confidence Building",weeks:["Week 1 — Desensitization basics","Week 2 — Crate confidence","Week 3 — Separation protocol"]},
    "Potty accidents":{title:"Potty Training Reset",weeks:["Week 1 — Schedule + supervision","Week 2 — Reward timing","Week 3 — Independence phase"]},
    "Biting":{title:"Bite Inhibition Program",weeks:["Week 1 — Redirect + interrupt","Week 2 — Marker training","Week 3 — Off-switch games"]},
    "Chewing":{title:"Chew Management Plan",weeks:["Week 1 — Confinement + supervision","Week 2 — Redirect to appropriate toys","Week 3 — Earn freedom"]},
    "Reactivity / Aggression":{title:"Reactivity Rehab",weeks:["Week 1 — Threshold awareness","Week 2 — Look at that game","Week 3 — Controlled exposure"]},
  };

  const plan=PLANS[answers.issue];

  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Behavior Help</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"20px",color:T.text,fontWeight:"700"}}>Diagnosis Tool</h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}>✕</button>
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
          <GoldBtn onClick={()=>setDiagStep("petType")}>I Need Help With Behavior →</GoldBtn>
        </div>
      )}

      {diagStep==="petType"&&(
        <div className="slide">
          <SectionTitle>What dog behavior needs help?</SectionTitle>
          <p style={{fontSize:"13px",color:T.textMuted,marginBottom:"14px",lineHeight:1.5}}>Guiding Paw specializes in dog training. Let's find the right program for your pup.</p>
          <GoldBtn onClick={()=>{set("petType","dog");setDiagStep("issue");}}>Continue to Issues →</GoldBtn>
          <div style={{marginTop:"10px"}}><BackBtn onClick={()=>setDiagStep("start")}/></div>
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
          <BackBtn onClick={()=>setDiagStep("petType")}/>
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
            <GoldBtn onClick={()=>setDiagStep("start")}>Back to Diagnosis Tool</GoldBtn>
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
const PetLifeRecord = ({petData,onClose}) => {
  const T=useTheme(); const petName=petData?.name||"Luna";
  const stats=[
    {label:"Age",value:"2 years",icon:"🎂"},
    {label:"Training Streak",value:"7 days 🔥",icon:"📈"},
    {label:"Today's Assignment",value:"Loose leash walking",icon:"📋"},
    {label:"Health Status",value:"Vaccines up to date ✓",icon:"💉"},
    {label:"Exercise Today",value:"1.2 miles walked",icon:"🏃"},
    {label:"Last Groomed",value:"3 days ago",icon:"✂️"},
    {label:"Meals Today",value:"2 / 2 completed",icon:"🍗"},
    {label:"Training Phase",value:"Week 2 of 6",icon:"🎯"},
  ];
  return (
    <ScrollBody>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"18px"}}>
        <div>
          <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"3px"}}>Unified Record</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"20px",color:T.text,fontWeight:"700"}}>Pet Life Record</h2>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}>✕</button>
      </div>

      {/* Pet hero card */}
      <div className="s1" style={{background:T.green,borderRadius:"18px",padding:"18px",marginBottom:"16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:"14px",top:"14px",fontSize:"48px",opacity:.25}}>🐕</div>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
          <div style={{width:"52px",height:"52px",borderRadius:"50%",background:"rgba(176,141,87,.25)",border:`2px solid ${T.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px"}}>🐾</div>
          <div>
            <h3 style={{fontFamily:"'Inter',serif",fontSize:"20px",fontWeight:"700",color:"#fff",marginBottom:"2px"}}>{petName}</h3>
            <p style={{fontSize:"12px",color:"rgba(255,255,255,.6)"}}>Labrador Retriever · Male · 2 yrs</p>
          </div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          {[{l:"Training",v:"42%"},{l:"Health",v:"✓ Good"},{l:"Streak",v:"🔥 7d"}].map(({l,v})=>(
            <div key={l} style={{flex:1,background:"rgba(0,0,0,.25)",borderRadius:"8px",padding:"7px",textAlign:"center"}}>
              <p style={{fontSize:"8.5px",color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:"2px"}}>{l}</p>
              <p style={{fontSize:"12.5px",fontWeight:"700",color:"#fff"}}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Full stats grid */}
      <div className="s2" style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"14px"}}>
        {stats.map(({label,value,icon})=>(
          <div key={label} style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"12px",padding:"12px 14px",display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:"20px",width:"28px",textAlign:"center",flexShrink:0}}>{icon}</span>
            <div style={{flex:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:"12px",color:T.textMuted,fontWeight:"600"}}>{label}</p>
              <p style={{fontSize:"13px",fontWeight:"700",color:T.text,textAlign:"right",maxWidth:"55%"}}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Health records quick-links */}
      <div className="s3" style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"10px"}}>Health Records</p>
        {["Vaccine Records","Vet Records","Medications","Food & Allergies"].map(r=>(
          <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
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
const LOGO_URL = "/mnt/user-data/uploads/Guiding_Paw_logo__correct_green_color_.png";
const SUPPORT_EMAIL = "info@guidingpaw.com";
const SUPPORT_PHONE = "801-435-1239";
const WEBSITE_URL = "https://guidingpaw.com/";

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
    <h2 style="margin:0 0 6px;font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#1C2636;">Subscription Renewed ✓</h2>
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
  return { subject: `Guiding Paw — Subscription Renewed · ${details.amount}`, html: emailShell(body) };
};

const buildDeleteEmail = (details) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  const purgeDate = new Date(now.getTime() + 30*24*60*60*1000).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;border-radius:50%;background:#f0f7f2;border:2px solid #4a7c5f;display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">✓</div>
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
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#B08D57;">⏳ Changed Your Mind?</p>
        <p style="margin:0 0 10px;font-size:13px;color:#5a4a2a;line-height:1.65;">Your data is kept securely for <strong>30 days</strong> before being permanently purged on <strong>${purgeDate}</strong>. If this was a mistake, contact us before that date and we can fully restore your account — no questions asked.</p>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:16px;font-size:13px;color:#5a4a2a;">📧 <a href="mailto:${SUPPORT_EMAIL}" style="color:#B08D57;font-weight:700;">${SUPPORT_EMAIL}</a></td>
          <td style="font-size:13px;color:#5a4a2a;">📞 <a href="tel:${SUPPORT_PHONE.replace(/-/g,"")}" style="color:#B08D57;font-weight:700;">${SUPPORT_PHONE}</a></td>
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
  return { subject: `Guiding Paw — Your account has been scheduled for deletion`, html: emailShell(body) };
};

const buildCancellationEmail = (details) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZoneName:"short"});
  const accessDate = details.renewalDate || "the end of your current billing period";
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;border-radius:50%;background:#f5f0e8;border:2px solid #B08D57;margin:0 auto;display:inline-flex;align-items:center;justify-content:center;font-size:28px;line-height:64px;">✓</div>
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
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2F4F3E;">📅 You Still Have Access</p>
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
  return { subject: `Guiding Paw — Your subscription has been cancelled`, html: emailShell(body) };
};

const simulateSendEmail = (type, details) => {
  // In production this would call a real email service (SendGrid, Postmark, etc.)
  // and pass the .html property to the service's HTML body field.
  // For demo purposes we log the email HTML to console.
  const email = type === "renewal" ? buildRenewalEmail(details)
              : type === "cancellation" ? buildCancellationEmail(details)
              : buildDeleteEmail(details);
  console.log(`[EMAIL SENT to ${details.email}]\nSubject: ${email.subject}\n\n[HTML body — see email.html]\n`, email.html);
  return email;
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: SETTINGS (multi-tab: Profile / Settings / Contact / Sign Out)
// ═══════════════════════════════════════════════════════════════════════════════
const SettingsScreen = ({onSignOut,darkMode,setDarkMode,quickAddDocs=[],onOpenHandoutLibrary,onOpenVideoLibrary}) => {
  const T=useTheme();
  const [tab,setTab]=useState("profile");
  const [showSaved,setShowSaved]=useState(false);

  // Delete account confirmation state
  const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
  const [deleteSuccess,setDeleteSuccess]=useState(false);

  // Subscription state
  const [subStatus,setSubStatus]=useState("active"); // "active" | "cancelled"
  const [showCancelConfirm,setShowCancelConfirm]=useState(false);
  const [showRestartConfirm,setShowRestartConfirm]=useState(false);
  const [cancelEmailSent,setCancelEmailSent]=useState(false);
  const [restartSuccess,setRestartSuccess]=useState(false);

  // Auto-renewal email demo state
  const [renewalEmailSent,setRenewalEmailSent]=useState(false);

  // Update card state
  const [showUpdateCard,setShowUpdateCard]=useState(false);
  const [newCardNum,setNewCardNum]=useState("");
  const [newExpiry,setNewExpiry]=useState("");
  const [newCvv,setNewCvv]=useState("");
  const [newCardName,setNewCardName]=useState("");
  const [cardSaved,setCardSaved]=useState(false);

  // Change password state — demo "stored" password the user must confirm to change
  const [accountPassword,setAccountPassword]=useState("Training1!");
  const [showChangePassword,setShowChangePassword]=useState(false);
  const [currentPw,setCurrentPw]=useState("");
  const [newPw,setNewPw]=useState("");
  const [confirmNewPw,setConfirmNewPw]=useState("");
  const [showCurrentPw,setShowCurrentPw]=useState(false);
  const [showNewPw,setShowNewPw]=useState(false);
  const [showConfirmNewPw,setShowConfirmNewPw]=useState(false);
  const [pwErrors,setPwErrors]=useState({});
  const [pwChangedSuccess,setPwChangedSuccess]=useState(false);

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
  const handleSavePassword=()=>{
    const e={};
    if(!currentPw)                          e.currentPw="Enter your current password.";
    else if(currentPw!==accountPassword)    e.currentPw="Current password is incorrect.";
    if(!isPasswordValid(newPw))             e.newPw=`Password must be at least ${PASSWORD_MIN_LENGTH} characters and include a capital letter, a number, and a special character.`;
    if(confirmNewPw!==newPw)                e.confirmNewPw="Passwords do not match.";
    setPwErrors(e);
    if(Object.keys(e).length>0) return;
    setAccountPassword(newPw);
    setShowChangePassword(false);
    resetPwFields();
    setPwChangedSuccess(true);
    setTimeout(()=>setPwChangedSuccess(false),3000);
  };

  // Pet profile state (supports multiple pets)
  const [pets,setPets]=useState([{name:"Luna",breed:"Labrador Retriever",birthday:"",gender:"",food:"",allergiesAndSensitivities:"",medications:"",grooming:"",potty:"",docs:[]}]);
  const [activePet,setActivePet]=useState(0);
  const sp=(k,v)=>setPets(ps=>ps.map((p,i)=>i===activePet?{...p,[k]:v}:p));
  const pet=pets[activePet];

  // Client / account state
  const [client,setClient]=useState({firstName:"",lastName:"",email:"",phone:"",cardLast4:"4242",program:"Annual Plan",renewalDate:"Mar 17, 2027"});
  const sc=(k,v)=>setClient(c=>({...c,[k]:v}));

  const handleSave=()=>{
    setShowSaved(true);
    setTimeout(()=>setShowSaved(false),2200);
  };

  const handleSimulateRenewal=()=>{
    simulateSendEmail("renewal",{
      name:client.firstName||"Member",
      email:client.email||"you@example.com",
      plan:client.program,
      card:client.cardLast4,
      amount:client.program==="Annual Plan"?"$99.00":"$14.99",
      nextDate:"Mar 17, 2028",
    });
    setRenewalEmailSent(true);
    setTimeout(()=>setRenewalEmailSent(false),3000);
  };

  const handleCancelSubscription=()=>{
    simulateSendEmail("cancellation",{
      name:client.firstName||"Member",
      email:client.email||"you@example.com",
      plan:client.program,
      renewalDate:client.renewalDate,
    });
    setSubStatus("cancelled");
    setShowCancelConfirm(false);
    setCancelEmailSent(true);
    setTimeout(()=>setCancelEmailSent(false),3500);
  };

  const handleRestartSubscription=()=>{
    setSubStatus("active");
    setShowRestartConfirm(false);
    setRestartSuccess(true);
    setTimeout(()=>setRestartSuccess(false),3000);
  };

  const handleSaveCard=()=>{
    if(!newCardNum.trim()) return;
    const last4=newCardNum.replace(/\s/g,"").slice(-4);
    sc("cardLast4",last4);
    setCardSaved(true);
    setShowUpdateCard(false);
    setNewCardNum("");setNewExpiry("");setNewCvv("");setNewCardName("");
    setTimeout(()=>setCardSaved(false),2500);
  };

  const handleDeleteAccount=()=>{
    simulateSendEmail("deleteAccount",{
      name:client.firstName||"Member",
      email:client.email||"you@example.com",
    });
    setDeleteSuccess(true);
  };

  const fmtCard=(v)=>v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
  const fmtExp=(v)=>{ const d=v.replace(/\D/g,""); return d.length>=2?d.slice(0,2)+"/"+d.slice(2,4):d; };

  const handleUpload=(docType)=>{
    const input=document.createElement("input");
    input.type="file";
    input.accept=".pdf,.jpg,.jpeg,.png,.doc,.docx";
    input.onchange=(e)=>{
      const file=e.target.files[0];
      if(!file) return;
      const docEntry={name:file.name,type:docType,date:new Date().toLocaleDateString(),url:URL.createObjectURL(file)};
      setPets(ps=>ps.map((p,i)=>i===activePet?{...p,docs:[...(p.docs||[]),docEntry]}:p));
    };
    input.click();
  };

  const addPet=()=>{
    setPets(ps=>[...ps,{name:`Pet ${ps.length+1}`,breed:"",birthday:"",gender:"",food:"",allergiesAndSensitivities:"",medications:"",grooming:"",potty:"",docs:[]}]);
    setActivePet(pets.length);
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
          💳 Card Updated
        </div>
      )}

      {/* Renewal email sent toast */}
      {renewalEmailSent&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.navy,border:`1px solid ${T.gold}`,color:T.text,padding:"14px 24px",borderRadius:"14px",fontWeight:"700",fontSize:"13px",zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both",textAlign:"center"}}>
          ✉️ Renewal receipt sent<br/><span style={{fontSize:"11px",color:T.textMuted}}>Check your email</span>
        </div>
      )}

      {/* Cancellation email sent toast */}
      {cancelEmailSent&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.navy,border:`1px solid rgba(224,122,95,.5)`,color:T.text,padding:"14px 24px",borderRadius:"14px",fontWeight:"700",fontSize:"13px",zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both",textAlign:"center"}}>
          ✉️ Cancellation confirmed<br/><span style={{fontSize:"11px",color:T.textMuted}}>Confirmation email sent</span>
        </div>
      )}

      {/* Restart success toast */}
      {restartSuccess&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.success,color:"#fff",padding:"14px 28px",borderRadius:"14px",fontWeight:"900",fontSize:"15px",zIndex:999,boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"successPop .3s both",textAlign:"center"}}>
          🎉 Subscription Reactivated!
        </div>
      )}

      {/* Cancel subscription confirmation modal */}
      {showCancelConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"320px",width:"100%",animation:"rise .35s both"}}>
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div style={{fontSize:"40px",marginBottom:"8px"}}>😔</div>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Cancel Subscription?</h3>
              <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"6px"}}>Your access will continue until <strong style={{color:T.text}}>{client.renewalDate}</strong>. No further charges will be made.</p>
              <p style={{fontSize:"12px",color:T.textFaint,lineHeight:1.5}}>You can reactivate at any time from this page.</p>
            </div>
            <button onClick={handleCancelSubscription} style={{width:"100%",padding:"12px",background:"rgba(224,122,95,.15)",border:"1.5px solid #e07a5f",borderRadius:"10px",color:"#e07a5f",fontWeight:"900",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:"8px",letterSpacing:".06em"}}>
              Yes, Cancel My Subscription
            </button>
            <button onClick={()=>setShowCancelConfirm(false)} style={{width:"100%",padding:"12px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.text,fontWeight:"700",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Keep My Subscription
            </button>
          </div>
        </div>
      )}

      {/* Restart subscription confirmation modal */}
      {showRestartConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"320px",width:"100%",animation:"rise .35s both"}}>
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div style={{fontSize:"40px",marginBottom:"8px"}}>🐾</div>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Reactivate Subscription?</h3>
              <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"6px"}}>Your <strong style={{color:T.text}}>{client.program}</strong> will resume and your card ending in <strong style={{color:T.text}}>{client.cardLast4}</strong> will be billed on your next renewal date.</p>
            </div>
            <GoldBtn onClick={handleRestartSubscription} style={{marginBottom:"8px"}}>Yes, Reactivate →</GoldBtn>
            <button onClick={()=>setShowRestartConfirm(false)} style={{width:"100%",padding:"12px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.text,fontWeight:"700",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Not Yet
            </button>
          </div>
        </div>
      )}

      {/* Delete Account confirmation modal */}
      {showDeleteConfirm&&!deleteSuccess&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"24px"}}>
          <div style={{background:T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"18px",padding:"24px",maxWidth:"320px",width:"100%",animation:"rise .35s both"}}>
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div style={{fontSize:"40px",marginBottom:"8px"}}>⚠️</div>
              <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Delete Account?</h3>
              <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6}}>This will <strong style={{color:"#e07a5f"}}>permanently delete</strong> your account and all associated data. This action cannot be undone.</p>
            </div>
            <button onClick={handleDeleteAccount} style={{width:"100%",padding:"12px",background:"rgba(224,122,95,.15)",border:"1.5px solid #e07a5f",borderRadius:"10px",color:"#e07a5f",fontWeight:"900",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:"8px",letterSpacing:".06em"}}>
              Yes, Delete My Account
            </button>
            <button onClick={()=>setShowDeleteConfirm(false)} style={{width:"100%",padding:"12px",background:T.chipBg,border:`1px solid ${T.chipBorder}`,borderRadius:"10px",color:T.text,fontWeight:"700",fontSize:"13px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete success screen */}
      {deleteSuccess&&(
        <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"32px"}}>
          <div style={{textAlign:"center",animation:"rise .45s both",maxWidth:"300px"}}>
            <div style={{width:"80px",height:"80px",borderRadius:"50%",background:T.success,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"36px",margin:"0 auto 20px",boxShadow:`0 0 0 16px rgba(76,175,125,.1)`}}>✓</div>
            <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",fontWeight:"700",color:T.text,marginBottom:"8px"}}>Account Deleted</h2>
            <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"6px"}}>Your account has been scheduled for deletion.</p>
            <p style={{fontSize:"12px",color:T.textFaint,marginBottom:"18px"}}>A confirmation email has been sent.</p>
            <div style={{background:"rgba(176,141,87,.1)",border:`1px solid rgba(176,141,87,.3)`,borderRadius:"12px",padding:"14px 16px",textAlign:"left"}}>
              <p style={{fontSize:"11px",fontWeight:"700",color:T.gold,marginBottom:"6px",letterSpacing:".08em",textTransform:"uppercase"}}>⏳ Changed your mind?</p>
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
              <button onClick={()=>setShowUpdateCard(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}>✕</button>
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
              <button onClick={closeChangePassword} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:"20px"}}>✕</button>
            </div>

            {/* Current password */}
            <div style={{marginBottom:"14px"}}>
              <label style={{display:"block",fontSize:"9.5px",fontWeight:"700",color:pwErrors.currentPw?T.brown:T.gold,letterSpacing:".13em",textTransform:"uppercase",marginBottom:"4px"}}>Current Password</label>
              <div style={{position:"relative"}}>
                <input type={showCurrentPw?"text":"password"} value={currentPw}
                  onChange={e=>{setCurrentPw(e.target.value);setPwErrors(r=>({...r,currentPw:undefined}));}}
                  placeholder="Enter current password"
                  style={{width:"100%",padding:"11px 44px 11px 13px",background:T.inputBg,border:`1px solid ${pwErrors.currentPw?T.brown:T.inputBorder}`,borderRadius:"9px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                <button type="button" onClick={()=>setShowCurrentPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}>{showCurrentPw?"🙈":"👁️"}</button>
              </div>
              {pwErrors.currentPw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}>⚠ {pwErrors.currentPw}</p>}
            </div>

            {/* New password */}
            <div style={{marginBottom:"14px"}}>
              <label style={{display:"block",fontSize:"9.5px",fontWeight:"700",color:pwErrors.newPw?T.brown:T.gold,letterSpacing:".13em",textTransform:"uppercase",marginBottom:"4px"}}>New Password</label>
              <div style={{position:"relative"}}>
                <input type={showNewPw?"text":"password"} value={newPw}
                  onChange={e=>{setNewPw(e.target.value);setPwErrors(r=>({...r,newPw:undefined}));}}
                  placeholder={`Min ${PASSWORD_MIN_LENGTH} characters`}
                  style={{width:"100%",padding:"11px 44px 11px 13px",background:T.inputBg,border:`1px solid ${pwErrors.newPw?T.brown:T.inputBorder}`,borderRadius:"9px",fontSize:"14px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
                <button type="button" onClick={()=>setShowNewPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}>{showNewPw?"🙈":"👁️"}</button>
              </div>
              {pwErrors.newPw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}>⚠ {pwErrors.newPw}</p>}
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
                <button type="button" onClick={()=>setShowConfirmNewPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}>{showConfirmNewPw?"🙈":"👁️"}</button>
              </div>
              {pwErrors.confirmNewPw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}>⚠ {pwErrors.confirmNewPw}</p>}
              {!pwErrors.confirmNewPw && confirmNewPw.length>0 && confirmNewPw===newPw && <p style={{fontSize:"10px",color:"#4caf7d",marginTop:"3px",fontWeight:"600"}}>✓ Passwords match</p>}
            </div>

            <GoldBtn onClick={handleSavePassword}>Save New Password</GoldBtn>
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
              {k:"food",l:"Daily Food Amount",ph:"e.g. 2 cups twice daily"},
              {k:"allergiesAndSensitivities",l:"Allergies & Food Sensitivities",ph:"e.g. chicken, pollen, bee stings"},
              {k:"medications",l:"Medications",ph:"Name, dose, frequency"},
              {k:"grooming",l:"Grooming Needs",ph:"e.g. brush 3x/week"},
              {k:"potty",l:"Potty Training Notes",ph:"Schedule, signals, accidents"},
            ].map(({k,l,ph})=>(
              <div key={k} style={{marginBottom:"10px"}}>
                <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"4px"}}>{l}</label>
                <input value={pet[k]||""} onChange={e=>sp(k,e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 13px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13.5px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
              </div>
            ))}
            <GoldBtn onClick={handleSave} style={{marginTop:"6px",padding:"11px",fontSize:"12px"}}>Save Pet Profile</GoldBtn>
          </div>

          {/* Health records / upload */}
          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Health Records</p>
            {["Vaccine Records","Vet Records"].map(r=>(
              <div key={r} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
                <span style={{fontSize:"13.5px",color:T.text}}>{r}</span>
                <button onClick={()=>handleUpload(r)} style={{background:T.streakCard,border:`1px solid ${T.streakBorder}`,borderRadius:"8px",padding:"5px 12px",fontSize:"11px",color:T.gold,cursor:"pointer",fontWeight:"700"}}>Upload</button>
              </div>
            ))}
            {/* Uploaded docs + quick-add notes */}
            {([...(pet.docs||[]),...quickAddDocs]).length>0&&(
              <div style={{marginTop:"12px"}}>
                <p style={{fontSize:"9.5px",color:T.gold,fontWeight:"700",letterSpacing:".13em",textTransform:"uppercase",marginBottom:"8px"}}>Attached Documents & Notes</p>
                {[...(pet.docs||[]),...quickAddDocs].map((doc,di)=>(
                  <div key={di} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 10px",background:T.navyAccentBg,border:`1px solid ${T.navyAccentBorder}`,borderRadius:"9px",marginBottom:"6px"}}>
                    <span style={{fontSize:"16px"}}>{doc.url?"📄":"📝"}</span>
                    <div style={{flex:1}}>
                      <p style={{fontSize:"12px",fontWeight:"700",color:T.text,marginBottom:"1px"}}>{doc.name}</p>
                      <p style={{fontSize:"10px",color:T.textMuted}}>{doc.type} · {doc.date}</p>
                    </div>
                    {doc.url&&(
                      <ProtectedMedia type="document">
                        <a href={doc.url} target="_blank" rel="noreferrer"
                          onContextMenu={e=>e.preventDefault()}
                          download={false}
                          style={{fontSize:"11px",color:T.gold,fontWeight:"700",textDecoration:"none"}}>View</a>
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
              {k:"email",l:"Email",ph:"you@example.com"},
              {k:"phone",l:"Phone",ph:"(555) 000-0000"},
            ].map(({k,l,ph})=>(
              <div key={k} style={{marginBottom:"10px"}}>
                <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"4px"}}>{l}</label>
                <input value={client[k]||""} onChange={e=>sc(k,e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 13px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13.5px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
              </div>
            ))}
            <GoldBtn onClick={handleSave} style={{marginTop:"6px",padding:"11px",fontSize:"12px"}}>Save Account Info</GoldBtn>
          </div>

          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Password</p>
            {pwChangedSuccess ? (
              <div style={{background:"rgba(76,175,125,.1)",border:"1px solid rgba(76,175,125,.3)",borderRadius:"10px",padding:"10px 13px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"16px"}}>✓</span>
                <p style={{fontSize:"12px",color:"#4caf7d",fontWeight:"700"}}>Password updated successfully.</p>
              </div>
            ) : (
              <>
                <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.5,marginBottom:"10px"}}>Keep your account secure with a strong, unique password.</p>
                <button onClick={()=>setShowChangePassword(true)} style={{width:"100%",padding:"10px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"9px",color:T.gold,fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
                  🔒 Change Password
                </button>
              </>
            )}
          </div>

          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase"}}>Billing & Plan</p>
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
                <p style={{fontSize:"12px",fontWeight:"700",color:"#e07a5f",marginBottom:"4px"}}>Subscription Cancelled</p>
                <p style={{fontSize:"11.5px",color:T.textMuted,lineHeight:1.55}}>Your access continues until <strong style={{color:T.text}}>{client.renewalDate}</strong>. Reactivate below to resume billing and keep your training going.</p>
              </div>
            )}

            {[
              {l:"Program",v:client.program},
              {l:subStatus==="cancelled"?"Access Until":"Next Renewal",v:client.renewalDate},
              {l:"Card on File",v:`•••• •••• •••• ${client.cardLast4}`},
            ].map(({l,v})=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
                <span style={{fontSize:"12px",color:T.textMuted}}>{l}</span>
                <span style={{fontSize:"12px",fontWeight:"700",color:T.text}}>{v}</span>
              </div>
            ))}

            {/* Update card button */}
            <button onClick={()=>setShowUpdateCard(true)} style={{width:"100%",marginTop:"12px",padding:"10px",background:"transparent",border:`1px solid ${T.gold}`,borderRadius:"9px",color:T.gold,fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
              💳 Update / Change Payment Card
            </button>

            {/* Cancel or Reactivate */}
            {subStatus==="active"?(
              <button onClick={()=>setShowCancelConfirm(true)} style={{width:"100%",marginTop:"8px",padding:"10px",background:"transparent",border:`1px solid rgba(224,122,95,.4)`,borderRadius:"9px",color:"#e07a5f",fontWeight:"700",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
                Cancel Subscription
              </button>
            ):(
              <GoldBtn onClick={()=>setShowRestartConfirm(true)} style={{marginTop:"10px",padding:"11px",fontSize:"12px"}}>
                🐾 Reactivate My Subscription
              </GoldBtn>
            )}

            {/* Auto-renewal email demo */}
            {subStatus==="active"&&(
              <div style={{marginTop:"12px",background:T.navyAccentBg,border:`1px solid ${T.navyAccentBorder}`,borderRadius:"10px",padding:"11px 13px"}}>
                <p style={{fontSize:"11px",color:T.textMuted,lineHeight:1.5,marginBottom:"8px"}}>A receipt email is automatically sent each time your subscription renews and your card is charged.</p>
                <button onClick={handleSimulateRenewal} style={{background:"rgba(76,175,125,.12)",border:"1px solid rgba(76,175,125,.3)",borderRadius:"8px",padding:"7px 12px",fontSize:"11px",color:"#4caf7d",fontWeight:"700",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
                  ✉️ Simulate Renewal Email (Demo)
                </button>
              </div>
            )}
          </div>

          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{darkMode?"Dark Mode":"Light Mode"}</p><p style={{fontSize:"11px",color:T.textMuted}}>Switch display preference</p></div>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
          </div>

          {/* Delete Account */}
          <div style={{background:"rgba(224,122,95,.06)",border:"1.5px solid rgba(224,122,95,.25)",borderRadius:"14px",padding:"14px 16px",marginBottom:"12px"}}>
            <p style={{fontSize:"10px",color:"#e07a5f",fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"8px"}}>Danger Zone</p>
            <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.5,marginBottom:"12px"}}>Permanently delete your account and all training data. This cannot be undone.</p>
            <button onClick={()=>setShowDeleteConfirm(true)} style={{width:"100%",padding:"11px",background:"rgba(224,122,95,.12)",border:"1.5px solid #e07a5f",borderRadius:"9px",color:"#e07a5f",fontWeight:"900",fontSize:"12px",cursor:"pointer",fontFamily:"'Lato',sans-serif",letterSpacing:".06em"}}>
              🗑 Delete My Account
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
            {icon:"✉️",label:"Email",val:"info@guidingpaw.com"},
            {icon:"📱",label:"Phone",val:"801-435-1239"},
            {icon:"🌐",label:"Website",val:"www.guidingpaw.com"},
            {icon:"📍",label:"Location",val:"Serving clients worldwide"},
          ].map(({icon,label,val})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:"12px",padding:"11px 0",borderBottom:`1px solid ${T.divider}`}}>
              <span style={{fontSize:"18px",width:"26px",textAlign:"center"}}>{icon}</span>
              <div>
                <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",textTransform:"uppercase",letterSpacing:".1em",marginBottom:"2px"}}>{label}</p>
                <p style={{fontSize:"13px",color:T.text,fontWeight:"600"}}>{val}</p>
              </div>
            </div>
          ))}
          <div style={{marginTop:"16px",background:T.navyAccentBg,border:`1px solid ${T.navyAccentBorder}`,borderRadius:"10px",padding:"12px 14px"}}>
            <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.6,textAlign:"center"}}>We typically respond within 24 hours. For urgent training questions, use the Diagnosis Tool in the app.</p>
          </div>
        </div>
      )}
    </ScrollBody>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
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
  const [petData,setPetData]=useState({name:"Luna",breed:"Labrador Retriever",birthday:""});
  const [pendingData,setPendingData]=useState(null);
  const [regData,setRegData]=useState(null); // from registration screen
  const [showPlus,setShowPlus]=useState(false);
  const [showDiag,setShowDiag]=useState(false);
  const [showLifeRecord,setShowLifeRecord]=useState(false);
  const [showHandout,setShowHandout]=useState(null); // null | "__library__" | handout id
  const [handoutHistory,setHandoutHistory]=useState([]); // stack of previously-viewed handout screens
  const openHandout=(id)=>{
    if(showHandout) setHandoutHistory(h=>[...h, showHandout]); // remember where we came from
    setShowHandout(id);
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);
  };
  const openHandoutLibrary=()=>{
    setHandoutHistory([]); // fresh entry point — nothing to go back to yet
    setShowHandout("__library__");
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);
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
    if(showVideo) setVideoHistory(h=>[...h, showVideo]); // remember where we came from
    setShowVideo(id);
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);
  };
  const openVideoLibrary=()=>{
    setVideoHistory([]); // fresh entry point — nothing to go back to yet
    setShowVideo("__library__");
    setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);
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
  // Shared puppy program state — lifted so Dashboard can show correct assignment/streak
  const [puppyCompleted,setPuppyCompleted]=useState({});
  const [stdCompleted,setStdCompleted]=useState({});
  const [puppyWeekDone,setPuppyWeekDone]=useState({});
  const [puppyStreak,setPuppyStreak]=useState(3);
  // Tracks whether each program's required welcome video has been watched
  const [welcomeVideoWatched,setWelcomeVideoWatched]=useState({standard:false, puppy:false});
  const [quickAddDocs,setQuickAddDocs]=useState([]);
  const handleQuickAdd=(doc)=>setQuickAddDocs(d=>[...d,doc]);
  const [walkLog,setWalkLog]=useState([]);

  const handleSignIn=()=>{ setPage("dashboard"); setScreen("app"); };
  const handleGoRegister=()=>setScreen("register");
  const handleRegistered=(ud)=>{ setRegData(ud); if(ud.googleAuth){ setScreen("onboarding"); } else { setScreen("verify"); } };
  const handleVerified=()=>setScreen("onboarding");
  const handleGoToPayment=(data)=>{ setPendingData(data); setScreen("payment"); };
  const handlePaySuccess=()=>setScreen("success");
  const handleSuccessContinue=()=>{ setPlan(pendingData?.plan||"annual"); setPetData({...pendingData, birthday: pendingData?.birthday||""}); setShowWelcome(true); setScreen("app"); };
  const handleDismissWelcome=()=>setShowWelcome(false);

  const renderPage=()=>{
    if(showWelcome) return <WelcomeDashboard petData={petData} plan={plan} onDismiss={handleDismissWelcome}/>;
    if(showVideo==="__library__") return <VideoLibraryScreen onOpenVideo={openVideo} onClose={closeVideo}/>;
    if(showVideo) return <VideoScreen id={showVideo} onClose={closeVideo} onBack={goBackVideo}/>;
    if(showHandout==="__library__") return <HandoutLibraryScreen onOpenHandout={openHandout} onClose={closeHandout}/>;
    if(showHandout) return <HandoutScreen id={showHandout} onOpenHandout={openHandout} onBack={goBackHandout} onClose={closeHandout}/>;
    if(showDiag) return <BehaviorScreen onClose={()=>setShowDiag(false)} onOpenHandout={openHandout}/>;
    if(showLifeRecord) return <PetLifeRecord petData={petData} onClose={()=>setShowLifeRecord(false)}/>;
    switch(page){
      case "dashboard": return <DashboardScreen petData={petData} plan={plan} onOpenRecord={()=>{setShowLifeRecord(true);setShowDiag(false);}} puppyWeekDone={puppyWeekDone} puppyStreak={puppyStreak} stdCompleted={stdCompleted} onOpenHandout={openHandout} onOpenVideo={openVideo}/>;
      case "live":      return <LiveScreen walkLog={walkLog}/>;
      case "bond":      return <BondScreen/>;
      case "learn":     return <LearnScreen petData={petData} puppyCompleted={puppyCompleted} setPuppyCompleted={setPuppyCompleted} puppyWeekDone={puppyWeekDone} setPuppyWeekDone={setPuppyWeekDone} setPuppyStreak={setPuppyStreak} stdCompleted={stdCompleted} setStdCompleted={setStdCompleted} welcomeVideoWatched={welcomeVideoWatched} setWelcomeVideoWatched={setWelcomeVideoWatched} onOpenHandout={openHandout} onOpenVideo={openVideo}/>;
      case "share":     return <ShareScreen/>;
      case "calendar":  return <CalendarScreen/>;
      case "store":     return <StoreScreen/>;
      case "settings":  return <SettingsScreen onSignOut={()=>{try{sessionStorage.removeItem("gp_session");}catch{}setScreen("signin");}} darkMode={darkMode} setDarkMode={setDarkMode} quickAddDocs={quickAddDocs} onOpenHandoutLibrary={openHandoutLibrary} onOpenVideoLibrary={openVideoLibrary}/>;
      default:          return <DashboardScreen petData={petData} plan={plan} onOpenRecord={()=>{setShowLifeRecord(true);setShowDiag(false);}} stdCompleted={stdCompleted} onOpenHandout={openHandout} onOpenVideo={openVideo}/>;
    }
  };

  // Web layout: render page content without phone chrome
  const renderWebPage = () => {
    if(showWelcome) return <WelcomeDashboard petData={petData} plan={plan} onDismiss={handleDismissWelcome}/>;
    if(showVideo==="__library__") return <VideoLibraryScreen onOpenVideo={openVideo} onClose={closeVideo}/>;
    if(showVideo) return <VideoScreen id={showVideo} onClose={closeVideo} onBack={goBackVideo}/>;
    if(showHandout==="__library__") return <HandoutLibraryScreen onOpenHandout={openHandout} onClose={closeHandout}/>;
    if(showHandout) return <HandoutScreen id={showHandout} onOpenHandout={openHandout} onBack={goBackHandout} onClose={closeHandout}/>;
    if(showDiag) return <BehaviorScreen onClose={()=>setShowDiag(false)} onOpenHandout={openHandout}/>;
    if(showLifeRecord) return <PetLifeRecord petData={petData} onClose={()=>setShowLifeRecord(false)}/>;
    switch(page){
      case "dashboard": return <DashboardScreen petData={petData} plan={plan} onOpenRecord={()=>{setShowLifeRecord(true);setShowDiag(false);}} puppyWeekDone={puppyWeekDone} puppyStreak={puppyStreak} stdCompleted={stdCompleted} onOpenHandout={openHandout} onOpenVideo={openVideo}/>;
      case "live":      return <LiveScreen walkLog={walkLog}/>;
      case "bond":      return <BondScreen/>;
      case "learn":     return <LearnScreen petData={petData} puppyCompleted={puppyCompleted} setPuppyCompleted={setPuppyCompleted} puppyWeekDone={puppyWeekDone} setPuppyWeekDone={setPuppyWeekDone} setPuppyStreak={setPuppyStreak} stdCompleted={stdCompleted} setStdCompleted={setStdCompleted} welcomeVideoWatched={welcomeVideoWatched} setWelcomeVideoWatched={setWelcomeVideoWatched} onOpenHandout={openHandout} onOpenVideo={openVideo}/>;
      case "share":     return <ShareScreen/>;
      case "calendar":  return <CalendarScreen/>;
      case "store":     return <StoreScreen/>;
      case "settings":  return <SettingsScreen onSignOut={()=>{try{sessionStorage.removeItem("gp_session");}catch{}setScreen("signin");}} darkMode={darkMode} setDarkMode={setDarkMode} quickAddDocs={quickAddDocs} onOpenHandoutLibrary={openHandoutLibrary} onOpenVideoLibrary={openVideoLibrary}/>;
      default:          return <DashboardScreen petData={petData} plan={plan} onOpenRecord={()=>{setShowLifeRecord(true);setShowDiag(false);}} stdCompleted={stdCompleted} onOpenHandout={openHandout} onOpenVideo={openVideo}/>;
    }
  };

  const isAuthScreen = screen!=="app";

  return (
    <ThemeContext.Provider value={T}>
      <div className="app-root" style={{background:T.bg,fontFamily:"'Lato',sans-serif"}}>
        <style>{globalCss(T)}</style>

        {/* ── Auth screens (centered phone-style on all breakpoints) ── */}
        {isAuthScreen && (
          <div style={{width:"100%",maxWidth:"390px",margin:"0 auto"}}>
            {screen==="signin"&&<SignInScreen onSignIn={handleSignIn} goSignUp={handleGoRegister} darkMode={darkMode} setDarkMode={setDarkMode}/>}
            {screen==="register"&&<RegistrationScreen onVerify={handleRegistered} onBack={()=>setScreen("signin")} darkMode={darkMode} setDarkMode={setDarkMode}/>}
            {screen==="verify"&&<EmailVerificationScreen userData={regData} onVerified={handleVerified} onBack={()=>setScreen("register")}/>}
            {screen==="onboarding"&&<OnboardingScreen userData={regData} onGoToPayment={handleGoToPayment} darkMode={darkMode} setDarkMode={setDarkMode}/>}
            {screen==="payment"&&<PaymentScreen petData={pendingData} onSuccess={handlePaySuccess} onBack={()=>setScreen("onboarding")}/>}
            {screen==="success"&&<SuccessScreen petData={pendingData} onContinue={handleSuccessContinue}/>}
          </div>
        )}

        {/* ── App: mobile phone shell ── */}
        {screen==="app"&&(
          <PhoneShell>
            <TopBanner setPage={(p)=>{setPage(p);setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowVideo(null);setVideoHistory([]);}}/>
            <PageLogoHeader/>
            {!showWelcome&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 16px 0",flexShrink:0}}>
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
              <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                <button onClick={()=>{setShowDiag(true);setShowLifeRecord(false);setShowWelcome(false);}} title="Behavior Diagnosis" style={{background:"none",border:"none",cursor:"pointer",color:showDiag?T.gold:T.textFaint,transition:"color .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <text x="12" y="13" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor" stroke="none" fontFamily="sans-serif">?</text>
                  </svg>
                </button>
                <button onClick={openHandoutLibrary} title="Training Handouts" style={{background:"none",border:"none",cursor:"pointer",color:showHandout?T.gold:T.textFaint,transition:"color .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </button>
                <button onClick={()=>{setPage("settings");setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowVideo(null);setVideoHistory([]);}} style={{background:"none",border:"none",cursor:"pointer",color:page==="settings"?T.gold:T.textFaint,fontSize:"18px",transition:"color .2s"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
              </div>
            </div>}
            {renderPage()}
            {!showWelcome&&<BottomNav active={page} setPage={(p)=>{setPage(p);setShowDiag(false);setShowLifeRecord(false);setShowVideo(null);setVideoHistory([]);}} plan={plan} showPlus={showPlus} setShowPlus={setShowPlus} onQuickAdd={handleQuickAdd} walkLog={walkLog} setWalkLog={setWalkLog}/>}
          </PhoneShell>
        )}

        {/* ── App: desktop web layout ── */}
        {screen==="app"&&(
          <div className="web-layout" style={{background:T.bg}}>
            <SideNav
              page={page}
              setPage={setPage}
              setShowDiag={setShowDiag}
              setShowLifeRecord={setShowLifeRecord}
              setShowWelcome={setShowWelcome}
              setShowVideo={setShowVideo}
              setVideoHistory={setVideoHistory}
              plan={plan}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onSignOut={()=>{try{sessionStorage.removeItem("gp_session");}catch{}setScreen("signin");}}
            />
            <div className="web-main" style={{background:T.bg}}>
              {/* Top bar */}
              <div className="web-topbar" style={{background:T.mode==="dark"?"rgba(13,21,32,.97)":"rgba(28,38,54,.97)",borderBottom:`1px solid rgba(176,141,87,.15)`}}>
                <TopBanner setPage={(p)=>{setPage(p);setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);setShowVideo(null);setVideoHistory([]);}}/>
                <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                  <button onClick={()=>{setShowDiag(true);setShowLifeRecord(false);setShowWelcome(false);}} title="Behavior Diagnosis"
                    style={{background:"none",border:"none",cursor:"pointer",color:showDiag?"#B08D57":"rgba(216,198,174,.5)",transition:"color .2s",display:"flex",alignItems:"center"}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      <text x="12" y="13" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor" stroke="none" fontFamily="sans-serif">?</text>
                    </svg>
                  </button>
                  <button onClick={openHandoutLibrary} title="Training Handouts"
                    style={{background:"none",border:"none",cursor:"pointer",color:showHandout?"#B08D57":"rgba(216,198,174,.5)",transition:"color .2s",display:"flex",alignItems:"center"}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
              {/* Page content */}
              <div className="web-content">
                {renderWebPage()}
              </div>
            </div>
          </div>
        )}

      </div>
    </ThemeContext.Provider>
  );
}
