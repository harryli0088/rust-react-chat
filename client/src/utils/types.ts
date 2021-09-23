import { EncryptedMessageType } from "./crypto/encrypt"


/* Message Types */
export type PublicKeySendType = { //broadcast
  public_key: JsonWebKey
}

export type PlaintextSendType = { //broadcast
  plaintext: string
}

export type EncryptedSendType = EncryptedMessageType & { //targeted send
  recv_addr: string,
}


export type RecvType = {
  sender_addr: string,
}

export type EncryptedRecvType = RecvType & EncryptedMessageType

export enum MetaEnum {
  connected = 0,
  disconnected,
}

export type MetaRecvType = RecvType & {
  meta: MetaEnum,
}

export type PlaintextRecvType = RecvType & {
  plaintext: string,
}

export type PublicKeyRecvType = RecvType & {
  public_key: JsonWebKey,
}





export type SenderDataType = {
  derivedKey: CryptoKey,
  publicKeyJwk: JsonWebKey,
}