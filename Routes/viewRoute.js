const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Jonas',
//   });
// });

// router.get('/', authController.isLoggedIn);

router.get('/me', authController.protect, viewsController.getAccount);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/signup', viewsController.getSignupForm);

module.exports = router;
