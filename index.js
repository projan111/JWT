import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import mongodb from "./configs/db.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI;
mongodb(mongo_uri);
const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

//Routes
app.use("/ap/v1", userRoute);

//Unexpected error handling middleware
app.use((err, req, res, next) => {
  return res.status(501).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Listening to the port: http://localhost:${PORT}`);
});
