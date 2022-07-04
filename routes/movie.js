const router = require('express').Router();
// const { celebrate, Joi } = require('celebrate');
const {
  getMovies,
  createMovies,
  deleteMovie,
} = require('../controllers/movie');

router.get('/', getMovies);
router.post('/', createMovies);
router.delete('/:movieId', deleteMovie);

module.exports.movieRouter = router;
