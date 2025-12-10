


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

// ------------------ MULTER STORAGE ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ----------------------------------------------------
// UPLOAD BOTH IMAGES + RUN OCR + SAVE TO KYC MODEL
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

      console.log('phone:', phone);

      if (!phone) {
        return res
          .status(400)
          .json({ error: "Phone number is required" });
      }

      if (!req.files?.front) {
        return res
          .status(400)
          .json({ error: "Front Aadhaar image required" });
      }

      // Check if KYC record exists after OTP verification
      let kyc = await KycModel.findOne({ mobile: phone });

      if (!kyc) {
        return res.status(400).json({
          error:
            "KYC entry not found. Complete OTP verification before uploading Aadhaar.",
        });
      }

      // ------------------ IMAGE PATHS ------------------
      const frontImagePath = req.files.front[0].path;
      const backImagePath =
        req.files.back?.[0]?.path || null;

      // ------------------ OCR ------------------
      const result = await Tesseract.recognize(frontImagePath, "eng");
      const ocrText = result.data.text;

      // ------------------ QR CODE ------------------
      const qrData = await extractQRCode(frontImagePath);

      // ------------------ PARSE TEXT ------------------
      const parsed = parseAadhaarText(ocrText);

      // ------------------ SAVE TO KYC ------------------
      kyc.aadhaarFrontImage = frontImagePath;
      kyc.aadhaarBackImage = backImagePath;
      kyc.ocr_text = ocrText;
      kyc.qr_data = qrData;
      kyc.parsed_data = parsed;

      // Update direct KYC fields
      if (parsed?.name) kyc.fullName = parsed.name;
      if (parsed?.dob) kyc.dob = parsed.dob;
      if (parsed?.gender) kyc.gender = parsed.gender;
      if (parsed?.aadhaar_number)
        kyc.aadhaarNumber = parsed.aadhaar_number;

      await kyc.save();

      // ------------------ RESPONSE ------------------
      return res.status(200).json({
        success: true,
        message: "Aadhaar uploaded and saved successfully",
        data: kyc,
      });

    } catch (err) {
      console.error("Aadhaar upload error:", err);
      return res.status(500).json({
        error: err.message,
      });
    }
  }
);

export default router;
