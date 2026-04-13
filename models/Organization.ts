import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema({
  name: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  adminEmail: String,
  adminPassword: String,
  teacherIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }]
});

export const Organization = mongoose.model("Organization", OrganizationSchema);