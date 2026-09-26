const crypto = require("crypto");
const Razorpay = require("razorpay");

const Cart = require("../models/CartModel");
const Order = require("../models/OrderModel");

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});
// ==========================================
// CREATE ORDER
// ==========================================

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      customerName,
      email,
      phone,
      items,
      shippingAddress,
      subtotal,
      shippingCharge,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus,
    } = req.body;

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    const order = await Order.create({
      customer: customer || null,

      customerName,

      email: email || "",

      phone,

      items,

      shippingAddress: shippingAddress || {},

      subtotal: Number(subtotal || 0),

      shippingCharge: Number(shippingCharge || 0),

      discount: Number(discount || 0),

      totalAmount: Number(totalAmount || 0),

      paymentMethod: paymentMethod || "COD",

      paymentStatus: paymentStatus || "Pending",

      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL ORDERS
// ==========================================

exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .populate(
        "items.product",
        "productName sku images price salePrice"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==========================================
// GET ORDER BY ID
// ==========================================

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate(
        "items.product",
        "productName sku images price salePrice"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

exports.updateOrderStatus = async (req, res) => {
  try {
    const {
      status,
      trackingNumber,
      courierName,
      cancelReason,
    } = req.body;

    const allowedStatus = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const updateData = {
      status,
    };

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (courierName !== undefined) {
      updateData.courierName = courierName;
    }

    if (cancelReason !== undefined) {
      updateData.cancelReason = cancelReason;
    }

    if (status === "Delivered") {
      updateData.deliveredAt = new Date();
    }

    if (status === "Cancelled") {
      updateData.cancelledAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================

exports.updateOrderPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const allowedStatus = [
      "Pending",
      "Paid",
      "Failed",
      "Refunded",
    ];

    if (!allowedStatus.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Update Payment Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE ORDER
// ==========================================

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE CHECKOUT ORDER
// ==========================================

exports.createCheckoutOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const {
      fullName,
      mobileNumber,
      email,
      fullAddress,
      city,
      state,
      pinCode,
    } = req.body;

    if (
      !fullName ||
      !mobileNumber ||
      !email ||
      !fullAddress ||
      !city ||
      !state ||
      !pinCode
    ) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let subtotal = 0;
    const items = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) continue;

      const quantity = Number(cartItem.quantity);

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      if (quantity > Number(product.stock)) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available`,
        });
      }

      const price =
        Number(product.salePrice) > 0 &&
        Number(product.salePrice) < Number(product.price)
          ? Number(product.salePrice)
          : Number(product.price);

      const total = price * quantity;

      subtotal += total;

      let image = "";

      if (Array.isArray(product.images)) {
        const firstImage = product.images[0];

        image =
          typeof firstImage === "string"
            ? firstImage
            : firstImage?.url ||
              firstImage?.Location ||
              "";
      }

      items.push({
        product: product._id,

        productName:
          product.productName ||
          product.name ||
          "Product",

        image,

        quantity,

        price: Number(product.price) || 0,

        salePrice: Number(product.salePrice) || 0,

        total,
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found",
      });
    }

    const shippingCharge = 0;
    const discount = 0;
    const totalAmount =
      subtotal + shippingCharge - discount;

    // Amount in paise
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      customer: req.user._id,

      customerName: fullName,
      email,
      phone: mobileNumber,

      items,

      shippingAddress: {
        name: fullName,
        phone: mobileNumber,
        address: fullAddress,
        city,
        state,
        pincode: pinCode,
      },

      subtotal,
      shippingCharge,
      discount,
      totalAmount,

      paymentMethod: "RAZORPAY",
      paymentStatus: "Pending",
      status: "Pending",

      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
      success: true,
      message: "Checkout order created successfully",

      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount,
        currency: "INR",
      },
    });
  } catch (error) {
    console.error("Create Checkout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create checkout order",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE CHECKOUT ORDER
// ==========================================

// ==========================================
// VERIFY CHECKOUT PAYMENT
// ==========================================

exports.verifyCheckoutPayment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: order,
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "Paid";
    order.status = "Processing";

    await order.save();

    // Clear cart after successful payment
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      data: order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};


// ==========================================
// GET MY ORDERS (CUSTOMER)
// ==========================================

exports.getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      customer: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email phone")
      .populate(
        "items.product",
        "productName sku images price salePrice"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your orders",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY SINGLE ORDER
// ==========================================

exports.getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
      .populate("customer", "name email phone")
      .populate(
        "items.product",
        "productName sku images price salePrice"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get My Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order details",
      error: error.message,
    });
  }
};