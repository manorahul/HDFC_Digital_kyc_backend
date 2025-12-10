import multer from "multer";
import KycModel from "../models/kycModel.js";

// -------------------------------------------------------------
// 1️⃣ Multer Memory Storage (NO FILE SYSTEM)
// -------------------------------------------------------------
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// -------------------------------------------------------------
// 2️⃣ Controller: Upload face image → Store Base64 in MongoDB
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

        // Find KYC record
        const kyc = await KycModel.findOne({ mobile: phone });

        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC record not found. Complete previous steps first.",
            });
        }

        // Convert image buffer → Base64 string
        const base64Image = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype; // image/jpeg, image/png, etc.

        // Save full base64 data URI inside MongoDB
        kyc.faceImage = `data:${mimeType};base64,${base64Image}`;
        await kyc.save();

        return res.status(200).json({
            success: true,
            message: "Face image stored in database successfully",
            faceImage: kyc.faceImage, // Base64 preview image
            data: kyc,
        });

    } catch (err) {
        console.error("Upload Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
