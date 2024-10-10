const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file
  },
});

const upload = multer({ storage });

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Upload Image
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).send({ filePath: req.file.path });
});

// Edit Image: Resize and Save
app.post('/edit', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const outputPath = `./edited/${Date.now()}_edited.png`;
  try {
    await sharp(req.file.path)
      .resize(300, 300) // Resize the image to 300x300 pixels
      .toFile(outputPath);

    res.status(200).send({ message: 'Image edited successfully!', outputPath });
  } catch (error) {
    res.status(500).send({ error: 'Failed to edit image.' });
  }
});

// Get File Map
app.get('/file-map', (req, res) => {
  const fileMap = {};
  const uploadPath = './uploads';

  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      return res.status(500).send({ error: 'Failed to retrieve file map.' });
    }
    files.forEach(file => {
      fileMap[file] = path.join(uploadPath, file);
    });
    res.status(200).send(fileMap);
  });
});

app.listen(port, () => {
  console.log(`Image Editor Server running at http://localhost:${port}`);
});
