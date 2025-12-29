import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import User from "../models/User.js";
import verifyToken from "../middleware/jwt.js";
import transporter from "../config/mailer.js";

const router = express.Router();

/* =======================
   MANUAL SIGNUP
======================= */
router.post("/signup", async (req, res) => {
  try {
    const { fullName, emailOrPhone, password } = req.body;

    if (!fullName || !emailOrPhone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const userData = {
      name: fullName,
      password: password, // ✅ plain password (schema hashes it)
    };

    if (emailOrPhone.includes("@")) {
      userData.email = emailOrPhone.trim().toLowerCase();
    } else {
      userData.phone = emailOrPhone;
    }

    const user = await User.create(userData);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.json({
      account: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo || null,
      },
    });

  } catch (err) {
    console.log("Signup error:", err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({ message: `${field} already exists` });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Signup failed" });
  }
});

/* =======================
   MANUAL SIGNIN
======================= */
router.post("/signin", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    
    console.log( emailOrPhone, password)

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    }).select("+password");

    // ❌ User not found
    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // ❌ Google user trying manual login
    if (!user.password) {
      return res.status(401).json({
        msg: "Please login using Google",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // ❌ Wrong password
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    
    res.json({
      verify: true,
      msg: "Signed in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role:user.email === "admin123@gmail.com" ? "admin" : "user",
        photo: user.photo || null,
      },

    });
  } catch (err) {
    console.log("Signin error:", err);
    res.status(500).json({ msg: "Signin failed" });
  }
});


/* =======================
   GOOGLE AUTH
======================= */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.redirect("https://sankalpam.world/oauth-success");
  }
);

/* =======================
   SEND OTP
======================= */
router.post("/otp", async (req, res) => {
  const { emailOrPhone } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  if (user.email) {
    await transporter.sendMail({
      from: `"Sankalpam" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Your OTP - Sankalpam",
      html: `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`,
    });
  }

  res.json({ success: true });
});

/* =======================
   VERIFY OTP
======================= */
router.post("/otp/verify", async (req, res) => {
  const { otp, emailOrPhone } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!user) return res.json(false);
  if (user.otp !== String(otp)) return res.json(false);
  if (user.otpExpires < Date.now()) return res.json(false);

  user.otp = null;
  user.otpExpires = null;
  await user.save();

  res.json(true);
});

/* =======================
   RESET PASSWORD
======================= */
router.post("/reset", async (req, res) => {
  const { emailOrPhone, newPassword } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!user) return res.status(404).json(false);

  user.password = newPassword; // ✅ schema hashes it
  await user.save();

  res.json(true);
});

/* =======================
   GET CURRENT USER
======================= */
router.get("/me", verifyToken, async (req, res) => {

  console.log("me route-->",req.userId);
  
  const user = await User.findById(req.userId).select("-password");

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role:user.email === "admin123@gmail.com" ? "admin" : "user",
      photo: user.photo || null,
    },
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});


export default router;
