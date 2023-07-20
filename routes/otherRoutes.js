import express from "express";
import { contact, courseRequest, getDashboardStats } from "../controllers/otherController.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/auth.js";
const router = express.Router();


// Contact Form
router.route("/contact").post(contact);
// Request Form
router.route("/courserequest").post(courseRequest);
// get Admin Dashboard Stats
router.route("/admin/stats").get(isAuthenticated,authorizeAdmin,getDashboardStats);


export default router;