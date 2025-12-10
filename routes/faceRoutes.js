import express from "express";
import { upload, uploadFaceImage } from "../controllers/faceUploadController.js";

const router = express.Router();

router.post("/upload-face", upload.single("faceImage"), uploadFaceImage);

export default router;
