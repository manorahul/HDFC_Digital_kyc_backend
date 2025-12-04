import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import { extractQRCode } from "../utils/qrReader.js";
import { parseAadhaarText } from "../utils/parser.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("aadhaar"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const result = await Tesseract.recognize(imagePath, "eng");
    const text = result.data.text;

    const qr = await extractQRCode(imagePath);

    return res.json({
      ocr_text: text,
      qr_data: qr,
      parsed: parseAadhaarText(text)
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
