const userModel = require("../model/UserModel");
const {
  hashToken,
  generateSecureToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../helper/tokenHelper");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../helper/mailer");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VERIFICATION_EXPIRE_MS = 24 * 60 * 60 * 1000;
const RESET_EXPIRE_MS = 60 * 60 * 1000;

const issueAuthTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registrationController = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      profilePicture,
      address,
      phone,
      gender,
      dob,
      role
    } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Please enter a username",
      });
    }
    if (username.length > 16) {
      return res.status(400).json({
        success: false,
        message: "Username max length is 16",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter an email",
      });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter a password",
      });
    }
    if (!gender) {
      return res.status(400).json({
        success: false,
        message: "Please select your gender",
      });
    }

    const plainVerificationToken = generateSecureToken();


    const user = await userModel.create({
      username,
      email,
      password,
      profilePicture,
      address,
      phone,
      gender,
      dob,
      role,
      emailVerificationToken: hashToken(plainVerificationToken),
      emailVerificationTokenExpires: new Date(Date.now() + VERIFICATION_EXPIRE_MS),
    });

    try {
      await sendVerificationEmail(user.email, user.username, plainVerificationToken);
    } catch (mailError) {
      await userModel.findByIdAndDelete(user._id);
      console.error("Verification email failed:", mailError);
      return res.status(500).json({
        success: false,
        message: "Registration failed: could not send verification email",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email }).select("+password +refreshToken");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const { accessToken, refreshToken } = await issueAuthTokens(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          address: user.address,
          phone: user.phone,
          gender: user.gender,
          dob: user.dob,
          isEmailVerified: user.isEmailVerified
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const hashed = hashToken(token);
    const user = await userModel
      .findOne({
        emailVerificationToken: hashed,
        emailVerificationTokenExpires: { $gt: Date.now() },
      })
      .select("+emailVerificationToken +emailVerificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can log in now.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel
      .findOne({ email })
      .select("+emailVerificationToken +emailVerificationTokenExpires");

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered, a verification link has been sent",
      });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const plainVerificationToken = generateSecureToken();
    user.emailVerificationToken = hashToken(plainVerificationToken);
    user.emailVerificationTokenExpires = new Date(
      Date.now() + VERIFICATION_EXPIRE_MS,
    );
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user.email, user.username, plainVerificationToken);

    return res.status(200).json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not send verification email",
    });
  }
};

const refreshTokenController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await userModel.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== hashToken(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const accessToken = generateAccessToken(user);
    return res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not refresh token",
    });
  }
};

const logoutController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(200).json({
        success: true,
        message: "Logged out",
      });
    }

    const user = await userModel.findById(decoded.id).select("+refreshToken");
    if (user && user.refreshToken === hashToken(refreshToken)) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel
      .findOne({ email })
      .select("+passwordResetToken +passwordResetTokenExpires");

    const genericMessage =
      "If that email is registered, a password reset link has been sent";

    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const plainResetToken = generateSecureToken();
    user.passwordResetToken = hashToken(plainResetToken);
    user.passwordResetTokenExpires = new Date(Date.now() + RESET_EXPIRE_MS);
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user.email, plainResetToken);

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not process password reset request",
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const hashed = hashToken(token);
    const user = await userModel
      .findOne({
        passwordResetToken: hashed,
        passwordResetTokenExpires: { $gt: Date.now() },
      })
      .select("+passwordResetToken +passwordResetTokenExpires +refreshToken");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

const getMeController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        address: user.address,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        role: user.role
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    console.log(req.file.path);
    
    let updateUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updateUser) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    if (req.file) {
      updateUser = await userModel.findByIdAndUpdate(
        req.user.id,
        { profilePicture: req.file.path },
        {
          new: true,
          runValidators: true,
        },
      );
    }

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully.",
      data: updateUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registrationController,
  loginController,
  verifyEmailController,
  resendVerificationController,
  refreshTokenController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  getMeController,
  updateProfile
};