const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const ProductModel = require("../models/ProductModel");

// ==========================================
// AWS S3 CONFIG
// ==========================================

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});


// ==========================================
// UPLOAD IMAGE TO S3
// ==========================================

const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `products/${fileName}`,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: "public-read",
  };

  const { Location } = await s3.upload(params).promise();

  return Location;
};


// ==========================================
// CREATE PRODUCT
// ==========================================

const postProduct = async (req, res) => {
  try {
    const {
      productName,
      sku,
      category,
      subCategory,
      brand,
      description,
      price,
      salePrice,
      stock,
    } = req.body;


    // Required fields
    if (
      !productName ||
      !sku ||
      !category ||
      price === undefined ||
      price === ""
    ) {
      return res.status(400).json({
        error: "Product name, SKU, category and price are required.",
      });
    }


    // Check SKU
    const existingSku = await ProductModel.findOne({ sku });

    if (existingSku) {
      return res.status(400).json({
        error: "SKU already exists.",
      });
    }


    // Create slug
    let slug = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");


    // Check slug
    const existingSlug = await ProductModel.findOne({ slug });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }


    // Upload images
    let imageUrls = [];

    if (req.files && req.files.length > 0) {

      for (const file of req.files) {

        const fileName = `${uuidv4()}-${file.originalname}`;

        const imageUrl = await uploadToS3(
          file.buffer,
          fileName,
          file.mimetype
        );

        imageUrls.push(imageUrl);
      }
    }


    // Create product
    const product = new ProductModel({
      productName,
      slug,
      sku,
      category,
      subCategory,
      brand,
      description,
      price: Number(price),
      salePrice:
        salePrice !== undefined && salePrice !== ""
          ? Number(salePrice)
          : 0,
      stock:
        stock !== undefined && stock !== ""
          ? Number(stock)
          : 0,
      images: imageUrls,
      status: 1,
    });


    await product.save();


    res.status(201).json({
      message: "Product added successfully!",
      data: product,
    });

  } catch (error) {

    console.error("Error in postProduct:", error);

    res.status(500).json({
      error: "An error occurred while adding product.",
    });
  }
};


// ==========================================
// GET ALL PRODUCTS
// ==========================================

const getProducts = async (req, res) => {
  try {

    const products = await ProductModel.find()
        .populate("category", "name")
      .populate("subCategory", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 });


    res.status(200).json({
      message: "Products fetched successfully!",
      product_Data: products,
    });

  } catch (error) {

    console.error("Error fetching products:", error);

    res.status(500).json({
      error: "Internal server error.",
    });
  }
};


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

const getProductById = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found.",
      });
    }


    res.status(200).json({
      message: "Product fetched successfully!",
      data: product,
    });

  } catch (error) {

    console.error("Error fetching product:", error);

    res.status(500).json({
      error: "Internal server error.",
    });
  }
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

const updateProduct = async (req, res) => {
  try {

    const {
      _id,
      productName,
      sku,
      category,
      subCategory,
      brand,
      description,
      price,
      salePrice,
      stock,
    } = req.body;


    if (!_id) {
      return res.status(400).json({
        error: "Product ID is required.",
      });
    }


    const product = await ProductModel.findById(_id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found.",
      });
    }


    // SKU duplicate check
    const duplicateSku = await ProductModel.findOne({
      sku,
      _id: { $ne: _id },
    });

    if (duplicateSku) {
      return res.status(400).json({
        error: "SKU already exists.",
      });
    }


    // Existing images
    let imageUrls = product.images || [];


    // New images
    if (req.files && req.files.length > 0) {

      for (const file of req.files) {

        const fileName = `${uuidv4()}-${file.originalname}`;

        const imageUrl = await uploadToS3(
          file.buffer,
          fileName,
          file.mimetype
        );

        imageUrls.push(imageUrl);
      }
    }


    const updatedProduct =
      await ProductModel.findByIdAndUpdate(
        _id,
        {
          productName,
          sku,
          category,
          subCategory,
          brand,
          description,
          price: Number(price),
          salePrice:
            salePrice !== undefined && salePrice !== ""
              ? Number(salePrice)
              : 0,
          stock:
            stock !== undefined && stock !== ""
              ? Number(stock)
              : 0,
          images: imageUrls,
        },
        {
          new: true,
        }
      );


    res.status(200).json({
      message: "Product updated successfully!",
      data: updatedProduct,
    });

  } catch (error) {

    console.error("Error updating product:", error);

    res.status(500).json({
      error: "Internal server error.",
    });
  }
};


// ==========================================
// DELETE PRODUCT
// ==========================================

const deleteProduct = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Product ID is required.",
      });
    }


    const product =
      await ProductModel.findByIdAndDelete(id);


    if (!product) {
      return res.status(404).json({
        error: "Product not found.",
      });
    }


    res.status(200).json({
      message: "Product deleted successfully!",
      data: product,
    });

  } catch (error) {

    console.error("Error deleting product:", error);

    res.status(500).json({
      error: "Internal server error.",
    });
  }
};


// ==========================================
// CHANGE PRODUCT STATUS
// ==========================================

const changeProductStatus = async (req, res) => {
  try {

    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        error: "Product ID is required.",
      });
    }


    const product =
      await ProductModel.findById(_id);


    if (!product) {
      return res.status(404).json({
        error: "Product not found.",
      });
    }


    const updatedStatus =
      product.status === 1 ? 0 : 1;


    const updatedProduct =
      await ProductModel.findByIdAndUpdate(
        _id,
        {
          status: updatedStatus,
        },
        {
          new: true,
        }
      );


    res.status(200).json({
      message: "Product status updated successfully!",
      data: updatedProduct,
    });

  } catch (error) {

    console.error(
      "Error changing product status:",
      error
    );

    res.status(500).json({
      error: "Internal server error.",
    });
  }
};


module.exports = {
  postProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  changeProductStatus,
};