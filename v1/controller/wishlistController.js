const mongoose = require("mongoose");

const Wishlist = require("../models/WishlistModel");
const Product = require("../models/ProductModel");

// =====================================================
// GET WISHLIST
// =====================================================

const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist =
      await Wishlist.findOne({
        user: userId,
      })
        .populate({
          path: "products",
          populate: [
            {
              path: "category",
              select: "name",
            },
            {
              path: "subCategory",
              select: "name",
            },
            {
              path: "brand",
              select: "name",
            },
          ],
        });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    console.error(
      "Get Wishlist Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =====================================================
// ADD TO WISHLIST
// =====================================================

const addToWishlist = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const {
      product,
    } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        product
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const productData =
      await Product.findById(product);

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist =
      await Wishlist.findOne({
        user: userId,
      });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [product],
      });
    } else {
      const alreadyExists =
        wishlist.products.some(
          (item) =>
            String(item) ===
            String(product)
        );

      if (alreadyExists) {
        return res.status(200).json({
          success: true,
          message:
            "Product already in wishlist",
          data: wishlist,
        });
      }

      wishlist.products.push(product);
    }

    await wishlist.save();

    const updatedWishlist =
      await Wishlist.findById(
        wishlist._id
      ).populate("products");

    return res.status(200).json({
      success: true,
      message:
        "Product added to wishlist",
      data: updatedWishlist,
    });
  } catch (error) {
    console.error(
      "Add Wishlist Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

const removeFromWishlist = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const {
      productId,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const wishlist =
      await Wishlist.findOne({
        user: userId,
      });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products =
      wishlist.products.filter(
        (item) =>
          String(item) !==
          String(productId)
      );

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message:
        "Product removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error(
      "Remove Wishlist Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =====================================================
// CLEAR WISHLIST
// =====================================================

const clearWishlist = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const wishlist =
      await Wishlist.findOne({
        user: userId,
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist already empty",
      });
    }

    wishlist.products = [];

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message:
        "Wishlist cleared successfully",
      data: wishlist,
    });
  } catch (error) {
    console.error(
      "Clear Wishlist Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getWishlistCount = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    const count = wishlist
      ? wishlist.products.length
      : 0;

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get Wishlist Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist count",
      error: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount
};