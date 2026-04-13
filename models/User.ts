import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'parent'],
    default: 'teacher'
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },
  classId: {
    type: String
  },
  childIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }]
});

export const User = mongoose.model("User", UserSchema);