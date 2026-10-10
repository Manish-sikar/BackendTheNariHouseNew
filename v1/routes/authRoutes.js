const {
  AdminLogin,
  AdminLoginpost,
  AddAmountByAdmin,
  SumbitPaymentDetails,
  getPaymentDetails,
  updatePaymentStatus,
  addDelar,
  getAllDelar,
  deleteDelarRegister,
  changePassDelarRegister,
} = require("../controller/authController");

const {
  updateDataSite,
  getDataSite,
} = require("../controller/siteSettingController");
const router = require("express").Router();

const multer = require("multer");
const {
  postSocialMedia,
  getSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
  changeStatusSocialMedia,
} = require("../controller/socialMediaController");
const {
  updateFooterData,
  getFooterData,
} = require("../controller/footerController");
const {
  postBannerData,
  getBannerData,
  updateBannerData,
  deleteBannerData,
  changeStatusBannerData,
} = require("../controller/bannerController");
const {
  postAboutData,
  getAboutData,
  updateAboutData,
  deleteAboutData,
  changeStatusAboutData,
} = require("../controller/aboutController");
const {
  updateContactData,
  getContactData,
} = require("../controller/contactController");
const {
  postContactForm,
  getContactForm,
  deleteContactForm,
} = require("../controller/contactFormController");
const {
  postServicesData,
  getServicesData,
  updateServicesData,
  deleteServicesData,
  changeStatusServicesData,
} = require("../controller/servicesController");
const {
  postProjectsData,
  getProjectsData,
  updateProjectsData,
  deleteProjectsData,
  changeStatusProjectsData,
} = require("../controller/projectsController");
const {
  postTeamData,
  getTeamData,
  updateTeamData,
  deleteTeamData,
  changeStatusTeamData,
} = require("../controller/teamController");
const {
  PartnerLogin,
  PartnerRegister,
  GetPartnerRegister,
  updatePartnerRegister,
  deletePartnerRegister,
  changePassPartnerRegister,
  GetSpecialpartnerData,
} = require("../controller/userAuthController");
const {
  postLoanData,
  getLoanData,
  updateLoanData,
  deleteLoanData,
  changeStatusLoanData,
} = require("../controller/loanDataController");
const {
  postUserApplyForm,
  getUserApplyForm,
  deleteUserApplyForm,
  updateUserApplyForm,
} = require("../controller/applyFormController");
const {
  forgotPasswordSendOtp,
  UserRegisterverifyOtp,
  forgotChangePasswordUser,
} = require("../controller/forgotPasswordController");
const { getReportStatus } = require("../controller/reportController");
const {
  postUserApplyFormStatus,
  postUserApplyFormChangeStatus,
  getTransitionHistory,
} = require("../controller/reportStatusController");
const {
  postlinkWithHttpData,
  getlinkWithHttpData,
  deletelinkWithHttpData,
} = require("../controller/linkWithHttpDataController");
const {
  getpayments,
  handlePaymentWebhook,
} = require("../controller/razorPayController");

const {
  addDiscount,
  getDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
} = require("../controller/discountController");
const {
  postProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  changeProductStatus,
} = require("../controller/productController");
const {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");

const {
  addSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controller/subCategoryController");
const {
  addBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../controller/brandController");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  deleteOrder,
  createCheckoutOrder,
  verifyCheckoutPayment,
  getMyOrders,
  getMyOrderById,
} = require("../controller/orderController");

const {
  addCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require("../controller/couponController");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartCount,
} = require("../controller/cartController");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCount,
} = require("../controller/wishlistController");

const {
  CustomerRegister,
  CustomerLogin,
  changePassSendOtp,
  CustRegisterverifyOtp,
  forgotChangePasswordCust,
  GetCustomerProfile,
  UpdateCustomerProfile,
  ChangeCustomerPassword,
} = require("../controller/customerAuthController");
const customerAuth = require("../middleware/customerAuth");
const {
  getHeaderSettings,
  updateHeaderSettings,
} = require("../controller/headerSettingsController");
const {
  AddHomeSection,
  GetHomeSections,
  GetAllHomeSections,
  GetHomeSectionById,
  UpdateHomeSection,
  DeleteHomeSection,
  ChangeHomeSectionStatus,
} = require("../controller/homeSectionController");
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, process.env.IMG_DIR_PATH); // Specify the directory for file storage
//     },
//     filename: (req, file, cb) => {
//       // Generate a unique filename using a timestamp and the original file name
//       const uniqueFilename = Date.now() + "-" + file.originalname;
//       req.fileName = uniqueFilename;
//       cb(null, uniqueFilename);
//     },
//   });
//   const upload = multer({ storage: storage });

// Multer configuration
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// admin routes
router.post("/login", AdminLogin);
router.post("/loginPost", AdminLoginpost);

// User Partner routes
router.post("/User-login", PartnerLogin);
router.post("/User-reg", upload.single("Avtar"), PartnerRegister);
router.get("/User-reg", GetPartnerRegister);
router.post("/getSpeacialParthner", GetSpecialpartnerData);
router.put("/update-User-reg", upload.single("Avtar"), updatePartnerRegister);
router.post("/delete-User-reg/:id", deletePartnerRegister);
router.post("/change-pass-User-reg", changePassPartnerRegister);

// site setting Routes
router.put(
  "/site_setting",
  upload.fields([
    { name: "favicon", maxCount: 1 },
    { name: "site_logo", maxCount: 1 },
  ]),
  updateDataSite,
);
router.get("/site_setting", getDataSite);

// social apis Routes
router.post("/social_media", postSocialMedia);
router.get("/social_media", getSocialMedia);
router.put("/social_media", updateSocialMedia);
router.delete("/social_media/:id", deleteSocialMedia);
router.put("/social_media/chanege_status", changeStatusSocialMedia);

//footer  api's routes
router.put("/footer_data", updateFooterData);
router.get("/footer_data", getFooterData);

// banner Api's
router.post("/banner_details", upload.single("bannerimg"), postBannerData);
router.get("/banner_details", getBannerData);
router.put("/banner_details", upload.single("bannerimg"), updateBannerData);
router.delete("/banner_details/:id", deleteBannerData);
router.put("/banner_details/chanege_status", changeStatusBannerData);

// about apis routes
router.post("/about_details", upload.array("images", 2), postAboutData);
router.get("/about_details", getAboutData);
router.put("/about_details", upload.array("images", 2), updateAboutData);
router.delete("/about_details/:id", deleteAboutData);
router.put(
  "/about_details/chanege_status",

  changeStatusAboutData,
);

// Contact Us apis routes
router.put("/contact_data", updateContactData);
router.get("/contact_data", getContactData);

// Contact Us  formapis routes
router.post("/contact_form", postContactForm);
router.get("/contact_form", getContactForm);
router.delete("/contact_form/:id", deleteContactForm);

// Our Servies apis routes
router.post("/services_details", upload.single("serviceimg"), postServicesData);
router.get("/services_details", getServicesData);
router.put(
  "/services_details",
  upload.single("serviceimg"),
  updateServicesData,
);
router.delete("/services_details/:id", deleteServicesData);
router.put("/services_details/chanege_status", changeStatusServicesData);

// Our Project apis routes
router.post(
  "/projects_details",

  upload.single("projectimg"),
  postProjectsData,
);
router.get("/projects_details", getProjectsData);
router.put(
  "/projects_details",
  upload.single("projectimg"),
  updateProjectsData,
);
router.delete("/projects_details/:id", deleteProjectsData);
router.put("/projects_details/chanege_status", changeStatusProjectsData);

// our Team
router.post("/team_details", upload.single("teamimg"), postTeamData);
router.get("/team_details", getTeamData);
router.put("/team_details", upload.single("teamimg"), updateTeamData);
router.delete("/team_details/:id", deleteTeamData);

router.put("/team_details/chanege_status", changeStatusTeamData);

// user Apply loan form
router.post(
  "/user_apply_form",
  upload.fields([
    { name: "document1", maxCount: 1 },
    { name: "document2", maxCount: 1 },
    { name: "document3", maxCount: 1 },
  ]),
  postUserApplyForm,
);
router.get("/user_apply_form", getUserApplyForm);
router.delete("/user_apply_form/:id", deleteUserApplyForm);
router.post(
  "/user_apply_form/:id",
  upload.fields([
    { name: "document1", maxCount: 1 },
    { name: "document2", maxCount: 1 },
    { name: "document3", maxCount: 1 },
  ]),
  updateUserApplyForm,
);
// router.delete("/contact_form/:id", deleteContactForm );

// Loan Servies apis routes
router.post("/loan_details", upload.single("loanimg"), postLoanData);
router.get("/loan_details", getLoanData);
router.put("/loan_details", upload.single("loanimg"), updateLoanData);
router.delete("/loan_details/:id", deleteLoanData);
router.put("/loan_details/chanege_status", changeStatusLoanData);

/// foorgot password
router.post("/changePassSendOtp", changePassSendOtp);
router.post("/verifyOtp", CustRegisterverifyOtp);
router.post("/resetPassword", forgotChangePasswordCust);
router.get(
  "/profile",
  customerAuth,
  GetCustomerProfile
);

router.put(
  "/profile",
  customerAuth,
  upload.single("profileImage"),
  UpdateCustomerProfile
);

router.put(
  "/change-password",
  customerAuth,
  ChangeCustomerPassword
);

// get report of form
router.post("/reportStatus", getReportStatus);

//report status
router.post("/user_apply_form-change-status", postUserApplyFormChangeStatus);

router.post(
  "/user_apply_form-status",
  upload.fields([
    { name: "document4", maxCount: 1 },
    { name: "document5", maxCount: 1 },
    { name: "document6", maxCount: 1 },
    { name: "document7", maxCount: 1 },
  ]),
  postUserApplyFormStatus,
);
router.get("/get-transition-data/:id", getTransitionHistory);

router.post("/addAmountByAdmin", AddAmountByAdmin);

router.post("/SumbitPaymentDetails", SumbitPaymentDetails);
router.get("/getPaymentDetails", getPaymentDetails);
router.put("/updatePaymentStatus", updatePaymentStatus);

// Contact Us  formapis routes
router.post("/linkWithHttpData", postlinkWithHttpData);
router.get("/linkWithHttpData", getlinkWithHttpData);
router.delete("/linkWithHttpData/:id", deletelinkWithHttpData);

//add and get delar data

router.post("/addDelar", addDelar);
router.get("/getAllDelar", getAllDelar);

router.post("/deleteDelarRegister/:id", deleteDelarRegister);
router.post("/changePassDelarRegister", changePassDelarRegister);

router.post("/testGetway", getpayments);
router.post("/payment-success", handlePaymentWebhook);

// product api

router.post("/products", upload.array("productImages", 10), postProduct);

router.get("/products", getProducts);

router.get("/products/:id", getProductById);
router.put("/products", upload.array("productImages", 10), updateProduct);
router.delete("/products/:id", deleteProduct);
router.put("/products/change-status", changeProductStatus);
router.post(
  "/categories",
  upload.single("image"),
  addCategory
);
router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById); 
router.put(
  "/categories/:id",
  upload.single("image"),
  updateCategory
);
router.delete("/categories/:id", deleteCategory);
router.post("/subcategories", addSubCategory);
router.get("/subcategories", getSubCategories);
router.get("/subcategories/category/:categoryId", getSubCategoriesByCategory);
router.put("/subcategories/:id", updateSubCategory);
router.delete("/subcategories/:id", deleteSubCategory);
// Add Brand
router.post("/brands", addBrand);
// Get All Brands
router.get("/brands", getBrands);
// Get Brand By ID
router.get("/brands/:id", getBrandById);
// Update Brand
router.put("/brands/:id", updateBrand);
// Delete Brand
router.delete("/brands/:id", deleteBrand);
// Create Order
router.post("/orders", createOrder);
// Get All Orders
// /orders
// /orders?status=Pending
// /orders?status=Processing
// /orders?status=Shipped
// /orders?status=Delivered
// /orders?status=Cancelled

// Update Order Status
router.put("/orders/:id/status", updateOrderStatus);
// Update Payment Status
router.put("/orders/:id/payment-status", updateOrderPaymentStatus);
router.delete("/orders/:id", deleteOrder);
router.post("/coupons", addCoupon);
router.get("/coupons", getCoupons);
router.get("/coupons/:id", getCouponById);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);
// coupon routes
router.post("/coupons/apply",customerAuth, applyCoupon);

router.post("/discounts", addDiscount);
router.get("/discounts", getDiscounts);
router.get("/discounts/:id", getDiscountById);
router.put("/discounts/:id", updateDiscount);
router.delete("/discounts/:id", deleteDiscount);

// Get Cart
router.get("/cart", customerAuth, getCart);

// Add Product
router.post("/cart", customerAuth, addToCart);

// Update Quantity
router.put("/cart/:itemId", customerAuth, updateCartItem);

// Remove Item
router.delete("/cart/:itemId", customerAuth, removeCartItem);

// Clear Cart
router.delete("/cart", customerAuth, clearCart);

// Get Wishlist
router.get("/wishlist",customerAuth, getWishlist);

// Add Wishlist
router.post("/wishlist",customerAuth, addToWishlist);

// Remove Product
router.delete("/wishlist/:productId",customerAuth, removeFromWishlist);

// Clear Wishlist
router.delete("/wishlist",customerAuth, clearWishlist);

// ==========================================
// CHECKOUT ROUTES
// ==========================================

router.post("/checkout/create", customerAuth, createCheckoutOrder);

router.post("/checkout/verify-payment", customerAuth, verifyCheckoutPayment);
 
router.post(
  "/customer/register",
  upload.single("profileImage"),
  CustomerRegister
);

router.post("/customer/login", CustomerLogin);

// Customer ke apne orders
router.get("/orders/my-orders", customerAuth, getMyOrders);

router.get("/orders/my-orders/:id", customerAuth, getMyOrderById);

router.get("/orders", getOrders);
// Get Single Order
router.get("/orders/:id", getOrderById);

// Public API
router.get("/header-settings", getHeaderSettings);

// Admin authentication middleware yahan add karein
router.put("/header-settings", updateHeaderSettings);
router.get("/wishlist/count", customerAuth, getWishlistCount);
router.get("/cart/count", customerAuth, getCartCount);

// ==========================================
// HOME SECTION APIs
// ==========================================

// Frontend - Active Home Sections
router.get(
  "/home-sections",
  GetHomeSections
);


// Admin - All Home Sections
router.get(
  "/home-sections/all",
  GetAllHomeSections
);


// Admin - Get Single
router.get(
  "/home-sections/:id",
  GetHomeSectionById
);


// Admin - Add
router.post(
  "/home-sections",
  upload.any(),
  AddHomeSection
);
 

 
// Admin - Update
router.post(
  "/home-sections/:id", 
   upload.any(),
  UpdateHomeSection
);


// Admin - Delete
router.delete(
  "/home-sections/:id",
  DeleteHomeSection
);



// Admin - Change Status
router.put(
  "/home-sections/change-status",
  ChangeHomeSectionStatus
);

module.exports = router;
