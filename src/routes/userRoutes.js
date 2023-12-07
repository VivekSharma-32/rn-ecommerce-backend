import express from "express";
import { rateLimit } from "express-rate-limit";
import {
  getUserProfileController,
  loginController,
  logoutController,
  registerController,
  resetPasswordController,
  updatePasswordController,
  updateProfileController,
  updateProfilePicController,
} from "../controllers/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Use an external store for consistency across multiple server instances.
});

// router object
const router = express.Router();

//routes
// register
router.post("/register", limiter, registerController);
// login
router.post("/login", limiter, loginController);

// user profile
router.get("/profile", isAuth, getUserProfileController);

// update profile
router.put("/profile-update", isAuth, updateProfileController);

// update password
router.put("/update-password", isAuth, updatePasswordController);

// update profile picture
router.put("/update-picture", singleUpload, isAuth, updateProfilePicController);

// logout
router.get("/logout", isAuth, logoutController);

// forgot password
router.post("/reset-password", resetPasswordController);

// export
export default router;
