/**
 * This function creates gets a Message Authentication Code for the message.
 * It concatenates the key with the message, which is then SHA-256 hashed to get the MAC.
 * Later, the recpient can verify the MAC to ensure the message was not tampered with.
 * @param plaintext   plaintext message to send
 * @param derivedKey  derived symmetric key
 * @returns           returns a Promise for the MAC
 */
export default async function getMAC(
  plaintext: string,
  derivedKey: CryptoKey
) {
  const encoded = new TextEncoder().encode(plaintext) //encode the plaintext into a Uint8 Array

  const keyAsUint8Array = new Uint8Array( //encode the derivedKey into a Uint8 Array
    await window.crypto.subtle.deriveBits("ECDH",derivedKey,8)
  )

  //concatenate the key with the plaintext message
  const concat = new Uint8Array(keyAsUint8Array.length + encoded.length)
  concat.set(keyAsUint8Array)
  concat.set(encoded, keyAsUint8Array.length)

  //get the MAC
  const digest = await crypto.subtle.digest(
    "SHA-256",
    concat
  )

  //decode the MAC to a string
  return new TextDecoder("utf-8").decode( digest )
}