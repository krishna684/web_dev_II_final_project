require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Persona = require('./models/Persona');
const PersonaVersion = require('./models/PersonaVersion');
const Match = require('./models/Match');
const { computeMatch } = require('./utils/matching');

const DEMO_USERS = [
  { name: 'Krishna K.', email: 'krishna@parallel.app', password: 'demo1234', personas: [
    { name: 'The Wanderer', traits: ['Adventurous','Open-minded','Social','Spontaneous'], interests: ['Travel','Photography','Street food'], connectionGoal: 'travel', moodTag: 'Curious', bio: 'Lives out of a carry-on and a notebook.' },
    { name: 'Creative Soul', traits: ['Imaginative','Sensitive','Deep','Patient'], interests: ['Art','Film','Poetry','Design'], connectionGoal: 'collaborator', moodTag: 'Focused', bio: 'Makes things quietly.' },
  ]},
  { name: 'Maya L.', email: 'maya@parallel.app', password: 'demo1234', personas: [
    { name: 'Wanderer Self', traits: ['Adventurous','Curious','Social'], interests: ['Travel','Photography','Art'], connectionGoal: 'travel', moodTag: 'Curious', bio: '' },
    { name: 'Studio Self', traits: ['Imaginative','Patient','Focused'], interests: ['Art','Design'], connectionGoal: 'collaborator', moodTag: 'Focused', bio: '' },
  ]},
  { name: 'Dev S.', email: 'dev@parallel.app', password: 'demo1234', personas: [
    { name: 'Founder Mode', traits: ['Analytical','Driven','Organized','Ambitious'], interests: ['Chess','Finance','Systems'], connectionGoal: 'co-founder', moodTag: 'Ambitious', bio: '' },
    { name: 'Athlete Self', traits: ['Driven','Focused'], interests: ['Running','Fitness'], connectionGoal: 'friend', moodTag: 'Focused', bio: '' },
  ]},
  { name: 'Kenji T.', email: 'kenji@parallel.app', password: 'demo1234', personas: [
    { name: 'Night Philosopher', traits: ['Introspective','Quiet','Reader','Stoic'], interests: ['Philosophy','Ambient music','Walks'], connectionGoal: 'deep-conversation', moodTag: 'Contemplative', bio: '' },
    { name: 'Writer Self', traits: ['Deep','Patient','Imaginative'], interests: ['Poetry','Literature'], connectionGoal: 'creative-partner', moodTag: 'Contemplative', bio: '' },
  ]},
  { name: 'Priya R.', email: 'priya@parallel.app', password: 'demo1234', personas: [
    { name: 'Designer Self', traits: ['Imaginative','Organized','Focused'], interests: ['Design','Art','Film'], connectionGoal: 'collaborator', moodTag: 'Focused', bio: '' },
    { name: 'Dreamer Self', traits: ['Imaginative','Open-minded','Sensitive'], interests: ['Poetry','Travel'], connectionGoal: 'romantic', moodTag: 'Dreaming', bio: '' },
    { name: 'Mentor Self', traits: ['Patient','Empathetic','Deep'], interests: ['Teaching','Design'], connectionGoal: 'mentor', moodTag: 'Grounded', bio: '' },
  ]},
];

async function run() {
  await connectDB();
  console.log('Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    Persona.deleteMany({}),
    PersonaVersion.deleteMany({}),
    Match.deleteMany({}),
  ]);

  console.log('Seeding users and personas...');
  const createdPersonas = [];
  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await User.create({ name: u.name, email: u.email, passwordHash });
    for (const p of u.personas) {
      const persona = await Persona.create({ ...p, userId: user._id, currentVersion: 1 });
      await PersonaVersion.create({ personaId: persona._id, versionNumber: 1, snapshot: persona.toObject() });
      createdPersonas.push(persona);
    }
  }

  console.log('Computing matches...');
  for (let i = 0; i < createdPersonas.length; i++) {
    for (let j = i + 1; j < createdPersonas.length; j++) {
      const a = createdPersonas[i], b = createdPersonas[j];
      const { score, traitOverlap, interestSimilarity, goalAlignment } = computeMatch(a, b);
      await Match.create({
        personaAId: a._id, personaBId: b._id,
        score, traitOverlap, interestSimilarity, goalAlignment,
      });
    }
  }

  // Seed 2 sample AI reports on the top matches so the report panel has content on first load
  const topMatches = await Match.find({}).sort({ score: -1 }).limit(2);
  if (topMatches[0]) {
    topMatches[0].aiReport = 'These personas share a strong creative-explorer core — both lean into novelty and lived experience. Friction may appear when one wants structured collaboration and the other drifts toward open-ended curiosity. Expect a warm, generative dynamic with occasional pacing mismatches.';
    await topMatches[0].save();
  }
  if (topMatches[1]) {
    topMatches[1].aiReport = 'This pairing aligns around disciplined craft and quiet depth. Both value focus over speed and will naturally respect each other\'s working rhythm. Watch for a tendency to avoid difficult conversations — the strength of this match depends on intentional vulnerability.';
    await topMatches[1].save();
  }

  console.log(`Done. Users: ${DEMO_USERS.length}, personas: ${createdPersonas.length}, matches: ${await Match.countDocuments({})}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
