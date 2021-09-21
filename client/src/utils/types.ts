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
  content: any,
  sender_addr: string,
  type: string,
}

export type MetaRecvType = RecvType & {
  content: number, //0 is client joined, 1 is client left
  type: "meta",
}

export type PublicKeyRecvType = RecvType & {
  content: {
    public_key: JsonWebKey,
  },
  type: "meta",
}

export type PlaintextRecvType = RecvType & {
  content: {
    plaintext: string,
  },
  type: "meta",
}

export type EncryptedRecvType = RecvType & {
  content: EncryptedMessageType,
  type: "meta",
}