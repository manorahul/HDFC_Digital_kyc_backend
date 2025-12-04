// controllers/authenticationController.js
import crypto from "crypto";

export const generateOTP = (client) => async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "phone required" });

    const otp = crypto.randomInt(100000, 999999).toString();
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

export const verifyOTP = (client) => async (req, res) => {
  try {
    const { phone, userEnteredOTP } = req.body;
    if (!phone || !userEnteredOTP) {
      return res.status(400).json({ success: false, message: "phone and userEnteredOTP required" });
    }

    const key = `otp:${phone}`;
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

