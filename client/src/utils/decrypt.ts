/**
 * 
 * @param cipher 
 * @param initializationVector 
 * @param derivedKey 
 * @returns 
 */
export default async function decrypt(
  cipher: string,
  initializationVector: string,
  derivedKey: CryptoKey
) {
  const iv = crypto.getRandomValues(new Uint8Array(16))
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, //TODO learn this
    derivedKey,
    new TextEncoder().encode("testing123")
  )
  const ddd = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    encryptedData
  )
  console.log("ddd", new TextDecoder().decode(ddd))
  


  ////////
  const cipherArray = Uint8Array.from([...atob(cipher)].map(ch => ch.charCodeAt()))

  console.log("test 1")
  console.log("iv",Uint8Array.from([...initializationVector].map(ch => ch.charCodeAt())))
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM", //TODO learn this
      iv: Uint8Array.from([...initializationVector].map(ch => ch.charCodeAt())),
    },
    derivedKey,
    cipherArray
  )

  console.log("test 2")
  console.log(decryptedData, new TextDecoder().decode(decryptedData))
  return new TextDecoder().decode(decryptedData)
}