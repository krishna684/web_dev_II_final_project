const { useState: aS, useEffect: aE, useRef: aR } = React;

function AuthBackdrop() {
  // SVG neural constellation with animated pulsing lines
  const nodes = aR([
    {x:10,y:20,r:5}, {x:22,y:50,r:4}, {x:15,y:78,r:6},
    {x:40,y:30,r:3}, {x:50,y:62,r:5}, {x:62,y:18,r:4},
    {x:75,y:48,r:6}, {x:85,y:80,r:3}, {x:90,y:28,r:4},
    {x:35,y:85,r:4}, {x:68,y:70,r:3},
  ]).current;
  const edges = [
    [0,1],[1,2],[1,3],[3,5],[3,4],[4,6],[5,8],[6,8],[6,7],[4,10],[2,9],[4,9],[7,10]
  ];
  return (
    <svg className="auth-orb" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <radialGradient id="node-g" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="1"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {edges.map(([a,b], i) => {
        const na = nodes[a], nb = nodes[b];
        return (
          <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke="var(--accent)" strokeOpacity="0.25" strokeWidth="0.15">
            <animate attributeName="stroke-opacity" values="0.05;0.35;0.05" dur={`${3 + (i%4)}s`} repeatCount="indefinite" begin={`${-i*0.3}s`}/>
          </line>
        );
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r} fill="url(#node-g)" opacity="0.5"/>
          <circle cx={n.x} cy={n.y} r={n.r*0.35} fill="var(--accent)">
            <animate attributeName="r" values={`${n.r*0.35};${n.r*0.6};${n.r*0.35}`} dur={`${2+(i%3)}s`} repeatCount="indefinite" begin={`${-i*0.2}s`}/>
          </circle>
        </g>
      ))}
    </svg>
  );
}

function LoginScreen({ onLogin, goRegister }) {
  const [email, setEmail] = aS('krishna@parallel.app');
  const [pw, setPw] = aS('••••••••');
  const [loading, setLoading] = aS(false);
  const toast = window.useToast();

  const submit = (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('auth_token', 'mock_token');
      toast('Welcome back, Krishna', 'success');
      onLogin();
    }, 700);
  };

  return (
    <div className="auth-screen">
      <div className="atmo"><div className="blob b1"/><div className="blob b2"/><div className="blob b3"/></div>
      <div className="grid-bg"/>
      <div className="auth-left">
        <AuthBackdrop/>
        <div>
          <div className="row" style={{gap:12}}>
            <img src="lumi.png" className="logo-img" alt="Lumi" />
            <div>
              <div style={{fontWeight:700, letterSpacing:'-0.02em', fontSize:17}}>Parallel Selves</div>
              <small className="muted" style={{fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase'}}>v2.6 — identity lab</small>
            </div>
          </div>
        </div>
        <div className="auth-hero">
          <span className="tag">LIVE · 14,208 personas active</span>
          <h1>Discover which <em>version of you</em> connects best.</h1>
          <p>Design multiple personas, watch them drift over time, and find the people who match the you that's showing up today.</p>
          <div className="auth-stats">
            <div className="s"><b>3.2M</b><span>compatibility checks run</span></div>
            <div className="s"><b>92%</b><span>of matches rated meaningful</span></div>
            <div className="s"><b>24h</b><span>avg drift detection</span></div>
          </div>
        </div>
        <div className="muted" style={{fontSize:12}}>© 2026 Parallel Selves · Privacy-first identity research</div>
      </div>
      <div className="auth-right">
        <form className="auth-card" onSubmit={submit}>
          <h2>Welcome back</h2>
          <div className="muted">Sign in to your identity lab.</div>
          <div className="field">
            <label>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.com"/>
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••"/>
          </div>
          <div className="row between" style={{margin:'-4px 0 18px'}}>
            <label className="row" style={{gap:8, fontSize:12.5, color:'var(--text-dim)', cursor:'pointer'}}>
              <input type="checkbox" defaultChecked style={{accentColor:'var(--accent)'}}/> Remember me
            </label>
            <a style={{fontSize:12.5, color:'var(--accent)', cursor:'pointer'}}>Forgot?</a>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : <>Enter the lab <Ic.arr/></>}
          </button>
          <div className="divider"/>
          <button type="button" className="btn btn-ghost" style={{width:'100%'}}>
            <Ic.spark/> Continue with SSO
          </button>
          <div className="auth-swap">
            New here? <b onClick={goRegister}>Create an account</b>
          </div>
        </form>
      </div>
    </div>
  );
}

function RegisterScreen({ onDone, goLogin }) {
  const [step, setStep] = aS(0);
  const [form, setForm] = aS({ name:'', email:'', pw:'', pw2:'', vibe:'wanderer' });
  const toast = window.useToast();

  const setF = (k,v) => setForm(f => ({...f, [k]: v}));
  const next = () => setStep(s => Math.min(2, s+1));
  const prev = () => setStep(s => Math.max(0, s-1));
  const finish = () => { 
    localStorage.setItem('auth_token', 'mock_token');
    toast('Account created — welcome!', 'success'); 
    onDone(); 
  };

  const vibes = [
    { id:'wanderer', label:'Wanderer', hue:265 },
    { id:'creator',  label:'Creator',  hue:320 },
    { id:'architect',label:'Architect',hue:200 },
    { id:'seeker',   label:'Seeker',   hue:230 },
  ];

  return (
    <div className="auth-screen">
      <div className="atmo"><div className="blob b1"/><div className="blob b2"/><div className="blob b3"/></div>
      <div className="grid-bg"/>
      <div className="auth-left">
        <AuthBackdrop/>
        <div className="row" style={{gap:12}}>
          <div className="logo-mark"/>
          <div style={{fontWeight:700, letterSpacing:'-0.02em', fontSize:17}}>Parallel Selves</div>
        </div>
        <div className="auth-hero">
          <span className="tag">SETUP · 3 quick steps</span>
          <h1>Let's spin up your <em>first self</em>.</h1>
          <p>You can always add more personas later. Think of this as the version of you walking in the door today.</p>
        </div>
        <div className="muted" style={{fontSize:12}}>Takes about 90 seconds.</div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="stepper">
            {[0,1,2].map((i) => (
              <React.Fragment key={i}>
                <div className={`step-dot ${i===step?'active':''} ${i<step?'done':''}`}>
                  {i<step ? <Ic.check/> : i+1}
                </div>
                {i<2 && <div className={`step-line ${i<step?'done':''}`}/>}
              </React.Fragment>
            ))}
          </div>
          <h2>
            {step===0 && 'Who are you?'}
            {step===1 && 'Secure your account'}
            {step===2 && 'Pick a starting vibe'}
          </h2>
          <div className="muted">
            {step===0 && 'Just the basics — we keep it minimal.'}
            {step===1 && 'Choose a password you actually remember.'}
            {step===2 && "We'll seed your first persona around this vibe."}
          </div>

          {step===0 && (
            <div style={{marginTop:20}}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={e=>setF('name', e.target.value)} placeholder="Krishna K."/>
              </div>
              <div className="field">
                <label>Email</label>
                <input value={form.email} onChange={e=>setF('email', e.target.value)} placeholder="you@domain.com"/>
              </div>
            </div>
          )}
          {step===1 && (
            <div style={{marginTop:20}}>
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.pw} onChange={e=>setF('pw', e.target.value)} placeholder="At least 8 characters"/>
              </div>
              <div className="field">
                <label>Confirm</label>
                <input type="password" value={form.pw2} onChange={e=>setF('pw2', e.target.value)} placeholder="Repeat it"/>
                <span className="hint">We'll never email this to you. Obviously.</span>
              </div>
            </div>
          )}
          {step===2 && (
            <div style={{marginTop:20}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10}}>
                {vibes.map(v => (
                  <div key={v.id} onClick={()=>setF('vibe', v.id)}
                    style={{
                      padding: 16, borderRadius: 'var(--r-md)',
                      background: form.vibe===v.id ? 'var(--accent-soft)' : 'var(--card-2)',
                      border: `1px solid ${form.vibe===v.id ? 'var(--accent)' : 'var(--border)'}`,
                      cursor:'pointer', transition:'all .2s',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:10
                    }}>
                    <PersonaOrb initial={v.label[0]} hue={v.hue} size={48}/>
                    <div style={{fontSize:13, fontWeight:600}}>{v.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="row" style={{gap:10, marginTop:20}}>
            {step>0 ? (
              <button className="btn btn-ghost" onClick={prev}><Ic.arrL/> Back</button>
            ) : (
              <button className="btn btn-ghost" onClick={goLogin}>Have an account?</button>
            )}
            <div className="spacer"/>
            {step<2 ? (
              <button className="btn btn-primary" onClick={next}>Continue <Ic.arr/></button>
            ) : (
              <button className="btn btn-primary" onClick={finish}>Enter the lab <Ic.arr/></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen });
