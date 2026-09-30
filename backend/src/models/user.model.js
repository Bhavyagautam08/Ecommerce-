import mongoose from "mongoose" ;

const userSchema = new mongoose.Schema({

    name : {
        type : String ,
        required : true ,
        trim : true 
    },
    email : {
        type : String ,
        lowercase : true ,
        required : true ,
        unique : true ,
        trim : true 
    },
    age : {
        type : Number,
        required : true 
    },
    gender : {
        type : String ,
        enum: ["male", "female", "not to say"]  
    },
    password : {
        type : String ,
        required : true 
    },
    avatar : {
        type : String , 
        required : false 
    },
    role : {
        type : String ,
        required : true ,
        default : "user",
        enum : ["user" , "admin"]
    }
}, 
    {
        timestamps : true
    }
);


const User = mongoose.model("User" , userSchema) ;

export default User ;