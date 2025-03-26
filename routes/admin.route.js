const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/createAdmin', adminController.createAdmin);
router.post('/approveUser', adminController.approveUser);
router.get('/getAllUsers', adminController.getUsers);
module.exports = router;
