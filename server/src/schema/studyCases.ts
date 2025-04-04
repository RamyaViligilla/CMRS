import mongoose, { Schema, Document } from 'mongoose';

interface IPhase {
  phaseName: string;
  checkPhase: boolean;
  status: 'active' | 'completed' | 'skipped' | 'ended';
}

interface IStage {
  stageDescription: string;
  approvalStatus: string;
  approvedBy: string;
  phases: IPhase[];
  status: 'active' | 'completed' | 'skipped' | 'ended';
}

interface IPatientProgress {
  patientEmail: string;
  stages: {
    stageIndex: number;
    phases: {
      phaseIndex: number;
      checkPhase: boolean;
      status: 'active' | 'completed' | 'skipped' | 'ended';
    }[];
    status: 'active' | 'completed' | 'skipped' | 'ended';
  }[];
}

interface IStudyCases extends Document {
  consentName: string;
  studyTypes: string[];
  details: string;
  numberOfStages: string;
  stages: IStage[];
  currentPatients: string[];
  researcherEmailId: string;
  patientProgress: IPatientProgress[];
}

const phaseSchema = new Schema({
  phaseName: { type: String, required: true },
  checkPhase: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'completed', 'skipped', 'ended'],
    default: 'active',
  },
});

const stageSchema = new Schema({
  stageDescription: { type: String, required: true },
  approvalStatus: { type: String, default: 'false' },
  approvedBy: { type: String, default: '' },
  phases: {
    type: [phaseSchema],
    default: [
      { phaseName: 'Patient Status', checkPhase: false, status: 'active' },
      { phaseName: 'Medication', checkPhase: false, status: 'active' },
    ],
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'skipped', 'ended'],
    default: 'active',
  },
});

const patientProgressSchema = new Schema({
  patientEmail: { type: String, required: true },
  stages: [
    {
      stageIndex: { type: Number, required: true },
      phases: [
        {
          phaseIndex: { type: Number, required: true },
          checkPhase: { type: Boolean, default: false },
          status: {
            type: String,
            enum: ['active', 'completed', 'skipped', 'ended'],
            default: 'active',
          },
        },
      ],
      status: {
        type: String,
        enum: ['active', 'completed', 'skipped', 'ended'],
        default: 'active',
      },
    },
  ],
});

const studyCasesSchema = new Schema({
  consentName: { type: String, required: true },
  studyTypes: { type: [String], required: true },
  details: { type: String, required: true },
  numberOfStages: { type: String, required: true },
  stages: { type: [stageSchema], required: true },
  researcherEmailId: { type: String, required: true },
  currentPatients: { type: [String], required: false },
  patientProgress: { type: [patientProgressSchema], required: false },
});

const studyCases = mongoose.model<IStudyCases>(
  'Study Design',
  studyCasesSchema,
);

export { studyCases, IStudyCases, IStage, IPhase, IPatientProgress };
