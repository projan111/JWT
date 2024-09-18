import mongoose from "mongoose";

export default function mongodb(uri) {
  mongoose
    .connect(uri)
    .then(() => console.log("Mongodb Connected!"))
    .catch((error) => console.log("DB connection failed!!!", error));
}
