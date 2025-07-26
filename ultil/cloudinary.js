const cloudinary = require('cloudinary').v2
const fs = require('fs')
const dotenv = require('dotenv')

// cloudinary.config({ 
//   cloud_name: 'dtcmp7ib1'   ,                        
//   api_key:   '988572837952298',                    
//   api_secret:'sH8nx8XifvDT3XOlHmYfg-wXA1c'       
// });

dotenv.config()

cloudinary.config({ 
  cloud_name: process.env.CLOUDNAARY_CLOUD_NAME,                        
  api_key: process.env.CLOUDNAARY_API_KEY,                    
  api_secret: process.env.CLOUDNAARY_API_SECRET       
});



const uploadToCloudnary= async (localFilePath)=>{
  try {
    if(!localFilePath) return null

    const result= await  cloudinary.uploader.upload(localFilePath,
    { resource_type:'auto'}
  );

    console.log("file is uploades successfully", result)

    return result
    
  } catch (error) {

    fs.unlinkSync(localFilePath)
    console.log(error)
  }

}

module.exports=uploadToCloudnary
