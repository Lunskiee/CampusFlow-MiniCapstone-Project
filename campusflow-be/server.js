const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection Optional/Conditional
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('Connected to MongoDB database'))
        .catch((err) => console.error('MongoDB connection error:', err));
} else {
    app.use('/api', bookingRoutes);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server is listening on port ${PORT}`);
    console.log('Google Calendar integration is ready when a booking is created.');
});