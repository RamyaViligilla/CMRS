import mongoose, { Schema, Document } from 'mongoose';

interface IComment extends Document {
  currentUserEmail: string;
  currentPatientEmail: string;
  currentStage: number;
  currentPhase: number;
  comment: string;
}

const commentSchema = new Schema(
  {
    currentUserEmail: { type: String, required: true },
    currentPatientEmail: { type: String, required: true },
    currentStage: { type: Number, required: true },
    currentPhase: { type: Number, required: true },
    currentStudyName: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export { Comment };
