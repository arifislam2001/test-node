const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const generateAccessToken = (payload) => {
  if (!ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not set");
  }

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
};

const generateRefreshToken = (payload) => {
  if (!REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not set");
  }

  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

const getRefreshCookieOptions = () => {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: maxAgeMs,
    path: "/",
  };
};

module.exports = {
  hashToken,
  generateRandomToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshCookieOptions,
};
