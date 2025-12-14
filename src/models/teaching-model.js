import mongoose from "mongoose";

const teachingSchema = new mongoose.Schema(
  {
    pedagogy: { type: String, default: "" },
    mapping: { type: String, default: "" },
    evidenceLink: { type: String, default: "" },
    uploadedFile: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const Teaching =
  mongoose.models.Teaching || mongoose.model("Teaching", teachingSchema);
export default Teaching;
