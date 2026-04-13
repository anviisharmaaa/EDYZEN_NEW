import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: String,
  date: String,
  present: Boolean
});

export const Attendance = mongoose.model("Attendance", attendanceSchema);