


// import express from "express";
// import multer from "multer";
// import Tesseract from "tesseract.js";
// import { extractQRCode } from "../utils/qrReader.js";
// import { parseAadhaarText } from "../utils/parser.js";
// import crypto from "crypto";
// import { generateAadharOTP, verifyAadharOTP } from "../controllers/authenticationController.js";

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
// });

// const upload = multer({ storage });

// // ------------------------------
// // UPLOAD BOTH IMAGES AT ONCE
// // ------------------------------
// router.post(
//   "/upload",
//   upload.fields([
//     { name: "front", maxCount: 1 },
//     { name: "back", maxCount: 1 }
//   ]),
//   async (req, res) => {
//     try {
//       if (!req.files?.front) {
//         return res.status(400).json({ error: "Front image required" });
//       }

//       const frontImage = req.files.front[0].path;

//       // OCR only on FRONT
//       const result = await Tesseract.recognize(frontImage, "eng");
//       const text = result.data.text;

//       const qr = await extractQRCode(frontImage);

//       return res.json({
//         ocr_text: text,
//         qr_data: qr,
//         parsed: parseAadhaarText(text)
//       });

//     } catch (err) {
//       return res.status(500).json({ error: err.message });
//     }
//   }
// );


// export default router;


import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import { extractQRCode } from "../utils/qrReader.js";
import { parseAadhaarText } from "../utils/parser.js";
import KycModel from "../models/kycModel.js";

const router = express.Router();

// ----------------------------------------------------
// 1️⃣ MULTER MEMORY STORAGE — NO FILE SYSTEM
// ----------------------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----------------------------------------------------
// 2️⃣ UPLOAD BOTH IMAGES + OCR + QR + SAVE IN DATABASE
// ----------------------------------------------------
router.post(
  "/upload",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      if (!req.files?.front) {
        return res.status(400).json({ error: "Front Aadhaar image required" });
      }

      // Get KYC record
      let kyc = await KycModel.findOne({ mobile: phone });
      if (!kyc) {
        return res.status(400).json({
          error: "KYC entry not found. Complete OTP verification first.",
        });
      }

      // ----------------------------------------------------
      // 3️⃣ Convert images to Base64
      // ----------------------------------------------------
      const frontFile = req.files.front[0];
      const backFile = req.files.back?.[0];

      const base64Front = `data:${frontFile.mimetype};base64,${frontFile.buffer.toString("base64")}`;
      const base64Back = backFile
        ? `data:${backFile.mimetype};base64,${backFile.buffer.toString("base64")}`
        : null;

      // ----------------------------------------------------
      // 4️⃣ OCR (Tesseract) using buffer
      // ----------------------------------------------------
      const frontBlob = new Blob([frontFile.buffer], { type: frontFile.mimetype });
      const ocrResult = await Tesseract.recognize(frontBlob, "eng");
      const ocrText = ocrResult.data.text;

      // ----------------------------------------------------
      // 5️⃣ QR CODE extraction (memory buffer)
      // ----------------------------------------------------
      const qrData = await extractQRCode(frontFile.buffer);

      // ----------------------------------------------------
      // 6️⃣ Parse Aadhaar text
      // ----------------------------------------------------
      const parsed = parseAadhaarText(ocrText);

      // ----------------------------------------------------
      // 7️⃣ Update KYC record in MongoDB
      // ----------------------------------------------------
      kyc.aadhaarFrontImage = base64Front;
      kyc.aadhaarBackImage = base64Back;
      kyc.ocr_text = ocrText;
      kyc.qr_data = qrData;
      kyc.parsed_data = parsed;

      // Update KYC main fields
      if (parsed?.name) kyc.fullName = parsed.name;
      if (parsed?.dob) kyc.dob = parsed.dob;
      if (parsed?.gender) kyc.gender = parsed.gender;
      if (parsed?.aadhaar_number) kyc.aadhaarNumber = parsed.aadhaar_number;

      await kyc.save();

      // ----------------------------------------------------
      // 8️⃣ RESPONSE
      // ----------------------------------------------------
      return res.status(200).json({
        success: true,
        message: "Aadhaar uploaded, OCR extracted & saved successfully",
        data: kyc,
      });

    } catch (err) {
      console.error("Aadhaar upload error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);

export default router;
