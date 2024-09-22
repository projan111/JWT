import express from "express";
import User from "../models/userModel.js";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import RefreshToken from "../models/refreshTokenModel.js";

export default {
  registerUser: async (req, res) => {
    const { name, phone, email, password, role } = req.body;

    try {
      const user = new User({
        name,
        phone,
        email,
        password,
        role,
      });

      if (!user)
        return res
          .status(400)
          .json({ status: "Failed", message: "User not found!!!" });

      await user.save();

      // Create payload and generate token for JWT
      const payload = { id: user._id, role: user.role };
      const token = JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET);

      return res.status(201).json({
        status: "Success",
        message: "User registered successfully!",
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

      console.log("Stored Password:", user.password);
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
        expiresIn: "1h",
      });
      // Generate refresh token (long-lived)
      const refreshToken = JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET);

      // Save the refresh token in the database
      await RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expire in 7 days
      });

      return res.json({ token, refreshToken });
    } catch (error) {
      console.log("User login failed!");
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

    // Verify refresh Token
    JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ message: "Invalid Refresh Token" });

      // Payload with user data
      const payload = { id: user._id, role: user.role };

      // Generate a new access token
      const accessToken = JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.json({ accessToken });
    });
  },

  logOut: async (req, res) => {
    const refreshToken = req.body.token;
    refreshToken = refreshToken;
  },
};
