const crypto = require("crypto");

// AES = 16
const IV_LENGTH = 16;
const SEPARATOR = "#$%";
const ALGORITHM = "aes-256-ctr";
const hashedSecret = crypto
  .createHash("sha256")
  .update(String(process.env.ENCRYPTION_KEY))
  .digest("base64")
  .substr(0, 32);

/**
 *
 * @param {string} string
 * @returns
 */
const encryptString = (string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(hashedSecret),
    iv
  );
  let encrypted = cipher.update(string);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + SEPARATOR + encrypted.toString("hex");
};

/**
 *
 * @param {string} string
 * @returns
 */
const decryptString = (string) => {
  const stringParts = string.split(SEPARATOR);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(hashedSecret),
    Buffer.from(stringParts.shift(), "hex")
  );
  let decrypted = decipher.update(
    Buffer.from(stringParts.join(SEPARATOR), "hex")
  );
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

module.exports = {
  decryptString,
  encryptString,
};
