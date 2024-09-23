import User from "../models/userModel.js";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import RefreshToken from "../models/refreshTokenModel.js";
import nodemailer from "nodemailer";

export default {
  registerUser: async (req, res) => {
    const { name, phone, email, password, role } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists!" });

      // Create new user
      const user = new User({
        name,
        phone,
        email,
        password,
        role,
        isVerified: false,
      });

      if (!user)
        return res
          .status(400)
          .json({ status: "Failed", message: "User not found!!!" });

      await user.save();

      return res.status(201).json({
        status: "Success",
        message: "User registered. Please verify your email.",
        data: user,
        token,
      });
    } catch (error) {
      console.log("Server Error", error);
      return res.status(400).json({ message: "User create failed" });
    }
  },

  userLogin: async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find the user by email
      const user = await User.findOne({ email });

      if (!user)
        return res.status(400).json({ message: "User does not exists!" });

      // console.log("Stored Password:", user.password);
      // compare or match the password of user
      const isMatch = await bcryptjs.compare(password, user.password);

      if (!isMatch)
        return res.status(400).json({
          message: "Invalid username or password",
        });

      // Payload with user data
      const payload = { id: user._id, role: user.role };
      // Generate access token (short-lived)
      const token = JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      });
      // Generate refresh token (long-lived)
      const refreshToken = JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      // Send the refreshToken to the HTTP-Only Cookie
      //res.cookie("refreshToken", refreshToken, {
      //httpOnly: true, // Prevents JavaScript access to the cookie
      //secure: true, // Ensures the cookie is sent only over HTTPS
      //sameSite: "strict", // Helps prevent CSRF
      //maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
      //});

      // Save the refresh token in the database
      await RefreshToken.create({
        token: refreshToken,
        userId: user._id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire in 7 days
      });

      return res.json({ token, refreshToken });
    } catch (error) {
      console.error("User login failed!", error); // Log the actual error
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getUsers: async (req, res) => {
    const users = await User.find({});
    return res.json({
      status: "Success",
      message: "Welcome to the new world",
      data: users,
    });
  },

  getUserById: async (req, res) => {
    const uid = req.params.id;
    try {
      const user = await User.findById({ _id: uid });
      if (!user)
        return res.status(404).json({ message: "User does not exists" });

      return res
        .status(200)
        .json({ status: "Success", message: "User found", user });
    } catch (error) {
      res.json({ message: "error getting user by id" });
    }
  },

  deleteUserById: async (req, res) => {
    const uid = req.params.id;
    try {
      const user = await User.findByIdAndDelete({ _id: uid });
      if (!user) return res.status(404).json({ message: "User not found!" });

      return res
        .status(200)
        .json({ status: "Success", message: "User Deleted", user });
    } catch (error) {
      res.json({ message: "error while deleting user" });
    }
  },

  updateUsers: async (req, res) => {
    const uid = req.params.uid;
    const { name, email, phone, role } = req.body; // Extract updatable fields

    try {
      const user = await User.findByIdAndUpdate(
        uid,
        { name, email, phone, role },
        { new: true }
      ); // Find the user by ID and update

      if (!user) return res.status(404).send("User not found");

      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error details:", error);
      res
        .status(500)
        .json({ message: "Error on updating user", error: error.message });
    }
  },

  createNewRefreshToken: async (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken)
      return res.status(401).json({ message: "No token provided!" });

    try {
      // Check if the refresh token exists in the database
      const storedToken = await RefreshToken.findOne({ token: refreshToken });
      if (!storedToken)
        return res
          .status(403)
          .json({ message: "Refresh token not found or invalid" });

      // Verify if the refresh token has expired
      if (new Date(storedToken.expires) < new Date()) {
        return res
          .status(403)
          .json({ message: "Refresh token has expired!!!" });
      }

      // Verify new refresh Token
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err)
            return res.status(403).json({ message: "Invalid Refresh Token" });

          // Payload with user data
          const payload = { id: user._id, role: user.role };

          // Generate a new access token
          const newAccessToken = JWT.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "15m",
            }
          );

          res.json({ accessToken: newAccessToken });
        }
      );
    } catch (error) {
      console.error("Token Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  logOut: async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken)
      return res.status(403).json({ message: "No token provided" });

    try {
      // Remove the refresh token from the database
      const result = await RefreshToken.findOneAndDelete({
        token: refreshToken,
      });

      // If the token wasn't found in the database
      if (!result) {
        return res.status(404).json({ message: "Refresh token not found" });
      }

      res.status(201).json({ message: "Token Deleted while loggin out!" });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  verifyEmail: async (req, res) => {
    const { token } = req.params;
    try {
      const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid token or user doesn't exist" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "User already verified" });
      }

      user.isVerified = true;
      await user.save();

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification failed", error);
      res.status(400).json({ message: "Invalid or expired token" });
    }
  },

  requestPasswordReset: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const payload = { id: user._id };
      const token = JWT.sign(payload, process.env.RESET_PASSWORD_SECRET, {
        expiresIn: "15m",
      });

      // Send Password reset email
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset",
        html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password/${token}">here</a> to reset your password.</p>`,
      };

      transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending password reset email", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  resetPassword: async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      const decoded = JWT.verify(token, process.env.RESET_PASSWORD_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res
          .status(404)
          .json({ message: "Invalid token or user doesn't exist" });
      }

      // Hash the new password
      const salt = await bcryptjs.genSalt(10);
      user.password = await bcryptjs.hash(newPassword, salt);

      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset failed", error);
      res.status(400).json({ message: "Invalid or expired token" });
    }
  },
};
