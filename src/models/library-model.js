import mongoose from 'mongoose';

const librarySchema = new mongoose.Schema(
  {
    booksRecommended: {
      type: String,
      default: ''
    },
    newBooksAdded: {
      type: Number,
      default: 0
    },
    eResources: {
      type: String,
      default: ''
    },
    programmeCode: {
      type: String,
      default: '',
      unique: true
    },
    program_Id: {
      type: String,
      default: ''
    },
    programmeName: {
      type: String,
      default: ''
    },
    recommendationLink: {
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

const Library = mongoose.models.Library || mongoose.model('Library', librarySchema);
export default Library;
