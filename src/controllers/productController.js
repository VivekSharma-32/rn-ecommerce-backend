import cloudinary from "cloudinary";
import productModel from "../models/productModel.js";
import { getDataUri } from "../utils/features.js";
// GET ALL PRODUCTS
export const getAllProductsController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    const products = await productModel
      .find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
        // category: category ? category : undefined,
      })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "All products fetched successfully",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Get All Product API",
      error,
    });
  }
};

//  GET TOP PRODUCT
export const getTopProductController = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(3);
    res.status(200).send({
      success: true,
      message: "Top 3 products",
      products,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Get Top Products API",
      error,
    });
  }
};

// GET SINGLE PRODUCT
export const getSingleProductController = async (req, res) => {
  try {
    // get product id
    const product = await productModel.findById(req.params.id);
    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product found",
      product,
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
      message: "Error in Get All Product API",
      error,
    });
  }
};

// CREATE PRODUCT
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // validations
    // if (!name || !description || !price || !stock) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "Please provide all the fields.",
    //   });
    // }
    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "Please provide product images",
      });
    }

    const file = getDataUri(req.file);

    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    await productModel.create({
      name,
      description,
      price,
      category,
      stock,
      images: [image],
    });

    res.status(201).send({
      success: true,
      message: "Product created successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Create Product API",
      error,
    });
  }
};

// UPDATE PRODUCT
export const updateProductController = async (req, res) => {
  try {
    //find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    const { name, description, price, stock, category } = req.body;
    // validate and update
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;
    await product.save();
    res.status(200).send({
      success: true,
      message: "Product detail updated",
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
      message: "Error in Update Product API",
      error,
    });
  }
};

// UPDATE PRODUCT IMAGE
export const updateProductImageController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // check file
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: "Product image not found",
      });
    }

    const file = await getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    //save
    product.images.push(image);
    await product.save();
    res.status(200).send({
      success: true,
      message: "Product image updated",
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
      message: "Error in Update Product Image API",
      error,
    });
  }
};

// delete product image
export const deleteProductImageController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    // find image id
    const id = req.query.id;
    // validation
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "Product image not found",
      });
    }

    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image not found",
      });
    }

    // delete product image
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);
    await product.save();
    return res.status(200).send({
      success: true,
      message: "Product image deleted successfully",
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
      message: "Error in Delete Product Image API",
      error,
    });
  }
};

// DELETE PRODUCT
export const deleteProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    // find and delete image from cloudinary
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
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
      message: "Error in Delete Product  API",
      error,
    });
  }
};

// CREATE PRODUCT REVIEW AND COMMENT
export const productReviewController = async (req, res) => {
  try {
    const { comment, rating } = req.body;

    //find product
    const product = await productModel.findById(req.params.id);
    // check user previous review and comment
    const alreadyReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    // validation
    if (alreadyReview) {
      return res.status(400).send({
        success: false,
        message: "Already reviewed",
      });
    }

    // review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    // passing review object to reviews only
    product.reviews.push(review);
    // number of reviews
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    // save
    await product.save();
    res.status(200).send({
      success: true,
      message: "Review added!",
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
      message: "Error in  Review Comment API",
      error,
    });
  }
};
