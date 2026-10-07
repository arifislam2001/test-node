
const mongoose = require("mongoose")
const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        username:{
            type: String,
            required : true

        },
        email:{
            type : String,
            required : true,
            unique : true,
            trim : true
        },
        password:{
            type: String,
            required : true,
            trim : true
        },
          picture: { 
            type: String
         },
         profilePicture:{
            type : String
         },
         address:{
            type : String
         },
         phoneNumber :{
            type : String
         },
         gender :{
            type : String,
            enum : ["male" , "female" ,"others"]
         },
         dob:{
            type : String
         }
    },
      
    {
        timestamps : true
    }
)

 
   module.exports = mongoose.model("User", UserSchema)