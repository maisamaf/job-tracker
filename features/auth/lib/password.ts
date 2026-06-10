import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const HASH_KEY_LENGTH = 64;
const HASH_SEPARATOR = ":";
const HASH_PREFIX = "scrypt";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(
    password,
    salt,
    HASH_KEY_LENGTH,
  )) as Buffer;

  return [HASH_PREFIX, salt, derivedKey.toString("hex")].join(HASH_SEPARATOR);
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [prefix, salt, storedHash] = passwordHash.split(HASH_SEPARATOR);

  if (prefix !== HASH_PREFIX || !salt || !storedHash) {
    return false;
  }

  const storedKey = Buffer.from(storedHash, "hex");

  // Always derive with the expected length — never trust the stored length,
  // which would let a crafted short hash reduce the scrypt work factor.
  if (storedKey.length !== HASH_KEY_LENGTH) return false;

  const derivedKey = (await scryptAsync(
    password,
    salt,
    HASH_KEY_LENGTH,
  )) as Buffer;

  return timingSafeEqual(storedKey, derivedKey);
}
