const express = require("express");
const router = express.Router();
const dashboardcontroller = require("../../controller/dashboardcontroller");
const { protect, requiedAdmin } = require("../../middleware/authMiddleware");

router.use(protect)
router.get("/alluser", protect, dashboardcontroller.getallusercontroller);
router.delete("/delete/:id", protect, requiedAdmin, dashboardcontroller.getuserdeleate);
router.patch("/update/:id", protect, requiedAdmin, dashboardcontroller.getuserupdate);

module.exports = router;