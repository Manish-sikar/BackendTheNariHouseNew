const Coupon = require("../models/CouponModel");

// ========================================
// ADD COUPON
// ========================================

exports.addCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      applyOn,
      products,
      categories,
      startDate,
      endDate,
      usageLimit,
    } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    if (!discountType) {
      return res.status(400).json({
        success: false,
        message: "Discount type is required",
      });
    }

    if (!discountValue) {
      return res.status(400).json({
        success: false,
        message: "Discount value is required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const existingCoupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon already exists",
      });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),

      description: description || "",

      discountType,

      discountValue: Number(discountValue),

      minOrderAmount: Number(minOrderAmount || 0),

      maxDiscount: Number(maxDiscount || 0),

      applyOn: applyOn || "all",

      products:
        applyOn === "product"
          ? products || []
          : [],

      categories:
        applyOn === "category"
          ? categories || []
          : [],

      startDate,

      endDate,

      usageLimit: Number(usageLimit || 0),

      status: 1,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon added successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Add Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ========================================
// GET COUPONS
// ========================================

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("products", "productName sku")
      .populate("categories", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error("Get Coupons Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ========================================
// GET SINGLE COUPON
// ========================================

exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("products", "productName sku")
      .populate("categories", "name");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Get Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE COUPON
// ========================================

exports.updateCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      applyOn,
      products,
      categories,
      startDate,
      endDate,
      usageLimit,
      status,
    } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: code?.trim().toUpperCase(),
        description: description || "",
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        applyOn,
        products:
          applyOn === "product"
            ? products || []
            : [],
        categories:
          applyOn === "category"
            ? categories || []
            : [],
        startDate,
        endDate,
        usageLimit,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE COUPON
// ========================================

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.applyCoupon = async (req, res) => {
  try {
    const {
      code,
      products,
      cartTotal,
    } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      status: 1,
    })
      .populate("products")
      .populate("categories");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    const currentDate = new Date();

    if (
      currentDate < coupon.startDate ||
      currentDate > coupon.endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired or is not active yet",
      });
    }

    if (
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    if (
      Number(cartTotal) < coupon.minOrderAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }

    // ========================================
    // CHECK PRODUCT / CATEGORY
    // ========================================

    if (coupon.applyOn === "product") {
      const couponProductIds =
        coupon.products.map((item) =>
          item._id.toString()
        );

      const validProduct = products.some((item) =>
        couponProductIds.includes(
          item.product.toString()
        )
      );

      if (!validProduct) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon is not applicable on selected products",
        });
      }
    }

    if (coupon.applyOn === "category") {
      const couponCategoryIds =
        coupon.categories.map((item) =>
          item._id.toString()
        );

      const validCategory = products.some((item) =>
        couponCategoryIds.includes(
          item.category.toString()
        )
      );

      if (!validCategory) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon is not applicable on selected category",
        });
      }
    }

    // ========================================
    // CALCULATE DISCOUNT
    // ========================================

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount =
        (Number(cartTotal) *
          Number(coupon.discountValue)) /
        100;

      if (
        coupon.maxDiscount > 0 &&
        discount > coupon.maxDiscount
      ) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Number(
        coupon.discountValue
      );
    }

    if (discount > Number(cartTotal)) {
      discount = Number(cartTotal);
    }

    const finalAmount =
      Number(cartTotal) - discount;

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",

      data: {
        couponId: coupon._id,
        code: coupon.code,
        discount,
        cartTotal: Number(cartTotal),
        finalAmount,
      },
    });
  } catch (error) {
    console.error(
      "Apply Coupon Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};