
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
            trim : true,
            lowercase : true
        },
        password:{
            type: String,
            required : true,
            trim : true,
            select : false
        },
          picture: { 
            type: String
         },
         address :{
            type: String
         },
         Profilepicture:{
           type : String
         },
         phoneNumber:{
            type : String
         },
         gender:{
            type : String,
            enum : ["male" , "female", "others"]
         },
         dob:{
            type : String
         },
         role:{
            type : String,
            enum : ["admin", "user"],
            default : "user"
         },
         isEmailVerified:{
            type : Boolean,
            default : false
         },
         emailVerificationToken:{
            type : String,
            select : false
         },
         emailVerificationExpires:{
            type : Date,
            select : false
         },
         refreshToken:{
            type : String,
            select : false
         },
         passwordResetToken:{
            type : String,
            select : false
         },
         passwordResetExpires:{
            type : Date,
            select : false
         }
    },
      
    {
        timestamps : true
    }
)

UserSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.__v;
  return user;
};

 
   module.exports = mongoose.model("User", UserSchema)
