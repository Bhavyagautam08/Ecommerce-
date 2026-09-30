import express from "express" 
const router = express.Router() 
import validate from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validation/auth.validation.js";
import { getCurrentUser } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {loginUser,refreshUser} from "../controllers/auth.controller.js";

router.post("/login" ,validate(loginSchema , "body") , loginUser) ;
router.get("/me"  , authMiddleware , getCurrentUser)
router.post("/refresh", refreshUser);
export default router ;