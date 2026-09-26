const mongoose = require("mongoose");
const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");

// =====================================================
// GET CART
// =====================================================

const getCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first",
      });
    }

    const userId = req.user._id;

    const cart = await Cart.findOne({
      user: userId,
    }).populate({
      path: "items.product",
      populate: [
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
        { path: "brand", select: "name" },
      ],
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: {
          items: [],
          subtotal: 0,
          totalItems: 0,
        },
      });
    }

    let subtotal = 0;
    let totalItems = 0;

    const items = cart.items
      .map((item) => {
        const product = item.product;

        if (!product) return null;

        const quantity = Number(item.quantity || 1);

        const price =
          Number(product.salePrice) > 0 &&
          Number(product.salePrice) < Number(product.price)
            ? Number(product.salePrice)
            : Number(product.price);

        const total = price * quantity;

        subtotal += total;
        totalItems += quantity;

        return {
          cartItemId: item._id,
          product,
          quantity,
          price,
          total,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: {
        _id: cart._id,
        items,
        subtotal,
        totalItems,
      },
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =====================================================
// ADD TO CART
// =====================================================

const addToCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first",
      });
    }

    const userId = req.user._id;

    // Frontend se productId receive hoga
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid positive number",
      });
    }

    // Check product
    const productData = await Product.findById(productId);

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check product status
    if (productData.status !== undefined && Number(productData.status) !== 1) {
      return res.status(400).json({
        success: false,
        message: "Product is unavailable",
      });
    }

    const stock = Number(productData.stock || 0);

    if (stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    if (qty > stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock} items available`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // Check existing product
    const existingItem = cart.items.find(
      (item) => String(item.product) === String(productId),
    );

    if (existingItem) {
      const newQuantity = Number(existingItem.quantity) + qty;

      if (newQuantity > stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${stock} items available`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.product");

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Add Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE CART ITEM
// =====================================================

const updateCartItem = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first",
      });
    }

    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const stock = Number(product.stock || 0);

    if (qty > stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock} items available`,
      });
    }

    item.quantity = qty;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate("items.product");

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =====================================================
// REMOVE CART ITEM
// =====================================================

const removeCartItem = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first",
      });
    }

    const userId = req.user._id;
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.deleteOne();

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      data: cart,
    });
  } catch (error) {
    console.error("Remove Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =====================================================
// CLEAR CART
// =====================================================

const clearCart = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first",
      });
    }

    const userId = req.user._id;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart already empty",
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
 const getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    const count = cart
      ? cart.items.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0,
        )
      : 0;

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get Cart Count Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch cart count",
    });
  }
};
module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartCount
};
