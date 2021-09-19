import arrToStr from "utils/arrToStr"

export type EncryptedMessageType = {
  c: string,    //cipher
  iv: string,   //initialization vector
}

/**
 * This function encrypts a message using a derived key
 * @param plaintext   plaintext message
 * @param derivedKey  derived symmetric key
 * @returns           a Promise for the cipher and initialization vector message, TODO decide base encoding
 */
export default async function encrypt(
  plaintext: string,
  derivedKey: CryptoKey
):Promise<EncryptedMessageType> {
  const encodedText = new TextEncoder().encode(plaintext)

  //generate a random initialization vector 16 bytes (96 bits) long
  //https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams
  const initializationVector = crypto.getRandomValues(new Uint8Array(16))
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: initializationVector
    },
    derivedKey,
    encodedText
  )


  //convert the cipher into a string
  const cipherStr = arrToStr(new Uint8Array(encryptedData))

  return {
    c: btoa(cipherStr), //cipher, TODO need btoa?
    iv: arrToStr(initializationVector) //convert the initialization vector to a string
  }
}