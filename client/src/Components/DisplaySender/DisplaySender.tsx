import React, { useEffect, useState } from 'react'

import { SenderDataType } from 'utils/types'

import "./displaySender.scss"

type Props = SenderDataType & {
  senderAddr: string,
}

const DisplaySender = (props: Props) => {
  const {
    derivedKey,
    publicKeyJwk,
    senderAddr,
  } = props

  const [derivedKeyExported, setDerivedKeyExported] = useState<JsonWebKey | null>(null)

  useEffect(() => {
    window.crypto.subtle.exportKey("jwk",derivedKey).then(jsonWebKey => {
      setDerivedKeyExported(jsonWebKey)
    }).catch(console.error)
  }, [derivedKey])

  return (
    <div className="displaySender blob">
      <div>{senderAddr}</div>

      <hr/>

      <div>Public Key:</div>
      <div className="formatKey"><pre>{JSON.stringify(publicKeyJwk, undefined, 2)}</pre></div>

      {
        derivedKeyExported && (
          <React.Fragment>
            <br/>
            <div>Derived Key:</div>
            <div className="formatKey"><pre>{JSON.stringify(derivedKeyExported, undefined, 2)}</pre></div>
          </React.Fragment>
        )
      }
    </div>
  )
}

export default DisplaySender