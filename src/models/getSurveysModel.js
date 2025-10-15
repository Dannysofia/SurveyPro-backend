const db = require('../db');

async function listRecentSurveys({ ownerId, limit = 5 }) {
    const query = `
    SELECT survey_id, title, description, public_token, status, created_at
    FROM surveys
    WHERE owner_id = $1
    ORDER BY created_at DESC
    LIMIT $2`;

    const { rows } = await db.query(query, [ownerId, limit]);
    return rows;
}

async function getHomeSummary({ ownerId }) {
    const surveysCountQuery = `
    SELECT COUNT(*)::int AS total_surveys
    FROM surveys
    WHERE owner_id = $1`;

    const responsesCountQuery = `
    SELECT COUNT(sr.response_id)::int AS total_responses
    FROM surveys s
    LEFT JOIN survey_responses sr ON sr.survey_id = s.survey_id
    WHERE s.owner_id = $1`;

    const [{ rows: a }, { rows: b }] = await Promise.all([
        db.query(surveysCountQuery, [ownerId]),
        db.query(responsesCountQuery, [ownerId]),
    ]);

    return {
        total_surveys: a[0].total_surveys,
        total_responses: b[0].total_responses,
    };
}

module.exports = {
    listRecentSurveys,
    getHomeSummary
};