const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/error');

const { NODE_ENV, JWT_SECRET } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const params = JSON.stringify(req.query).match(/[^A-Za-z0-9-._~:\/?#\[\]@!$&'()*+,;="{}]/g);

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ErrorHandler(
      401,
      'This application uses JSON Web Token authentication. Please, use browser or set headers with your own token before make query.'
    );
  }

  if (!!params) {
    throw new ErrorHandler(
      403,
      'Special symbols such as spaces are prohibited'
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
