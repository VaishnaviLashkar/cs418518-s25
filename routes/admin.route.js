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
router.get('/getAllCourses', adminController.getAllCourses);
router.get('/getCourseLevels', adminController.getPrerequisiteCourseLevels);
router.get('/getCourseByLevel/:level', adminController.getPrerequisiteCoursesByLevel);
router.get('/getAllTerms', adminController.getAllTerms);
module.exports = router;