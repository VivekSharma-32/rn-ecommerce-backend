import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import Stripe from "stripe";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
// routes import
import testRoutes from "./src/routes/testRoute.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import connectDB from "./src/config/db.js";

// config
dotenv.config();

// database connection
connectDB();

// configure stripe
export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

// cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// rest object
const app = express();

//middlewares
app.use(helmet());
app.use(mongoSanitize());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
// route
app.use("/api/v1", testRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/order", orderRoutes);

app.get("/test", (req, res) => {
  return res.status(300).send("<h1>Welcome to node server</h1>");
});

// PORT
const PORT = process.env.PORT || 8080;
// listen server
app.listen(PORT, () => {
  console.log(
    `Server is running on Port: ${PORT} in ${process.env.MODE_ENV} mode`
      .bgMagenta.white
  );
});
