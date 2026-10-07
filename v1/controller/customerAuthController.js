const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const Customer = require("../models/CustomerModel");

const OTPModel = require("../models/otpModel");

const {
  CustomerJwtCreate,
  comparePassword,
  uploadToS3,
  randomNumber,
} = require("../services/authServices");

const { v4: uuidv4 } = require("uuid");

const storeCustomerOTP = async (email, otp) => {
  try {
    await OTPModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        otp: otp.toString(),
        createdAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    console.error("Customer OTP Store Error:", error);
    throw new Error("Failed to store OTP");
  }
};
// =====================================================
// CUSTOMER REGISTER
// =====================================================

const CustomerRegister = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      password,
      gender,
      dob,
      alternateMobile,
      addressLine,
      city,
      state,
      pincode,
      newsletter,
    } = req.body;

    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, mobile and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const emailValue = email.trim().toLowerCase();
    const mobileValue = mobile.trim();

    const existingCustomer = await Customer.findOne({
      $or: [
        { email: emailValue },
        { mobile: mobileValue },
      ],
    });

    if (existingCustomer) {
      if (existingCustomer.email === emailValue) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      if (existingCustomer.mobile === mobileValue) {
        return res.status(409).json({
          success: false,
          message: "Mobile number already registered",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImage = "";

    if (req.file) {
      profileImage = await uploadToS3(
        req.file.buffer,
        `customer_${uuidv4()}_${req.file.originalname}`,
        req.file.mimetype
      );
    }

    const newsletterValue =
      newsletter === true ||
      newsletter === "true";

    const customer = await Customer.create({
      fullName: fullName.trim(),

      email: emailValue,

      mobile: mobileValue,

      password: hashedPassword,

      gender: gender || "",

      dob: dob || "",

      alternateMobile: alternateMobile || "",

      profileImage,

      address: addressLine || "",

      city: city || "",

      state: state || "",

      pincode: pincode || "",

      newsletter: newsletterValue,

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
        gender: customer.gender,
        dob: customer.dob,
        alternateMobile: customer.alternateMobile,
        profileImage: customer.profileImage,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        newsletter: customer.newsletter,
        status: customer.status,
      },
    });

  } catch (error) {
    console.error("Customer Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// =====================================================
// CUSTOMER LOGIN
// =====================================================

const CustomerLogin = async (req, res) => {
  try {
    const { emailORphone, password } = req.body;

    if (!emailORphone || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile and password are required",
      });
    }

    const loginValue = emailORphone.trim();

    const customer = await Customer.findOne({
      $or: [
        {
          email: loginValue.toLowerCase(),
        },
        {
          mobile: loginValue,
        },
      ],
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

    const passwordMatch = await comparePassword(
      password,
      customer.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = CustomerJwtCreate(customer);

    const user = customer.toObject();

    delete user.password;
    delete user.resetOtp;
    delete user.resetOtpExpiry;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Customer Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// SEND FORGOT PASSWORD OTP
// =====================================================

// =====================================================
// SEND CUSTOMER FORGOT PASSWORD OTP
// =====================================================

const changePassSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailValue = email.trim().toLowerCase();

    // ==========================================
    // CHECK CUSTOMER
    // ==========================================

    const customer = await Customer.findOne({
      email: emailValue,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found with this email",
      });
    }

    // ==========================================
    // GENERATE OTP
    // ==========================================

    const otp = await randomNumber();

    console.log(
      "Customer Forgot Password OTP:",
      otp
    );

    // ==========================================
    // GMAIL TRANSPORTER
    // ==========================================

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,

      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },

      tls: {
        rejectUnauthorized: false,
      },
    });

    // ==========================================
    // CURRENT YEAR
    // ==========================================

    const currentYear = new Date().getFullYear();

    // ==========================================
    // MAIL
    // ==========================================

    const mailOptions = {
      from: `"THE NAARI HOUSE" <${process.env.SMTP_EMAIL}>`,

      to: emailValue,

      subject:
        "THE NAARI HOUSE - Password Reset OTP",

      html: `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Password Reset OTP</title>

</head>

<body
style="
margin:0;
padding:0;
background:#f8f5f2;
font-family:Arial,Helvetica,sans-serif;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
padding:40px 10px;
">

<tr>

<td align="center">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
max-width:600px;
background:#ffffff;
border-radius:12px;
overflow:hidden;
border:1px solid #eadfd8;
">

<!-- HEADER -->

<tr>

<td
style="
background:#8f5363;
padding:30px;
text-align:center;
color:#ffffff;
">

<h1
style="
margin:0;
font-size:28px;
letter-spacing:1px;
">

THE NAARI HOUSE

</h1>

<p
style="
margin:8px 0 0;
font-size:14px;
">

Fashion • Beauty • Lifestyle

</p>

</td>

</tr>


<!-- BODY -->

<tr>

<td
style="
padding:35px;
">

<h2
style="
margin-top:0;
color:#333333;
">

Reset Your Password

</h2>

<p
style="
font-size:15px;
line-height:1.6;
color:#555555;
">

Hello
<strong>${customer.fullName}</strong>,

</p>

<p
style="
font-size:15px;
line-height:1.6;
color:#555555;
">

We received a request to reset the password
for your THE NAARI HOUSE account.

</p>

<p
style="
font-size:15px;
color:#555555;
">

Your One-Time Password is:

</p>


<!-- OTP -->

<div
style="
text-align:center;
margin:25px 0;
">

<span
style="
display:inline-block;
background:#8f5363;
color:#ffffff;
padding:15px 30px;
border-radius:8px;
font-size:28px;
font-weight:bold;
letter-spacing:6px;
">

${otp}

</span>

</div>


<p
style="
font-size:14px;
line-height:1.6;
color:#666666;
">

This OTP is valid for
<strong>5 minutes</strong>.

</p>

<p
style="
font-size:14px;
line-height:1.6;
color:#666666;
">

If you did not request a password reset,
please ignore this email.

</p>

<p
style="
margin-top:30px;
font-size:14px;
color:#555555;
">

Thank you for choosing
<strong>THE NAARI HOUSE</strong>.

</p>

</td>

</tr>


<!-- FOOTER -->

<tr>

<td
style="
background:#f5f2ef;
padding:18px;
text-align:center;
font-size:12px;
color:#888888;
">

&copy; ${currentYear} THE NAARI HOUSE.
All rights reserved.

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`,
    };

    // ==========================================
    // SEND MAIL
    // ==========================================

    await transporter.sendMail(mailOptions);

    // ==========================================
    // STORE OTP
    // ==========================================

    await storeCustomerOTP(
      emailValue,
      otp
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {

    console.error(
      "Customer Forgot Password OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};


// =====================================================
// VERIFY OTP
// =====================================================

// =====================================================
// VERIFY CUSTOMER OTP
// =====================================================

const CustRegisterverifyOtp = async (req, res) => {
  try {

    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const emailValue =
      email.trim().toLowerCase();

    // ==========================================
    // CUSTOMER CHECK
    // ==========================================

    const customer = await Customer.findOne({
      email: emailValue,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==========================================
    // OTP CHECK
    // ==========================================

    const otpData = await OTPModel.findOne({
      email: emailValue,
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP",
      });
    }

    // ==========================================
    // OTP EXPIRY
    // ==========================================

    const otpCreatedTime =
      new Date(otpData.createdAt).getTime();

    const currentTime =
      Date.now();

    const difference =
      currentTime - otpCreatedTime;

    const fiveMinutes =
      5 * 60 * 1000;

    if (difference > fiveMinutes) {

      await OTPModel.deleteOne({
        _id: otpData._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // ==========================================
    // OTP MATCH
    // ==========================================

    if (
      otpData.otp.toString() !==
      otp.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {

    console.error(
      "Customer Verify OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// RESET PASSWORD
// =====================================================

// =====================================================
// RESET CUSTOMER PASSWORD
// =====================================================

const forgotChangePasswordCust = async (req, res) => {
  try {

    const {
      email,
      otp,
      newPassword,
      confirmPassword,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !email ||
      !otp ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    const emailValue =
      email.trim().toLowerCase();

    // ==========================================
    // CUSTOMER
    // ==========================================

    const customer =
      await Customer.findOne({
        email: emailValue,
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==========================================
    // OTP
    // ==========================================

    const otpData =
      await OTPModel.findOne({
        email: emailValue,
      });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP",
      });
    }

    // ==========================================
    // OTP EXPIRY
    // ==========================================

    const otpCreatedTime =
      new Date(
        otpData.createdAt
      ).getTime();

    const currentTime =
      Date.now();

    const difference =
      currentTime - otpCreatedTime;

    const fiveMinutes =
      5 * 60 * 1000;

    if (
      difference >
      fiveMinutes
    ) {

      await OTPModel.deleteOne({
        _id: otpData._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // ==========================================
    // VERIFY OTP
    // ==========================================

    if (
      otpData.otp.toString() !==
      otp.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    customer.password =
      hashedPassword;

    await customer.save();

    // ==========================================
    // DELETE OTP
    // ==========================================

    await OTPModel.deleteOne({
      _id: otpData._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });

  } catch (error) {

    console.error(
      "Customer Reset Password Error:",
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
// GET CUSTOMER PROFILE
// =====================================================

// =====================================================
// GET CUSTOMER PROFILE
// =====================================================

const GetCustomerProfile = async (req, res) => {
  try {

    const customerId =
      req.user._id ||
      req.user.id;

    const customer =
      await Customer.findById(
        customerId
      ).select(
        "-password"
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });

  } catch (error) {

    console.error(
      "Get Customer Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// =====================================================
// UPDATE CUSTOMER PROFILE
// =====================================================

// =====================================================
// UPDATE CUSTOMER PROFILE
// =====================================================

const UpdateCustomerProfile = async (req, res) => {
  try {

    const customerId =
      req.user._id ||
      req.user.id;

    const {
      fullName,
      mobile,
      gender,
      dob,
      alternateMobile,
      addressLine,
      city,
      state,
      pincode,
      newsletter,
    } = req.body;

    const customer =
      await Customer.findById(
        customerId
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==========================================
    // MOBILE UNIQUE CHECK
    // ==========================================

    if (
      mobile &&
      mobile.trim() !== customer.mobile
    ) {

      const mobileExists =
        await Customer.findOne({
          mobile: mobile.trim(),
          _id: {
            $ne: customerId,
          },
        });

      if (mobileExists) {
        return res.status(409).json({
          success: false,
          message:
            "Mobile number already registered",
        });
      }

      customer.mobile =
        mobile.trim();
    }

    if (fullName !== undefined) {
      customer.fullName =
        fullName.trim();
    }

    if (gender !== undefined) {
      customer.gender = gender;
    }

    if (dob !== undefined) {
      customer.dob = dob;
    }

    if (
      alternateMobile !== undefined
    ) {
      customer.alternateMobile =
        alternateMobile;
    }

    if (
      addressLine !== undefined
    ) {
      customer.address =
        addressLine;
    }

    if (city !== undefined) {
      customer.city = city;
    }

    if (state !== undefined) {
      customer.state = state;
    }

    if (pincode !== undefined) {
      customer.pincode = pincode;
    }

    if (newsletter !== undefined) {
      customer.newsletter =
        newsletter === true ||
        newsletter === "true";
    }

    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    if (req.file) {

      customer.profileImage =
        await uploadToS3(
          req.file.buffer,

          `customer_${uuidv4()}_${req.file.originalname}`,

          req.file.mimetype
        );
    }

    await customer.save();

    const user =
      customer.toObject();

    delete user.password;

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      data: user,
    });

  } catch (error) {

    console.error(
      "Update Customer Profile Error:",
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
// CHANGE PASSWORD - LOGGED IN CUSTOMER
// =====================================================

// =====================================================
// CHANGE CUSTOMER PASSWORD
// =====================================================

const ChangeCustomerPassword = async (req, res) => {
  try {

    const customerId =
      req.user._id ||
      req.user.id;

    const {
      oldPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All password fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New passwords do not match",
      });
    }

    const customer =
      await Customer.findById(
        customerId
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const passwordMatch =
      await comparePassword(
        oldPassword,
        customer.password
      );

    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Old password is incorrect",
      });
    }

    customer.password =
      await bcrypt.hash(
        newPassword,
        10
      );

    await customer.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {

    console.error(
      "Change Customer Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};


// =====================================================
// LOGOUT
// =====================================================

// =====================================================
// CUSTOMER LOGOUT
// =====================================================

const CustomerLogout = async (req, res) => {
  try {

    return res.status(200).json({
      success: true,
      message:
        "Customer logout successful",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  CustomerRegister,

  CustomerLogin,

  changePassSendOtp,

  CustRegisterverifyOtp,

  forgotChangePasswordCust,

  GetCustomerProfile,

  UpdateCustomerProfile,

  ChangeCustomerPassword,

  CustomerLogout,

};