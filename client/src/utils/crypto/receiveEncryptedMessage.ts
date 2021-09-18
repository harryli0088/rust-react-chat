import { EncryptedMessageType } from "./createEncryptedMessage";
import decrypt from "./decrypt";
import getMAC from "./getMac";

/**
 * This function receives an encrypted messsage.
 * It decrypts the message into plaintext, then calculates the MAC based on the plaintext.
 * It then compares the calculated with the received MAC.
 * If they MACs match, the plaintext is valid and return.
 * Else an error is thrown
 * @param encryptedMessage 
 * @param derivedKey 
 * @returns 
 */
export default async function receiveEncryptedMessage(
  encryptedMessage: EncryptedMessageType,
  derivedKey: CryptoKey,
) {
  const plaintext = await decrypt(encryptedMessage.c,encryptedMessage.iv,derivedKey)

  if(encryptedMessage.mac === await getMAC(plaintext, derivedKey)) {
    return plaintext
  }
  throw new Error("The MAC does not match the message data")
}