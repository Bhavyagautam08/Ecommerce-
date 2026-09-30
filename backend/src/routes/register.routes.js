import express from "express" 
import {registerUser, generateSignupOTP, verifySignupOTP} from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, verifyOtpSchema } from "../validation/auth.validation.js";

const router = express.Router() ;

router.post("/register" , validate(registerSchema, "body") , registerUser);
router.post("/register/generate-otp", validate(registerSchema, "body"), generateSignupOTP);
router.post("/register/verify-otp", validate(verifyOtpSchema, "body"), verifySignupOTP);

export default router ;