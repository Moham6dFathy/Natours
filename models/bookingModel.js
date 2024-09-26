const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to Tour!'],
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to false!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDateOfTour: {
    type: Date,
    default: Date.now() + 10000000,
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const model = new mongoose.model('Booking', bookingSchema);

module.exports = model;
