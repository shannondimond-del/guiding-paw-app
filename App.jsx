import { useState, useContext, createContext } from "react";

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
`;

// ─── SHARED UI ─────────────────────────────────────────────────────────────────
// Guiding Paw logo using the uploaded PNG
const LogoImg = ({size=56}) => {
  const [err,setErr]=useState(false);
  // Try the uploaded file path first (works in Claude artifacts with file uploads)
  const src = "/mnt/user-data/uploads/ChatGPT_Image_Mar_11__2026__09_19_09_AM.png";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
      {err
        ? <div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",background:"#1C2636",borderRadius:"50%",fontSize:size*.4,flexShrink:0}}>🐾</div>
        : <img src={src} alt="Guiding Paw Training" onError={()=>setErr(true)}
            style={{width:size,height:size,objectFit:"contain",filter:"drop-shadow(0 4px 12px rgba(176,141,87,.45))",flexShrink:0}} />
      }
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
            <button onClick={()=>setPage&&setPage(pages[i])} style={{background:"none",border:"none",cursor:"pointer",padding:"2px 4px",fontSize:"9.5px",fontWeight:"900",letterSpacing:".18em",color:i===1?"#c9a870":"rgba(216,198,174,.75)",fontFamily:"'Lato',sans-serif",transition:"color .18s,opacity .18s"}}
              onMouseEnter={e=>e.currentTarget.style.color="#c9a870"}
              onMouseLeave={e=>e.currentTarget.style.color=i===1?"#c9a870":"rgba(216,198,174,.75)"}
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
  return <div style={{width:"100%",maxWidth:"390px",margin:"0 auto",background:T.card,backdropFilter:"blur(24px)",borderRadius:"26px",overflow:"hidden",border:T.mode==="dark"?"1px solid rgba(58,90,130,0.4)":"1px solid rgba(28,38,54,0.22)",boxShadow:T.mode==="dark"?"0 40px 80px rgba(0,0,0,.65),0 0 0 1px rgba(176,141,87,.08) inset":"0 20px 60px rgba(28,38,54,.22),0 1px 0 rgba(255,255,255,.8) inset",display:"flex",flexDirection:"column",maxHeight:"90vh",minHeight:"600px",transition:"background .4s,border-color .4s"}}>{children}</div>;
};

const ScrollBody = ({children,pad="26px"}) => <div style={{flex:1,overflowY:"auto",padding:pad}}>{children}</div>;

// ─── BOTTOM NAV ────────────────────────────────────────────────────────────────
const BottomNav = ({active,setPage,plan,showPlus,setShowPlus,onQuickAdd}) => {
  const T=useTheme();
  const [quickNote,setQuickNote]=useState("");
  const [quickType,setQuickType]=useState(null); // null | "homework" | "progress"
  const icons=[
    {id:"dashboard",label:"Home",icon:"🏠"},
    {id:"live",label:"Live",icon:"❤️"},
    {id:"bond",label:"Bond",icon:"🤝"},
    {id:"plus",label:"",icon:null,center:true},
    {id:"learn",label:"Learn",icon:"🧠"},
    {id:"calendar",label:"Connect",icon:"📅"},
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
      {showPlus&&(
        <div className="rise" style={{position:"absolute",bottom:"72px",left:0,right:0,background:T.mode==="dark"?"#162032":T.cardSolid,border:`1px solid ${T.cardBorder}`,borderRadius:"16px 16px 0 0",padding:"16px 20px",zIndex:50,boxShadow:"0 -10px 30px rgba(0,0,0,.3)"}}>
          <p style={{fontSize:"10px",fontWeight:"900",letterSpacing:".14em",color:T.gold,textTransform:"uppercase",marginBottom:"10px"}}>Quick Add</p>

          {!quickType&&(
            <>
              {[
                {id:"homework",label:"Homework Assignment"},
                {id:"progress",label:"Progress Notes"},
                ...(plan==="pro"?[{id:"trainer",label:"Message a Trainer"}]:[]),
              ].map(item=>(
                <button key={item.id} onClick={()=>item.id==="trainer"?setShowPlus(false):setQuickType(item.id)}
                  style={{display:"block",width:"100%",textAlign:"left",padding:"10px 0",background:"none",border:"none",borderBottom:`1px solid ${T.divider}`,color:T.text,fontSize:"13.5px",cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>
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
      )}
      {/* Nav bar is always navy #1C2636 — the brand's signature color */}
      <div style={{display:"flex",alignItems:"center",background:"#1C2636",borderTop:"2px solid rgba(176,141,87,0.3)",padding:"5px 0 8px",transition:"background .4s"}}>
        {icons.map(({id,label,icon,center})=>
          center?(
            <div key="plus" style={{flex:1,display:"flex",justifyContent:"center"}}>
              <button onClick={()=>{setShowPlus(v=>!v);setQuickType(null);setQuickNote("");}} style={{width:"46px",height:"46px",borderRadius:"50%",background:`linear-gradient(135deg,${T.gold},${T.brown})`,border:"3px solid #1C2636",fontSize:"24px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 16px rgba(176,141,87,.45)",marginTop:"-16px",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>＋</button>
            </div>
          ):(
            <button key={id} onClick={()=>setPage(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",background:"none",border:"none",cursor:"pointer",color:active===id?"#B08D57":"rgba(216,198,174,0.45)",transition:"color .2s"}}>
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
          <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.5,maxWidth:"260px",margin:"0 auto 10px"}}>Your daily guide to raising a well-behaved pet!</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
            {["LIVE","BOND","LEARN"].map((w,i)=>(
              <span key={w} style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <span style={{fontSize:"11px",fontWeight:"900",letterSpacing:".2em",color:i===1?T.gold:"rgba(216,198,174,.6)"}}>{w}</span>
                {i<2&&<span style={{fontSize:"13px",lineHeight:1}}>🐾</span>}
              </span>
            ))}
          </div>
        </div>

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
  const [showPw,    setShowPw]    = useState(false);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if(!firstName.trim())                      e.firstName = "First name is required.";
    if(!lastName.trim())                       e.lastName  = "Last name is required.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Please enter a valid email.";
    if(pw.length < 8)                          e.pw        = "Password must be at least 8 characters.";
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
          <div style={{marginBottom:"20px"}}>
            <label style={{display:"block",fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:errors.pw?T.brown:T.gold,fontWeight:"700",marginBottom:"5px"}}>Password</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={pw} placeholder="Min 8 characters"
                onChange={e=>{setPw(e.target.value);setErrors(r=>({...r,pw:undefined}));}}
                style={{...inputStyle("pw"),paddingRight:"44px"}}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=errors.pw?T.brown:T.inputBorder}/>
              <button onClick={()=>setShowPw(v=>!v)} tabIndex={-1} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"16px",padding:"2px",color:T.textMuted}}>{showPw?"🙈":"👁️"}</button>
            </div>
            {errors.pw&&<p style={{fontSize:"10px",color:"#e07a5f",marginTop:"3px",fontWeight:"600"}}>⚠ {errors.pw}</p>}
            {/* Password strength bar */}
            {pw.length > 0 && (()=>{
              const str = pw.length<8?1:pw.length<12&&!/[^a-zA-Z0-9]/.test(pw)?2:pw.length>=12&&/[^a-zA-Z0-9]/.test(pw)&&/[A-Z]/.test(pw)?4:3;
              const labels=["","Weak","Fair","Good","Strong"];
              const colors=["","#e07a5f","#f0a058",T.gold,T.success];
              return <div style={{marginTop:"8px"}}>
                <div style={{display:"flex",gap:"3px",marginBottom:"4px"}}>
                  {[1,2,3,4].map(i=><div key={i} style={{flex:1,height:"3px",borderRadius:"2px",background:i<=str?colors[str]:"rgba(255,255,255,.1)",transition:"background .3s"}}/>)}
                </div>
                <p style={{fontSize:"10px",color:colors[str],fontWeight:"700"}}>{labels[str]}</p>
              </div>;
            })()}
          </div>

          {/* CTA */}
          <button onClick={handleContinue} disabled={loading} style={{
            width:"100%",padding:"13px",borderRadius:"11px",border:"none",
            background:loading?"rgba(176,141,87,.4)":T.gold,
            color:"#fff",fontSize:"13px",fontWeight:"900",letterSpacing:".1em",textTransform:"uppercase",
            fontFamily:"'Lato',sans-serif",cursor:loading?"wait":"pointer",
            boxShadow:"0 4px 18px rgba(176,141,87,.28)",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
          }}>
            {loading
              ? <><span style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Creating account…</>
              : "Send Verification Email →"}
          </button>

          <div style={{margin:"14px 0"}}><Divider/></div>
          <GoogleBtn label="Sign up with Google" onClick={()=>onVerify({firstName:"Demo",lastName:"User",email:"demo@gmail.com",pw:"",googleAuth:true})}/>

          <p style={{textAlign:"center",fontSize:"11px",color:T.textFaint,marginTop:"16px",lineHeight:1.6}}>
            By continuing you agree to our <span style={{color:T.gold,fontWeight:"700",cursor:"pointer"}}>Terms of Service</span> and <span style={{color:T.gold,fontWeight:"700",cursor:"pointer"}}>Privacy Policy</span>.
          </p>
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
    knows:[],issues:[],trainTime:[],trainHour:"7",trainAmPm:"AM",trainMin:"00",lifestyle:[],catType:[],catBreed:"",catAbout:"",plan:"annual",
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
  // Dog or Cat
  steps.push({content:(<><SectionTitle>Dog or Cat?</SectionTitle><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>{[{v:"dog",e:"🐕",l:"Dog"},{v:"cat",e:"🐈",l:"Cat"}].map(({v,e,l})=><button key={v} onClick={()=>set("petType",v)} style={{padding:"28px 12px",borderRadius:"16px",border:`2px solid ${data.petType===v?T.gold:T.chipBorder}`,background:data.petType===v?"rgba(176,141,87,.15)":T.chipBg,cursor:"pointer",textAlign:"center",transition:"all .2s"}}><div style={{fontSize:"40px",marginBottom:"8px"}}>{e}</div><div style={{fontSize:"14px",fontWeight:"700",color:data.petType===v?T.gold:T.text}}>{l}</div></button>)}</div></>)});
  // Additional pets in household
  steps.push({content:(<><SectionTitle>Any additional pets in the home?</SectionTitle><p style={{fontSize:"12px",color:T.textMuted,marginBottom:"14px"}}>Check this box if you have more than one pet — you can fill out a profile for each one.</p><div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",border:`1px solid ${data.additionalPets?T.gold:T.chipBorder}`,borderRadius:"12px",background:data.additionalPets?"rgba(176,141,87,.1)":T.chipBg,cursor:"pointer"}} onClick={()=>set("additionalPets",!data.additionalPets)}><div style={{width:"22px",height:"22px",borderRadius:"6px",border:`2px solid ${data.additionalPets?T.gold:T.inputBorder}`,background:data.additionalPets?"rgba(176,141,87,.2)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>{data.additionalPets&&<span style={{color:T.gold,fontSize:"13px",fontWeight:"900"}}>✓</span>}</div><span style={{fontSize:"14px",fontWeight:"700",color:data.additionalPets?T.goldLight:T.text}}>Yes, I have additional pets</span></div>{data.additionalPets&&<p style={{fontSize:"11.5px",color:T.textMuted,marginTop:"12px",lineHeight:1.5}}>After completing this questionnaire you'll be able to add profiles for your other pets in the Profile section.</p>}</>)});
  // Gender
  steps.push({content:(<><SectionTitle>Boy or girl?</SectionTitle><ChipGroup options={[{value:"boy",label:"Boy 💙"},{value:"girl",label:"Girl 💗"}]} selected={data.gender} onToggle={v=>set("gender",v)} single/></>)});
  // Details
  steps.push({content:(<><SectionTitle>Tell us about your {data.petType||"pet"}</SectionTitle>{["name","age","weight","birthday",...(data.petType==="dog"?["breed"]:[])].filter(Boolean).map(k=><div key={k} style={{marginBottom:"11px"}}><label style={{fontSize:"10px",letterSpacing:".14em",textTransform:"uppercase",color:T.gold,fontWeight:"700",display:"block",marginBottom:"5px"}}>{k==="birthday"?"Birthday (MM/DD/YYYY)":k.charAt(0).toUpperCase()+k.slice(1)}</label><input value={data[k]} onChange={e=>set(k,e.target.value)} placeholder={k==="age"?"e.g. 2 years":k==="weight"?"lbs":k==="birthday"?"MM/DD/YYYY":k==="name"?"e.g. Luna":"e.g. Labrador Retriever"} style={{width:"100%",padding:"11px 14px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none"}}/></div>)}</>)});
  // Knows
  if(data.petType==="dog"){
    steps.push({content:(<><SectionTitle>What does your dog know?</SectionTitle><p style={{fontSize:"12px",color:T.textMuted,marginBottom:"12px"}}>Select all that apply</p><ChipGroup options={["Name","Stand","Sit","Down","Leave it","Come / Here","Crate / Kennel","Heel","High five / Shake","None of the above"]} selected={data.knows} onToggle={v=>toggle("knows",v,false)}/></>)});
    steps.push({content:(<><SectionTitle>Behavior issues to work on?</SectionTitle><p style={{fontSize:"12px",color:T.textMuted,marginBottom:"12px"}}>Select all that apply</p><ChipGroup options={["Walking","Potty issues","Biting","Chewing","Jumping","Destructive behavior","Counter surfing","Eating poop","Barking","Reactivity / Aggression","Separation anxiety","Humping","Crate training","Socialization"]} selected={data.issues} onToggle={v=>toggle("issues",v,false)}/></>)});
  } else {
    steps.push({content:(<><SectionTitle>What does your cat know?</SectionTitle><ChipGroup options={["Name","Sit","Down","Come"]} selected={data.knows} onToggle={v=>toggle("knows",v,false)}/></>)});
    steps.push({content:(<><SectionTitle>Cat Breed</SectionTitle><div style={{marginBottom:"11px"}}><input value={data.catBreed||""} onChange={e=>set("catBreed",e.target.value)} placeholder="e.g. Siamese, Domestic Shorthair" style={{width:"100%",padding:"11px 14px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none"}}/></div><SectionTitle>Tell us about your cat</SectionTitle><textarea value={data.catAbout||""} onChange={e=>set("catAbout",e.target.value)} placeholder="Personality, any quirks, what you'd like to improve..." style={{width:"100%",padding:"11px 14px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"10px",fontSize:"14px",color:T.text,outline:"none",minHeight:"80px",resize:"none",fontFamily:"'Lato',sans-serif"}}/></>)});
  }
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
  const lifeOpts=data.petType==="cat"?["Love having people over","I have kids","Sometimes I'm a couch potato","Want my pet to be my emotional support animal","Outdoorsy","Active","Fast-paced lifestyle","Nomadic / Travel often"]:["Outdoorsy","Active","Fast-paced lifestyle","Nomadic / Travel often","Love having people over","I have kids","Sometimes I'm a couch potato","Want my dog to be my service / emotional support animal"];
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

const PUPPY_CURRICULUM = [
  {id:"pp1",  label:"Week 1",  sublabel:"Structure",              lessons:["Intro to 100% supervision & tethering","Set a schedule","Create and submit schedule for feedback in Pro"]},
  {id:"pp2",  label:"Week 2",  sublabel:"Communication",          lessons:["Marker words introduction","Socializing","Name game"]},
  {id:"pp3",  label:"Week 3",  sublabel:"First Skill",            lessons:["Sit with a lure"]},
  {id:"pp4",  label:"Week 4",  sublabel:"Foundation Behavior",    lessons:["Sit practice","Socializing inside the home"]},
  {id:"pp5",  label:"Week 5",  sublabel:"Second Skill",           lessons:["Down with a lure","Socializing inside the home"]},
  {id:"pp6",  label:"Week 6",  sublabel:"Environmental Exposure", lessons:["Down practice","Socializing outside the home"]},
  {id:"pp7",  label:"Week 7",  sublabel:"Leash Skills",           lessons:["Leash games","Threshold manners"]},
  {id:"pp8",  label:"Week 8",  sublabel:"Walking Skills",         lessons:["Leash games","Walking on leash"]},
  {id:"pp9",  label:"Week 9",  sublabel:"Generalization",         lessons:["Socializing at the park","Generalizing commands at the park"]},
  {id:"pp10", label:"Week 10", sublabel:"Public Socialization",   lessons:["Socializing in the outside world","Store visit socialization"]},
  {id:"pp11", label:"Week 11", sublabel:"Public Socialization II",lessons:["Socializing in the outside world","Visit a different type of store than last week"]},
  {id:"pp12", label:"Week 12 🎓", sublabel:"Dog Neutrality",      lessons:["Dog neutrality training","Graduation ceremony"], graduation:true},
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
const DashboardScreen = ({petData,plan,onOpenRecord,puppyWeekDone,puppyStreak}) => {
  const T=useTheme();
  const standardStreak=7; const progress=42;
  const petName=petData?.name||"Luna";
  const breed=petData?.breed||"";
  const bd=getBreedData(breed);
  const [assignDone,setAssignDone]=useState(false);
  const [routineDone,setRoutineDone]=useState({});
  const routineItems=[
    {emoji:"🚶",label:"Walk",detail:"25 minutes"},
    {emoji:"🎮",label:"Engagement Game",detail:"5 minutes"},
    {emoji:"🎯",label:"Training Exercise",detail:"Recall"},
    {emoji:"🧩",label:"Enrichment",detail:"Puzzle Toy"},
  ];

  // Detect puppy program
  const birthday=petData?.birthday||"";
  const weeksOld=ageInWeeks(birthday);
  const isPuppy=weeksOld!==null&&weeksOld<20;

  // Find current puppy week (first not marked done)
  const currentPuppyWeekIdx=isPuppy
    ? Math.min(PUPPY_CURRICULUM.findIndex(w=>!puppyWeekDone?.[w.id]), PUPPY_CURRICULUM.length-1)
    : 0;
  const currentPuppyWeek=PUPPY_CURRICULUM[Math.max(0,currentPuppyWeekIdx)];
  const puppyProgress=isPuppy
    ? Math.round((Object.keys(puppyWeekDone||{}).filter(k=>puppyWeekDone[k]).length / PUPPY_CURRICULUM.length)*100)
    : progress;
  const streak = isPuppy ? (puppyStreak||0) : standardStreak;

  return (
    <ScrollBody>
      <div className="s1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div>
          <p style={{fontSize:"11px",color:T.textMuted,letterSpacing:".1em",textTransform:"uppercase"}}>Welcome</p>
          <h2 style={{fontFamily:"'Inter',serif",fontSize:"21px",color:T.text,fontWeight:"700"}}>{petName}'s Dashboard</h2>
        </div>
        <LogoImg size={38}/>
      </div>

      {/* Streak + Progress */}
      <div className="s2" style={{display:"flex",gap:"10px",marginBottom:"13px"}}>
        <div style={{width:"76px",flexShrink:0,background:T.streakCard,border:`1px solid ${T.streakBorder}`,borderRadius:"14px",padding:"12px 8px",textAlign:"center"}}>
          <div style={{fontSize:"24px",marginBottom:"3px"}}>{isPuppy?"":""}</div>
          <div style={{fontSize:"20px",fontWeight:"900",color:T.gold}}>{streak}</div>
          <div style={{fontSize:"8.5px",color:T.textMuted,letterSpacing:".07em",textTransform:"uppercase"}}>{isPuppy?"Puppy\nStreak":"Streak"}</div>
        </div>
        <div style={{flex:1,background:T.progressCard,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
            <span style={{fontSize:"10px",color:T.textMuted,textTransform:"uppercase",letterSpacing:".07em"}}>Progress</span>
            <span style={{fontSize:"11px",fontWeight:"700",color:T.gold}}>{isPuppy?puppyProgress:progress}%</span>
          </div>
          <div style={{background:T.mode==="dark"?"rgba(255,255,255,.08)":"rgba(0,0,0,.08)",borderRadius:"5px",height:"7px",overflow:"hidden",marginBottom:"6px"}}>
            <div style={{width:`${isPuppy?puppyProgress:progress}%`,height:"100%",background:`linear-gradient(90deg,${T.green},${T.gold})`,borderRadius:"5px"}}/>
          </div>
          <p style={{fontSize:"10.5px",color:T.textMuted}}>
            {isPuppy
              ? <>Phase: <span style={{color:T.text,fontWeight:"700"}}>{currentPuppyWeek.label} — {currentPuppyWeek.sublabel}</span></>
              : <>Phase: <span style={{color:T.text,fontWeight:"700"}}>Week 2 — E-Collar</span></>
            }
          </p>
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
          {/* Daily timed activities for current puppy week */}
          {PUPPY_DAILY_SCHEDULE[currentPuppyWeek.id]?.map((item,i,arr)=>(
            <div key={item.time+item.task} style={{display:"flex",alignItems:"flex-start",gap:"10px",padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${T.divider}`:"none"}}>
              <div style={{background:"rgba(76,175,125,.15)",borderRadius:"7px",padding:"4px 8px",flexShrink:0,minWidth:"52px",textAlign:"center"}}>
                <span style={{fontSize:"10.5px",fontWeight:"900",color:"#4caf7d"}}>{item.time}</span>
              </div>
              <div style={{flex:1}}>
                <p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"1px"}}>{item.task}</p>
                <p style={{fontSize:"10.5px",color:T.textMuted}}>{item.detail}</p>
              </div>
              <span style={{fontSize:"16px",flexShrink:0}}>{item.emoji}</span>
            </div>
          ))}
        </div>
      )}

      {/* Standard Today's Assignment — shown for non-puppy */}
      {!isPuppy && (
      <div className="s3" style={{
        background:T.assignCard,
        border:`1px solid ${T.cardInnerBorder}`,
        borderLeft:`4px solid ${T.gold}`,
        borderRadius:"16px",padding:"18px",marginBottom:"13px",
        boxShadow:T.mode==="dark"?"0 4px 20px rgba(176,141,87,.12)":"0 4px 20px rgba(176,141,87,.18)",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
          <div style={{flex:1}}>
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"900",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"5px"}}>Today's Assignment</p>
            <p style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,lineHeight:1.2}}>E-Collar: Non-Motion Commands</p>
          </div>
          <div style={{background:"rgba(176,141,87,.15)",borderRadius:"10px",padding:"6px 9px",textAlign:"center",flexShrink:0,marginLeft:"10px"}}>
            <div style={{fontSize:"9px",fontWeight:"700",color:T.gold}}>WEEK</div>
            <div style={{fontSize:"18px",fontWeight:"900",color:T.gold}}>2</div>
          </div>
        </div>

        <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.6,marginBottom:"12px"}}>
          Practice Down, Sit, and Threshold commands using low-level e-collar stimulation. 3 sets of 5 reps each.
        </p>

        {breed ? (
          <div style={{background:T.mode==="dark"?"rgba(176,141,87,.07)":"rgba(176,141,87,.06)",border:`1px solid rgba(176,141,87,.22)`,borderRadius:"12px",padding:"12px 14px",marginBottom:"14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"9px"}}>
              <div style={{background:T.gold,borderRadius:"6px",padding:"3px 9px"}}>
                <span style={{fontSize:"9px",fontWeight:"900",color:"#fff",letterSpacing:".1em",textTransform:"uppercase"}}>🐕 {breed}</span>
              </div>
              <span style={{fontSize:"9px",color:T.textFaint,fontWeight:"700",letterSpacing:".08em",textTransform:"uppercase"}}>Breed Insights</span>
            </div>
            <div style={{marginBottom:"9px"}}>
              <p style={{fontSize:"9px",fontWeight:"900",color:T.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"4px"}}>🧠 Tendency</p>
              <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55}}>{bd.tendency}</p>
            </div>
            <div style={{marginBottom:"9px",paddingTop:"9px",borderTop:`1px solid ${T.divider}`}}>
              <p style={{fontSize:"9px",fontWeight:"900",color:T.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"4px"}}>💡 Training Tip</p>
              <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55}}>{bd.tip}</p>
            </div>
            <div style={{paddingTop:"9px",borderTop:`1px solid ${T.divider}`}}>
              <p style={{fontSize:"9px",fontWeight:"900",color:T.success,letterSpacing:".1em",textTransform:"uppercase",marginBottom:"4px"}}>🏃 Exercise Today</p>
              <p style={{fontSize:"12px",color:T.textMuted,lineHeight:1.55}}>{bd.exercise}</p>
            </div>
          </div>
        ) : (
          <div style={{background:T.mode==="dark"?"rgba(176,141,87,.06)":"rgba(176,141,87,.04)",border:`1px solid rgba(176,141,87,.15)`,borderRadius:"10px",padding:"10px 13px",marginBottom:"14px"}}>
            <p style={{fontSize:"11.5px",color:T.textFaint,lineHeight:1.5}}>
              💡 Add your dog's breed in <span style={{color:T.gold,fontWeight:"700"}}>Settings → Pet Profile</span> to unlock breed-specific training tips.
            </p>
          </div>
        )}

        <button className={assignDone?"btn-gold":"btn-gold complete-btn"} onClick={()=>setAssignDone(d=>!d)} style={{width:"100%",padding:"14px",background:assignDone?T.success:T.gold,color:"#fff",border:"none",borderRadius:"11px",fontSize:"14px",fontWeight:"900",letterSpacing:".08em",textTransform:"uppercase",fontFamily:"'Lato',sans-serif",cursor:"pointer",boxShadow:assignDone?`0 4px 18px ${T.success}44`:"0 4px 20px rgba(176,141,87,.4)",transition:"all .3s"}}>
          {assignDone?"✓ Completed! Great work!":"Mark Complete ✓"}
        </button>
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
const LiveScreen = () => {
  const T=useTheme();
  return (
    <ScrollBody>
      <div className="s1" style={{marginBottom:"18px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"4px"}}>Live</p>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Lifestyle and Wellness</h2>
      </div>
      {/* GPS */}
      <div className="s2" style={{background:T.liveGpsBg,border:`1px solid ${T.liveGpsBorder}`,borderRadius:"16px",padding:"16px",marginBottom:"12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
          <div><p style={{fontSize:"10px",color:T.success,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"3px"}}>GPS Exercise Tracker</p><p style={{fontSize:"14px",fontWeight:"700",color:T.text}}>Today: 1.2 miles</p></div>
          <button style={{background:T.success,border:"none",borderRadius:"10px",padding:"10px 16px",fontWeight:"900",fontSize:"12px",color:"white",cursor:"pointer"}}>START WALK</button>
        </div>
        <div style={{background:T.mode==="dark"?"rgba(0,0,0,.3)":"rgba(0,0,0,.06)",borderRadius:"10px",height:"80px",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:T.textFaint,fontSize:"12px"}}>Map view appears here during walk</p></div>
        <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>(
            <div key={d} style={{flex:1,textAlign:"center"}}>
              <div style={{height:`${[20,40,15,55,30,70,0][i]}px`,background:i<6?"rgba(76,175,125,.4)":"rgba(128,128,128,.12)",borderRadius:"4px",marginBottom:"3px"}}/>
              <span style={{fontSize:"7.5px",color:T.textFaint}}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Grooming */}
      <div className="s3" style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"16px",padding:"16px"}}>
        <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"10px"}}>Grooming Schedule</p>
        {["Bath","Nail trim","Brushing","Ear cleaning"].map(g=>(
          <div key={g} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
            <span style={{fontSize:"13.5px",color:T.text}}>{g}</span>
            <button style={{background:T.streakCard,border:`1px solid ${T.streakBorder}`,borderRadius:"8px",padding:"5px 12px",fontSize:"11px",color:T.gold,cursor:"pointer",fontWeight:"700"}}>Log</button>
          </div>
        ))}
      </div>
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
    lessons:["Sit stay","Down stay","Marker Words","Socializing","Crate / Kennel","Generalizing","Implied Stays","3 D's: Distance, Distraction, Duration"]},
  {id:"w1",  label:"Week 1", sublabel:"Leash Pressure & Place",
    unlockAfterDays:7,
    lessons:["Intro to pressure: Prong or slip lead","Place","Recall","Leash games / direction changes","Threshold boundaries"]},
  {id:"w2",  label:"Week 2", sublabel:"E-Collar Introduction",
    unlockAfterDays:7,
    lessons:["Intro to e-collar — Non-motion: Down","Intro to e-collar — Thresholds","Intro to e-collar — Sit"]},
  {id:"w3",  label:"Week 3", sublabel:"E-Collar Motion",
    unlockAfterDays:7,
    lessons:["Intro to e-collar — Motion: Recall","Intro to e-collar — Walking","Intro to e-collar — Place"]},
  {id:"w4",  label:"Week 4", sublabel:"Generalization",
    unlockAfterDays:7,
    lessons:["Generalizing at the park"]},
  {id:"w5",  label:"Week 5", sublabel:"Field Trip",
    unlockAfterDays:7,
    lessons:["Generalizing on a field trip"]},
  {id:"w6",  label:"Week 6", sublabel:"Intro to Off Leash",
    unlockAfterDays:7,
    lessons:["Intro to off leash","Issue graduation certificate & share to social media"]},
  {id:"grad", label:"Graduation & Life Beyond", sublabel:"Your Journey Continues",
    unlockAfterDays:7,
    lessons:["Graduation ceremony","Advanced recall in new environments","Maintaining skills long-term","Continuing education resources"],
    graduation:true},
];

const LearnScreen = ({petData, puppyCompleted, setPuppyCompleted, puppyWeekDone, setPuppyWeekDone, setPuppyStreak}) => {
  const T=useTheme();
  const [openWeek,setOpenWeek]=useState(null);
  const [stdCompleted,setStdCompleted]=useState({});
  const [programTab,setProgramTab]=useState("auto");
  const [weekCompletedAt,setWeekCompletedAt]=useState({}); // weekId -> timestamp ms

  const birthday = petData?.birthday || "";
  const weeksOld = ageInWeeks(birthday);
  const isPuppy = weeksOld !== null && weeksOld < 20;
  const effectiveTab = programTab === "auto" ? (isPuppy ? "puppy" : "standard") : programTab;
  const isStandard = effectiveTab === "standard";
  const curriculum = isStandard ? STANDARD_CURRICULUM : PUPPY_CURRICULUM;

  // Standard lesson toggle
  const toggleStd = (wid,lesson) => { const k=`${wid}::${lesson}`; setStdCompleted(c=>({...c,[k]:!c[k]})); };

  // Puppy lesson toggle — uses lifted state
  const togglePuppy = (wid,lesson) => { const k=`${wid}::${lesson}`; setPuppyCompleted(c=>({...c,[k]:!c[k]})); };

  // Is a week unlocked? For weeks after pre-req: must wait 7 days since previous week was completed
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const isUnlocked = (wi) => {
    if(wi === 0) return true;
    const prev = curriculum[wi-1];
    if(isStandard) {
      const allDone = prev.lessons.every(l => !!stdCompleted[`${prev.id}::${l}`]);
      if(!allDone) return false;
      // If no delay defined, unlock immediately
      if(!curriculum[wi].unlockAfterDays) return true;
      const completedAt = weekCompletedAt[prev.id];
      if(!completedAt) return false;
      // Demo: allow immediate unlock in dev by checking if completedAt is within the last second
      // In production this would enforce 7 days; for demo purposes we use 5 seconds
      return (Date.now() - completedAt) >= 5000;
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
                  <span style={{fontSize:"10px",color:T.textFaint,fontWeight:"600"}}>{week.sublabel}</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                {!unlocked && prevWeek && !isStandard && (
                  <span style={{fontSize:"9px",color:T.textFaint,maxWidth:"80px",textAlign:"right",lineHeight:1.3}}>Complete {prevWeek.label} first</span>
                )}
                {!unlocked && isStandard && prevWeek && (
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

                {/* Lessons list */}
                {week.lessons.map((lesson,li)=>{
                  const key=`${week.id}::${lesson}`;
                  const done=!!completed[key];
                  const disabled=weekMarkedDone; // puppy lessons frozen after week marked done
                  return (
                    <div key={lesson} className="lesson-row"
                      style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 15px",borderBottom:li<week.lessons.length-1?`1px solid ${T.divider}`:"none",cursor:disabled?"default":"pointer",opacity:disabled?0.65:1}}
                      onClick={()=>!disabled&&(isStandard?toggleStd(week.id,lesson):togglePuppy(week.id,lesson))}>
                      <span style={{fontSize:"13px",color:done?T.textFaint:T.text,textDecoration:done?"line-through":"none",flex:1,lineHeight:1.4}}>{lesson}</span>
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
const BehaviorScreen = ({onClose}) => {
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
            <div style={{fontSize:"40px",marginBottom:"10px"}}>🔍</div>
            <p style={{fontFamily:"'Inter',serif",fontSize:"17px",fontWeight:"700",color:T.text,marginBottom:"6px"}}>Is your pet struggling with a behavior?</p>
            <p style={{fontSize:"13px",color:T.textMuted,lineHeight:1.5}}>Answer a few quick questions and we'll recommend a personalized training path.</p>
          </div>
          <GoldBtn onClick={()=>setDiagStep("petType")}>I Need Help With Behavior →</GoldBtn>
        </div>
      )}

      {diagStep==="petType"&&(
        <div className="slide">
          <SectionTitle>Is this for your dog or cat?</SectionTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"18px"}}>
            {[{v:"dog",e:"🐕",l:"Dog"},{v:"cat",e:"🐈",l:"Cat"}].map(({v,e,l})=>(
              <button key={v} onClick={()=>{set("petType",v);setDiagStep("issue");}} style={{padding:"24px 12px",borderRadius:"14px",border:`2px solid ${T.chipBorder}`,background:T.chipBg,cursor:"pointer",textAlign:"center",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.chipBorder;}}>
                <div style={{fontSize:"36px",marginBottom:"7px"}}>{e}</div>
                <div style={{fontSize:"14px",fontWeight:"700",color:T.text}}>{l}</div>
              </button>
            ))}
          </div>
          <BackBtn onClick={()=>setDiagStep("start")}/>
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

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN: SETTINGS (multi-tab: Profile / Settings / Contact / Sign Out)
// ═══════════════════════════════════════════════════════════════════════════════
const SettingsScreen = ({onSignOut,darkMode,setDarkMode,quickAddDocs=[]}) => {
  const T=useTheme();
  const [tab,setTab]=useState("profile");
  const [showSaved,setShowSaved]=useState(false);

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

      <div className="s1" style={{marginBottom:"14px"}}>
        <h2 style={{fontFamily:"'Inter',serif",fontSize:"22px",color:T.text,fontWeight:"700"}}>Account</h2>
      </div>

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
                    {doc.url&&<a href={doc.url} target="_blank" rel="noreferrer" style={{fontSize:"11px",color:T.gold,fontWeight:"700",textDecoration:"none"}}>View</a>}
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
            <p style={{fontSize:"10px",color:T.gold,fontWeight:"700",letterSpacing:".14em",textTransform:"uppercase",marginBottom:"12px"}}>Billing & Plan</p>
            {[
              {l:"Program",v:client.program},
              {l:"Renewal Date",v:client.renewalDate},
              {l:"Card on File",v:`•••• •••• •••• ${client.cardLast4}`},
            ].map(({l,v})=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.divider}`}}>
                <span style={{fontSize:"12px",color:T.textMuted}}>{l}</span>
                <span style={{fontSize:"12px",fontWeight:"700",color:T.text}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:"10px"}}>
              <label style={{display:"block",fontSize:"9.5px",letterSpacing:".13em",textTransform:"uppercase",color:T.gold,fontWeight:"700",marginBottom:"4px"}}>Update Card Number</label>
              <input placeholder="1234 5678 9012 3456" style={{width:"100%",padding:"10px 13px",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:"9px",fontSize:"13.5px",color:T.text,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
            </div>
            <GoldBtn onClick={handleSave} style={{marginTop:"10px",padding:"11px",fontSize:"12px"}}>Update Billing</GoldBtn>
          </div>

          <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><p style={{fontSize:"13px",fontWeight:"700",color:T.text,marginBottom:"2px"}}>{darkMode?"Dark Mode":"Light Mode"}</p><p style={{fontSize:"11px",color:T.textMuted}}>Switch display preference</p></div>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
          </div>
        </>
      )}

      {/* CONTACT TAB */}
      {tab==="contact"&&(
        <div style={{background:T.cardInner,border:`1px solid ${T.cardInnerBorder}`,borderRadius:"14px",padding:"18px",marginBottom:"12px"}}>
          <div style={{textAlign:"center",marginBottom:"18px"}}>
            <LogoImg size={48}/>
            <h3 style={{fontFamily:"'Inter',serif",fontSize:"18px",fontWeight:"700",color:T.text,marginTop:"10px",marginBottom:"4px"}}>Guiding Paw</h3>
            <p style={{fontSize:"12px",color:T.textMuted}}>Professional Dog & Cat Training</p>
          </div>
          {[
            {icon:"✉️",label:"Email",val:"hello@guidingpaw.com"},
            {icon:"📱",label:"Phone",val:"(555) PAW-DOGS"},
            {icon:"🌐",label:"Website",val:"www.guidingpaw.com"},
            {icon:"📍",label:"Location",val:"Serving clients nationwide"},
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
  const [showWelcome,setShowWelcome]=useState(false);
  // Shared puppy program state — lifted so Dashboard can show correct assignment/streak
  const [puppyCompleted,setPuppyCompleted]=useState({});
  const [puppyWeekDone,setPuppyWeekDone]=useState({});
  const [puppyStreak,setPuppyStreak]=useState(3);
  const [quickAddDocs,setQuickAddDocs]=useState([]);
  const handleQuickAdd=(doc)=>setQuickAddDocs(d=>[...d,doc]);

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
    if(showDiag) return <BehaviorScreen onClose={()=>setShowDiag(false)}/>;
    if(showLifeRecord) return <PetLifeRecord petData={petData} onClose={()=>setShowLifeRecord(false)}/>;
    switch(page){
      case "dashboard": return <DashboardScreen petData={petData} plan={plan} onOpenRecord={()=>{setShowLifeRecord(true);setShowDiag(false);}} puppyWeekDone={puppyWeekDone} puppyStreak={puppyStreak}/>;
      case "live":      return <LiveScreen/>;
      case "bond":      return <BondScreen/>;
      case "learn":     return <LearnScreen petData={petData} puppyCompleted={puppyCompleted} setPuppyCompleted={setPuppyCompleted} puppyWeekDone={puppyWeekDone} setPuppyWeekDone={setPuppyWeekDone} setPuppyStreak={setPuppyStreak}/>;
      case "calendar":  return <CalendarScreen/>;
      case "store":     return <StoreScreen/>;
      case "settings":  return <SettingsScreen onSignOut={()=>setScreen("signin")} darkMode={darkMode} setDarkMode={setDarkMode} quickAddDocs={quickAddDocs}/>;
      default:          return <DashboardScreen petData={petData} plan={plan} onOpenRecord={()=>{setShowLifeRecord(true);setShowDiag(false);}}/>;
    }
  };

  return (
    <ThemeContext.Provider value={T}>
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 16px",fontFamily:"'Lato',sans-serif",transition:"background .4s"}}>
        <style>{globalCss(T)}</style>
        {screen==="signin"&&<SignInScreen onSignIn={handleSignIn} goSignUp={handleGoRegister} darkMode={darkMode} setDarkMode={setDarkMode}/>}
        {screen==="register"&&<RegistrationScreen onVerify={handleRegistered} onBack={()=>setScreen("signin")} darkMode={darkMode} setDarkMode={setDarkMode}/>}
        {screen==="verify"&&<EmailVerificationScreen userData={regData} onVerified={handleVerified} onBack={()=>setScreen("register")}/>}
        {screen==="onboarding"&&<OnboardingScreen userData={regData} onGoToPayment={handleGoToPayment} darkMode={darkMode} setDarkMode={setDarkMode}/>}
        {screen==="payment"&&<PaymentScreen petData={pendingData} onSuccess={handlePaySuccess} onBack={()=>setScreen("onboarding")}/>}
        {screen==="success"&&<SuccessScreen petData={pendingData} onContinue={handleSuccessContinue}/>}
        {screen==="app"&&(
          <PhoneShell>
            <TopBanner setPage={(p)=>{setPage(p);setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);}}/>
            <PageLogoHeader/>
            {!showWelcome&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 16px 0",flexShrink:0}}>
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode}/>
              <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                <button onClick={()=>{setShowDiag(true);setShowLifeRecord(false);setShowWelcome(false);}} title="Behavior Diagnosis" style={{background:"none",border:"none",cursor:"pointer",fontSize:"16px",color:showDiag?T.gold:T.textFaint,transition:"color .2s"}}>🔍</button>
                <button onClick={()=>{setPage("settings");setShowDiag(false);setShowLifeRecord(false);setShowWelcome(false);}} style={{background:"none",border:"none",cursor:"pointer",color:page==="settings"?T.gold:T.textFaint,fontSize:"18px",transition:"color .2s"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
              </div>
            </div>}
            {renderPage()}
            {!showWelcome&&<BottomNav active={page} setPage={(p)=>{setPage(p);setShowDiag(false);setShowLifeRecord(false);}} plan={plan} showPlus={showPlus} setShowPlus={setShowPlus} onQuickAdd={handleQuickAdd}/>}
          </PhoneShell>
        )}
      </div>
    </ThemeContext.Provider>
  );
}
