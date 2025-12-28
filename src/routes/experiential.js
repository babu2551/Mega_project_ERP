import express from "express";
import Experiential from "../models/experiential-model.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();

router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const p = req.body || {};
    const entry = new Experiential({
      componentType: p.componentType || "",
      objective: p.objective || "",
      coMapped: p.coMapped || "",
      rubrics: p.rubrics || "",
      programmeCode: p.programmeCode || p.programmeCode || "",
      programmeName: p.programmeName || "",
      courseCode: p.courseCode || "",
      evidenceLink: p.evidenceLink || "",
      reportSubmitted: p.reportSubmitted || "",
      program_Id: p.program_Id || p.programId || p.programmeCode || "",
      uploadedFile: req.file ? req.file.filename : null,
      createdBy: req.user?.id,
    });
    const saved = await entry.save();
    res.status(201).json({ ok: true, id: saved._id.toString(), uploadedFile: saved.uploadedFile });
  } catch (err) {
    console.error("Experiential submit error", err);
    res.status(500).json({ error: "Failed to save experiential entry" });
  }
});

router.get("/entries", authMiddleware, async (req, res) => {
  try {
    if (req.user && req.user.role === "admin") {
      const docs = await Experiential.find({}).lean().exec();
      return res.json(docs.map((d) => ({ id: d._id.toString(), createdAt: d.createdAt, ...d })));
    }
    const docs = await Experiential.find({ createdBy: req.user?.id }).lean().exec();
    return res.json(docs.map((d) => ({ id: d._id.toString(), createdAt: d.createdAt, ...d })));
  } catch (err) {
    console.error("Experiential entries error", err);
    res.status(500).json({ error: "Failed to fetch experiential entries" });
  }
});

router.get("/entries/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Experiential.findById(id).lean().exec();
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (req.user.role !== "admin" && String(doc.createdBy || "") !== String(req.user.id)) return res.status(403).json({ error: "Forbidden" });
    return res.json({ id: doc._id.toString(), createdAt: doc.createdAt, ...doc });
  } catch (err) {
    console.error("Experiential read error", err);
    res.status(500).json({ error: "Failed to read experiential entry" });
  }
});

export default router;
