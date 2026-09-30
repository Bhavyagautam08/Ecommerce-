import User from "../models/user.model.js";
import bcrypt from "bcrypt" ;

const saltRounds = 8 ;

export const findUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email });
        return user;
    }catch (err) {
        console.error("Error:", err.message);

        throw new Error(
            "Something went wrong while searching for a user in the database."
        );
    }
};
export const createUser = async(data) =>{
    const user = await User.create(data) ;
    return user ;
}

export const checkIfUserExists = async(email) =>{
    const user = await User.findOne({email}) ;
    return !!user ;
}

export const passwordHashing = async(password) =>{
    const hashedPassword = await bcrypt.hash(password , saltRounds) ;
    return hashedPassword ;
}

export const findUserById = async (userID) => {
    const user = await User.findById(userID);
    return user;
};