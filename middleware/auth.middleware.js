
const jwt = require("jsonwebtoken")
const userModel = require('../model/userModel.js')

 const verifyJWT= async (req,res ,next)=>{

  try {
   
    const cookieToken = req.cookies?.access_token || req.headers("Authorization")?.replace("Bearer ","")

  
    if (!cookieToken) {
      res.status(402).json({
        success:false,
        message:"cookie token is not present"
    })
    }
    
    const decodeJWT = jwt.decode(cookieToken,process.env.ACCESS_TOKEN_SECRET)
  
    const user = await userModel.findById(decodeJWT._id).select('-password -refreshToken')
  
    req.user= user
    next()
  } catch (error) {
    res.status(500).send({
      message:"internal server error",
      error
    })
  }

}


module.exports = {verifyJWT}