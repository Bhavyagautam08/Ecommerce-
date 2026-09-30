import mongoose from "mongoose" ;
import { MONGO_URI } from "./env.js" ;

const connectDB = async() =>{
    try{
        await mongoose.connect(MONGO_URI) ;
        console.log("MongoDB connected successfully") ;
    }catch(err){
        throw new Error(`Error connecting to MongoDB: ${err.message}`) ;
        console.error(`Error connecting to MongoDB: ${err.message}`) ;
    }
}

export default connectDB ;
