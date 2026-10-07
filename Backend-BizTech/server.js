const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected successfully'))
.catch((err) => console.log('MongoDB connection error: ', err));

// Routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');
const pricingRoutes = require('./routes/pricing');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/pricing', pricingRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('BizTech API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
