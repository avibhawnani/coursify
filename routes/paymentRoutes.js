import express from "express";
import { authorizeSubscribers, isAuthenticated } from "../middleware/auth.js";
import { buySubscription, cancelSubscription, getRazorPayKey, paymentverification } from "../controllers/paymentController.js";
const router = express.Router();

// Buy Subscription
router.route("/subscribe").get(isAuthenticated,buySubscription);

// Payment Verification
router.route("/paymentverification").post(isAuthenticated,paymentverification);

// Get Razorpay Key
router.route("/razorpaykey").get(getRazorPayKey);

// Cancel Subscription
router.route("/subscribe/cancel").delete(isAuthenticated,authorizeSubscribers,cancelSubscription);

export default router;