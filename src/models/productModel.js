import mongoose from "mongoose";

// REVIEW MODEL
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "user require"],
    },
  },
  { timestamps: true }
);

// PRODUCT MODEL
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    stock: {
      type: Number,
      required: [true, "product stock is required"],
    },
    // quantity: {
    //   type: Number,
    //   required: [true, "product quantity is required"],
    // },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// export
export const productModel = mongoose.model("Products", productSchema);
export default productModel;
