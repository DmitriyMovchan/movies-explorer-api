const mongoose = require('mongoose');
const { isURL } = require('validator');

const moviesSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: [isURL],
  },
  trailerLink: {
    type: String,
    required: true,
    validate: [isURL],
  },
  thumbnail: {
    type: String,
    required: true,
    validate: [isURL],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    user: 'userSchema',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model('movies', moviesSchema);
