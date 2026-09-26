const Brand = require("../models/BrandModel");

// ========================================
// Add Brand
// ========================================

const addBrand = async (req, res) => {
  try {
    const {
      name,
      description = "",
      status = 1,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required",
      });
    }

    // Check duplicate
    const existingBrand = await Brand.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists",
      });
    }

    const brand = await Brand.create({
      name: name.trim(),
      description: description.trim(),
      status: Number(status),
    });

    return res.status(201).json({
      success: true,
      message: "Brand added successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Add Brand Error:", error);

    // Mongo duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add brand",
      error: error.message,
    });
  }
};

// ========================================
// Get All Brands
// ========================================

const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully",
      data: brands,
    });
  } catch (error) {
    console.error("Get Brands Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to get brands",
      error: error.message,
    });
  }
};

// ========================================
// Get Brand By ID
// ========================================

const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand fetched successfully",
      data: brand,
    });
  } catch (error) {
    console.error(
      "Get Brand By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get brand",
      error: error.message,
    });
  }
};

// ========================================
// Update Brand
// ========================================

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description = "",
      status,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required",
      });
    }

    // Check duplicate excluding current brand
    const existingBrand = await Brand.findOne({
      _id: {
        $ne: id,
      },

      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists",
      });
    }

    const updateData = {
      name: name.trim(),
      description: description.trim(),
    };

    if (status !== undefined) {
      updateData.status = Number(status);
    }

    const brand = await Brand.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error(
      "Update Brand Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update brand",
      error: error.message,
    });
  }
};

// ========================================
// Delete Brand
// ========================================

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
      data: brand,
    });
  } catch (error) {
    console.error(
      "Delete Brand Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete brand",
      error: error.message,
    });
  }
};

module.exports = {
  addBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};