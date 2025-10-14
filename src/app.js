const express = require('express');
const config = require('./config');
const cors = require('cors');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const questionTypeRoutes = require('./routes/questionTypeRoutes');

const app = express();

// Configuración
app.set('port', config.app.port);
app.use(cors());
app.use(express.json());

// Usar las rutas de usuarios
app.use('/usuarios', userRoutes);
app.use('/auth', authRoutes);
app.use('/encuestas', surveyRoutes);
app.use('/tipos-pregunta', questionTypeRoutes);

module.exports = app;
