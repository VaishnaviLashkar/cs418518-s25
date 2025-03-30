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
router.post('/createForm', userController.createAdvisingForm );
router.put('/updateAdvisingForm/:id', userController.updateAdvisingForm);
router.post('/verifyOtpForForgotPassword', userController.verifyOtpForForgotPassword);
router.post('/updateUserInformation', userController.updateUserInformation);
router.get('/getUserInfo', userController.getUserInfo);
router.get('/getStudentForms/:studentId', userController.getAdvisingFormsByStudent);
module.exports = router;
