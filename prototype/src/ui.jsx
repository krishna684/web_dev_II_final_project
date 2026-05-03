// Shared UI helpers: icons, toast context, skeletons, PersonaOrb
const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

/* ---- Icons: hand-drawn stroke SVGs (originals, not brand marks) ---- */
const Ic = {
  home: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>,
  user: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
  heart:(p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M12 21s-8-5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-8 11-10 11z"/></svg>,
  graph:(p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><circle cx="5" cy="6" r="2.3"/><circle cx="19" cy="7" r="2.3"/><circle cx="18" cy="18" r="2.3"/><circle cx="7" cy="17" r="2.3"/><circle cx="12" cy="11" r="2.3"/><path d="M7 7l4 3M12 11l5-3M12 11l5 6M7 16l4-4"/></svg>,
  clock:(p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>,
  bell: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>,
  sun:  (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></svg>,
  moon: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></svg>,
  plus: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  edit: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16v4z"/></svg>,
  trash:(p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/></svg>,
  x:    (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  check:(p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M5 12l5 5 9-11"/></svg>,
  arr:  (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  arrR: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>,
  arrL: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>,
  search:(p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>,
  spark:(p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/></svg>,
  star: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17.3 6.4 20.4 7.8 14 3 9.6l6.4-.6z"/></svg>,
  wave: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M3 12c3-6 6-6 9 0s6 6 9 0"/></svg>,
  filter:(p)=> <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>,
  share:(p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></svg>,
  save: (p) => <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M5 3h11l3 3v15H5zM8 3v5h8V3"/></svg>,
  refresh:(p)=> <svg className={`ico ${p.c||''}`} viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>,
};
window.Ic = Ic;

/* ---- Toast system ---- */
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, kind='success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind}`}>
            <span className="tico">
              {t.kind === 'success' ? <Ic.check/> : t.kind === 'error' ? <Ic.x/> : <Ic.spark/>}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);
window.ToastProvider = ToastProvider;
window.useToast = useToast;

/* ---- PersonaOrb: signature avatar ---- */
function PersonaOrb({ initial, hue = 265, size = 54, style = 'orbital' }) {
  if (style === 'flat') {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, hsl(${hue} 80% 65%), hsl(${(hue+60)%360} 80% 65%))`,
        display: 'grid', placeItems: 'center', color: 'white',
        fontFamily: 'Fraunces, serif', fontWeight: 500,
        fontSize: size * 0.42, letterSpacing: '-0.02em',
      }}>{initial}</div>
    );
  }
  // orbital — conic ring with hollow center showing initial
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', position: 'relative',
      background: `conic-gradient(from 0deg, hsl(${hue} 80% 65%), hsl(${(hue+80)%360} 80% 65%), hsl(${(hue+160)%360} 80% 65%), hsl(${hue} 80% 65%))`,
      animation: 'spin 14s linear infinite',
    }}>
      <div style={{
        position: 'absolute', inset: 3, borderRadius: '50%',
        background: 'var(--card)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'Fraunces, serif', fontWeight: 500,
        fontSize: size * 0.42, letterSpacing: '-0.02em',
        background: 'var(--card)', color: 'transparent',
        backgroundClip: 'padding-box',
      }}>
        <span style={{
          background: `linear-gradient(135deg, hsl(${hue} 80% 65%), hsl(${(hue+80)%360} 80% 65%))`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>{initial}</span>
      </div>
    </div>
  );
}
window.PersonaOrb = PersonaOrb;

/* ---- Skeleton helper ---- */
function Skel({ w='100%', h=14, r=6, style={} }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}
window.Skel = Skel;

/* ---- Animated score meter ---- */
function ScoreMeter({ value, size=80 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start;
    const anim = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 900);
      setV(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(anim);
    };
    raf = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const C = 2 * Math.PI * 34;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <defs>
        <linearGradient id="sm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)"/>
          <stop offset="100%" stopColor="var(--accent-2)"/>
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="34" stroke="var(--border)" strokeWidth="6" fill="none"/>
      <circle cx="40" cy="40" r="34" stroke="url(#sm-grad)" strokeWidth="6" fill="none"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - v/100)}
        transform="rotate(-90 40 40)"/>
      <text x="40" y="47" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="500" fontSize="22" fill="var(--text)">{v}</text>
    </svg>
  );
}
window.ScoreMeter = ScoreMeter;
