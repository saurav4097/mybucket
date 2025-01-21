const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');
const fs = require('fs');

const router = express.Router();

// Configure Multer for memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to render the form
router.get('/', (req, res) => {
  res.render('form');
});

// Route to handle form submission
router.post('/add-product', upload.array('images', 3), async (req, res) => {
  try {
    const { name, email, price, offer, detail, rating } = req.body;

    // Convert images to Base64 strings
    const imageBase64 = req.files.map(file => file.buffer.toString('base64'));

    const newProduct = new Product({
      name,
      email,
      price,
      offer,
      detail,
      rating,
      images: imageBase64,
    });

    await newProduct.save();
    res.redirect('/home?message=Product%20added%20successfully');
  } catch (err) {
    res.status(500).send('Error adding product: ' + err.message);
  }
});

module.exports = router;
