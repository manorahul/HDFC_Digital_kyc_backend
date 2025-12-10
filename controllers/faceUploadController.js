import multer from "multer";
import path from "path";
import fs from "fs";
import KycModel from "../models/kycModel.js";

// Create upload folder if not exists
const uploadDir = "./uploads/faces";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = "face_" + Date.now() + ext;
        cb(null, uniqueName);
    },
});

export const upload = multer({ storage });

// -------------------------------------------------------------
//   CONTROLLER: Upload face image + Save to KYC model
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

        // Save image path
        const faceImagePath = `/uploads/faces/${req.file.filename}`;
        kyc.faceImage = faceImagePath;
        await kyc.save();

        return res.status(200).json({
            success: true,
            message: "Face image uploaded successfully",
            filePath: faceImagePath,
            data: kyc,
        });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
