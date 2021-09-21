import { validate } from "jsonschema"

import deriveKey from "utils/crypto/deriveKey"
import encrypt from "utils/crypto/encrypt"
import genKeys from "utils/crypto/genKeys"

test("encrypt", async () => {
  const pair1 = await genKeys()
  const pair2 = await genKeys()

  const derivedKey = await deriveKey(pair1.publicKeyJwk, pair2.privateKeyJwk)

  const plaintext = "my plaintext message"
  const result = await encrypt(plaintext, derivedKey)

  expect(atob(result.cipher)).not.toEqual(plaintext)
  expect(validate(result,ENCRYPT_SCHEMA).errors).toEqual([])
})

export const ENCRYPT_SCHEMA = {
  "id": "/EncryptSchema",
  "type": "object",
  "properties": {
    "cipher": { "type": "string", maxLength: 48, minLength: 48 },
    "initialization_vector": { "type": "string", maxLength: 12, minLength: 12 },
  },
  "required": ["cipher","initialization_vector"]
}