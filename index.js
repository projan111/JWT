import express from "express";
import dotenv from "dotenv";
dotenv.config();
import userRoute from "./routes/userRoute.js";
import mongodb from "./configs/db.js";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI;
mongodb(mongo_uri);
const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

// Health Check
app.get("/health-check", (req, res) => {
  res.status(200).json({ status: "OK", message: "Your health is Fine." });
});

//Routes
app.use("/api/v1", userRoute);

//Unexpected error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  return res
    .status(500)
    .json({ message: "Internal Server Error | Unexpected Error!!!" });
});

app.listen(PORT, () => {
  console.log(`Listening to the port: http://localhost:${PORT}`);
});
