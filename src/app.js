const express = require('express');
const config = require('./config');
const cors = require('cors');
const path = require('path');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const getSurveysRoutes = require('./routes/getSurveysRoutes');
const profileRoutes = require('./routes/profileRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const questionTypeRoutes = require('./routes/questionTypeRoutes');
const statsRoutes = require('./routes/statsResponsesRoutes');

const app = express();

// Configuración
app.set('port', config.app.port);
app.use(cors());
app.use(express.json());


// Rutas
app.use('/usuarios', userRoutes);
app.use('/auth', authRoutes);
app.use('/surveys', getSurveysRoutes);
app.use('/profile', profileRoutes);
app.use('/encuestas', surveyRoutes);
app.use('/tipos-pregunta', questionTypeRoutes);
app.use('/stats', statsRoutes);

module.exports = app;

