/**
 * This function generates a new public-private key pair, then exports them in JSON web key format
 * Based off this tutorial https://getstream.io/blog/web-crypto-api-chat/
 * @returns a Promise for an object with public and private keys in JSON web key format
 */
export default async function genKeys():Promise<{
  publicKeyJwk: JsonWebKey,
  privateKeyJwk: JsonWebKey,
}> {
  const keyPair:CryptoKeyPair = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicKeyJwk:JsonWebKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );

  const privateKeyJwk:JsonWebKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey
  );

  return { publicKeyJwk, privateKeyJwk };
}


export const PRIVATE_KEY_JWK_SCHEMA = {
  "id": "/PrivateKeyJwk",
  "type": "object",
  "properties": {
    "crv": { "const": 'P-256' },
    "ext": { "const": true },
    "key_ops": { "const": [ 'deriveKey', 'deriveBits' ] },
    "kty": { "const": 'EC' },
    "x": { "type": "string", maxLength: 43, minLength: 43 },
    "y": { "type": "string", maxLength: 43, minLength: 43 }
  },
  "required": ["crv","ext","key_ops","kty","x","y"]
}

export const PUBLIC_KEY_JWK_SCHEMA = {
  "id": "/PublicKeyJwk",
  "type": "object",
  "properties": {
    "crv": { "const": 'P-256' },
    "ext": { "const": true },
    "key_ops": { "const": [] },
    "kty": { "const": 'EC' },
    "x": { "type": "string", maxLength: 43, minLength: 43 },
    "y": { "type": "string", maxLength: 43, minLength: 43 }
  },
  "required": ["crv","ext","key_ops","kty","x","y"]
}

export const JWK_KEY_PAIR_SCHEMA = {
  "id": "/JwkKeyPair",
  "type": "object",
  "properties": {
    "privateKeyJwk": {"$ref": "/PrivateKeyJwk"},
    "publicKeyJwk": {"$ref": "/PublicKeyJwk"},
  },
  "required": [ "privateKeyJwk", "publicKeyJwk" ]
}