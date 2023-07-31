import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/UserModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../models/PaymentModel.js";


// buy subscription
export const buySubscription = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.user._id);

    if(user.role === "admin") return next(new ErrorHandler("Admin cannot buy subscription",400));


    const plan_id = process.env.PLAN_ID || "plan_MF9aFCrFRRr8Mw";
    const subscription = await instance.subscriptions.create({
        plan_id: plan_id,
        customer_notify: 1,
        total_count: 12,
    });
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();

    res.status(201).json({
        success:true,
        subscriptionId:subscription.id,
    });
});

export const paymentverification = catchAsyncError(async(req,res,next)=>{

    const {razorpay_payment_id,razorpay_subscription_id,razorpay_signature} = req.body;
    const user = await User.findById(req.user._id);
    const subscriptionId = user.subscription.id;

    if(user.role === "admin") return next(new ErrorHandler("Admin cannot buy subscription",400));
    const generated_signature = crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET)
                                .update(razorpay_payment_id+"|"+subscriptionId,"utf-8").digest("hex");
                
    const isAuthentic = generated_signature === razorpay_signature;
    if(!isAuthentic) 
        return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);

    await Payment.create({razorpay_payment_id,
                          razorpay_subscription_id,
                          razorpay_signature});
    user.subscription.status = "active";
    await user.save();
    

    res.redirect(
        `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
      );
});

// Get RazorPay Key
export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_API_KEY,
    });
});

// Cancel Subscription
// Cancel Subscription
export const cancelSubscription = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const subscriptionId = user.subscription.id;
  
    let refund = false;
  
    await instance.subscriptions.cancel(subscriptionId);
  
    const payment = await Payment.findOne({
      razorpay_subscription_id: subscriptionId,
    });
  
    const gap = Date.now() - payment.createdAt;
    console.log("payment date : ",payment.createdAt);
    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
  
    if (refundTime > gap) {
      await instance.payments.refund(payment.razorpay_payment_id);
      refund = true;
    }
  
    await payment.deleteOne();
    //   user.subscription.id = undefined;
    //   user.subscription.status = undefined;
    user.subscription = undefined;
    await user.save();
  
    res.status(200).json({
      success: true,
      message: refund
        ? `${user.name}: Your Subscription is now cancelled, You will recieve full refund within 7 days`
        : `Subscription Cancelled, Now refund initiated as subscription was cancelled after 7 days.`,
    });
  });