import express from "express";
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from "../controllers/courseController.js";
import singleUpload from "../middleware/multer.js";
import { authorizeAdmin, authorizeSubscribers, isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/courses").get(getAllCourses) //get all course without lectures

router.route("/createcourse").post(isAuthenticated,authorizeAdmin,singleUpload,createCourse) //create new course - only admin

router.route("/course/:id")
.get(isAuthenticated,authorizeSubscribers,getCourseLectures)
.post(isAuthenticated,authorizeAdmin,singleUpload,addLecture)
.delete(isAuthenticated,authorizeAdmin,deleteCourse);
// add lecture, delete course, get course detail
//delete lecture
router.route("/lecture").delete(isAuthenticated,authorizeAdmin,singleUpload,deleteLecture) //delete lecture
export default router; 