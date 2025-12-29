import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    // ===== OAuth =====
    googleId: {
      type: String,
      default: null,
    },

    // ===== Basic Info =====
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      set: (v) => v.trim().toUpperCase(),
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      maxlength: 20,
    },

    // ===== Auth =====
    password: {
      type: String,
      minlength: 6,
      required: function () {
        return !this.googleId; // 🔑 required only for manual signup
      },
      select: false,
    },


    role: {
      type: String,
      enum: ["user", "priest", "admin"],
      default: "user",
    },

    photo: String,

    // ===== OTP =====
    otp: String,
    otpExpires: Date,

    // ===== Password Reset =====
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // ===== Flags =====
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ================= PASSWORD HASH =================
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// ================= JWT =================
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ================= PASSWORD MATCH =================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ================= RESET TOKEN =================
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// ================= SAFE EXPORT (NO OVERWRITE) =================
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
