import express from "express";
import userControllers from "../controllers/userControllers.js";
const userRoute = express.Router();

userRoute.get("/users", userControllers.getUsers);
userRoute.post("/register", userControllers.registerUser);

export default userRoute;
