const express= require('express')
const dotenv =require('dotenv')
const userRoutes =require('./routes/userRoutes.js')
const connect_db = require('./db.js')
const cookieParser = require('cookie-parser')


const app=express()

app.use(express.json())

dotenv.config()

connect_db()

 app.use(cookieParser())

app.use('/api/register',userRoutes)


app.listen(process.env.port,()=>{`connected to port ${process.env.port}`})