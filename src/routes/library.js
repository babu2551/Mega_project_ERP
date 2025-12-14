import express from 'express';
import Library from '../models/library-model.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

router.post('/submit', authMiddleware, async (req, res) => {
    try {
        console.log('POST /api/library/submit by user=', req.user && req.user.id);
        console.log('Body:', JSON.stringify(req.body).slice(0, 2000));
        const p = req.body || {};
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
        if (!p.booksRecommended && !p.programmeCode) return res.status(400).json({ error: 'Missing booksRecommended or programmeCode' });
        const entry = new Library({
            booksRecommended: p.booksRecommended || '',
            newBooksAdded: Number(p.newBooksAdded) || 0,
            eResources: p.eResources || '',
            recommendationLink: p.recommendationLink || '',
            programmeCode: (p.programmeCode || '').trim().toUpperCase(),
            programmeName: p.programmeName || '',
            uploadedFile: req.file ? req.file.filename : null,
            createdBy: req.user?.id,
        });
        const saved = await entry.save();
        console.log('Saved library entry id=', saved._id.toString());
        res.status(201).json({ ok: true, id: saved._id.toString(), uploadedFile: saved.uploadedFile, programmeCode: entry.programmeCode, programmeName: entry.programmeName });
    } catch (err) {
        console.error('Library submit error', err);
        res.status(500).json({ error: 'Failed to save library entry' });
    }
});

router.get('/entries', authMiddleware, async (req, res) => {
    try {
        const q = req.query || {};
        const filter = {};
        if (q.programmeCode) filter.programmeCode = String(q.programmeCode).toUpperCase();
        if (q.startDate || q.endDate) {
            filter.createdAt = {};
            if (q.startDate) filter.createdAt.$gte = new Date(q.startDate);
            if (q.endDate) filter.createdAt.$lte = new Date(q.endDate);
        }

        if (req.user && req.user.role === 'admin') {
            const docs = await Library.find(filter).lean().exec();
            return res.json(docs.map((d) => ({ id: d._id.toString(), createdAt: d.createdAt, ...d })));
        }

        filter.createdBy = req.user?.id;
        const docs = await Library.find(filter).lean().exec();
        return res.json(docs.map((d) => ({ id: d._id.toString(), createdAt: d.createdAt, ...d })));
    } catch (err) {
        console.error('Library entries error', err);
        res.status(500).json({ error: 'Failed to fetch library entries' });
    }
});

router.get('/entries/:id', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const doc = await Library.findById(id).lean().exec();
        if (!doc) return res.status(404).json({ error: 'Not found' });
        if (req.user.role !== 'admin' && String(doc.createdBy || '') !== String(req.user.id))
            return res.status(403).json({ error: 'Forbidden' });
        return res.json({ id: doc._id.toString(), createdAt: doc.createdAt, ...doc });
    } catch (err) {
        console.error('Library read error', err);
        res.status(500).json({ error: 'Failed to read library entry' });
    }
});

// CSV download for library entries (admin)
router.get('/entries/download', authMiddleware, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
        const q = req.query || {};
        const filter = {};
        if (q.programmeCode) filter.programmeCode = String(q.programmeCode).toUpperCase();
        const docs = await Library.find(filter).lean().exec();
        const keys = ['id', 'createdAt', 'programmeCode', 'programmeName', 'booksRecommended', 'newBooksAdded', 'eResources', 'recommendationLink'];
        const rows = docs.map(d => ({ id: d._id.toString(), createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : '', programmeCode: d.programmeCode || '', programmeName: d.programmeName || '', booksRecommended: d.booksRecommended || '', newBooksAdded: d.newBooksAdded || 0, eResources: d.eResources || '', recommendationLink: d.recommendationLink || '' }));
        const csv = [keys.join(','), ...rows.map(r => keys.map(k => {
            const v = r[k]; if (v === null || v === undefined) return ''; const s = typeof v === 'object' ? JSON.stringify(v) : String(v); return s.includes(',') || s.includes('\n') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
        }).join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="library_entries.csv"');
        res.send(csv);
    } catch (err) {
        console.error('Library download error', err);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
});

export default router;
