import { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
export interface StoredUser {
  _id: string;
  email: string;
  userType: string;
  profileStatus: boolean;
}
export interface UserData {
  userType?: string;
  age?: string;
  dateOfBirth?: string;
  countryCode?: string;
  contactNumber?: string;
  gender?: string;
  userEmailId?: string;
  userId?: string;
  medicalHistory?: string;
  medicalLicenseNumber?: string;
  specialization?: string;
  experience?: string;
  _id?: string;
}
export interface StudyData {
  consentName: string;
  studyTypes: string[];
  details: string;
  numberOfStages: string;
  stages: string[];
}

interface Phase {
  phaseName: string;
  checkPhase: boolean;
}

interface Stage {
  _id: string;
  stageDescription: string;
  approvalStatus: string;
  approvedBy: string;
  phases: Phase[];
}

export interface PatientProgress {
  patientEmail: string;
  stages: {
    stageIndex: number;
    phases: {
      phaseIndex: number;
      checkPhase: boolean;
    }[];
  }[];
}

export interface StudyCase {
  _id: string;
  consentName: string;
  studyTypes: string[];
  details: string;
  numberOfStages: string;
  stages: Stage[];
  researcherEmailId: string;
  currentPatients: string[];
  patientProgress: PatientProgress[];
}

export interface StageProps {
  number: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export interface CommentData {
  currentUserEmail: string;
  currentPatientEmail: string;
  currentStage: number;
  currentPhase: number;
  comment: string;
}

export interface CommentData {
  _id: string;
  currentUserEmail: string;
  currentPatientEmail: string;
  currentStage: number;
  currentPhase: number;
  comment: string;
  createdAt: string;
}

export interface CommentBoxProps {
  currentUserEmail: string;
  currentPatientEmail: string;
  currentStage: number;
  currentPhase: number;
  currentStudyName: string;
  onCommentAdded: () => void;
}

export interface CommentDisplayProps {
  currentUserEmail: string;
  currentPatientEmail: string;
  currentStage: number;
  currentPhase: number;
  currentStudyName: string;
  showAddNewComment: boolean;
  phaseProgress?: boolean;
}
