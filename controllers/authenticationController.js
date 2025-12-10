// controllers/authenticationController.js
import crypto from "crypto";
import KycModel from "../models/kycModel.js";


export const generateOTP = (client) => async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "phone required" });

    const otp = crypto.randomInt(100000, 999999).toString();

    console.log(`Generated OTP for ${phone}: ${otp}`);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const key = `otp:${phone}`;
    // store JSON as string (or just store otp); using setEx for atomic set + expiry
    await client.setEx(key, 300, JSON.stringify({ otp, expiresAt }));

    // Do NOT return otp in production. For testing you can return it.
    return res.status(200).json({ success: true, message: "OTP generated", otp, expiresAt });
  } catch (err) {
    console.error("generateOTP error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// export const verifyOTP = (client) => async (req, res) => {
//   try {
//     const { phone, userEnteredOTP } = req.body;
//     console.log(phone, userEnteredOTP)
//     if (!phone || !userEnteredOTP) {
//       return res.status(400).json({ success: false, message: "phone and userEnteredOTP required" });
//     }

//     const key = `otp:${phone}`;
//     const val = await client.get(key);
//     if (!val) {
//       return res.status(400).json({ success: false, message: "OTP not found or expired" });
//     }

//     let parsed;
//     try {
//       parsed = JSON.parse(val);
//     } catch {
//       // if a plain OTP string is stored, handle that
//       parsed = { otp: val };
//     }

//     if (String(parsed.otp) !== String(userEnteredOTP)) {
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }

//     // success: delete OTP to avoid reuse
//     await client.del(key);

//     // return success — you might issue JWT or create the user session here
//     return res.status(200).json({ success: true, message: "OTP verified successfully" });
//   } catch (err) {
//     console.error("verifyOTP error:", err);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };


export const verifyOTP = (client) => async (req, res) => {
  try {
    const { phone, userEnteredOTP } = req.body;

    if (!phone || !userEnteredOTP) {
      return res
        .status(400)
        .json({ success: false, message: "phone and userEnteredOTP required" });
    }

    const key = `otp:${phone}`;
    const val = await client.get(key);

    if (!val) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or expired" });
    }

    let parsed;
    try {
      parsed = JSON.parse(val);
    } catch {
      parsed = { otp: val };
    }

    if (String(parsed.otp) !== String(userEnteredOTP)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP" });
    }

    // Delete OTP after verification
    await client.del(key);

    // ----------------------------
    // SAVE PHONE TO KYC MODEL
    // ----------------------------
    let kyc = await KycModel.findOne({ mobile: phone });

    if (!kyc) {
      // Create new KYC entry
      kyc = await KycModel.create({
        mobile: phone,
        mobileOtpVerified: true,
        kycStatus: "pending"
      });
    } else {
      // Update existing KYC entry
      kyc.mobileOtpVerified = true;
      await kyc.save();
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      kyc
    });

  } catch (err) {
    console.error("verifyOTP error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};










// aadhaar verification 

export const generateAadharOTP = (client) => async (req, res) => {
  try {
    const { aadhaar_number } = req.body;
    if (!aadhaar_number) return res.status(400).json({ success: false, message: "aadhaar_number required" });
    
    const otp = crypto.randomInt(100000, 999999).toString();

    console.log(`Generated OTP for ${aadhaar_number}: ${otp}`);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const key = `otp:${aadhaar_number}`;
    // store JSON as string (or just store otp); using setEx for atomic set + expiry
    await client.setEx(key, 300, JSON.stringify({ otp, expiresAt }));

    // Do NOT return otp in production. For testing you can return it.
    return res.status(200).json({ success: true, message: "OTP generated", otp, expiresAt });
  } catch (err) {
    console.error("generateOTP error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};








// aadhaar verification

export const verifyAadharOTP = (client) => async (req, res) => {
  try {
    const { aadhaar_number, userEnteredOTP } = req.body;
    if (!aadhaar_number || !userEnteredOTP) {
      return res.status(400).json({ success: false, message: "aadhaar_number and userEnteredOTP required" });
    }

    const key = `otp:${aadhaar_number}`;
    const val = await client.get(key);
    if (!val) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    let parsed;
    try {
      parsed = JSON.parse(val);
    } catch {
      // if a plain OTP string is stored, handle that
      parsed = { otp: val };
    }

    if (String(parsed.otp) !== String(userEnteredOTP)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // success: delete OTP to avoid reuse
    await client.del(key);

    // return success — you might issue JWT or create the user session here
    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("verifyOTP error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

