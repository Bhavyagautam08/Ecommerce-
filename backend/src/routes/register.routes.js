import express from "express" 
import {registerUser} from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema } from "../validation/auth.validation.js";

const router = express.Router() ;

router.post("/register" , validate(registerSchema, "body") , registerUser);

export default router ;