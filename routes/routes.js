// routes/routes.js
import express from "express";
import { generateAadharOTP, generateOTP, verifyAadharOTP, verifyOTP } from "../controllers/authenticationController.js";
import { upload, uploadFaceImage } from "../controllers/faceUploadController.js";


export default function routerFactory(client) {
  const router = express.Router();

  // Generate OTP
  router.post("/generate-otp", (req, res) => generateOTP(client)(req, res));

  // Verify OTP
  router.post("/verify-otp", (req, res) => verifyOTP(client)(req, res));


  router.post("/generate-aadhar-otp", (req, res) => generateAadharOTP(client)(req, res));

  router.post("/verify-aadhar-otp", (req, res) => verifyAadharOTP(client)(req, res));



  router.post("/upload-face", upload.single("faceImage"), uploadFaceImage);


  return router;
}
