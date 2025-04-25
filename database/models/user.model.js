import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is a required field."],
      minLength: [2, "Name is too short."],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is a required field."],
      minLength: 6,
    },
    phone: {
      type: String,
      required: [true, "Phone is a required field."],
      minLength: [10, "phone is too short."],
    },
    password: {
      type: String,
      required: [true, "Phone is a required field."],
      minLength: [8, "password is too short , min length 8."],
    },
    userType: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      required: true,
    },
    faculty:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "faculty",
      required: true,
    },
    verificationCode: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
      if (!options.showVerificationCode) {
          delete ret.verificationCode;
      }
      return ret;
  }
});

userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(
      this._update.password,
      Number(process.env.SALTED_VALUE)
    );
  }
});


// userSchema.pre(/^find/, function () {
//   this.populate({
//     path: "faculty",
//     select: "name",
//   });
// });
export const userModel = mongoose.model("user", userSchema);
