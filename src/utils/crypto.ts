import { hash, compare } from 'bcrypt'
const saltRounds = 10;

export async function encryptPassword(password: string) {
  return hash(password, saltRounds)
}

export async function comparePassword(password: string, encryptedPassword: string) {
  return compare(password, encryptedPassword)
}