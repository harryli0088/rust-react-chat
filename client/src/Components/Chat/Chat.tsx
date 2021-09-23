import React, { useMemo } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'

import "./chat.scss"

export type ChatType = {
  content: React.ReactNode,
  date: Date,
  senderAddr: string,
  showSenderAddr: boolean,
  type: string,
}

export type ChatTypeType = "encrypted" | "meta" | "plaintext" | "self" //the name is kind of terrible...

const Chat = (props:ChatType) => {
  const {
    content,
    senderAddr,
    showSenderAddr,
    type,
  } = props
  //TODO indicate whether this message was encrypted or not
  
  const renderSenderAddr = showSenderAddr ? (
    <div className="sender">{senderAddr==="self" ? "You" : senderAddr}</div>
  ) : null

  const renderContent = useMemo(() => {
    if(type === "encrypted" && senderAddr!=="self") { //if this is an encrypted message and we did not send it
      //if this is an encrypted message we sent, that means we encrypted it differently for each recipient
      //so that might be too many ciphers and IVs to show
      
      const [cipher, initializationVector, plaintext] = content as [string, string, string]
      return (
        <div>
          <pre className="chatPre">{plaintext}</pre>
          <hr/>

          <pre>
            {`Cipher: ${cipher}\nInitialization Vector: ${initializationVector}`}
          </pre>
        </div>
      )
    }
    else if(content) {
      return <pre className="chatPre">{content}</pre>
    }
    return content
  }, [content, senderAddr, type])

  const lockIcon = (() => {
    if(type === "encrypted") {
      return <FontAwesomeIcon className="green" icon={faLock} title="This message was encrypted"/>
    }
    else if(type === "plaintext") {
      return <FontAwesomeIcon className="red" icon={faLockOpen} title="This message was sent as plaintext"/>
    }
  })()

  if(content) { //if this message has content to show
    return (
      <div className="message-container">
        <div className={`message ${senderAddr} ${type}`}>
          <div>
            {renderSenderAddr}
            <div style={{
              alignItems: "center",
              display: "flex", 
              flexDirection: senderAddr==="self" ? "row-reverse" : "row", 
            }}>
              <span className="content">
                {renderContent}
              </span>
              <span style={{color: "gray", marginLeft: "0.5em", marginRight: "0.5em"}}>{lockIcon}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Chat
