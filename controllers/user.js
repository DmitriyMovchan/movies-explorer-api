const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { ConflictError } = require('../errors/ConflictError');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET_KEY } = process.env;

const MONGO_DUPLICATE_KEY_CODE = 11000;
const saltRounds = 10;

// eslint-disable-next-line consistent-return
const createUser = (req, res, next) => {
  const {
    name, password, email,
  } = req.body;
  bcrypt.hash(password, saltRounds)
    .then((hash) => User.create({
      name, email, password: hash,
    })
      .then((user) => {
        // eslint-disable-next-line no-shadow
        const {
          // eslint-disable-next-line no-shadow
          name, email, _id,
        } = user;
        res.status(201).send({
          name, email, _id,
        });
      }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.code === MONGO_DUPLICATE_KEY_CODE) {
        return next(new ConflictError('Пользователь с таким емейлом уже есть.'));
        // return res.status(409).send({ message: 'Пользователь с таким емейлом уже есть.' });
      }
      next(err);
      // res.status(500).send({ message: err.name });
    });
};

// eslint-disable-next-line consistent-return
const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET_KEY : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new UnauthorizedError('Неправильно введены почта или пароль'));
      }
      next(err);
    });
};

// eslint-disable-next-line consistent-return
const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ConflictError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const getMe = (req, res, next) => {
  const { _id } = req.user;
  return User.findById(_id)
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  createUser,
  updateProfile,
  login,
  getMe,
};
