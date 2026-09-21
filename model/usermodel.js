
const mongoose = require("mongoose")

const { Schema } = mongoose

const UserScema =new Schema(
    {
        username: {
            type : String,
            required : true
        },
        email:{
            type : String,
            required : true,
            unique : true,
            trim : true,
        },
        password:{
             type : String,
            required : true,
          
          
        },
    },
    {timestamp : true}
)

module.exports = mongoose.model("user" , UserScema)