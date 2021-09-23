import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import RenderKey from 'Components/RenderKey/RenderKey'

type Props = {
  jsonWebKey: JsonWebKey
}

const RenderPrivateKey = (props:Props) => {
  const [show, setShow] = useState<Boolean>(false)

  return (
    <div>
      <h4>Your Private Key <FontAwesomeIcon className="interact" icon={show ? faEye : faEyeSlash} onClick={() => setShow(!show)}/></h4>

      {show && <RenderKey jsonWebKey={props.jsonWebKey}/>}
    </div>
  )
}

export default RenderPrivateKey