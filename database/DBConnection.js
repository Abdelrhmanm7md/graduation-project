import mongoose from "mongoose";

const dbConnection = async () => {
  try {

    await mongoose.connect(process.env.CONNECTIONSTRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Database successfully connected");
  } catch (err) {
    console.error(`❌ Database connection error: ${err.message}`);
    process.exit(1);
  }
};

export default dbConnection;
