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
userRoute.put("/user/:uid", verifyToken, isAdmin, userControllers.updateUsers);

userRoute.post("/token", verifyToken, userControllers.createNewRefreshToken);
userRoute.post("/logout", verifyToken, userControllers.logOut);

userRoute.post("/request-password-reset", userControllers.requestPasswordReset);
userRoute.post('/reset-password/:token', userControllers.resetPassword)
userRoute.post('/verift-email/:token', userControllers.verifyEmail)


export default userRoute;
