import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import mongodb from "./configs/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI
mongodb(mongo_uri)
const app = express();

app.use("/ap/v1", userRoute);

app.listen(PORT, () => {
  console.log(`Listening to the port: http://localhost:${PORT}`);
});
