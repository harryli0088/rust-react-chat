import deriveKey from "utils/crypto/deriveKey"
import decrypt from "utils/crypto/decrypt"
import encrypt from "utils/crypto/encrypt"
import genKeys from "utils/crypto/genKeys"
import strToArr from "utils/strToArr"
import arrToStr from "utils/arrToStr"

test("decrypt", async () => {
  const pair1 = await genKeys()
  const pair2 = await genKeys()

  const derivedKey = await deriveKey(pair1.publicKeyJwk, pair2.privateKeyJwk)

  const plaintext = "my plaintext message"
  const encryptResult = await encrypt(plaintext, derivedKey)

  expect(await decrypt(encryptResult, derivedKey)).toEqual(plaintext)
})


test("decrypt detects tampering", async () => {
  const pair1 = await genKeys()
  const pair2 = await genKeys()

  const derivedKey = await deriveKey(pair1.publicKeyJwk, pair2.privateKeyJwk)

  const plaintext = "my plaintext message"
  const encryptResult = await encrypt(plaintext, derivedKey)


  //TAMPER with first character
  const arr = strToArr(encryptResult.cipher)
  arr[0] += 1
  encryptResult.cipher = arrToStr(arr)

  try {
    await decrypt(encryptResult, derivedKey)
    throw new Error("This should not run")
  }
  catch(err) {
    expect(err.message).toEqual("Cipher job failed")
  }
})
