// server.js
const express = require('express');
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9._-]/g,'');
    cb(null, `${ts}_${safe}`);
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // in case you want to serve frontend

// single endpoint to receive photo + qr + text fields
const cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'qr', maxCount: 1 }]);
app.post('/upload', cpUpload, (req, res) => {
  try {
    // files
    const files = req.files || {};
    const photoFile = files.photo && files.photo[0] ? files.photo[0].filename : null;
    const qrFile = files.qr && files.qr[0] ? files.qr[0].filename : null;

    // form fields
    const { latitude, longitude, account, payerPhone } = req.body;

    // Do whatever you need (save to DB, send notification, etc.)
    // Example: write a JSON record
    const record = {
      time: new Date().toISOString(),
      photoFile,
      qrFile,
      latitude,
      longitude,
      account,
      payerPhone
    };
    fs.appendFileSync(path.join(UPLOAD_DIR,'records.log'), JSON.stringify(record) + '\n');

    res.json({ ok: true, record });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).send('Upload failed');
  }
});
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Server listening on port ${port}`)
);

server.setTimeout(0);
