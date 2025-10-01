const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'SurveyPro',
  password: '12345',
  port: 5432, 
});

/** 
pool.connect()
  .then(() => {
    console.log('Conexión exitosa a PostgreSQL');
    pool.end();
  })
  .catch(err => {
    console.error('Error de conexión:', err);
  });*/

module.exports = {
  query: (text, params) => pool.query(text, params),
};