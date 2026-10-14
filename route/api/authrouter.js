const express = require("express");
const router = express.Router();
const authcontroller = require("../../controller/authcontroller");
const upload = require("../../middleware/fileupload");
const { authenticate } = require("../../middleware/authMiddleware");

router.get("/alluser", authenticate, authcontroller.getalluser);

router.post("/registation", upload.single("picture"), authcontroller.registation);

router.delete("/delete/:id", authenticate, authcontroller.userdeleate);

router.put("/update/:id", authenticate, authcontroller.userupdate);

router.post("/login", authcontroller.userlogin);

router.get("/verify-email/:token", authcontroller.verifyEmail);
router.post("/verify-email", authcontroller.verifyEmail);

router.post("/resend-verification", authcontroller.resendVerificationEmail);

router.post("/refresh-token", authcontroller.refreshAccessToken);

router.post("/logout", authcontroller.logout);

router.post("/forgot-password", authcontroller.forgotPassword);

router.post("/reset-password", authcontroller.resetPassword);
router.post("/reset-password/:token", authcontroller.resetPassword);

module.exports = router;
