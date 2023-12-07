import express from "express";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  updateCategoryController,
} from "../controllers/categoryController.js";

// Router object
const router = express.Router();

// ============ Category Routes ============
// CREATE CATEGORY
router.post("/create", isAuth, isAdmin, createCategoryController);

// GET ALL CATEGORY
router.get("/get-all", getAllCategoriesController);

// DELETE CATEGORY
router.delete("/delete/:id", isAuth, isAdmin, deleteCategoryController);

// UPDATE CATEGORY
router.put("/update/:id", isAuth, isAdmin, updateCategoryController);

// export
export default router;
