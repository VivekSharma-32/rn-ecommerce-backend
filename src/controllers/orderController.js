import { stripe } from "../../server.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

// CREATE ORDERS
export const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;
    //valdiation
    // create order
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    // stock update
    for (let i = 0; i < orderItems.length; i++) {
      // find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }
    res.status(201).send({
      success: true,
      message: "Order Placed Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Create Order API",
      error,
    });
  }
};

// GET ALL ORDERS - MY ORDERS
export const getMyOrdersController = async (req, res) => {
  try {
    // find orders
    const orders = await orderModel.find({ user: req.user._id });

    // validation
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "No order found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Your orders data",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get My Orders API",
      error,
    });
  }
};

// GET SINGLE ORDER INFO
export const getSingleOrderInfoController = async (req, res) => {
  try {
    // find orders
    const order = await orderModel.findById(req.params.id);
    // validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "No order found",
      });
    }
    res.status(200).send({
      success: true,
      message: "your order fetched",
      order,
    });
  } catch (error) {
    // cast error || OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Get My Orders API",
      error,
    });
  }
};

// ACCEPT PAYMENTS
export const acceptPaymentController = async (req, res) => {
  try {
    // get amount
    const { totalAmount } = req.body;
    // validation
    if (!totalAmount) {
      return res.status(404).send({
        success: false,
        message: "Total Amount is required",
      });
    }
    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount * 100),
      currency: "usd",
    });
    res.status(200).send({
      success: true,
      client_secret,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error In Make Payments API",
      error,
    });
  }
};

// ======================== ADMIN SECTION ========================
// GET ALL ORDERS
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "All orders data",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error In Getting All Orders API",
      error,
    });
  }
};

// CHANGE ORDER STATUS
export const changeOrderStatusController = async (req, res) => {
  try {
    // find order
    const order = await orderModel.findById(req.params.id);
    // validation
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }
    if (order.orderStatus === "processing") order.orderStatus = "shipped";
    else if (order.orderStatus === "shipped") {
      order.orderStatus = "deliverd";
      order.deliverdAt = Date.now();
    } else {
      return res.status(500).send({
        success: false,
        message: "Order already delivered",
      });
    }

    await order.save();
    res.status(200).send({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    // cast error || OBJECT ID
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid ID",
      });
    }
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Update Order Status API",
      error,
    });
  }
};
