import { Document } from 'mongoose';

export interface IMember extends Document {
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  createdAt: Date;
  userType: string;
  profileStatus: boolean;
  _id: string;
}

export interface IBaseUser extends Document {
  userType: 'patient' | 'researcher';
  age: number;
  dateOfBirth: Date;
  countryCode: string;
  contactNumber: string;
  gender: 'male' | 'female' | 'other';
  userEmailId: string;
  userId: string;
}
