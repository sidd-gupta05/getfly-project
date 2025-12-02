import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWTUserPayload, UserRole } from './types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: number, email: string, role: UserRole): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): JWTUserPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTUserPayload
  } catch (error) {
    throw new AuthError('Invalid or expired token')
  }
}

export function extractTokenFromHeader(authHeader: string | undefined | null): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('No token provided')
  }
  return authHeader.substring(7)
}