import mongoose from "mongoose";

const HeaderSettingsSchema = new mongoose.Schema(
  {
    shippingText: {
      type: String,
      default: "Free Shipping on Orders Above ₹999",
    },

    couponText: {
      type: String,
      default: "Use Code NAARI10 for 10% Off",
    },

    returnText: {
      type: String,
      default: "Easy 15-Day Returns",
    },

    shippingEnabled: {
      type: Boolean,
      default: true,
    },

    couponEnabled: {
      type: Boolean,
      default: true,
    },

    returnEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("HeaderSettings", HeaderSettingsSchema);