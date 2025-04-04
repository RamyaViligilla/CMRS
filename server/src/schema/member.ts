import mongoose from 'mongoose';

const { Schema } = mongoose;

const MemberSchema = new Schema({
  name: { type: String, required: true },
  given_name: { type: String, required: true },
  family_name: { type: String, required: true },
  picture: { type: String, default: 'Email user' },
  email: { type: String, required: true },
  password: { type: String, default: 'Google password', required: true },
  email_verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  userType: { type: String, default: 'default' },
  verificationToken: { type: String, default: 'google' },
  profileStatus: { type: Boolean, default: false },
  adminApproval: { type: Boolean, default: true },
});

const Member = mongoose.model('Members', MemberSchema);

export default Member;
