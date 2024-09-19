import express from "express";
import User from "../models/userModel.js";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";

export default {
  getUsers: async (req, res) => {
    const users = await User.find({});
    return res.json({
      status: "Success",
      message: "Welcome to the new world",
      data: users,
    });
  },

  registerUser: async (req, res) => {
    const { name, phone, email, password, role } = req.body;

    // Generate token
    // const payload = { name, email };
    // const token = await JWT.sign(payload, process.env.SECRET_KEY);

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
      const token = JWT.sign(payload, process.env.SECRET_KEY);

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

      // Generate JWT token if login is successful
      const payload = { id: user._id, role: user.role };
      const token = JWT.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      return res.json({ token });
    } catch (error) {
      console.log("User login failed!");
    }
  },
};
