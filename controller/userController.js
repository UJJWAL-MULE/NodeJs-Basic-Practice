const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel.js");
const uploadToCloudnary = require("../ultil/cloudinary.js");

const generateAccessAndRefereshToken = async (user_id) => {
  try {
    const user_data = await userModel.findById(user_id);

    const access_token = user_data.generateAccessToken();
    const referesh_Token = user_data.generateRefresToken();
    console.log(access_token , "  ", referesh_Token)

    user_data.refreshToken = referesh_Token;
    user_data.save({ validateBeforeSave: false });

    return { access_token, referesh_Token };
  } catch (error) {
    // res.status(500).json({
    //   success: false,
    //   message: "error during fetching access and refresh token",
    // });
    console.log(error)
  }
};

const userReg = async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  try {
    const { username, email, fullName, password } = req.body;

    if (!username || !email || !fullName || !password) {
      res.send({
        message: "all fields are required",
      });
    }

    const existing_user = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existing_user) {
      res.status(409).send({
        message: "user with email or usrename exist",
      });
    }

    console.log(0);

    console.log(req.files);

    const avtarLocalfile = req.files?.avatar[0]?.path;

    const coverImageLocalfile = req.files?.coverImage[0]?.path;

    if (!avtarLocalfile) {
      res.send({
        message: "avatar filed is required",
      });
    }

    console.log(1);
    console.log(avtarLocalfile);

    const avatar = await uploadToCloudnary(avtarLocalfile);
    const coverImage = await uploadToCloudnary(coverImageLocalfile);

    console.log(2);

    console.log(avatar);

    const user = await userModel.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url,
      email,
      username,
      password,
    });

    console.log(3);

    const created_user = await userModel
      .findById(user._id)
      .select("-password -refreshToken");

    if (!created_user) {
      res.status(501).send({
        message: "somthing went wrong while registration of user",
      });
    }

    res.status(200).send({
      success: true,
      message: "user has ben created succesfully ",
      created_user,
    });
  } catch (error) {
    res.status(500).send({
      message: "internal server error",
    });
  }
};

const Login_control = async (req, res) => {
    //get email username password from body
    //validate data comming from body
    // get  user from database
    // validate user password  with database password
    // generate access and referesh token
    // update refresh token in database
    // create cookies
    // send json res with access and referesh token
  try {
    // console.log(0)

    const { username, email,  password } = req.body;

    // console.log(req.body)

    if (!username && !email ) {
      res.status(401).json({
        success: false,
        message: "username and password is required",
      });
    }
    // console.log(1)

    const user = await userModel.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found please register",
      });
    }

    // console.log(2)

    const isPasswordCorrect = user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      res.status(402).json({
        success: false,
        message: "inavalid username or password",
      });
    }

    // console.log(3)

    const { access_token, referesh_Token } =
      await generateAccessAndRefereshToken(user._id);

    //httpOnly helps to update cookies only from server side  , client side would not be able to update but only it will be visible for them
    const options = {
      httpOnly: true,
      secure: true,
    };

    const user_Only_data = await userModel
      .findOne({ $or: [{ username }, { email }] })
      .select("-password -refreshToken");

    res
      .status(200)
      .cookie("access_token", access_token, options)
      .cookie("referesh_token", referesh_Token, options)
      .json({
        success: true,
        message: "log in successfully",
        user_Only_data,
        access_token,
        referesh_Token,
      });
  } catch (error) {
    console.log(error)
    res.status(500).send({
      message: "internal server error"
    });
  }
};

const Logout = async (req, res) => {
  console.log(1)
  console.log(req.user._id)   // ._id gives u complete id object like "new ObjectId('66371b49b6071e7860e1b42c') " 
                             //   where as .id gives u only id "66371b49b6071e7860e1b42c"


  await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res.status(200)
  .clearCookie("access_token",options)
  .clearCookie("referesh_token",options)
  .json({
    success:true,
    message:"logout succesfuly"
  })
};



// making endpoint for  generating access and referesh token when user is logined and closed window  
// insted of agao=in login we created endPoint  when fronted hits this end point 
// we wil check wheather incomming refresh token and database referesh token are simmler we genreate new access and referesh token 
//this will be applicable until you inital refresh token expires if referesh token expires then u have login using id and passsowrd

const RefereshAccessToken =async (req,res)=>{

  try {
    
    const incommingRefereshToken = req.cookies.referesh_token || req.body.referesh_token

    if(!incommingRefereshToken){
      res.status(401).json({
        success: false,
        message: "Referesh Token is expired or correct",
      });
    }

    // verifying or decoding refersh token

    const decodeToken= await jwt.verify(incommingRefereshToken,process.env.REFRESH_TOKEN_SECRET)
    
    if(!decodeToken){
      res.status(401).json({
        success: false,
        message: "Referesh Token is not authenticate",
      });
    }

    const user = await userModel.findById(decodeToken._id)
    if(!user){
      res.status(404).json({
        success: false,
        message: "juser not found",
      });
    }

    if(incommingRefereshToken !== user.refreshToken){
      res.status(401).json({
        success: false,
        message: "unAutorised user detected",
      });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
  
    const {access_token, referesh_Token } = await generateAccessAndRefereshToken(user)

    res.status(200)
       .cookie("access_token", access_token, options)
       .cookie("referesh_token", referesh_Token, options)
       .json({
        success:true,
        message:"token has been refreshed successfully",
        access_token,
        referesh_Token,

       })
  

  } catch (error) {
    res.status(500).send({
      message:"internal server error",
      error:error.message
  })
}
}

const changeCurrentPassword =async (req , res)=>{
    const {currentPassword , newPassword} = req.body
    const user = await userModel.findById(req.user._id)
    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found please register",
      });
    }
    const isPasswordCorrect = user.isPasswordCorrect(currentPassword)
    if(!isPasswordCorrect){
      res.status(400).json({
        success:false,
        message:"invalid password"
      })
    }

    user.password =newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
              .json({ 
                success:true,
                message:"password change successfully"
              })
}


const getCurrentUser =async (res ,req)=>{
  return res.status(200).json({
    success:true,
    message:"currrent data fetched successfully",
    user:req.user
  })
}

const changeAvtarImg= async (res,req)=>{
  const avtarImg = req.file?.path
  if(!avtarImg){
    res.status(400).json({
      success:false,
      message:"avtar imag not abe to fetch"
    })
  }

  const avtar_data=uploadToCloudnary(avtarImg)
  if(!avtar_data){
    res.status(400).json({
      success:false,
      message:"avtar data not able to fetch"
    })
  }

  const user = await userModel.findByIdAndUpdate(req.user._id,{
    $set:{avtar:avtar_data.url}
  },{
    new:true
  })
  res.status(200).json({
    sucess:true,
    message:"image has been updated"
  })
}

module.exports = { userReg, Login_control, Logout , RefereshAccessToken ,changeCurrentPassword ,getCurrentUser,changeAvtarImg};
