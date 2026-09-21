const express = require("express");
const router = express.Router();
const apiRouter = require("./api/index");

const api = process.env.BASE_URL || `/api/v1`;

router.use(api, apiRouter);

router.use("/api/v2", apiRouter);

module.exports = router;