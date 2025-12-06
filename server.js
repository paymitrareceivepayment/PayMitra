const express = require("express");
const multer = require("multer");
const cors = require("cors");

const app = express();

// Important: No server timeout
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // allow up to 10 MB photo
  }
});

app.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    console.log("=========== UPLOAD RECEIVED =================");
    console.log("Name:", req.body.name);
    console.log("Account:", req.body.account);
    console.log("Phone:", req.body.phone);
    console.log("Notes:", req.body.notes);
    console.log("Location:", req.body.location);
    console.log("Image size:", req.file?.size);

    // Must respond fast (within 2–4 sec) to avoid browser timeout
    res.json({ success: true, message: "Received" });

  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove all timeouts (for Render/Vercel)
app.use((req, res, next) => {
  req.setTimeout(0);
  res.setTimeout(0);
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));