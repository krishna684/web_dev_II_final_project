const { useState: drS, useMemo: drM } = React;

function DriftPage({ drift, personas }) {
  const [filter, setFilter] = drS('all');
  const [compare, setCompare] = drS(false);

  const events = drM(() => drift.filter(d => filter==='all' || d.persona===filter), [drift, filter]);

  return (
    <div className="page">
      <div className="row between" style={{marginBottom: 24, alignItems:'flex-end'}}>
        <div>
          <h1>Persona drift</h1>
          <div className="sub">Every small shift across your selves, over time. A living record of who you're becoming.</div>
        </div>
        <button className="btn btn-ghost" onClick={()=>setCompare(c=>!c)}>
          <Ic.wave/> {compare ? 'Hide compare' : 'Compare versions'}
        </button>
      </div>

      <div className="row" style={{gap:6, marginBottom: 24, flexWrap:'wrap'}}>
        <span className={`chip ${filter==='all'?'accent':''}`} onClick={()=>setFilter('all')} style={{cursor:'pointer', padding:'6px 12px'}}>All selves</span>
        {personas.map(p => (
          <span key={p.id} className={`chip ${filter===p.id?'accent':''}`} onClick={()=>setFilter(p.id)} style={{cursor:'pointer', padding:'6px 12px'}}>
            {p.name}
          </span>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns: compare ? '1fr 1fr' : '1fr', gap: 28}}>
        <div>
          <div className="timeline-head">
            <h3 style={{margin:0, fontSize:16}}>Activity · past 30 days</h3>
            <span className="muted" style={{fontSize:12}}>{events.length} changes</span>
          </div>
          <div className="card" style={{padding:24}}>
            <div className="timeline">
              {events.map(d => {
                const persona = window.findPersona(d.persona);
                return (
                  <div key={d.id} className="entry">
                    <div className={`dot ${d.type}`}/>
                    <div className="date">{d.date} · {persona?.name}</div>
                    <h4>{d.title}</h4>
                    <p>{d.note}</p>
                  </div>
                );
              })}
              {events.length === 0 && <div className="muted" style={{fontSize:13}}>No drift detected for this persona yet.</div>}
            </div>
          </div>
        </div>

        {compare && (
          <div>
            <div className="timeline-head">
              <h3 style={{margin:0, fontSize:16}}>Compare</h3>
              <span className="muted" style={{fontSize:12}}>Mar 24 → Apr 18</span>
            </div>
            <div className="compare-shell">
              <div className="compare-col">
                <h6>Mar 24, 2026</h6>
                <div style={{fontWeight:600, fontSize:14, marginBottom:10}}>The Wanderer · v1</div>
                <div className="diff-line same">Mood: Restless</div>
                <div className="diff-line same">Goal: Travel Buddy</div>
                <div className="diff-line rm">· Night Owl</div>
                <div className="diff-line same">· Open-minded</div>
                <div className="diff-line same">· Social</div>
                <div className="diff-line same">· Adventurous</div>
              </div>
              <div className="compare-col">
                <h6>Apr 18, 2026</h6>
                <div style={{fontWeight:600, fontSize:14, marginBottom:10}}>The Wanderer · v7</div>
                <div className="diff-line add">Mood: Curious</div>
                <div className="diff-line same">Goal: Travel Buddy</div>
                <div className="diff-line add">· Spontaneous</div>
                <div className="diff-line same">· Open-minded</div>
                <div className="diff-line same">· Social</div>
                <div className="diff-line same">· Adventurous</div>
              </div>
            </div>
            <div className="card" style={{marginTop:16, padding:18}}>
              <div style={{fontSize:11, color:'var(--accent)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, marginBottom:8}}>AI drift summary</div>
              <p className="muted" style={{margin:0, lineHeight:1.55, fontSize:13.5}}>
                Over 25 days, The Wanderer shed the restlessness signal and picked up a sharper curiosity. Match scores with Maya L. (+6) and Kenji T. (+4) responded to the shift. No regression risk detected.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { DriftPage });
