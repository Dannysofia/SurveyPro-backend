const { getDailyResponses } = require('../models/statsResponsesModel');

function isoDate(d) {
    return d.toISOString().slice(0, 10);
}

async function dailyResponses(req, res) {
    try {
        const ownerId = req.user.id;
        const tz = (req.query.tz || 'UTC').trim();

        const today = new Date();
        const dTo = req.query.to ? new Date(req.query.to) : today;
        const dFrom = req.query.from
            ? new Date(req.query.from)
            : new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

        const from = isoDate(dFrom);
        const to = isoDate(dTo);

        const points = await getDailyResponses({ ownerId, from, to, tz });
        return res.json({ from, to, tz, points });
    } catch (err) {
        console.error('dailyResponses error:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { dailyResponses };