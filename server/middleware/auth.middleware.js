const jwt=require('jsonwebtoken')
require("dotenv").config()

const requireAuth=(req,res,err,next)=>{
    const token=req.headers.authorization
    console.log("tokenmiddleware:",token)
    try {
        if(token){
            const decoded=jwt.verify(token,process.env.PORT)
            if(decoded){
                req.body.userId=decoded.userId;
                next();
            }
    
        }else{
            res.status(401).send({"msg":'No token, authorization denied'})
        }
    } catch (error) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
}
module.exports={
    requireAuth
}