import React, { useEffect, useState } from 'react'
import RenderKey from 'Components/RenderKey/RenderKey'

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
      <RenderKey jsonWebKey={publicKeyJwk}/>

      {
        derivedKeyExported && (
          <React.Fragment>
            <br/>
            <div>Derived Key:</div>
            <RenderKey jsonWebKey={derivedKeyExported}/>
          </React.Fragment>
        )
      }
    </div>
  )
}

export default DisplaySender