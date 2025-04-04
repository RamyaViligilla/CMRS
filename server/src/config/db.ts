// src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://saianushapuli:oFkxj6AGD76vxtsu@clinicalresearchmanagem.hrtg3bg.mongodb.net/ClinicalResearchManagementTool',
    );
    console.log('MongoDB connected...');
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
};

export default connectDB;
