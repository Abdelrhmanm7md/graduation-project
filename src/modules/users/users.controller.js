import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import { execFile } from "child_process";
import path from 'path';
import fs from 'fs';

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
const prediction = catchAsync(async (req, res) =>  {

  const extension = path.extname(req.file.originalname); // e.g., ".mat"
  
  const oldPath = req.file.path; // e.g., "uploads\\500b63db16972e239ddc89a00715a1f1"
  const newPath = path.join(req.file.destination, req.file.filename + extension);
  
  fs.renameSync(oldPath, newPath);
  
  console.log("Renamed file path:", newPath);
  let results = []
    execFile("python", ["process.py", newPath], (error, stdout, stderr) => {
      if (error) {
        console.error("خطأ في سكريبت البايثون:", stderr);
        return res.status(500).json({ error: "فشل في المعالجة" });
      }
  
      try {
          const result = JSON.parse(stdout.split("###RESULT###")[1].trim());
        results.push(result);
        console.log("نتائج المعالجة:", result);
      } catch (parseErr) {
        console.error("فشل في تحويل النتائج:", parseErr);
        res.status(500).json({ error: "تنسيق الإخراج غير صالح" });
      }
    });
     execFile("python", ["AlzhimerProcess.py", newPath], (error, stdout, stderr) => {
      if (error) {
        console.error("2خطأ في سكريبت البايثون:", stderr);
        return res.status(500).json({ error: "2فشل في المعالجة" });
      }
  
      try {
        const result = JSON.parse(stdout.split("###RESULT###")[1].trim());
        results.push(result);
        console.log("2 نتائج المعالجة:", result);
        res.json({ message: "File uploaded and processed successfully", results });
      } catch (parseErr) {
        console.error("2فشل في تحويل النتائج:", parseErr);
        res.status(500).json({ error: "2تنسيق الإخراج غير صالح" });
      }
    });
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

export { getAllUsersByAdmin, getUserById,prediction, updateUser, deleteUser };
