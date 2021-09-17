/**
 * This function encrypts a message using a derived key
 * @param plaintext   plaintext message
 * @param derivedKey  derived symmetric key
 * @returns           a Promise for the encrypted message, aka cipher
 */
export default async function encrypt(
  plaintext: string,
  derivedKey: CryptoKey
) {
  const encodedText = new TextEncoder().encode(plaintext)

  const initializationVector = crypto.getRandomValues(new Uint8Array(16)) //generate a random initialization vector 16 bytes long

  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: initializationVector },
    derivedKey,
    encodedText
  )

  const uintArray = new Uint8Array(encryptedData)

  const string = String.fromCharCode.apply(null, uintArray)

  const base64Data = btoa(string)

  return {
    c: base64Data, //cipher
    iv: new TextDecoder("utf-8").decode( initializationVector ) //decode the initialization vector to a string
  }
}