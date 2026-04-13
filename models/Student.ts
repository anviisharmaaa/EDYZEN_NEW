import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  classId: {
    type: String
  },

  // ✅ ORGANIZATION FIELD
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  }
});

export const Student = mongoose.model("Student", StudentSchema);