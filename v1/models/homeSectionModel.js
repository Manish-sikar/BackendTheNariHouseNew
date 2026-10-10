const mongoose = require("mongoose");

const homeSectionItemSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        default: "",
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      icon: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },

      link: {
        type: String,
        default: "",
      },

      buttonText: {
        type: String,
        default: "",
      },
    },
    {
      _id: true,
    }
  );


const homeSectionSchema =
  new mongoose.Schema(
    {
      location: { type: String, default: "", trim: true },
rating:   { type: Number, default: 5 },
      sectionType: {
        type: String,

        required: true,

   enum: ["PROMO", "WHY_CHOOSE", "NEWSLETTER", "TESTIMONIAL", "STATS"],
      },

      title: {
        type: String,
        default: "",
        trim: true,
      },

      subtitle: {
        type: String,
        default: "",
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      buttonText: {
        type: String,
        default: "",
      },

      buttonLink: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
      },

      backgroundImage: {
        type: String,
        default: "",
      },

      items: {
        type: [homeSectionItemSchema],
        default: [],
      },

      order: {
        type: Number,
        default: 0,
      },

      status: {
        type: Number,
        default: 1,
      },
    },

    {
      timestamps: true,
    }
  );


module.exports =
  mongoose.model(
    "HomeSection",
    homeSectionSchema
  );