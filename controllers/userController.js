import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import {User} from "../models/UserModel.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { Course } from "../models/CourseModel.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/StatsModel.js";

export const register = catchAsyncError(async(req,res,next)=>{

    const {name,email,password} = req.body;
    const file = req.file;

    if(!name || !email || !password || !file)
        return next(new ErrorHandler("Please enter all fields",400));
    
    let user = await User.findOne({email});

    if(user)
        return next(new ErrorHandler("User already exists!",409));
    
    const fileUri = getDataUri(file);   
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        }
    });
    sendToken(res,user,"Registered Successfully",201);
});

export const login = catchAsyncError(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password)
        return next(new ErrorHandler("Please enter all fields!"),400);
    
    const user = await User.findOne({email}).select("+password");

    if(!user)
        return next(new ErrorHandler("Incorrect Credentials!",401));
    
    const isMatch = await user.comparePassword(password);

    if(!isMatch)
        return next(new ErrorHandler("Incorrect Credentials!",401));
    
    sendToken(res, user, `Welcome Back ${user.name} 🙏`, 200); 
});

export const logout = catchAsyncError(async(req,res,next)=>{
     res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
     }).json({
        success:true,
        message:"Logged Out Successfully",
     });
});

export const getMyProfile = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.user._id);

    res.status(200).json({
       success:true,
       user,
    });
});

export const changePassword = catchAsyncError(async(req,res,next)=>{

    const {oldPassword,newPassword} =  req.body;
    if(!oldPassword || !newPassword)
        return next(new ErrorHandler("Please enter all fields!"),400);

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(oldPassword);

    if(!isMatch)
        return next(new ErrorHandler("Incorrect Credentials!",401));

    user.password = newPassword;
    await user.save();

    res.status(200).json({
       success:true,
       message:"Password Changed Successfully",
    });
});


export const updateProfile = catchAsyncError(async(req,res,next)=>{

    const {name,email} =  req.body;
    // if(!name || !email)
    //     return next(new ErrorHandler("Please enter all fields!"),400);

    const user = await User.findById(req.user._id);
    if(name)
        user.name = name
    if(email)
        user.email = email
    await user.save();
    res.status(200).json({
       success:true,
       message:"Profile Updated Successfully",
    });
});

export const updateProfilePic = catchAsyncError(async(req,res,next)=>{
    const file = req.file;
    const user = await User.findById(req.user._id);

    const fileUri = getDataUri(file);   
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
    }
    await user.save();

    res.status(200).json({
        success:true,
        message:"Profile Picture Updated Successfully",
     });
});

export const forgetPassword = catchAsyncError(async(req,res,next)=>{

    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) 
        return next(new ErrorHandler("No User Found",400));
    
    const resetToken = await user.getResetToken();
    await user.save();
    // send token via email
    const url = `${process.env.FRONTEND_URL}/api/v1/resetpassword/${resetToken}`
    const message = `click on the link to reset your password. ${url} Please ignore if not requested.`
    await sendEmail(user.email,"Coursify Reset Password",message);
    res.status(200).json({
        success:true,
        message:`Reset Token has been sent to ${user.email}`,
     });
});

export const resetPassword = catchAsyncError(async(req,res,next)=>{
    const {token} = req.params;

    const resetPasswordToken =  crypto
                                .createHash("sha256")
                                .update(token)
                                .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now()
        }
    });
    if(!user)
        return next(new ErrorHandler("Reset Token is invalid or has been expired", 401));
    
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();

    res.status(200).json({
        success:true,
        message:"Password Changed Successfully.",
        token
     });
});

export const addToPlaylist = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.user._id);
    if(!user) return next(new ErrorHandler("No User Found",404));

    const course = await Course.findById(req.body.id);
    if(!course) return next(new ErrorHandler("Invalid Course ID",404));

    const itemExist = await user.playlist.find((item)=>{
        if(item.course.toString() === course._id.toString())
            return true;
    })

    if(itemExist) return next(new ErrorHandler("Item already exist",409));
    user.playlist.push({
        course:course._id,
        poster:course.poster.url,
    });
    await user.save();
    res.status(200).json({
        success:true,
        message:"Added to Playlist Successfully",
     });
});

export const removeFromPlaylist = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user._id);
    if(!user) return next(new ErrorHandler("No User Found",404));

    const course = await Course.findById(req.query.id);
    if(!course) return next(new ErrorHandler("Invalid Course ID",404));

    const newPlaylist = user.playlist.filter(item=>{
        if(item.course.toString() !== course._id.toString()) return item;
    });

    user.playlist = newPlaylist;

    await user.save();
    res.status(200).json({
        success:true,
        message:"Removed from Playlist Successfully",
     });
});

// ADMIN Controllers

export const getAllUsers = catchAsyncError(async(req,res,next)=>{

    const users = await User.find({})
    res.status(200).json({
        success:true,
        users
     });
});

export const updateUserRole = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.params.id);
    if(!user) return next(new ErrorHandler("User Not Found",404));

    if(user.role === "user")
        user.role = "admin";
    else
        user.role = "user";

    user.save();

    res.status(200).json({
        success:true,
        message:"Role Updated Successfully",
     });
});

export const deleteUser = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.params.id);
    if(!user) return next(new ErrorHandler("User Not Found",404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    await user.deleteOne();
    // cancel subscription
    res.status(200).json({
        success:true,
        message:"User Deleted Successfully",
     });
});

export const deleteMyProfile = catchAsyncError(async(req,res,next)=>{

    const user = await User.findById(req.user._id);
    if(!user) return next(new ErrorHandler("User Not Found",404));
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    await user.deleteOne();
    // cancel subscription
    res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: `${user.name} Your Profile Has Been Deleted Successfully and if you had our subscription then Your Subscription has been ended`,
    });
});

User.watch().on("change",async()=>{
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
    const subscription = await User.find({"subscription.status":"active"});

    stats[0].users = await User.countDocuments();
    stats[0].subscriptions = subscription.length;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
});