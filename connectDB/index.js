const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shop_ease',
  password: process.env.password,
  port: 5432,
});

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

module.exports = { connectionDB, pool};
