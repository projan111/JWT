import User from "../models/userModel.js";
import JWT from "jsonwebtoken";

export default {
  getUsers: async (req, res) => {
    const users = await User.findOne({ email });
    return res.json({
      status: "Success",
      message: "Welcome to the new world",
      data: users,
    });
  },

  registerUser: async (req, res) => {
    const { name, phone, email, password } = req.body;

    const user = new User({
      name,
      phone,
      email,
      password,
    });

    if (!user)
      return res
        .status(400)
        .json({ status: "Failed", message: "User not found!!!" });

    // Generate token
    const payload = { name, email };
    const token = await JWT.sign(payload, process.env.SECRET_KEY);

    try {
      await user.save();
      return res
        .status(201)
        .json({ status: "Success", message: "User created", data: user, token });
    } catch (error) {
      console.log("Server Error", error);
      return res.status(400).json({ message: "User create failed" });
    }
  },

  userLogin: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "User does not exists!" });

      if (password === user.password)
        return res
          .status(200)
          .json({ status: "success", message: "User logged in", data: user });

      if (password !== user.password)
        return res
          .status(400)
          .json({ status: "Failed", message: "Fail to logged in" });
    } catch (error) {
      console.log("User login failed!");
    }
  },
};
