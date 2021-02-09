import mongoose from "mongoose";
export async function connectToMongoDB() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", () => {
    throw new Error("couldn't connect to database");
  });
  return db;
}