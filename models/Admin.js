import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: "Admin" }
}, { timestamps: true });

AdminSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
