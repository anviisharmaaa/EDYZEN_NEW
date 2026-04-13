import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String
});

export const Topic = mongoose.model("Topic", topicSchema);