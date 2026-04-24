const { useState: AS, useEffect: AE, useMemo: AM } = React;

function Navbar({ route, goTo, theme, toggleTheme }) {
  const links = [
    { id:'dashboard', label:'Dashboard', ic:<Ic.home/> },
    { id:'personas',  label:'Personas',  ic:<Ic.user/> },
    { id:'matches',   label:'Matches',   ic:<Ic.heart/> },
    { id:'graph',     label:'Graph',     ic:<Ic.graph/> },
    { id:'drift',     label:'Drift',     ic:<Ic.clock/> },
  ];
  return (
    <div className="navbar">
      <div className="nav-inner">
        <div className="logo" onClick={()=>goTo('dashboard')} style={{cursor:'pointer'}}>
          <div className="logo-mark"/>
          <div>
            Parallel Selves
            <small>identity lab</small>
          </div>
        </div>
        <div className="nav-links">
          {links.map(l => (
            <a key={l.id} className={route.startsWith(l.id)?'active':''} onClick={()=>goTo(l.id)}>
              {l.ic} {l.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <button className="icon-btn" title="Search"><Ic.search/></button>
          <button className="icon-btn" title="Notifications"><Ic.bell/><span className="dot"/></button>
          <button className="icon-btn" title="Toggle theme" onClick={toggleTheme}>
            {theme==='dark' ? <Ic.sun/> : <Ic.moon/>}
          </button>
          <div className="avatar-chip">
            <div className="avatar">K</div>
            <div>
              <div style={{fontSize:12.5, fontWeight:600}}>Krishna K.</div>
              <small style={{fontSize:10.5}}>Free plan</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = AS(() => localStorage.getItem('ps-route') || 'login');
  const [personas, setPersonas] = AS(window.SEED_PERSONAS);
  const [others] = AS(window.SEED_OTHERS);
  const [matches, setMatches] = AS(window.SEED_MATCHES);
  const [drift] = AS(window.SEED_DRIFT);
  const [editingId, setEditingId] = AS(null);
  const [reportMatchId, setReportMatchId] = AS(null);
  const [tweaks, setTweaks] = AS(window.TWEAKS);
  const [tweaksVisible, setTweaksVisible] = AS(false);

  // Persist route
  AE(() => { localStorage.setItem('ps-route', route); }, [route]);

  // Apply theme + accent
  AE(() => {
    document.body.classList.toggle('light', tweaks.theme === 'light');
    ['violet','cyan','rose','lime'].forEach(a => {
      document.body.classList.toggle(`accent-${a}`, tweaks.accent === a);
    });
  }, [tweaks.theme, tweaks.accent]);

  // Tweaks panel wiring
  AE(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksVisible(true);
      else if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(e){}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const goTo = (r) => { setEditingId(null); setRoute(r); };

  const openPersona = (id) => { setEditingId(id); setRoute('persona-edit'); };
  const openMatch   = (id) => setReportMatchId(id);

  const savePersona = (p) => {
    setPersonas(list => {
      const exists = list.find(x => x.id === p.id);
      if (exists) return list.map(x => x.id === p.id ? p : x);
      return [...list, p];
    });
    setRoute('personas');
    setEditingId(null);
  };
  const deletePersona = (id) => {
    setPersonas(list => list.filter(x => x.id !== id));
    setMatches(list => list.filter(m => m.a !== id));
    setRoute('personas');
    setEditingId(null);
  };

  const currentPersona = personas.find(p => p.id === editingId);

  const loggedIn = route !== 'login' && route !== 'register';

  return (
    <window.ToastProvider>
      {loggedIn && <>
        <div className="atmo" style={{position:'fixed'}}>
          <div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>
        </div>
        <div className="grid-bg"/>
      </>}
      <div className="app">
        {loggedIn && <Navbar route={route} goTo={goTo} theme={tweaks.theme} toggleTheme={()=>setTweaks(t=>({...t, theme: t.theme==='dark'?'light':'dark'}))}/>}

        {route === 'login' && <window.LoginScreen onLogin={()=>setRoute('dashboard')} goRegister={()=>setRoute('register')}/>}
        {route === 'register' && <window.RegisterScreen onDone={()=>setRoute('dashboard')} goLogin={()=>setRoute('login')}/>}

        {route === 'dashboard' && <window.Dashboard personas={personas} matches={matches} goTo={goTo} openMatch={openMatch} openPersona={openPersona}/>}
        {route === 'personas' && <window.PersonasPage personas={personas} goTo={goTo} openPersona={openPersona}/>}
        {route === 'personas-new' && <window.PersonaEditor isNew onSave={savePersona} onCancel={()=>setRoute('personas')}/>}
        {route === 'persona-edit' && currentPersona && <window.PersonaEditor persona={currentPersona} onSave={savePersona} onCancel={()=>setRoute('personas')} onDelete={deletePersona}/>}
        {route === 'matches' && <window.MatchesPage matches={matches} personas={personas} openMatch={openMatch} swipeMode={tweaks.swipeMatchMode}/>}
        {route === 'graph' && <window.GraphPage personas={personas} others={others} matches={matches} openMatch={openMatch} pulse={tweaks.graphPulse}/>}
        {route === 'drift' && <window.DriftPage drift={drift} personas={personas}/>}

        {reportMatchId && <window.AIReportDrawer match={matches.find(m=>m.id===reportMatchId)} onClose={()=>setReportMatchId(null)}/>}
        {tweaksVisible && <window.TweaksPanel state={tweaks} setState={setTweaks}/>}
      </div>
    </window.ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
