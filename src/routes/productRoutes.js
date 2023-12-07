import express from "express";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";
import {
  createProductController,
  deleteProductController,
  deleteProductImageController,
  getAllProductsController,
  getSingleProductController,
  getTopProductController,
  productReviewController,
  updateProductController,
  updateProductImageController,
} from "../controllers/productController.js";

const router = express.Router();

// routes
// get all products
router.get("/get-all", getAllProductsController);

// get top 3 products
router.get("/top", getTopProductController);

// get single product
router.get("/:id", getSingleProductController);

// CREATE PRODUCT
router.post("/create", isAuth, isAdmin, singleUpload, createProductController);

//update-product
router.put("/:id", isAuth, isAdmin, updateProductController);

//update-product-image
router.put(
  "/image/:id",
  isAuth,
  isAdmin,
  singleUpload,
  updateProductImageController
);

// delete product image
router.delete(
  "/delete-image/:id",
  isAuth,
  isAdmin,
  deleteProductImageController
);

// delete product
router.delete("/delete/:id", isAuth, isAdmin, deleteProductController);

// REVIEW PRODUCT
router.put("/:id/review", isAuth, productReviewController);

// export
export default router;
