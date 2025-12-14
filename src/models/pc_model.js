import mongoose from 'mongoose';

const programmeCoordinatorSchema = new mongoose.Schema(
    {
        academicYear: {
            type: String,
            required: true,
            trim: true,
        },
        programmeCode: {
            type: String,
            required: true,
            trim: true,
        },
        semester: {
            type: String,
            required: true,
            trim: true,
        },
        yearOfIntroduction: {
            type: String,
            required: true,
            trim: true,
        },
        schoolName: {
            type: String,
            required: true,
            trim: true,
        },
        coordinatorName: {
            type: String,
            required: true,
            trim: true,
        },
        departmentName: {
            type: String,
            required: true,
            trim: true,
        },
        coordinatorEmail: {
            type: String,
            required: true,
            trim: true,
            match: [/.+@.+\..+/, 'Invalid email format'],
        },
        programmeName: {
            type: String,
            required: true,
            trim: true,
        },
        coordinatorContact: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9+ -]{10,15}$/, 'Invalid contact number'],
        },
        uploadedFile: {
            type: String,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
    },
    { timestamps: true }
);

const PcDetails = mongoose.models.PcDetails || mongoose.model('PcDetails', programmeCoordinatorSchema);

export default PcDetails;
