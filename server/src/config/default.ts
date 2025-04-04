import crypto from 'crypto';
export const JWT_SECRET = crypto.randomBytes(64).toString('hex');
