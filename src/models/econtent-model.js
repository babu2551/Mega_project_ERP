import mongoose from "mongoose";

const eContentSchema = new mongoose.Schema(
  {
    faculty: {
      type: String,
      default: ""
    },
    moduleName: {
      type: String,
      default: ""
    },
    platform: {
      type: String,
      default: ""
    },
    dateOfLaunch: {
      type: String,
      default: ""
    },
    link: {
      type: String,
      default: ""
    },
    uploadedFile: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const EContent = mongoose.models.EContent || mongoose.model("EContent", eContentSchema);
export default EContent;
