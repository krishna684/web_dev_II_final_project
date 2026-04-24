const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory mock database for reports
const reportsDb = {};

// POST /api/ai/report
// Generates or fetches an AI compatibility report
app.post('/api/ai/report', (req, res) => {
  const { matchId, personaA, personaB, shared } = req.body;

  if (!matchId || !personaA || !personaB) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If we already generated this report, return it
  if (reportsDb[matchId]) {
    return res.json({ report: reportsDb[matchId] });
  }

  // Simulate AI generation delay
  setTimeout(() => {
    const sharedTrait = shared && shared.length > 0 ? shared[0].toLowerCase() : 'connection';
    
    // Simple AI-like readable text
    const generatedText = `Because you both value ${sharedTrait} and have a similar approach to your interactions. ${personaA.name} brings an adventurous energy, which perfectly complements ${personaB.name}'s nature.`;
    
    reportsDb[matchId] = generatedText;
    res.json({ report: generatedText });
  }, 800);
});

const chatsDb = {};

// GET /api/chats/:matchId
app.get('/api/chats/:matchId', (req, res) => {
  const { matchId } = req.params;
  res.json(chatsDb[matchId] || []);
});

// POST /api/chats/:matchId/message
app.post('/api/chats/:matchId/message', (req, res) => {
  const { matchId } = req.params;
  const { senderId, text } = req.body;
  
  if (!senderId || !text) {
    return res.status(400).json({ error: 'Missing senderId or text' });
  }

  if (!chatsDb[matchId]) {
    chatsDb[matchId] = [];
  }

  const message = {
    id: Date.now().toString(),
    senderId,
    text,
    timestamp: new Date().toISOString()
  };

  chatsDb[matchId].push(message);
  res.json(message);
});

const notificationsDb = [
  { id: 1, type: 'match', message: 'New match found: The Wanderer ↔ Maya L.', unread: true },
  { id: 2, type: 'chat', message: 'Maya L. sent you a new message.', unread: true },
  { id: 3, type: 'system', message: 'Your Side "Creative Soul" was saved.', unread: false }
];

// GET /api/notifications
app.get('/api/notifications', (req, res) => {
  res.json(notificationsDb);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
