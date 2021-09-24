import React from 'react'

type Props = React.HTMLProps<HTMLAnchorElement>

const BlankAnchor = (props:Props) => {
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  )
}

export default BlankAnchor