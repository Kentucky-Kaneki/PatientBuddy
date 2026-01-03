import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Member from "../models/Member.js";

/**
 * =========================
 * GET LOGGED-IN USER INFO
 * Route: GET /api/patient/me
 * Middleware: protect
 * =========================
 */
export const getUserInfo = async (req, res) => {
  try {
    // req.user is injected by auth middleware
    const user = await User.findById(req.user.id)
      .populate("members")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("getUserInfo error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * =========================
 * SIGNUP
 * Route: POST /api/patient/signup
 * =========================
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      members: [],
    });

    // Create primary member (same as user)
    const primaryMember = new Member({
      name,
    });
    await primaryMember.save();

    newUser.members.push(primaryMember._id);
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * =========================
 * SIGNIN
 * Route: POST /api/patient/signin
 * =========================
 */
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
