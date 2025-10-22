const db = require('../db');

function normalizarTipo(typeNameRaw) {
  const t = String(typeNameRaw || '').toLowerCase();
  if (t.includes('multi')) return 'multiple_choice';
  if (t.includes('single')) return 'single_choice';
  if (t.includes('option')) return 'single_choice';
  if (t.includes('choice')) return 'single_choice';
  if (t.includes('rating')) return 'rating';
  if (t.includes('number') || t.includes('numeric')) return 'number';
  if (t.includes('text')) return 'text';
  return 'text';
}

async function obtenerSurveyPorId(client, survey_id) {
  const q = `
    SELECT survey_id, status
    FROM surveys
    WHERE survey_id = $1
    LIMIT 1
  `;
  const r = await client.query(q, [survey_id]);
  return r.rows[0] || null;
}

async function obtenerSurveyPorToken(client, token) {
  const q = `
    SELECT survey_id, status
    FROM surveys
    WHERE public_token = $1
    LIMIT 1
  `;
  const r = await client.query(q, [token]);
  return r.rows[0] || null;
}

async function cargarPreguntasDeSurvey(client, survey_id) {
  const q = `
    SELECT q.question_id, q.survey_id, q.type_id, q.question_text, q.is_required, q.position,
           t.type_name
    FROM survey_questions q
    JOIN question_types t ON t.type_id = q.type_id
    WHERE q.survey_id = $1
  `;
  const r = await client.query(q, [survey_id]);
  return r.rows.map((row) => ({
    ...row,
    kind: normalizarTipo(row.type_name),
  }));
}

async function validarOpcionPerteneceAPregunta(client, option_id, question_id) {
  const q = `
    SELECT 1 FROM question_options WHERE option_id = $1 AND question_id = $2 LIMIT 1
  `;
  const r = await client.query(q, [option_id, question_id]);
  return r.rowCount > 0;
}

async function crearRespuestaPorSurveyId({ survey_id, submitted_by = null, answers = [] }) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const encuesta = await obtenerSurveyPorId(client, survey_id);
    if (!encuesta) {
      throw new Error('ENCUESTA_NO_ENCONTRADA');
    }
    if (String(encuesta.status).toLowerCase() === 'cerrado') {
      throw new Error('ENCUESTA_CERRADA');
    }

    const preguntas = await cargarPreguntasDeSurvey(client, survey_id);
    const mapaPregunta = new Map(preguntas.map((p) => [String(p.question_id), p]));

    // Validación de requeridos y pertenencia
    for (const a of answers) {
      const qid = String(a.question_id || '');
      const p = mapaPregunta.get(qid);
      if (!p) {
        throw new Error('PREGUNTA_INVALIDA');
      }
      const tipo = p.kind;
      if (p.is_required) {
        const tieneTexto = a.value_text != null && String(a.value_text).trim() !== '';
        const tieneOpcion = a.option_id || (Array.isArray(a.option_ids) && a.option_ids.length > 0);
        if (!tieneTexto && !tieneOpcion) {
          throw new Error('RESPUESTA_REQUERIDA_FALTA');
        }
      }
      if ((a.option_id || a.option_ids) && tipo === 'text') {
        // Si el tipo es texto, no debería venir opción.
        // No lanzamos error duro, pero podría ser útil validar fuerte:
        // throw new Error('TIPO_TEXTO_NO_ACEPTA_OPCIONES');
      }
    }

    // Insertar cabecera de respuesta
    const insResp = await client.query(
      `INSERT INTO survey_responses (survey_id, submitted_by) VALUES ($1, $2) RETURNING response_id, submitted_at`,
      [survey_id, submitted_by || null]
    );
    const response_id = insResp.rows[0].response_id;

    // Insertar respuestas
    for (const a of answers) {
      const qid = String(a.question_id);
      const p = mapaPregunta.get(qid);
      const tipo = p.kind;

      if (tipo === 'multiple_choice') {
        const optionIds = Array.isArray(a.option_ids) ? a.option_ids : [];
        if (optionIds.length === 0 && p.is_required) {
          throw new Error('RESPUESTA_REQUERIDA_FALTA');
        }
        for (const optId of optionIds) {
          const ok = await validarOpcionPerteneceAPregunta(client, optId, qid);
          if (!ok) throw new Error('OPCION_INVALIDA');
          await client.query(
            `INSERT INTO survey_answers (response_id, question_id, selected_option_id, answer_text) VALUES ($1, $2, $3, NULL)`,
            [response_id, qid, optId]
          );
        }
      } else if (tipo === 'single_choice') {
        const optId = a.option_id || null;
        if (!optId) {
          if (p.is_required) throw new Error('RESPUESTA_REQUERIDA_FALTA');
        } else {
          const ok = await validarOpcionPerteneceAPregunta(client, optId, qid);
          if (!ok) throw new Error('OPCION_INVALIDA');
        }
        await client.query(
          `INSERT INTO survey_answers (response_id, question_id, selected_option_id, answer_text) VALUES ($1, $2, $3, NULL)`,
          [response_id, qid, optId]
        );
      } else if (tipo === 'rating' || tipo === 'number') {
        const val = a.value_number != null ? String(a.value_number) : (a.value_text != null ? String(a.value_text) : null);
        if ((val == null || String(val).trim() === '') && p.is_required) {
          throw new Error('RESPUESTA_REQUERIDA_FALTA');
        }
        await client.query(
          `INSERT INTO survey_answers (response_id, question_id, selected_option_id, answer_text) VALUES ($1, $2, NULL, $3)`,
          [response_id, qid, val]
        );
      } else {
        // texto por defecto
        const val = a.value_text != null ? String(a.value_text) : null;
        if ((val == null || String(val).trim() === '') && p.is_required) {
          throw new Error('RESPUESTA_REQUERIDA_FALTA');
        }
        await client.query(
          `INSERT INTO survey_answers (response_id, question_id, selected_option_id, answer_text) VALUES ($1, $2, NULL, $3)`,
          [response_id, qid, val]
        );
      }
    }

    await client.query('COMMIT');
    return { response_id };
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    try { client.release(); } catch {}
  }
}

async function crearRespuestaPorToken({ token, submitted_by = null, answers = [] }) {
  const encuesta = await obtenerSurveyPorToken(db, token);
  if (!encuesta) throw new Error('ENCUESTA_NO_ENCONTRADA');
  return crearRespuestaPorSurveyId({ survey_id: encuesta.survey_id, submitted_by, answers });
}

async function listarRespuestas(survey_id) {
  const qResp = `
    SELECT response_id, survey_id, submitted_at, submitted_by
    FROM survey_responses
    WHERE survey_id = $1
    ORDER BY submitted_at DESC
  `;
  const rResp = await db.query(qResp, [survey_id]);
  const responses = rResp.rows;
  if (responses.length === 0) return [];
  const ids = responses.map((r) => r.response_id);
  const qAns = `
    SELECT a.answer_id, a.response_id, a.question_id, a.selected_option_id, a.answer_text,
           q.question_text, q.position,
           o.option_label,
           t.type_key, t.type_name
    FROM survey_answers a
    JOIN survey_questions q ON q.question_id = a.question_id
    JOIN question_types t ON t.type_id = q.type_id
    LEFT JOIN question_options o ON o.option_id = a.selected_option_id
    WHERE a.response_id = ANY($1::uuid[])
    ORDER BY q.position ASC
  `;
  const rAns = await db.query(qAns, [ids]);
  const byResp = new Map(responses.map((r) => [r.response_id, { ...r, answers: [] }]));
  for (const row of rAns.rows) {
    const entry = byResp.get(row.response_id);
    if (entry) entry.answers.push({
      answer_id: row.answer_id,
      question_id: row.question_id,
      question_text: row.question_text,
      type_key: row.type_key || normalizarTipo(row.type_name),
      selected_option_id: row.selected_option_id,
      option_label: row.option_label,
      answer_text: row.answer_text,
    });
  }
  return Array.from(byResp.values());
}

function agruparRespuestas(responses) {
  return responses.map((r) => {
    const grouped = new Map();
    for (const a of r.answers) {
      const key = String(a.question_id);
      if (!grouped.has(key)) {
        grouped.set(key, {
          question_id: a.question_id,
          question_text: a.question_text,
          type_key: a.type_key,
          answer_text: null,
          option_ids: [],
          option_labels: [],
        });
      }
      const g = grouped.get(key);
      if (a.selected_option_id) {
        g.option_ids.push(a.selected_option_id);
        if (a.option_label) g.option_labels.push(a.option_label);
      }
      if (a.answer_text && !g.answer_text) {
        g.answer_text = a.answer_text;
      }
    }
    return {
      response_id: r.response_id,
      submitted_at: r.submitted_at,
      submitted_by: r.submitted_by,
      answers: Array.from(grouped.values()),
    };
  });
}

async function listarRespuestasFormateadas(survey_id) {
  const raw = await listarRespuestas(survey_id);
  return agruparRespuestas(raw);
}

async function obtenerEstadisticas(survey_id) {
  // Conteo por opción
  const qOpts = `
    SELECT 
      q.question_id,
      o.option_id,
      o.option_label,
      COUNT(sa.selected_option_id) AS total
    FROM survey_questions q
    JOIN question_options o ON o.question_id = q.question_id
    LEFT JOIN survey_answers sa 
      ON sa.question_id = q.question_id AND sa.selected_option_id = o.option_id
    WHERE q.survey_id = $1
    GROUP BY q.question_id, o.option_id, o.option_label
    ORDER BY q.question_id, o.position
  `;
  const rOpts = await db.query(qOpts, [survey_id]);

  // Promedio para rating/number
  const qAvg = `
    SELECT 
      q.question_id,
      AVG(NULLIF(sa.answer_text, '')::numeric) AS promedio,
      COUNT(NULLIF(sa.answer_text, '')::numeric) AS total
    FROM survey_questions q
    JOIN question_types t ON t.type_id = q.type_id
    JOIN survey_answers sa ON sa.question_id = q.question_id
    WHERE q.survey_id = $1 AND t.type_name IN ('rating','number')
    GROUP BY q.question_id
    ORDER BY q.question_id
  `;
  const rAvg = await db.query(qAvg, [survey_id]);

  // Conteo de respuestas de texto
  const qText = `
    SELECT q.question_id, COUNT(sa.answer_id) AS total
    FROM survey_questions q
    JOIN question_types t ON t.type_id = q.type_id
    JOIN survey_answers sa ON sa.question_id = q.question_id
    WHERE q.survey_id = $1 AND (t.type_name ILIKE '%text%')
    GROUP BY q.question_id
    ORDER BY q.question_id
  `;
  const rText = await db.query(qText, [survey_id]);

  return {
    options: rOpts.rows,
    numbers: rAvg.rows,
    texts: rText.rows,
  };
}

module.exports = {
  crearRespuestaPorSurveyId,
  crearRespuestaPorToken,
  listarRespuestas,
  obtenerEstadisticas,
  listarRespuestasFormateadas,
};
