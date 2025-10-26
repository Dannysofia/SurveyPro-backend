const db = require('../db');

async function getDailyResponses({ ownerId, from, to, tz = 'UTC' }) {
    const sql = `
    WITH bounds AS (
    SELECT
        ($1::date) AS d_from,
        ($2::date) AS d_to
    ),
    days AS (
    SELECT generate_series(d_from, d_to, interval '1 day')::date AS day
    FROM bounds
    ),
    agg AS (
    SELECT
        (submitted_at AT TIME ZONE $3)::date AS day,
        COUNT(*)::int AS cnt
    FROM survey_responses r
    JOIN surveys s ON s.survey_id = r.survey_id
    WHERE s.owner_id = $4
        AND (submitted_at AT TIME ZONE $3)::date BETWEEN (SELECT d_from FROM bounds) AND (SELECT d_to FROM bounds)
    GROUP BY 1
    )
    SELECT d.day::text AS date, COALESCE(a.cnt, 0)::int AS count
    FROM days d
    LEFT JOIN agg a ON a.day = d.day
    ORDER BY d.day ASC
`;
    const { rows } = await db.query(sql, [from, to, tz, ownerId]);
    return rows;
}

module.exports = { getDailyResponses };