const { useState: pS, useMemo: pM } = React;

function PersonasPage({ personas, goTo, openPersona, onCreate }) {
  const [q, setQ] = pS('');
  const [moodFilter, setMoodFilter] = pS('All');
  const filtered = pM(() => {
    return personas.filter(p => {
      if (moodFilter !== 'All' && p.mood !== moodFilter) return false;
      if (q && !`${p.name} ${p.traits.join(' ')} ${p.goal}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [personas, q, moodFilter]);

  const moods = ['All', ...Array.from(new Set(personas.map(p=>p.mood)))];

  return (
    <div className="page">
      <div className="row between" style={{marginBottom: 24, alignItems:'flex-end'}}>
        <div>
          <h1>Your personas</h1>
          <div className="sub">Design, edit, and watch each self evolve.</div>
        </div>
        <button className="btn btn-primary" onClick={()=>goTo('personas-new')}><Ic.plus/> New persona</button>
      </div>

      <div className="row" style={{gap:10, marginBottom:20, flexWrap:'wrap'}}>
        <div className="row" style={{gap:8, padding:'8px 14px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--pill)', minWidth: 280}}>
          <Ic.search c="muted"/>
          <input style={{background:'transparent', border:'none', outline:'none', flex:1, fontSize:13.5}} placeholder="Search name, trait, goal…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div className="row" style={{gap:6}}>
          {moods.map(m => (
            <button key={m} className={`chip ${moodFilter===m?'accent':''}`} onClick={()=>setMoodFilter(m)} style={{cursor:'pointer', padding: '6px 12px'}}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {filtered.map(p => (
          <div key={p.id} className="persona-card" onClick={()=>openPersona(p.id)}>
            <div className="ghost-ring"/>
            <PersonaOrb initial={p.initial} hue={p.hue} size={64}/>
            <h4>{p.name}</h4>
            <div className="meta">Mood: {p.mood} · Goal: {p.goal}</div>
            <div className="traits">
              {p.traits.map(t => <span key={t} className="chip">{t}</span>)}
            </div>
            <p className="muted" style={{fontSize:13, margin:'4px 0 14px', lineHeight: 1.5}}>{p.bio}</p>
            <div className="score-row">
              <div className="score-n">{p.scoreAvg}<small>% avg match</small></div>
              <div className="actions">
                <button className="btn btn-sm btn-ghost" onClick={(e)=>{e.stopPropagation(); openPersona(p.id);}}><Ic.edit/></button>
                <button className="btn btn-sm btn-ghost" onClick={(e)=>{e.stopPropagation(); goTo('drift');}}><Ic.clock/></button>
                <button className="btn btn-sm btn-primary" onClick={(e)=>{e.stopPropagation(); goTo('matches');}}>Match</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card" style={{gridColumn:'1/-1', textAlign:'center', padding:40}}>
            <div className="muted">No personas match that filter.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonaEditor({ persona, onSave, onCancel, onDelete, isNew }) {
  const [draft, setDraft] = pS(persona ? {...persona, traits: [...persona.traits], interests: [...persona.interests]} : {
    id: 'new', name: '', initial: '?', mood: 'Curious', goal: 'Friendship',
    traits: [], interests: [], bio: '', scoreAvg: 0, hue: 265,
    dims: { Openness: 50, Energy: 50, Structure: 50, Empathy: 50, Risk: 50 }
  });
  const toast = window.useToast();
  const [interestInput, setInterestInput] = pS('');

  const toggleTrait = (t) => {
    setDraft(d => ({
      ...d,
      traits: d.traits.includes(t) ? d.traits.filter(x=>x!==t) : [...d.traits, t]
    }));
  };
  const addInterest = (e) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      setDraft(d => ({...d, interests: [...d.interests, interestInput.trim()]}));
      setInterestInput('');
      e.preventDefault();
    }
  };
  const removeInterest = (i) => setDraft(d => ({...d, interests: d.interests.filter(x=>x!==i)}));

  const setName = (v) => setDraft(d => ({...d, name: v, initial: v[0]?.toUpperCase() || '?'}));

  const save = () => {
    if (!draft.name.trim()) { toast('Give your persona a name first', 'error'); return; }
    const saved = { ...draft, id: isNew ? 'p'+Date.now() : draft.id, scoreAvg: draft.scoreAvg || 72 };
    onSave(saved);
    toast(isNew ? 'Persona created ✔' : 'Persona updated ✔', 'success');
  };

  return (
    <div className="page">
      <div className="row between" style={{marginBottom: 24, alignItems:'flex-end'}}>
        <div>
          <h1>{isNew ? 'Create a new self' : `Editing ${persona?.name}`}</h1>
          <div className="sub">Shape this persona's voice, mood, and goals. The preview updates as you type.</div>
        </div>
        <div className="row" style={{gap:8}}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          {!isNew && <button className="btn btn-ghost" onClick={()=>{ onDelete(draft.id); toast('Persona deleted', 'info'); }}><Ic.trash/> Delete</button>}
          <button className="btn btn-primary" onClick={save}><Ic.save/> {isNew ? 'Create persona' : 'Save changes'}</button>
        </div>
      </div>

      <div className="editor">
        <div className="pane">
          <div className="field">
            <label>Persona name</label>
            <input value={draft.name} onChange={e=>setName(e.target.value)} placeholder="e.g. The Wanderer"/>
          </div>

          <div className="field">
            <label>Goal</label>
            <select value={draft.goal} onChange={e=>setDraft(d=>({...d, goal:e.target.value}))}>
              {window.GOALS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Mood</label>
            <div className="mood-grid">
              {window.MOODS.map(m => (
                <div key={m.key} className={`mood-tile ${draft.mood===m.key?'on':''}`}
                     onClick={()=>setDraft(d=>({...d, mood:m.key}))}>
                  <div className="em">{m.em}</div>
                  <div className="lb">{m.key}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Traits · tap to toggle</label>
            <div className="trait-picker">
              {window.TRAIT_LIBRARY.map(t => (
                <div key={t} className={`pill ${draft.traits.includes(t)?'on':''}`} onClick={()=>toggleTrait(t)}>
                  {draft.traits.includes(t) && '✓ '}{t}
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Interests · press Enter to add</label>
            <input placeholder="Photography, Stoic philosophy…" value={interestInput}
                   onChange={e=>setInterestInput(e.target.value)} onKeyDown={addInterest}/>
            <div className="row" style={{gap:6, flexWrap:'wrap', marginTop:8}}>
              {draft.interests.map(i => (
                <span key={i} className="chip" style={{cursor:'pointer'}} onClick={()=>removeInterest(i)}>
                  {i} <Ic.x/>
                </span>
              ))}
              {draft.interests.length===0 && <span className="muted" style={{fontSize:12}}>No interests yet.</span>}
            </div>
          </div>

          <div className="field">
            <label>Bio (optional)</label>
            <textarea rows="3" value={draft.bio} onChange={e=>setDraft(d=>({...d, bio:e.target.value}))}
                      placeholder="One or two lines — how does this self show up?"/>
          </div>

          <div className="field">
            <label>Accent hue</label>
            <input type="range" min="0" max="360" value={draft.hue} onChange={e=>setDraft(d=>({...d, hue: +e.target.value}))}
                   style={{accentColor: `hsl(${draft.hue} 80% 65%)`}}/>
            <span className="hint">Visual signature color for this self.</span>
          </div>
        </div>

        <div className="preview-card">
          <div className="preview-tag">LIVE PREVIEW</div>
          <div className="preview-hero">
            <PersonaOrb initial={draft.initial} hue={draft.hue} size={80}/>
            <div>
              <div className="nm">{draft.name || 'Unnamed self'}</div>
              <div className="gl">Mood: {draft.mood} · Goal: {draft.goal}</div>
            </div>
          </div>

          <div className="row" style={{gap:6, flexWrap:'wrap', marginBottom:16}}>
            {draft.traits.length === 0 && <span className="muted" style={{fontSize:13}}>Add some traits to shape this self.</span>}
            {draft.traits.map(t => <span key={t} className="chip accent">{t}</span>)}
          </div>

          <p className="muted" style={{fontSize:13.5, lineHeight:1.55, minHeight:42}}>
            {draft.bio || 'A bio will give this persona a voice — how do they show up, what do they notice, what do they avoid?'}
          </p>

          <div className="divider"/>

          <div style={{fontSize:11, color:'var(--text-dim)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:600, marginBottom:8}}>Psychographic profile</div>
          <div className="meter">
            {Object.entries(draft.dims).map(([k,v]) => (
              <div key={k} className="row" style={{display:'grid', gridTemplateColumns:'100px 1fr 36px', alignItems:'center', gap:10}}>
                <span style={{fontSize:12, color:'var(--text-dim)'}}>{k}</span>
                <div className="bar"><div style={{width: `${v}%`}}/></div>
                <b style={{fontFamily:'JetBrains Mono, monospace', fontSize:11.5, color:'var(--text-dim)', textAlign:'right'}}>{v}</b>
              </div>
            ))}
          </div>

          <div className="divider"/>
          <div className="row between">
            <span className="muted" style={{fontSize:12}}>Projected match score</span>
            <ScoreMeter value={Math.round((Object.values(draft.dims).reduce((s,v)=>s+v,0))/5)} size={64}/>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PersonasPage, PersonaEditor });
