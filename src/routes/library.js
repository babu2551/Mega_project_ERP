import express from "express";
import Library from "../models/library-model.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();

router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const p = req.body || {};
    const entry = new Library({
      booksRecommended: p.booksRecommended || "",
      newBooksAdded: p.newBooksAdded || 0,
      eResources: p.eResources || "",
      programmeCode: p.programmeCode || p.programmeCode || "",
      programmeName: p.programmeName || "",
      recommendationLink: p.recommendationLink || "",
      program_Id: p.program_Id || p.programId || p.programmeCode || "",
      uploadedFile: req.file ? req.file.filename : null,
      createdBy: req.user?.id,
    });
    const saved = await entry.save();
    res.status(201).json({
      ok: true,
      id: saved._id.toString(),
      uploadedFile: saved.uploadedFile,
    });
  } catch (err) {
    console.error("Library submit error", err);
    res.status(500).json({ error: "Failed to save library entry" });
  }
});

router.get("/entries", authMiddleware, async (req, res) => {
  try {
    const q = {};
    if (req.query.programId) q.program_Id = req.query.programId;
    if (!(req.user && req.user.role === "admin")) q.createdBy = req.user?.id;

    const docs = await Library.find(q).lean().exec();
    return res.json(
      docs.map((d) => ({ id: d._id.toString(), createdAt: d.createdAt, ...d }))
    );
  } catch (err) {
    console.error("Library entries error", err);
    res.status(500).json({ error: "Failed to fetch library entries" });
  }
});

router.get("/entries/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Library.findById(id).lean().exec();

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
    console.error("Library read error", err);
    res.status(500).json({ error: "Failed to read library entry" });
  }
});

export default router;
