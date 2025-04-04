// src/utils/emailService.ts

import nodemailer from 'nodemailer';
import { config } from '../config/mail'; // Assume you have a config file with email settings

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'anushagowda673@gmail.com',
    pass: 'nbzgdmuzioeyplhb',
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"CRMT" <${config.email.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const verificationLink = `${config.appUrl}/verify/${token}`;

  const emailOptions: EmailOptions = {
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h1>Welcome to Your App!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>If you didn't sign up for this account, please ignore this email.</p>
    `,
  };

  await sendEmail(emailOptions);
}
