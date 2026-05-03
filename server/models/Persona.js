const mongoose = require('mongoose');

const CONNECTION_GOALS = [
  'romantic', 'collaborator', 'friend', 'mentor',
  'travel', 'co-founder', 'deep-conversation', 'creative-partner', 'casual'
];

const personaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  traits: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  connectionGoal: { type: String, enum: CONNECTION_GOALS, default: 'friend' },
  moodTag: { type: String, default: '' },
  bio: { type: String, default: '' },
  currentVersion: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Persona', personaSchema);
module.exports.CONNECTION_GOALS = CONNECTION_GOALS;
