import User from "../models/userModel.js";

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

    try {
      await user.save();
      return res
        .status(201)
        .json({ status: "Success", message: "User created", data: user });
    } catch (error) {
      console.log("Server Error", error);
      return res.status(400).json({ message: "User create failed" });
    }
  },
};
