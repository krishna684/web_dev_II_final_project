const { useState: nS, useEffect: nE, useMemo: nM } = React;

function Navbar({ route, goTo, theme, toggleTheme, personas, matches, handleLogout, handleDeleteAccount }) {
  const [showSearch, setShowSearch] = nS(false);
  const [showNotif, setShowNotif] = nS(false);
  const [showAcc, setShowAcc] = nS(false);
  const [notifs, setNotifs] = nS([]);
  const [query, setQuery] = nS('');

  const links = [
    { id:'dashboard', label:'Home', ic:<Ic.home/> },
    { id:'personas',  label:'Your Sides',  ic:<Ic.user/> },
    { id:'matches',   label:'Your Matches',   ic:<Ic.heart/> },
  ];

  nE(() => {
    if (showNotif && notifs.length === 0) {
      fetch('http://localhost:3001/api/notifications')
        .then(r => r.json())
        .then(setNotifs)
        .catch(console.error);
    }
  }, [showNotif]);

  const searchResults = nM(() => {
    if (!query.trim()) return { sides: [], matches: [] };
    const q = query.toLowerCase();
    return {
      sides: personas.filter(p => p.name.toLowerCase().includes(q) || p.traits.some(t => t.toLowerCase().includes(q))),
      matches: matches.filter(m => {
        const pa = personas.find(x => x.id === m.a);
        const pb = window.SEED_OTHERS.find(x => x.id === m.b);
        if (!pa || !pb) return false;
        return pa.name.toLowerCase().includes(q) || pb.name.toLowerCase().includes(q);
      })
    };
  }, [query, personas, matches]);

  const hasResults = searchResults.sides.length > 0 || searchResults.matches.length > 0;

  return (
    <>
      <div className="navbar" style={{ position: 'relative', zIndex: 50 }}>
        <div className="nav-inner">
          <div className="logo" onClick={() => goTo('dashboard')} style={{cursor:'pointer'}}>
            <img src="lumi.png" className="logo-img" alt="Lumi" />
            <div>SideMatch</div>
          </div>
          
          <div className="nav-links">
            {links.map(l => (
              <a key={l.id} className={route.startsWith(l.id) ? 'active' : ''} onClick={() => goTo(l.id)}>
                {l.ic} {l.label}
              </a>
            ))}
          </div>

          <div className="nav-right" style={{ position: 'relative' }}>
            <button className="icon-btn" title="Search" onClick={() => { setShowSearch(!showSearch); setShowNotif(false); setShowAcc(false); }}>
              <Ic.search />
            </button>
            
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" title="Notifications" onClick={() => { setShowNotif(!showNotif); setShowSearch(false); setShowAcc(false); }}>
                <Ic.bell />
                <span className="dot" style={{ background: 'var(--danger)' }} />
              </button>
              
              {/* Notifications Dropdown */}
              {showNotif && (
                <div className="card" style={{ position: 'absolute', top: 50, right: 0, width: 320, padding: 0, boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Notifications</div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>Loading...</div>
                    ) : (
                      notifs.map(n => (
                        <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, cursor: 'pointer', background: n.unread ? 'var(--accent-soft)' : 'transparent' }}>
                          <div style={{ marginTop: 2, color: 'var(--accent)' }}>
                            {n.type === 'match' ? <Ic.heart /> : n.type === 'chat' ? <Ic.spark /> : <Ic.bell />}
                          </div>
                          <div style={{ fontSize: 13 }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn" title="Toggle theme" onClick={toggleTheme}>
              {theme === 'dark' ? <Ic.sun /> : <Ic.moon />}
            </button>

            <div style={{ position: 'relative' }}>
              <div className="avatar-chip" style={{ cursor: 'pointer' }} onClick={() => { setShowAcc(!showAcc); setShowSearch(false); setShowNotif(false); }}>
                <div className="avatar">K</div>
                <div>
                  <div style={{fontSize:12.5, fontWeight:600}}>Krishna K.</div>
                  <small style={{fontSize:10.5}}>Free plan</small>
                </div>
              </div>

              {/* Account Dropdown */}
              {showAcc && (
                <div className="card" style={{ position: 'absolute', top: 50, right: 0, width: 200, padding: 8, boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => window.useToast()('Profile Settings clicked', 'info')}>Profile Settings</button>
                  <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={toggleTheme}>Theme / Dark Mode</button>
                  <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => { setShowAcc(false); setShowNotif(true); }}>Notifications</button>
                  <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => goTo('matches')}>Saved Matches</button>
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={handleLogout}>Logout</button>
                  <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--danger)' }} onClick={handleDeleteAccount}>Delete Account</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--glass)', zIndex: 40, backdropFilter: 'blur(4px)' }} onClick={() => setShowSearch(false)}>
          <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <input 
              type="text" 
              autoFocus
              placeholder="Search matches, sides..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', padding: '16px 24px', fontSize: 18, borderRadius: 'var(--r-xl)', border: '1px solid var(--border-strong)', background: 'var(--card)', color: 'var(--text)', outline: 'none', boxShadow: 'var(--shadow-lg)' }}
            />
            {query.trim() && (
              <div className="card" style={{ marginTop: 12, padding: 0, overflow: 'hidden' }}>
                {!hasResults ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)' }}>No results found</div>
                ) : (
                  <div style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
                    {searchResults.sides.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Your Sides</div>
                        {searchResults.sides.map(s => (
                          <div key={s.id} style={{ padding: '12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} className="hover-bg" onClick={() => { setShowSearch(false); window.openPersona(s.id); }}>
                            <PersonaOrb initial={s.name[0]} hue={s.hue} size={32} style="flat"/>
                            <div><b>{s.name}</b><br/><span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.traits.join(', ')}</span></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchResults.matches.length > 0 && (
                      <div>
                        <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Matches</div>
                        {searchResults.matches.map(m => {
                          const pa = personas.find(x => x.id === m.a);
                          const pb = window.SEED_OTHERS.find(x => x.id === m.b);
                          return (
                            <div key={m.id} style={{ padding: '12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }} className="hover-bg" onClick={() => { setShowSearch(false); goTo('matches'); }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', color: '#121212' }}><Ic.heart /></div>
                              <div><b>{pa?.name} ↔ {pb?.name}</b><br/><span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{m.shared.join(', ')}</span></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`.hover-bg:hover { background: var(--card-2); }`}</style>
    </>
  );
}

Object.assign(window, { Navbar });
