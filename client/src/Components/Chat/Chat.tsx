import React, { useMemo } from 'react'
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
    if(type === "encrypted") {
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
  }, [content, type])

  if(content) { //if this message has content to show
    return (
      <div className="message-container">
        <div className={`message ${senderAddr} ${type}`}>
          <div>
            {renderSenderAddr}
            <span className="content">
              {renderContent}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Chat
