/**
 * This function takes in a public key and a private key from a different pair to derive
 * a symmetric cryptographic key
 * Based off this tutorial https://getstream.io/blog/web-crypto-api-chat/
 * @param publicKeyJwk  a public key in JSON web key format
 * @param privateKeyJwk a separate private key in JSON web key format
 * @returns             a derived symmetric key
 */
export default async function deriveKey (
  publicKeyJwk: JsonWebKey, 
  privateKeyJwk: JsonWebKey
):Promise<CryptoKey> {
  /* Converts the JWK format into CryptoKey objects */
  const publicKey:CryptoKey = await window.crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    []
  );

  const privateKey:CryptoKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  );

  /* Derive the shared symmetric key */
  return await window.crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};