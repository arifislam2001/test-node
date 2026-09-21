const express = require("express");
const router = express.Router();


const authroute = require("./authrouter");
const productRoute = require("./productRoute");
const paymentrouter = require("./paymentrouter")


router.use("/auth", authroute);
router.use("/product", productRoute);
router.use("/payment" , paymentrouter)

module.exports = router;