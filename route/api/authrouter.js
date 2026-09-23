const express = require("express");
const router = express.Router();
const authcontroller = require("../../controller/authcontroller");
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = 'Img-' + Date.now() + '-' + file.originalname;
    cb(null,   uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.get("/alluser", authcontroller.getalluser);

router.post("/registation", upload.single('picture'), authcontroller.registation);

router.delete("/delete/:id", authcontroller.userdeleate);

router.put("/update/:id", authcontroller.userupdate);

router.post("/login", authcontroller.userlogin);


module.exports = router;
