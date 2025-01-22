const mongoose = require('mongoose');
const Product = require('./Product');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    buyeremail: {
        type: String,
        required: true,
        unique: true,
    },
    selleremail: {
        type: String,
        required: true,
        unique: true,
    },
    Productname: {
        type: String,
        required: true,
    },
    images: {
        type: [String], // Array to store images as Base64 strings
        validate: {
          validator: function (value) {
            return value.length > 0; // Ensure that there is at least one image
          },
          message: 'At least one image is required.'
        }
      },
});

const Favoritedata = mongoose.model('favoritedata', userSchema,'favoritedata');

module.exports = Favoritedata;
