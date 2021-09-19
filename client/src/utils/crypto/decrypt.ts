import strToArr from "utils/strToArr"
import { EncryptedMessageType } from "./encrypt"

/**
 * Decrypt a message using the symmetric key.
 * You should wrap this in a try/catch.
 * @param message     message object with cipher and initialization vector
 * @param derivedKey  derived symmetric key 
 * @returns           Promise for decrypted plaintext message
 */
export default async function decrypt(
  message: EncryptedMessageType,
  derivedKey: CryptoKey
) {
  const cipherStrArray = strToArr(atob(message.c)) //TODO need atob?

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM", //TODO learn this
      iv: strToArr(message.iv), //convert the iv string to an array
    },
    derivedKey,
    cipherStrArray
  )

  return new TextDecoder().decode(decryptedData)
}