const usermodel = require("../model/usermodel")
const bcrypt = require("bcrypt");

const getalluser = async (req , res)=>{
   const data = await usermodel.find()
   res.send(data)
}


const registation =async  (req ,res)=>{
 
   const { username , email , password , profilepicture , address , phoneNumber , gender , dob} = req.body
   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  //  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

   const isvalid = emailRegex.test(email)
     if(!isvalid){
    res.status(400).json({
      success : false,
      message : "Enter a valid email"
    })
    return
   }

   if(!username){
    res.status(400).json({
      success : false,
      message : "Please enter a username"
    })
    return
   }
   
   if(!email){
     res.status(400).json({
       success : false,
       message : "Please enter a email"
      })
      return
    }
    
    if(!password){
    res.status(400).json({
      success : false,
      message : "Please enter a password"
    })
    return
   }

     if(password.length < 8){
       res.status(400).json({
        success : false,
        message : "Password will be 8 character"
      })
      return
     }

   if(username.length > 16){
      res.status(400).json({
      success : false,
      message : "Username max will be 16 word"
    })
    return
   }
  

   if(!gender){
     res.status(400).json({
      success : false,
      message : "Please select a gender"
    })
   }
  const existuser = await usermodel.findOne({email})

  if(existuser){
    res.status(409).json({
        success : false,
        message : "email already existed",
        email : existuser.email
    })
    return
  }
const picture = req.file ? req.file.path : "";

const hashedPassword = await bcrypt.hash(password, 10);

const user = await usermodel.create({
  username,
  email,
  password: hashedPassword,
  profilepicture,
  address,
  phoneNumber,
  gender,
  dob
});
  
  res.status(201).json({
    success : true,
    message : "User created",
    data : user
  })
  
}


const userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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



const uploadpicture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "you have to picture",
      });
    }

    const picture = req.file.filename;

    const updateduser = await usermodel.findByIdAndUpdate(
      id,
      { picture },
      { new: true }
    );

    if (!updateduser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Picture uploaded successfully",
      data: updateduser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

module.exports = { registation , getalluser , userdeleate , userupdate , userlogin , uploadpicture}

