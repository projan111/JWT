import express from "express";
import userControllers from "../controllers/userControllers.js";
import { verifyToken, isAdmin } from "../middlewares/verifyToken.js";
const userRoute = express.Router();

userRoute.post("/register", userControllers.registerUser);
userRoute.post("/login", userControllers.userLogin);
userRoute.get("/users", verifyToken, isAdmin, userControllers.getUsers);
userRoute.get("/user/:id", verifyToken, isAdmin, userControllers.getUserById);
userRoute.delete(
  "/user/:id",
  verifyToken,
  isAdmin,
  userControllers.deleteUserById
);
userRoute.put(
  "/user/update",
  verifyToken,
  isAdmin,
  userControllers.updateUsers
);

export default userRoute;
