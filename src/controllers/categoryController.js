import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
// CREATE CATEGORY
export const createCategoryController = async (req, res) => {
  try {
    const { category } = req.body;
    // validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Please provide category name",
      });
    }
    await categoryModel.create({ category });
    res.status(201).send({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in create  Category API",
    });
  }
};

// GET ALL CATEGORIES
export const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "Categories fetched successfully.",
      total: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in getting all Categories API",
    });
  }
};

// DELETE CATEGORY CONTROLLER
export const deleteCategoryController = async (req, res) => {
  try {
    // find category
    const category = await categoryModel.findById(req.params.id);
    // validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    // find product with this category id
    const products = await productModel.find({ category: category._id });

    // update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }

    // save
    await category.deleteOne();
    res.status(200).send({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    // cast error || OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    return res.status(500).send({
      success: false,
      message: "Error in deleting Category API",
    });
  }
};

// UPDATE CATEGORY
export const updateCategoryController = async (req, res) => {
  try {
    // find category
    const category = await categoryModel.findById(req.params.id);
    // validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    // get new category
    const { updatedCategory } = req.body;
    // find product with this category id
    const products = await productModel.find({ category: category._id });

    // update product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = updatedCategory;
      await product.save();
    }

    if (updatedCategory) category.category = updatedCategory;
    // save
    await category.save();
    res.status(200).send({
      success: true,
      message: "Category updated successfully.",
    });
  } catch (error) {
    // cast error || OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    return res.status(500).send({
      success: false,
      message: "Error in update Category API",
    });
  }
};
