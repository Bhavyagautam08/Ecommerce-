import express from "express" 
import roleChecker from "../middlewares/role.middleware.js";
import adminDashboard from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router() ;

router.get("/dashboard" , authMiddleware , roleChecker("admin") , adminDashboard)

export default router ;