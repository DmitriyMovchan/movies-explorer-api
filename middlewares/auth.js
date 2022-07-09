const jwt = require('jsonwebtoken');

const { UnauthorizedError } = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET_KEY } = process.env;

const isAuthorized = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Требуется авторизация'));
    return;
  }

  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET_KEY : 'dev-secret');
    req.user = payload;
    next();
  } catch (err) {
    next(new UnauthorizedError('Требуется авторизация'));
  }
};

module.exports = { isAuthorized };
