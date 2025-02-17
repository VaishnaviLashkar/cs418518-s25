const express = require('express');

const userController = require('../controllers/userController');
const router = express.Router();

router.post('/signup', userController.SignUp);
router.post('/login', userController.login);
router.post('/verifyOtpForSignUp', userController.verifyOtpForSignUp);
router.post('/resendOtp', userController.resendOtp);
router.post('/verifyOtpForLogin', userController.verifyOtpForLogin);
router.post('/resetPassword', userController.resetPassword);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/verifyOtpForForgotPassword', userController.verifyOtpForForgotPassword);
router.post('/updateUserInformation', userController.updateUserInformation);
router.get('/getUserInfo', userController.getUserInfo);
module.exports = router;
