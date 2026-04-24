const { useState: mS, useMemo: mM, useEffect: mE } = React;

function MatchesPage({ matches, personas, openMatch, swipeMode }) {
  const [selected, setSelected] = mS(matches[0]?.id);
  const sorted = mM(() => [...matches].sort((a,b)=>b.score-a.score), [matches]);
  const active = mM(() => matches.find(m => m.id === selected) || matches[0], [matches, selected]);

  if (swipeMode) return <SwipeMatches matches={sorted} openMatch={openMatch}/>;

  const pa = active && window.findPersona(active.a);
  const pb = active && window.findOther(active.b);

  return (
    <div className="page">
      <div className="row between" style={{marginBottom: 20, alignItems:'flex-end'}}>
        <div>
          <h1>Match dashboard</h1>
          <div className="sub">{matches.length} candidates · ranked by compatibility.</div>
        </div>
        <div className="row" style={{gap:8}}>
          <button className="btn btn-ghost"><Ic.filter/> Filter</button>
          <button className="btn btn-primary"><Ic.refresh/> Re-run AI</button>
        </div>
      </div>

      <div className="matches-shell">
        <div className="match-list">
          {sorted.map(m => {
            const a = window.findPersona(m.a), b = window.findOther(m.b);
            return (
              <div key={m.id} className={`match-item ${selected===m.id?'active':''}`} onClick={()=>setSelected(m.id)}>
                <div className="top">
                  <b>{a.name} ↔ {b.name}</b>
                  <div className="sc">{m.score}%</div>
                </div>
                <div className="sub">{m.shared.join(' · ')} · {m.delta}</div>
              </div>
            );
          })}
        </div>

        {active && (
          <div className="match-detail">
            <div className="row between" style={{marginBottom: 6}}>
              <div>
                <div style={{fontSize:11, color:'var(--text-dim)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600}}>Compatibility</div>
                <div style={{fontFamily:'Fraunces, serif', fontSize:26, fontWeight:500, letterSpacing:'-0.02em', marginTop:2}}>
                  {pa.name} <span style={{color:'var(--text-dim)'}}>↔</span> {pb.name}
                </div>
              </div>
              <div className="row" style={{gap:8}}>
                <button className="btn btn-ghost btn-sm"><Ic.save/> Save</button>
                <button className="btn btn-ghost btn-sm"><Ic.share/> Share</button>
                <button className="btn btn-primary btn-sm" onClick={()=>openMatch(active.id)}>Open AI report <Ic.arr/></button>
              </div>
            </div>

            <div className="match-viz">
              <div className="node n1" style={{background:`linear-gradient(135deg, hsl(${pa.hue} 80% 65%), hsl(${(pa.hue+60)%360} 80% 65%))`}}>{pa.initial}</div>
              <div className="edge"/>
              <div className="match-score-hero">
                <small>Compatibility</small>
                <b>{active.score}%</b>
              </div>
              <div className="node n2" style={{background:`linear-gradient(135deg, hsl(${pb.hue} 80% 65%), hsl(${(pb.hue+60)%360} 80% 65%))`}}>{pb.initial}</div>
            </div>

            <div className="match-grid">
              <div className="match-block">
                <h5>Shared ground</h5>
                <div className="shared">
                  {active.shared.map(s => <span key={s} className="chip accent">{s}</span>)}
                </div>
              </div>
              <div className="match-block">
                <h5>Trend</h5>
                <p>Score is <b style={{color:'var(--success)'}}>{active.delta}</b> · momentum is building in shared interests.</p>
              </div>
              <div className="match-block">
                <h5>Strong synergy</h5>
                <p>Both lean high on <b>openness</b> and carry a shared fascination with {active.shared[0]?.toLowerCase()}. Conversations accelerate quickly.</p>
              </div>
              <div className="match-block">
                <h5>Potential friction</h5>
                <p>{pa.name} trends spontaneous; {pb.name} prefers structure. Expect negotiation around planning.</p>
              </div>
              <div className="match-block" style={{gridColumn:'1/-1'}}>
                <h5>Recommended dynamic</h5>
                <p>Low-stakes collaboration — travel partner, creative sprint, or a recurring conversation ritual. Avoid formal long-term commitments before the 3rd session.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Tinder-style swipe mode --- */
function SwipeMatches({ matches, openMatch }) {
  const [idx, setIdx] = mS(0);
  const [dir, setDir] = mS(null);
  const toast = window.useToast();
  const m = matches[idx];
  if (!m) return <div className="page"><div className="card" style={{textAlign:'center', padding:40}}>That's everyone for now. Check back tomorrow.</div></div>;
  const pa = window.findPersona(m.a), pb = window.findOther(m.b);

  const decide = (d) => {
    setDir(d);
    setTimeout(() => {
      toast(d==='yes' ? `Liked ${pb.name} — AI introducing.` : d==='star' ? 'Saved ★' : 'Passed', d==='yes' ? 'success' : 'info');
      setDir(null);
      setIdx(i => i+1);
    }, 350);
  };

  return (
    <div className="page">
      <div style={{textAlign:'center', marginBottom: 20}}>
        <h1>Swipe mode</h1>
        <div className="sub">One decision at a time · {matches.length - idx} remaining</div>
      </div>
      <div className="swipe-stack">
        {[matches[idx+1], m].filter(Boolean).map((c, i, arr) => {
          const isTop = i === arr.length - 1;
          const cp = window.findPersona(c.a), co = window.findOther(c.b);
          const transform = isTop && dir
            ? dir==='yes' ? 'translateX(120%) rotate(18deg)'
            : dir==='no' ? 'translateX(-120%) rotate(-18deg)'
            : 'translateY(-120%) scale(0.9)'
            : isTop ? 'scale(1)' : 'scale(0.95) translateY(10px)';
          return (
            <div key={c.id+i} className="swipe-card" style={{transform, opacity: isTop && dir ? 0 : 1, zIndex: isTop ? 2 : 1}}>
              <div>
                <div className="row between">
                  <span className="chip accent">{cp.name}</span>
                  <span className="chip">{c.score}% compatible</span>
                </div>
                <div className="big-orb" data-initial={co.initial} style={{background: `conic-gradient(from 0deg, hsl(${co.hue} 80% 65%), hsl(${(co.hue+90)%360} 80% 65%), hsl(${(co.hue+180)%360} 80% 65%))`}}/>
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:'Fraunces, serif', fontSize:26, letterSpacing:'-0.02em', fontWeight:500}}>{co.name}</div>
                  <div className="muted" style={{fontSize:13, margin:'6px 0 14px'}}>Shared: {c.shared.join(' · ')}</div>
                  <div className="row" style={{gap:6, justifyContent:'center', flexWrap:'wrap'}}>
                    {co.traits.map(t => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="muted" style={{fontSize:12, textAlign:'center'}}>
                Matched with <b style={{color:'var(--text)'}}>{cp.name}</b>
              </div>
            </div>
          );
        })}
      </div>
      <div className="swipe-controls">
        <button className="ctrl no" onClick={()=>decide('no')}><Ic.x c="ico-lg"/></button>
        <button className="ctrl star" onClick={()=>decide('star')}><Ic.star c="ico-lg"/></button>
        <button className="ctrl yes" onClick={()=>decide('yes')}><Ic.heart c="ico-lg"/></button>
      </div>
    </div>
  );
}

function AIReportDrawer({ match, onClose }) {
  if (!match) return null;
  const pa = window.findPersona(match.a), pb = window.findOther(match.b);
  const toast = window.useToast();
  return (
    <>
      <div className="drawer-mask" onClick={onClose}/>
      <div className="drawer">
        <button className="close" onClick={onClose}><Ic.x/></button>
        <div style={{fontSize:11, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom: 6}}>AI Compatibility Report</div>
        <h3>{pa.name} + {pb.name}</h3>
        <div className="drawer-sub">Generated 12 minutes ago · Model: parallel-v4</div>

        <div className="report-bar">
          <b>{match.score}%</b>
          <div>
            <div style={{fontWeight:600, fontSize:14}}>Strong fit</div>
            <span>Top 8% of matches for this persona</span>
          </div>
        </div>

        <div className="report-section">
          <h6>Core synergy</h6>
          <p>Strong synergy through <b>curiosity and spontaneity</b>. Both personas index high on openness and treat novelty as a shared language. Initial conversations are likely to compound quickly — within 2–3 sessions you'll find yourselves in unexpected territory.</p>
        </div>

        <div className="report-section">
          <h6>Potential friction</h6>
          <p>Tension between <b>need for structure vs freedom</b>. {pb.name} plans; {pa.name} improvises. Unchecked, this becomes a recurring negotiation. Named early, it becomes an asset.</p>
        </div>

        <div className="report-section">
          <h6>Recommended dynamic</h6>
          <p>Travel collaborators or a casual, low-stakes creative relationship. Avoid high-commitment formalizations before the 5th interaction. Set a shared goal per meeting to channel the openness.</p>
        </div>

        <div className="report-section">
          <h6>Talk starters</h6>
          <p style={{paddingLeft:14, borderLeft:'2px solid var(--accent)'}}>"What's the last place that changed you?"</p>
          <p style={{paddingLeft:14, borderLeft:'2px solid var(--accent)', marginTop:8}}>"Which version of you are you bringing today?"</p>
        </div>

        <div className="row" style={{gap:8, marginTop: 24}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={()=>toast('Saved to library', 'success')}><Ic.save/> Save</button>
          <button className="btn btn-ghost" style={{flex:1}} onClick={()=>toast('Link copied', 'info')}><Ic.share/> Share</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={()=>toast('Re-running analysis…', 'info')}><Ic.refresh/> Re-run</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { MatchesPage, AIReportDrawer });
