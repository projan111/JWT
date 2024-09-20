import express from "express";
import User from "../models/userModel.js";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";

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
      const user = await User.findOne({ _id: uid }); // Find the user by the token ID

      if (!user) return res.status(404).send("User not found");

      user.name = name;
      user.email = email;
      user.phone = phone;
      user.role = role;

      // Save the updated user
      await user.save();

      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error details:", error);
      res
        .status(500)
        .json({ message: "Error on updating user", error: error.message });
    }
  },
};
