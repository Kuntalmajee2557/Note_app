const mongoose = require('mongoose');

// Define the Note schema
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true
  }
});



// Compile models from the schemas
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
