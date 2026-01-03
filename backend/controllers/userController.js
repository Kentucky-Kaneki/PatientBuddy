import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded info (id, email) to request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password, licenseNumber, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      licenseNumber,
      specialization
    });

    await newUser.save();
    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ SIGNIN
export const signin = async (req, res) => {
  try {
    const { email, licenseNumber, password } = req.body;

    // Find user by BOTH email AND licenseNumber for better security
    const user = await User.findOne({ 
      email: email,
      licenseNumber: licenseNumber 
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, specialization: user.specialization }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};