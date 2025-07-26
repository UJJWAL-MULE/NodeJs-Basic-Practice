const express =require('express')
const {userReg, Login_control , Logout, RefereshAccessToken} = require('../controller/userController.js')
const upload = require('../middleware/multer.js')
const { verifyJWT } = require('../middleware/auth.middleware.js')


const router = express.Router()

router.post('/newReg',upload.fields([
  {
    name:"avatar",
    maxCount:1

  },
  {
    name:"coverImage",
    maxCount:1
  }
]),userReg)

//router.post('/login',Login_control)

router.post('/login_user',Login_control)

// seecure routes  i.e you are logged in 
router.post("/logout",verifyJWT,Logout)

router.post('referesh_token',RefereshAccessToken)

module.exports =router