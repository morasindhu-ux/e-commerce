const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Get all products with search, filter, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.page) || 1;
  const search = req.query.search || "";
  const category = req.query.category || "";

  // Query configuration
  const query = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } }
    ];
  }

  if (category) {
    query.category = category;
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json({ success: true, product });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { sku, title, description, category, price, stockQuantity, imageUrl } = req.body;

  const productExists = await Product.findOne({ sku: sku.toUpperCase() });

  if (productExists) {
    res.status(400);
    throw new Error("Product with this SKU already exists");
  }

  const product = await Product.create({
    sku: sku.toUpperCase(),
    title,
    description,
    category,
    price,
    stockQuantity: stockQuantity || 100,
    imageUrl: imageUrl || ""
  });

  if (product) {
    res.status(201).json({ success: true, product });
  } else {
    res.status(400);
    throw new Error("Invalid product details");
  }
});

// @desc    Update a product listing
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { title, description, category, price, stockQuantity, imageUrl } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    product.imageUrl = imageUrl || product.imageUrl;

    const updatedProduct = await product.save();
    res.json({ success: true, product: updatedProduct });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Product listing removed successfully" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
