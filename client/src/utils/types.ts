export type PublicKeySendType = {
  pk: JsonWebKey
}

export type PlaintextSendType = {
  p: string
}

export type EncryptedSendType = {
  c: string,
  iv: string,
  sender_addr: string,
}


export type RecvType = {
  sender_addr: string,
}

export type MetaRecvType = RecvType & {
  s: number, //0 is client joined, 1 is client left
}

export type PublicKeyRecvType = RecvType & {
  pk: JsonWebKey,
}

export type PlaintextRecvType = RecvType & {
  p: string,
}

export type EncryptedRecvType = RecvType & {
  c: string,
  iv: string,
}