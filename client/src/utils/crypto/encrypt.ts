/**
 * This function encrypts a message using a derived key
 * @param plaintext   plaintext message
 * @param derivedKey  derived symmetric key
 * @returns           a Promise for the cipher and initialization vector, TODO decide base encoding
 */
export default async function encrypt(
  plaintext: string,
  derivedKey: CryptoKey
) {
  const encodedText = new TextEncoder().encode(plaintext)

  //generate a random initialization vector 16 bytes (96 bits) long
  //https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams
  const initializationVector = crypto.getRandomValues(new Uint8Array(16))
  console.log("initializationVector",initializationVector,initializationVector.length)
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: initializationVector }, //TODO learn this
    derivedKey,
    encodedText
  )

  const uintArray = new Uint8Array(encryptedData)

  const string = String.fromCharCode(...uintArray)

  // console.log(new TextEncoder("utf-8").encode(new TextDecoder("utf-8").decode( initializationVector )))
  return {
    c: btoa(string), //cipher
    iv: String.fromCharCode(...initializationVector) //decode the initialization vector to a string
  }
}