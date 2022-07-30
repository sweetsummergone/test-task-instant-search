const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createToken = (ip) => {
  const token = jwt.sign(
    {ip},
    NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    { expiresIn: '1d' }
  );
  return token;
};
