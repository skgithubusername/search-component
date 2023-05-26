const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/registration', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the student schema and model
const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  company: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  phoneNumber: String,
  linkedInProfile: String,
  areasOfExpertise: {
    type: [String],
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  availability: String,
  resumeURL: String,
});

const Student = mongoose.model('Student', studentSchema);

// Configure Multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + path.extname(file.originalname);
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// API endpoint for handling student registration
app.post('/students', upload.single('resume'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      company,
      position,
      phoneNumber,
      linkedInProfile,
      areasOfExpertise,
      experience,
      availability,
    } = req.body;

    const student = new Student({
      fullName,
      email,
      company,
      position,
      phoneNumber,
      linkedInProfile,
      areasOfExpertise: areasOfExpertise.split(',').map((area) => area.trim()),
      experience,
      availability,
      resumeURL: req.file ? req.file.path : '',
    });

    await student.save();

    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
