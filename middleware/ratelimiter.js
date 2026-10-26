const { rateLimit } = require("express-rate-limit");


const loginlimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: "Too many requests, please try again later." },
});

const registrationlimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: "Too many requests, please try again later." },
});

module.exports = {
    loginlimiter,
    registrationlimiter
}