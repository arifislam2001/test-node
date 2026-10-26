const usermodel = require("../model/UserModel")

function formatUser(user){
  return{
    id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    address: user.address,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}


const getallusercontroller = async (req, res) => {
  try {
    const loggdinuserId = req.user.id
    const loggedinuser = await usermodel.findById(loggdinuserId)
    const user = await usermodel.find({
      _id : {$ne : loggdinuserId}
    })
    res.status(200).json({
      success : false,
      message : "User get Successfully",
      data : {
       user: user.map(formatUser),
       length : user.length
      },
      loggdinuser: loggedinuser
    })
  } catch (error) {
    res.send(error)
  }
};
const getuserdeleate = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: "You can't delete yourself" });
    }

    const deleted = await usermodel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Could not delete" });
  }
};

const getuserupdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const updated = await usermodel.findByIdAndUpdate(
      id,
      { username },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Could not update" });
  }
};

module.exports = { getallusercontroller , getuserdeleate , getuserupdate }