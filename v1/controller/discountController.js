const mongoose = require("mongoose");
const Discount = require("../models/DiscountModel");


// ==========================================
// ADD DISCOUNT
// ==========================================

const addDiscount = async (req, res) => {
  try {
    const {
      name,
      applyOn,
      products,
      categories,
      subCategories,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      status,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Discount name is required",
      });
    }

    if (!applyOn) {
      return res.status(400).json({
        success: false,
        message: "Please select discount apply type",
      });
    }

    if (!discountType) {
      return res.status(400).json({
        success: false,
        message: "Discount type is required",
      });
    }

    if (
      discountValue === undefined ||
      Number(discountValue) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid discount value is required",
      });
    }


    // Percentage validation
    if (
      discountType === "percentage" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Percentage discount cannot be greater than 100",
      });
    }


    // Date validation
    if (
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }


    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date must be greater than start date",
      });
    }


    // ==========================================
    // APPLY TYPE VALIDATION
    // ==========================================

    if (
      applyOn === "product" &&
      (!products || products.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one product",
      });
    }


    if (
      applyOn === "category" &&
      (!categories || categories.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one category",
      });
    }


    if (
      applyOn === "subcategory" &&
      (!subCategories ||
        subCategories.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one sub category",
      });
    }


    const discount = new Discount({
      name: name.trim(),

      applyOn,

      products:
        applyOn === "product"
          ? products
          : [],

      categories:
        applyOn === "category"
          ? categories
          : [],

      subCategories:
        applyOn === "subcategory"
          ? subCategories
          : [],

      discountType,

      discountValue:
        Number(discountValue),

      minOrderAmount:
        Number(minOrderAmount || 0),

      maxDiscount:
        Number(maxDiscount || 0),

      startDate,

      endDate,

      usageLimit:
        Number(usageLimit || 0),

      status:
        status !== undefined
          ? Number(status)
          : 1,
    });


    await discount.save();


    const result =
      await Discount.findById(
        discount._id
      )
        .populate(
          "products",
          "productName sku price salePrice"
        )
        .populate(
          "categories",
          "name"
        )
        .populate(
          "subCategories",
          "name"
        );


    return res.status(201).json({
      success: true,
      message:
        "Discount added successfully",
      data: result,
    });

  } catch (error) {

    console.error(
      "Add Discount Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message,
    });
  }
};



// ==========================================
// GET ALL DISCOUNTS
// ==========================================

const getDiscounts = async (req, res) => {
  try {

    const discounts =
      await Discount.find()
        .populate(
          "products",
          "productName sku price salePrice"
        )
        .populate(
          "categories",
          "name"
        )
        .populate(
          "subCategories",
          "name"
        )
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,
      data: discounts,
    });

  } catch (error) {

    console.error(
      "Get Discount Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message,
    });
  }
};



// ==========================================
// GET SINGLE DISCOUNT
// ==========================================

const getDiscountById = async (
  req,
  res
) => {
  try {

    const { id } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid discount ID",
      });
    }


    const discount =
      await Discount.findById(id)
        .populate(
          "products",
          "productName sku price salePrice"
        )
        .populate(
          "categories",
          "name"
        )
        .populate(
          "subCategories",
          "name"
        );


    if (!discount) {
      return res.status(404).json({
        success: false,
        message:
          "Discount not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: discount,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message,
    });
  }
};



// ==========================================
// UPDATE DISCOUNT
// ==========================================

const updateDiscount = async (
  req,
  res
) => {
  try {

    const { id } = req.params;

    const {
      name,
      applyOn,
      products,
      categories,
      subCategories,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      status,
    } = req.body;


    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid discount ID",
      });
    }


    if (
      !name ||
      !applyOn ||
      !discountType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields are missing",
      });
    }


    if (
      discountType === "percentage" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Percentage discount cannot be greater than 100",
      });
    }


    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date must be greater than start date",
      });
    }


    // ==========================================
    // SCOPE VALIDATION
    // ==========================================

    if (
      applyOn === "product" &&
      (!products ||
        products.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select products",
      });
    }


    if (
      applyOn === "category" &&
      (!categories ||
        categories.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select categories",
      });
    }


    if (
      applyOn === "subcategory" &&
      (!subCategories ||
        subCategories.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select sub categories",
      });
    }


    const discount =
      await Discount.findByIdAndUpdate(
        id,
        {
          name: name.trim(),

          applyOn,

          products:
            applyOn === "product"
              ? products
              : [],

          categories:
            applyOn === "category"
              ? categories
              : [],

          subCategories:
            applyOn === "subcategory"
              ? subCategories
              : [],

          discountType,

          discountValue:
            Number(discountValue),

          minOrderAmount:
            Number(minOrderAmount || 0),

          maxDiscount:
            Number(maxDiscount || 0),

          startDate,

          endDate,

          usageLimit:
            Number(usageLimit || 0),

          status:
            Number(status),
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "products",
          "productName sku price salePrice"
        )
        .populate(
          "categories",
          "name"
        )
        .populate(
          "subCategories",
          "name"
        );


    if (!discount) {
      return res.status(404).json({
        success: false,
        message:
          "Discount not found",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Discount updated successfully",
      data: discount,
    });

  } catch (error) {

    console.error(
      "Update Discount Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message,
    });
  }
};



// ==========================================
// DELETE DISCOUNT
// ==========================================

const deleteDiscount = async (
  req,
  res
) => {
  try {

    const { id } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid discount ID",
      });
    }


    const discount =
      await Discount.findByIdAndDelete(id);


    if (!discount) {
      return res.status(404).json({
        success: false,
        message:
          "Discount not found",
      });
    }


    return res.status(200).json({
      success: true,
      message:
        "Discount deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete Discount Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
      error: error.message,
    });
  }
};



module.exports = {
  addDiscount,
  getDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
};