import HeaderSettings from "../models/HeaderSettingsModel.js";

// GET Header Settings
export const getHeaderSettings = async (req, res) => {
  try {
    let settings = await HeaderSettings.findOne();

    // Create default settings if not available
    if (!settings) {
      settings = await HeaderSettings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get Header Settings Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch header settings",
    });
  }
};

// UPDATE Header Settings
export const updateHeaderSettings = async (req, res) => {
  try {
    const {
      shippingText,
      couponText,
      returnText,
      shippingEnabled,
      couponEnabled,
      returnEnabled,
    } = req.body;

    let settings = await HeaderSettings.findOne();

    if (!settings) {
      settings = new HeaderSettings();
    }

    settings.shippingText = shippingText || "";
    settings.couponText = couponText || "";
    settings.returnText = returnText || "";

    settings.shippingEnabled =
      shippingEnabled === true ||
      shippingEnabled === "true";

    settings.couponEnabled =
      couponEnabled === true ||
      couponEnabled === "true";

    settings.returnEnabled =
      returnEnabled === true ||
      returnEnabled === "true";

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Header settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error(
      "Update Header Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update header settings",
    });
  }
};