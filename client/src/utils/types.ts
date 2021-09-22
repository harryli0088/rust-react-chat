import { EncryptedMessageType } from "./crypto/encrypt"

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

export type MetaRecvType = RecvType & {
  meta: number, //0 is client joined, 1 is client left
}

export type PublicKeyRecvType = RecvType & {
  public_key: JsonWebKey,
}

export type PlaintextRecvType = RecvType & {
  plaintext: string,
}

export type EncryptedRecvType = RecvType & EncryptedMessageType