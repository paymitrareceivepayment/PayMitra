// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// create uploads dir if not exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// JSON body parser for payloads up to ~10MB
app.use(express.json({ limit: '12mb' }));

// Serve frontend static files (public/)
app.use(express.static(path.join(__dirname, 'public')));

// Simple health route
app.get('/ping', (req, res) => res.send('ok'));

// POST /api/upload
app.post('/api/upload', async (req, res) => {
  try {
    const { photoBase64, photoMime, recipient, payerPhone, amount, note, location } = req.body;

    if (!photoBase64 || !photoMime) {
      return res.status(400).json({ error: 'Missing photo data' });
    }

    // generate filename
    const id = crypto.randomBytes(10).toString('hex');
    const ext = (photoMime && photoMime.split('/')[1]) ? photoMime.split('/')[1].replace('jpeg','jpg') : 'jpg';
    const filename = `${Date.now()}_${id}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // write file
    const buffer = Buffer.from(photoBase64, 'base64');
    fs.writeFileSync(filepath, buffer);

    // save a simple metadata file (json) alongside image
    const meta = {
      id,
      filename,
      recipient,
      payerPhone,
      amount,
      note,
      location,
      receivedAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(UPLOAD_DIR, filename + '.json'), JSON.stringify(meta, null, 2));

    // respond
    return res.json({ success: true, id, filename });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// start server
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Server listening on port ${port}`)
);

server.setTimeout(0);
