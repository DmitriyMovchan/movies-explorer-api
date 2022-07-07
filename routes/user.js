const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  updateProfile,
  getMe,
} = require('../controllers/user');
const { isAuthorized } = require('../middlewares/auth');

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().min(2).max(30),
  }),
}), updateProfile);

router.get('/users/me', isAuthorized, getMe);

module.exports = router;
