const mongoose = require('mongoose');

const personaVersionSchema = new mongoose.Schema({
  personaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', required: true, index: true },
  versionNumber: { type: Number, required: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  savedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PersonaVersion', personaVersionSchema);
