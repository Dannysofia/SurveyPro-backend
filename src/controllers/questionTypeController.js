const questionTypeModel = require("../models/questionTypeModel");

async function listarTiposPregunta(_req, res) {
  try {
    const tipos = await questionTypeModel.obtenerTiposPregunta();
    return res.status(200).json(tipos);
  } catch (error) {
    console.error("Error al listar tipos de pregunta:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { listarTiposPregunta };
