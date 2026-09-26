const SubCategory = require("../models/SubCategoryModel");
const Category = require("../models/CategoryModel");

// ===============================
// ADD SUB CATEGORY
// ===============================

exports.addSubCategory = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
    } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Sub category name is required",
      });
    }

    const category = await Category.findById(
      categoryId
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existing = await SubCategory.findOne({
      categoryId,
      name: name.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Sub category already exists",
      });
    }

    const subCategory =
      await SubCategory.create({
        categoryId,
        name: name.trim(),
        description: description || "",
        status: 1,
      });

    return res.status(201).json({
      success: true,
      message: "Sub category added successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error(
      "Add Sub Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ===============================
// GET ALL SUB CATEGORIES
// ===============================

exports.getSubCategories = async (req, res) => {
  try {
    const subCategories =
      await SubCategory.find()
        .populate("categoryId", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    console.error(
      "Get Sub Categories Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ===============================
// GET SUB CATEGORY BY CATEGORY
// ===============================

exports.getSubCategoriesByCategory =
  async (req, res) => {
    try {
      const subCategories =
        await SubCategory.find({
          categoryId: req.params.categoryId,
          status: 1,
        }).sort({ name: 1 });

      return res.status(200).json({
        success: true,
        data: subCategories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };

// ===============================
// UPDATE SUB CATEGORY
// ===============================

exports.updateSubCategory = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      status,
    } = req.body;

    const subCategory =
      await SubCategory.findByIdAndUpdate(
        req.params.id,
        {
          categoryId,
          name: name?.trim(),
          description: description || "",
          status:
            status !== undefined ? status : 1,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Sub category updated successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error(
      "Update Sub Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ===============================
// DELETE SUB CATEGORY
// ===============================

exports.deleteSubCategory = async (
  req,
  res
) => {
  try {
    const subCategory =
      await SubCategory.findByIdAndDelete(
        req.params.id
      );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Sub category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Sub Category Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};