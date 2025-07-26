const mongoose =require("mongoose")

const SubscriberSchema = mongoose.Schema({

  subscriber:{
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  channel:{
    type: mongoose.Types.ObjectId,
    ref: "User"
  }
},{timestamps:true})

module.exports = mongoose.model('Subscriber',SubscriberSchema)