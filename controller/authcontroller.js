  const UserModel = require("../model/UserModel")
  const getUserAll = async (req , res)=>{
   const data = await UserModel.find()
   res.send(data)
   
  }
  const registration = async (req, res)=>{
    const {username , email , password} = req.body
    
    const existeduser = await UserModel.findOne({email : email})


    if(existeduser){
      res.send("user already existed")
      return
    }
    const users = new UserModel({
       username: username ,
        email: email , 
        password: password
      });


      await users.save();

      res.send("user create successfully.......")
  }
module.exports = { getUserAll , registration}