import express from "express";
import KYC from "../models/kycModel.js";
import adminAuth from "../middleware/auth.js";

const router = express.Router();

// Get all KYC records
router.get("/", adminAuth, async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};

    if (status) filter.kycStatus = status;
    if (q) {
      filter.$or = [
        { fullName: new RegExp(q, "i") },
        { mobile: new RegExp(q, "i") },
        { aadhaarNumber: new RegExp(q, "i") }
      ];
    }

    const kycs = await KYC.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, items: kycs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single KYC
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const k = await KYC.findById(req.params.id);
    if (!k) return res.status(404).json({ message: "KYC not found" });

    res.json(k);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update KYC status
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const updates = req.body;

    if (updates.kycStatus === "verified") {
      updates.verifiedAt = new Date();
    }

    const updated = await KYC.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
