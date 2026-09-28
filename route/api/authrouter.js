const express = require("express");
const router = express.Router();
const authcontroller = require("../../controller/authcontroller");
const upload = require("../../middleware/fileupload")


router.get("/alluser", authcontroller.getalluser);

router.post("/registation", upload.single('picture'), authcontroller.registation);

router.delete("/delete/:id", authcontroller.userdeleate);

router.put("/update/:id", authcontroller.userupdate);

router.post("/login", authcontroller.userlogin);


module.exports = router;
