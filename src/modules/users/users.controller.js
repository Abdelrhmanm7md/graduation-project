import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";

const getAllUsersByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(userModel.find(), req.query);
  await ApiFeat.pagination(); // Ensure pagination waits for total count

  let results = await ApiFeat.mongooseQuery;

  res.json({
    message: "Done",
    page: ApiFeat.page,
    totalPages: ApiFeat.totalPages,
    countAllUsers: await userModel.countDocuments(),
    results,
  });
});

const getUserById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let message = "User Not found";
  if (req.query.lang == "ar") {
    message = "المستخدم غير موجود";
  }
  let results = await userModel.findById(id);
  if (!results || results.length === 0) {
    return res.status(404).json({ message: message });
  }
  let lastSignIn = req.lastSignIn;
  results && res.json({ message: "Done", results, lastSignIn });
});
const prediction = catchAsync(async (req, res) => {
  const extension = path.extname(req.file.originalname);
  const oldPath = req.file.path;
  const newPath = path.join(
    req.file.destination,
    req.file.filename + extension
  );
  fs.renameSync(oldPath, newPath);
  console.log("Renamed file path:", newPath);

  const runPythonScript = (scriptPath) => {
    return new Promise((resolve, reject) => {
      execFile("python", [scriptPath, newPath], (error, stdout, stderr) => {
        console.log("stdout:", stdout);
        console.error("stderr:", stderr);
  
        if (error) {
          console.error(`فشل تشغيل ${scriptPath}`);
          console.error("تفاصيل الخطأ:", error);
          return reject(new Error(`فشل في المعالجة من ${scriptPath}: ${stderr || error.message}`));
        }
  
        try {
          const result = JSON.parse(stdout.split("###RESULT###")[1].trim());
          console.log(`نتائج المعالجة من ${scriptPath}:`, result);
          resolve(result);
        } catch (parseErr) {
          console.error(`فشل في تحويل النتائج من ${scriptPath}:`, parseErr);
          reject(new Error(`تنسيق الإخراج غير صالح من ${scriptPath}`));
        }
      });
    });
  };  

  try {
    const results = await Promise.all([
      runPythonScript("/root/graduation-project/process.py"),
      runPythonScript("/root/graduation-project/AlzhimerProcess.py"),
    ]);

    res.json({ message: "File uploaded and processed successfully", results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const updateUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let err = "couldn't update! not found!";
  let message = "User updated successfully!";
  if (req.query.lang == "ar") {
    err = "لا يمكن التحديث! المستخدم غير موجود";
    message = "تم تحديث المستخدم بنجاح!";
  }
  if (req.body.userType == "admin") {
    req.body.isApproved = true;
  }
  let results = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
    userId: req.userId,
    context: { query: req.query },
  });
  if (!results || results.length === 0) {
    return res.status(404).json({ message: err });
  }
  results && res.json({ message: message, results });
});

const deleteUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let user = await userModel.findByIdAndDelete(id);
  let message_1 = "Couldn't delete! Not found!";
  let message_2 = "User deleted successfully!";
  if (req.query.lang == "ar") {
    message_1 = "لم يتم الحذف! غير موجود!";
    message_2 = "تم حذف المستخدم بنجاح!";
  }
  if (!user) {
    return res.status(404).json({ message: message_1 });
  }

  res.status(200).json({ message: message_2 });
});

export { getAllUsersByAdmin, getUserById, prediction, updateUser, deleteUser };
