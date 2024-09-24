const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const Tour = require('../../models/TourModel');
const User = require('../../models/UserModel');
const Review = require('../../models/ReviewModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB Connected Successfully 😎');
  });

let tourFile = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf-8'),
);
const users = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8'),
);
const reviews = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8'),
);

const importData = async () => {
  try {
    tourFile = tourFile.map((el) => {
      el.startDates = el.startDates.map((date) => {
        const newDate = { tourDate: date };
        console.log(newDate);
        return newDate;
      });
      return el;
    });
    // console.log(tourFile);
    await Tour.create(tourFile);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data Successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
