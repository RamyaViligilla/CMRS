import mongoose, { Schema, Document } from 'mongoose';
import { IBaseUser } from '../types/schemaTypes';

interface IPatient extends IBaseUser {
  medicalHistory: string;
}

interface IResearcher extends IBaseUser {
  medicalLicenseNumber: string;
  specialization: string;
  experience: number;
}

const baseUserSchema = new Schema({
  userType: { type: String, enum: ['patient', 'researcher'], required: true },
  age: { type: Number, required: true },
  dateOfBirth: { type: Date, required: true },
  countryCode: { type: String, required: true },
  contactNumber: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  userEmailId: { type: String, required: true },
  userId: { type: String, required: true },
});

// Patient schema
const patientSchema = new Schema({
  ...baseUserSchema.obj,
  medicalHistory: { type: String, required: true },
});

// Researcher schema
const researcherSchema = new Schema({
  ...baseUserSchema.obj,
  medicalLicenseNumber: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
});

// Create models
const Patient = mongoose.model<IPatient>('Patient', patientSchema);
const Researcher = mongoose.model<IResearcher>('Researcher', researcherSchema);

export { Patient, Researcher };
