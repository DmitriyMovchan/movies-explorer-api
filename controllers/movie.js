const Movie = require('../models/movie');

const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequest } = require('../errors/BadRequest');
const { Forbidden } = require('../errors/Forbidden');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch((err) => {
      next(err);
      // res.status(500).send({ message: 'Server error' });
    });
};

// eslint-disable-next-line consistent-return
const createMovies = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => {
      res.status(201).send(movie);
    })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequest('Неправильный запрос'));
        // return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      next(err);
      // res.status(500).send({ message: 'Server error' });
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    // eslint-disable-next-line consistent-return
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Переданы некорректные данные');
        // res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
        // return;
      }
      if (movie.owner.toString() === req.user._id) {
        return Movie.deleteOne(movie)
          .then(() => {
            res.status(200).send({ message: 'Фильм удален' });
          });
      }
      return next(new Forbidden('Вы пытались удалить чужой фильм'));
      // res.status(403).send({ message: 'Чужие карточки удалять нельзя' });
    })
  // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequest('Неправильный запрос'));
        // return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      next(err);
      // res.status(500).send({ message: 'некорректный id карточки.' });
    });
};

module.exports = {
  getMovies,
  createMovies,
  deleteMovie,
};
