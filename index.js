import { createRequire } from "module"
const require = createRequire(import.meta.url)
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const textract = require('textract');
const express = require('express');
const app = express();
const cors = require('cors');

import { job } from "./cron.js";
job.start()
app.use(cors())
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx'];
    const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    // console.log("extname:", path.extname(file.originalname).toLowerCase());
    // console.log("mimetype:", file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    
    return cb(new Error('Only PDF and DOCX files are allowed!'));
  }
});

// Handle file upload and text extraction
app.post('/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Validate file extension
    if (!['.pdf', '.docx'].includes(fileExt)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      return res.status(400).json({ success: false, message: 'Invalid file type. Only PDF and DOCX are allowed.' });
    }

    // Extract text using Textract
    textract.fromFileWithPath(filePath, (error, text) => {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });

      if (error) {
        console.error('Extraction error:', error);
        return res.status(500).json({ success: false, message: 'Error extracting text from file' });
      }

      // console.log('Extracted text:', text);

      return res.json({ success: true, extractedText: text });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
