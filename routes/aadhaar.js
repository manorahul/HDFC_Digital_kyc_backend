


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


import multer from "multer";
import KycModel from "../models/kycModel.js";

// Multer memory storage (NO FILE WRITING)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// -------------------------------------------------------------
//   CONTROLLER: Upload face image into MongoDB (Base64)
// -------------------------------------------------------------
export const uploadFaceImage = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Face image is required",
            });
        }

        // Convert file buffer to Base64 string
        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype; // ex: image/jpeg

        // Find KYC entry
        const kyc = await KycModel.findOne({ mobile: phone });

        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC record not found.",
            });
        }

        // Save into DB
        kyc.faceImage = `data:${mimeType};base64,${base64Image}`;
        await kyc.save();

        return res.status(200).json({
            success: true,
            message: "Face image stored in database successfully",
            faceImage: kyc.faceImage
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
