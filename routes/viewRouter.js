const express = require('express');

const viewController = require('../controllers/viewController.js');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();


router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.loggedIn,
  viewController.getOverview,
);
router.get('/tour/:slug', authController.loggedIn, viewController.getTour);
router.get('/login', authController.loggedIn, viewController.login);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);

module.exports = router;
