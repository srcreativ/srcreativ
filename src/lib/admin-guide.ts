export type EncryptedAdminGuide = {
  version: number;
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  tag: string;
};

function bytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

/**
 * Decrypts the owner guide locally. The passphrase is never sent to the API,
 * logged, or persisted by the browser.
 */
export async function decryptAdminGuide(
  encrypted: EncryptedAdminGuide,
  passphrase: string,
) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: bytes(encrypted.salt),
      iterations: encrypted.iterations,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const ciphertext = bytes(encrypted.ciphertext);
  const payload = new Uint8Array(ciphertext.length + bytes(encrypted.tag).length);
  payload.set(ciphertext);
  payload.set(bytes(encrypted.tag), ciphertext.length);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytes(encrypted.iv) },
    key,
    payload,
  );
  return new TextDecoder().decode(plain);
}
