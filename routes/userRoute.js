import express from "express";
import userControllers from "../controllers/userControllers.js";
import { verifyToken, isAdmin } from "../middlewares/verifyToken.js";
const userRoute = express.Router();

userRoute.post("/register", userControllers.registerUser);
userRoute.post("/login", userControllers.userLogin);
userRoute.get("/users", verifyToken, isAdmin, userControllers.getUsers);

export default userRoute;
