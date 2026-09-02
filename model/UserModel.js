
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
        }
    },
    {
        timestamps : true
    }
)

   const UserModel = mongoose.model("User", UserSchema)
   module.exports = UserModel