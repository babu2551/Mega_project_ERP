import mongoose from "mongoose";

const capacitySchema = new mongoose.Schema(
  {
    activityName: {
      type: String,
      default: ""
    },
    activityType: {
      type: String,
      default: ""
    },
    year: {
      type: String,
      default: ""
    },
    studentsEnrolled: {
      type: String,
      default: ""
    },
    resourcePerson: {
      type: String,
      default: ""
    },
    documentLink: {
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

const Capacity = mongoose.models.Capacity || mongoose.model("Capacity", capacitySchema);
export default Capacity;
