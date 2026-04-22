const { useState: dS, useEffect: dE, useMemo: dM } = React;

function Dashboard({ personas, matches, goTo, openMatch, openPersona }) {
  const topMatches = dM(() => [...matches].sort((a,b)=>b.score-a.score).slice(0,6), [matches]);
  const avgScore = dM(() => Math.round(matches.reduce((s,m)=>s+m.score,0)/matches.length), [matches]);

  return (
    <div className="page">
      <div className="dash-hero">
        <h1>Welcome back, Krishna</h1>
        <p>You currently have <b style={{color:'var(--text)'}}>{personas.length} active personas</b> and <b style={{color:'var(--text)'}}>{matches.length} new compatibility matches</b> waiting. Two of your selves drifted this week.</p>
        <div className="hero-actions">
          <button className="btn btn-ghost" onClick={()=>goTo('drift')}><Ic.clock/> See drift</button>
          <button className="btn btn-primary" onClick={()=>goTo('personas-new')}><Ic.plus/> New persona</button>
        </div>
      </div>

      <div className="stat-row">
        <StatCard label="Personas created" value={personas.length} delta="+1 this month"/>
        <StatCard label="Top match score" value={`${Math.max(...matches.map(m=>m.score))}%`} delta="+6 vs last week"/>
        <StatCard label="AI reports generated" value="128" delta="+18"/>
        <StatCard label="Drift events" value="5" delta="2 new" accent/>
      </div>

      <div className="dash-split">
        <div>
          <div className="section-head">
            <h3>Your personas</h3>
            <div className="row" style={{gap:8}}>
              <span className="hint">Avg compatibility · <b style={{color:'var(--text)'}}>{avgScore}%</b></span>
              <button className="btn btn-ghost btn-sm" onClick={()=>goTo('personas')}>View all <Ic.arrR/></button>
            </div>
          </div>
          <div className="persona-grid">
            {personas.map(p => (
              <div key={p.id} className="persona-card" onClick={()=>openPersona(p.id)}>
                <div className="ghost-ring"/>
                <PersonaOrb initial={p.initial} hue={p.hue} size={54}/>
                <h4>{p.name}</h4>
                <div className="meta">Mood: {p.mood} · Goal: {p.goal}</div>
                <div className="traits">
                  {p.traits.slice(0,3).map(t => <span key={t} className="chip">{t}</span>)}
                  {p.traits.length>3 && <span className="chip">+{p.traits.length-3}</span>}
                </div>
                <div className="score-row">
                  <div className="score-n">{p.scoreAvg}<small>% avg match</small></div>
                  <div className="actions">
                    <button className="btn btn-sm btn-ghost" onClick={(e)=>{e.stopPropagation(); openPersona(p.id);}}><Ic.edit/></button>
                    <button className="btn btn-sm btn-primary" onClick={(e)=>{e.stopPropagation(); goTo('matches');}}>Match</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-head">
            <h3>Top matches</h3>
            <button className="btn btn-ghost btn-sm" onClick={()=>goTo('matches')}>All matches <Ic.arrR/></button>
          </div>
          <div className="match-feed">
            {topMatches.map(m => {
              const pa = window.findPersona(m.a), pb = window.findOther(m.b);
              return (
                <div key={m.id} className="match-row" onClick={()=>openMatch(m.id)}>
                  <div className="pair">
                    <PersonaOrb initial={pa.initial} hue={pa.hue} size={34}/>
                    <div style={{width:34, height:34, borderRadius:'50%', marginLeft:-10, border:'2px solid var(--card)', background:`linear-gradient(135deg, hsl(${pb.hue} 80% 65%), hsl(${(pb.hue+60)%360} 80% 65%))`, display:'grid', placeItems:'center', color:'white', fontWeight:600, fontSize:12}}>{pb.initial}</div>
                  </div>
                  <div className="names">
                    <b>{pa.name} ↔ {pb.name}</b>
                    <div>Shared: {m.shared.join(' · ')}</div>
                  </div>
                  <div className="score">{m.score}%</div>
                </div>
              );
            })}
          </div>

          <div className="section-head" style={{marginTop:24}}>
            <h3>Neural snapshot</h3>
            <span className="hint">Live</span>
          </div>
          <div className="card" style={{padding:16}}>
            <MiniGraph personas={personas}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, accent }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className="value" style={{color: accent ? 'var(--accent)' : undefined}}>{value}</div>
      <div className="delta">▲ {delta}</div>
      <svg className="spark" width="100" height="40" viewBox="0 0 100 40">
        <path d="M0 30 Q 20 20 30 22 T 55 15 T 80 10 T 100 5" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.6"/>
      </svg>
    </div>
  );
}

function MiniGraph({ personas }) {
  // simple decorative graph — nodes on a circle + pulsing edges
  const N = personas.length;
  const R = 70, cx = 130, cy = 90;
  const pts = personas.map((p,i) => {
    const a = (i/N) * Math.PI * 2 - Math.PI/2;
    return { ...p, x: cx + R*Math.cos(a), y: cy + R*Math.sin(a) };
  });
  return (
    <svg width="100%" height="180" viewBox="0 0 260 180">
      {pts.map((a,i) => pts.slice(i+1).map((b,j) => (
        <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="var(--accent)" strokeOpacity="0.25" strokeWidth="1">
          <animate attributeName="stroke-opacity" values="0.1;0.5;0.1" dur={`${3+i+j}s`} repeatCount="indefinite"/>
        </line>
      )))}
      {pts.map((p,i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="14" fill={`hsl(${p.hue} 80% 65%)`} opacity="0.2"/>
          <circle cx={p.x} cy={p.y} r="7" fill={`hsl(${p.hue} 80% 65%)`}/>
          <text x={p.x} y={p.y+22} textAnchor="middle" fontSize="9" fill="var(--text-dim)" fontFamily="JetBrains Mono, monospace">{p.initial}</text>
        </g>
      ))}
    </svg>
  );
}

Object.assign(window, { Dashboard });
