require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('shop ease api');
});

// Start application
const port = process.env.SERVER_PORT || 3000;

const startApp = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startApp();
