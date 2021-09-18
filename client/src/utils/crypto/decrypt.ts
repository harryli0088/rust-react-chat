import strToArr from "utils/strToArr"

/**
 * Decrypt a message using the symmetric key.
 * You should wrap this in a try/catch.
 * @param cipherStr   cipher in string form
 * @param ivStr       initialization vector in string form
 * @param derivedKey  derived symmetric key 
 * @returns           Promise for decrypted plaintext message
 */
export default async function decrypt(
  cipherStr: string,
  ivStr: string,
  derivedKey: CryptoKey
) {
  const cipherStrArray = strToArr(atob(cipherStr)) //TODO need atob?

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM", //TODO learn this
      iv: strToArr(ivStr), //convert the iv string to an array
    },
    derivedKey,
    cipherStrArray
  )

  return new TextDecoder().decode(decryptedData)
}