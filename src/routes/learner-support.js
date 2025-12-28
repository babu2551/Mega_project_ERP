import express from "express";
import LearnerSupport from "../models/learnerSupport-model.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();

router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const p = req.body || {};
    const entry = new LearnerSupport({
      criteriaUsed: p.criteriaUsed || "",
      slowLearnersCount: p.slowLearnersCount || 0,
      advancedLearnersCount: p.advancedLearnersCount || 0,
      outcome: p.outcome || "",
      measuresTaken: p.measuresTaken || "",
      programmeCode: p.programmeCode || "",
      programmeName: p.programmeName || "",
      courseCode: p.courseCode || "",
      evidenceLink: p.evidenceLink || "",
      program_Id: p.program_Id || p.programId || p.programmeCode || "",
      uploadedFile: req.file ? req.file.filename : null,
      createdBy: req.user?.id,
    });
    const saved = await entry.save();
    res.status(201).json({ ok: true, id: saved._id.toString(), uploadedFile: saved.uploadedFile });
  } catch (err) {
    console.error("Learner submit error", err);
    res.status(500).json({ error: "Failed to save learner support entry" });
  }
});

router.get("/entries", authMiddleware, async (req, res) => {
  try {
    if (req.user && req.user.role === "admin") {
      const docs = await LearnerSupport.find({}).lean().exec();
      return res.json(docs.map((d) => ({ id: d._id.toString(), createdAt: d.createdAt, ...d })));
    }
    const docs = await LearnerSupport.find({ createdBy: req.user?.id }).lean().exec();
    return res.json(docs.map((d) => ({ id: d._id.toString(), createdAt: d.createdAt, ...d })));
  } catch (err) {
    console.error("Learner entries error", err);
    res.status(500).json({ error: "Failed to fetch learner support entries" });
  }
});

router.get("/entries/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await LearnerSupport.findById(id).lean().exec();
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (req.user.role !== "admin" && String(doc.createdBy || "") !== String(req.user.id)) return res.status(403).json({ error: "Forbidden" });
    return res.json({ id: doc._id.toString(), createdAt: doc.createdAt, ...doc });
  } catch (err) {
    console.error("Learner read error", err);
    res.status(500).json({ error: "Failed to read learner support entry" });
  }
});

export default router;
