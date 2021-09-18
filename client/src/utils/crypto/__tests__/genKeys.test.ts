import { Validator } from "jsonschema"

import genKeys, { JWK_KEY_PAIR_SCHEMA, PRIVATE_KEY_JWK_SCHEMA, PUBLIC_KEY_JWK_SCHEMA } from "utils/crypto/genKeys"

const v = new Validator()
v.addSchema(PRIVATE_KEY_JWK_SCHEMA)
v.addSchema(PUBLIC_KEY_JWK_SCHEMA)

test("generates key pair", async () => {
  const pair = await genKeys()
  expect(v.validate(pair, JWK_KEY_PAIR_SCHEMA).errors).toEqual([]) //confirms to schema
  expect(pair.privateKeyJwk).not.toEqual(pair.publicKeyJwk) //keys are different
})