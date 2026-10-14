const usermodel = require("../model/usermodel");
const { verifyAccessToken } = require("../helper/tokenHelper");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    const user = await usermodel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

const requireVerifiedEmail = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first",
    });
  }

  next();
};

module.exports = {
  authenticate,
  requireVerifiedEmail,
};
