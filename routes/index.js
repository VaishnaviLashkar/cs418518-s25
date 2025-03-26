const express = require('express');
const userRoutes = require('./user.route');
const adminRoutes = require('./admin.route');

const router = express.Router();

router.use('/users', userRoutes);

router.use('/admin', adminRoutes);
module.exports = router;
