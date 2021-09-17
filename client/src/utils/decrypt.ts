/**
 * 
 * @param cipher 
 * @param initializationVector 
 * @param derivedKey 
 * @returns 
 */
export default async function decrypt(
  cipher: string,
  initializationVector: string,
  derivedKey: CryptoKey
) {
  try {
    const string = atob(cipher);
    const uintArray = new Uint8Array(
      [...string].map((char) => char.charCodeAt(0))
    );
    const algorithm = {
      name: "AES-GCM",
      iv: new TextEncoder().encode(initializationVector),
    };
    const decryptedData = await window.crypto.subtle.decrypt(
      algorithm,
      derivedKey,
      uintArray
    );

    return new TextDecoder().decode(decryptedData);
  } catch (e) {
    return `error decrypting message: ${e}`;
  }
}