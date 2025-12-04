// routes/routes.js
import express from "express";
import { generateOTP, verifyOTP } from "../controllers/authenticationController.js";

export default function routerFactory(client) {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.send("Welcome to the Home Page!");
  });

  // Generate OTP
  router.post("/generate-otp", (req, res) => generateOTP(client)(req, res));

  // Verify OTP
  router.post("/verify-otp", (req, res) => verifyOTP(client)(req, res));

  return router;
}
