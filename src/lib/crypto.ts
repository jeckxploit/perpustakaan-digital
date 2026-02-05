import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

/**
 * Encrypts text using AES-256-GCM
 */
export function encrypt(text: string, password: string): string {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = deriveKey(password, salt)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ])

    const tag = cipher.getAuthTag()

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Encryption failed')
  }
}

/**
 * Decrypts text using AES-256-GCM
 */
export function decrypt(encrypted: string, password: string): string {
  try {
    const buffer = Buffer.from(encrypted, 'base64')

    const salt = buffer.subarray(0, SALT_LENGTH)
    const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION)
    const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION)
    const encryptedData = buffer.subarray(ENCRYPTED_POSITION)

    const key = deriveKey(password, salt)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    return decipher.update(encryptedData) + decipher.final('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Decryption failed')
  }
}

/**
 * Derives a key from password and salt
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    100000,
    KEY_LENGTH,
    'sha512'
  )
}

/**
 * Generates a random string
 */
export function randomString(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

/**
 * Generates a random numeric code
 */
export function generateNumericCode(length: number = 6): string {
  const code = crypto.randomInt(Math.pow(10, length - 1), Math.pow(10, length))
  return code.toString().padStart(length, '0')
}
