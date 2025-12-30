import mongoose from "mongoose";

const pujaBookingSchema = new mongoose.Schema(
  {
    pujaName: {
      type: String,
      trim: true,
      lowercase: true,
    },

    price: {
      type: String,
      trim: true,
    },

    kartaName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    wifeName: {
      type: String,
      trim: true,
      lowercase: true,
    },

    familyMembers: {
      type: String,
      trim: true,
    },

    gothram: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    referral: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PujaBooking", pujaBookingSchema);
