const { useState: AS, useEffect: AE, useMemo: AM } = React;


function App() {
  const [route, setRoute] = AS(() => {
    const r = localStorage.getItem('ps-route') || 'login';
    const isAuth = !!localStorage.getItem('auth_token');
    if (!isAuth && r !== 'register') return 'login';
    return r;
  });
  const [personas, setPersonas] = AS(window.SEED_PERSONAS);
  const [others] = AS(window.SEED_OTHERS);
  const [matches, setMatches] = AS(window.SEED_MATCHES);
  const [drift] = AS(window.SEED_DRIFT);
  const [editingId, setEditingId] = AS(null);
  const [reportMatchId, setReportMatchId] = AS(null);
  const [tweaks, setTweaks] = AS(window.TWEAKS);
  const [tweaksVisible, setTweaksVisible] = AS(false);

  // Expose openPersona for the search bar
  window.openPersona = (id) => { setEditingId(id); setRoute('persona-edit'); };

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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setRoute('login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      localStorage.clear();
      setRoute('register');
    }
  };

  const loggedIn = route !== 'login' && route !== 'register' && !!localStorage.getItem('auth_token');

  return (
    <window.ToastProvider>
      {loggedIn && <>
        <div className="atmo" style={{position:'fixed'}}>
          <div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>
        </div>
        <div className="grid-bg"/>
      </>}
      <div className="app">
        {loggedIn && <window.Navbar route={route} goTo={goTo} theme={tweaks.theme} toggleTheme={()=>setTweaks(t=>({...t, theme: t.theme==='dark'?'light':'dark'}))} personas={personas} matches={matches} handleLogout={handleLogout} handleDeleteAccount={handleDeleteAccount}/>}

        {route === 'login' && <window.LoginScreen onLogin={()=>setRoute('dashboard')} goRegister={()=>setRoute('register')}/>}
        {route === 'register' && <window.RegisterScreen onDone={()=>setRoute('dashboard')} goLogin={()=>setRoute('login')}/>}

        {route === 'dashboard' && <window.Dashboard personas={personas} matches={matches} goTo={goTo} openMatch={openMatch} openPersona={openPersona}/>}
        {route === 'personas' && <window.PersonasPage personas={personas} goTo={goTo} openPersona={openPersona}/>}
        {route === 'personas-new' && <window.PersonaEditor persona={null} onSave={savePersona} onCancel={() => setRoute('personas')} onDelete={() => {}} isNew={true}/>}
        {route === 'matches' && <window.MatchesPage matches={matches} personas={personas} openMatch={openMatch} goTo={goTo} swipeMode={tweaks.swipeMatchMode}/>}
        {route.startsWith('chat-') && <window.ChatPage matchId={route.replace('chat-', '')} goBack={() => setRoute('matches')} />}
        {/* Graph, Drift, AI Report, Tweaks hidden for demo simplicity */}
        
      </div>
    </window.ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
