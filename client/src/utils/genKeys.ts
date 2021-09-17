/**
 * This function generates a new public-private key pair, then exports them in JSON web key format
 * Based off this tutorial https://getstream.io/blog/web-crypto-api-chat/
 * @returns a Promise for an object with public and private keys in JSON web key format
 */
export default async function genKeys():Promise<{
  publicKeyJwk: JsonWebKey,
  privateKeyJwk: JsonWebKey,
}> {
  const keyPair:CryptoKeyPair = await window.crypto.subtle.generateKey(
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