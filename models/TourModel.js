const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./UserModel');
const Review = require('./ReviewModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name 🥲'],
      unique: true,
      trim: true,
      maxlength: [40, 'the name must be less than or equal 40 characters'],
      minlength: [10, 'the name must be more than or equal 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration 🥲'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tout must have a difficulty 🥲'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'the difficulty must either: easy,medium,difficult',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size 🥲'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'the ratingAverage must be above 1.0'],
      max: [5, 'the ratingAverage must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a price 🥲'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount Price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have a description 🥲'],
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a Cover Image 🥲'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [
      {
        tourDate: {
          type: Date,
        },
        participants: {
          type: Number,
          default: 0,
        },
        soldOut: {
          type: Boolean,
          default: false,
        },
      },
    ],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual Property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: run before .save and .create
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save',async function(next){
//   const guidesPromises = this.guides.map(async id=>await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// })

// DOCUMENT MIDDLEWARE: run after .save and .create
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(
//     `Query Middleware is executed in ${Date.now() - this.start} millesecond`,
//   );
//   next();
// });

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;
