import { checkIfUserExists, createUser, findUserByEmail, findUserById, passwordHashing } from "../services/user.service.js";
import bcrypt from "bcrypt" 
import {generateAccessToken, generateRefreshToken} from "../utils/token.js" 
import { storeRefreshToken } from "../services/token.service.js";
import {getRefreshToken} from "../services/token.service.js";
import { verifyRefreshToken } from "../utils/token.js";
import { generateOTP, verifyOTP } from "../services/otp.service.js";

export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, avatar, age , gender} = req.body;
        const exists  = await checkIfUserExists(email) ;
        if(exists){
            return res.status(409).json({
                message : "User already exists." 
            })
        }
        const hashedPassword = await passwordHashing(password) ;
        const newUser = await createUser({
            name , email , password: hashedPassword , avatar , age , gender
        }
        )

        return res.status(201).json({
            status: "ok",
            data : {
                "ID" : newUser._id ,
                "Name" : name ,
                "Email": email ,
                "Age" : age ,
                "Avatar" : avatar,
                "Gender" : gender,
                "CreatedAt" : newUser.createdAt,
                "UpdatedAt" : newUser.updatedAt
            }
        });
    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};

export const generateSignupOTP = async (req, res, next) => {
    try {
        const { name, email, password, avatar, age, gender } = req.body;
        
        const exists = await checkIfUserExists(email);
        if (exists) {
            return res.status(409).json({ message: "User already exists." });
        }

        const userData = { name, email, password, avatar, age, gender };
        const otp = await generateOTP(email, userData);

        return res.status(200).json({
            status: "ok",
            message: "OTP generated successfully and sent to email."
        });
    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};

export const verifySignupOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        
        const userData = await verifyOTP(email, otp);
        if (!userData) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }
        
        const exists = await checkIfUserExists(email);
        if (exists) {
            return res.status(409).json({ message: "User already exists." });
        }

        const hashedPassword = await passwordHashing(userData.password);
        const newUser = await createUser({
            name: userData.name, 
            email: userData.email, 
            password: hashedPassword, 
            avatar: userData.avatar, 
            age: userData.age, 
            gender: userData.gender
        });

        // Optionally, generate tokens and log them in immediately
        const AccessToken = generateAccessToken(newUser._id, newUser.role);
        const RefreshToken = generateRefreshToken(newUser._id);
        await storeRefreshToken(newUser._id.toString(), RefreshToken);

        return res.status(201).json({
            status: "ok",
            message: "User successfully registered.",
            AccessToken,
            RefreshToken,
            data: {
                "ID": newUser._id,
                "Name": newUser.name,
                "Email": newUser.email
            }
        });
    } catch (err) {
        console.log("Error:", err.message);
        next(err);
    }
};

export const loginUser = async (req , res , next) =>{
    try{
    const {email , password} = req.body ;
    const user = await findUserByEmail(email) ;

    if(!user){
        return res.status(400).json({
            message : "Invalid email or password."
        })
    }
   
    const isPasswordCorrect = await bcrypt.compare(password , user.password) ;
    if(!isPasswordCorrect){
        return res.status(400).json({
            message : "Invalid email or password." 
        })
    }
    const AccessToken = generateAccessToken(user._id , user.role) ;
    const RefreshToken = generateRefreshToken(user._id) ;
    await storeRefreshToken(user._id.toString() , RefreshToken) ;


    return res.status(200).json({
        "status" : "ok" , 
        "message" : "You are successfully logged in." ,
         AccessToken , 
         RefreshToken
    })
    }catch(err){
        console.log("Error :" , err.message) ;
        next(err) ;
    }
}

export const getCurrentUser = async(req,res,next) =>{
    try{
        const id = req.user.userID ;
        const currentUser = await findUserById(id) ;
        return res.status(200).json({
        status: "ok",
        data: {
            id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            age: currentUser.age,
            gender: currentUser.gender,
            avatar: currentUser.avatar,
            createdAt: currentUser.createdAt,
            updatedAt: currentUser.updatedAt
        }
    });
    }catch(err){
        console.log("Error :" , err.message) ;
        next(err) ;
    }
}

export const refreshUser = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token is required."
            });
        }

        const decoded = verifyRefreshToken(refreshToken);

        const storedToken = await getRefreshToken(decoded.userID);

        if (!storedToken || storedToken !== refreshToken) {
            return res.status(401).json({
                message: "Invalid refresh token."
            });
        }

        const accessToken = generateAccessToken(decoded.userID);

        return res.status(200).json({
            status: "ok",
            accessToken
        });

    } catch (err) {
        console.log("Refresh token error:", err.message);
        next(err) ;
    }
};