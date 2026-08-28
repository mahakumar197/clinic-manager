import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
let key: Buffer | null = null;

function getKey(): Buffer {
  if (!key) {
    key = crypto.scryptSync(
      process.env.ENCRYPTION_KEY || 'defaultKey',
      'salt',
      32,
    );
  }
  return key;
}

export function encryptMessage(text: string) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

export function decryptMessage(encryptedText: string) {
  const [ivHex, encrypted] = encryptedText.split(':');

  const decipher = crypto.createDecipheriv(
    algorithm,
    getKey(),
    Buffer.from(ivHex, 'hex'),
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
