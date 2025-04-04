import { Request, Response } from 'express';
import { Patient, Researcher } from '../schema/specificUserInfo';
import Member from '../schema/member';

export async function UserDetails(req: Request, res: Response) {
  try {
    const userData = req.body;
    const { userType, userEmailId } = userData;

    let savedUser;

    if (userType === 'researcher') {
      const researcherData = {
        ...userData,
        age: parseInt(userData.age),
        dateOfBirth: new Date(userData.dateOfBirth),
        experience: parseInt(userData.experience),
        userType: 'researcher',
      };
      const newResearcher = new Researcher(researcherData);
      savedUser = await newResearcher.save();
    } else if (userType === 'patient') {
      const patientData = {
        ...userData,
        age: parseInt(userData.age),
        dateOfBirth: new Date(userData.dateOfBirth),
      };

      const newPatient = new Patient(patientData);
      savedUser = await newPatient.save();
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    await Member.findOneAndUpdate(
      { email: userEmailId },
      { $set: { profileStatus: true, userType: userType } },
      { new: true, upsert: true },
    );
    res.status(201).json({
      message: 'User details saved successfully',
      user: savedUser,
    });
  } catch (error) {
    console.error('Error saving user details:', error);
    res.status(500).json({ message: 'Error saving user details' });
  }
}

export const GetUserUpdatedDetails = async (req: Request, res: Response) => {
  const { id, type } = req.params;

  if (!id || !type) {
    return res.status(400).json({ message: 'Invalid parameters.' });
  }

  try {
    let user;
    if (type === 'patient') {
      user = await Patient.findOne({ userId: id });
    } else if (type === 'researcher') {
      user = await Researcher.findOne({ userId: id });
    } else {
      return res.status(400).json({ message: 'Invalid user type.' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find({}, 'userEmailId');

    const patientsWithPictures = await Promise.all(
      patients.map(async (patient) => {
        const member = await Member.findOne(
          { email: patient.userEmailId },
          'picture',
        );
        return {
          userEmailId: patient.userEmailId,
          picture: member ? member.picture : null,
        };
      }),
    );

    res.json(patientsWithPictures);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
