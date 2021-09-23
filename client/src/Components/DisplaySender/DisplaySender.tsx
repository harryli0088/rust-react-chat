import React, { useEffect, useState } from 'react'
import { faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
  const [showDerivedKey, setShowDerivedKey] = useState<Boolean>(false)

  useEffect(() => {
    window.crypto.subtle.exportKey("jwk",derivedKey).then(jsonWebKey => {
      setDerivedKeyExported(jsonWebKey)
    }).catch(console.error)
  }, [derivedKey])

  return (
    <div className="displaySender blob">
      <div>{senderAddr}</div>

      <hr/>

      <div>Public Key <FontAwesomeIcon icon={faKey}/></div>
      <RenderKey jsonWebKey={publicKeyJwk}/>

      {
        derivedKeyExported && (
          <React.Fragment>
            <br/>
            <div>Derived Key <FontAwesomeIcon className="interact" icon={showDerivedKey ? faEye : faEyeSlash} onClick={() => setShowDerivedKey(!showDerivedKey)}/></div>
            {showDerivedKey && <RenderKey jsonWebKey={derivedKeyExported}/>}
          </React.Fragment>
        )
      }
    </div>
  )
}

export default DisplaySender