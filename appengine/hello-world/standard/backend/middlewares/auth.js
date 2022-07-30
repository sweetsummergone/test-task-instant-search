const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/error');

const { NODE_ENV, JWT_SECRET } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ErrorHandler(
      401,
      'This application uses JSON Web Token authentication. Please, use browser or set headers with your own token before make query.'
    );
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'
    );
  } catch (err) {
    next(err);
  }

  req.user = payload; // assigning the payload to the request object

  next(); // sending the request to the next middleware
};
