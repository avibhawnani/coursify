import express from "express";
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, register, removeFromPlaylist, resetPassword, updateProfile, updateProfilePic, updateUserRole } from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";
const router = express.Router();

router.route("/register").post(singleUpload,register) //register new user route

router.route("/login").post(login) //login user route

router.route("/logout").get(logout) //logout user route

router.route("/me").get(isAuthenticated, getMyProfile) //get user profile route

router.route("/me").delete(isAuthenticated, deleteMyProfile) //Delete user profile route

router.route("/changepassword").put(isAuthenticated, changePassword) //change Password route

router.route("/updateprofile").put(isAuthenticated, updateProfile) //Update Profile route

router.route("/updateprofilepicture").put(isAuthenticated,singleUpload, updateProfilePic) //Update Profile Picture route

router.route("/forgetpassword").post(forgetPassword)  //Forget password Route

router.route("/resetpassword/:token").put(resetPassword) //Reset password route

router.route("/addtoplaylist").post(isAuthenticated,addToPlaylist) //Add to playlist route

router.route("/deleteplaylist").delete(isAuthenticated,removeFromPlaylist) //Delete playlist route

// ADMIN Routes
router.route("/admin/users").get(isAuthenticated,authorizeAdmin,getAllUsers) //Get All Users

router.route("/admin/user/:id") //Update User Role
.put(isAuthenticated,authorizeAdmin,updateUserRole) 
.delete(isAuthenticated,authorizeAdmin,deleteUser)


export default router;