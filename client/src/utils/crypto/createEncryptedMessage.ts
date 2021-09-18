import encrypt from "./encrypt";
import getMAC from "./getMac";

export type EncryptedMessageType = {
  c: string,    //cipher
  iv: string,   //initialization vector
  mac: string,  //Message Authentication Code (MAC)
}

/**
 * Given a plaintext and the derived key, create a message object with a cipher, initialization vector, and MAC
 * @param plaintext   plaintext message
 * @param derivedKey  derived symmetric key 
 * @returns           
 */
export default async function createEncryptedMessage(
  plaintext: string,
  derivedKey: CryptoKey,
): Promise<EncryptedMessageType> {
  return {
    ...await encrypt(plaintext, derivedKey),
    mac: await getMAC(plaintext, derivedKey)
  }
}