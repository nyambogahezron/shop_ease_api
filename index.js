require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// database
const { connectionDB } = require('./connectDB');

// Routes
const authRoutes = require('./routes/authRoutes.js');
const productsRoutes = require('./routes/productsRoutes.js');
const ordersRoutes = require('./routes/ordersRoutes.js');
const reviewsRoutes = require('./routes/reviewsRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

// Middlewares
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes middleware
const errorHandlerMiddleware = require('./middleware/error-handler.js');
const notFoundMiddleware = require('./middleware/not-found.js');

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/users', userRoutes);

// api documentation
app.get('/', (req, res) => {
  res.send('<h1>SHOP EASE API</h1><a href="/api-docs">Documentation</a>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

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
