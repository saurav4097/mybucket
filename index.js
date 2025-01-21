const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');
const Product = require('./models/Product');
const User = require('./models/User');

// Initialize Express app
const app = express();

// Middleware to parse form data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the view engine and views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files (CSS, images, etc.)
app.use(express.static('public'));

// MongoDB setup using Mongoose
const dbURI = 'mongodb://localhost:27017/e-commerse'; // Fixed typo in database name
mongoose.connect(dbURI)
    .then(() => {
        console.log('Connected successfully to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Route for home page with products
app.get('/home', async (req, res) => {
    try {
        const products = await Product.find();
        console.log('Products fetched:', products);
        res.render('home', { products });
    } catch (err) {
        console.error('Error retrieving products:', err);
        res.status(500).send('Error retrieving products');
    }
});

// Route for form page
app.get('/form', (req, res) => {
    res.render('form');
});

// Route for login page
let parmanentemail;
app.get('/', (req, res) => {
    res.render('index', { errorMessage: null });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    parmanentemail = email;
    try {
        console.log('Email entered:', email);
        const trimmedEmail = email.trim();
        const user = await User.findOne({ email: { $regex: `^${trimmedEmail}$`, $options: 'i' } });

        if (!user) {
            return res.render('index', { errorMessage: 'This user does not exist, please sign up first.' });
        }

        if (user.password !== password) {
            return res.render('index', { errorMessage: 'Password is wrong, please try again.' });
        }

        console.log('User authenticated successfully');
        res.redirect('/home');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal server error');
    }
});

// Search route
app.get('/search', async (req, res) => {
    const query = req.query.query;
    try {
        const products = await Product.find({
            name: { $regex: query, $options: 'i' }
        });
        res.render('search', { products });
    } catch (err) {
        console.error('Error retrieving products:', err);
        res.status(500).send('Error retrieving products');
    }
});

// Signup route
app.get('/signup', (req, res) => {
    res.render('signup', { errorMessage: null });
});

app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    try {
        const trimmedEmail = email.trim();
        const user = await User.findOne({ email: { $regex: `^${trimmedEmail}$`, $options: 'i' } });

        if (user) {
            return res.render('signup', { errorMessage: 'This user already exists, please go to the login page.' });
        }

        if (password !== confirmPassword) {
            return res.render('signup', { errorMessage: 'Passwords do not match.' });
        }

        const newUser = new User({
            name: username,
            email: trimmedEmail,
            password
        });

        await newUser.save();
        console.log('User registered successfully');
        res.redirect('/home');
    } catch (err) {
        console.error('Error inserting document:', err);
        res.status(500).send('Error inserting document');
    }
});

// Profile route
app.get('/profile', async (req, res) => {
    try {
        const profile = await User.findOne({ email: { $regex: `^${parmanentemail}$`, $options: 'i' } });
        if (!profile) {
            return res.status(404).send('User not found');
        }
        res.render('profile', { profile });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Internal server error');
    }
});

// Product details route
app.get('/product/:_id', async (req, res) => {
    try {
        const productId = req.params._id;
        const product = await Product.findById(productId);

        if (product) {
            res.render('product', { product });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).send('Internal server error');
    }
});

// Favorite product route
app.get('/favorite/:_id', async (req, res) => {
    try {
        const productId = req.params._id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid ID format');
          }
        const product = await Product.findById(productId);
        if (!product) return res.status(404).send('Product not found');

        const user = await User.findOne({ email: { $regex: `^${parmanentemail}$`, $options: 'i' } });
        if (!user) return res.status(404).send('User not found');

        const newFavorite = {
            name: user.name,
            buyeremail: user.email,
            selleremail: product.email,
            productname: product.name,
            image: product.images[0],
        };

        await mongoose.connection.collection('favoritedata').insertOne(newFavorite);
        const favorites = await mongoose.connection.collection('favoritedata').find({ buyeremail: user.email }).toArray();

        res.render('favorite', { favorites });
    } catch (err) {
        console.error('Error handling favorite:', err);
        res.status(500).send('Internal server error');
    }
});

// Use product routes
app.use('/', productRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
