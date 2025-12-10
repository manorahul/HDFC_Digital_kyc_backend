import express from "express";
import KycModel from "../models/kycModel.js";

const router = express.Router();

/**
 * UPDATE USER'S ADDRESS INFORMATION
 */
router.post("/save-address", async (req, res) => {
  try {
    const {
      phone,
      adress,
      pinCode,
      state,
      district,
      village
    } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone is required" });
    }

    // Find existing KYC entry
    const kyc = await KycModel.findOne({ mobile: phone });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found. Complete Aadhaar verification first."
      });
    }

    // Update fields
    kyc.adress = adress;  // using same schema spelling
    kyc.pinCode = pinCode;
    kyc.state = state;
    kyc.district = district;
    kyc.village = village;

    // OPTIONAL: Update KYC status progress
    kyc.kycStatus = "in_review";

    await kyc.save();

    return res.status(200).json({
      success: true,
      message: "Address information saved successfully",
      data: kyc,
    });

  } catch (err) {
    console.error("Address update error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});


router.post("/save-pan",  async (req, res) => {
  try {
    const { phone, panNumber } = req.body;

    if (!phone || !panNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone and PAN number are required",
      });
    }

    // Find the user KYC record
    const kyc = await KycModel.findOne({ mobile: phone });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found! Complete previous steps first.",
      });
    }

    // Save the PAN number
    kyc.panNumber = panNumber;

    await kyc.save();

    res.status(200).json({
      success: true,
      message: "PAN saved successfully",
      data: kyc,
    });

  } catch (err) {
    console.error("PAN save error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});



router.post("/save-nominee",  async (req, res) => {
  try {
    const { phone, name, relationship, dob } = req.body;

    if (!phone || !name || !relationship || !dob) {
      return res.status(400).json({
        success: false,
        message: "Phone, name, relationship and dob are required",
      });
    }

    // Find the KYC record
    const kyc = await KycModel.findOne({ mobile: phone });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found",
      });
    }

    // Update nominee details
    kyc.nominees_name = name;
    kyc.nominees_relationship = relationship;
    kyc.nominees_dob = dob;


    await kyc.save();

    return res.json({
      success: true,
      message: "Nominee details saved successfully",
      data: kyc,
    });

  } catch (err) {
    console.error("Nominee Save Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


router.post("/save-additional-details", async (req, res) => {
  try {
    const { phone, father_name, mother_name, occupation, religion, category } =
      req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Find KYC record
    const kyc = await KycModel.findOne({ mobile: phone });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found",
      });
    }

    // Update additional personal details
    kyc.father_name = father_name;
    kyc.mothers_name = mother_name;
    kyc.occupation = occupation;
    kyc.religion = religion;
    kyc.category = category;

    await kyc.save();

    return res.json({
      success: true,
      message: "Additional details saved successfully",
      data: kyc,
    });
  } catch (err) {
    console.error("Additional details save error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});




router.get("/kyc-status", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const kyc = await KycModel.findOne({ mobile: phone });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found",
      });
    }

    return res.json({
      success: true,
      status: kyc.kycStatus,
      updatedAt: kyc.updatedAt,
    });
  } catch (err) {
    console.error("KYC Status Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


export default router;
