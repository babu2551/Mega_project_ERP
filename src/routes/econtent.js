import express from "express";
import EContent from "../models/econtent-model.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();

router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const p = req.body || {};
    const entry = new EContent({
      faculty: p.faculty || p.facultyName || "",
      moduleName: p.module || p.moduleName || "",
      platform: p.platform || "",
      dateOfLaunch: p.dateOfLaunch || "",
      link: p.link || "",
      uploadedFile: req.file ? req.file.filename : null,
      createdBy: req.user?.id,
    });
    const saved = await entry.save();
    res
      .status(201)
      .json({
        ok: true,
        id: saved._id.toString(),
        uploadedFile: saved.uploadedFile,
      });
  } catch (err) {
    console.error("EContent submit error", err);
    res.status(500).json({ error: "Failed to save econtent" });
  }
});

router.get("/entries", authMiddleware, async (req, res) => {
  try {
    if (req.user && req.user.role === "admin") {
      const docs = await EContent.find({}).lean().exec();
      return res.json(
        docs.map((d) => ({
          id: d._id.toString(),
          createdAt: d.createdAt,
          ...d,
        }))
      );
    }
    const docs = await EContent.find({ createdBy: req.user?.id }).lean().exec();
    return res.json(
      docs.map((d) => ({ id: d._id.toString(), createdAt: d.createdAt, ...d }))
    );
  } catch (err) {
    console.error("EContent entries error", err);
    res.status(500).json({ error: "Failed to fetch econtent entries" });
  }
});

router.get("/entries/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await EContent.findById(id).lean().exec();
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (
      req.user.role !== "admin" &&
      String(doc.createdBy || "") !== String(req.user.id)
    )
      return res.status(403).json({ error: "Forbidden" });
    return res.json({
      id: doc._id.toString(),
      createdAt: doc.createdAt,
      ...doc,
    });
  } catch (err) {
    console.error("EContent read error", err);
    res.status(500).json({ error: "Failed to read econtent entry" });
  }
});

export default router;
