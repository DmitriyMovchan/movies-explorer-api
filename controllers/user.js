const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../middlewares/auth');
const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequest } = require('../errors/BadRequest');
const { ConflictError } = require('../errors/ConflictError');

const MONGO_DUPLICATE_KEY_CODE = 11000;
const saltRounds = 10;

// eslint-disable-next-line consistent-return
const createUser = (req, res, next) => {
  const {
    name, password, email,
  } = req.body;
  if (!password || !email || !name) {
    throw new NotFoundError('Переданы некорректные данные');
    // return res.status(400).send({ message: 'Переданы некорректные данные' });
  }
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

// НЕ РАБОТАЕТ ВАЛИДАЦИЯ ПО ПАРОЛЮ! (сделал)
// eslint-disable-next-line consistent-return
const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      console.log(user);
      const token = generateToken({ _id: user._id });
      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

// eslint-disable-next-line consistent-return
const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  console.log({ name, email });
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const getMe = (req, res, next) => {
  const { _id } = req.user;
  return User.findById(_id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Переданы некорректные данные'));
        // return res.status(404).send({ message: 'Нет пользователя с таким id' });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.log('111');
      next(err);
      // res.status(500).send(err);
    });
};

module.exports = {
  createUser,
  updateProfile,
  login,
  getMe,
};
