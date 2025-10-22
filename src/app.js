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


const app = express();

// Configuración
app.set('port', config.app.port);
app.use(cors());
app.use(express.json());


// Usar las rutas de usuarios
app.use('/usuarios', userRoutes);
app.use('/auth', authRoutes);
<<<<<<< HEAD

=======
app.use('/surveys', getSurveysRoutes);
app.use('/profile', profileRoutes);
>>>>>>> 01a1d5ceb3c549a0d5d09674ddef5e2b4de37bc3
app.use('/encuestas', surveyRoutes);
app.use('/tipos-pregunta', questionTypeRoutes);

module.exports = app;

