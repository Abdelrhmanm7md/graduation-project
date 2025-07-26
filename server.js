import https from "https";
import fs from "fs";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.CONNECTIONSTRING)
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Volunteer Schema
const Volunteer = mongoose.model("Volunteer", new mongoose.Schema({
  fullName: String,
  nationalId: String,
  birthDate: String,
  age: Number,
  phoneNumber: String,
  education: String,
  volunteerType: String,
  monthlyDays: String,
  previousExperience: String,
  availableDays: [String],
  innovativeIdeas: String,
  createdAt: { type: Date, default: Date.now }
}));

// ✅ Routes
app.post("/api/volunteers", async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.json({ success: true, message: "تم حفظ طلب التطوع بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في حفظ البيانات" });
  }
});

app.get("/api/volunteers", async (req, res) => {
  const volunteers = await Volunteer.find().sort({ createdAt: -1 });
  res.json(volunteers);
});

// ✅ HTTPS Server
const PORT = 8000;
const httpsOptions = {
  key: fs.readFileSync("./server.key"),
  cert: fs.readFileSync("./server.cert")
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS Server running on https://69.62.121.22:${PORT}`);
});
