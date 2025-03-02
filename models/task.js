const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Ensure _id is ObjectId
  content: String,
});

module.exports = mongoose.model("Task", TaskSchema);
