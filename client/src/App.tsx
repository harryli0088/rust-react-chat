import React from 'react';
import Chat, { ChatType } from "Components/Chat/Chat"
import 'App.scss';


interface State {
  input: string,
  chats: ChatType[],
  newRoom: string,
  socketReadyState: number,
}

class App extends React.Component<{},State> {
  lastDate: Date = new Date()
  lastSenderAddr: string = ""
  lastType: string = ""
  socket: WebSocket

  constructor(props:{}) {
    super(props)

    this.state = {
      input: "",
      chats: [
        {
          content: "testing testing 123",
          date: new Date(),
          senderAddr: "tessdadfadfadfasfsdsdasfafdfafdfasfadt",
          showSenderAddr: true,
          type: "user",
        },
        {
          content: "testing testing 123",
          date: new Date(),
          senderAddr: "self",
          showSenderAddr: true,
          type: "user",
        },
        {
          content: "testing testing 123",
          date: new Date(),
          senderAddr: "self",
          showSenderAddr: false,
          type: "user",
        },
        {
          content: "testing testing 123",
          date: new Date(),
          senderAddr: "self",
          showSenderAddr: false,
          type: "user",
        },
      ],
      newRoom: "",
      socketReadyState: -1,
    }

    this.socket = this.setUpSocket()
  }

  componentWillUnmount() {
    this.socket.close()
  }

  setUpSocket = () => {
    console.log("I RUN")
    const socket = new WebSocket("ws://localhost:8080", window.location.pathname.replace(/\//ig, "-"))
    socket.onopen = () => {
      console.log("OPEN RUNS")
      this.addChat(`You have joined the chat room "${window.location.pathname}"`, "self", "meta")
      this.setState({socketReadyState: socket.readyState})
    }

    socket.onmessage = (message:MessageEvent<any>) => {
      console.log("MESSAGE", message)

      try {
        const parsed = JSON.parse(message.data)
        this.addChatFromSocket(parsed.message, parsed.sender_addr, parsed.type_key)
      }
      catch(err) {
        console.error(err)
      }

    }

    socket.onclose = () => {
      console.log("CLOSE")
      this.setState({socketReadyState: socket.readyState})
    }

    return socket
  }

  addChatFromSocket = (content: string, senderAddr:string, type: string) => {
    this.addChat(content, senderAddr, type) //add the chat to state

    this.setState({ //update the socket state
      socketReadyState: this.socket.readyState,
    })
  }

  addChat = (content: string, senderAddr:string, type: string) => {
    const date = new Date()
    const chat:ChatType = {
      content,
      date,
      senderAddr,
      showSenderAddr: this.lastSenderAddr !== senderAddr
      || this.lastType !== type, //set whether we should show the sender addr
      type,
    }

    //record last values
    this.lastDate = date
    this.lastSenderAddr = chat.senderAddr
    this.lastType = chat.type

    this.setState({ //add the chat to state
      chats: this.state.chats.concat(chat),
    })
  }

  getConnectionStatus = () => {
    switch(this.state.socketReadyState) {
      case 0:
        return "Connecting"
      case 1:
        return "Connected"
      case 2:
        return "Closing"
      default:
        return "Closed"
    }
  }

  onChatTypeSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const content = this.state.input.trim() //trim the input of any white space

    if(content) {
      this.socket.send(content) //send the chat to the socket

      this.addChat(content, "self", "user") //add this chat to state

      this.setState({ input: "" }) //clear the input
    }
  }

  onNewRoomSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newRoomURI = encodeURIComponent(this.state.newRoom)

    window.location.href = `${window.location.origin}/${newRoomURI}`;
  }

  render() {
    return (
      <div className="App">
        <h2>Current Room: {window.location.pathname} | Connection Status: {this.getConnectionStatus()}</h2>
        <br/>
        <div>
          {this.state.chats.map((m,i) =>
            <Chat key={i} {...m}/>
          )}
        </div>

        <form id="chat-form" onSubmit={this.onChatTypeSubmit}>
          <div>
            <input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({input: e.target.value})}
              value={this.state.input}
            />
          </div>

          <button type="submit" disabled={this.state.socketReadyState !== 1}>Send</button>
        </form>

        <hr/>

        <form id="new-room-form" onSubmit={this.onNewRoomSubmit}>

          <label htmlFor="new-room-input">Change Rooms:</label>
          <div>
            <input
              id="new-room-input"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({newRoom: e.target.value})}
              placeholder="Enter a new room code"
              value={this.state.newRoom}
            />
          </div>

          <button type="submit">Go to New Room</button>
        </form>
      </div>
    );
  }
}

export default App;
