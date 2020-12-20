import React from 'react';
import "./chat.scss"

export type ChatType = {
  content: string,
  date: Date,
  senderAddr: string,
  showSenderAddr: boolean,
  type: string,
}

interface State {}

class Chat extends React.Component<ChatType,State> {

  showSenderAddr = () => {
    if(this.props.showSenderAddr) {
      const displaySenderAddr = this.props.senderAddr==="self" ? "You" : this.props.senderAddr

      return (
        <div className="sender">{displaySenderAddr}</div>
      )
    }
  }

  render() {
    if(this.props.content) {
      return (
        <div className="message-container">
          <div className={`message ${this.props.senderAddr} ${this.props.type}`}>
            <div>
              {this.showSenderAddr()}
              <span className="content">
                <pre>
                  {this.props.content}
                </pre>
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

export default Chat;
