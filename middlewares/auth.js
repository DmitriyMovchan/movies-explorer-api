const jwt = require('jsonwebtoken');

const { UnauthorizedError } = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET_KEY } = process.env;

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '7d' });

const isAuthorized = (req, res, next) => {
  let auth = req.headers.authorization;
  if (!auth) {
    return next(new UnauthorizedError('Требуется авторизация'));
  }
  let decoded;
  try {
    // eslint-disable-next-line prefer-destructuring
    auth = auth.split(' ')[1];
    decoded = jwt.verify(auth, NODE_ENV === 'production' ? JWT_SECRET_KEY : 'dev-secret');
  } catch (err) {
    // eslint-disable-next-line new-cap
    // eslint-disable-next-line prefer-promise-reject-errors
    return next(new UnauthorizedError('Требуется авторизация'));
  }
  req.user = decoded;
  return next();
};

module.exports = { generateToken, isAuthorized };
