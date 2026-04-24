const { useState: mS, useMemo: mM, useEffect: mE } = React;

function MatchesPage({ matches, personas, openMatch, swipeMode, goTo }) {
  const [selected, setSelected] = mS(matches[0]?.id);
  const sorted = mM(() => [...matches].sort((a,b)=>b.score-a.score), [matches]);
  const active = mM(() => matches.find(m => m.id === selected) || matches[0], [matches, selected]);

  const pa = active && window.findPersona(active.a);
  const pb = active && window.findOther(active.b);
  
  const toast = window.useToast();

  const [report, setReport] = mS(null);
  const [loading, setLoading] = mS(false);

  mE(() => {
    if (!active || !pa || !pb) return;
    setLoading(true);
    setReport(null);

    fetch('http://localhost:3001/api/ai/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: active.id,
        personaA: pa,
        personaB: pb,
        shared: active.shared
      })
    })
    .then(r => r.json())
    .then(data => {
      setReport(data.report);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setReport(`Because you both value ${active.shared[0]?.toLowerCase() || 'connection'} and have a similar approach to your interactions. ${pa.name} brings an adventurous energy, which perfectly complements ${pb.name}'s nature.`);
      setLoading(false);
    });
  }, [active?.id]);

  const handleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('saved_matches') || '[]');
      if (!saved.includes(active.id)) {
        saved.push(active.id);
        localStorage.setItem('saved_matches', JSON.stringify(saved));
      }
      toast('Saved successfully', 'success');
    } catch (e) {
      toast('Error saving match', 'error');
    }
  };

  const handleShare = () => {
    const text = `Check out this match between ${pa.name} and ${pb.name} on SideMatch!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        toast('Link copied', 'success');
      });
    } else {
      toast('Link copied', 'success');
    }
  };

  return (
    <div className="page">
      <div className="row between" style={{marginBottom: 20, alignItems:'flex-end'}}>
        <div>
          <h1>Your Matches</h1>
          <div className="sub">{matches.length} candidates · ranked by compatibility.</div>
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
                <div className="sub">{m.shared.join(' · ')}</div>
                <button className="btn btn-ghost btn-sm" style={{marginTop: 8, width: '100%'}}>View Why</button>
              </div>
            );
          })}
        </div>

        {active && (
          <div className="match-detail">
            <div className="row between" style={{marginBottom: 20}}>
              <div>
                <div style={{fontSize:11, color:'var(--text-dim)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600}}>Why you match</div>
                <div style={{fontFamily:'Fraunces, serif', fontSize:26, fontWeight:500, letterSpacing:'-0.02em', marginTop:2}}>
                  {pa.name} <span style={{color:'var(--text-dim)'}}>↔</span> {pb.name}
                </div>
              </div>
              <div className="row" style={{gap:8}}>
                <button className="btn btn-primary btn-sm" onClick={() => goTo('chat-' + active.id)}>Connect</button>
                <button className="btn btn-ghost btn-sm" onClick={handleSave}><Ic.save/> Save</button>
                <button className="btn btn-ghost btn-sm" onClick={handleShare}><Ic.share/> Share</button>
              </div>
            </div>

            <div className="match-grid" style={{gridTemplateColumns: '1fr'}}>
              <div className="match-block">
                <h5>The Connection</h5>
                {loading ? (
                  <div style={{marginTop: 10}}>
                    <window.Skel w="100%" h={14} style={{marginBottom: 6}} />
                    <window.Skel w="90%" h={14} style={{marginBottom: 6}} />
                    <window.Skel w="80%" h={14} />
                  </div>
                ) : (
                  <p style={{fontSize: 16, lineHeight: 1.6}}>
                    {report}
                  </p>
                )}
                <div className="shared" style={{marginTop: 16}}>
                  {active.shared.map(s => <span key={s} className="chip accent">{s}</span>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { MatchesPage });
