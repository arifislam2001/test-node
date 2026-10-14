const usermodel = require("../model/usermodel");
const bcrypt = require("bcrypt");
const {
  hashToken,
  generateRandomToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshCookieOptions,
} = require("../helper/tokenHelper");
const {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
} = require("../helper/mailer");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const getApiBaseUrl = () => {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 9000}`;
  const baseUrl = process.env.BASE_URL || "/api/v1";
  return `${serverUrl}${baseUrl}`;
};

const getVerifyEmailUrl = (token) => {
  if (process.env.CLIENT_URL) {
    return `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  }
  return `${getApiBaseUrl()}/auth/verify-email/${token}`;
};

const getResetPasswordUrl = (token) => {
  if (process.env.CLIENT_URL) {
    return `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  }
  return `${getApiBaseUrl()}/auth/reset-password/${token}`;
};

const issueAuthTokens = async (user, res) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id.toString() });

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

  return { accessToken, refreshToken };
};

const sendVerificationEmail = async (user, rawToken) => {
  const verifyUrl = getVerifyEmailUrl(rawToken);
  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: verificationEmailTemplate(user.username, verifyUrl),
  });
};

const setEmailVerificationToken = async (user) => {
  const rawToken = generateRandomToken();
  user.emailVerificationToken = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  return rawToken;
};

const getalluser = async (req, res) => {
  try {
    const data = await usermodel.find();
    res.send(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const registation = async (req, res) => {
  try {
    const { username, email, password, address, phoneNumber, gender, dob } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Please enter a username",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter a email",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter a password",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password will be 8 character",
      });
    }

    if (username.length > 16) {
      return res.status(400).json({
        success: false,
        message: "Username max will be 16 word",
      });
    }

    if (!gender) {
      return res.status(400).json({
        success: false,
        message: "Please select a gender",
      });
    }

    const existuser = await usermodel.findOne({ email: email.toLowerCase() });

    if (existuser) {
      if (!existuser.isEmailVerified) {
        return res.status(409).json({
          success: false,
          message: "Email already registered but not verified. Use resend verification.",
          email: existuser.email,
        });
      }

      return res.status(409).json({
        success: false,
        message: "email already existed",
        email: existuser.email,
      });
    }

    const picture = req.file ? req.file.path : "";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await usermodel.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      picture,
      Profilepicture: picture,
      address,
      phoneNumber,
      gender,
      dob,
      isEmailVerified: false,
    });

    const rawToken = await setEmailVerificationToken(user);

    try {
      await sendVerificationEmail(user, rawToken);
    } catch (mailError) {
      return res.status(201).json({
        success: true,
        message: "User created, but verification email could not be sent. Check SMTP settings and use resend verification.",
        data: user.toSafeObject(),
        mailError: mailError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User created. Please check your email to verify your account.",
      data: user.toSafeObject(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await usermodel
      .findOne({ email: email.toLowerCase() })
      .select("+password +refreshToken");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before login",
      });
    }

    const tokens = await issueAuthTokens(user, res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: user.toSafeObject(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashed = hashToken(token);
    const user = await usermodel
      .findOne({
        emailVerificationToken: hashed,
        emailVerificationExpires: { $gt: new Date() },
      })
      .select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await usermodel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const rawToken = await setEmailVerificationToken(user);
    await sendVerificationEmail(user, rawToken);

    return res.status(200).json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decoded = verifyRefreshToken(incomingToken);
    const user = await usermodel.findById(decoded.id).select("+refreshToken");

    if (!user || !user.refreshToken || user.refreshToken !== hashToken(incomingToken)) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const tokens = await issueAuthTokens(user, res);

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

const logout = async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (incomingToken) {
      try {
        const decoded = verifyRefreshToken(incomingToken);
        await usermodel.findByIdAndUpdate(decoded.id, {
          $unset: { refreshToken: 1 },
        });
      } catch (error) {
        // Token may already be expired; still clear the cookie.
      }
    } else if (req.user?._id) {
      await usermodel.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 },
      });
    }

    res.clearCookie("refreshToken", getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const genericMessage = "If that email exists, a password reset link has been sent.";
    const user = await usermodel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const rawToken = generateRandomToken();
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: resetPasswordEmailTemplate(user.username, getResetPasswordUrl(rawToken)),
    });

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const hashed = hashToken(token);
    const user = await usermodel
      .findOne({
        passwordResetToken: hashed,
        passwordResetExpires: { $gt: new Date() },
      })
      .select("+passwordResetToken +passwordResetExpires +password +refreshToken");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.clearCookie("refreshToken", getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const userdeleate = async (req, res) => {
  const { id } = req.params;

  try {
    const deletaeuser = await usermodel.findByIdAndDelete(id);

    if (!deletaeuser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "deleate hoise" });
  } catch (error) {
    res.status(500).json({ message: "can't deleate", error: error.message });
  }
};

const userupdate = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    const updatePayload = { username, email };

    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    const updateuser = await usermodel.findByIdAndUpdate(id, updatePayload, {
      new: true,
    });

    if (!updateuser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "update hoise", data: updateuser });
  } catch (error) {
    res.status(500).json({ message: "update hoinai", error: error.message });
  }
};

const uploadpicture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "you have to picture",
      });
    }

    const picture = req.file.path || req.file.filename;

    const updateduser = await usermodel.findByIdAndUpdate(
      id,
      { picture, Profilepicture: picture },
      { new: true }
    );

    if (!updateduser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Picture uploaded successfully",
      data: updateduser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

module.exports = {
  registation,
  getalluser,
  userdeleate,
  userupdate,
  userlogin,
  uploadpicture,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
};
