import { response } from "express";
import userModel from "../models/userModel.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, city, country, phone, answer } =
      req.body;

    // validation
    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !city ||
      !country ||
      !phone ||
      !answer
    ) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }

    // check registered user
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "Email already exists.",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
    });
    res.status(201).send({
      success: true,
      message: "Registration success. Please login",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in register API",
      error,
    });
  }
};

// login api
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please add email or password",
      });
    }
    // check user
    const user = await userModel.findOne({ email });
    // user validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    // check pass
    const isMatch = await user.comparePassword(password);
    // validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid credentials!",
      });
    }

    // token
    const token = user.generateToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.MODE_ENV === "development" ? true : false,
        httpOnly: process.env.MODE_ENV === "development" ? true : false,
        sameSite: process.env.MODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login successfully.",
        token,
        user,
      });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in login api",
      error,
    });
  }
};

// get user profile
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "User profile fetched successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Profile API",
      error,
    });
  }
};

// logout
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
        secure: process.env.MODE_ENV === "development" ? true : false,
        httpOnly: process.env.MODE_ENV === "development" ? true : false,
        sameSite: process.env.MODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout successfully",
      });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in LOGOUT API",
      error,
    });
  }
};

// update user profile
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { name, email, address, city, country, phone } = req.body;

    //validation + update
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (country) user.country = country;
    if (phone) user.phone = phone;

    // save user
    await user.save();

    res.status(200).send({
      success: true,
      message: "User profile updated",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Profile update API",
      error,
    });
  }
};

// update user password
export const updatePasswordController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;

    // validation
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old or new password",
      });
    }

    // oldpassword check
    const isMatch = await user.comparePassword(oldPassword);
    // validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid old Password",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Password Update API",
      error,
    });
  }
};

// update user profile photo
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    // get a file from user/client
    const file = getDataUri(req.file);
    // delete prev image
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    //update
    const cdb = await cloudinary.v2.uploader.upload(file.content);

    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // save function
    await user.save();

    res.status(200).send({
      success: true,
      message: "Profile pic updated",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Update Profile Pic API",
      error,
    });
  }
};

// FORGOT PASSWORD
export const resetPasswordController = async (req, res) => {
  try {
    // get user email | newpassword | answer
    const { email, newPassword, answer } = req.body;
    // validation
    if (!email || !newPassword || !answer) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields",
      });
    }
    // find user
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid user or answer",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: false,
      message: "Your password has been reset successfully. Please login",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error in Password Reset API",
      error,
    });
  }
};
