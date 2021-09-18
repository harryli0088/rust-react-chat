import deriveKey from "utils/crypto/deriveKey"
import decrypt from "utils/crypto/decrypt"
import encrypt from "utils/crypto/encrypt"
import genKeys from "utils/crypto/genKeys"

test("decrypt", async () => {
  const pair1 = await genKeys()
  const pair2 = await genKeys()

  const derivedKey = await deriveKey(pair1.publicKeyJwk, pair2.privateKeyJwk)

  const plaintext = "my plaintext message"
  const encryptResult = await encrypt(plaintext, derivedKey)

  expect(await decrypt(encryptResult.c, encryptResult.iv, derivedKey)).toEqual(plaintext)
})
