require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

// database
const { connectionDB } = require('./connectDB');

// Routes
const authRoutes = require('./routes/authRoutes.js');

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes middleware
const errorHandlerMiddleware = require('./middleware/error-handler.js');
app.use('/api/v1/auth', authRoutes);
const notFoundMiddleware = require('./middleware/not-found.js');

app.get('/', (req, res) => {
  res.send('shop ease api');
});
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

// Start application
const port = process.env.SERVER_PORT || 3000;

connectionDB();

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
