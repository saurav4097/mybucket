const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
  name: { 
    type: String, 
    required: true // Ensure the product name is required
  },
  email: { 
    type: String, 
    required: true, 
    match: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, // Regex to validate email format
  },
  price: { 
    type: Number, 
    required: true, 
    min: [0, 'Price cannot be less than 0'] // Ensure price is positive
  },
  offer: { 
    type: String, 
    required: false // Offer is optional
  },
  detail: { 
    type: String, 
    required: false // Detail is optional
  },
  rating: { 
    type: Number, 
    min: [0, 'Rating cannot be less than 0'], 
    max: [5, 'Rating cannot be greater than 5'],
    required: true
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

// Export the Product model
module.exports = mongoose.model('Product', productSchema ,'productdetail');
