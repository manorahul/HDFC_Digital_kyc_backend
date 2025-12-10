import mongoose from "mongoose";

const KycSchema = new mongoose.Schema(
  {
    // -------------------------------
    // PERSONAL INFORMATION (from OCR + QR + user input)
    // -------------------------------
    fullName: { type: String },
    dob: { type: String }, // keep string because Aadhaar uses DD/MM/YYYY
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    adress: { type: String },
    pinCode: { type: String },
    state: { type: String },
    district: { type: String },
    village: { type: String },


    panNumber: { type: String },
    father_name: { type: String },
    mothers_name: { type: String },
    occupation: { type: String },
    religion: { type: String },
    category: { type: String },

    mobile: { type: String },

    // -------------------------------
    // AADHAAR INFORMATION
    // -------------------------------
    aadhaarNumber: { type: String },   // Masked or full
    vid: { type: String },             // optional
    address: { type: String },         // if extracted from QR

    // -------------------------------
    // OCR RAW DATA
    // -------------------------------
    ocr_text: { type: String },
    qr_data: { type: Object }, // parsed QR JSON
    parsed_data: { type: Object }, // name, dob, gender, aadhaarNumber

    // -------------------------------
    // DOCUMENT UPLOADS
    // -------------------------------
    aadhaarFrontImage: { type: String }, // /uploads/aadhaar-front.jpg
    aadhaarBackImage: { type: String },
    faceImage: { type: String },


    nominees_name: { type: String },
    nominees_relationship: { type: String },
    nominees_dob: { type: String },

    // -------------------------------
    // OTP VERIFICATION
    // -------------------------------
    mobileOtpVerified: { type: Boolean, default: false },
    aadhaarOtpVerified: { type: Boolean, default: false },

    // -------------------------------
    // VERIFICATION STATUS
    // -------------------------------
    kycStatus: {
      type: String,
      enum: ["pending", "in_review", "verified", "rejected"],
      default: "pending",
    },

    rejectionReason: { type: String },

    // -------------------------------
    // TIMESTAMPS
    // -------------------------------
    verifiedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const KycModel = mongoose.model("kyc", KycSchema);
export default KycModel;
