const adminDashboard = (req,res) =>{
    try{
        res.status(200).json({
            message : "Admin endpoint is sccuessfully wokring !!"
        })

    }catch(err){
        console.log("Error :" , err.message) ;
        throw err ;
    }
}

export default adminDashboard ;