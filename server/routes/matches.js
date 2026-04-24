const router = require('express').Router();
const Match = require('../models/Match');
const Persona = require('../models/Persona');
const auth = require('../middleware/auth');
const { computeMatch } = require('../utils/matching');

router.use(auth);

router.get('/', async (req, res) => {
  const userPersonas = await Persona.find({ userId: req.userId }).select('_id');
  const ids = userPersonas.map(p => p._id);
  const matches = await Match
    .find({ $or: [{ personaAId: { $in: ids } }, { personaBId: { $in: ids } }] })
    .sort({ score: -1 })
    .populate([
      { path: 'personaAId', populate: { path: 'userId', select: 'name' } },
      { path: 'personaBId', populate: { path: 'userId', select: 'name' } },
    ]);
  res.json(matches);
});

router.post('/score', async (req, res) => {
  const personas = await Persona.find({});
  const ops = [];
  for (let i = 0; i < personas.length; i++) {
    for (let j = i + 1; j < personas.length; j++) {
      const a = personas[i], b = personas[j];
      const { score, traitOverlap, interestSimilarity, goalAlignment } = computeMatch(a, b);
      ops.push(Match.findOneAndUpdate(
        { personaAId: a._id, personaBId: b._id },
        { $set: { score, traitOverlap, interestSimilarity, goalAlignment, matchedAt: new Date() } },
        { upsert: true, new: true }
      ));
    }
  }
  await Promise.all(ops);
  res.json({ ok: true, rescored: ops.length });
});

router.get('/:id/report', async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  res.json({ report: match.aiReport });
});

module.exports = router;
