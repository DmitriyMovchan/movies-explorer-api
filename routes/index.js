const router = require('express').Router();
const { NotFoundError } = require('../errors/NotFoundError');
const { isAuthorized } = require('../middlewares/auth');

router.use(require('./input'));

router.use(isAuthorized);
router.use(require('./user'));
router.use(require('./movie'));

router.use((req, res, next) => {
  next(new NotFoundError());
});

module.exports = router;
