import arrToStr from "utils/arrToStr"

export type EncryptedMessageType = {
  cipher: string,
  initialization_vector: string,
}

/**
 * This function encrypts a message using a derived key.
 * I use btoa after encryption and atob before decryption to make the strings easier to display on the UI.
 * Otherwise there are soemtimes emtpy spaces that look weird.
 * @param plaintext   plaintext message
 * @param derivedKey  derived symmetric key
 * @returns           a Promise for the cipher and initialization vector message
 */
export default async function encrypt(
  plaintext: string,
  derivedKey: CryptoKey
):Promise<EncryptedMessageType> {
  const encodedText = new TextEncoder().encode(plaintext)

  //generate a random initialization vector 12 bytes (96 bits) long
  //https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams
  const initializationVector = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: initializationVector
    },
    derivedKey,
    encodedText
  )

  return {
    cipher: btoa(arrToStr(new Uint8Array(encryptedData))), //convert the cipher into a string
    initialization_vector: btoa(arrToStr(initializationVector)) //convert the initialization vector to a string
  }
}