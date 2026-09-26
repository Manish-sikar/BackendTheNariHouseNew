const bcrypt = require("bcrypt");
const Customer = require("../models/CustomerModel");
const { CustomerJwtCreate, comparePassword } = require("../services/authServices");

// ==========================================
// CUSTOMER REGISTER
// ==========================================

const CustomerRegister = async (req, res) => {
  try {
    const { fullName, email, mobile, password, address, city, state, pincode } =
      req.body;

    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message:
          existingCustomer.email === email
            ? "Email already registered"
            : "Mobile number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      status: 1,
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        mobile: customer.mobile,
      },
    });
  } catch (error) {
    console.error("Customer Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// CUSTOMER LOGIN
// ==========================================

const CustomerLogin = async (req, res) => {
  try {
    const { emailORphone, password } = req.body;

    if (!emailORphone || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile and password are required",
      });
    }

    const customer = await Customer.findOne({
      $or: [{ email: emailORphone.toLowerCase() }, { mobile: emailORphone }],
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found. Please register first",
      });
    }

    if (Number(customer.status) !== 1) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const passwordMatch = await comparePassword(password, customer.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    const token = CustomerJwtCreate(customer);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: customer,
    });
  } catch (error) {
    console.error("Customer Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  CustomerRegister,
  CustomerLogin,
};
