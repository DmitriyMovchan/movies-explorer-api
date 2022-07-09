const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { ConflictError } = require('../errors/ConflictError');
const { UnauthorizedError } = require('../errors/UnauthorizedError');
const { NotFoundError } = require('../errors/NotFoundError');

const { NODE_ENV, JWT_SECRET_KEY } = process.env;

const MONGO_DUPLICATE_KEY_CODE = 11000;
const saltRounds = 10;

const createUser = (req, res, next) => {
  const {
    name, password, email,
  } = req.body;
  bcrypt.hash(password, saltRounds)
    .then((hash) => User.create({
      name, email, password: hash,
    })
      .then(() => {
        res.status(201).send({
          name, email,
        });
      }))
    .catch((err) => {
      if (err.code === MONGO_DUPLICATE_KEY_CODE) {
        next(new ConflictError('Пользователь с таким емейлом уже есть.'));
        return;
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET_KEY : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'Error') {
        next(new UnauthorizedError('Неправильно введены почта или пароль'));
      }
      next(err);
    });
};

const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ConflictError('Переданы некорректные данные'));
        return;
      }
      if (err.code === MONGO_DUPLICATE_KEY_CODE) {
        next(new ConflictError('Пользователь с таким e-mail уже существует'));
        return;
      }
      next(err);
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
