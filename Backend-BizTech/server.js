const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security Guard: Strict Read-Only View Access for Investors across all mutation endpoints
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (req.path.startsWith('/api/auth/login')) {
      return next();
    }
    const token = req.header('Authorization')?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded?.user?.role === 'investor') {
          return res.status(403).json({ error: 'Investors have view-only access. Create, edit, and delete operations are restricted.' });
        }
      } catch (e) {
        // Let downstream route auth handle invalid token
      }
    }
  }
  next();
});

// Database Connection
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoURI) {
  console.error('Fatal Error: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Routes
const authRoutes = require('./routes/auth');
const adminAuthRoutes = require('./routes/adminAuth');
const pricingRoutes = require('./routes/pricing');
const branchesRoutes = require('./routes/branches');
const employeesRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leavesRoutes = require('./routes/leaves');
const businessesRoutes = require('./routes/businesses');
const customersRoutes = require('./routes/customers');
const documentsRoutes = require('./routes/documents');
const remindersRoutes = require('./routes/reminders');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const purchasesRoutes = require('./routes/purchases');
const expensesRoutes = require('./routes/expenses');
const categoriesRoutes = require('./routes/categories');
const subcategoriesRoutes = require('./routes/subcategories');
const productsRoutes = require('./routes/products');
const investorsRoutes = require('./routes/investors');
const directoryRoutes = require('./routes/directory');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/payment');
const adminPaymentApprovalsRoutes = require('./routes/adminPaymentApprovals');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/payment-approvals', adminPaymentApprovalsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin/contact-inquiries', contactRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/subcategories', subcategoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/investors', investorsRoutes);
app.use('/api/directory', directoryRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('BizTech API is running...');
});

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist on this server.`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
