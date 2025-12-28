import mongoose from 'mongoose';

const experientialSchema = new mongoose.Schema(
  {
    componentType: {
      type: String,
      default: ''
    },
    objective: {
      type: String,
      default: ''
    },
    coMapped: {
      type: String,
      default: ''
    },
    rubrics: {
      type: String,
      default: ''
    },
    programmeCode: {
      type: String,
      default: ''
    },
    program_Id: {
      type: String,
      default: ''
    },
    programmeName: {
      type: String,
      default: ''
    },
    courseCode: {
      type: String,
      default: ''
    },
    evidenceLink: {
      type: String,
      default: ''
    },
    reportSubmitted: {
      type: String,
      default: ''
    },
    uploadedFile: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
  },
  { timestamps: true }
);

const Experiential = mongoose.models.Experiential || mongoose.model('Experiential', experientialSchema);
export default Experiential;
