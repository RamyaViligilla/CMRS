import axios from 'axios';
import { Request, Response } from 'express';
import Member from '../schema/member';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/default';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utility/utils';
import { Researcher } from '../schema/specificUserInfo';

const getUserInfo = async (googleAccessToken: string) => {
  const response = await axios.get(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    },
  );
  return response.data;
};

const generateToken = (userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { user: { _id: userId } },
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      },
    );
  });
};

const sendUserResponse = (
  res: Response,
  statusCode: number,
  message: string,
  user: any,
  token: string,
) => {
  res.status(statusCode).json({
    message,
    user: {
      _id: user._id,
      email: user.email,
      userType: user.userType,
      profileStatus: user.profileStatus,
      verificationToken: user.verificationToken,
    },
    token,
  });
};

export async function Register(req: Request, res: Response) {
  try {
    if (req.body.googleAccessToken) {
      const { name, given_name, family_name, picture, email, email_verified } =
        await getUserInfo(req.body.googleAccessToken);

      const existingUser = await Member.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          errorMessage: 'Email already exists. Please login instead.',
        });
      }

      const newUser = new Member({
        name,
        given_name,
        family_name,
        picture,
        email,
        email_verified,
      });
      await newUser.save();

      const token = await generateToken(newUser._id.toString());
      sendUserResponse(res, 201, 'Registered successfully', newUser, token);
    } else {
      const { given_name, family_name, email, password } = req.body;

      const existingUser = await Member.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          errorMessage: 'Email already exists. Please login instead.',
        });
      }

      const verificationToken = crypto.randomBytes(20).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new Member({
        name: `${given_name} ${family_name}`,
        given_name,
        family_name,
        picture: 'No Image',
        email,
        email_verified: false,
        verificationToken,
        password: hashedPassword,
      });
      await newUser.save();

      await sendVerificationEmail(email, verificationToken);
      const token = await generateToken(newUser._id.toString());
      sendUserResponse(res, 201, 'Registered successfully', newUser, token);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      errorMessage: 'Failed to register. Please try again later.',
    });
  }
}

export const emailCheck = async (req: Request, res: Response) => {
  const verificationToken = req.params.token;
  try {
    const user = await Member.findOne({ verificationToken });

    if (user) {
      user.email_verified = true;
      user.verificationToken = 'email';
      await user.save();
      res.redirect('http://localhost:5173/authentication');
    } else {
      res.status(404).json({ message: 'User missing in DataBase' });
    }
  } catch (error) {
    res.status(500).json({ message: 'NetWork error' });
  }
};

export async function login(req: Request, res: Response) {
  try {
    if (req.body.googleAccessToken) {
      const { email } = await getUserInfo(req.body.googleAccessToken);

      const user = await Member.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ errorMessage: 'Invalid email Please register' });
      }
      if (!user.email_verified) {
        return res
          .status(401)
          .json({ errorMessage: 'Please verify your Google email' });
      }

      const token = await generateToken(user._id.toString());
      sendUserResponse(res, 200, 'login successful', user, token);
    } else {
      const { email, password } = req.body;
      const user = await Member.findOne({ email });

      if (!user) {
        return res.status(401).json({
          errorMessage: 'Wrong Email ',
        });
      }
      if (user.email_verified === false) {
        return res.status(401).json({
          errorMessage: 'Please verify email first',
        });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          errorMessage: 'Wrong Password',
        });
      }
      const token = await generateToken(user._id.toString());
      sendUserResponse(res, 200, 'login successful', user, token);
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid access token!' });
  }
}

export const getUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const user = await Member.find({ _id: id });
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export const getResearcher = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const user = await Researcher.find({ _id: id });
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};
export const getPatient = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const user = await Researcher.find({ _id: id });
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};
export const getAllUser = async (req: Request, res: Response) => {
  try {
    const user = await Member.find();
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export async function getUserPictureByEmail(req: Request, res: Response) {
  try {
    const { email } = req.params;

    const user = await Member.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.picture || user.picture === 'No Image') {
      return res.status(404).json({ message: 'User has no picture' });
    }
    res.json({ picture: user.picture });
  } catch (error) {
    console.error('Error fetching user picture:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching user picture' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const user = await Member.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: err });
  }
}
