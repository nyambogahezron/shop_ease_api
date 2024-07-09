const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  let customError = {
    // Set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, please try again later',
  };

  // Handling unique constraint violation - duplicate
  if (err.code === '23505') {
    customError.msg = `Duplicate value entered for ${
      err.detail.match(/\(([^)]+)\)/)[1]
    } field, please choose another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handling data type mismatch
  if (err.code === '22P02') {
    customError.msg = 'Invalid data format';
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handling check violation
  if (err.code === '23514') {
    let customMessage = 'Check constraint violation';

    const constraintMessages = {
      users_name_check: 'Name must be at least 3 characters long',
      email_format_check: 'Email must be a valid email address.',
      products_category_check: 'Invalid category value',
      products_company_check: 'Invalid company value',
    };

    // Check if the error's constraint is in the map and use the custom message
    if (constraintMessages[err.constraint]) {
      customMessage = constraintMessages[err.constraint];
    }

    customError.msg = customMessage;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handling foreign key violation
  if (err.code === '23503') {
    customError.msg = `Invalid reference value in ${
      err.detail.match(/\(([^)]+)\)/)[1]
    } field`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handling NOT NULL violation
  if (err.code === '23502') {
    customError.msg = 'Missing required field';
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handling invalid text representation
  if (err.code === '22P02') {
    customError.msg = 'Invalid text representation of a value';
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Handling connection exceptions (example)
  if (err.code >= '08000' && err.code <= '08007') {
    customError.msg = 'Database connection error';
    customError.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
  }

  // Handling insufficient resources (example)
  if (err.code === '53000') {
    customError.msg = 'Database resources exhausted';
    customError.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
