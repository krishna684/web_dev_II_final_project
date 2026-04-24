const { useState: gS, useEffect: gE, useRef: gR, useMemo: gM } = React;

function GraphPage({ personas, others, matches, openMatch, pulse }) {
  const [hoverNode, setHoverNode] = gS(null);
  const [activeNode, setActiveNode] = gS(null);
  const [tip, setTip] = gS(null);

  // Build nodes + layout with a simple radial force simulation (deterministic)
  const { nodes, links } = gM(() => {
    const userNodes = personas.map((p,i) => ({
      id: p.id, kind:'user', label: p.name, initial: p.initial, hue: p.hue,
      r: 26 + (p.scoreAvg/10),
    }));
    const otherNodes = others.map((o,i) => ({
      id: o.id, kind:'other', label: o.name, initial: o.initial, hue: o.hue,
      r: 18,
    }));
    const all = [...userNodes, ...otherNodes];
    // initial positions: users on inner ring, others on outer
    userNodes.forEach((n,i) => {
      const a = (i / userNodes.length) * Math.PI * 2;
      n.x = 500 + Math.cos(a) * 140;
      n.y = 360 + Math.sin(a) * 140;
    });
    otherNodes.forEach((n,i) => {
      const a = (i / otherNodes.length) * Math.PI * 2 + 0.3;
      n.x = 500 + Math.cos(a) * 290;
      n.y = 360 + Math.sin(a) * 220;
    });
    const links = matches.map(m => ({ ...m, source: m.a, target: m.b, weight: m.score/100 }));
    // simple relax: pull linked nodes toward each other
    for (let it=0; it<60; it++) {
      links.forEach(l => {
        const a = all.find(n=>n.id===l.source), b = all.find(n=>n.id===l.target);
        const dx = b.x-a.x, dy = b.y-a.y;
        const d = Math.sqrt(dx*dx+dy*dy) || 1;
        const target = 180 - l.weight*80;
        const f = (d - target) * 0.04;
        const ux = dx/d, uy = dy/d;
        if (a.kind !== 'user') { a.x += ux*f; a.y += uy*f; }
        if (b.kind !== 'user') { b.x -= ux*f; b.y -= uy*f; }
      });
      // repel
      for (let i=0; i<all.length; i++) for (let j=i+1; j<all.length; j++) {
        const a=all[i], b=all[j];
        const dx=b.x-a.x, dy=b.y-a.y;
        const d=Math.sqrt(dx*dx+dy*dy)||1;
        if (d<80) {
          const f=(80-d)*0.08; const ux=dx/d, uy=dy/d;
          if (a.kind!=='user') { a.x -= ux*f; a.y -= uy*f; }
          if (b.kind!=='user') { b.x += ux*f; b.y += uy*f; }
        }
      }
    }
    return { nodes: all, links };
  }, [personas, others, matches]);

  const isConnected = (nodeId, linkId) => {
    const l = links.find(x => x.id === linkId);
    return l && (l.source === nodeId || l.target === nodeId);
  };
  const isNodeLinkedToActive = (id) => {
    if (!activeNode) return true;
    if (id === activeNode) return true;
    return links.some(l => (l.source===activeNode && l.target===id) || (l.target===activeNode && l.source===id));
  };

  return (
    <div className="page">
      <div className="row between" style={{marginBottom:20, alignItems:'flex-end'}}>
        <div>
          <h1>Compatibility graph</h1>
          <div className="sub">Your personas, their matches, and the tissue of connection between them.</div>
        </div>
        <div className="row" style={{gap:8}}>
          <button className="btn btn-ghost"><Ic.filter/> Filter</button>
          <button className="btn btn-ghost"><Ic.refresh/> Rebuild</button>
        </div>
      </div>

      <div className="graph-shell">
        <div className="graph-panel">
          <h5>Legend</h5>
          <div className="graph-legend">
            <div><span className="dot-u"/> Your personas</div>
            <div><span className="dot-o"/> Others</div>
            <div className="muted" style={{marginTop:12, fontSize:11}}>Edge thickness = compatibility score. Hover a node for details, click to isolate.</div>
          </div>
          <div className="divider"/>
          <h5>Stats</h5>
          <div className="graph-legend">
            <div>{personas.length} of yours · {others.length} others</div>
            <div>{links.length} active edges</div>
            <div>{links.filter(l=>l.score>=90).length} strong links</div>
          </div>
        </div>

        <div className="graph-canvas-wrap" onMouseLeave={()=>setTip(null)}>
          <svg viewBox="0 0 1000 720" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="bgglow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.12"/>
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <circle cx="500" cy="360" r="300" fill="url(#bgglow)"/>
            {/* rings */}
            {[120, 200, 280].map((r,i) => (
              <circle key={i} cx="500" cy="360" r={r} fill="none" stroke="var(--border)" strokeDasharray="2 6" opacity="0.6"/>
            ))}
            {/* edges */}
            {links.map(l => {
              const a = nodes.find(n=>n.id===l.source), b = nodes.find(n=>n.id===l.target);
              const active = activeNode && (l.source===activeNode || l.target===activeNode);
              const dim = activeNode && !active;
              const width = 0.5 + l.weight * 3;
              return (
                <g key={l.id} onClick={()=>openMatch(l.id)} style={{cursor:'pointer'}}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={active ? 'var(--accent)' : 'var(--accent)'}
                    strokeOpacity={dim ? 0.08 : (0.2 + l.weight*0.5)}
                    strokeWidth={width}/>
                  {pulse && !dim && (
                    <circle r="3" fill="var(--accent-2)">
                      <animateMotion dur={`${2.5 + (l.score%5)*0.3}s`} repeatCount="indefinite"
                        path={`M${a.x} ${a.y} L ${b.x} ${b.y}`}/>
                      <animate attributeName="opacity" values="0;1;0" dur={`${2.5 + (l.score%5)*0.3}s`} repeatCount="indefinite"/>
                    </circle>
                  )}
                </g>
              );
            })}
            {/* nodes */}
            {nodes.map(n => {
              const dim = activeNode && !isNodeLinkedToActive(n.id);
              const highlighted = hoverNode === n.id || activeNode === n.id;
              return (
                <g key={n.id} className="graph-node" opacity={dim ? 0.25 : 1}
                   onMouseEnter={(e)=>{ setHoverNode(n.id); setTip({ x: n.x, y: n.y, node: n }); }}
                   onMouseLeave={()=>{ setHoverNode(null); setTip(null); }}
                   onClick={()=>setActiveNode(a => a===n.id ? null : n.id)}>
                  {n.kind==='user' && (
                    <circle cx={n.x} cy={n.y} r={n.r+10} fill={`hsl(${n.hue} 80% 65%)`} opacity={highlighted ? 0.35 : 0.18} filter="url(#glow)">
                      {pulse && <animate attributeName="r" values={`${n.r+8};${n.r+14};${n.r+8}`} dur="3s" repeatCount="indefinite"/>}
                    </circle>
                  )}
                  <circle cx={n.x} cy={n.y} r={n.r}
                    fill={n.kind==='user' ? `hsl(${n.hue} 80% 62%)` : 'var(--card-2)'}
                    stroke={n.kind==='user' ? `hsl(${n.hue} 90% 80%)` : 'var(--accent-2)'}
                    strokeWidth={highlighted ? 3 : 1.5}/>
                  <text x={n.x} y={n.y+4} textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="500"
                        fontSize={n.kind==='user' ? 18 : 13}
                        fill={n.kind==='user' ? 'white' : 'var(--text)'}>
                    {n.initial}
                  </text>
                  {highlighted && (
                    <text x={n.x} y={n.y + n.r + 16} textAnchor="middle" fontSize="11" fill="var(--text-dim)">
                      {n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {tip && (
            <div className="graph-tooltip" style={{ left: `${(tip.x/1000)*100}%`, top: `${(tip.y/720)*100}%`, transform: 'translate(-50%, -130%)' }}>
              <b>{tip.node.label}</b>
              <small>{tip.node.kind==='user' ? 'Your persona' : 'External node'}</small>
              <small style={{marginTop:4}}>
                {links.filter(l=>l.source===tip.node.id || l.target===tip.node.id).length} connections
              </small>
            </div>
          )}
        </div>

        <div className="graph-panel">
          <h5>Focus</h5>
          {activeNode ? (
            <>
              <div style={{fontSize:14, fontWeight:600, marginBottom:8}}>
                {nodes.find(n=>n.id===activeNode).label}
              </div>
              <div className="muted" style={{fontSize:12, marginBottom:12}}>Connected matches:</div>
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {links.filter(l=>l.source===activeNode || l.target===activeNode).sort((a,b)=>b.score-a.score).map(l => {
                  const other = nodes.find(n => n.id === (l.source===activeNode ? l.target : l.source));
                  return (
                    <div key={l.id} onClick={()=>openMatch(l.id)} style={{
                      padding:'10px 12px', background:'var(--card-2)', borderRadius:8,
                      border:'1px solid var(--border)', cursor:'pointer',
                      display:'flex', justifyContent:'space-between', alignItems:'center'
                    }}>
                      <span style={{fontSize:12.5}}>{other.label}</span>
                      <b style={{fontFamily:'Fraunces, serif', fontSize:14, color:'var(--accent)'}}>{l.score}%</b>
                    </div>
                  );
                })}
              </div>
              <button className="btn btn-ghost btn-sm" style={{width:'100%', marginTop:14}} onClick={()=>setActiveNode(null)}>Clear focus</button>
            </>
          ) : (
            <div className="muted" style={{fontSize:12.5, lineHeight:1.55}}>
              Click any node to isolate its connections. Click an edge to open its AI compatibility report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GraphPage });
