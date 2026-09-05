  const UserModel = require("../model/UserModel")
  
  const getUserAll = async (req , res)=>{
   const data = await UserModel.find()
   res.send(data)

   
   
  }
  const registration = async (req, res)=>{
    const {username , email , password} = req.body
    
    const existeduser = await UserModel.findOne({email : email})
   

    if(existeduser){
      res.status(409).json({
         success : false,
         message : "User already existed",
         email : existeduser.email
      })
      return
    }
    const users = new UserModel({
       username: username ,
        email: email , 
        password: password
      });


      await users.save();

     res.status(201).json({
      success : true,
      message : "User Created",
      data : users

     })
  }

  const Userdeleate = async (req , res)=>{
    const id = req.params
    try {
      await  UserModel.findByIdAndDelete(id.id)
      res.send("deleate hoise")
    } catch (error) {
      res.send("can't deleated")
    }
   
   
  }
  const Userupdate =async (req , res)=>{
    const id = req.params
    const {username , email, password} = req.body
    try {
      await  UserModel.findByIdAndUpdate(id.id,{username , email , password})
      res.send("update hoise")
    } catch (error) {
      res.send("can't updated")
    }
   
   
  }

module.exports = { getUserAll , registration , Userdeleate , Userupdate}