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
  const cipherStrArray = strToArr(atob(message.cipher))

  /**
   * AES-GCM validates the integrity of the plaintext and IV without needing a Message Authentication Code
   * https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
   * Page 8: "GCM protects the authenticity of the plaintext and the AAD;
   * GCM also protects the confidentiality of the plaintext,
   * while the AAD is left in the clear"
   * Page 26: "If the output is the plaintext, then the design of the mode provides strong, but not
   * absolute, assurance that the purported source of the data created the tag, i.e., that the
   * plaintext and the AAD (and the IV and the tag) are authentic. Consequently, the mode
   * also provides strong assurance that this information was not subsequently altered, either
   * intentionally or unintentionally."
   * Page 26: "If the output is FAIL, then it is certain that at least one of the given inputs
   * (i.e., the ciphertext, the AAD, the IV, or the tag) is not authentic."
   */
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: strToArr(atob(message.initialization_vector)), //convert the iv string to an array
    },
    derivedKey,
    cipherStrArray
  )

  return new TextDecoder().decode(decryptedData)
}