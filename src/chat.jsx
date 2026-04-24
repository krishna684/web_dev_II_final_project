const { useState, useEffect, useRef } = React;

function ChatPage({ matchId, goBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  // In a real app we'd get this from context, using hardcoded for demo
  const MY_ID = 'p1'; 

  const match = window.findMatch(matchId);
  const pa = match ? window.findPersona(match.a) : null;
  const pb = match ? window.findOther(match.b) : null;

  useEffect(() => {
    fetchMessages();
  }, [matchId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = () => {
    fetch(`http://localhost:3001/api/chats/${matchId}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(e => {
        console.error('Failed to fetch chats:', e);
        setLoading(false);
      });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const outgoing = text;
    setText(''); // clear input immediately

    // Optimistic UI update
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: MY_ID,
      text: outgoing,
      timestamp: new Date().toISOString()
    }]);

    fetch(`http://localhost:3001/api/chats/${matchId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: MY_ID, text: outgoing })
    })
    .then(r => r.json())
    .catch(err => {
      console.error(err);
      window.useToast()('Failed to send message', 'error');
    });
  };

  if (!match) return <div className="page">Match not found.</div>;

  return (
    <div className="page" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="row between" style={{ marginBottom: 20 }}>
        <div className="row" style={{ gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={goBack}><Ic.arrL/> Back</button>
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>Chat with {pb.name}</h2>
            <div className="sub">Matched via: {pa.name}</div>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => window.useToast()('Contact info shared', 'success')}>Share Contact Info</button>
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* Chat history */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
              <div>No messages yet.<br/>Send a message to start the conversation!</div>
            </div>
          ) : (
            messages.map(m => {
              const isMe = m.senderId === MY_ID;
              return (
                <div key={m.id} style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  background: isMe ? 'var(--accent)' : 'var(--card-2)',
                  color: isMe ? '#121212' : 'var(--text)',
                  padding: '10px 14px',
                  borderRadius: 16,
                  borderBottomRightRadius: isMe ? 4 : 16,
                  borderBottomLeftRadius: isMe ? 16 : 4,
                  maxWidth: '75%',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {m.text}
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', display: 'flex', gap: 10, background: 'var(--card)' }}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ 
              flex: 1, 
              background: 'var(--bg)', 
              border: '1px solid var(--border)', 
              borderRadius: 20, 
              padding: '10px 16px',
              outline: 'none',
              fontSize: 15
            }} 
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 20, padding: '0 20px' }} disabled={!text.trim()}>
            Send
          </button>
        </form>

      </div>
    </div>
  );
}

Object.assign(window, { ChatPage });
