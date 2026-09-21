const express = require("express");
const router = express.Router();
const authcontroller = require("../../controller/authcontroller");

router.get("/alluser", authcontroller.getalluser);

router.post("/registation", authcontroller.registation);

router.delete("/delete/:id", authcontroller.userdeleate);

router.put("/update/:id", authcontroller.userupdate);

router.post("/login" , authcontroller.userlogin);

module.exports = router;
