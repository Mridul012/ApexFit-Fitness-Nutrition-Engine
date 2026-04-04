import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { findByEmail, createUser } from '../repositories/user.repository';

export async function register(dto: {
  email: string;
  password: string;
  fullName: string;
}) {
  const existing = await findByEmail(dto.email);
  if (existing) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(dto.password, 10);
  const user = await createUser({ email: dto.email, passwordHash, fullName: dto.fullName });

  return user.id;
}

export async function login(dto: { email: string; password: string }) {
  const user = await findByEmail(dto.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return { token, fullName: user.fullName };
}
