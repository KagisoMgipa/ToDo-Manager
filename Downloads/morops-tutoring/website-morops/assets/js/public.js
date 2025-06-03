// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');

// Load config from environment variables
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/', pageRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
