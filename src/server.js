import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import connectDB from "./db/index.js";
import authRoutes from "./routes/auth.js";
import vacRoutes from "./routes/vac.js";
import pcRoutes from "./routes/pc.js";
import Student from "./models/vac-form-model.js";
import VacEntry from "./models/vac-model.js";
import econtentRoutes from "./routes/econtent.js";
import capacityRoutes from "./routes/capacity.js";
import teachingRoutes from "./routes/teaching.js";
import learnerRoutes from "./routes/learner-support.js";
import experientialRoutes from "./routes/experiential.js";
import libraryRoutes from "./routes/library.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup multer for file uploads
const uploadDir = path.join(__dirname, "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    cb(null, `${timestamp}-${randomStr}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "text/csv",
      "application/vnd.ms-excel",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/vac", upload.single("certificateUpload"), vacRoutes);
app.use("/api/pc", upload.single("brochureFile"), pcRoutes);
app.use("/api/econtent", upload.single("documentFile"), econtentRoutes);
app.use("/api/capacity", upload.single("documentFile"), capacityRoutes);
app.use("/api/teaching", upload.single("documentFile"), teachingRoutes);
app.use("/api/learner-support", upload.single("documentFile"), learnerRoutes);
app.use("/api/experiential", upload.single("documentFile"), experientialRoutes);
app.use("/api/library", upload.single("documentFile"), libraryRoutes);

// Simple DB health endpoint — returns mongoose connection status and total student count if available
app.get("/api/db/status", async (req, res) => {
  try {
    const state =
      (global && global.mongooseState) ||
      (Student && Student.db && Student.db.readyState) ||
      0;
    const ready = Student && Student.db && Student.db.readyState === 1;
    let studentCount = null;
    let entryCount = null;
    if (ready) {
      try {
        studentCount = await Student.countDocuments({}).exec();
      } catch (e) {
        studentCount = null;
      }
      try {
        entryCount = await VacEntry.countDocuments({}).exec();
      } catch (e) {
        entryCount = null;
      }
    }
    res.json({ ok: true, ready, state, studentCount, entryCount });
  } catch (err) {
    console.error("db status", err);
    res.status(500).json({ ok: false, error: "failed" });
  }
});

// NOTE: authentication handled in ./routes/auth.js (mounted at /api/auth). Removed duplicate handler that referenced undefined 'credentials'.

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
