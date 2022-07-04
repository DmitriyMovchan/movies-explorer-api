const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createUser,
  updateProfile,
  login,
  getMe,
} = require('../controllers/user');
const { isAuthorized } = require('../middlewares/auth');

router.post('/signup', createUser);

router.post('/signin', login);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().min(2).max(30),
  }),
}), updateProfile);

router.get('/users/me', isAuthorized, getMe);

module.exports.userRouter = router;
