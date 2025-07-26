import express from "express";
import mongoose from "mongoose";
import cors from "cors";


import * as dotenv from "dotenv";
dotenv.config();
const app = express();
// ✅ Middlewares
const corsOptions = {
  origin: "*", // In dev only — see previous message if using credentials
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ MongoDB Connection (Change if needed)
mongoose.connect(process.env.CONNECTIONSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Volunteer Schema & Model
const Volunteer = mongoose.model("Volunteer", new mongoose.Schema({
  fullName: { type: String, required: true },
  nationalId: { type: String, required: true },
  birthDate: { type: String, required: true },
  age: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  education: { type: String, required: true },
  volunteerType: { type: String, required: true },
  monthlyDays: { type: String, required: true },
  previousExperience: { type: String, required: true },
  availableDays: [String],
  innovativeIdeas: String,
  createdAt: { type: Date, default: Date.now }
}));


// ✅ Submit Volunteer (Public Website)
app.post("/api/volunteers", async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.json({ success: true, message: "تم حفظ طلب التطوع بنجاح" });
  } catch (err) {
    console.error("❌ Error saving volunteer:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء حفظ البيانات" });
  }
});


// ✅ Get Volunteers (Private Dashboard)
app.get("/api/volunteers", async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (err) {
    console.error("❌ Error fetching volunteers:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب البيانات" });
  }
});

// ✅ Start Server
const PORT = 8000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
