import deriveKey from "../deriveKey"
import genKeys from "../genKeys"

test("symmetric key derivation", async () => {
  //generate 2 key pairs
  const pair1 = await genKeys()
  const pair2 = await genKeys()

  //derive keys by swapping the keys
  const derived1 = await deriveKey(pair1.publicKeyJwk, pair2.privateKeyJwk)
  const derived2 = await deriveKey(pair2.publicKeyJwk, pair1.privateKeyJwk)
  
  expect(derived1.constructor.name).toEqual("CryptoKey")
  expect(derived2.constructor.name).toEqual("CryptoKey")

  //if we combine the keys from opposite pairs, they should produce the same symmetric key
  expect(derived1).toEqual(derived2)
})