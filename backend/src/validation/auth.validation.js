    import {z} from "zod" 

    export const registerSchema = z.object({

        name : z.string().min(1).max(20) ,

        email : z.string().email() ,

        password : z.string().min(6).max(50) ,

        gender : z.enum(["male" , "female" , "not to say"]) ,

        age : z.coerce.number().int().min(14).max(120) ,
        
        avatar : z.string().optional() 
    })

    export const loginSchema = z.object({
        email : z.string().email() ,
        password : z.string().min(6).max(50) ,
    })
