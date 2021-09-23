import React from 'react'

import "./renderKey.scss"

type Props = {
  jsonWebKey: JsonWebKey
}

const RenderKey = (props: Props) => {
  return <div className="renderKey"><pre>{JSON.stringify(props.jsonWebKey, undefined, 2)}</pre></div>
}

export default RenderKey