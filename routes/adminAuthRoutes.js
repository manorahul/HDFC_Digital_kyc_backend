import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, admin: { email: admin.email, name: admin.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Default Admin (optional, only first time)
router.post("/create-default", async (req, res) => {
  try {
    const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (existing) return res.json({ message: "Admin already exists" });

    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await Admin.create({
      email: process.env.ADMIN_EMAIL,
      passwordHash: hash,
      name: "Super Admin"
    });

    res.json({ message: "Default admin created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
