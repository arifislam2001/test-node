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
  const deleateuser = await UserModel.findByIdAndDelete(id.id)
    
    if(!deleateuser){
      res.status(409).json("Not found")
    }

   res.status(200).json("deleate succsesfully")
   
  } catch (error) {
    res.status(500).json("can't deleated")
  }
  
}

const Userupdate =async (req , res)=>{
  const id = req.params

  const {username , email , password} = req.body

  try {
  const updateuser =  await UserModel.findByIdAndUpdate(id.id ,{username , email , password})

   if(!updateuser){
    res.status(409).json("Not found")
   }

   res.status(200).json("Update Done")

  } catch (error) {
    res.status(500).json("can't updated")
  }
}

module.exports = { getUserAll , registration , Userdeleate , Userupdate}