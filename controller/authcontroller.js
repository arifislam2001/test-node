<<<<<<< HEAD
const usermodel = require("../model/usermodel")

const getalluser = async (req , res)=>{
   const data = await usermodel.find()
   res.send(data)
}

const registation =async  (req ,res)=>{
   
  const { username , email , password} = req.body

  console.log(req.body);
  

  const existuser = await usermodel.findOne({email})

  if(existuser){
    res.status(409).json({
        success : false,
        message : "email already existed",
        email : existuser.email
    })
    return
  }
  
  const user = new usermodel({

      username : username,
      email : email,
      password : password
    
  })
  
  res.status(201).json({
    success : true,
    message : "User created",
    data : user
  })
  
  await user.save()
}

const userlogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await usermodel.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ success: false, message: "Wrong password" });
  }

  res.status(200).json({ success: true, message: "Login successful", user });
};




const userdeleate = async (req, res) => {
  const { id } = req.params;  

  try {
    const deletaeuser = await usermodel.findByIdAndDelete(id);
    
    if (!deletaeuser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "deleate hoise" });
  } catch (error) {
    res.status(500).json({ message: "can't deleate", error: error.message });
  }
};
  
const userupdate = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    const updateuser = await usermodel.findByIdAndUpdate(
      id,
      { username, email, password },

    );

    if (!updateuser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "update hoise", data: updateuser });   
  } catch (error) {
    res.status(500).json({ message: "update hoinai", error: error.message }); 
  }
};
module.exports = { registation , getalluser , userdeleate , userupdate , userlogin}
=======
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
>>>>>>> 8ff4119c7a8b12d1d72d5bccaed7d971df4dfc2e
