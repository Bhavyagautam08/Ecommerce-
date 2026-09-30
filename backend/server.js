import app from "./src/app.js" 
import dotenv from "dotenv" 
import {PORT} from "./src/config/env.js";

dotenv.config() ;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});