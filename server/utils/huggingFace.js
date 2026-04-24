const HF_URL = 'https://api-inference.huggingface.co/models';

function buildPrompt(a, b, match) {
  return `<s>[INST] You are a relationship compatibility analyst.
Write a short narrative (3-4 sentences) covering which traits align between these two personas, where friction may arise, and what dynamic to expect. Be specific and concrete.

Persona A: ${a.name}
Connection goal: ${a.connectionGoal}
Mood: ${a.moodTag}
Traits: ${(a.traits || []).join(', ')}
Interests: ${(a.interests || []).join(', ')}

Persona B: ${b.name}
Connection goal: ${b.connectionGoal}
Mood: ${b.moodTag}
Traits: ${(b.traits || []).join(', ')}
Interests: ${(b.interests || []).join(', ')}

Scores: trait overlap ${match.traitOverlap}, interest similarity ${match.interestSimilarity}, goal alignment ${match.goalAlignment}, overall ${match.score}.
[/INST]`;
}

async function generateCompatibilityReport(a, b, match) {
  const token = process.env.HF_API_TOKEN;
  const model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
  if (!token) throw new Error('HF_API_TOKEN not set');

  const resp = await fetch(`${HF_URL}/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: buildPrompt(a, b, match),
      parameters: { max_new_tokens: 220, temperature: 0.7, return_full_text: false },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HF ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  const text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
  return (text || '').trim();
}

module.exports = { generateCompatibilityReport, buildPrompt };
