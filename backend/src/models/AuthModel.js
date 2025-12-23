// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   googleId: { 
//     type: String, 
//     default: null 
//   },

//   name: { 
//     type: String, 
//     required: true,
//     set: v => v.trim().toUpperCase()
//   },

//   email: { 
//     type: String,
//     unique: true,
//     sparse: true,
//     set: v => v.trim().toLowerCase()
//   },

//   phone: { 
//     type: String, 
//     unique: true, 
//     sparse: true 
//   },

//   password: { 
//     type: String 
//   }, // only for manual users

//   photo: { 
//     type: String 
//   },

//   otp: String,
//  otpExpires: Date,

// }, { timestamps: true });

// export default mongoose.model("User", userSchema);
