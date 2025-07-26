const mongoose = require('mongoose')
const colors = require('colors')


const connect_db = async()=>{



  try{
    const con = await mongoose.connect(`${process.env.Mongo_url}`)
    console.log("you have connected successfully".bgGreen.white)
  }
  catch (error) {
    console.log(`error during connecting to database and error is ${error}`.bgRed )
  }
}

module.exports= connect_db