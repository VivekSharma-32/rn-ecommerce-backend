import express from "express";
import { isAdmin, isAuth } from "../middlewares/authMiddleware.js";
import {
  acceptPaymentController,
  changeOrderStatusController,
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  getSingleOrderInfoController,
} from "../controllers/orderController.js";
// Router object
const router = express.Router();

// routes
// ================ORDER ROUTES ================
// CREATE ORDERS
router.post("/create", isAuth, createOrderController);

// GET ALL ORDERS
router.get("/my-orders", isAuth, getMyOrdersController);

// GET SINGLE ORDER
router.get("/my-orders/:id", isAuth, getSingleOrderInfoController);

// ============== Accept Payment ==================

// GET SINGLE ORDER
router.post("/payments", isAuth, acceptPaymentController);

// ================ ADMIN PART ==============
// GET ALL ORDERS
router.get("/admin/get-all-orders", isAuth, isAdmin, getAllOrdersController);
// UPDATE ORDER STATUS
router.put("/admin/order/:id", isAuth, isAdmin, changeOrderStatusController);

// export
export default router;
