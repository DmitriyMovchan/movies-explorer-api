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
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Неправильный запрос'));
        return;
      }
      next(err);
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Переданы некорректные данные');
      }
      if (movie.owner.toString() === req.user._id) {
        return Movie.deleteOne(movie)
          .then(() => {
            res.status(200).send({ message: 'Фильм удален' });
          });
      }
      return next(new Forbidden('Вы пытались удалить чужой фильм'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Неправильный запрос'));
        return;
      }
      next(err);
    });
};

module.exports = {
  getMovies,
  createMovies,
  deleteMovie,
};
