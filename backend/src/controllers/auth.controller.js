import { checkIfUserExists, createUser, findUserByEmail, findUserById, passwordHashing } from "../services/user.service.js";
import bcrypt from "bcrypt" 
import {generateAccessToken, generateRefreshToken} from "../utils/token.js" 
import { storeRefreshToken } from "../services/token.service.js";
import {getRefreshToken} from "../services/token.service.js";
import { verifyRefreshToken } from "../utils/token.js";

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
    const AccessToken = generateAccessTokens(user._id , user.role) ;
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