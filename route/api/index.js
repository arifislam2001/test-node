const express = require("express");
const router = express.Router();


const authroute = require("./authrouter");
const productRoute = require("./productRoute");
const paymentrouter = require("./paymentrouter")
const dashboardroute = require("./dashboardroute")


router.use("/auth", authroute);
router.use("/product", productRoute);
router.use("/payment" , paymentrouter)
router.use("/dashboard" , dashboardroute)

module.exports = router;