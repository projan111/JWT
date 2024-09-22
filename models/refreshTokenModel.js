import mongoose from "mongoose";

const refreshToken = new mongoose.Schema({
  token: { type: String, required: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const RefreshToken = mongoose.model("RefreshToken", refreshToken);
export default RefreshToken;
