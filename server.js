import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection (Change if needed)
mongoose.connect("mongodb+srv://abdelrahmanmohammed851:boda12345@cluster0.o9chdll.mongodb.net/volunteerDB", {
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

// ✅ Admin Schema & Model
const Admin = mongoose.model("Admin", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

// ✅ Create Default Admin (Only once)
(async () => {
  const adminExists = await Admin.findOne({ email: "admin@email.com" });
  if (!adminExists) {
    const hashed = await bcrypt.hash("123456", 10);
    await Admin.create({ email: "admin@email.com", password: hashed });
    // console.log("✅ Default admin created: email=admin@email.com | password=123456");
  }
})();

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

// ✅ Admin Login (Private Dashboard)
app.post("/api/login", async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(400).json({ message: "البريد الإلكتروني غير صحيح" });

    const valid = await bcrypt.compare(req.body.password, admin.password);
    if (!valid) return res.status(400).json({ message: "كلمة المرور غير صحيحة" });

    const token = jwt.sign({ id: admin._id }, "SECRET123", { expiresIn: "2h" });
    res.json({ token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
  }
});

// ✅ Middleware to Verify Admin Token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });

  jwt.verify(token, "SECRET123", (err, decoded) => {
    if (err) return res.status(403).json({ message: "رمز الدخول غير صالح" });
    req.adminId = decoded.id;
    next();
  });
}

// ✅ Get Volunteers (Private Dashboard)
app.get("/api/volunteers", verifyToken, async (req, res) => {
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
