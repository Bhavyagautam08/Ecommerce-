import express from 'express';
const router = express.Router() ;

router.get("/health", (req, res) => {
    res.status(200).send(
        { status: "ok" ,
          message: "Server is healthy and running."}) ;
    }) ;

export default router ;