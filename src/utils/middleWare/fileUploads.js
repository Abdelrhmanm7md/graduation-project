import multer from "multer";
import AppError from "../appError.js";
export const fileSizeLimitErrorHandler = (err, req, res, next) => {
  if (err) {
    res.status(400).json({ message: err.message });
  } else {
    next();
  }
};
export function fileFilterHandler(file, req, cb) {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.files.profilePic[0].mimetype);
  // console.log(file.files.profilePic[0].mimetype,"mmmmm");
  // console.log(mimetype,"mmmmm");

  if (mimetype) {
    return cb(null, true);
  } else {
    return cb(
      new AppError("Please, Upload a Valid Image JPEG or PNG or JPG", 400),
      false
    );
  }
}

let options = (folderName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/${folderName}`);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
  function fileFilter(file, req, cb) {
    //   if(file.mimetype){
    //   if (file.mimetype.startsWith("image")) {
    //     cb(null, true);
    //   } else {
    //     cb(new Error("invalid image", 400), false);
    //     // cb(new AppError("invalid image", 400), false);
    //   }
    // }

    cb(null, true);
  }

  return multer({
    storage,
    limits: {
      fileSize: 5000000, // 5MB
    },
    fileFilter,
  });
};

export const uploadSingleFile = (folderName, fieldName) =>
  options(folderName).single(fieldName);

export const uploadMixFile = (folderName, arrayFields) =>
  options(folderName).fields(arrayFields);
