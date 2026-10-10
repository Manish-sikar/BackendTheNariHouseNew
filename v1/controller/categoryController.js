const Category = require("../models/CategoryModel");

const {
  uploadToS3,
} = require("../services/authServices");

const {
  v4: uuidv4,
} = require("uuid");


// =====================================================
// ADD CATEGORY
// =====================================================

exports.addCategory = async (
  req,
  res
) => {

  try {

    const {
      name,
      description,
      status,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name || !name.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Category name is required",

      });

    }


    // ==========================================
    // CHECK DUPLICATE
    // ==========================================

    const existingCategory =
      await Category.findOne({
        name: name.trim(),
      });


    if (existingCategory) {

      return res.status(409).json({

        success: false,

        message:
          "Category already exists",

      });

    }


    // ==========================================
    // IMAGE UPLOAD
    // ==========================================

    let image = "";


    if (req.file) {

      image =
        await uploadToS3(

          req.file.buffer,

          `category_${uuidv4()}_${req.file.originalname}`,

          req.file.mimetype,

          "categories"

        );

    }


    // ==========================================
    // CREATE CATEGORY
    // ==========================================

    const category =
      await Category.create({

        name:
          name.trim(),

        description:
          description?.trim() || "",

        image,

        status:
          status !== undefined
            ? Number(status)
            : 1,

      });


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({

      success: true,

      message:
        "Category added successfully",

      data:
        category,

    });


  } catch (error) {

    console.error(
      "Add Category Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }

};



// =====================================================
// GET ALL CATEGORIES
// =====================================================

exports.getCategories = async (
  req,
  res
) => {

  try {

    const categories =
      await Category.find()
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({

      success: true,

      count:
        categories.length,

      data:
        categories,

    });


  } catch (error) {

    console.error(
      "Get Categories Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }

};



// =====================================================
// GET CATEGORY BY ID
// =====================================================

exports.getCategoryById = async (
  req,
  res
) => {

  try {

    const category =
      await Category.findById(
        req.params.id
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          "Category not found",

      });

    }


    return res.status(200).json({

      success: true,

      data:
        category,

    });


  } catch (error) {

    console.error(
      "Get Category Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }

};



// =====================================================
// UPDATE CATEGORY
// =====================================================

exports.updateCategory = async (
  req,
  res
) => {

  try {

    const {
      name,
      description,
      status,
    } = req.body;


    // ==========================================
    // FIND CATEGORY
    // ==========================================

    const category =
      await Category.findById(
        req.params.id
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          "Category not found",

      });

    }


    // ==========================================
    // VALIDATE NAME
    // ==========================================

    if (!name || !name.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Category name is required",

      });

    }


    // ==========================================
    // CHECK DUPLICATE NAME
    // ==========================================

    const existingCategory =
      await Category.findOne({

        name: name.trim(),

        _id: {
          $ne: req.params.id,
        },

      });


    if (existingCategory) {

      return res.status(409).json({

        success: false,

        message:
          "Category already exists",

      });

    }


    // ==========================================
    // UPDATE BASIC DATA
    // ==========================================

    category.name =
      name.trim();

    category.description =
      description?.trim() || "";


    if (status !== undefined) {

      category.status =
        Number(status);

    }


    // ==========================================
    // NEW IMAGE UPLOAD
    // ==========================================

    if (req.file) {

      const image =
        await uploadToS3(

          req.file.buffer,

          `category_${uuidv4()}_${req.file.originalname}`,

          req.file.mimetype,

          "categories"

        );


      category.image =
        image;

    }


    // ==========================================
    // SAVE
    // ==========================================

    await category.save();


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({

      success: true,

      message:
        "Category updated successfully",

      data:
        category,

    });


  } catch (error) {

    console.error(
      "Update Category Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }

};



// =====================================================
// DELETE CATEGORY
// =====================================================

exports.deleteCategory = async (
  req,
  res
) => {

  try {

    const category =
      await Category.findByIdAndDelete(
        req.params.id
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          "Category not found",

      });

    }


    return res.status(200).json({

      success: true,

      message:
        "Category deleted successfully",

    });


  } catch (error) {

    console.error(
      "Delete Category Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error",

      error:
        error.message,

    });

  }

};