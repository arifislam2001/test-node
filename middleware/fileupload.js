const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require("cloudinary").v2

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = 'Img-' + Date.now() + '-' + file.originalname;
//     cb(null,   uniqueSuffix);
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Node-Upload',
   allowed_formats : ["png" , "jpeg" , "jpg"]
  },
});
 
const upload = multer({ storage: storage });

module.exports = upload