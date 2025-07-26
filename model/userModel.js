const mongoose = require('mongoose')
var jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt')

const userSchema = new mongoose.Schema(
  {
      username: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true, 
          index: true
      },
      email: {
          type: String,
          required: true,
          unique: true,
          lowecase: true,
          trim: true, 
      },
      fullName: {
          type: String,
          required: true,
          trim: true, 
          index: true
      },
      avatar: {
          type: String, // cloudinary url
          required: true,
      },
      coverImage: {
          type: String, // cloudinary url
      },
      watchHistory: [
          {
              type: mongoose.Types.ObjectId,
              ref: "Video"
          }
      ],
      password: {
          type: String,
          required: [true, 'Password is required']
      },
      refreshToken: {
          type: String
      }

  },
  {
      timestamps: true
  }
)

// using pre i.e before saving to mongo database  convert password into hash password
userSchema.pre('save', async function(next){
  
  if( !this.isModified('password') ) 
  {
    return next()
  }
  this.password = await bcrypt.hash(this.password,10)
  next()

})

//creating new schema method to comapare password with hash password and return true or false
userSchema.methods.isPasswordCorrect= async function(password){
  const bol_data = await bcrypt.compare(password,this.password)
  return bol_data
}


userSchema.methods.generateAccessToken = function(){
  console.log(process.env.ACCESS_TOKEN_EXPIRY, "  " , typeof(process.env.ACCESS_TOKEN_EXPIRY))

  return jwt.sign({
    _id:this._id,
    username:this.username,
    email:this.email,
    fullName:this.fullName
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn : process.env.ACCESS_TOKEN_EXPIRY
  }
)

}


userSchema.methods.generateRefresToken = function(){

  return jwt.sign({
    _id:this._id
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  }
)

}

module.exports= mongoose.model("User",userSchema)