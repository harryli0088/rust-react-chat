import deriveKey from "utils/deriveKey"
import decrypt from "utils/decrypt"
import encrypt from "utils/encrypt"
import genKeys from "utils/genKeys"

test("decrypt", async () => {
  const pair1 = await genKeys()
  const pair2 = await genKeys()

  const derivedKey = await deriveKey(pair1.publicKeyJwk, pair2.privateKeyJwk)

  const plaintext = "my plaintext message"
  const encryptResult = await encrypt(plaintext, derivedKey)

  expect(await decrypt(encryptResult.c, encryptResult.iv, derivedKey)).toEqual(plaintext)
})
