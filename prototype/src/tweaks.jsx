const { useState: tS, useEffect: tE } = React;

function TweaksPanel({ state, setState }) {
  const setK = (k, v) => {
    const next = { ...state, [k]: v };
    setState(next);
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
    } catch(e) {}
  };
  return (
    <div className="tweaks">
      <h5>Tweaks</h5>
      <div className="tw-row">
        <span>Theme</span>
        <div className="seg">
          <button className={state.theme==='dark'?'on':''} onClick={()=>setK('theme','dark')}>Dark</button>
          <button className={state.theme==='light'?'on':''} onClick={()=>setK('theme','light')}>Light</button>
        </div>
      </div>
      <div className="tw-row">
        <span>Accent</span>
        <div className="seg">
          <button className={state.accent==='violet'?'on':''} onClick={()=>setK('accent','violet')}>V</button>
          <button className={state.accent==='cyan'?'on':''} onClick={()=>setK('accent','cyan')}>C</button>
          <button className={state.accent==='rose'?'on':''} onClick={()=>setK('accent','rose')}>R</button>
          <button className={state.accent==='lime'?'on':''} onClick={()=>setK('accent','lime')}>L</button>
        </div>
      </div>
      <div className="tw-row">
        <span>Graph pulses</span>
        <div className={`switch ${state.graphPulse?'on':''}`} onClick={()=>setK('graphPulse', !state.graphPulse)}/>
      </div>
      <div className="tw-row">
        <span>Swipe-match mode</span>
        <div className={`switch ${state.swipeMatchMode?'on':''}`} onClick={()=>setK('swipeMatchMode', !state.swipeMatchMode)}/>
      </div>
      <div className="tw-row">
        <span>Sound effects</span>
        <div className={`switch ${state.soundEffects?'on':''}`} onClick={()=>setK('soundEffects', !state.soundEffects)}/>
      </div>
      <div className="tw-row">
        <span>Avatar style</span>
        <div className="seg">
          <button className={state.avatarStyle==='orbital'?'on':''} onClick={()=>setK('avatarStyle','orbital')}>Orbital</button>
          <button className={state.avatarStyle==='flat'?'on':''} onClick={()=>setK('avatarStyle','flat')}>Flat</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TweaksPanel });
