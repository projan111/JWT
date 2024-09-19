import express from "express";
import userControllers from "../controllers/userControllers.js";
import { verifyToken, isAdmin } from "../middlewares/verifyToken.js";
const userRoute = express.Router();



userRoute.get("/users", verifyToken, userControllers.getUsers);
userRoute.post("/register", verifyToken, isAdmin, userControllers.registerUser);
userRoute.post("/login", userControllers.userLogin);

export default userRoute;
