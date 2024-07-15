const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.PORT,
});

// connect to the database
const connectionDB = () => {
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error connecting pg client', err.stack);
      return;
    }

    console.log('Database connection successful');
    // if is connected release the connection
    client.query('SELECT NOW()', (err, result) => {
      release();
      if (err) {
        console.error('Error executing query', err.stack);
        return;
      }
      //   log server time
      console.log(result.rows);
    });
  });
};

module.exports = { connectionDB, pool };
