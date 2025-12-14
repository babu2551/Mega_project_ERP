import mongoose from 'mongoose';

const learnerSupportSchema = new mongoose.Schema(
  {
    criteriaUsed: { type: String, default: '' },
    slowLearnersCount: { type: Number, default: 0 },
    advancedLearnersCount: { type: Number, default: 0 },
    outcome: { type: String, default: '' },
    measuresTaken: { type: String, default: '' },
    programmeCode: { type: String, default: '' },
    programmeName: { type: String, default: '' },
    courseCode: { type: String, default: '' },
    evidenceLink: { type: String, default: '' },
    uploadedFile: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

const LearnerSupport = mongoose.models.LearnerSupport || mongoose.model('LearnerSupport', learnerSupportSchema);
export default LearnerSupport;
