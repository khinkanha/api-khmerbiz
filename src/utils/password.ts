import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const MD5_REGEX = /^[a-f0-9]{32}$/i;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<{ match: boolean; needsRehash: boolean }> {
  // If stored hash is MD5, compare with MD5 then flag for rehash
  if (MD5_REGEX.test(hash)) {
    const md5Hash = crypto.createHash('md5').update(password).digest('hex');
    if (md5Hash === hash) {
      return { match: true, needsRehash: true };
    }
    return { match: false, needsRehash: false };
  }

  // Otherwise compare with bcrypt
  const match = await bcrypt.compare(password, hash);
  return { match, needsRehash: false };
}

export async function rehashPassword(password: string): Promise<string> {
  return hashPassword(password);
}
