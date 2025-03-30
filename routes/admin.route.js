const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/createAdmin', adminController.createAdmin);
router.post('/approveUser', adminController.approveUser);
router.post('/addCourse', adminController.addCourse);
router.post('/addMultipleCourses', adminController.addMultipleCourses);
router.post('/term/add', adminController.createTerm);
router.put('/updateCoursePrerequisites/:courseId', adminController.updateCoursePrerequisites);
router.get('/getAllUsers', adminController.getUsers);
router.get('/getAllCourseLevels', adminController.getAllCourseLevels);
router.get('/getAllCoursesByLevel/:level', adminController.getAllCoursesByLevel);
router.get('/getAllCourses', adminController.getAllCourses);
router.get('/getPreCourseLevels', adminController.getPrerequisiteCourseLevels);
router.get('/getPreCourseByLevel/:level', adminController.getPrerequisiteCoursesByLevel);
router.get('/getAllTerms', adminController.getAllTerms);
router.get('/getAllAdvisingForms', adminController.getAllAdvisingForms);
module.exports = router;