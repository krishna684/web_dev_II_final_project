// Seed data for the Parallel Selves prototype
window.SEED_PERSONAS = [
  {
    id: 'p1',
    name: 'The Wanderer',
    initial: 'W',
    mood: 'Curious',
    goal: 'Travel Buddy',
    traits: ['Adventurous', 'Open-minded', 'Social', 'Spontaneous'],
    interests: ['Travel', 'Photography', 'Street food'],
    bio: 'Lives out of a carry-on and a notebook. Finds meaning between layovers.',
    scoreAvg: 87,
    dims: { Openness: 92, Energy: 78, Structure: 34, Empathy: 71, Risk: 86 },
    hue: 265,
  },
  {
    id: 'p2',
    name: 'Creative Soul',
    initial: 'C',
    mood: 'Focused',
    goal: 'Collaborator',
    traits: ['Imaginative', 'Sensitive', 'Deep', 'Patient'],
    interests: ['Art', 'Film', 'Poetry', 'Design'],
    bio: 'Makes things quietly. Trusts the long way around.',
    scoreAvg: 82,
    dims: { Openness: 88, Energy: 54, Structure: 66, Empathy: 90, Risk: 48 },
    hue: 320,
  },
  {
    id: 'p3',
    name: 'The Strategist',
    initial: 'S',
    mood: 'Ambitious',
    goal: 'Co-founder',
    traits: ['Analytical', 'Driven', 'Organized', 'Direct'],
    interests: ['Chess', 'Finance', 'Systems'],
    bio: 'Runs the numbers twice. Plays the long game.',
    scoreAvg: 74,
    dims: { Openness: 60, Energy: 72, Structure: 94, Empathy: 52, Risk: 64 },
    hue: 200,
  },
  {
    id: 'p4',
    name: 'Night Philosopher',
    initial: 'N',
    mood: 'Contemplative',
    goal: 'Deep Conversation',
    traits: ['Introspective', 'Quiet', 'Reader', 'Stoic'],
    interests: ['Philosophy', 'Ambient music', 'Walks'],
    bio: 'Talks best after midnight. Collects questions, not answers.',
    scoreAvg: 69,
    dims: { Openness: 82, Energy: 32, Structure: 58, Empathy: 86, Risk: 30 },
    hue: 230,
  },
];

window.SEED_OTHERS = [
  { id: 'o1', name: 'Maya L.', initial: 'M', traits: ['Artist', 'Traveler'], hue: 340 },
  { id: 'o2', name: 'Dev S.', initial: 'D', traits: ['Founder', 'Athlete'], hue: 180 },
  { id: 'o3', name: 'Kenji T.', initial: 'K', traits: ['Writer', 'Stoic'], hue: 40 },
  { id: 'o4', name: 'Priya R.', initial: 'P', traits: ['Designer', 'Dreamer'], hue: 290 },
  { id: 'o5', name: 'Arjun B.', initial: 'A', traits: ['Engineer'], hue: 160 },
  { id: 'o6', name: 'Noor H.', initial: 'N', traits: ['Poet'], hue: 10 },
];

window.SEED_MATCHES = [
  { id: 'm1', a: 'p1', b: 'o1', score: 94, shared: ['Travel', 'Curiosity', 'Art'], delta: '+3 this week' },
  { id: 'm2', a: 'p2', b: 'o4', score: 91, shared: ['Design', 'Film'], delta: '+5 this week' },
  { id: 'm3', a: 'p1', b: 'o3', score: 88, shared: ['Writing', 'Solitude'], delta: 'new' },
  { id: 'm4', a: 'p3', b: 'o2', score: 86, shared: ['Startups', 'Systems'], delta: '+2' },
  { id: 'm5', a: 'p4', b: 'o6', score: 83, shared: ['Poetry', 'Quiet'], delta: 'new' },
  { id: 'm6', a: 'p2', b: 'o1', score: 79, shared: ['Art'], delta: '-1' },
  { id: 'm7', a: 'p1', b: 'o4', score: 76, shared: ['Aesthetics'], delta: '+1' },
  { id: 'm8', a: 'p3', b: 'o5', score: 72, shared: ['Engineering'], delta: '+4' },
];

window.SEED_DRIFT = [
  { id:'d1', persona:'p1', date:'Apr 18, 2026', type:'add', title:'Added trait "Spontaneous"', note:'You mentioned loving unplanned detours in your last trip review.' },
  { id:'d2', persona:'p1', date:'Apr 12, 2026', type:'chg', title:'Mood shifted: Restless → Curious', note:'Conversation themes pivoted toward learning and exploration.' },
  { id:'d3', persona:'p2', date:'Apr 09, 2026', type:'rm',  title:'Removed "Night Owl"', note:'Activity log suggests a morning shift over the past 3 weeks.' },
  { id:'d4', persona:'p3', date:'Apr 05, 2026', type:'add', title:'Added "Ambitious"', note:'You applied to two accelerators this month.' },
  { id:'d5', persona:'p4', date:'Apr 01, 2026', type:'chg', title:'Goal refined: Friendship → Deep Conversation', note:'Match feedback favored longer-form connection.' },
  { id:'d6', persona:'p1', date:'Mar 24, 2026', type:'add', title:'Added "Open-minded"', note:'Created during onboarding.' },
];

window.TRAIT_LIBRARY = [
  'Adventurous', 'Open-minded', 'Social', 'Spontaneous',
  'Imaginative', 'Sensitive', 'Deep', 'Patient',
  'Analytical', 'Driven', 'Organized', 'Direct',
  'Introspective', 'Quiet', 'Reader', 'Stoic',
  'Playful', 'Empathetic', 'Loyal', 'Curious',
  'Ambitious', 'Night Owl', 'Morning Person', 'Focused',
];

window.MOODS = [
  { key: 'Curious',      em: '◌' },
  { key: 'Focused',      em: '◐' },
  { key: 'Ambitious',    em: '↗' },
  { key: 'Contemplative',em: '∞' },
  { key: 'Playful',      em: '◊' },
  { key: 'Restless',     em: '≈' },
  { key: 'Grounded',     em: '▢' },
  { key: 'Dreaming',     em: '☽' },
];

window.GOALS = [
  'Travel Buddy', 'Collaborator', 'Co-founder', 'Deep Conversation',
  'Creative Partner', 'Friendship', 'Mentor', 'Casual',
];

window.findPersona = (id) => window.SEED_PERSONAS.find(p => p.id === id);
window.findOther   = (id) => window.SEED_OTHERS.find(p => p.id === id);
window.findMatch   = (id) => window.SEED_MATCHES.find(m => m.id === id);
