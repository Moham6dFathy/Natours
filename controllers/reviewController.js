const Review = require('../models/ReviewModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.checkTourIsBooked = catchAsync(async (req, res, next) => {
  const isBooked = await Booking.findOne({
    tour: req.body.tour,
    user: req.body.user,
  });

  if (!isBooked)
    return next(
      new AppError('You can write review only in your booked Tours', 400),
    );

  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
